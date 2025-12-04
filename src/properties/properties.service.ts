import { Injectable, NotFoundException } from '@nestjs/common';
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

  // ========================== CREATE ==========================
  async create(createPropertyDto: CreatePropertyDto) {
    const {
      address,
      roomFeatures, propertyFeatures, developmentFeatures,
      images, paymentConditions, constructionStartDate, deliveryDate,
      ...propertyData
    } = createPropertyDto;

    return await this.prisma.property.create({
      data: {
        ...propertyData,
        price: Number(propertyData.price),
        privateArea: Number(propertyData.privateArea),
        totalArea: propertyData.totalArea ? Number(propertyData.totalArea) : undefined,
        garageArea: propertyData.garageArea ? Number(propertyData.garageArea) : undefined,
        
        constructionStartDate: constructionStartDate ? new Date(constructionStartDate) : undefined,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,

        address: address ? { create: { ...address } } : undefined,

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
      include: {
        address: true,
        roomFeatures: true,
        propertyFeatures: true,
        developmentFeatures: true,
        images: true
      }
    });
  }

  // ========================== FIND ALL ==========================
  async findAll(filters?: any) {
    const where: any = {};

    if (filters?.search) {
      const searchVal = filters.search.trim();
      if (!isNaN(Number(searchVal))) {
        where.OR = [ { id: Number(searchVal) } ];
      } else {
        where.OR = [
          { title: { contains: searchVal, mode: 'insensitive' } },
          { buildingName: { contains: searchVal, mode: 'insensitive' } },
          { oldRef: { contains: searchVal, mode: 'insensitive' } }
        ];
      }
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
        images: { 
          take: 20, // Traz até 5 imagens (opcional, para não pesar)
          select: { url: true, isCover: true },
          orderBy: { isCover: 'desc' } // Capa primeiro
        },
        createdAt: true, updatedAt: true
      }
    });
  }

  // ========================== FIND ONE ==========================
  async findOne(id: number) {
    // Validação extra de segurança
    if (!id || isNaN(id)) {
       throw new NotFoundException(`ID inválido fornecido.`);
    }

    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        address: true,
        images: true,
        roomFeatures: true,
        propertyFeatures: true,
        developmentFeatures: true,
        paymentConditions: true
      }
    });

    if (!property) throw new NotFoundException(`Imóvel #${id} não encontrado`);
    
    return property;
  }

  // ========================== UPDATE ==========================
  // ===========================================================================
  // UPDATE (CORRIGIDO)
  // ===========================================================================
  async update(id: number, updatePropertyDto: any) {
    // 1. Verifica se existe
    await this.findOne(id);

    // 2. Separa os dados. 
    // IMPORTANTE: Adicionei 'addressId' e 'id' na desestruturação para removê-los do 'propertyData'
    const {
      id: _id,             // Remove ID para não tentar atualizar a PK
      addressId,           // <--- REMOVE addressId (O ERRO ESTAVA AQUI)
      createdAt,           // Remove datas de sistema
      updatedAt,           // Remove datas de sistema
      address, 
      roomFeatures, 
      propertyFeatures, 
      developmentFeatures,
      images, 
      paymentConditions, 
      constructionStartDate, 
      deliveryDate, 
      ...propertyData      // O resto vai para o banco
    } = updatePropertyDto;

    return this.prisma.property.update({
      where: { id: Number(id) },
      data: {
        ...propertyData,
        
        // Conversões de segurança (String -> Number/Date)
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

        // Relacionamento Endereço
        address: address ? {
          upsert: {
            create: { 
              street: address.street,
              number: address.number,
              neighborhood: address.neighborhood,
              city: address.city,
              state: address.state,
              zipCode: address.zipCode,
              complement: address.complement
            },
            update: { 
              street: address.street,
              number: address.number,
              neighborhood: address.neighborhood,
              city: address.city,
              state: address.state,
              zipCode: address.zipCode,
              complement: address.complement
            },
          },
        } : undefined,

        // Listas (Limpa e Reconecta)
        roomFeatures: roomFeatures ? {
          set: [], 
          connectOrCreate: roomFeatures.map((f: string) => ({ where: { name: f }, create: { name: f } }))
        } : undefined,

        propertyFeatures: propertyFeatures ? {
          set: [], 
          connectOrCreate: propertyFeatures.map((f: string) => ({ where: { name: f }, create: { name: f } }))
        } : undefined,

        developmentFeatures: developmentFeatures ? {
          set: [], 
          connectOrCreate: developmentFeatures.map((f: string) => ({ where: { name: f }, create: { name: f } }))
        } : undefined,

        // Imagens
        images: images ? {
          deleteMany: {},
          createMany: { 
            data: images.map((img: any) => ({ 
              url: img.url, 
              isCover: img.isCover || false 
            })) 
          }
        } : undefined,
      },
      include: {
        address: true,
        roomFeatures: true,
        propertyFeatures: true,
        developmentFeatures: true,
        images: true
      }
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.property.delete({ where : { id } });
  }

  // ===========================================================================
  // IMPORTAR DO DWV (CORRIGIDA)
  // ===========================================================================
  async importFromDwv(inputText: string) {
    console.log(`--- PROCESSANDO IMPORTAÇÃO ---`);

    if (!inputText || typeof inputText !== 'string') throw new Error("Entrada inválida.");

    const lines = inputText.split(/\r?\n|\s+/); 
    const dwvUrl = lines.find(line => line && line.includes('http'));
    if (!dwvUrl) throw new Error("Link não encontrado.");

    let addressText = inputText.replace(dwvUrl, '').replace(/\n/g, ' ').trim();
    addressText = addressText.replace(/,\s*-/, ',').trim();

    const numberMatch = addressText.match(/(\d+)/);
    const manualNumber = numberMatch ? numberMatch[0] : 'S/N';
    let manualStreet = addressText.split(',')[0];
    if (manualNumber !== 'S/N') manualStreet = manualStreet.replace(manualNumber, '').trim();

    let addressData = {
      street: manualStreet || 'Importado (Verificar)',
      number: manualNumber,
      neighborhood: 'Centro',
      city: 'Balneário Camboriú',
      state: 'SC',
      zipCode: '88330-000'
    };

    if (addressText.length > 5) {
      try {
        const query = `${addressText}, Brasil`;
        const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=1`;
        const { data: geoJson } = await axios.get(geoUrl, { headers: { 'User-Agent': 'App/1.0' }, timeout: 5000 });
        if (geoJson && geoJson.length > 0) {
          const info = geoJson[0].address;
          addressData = {
            street: info.road || manualStreet,
            number: info.house_number || manualNumber, 
            neighborhood: info.suburb || info.neighbourhood || 'Centro',
            city: info.city || info.town || 'Balneário Camboriú',
            state: 'SC',
            zipCode: info.postcode ? info.postcode.replace('-', '') : '88330000'
          };
        }
      } catch (e) { console.error("Geolocalização falhou."); }
    }

    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    let html = '';
    try {
      const { data } = await axios.get(dwvUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' },
        timeout: 10000
      });
      html = data;
    } catch (e) { throw new Error("Erro ao acessar DWV."); }

    const $ = cheerio.load(html);
    const building = $('h2').first().text().trim();
    const unit = $('p').first().text().trim();
    const title = building ? `${building} ${unit}` : ($('title').text() || "Imóvel DWV");

    let price = 0;
    $('h1, h2, h3').each((_, el) => {
      const txt = $(el).text();
      if (txt.includes('R$') && price === 0) price = parseFloat(txt.replace(/[^\d,]/g, '').replace(',', '.'));
    });

    let bedrooms = 0, suites = 0, garageSpots = 0, privateArea = 0, totalArea = 0;
    $('div').each((_, el) => {
      const label = $(el).find('p, span, small').text().toLowerCase();
      const valueTxt = $(el).find('h2, h3, strong').text().replace(',', '.');
      const value = parseFloat(valueTxt);
      if (!isNaN(value)) {
        if (label.includes('dorm')) bedrooms = value;
        if (label.includes('suítes')) suites = value;
        if (label.includes('vagas')) garageSpots = value;
        if (label.includes('privati')) privateArea = value;
        if (label.includes('total')) totalArea = value;
      }
    });

    const rawFeatures: string[] = [];
    $('li, p, span').each((_, item) => {
        const feat = $(item).text().trim();
        if (feat.length > 2 && !feat.includes('R$') && !feat.includes(':')) rawFeatures.push(feat);
    });
    
    const allText = rawFeatures.join(' ').toLowerCase() + ' ' + html.toLowerCase();

    // BOOLEANOS MÁGICOS
    const isFurnished = allText.includes('mobiliado') && !allText.includes('semimobiliado');
    const isSeaFront = allText.includes('frente mar') || allText.includes('frente para o mar');
    const isHighStandard = allText.includes('alto padrão');

    const developmentFeatures: string[] = [];
    const propertyFeatures: string[] = [];
    
    rawFeatures.forEach(f => {
        const lower = f.toLowerCase();
        if (['piscina', 'academia', 'salão', 'elevador', 'gerador'].some(k => lower.includes(k))) {
            developmentFeatures.push(f);
        } else if (['sacada', 'piso', 'teto', 'cozinha', 'suíte'].some(k => lower.includes(k))) {
            propertyFeatures.push(f);
        }
    });

    const regex = /https?:\/\/[^"'\s>]+\.(?:jpg|png|jpeg|webp)/gi;
    const matches = html.match(regex) || [];
    const uniqueUrls = [...new Set(matches)].filter(u => !u.includes('svg') && !u.includes('logo') && u.length > 25).slice(0, 20);
    const processedImages: { url: string; isCover: boolean }[] = [];

    for (const url of uniqueUrls) {
      try {
        const response = await axios.get(url, { responseType: 'arraybuffer', timeout: 5000 });
        const randomName = `img-${Date.now()}-${Math.floor(Math.random() * 1000)}.webp`;
        const filePath = path.join(uploadDir, randomName);
        await sharp(response.data).resize(1280, 960, { fit: 'inside' }).webp({ quality: 80 }).toFile(filePath);
        processedImages.push({ url: `http://127.0.0.1:3000/uploads/${randomName}`, isCover: processedImages.length === 0 });
      } catch (err) {}
    }

    const createDto: CreatePropertyDto = {
      title: title,
      subtitle: building,
      buildingName: building,
      description: `Importado via DWV: ${dwvUrl}`,
      category: PropertyCategory.APARTAMENTO,
      transactionType: TransactionType.VENDA,
      status: PropertyStatus.DISPONIVEL, // Agora existe no banco
      constructionStage: ConstructionStage.PRONTO,
      
      price, bedrooms, suites, garageSpots, privateArea, totalArea,
      
      showOnSite: true,
      isExclusive: false,
      isFurnished,
      isSeaFront,
      isHighStandard,
      
      propertyFeatures: [...new Set(propertyFeatures)],
      developmentFeatures: [...new Set(developmentFeatures)],
      
      images: processedImages,
      address: addressData
    };

    return this.create(createDto);
  }
}