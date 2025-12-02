import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
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
        features: {
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
            value: Prisma.Decimal | null;
        }[];
    } & {
        createdAt: Date;
        updatedAt: Date;
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
        price: Prisma.Decimal;
        condoFee: Prisma.Decimal | null;
        iptuPrice: Prisma.Decimal | null;
        description: string | null;
        brokerNotes: string | null;
        status: import(".prisma/client").$Enums.PropertyStatus;
        id: number;
        addressId: number | null;
    }>;
    findAll(): Promise<{
        createdAt: Date;
        title: string;
        subtitle: string | null;
        category: import(".prisma/client").$Enums.PropertyCategory;
        price: Prisma.Decimal;
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
    findOne(id: number): Promise<({
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
        features: {
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
            value: Prisma.Decimal | null;
        }[];
    } & {
        createdAt: Date;
        updatedAt: Date;
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
        price: Prisma.Decimal;
        condoFee: Prisma.Decimal | null;
        iptuPrice: Prisma.Decimal | null;
        description: string | null;
        brokerNotes: string | null;
        status: import(".prisma/client").$Enums.PropertyStatus;
        id: number;
        addressId: number | null;
    }) | null>;
    update(id: number, updatePropertyDto: UpdatePropertyDto): Promise<{
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
        features: {
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
            value: Prisma.Decimal | null;
        }[];
    } & {
        createdAt: Date;
        updatedAt: Date;
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
        price: Prisma.Decimal;
        condoFee: Prisma.Decimal | null;
        iptuPrice: Prisma.Decimal | null;
        description: string | null;
        brokerNotes: string | null;
        status: import(".prisma/client").$Enums.PropertyStatus;
        id: number;
        addressId: number | null;
    }>;
    remove(id: number): Promise<{
        createdAt: Date;
        updatedAt: Date;
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
        price: Prisma.Decimal;
        condoFee: Prisma.Decimal | null;
        iptuPrice: Prisma.Decimal | null;
        description: string | null;
        brokerNotes: string | null;
        status: import(".prisma/client").$Enums.PropertyStatus;
        id: number;
        addressId: number | null;
    }>;
}
