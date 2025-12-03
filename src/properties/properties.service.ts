import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreatePropertyDto, PropertyCategory, TransactionType } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class PropertiesService {

  constructor(private readonly prisma: PrismaService) {}

  // ===========================================================================
  // CREATE
  // ===========================================================================
  async create(createPropertyDto: CreatePropertyDto) {
    const {
      address,
      features,
      images,
      paymentConditions,
      constructionStartDate,
      deliveryDate,
      ...propertyData
    } = createPropertyDto;

    return await this.prisma.property.create({
      data: {
        ...propertyData,
        // Garante conversão de números
        garageArea: propertyData.garageArea ? Number(propertyData.garageArea) : undefined,
        price: Number(propertyData.price),
        privateArea: Number(propertyData.privateArea),
        
        // Conversão de datas
        constructionStartDate: constructionStartDate ? new Date(constructionStartDate) : undefined,
        deliveryDate : deliveryDate ? new Date(deliveryDate) : undefined,

        address: address ? {
          create: { ...address }
        } : undefined,

        features: (features && features.length > 0) ? {
          connectOrCreate: features.map((featureName) => ({
            where: { name: featureName },
            create: { name: featureName },
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
        features: true,
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
        features: true,
        paymentConditions: true
      }
    });

    if (!property) throw new NotFoundException(`Imóvel ${id} não encontrado`);
    return property;
  }

  // ===========================================================================
  // UPDATE (CORRIGIDO)
  // ===========================================================================
  async update(id: number, updatePropertyDto: any) { // Usando any no DTO para facilitar a limpeza
    await this.findOne(id);

    // 1. LIMPEZA DE DADOS (CRUCIAL)
    // Removemos id, createdAt, updatedAt, addressId pois não podem ser atualizados diretamente no 'data'
    const {
      id: _id,            // Remove ID
      createdAt: _created, // Remove datas automáticas
      updatedAt: _updated,
      addressId: _addrId,  // Remove FK solta
      address,
      features,
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
        
        // Conversões de segurança (String -> Number) igual no create
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

        // Conversão de Datas
        constructionStartDate: constructionStartDate ? new Date(constructionStartDate) : undefined,
        deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,

        // Atualiza Endereço
        address: address ? {
          upsert: {
            create: { 
                street: address.street, number: address.number, neighborhood: address.neighborhood, 
                city: address.city, state: address.state, zipCode: address.zipCode, complement: address.complement 
            },
            update: { 
                street: address.street, number: address.number, neighborhood: address.neighborhood, 
                city: address.city, state: address.state, zipCode: address.zipCode, complement: address.complement 
            },
          },
        } : undefined,

        // Atualiza Features (Limpa e reconecta)
        features: features ? {
          set: [], 
          connectOrCreate: features.map((f: string) => ({
            where: { name: f },
            create: { name: f },
          })),
        } : undefined,

        // Atualiza Condições de Pagamento
        paymentConditions: paymentConditions ? {
          deleteMany: {},
          createMany: {
            data: paymentConditions.map((p: any) => ({
              description: p.description,
              value: p.value
            }))
          }
        } : undefined,
        
        // Atualiza Imagens
        // Nota: O ideal seria deletar as antigas antes de criar novas se a intenção for substituir a galeria.
        // Aqui estamos apenas ADICIONANDO NOVAS se houver.
        // Se quiser substituir tudo: adicione 'deleteMany: {}' antes do createMany.
        images: (images && images.length > 0) ? {
          createMany: {
            data: images.map((img: any) => ({
              url: img.url,
              isCover: img.isCover || false,
            })),
            skipDuplicates: true // Evita erro se reenviar a mesma URL
          },
        } : undefined,
      },
      include: {
        address: true,
        features: true,
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
  // IMPORTAR DO DWV (NATIVO E ROBUSTO)
  // ===========================================================================
  async importFromDwv(dwvUrl: string) {
    console.log(`--- IMPORTAÇÃO DWV: ${dwvUrl} ---`);

    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    // 1. FETCH NATIVO (Sem Axios para evitar bugs de compressão)
    let html = '';
    try {
      const response = await fetch(dwvUrl, {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      html = await response.text();
    } catch (e) {
      throw new Error("Erro ao baixar site.");
    }

    const $ = cheerio.load(html);

    // 2. EXTRAIR DADOS
    const building = $('h2').first().text().trim();
    const unit = $('p').first().text().trim();
    const title = building ? `${building} ${unit}` : ($('title').text() || "Imóvel DWV");
    
    let price = 0;
    $('h1, h2').each((_, el) => {
        const txt = $(el).text();
        if (txt.includes('R$') && price === 0) {
             price = parseFloat(txt.replace(/[^\d,]/g, '').replace(',', '.'));
        }
    });

    let bedrooms = 0, suites = 0, garageSpots = 0, privateArea = 0;
    $('div').each((_, el) => {
        const label = $(el).find('p').text().toLowerCase();
        const value = parseFloat($(el).find('h2').text().replace(',', '.'));
        if (!isNaN(value)) {
            if (label.includes('dorm')) bedrooms = value;
            if (label.includes('suítes')) suites = value;
            if (label.includes('vagas')) garageSpots = value;
            if (label.includes('privati')) privateArea = value;
        }
    });

    // 3. IMAGENS
    const regex = /https?:\/\/[^"'\s>]+\.(?:jpg|png|jpeg|webp)/gi;
    const matches = html.match(regex) || [];
    const uniqueUrls = [...new Set(matches)].filter(u => 
        !u.includes('svg') && !u.includes('icon') && !u.includes('logo') && u.length > 25
    );

    console.log(`Imagens encontradas: ${uniqueUrls.length}`);
    const urlsToProcess = uniqueUrls.slice(0, 20);
    const processedImages: { url: string; isCover: boolean }[] = [];

    for (let i = 0; i < urlsToProcess.length; i++) {
      try {
        const url = urlsToProcess[i];
        const imgResp = await fetch(url);
        if (!imgResp.ok) continue;

        const arrayBuffer = await imgResp.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        if (buffer.length < 5000) continue;

        // Nome simples e seguro
        const randomName = `img-${Date.now()}-${Math.floor(Math.random() * 10000)}.jpg`;
        const filePath = path.join(uploadDir, randomName);

        fs.writeFileSync(filePath, buffer);

        processedImages.push({
            url: `http://127.0.0.1:3000/uploads/${randomName}`,
            isCover: processedImages.length === 0 
        });
      } catch (err) {
        console.log(`Erro ao baixar imagem: Ignorando.`);
      }
    }

    console.log(`Total salvo: ${processedImages.length}`);

    const createDto: CreatePropertyDto = {
      title: title,
      description: `Importado de: ${dwvUrl}`,
      category: PropertyCategory.APARTAMENTO,
      transactionType: TransactionType.VENDA,
      price: price,
      bedrooms,
      suites,
      garageSpots,
      privateArea,
      showOnSite: true,
      isExclusive: false,
      features: ["Importado DWV"],
      images: processedImages,
      address: {
        street: "Importado (Verificar)", number: "S/N", neighborhood: "Centro", 
        city: "Balneário Camboriú", state: "SC", zipCode: "88330-000"
      }
    };

    return this.create(createDto);
  }
}