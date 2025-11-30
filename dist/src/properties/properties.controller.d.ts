import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
export declare class PropertiesController {
    private readonly propertiesService;
    constructor(propertiesService: PropertiesService);
    create(createPropertyDto: CreatePropertyDto): Promise<{
        title: string;
        value: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        title: string;
        value: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }[]>;
    findOne(id: string): import(".prisma/client").Prisma.Prisma__ImovelClient<{
        title: string;
        value: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    } | null, null, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: string, updatePropertyDto: UpdatePropertyDto): import(".prisma/client").Prisma.Prisma__ImovelClient<{
        title: string;
        value: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: string): import(".prisma/client").Prisma.Prisma__ImovelClient<{
        title: string;
        value: import("@prisma/client/runtime/library").Decimal;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
