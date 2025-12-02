import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
export declare class PropertiesController {
    private readonly propertiesService;
    constructor(propertiesService: PropertiesService);
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
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
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
    })[]>;
    findOne(id: string): Promise<({
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
    }) | null>;
    update(id: string, updatePropertyDto: UpdatePropertyDto): Promise<{
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
    remove(id: string): Promise<{
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
