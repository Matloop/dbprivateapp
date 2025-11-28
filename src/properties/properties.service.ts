import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Injectable()
export class PropertiesService {

  constructor(private readonly prisma: PrismaService) {}

  async create(createPropertyDto: CreatePropertyDto) {
    return await this.prisma.imovel.create({
      data: {
        title: createPropertyDto.title,
        value: createPropertyDto.value
      }
    });
  }

  findAll() {
    return `This action returns all properties`;
  }

  findOne(id: number) {
    return `This action returns a #${id} property`;
  }

  update(id: number, updatePropertyDto: UpdatePropertyDto) {
    return `This action updates a #${id} property`;
  }

  remove(id: number) {
    return `This action removes a #${id} property`;
  }
}
