import { PrismaService } from 'prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
export declare class PropertiesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createPropertyDto: CreatePropertyDto): Promise<{
        address: {
            number: string;
            street: string;
            complement: string | null;
            neighborhood: string;
            city: string;
            state: string;
            zipCode: string;
            id: number;
        } | null;
        features: {
            id: number;
            name: string;
        }[];
        images: {
            url: string;
            isCover: boolean;
            id: number;
            propertyId: number;
        }[];
        paymentConditions: {
            description: string;
            value: import("@prisma/client/runtime/library").Decimal | null;
            id: number;
            propertyId: number;
        }[];
    } & {
        description: string | null;
        title: string;
        subtitle: string | null;
        category: import(".prisma/client").$Enums.PropertyCategory;
        transactionType: import(".prisma/client").$Enums.TransactionType;
        exclusivityDocUrl: string | null;
        registrationNumber: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        condoFee: import("@prisma/client/runtime/library").Decimal | null;
        iptuPrice: import("@prisma/client/runtime/library").Decimal | null;
        bedrooms: number;
        suites: number;
        bathrooms: number;
        garageSpots: number;
        privateArea: number;
        totalArea: number | null;
        garageArea: number | null;
        constructionStartDate: Date | null;
        deliveryDate: Date | null;
        brokerNotes: string | null;
        status: import(".prisma/client").$Enums.PropertyStatus;
        isExclusive: boolean;
        showOnSite: boolean;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        addressId: number | null;
    }>;
    findAll(): Promise<{
        address: {
            neighborhood: string;
            city: string;
            state: string;
        } | null;
        title: string;
        subtitle: string | null;
        category: import(".prisma/client").$Enums.PropertyCategory;
        price: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.PropertyStatus;
        images: {
            url: string;
            isCover: boolean;
        }[];
        createdAt: Date;
        id: number;
    }[]>;
    findOne(id: number): Promise<{
        address: {
            number: string;
            street: string;
            complement: string | null;
            neighborhood: string;
            city: string;
            state: string;
            zipCode: string;
            id: number;
        } | null;
        features: {
            id: number;
            name: string;
        }[];
        images: {
            url: string;
            isCover: boolean;
            id: number;
            propertyId: number;
        }[];
        paymentConditions: {
            description: string;
            value: import("@prisma/client/runtime/library").Decimal | null;
            id: number;
            propertyId: number;
        }[];
    } & {
        description: string | null;
        title: string;
        subtitle: string | null;
        category: import(".prisma/client").$Enums.PropertyCategory;
        transactionType: import(".prisma/client").$Enums.TransactionType;
        exclusivityDocUrl: string | null;
        registrationNumber: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        condoFee: import("@prisma/client/runtime/library").Decimal | null;
        iptuPrice: import("@prisma/client/runtime/library").Decimal | null;
        bedrooms: number;
        suites: number;
        bathrooms: number;
        garageSpots: number;
        privateArea: number;
        totalArea: number | null;
        garageArea: number | null;
        constructionStartDate: Date | null;
        deliveryDate: Date | null;
        brokerNotes: string | null;
        status: import(".prisma/client").$Enums.PropertyStatus;
        isExclusive: boolean;
        showOnSite: boolean;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        addressId: number | null;
    }>;
    update(id: number, updatePropertyDto: any): Promise<{
        address: {
            number: string;
            street: string;
            complement: string | null;
            neighborhood: string;
            city: string;
            state: string;
            zipCode: string;
            id: number;
        } | null;
        features: {
            id: number;
            name: string;
        }[];
        images: {
            url: string;
            isCover: boolean;
            id: number;
            propertyId: number;
        }[];
        paymentConditions: {
            description: string;
            value: import("@prisma/client/runtime/library").Decimal | null;
            id: number;
            propertyId: number;
        }[];
    } & {
        description: string | null;
        title: string;
        subtitle: string | null;
        category: import(".prisma/client").$Enums.PropertyCategory;
        transactionType: import(".prisma/client").$Enums.TransactionType;
        exclusivityDocUrl: string | null;
        registrationNumber: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        condoFee: import("@prisma/client/runtime/library").Decimal | null;
        iptuPrice: import("@prisma/client/runtime/library").Decimal | null;
        bedrooms: number;
        suites: number;
        bathrooms: number;
        garageSpots: number;
        privateArea: number;
        totalArea: number | null;
        garageArea: number | null;
        constructionStartDate: Date | null;
        deliveryDate: Date | null;
        brokerNotes: string | null;
        status: import(".prisma/client").$Enums.PropertyStatus;
        isExclusive: boolean;
        showOnSite: boolean;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        addressId: number | null;
    }>;
    remove(id: number): Promise<{
        description: string | null;
        title: string;
        subtitle: string | null;
        category: import(".prisma/client").$Enums.PropertyCategory;
        transactionType: import(".prisma/client").$Enums.TransactionType;
        exclusivityDocUrl: string | null;
        registrationNumber: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        condoFee: import("@prisma/client/runtime/library").Decimal | null;
        iptuPrice: import("@prisma/client/runtime/library").Decimal | null;
        bedrooms: number;
        suites: number;
        bathrooms: number;
        garageSpots: number;
        privateArea: number;
        totalArea: number | null;
        garageArea: number | null;
        constructionStartDate: Date | null;
        deliveryDate: Date | null;
        brokerNotes: string | null;
        status: import(".prisma/client").$Enums.PropertyStatus;
        isExclusive: boolean;
        showOnSite: boolean;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        addressId: number | null;
    }>;
    importFromDwv(dwvUrl: string): Promise<{
        address: {
            number: string;
            street: string;
            complement: string | null;
            neighborhood: string;
            city: string;
            state: string;
            zipCode: string;
            id: number;
        } | null;
        features: {
            id: number;
            name: string;
        }[];
        images: {
            url: string;
            isCover: boolean;
            id: number;
            propertyId: number;
        }[];
        paymentConditions: {
            description: string;
            value: import("@prisma/client/runtime/library").Decimal | null;
            id: number;
            propertyId: number;
        }[];
    } & {
        description: string | null;
        title: string;
        subtitle: string | null;
        category: import(".prisma/client").$Enums.PropertyCategory;
        transactionType: import(".prisma/client").$Enums.TransactionType;
        exclusivityDocUrl: string | null;
        registrationNumber: string | null;
        price: import("@prisma/client/runtime/library").Decimal;
        condoFee: import("@prisma/client/runtime/library").Decimal | null;
        iptuPrice: import("@prisma/client/runtime/library").Decimal | null;
        bedrooms: number;
        suites: number;
        bathrooms: number;
        garageSpots: number;
        privateArea: number;
        totalArea: number | null;
        garageArea: number | null;
        constructionStartDate: Date | null;
        deliveryDate: Date | null;
        brokerNotes: string | null;
        status: import(".prisma/client").$Enums.PropertyStatus;
        isExclusive: boolean;
        showOnSite: boolean;
        createdAt: Date;
        updatedAt: Date;
        id: number;
        addressId: number | null;
    }>;
}
