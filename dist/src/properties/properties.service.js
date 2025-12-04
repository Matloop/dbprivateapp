"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertiesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const create_property_dto_1 = require("./dto/create-property.dto");
const cheerio = __importStar(require("cheerio"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const sharp_1 = __importDefault(require("sharp"));
const axios_1 = __importDefault(require("axios"));
let PropertiesService = class PropertiesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createPropertyDto) {
        if (createPropertyDto.url && (!createPropertyDto.title || createPropertyDto.title === 'Imóvel sem Título')) {
            return this.importFromDwv(createPropertyDto.url);
        }
        const { address, roomFeatures, propertyFeatures, developmentFeatures, images, paymentConditions, constructionStartDate, deliveryDate, url, category, ...propertyData } = createPropertyDto;
        const safePrice = isNaN(Number(propertyData.price)) ? 0 : Number(propertyData.price);
        const safePrivateArea = isNaN(Number(propertyData.privateArea)) ? 0 : Number(propertyData.privateArea);
        const safeTitle = (propertyData.title && propertyData.title.trim() !== '') ? propertyData.title : 'Imóvel Importado';
        const safeCategory = category || create_property_dto_1.PropertyCategory.APARTAMENTO;
        return await this.prisma.property.create({
            data: {
                ...propertyData,
                title: safeTitle,
                category: safeCategory,
                price: safePrice,
                privateArea: safePrivateArea,
                totalArea: propertyData.totalArea ? Number(propertyData.totalArea) : undefined,
                garageArea: propertyData.garageArea ? Number(propertyData.garageArea) : undefined,
                constructionStartDate: constructionStartDate ? new Date(constructionStartDate) : undefined,
                deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
                address: address ? {
                    create: {
                        street: address.street || 'Não informada', number: address.number || 'S/N',
                        neighborhood: address.neighborhood || 'Centro', city: address.city || 'Balneário Camboriú',
                        state: address.state || 'SC', zipCode: address.zipCode || '88330-000', complement: address.complement || ''
                    }
                } : undefined,
                roomFeatures: (roomFeatures && roomFeatures.length > 0) ? {
                    connectOrCreate: roomFeatures.map(name => ({ where: { name }, create: { name } }))
                } : undefined,
                propertyFeatures: (propertyFeatures && propertyFeatures.length > 0) ? {
                    connectOrCreate: propertyFeatures.map(name => ({ where: { name }, create: { name } }))
                } : undefined,
                developmentFeatures: (developmentFeatures && developmentFeatures.length > 0) ? {
                    connectOrCreate: developmentFeatures.map(name => ({ where: { name }, create: { name } }))
                } : undefined,
                images: (images && images.length > 0) ? {
                    createMany: { data: images.map(img => ({ url: img.url, isCover: img.isCover || false })) }
                } : undefined,
                paymentConditions: (paymentConditions && paymentConditions.length > 0) ? {
                    createMany: { data: paymentConditions.map(c => ({ description: c.description, value: c.value })) }
                } : undefined,
            },
            include: { address: true, images: true }
        });
    }
    async findAll(filters) {
        const where = {};
        if (filters?.search) {
            const searchVal = filters.search.trim();
            if (!isNaN(Number(searchVal)))
                where.OR = [{ id: Number(searchVal) }];
            else
                where.OR = [
                    { title: { contains: searchVal, mode: 'insensitive' } },
                    { buildingName: { contains: searchVal, mode: 'insensitive' } },
                    { oldRef: { contains: searchVal, mode: 'insensitive' } }
                ];
        }
        if (filters?.city)
            where.address = { ...where.address, city: { contains: filters.city, mode: 'insensitive' } };
        if (filters?.neighborhood)
            where.address = { ...where.address, neighborhood: { contains: filters.neighborhood, mode: 'insensitive' } };
        if (filters?.minPrice)
            where.price = { ...where.price, gte: Number(filters.minPrice) };
        if (filters?.maxPrice)
            where.price = { ...where.price, lte: Number(filters.maxPrice) };
        if (filters?.minArea || filters?.maxArea) {
            where.privateArea = {};
            if (filters.minArea)
                where.privateArea.gte = Number(filters.minArea);
            if (filters.maxArea)
                where.privateArea.lte = Number(filters.maxArea);
        }
        if (filters?.garageSpots)
            where.garageSpots = { gte: Number(filters.garageSpots) };
        if (filters?.bedrooms)
            where.bedrooms = { gte: Number(filters.bedrooms) };
        if (filters?.types) {
            const types = Array.isArray(filters.types) ? filters.types : [filters.types];
            const cleanTypes = types.filter((t) => t !== '');
            if (cleanTypes.length > 0)
                where.category = { in: cleanTypes };
        }
        if (filters?.negotiation) {
            const negs = Array.isArray(filters.negotiation) ? filters.negotiation : [filters.negotiation];
            if (negs.includes('exclusivo'))
                where.isExclusive = true;
            if (negs.includes('permuta'))
                where.acceptsTrade = true;
            if (negs.includes('financiamento'))
                where.acceptsFinancing = true;
            if (negs.includes('veiculo'))
                where.acceptsVehicle = true;
        }
        if (filters?.stage)
            where.constructionStage = filters.stage;
        return this.prisma.property.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true, title: true, price: true, category: true, status: true,
                bedrooms: true, bathrooms: true, garageSpots: true,
                privateArea: true, totalArea: true,
                badgeText: true, badgeColor: true, buildingName: true,
                constructionStage: true,
                address: { select: { city: true, neighborhood: true, state: true } },
                images: { take: 30, select: { url: true, isCover: true }, orderBy: { isCover: 'desc' } },
                createdAt: true, updatedAt: true
            }
        });
    }
    async findOne(id) {
        if (!id || isNaN(id))
            throw new common_1.NotFoundException(`ID inválido.`);
        const property = await this.prisma.property.findUnique({
            where: { id },
            include: {
                address: true, images: true, roomFeatures: true, propertyFeatures: true, developmentFeatures: true, paymentConditions: true
            }
        });
        if (!property)
            throw new common_1.NotFoundException(`Imóvel #${id} não encontrado`);
        return property;
    }
    async update(id, updatePropertyDto) {
        await this.findOne(id);
        const { id: _id, addressId, createdAt, updatedAt, address, roomFeatures, propertyFeatures, developmentFeatures, images, paymentConditions, constructionStartDate, deliveryDate, url, ...propertyData } = updatePropertyDto;
        return this.prisma.property.update({
            where: { id: Number(id) },
            data: {
                ...propertyData,
                price: propertyData.price ? Number(propertyData.price) : undefined,
                promotionalPrice: propertyData.promotionalPrice ? Number(propertyData.promotionalPrice) : undefined,
                condoFee: propertyData.condoFee ? Number(propertyData.condoFee) : undefined,
                iptuPrice: propertyData.iptuPrice ? Number(propertyData.iptuPrice) : undefined,
                bedrooms: propertyData.bedrooms ? Number(propertyData.bedrooms) : undefined,
                suites: propertyData.suites ? Number(propertyData.suites) : undefined,
                bathrooms: propertyData.bathrooms ? Number(propertyData.bathrooms) : undefined,
                garageSpots: propertyData.garageSpots ? Number(propertyData.garageSpots) : undefined,
                privateArea: propertyData.privateArea ? Number(propertyData.privateArea) : undefined,
                totalArea: propertyData.totalArea ? Number(propertyData.totalArea) : undefined,
                garageArea: propertyData.garageArea ? Number(propertyData.garageArea) : undefined,
                constructionStartDate: constructionStartDate ? new Date(constructionStartDate) : undefined,
                deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
                address: address ? {
                    upsert: {
                        create: {
                            street: address.street || '', number: address.number || 'S/N',
                            neighborhood: address.neighborhood || '', city: address.city || '',
                            state: address.state || 'SC', zipCode: address.zipCode || '',
                            complement: address.complement
                        },
                        update: {
                            street: address.street, number: address.number, neighborhood: address.neighborhood,
                            city: address.city, state: address.state, zipCode: address.zipCode, complement: address.complement
                        },
                    },
                } : undefined,
                roomFeatures: roomFeatures ? { set: [], connectOrCreate: roomFeatures.map((f) => ({ where: { name: f }, create: { name: f } })) } : undefined,
                propertyFeatures: propertyFeatures ? { set: [], connectOrCreate: propertyFeatures.map((f) => ({ where: { name: f }, create: { name: f } })) } : undefined,
                developmentFeatures: developmentFeatures ? { set: [], connectOrCreate: developmentFeatures.map((f) => ({ where: { name: f }, create: { name: f } })) } : undefined,
                images: images ? {
                    deleteMany: {},
                    createMany: { data: images.map((img) => ({ url: img.url, isCover: img.isCover || false })) }
                } : undefined,
            },
            include: { address: true, images: true }
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.property.delete({ where: { id } });
    }
    async importFromDwv(inputText) {
        console.log(`--- IMPORT DWV START ---`);
        if (!inputText || typeof inputText !== 'string')
            throw new common_1.BadRequestException("Texto inválido.");
        const urlMatch = inputText.match(/https?:\/\/[^\s]+/);
        if (!urlMatch)
            throw new common_1.BadRequestException("Link não encontrado.");
        const dwvUrl = urlMatch[0];
        let addressText = inputText.replace(dwvUrl, '').trim().replace(/[\n\r]+/g, ' ').replace(/[,.-]+$/, '').trim();
        let street = 'Não informado', number = 'S/N';
        const numberMatch = addressText.match(/(\d+)(?!.*\d)/);
        if (numberMatch) {
            number = numberMatch[0];
            street = addressText.includes(',') ? addressText.split(',')[0].trim() : addressText.replace(number, '').trim();
        }
        else {
            street = addressText || 'Endereço não detectado';
        }
        street = street.replace(/[-–].*$/, '').trim();
        let html = '';
        try {
            const response = await axios_1.default.get(dwvUrl, { headers: { 'User-Agent': 'Mozilla/5.0 Chrome/120.0' }, timeout: 15000 });
            html = response.data;
        }
        catch (e) {
            throw new common_1.BadRequestException(`Erro DWV: ${e.message}`);
        }
        const $ = cheerio.load(html);
        let price = 0;
        $('h1, h2').each((_, el) => {
            const txt = $(el).text();
            if (txt.includes('R$') && price === 0)
                price = parseFloat(txt.replace(/[^\d,]/g, '').replace(',', '.'));
        });
        let buildingName = '';
        const h2Text = $('h2').first().text().trim();
        const pTorre = $('h2').first().next('p').text().trim();
        if (h2Text && pTorre)
            buildingName = `Unidade ${h2Text} - ${pTorre}`;
        else
            buildingName = $('title').text().trim();
        const extractByAlt = (altKeywords) => {
            let val = 0;
            $('img').each((_, el) => {
                const alt = $(el).attr('alt')?.toLowerCase() || '';
                if (altKeywords.some(k => alt.includes(k))) {
                    const h2 = $(el).parent().find('h2').text().trim();
                    if (h2) {
                        const num = parseFloat(h2.replace('m²', '').replace(',', '.'));
                        if (!isNaN(num))
                            val = num;
                    }
                }
            });
            return val;
        };
        const bedrooms = extractByAlt(['dorm', 'quarto']);
        const suites = extractByAlt(['suíte']);
        const bathrooms = extractByAlt(['banheiro']);
        const garageSpots = extractByAlt(['garagem', 'vaga', 'carro']);
        const privateArea = extractByAlt(['área privada', 'privativos', 'privativa']);
        const totalArea = extractByAlt(['área total']);
        const propertyFeatures = [];
        const developmentFeatures = [];
        const roomFeatures = [];
        const devKeywords = ['piscina', 'academia', 'fitness', 'salão', 'hall', 'elevador', 'playground', 'brinquedoteca', 'quadra', 'spa', 'sauna', 'cinema', 'game', 'pub', 'bar', 'rooftop', 'heliponto', 'box', 'bicicletário', 'pet', 'coworking', 'medidores', 'gerador', 'portaria', 'zelador'];
        const roomKeywords = ['sala', 'cozinha', 'suíte', 'dormitório', 'banheiro', 'lavabo', 'área de serviço', 'sacada', 'varanda', 'living', 'closet', 'copa', 'terraço', 'dependência', 'bwc', 'quarto', 'escritório', 'home office'];
        const ignoreList = [
            'galeria', 'torre', 'previsão', 'entrega', 'entrada', 'parcelamento', 'reforço', 'financiamento',
            'dorm.', 'vagas', 'privativos', 'área total', 'banheiros', 'suítes', 'm²',
            'fazer contra-proposta', 'unidade', 'empreendimento', 'gmail', 'hotmail', 'creci', 'contato', 'telefone'
        ];
        $('li').each((_, el) => {
            const txt = $(el).text().trim();
            const lower = txt.toLowerCase();
            if (txt.length < 3)
                return;
            if (txt.length > 60)
                return;
            if (txt.includes('R$'))
                return;
            if (ignoreList.some(badWord => lower.includes(badWord)))
                return;
            if (devKeywords.some(k => lower.includes(k))) {
                developmentFeatures.push(txt);
            }
            else if (roomKeywords.some(k => lower.includes(k))) {
                roomFeatures.push(txt);
            }
            else {
                propertyFeatures.push(txt);
            }
        });
        const paymentConditions = [];
        $('h3').each((_, el) => {
            const label = $(el).text().trim();
            const container = $(el).closest('div').parent();
            const valueText = container.find('p').first().text().trim();
            if (['entrada', 'parcelas', 'reforço', 'financiamento'].some(k => label.toLowerCase().includes(k)) && valueText) {
                paymentConditions.push({ description: `${label}: ${valueText}`, value: 0 });
            }
        });
        const uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadDir))
            fs.mkdirSync(uploadDir, { recursive: true });
        const regex = /https?:\/\/[^"'\s>]+\.(?:jpg|png|jpeg|webp)/gi;
        const matches = html.match(regex) || [];
        const uniqueUrls = [...new Set(matches)].filter(u => !u.includes('svg') && !u.includes('icon') && !u.includes('logo') && u.length > 25);
        const urlsToProcess = uniqueUrls.slice(0, 30);
        const processedImages = [];
        for (const url of urlsToProcess) {
            try {
                const res = await axios_1.default.get(url, { responseType: 'arraybuffer', timeout: 5000 });
                if (res.data.length < 5000)
                    continue;
                const fname = `dwv-${Date.now()}-${Math.floor(Math.random() * 10000)}.jpg`;
                await (0, sharp_1.default)(res.data).resize(1280, 960, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 80 }).toFile(path.join(uploadDir, fname));
                processedImages.push({
                    url: `http://127.0.0.1:3000/uploads/${fname}`,
                    isCover: processedImages.length === 0
                });
            }
            catch { }
        }
        let title = $('h1').first().text().trim() || $('title').text().trim();
        if (title.length > 80)
            title = "Imóvel Importado DWV";
        const createDto = {
            title: title,
            subtitle: 'Balneário Camboriú',
            category: create_property_dto_1.PropertyCategory.APARTAMENTO,
            transactionType: create_property_dto_1.TransactionType.VENDA,
            status: create_property_dto_1.PropertyStatus.DISPONIVEL,
            price, bedrooms, suites, garageSpots, privateArea, totalArea,
            bathrooms: (bathrooms > 0) ? bathrooms : (suites + 1),
            description: `Importado de: ${dwvUrl}`,
            address: { street, number, neighborhood: 'Centro', city: 'Balneário Camboriú', state: 'SC', zipCode: '88330-000', complement: '' },
            buildingName: buildingName,
            isFurnished: propertyFeatures.some(f => f.toLowerCase().includes('mobiliado')),
            roomFeatures: [...new Set(roomFeatures)],
            propertyFeatures: [...new Set(propertyFeatures)],
            developmentFeatures: [...new Set(developmentFeatures)],
            paymentConditions,
            images: processedImages
        };
        console.log(`💾 Salvando: ${createDto.title} | ${processedImages.length} fotos | ${propertyFeatures.length + roomFeatures.length + developmentFeatures.length} caracteristicas`);
        return this.create(createDto);
    }
};
exports.PropertiesService = PropertiesService;
exports.PropertiesService = PropertiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PropertiesService);
//# sourceMappingURL=properties.service.js.map