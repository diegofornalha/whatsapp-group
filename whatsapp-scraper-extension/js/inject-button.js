// Script simplificado - Apenas injeta botão para carregar o scraper
console.log('⚡ WhatsApp Scraper: Injetando botão...');

// Variáveis globais para o scraper
let memberListStore;
let logsTracker;
let modalObserver;
const counterId = 'scraper-number-tracker';
const exportName = 'whatsAppExport';

// Aguarda o WhatsApp carregar
function waitForWhatsApp() {
  const checkInterval = setInterval(() => {
    const app = document.getElementById('app');
    if (app) {
      clearInterval(checkInterval);
      injectButton();
    }
  }, 1000);
}

// Injeta o botão simples
function injectButton() {
  // Verifica se já existe
  if (document.getElementById('whatsapp-scraper-button')) {
    return;
  }
  
  // Cria container do botão
  const container = document.createElement('div');
  container.id = 'whatsapp-scraper-container';
  container.innerHTML = `
    <div class="scraper-header">
      <span class="scraper-icon">⚡</span>
      <h3>Carregar Script</h3>
    </div>
    <p class="scraper-description">Clique no botão abaixo para carregar o script de scraping:</p>
    <button id="whatsapp-scraper-button">
      Carregar WhatsApp Scraper
    </button>
  `;
  
  document.body.appendChild(container);
  
  // Adiciona evento ao botão
  document.getElementById('whatsapp-scraper-button').addEventListener('click', loadScraper);
  
  console.log('✅ WhatsApp Scraper: Botão injetado com sucesso!');
}

// Funções utilitárias
function exportToCsv(data, filename) {
  const csv = data.map(row => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

class ListStorage {
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
  
  get length() {
    return this.data.length;
  }
}

class UIContainer {
  constructor(title) {
    this.container = document.createElement('div');
    this.container.className = 'whatsapp-scraper-widget';
    this.container.innerHTML = '<h3>' + title + '</h3>';
    document.body.appendChild(this.container);
  }
  
  appendChild(element) {
    this.container.appendChild(element);
  }
}

function createCta(text, onClick) {
  const button = document.createElement('button');
  button.textContent = text;
  button.className = 'whatsapp-scraper-widget-button';
  if (typeof onClick === 'string') {
    button.appendChild(document.createTextNode(text));
  } else {
    button.onclick = onClick;
  }
  return button;
}

function createSpacer() {
  const spacer = document.createElement('div');
  spacer.style.height = '10px';
  return spacer;
}

function createTextSpan(text) {
  const span = document.createElement('span');
  span.textContent = text;
  span.style.display = 'inline';
  span.style.margin = '0';
  return span;
}

class HistoryTracker {
  constructor() {
    this.history = new Set();
  }
  
  has(id) {
    return this.history.has(id);
  }
  
  track(id) {
    this.history.add(id);
  }
}

// Funções do scraper
function cleanName(name) {
  const nameClean = name.trim();
  return nameClean.replace('~ ', '');
}

function cleanDescription(description) {
  const descriptionClean = description.trim();
  if(
    !descriptionClean.match(/Loading About/i) &&
    !descriptionClean.match(/I am using WhatsApp/i) &&
    !descriptionClean.match(/Available/i)
  ){
    return descriptionClean;
  }
  return null;
}

class WhatsAppStorage extends ListStorage {
  get headers() {
    return [
      'Phone Number',
      'Name', 
      'Description',
      'Source'
    ];
  }
  
  itemToRow(item) {
    return [
      item.phoneNumber || "",
      item.name || "",
      item.description || "",
      item.source || ""
    ];
  }
  
  toCsvData() {
    const rows = [this.headers];
    this.data.forEach(item => {
      rows.push(this.itemToRow(item));
    });
    return rows;
  }
  
  addElem(id, data, update) {
    const existing = this.data.find(item => item.profileId === id);
    if (existing && update) {
      Object.assign(existing, data);
    } else if (!existing) {
      this.add(data);
    }
  }
  
  getCount() {
    return this.length;
  }
}

async function updateCounter() {
  const tracker = document.getElementById(counterId);
  if(tracker){
    const countValue = memberListStore.getCount();
    tracker.textContent = countValue.toString();
  }
}

// Carrega o scraper quando o botão é clicado
function loadScraper() {
  const button = document.getElementById('whatsapp-scraper-button');
  const container = document.getElementById('whatsapp-scraper-container');
  
  // Muda o texto do botão
  button.textContent = 'Carregando...';
  button.disabled = true;
  
  console.log('🚀 WhatsApp Scraper: Carregando...');
  
  // Inicializa o scraper diretamente
  setTimeout(() => {
    initializeScraper();
    
    // Remove o botão após carregar
    setTimeout(() => {
      container.style.opacity = '0';
      container.style.transition = 'opacity 0.3s ease-out';
      setTimeout(() => container.remove(), 300);
    }, 1000);
  }, 100);
}

// Inicializa o scraper
function initializeScraper() {
  console.log('🚀 WhatsApp Scraper: Inicializando...');
  
  // Inicializar o storage
  memberListStore = new WhatsAppStorage();
  
  // Criar UI
  const uiWidget = new UIContainer('WhatsApp Scraper');
  
  // History Tracker
  logsTracker = new HistoryTracker();
  
  // Button Download
  const btnDownload = createCta('Download 0 users');
  btnDownload.onclick = async function() {
    const timestamp = new Date().toISOString();
    const data = memberListStore.toCsvData();
    try{
      exportToCsv(data, exportName + '-' + timestamp + '.csv');
    }catch(err){
      console.error('Error while generating export');
      console.log(err.stack);
    }
  };
  
  // Criar span para o contador dentro do botão
  btnDownload.innerHTML = '';
  btnDownload.appendChild(createTextSpan('Download '));
  const counterSpan = createTextSpan('0');
  counterSpan.id = counterId;
  btnDownload.appendChild(counterSpan);
  btnDownload.appendChild(createTextSpan(' users'));
  
  uiWidget.appendChild(btnDownload);
  uiWidget.appendChild(createSpacer());
  
  // Button Reset
  const btnReinit = createCta('Reset');
  btnReinit.onclick = async function() {
    memberListStore.clear();
    await updateCounter();
    console.log('Data cleared');
  };
  
  uiWidget.appendChild(btnReinit);
  uiWidget.appendChild(createSpacer());
  
  // Status text
  const statusText = createTextSpan('Aguardando abertura de grupo...');
  statusText.id = 'scraper-status';
  statusText.style.display = 'block';
  uiWidget.appendChild(statusText);
  
  // Start monitoring
  startMonitoring();
  
  console.log('✅ WhatsApp Scraper: Interface criada com sucesso!');
  console.log('📌 Abra um grupo e clique no nome para ver os membros');
}

function listenModalChanges() {
  const groupNameNode = document.querySelectorAll("header span[style*='height']:not(.copyable-text)");
  let source = null;
  if(groupNameNode.length == 1){
    source = groupNameNode[0].textContent;
  }
  
  const modalElems = document.querySelectorAll('[data-animate-modal-body="true"]');
  if(modalElems.length === 0) return;
  
  const modalElem = modalElems[0];
  const targetNode = modalElem.querySelectorAll("div[style*='height']")[1];
  
  if(!targetNode) return;
  
  const config = { attributes: true, childList: true, subtree: true };
  
  const callback = (mutationList) => {
    for (const mutation of mutationList) {
      if (mutation.type === "attributes") {
        const target = mutation.target;
        const tagName = target.tagName;
        
        if(
          tagName.toLowerCase() !== 'div' ||
          target.getAttribute("role") !== "listitem"
        ){
          continue;
        }
        
        const listItem = target;
        
        setTimeout(async () => {
          let profileName = "";
          let profileDescription = "";
          let profilePhone = "";
          
          // Name
          const titleElems = listItem.querySelectorAll("span[title]:not(.copyable-text)");
          if(titleElems.length > 0){
            const text = titleElems[0].textContent;
            if(text){
              const name = cleanName(text);
              if(name && name.length > 0){
                profileName = name;
              }
            }
          }
          
          if(profileName.length === 0){
            return;
          }
          
          // Description
          const descriptionElems = listItem.querySelectorAll("span[title].copyable-text");
          if(descriptionElems.length > 0){
            const text = descriptionElems[0].textContent;
            if(text){
              const description = cleanDescription(text);
              if(description && description.length > 0){
                profileDescription = description;
              }
            }
          }
          
          // Phone
          const phoneElems = listItem.querySelectorAll("span[style*='height']:not([title])");
          if(phoneElems.length > 0){
            const text = phoneElems[0].textContent;
            if(text){
              const textClean = text.trim();
              if(textClean && textClean.length > 0){
                profilePhone = textClean;
              }
            }
          }
          
          if(profileName){
            const identifier = profilePhone ? profilePhone : profileName;
            console.log('Encontrado:', identifier);
            
            const data = {};
            
            if(source){
              data.source = source;
            }
            
            if(profileDescription){
              data.description = profileDescription;
            }
            
            if(profilePhone){
              data.phoneNumber = profilePhone;
              if(profileName){
                data.name = profileName;
              }
            }else{
              if(profileName){
                data.phoneNumber = profileName;
              }
            }
            
            memberListStore.addElem(
              identifier, {
                profileId: identifier,
                ...data
              },
              true
            );
            
            updateCounter();
            updateStatus('Coletando: ' + profileName);
          }
        }, 10);
      }
    }
  };
  
  modalObserver = new MutationObserver(callback);
  modalObserver.observe(targetNode, config);
  updateStatus('Modal detectado - Role a lista para coletar dados');
}

function stopListeningModalChanges() {
  if(modalObserver){
    modalObserver.disconnect();
    updateStatus('Coleta pausada');
  }
}

function updateStatus(message) {
  const statusText = document.getElementById('scraper-status');
  if(statusText) {
    statusText.textContent = message;
  }
}

function startMonitoring() {
  updateStatus('Monitorando página...');
  
  function bodyCallback(mutationList) {
    for (const mutation of mutationList) {
      if (mutation.type === "childList") {
        if(mutation.addedNodes.length > 0){
          mutation.addedNodes.forEach((node) => {
            if(node.nodeType === Node.ELEMENT_NODE) {
              const modalElems = node.querySelectorAll('[data-animate-modal-body="true"]');
              if(modalElems.length > 0){
                setTimeout(() => {
                  listenModalChanges();
                }, 10);
              }
            }
          });
        }
        
        if(mutation.removedNodes.length > 0){
          mutation.removedNodes.forEach((node) => {
            if(node.nodeType === Node.ELEMENT_NODE) {
              const modalElems = node.querySelectorAll('[data-animate-modal-body="true"]');
              if(modalElems.length > 0){
                stopListeningModalChanges();
              }
            }
          });
        }
      }
    }
  }
  
  const bodyConfig = { attributes: false, childList: true, subtree: true };
  const bodyObserver = new MutationObserver(bodyCallback);
  
  const app = document.getElementById('app');
  if(app){
    bodyObserver.observe(app, bodyConfig);
  } else {
    bodyObserver.observe(document.body, bodyConfig);
  }
}

// Inicia quando a página carregar
waitForWhatsApp();