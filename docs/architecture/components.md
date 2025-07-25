# 🧩 Componentes - WhatsApp Group Scraper

## 📋 Visão Geral dos Componentes

### Hierarquia de Componentes
```mermaid
graph TD
    subgraph "Main Application"
        MAIN[WhatsAppScraper]
    end
    
    subgraph "UI Layer"
        UI[UIContainer]
        WIDGET[FloatingWidget] 
        BUTTONS[Control Buttons]
        HIST[HistoryTracker]
    end
    
    subgraph "Core Logic"
        OBS[DOMObserver]
        EXTRACT[DataExtractor]
        VALID[DataValidator]
        FILTER[DataFilter]
    end
    
    subgraph "Storage Layer"
        STORAGE[StorageManager]
        CACHE[MemoryCache]
        IDB[IndexedDBStore]
    end
    
    subgraph "Export Layer"
        EXPORT[DataExporter]
        CSV[CSVGenerator]
        DOWNLOAD[FileDownloader]
    end
    
    MAIN --> UI
    MAIN --> OBS
    MAIN --> STORAGE
    MAIN --> EXPORT
    
    UI --> WIDGET
    UI --> BUTTONS
    UI --> HIST
    
    OBS --> EXTRACT
    EXTRACT --> VALID
    VALID --> FILTER
    
    STORAGE --> CACHE
    STORAGE --> IDB
    
    EXPORT --> CSV
    EXPORT --> DOWNLOAD
    
    classDef main fill:#ff6b6b
    classDef ui fill:#4ecdc4
    classDef core fill:#45b7d1  
    classDef storage fill:#f9ca24
    classDef export fill:#f0932b
    
    class MAIN main
    class UI,WIDGET,BUTTONS,HIST ui  
    class OBS,EXTRACT,VALID,FILTER core
    class STORAGE,CACHE,IDB storage
    class EXPORT,CSV,DOWNLOAD export
```

## 🎮 Componentes de Interface

### UIContainer
```typescript
/**
 * Container principal da interface flutuante
 * Responsável por coordenar todos os elementos visuais
 */
class UIContainer {
  private canva: HTMLElement;
  private inner: HTMLElement;
  private container: HTMLElement;
  private history: HTMLElement;
  private ctas: HTMLElement[] = [];
  
  constructor() {
    this.createCanvas();
    this.createInnerContainer();
    this.setupHistorySection();
    this.setupControlsContainer();
  }
  
  /**
   * Cria o canvas principal que contém toda a interface
   */
  private createCanvas(): void {
    this.canva = document.createElement('div');
    this.canva.setAttribute('style', [
      'position: fixed;',
      'top: 0;',
      'left: 0;',
      'z-index: 10000;',
      'width: 100%;',
      'height: 100%;',
      'pointer-events: none;'
    ].join(''));
  }
  
  /**
   * Adiciona funcionalidade de arrastar e soltar
   */
  makeItDraggable(): void {
    let startX = 0, startY = 0, currentX = 0, currentY = 0;
    
    const dragMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      startX = e.clientX - this.inner.offsetLeft;
      startY = e.clientY - this.inner.offsetTop;
      
      document.addEventListener('mousemove', elementDrag);
      document.addEventListener('mouseup', closeDragElement);
    };
    
    const elementDrag = (e: MouseEvent) => {
      currentX = e.clientX - startX;
      currentY = e.clientY - startY;
      this.updatePosition(currentX, currentY);
    };
    
    this.inner.addEventListener('mousedown', dragMouseDown);
  }
  
  /**
   * Renderiza a interface na página
   */
  render(): void {
    document.body.appendChild(this.canva);
  }
}
```

### ControlButtons
```typescript
/**
 * Factory para criação de botões de controle
 */
class ControlButtonFactory {
  private static styles = [
    'display: block;',
    'padding: 0px 4px;',
    'cursor: pointer;',
    'text-align: center;'
  ];
  
  /**
   * Cria um botão de controle genérico
   */
  static createButton(text: string, onClick: () => void): HTMLElement {
    const button = document.createElement('div');
    button.setAttribute('style', this.styles.join(''));
    button.textContent = text;
    button.addEventListener('click', onClick);
    return button;
  }
  
  /**
   * Cria botão de download com contador
   */
  static createDownloadButton(counterId: string): HTMLElement {
    const button = this.createButton('', () => {});
    
    // Adiciona elementos do contador
    const downloadText = this.createTextSpan('Download ');
    const counter = this.createTextSpan('0', { 
      bold: true, 
      id: counterId 
    });
    const usersText = this.createTextSpan(' users');
    
    button.appendChild(downloadText);
    button.appendChild(counter);
    button.appendChild(usersText);
    
    return button;
  }
  
  private static createTextSpan(text: string, options?: {
    bold?: boolean;
    id?: string;
  }): HTMLElement {
    const span = document.createElement('span');
    
    if (options?.bold) {
      const strong = document.createElement('strong');
      strong.textContent = text;
      span.appendChild(strong);
    } else {
      span.textContent = text;
    }
    
    if (options?.id) {
      span.setAttribute('id', options.id);
    }
    
    return span;
  }
}
```

### HistoryTracker
```typescript
/**
 * Componente responsável pelo histórico de atividades
 */
class HistoryTracker {
  private maxLogs: number;
  private logs: HistoryLog[] = [];
  private panelRef: HTMLElement | null = null;
  private counter: number = 0;
  
  constructor(config: {
    onDelete: (groupId: string) => Promise<void>;
    divContainer: HTMLElement;
    maxLogs?: number;
  }) {
    this.maxLogs = config.maxLogs || 5;
    this.onDelete = config.onDelete;
    this.container = config.divContainer;
  }
  
  /**
   * Adiciona uma nova entrada ao histórico
   */
  addHistoryLog(entry: {
    label: string;
    category: LogCategory;
    groupId?: string;
    numberItems?: number;
    cancellable?: boolean;
  }): void {
    this.counter++;
    
    const log: HistoryLog = {
      index: this.counter,
      label: entry.label,
      category: entry.category,
      createdAt: new Date(),
      ...entry
    };
    
    this.logs.unshift(log);
    
    // Mantém apenas os logs mais recentes
    if (this.logs.length > this.maxLogs) {
      this.logs.splice(this.maxLogs);
    }
    
    this.renderLogs();
  }
  
  /**
   * Renderiza os logs na interface
   */
  private renderLogs(): void {
    if (this.panelRef) {
      this.panelRef.remove();
    }
    
    if (this.logs.length === 0) return;
    
    const panel = this.createPanel();
    const list = this.createLogsList();
    
    this.logs.forEach(log => {
      const listItem = this.createLogItem(log);
      list.prepend(listItem);
    });
    
    panel.appendChild(list);
    this.panelRef = panel;
    this.container.appendChild(panel);
  }
  
  /**
   * Cria item individual do log
   */
  private createLogItem(log: HistoryLog): HTMLElement {
    const item = document.createElement('li');
    item.setAttribute('style', [
      'line-height: 30px;',
      'display: flex;',
      'align-items: center;',
      'justify-content: right;'
    ].join(''));
    
    // Conteúdo do log
    const content = this.createLogContent(log);
    item.appendChild(content);
    
    // Botão de deletar (se aplicável)
    if (log.category === LogCategory.ADD && log.cancellable) {
      const deleteButton = this.createDeleteButton(log);
      item.appendChild(deleteButton);
    }
    
    return item;
  }
}

/**
 * Enums e interfaces para o sistema de logs
 */
enum LogCategory {
  ADD = 'add',
  LOG = 'log'
}

interface HistoryLog {
  index: number;
  label: string;
  category: LogCategory;
  createdAt: Date;
  groupId?: string;
  numberItems?: number;
  cancellable?: boolean;
}
```

## 🔍 Componentes de Observação

### DOMObserver
```typescript
/**
 * Observador principal das mudanças DOM do WhatsApp
 */
class DOMObserver {
  private mutationObserver: MutationObserver | null = null;
  private isActive: boolean = false;
  private targetNode: HTMLElement | null = null;
  
  /**
   * Inicia a observação de mudanças DOM
   */
  startObservation(targetSelector: string): void {
    this.targetNode = document.querySelector(targetSelector) as HTMLElement;
    
    if (!this.targetNode) {
      throw new Error(`Target element not found: ${targetSelector}`);
    }
    
    const config: MutationObserverInit = {
      attributes: true,
      childList: true,
      subtree: true
    };
    
    this.mutationObserver = new MutationObserver((mutations) => {
      this.handleMutations(mutations);
    });
    
    this.mutationObserver.observe(this.targetNode, config);
    this.isActive = true;
  }
  
  /**
   * Processa as mutações DOM detectadas
   */
  private handleMutations(mutations: MutationRecord[]): void {
    for (const mutation of mutations) {
      switch (mutation.type) {
        case 'childList':
          this.handleChildListMutation(mutation);
          break;
        case 'attributes':
          this.handleAttributeMutation(mutation);
          break;
      }
    }
  }
  
  /**
   * Processa adição/remoção de elementos filhos
   */
  private handleChildListMutation(mutation: MutationRecord): void {
    // Novos nós adicionados
    if (mutation.addedNodes.length > 0) {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          this.processNewElement(node as HTMLElement);
        }
      });
    }
    
    // Nós removidos
    if (mutation.removedNodes.length > 0) {
      mutation.removedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          this.processRemovedElement(node as HTMLElement);
        }
      });
    }
  }
  
  /**
   * Processa mudanças de atributos
   */
  private handleAttributeMutation(mutation: MutationRecord): void {
    const target = mutation.target as HTMLElement;
    
    // Verifica se é um item de lista de membro
    if (this.isMemberListItem(target)) {
      // Delay para garantir que todos os dados foram carregados
      setTimeout(() => {
        this.processMemberListItem(target);
      }, 10);
    }
  }
  
  /**
   * Verifica se o elemento é um item de membro
   */
  private isMemberListItem(element: HTMLElement): boolean {
    return element.tagName.toLowerCase() === 'div' && 
           element.getAttribute('role') === 'listitem';
  }
  
  /**
   * Para a observação e limpa recursos
   */
  stopObservation(): void {
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }
    this.isActive = false;
    this.targetNode = null;
  }
}
```

### DataExtractor
```typescript
/**
 * Extrator de dados dos elementos DOM do WhatsApp
 */
class DataExtractor {
  /**
   * Extrai dados de membro de um elemento DOM
   */
  extractMemberData(element: HTMLElement): WhatsAppMember | null {
    try {
      const memberData: Partial<WhatsAppMember> = {};
      
      // Extrai nome
      const name = this.extractName(element);
      if (!name) return null; // Nome é obrigatório
      
      // Extrai telefone
      const phone = this.extractPhone(element);
      
      // Extrai descrição
      const description = this.extractDescription(element);
      
      // Extrai fonte (nome do grupo)
      const source = this.extractSource();
      
      // Monta objeto do membro
      const profileId = phone || name;
      
      return {
        profileId,
        name: phone ? name : undefined, // Se tem telefone, nome vai para campo name
        phoneNumber: phone || (phone ? undefined : name), // Se não tem telefone, nome vai para phoneNumber
        description,
        source
      };
      
    } catch (error) {
      console.error('Error extracting member data:', error);
      return null;
    }
  }
  
  /**
   * Extrai nome do membro
   */
  private extractName(element: HTMLElement): string | null {
    const nameElements = element.querySelectorAll('span[title]:not(.copyable-text)');
    
    if (nameElements.length > 0) {
      const nameText = nameElements[0].textContent;
      if (nameText) {
        return this.cleanName(nameText);
      }
    }
    
    return null;
  }
  
  /**
   * Extrai número de telefone
   */
  private extractPhone(element: HTMLElement): string | null {
    const phoneElements = element.querySelectorAll('span[style*="height"]:not([title])');
    
    if (phoneElements.length > 0) {
      const phoneText = phoneElements[0].textContent;
      if (phoneText) {
        const cleanPhone = phoneText.trim();
        return cleanPhone.length > 0 ? cleanPhone : null;
      }
    }
    
    return null;
  }
  
  /**
   * Extrai descrição do perfil
   */
  private extractDescription(element: HTMLElement): string | null {
    const descElements = element.querySelectorAll('span[title].copyable-text');
    
    if (descElements.length > 0) {
      const descText = descElements[0].textContent;
      if (descText) {
        return this.cleanDescription(descText);
      }
    }
    
    return null;
  }
  
  /**
   * Extrai nome do grupo atual
   */
  private extractSource(): string | null {
    const groupNameElements = document.querySelectorAll('header span[style*="height"]:not(.copyable-text)');
    
    if (groupNameElements.length === 1) {
      return groupNameElements[0].textContent;
    }
    
    return null;
  }
  
  /**
   * Limpa e normaliza nomes
   */
  private cleanName(name: string): string {
    return name.trim().replace('~ ', '');
  }
  
  /**
   * Limpa e valida descrições
   */
  private cleanDescription(description: string): string | null {
    const cleanDesc = description.trim();
    
    // Filtra descrições padrão do sistema
    if (cleanDesc.match(/Loading About/i) ||
        cleanDesc.match(/I am using WhatsApp/i) ||
        cleanDesc.match(/Available/i)) {
      return null;
    }
    
    return cleanDesc;
  }
}

/**
 * Interface para dados de membro do WhatsApp
 */
interface WhatsAppMember {
  profileId: string;
  name?: string;
  phoneNumber?: string;
  description?: string;
  source?: string;
}
```

## 💾 Componentes de Armazenamento

### StorageManager
```typescript
/**
 * Gerenciador central de armazenamento
 * Coordena diferentes tipos de storage (memória, IndexedDB, sessão)
 */
class StorageManager {
  private memoryCache: Map<string, WhatsAppMember> = new Map();
  private indexedDBStore: IndexedDBStorage;
  private isInitialized: boolean = false;
  
  constructor(config: { name: string; persistent?: boolean }) {
    this.indexedDBStore = new IndexedDBStorage(config);
    this.init();
  }
  
  /**
   * Inicializa o sistema de storage
   */
  private async init(): Promise<void> {
    try {
      await this.indexedDBStore.init();
      await this.loadCacheFromPersistent();
      this.isInitialized = true;
    } catch (error) {
      console.warn('Persistent storage unavailable, using memory only:', error);
      this.isInitialized = true;
    }
  }
  
  /**
   * Carrega dados persistentes para o cache em memória
   */
  private async loadCacheFromPersistent(): Promise<void> {
    try {
      const persistentData = await this.indexedDBStore.getAll();
      persistentData.forEach((member, id) => {
        this.memoryCache.set(id, member);
      });
    } catch (error) {
      console.error('Error loading cache from persistent storage:', error);
    }
  }
  
  /**
   * Adiciona ou atualiza um membro
   */
  async addMember(
    id: string, 
    member: WhatsAppMember, 
    update: boolean = false
  ): Promise<boolean> {
    if (!this.isInitialized) {
      await this.init();
    }
    
    try {
      // Atualiza cache em memória
      if (update || !this.memoryCache.has(id)) {
        this.memoryCache.set(id, member);
        
        // Persiste no IndexedDB
        await this.indexedDBStore.store(id, member, update);
        
        return true;
      }
      
      return false; // Não houve mudança
    } catch (error) {
      console.error('Error adding member:', error);
      return false;
    }
  }
  
  /**
   * Remove membros de um grupo específico
   */
  async deleteFromGroup(groupId: string): Promise<number> {
    let deletedCount = 0;
    
    try {
      // Remove do cache em memória
      for (const [id, member] of this.memoryCache.entries()) {
        if (member.source === groupId) {
          this.memoryCache.delete(id);
          deletedCount++;
        }
      }
      
      // Remove do armazenamento persistente
      if (this.indexedDBStore) {
        await this.indexedDBStore.deleteByGroup(groupId);
      }
      
      return deletedCount;
    } catch (error) {
      console.error('Error deleting from group:', error);
      return 0;
    }
  }
  
  /**
   * Obtém contagem total de membros
   */
  async getCount(): Promise<number> {
    return this.memoryCache.size;
  }
  
  /**
   * Obtém todos os membros
   */
  async getAll(): Promise<Map<string, WhatsAppMember>> {
    return new Map(this.memoryCache);
  }
  
  /**
   * Limpa todos os dados
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
    
    if (this.indexedDBStore) {
      await this.indexedDBStore.clear();
    }
  }
  
  /**
   * Exporta dados para CSV
   */
  async exportToCSV(): Promise<string[][]> {
    const headers = ['Phone Number', 'Name', 'Description', 'Source'];
    const rows: string[][] = [headers];
    
    for (const member of this.memoryCache.values()) {
      rows.push([
        member.phoneNumber || '',
        member.name || '',
        member.description || '',
        member.source || ''
      ]);
    }
    
    return rows;
  }
}
```

### IndexedDBStorage
```typescript
/**
 * Implementação específica do armazenamento IndexedDB
 */
class IndexedDBStorage {
  private db: IDBDatabase | null = null;
  private dbName: string;
  private version: number = 6;
  
  constructor(config: { name: string }) {
    this.dbName = `storage-${config.name}`;
  }
  
  /**
   * Inicializa a conexão com IndexedDB
   */
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.upgradeDatabase(db, event.oldVersion);
      };
    });
  }
  
  /**
   * Atualiza estrutura do banco de dados
   */
  private upgradeDatabase(db: IDBDatabase, oldVersion: number): void {
    // Remove store antiga se existir
    if (oldVersion < 5) {
      try {
        db.deleteObjectStore('data');
      } catch (error) {
        // Store não existe, ok
      }
    }
    
    // Cria ou obtém object store
    let store: IDBObjectStore;
    if (db.objectStoreNames.contains('data')) {
      const transaction = (event?.target as IDBOpenDBRequest)?.transaction;
      store = transaction?.objectStore('data')!;
    } else {
      store = db.createObjectStore('data', {
        keyPath: '_id',
        autoIncrement: true
      });
    }
    
    // Cria índices se não existirem
    if (!store.indexNames.contains('_createdAt')) {
      store.createIndex('_createdAt', '_createdAt');
    }
    
    if (!store.indexNames.contains('_groupId')) {
      store.createIndex('_groupId', '_groupId');
    }
    
    if (!store.indexNames.contains('_pk')) {
      store.createIndex('_pk', '_pk', { unique: true });
    }
  }
  
  /**
   * Armazena um membro no IndexedDB
   */
  async store(
    id: string, 
    member: WhatsAppMember, 
    update: boolean = false
  ): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['data'], 'readwrite');
      const store = transaction.objectStore('data');
      
      // Verifica se já existe
      const getRequest = store.index('_pk').get(id);
      
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        
        if (existing && !update) {
          resolve(); // Já existe e não é para atualizar
          return;
        }
        
        const data = {
          _pk: id,
          _createdAt: existing?.createdAt || new Date(),
          _groupId: member.source,
          ...member
        };
        
        const putRequest = existing ? 
          store.put({ ...existing, ...data }) : 
          store.put(data);
        
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    });
  }
}
```

## 📤 Componentes de Exportação

### DataExporter
```typescript
/**
 * Exportador de dados para diferentes formatos
 */
class DataExporter {
  /**
   * Exporta dados para arquivo CSV
   */
  async exportToCSV(
    filename: string, 
    data: string[][], 
    delimiter: string = ','
  ): Promise<void> {
    try {
      const csvContent = this.generateCSVContent(data, delimiter);
      const blob = new Blob([csvContent], { 
        type: 'text/csv;charset=utf-8;' 
      });
      
      this.downloadBlob(blob, filename);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      throw error;
    }
  }
  
  /**
   * Gera conteúdo CSV a partir dos dados
   */
  private generateCSVContent(data: string[][], delimiter: string): string {
    return data.map(row => 
      row.map(cell => this.escapeCSVCell(cell)).join(delimiter)
    ).join('\n');
  }
  
  /**
   * Escapa células CSV adequadamente
   */
  private escapeCSVCell(cell: string): string {
    const cellStr = cell?.toString() || '';
    
    // Se contém delimitador, quebra de linha ou aspas, precisa escapar
    if (cellStr.includes('"') || cellStr.includes(',') || cellStr.includes('\n')) {
      return `"${cellStr.replace(/"/g, '""')}"`;
    }
    
    return cellStr;
  }
  
  /**
   * Inicia download do blob
   */
  private downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Limpa URL para liberar memória
    URL.revokeObjectURL(url);
  }
}
```

---

**Próximo**: Explore o [Fluxo de Dados](./data-flow.md) para entender como estes componentes interagem entre si.