import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
export declare class PropertiesController {
    private readonly propertiesService;
    constructor(propertiesService: PropertiesService);
    create(createPropertyDto: CreatePropertyDto): Promise<{
        address: {
            number: string;
            id: number;
            state: string;
            city: string;
            neighborhood: string;
            street: string;
            complement: string | null;
            zipCode: string;
        } | null;
        propertyFeatures: {
            id: number;
            name: string;
        }[];
        developmentFeatures: {
            id: number;
            name: string;
        }[];
        images: {
            id: number;
            url: string;
            isCover: boolean;
            propertyId: number;
        }[];
        paymentConditions: {
            description: string;
            id: number;
            propertyId: number;
            value: import("@prisma/client/runtime/library").Decimal | null;
        }[];
    } & {
        createdAt: Date;
        updatedAt: Date;
        badgeText: string | null;
        badgeColor: string | null;
        showOnSite: boolean;
        isExclusive: boolean;
        buildingName: string | null;
        title: string;
        subtitle: string | null;
        category: import(".prisma/client").$Enums.PropertyCategory;
        transactionType: import(".prisma/client").$Enums.TransactionType;
        exclusivityDocUrl: string | null;
        acceptsTrade: boolean;
        acceptsFinancing: boolean;
        acceptsVehicle: boolean;
        constructionStartDate: Date | null;
        deliveryDate: Date | null;
        constructionStage: import(".prisma/client").$Enums.ConstructionStage | null;
        bedrooms: number;
        suites: number;
        bathrooms: number;
        garageSpots: number;
        registrationNumber: string | null;
        garageArea: number | null;
        privateArea: number;
        totalArea: number | null;
        price: import("@prisma/client/runtime/library").Decimal;
        condoFee: import("@prisma/client/runtime/library").Decimal | null;
        iptuPrice: import("@prisma/client/runtime/library").Decimal | null;
        description: string | null;
        brokerNotes: string | null;
        status: import(".prisma/client").$Enums.PropertyStatus;
        id: number;
        addressId: number | null;
    }>;
    findAll(query: any): Promise<{
        badgeText: string | null;
        badgeColor: string | null;
        buildingName: string | null;
        title: string;
        category: import(".prisma/client").$Enums.PropertyCategory;
        constructionStage: import(".prisma/client").$Enums.ConstructionStage | null;
        bedrooms: number;
        bathrooms: number;
        garageSpots: number;
        privateArea: number;
        totalArea: number | null;
        price: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.PropertyStatus;
        address: {
            state: string;
            city: string;
            neighborhood: string;
        } | null;
        images: {
            url: string;
        }[];
        id: number;
    }[]>;
    findOne(id: string): Promise<{
        address: {
            number: string;
            id: number;
            state: string;
            city: string;
            neighborhood: string;
            street: string;
            complement: string | null;
            zipCode: string;
        } | null;
        propertyFeatures: {
            id: number;
            name: string;
        }[];
        developmentFeatures: {
            id: number;
            name: string;
        }[];
        images: {
            id: number;
            url: string;
            isCover: boolean;
            propertyId: number;
        }[];
        paymentConditions: {
            description: string;
            id: number;
            propertyId: number;
            value: import("@prisma/client/runtime/library").Decimal | null;
        }[];
    } & {
        createdAt: Date;
        updatedAt: Date;
        badgeText: string | null;
        badgeColor: string | null;
        showOnSite: boolean;
        isExclusive: boolean;
        buildingName: string | null;
        title: string;
        subtitle: string | null;
        category: import(".prisma/client").$Enums.PropertyCategory;
        transactionType: import(".prisma/client").$Enums.TransactionType;
        exclusivityDocUrl: string | null;
        acceptsTrade: boolean;
        acceptsFinancing: boolean;
        acceptsVehicle: boolean;
        constructionStartDate: Date | null;
        deliveryDate: Date | null;
        constructionStage: import(".prisma/client").$Enums.ConstructionStage | null;
        bedrooms: number;
        suites: number;
        bathrooms: number;
        garageSpots: number;
        registrationNumber: string | null;
        garageArea: number | null;
        privateArea: number;
        totalArea: number | null;
        price: import("@prisma/client/runtime/library").Decimal;
        condoFee: import("@prisma/client/runtime/library").Decimal | null;
        iptuPrice: import("@prisma/client/runtime/library").Decimal | null;
        description: string | null;
        brokerNotes: string | null;
        status: import(".prisma/client").$Enums.PropertyStatus;
        id: number;
        addressId: number | null;
    }>;
    update(id: string, updatePropertyDto: UpdatePropertyDto): Promise<{
        address: {
            number: string;
            id: number;
            state: string;
            city: string;
            neighborhood: string;
            street: string;
            complement: string | null;
            zipCode: string;
        } | null;
        propertyFeatures: {
            id: number;
            name: string;
        }[];
        developmentFeatures: {
            id: number;
            name: string;
        }[];
        images: {
            id: number;
            url: string;
            isCover: boolean;
            propertyId: number;
        }[];
        paymentConditions: {
            description: string;
            id: number;
            propertyId: number;
            value: import("@prisma/client/runtime/library").Decimal | null;
        }[];
    } & {
        createdAt: Date;
        updatedAt: Date;
        badgeText: string | null;
        badgeColor: string | null;
        showOnSite: boolean;
        isExclusive: boolean;
        buildingName: string | null;
        title: string;
        subtitle: string | null;
        category: import(".prisma/client").$Enums.PropertyCategory;
        transactionType: import(".prisma/client").$Enums.TransactionType;
        exclusivityDocUrl: string | null;
        acceptsTrade: boolean;
        acceptsFinancing: boolean;
        acceptsVehicle: boolean;
        constructionStartDate: Date | null;
        deliveryDate: Date | null;
        constructionStage: import(".prisma/client").$Enums.ConstructionStage | null;
        bedrooms: number;
        suites: number;
        bathrooms: number;
        garageSpots: number;
        registrationNumber: string | null;
        garageArea: number | null;
        privateArea: number;
        totalArea: number | null;
        price: import("@prisma/client/runtime/library").Decimal;
        condoFee: import("@prisma/client/runtime/library").Decimal | null;
        iptuPrice: import("@prisma/client/runtime/library").Decimal | null;
        description: string | null;
        brokerNotes: string | null;
        status: import(".prisma/client").$Enums.PropertyStatus;
        id: number;
        addressId: number | null;
    }>;
    remove(id: string): Promise<{
        createdAt: Date;
        updatedAt: Date;
        badgeText: string | null;
        badgeColor: string | null;
        showOnSite: boolean;
        isExclusive: boolean;
        buildingName: string | null;
        title: string;
        subtitle: string | null;
        category: import(".prisma/client").$Enums.PropertyCategory;
        transactionType: import(".prisma/client").$Enums.TransactionType;
        exclusivityDocUrl: string | null;
        acceptsTrade: boolean;
        acceptsFinancing: boolean;
        acceptsVehicle: boolean;
        constructionStartDate: Date | null;
        deliveryDate: Date | null;
        constructionStage: import(".prisma/client").$Enums.ConstructionStage | null;
        bedrooms: number;
        suites: number;
        bathrooms: number;
        garageSpots: number;
        registrationNumber: string | null;
        garageArea: number | null;
        privateArea: number;
        totalArea: number | null;
        price: import("@prisma/client/runtime/library").Decimal;
        condoFee: import("@prisma/client/runtime/library").Decimal | null;
        iptuPrice: import("@prisma/client/runtime/library").Decimal | null;
        description: string | null;
        brokerNotes: string | null;
        status: import(".prisma/client").$Enums.PropertyStatus;
        id: number;
        addressId: number | null;
    }>;
    importDwv(body: any): Promise<{
        address: {
            number: string;
            id: number;
            state: string;
            city: string;
            neighborhood: string;
            street: string;
            complement: string | null;
            zipCode: string;
        } | null;
        propertyFeatures: {
            id: number;
            name: string;
        }[];
        developmentFeatures: {
            id: number;
            name: string;
        }[];
        images: {
            id: number;
            url: string;
            isCover: boolean;
            propertyId: number;
        }[];
        paymentConditions: {
            description: string;
            id: number;
            propertyId: number;
            value: import("@prisma/client/runtime/library").Decimal | null;
        }[];
    } & {
        createdAt: Date;
        updatedAt: Date;
        badgeText: string | null;
        badgeColor: string | null;
        showOnSite: boolean;
        isExclusive: boolean;
        buildingName: string | null;
        title: string;
        subtitle: string | null;
        category: import(".prisma/client").$Enums.PropertyCategory;
        transactionType: import(".prisma/client").$Enums.TransactionType;
        exclusivityDocUrl: string | null;
        acceptsTrade: boolean;
        acceptsFinancing: boolean;
        acceptsVehicle: boolean;
        constructionStartDate: Date | null;
        deliveryDate: Date | null;
        constructionStage: import(".prisma/client").$Enums.ConstructionStage | null;
        bedrooms: number;
        suites: number;
        bathrooms: number;
        garageSpots: number;
        registrationNumber: string | null;
        garageArea: number | null;
        privateArea: number;
        totalArea: number | null;
        price: import("@prisma/client/runtime/library").Decimal;
        condoFee: import("@prisma/client/runtime/library").Decimal | null;
        iptuPrice: import("@prisma/client/runtime/library").Decimal | null;
        description: string | null;
        brokerNotes: string | null;
        status: import(".prisma/client").$Enums.PropertyStatus;
        id: number;
        addressId: number | null;
    }>;
}
