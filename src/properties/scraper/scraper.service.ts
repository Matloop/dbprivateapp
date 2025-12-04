import { Injectable } from '@nestjs/common';
import { PropertiesService } from '../properties.service';
import puppeteer from 'puppeteer';
import { CreatePropertyDto, PropertyCategory, TransactionType, PropertyStatus } from '../dto/create-property.dto';

@Injectable()
export class ScraperService {
  constructor(private readonly propertiesService: PropertiesService) {}

  async scrapeLegacySystem() {
    console.log("🚀 Iniciando Robô V14 (FULL + Tarjas Importadas)...");

    const browser = await puppeteer.launch({ 
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

    // 1. Acessa o Sistema
    try { 
        await page.goto('https://www.dbprivate.com.br/intranet/index/', { waitUntil: 'domcontentloaded' }); 
    } catch (e) { 
        console.log('Erro ao abrir página inicial.'); 
    }

    console.log("⏳ Aguardando lista de imóveis...");
    try { 
        await page.waitForSelector('tr[data-rowid]', { timeout: 60000 }); 
    } catch (e) { 
        console.error("❌ Timeout: Lista não carregou.");
        await browser.close(); 
        return; 
    }

    const propertyIds = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('tr[data-rowid]'))
            .map(row => row.getAttribute('data-rowid'))
            .filter(id => id);
            // .slice(0, 10) // Descomente para testes rápidos
    });

    console.log(`📋 Processando fila de ${propertyIds.length} imóveis...`);

    for (const id of propertyIds) {
        console.log(`\n🔍 Processando Ref #${id}...`);

        try {
            await page.evaluate((rowId) => {
                const row = document.querySelector(`tr[data-rowid="${rowId}"]`) as HTMLElement;
                if (row) row.click();
            }, id);

            await new Promise(r => setTimeout(r, 2500));

            // Simula clique na galeria para carregar fotos HD
            try {
                const gallerySelector = 'img[src*="/imoveis/"], #div_fotos img, .galeria img';
                const hasGallery = await page.$(gallerySelector);
                if (hasGallery) {
                    await page.click(gallerySelector);
                    await new Promise(r => setTimeout(r, 2000));
                }
            } catch (e) {
                console.log('   ⚠️ Aviso: Não foi possível abrir a galeria automática.');
            }

            // 4. EXTRAÇÃO DE DADOS
            const data: any = await page.evaluate(() => {
                const getVal = (id: string) => {
                    const el = document.getElementById(id) as HTMLInputElement;
                    if (!el) {
                        const elByName = document.querySelector(`[name="${id}"]`) as HTMLInputElement;
                        return elByName ? elByName.value : '';
                    }
                    return el ? el.value : '';
                };

                const getCheck = (id: string) => {
                    let el: any = document.getElementById(id);
                    if (!el) el = document.querySelector(`[name="${id}"]`);
                    return el ? (el.checked || el.value === 'on' || el.value === '1') : false;
                };

                const getSelectText = (id: string) => {
                    const el = document.getElementById(id) as HTMLSelectElement;
                    return el && el.selectedOptions[0] ? el.selectedOptions[0].text : '';
                };

                const getAllCheckedFeatures = () => {
                    const allChecked = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'));
                    const features: string[] = [];
                    const ignoreList = ['placa', 'exclusivo', 'site', 'destaque', 'financiamento', 'permuta', 'mcmv', 'veiculo', 'valor_promo', 'partir_de', 'construtora'];

                    allChecked.forEach((input: any) => {
                        const id = input.id || input.name || '';
                        if (ignoreList.some(term => id.toLowerCase().includes(term))) return;

                        let labelText = '';
                        if (input.parentElement.tagName === 'LABEL') {
                            labelText = input.parentElement.innerText;
                        } else if (input.id) {
                            const labelFor = document.querySelector(`label[for="${input.id}"]`);
                            if (labelFor) labelText = (labelFor as HTMLElement).innerText;
                        } else if (input.nextSibling && input.nextSibling.nodeType === 3) {
                            labelText = input.nextSibling.nodeValue;
                        }
                        
                        if (labelText && labelText.trim().length > 2) features.push(labelText.trim());
                    });
                    return features;
                };

                const getHighQualityImages = () => {
                    const uniqueUrls = new Set<string>();
                    const allImgs = Array.from(document.querySelectorAll('img'));
                    const allAnchors = Array.from(document.querySelectorAll('a[href$=".jpg"], a[href$=".jpeg"], a[href$=".png"]'));

                    allAnchors.forEach((a: HTMLAnchorElement) => {
                        if (a.href.includes('/imoveis/')) uniqueUrls.add(a.href);
                    });

                    allImgs.forEach((img: HTMLImageElement) => {
                        const src = img.src;
                        if (!src.includes('/imoveis/') || src.includes('bg.gif') || src.includes('pixel') || src.includes('layout')) return;

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
                    
                    // --- TARJAS (NOVIDADE) ---
                    badgeText: getVal('tarja'),
                    badgeColorClass: getVal('tarja_cor'), // Pega a classe (ex: label-danger)
                    
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

            // 5. PROCESSAMENTO E MAPEAMENTO DE CORES
            const cleanMoney = (val: string) => {
                if (!val) return 0;
                let clean = String(val).replace(/[^0-9,]/g, '').replace(',', '.');
                return parseFloat(clean) || 0;
            };

            const cleanNum = (val: string) => {
                if (!val) return 0;
                let clean = String(val).replace(/[^0-9]/g, '');
                return parseInt(clean) || 0;
            };

            // --- MAPEAMENTO DE CORES (Classes Antigas -> Hex Novos) ---
            const mapBadgeColor = (className: string) => {
                switch (className) {
                    case 'label-tema': return '#d4af37';    // Dourado (Padrão)
                    case 'label-primary': return '#0d6efd'; // Azul
                    case 'label-success': return '#198754'; // Verde
                    case 'label-danger': return '#dc3545';  // Vermelho
                    case 'label-warning': return '#ffc107'; // Laranja/Amarelo
                    case 'label-info': return '#0dcaf0';    // Azul Claro
                    case 'label-default': return '#6c757d'; // Cinza
                    default: return '#d4af37'; // Fallback para Dourado se não tiver cor
                }
            };

            let category = PropertyCategory.APARTAMENTO;
            const catLower = (data.categoryStr || '').toLowerCase();
            if (catLower.includes('casa')) category = PropertyCategory.CASA;
            if (catLower.includes('terreno') || catLower.includes('lote')) category = PropertyCategory.TERRENO;
            if (catLower.includes('comercial') || catLower.includes('sala')) category = PropertyCategory.SALA_COMERCIAL;
            if (catLower.includes('cobertura')) category = PropertyCategory.COBERTURA;

            const roomFeatures: string[] = [];
            const propertyFeatures: string[] = [];
            const developmentFeatures: string[] = [];
            
            const roomKeywords = ['sala', 'cozinha', 'suíte', 'dormitório', 'banheiro', 'lavabo', 'área de serviço', 'sacada', 'varanda', 'living', 'closet', 'copa', 'terraço', 'dependência', 'bwc', 'quarto', 'escritório', 'home office'];
            const devKeywords = ['piscina', 'academia', 'fitness', 'salão', 'hall', 'elevador', 'gerador', 'portaria', 'zelador', 'playground', 'brinquedoteca', 'quadra', 'kiosk', 'spa', 'sauna', 'cinema', 'game', 'rooftop', 'heliponto', 'box', 'bicicletário', 'pet'];

            (data.features || []).forEach((f: string) => {
                if(!f) return;
                const lower = f.toLowerCase();
                
                if (devKeywords.some(k => lower.includes(k))) {
                    developmentFeatures.push(f);
                } else if (roomKeywords.some(k => lower.includes(k))) {
                    roomFeatures.push(f);
                } else {
                    propertyFeatures.push(f);
                }
            });

            const dto: CreatePropertyDto = {
                title: data.title || `Ref #${id}`,
                oldRef: String(id),
                category: category,
                transactionType: TransactionType.VENDA,
                status: PropertyStatus.DISPONIVEL,
                
                // --- TARJAS SALVAS ---
                badgeText: data.badgeText,
                badgeColor: mapBadgeColor(data.badgeColorClass), // Converte a classe em Hex
                
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

                images: [...new Set(data.images as string[])].slice(0, 30).map((url: string, index: number) => ({ 
                    url, 
                    isCover: index === 0 
                })),
            };

            console.log(`   ✅ Salvo: ${dto.title} | Tarja: ${dto.badgeText || 'Nenhuma'}`);

            await this.propertiesService.create(dto);

            await page.keyboard.press('Escape');
            await new Promise(r => setTimeout(r, 800));

        } catch (error) {
            console.error(`   ❌ Erro na Ref #${id}:`, error.message);
            try { await page.keyboard.press('Escape'); } catch(e){}
        }
    }
    
    console.log("🏁 Importação finalizada.");
  }
}