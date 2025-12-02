"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertiesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let PropertiesService = class PropertiesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createPropertyDto) {
        const { address, features, images, paymentConditions, constructionStartDate, deliveryDate, ...propertyData } = createPropertyDto;
        return await this.prisma.property.create({
            data: {
                ...propertyData,
                constructionStartDate: constructionStartDate ? new Date(constructionStartDate) : undefined,
                deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
                address: address ? {
                    create: {
                        street: address.street,
                        number: address.number,
                        complement: address.complement,
                        neighborhood: address.neighborhood,
                        city: address.city,
                        state: address.state,
                        zipCode: address.zipCode
                    }
                } : undefined,
                features: features && features?.length > 0 ? {
                    connectOrCreate: features.map((featureName) => ({
                        where: { name: featureName },
                        create: { name: featureName },
                    })),
                } : undefined,
                images: images && images?.length > 0 ? {
                    createMany: {
                        data: images.map((img) => ({
                            url: img.url,
                            isCover: img.isCover || false,
                        })),
                    },
                } : undefined,
                paymentConditions: paymentConditions && paymentConditions?.length > 0 ? {
                    createMany: {
                        data: paymentConditions.map((cond) => ({
                            description: cond.description,
                            value: cond.value,
                        })),
                    },
                } : undefined,
            },
            include: {
                address: true,
                features: true,
                images: true,
                paymentConditions: true,
            }
        });
    }
    async findAll() {
        return this.prisma.property.findMany({
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                title: true,
                subtitle: true,
                price: true,
                category: true,
                status: true,
                createdAt: true,
                address: {
                    select: { city: true, state: true, neighborhood: true }
                },
                images: {
                    where: { isCover: true },
                    take: 1,
                    select: { url: true, isCover: true }
                }
            },
        });
    }
    async findOne(id) {
        return this.prisma.property.findUnique({
            where: { id },
            include: {
                address: true,
                images: true,
                features: true,
                paymentConditions: true
            }
        });
    }
    async update(id, updatePropertyDto) {
        await this.findOne(id);
        const { address, features, images, paymentConditions, ...propertyData } = updatePropertyDto;
        return this.prisma.property.update({
            where: { id: id, },
            data: {
                ...propertyData,
                address: address ? {
                    upsert: {
                        create: { ...address },
                        update: { ...address },
                    },
                } : undefined,
                features: features ? {
                    set: [],
                    connectOrCreate: features.map((f) => ({
                        where: { name: f },
                        create: { name: f },
                    })),
                } : undefined,
                paymentConditions: paymentConditions ? {
                    deleteMany: {},
                    createMany: {
                        data: paymentConditions.map(p => ({
                            description: p.description,
                            value: p.value
                        }))
                    }
                } : undefined,
                images: images && images?.length > 0 ? {
                    createMany: {
                        data: images.map((img) => ({
                            url: img.url,
                            isCover: img.isCover || false,
                        })),
                    },
                } : undefined,
            },
            include: {
                address: true,
                features: true,
                images: true,
                paymentConditions: true,
            },
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.property.delete({
            where: { id }
        });
    }
};
exports.PropertiesService = PropertiesService;
exports.PropertiesService = PropertiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PropertiesService);
//# sourceMappingURL=properties.service.js.map