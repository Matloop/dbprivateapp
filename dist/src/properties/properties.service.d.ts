import { Prisma } from '@prisma/client';
import { PrismaService } from 'prisma/prisma.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
export declare class PropertiesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    create(createPropertyDto: CreatePropertyDto): Promise<{
        title: string;
        value: Prisma.Decimal;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
    findAll(): Prisma.PrismaPromise<{
        title: string;
        value: Prisma.Decimal;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }[]>;
    findOne(id: number): Prisma.Prisma__ImovelClient<{
        title: string;
        value: Prisma.Decimal;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: number, updatePropertyDto: UpdatePropertyDto): Prisma.Prisma__ImovelClient<{
        title: string;
        value: Prisma.Decimal;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: number): Prisma.Prisma__ImovelClient<{
        title: string;
        value: Prisma.Decimal;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
