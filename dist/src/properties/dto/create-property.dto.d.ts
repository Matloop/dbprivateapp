export declare enum PropertyCategory {
    APARTAMENTO = "APARTAMENTO",
    CASA = "CASA",
    GALPAO = "GALPAO",
    SALA_COMERCIAL = "SALA_COMERCIAL",
    COBERTURA = "COBERTURA",
    SITIO = "SITIO",
    VEICULO = "VEICULO",
    HOTEL = "HOTEL",
    DIFERENCIADO = "DIFERENCIADO",
    EMBARCACAO = "EMBARCACAO",
    TERRENO = "TERRENO"
}
export declare enum TransactionType {
    VENDA = "VENDA",
    LOCACAO = "LOCACAO"
}
export declare enum PropertyStatus {
    DISPONIVEL = "DISPONIVEL",
    RESERVADO = "RESERVADO",
    VENDIDO = "VENDIDO",
    ALUGADO = "ALUGADO",
    NAO_DISPONIVEL = "NAO_DISPONIVEL"
}
export declare enum ConstructionStage {
    LANCAMENTO = "LANCAMENTO",
    EM_OBRA = "EM_OBRA",
    PRONTO = "PRONTO"
}
declare class CreateAddressDto {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
}
declare class CreateImageDto {
    url: string;
    isCover?: boolean;
}
declare class CreatePaymentConditionDto {
    description: string;
    value?: number;
}
export declare class CreatePropertyDto {
    title: string;
    subtitle?: string;
    oldRef?: string;
    category: PropertyCategory;
    transactionType?: TransactionType;
    status?: PropertyStatus;
    constructionStage?: ConstructionStage;
    isSale?: boolean;
    isRentAnnual?: boolean;
    isRentSeason?: boolean;
    isRentStudent?: boolean;
    isExclusive?: boolean;
    showOnSite?: boolean;
    hasSign?: boolean;
    isSeaFront?: boolean;
    isSeaQuadra?: boolean;
    isDifferentiated?: boolean;
    isHighStandard?: boolean;
    isFurnished?: boolean;
    isSemiFurnished?: boolean;
    isUnfurnished?: boolean;
    acceptsTrade?: boolean;
    acceptsFinancing?: boolean;
    acceptsVehicle?: boolean;
    acceptsConstructionFinancing?: boolean;
    isMcmv?: boolean;
    badgeText?: string;
    badgeColor?: string;
    buildingName?: string;
    condoManager?: string;
    buildingAdministrator?: string;
    constructionCompany?: string;
    price: number;
    promotionalPrice?: number;
    condoFee?: number;
    iptuPrice?: number;
    bedrooms?: number;
    suites?: number;
    bathrooms?: number;
    garageSpots?: number;
    garageType?: string;
    solarPosition?: string;
    relativePosition?: string;
    privateArea: number;
    totalArea?: number;
    garageArea?: number;
    constructionStartDate?: Date;
    deliveryDate?: Date;
    description?: string;
    brokerNotes?: string;
    registrationNumber?: string;
    exclusivityDocUrl?: string;
    ownerName?: string;
    ownerPhone?: string;
    ownerEmail?: string;
    keysLocation?: string;
    exclusivitySigned?: boolean;
    videoUrl?: string;
    tourUrl?: string;
    roomFeatures?: string[];
    propertyFeatures?: string[];
    developmentFeatures?: string[];
    address?: CreateAddressDto;
    images?: CreateImageDto[];
    paymentConditions?: CreatePaymentConditionDto[];
}
export {};
