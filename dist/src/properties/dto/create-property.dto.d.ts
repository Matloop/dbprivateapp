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
    ALUGADO = "ALUGADO"
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
    category: PropertyCategory;
    transactionType?: TransactionType;
    exclusivityDocUrl?: string;
    registrationNumber?: string;
    price: number;
    condoFee?: number;
    iptuPrice?: number;
    bedrooms?: number;
    suites?: number;
    bathrooms?: number;
    garageSpots?: number;
    privateArea: number;
    totalArea?: number;
    garageArea?: number;
    constructionStartDate?: Date;
    deliveryDate?: Date;
    description?: string;
    brokerNotes?: string;
    status?: PropertyStatus;
    address?: CreateAddressDto;
    features?: string[];
    images?: CreateImageDto[];
    paymentConditions?: CreatePaymentConditionDto[];
    isExclusive: boolean;
    showOnSite: boolean;
}
export {};
