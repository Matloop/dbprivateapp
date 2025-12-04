import { Type } from 'class-transformer';
import { 
  IsArray, IsBoolean, IsDate, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested 
} from 'class-validator';

// ENUMS (Mantive igual)
export enum PropertyCategory {
  APARTAMENTO = 'APARTAMENTO', CASA = 'CASA', GALPAO = 'GALPAO',
  SALA_COMERCIAL = 'SALA_COMERCIAL', COBERTURA = 'COBERTURA',
  SITIO = 'SITIO', VEICULO = 'VEICULO', HOTEL = 'HOTEL',
  DIFERENCIADO = 'DIFERENCIADO', EMBARCACAO = 'EMBARCACAO', TERRENO = 'TERRENO',
}

export enum TransactionType { VENDA = 'VENDA', LOCACAO = 'LOCACAO' }

export enum PropertyStatus {
  DISPONIVEL = 'DISPONIVEL', RESERVADO = 'RESERVADO',
  VENDIDO = 'VENDIDO', ALUGADO = 'ALUGADO', NAO_DISPONIVEL = 'NAO_DISPONIVEL'
}

export enum ConstructionStage {
  LANCAMENTO = 'LANCAMENTO', EM_OBRA = 'EM_OBRA', PRONTO = 'PRONTO'
}

// SUB-DTOS
class CreateAddressDto {
  // --- CORREÇÃO IMPORTANTE: Removi o '?' dos campos obrigatórios ---
  @IsString() @IsNotEmpty() street: string;      // Era street?: string
  @IsString() @IsNotEmpty() number: string;      // Era number?: string
  
  @IsString() @IsOptional() complement?: string; // Opcional no DB, mantém '?'
  
  @IsString() @IsNotEmpty() neighborhood: string; // Era neighborhood?: string
  @IsString() @IsNotEmpty() city: string;         // Era city?: string
  @IsString() @IsNotEmpty() state: string;        // Era state?: string
  @IsString() @IsNotEmpty() zipCode: string;      // Era zipCode?: string
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
  @IsString() @IsOptional() oldRef?: string;
  
  @IsEnum(PropertyCategory) @IsNotEmpty() category: PropertyCategory;
  @IsEnum(TransactionType) @IsOptional() transactionType?: TransactionType;
  @IsEnum(PropertyStatus) @IsOptional() status?: PropertyStatus;
  @IsEnum(ConstructionStage) @IsOptional() constructionStage?: ConstructionStage;

  // Booleanos (Opcionais)
  @IsBoolean() @IsOptional() isSale?: boolean;
  @IsBoolean() @IsOptional() isRentAnnual?: boolean;
  @IsBoolean() @IsOptional() isRentSeason?: boolean;
  @IsBoolean() @IsOptional() isRentStudent?: boolean;
  @IsBoolean() @IsOptional() isExclusive?: boolean;
  @IsBoolean() @IsOptional() showOnSite?: boolean;
  @IsBoolean() @IsOptional() hasSign?: boolean;
  @IsBoolean() @IsOptional() isSeaFront?: boolean;
  @IsBoolean() @IsOptional() isSeaQuadra?: boolean;
  @IsBoolean() @IsOptional() isDifferentiated?: boolean;
  @IsBoolean() @IsOptional() isHighStandard?: boolean;
  @IsBoolean() @IsOptional() isFurnished?: boolean;
  @IsBoolean() @IsOptional() isSemiFurnished?: boolean;
  @IsBoolean() @IsOptional() isUnfurnished?: boolean;
  @IsBoolean() @IsOptional() acceptsTrade?: boolean;
  @IsBoolean() @IsOptional() acceptsFinancing?: boolean;
  @IsBoolean() @IsOptional() acceptsVehicle?: boolean;
  @IsBoolean() @IsOptional() acceptsConstructionFinancing?: boolean;
  @IsBoolean() @IsOptional() isMcmv?: boolean;

  // Textos Opcionais
  @IsString() @IsOptional() badgeText?: string;
  @IsString() @IsOptional() badgeColor?: string;
  @IsString() @IsOptional() buildingName?: string;
  @IsString() @IsOptional() condoManager?: string;
  @IsString() @IsOptional() buildingAdministrator?: string;
  @IsString() @IsOptional() constructionCompany?: string;

  // Valores Numéricos
  @IsNumber() @Min(0) price: number;
  @IsNumber() @IsOptional() @Min(0) promotionalPrice?: number;
  @IsNumber() @IsOptional() @Min(0) condoFee?: number;
  @IsNumber() @IsOptional() @Min(0) iptuPrice?: number;

  @IsInt() @IsOptional() @Min(0) bedrooms?: number;
  @IsInt() @IsOptional() @Min(0) suites?: number;
  @IsInt() @IsOptional() @Min(0) bathrooms?: number;
  @IsInt() @IsOptional() @Min(0) garageSpots?: number;
  
  @IsString() @IsOptional() garageType?: string;
  @IsString() @IsOptional() solarPosition?: string;
  @IsString() @IsOptional() relativePosition?: string;

  @IsNumber() @IsOptional() privateArea: number;
  @IsNumber() @IsOptional() totalArea?: number;
  @IsNumber() @IsOptional() garageArea?: number;

  @IsDate() @IsOptional() @Type(() => Date) constructionStartDate?: Date;
  @IsDate() @IsOptional() @Type(() => Date) deliveryDate?: Date;

  @IsString() @IsOptional() description?: string;
  @IsString() @IsOptional() brokerNotes?: string;
  @IsString() @IsOptional() registrationNumber?: string;
  @IsString() @IsOptional() exclusivityDocUrl?: string;

  @IsString() @IsOptional() ownerName?: string;
  @IsString() @IsOptional() ownerPhone?: string;
  @IsString() @IsOptional() ownerEmail?: string;
  @IsString() @IsOptional() keysLocation?: string;
  @IsBoolean() @IsOptional() exclusivitySigned?: boolean;

  @IsString() @IsOptional() videoUrl?: string;
  @IsString() @IsOptional() tourUrl?: string;

  @IsArray() @IsString({ each: true }) @IsOptional() roomFeatures?: string[];
  @IsArray() @IsString({ each: true }) @IsOptional() propertyFeatures?: string[];
  @IsArray() @IsString({ each: true }) @IsOptional() developmentFeatures?: string[];

  // Relacionamentos
  @IsOptional() @ValidateNested() @Type(() => CreateAddressDto) address?: CreateAddressDto;
  @IsArray() @ValidateNested({ each: true }) @Type(() => CreateImageDto) @IsOptional() images?: CreateImageDto[];
  @IsArray() @ValidateNested({ each: true }) @Type(() => CreatePaymentConditionDto) @IsOptional() paymentConditions?: CreatePaymentConditionDto[];
}