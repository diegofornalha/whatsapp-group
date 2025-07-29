const puppeteer = require('puppeteer');

(async () => {
  console.log('Abrindo WhatsApp Web no Chromium...');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--window-size=1200,800'
    ],
    defaultViewport: null
  });
  
  const page = await browser.newPage();
  await page.goto('https://web.whatsapp.com/', { waitUntil: 'networkidle2' });
  
  console.log('WhatsApp Web aberto!');
  console.log('Por favor, escaneie o QR code para fazer login.');
  console.log('Navegador permanecerá aberto. Pressione Ctrl+C para fechar.');
})();