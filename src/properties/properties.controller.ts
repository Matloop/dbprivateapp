import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, BadRequestException, Query } from '@nestjs/common';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ScraperService } from './scraper/scraper.service';

@ApiTags('Imóveis')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService, private scraperService: ScraperService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({summary:'Cria um novo imóvel'})
  create(@Body() createPropertyDto: CreatePropertyDto) {
    return this.propertiesService.create(createPropertyDto);
  }
  
  @Get()
  findAll(@Query() query: any) {
    // Logs removidos para produção, mas se quiser debug descomente:
    // console.log("Filtros:", query);
    return this.propertiesService.findAll(query);
  }
  @Get('trigger-scraper')
  async triggerScraper() {
    // Não use await aqui se quiser que rode em background e retorne logo
    this.scraperService.scrapeLegacySystem();
    return { message: "Robô iniciado! Verifique o terminal do Backend." };
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    const numId = Number(id);
    
    // Se não for um número válido, retorna erro antes de quebrar o Prisma
    if (isNaN(numId)) {
        throw new BadRequestException(`ID inválido: ${id}`);
    }
    
    return this.propertiesService.findOne(numId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePropertyDto: UpdatePropertyDto) {
    return this.propertiesService.update(+id, updatePropertyDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.propertiesService.remove(+id);
  }

  @Post('import-dwv')
  async importDwv(@Body() body: any) {
    if (!body || !body.url || typeof body.url !== 'string') {
        throw new BadRequestException("Envie { url: 'texto...' }");
    }
    return this.propertiesService.importFromDwv(body.url);

  }
  
}