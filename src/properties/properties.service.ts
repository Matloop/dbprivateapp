import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreatePropertyDto, PropertyCategory, TransactionType, PropertyStatus, ConstructionStage } from './dto/create-property.dto';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import axios from 'axios'; 

@Injectable()
export class PropertiesService {

  constructor(private readonly prisma: PrismaService) {}

  // ========================== CREATE (BLINDADO) ==========================
  async create(createPropertyDto: CreatePropertyDto & { url?: string }) {
    if (createPropertyDto.url && (!createPropertyDto.title || createPropertyDto.title === 'Imóvel sem Título')) {
        return this.importFromDwv(createPropertyDto.url);
    }

    const {
      address, roomFeatures, propertyFeatures, developmentFeatures,
      images, paymentConditions, constructionStartDate, deliveryDate,
      url, category, ...propertyData
    } = createPropertyDto;

    const safePrice = isNaN(Number(propertyData.price)) ? 0 : Number(propertyData.price);
    const safePrivateArea = isNaN(Number(propertyData.privateArea)) ? 0 : Number(propertyData.privateArea);
    const safeTitle = (propertyData.title && propertyData.title.trim() !== '') ? propertyData.title : 'Imóvel Importado';
    const safeCategory = category || PropertyCategory.APARTAMENTO;

    return await this.prisma.property.create({
      data: {
        ...propertyData,
        title: safeTitle,
        category: safeCategory,
        price: safePrice,
        privateArea: safePrivateArea,
        totalArea: propertyData.totalArea ? Number(propertyData.totalArea) : undefined,
        garageArea: propertyData.garageArea ? Number(propertyData.garageArea) : undefined,
        constructionStartDate: constructionStartDate ? new Date(constructionStartDate) : undefined,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,

        address: address ? { 
          create: { 
            street: address.street || 'Não informada', number: address.number || 'S/N', 
            neighborhood: address.neighborhood || 'Centro', city: address.city || 'Balneário Camboriú', 
            state: address.state || 'SC', zipCode: address.zipCode || '88330-000', complement: address.complement || ''
          } 
        } : undefined,

        // connectOrCreate: Cria a tag se ela não existir
        roomFeatures: (roomFeatures && roomFeatures.length > 0) ? {
          connectOrCreate: roomFeatures.map(name => ({ where: { name }, create: { name } }))
        } : undefined,

        propertyFeatures: (propertyFeatures && propertyFeatures.length > 0) ? {
          connectOrCreate: propertyFeatures.map(name => ({ where: { name }, create: { name } }))
        } : undefined,

        developmentFeatures: (developmentFeatures && developmentFeatures.length > 0) ? {
          connectOrCreate: developmentFeatures.map(name => ({ where: { name }, create: { name } }))
        } : undefined,

        images: (images && images.length > 0) ? {
          createMany: { data: images.map(img => ({ url: img.url, isCover: img.isCover || false })) }
        } : undefined,

        paymentConditions: (paymentConditions && paymentConditions.length > 0) ? {
          createMany: { data: paymentConditions.map(c => ({ description: c.description, value: c.value })) }
        } : undefined,
      },
      include: { address: true, images: true }
    });
  }

  // ========================== FIND ALL ==========================
  async findAll(filters?: any) {
    const where: any = {};
    if (filters?.search) {
      const searchVal = filters.search.trim();
      if (!isNaN(Number(searchVal))) where.OR = [ { id: Number(searchVal) } ];
      else where.OR = [
          { title: { contains: searchVal, mode: 'insensitive' } },
          { buildingName: { contains: searchVal, mode: 'insensitive' } },
          { oldRef: { contains: searchVal, mode: 'insensitive' } }
        ];
    }
    if (filters?.city) where.address = { ...where.address, city: { contains: filters.city, mode: 'insensitive' } };
    if (filters?.neighborhood) where.address = { ...where.address, neighborhood: { contains: filters.neighborhood, mode: 'insensitive' } };
    if (filters?.minPrice) where.price = { ...where.price, gte: Number(filters.minPrice) };
    if (filters?.maxPrice) where.price = { ...where.price, lte: Number(filters.maxPrice) };
    if (filters?.minArea || filters?.maxArea) {
        where.privateArea = {}; 
        if (filters.minArea) where.privateArea.gte = Number(filters.minArea);
        if (filters.maxArea) where.privateArea.lte = Number(filters.maxArea);
    }
    if (filters?.garageSpots) where.garageSpots = { gte: Number(filters.garageSpots) };
    if (filters?.bedrooms) where.bedrooms = { gte: Number(filters.bedrooms) };
    if (filters?.types) {
        const types = Array.isArray(filters.types) ? filters.types : [filters.types];
        const cleanTypes = types.filter((t: string) => t !== '');
        if (cleanTypes.length > 0) where.category = { in: cleanTypes };
    }
    if (filters?.negotiation) {
        const negs = Array.isArray(filters.negotiation) ? filters.negotiation : [filters.negotiation];
        if (negs.includes('exclusivo')) where.isExclusive = true;
        if (negs.includes('permuta')) where.acceptsTrade = true;
        if (negs.includes('financiamento')) where.acceptsFinancing = true;
        if (negs.includes('veiculo')) where.acceptsVehicle = true;
    }
    if (filters?.stage) where.constructionStage = filters.stage;

    return this.prisma.property.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, title: true, price: true, category: true, status: true,
        bedrooms: true, bathrooms: true, garageSpots: true,
        privateArea: true, totalArea: true,
        badgeText: true, badgeColor: true, buildingName: true,
        constructionStage: true,
        address: { select: { city: true, neighborhood: true, state: true } },
        images: { take: 1, select: { url: true, isCover: true }, orderBy: { isCover: 'desc' } },
        createdAt: true, updatedAt: true
      }
    });
  }

  async findOne(id: number) {
    if (!id || isNaN(id)) throw new NotFoundException(`ID inválido.`);
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        address: true, images: true, roomFeatures: true, propertyFeatures: true, developmentFeatures: true, paymentConditions: true
      }
    });
    if (!property) throw new NotFoundException(`Imóvel #${id} não encontrado`);
    return property;
  }

  // ========================== UPDATE ==========================
  async update(id: number, updatePropertyDto: any) {
    await this.findOne(id);
    const { id: _id, addressId, createdAt, updatedAt, address, roomFeatures, propertyFeatures, developmentFeatures, images, paymentConditions, constructionStartDate, deliveryDate, url, ...propertyData } = updatePropertyDto;
    return this.prisma.property.update({
      where: { id: Number(id) },
      data: {
        ...propertyData,
        price: propertyData.price ? Number(propertyData.price) : undefined,
        promotionalPrice: propertyData.promotionalPrice ? Number(propertyData.promotionalPrice) : undefined,
        condoFee: propertyData.condoFee ? Number(propertyData.condoFee) : undefined,
        iptuPrice: propertyData.iptuPrice ? Number(propertyData.iptuPrice) : undefined,
        bedrooms: propertyData.bedrooms ? Number(propertyData.bedrooms) : undefined,
        suites: propertyData.suites ? Number(propertyData.suites) : undefined,
        bathrooms: propertyData.bathrooms ? Number(propertyData.bathrooms) : undefined,
        garageSpots: propertyData.garageSpots ? Number(propertyData.garageSpots) : undefined,
        privateArea: propertyData.privateArea ? Number(propertyData.privateArea) : undefined,
        totalArea: propertyData.totalArea ? Number(propertyData.totalArea) : undefined,
        garageArea: propertyData.garageArea ? Number(propertyData.garageArea) : undefined,
        constructionStartDate: constructionStartDate ? new Date(constructionStartDate) : undefined,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
        address: address ? {
          upsert: {
            create: { street: address.street || '', number: address.number || 'S/N', neighborhood: address.neighborhood || '', city: address.city || '', state: address.state || 'SC', zipCode: address.zipCode || '', complement: address.complement },
            update: { street: address.street, number: address.number, neighborhood: address.neighborhood, city: address.city, state: address.state, zipCode: address.zipCode, complement: address.complement },
          },
        } : undefined,
        roomFeatures: roomFeatures ? { set: [], connectOrCreate: roomFeatures.map((f: string) => ({ where: { name: f }, create: { name: f } })) } : undefined,
        propertyFeatures: propertyFeatures ? { set: [], connectOrCreate: propertyFeatures.map((f: string) => ({ where: { name: f }, create: { name: f } })) } : undefined,
        developmentFeatures: developmentFeatures ? { set: [], connectOrCreate: developmentFeatures.map((f: string) => ({ where: { name: f }, create: { name: f } })) } : undefined,
        images: images ? {
          deleteMany: {},
          createMany: { data: images.map((img: any) => ({ url: img.url, isCover: img.isCover || false })) }
        } : undefined,
      },
      include: { address: true, images: true }
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.property.delete({ where : { id } });
  }

  // ===========================================================================
  // IMPORTAR DO DWV (SEM PUPPETEER - AXIOS + SCAN DE TEXTO BRUTO)
  // ===========================================================================
  async importFromDwv(inputText: string) {
    console.log(`--- IMPORT DWV (FAST AXIOS) ---`);
    if (!inputText || typeof inputText !== 'string') throw new BadRequestException("Texto inválido.");

    const urlMatch = inputText.match(/https?:\/\/[^\s]+/);
    if (!urlMatch) throw new BadRequestException("Link não encontrado.");
    const dwvUrl = urlMatch[0];
    
    // 1. Endereço
    let addressText = inputText.replace(dwvUrl, '').trim().replace(/[\n\r]+/g, ' ').replace(/[,.-]+$/, '').trim();
    let street = 'Não informado', number = 'S/N';
    const numberMatch = addressText.match(/(\d+)(?!.*\d)/);
    if (numberMatch) {
        number = numberMatch[0];
        street = addressText.includes(',') ? addressText.split(',')[0].trim() : addressText.replace(number, '').trim();
    } else { street = addressText || 'Endereço não detectado'; }
    street = street.replace(/[-–].*$/, '').trim();

    // 2. FETCH LEVE (AXIOS)
    let html = '';
    try {
      const response = await axios.get(dwvUrl, {
        headers: { 
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml'
        },
        timeout: 10000
      });
      html = response.data;
    } catch (e) { throw new BadRequestException(`Erro DWV: ${e.message}`); }

    const $ = cheerio.load(html);

    // 3. EXTRAÇÃO DADOS BÁSICOS
    let price = 0;
    $('h1, h2').each((_, el) => {
        const txt = $(el).text();
        if (txt.includes('R$') && price === 0) price = parseFloat(txt.replace(/[^\d,]/g, '').replace(',', '.'));
    });

    let buildingName = '';
    const h2Text = $('h2').first().text().trim(); 
    const pTorre = $('h2').first().next('p').text().trim();
    if (h2Text && pTorre) buildingName = `Unidade ${h2Text} - ${pTorre}`;
    else buildingName = $('title').text().trim();

    // 4. ÍCONES (Dorm/Vaga/Área)
    const extractByAlt = (altKeywords: string[]) => {
        let val = 0;
        $('img').each((_, el) => {
            const alt = $(el).attr('alt')?.toLowerCase() || '';
            if (altKeywords.some(k => alt.includes(k))) {
                const h2 = $(el).parent().find('h2').text().trim();
                if (h2) {
                    const num = parseFloat(h2.replace('m²', '').replace(',', '.'));
                    if (!isNaN(num)) val = num;
                }
            }
        });
        return val;
    };

    const bedrooms = extractByAlt(['dorm', 'quarto']);
    const suites = extractByAlt(['suíte']);
    const bathrooms = extractByAlt(['banheiro']);
    const garageSpots = extractByAlt(['garagem', 'vaga', 'carro']);
    const privateArea = extractByAlt(['área privada', 'privativos', 'privativa']);
    const totalArea = extractByAlt(['área total']);

    // --- 5. CARACTERÍSTICAS (SCAN NO CÓDIGO FONTE BRUTO) ---
    // Mesmo que o conteúdo esteja oculto em abas, ele está no JSON do Next.js
    // Vamos procurar se as palavras-chave existem no HTML bruto.
    
    const propertyFeatures: string[] = [];
    const developmentFeatures: string[] = [];
    const roomFeatures: string[] = [];

    // Dicionário de Características para procurar (Display Name -> Search Terms)
    const allPossibleFeatures = [
        { type: 'DEV', name: 'Piscina', keys: ['piscina'] },
        { type: 'DEV', name: 'Academia', keys: ['academia', 'fitness'] },
        { type: 'DEV', name: 'Salão de Festas', keys: ['salão de festas'] },
        { type: 'DEV', name: 'Sala de Jogos', keys: ['sala de jogos'] },
        { type: 'DEV', name: 'Playground', keys: ['playground', 'brinquedoteca'] },
        { type: 'DEV', name: 'Sauna', keys: ['sauna', 'spa'] },
        { type: 'DEV', name: 'Cinema', keys: ['cinema'] },
        { type: 'DEV', name: 'Quadra Esportiva', keys: ['quadra'] },
        { type: 'DEV', name: 'Rooftop', keys: ['rooftop'] },
        { type: 'DEV', name: 'Elevador', keys: ['elevador'] },
        { type: 'DEV', name: 'Espaço Gourmet', keys: ['gourmet'] },
        { type: 'DEV', name: 'Bar / Pub', keys: ['pub', 'bar'] },
        { type: 'DEV', name: 'Pet Place', keys: ['pet'] },
        { type: 'DEV', name: 'Coworking', keys: ['coworking'] },
        { type: 'DEV', name: 'Heliponto', keys: ['heliponto'] },
        { type: 'DEV', name: 'Portaria 24h', keys: ['portaria'] },
        { type: 'DEV', name: 'Zelador', keys: ['zelador'] },
        { type: 'DEV', name: 'Bicicletário', keys: ['bicicletário'] },
        { type: 'DEV', name: 'Box de Praia', keys: ['box de praia'] },
        { type: 'DEV', name: 'Gerador', keys: ['gerador'] },
        { type: 'DEV', name: 'Hall Decorado', keys: ['hall'] },
        { type: 'DEV', name: 'Deck', keys: ['deck'] },
        { type: 'DEV', name: 'Lounge', keys: ['lounge'] },
        { type: 'DEV', name: 'Acessibilidade PNE', keys: ['pne', 'acessibilidade'] },
        { type: 'DEV', name: 'Câmeras de Segurança', keys: ['câmeras', 'monitoramento'] },
        
        { type: 'ROOM', name: 'Sala de Estar', keys: ['sala de estar', 'living'] },
        { type: 'ROOM', name: 'Sala de Jantar', keys: ['sala de jantar'] },
        { type: 'ROOM', name: 'Cozinha', keys: ['cozinha'] },
        { type: 'ROOM', name: 'Lavabo', keys: ['lavabo'] },
        { type: 'ROOM', name: 'Área de Serviço', keys: ['área de serviço', 'lavanderia'] },
        { type: 'ROOM', name: 'Sacada com Churrasqueira', keys: ['sacada', 'churrasqueira'] },
        { type: 'ROOM', name: 'Varanda', keys: ['varanda'] },
        { type: 'ROOM', name: 'Closet', keys: ['closet'] },
        { type: 'ROOM', name: 'Dependência', keys: ['dependência'] },
        { type: 'ROOM', name: 'Escritório', keys: ['escritório', 'home office'] },

        { type: 'PROP', name: 'Acabamento em Gesso', keys: ['gesso'] },
        { type: 'PROP', name: 'Porcelanato', keys: ['porcelanato'] },
        { type: 'PROP', name: 'Ar Condicionado', keys: ['ar condicionado', 'split'] },
        { type: 'PROP', name: 'Aquecimento a Gás', keys: ['aquecimento a gás', 'água quente'] },
        { type: 'PROP', name: 'Fechadura Eletrônica', keys: ['fechadura'] },
        { type: 'PROP', name: 'Interfone', keys: ['interfone'] },
        { type: 'PROP', name: 'Mobiliado', keys: ['mobiliado'] },
        { type: 'PROP', name: 'Internet', keys: ['internet', 'wifi'] },
        { type: 'PROP', name: 'Gás Individual', keys: ['gás individual'] },
        { type: 'PROP', name: 'Hidrômetro Individual', keys: ['hidrômetro', 'medidores'] },
    ];

    const lowerHtml = html.toLowerCase();

    // Varre o HTML inteiro procurando as palavras
    allPossibleFeatures.forEach(feat => {
        // Verifica se alguma das chaves existe no HTML
        const exists = feat.keys.some(k => lowerHtml.includes(k));
        
        if (exists) {
            if (feat.type === 'DEV') developmentFeatures.push(feat.name);
            else if (feat.type === 'ROOM') roomFeatures.push(feat.name);
            else propertyFeatures.push(feat.name);
        }
    });

    // 6. Pagamento
    const paymentConditions: { description: string; value: number }[] = [];
    $('h3').each((_, el) => {
        const label = $(el).text().trim(); 
        const container = $(el).closest('div').parent(); 
        const valueText = container.find('p').first().text().trim(); 
        if (['entrada', 'parcelas', 'reforço', 'financiamento'].some(k => label.toLowerCase().includes(k)) && valueText) {
            paymentConditions.push({ description: `${label}: ${valueText}`, value: 0 }); 
        }
    });

    // 7. Imagens (REGEX + FILTRO DE TAMANHO)
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const regex = /https?:\/\/[^"'\s>]+\.(?:jpg|png|jpeg|webp)/gi;
    const matches = html.match(regex) || [];
    
    // Filtro de URLs
    const uniqueUrls = [...new Set(matches)].filter(u => 
        !u.includes('svg') && !u.includes('icon') && !u.includes('logo') && !u.includes('personal') && !u.includes('avatar') && u.length > 25
    );

    const urlsToProcess = uniqueUrls.slice(0, 40);
    const processedImages: { url: string; isCover: boolean }[] = [];

    for (const url of urlsToProcess) {
        try {
            const res = await axios.get(url, { responseType: 'arraybuffer', timeout: 5000 });
            const buffer = Buffer.from(res.data);
            
            // Filtro de Tamanho em Bytes (Ignora ícones pequenos)
            if (buffer.length < 20000) continue; 

            // Filtro de Dimensão com Sharp (Ignora logos como ON!)
            const metadata = await sharp(buffer).metadata();
            if (!metadata.width || metadata.width < 800) continue; 

            const fname = `dwv-${Date.now()}-${Math.floor(Math.random()*10000)}.jpg`;
            await sharp(buffer).resize(1280, 960, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 80 }).toFile(path.join(uploadDir, fname));
            
            processedImages.push({ url: `http://127.0.0.1:3000/uploads/${fname}`, isCover: processedImages.length === 0 });
        } catch {}
    }

    // 8. DTO Final
    let title = $('h1').first().text().trim() || $('title').text().trim();
    if (title.length > 80) title = "Imóvel Importado DWV";

    const createDto: CreatePropertyDto = {
        title: title,
        subtitle: 'Balneário Camboriú',
        category: PropertyCategory.APARTAMENTO, 
        transactionType: TransactionType.VENDA,
        status: PropertyStatus.DISPONIVEL,
        price, bedrooms, suites, garageSpots, privateArea, totalArea,
        bathrooms: (bathrooms > 0) ? bathrooms : (suites + 1),
        
        description: `Importado de: ${dwvUrl}`,
        address: { street, number, neighborhood: 'Centro', city: 'Balneário Camboriú', state: 'SC', zipCode: '88330-000', complement: '' },
        buildingName: buildingName,
        isFurnished: propertyFeatures.some(f => f.includes('Mobiliado')),
        
        roomFeatures: [...new Set(roomFeatures)],
        propertyFeatures: [...new Set(propertyFeatures)],
        developmentFeatures: [...new Set(developmentFeatures)],
        
        paymentConditions,
        images: processedImages
    };

    console.log(`💾 Salvando: ${createDto.title} | ${processedImages.length} fotos | ${developmentFeatures.length} infra`);
    return this.create(createDto);
  }
}