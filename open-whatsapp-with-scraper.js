const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  console.log('Abrindo WhatsApp Web com Scraper no Chrome...');
  
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
  
  console.log('WhatsApp Web aberto!');
  console.log('Por favor, escaneie o QR code para fazer login.');
  
  // Aguarda o login
  await page.waitForSelector('[data-testid="chat-list"]', { timeout: 0 });
  console.log('Login realizado com sucesso!');
  
  // Aguarda um pouco para garantir que a página carregou completamente
  await page.waitForTimeout(3000);
  
  // Injeta o código do scraper
  console.log('Injetando WhatsApp Scraper...');
  
  // Primeiro, injeta as funções utilitárias simuladas
  await page.evaluate(() => {
    // Simula as funções do browser-scraping-utils
    window.exportToCsv = function(data, filename) {
      const csv = data.map(row => row.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
    };
    
    window.ListStorage = class ListStorage {
      constructor() {
        this.data = [];
      }
      add(item) {
        this.data.push(item);
      }
      getAll() {
        return this.data;
      }
      clear() {
        this.data = [];
      }
    };
    
    window.UIContainer = class UIContainer {
      constructor(title) {
        this.container = document.createElement('div');
        this.container.style.cssText = `
          position: fixed;
          top: 10px;
          right: 10px;
          background: white;
          border: 1px solid #ccc;
          padding: 10px;
          z-index: 9999;
          border-radius: 5px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        `;
        this.container.innerHTML = `<h3>${title}</h3>`;
        document.body.appendChild(this.container);
      }
      
      appendChild(element) {
        this.container.appendChild(element);
      }
    };
    
    window.createCta = function(text, onClick) {
      const button = document.createElement('button');
      button.textContent = text;
      button.style.cssText = `
        margin: 5px;
        padding: 5px 10px;
        background: #25d366;
        color: white;
        border: none;
        border-radius: 3px;
        cursor: pointer;
      `;
      button.onclick = onClick;
      return button;
    };
    
    window.createSpacer = function() {
      const spacer = document.createElement('div');
      spacer.style.height = '10px';
      return spacer;
    };
    
    window.createTextSpan = function(text) {
      const span = document.createElement('span');
      span.textContent = text;
      span.style.display = 'block';
      span.style.margin = '5px 0';
      return span;
    };
    
    window.HistoryTracker = class HistoryTracker {
      constructor() {
        this.history = new Set();
      }
      has(id) {
        return this.history.has(id);
      }
      track(id) {
        this.history.add(id);
      }
    };
    
    window.LogCategory = {
      default: 'default'
    };
  });
  
  // Aguarda um pouco para as funções serem definidas
  await page.waitForTimeout(1000);
  
  // Agora injeta o código principal do scraper
  const scraperCode = fs.readFileSync('./src/main.ts', 'utf8');
  
  // Remove imports e exports do TypeScript
  const cleanScraperCode = scraperCode
    .replace(/import\s*{[^}]*}\s*from\s*['"][^'"]*['"]\s*;?/g, '')
    .replace(/export\s+/g, '')
    .replace(/interface\s+/g, 'class ');
  
  await page.evaluate(cleanScraperCode);
  
  // Ativa o scraper automaticamente
  await page.evaluate(() => {
    // Inicializa o scraper
    const scraper = new WhatsAppScraper();
    console.log('WhatsApp Scraper carregado e ativado!');
  });
  
  console.log('WhatsApp Scraper injetado e ativado com sucesso!');
  console.log('O scraper está pronto para uso. Use os botões na interface.');
  console.log('Navegador permanecerá aberto. Pressione Ctrl+C para fechar.');
})();