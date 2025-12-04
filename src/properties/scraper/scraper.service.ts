import { Injectable } from '@nestjs/common';
import { PropertiesService } from '../properties.service';
import puppeteer from 'puppeteer';
import { CreatePropertyDto, PropertyCategory, TransactionType, PropertyStatus } from '../dto/create-property.dto';

@Injectable()
export class ScraperService {
  constructor(private readonly propertiesService: PropertiesService) {}

  async scrapeLegacySystem() {
    console.log("🚀 Iniciando Robô V10 (Correção IPTU, Condomínio e Ambientes)...");

    const browser = await puppeteer.launch({ 
      headless: false, // Mantivemos false para você ver rodando
      defaultViewport: null,
      userDataDir: './puppeteer_data', 
      // --- CORREÇÃO AQUI ---
      args: [
        '--start-maximized',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        // Argumentos críticos para rodar visualmente no Linux:
        '--disable-gpu',             // Desabilita aceleração de hardware (evita erros de renderização)
        '--disable-dev-shm-usage',   // Evita erro de memória compartilhada
        '--ozone-platform=x11'       // FORÇA o uso do X11 ao invés do Wayland (Resolve o seu erro)
      ],
      // Se necessário, descomente a linha abaixo para apontar o Chrome do sistema se o do puppeteer falhar
      // executablePath: '/usr/bin/google-chrome' 
    });
    
    const page = await browser.newPage();

    // Tenta acessar a intranet
    try { await page.goto('https://www.dbprivate.com.br/intranet/index/', { waitUntil: 'domcontentloaded' }); } catch (e) { console.log('Erro ao abrir página inicial'); }

    console.log("⏳ Aguardando lista de imóveis...");
    try { await page.waitForSelector('tr[data-rowid]', { timeout: 60000 }); } catch (e) { 
        console.error("❌ Timeout: Lista não carregou.");
        await browser.close(); 
        return; 
    }

    // Pega os IDs da primeira página (para teste)
    const propertyIds = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('tr[data-rowid]'))
            .map(row => row.getAttribute('data-rowid'))
            .filter(id => id)
            .slice(0, 5); // LIMITADO A 5 PARA TESTE RÁPIDO
    });

    console.log(`📋 Processando amostra de ${propertyIds.length} imóveis...`);

    for (const id of propertyIds) {
        console.log(`\n🔍 Lendo Ref #${id}...`);

        try {
            // 1. Abre o detalhe do imóvel
            await page.evaluate((rowId) => {
                const row = document.querySelector(`tr[data-rowid="${rowId}"]`) as HTMLElement;
                if (row) row.click();
            }, id);

            // Espera o modal/página carregar (ajuste se necessário)
            await new Promise(r => setTimeout(r, 3000));

            // 2. Extração de Dados (Lógica Melhorada)
            const data: any = await page.evaluate(() => {
                
                // Função auxiliar que tenta pegar valor pelo ID
                const getVal = (id: string) => {
                    const el = document.getElementById(id) as HTMLInputElement;
                    // Se não achar por ID, tenta por Name
                    if (!el) {
                        const elByName = document.querySelector(`[name="${id}"]`) as HTMLInputElement;
                        return elByName ? elByName.value : '';
                    }
                    return el ? el.value : '';
                };

                const getCheck = (id: string) => {
                    const el = document.getElementById(id) as HTMLInputElement;
                    return el ? el.checked : false;
                };

                const getSelectText = (id: string) => {
                    const el = document.getElementById(id) as HTMLSelectElement;
                    return el && el.selectedOptions[0] ? el.selectedOptions[0].text : '';
                };

                // Lógica de Features (Mantida igual, pois estava funcionando)
                const getAllCheckedFeatures = () => {
                    const allChecked = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'));
                    const features: string[] = [];
                    const ignoreList = ['placa', 'exclusivo', 'site', 'destaque', 'financiamento', 'permuta', 'mcmv', 'veiculo', 'valor_promo', 'partir_de'];

                    allChecked.forEach((input: any) => {
                        const id = input.id || input.name || '';
                        if (ignoreList.some(term => id.toLowerCase().includes(term))) return;

                        let labelText = '';
                        if (input.parentElement.tagName === 'LABEL') {
                            labelText = input.parentElement.innerText;
                        } else if (input.id) {
                            const labelFor = document.querySelector(`label[for="${input.id}"]`);
                            if (labelFor) labelText = (labelFor as HTMLElement).innerText;
                        }
                        
                        if (labelText) features.push(labelText.trim());
                    });
                    return features;
                };

                const imgs = Array.from(document.querySelectorAll('img'))
                    .map(i => i.src)
                    .filter(src => src.includes('/imoveis/') && !src.includes('bg.gif'));

                return {
                    title: getVal('titulo') || getVal('nome_imovel'),
                    oldRef: getVal('referencia'),
                    categoryStr: getSelectText('tipo_id'),
                    
                    // --- CORREÇÃO AQUI (Baseado no seu HTML) ---
                    price: getVal('valor_cheio'),           // ID confirmado no HTML
                    iptuPrice: getVal('priv_valor_iptu'),   // ID confirmado no HTML
                    condoFee: getVal('priv_valor_condominio'), // ID confirmado no HTML
                    promotionalPrice: getVal('valor_promo'),

                    hasDiscount: getCheck('com_valor_promo'),
                    
                    // Finalidades
                    isSale: true, // Se apareceu o div_venda, assume venda (simplificação)
                    
                    // Áreas
                    privateArea: getVal('area_privativa'),
                    totalArea: getVal('area_total'),
                    
                    // Detalhes Internos
                    bedrooms: getVal('dormitorios'),
                    suites: getVal('suites'),
                    bathrooms: getVal('bwcs'),
                    garageSpots: getVal('garagens'),
                    garageType: getSelectText('garagens_tipo'),
                    
                    // Endereço
                    zipCode: getVal('priv_end_cep'),
                    street: getVal('priv_end_rua'),
                    number: getVal('priv_end_numero'),
                    neighborhood: getSelectText('bairro_id'),
                    city: getSelectText('cidade_id'),
                    buildingName: getVal('priv_end_edificio'),

                    // Descrição
                    description: getVal('descricao'),
                    
                    features: getAllCheckedFeatures(),
                    images: imgs,

                    // Checks (IDs confirmados no seu HTML)
                    acceptsFinancing: getCheck('aceita_financiamento'),
                    acceptsConstructionFinancing: getCheck('financiamento_construtora'),
                    acceptsTrade: getCheck('permuta'),
                    acceptsVehicle: getCheck('aceita_veiculo'),
                    isMcmv: getCheck('mcmv')
                };
            });

            // 3. Tratamento dos Dados (NodeJS)
            const cleanMoney = (val: string) => {
                if (!val) return 0;
                // Remove tudo que não é número ou vírgula, troca vírgula por ponto
                let clean = String(val).replace(/[^0-9,]/g, '').replace(',', '.');
                return parseFloat(clean) || 0;
            };

            const cleanNum = (val: string) => {
                if (!val) return 0;
                let clean = String(val).replace(/[^0-9]/g, '');
                return parseInt(clean) || 0;
            };

            // Categorização do Imóvel
            let category = PropertyCategory.APARTAMENTO;
            const catLower = (data.categoryStr || '').toLowerCase();
            if (catLower.includes('casa')) category = PropertyCategory.CASA;
            if (catLower.includes('terreno') || catLower.includes('lote')) category = PropertyCategory.TERRENO;
            if (catLower.includes('comercial') || catLower.includes('sala')) category = PropertyCategory.SALA_COMERCIAL;
            if (catLower.includes('cobertura')) category = PropertyCategory.COBERTURA;

            // --- CATEGORIZAÇÃO INTELIGENTE DE FEATURES (Ambientes vs Infra) ---
            const roomFeatures: string[] = [];
            const propertyFeatures: string[] = [];
            const developmentFeatures: string[] = [];
            
            // Lista expandida de palavras-chave para detectar AMBIENTES
            const roomKeywords = [
                'sala', 'cozinha', 'suíte', 'dormitório', 'banheiro', 'lavabo', 'área de serviço', 
                'sacada', 'varanda', 'living', 'closet', 'copa', 'terraço', 'jardim de inverno', 
                'churrasqueira na sacada', 'dependência', 'bwc', 'quarto', 'escritório', 'home office'
            ];

            // Lista expandida para EMPREENDIMENTO (Lazer/Prédio)
            const devKeywords = [
                'piscina', 'academia', 'fitness', 'salão', 'hall', 'elevador', 'gerador', 'portaria', 
                'zelador', 'playground', 'brinquedoteca', 'quadra', 'kiosk', 'spa', 'sauna', 'cinema', 
                'game', 'pub', 'bar', 'rooftop', 'heliponto', 'box', 'bicicletário', 'pet'
            ];

            (data.features || []).forEach((f: string) => {
                if(!f) return;
                const lower = f.toLowerCase();
                
                if (devKeywords.some(k => lower.includes(k))) {
                    developmentFeatures.push(f);
                } else if (roomKeywords.some(k => lower.includes(k))) {
                    roomFeatures.push(f);
                } else {
                    // O resto vai para características gerais (Acabamento em gesso, piso, etc)
                    propertyFeatures.push(f);
                }
            });

            // Monta DTO
            const dto: CreatePropertyDto = {
                title: data.title || `Ref #${id}`,
                oldRef: String(id),
                category: category,
                transactionType: TransactionType.VENDA,
                status: PropertyStatus.DISPONIVEL,
                
                // Valores Corrigidos
                price: cleanMoney(data.price),
                promotionalPrice: data.hasDiscount ? cleanMoney(data.promotionalPrice) : undefined,
                condoFee: cleanMoney(data.condoFee),
                iptuPrice: cleanMoney(data.iptuPrice),

                // Áreas e Cômodos
                privateArea: cleanMoney(data.privateArea), // usa cleanMoney pois pode ter virgula
                totalArea: cleanMoney(data.totalArea),
                bedrooms: cleanNum(data.bedrooms),
                suites: cleanNum(data.suites),
                bathrooms: cleanNum(data.bathrooms),
                garageSpots: cleanNum(data.garageSpots),
                garageType: data.garageType,

                // Endereço
                address: {
                    zipCode: data.zipCode || '',
                    street: data.street || '',
                    number: data.number || 'S/N',
                    neighborhood: data.neighborhood || '',
                    city: data.city || 'Balneário Camboriú',
                    state: 'SC'
                },
                buildingName: data.buildingName,

                // Listas Corrigidas
                roomFeatures: [...new Set(roomFeatures)],
                propertyFeatures: [...new Set(propertyFeatures)],
                developmentFeatures: [...new Set(developmentFeatures)],

                description: data.description ? data.description.replace(/<[^>]*>?/gm, '\n').trim() : '',
                
                // Booleanos
                acceptsFinancing: data.acceptsFinancing,
                acceptsTrade: data.acceptsTrade,
                acceptsVehicle: data.acceptsVehicle,
                isSale: true,

                // Imagens (Pega só as 20 primeiras para não pesar)
                images: [...new Set(data.images as string[])].slice(0, 20).map((url: string, index: number) => ({ 
                    url, 
                    isCover: index === 0 
                })),
            };

            console.log(`   ✅ Encontrado: ${dto.title} | Cond: ${dto.condoFee} | IPTU: ${dto.iptuPrice} | Ambientes: ${dto.roomFeatures?.length}`);

            // Salva no Banco
            await this.propertiesService.create(dto);
            
            // Fecha modal (Esc) para ir para o próximo
            await page.keyboard.press('Escape');
            await new Promise(r => setTimeout(r, 1000));

        } catch (error) {
            console.error(`❌ Erro no #${id}:`, error);
            try { await page.keyboard.press('Escape'); } catch(e){}
        }
    }
    
    console.log("🏁 Importação finalizada.");
    // await browser.close(); // Comentei para você ver o resultado se quiser
  }
}