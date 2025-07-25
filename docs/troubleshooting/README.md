# 🔧 Troubleshooting - WhatsApp Group Scraper

## 📋 Índice do Cluster

| Documento | Descrição |
|-----------|-----------|
| [❓ FAQ](./faq.md) | Perguntas frequentes e respostas |
| [🐛 Problemas Comuns](./common-issues.md) | Issues mais reportados e soluções |
| [🔍 Debug Guide](./debug-guide.md) | Como debugar problemas |
| [🆘 Suporte](./support.md) | Canais de suporte e como reportar bugs |

## 🚨 Problemas Mais Comuns

### 1. 🔴 Script Não Funciona

#### Sintomas
- Cola o script mas nada acontece
- Console mostra erros
- Interface não aparece

#### Diagnóstico
```javascript
// 1. Verifique se está no WhatsApp Web
console.log('URL atual:', window.location.href);
// Deve conter: web.whatsapp.com

// 2. Verifique se WhatsApp carregou
console.log('App element:', document.querySelector('#app'));
// Deve retornar elemento, não null

// 3. Teste injeção simples
console.log('Teste básico funcionando');
```

#### Soluções
```
✅ Soluções:
├── Recarregue a página do WhatsApp Web
├── Aguarde WhatsApp carregar completamente (30+ segundos)
├── Verifique se fez login (escaneou QR code)
├── Use Chrome/Edge (melhor compatibilidade)
├── Desative extensões que podem interferir
└── Limpe cache do browser
```

### 2. 🟡 Contador Não Aumenta

#### Sintomas
- Interface aparece mas contador fica em 0
- Não detecta membros ao rolar

#### Diagnóstico
```javascript
// 1. Verifique se modal está aberto
console.log('Modal membros:', document.querySelector('[data-animate-modal-body="true"]'));

// 2. Verifique observer
console.log('Observer ativo:', modalObserver);

// 3. Teste extração manual
const items = document.querySelectorAll('div[role="listitem"]');
console.log('Items encontrados:', items.length);
```

#### Soluções
```
✅ Soluções:
├── Abra modal de membros manualmente:
│   ├── Clique na foto/nome do grupo
│   ├── Clique em "Dados do grupo"  
│   └── Clique em "Ver todos" na seção membros
├── Role MUITO devagar (1-2 segundos por tela)
├── Aguarde elementos carregarem completamente
├── Para e recomeça o scroll se necessário
└── Verifique se tem permissão para ver membros
```

### 3. 🟠 Dados Incompletos

#### Sintomas
- Alguns membros sem nome
- Telefones faltando
- Descrições vazias

#### Diagnóstico
```javascript
// Verifique dados no cache
memberListStore.getAll().then(data => {
  console.log('Total membros:', data.size);
  console.log('Primeiro membro:', Array.from(data.values())[0]);
});
```

#### Soluções
```
✅ Soluções:
├── Normal - nem todos membros têm dados públicos
├── Role mais devagar para carregar dados
├── Alguns perfis são privados (esperado)
├── WhatsApp pode limitar informações exibidas
└── Versão seletiva pode ter melhor extração
```

### 4. 🔵 Problemas de Performance

#### Sintomas
- Browser trava ou fica lento
- Script para de responder
- Memória alta

#### Diagnóstico
```javascript
// Verifique uso de memória
console.log('Cache size:', memberListStore.size);
console.log('Memory usage:', performance.memory);

// Performance stats
console.log('Timing:', performance.now());
```

#### Soluções
```
✅ Soluções:
├── Exporte dados periodicamente
├── Use "Reset" para limpar cache
├── Processe grupos menores por vez
├── Feche outras abas do browser
├── Aumente RAM disponível se possível
└── Use versão seletiva para controle melhor
```

## 🔧 Debug Tools

### Console Debug
```javascript
// Helpers disponíveis no console
window.scraperDebug = {
  // Verifica cache atual
  getCache: () => memberListStore.getAll(),
  
  // Limpa cache
  clearCache: () => memberListStore.clear(),
  
  // Estatísticas
  getStats: () => ({
    members: memberListStore.size,
    uptime: Date.now() - startTime,
    errors: errorCount
  }),
  
  // Exporta debug info
  exportDebug: () => {
    const data = {
      url: window.location.href,
      userAgent: navigator.userAgent,
      cache: memberListStore.getAll(),
      errors: errorLog
    };
    console.log('Debug info:', data);
    return data;
  }
};
```

### Network Debug
```javascript
// Verifica se há requests externos (não deveria ter)
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.warn('Network request detected:', args[0]);
  return originalFetch.apply(this, args);
};
```

### DOM Debug
```javascript
// Monitora mudanças DOM
const debugObserver = new MutationObserver((mutations) => {
  console.log('DOM changes:', mutations.length);
});

debugObserver.observe(document.body, {
  childList: true,
  subtree: true
});
```

## 🌐 Compatibilidade

### Navegadores Suportados
```
✅ SUPORTADO:
├── Chrome 90+ (Recomendado)
├── Edge 90+
├── Firefox 88+
└── Opera 76+

⚠️ PARCIAL:
├── Safari (limitações IndexedDB)
└── Navegadores móveis (limitado)

❌ NÃO SUPORTADO:
├── Internet Explorer
├── Navegadores muito antigos (<2021)
└── WebViews incorporados
```

### Versões WhatsApp Web
```
✅ TESTADO E FUNCIONANDO:
├── WhatsApp Web 2024+
├── WhatsApp Web Multi-Device
└── WhatsApp Business Web

⚠️ PODE FUNCIONAR:  
├── Versões anteriores 2023
└── Beta versions (instável)

❌ NÃO FUNCIONA:
├── App nativo WhatsApp
├── WhatsApp Desktop (limitado)
└── Versões muito antigas
```

## 🛠️ Ferramentas de Diagnóstico

### Health Check
```javascript
function healthCheck() {
  const checks = {
    whatsappLoaded: !!document.querySelector('#app'),
    scriptInjected: typeof memberListStore !== 'undefined',
    storageWorking: false,
    observerActive: false
  };
  
  // Testa storage
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    checks.storageWorking = true;
  } catch (e) {
    console.error('Storage test failed:', e);
  }
  
  // Testa observer
  checks.observerActive = modalObserver && modalObserver.constructor.name === 'MutationObserver';
  
  console.table(checks);
  return checks;
}

// Execute: healthCheck()
```

### Environment Info
```javascript
function getEnvironmentInfo() {
  const info = {
    userAgent: navigator.userAgent,
    url: window.location.href,
    timestamp: new Date().toISOString(),
    screen: `${screen.width}x${screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    online: navigator.onLine,
    cookiesEnabled: navigator.cookieEnabled,
    storageAvailable: {
      localStorage: !!window.localStorage,
      sessionStorage: !!window.sessionStorage,
      indexedDB: !!window.indexedDB
    }
  };
  
  console.table(info);
  return info;
}
```

## 📋 Checklist de Problemas

### Before You Report
```
✅ Verificar antes de reportar:
├── [ ] Seguiu as instruções completamente
├── [ ] Testou em navegador suportado
├── [ ] WhatsApp Web carregou completamente
├── [ ] Fez login no WhatsApp (escaneou QR)
├── [ ] Tentou recarregar página
├── [ ] Verificou console por erros
├── [ ] Testou com grupo pequeno primeiro
├── [ ] Leu este guia de troubleshooting
└── [ ] Tentou versão alternativa (básica/seletiva)
```

### Quick Fixes
```
🚀 Soluções Rápidas:
├── F5 (recarregar página)
├── Ctrl+Shift+R (recarregar forçado)
├── Limpar cache do navegador
├── Usar janela anônima/privada
├── Trocar para Chrome se usando outro browser
├── Aguardar mais tempo após login
├── Colar script novamente
└── Tentar grupo menor primeiro
```

## 🆘 Como Obter Ajuda

### Informações para Reportar
Quando reportar problemas, inclua sempre:

```
📋 Informações Necessárias:
├── Navegador e versão (ex: Chrome 120.0.0.0)
├── Sistema operacional (ex: Windows 11, macOS 14)
├── URL atual (web.whatsapp.com/...)
├── Versão do script (básica/seletiva)
├── Erro exato do console (screenshot)
├── Passos para reproduzir o problema
├── Tamanho aproximado do grupo
└── Se funcionava antes (quando parou)
```

### Canais de Suporte
```
📞 Onde Obter Ajuda:
├── 🐛 GitHub Issues - Bugs e melhorias
├── 💬 Discussions - Dúvidas gerais  
├── 📚 Documentation - Referência técnica
├── 🔍 Search Issues - Problemas similares
└── 📧 Email - Casos críticos
```

### Response Times
```
⏰ Tempo de Resposta:
├── 🚨 Bugs críticos: 24h
├── 🐛 Bugs normais: 3-7 dias
├── ❓ Dúvidas gerais: 1-3 dias
├── 💡 Melhorias: 1-2 semanas
└── 📚 Documentação: 1 semana
```

---

**💡 Dica**: 90% dos problemas são resolvidos recarregando a página e aguardando o WhatsApp carregar completamente antes de colar o script.

**Próximo**: Consulte o [FAQ](./faq.md) para perguntas específicas ou o [Debug Guide](./debug-guide.md) para problemas complexos.