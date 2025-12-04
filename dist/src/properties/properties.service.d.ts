import { PrismaService } from 'prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
export declare class PropertiesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
        title: string;
        subtitle: string | null;
        category: import(".prisma/client").$Enums.PropertyCategory;
        transactionType: import(".prisma/client").$Enums.TransactionType;
        exclusivityDocUrl: string | null;
        constructionStartDate: Date | null;
        deliveryDate: Date | null;
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
    findAll(): Promise<{
        createdAt: Date;
        updatedAt: Date;
        badgeText: string | null;
        badgeColor: string | null;
        title: string;
        subtitle: string | null;
        category: import(".prisma/client").$Enums.PropertyCategory;
        price: import("@prisma/client/runtime/library").Decimal;
        status: import(".prisma/client").$Enums.PropertyStatus;
        address: {
            state: string;
            city: string;
            neighborhood: string;
        } | null;
        images: {
            url: string;
            isCover: boolean;
        }[];
        id: number;
    }[]>;
    findOne(id: number): Promise<{
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
        title: string;
        subtitle: string | null;
        category: import(".prisma/client").$Enums.PropertyCategory;
        transactionType: import(".prisma/client").$Enums.TransactionType;
        exclusivityDocUrl: string | null;
        constructionStartDate: Date | null;
        deliveryDate: Date | null;
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
    update(id: number, updatePropertyDto: any): Promise<{
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
        title: string;
        subtitle: string | null;
        category: import(".prisma/client").$Enums.PropertyCategory;
        transactionType: import(".prisma/client").$Enums.TransactionType;
        exclusivityDocUrl: string | null;
        constructionStartDate: Date | null;
        deliveryDate: Date | null;
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
    remove(id: number): Promise<{
        createdAt: Date;
        updatedAt: Date;
        badgeText: string | null;
        badgeColor: string | null;
        showOnSite: boolean;
        isExclusive: boolean;
        title: string;
        subtitle: string | null;
        category: import(".prisma/client").$Enums.PropertyCategory;
        transactionType: import(".prisma/client").$Enums.TransactionType;
        exclusivityDocUrl: string | null;
        constructionStartDate: Date | null;
        deliveryDate: Date | null;
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
    importFromDwv(inputText: string): Promise<{
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
        title: string;
        subtitle: string | null;
        category: import(".prisma/client").$Enums.PropertyCategory;
        transactionType: import(".prisma/client").$Enums.TransactionType;
        exclusivityDocUrl: string | null;
        constructionStartDate: Date | null;
        deliveryDate: Date | null;
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
    private mapStateToAbbreviation;
}
