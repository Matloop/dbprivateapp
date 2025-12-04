import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, BadRequestException, Query } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
@ApiTags('Imóveis')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({summary:'Cria um novo imóvel'})
  create(@Body() createPropertyDto: CreatePropertyDto) {
    return this.propertiesService.create(createPropertyDto);
  }
  
  @Get()
  async findAll(@Query() query: any) {
    console.time('AUTH_ATE_CONTROLLER'); 
    console.log('1. Passou pelo Auth Guard'); // Vai aparecer instantâneo

    const result = await this.propertiesService.findAll();
  
    console.log('2. Prisma retornou dados'); // Vai demorar 5 segundos para aparecer
    console.timeEnd('AUTH_ATE_CONTROLLER');
  
    return this.propertiesService.findAll(query);
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

  @Post('import-dwv')
  async importDwv(@Body() body: any) { // <--- O SEGREDO É USAR 'any' AQUI
    // Verifica se o campo existe
    if (!body || !body.url) {
        throw new BadRequestException("O corpo da requisição deve conter { url: 'texto...' }");
    }

    const inputText = body.url;

    // Verifica se é string
    if (typeof inputText !== 'string') {
        throw new BadRequestException("O campo 'url' deve ser um texto.");
    }

    // Chama o serviço
    return this.propertiesService.importFromDwv(inputText);
  }
}
