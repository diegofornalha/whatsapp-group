const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Lê o script compilado
const scraperScript = fs.readFileSync(path.join(__dirname, 'dist/main.min.js'), 'utf8');

// Caminho do executável do Brave Browser no macOS
const BRAVE_PATH = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';

async function testWhatsAppScraperBrave() {
    console.log('🦁 Iniciando teste do WhatsApp Scraper com BRAVE BROWSER...');
    
    // Verifica se Brave está instalado
    if (!fs.existsSync(BRAVE_PATH)) {
        console.error('❌ Brave Browser não encontrado em:', BRAVE_PATH);
        console.log('💡 Instale o Brave Browser ou use Chrome com: npm run test');
        return;
    }
    
    // Configurações específicas para Brave
    const browser = await puppeteer.launch({
        executablePath: BRAVE_PATH, // 🎯 FORÇA USO DO BRAVE
        headless: false, // Mostra o browser para visualizar
        defaultViewport: { width: 1280, height: 720 },
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--disable-brave-features', // Desativa algumas features específicas do Brave
            '--disable-extensions-except', // Permite algumas extensões essenciais
            '--load-extension=' // Carrega extensões necessárias
        ]
    });

    const page = await browser.newPage();
    
    // Intercepta logs do console
    page.on('console', msg => {
        if (msg.type() === 'log') {
            console.log('🦁 Brave WhatsApp:', msg.text());
        }
    });

    // Desabilita algumas proteções específicas do Brave que podem interferir
    await page.evaluateOnNewDocument(() => {
        // Remove algumas verificações de segurança do Brave
        Object.defineProperty(navigator, 'webdriver', {
            get: () => false,
        });
    });

    try {
        console.log('📂 Navegando para WhatsApp Web via BRAVE...');
        await page.goto('https://web.whatsapp.com', { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });

        console.log('⏳ Aguardando carregamento da página no Brave...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Verifica se precisa fazer login
        try {
            await page.waitForSelector('canvas[aria-label*="QR"]', { timeout: 5000 });
            console.log('🔐 QR Code detectado no Brave! Você tem 60 segundos para escanear...');
            
            // Aguarda login (espera o QR sumir ou o app carregar)
            await page.waitForFunction(() => {
                const qr = document.querySelector('canvas[aria-label*="QR"]');
                const app = document.querySelector('#app div[data-testid]');
                return !qr || app;
            }, { timeout: 60000 });
            
            console.log('✅ Login realizado com sucesso no Brave!');
            await new Promise(resolve => setTimeout(resolve, 5000));
            
        } catch (error) {
            console.log('🎯 WhatsApp já logado no Brave ou carregando...');
        }

        // Aguarda interface principal carregar
        console.log('⏳ Aguardando interface principal no Brave...');
        await page.waitForSelector('#app', { timeout: 30000 });
        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log('💉 Injetando script do scraper no Brave...');
        
        // Injeta o script scraper
        await page.evaluate(scraperScript);
        
        console.log('✅ Script injetado com sucesso no Brave Browser!');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Verifica se a interface foi criada
        const interfaceVisible = await page.evaluate(() => {
            const allDivs = document.querySelectorAll('div');
            let downloadBtn = false;
            let resetBtn = false;
            
            for (let div of allDivs) {
                if (div.textContent && div.textContent.includes('Download') && div.textContent.includes('users')) {
                    downloadBtn = true;
                }
                if (div.textContent && div.textContent.includes('Reset')) {
                    resetBtn = true;
                }
            }
            
            return downloadBtn || resetBtn;
        });

        if (interfaceVisible) {
            console.log('🎉 Interface do scraper detectada no Brave!');
        } else {
            console.log('⚠️  Interface não detectada, mas script foi injetado no Brave');
        }

        // Instrução para uso manual
        console.log(`
🦁 BRAVE BROWSER - PRÓXIMOS PASSOS PARA TESTE:

✅ CONFIRME QUE ESTÁ USANDO BRAVE BROWSER (veja o ícone do leão na barra de título)

1. ✅ Script foi injetado com sucesso no Brave
2. 🔍 Procure pelos botões flutuantes "Download 0 users" e "Reset" na tela
3. 📱 Clique em um grupo do WhatsApp
4. 👥 Clique na foto do grupo → "Dados do grupo" → "Ver todos"
5. 📜 Role LENTAMENTE no modal de membros
6. 📊 Observe o contador aumentar
7. 📥 Clique em "Download X users" para baixar o CSV

🛡️ VANTAGENS DO BRAVE:
- Bloqueio nativo de anúncios e trackers
- Melhor privacidade que Chrome
- Compatível com extensões Chrome
- Shield de proteção automática

⏰ O Brave ficará aberto para você testar manualmente...
Pressione Ctrl+C para encerrar quando terminar.
        `);

        // Mantém o browser aberto para teste manual
        await new Promise(resolve => {
            process.on('SIGINT', () => {
                console.log('\n👋 Encerrando teste no Brave...');
                resolve();
            });
        });

    } catch (error) {
        console.error('❌ Erro durante o teste no Brave:', error.message);
        
        // Diagnóstico específico para Brave
        console.log('\n🔧 POSSÍVEIS SOLUÇÕES PARA BRAVE:');
        console.log('1. Desative shields temporariamente (ícone do escudo na URL)');
        console.log('2. Permita JavaScript e cookies para web.whatsapp.com');
        console.log('3. Limpe cache e cookies do Brave');
        console.log('4. Tente em modo anônimo/privado');
        
    } finally {
        await browser.close();
        console.log('🔚 Brave Browser fechado. Teste finalizado.');
    }
}

// Função para verificar compatibilidade do Brave
async function checkBraveCompatibility() {
    console.log('🔍 Verificando compatibilidade do Brave Browser...');
    
    if (!fs.existsSync(BRAVE_PATH)) {
        console.log('❌ Brave não instalado');
        console.log('📥 Baixe em: https://brave.com/download/');
        return false;
    }
    
    console.log('✅ Brave Browser encontrado');
    console.log('📍 Caminho:', BRAVE_PATH);
    
    try {
        const browser = await puppeteer.launch({
            executablePath: BRAVE_PATH,
            headless: true,
            args: ['--no-sandbox']
        });
        
        const page = await browser.newPage();
        await page.goto('https://www.google.com', { timeout: 10000 });
        const title = await page.title();
        await browser.close();
        
        console.log('✅ Brave funcionando perfeitamente!');
        console.log('🌐 Teste de navegação:', title);
        return true;
        
    } catch (error) {
        console.log('❌ Erro ao testar Brave:', error.message);
        return false;
    }
}

// Executa o teste
if (process.argv.includes('--check')) {
    checkBraveCompatibility();
} else {
    testWhatsAppScraperBrave();
}