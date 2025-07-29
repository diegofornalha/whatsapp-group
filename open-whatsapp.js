const puppeteer = require('puppeteer');

(async () => {
  console.log('Abrindo WhatsApp Web no Chromium...');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: null
  });
  
  const page = await browser.newPage();
  await page.goto('https://web.whatsapp.com/', { waitUntil: 'networkidle2' });
  
  console.log('WhatsApp Web aberto!');
  console.log('Por favor, escaneie o QR code para fazer login.');
  
  // Aguarda o login
  await page.waitForSelector('[data-testid="chat-list"]', { timeout: 0 });
  console.log('Login realizado com sucesso!');
  
  // Lê o conteúdo do script principal
  const fs = require('fs');
  const scriptContent = fs.readFileSync('./src/main.ts', 'utf8');
  
  // Injeta o script diretamente (removendo imports TypeScript)
  const cleanScript = scriptContent
    .replace(/import.*from.*['"]/g, '// import removed')
    .replace(/export\s+/g, '');
  
  await page.evaluate(cleanScript);
  console.log('Script injetado com sucesso!');
  
  // Mantém o navegador aberto
  console.log('Navegador permanecerá aberto. Pressione Ctrl+C para fechar.');
})();