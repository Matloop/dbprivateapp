import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
@UseGuards(JwtAuthGuard)
@ApiTags('Imóveis')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @Post()
  @ApiOperation({summary:'Cria um novo imóvel'})
  create(@Body() createPropertyDto: CreatePropertyDto) {
    return this.propertiesService.create(createPropertyDto);
  }
  
  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll() {
    console.time('AUTH_ATE_CONTROLLER'); 
    console.log('1. Passou pelo Auth Guard'); // Vai aparecer instantâneo

    const result = await this.propertiesService.findAll();
  
    console.log('2. Prisma retornou dados'); // Vai demorar 5 segundos para aparecer
    console.timeEnd('AUTH_ATE_CONTROLLER');
  
    return this.propertiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.propertiesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePropertyDto: UpdatePropertyDto) {
    return this.propertiesService.update(+id, updatePropertyDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.propertiesService.remove(+id);
  }
}
