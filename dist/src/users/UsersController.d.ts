import { PrismaService } from "prisma/prisma.service";
export declare class UsersController {
    private readonly prisma;
    constructor(prisma: PrismaService);
    getProfile(req: any): Promise<{
        createdAt: Date;
        id: string;
        name: string | null;
        email: string;
    } | null>;
}
