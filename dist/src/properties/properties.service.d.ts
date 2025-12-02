import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
export declare class PropertiesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createPropertyDto: CreatePropertyDto): Promise<{
        id: string;
        reference: string;
        oldReference: string | null;
        title: string;
        showOnSite: boolean;
        isExclusive: boolean;
        finality: string[];
        type: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Prisma.PrismaPromise<{
        id: string;
        reference: string;
        oldReference: string | null;
        title: string;
        showOnSite: boolean;
        isExclusive: boolean;
        finality: string[];
        type: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: number): Prisma.Prisma__PropertyClient<{
        id: string;
        reference: string;
        oldReference: string | null;
        title: string;
        showOnSite: boolean;
        isExclusive: boolean;
        finality: string[];
        type: string;
        createdAt: Date;
        updatedAt: Date;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: number, updatePropertyDto: UpdatePropertyDto): Prisma.Prisma__PropertyClient<{
        id: string;
        reference: string;
        oldReference: string | null;
        title: string;
        showOnSite: boolean;
        isExclusive: boolean;
        finality: string[];
        type: string;
        createdAt: Date;
        updatedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: number): any;
}
