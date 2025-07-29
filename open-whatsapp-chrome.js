const puppeteer = require('puppeteer');

(async () => {
  console.log('Abrindo WhatsApp Web no Chrome...');
  
  const browser = await puppeteer.launch({
    headless: false,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--window-size=1200,800'
    ],
    defaultViewport: null
  });
  
  const page = await browser.newPage();
  await page.goto('https://web.whatsapp.com/', { waitUntil: 'networkidle2' });
  
  console.log('WhatsApp Web aberto no Chrome!');
  console.log('Por favor, escaneie o QR code para fazer login.');
  console.log('Navegador permanecerá aberto. Pressione Ctrl+C para fechar.');
})();