const puppeteer = require('puppeteer');

(async () => {
  console.log('Abrindo http://localhost:3456/ no Chromium...');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--window-size=1400,900'
    ],
    defaultViewport: null
  });
  
  const page = await browser.newPage();
  await page.goto('http://localhost:3456/', { waitUntil: 'networkidle2' });
  
  console.log('Aplicação aberta no Chromium!');
  console.log('Navegador permanecerá aberto. Pressione Ctrl+C para fechar.');
})();