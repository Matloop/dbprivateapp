import { Injectable } from '@nestjs/common';
import { PropertiesService } from '../properties.service';
import puppeteer from 'puppeteer';
import { CreatePropertyDto, PropertyCategory, TransactionType, PropertyStatus } from '../dto/create-property.dto';

@Injectable()
export class ScraperService {
  constructor(private readonly propertiesService: PropertiesService) {}

  async scrapeLegacySystem() {
    console.log("🚀 Iniciando Robô V13 (FULL: Imagens HD + Correção de Valores + Linux Fix)...");

    const browser = await puppeteer.launch({ 
      headless: false, // Mantenha false para ver o processo (depois mude para true ou 'new')
      defaultViewport: null,
      userDataDir: './puppeteer_data', 
      // Argumentos otimizados para Linux/Wayland e estabilidade
      args: [
        '--start-maximized',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-gpu',             
        '--disable-dev-shm-usage',   
        '--ozone-platform=x11' // Força X11 para evitar erro do Wayland
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

    // Pega os IDs (Limitado a 10 para teste inicial, remova o .slice para rodar tudo)
    const propertyIds = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('tr[data-rowid]'))
            .map(row => row.getAttribute('data-rowid'))
            .filter(id => id)
            // .slice(0, 10) // <--- REMOVA OU AUMENTE ESSE LIMITE QUANDO QUISER RODAR TUDO
    });

    console.log(`📋 Processando fila de ${propertyIds.length} imóveis...`);

    for (const id of propertyIds) {
        console.log(`\n🔍 Processando Ref #${id}...`);

        try {
            // 2. Abre o detalhe do imóvel
            await page.evaluate((rowId) => {
                const row = document.querySelector(`tr[data-rowid="${rowId}"]`) as HTMLElement;
                if (row) row.click();
            }, id);

            // Espera o carregamento inicial do modal
            await new Promise(r => setTimeout(r, 2500));

            // --- 3. ESTRATÉGIA IMAGEM HD: SIMULA CLIQUE NA GALERIA ---
            try {
                // Tenta clicar na primeira imagem ou container de fotos para abrir o Lightbox/Modal de fotos
                const gallerySelector = 'img[src*="/imoveis/"], #div_fotos img, .galeria img';
                const hasGallery = await page.$(gallerySelector);
                
                if (hasGallery) {
                    await page.click(gallerySelector);
                    // Espera o modal de fotos abrir e carregar as versões HD
                    await new Promise(r => setTimeout(r, 2000));
                }
            } catch (e) {
                console.log('   ⚠️ Aviso: Não foi possível abrir a galeria automática (tentando extração direta).');
            }

            // 4. EXTRAÇÃO DE DADOS (No contexto do navegador)
            const data: any = await page.evaluate(() => {
                
                // Funções Auxiliares Internas
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

                // Coleta todas as características marcadas (Ambientes + Infra)
                const getAllCheckedFeatures = () => {
                    const allChecked = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'));
                    const features: string[] = [];
                    // Ignora checkboxes de configuração do sistema
                    const ignoreList = ['placa', 'exclusivo', 'site', 'destaque', 'financiamento', 'permuta', 'mcmv', 'veiculo', 'valor_promo', 'partir_de', 'construtora'];

                    allChecked.forEach((input: any) => {
                        const id = input.id || input.name || '';
                        if (ignoreList.some(term => id.toLowerCase().includes(term))) return;

                        let labelText = '';
                        // Tenta achar o texto do label de várias formas
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

                // Lógica Robusta para Imagens HD
                const getHighQualityImages = () => {
                    const uniqueUrls = new Set<string>();

                    // Pega todas as imagens (incluindo as do modal aberto)
                    const allImgs = Array.from(document.querySelectorAll('img'));
                    // Pega links que apontam para imagens (comum em lightboxes: <a href="big.jpg"><img src="small.jpg"></a>)
                    const allAnchors = Array.from(document.querySelectorAll('a[href$=".jpg"], a[href$=".jpeg"], a[href$=".png"]'));

                    // Prioridade 1: Links diretos (Geralmente HD)
                    allAnchors.forEach((a: HTMLAnchorElement) => {
                        if (a.href.includes('/imoveis/')) uniqueUrls.add(a.href);
                    });

                    // Prioridade 2: Imagens na tela (com limpeza de URL)
                    allImgs.forEach((img: HTMLImageElement) => {
                        const src = img.src;
                        if (!src.includes('/imoveis/') || src.includes('bg.gif') || src.includes('pixel') || src.includes('layout')) return;

                        // Tenta "adivinhar" a URL HD removendo sufixos de miniatura
                        let hdSrc = src.replace(/_thumb/i, '')    // remove _thumb
                                       .replace(/_p\./i, '.')     // _p.jpg -> .jpg
                                       .replace(/_m\./i, '.')     // _m.jpg -> .jpg
                                       .replace(/_mini\./i, '.')  // _mini.jpg -> .jpg
                                       .replace(/\/thumbs\//i, '/fotos/') // pasta thumbs -> fotos
                                       .replace(/sort/i, '');     // remove lixo de query params

                        uniqueUrls.add(hdSrc);
                    });

                    return Array.from(uniqueUrls);
                };

                return {
                    // Identificação e Valores
                    title: getVal('titulo') || getVal('nome_imovel'),
                    oldRef: getVal('referencia'),
                    categoryStr: getSelectText('tipo_id'),
                    
                    price: getVal('valor_cheio'),           // ID correto
                    iptuPrice: getVal('priv_valor_iptu'),   // ID correto
                    condoFee: getVal('priv_valor_condominio'), // ID correto
                    promotionalPrice: getVal('valor_promo'),
                    hasDiscount: getCheck('com_valor_promo'),
                    
                    // Finalidades
                    isSale: true, // Assume venda pois veio do div_venda

                    // Detalhes Técnicos
                    privateArea: getVal('area_privativa'),
                    totalArea: getVal('area_total'),
                    bedrooms: getVal('dormitorios'),
                    suites: getVal('suites'),
                    bathrooms: getVal('bwcs'),
                    garageSpots: getVal('garagens'),
                    garageType: getSelectText('garagens_tipo'),
                    
                    // Localização
                    zipCode: getVal('priv_end_cep'),
                    street: getVal('priv_end_rua'),
                    number: getVal('priv_end_numero'),
                    neighborhood: getSelectText('bairro_id'),
                    city: getSelectText('cidade_id'),
                    buildingName: getVal('priv_end_edificio'),

                    // Descrição
                    description: getVal('descricao'),
                    
                    // Listas Complexas
                    features: getAllCheckedFeatures(),
                    images: getHighQualityImages(),

                    // Negociação
                    acceptsFinancing: getCheck('aceita_financiamento'),
                    acceptsConstructionFinancing: getCheck('financiamento_construtora'),
                    acceptsTrade: getCheck('permuta'),
                    acceptsVehicle: getCheck('aceita_veiculo'),
                    isMcmv: getCheck('mcmv'),
                    
                    // Privados
                    ownerName: getVal('priv_proprietario'),
                    ownerPhone: getVal('priv_telefones')
                };
            });

            // 5. PROCESSAMENTO E SALVAMENTO (NodeJS)
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

            // Categorização
            let category = PropertyCategory.APARTAMENTO;
            const catLower = (data.categoryStr || '').toLowerCase();
            if (catLower.includes('casa')) category = PropertyCategory.CASA;
            if (catLower.includes('terreno') || catLower.includes('lote')) category = PropertyCategory.TERRENO;
            if (catLower.includes('comercial') || catLower.includes('sala')) category = PropertyCategory.SALA_COMERCIAL;
            if (catLower.includes('cobertura')) category = PropertyCategory.COBERTURA;

            // Separação Inteligente de Features (Ambientes vs Lazer)
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

            // Monta o DTO final
            const dto: CreatePropertyDto = {
                title: data.title || `Ref #${id}`,
                oldRef: String(id),
                category: category,
                transactionType: TransactionType.VENDA,
                status: PropertyStatus.DISPONIVEL,
                
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

                // Imagens HD (Limitando a 30 para não estourar o banco)
                images: [...new Set(data.images as string[])].slice(0, 30).map((url: string, index: number) => ({ 
                    url, 
                    isCover: index === 0 
                })),
            };

            console.log(`   ✅ Salvo: ${dto.title} | R$ ${dto.price} | Fotos: ${dto.images?.length}`);

            // Tenta salvar (se já existir, o Prisma pode reclamar dependendo da config, mas o try/catch segura)
            await this.propertiesService.create(dto);

            // Fecha Modais (Tecla Esc) para garantir que a próxima iteração comece limpa
            await page.keyboard.press('Escape');
            await new Promise(r => setTimeout(r, 800)); // Pequena pausa para UI reagir

        } catch (error) {
            console.error(`   ❌ Erro na Ref #${id}:`, error.message);
            // Tenta recuperar fechando qualquer coisa aberta
            try { await page.keyboard.press('Escape'); } catch(e){}
        }
    }
    
    console.log("🏁 Importação finalizada.");
    // await browser.close(); // Mantenha comentado para debug visual
  }
}