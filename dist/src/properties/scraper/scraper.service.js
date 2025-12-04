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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScraperService = void 0;
const common_1 = require("@nestjs/common");
const properties_service_1 = require("../properties.service");
const puppeteer_1 = __importDefault(require("puppeteer"));
const create_property_dto_1 = require("../dto/create-property.dto");
let ScraperService = class ScraperService {
    propertiesService;
    constructor(propertiesService) {
        this.propertiesService = propertiesService;
    }
    async scrapeLegacySystem() {
        console.log("🚀 Iniciando Robô de Migração V2 (Linux Fixed)...");
        const browser = await puppeteer_1.default.launch({
            headless: false,
            defaultViewport: null,
            userDataDir: './puppeteer_data',
            env: process.env,
            args: [
                '--start-maximized',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-accelerated-2d-canvas',
                '--ozone-platform=x11',
                '--display=:0'
            ]
        });
        const page = await browser.newPage();
        console.log("🌐 Acessando Intranet...");
        try {
            await page.goto('https://www.dbprivate.com.br/intranet/index/', {
                waitUntil: 'domcontentloaded',
                timeout: 60000
            });
        }
        catch (e) {
            console.log("⚠️ Página abriu (timeout ignorado).");
        }
        console.log("⏳ Aguardando você estar na LISTA DE IMÓVEIS...");
        console.log("👉 DICA: Faça login e vá para a aba Imóveis. O robô vai esperar.");
        try {
            await page.waitForSelector('tr[data-rowid]', { timeout: 120000 });
        }
        catch (e) {
            console.error("❌ Tempo esgotado! Navegue para a lista de imóveis.");
            await browser.close();
            return;
        }
        console.log("✅ Lista detectada! Começando a leitura...");
        const propertyIds = await page.evaluate(() => {
            const rows = document.querySelectorAll('tr[data-rowid]');
            return Array.from(rows).map(row => row.getAttribute('data-rowid')).filter(id => id);
        });
        console.log(`📋 Encontrados ${propertyIds.length} imóveis.`);
        for (const id of propertyIds) {
            console.log(`\n🔍 Processando Ref #${id}...`);
            try {
                await page.evaluate((rowId) => {
                    const row = document.querySelector(`tr[data-rowid="${rowId}"]`);
                    if (row)
                        row.click();
                }, id);
                try {
                    await page.waitForSelector('input[name="titulo"]', { timeout: 5000 });
                }
                catch (e) {
                    console.warn(`⚠️ Modal não abriu para #${id}. Pulando.`);
                    await page.keyboard.press('Escape');
                    continue;
                }
                const data = await page.evaluate(() => {
                    const val = (name) => document.querySelector(`[name="${name}"]`)?.value || '';
                    const check = (name) => document.querySelector(`[name="${name}"]`)?.checked || false;
                    const imgs = Array.from(document.querySelectorAll('img'))
                        .map(i => i.src)
                        .filter(src => src.includes('/imoveis/') && !src.includes('sort_desc'));
                    return {
                        title: val('titulo'),
                        oldRef: val('referencia'),
                        categoryStr: document.querySelector('[name="tipo_imovel_id"] option:checked')?.textContent || '',
                        price: val('valor_venda'),
                        condoFee: val('valor_condominio'),
                        iptuPrice: val('valor_iptu'),
                        privateArea: val('area_privativa'),
                        totalArea: val('area_total'),
                        bedrooms: val('dormitorios'),
                        suites: val('suites'),
                        bathrooms: val('banheiros'),
                        garageSpots: val('garagens'),
                        zipCode: val('cep'),
                        street: val('logradouro'),
                        number: val('numero'),
                        neighborhood: val('bairro'),
                        buildingName: val('edificio_nome'),
                        description: val('descricao'),
                        ownerName: val('proprietario_nome'),
                        ownerPhone: val('proprietario_telefone1'),
                        ownerEmail: val('proprietario_email'),
                        keysLocation: val('chaves_local'),
                        isExclusive: check('exclusividade'),
                        images: imgs
                    };
                });
                if (!data.title || data.title.trim() === '') {
                    console.warn(`⚠️ Dados vazios. Ignorando.`);
                    await page.keyboard.press('Escape');
                    continue;
                }
                const cleanMoney = (v) => parseFloat(String(v).replace(/\./g, '').replace(',', '.')) || 0;
                let category = create_property_dto_1.PropertyCategory.APARTAMENTO;
                const catLower = (data.categoryStr || '').toLowerCase();
                if (catLower.includes('casa'))
                    category = create_property_dto_1.PropertyCategory.CASA;
                if (catLower.includes('terreno'))
                    category = create_property_dto_1.PropertyCategory.TERRENO;
                if (catLower.includes('comercial') || catLower.includes('sala'))
                    category = create_property_dto_1.PropertyCategory.SALA_COMERCIAL;
                const dto = {
                    title: data.title,
                    oldRef: String(id),
                    category: category,
                    transactionType: create_property_dto_1.TransactionType.VENDA,
                    price: cleanMoney(data.price),
                    condoFee: cleanMoney(data.condoFee),
                    iptuPrice: cleanMoney(data.iptuPrice),
                    bedrooms: Number(data.bedrooms) || 0,
                    suites: Number(data.suites) || 0,
                    bathrooms: Number(data.bathrooms) || 0,
                    garageSpots: Number(data.garageSpots) || 0,
                    privateArea: parseFloat(String(data.privateArea).replace(',', '.')) || 0,
                    totalArea: parseFloat(String(data.totalArea).replace(',', '.')) || 0,
                    address: {
                        zipCode: data.zipCode || '',
                        street: data.street || '',
                        number: data.number || 'S/N',
                        neighborhood: data.neighborhood || '',
                        city: 'Balneário Camboriú',
                        state: 'SC',
                        complement: ''
                    },
                    buildingName: data.buildingName,
                    description: data.description,
                    ownerName: data.ownerName,
                    ownerPhone: data.ownerPhone,
                    ownerEmail: data.ownerEmail,
                    keysLocation: data.keysLocation,
                    showOnSite: true,
                    isExclusive: data.isExclusive,
                    images: [...new Set(data.images)].slice(0, 15).map((url) => ({ url, isCover: false })),
                };
                if (dto.images && dto.images.length > 0)
                    dto.images[0].isCover = true;
                console.log(`   💾 Salvando: ${dto.title}`);
                await this.propertiesService.create(dto);
                console.log(`   ✅ Sucesso!`);
                await page.keyboard.press('Escape');
                await new Promise(r => setTimeout(r, 800));
            }
            catch (error) {
                console.error(`❌ Erro no #${id}. Tentando recuperar...`);
                await page.keyboard.press('Escape');
            }
        }
        console.log("🏁 FIM.");
    }
};
exports.ScraperService = ScraperService;
exports.ScraperService = ScraperService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [properties_service_1.PropertiesService])
], ScraperService);
//# sourceMappingURL=scraper.service.js.map