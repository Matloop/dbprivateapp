import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { features } from 'process';


@Injectable()
export class PropertiesService {

  constructor(private readonly prisma: PrismaService) {}

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
        constructionStartDate: constructionStartDate ? new Date(constructionStartDate) : undefined,
        deliveryDate : deliveryDate ? new Date(deliveryDate) : undefined,

        address: address ? {
          create: {
            street: address.street,
            number: address.number,
            complement: address.complement,
            neighborhood: address.neighborhood,
            city: address.city,
            state: address.state,
            zipCode: address.zipCode
          }
        } : undefined,

        features:features && features?.length > 0 ? {
          connectOrCreate: features.map((featureName) => ({
            where: { name: featureName },
            create: { name: featureName },
          })),
        } : undefined,

        images: images && images?.length > 0 ? {
          createMany: {
            data: images.map((img) => ({
              url: img.url,
              isCover: img.isCover || false,
            })),
          },
        } : undefined,

        paymentConditions: paymentConditions && paymentConditions?.length > 0 ? {
          createMany: {
            data: paymentConditions.map((cond) => ({
              description: cond.description,
              value: cond.value, // Opcional
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

  findAll() {
    return this.prisma.property.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        address: true,
        //traz apenas imagem da capa para performance
        images: {
          where: { isCover: true},
          take: 1,
        },
        features : true,
      }
    });
  }

  async findOne(id: number) {
    return this.prisma.property.findUnique({
      where: { id },
      // Ao abrir o detalhe, trazemos TUDO
      include: {
        address: true,
        images: true,
        features: true,
        paymentConditions: true
      }
    });
  }

  async update(id: number, updatePropertyDto: UpdatePropertyDto) {
    //verifica se exise antes de atualizar
    await this.findOne(id);

    const {
      address,
      features,
      images,
      paymentConditions,
      ...propertyData
    } = updatePropertyDto
    return this.prisma.property.update({
      where: {id: id,},
      data: {
        ...propertyData,
        // --- Atualiza Endereço ---
        // Upsert: Se já tiver endereço, atualiza. Se não tiver (foi criado sem), cria.
        address: address ? {
          upsert: {
            create: { ...address },
            update: { ...address },
          },
        } : undefined,

        // --- Atualiza Features ---
        // Estratégia: "Set" limpa as conexões antigas e "ConnectOrCreate" adiciona as novas.
        // Isso garante que o banco fique igual ao formulário do front.
        features: features ? {
          set: [], 
          connectOrCreate: features.map((f) => ({
            where: { name: f },
            create: { name: f },
          })),
        } : undefined,

        // --- Atualiza Condições de Pagamento ---
        // Estratégia: Deleta as antigas e recria as novas (mais simples para listas pequenas).
        paymentConditions: paymentConditions ? {
          deleteMany: {},
          createMany: {
            data: paymentConditions.map(p => ({
              description: p.description,
              value: p.value
            }))
          }
        } : undefined,
        
        // --- Atualiza Imagens ---
        // OBS: Geralmente imagens são gerenciadas por rotas separadas (deleteImage/uploadImage).
        // Aqui, se vier um array, vamos ADICIONAR novas imagens.
        images: images && images?.length > 0 ? {
          createMany: {
            data: images.map((img) => ({
              url: img.url,
              isCover: img.isCover || false,
            })),
          },
        } : undefined,
      },
      include: {
        address: true,
        features: true,
        images: true,
        paymentConditions: true,
      },
      
    }) 
  }

  async remove(id: number) {
    //verifica se existe
    await this.findOne(id);
    return this.prisma.property.delete({
      where : {id}
    });
  }
}
