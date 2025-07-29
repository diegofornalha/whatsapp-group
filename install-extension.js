const { exec } = require('child_process');
const path = require('path');

console.log('Instruções para instalar a extensão WhatsApp Scraper:\n');
console.log('1. Primeiro, crie os ícones:');
console.log('   - Abra whatsapp-scraper-extension/images/create-icons.html no navegador');
console.log('   - Baixe os 3 ícones gerados\n');

console.log('2. Abrindo página de extensões do Chrome...');

// Abre o Chrome na página de extensões
const chromeCommand = process.platform === 'darwin' 
  ? 'open -a "Google Chrome" chrome://extensions/'
  : process.platform === 'win32'
  ? 'start chrome chrome://extensions/'
  : 'google-chrome chrome://extensions/';

exec(chromeCommand, (error) => {
  if (error) {
    console.log('\nNão foi possível abrir o Chrome automaticamente.');
    console.log('Abra manualmente e acesse: chrome://extensions/\n');
  }
});

console.log('\n3. No Chrome:');
console.log('   - Ative o "Modo do desenvolvedor" (canto superior direito)');
console.log('   - Clique em "Carregar sem compactação"');
console.log('   - Selecione a pasta:', path.join(__dirname, 'whatsapp-scraper-extension'));
console.log('\n4. Pronto! Acesse https://web.whatsapp.com e a extensão estará ativa.');