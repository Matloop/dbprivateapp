import { Injectable } from '@nestjs/common';
import { PropertiesService } from '../properties.service';
import puppeteer from 'puppeteer';
import { CreatePropertyDto, PropertyCategory, TransactionType } from '../dto/create-property.dto';

@Injectable()
export class ScraperService {
  constructor(private readonly propertiesService: PropertiesService) {}

  async scrapeLegacySystem() {
    console.log("🚀 Iniciando Robô de Migração V2 (Linux Fixed)...");

    // 1. Configuração do Navegador (AJUSTADA PARA SEU ZORIN OS)
    const browser = await puppeteer.launch({ 
      headless: false, 
      defaultViewport: null,
      userDataDir: './puppeteer_data', // Salva sessão/login
      
      // --- CRÍTICO PARA O SEU LINUX ---
      env: process.env, 
      args: [
        '--start-maximized',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-accelerated-2d-canvas',
        '--ozone-platform=x11', // Força X11 (Corrige erro do Wayland)
        '--display=:0'          // Aponta para seu monitor
      ] 
    });
    
    const page = await browser.newPage();

    // 2. Acessa o Sistema
    console.log("🌐 Acessando Intranet...");
    try {
        // Usamos domcontentloaded para ser rápido
        await page.goto('https://www.dbprivate.com.br/intranet/index/', { 
            waitUntil: 'domcontentloaded',
            timeout: 60000 
        });
    } catch (e) {
        console.log("⚠️ Página abriu (timeout ignorado).");
    }

    console.log("⏳ Aguardando você estar na LISTA DE IMÓVEIS...");
    console.log("👉 DICA: Faça login e vá para a aba Imóveis. O robô vai esperar.");

    // 3. Espera a lista carregar (Timeout longo para dar tempo de você logar)
    try {
        await page.waitForSelector('tr[data-rowid]', { timeout: 120000 }); // 2 minutos para logar
    } catch (e) {
        console.error("❌ Tempo esgotado! Navegue para a lista de imóveis.");
        await browser.close();
        return;
    }

    console.log("✅ Lista detectada! Começando a leitura...");

    // 4. Pega IDs da página
    const propertyIds = await page.evaluate(() => {
        const rows = document.querySelectorAll('tr[data-rowid]');
        return Array.from(rows).map(row => row.getAttribute('data-rowid')).filter(id => id);
    });

    console.log(`📋 Encontrados ${propertyIds.length} imóveis.`);

    // 5. Loop de Extração
    for (const id of propertyIds) {
        console.log(`\n🔍 Processando Ref #${id}...`);

        try {
            // Clica na linha
            await page.evaluate((rowId) => {
                const row = document.querySelector(`tr[data-rowid="${rowId}"]`) as HTMLElement;
                if (row) row.click();
            }, id);

            // Espera o título aparecer (Sinal que o modal carregou)
            try {
                await page.waitForSelector('input[name="titulo"]', { timeout: 5000 });
            } catch (e) {
                console.warn(`⚠️ Modal não abriu para #${id}. Pulando.`);
                await page.keyboard.press('Escape');
                continue;
            }

            // Extrai dados
            const data: any = await page.evaluate(() => {
                const val = (name: string) => (document.querySelector(`[name="${name}"]`) as HTMLInputElement)?.value || '';
                const check = (name: string) => (document.querySelector(`[name="${name}"]`) as HTMLInputElement)?.checked || false;
                
                // Tenta pegar imagens grandes (removendo thumb da url se possível)
                // Seletor genérico para pegar todas as imagens dentro do modal
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
                    buildingName: val('edificio_nome'), // Tente descobrir o name exato inspecionando
                    description: val('descricao'),
                    ownerName: val('proprietario_nome'),
                    ownerPhone: val('proprietario_telefone1'),
                    ownerEmail: val('proprietario_email'),
                    keysLocation: val('chaves_local'),
                    isExclusive: check('exclusividade'),
                    images: imgs
                };
            });

            // Validação Anti-Sujeira
            if (!data.title || data.title.trim() === '') {
                console.warn(`⚠️ Dados vazios. Ignorando.`);
                await page.keyboard.press('Escape');
                continue;
            }

            // Tratamento
            const cleanMoney = (v: string) => parseFloat(String(v).replace(/\./g, '').replace(',', '.')) || 0;
            
            let category = PropertyCategory.APARTAMENTO;
            const catLower = (data.categoryStr || '').toLowerCase();
            if (catLower.includes('casa')) category = PropertyCategory.CASA;
            if (catLower.includes('terreno')) category = PropertyCategory.TERRENO;
            if (catLower.includes('comercial') || catLower.includes('sala')) category = PropertyCategory.SALA_COMERCIAL;

            const dto: CreatePropertyDto = {
                title: data.title,
                oldRef: String(id),
                category: category,
                transactionType: TransactionType.VENDA,
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
                images: [...new Set(data.images as string[])].slice(0, 15).map((url: string) => ({ url, isCover: false })),
            };

            if (dto.images && dto.images.length > 0) dto.images[0].isCover = true;

            console.log(`   💾 Salvando: ${dto.title}`);
            await this.propertiesService.create(dto);
            console.log(`   ✅ Sucesso!`);

            // Fecha Modal
            await page.keyboard.press('Escape');
            await new Promise(r => setTimeout(r, 800)); 

        } catch (error) {
            console.error(`❌ Erro no #${id}. Tentando recuperar...`);
            await page.keyboard.press('Escape');
        }
    }
    console.log("🏁 FIM.");
  }
}