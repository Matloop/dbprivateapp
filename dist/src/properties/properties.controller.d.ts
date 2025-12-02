import { PropertiesService } from './properties.service';
import { CreatePropertyDto } from './dto/create-property.dto';
import { UpdatePropertyDto } from './dto/update-property.dto';
export declare class PropertiesController {
    private readonly propertiesService;
    constructor(propertiesService: PropertiesService);
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
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
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
    findOne(id: string): import(".prisma/client").Prisma.Prisma__PropertyClient<{
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
    update(id: string, updatePropertyDto: UpdatePropertyDto): import(".prisma/client").Prisma.Prisma__PropertyClient<{
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
    remove(id: string): any;
}
