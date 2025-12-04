import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreatePropertyDto, PropertyCategory, TransactionType } from './dto/create-property.dto';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import axios from 'axios'; 

@Injectable()
export class PropertiesService {

  constructor(private readonly prisma: PrismaService) {}

  // ===========================================================================
  // CREATE
  // ===========================================================================
  async create(createPropertyDto: CreatePropertyDto) {
    const {
      address,
      propertyFeatures,      // Privativas
      developmentFeatures,   // Comuns
      images,
      paymentConditions,
      constructionStartDate,
      deliveryDate,
      ...propertyData
    } = createPropertyDto;

    return await this.prisma.property.create({
      data: {
        ...propertyData,
        // Conversão de segurança
        garageArea: propertyData.garageArea ? Number(propertyData.garageArea) : undefined,
        price: Number(propertyData.price),
        privateArea: Number(propertyData.privateArea),
        
        constructionStartDate: constructionStartDate ? new Date(constructionStartDate) : undefined,
        deliveryDate : deliveryDate ? new Date(deliveryDate) : undefined,

        address: address ? {
          create: { ...address }
        } : undefined,

        // 1. Features Privativas
        propertyFeatures: (propertyFeatures && propertyFeatures.length > 0) ? {
          connectOrCreate: propertyFeatures.map((name) => ({
            where: { name: name },
            create: { name: name },
          })),
        } : undefined,

        // 2. Features do Empreendimento
        developmentFeatures: (developmentFeatures && developmentFeatures.length > 0) ? {
          connectOrCreate: developmentFeatures.map((name) => ({
            where: { name: name },
            create: { name: name },
          })),
        } : undefined,

        images: (images && images.length > 0) ? {
          createMany: {
            data: images.map((img) => ({
              url: img.url,
              isCover: img.isCover || false,
            })),
          },
        } : undefined,

        paymentConditions: (paymentConditions && paymentConditions.length > 0) ? {
          createMany: {
            data: paymentConditions.map((cond) => ({
              description: cond.description,
              value: cond.value,
            })),
          },
        } : undefined,
      },
      include: {
        address: true,
        propertyFeatures: true,
        developmentFeatures: true,
        images: true,
        paymentConditions: true,
      }
    });
  }

  // ===========================================================================
  // FIND ALL
  // ===========================================================================
  async findAll() {
    return this.prisma.property.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        subtitle: true,
        price: true,
        category: true,
        status: true,
        createdAt: true,
        badgeText: true,
        badgeColor: true,
        address: {
          select: { city: true, state: true, neighborhood: true }
        },
        // Traz todas as imagens (Front filtra a capa na tabela e mostra o resto no modal)
        images: {
          select: { url: true, isCover: true }
         
        }
      },
    });
  }

  // ===========================================================================
  // FIND ONE
  // ===========================================================================
  async findOne(id: number) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        address: true,
        images: true,
        propertyFeatures: true,    // Traz a lista separada
        developmentFeatures: true, // Traz a lista separada
        paymentConditions: true
      }
    });

    if (!property) throw new NotFoundException(`Imóvel ${id} não encontrado`);
    return property;
  }

  // ===========================================================================
  // UPDATE
  // ===========================================================================
  async update(id: number, updatePropertyDto: any) {
    await this.findOne(id);

    const {
      id: _id,
      createdAt: _created,
      updatedAt: _updated,
      addressId: _addrId,
      address,
      propertyFeatures,      // Novo array
      developmentFeatures,   // Novo array
      images,
      paymentConditions,
      constructionStartDate,
      deliveryDate,
      ...propertyData
    } = updatePropertyDto;

    return this.prisma.property.update({
      where: { id: Number(id) },
      data: {
        ...propertyData,
        price: propertyData.price ? Number(propertyData.price) : undefined,
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
            create: { ...address },
            update: { ...address },
          },
        } : undefined,

        // Atualiza Property Features (Privativas)
        propertyFeatures: propertyFeatures ? {
          set: [], // Limpa relações antigas
          connectOrCreate: propertyFeatures.map((f: string) => ({
            where: { name: f },
            create: { name: f },
          })),
        } : undefined,

        // Atualiza Development Features (Comuns)
        developmentFeatures: developmentFeatures ? {
          set: [], // Limpa relações antigas
          connectOrCreate: developmentFeatures.map((f: string) => ({
            where: { name: f },
            create: { name: f },
          })),
        } : undefined,

        paymentConditions: paymentConditions ? {
          deleteMany: {},
          createMany: {
            data: paymentConditions.map((p: any) => ({
              description: p.description,
              value: p.value
            }))
          }
        } : undefined,
        
        images: images ? {
          deleteMany: {}, // Substituição total da galeria
          createMany: {
            data: images.map((img: any) => ({
              url: img.url,
              isCover: img.isCover || false,
            })),
            skipDuplicates: true
          },
        } : undefined,
      },
      include: {
        address: true,
        propertyFeatures: true,
        developmentFeatures: true,
        images: true,
        paymentConditions: true,
      },
    });
  }

  // ===========================================================================
  // REMOVE
  // ===========================================================================
  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.property.delete({
      where : { id }
    });
  }

  // ===========================================================================
  // IMPORTAR DO DWV
  // ===========================================================================
  // ===========================================================================
  // IMPORTAR DO DWV (ATUALIZADO COM SEPARAÇÃO DE CARACTERÍSTICAS)
  // ===========================================================================
  async importFromDwv(inputText: string) {
    console.log(`--- PROCESSANDO IMPORTAÇÃO ---`);

    if (!inputText || typeof inputText !== 'string') {
        throw new Error("Texto de entrada inválido.");
    }

    // 1. SEPARAR URL DO ENDEREÇO
    const lines = inputText.split(/\r?\n|\s+/); 
    const dwvUrl = lines.find(line => line && line.includes('http'));
    
    if (!dwvUrl) throw new Error("Link não encontrado.");

    // Limpa o texto para sobrar só o endereço
    let addressText = inputText
      .replace(dwvUrl, '')
      .replace(/\n/g, ' ')
      .trim();
    
    // Remove traços soltos no final ou começo (ex: "Avenida 10, - Bal...")
    addressText = addressText.replace(/,\s*-/, ',').trim();

    console.log(`URL: ${dwvUrl}`);
    console.log(`Endereço Texto: ${addressText}`);

    // --- LÓGICA NOVA: EXTRAÇÃO MANUAL DE NÚMERO E RUA ---
    // Tenta achar um número no texto (ex: 3151)
    const numberMatch = addressText.match(/(\d+)/);
    const manualNumber = numberMatch ? numberMatch[0] : 'S/N';

    // Tenta achar a rua (tudo antes do número ou da vírgula)
    let manualStreet = addressText.split(',')[0];
    if (manualNumber !== 'S/N') {
        // Se achou número, remove ele do nome da rua
        manualStreet = manualStreet.replace(manualNumber, '').trim();
    }
    // -----------------------------------------------------

    // 2. GEOLOCALIZAÇÃO (API)
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
        console.log("Buscando endereço na API...");
        // Adiciona "Brasil" na busca para garantir
        const query = `${addressText}, Brasil`;
        const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=1`;
        
        const { data: geoJson } = await axios.get(geoUrl, {
          headers: { 'User-Agent': 'RealEstateApp/1.0' },
          timeout: 5000
        });

        if (geoJson && geoJson.length > 0) {
          const info = geoJson[0].address;
          console.log("API Encontrou:", info);

          // LÓGICA HÍBRIDA:
          // Se a API trouxe o número, usa o da API. Se não, usa o que extraímos do texto (manualNumber).
          // Se a API trouxe a rua, usa a da API. Se não, usa a manual.
          addressData = {
            street: info.road || info.pedestrian || manualStreet,
            number: info.house_number || manualNumber, 
            neighborhood: info.suburb || info.neighbourhood || info.quarter || 'Centro',
            city: info.city || info.town || info.village || 'Balneário Camboriú',
            state: this.mapStateToAbbreviation(info.state) || 'SC',
            zipCode: info.postcode ? info.postcode.replace('-', '') : '88330000'
          };
        }
      } catch (error) {
        console.error("Geolocalização falhou. Usando dados manuais.");
      }
    }

    // 3. SCRAPING (DWV) - RESTO DO CÓDIGO IGUAL
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    let html = '';
    try {
      const { data } = await axios.get(dwvUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36' },
        timeout: 10000
      });
      html = data;
    } catch (e) {
      throw new Error("Erro ao baixar o site do DWV.");
    }

    const $ = cheerio.load(html);

    // Extração de Dados
    const building = $('h2').first().text().trim();
    const unit = $('p').first().text().trim();
    const title = building ? `${building} ${unit}` : ($('title').text() || "Imóvel DWV");

    let price = 0;
    $('h1, h2, h3').each((_, el) => {
      const txt = $(el).text();
      if (txt.includes('R$') && price === 0) {
        price = parseFloat(txt.replace(/[^\d,]/g, '').replace(',', '.'));
      }
    });

    let bedrooms = 0, suites = 0, garageSpots = 0, privateArea = 0;
    $('div').each((_, el) => {
      const label = $(el).find('p, span, small').text().toLowerCase();
      const valueTxt = $(el).find('h2, h3, strong').text().replace(',', '.');
      const value = parseFloat(valueTxt);
      if (!isNaN(value)) {
        if (label.includes('dorm')) bedrooms = value;
        if (label.includes('suítes')) suites = value;
        if (label.includes('vagas')) garageSpots = value;
        if (label.includes('privati')) privateArea = value;
      }
    });

    // Features
    const propertyFeatures: string[] = [];
    const developmentFeatures: string[] = [];
    $('h3, h4, h5, h6, strong, p').each((_, el) => {
      const text = $(el).text().toLowerCase().trim();
      const isUnitSection = text.includes('apartamento') || text.includes('imóvel') || text.includes('unidade');
      const isDevSection = text.includes('empreendimento') || text.includes('lazer') || text.includes('condomínio');

      if (isUnitSection || isDevSection) {
        let $nextContainer = $(el).next();
        if (!$nextContainer.is('ul') && !$nextContainer.is('div')) $nextContainer = $nextContainer.next();
        
        const items: string[] = [];
        $nextContainer.find('li, p, span').each((_, item) => {
            const feat = $(item).text().trim();
            if (feat.length > 2 && !feat.includes('R$')) items.push(feat);
        });
        if (isUnitSection) propertyFeatures.push(...items);
        else if (isDevSection) developmentFeatures.push(...items);
      }
    });

    const uniquePropertyFeatures = [...new Set(propertyFeatures)];
    const uniqueDevelopmentFeatures = [...new Set(developmentFeatures)];

    // Imagens (WebP)
    const regex = /https?:\/\/[^"'\s>]+\.(?:jpg|png|jpeg|webp)/gi;
    const matches = html.match(regex) || [];
    const uniqueUrls = [...new Set(matches)].filter(u => 
        !u.includes('svg') && !u.includes('icon') && !u.includes('logo') && u.length > 25
    );
    const urlsToProcess = uniqueUrls.slice(0, 20);
    const processedImages: { url: string; isCover: boolean }[] = [];

    for (let i = 0; i < urlsToProcess.length; i++) {
      try {
        const response = await axios.get(urlsToProcess[i], { responseType: 'arraybuffer', timeout: 5000 });
        const buffer = Buffer.from(response.data);
        if (buffer.length < 5000) continue;

        const randomName = `img-${Date.now()}-${Math.floor(Math.random() * 10000)}.webp`;
        const filePath = path.join(uploadDir, randomName);

        await sharp(buffer)
          .resize(1280, 960, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(filePath);

        processedImages.push({
            url: `http://127.0.0.1:3000/uploads/${randomName}`,
            isCover: processedImages.length === 0 
        });
      } catch (err) {}
    }

    // Salvar
    const createDto: CreatePropertyDto = {
      title: title,
      subtitle: building,
      description: `Importado via DWV: ${dwvUrl}`,
      category: PropertyCategory.APARTAMENTO,
      transactionType: TransactionType.VENDA,
      price: price,
      bedrooms,
      suites,
      garageSpots,
      privateArea,
      showOnSite: true,
      isExclusive: false,
      propertyFeatures: uniquePropertyFeatures,
      developmentFeatures: uniqueDevelopmentFeatures,
      images: processedImages,
      address: addressData // Usando o endereço híbrido
    };

    return this.create(createDto);
  }

  // --- HELPER DE ESTADOS ---
  private mapStateToAbbreviation(fullStateName: string): string {
    if (!fullStateName) return 'SC';
    const states: { [key: string]: string } = {
        'Santa Catarina': 'SC', 'Rio Grande do Sul': 'RS', 'Paraná': 'PR', 'São Paulo': 'SP',
        'Rio de Janeiro': 'RJ', 'Minas Gerais': 'MG', 'Bahia': 'BA', 'Distrito Federal': 'DF'
    };
    return states[fullStateName] || fullStateName || 'SC';
  }
}