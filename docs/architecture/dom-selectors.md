# 🎯 Seletores DOM - WhatsApp Web

## 📋 Mapeamento Completo dos Seletores

### Estrutura DOM do WhatsApp Web

```html
<!-- App Principal -->
<div id="app">
    <!-- Header do Grupo -->
    <header>
        <span style="height: 40px">Nome do Grupo</span>
    </header>
    
    <!-- Modal de Membros -->
    <div data-animate-modal-body="true">
        <div style="height: 500px">
            <!-- Container da Lista -->
            <div style="height: 400px">
                <!-- Item Individual de Membro -->
                <div role="listitem">
                    <!-- Nome do Membro -->
                    <span title="João Silva">João Silva</span>
                    
                    <!-- Telefone (sem title) -->
                    <span style="height: 21px">+55 11 99999-9999</span>
                    
                    <!-- Status/Descrição -->
                    <span title="Desenvolvedor" class="copyable-text">
                        Desenvolvedor
                    </span>
                </div>
            </div>
        </div>
    </div>
</div>
```

## 🔍 Seletores Utilizados

### Detecção de Elementos Principais

```typescript
const SELECTORS = {
    // App base
    APP: '#app',
    
    // Modal de membros
    MODAL: '[data-animate-modal-body="true"]',
    MODAL_CONTENT: "div[style*='height']",
    
    // Lista de grupos
    GROUP_LIST_ITEM: '[role="listitem"] [data-testid="cell-frame-container"]',
    GROUP_NAME: 'span[title]',
    
    // Header do grupo ativo
    GROUP_HEADER: 'header [data-testid="conversation-info-header"]',
    GROUP_NAME_ACTIVE: 'header span[style*="height"]:not(.copyable-text)',
    
    // Item de membro individual
    MEMBER_ITEM: 'div[role="listitem"]',
    
    // Dados do membro
    MEMBER_NAME: 'span[title]:not(.copyable-text)',
    MEMBER_PHONE: 'span[style*="height"]:not([title])',
    MEMBER_DESCRIPTION: 'span[title].copyable-text',
    
    // Controles do modal
    VIEW_ALL_BUTTON: 'span[role="button"]' // Com texto "Ver todos"
};
```

### Lógica de Extração

```typescript
class DOMExtractor {
    // Extrai nome do membro
    extractName(listItem: HTMLElement): string | null {
        const nameElem = listItem.querySelector('span[title]:not(.copyable-text)');
        return this.cleanName(nameElem?.textContent);
    }
    
    // Extrai telefone
    extractPhone(listItem: HTMLElement): string | null {
        const phoneElem = listItem.querySelector('span[style*="height"]:not([title])');
        return phoneElem?.textContent?.trim() || null;
    }
    
    // Extrai descrição/status
    extractDescription(listItem: HTMLElement): string | null {
        const descElem = listItem.querySelector('span[title].copyable-text');
        return this.cleanDescription(descElem?.textContent);
    }
    
    // Extrai fonte (nome do grupo)
    extractGroupName(): string | null {
        const groupElem = document.querySelector('header span[style*="height"]:not(.copyable-text)');
        return groupElem?.textContent || null;
    }
}
```

## 🎯 Estratégias de Seleção

### 1. Seletores Defensivos

```typescript
// ❌ Seletor frágil
document.querySelector('span');

// ✅ Seletor defensivo
listItem.querySelector('span[title]:not(.copyable-text)');
```

### 2. Múltiplos Fallbacks

```typescript
function findElement(container: HTMLElement, selectors: string[]): HTMLElement | null {
    for (const selector of selectors) {
        const element = container.querySelector(selector);
        if (element) return element as HTMLElement;
    }
    return null;
}

// Uso com fallbacks
const nameElement = findElement(listItem, [
    'span[title]:not(.copyable-text)',  // Seletor principal
    'span[title]',                      // Fallback 1
    'span:first-child'                  // Fallback 2
]);
```

### 3. Validação de Conteúdo

```typescript
function validateElement(element: HTMLElement, validators: Function[]): boolean {
    return validators.every(validator => validator(element));
}

const isValidName = (elem: HTMLElement) => {
    const text = elem.textContent?.trim();
    return text && 
           text.length > 0 && 
           text.length < 100 &&
           !text.match(/Loading|Available/i);
};
```

## 🔄 Evolução dos Seletores

### Versões Anteriores vs Atual

```typescript
// VERSÃO ANTIGA (pode quebrar)
const oldSelectors = {
    name: '.member-name',
    phone: '.member-phone'
};

// VERSÃO ATUAL (mais robusta)
const currentSelectors = {
    name: 'span[title]:not(.copyable-text)',
    phone: 'span[style*="height"]:not([title])'
};

// VERSÃO FUTURA (adaptativa)
const adaptiveSelectors = {
    name: [
        'span[title]:not(.copyable-text)',
        '[data-member-name]',
        'span[title]'
    ],
    phone: [
        'span[style*="height"]:not([title])',
        '[data-member-phone]',
        'span:contains("+")'
    ]
};
```

## 🚨 Riscos e Mitigações

### Possíveis Quebras

1. **WhatsApp muda estrutura DOM**
   ```typescript
   // Mitigação: Seletores múltiplos
   const selectors = [
       'span[title]:not(.copyable-text)', // Atual
       'span[data-name]',                 // Possível futuro
       'span.member-name'                 // Fallback
   ];
   ```

2. **Atributos dinâmicos mudam**
   ```typescript
   // Mitigação: Lógica de detecção
   function detectNameElement(container: HTMLElement) {
       // Procura por padrões, não apenas seletores fixos
       const spans = container.querySelectorAll('span');
       for (const span of spans) {
           if (isLikelyName(span.textContent)) {
               return span;
           }
       }
   }
   ```

3. **CSS classes são ofuscadas**
   ```typescript
   // Mitigação: Usar atributos semânticos
   const element = container.querySelector('[role="listitem"]');
   // Em vez de classes CSS
   ```

## 🔧 Ferramentas de Debug

### Inspector de Seletores

```typescript
class SelectorInspector {
    // Testa todos os seletores
    testSelectors(container: HTMLElement) {
        const results = {};
        
        Object.entries(SELECTORS).forEach(([name, selector]) => {
            const elements = container.querySelectorAll(selector);
            results[name] = {
                selector,
                found: elements.length,
                elements: Array.from(elements)
            };
        });
        
        console.table(results);
        return results;
    }
    
    // Monitora mudanças
    watchSelectors(container: HTMLElement) {
        const observer = new MutationObserver(() => {
            console.log('DOM changed, retesting selectors...');
            this.testSelectors(container);
        });
        
        observer.observe(container, {
            childList: true,
            subtree: true,
            attributes: true
        });
    }
}
```

### Console Helpers

```javascript
// Helpers disponíveis no console do browser
window.selectorDebug = {
    // Testa seletor
    test: (selector) => document.querySelectorAll(selector),
    
    // Encontra elementos por texto
    findByText: (text) => {
        const elements = document.querySelectorAll('*');
        return Array.from(elements).filter(el => 
            el.textContent?.includes(text)
        );
    },
    
    // Mostra hierarquia de elemento
    hierarchy: (element) => {
        const path = [];
        let current = element;
        while (current && current !== document) {
            path.unshift({
                tag: current.tagName,
                id: current.id,
                classes: Array.from(current.classList),
                role: current.getAttribute('role')
            });
            current = current.parentElement;
        }
        return path;
    }
};
```

## 📊 Performance dos Seletores

### Benchmark

```typescript
const benchmarkSelectors = {
    // Rápido - ID único
    fast: '#app',
    
    // Médio - Atributo específico
    medium: '[data-animate-modal-body="true"]',
    
    // Lento - Seletor complexo
    slow: 'div[role="listitem"] span[title]:not(.copyable-text)'
};

// Otimização: Cache de elementos
class SelectorCache {
    private cache = new Map<string, HTMLElement>();
    
    get(selector: string, container: HTMLElement = document.body): HTMLElement | null {
        if (!this.cache.has(selector)) {
            const element = container.querySelector(selector) as HTMLElement;
            this.cache.set(selector, element);
        }
        return this.cache.get(selector) || null;
    }
    
    clear() {
        this.cache.clear();
    }
}
```

---

**💡 Dica**: Use as ferramentas de debug no console para testar seletores antes de implementar mudanças no código principal.