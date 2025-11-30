import { Controller, Get, Request, UseGuards } from "@nestjs/common";
import { PrismaService } from "prisma/prisma.service";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

@Controller('users')
export class UsersController {
    constructor(private readonly prisma: PrismaService) {}
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getProfile(@Request() req) {
        //O req foi preenchido pelo supabase strategy
        const userId = req.user.userId;

        const userProfile = await this.prisma.user.findUnique({
            where : {id: userId},
        })

        return userProfile;


    }
}