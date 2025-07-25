# 📝 API - WhatsApp Group Scraper

## 📋 Índice do Cluster

| Documento | Descrição |
|-----------|-----------|
| [🏷️ Interfaces TypeScript](./typescript-interfaces.md) | Definições de tipos e interfaces |
| [🔌 APIs Públicas](./public-apis.md) | APIs expostas para customização |
| [🌐 DOM APIs](./dom-apis.md) | Integração com WhatsApp Web DOM |
| [💾 Storage APIs](./storage-apis.md) | APIs de armazenamento e cache |

## 🎯 Interfaces Principais

### WhatsAppMember
```typescript
/**
 * Interface que representa um membro do grupo WhatsApp
 */
interface WhatsAppMember {
  /** ID único do perfil (telefone ou nome) */
  profileId: string;
  
  /** Nome exibido do membro (opcional) */
  name?: string;
  
  /** Número de telefone (opcional) */
  phoneNumber?: string;
  
  /** Descrição do perfil (status/bio) */
  description?: string;
  
  /** Nome do grupo de origem */
  source?: string;
}
```

### StorageInterface
```typescript
/**
 * Interface para diferentes tipos de armazenamento
 */
interface IStorage {
  /** Armazena um item */
  store(key: string, data: any): Promise<void>;
  
  /** Recupera um item */
  retrieve(key: string): Promise<any>;
  
  /** Remove um item */
  delete(key: string): Promise<void>;
  
  /** Limpa todos os dados */
  clear(): Promise<void>;
  
  /** Conta total de itens */
  count(): Promise<number>;
}
```

### ScraperConfig
```typescript
/**
 * Configuração do scraper
 */
interface ScraperConfig {
  /** Nome para identificação do storage */
  name: string;
  
  /** Se deve usar armazenamento persistente */
  persistent?: boolean;
  
  /** Máximo de logs no histórico */
  maxLogs?: number;
  
  /** Configurações de UI */
  ui?: {
    draggable?: boolean;
    position?: { x: number; y: number };
  };
}
```

## 🔌 APIs Públicas

### ScraperAPI
```typescript
/**
 * API principal exposta globalmente
 */
interface ScraperAPI {
  /** Inicia o scraper */
  start(): void;
  
  /** Para o scraper */
  stop(): void;
  
  /** Obtém estatísticas */
  getStats(): ScraperStats;
  
  /** Limpa dados */
  clear(): Promise<void>;
  
  /** Exporta dados */
  export(format: 'csv' | 'json'): Promise<void>;
}

// Disponível globalmente
declare global {
  interface Window {
    whatsappScraper: ScraperAPI;
  }
}
```

### Eventos
```typescript
/**
 * Eventos do sistema
 */
type ScraperEvents = {
  'member-added': WhatsAppMember;
  'member-updated': WhatsAppMember;
  'export-complete': { count: number; filename: string };
  'error': { error: Error; context: string };
};

/**
 * Event emitter para o scraper
 */
interface ScraperEventEmitter {
  on<K extends keyof ScraperEvents>(
    event: K, 
    listener: (data: ScraperEvents[K]) => void
  ): void;
  
  emit<K extends keyof ScraperEvents>(
    event: K, 
    data: ScraperEvents[K]
  ): void;
}
```

## 🌐 DOM Integration

### DOMSelectors
```typescript
/**
 * Seletores DOM para elementos do WhatsApp
 */
const DOM_SELECTORS = {
  // Modal de membros
  membersModal: '[data-animate-modal-body="true"]',
  membersList: 'div[style*="height"]',
  
  // Item de membro individual
  memberItem: 'div[role="listitem"]',
  memberName: 'span[title]:not(.copyable-text)',
  memberPhone: 'span[style*="height"]:not([title])',
  memberDescription: 'span[title].copyable-text',
  
  // Header do grupo
  groupHeader: 'header span[style*="height"]:not(.copyable-text)',
  
  // App principal
  mainApp: '#app'
} as const;
```

### MutationConfig
```typescript
/**
 * Configuração para MutationObserver
 */
const MUTATION_CONFIG: MutationObserverInit = {
  attributes: true,
  childList: true,
  subtree: true,
  attributeOldValue: false,
  characterData: false,
  characterDataOldValue: false
};
```

## 💾 Storage APIs

### IndexedDB Schema
```typescript
/**
 * Esquema do banco IndexedDB
 */
interface DBSchema {
  /** Nome do banco */
  name: string;
  
  /** Versão atual */
  version: number;
  
  /** Object stores */
  stores: {
    data: {
      key: number; // _id auto-increment
      value: {
        _id?: number;
        _pk: string;        // chave única
        _createdAt: Date;   // data de criação
        _groupId?: string;  // ID do grupo
        profileId: string;
        name?: string;
        phoneNumber?: string;
        description?: string;
        source?: string;
      };
      indexes: {
        '_pk': string;
        '_createdAt': Date;
        '_groupId': string;
      };
    };
  };
}
```

### Cache API
```typescript
/**
 * API do sistema de cache
 */
interface CacheAPI {
  /** Armazena item no cache */
  set(key: string, value: any, ttl?: number): void;
  
  /** Recupera item do cache */
  get(key: string): any | null;
  
  /** Verifica se item existe */
  has(key: string): boolean;
  
  /** Remove item */
  delete(key: string): boolean;
  
  /** Limpa cache */
  clear(): void;
  
  /** Obtém tamanho do cache */
  size(): number;
}
```

## 🔄 Export APIs

### CSVExporter
```typescript
/**
 * API do exportador CSV
 */
interface CSVExporter {
  /** Exporta dados para CSV */
  export(data: any[][]): string;
  
  /** Configura delimitador */
  setDelimiter(delimiter: string): void;
  
  /** Escapa células CSV */
  escapeCell(cell: string): string;
  
  /** Gera headers */
  generateHeaders(data: any[]): string[];
}
```

### FileDownloader
```typescript
/**
 * API do downloader de arquivos
 */
interface FileDownloader {
  /** Faz download de blob */
  downloadBlob(blob: Blob, filename: string): void;
  
  /** Faz download de texto */
  downloadText(content: string, filename: string, mimeType?: string): void;
  
  /** Faz download de JSON */
  downloadJSON(data: any, filename: string): void;
}
```

## 🛠️ Utility APIs

### DataValidator
```typescript
/**
 * API de validação de dados
 */
interface DataValidator {
  /** Valida membro do WhatsApp */
  validateMember(member: any): member is WhatsAppMember;
  
  /** Valida telefone */
  validatePhone(phone: string): boolean;
  
  /** Valida nome */
  validateName(name: string): boolean;
  
  /** Sanitiza dados */
  sanitize(data: any): any;
}
```

### DataFilter
```typescript
/**
 * API de filtragem de dados
 */
interface DataFilter {
  /** Remove duplicatas */
  removeDuplicates(members: WhatsAppMember[]): WhatsAppMember[];
  
  /** Filtra por grupo */
  filterByGroup(members: WhatsAppMember[], groupName: string): WhatsAppMember[];
  
  /** Filtra mensagens do sistema */
  filterSystemMessages(description: string): boolean;
  
  /** Normaliza telefones */
  normalizePhone(phone: string): string;
}
```

## 🔌 Plugin System APIs

### Plugin Interface
```typescript
/**
 * Interface para plugins
 */
interface ScraperPlugin {
  /** Nome do plugin */
  readonly name: string;
  
  /** Versão do plugin */
  readonly version: string;
  
  /** Inicializa plugin */
  init(scraper: WhatsAppScraper): void;
  
  /** Processa dados */
  process?(data: any): any;
  
  /** Cleanup do plugin */
  destroy(): void;
}
```

### Plugin Manager
```typescript
/**
 * Gerenciador de plugins
 */
interface PluginManager {
  /** Registra plugin */
  register(plugin: ScraperPlugin): void;
  
  /** Remove plugin */
  unregister(pluginName: string): void;
  
  /** Lista plugins */
  list(): ScraperPlugin[];
  
  /** Executa hook */
  executeHook(hookName: string, data?: any): any;
}
```

## 📊 Statistics APIs

### ScraperStats
```typescript
/**
 * Estatísticas do scraper
 */
interface ScraperStats {
  /** Total de membros extraídos */
  totalMembers: number;
  
  /** Membros por grupo */
  membersByGroup: Record<string, number>;
  
  /** Tempo de execução */
  executionTime: number;
  
  /** Taxa de sucesso */
  successRate: number;
  
  /** Erros encontrados */
  errors: Array<{
    error: string;
    context: string;
    timestamp: Date;
  }>;
}
```

---

**Próximo**: Explore as [Interfaces TypeScript](./typescript-interfaces.md) para definições detalhadas ou consulte as [APIs Públicas](./public-apis.md) para customização.