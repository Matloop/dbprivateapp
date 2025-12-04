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
        console.log("🚀 Iniciando Robô V13 (FULL: Imagens HD + Correção de Valores + Linux Fix)...");
        const browser = await puppeteer_1.default.launch({
            headless: false,
            defaultViewport: null,
            userDataDir: './puppeteer_data',
            args: [
                '--start-maximized',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-gpu',
                '--disable-dev-shm-usage',
                '--ozone-platform=x11'
            ]
        });
        const page = await browser.newPage();
        try {
            await page.goto('https://www.dbprivate.com.br/intranet/index/', { waitUntil: 'domcontentloaded' });
        }
        catch (e) {
            console.log('Erro ao abrir página inicial.');
        }
        console.log("⏳ Aguardando lista de imóveis...");
        try {
            await page.waitForSelector('tr[data-rowid]', { timeout: 60000 });
        }
        catch (e) {
            console.error("❌ Timeout: Lista não carregou.");
            await browser.close();
            return;
        }
        const propertyIds = await page.evaluate(() => {
            return Array.from(document.querySelectorAll('tr[data-rowid]'))
                .map(row => row.getAttribute('data-rowid'))
                .filter(id => id);
        });
        console.log(`📋 Processando fila de ${propertyIds.length} imóveis...`);
        for (const id of propertyIds) {
            console.log(`\n🔍 Processando Ref #${id}...`);
            try {
                await page.evaluate((rowId) => {
                    const row = document.querySelector(`tr[data-rowid="${rowId}"]`);
                    if (row)
                        row.click();
                }, id);
                await new Promise(r => setTimeout(r, 2500));
                try {
                    const gallerySelector = 'img[src*="/imoveis/"], #div_fotos img, .galeria img';
                    const hasGallery = await page.$(gallerySelector);
                    if (hasGallery) {
                        await page.click(gallerySelector);
                        await new Promise(r => setTimeout(r, 2000));
                    }
                }
                catch (e) {
                    console.log('   ⚠️ Aviso: Não foi possível abrir a galeria automática (tentando extração direta).');
                }
                const data = await page.evaluate(() => {
                    const getVal = (id) => {
                        const el = document.getElementById(id);
                        if (!el) {
                            const elByName = document.querySelector(`[name="${id}"]`);
                            return elByName ? elByName.value : '';
                        }
                        return el ? el.value : '';
                    };
                    const getCheck = (id) => {
                        let el = document.getElementById(id);
                        if (!el)
                            el = document.querySelector(`[name="${id}"]`);
                        return el ? (el.checked || el.value === 'on' || el.value === '1') : false;
                    };
                    const getSelectText = (id) => {
                        const el = document.getElementById(id);
                        return el && el.selectedOptions[0] ? el.selectedOptions[0].text : '';
                    };
                    const getAllCheckedFeatures = () => {
                        const allChecked = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'));
                        const features = [];
                        const ignoreList = ['placa', 'exclusivo', 'site', 'destaque', 'financiamento', 'permuta', 'mcmv', 'veiculo', 'valor_promo', 'partir_de', 'construtora'];
                        allChecked.forEach((input) => {
                            const id = input.id || input.name || '';
                            if (ignoreList.some(term => id.toLowerCase().includes(term)))
                                return;
                            let labelText = '';
                            if (input.parentElement.tagName === 'LABEL') {
                                labelText = input.parentElement.innerText;
                            }
                            else if (input.id) {
                                const labelFor = document.querySelector(`label[for="${input.id}"]`);
                                if (labelFor)
                                    labelText = labelFor.innerText;
                            }
                            else if (input.nextSibling && input.nextSibling.nodeType === 3) {
                                labelText = input.nextSibling.nodeValue;
                            }
                            if (labelText && labelText.trim().length > 2)
                                features.push(labelText.trim());
                        });
                        return features;
                    };
                    const getHighQualityImages = () => {
                        const uniqueUrls = new Set();
                        const allImgs = Array.from(document.querySelectorAll('img'));
                        const allAnchors = Array.from(document.querySelectorAll('a[href$=".jpg"], a[href$=".jpeg"], a[href$=".png"]'));
                        allAnchors.forEach((a) => {
                            if (a.href.includes('/imoveis/'))
                                uniqueUrls.add(a.href);
                        });
                        allImgs.forEach((img) => {
                            const src = img.src;
                            if (!src.includes('/imoveis/') || src.includes('bg.gif') || src.includes('pixel') || src.includes('layout'))
                                return;
                            let hdSrc = src.replace(/_thumb/i, '')
                                .replace(/_p\./i, '.')
                                .replace(/_m\./i, '.')
                                .replace(/_mini\./i, '.')
                                .replace(/\/thumbs\//i, '/fotos/')
                                .replace(/sort/i, '');
                            uniqueUrls.add(hdSrc);
                        });
                        return Array.from(uniqueUrls);
                    };
                    return {
                        title: getVal('titulo') || getVal('nome_imovel'),
                        oldRef: getVal('referencia'),
                        categoryStr: getSelectText('tipo_id'),
                        price: getVal('valor_cheio'),
                        iptuPrice: getVal('priv_valor_iptu'),
                        condoFee: getVal('priv_valor_condominio'),
                        promotionalPrice: getVal('valor_promo'),
                        hasDiscount: getCheck('com_valor_promo'),
                        isSale: true,
                        privateArea: getVal('area_privativa'),
                        totalArea: getVal('area_total'),
                        bedrooms: getVal('dormitorios'),
                        suites: getVal('suites'),
                        bathrooms: getVal('bwcs'),
                        garageSpots: getVal('garagens'),
                        garageType: getSelectText('garagens_tipo'),
                        zipCode: getVal('priv_end_cep'),
                        street: getVal('priv_end_rua'),
                        number: getVal('priv_end_numero'),
                        neighborhood: getSelectText('bairro_id'),
                        city: getSelectText('cidade_id'),
                        buildingName: getVal('priv_end_edificio'),
                        description: getVal('descricao'),
                        features: getAllCheckedFeatures(),
                        images: getHighQualityImages(),
                        acceptsFinancing: getCheck('aceita_financiamento'),
                        acceptsConstructionFinancing: getCheck('financiamento_construtora'),
                        acceptsTrade: getCheck('permuta'),
                        acceptsVehicle: getCheck('aceita_veiculo'),
                        isMcmv: getCheck('mcmv'),
                        ownerName: getVal('priv_proprietario'),
                        ownerPhone: getVal('priv_telefones')
                    };
                });
                const cleanMoney = (val) => {
                    if (!val)
                        return 0;
                    let clean = String(val).replace(/[^0-9,]/g, '').replace(',', '.');
                    return parseFloat(clean) || 0;
                };
                const cleanNum = (val) => {
                    if (!val)
                        return 0;
                    let clean = String(val).replace(/[^0-9]/g, '');
                    return parseInt(clean) || 0;
                };
                let category = create_property_dto_1.PropertyCategory.APARTAMENTO;
                const catLower = (data.categoryStr || '').toLowerCase();
                if (catLower.includes('casa'))
                    category = create_property_dto_1.PropertyCategory.CASA;
                if (catLower.includes('terreno') || catLower.includes('lote'))
                    category = create_property_dto_1.PropertyCategory.TERRENO;
                if (catLower.includes('comercial') || catLower.includes('sala'))
                    category = create_property_dto_1.PropertyCategory.SALA_COMERCIAL;
                if (catLower.includes('cobertura'))
                    category = create_property_dto_1.PropertyCategory.COBERTURA;
                const roomFeatures = [];
                const propertyFeatures = [];
                const developmentFeatures = [];
                const roomKeywords = ['sala', 'cozinha', 'suíte', 'dormitório', 'banheiro', 'lavabo', 'área de serviço', 'sacada', 'varanda', 'living', 'closet', 'copa', 'terraço', 'dependência', 'bwc', 'quarto', 'escritório', 'home office'];
                const devKeywords = ['piscina', 'academia', 'fitness', 'salão', 'hall', 'elevador', 'gerador', 'portaria', 'zelador', 'playground', 'brinquedoteca', 'quadra', 'kiosk', 'spa', 'sauna', 'cinema', 'game', 'rooftop', 'heliponto', 'box', 'bicicletário', 'pet'];
                (data.features || []).forEach((f) => {
                    if (!f)
                        return;
                    const lower = f.toLowerCase();
                    if (devKeywords.some(k => lower.includes(k))) {
                        developmentFeatures.push(f);
                    }
                    else if (roomKeywords.some(k => lower.includes(k))) {
                        roomFeatures.push(f);
                    }
                    else {
                        propertyFeatures.push(f);
                    }
                });
                const dto = {
                    title: data.title || `Ref #${id}`,
                    oldRef: String(id),
                    category: category,
                    transactionType: create_property_dto_1.TransactionType.VENDA,
                    status: create_property_dto_1.PropertyStatus.DISPONIVEL,
                    price: cleanMoney(data.price),
                    promotionalPrice: data.hasDiscount ? cleanMoney(data.promotionalPrice) : undefined,
                    condoFee: cleanMoney(data.condoFee),
                    iptuPrice: cleanMoney(data.iptuPrice),
                    privateArea: cleanMoney(data.privateArea),
                    totalArea: cleanMoney(data.totalArea),
                    bedrooms: cleanNum(data.bedrooms),
                    suites: cleanNum(data.suites),
                    bathrooms: cleanNum(data.bathrooms),
                    garageSpots: cleanNum(data.garageSpots),
                    garageType: data.garageType,
                    address: {
                        zipCode: data.zipCode || '',
                        street: data.street || '',
                        number: data.number || 'S/N',
                        neighborhood: data.neighborhood || '',
                        city: data.city || 'Balneário Camboriú',
                        state: 'SC'
                    },
                    buildingName: data.buildingName,
                    ownerName: data.ownerName,
                    ownerPhone: data.ownerPhone,
                    roomFeatures: [...new Set(roomFeatures)],
                    propertyFeatures: [...new Set(propertyFeatures)],
                    developmentFeatures: [...new Set(developmentFeatures)],
                    description: data.description ? data.description.replace(/<[^>]*>?/gm, '\n').trim() : '',
                    isSale: true,
                    acceptsFinancing: data.acceptsFinancing,
                    acceptsTrade: data.acceptsTrade,
                    acceptsVehicle: data.acceptsVehicle,
                    acceptsConstructionFinancing: data.acceptsConstructionFinancing,
                    isMcmv: data.isMcmv,
                    images: [...new Set(data.images)].slice(0, 30).map((url, index) => ({
                        url,
                        isCover: index === 0
                    })),
                };
                console.log(`   ✅ Salvo: ${dto.title} | R$ ${dto.price} | Fotos: ${dto.images?.length}`);
                await this.propertiesService.create(dto);
                await page.keyboard.press('Escape');
                await new Promise(r => setTimeout(r, 800));
            }
            catch (error) {
                console.error(`   ❌ Erro na Ref #${id}:`, error.message);
                try {
                    await page.keyboard.press('Escape');
                }
                catch (e) { }
            }
        }
        console.log("🏁 Importação finalizada.");
    }
};
exports.ScraperService = ScraperService;
exports.ScraperService = ScraperService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [properties_service_1.PropertiesService])
], ScraperService);
//# sourceMappingURL=scraper.service.js.map