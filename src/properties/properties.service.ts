import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';

@Injectable()
export class PropertiesService {

  constructor(private readonly prisma: PrismaService) {}

  async create(createPropertyDto: CreatePropertyDto) {
    return await this.prisma.property.create({
      data: {
        title: createPropertyDto.title,
        reference : createPropertyDto.reference,
        showOnSite : createPropertyDto.showOnSite,
        finality : createPropertyDto.finality,
        isExclusive : createPropertyDto.isExclusive,
        value: createPropertyDto.value,

      }
    });
  }

  findAll() {
    return this.prisma.property.findMany();
  }

  findOne(id: number) {
    return this.prisma.property.findUnique(
      {where: {id}}
    );
  }

  update(id: number, updatePropertyDto: UpdatePropertyDto) {
    return this.prisma.property.update({
      where: {id: id,},
      data: {
        title : updatePropertyDto.title,
        value : updatePropertyDto.value
      }
    }) 
  }

  remove(id: number) {
    return this.prisma.imovel.delete({
      where : {id}
    });
  }
}
