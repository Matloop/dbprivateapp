import { Type } from 'class-transformer';
import { 
  IsArray, 
  IsBoolean, 
  IsDate, 
  IsEnum, 
  IsInt, 
  IsNotEmpty, 
  IsNumber, 
  IsOptional, 
  IsString, 
  Min, 
  ValidateNested 
} from 'class-validator';

// ENUMS (Precisam estar sincronizados com o Prisma)
export enum PropertyCategory {
  APARTAMENTO = 'APARTAMENTO',
  CASA = 'CASA',
  GALPAO = 'GALPAO',
  SALA_COMERCIAL = 'SALA_COMERCIAL',
  COBERTURA = 'COBERTURA',
  SITIO = 'SITIO',
  VEICULO = 'VEICULO',
  HOTEL = 'HOTEL',
  DIFERENCIADO = 'DIFERENCIADO',
  EMBARCACAO = 'EMBARCACAO',
  TERRENO = 'TERRENO',
}

export enum TransactionType {
  VENDA = 'VENDA',
  LOCACAO = 'LOCACAO',
}

export enum PropertyStatus {
  DISPONIVEL = 'DISPONIVEL',
  RESERVADO = 'RESERVADO',
  VENDIDO = 'VENDIDO',
  ALUGADO = 'ALUGADO',
}

// SUB-DTOS

class CreateAddressDto {
  @IsString() @IsNotEmpty() street: string;
  @IsString() @IsNotEmpty() number: string;
  @IsString() @IsOptional() complement?: string;
  @IsString() @IsNotEmpty() neighborhood: string;
  @IsString() @IsNotEmpty() city: string;
  @IsString() @IsNotEmpty() state: string;
  @IsString() @IsNotEmpty() zipCode: string;
}

class CreateImageDto {
  @IsString() @IsNotEmpty() url: string;
  @IsBoolean() @IsOptional() isCover?: boolean;
}

class CreatePaymentConditionDto {
  @IsString() @IsNotEmpty() description: string;
  @IsNumber() @IsOptional() value?: number;
}

// DTO PRINCIPAL

export class CreatePropertyDto {

  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsOptional() subtitle?: string;
  
  @IsEnum(PropertyCategory) @IsNotEmpty() category: PropertyCategory;
  @IsEnum(TransactionType) @IsOptional() transactionType?: TransactionType;
  
  @IsBoolean() isExclusive: boolean;
  @IsBoolean() showOnSite: boolean;

  @IsString()
  @IsOptional()
  buildingName?: string;
  
  @IsString() @IsOptional() exclusivityDocUrl?: string;
  @IsString() @IsOptional() registrationNumber?: string;

  // Valores
  @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) price: number;
  @IsNumber({ maxDecimalPlaces: 2 }) @IsOptional() @Min(0) condoFee?: number;
  @IsNumber({ maxDecimalPlaces: 2 }) @IsOptional() @Min(0) iptuPrice?: number;

  // Numéricos
  @IsInt() @IsOptional() @Min(0) bedrooms?: number;
  @IsInt() @IsOptional() @Min(0) suites?: number;
  @IsInt() @IsOptional() @Min(0) bathrooms?: number;
  @IsInt() @IsOptional() @Min(0) garageSpots?: number;

  // Áreas
  @IsNumber() privateArea: number;
  @IsNumber() @IsOptional() totalArea?: number;
  @IsNumber() @IsOptional() garageArea?: number;

  // Datas
  @IsDate() @IsOptional() @Type(() => Date) constructionStartDate?: Date;
  @IsDate() @IsOptional() @Type(() => Date) deliveryDate?: Date;

  // Textos
  @IsString() @IsOptional() description?: string;
  @IsString() @IsOptional() brokerNotes?: string;
  @IsEnum(PropertyStatus) @IsOptional() status?: PropertyStatus;

  // --- RELACIONAMENTOS ---

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address?: CreateAddressDto;

  // Características do Imóvel (Privativas)
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  propertyFeatures?: string[];

  @IsString()
  @IsOptional()
  badgeText?: string;

  @IsString()
  @IsOptional()
  badgeColor?: string;

  // Características do Empreendimento (Comuns)
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  developmentFeatures?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateImageDto)
  @IsOptional()
  images?: CreateImageDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePaymentConditionDto)
  @IsOptional()
  paymentConditions?: CreatePaymentConditionDto[];
}