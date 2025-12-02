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
  IsUrl, 
  Min, 
  ValidateNested 
} from 'class-validator';

// 1. Enums (Precisam bater com o schema.prisma)
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

// 2. Sub-DTOs (Objetos aninhados)

class CreateAddressDto {
  @IsString()
  @IsNotEmpty()
  street: string;

  @IsString()
  @IsNotEmpty()
  number: string;

  @IsString()
  @IsOptional()
  complement?: string;

  @IsString()
  @IsNotEmpty()
  neighborhood: string;
  
  
  @IsString()
  @IsNotEmpty()
  city: string;

  @IsString()
  @IsNotEmpty()
  state: string; // Ex: "SC"

  @IsString()
  @IsNotEmpty()
  zipCode: string;
}

class CreateImageDto {
  @IsString()
  @IsNotEmpty()
  // @IsUrl() // Opcional: descomente se quiser validar formato de URL estrito
  url: string;
  @IsBoolean()
  @IsOptional()
  isCover?: boolean;
}

class CreatePaymentConditionDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsOptional()
  value?: number;
}

// 3. DTO Principal

export class CreatePropertyDto {
  // --- Informações Básicas ---
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  subtitle?: string;

  @IsEnum(PropertyCategory)
  @IsNotEmpty()
  category: PropertyCategory;

  @IsEnum(TransactionType)
  @IsOptional()
  transactionType?: TransactionType;

  @IsString()
  @IsOptional()
  exclusivityDocUrl?: string;

  @IsString()
  @IsOptional()
  registrationNumber?: string; // Nº Matrícula

  // --- Valores (Financeiro) ---
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  price: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0)
  condoFee?: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsOptional()
  @Min(0)
  iptuPrice?: number;

  // --- Características Numéricas ---
  @IsInt()
  @IsOptional()
  @Min(0)
  bedrooms?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  suites?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  bathrooms?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  garageSpots?: number;

  // --- Áreas ---
  @IsNumber()
  @IsNotEmpty() // Área privativa costuma ser obrigatória
  privateArea: number;

  @IsNumber()
  @IsOptional()
  totalArea?: number;

  @IsNumber()
  @IsOptional()
  garageArea?: number;

  // --- Datas ---
  // O @Type converte a string ISO ("2023-12-01") para objeto Date automaticamente
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  constructionStartDate?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  deliveryDate?: Date;

  // --- Textos Longos ---
  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  brokerNotes?: string;

  @IsEnum(PropertyStatus)
  @IsOptional()
  status?: PropertyStatus;

  // ==========================
  // --- OBJETOS ANINHADOS ---
  // ==========================

  // 1. Endereço (Objeto Único)
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateAddressDto)
  address?: CreateAddressDto;

  // 2. Features (Array de Strings)
  // O front manda: ["Piscina", "Academia", "Elevador"]
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];

  // 3. Imagens (Array de Objetos)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateImageDto)
  @IsOptional()
  images?: CreateImageDto[];

  // 4. Condições de Pagamento (Array de Objetos)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePaymentConditionDto)
  @IsOptional()
  paymentConditions?: CreatePaymentConditionDto[];
  @IsBoolean()
  isExclusive : boolean
  @IsBoolean()
  showOnSite  : boolean
}