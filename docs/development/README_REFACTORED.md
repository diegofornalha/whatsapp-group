# 🚀 WhatsApp Group Scraper - Versão Refatorada

## 📋 Visão Geral

WhatsApp Group Scraper foi completamente refatorado com arquitetura modular, segurança aprimorada e monitoramento profissional.

## ✨ Principais Melhorias

### 1. **Arquitetura Modular**
```
src/
├── core/           # Serviços base e injeção de dependências
├── security/       # Sistema de segurança completo
├── monitoring/     # Logs estruturados e métricas
├── extractors/     # Lógica de extração de dados
├── storage/        # Persistência e gerenciamento de dados
├── ui/            # Interface moderna com React
└── types/         # Interfaces TypeScript
```

### 2. **Segurança Avançada**
- ✅ Rate limiting configurável
- ✅ Detecção de anomalias (SQL injection, XSS, etc.)
- ✅ Validação e sanitização de entrada
- ✅ Audit logging para compliance
- ✅ Criptografia de dados sensíveis

### 3. **Monitoramento Profissional**
- ✅ Logs estruturados em JSON
- ✅ Dashboard de métricas em tempo real
- ✅ Detecção de bottlenecks de performance
- ✅ Rastreamento de erros e alertas

### 4. **Interface Moderna**
- ✅ Componentes React responsivos
- ✅ Visualização de métricas com Recharts
- ✅ Exportação em CSV e JSON
- ✅ Tema customizável

## 🚀 Como Usar

### 1. Instalação de Dependências

```bash
npm install
```

### 2. Build do Projeto

```bash
# Build da versão refatorada
npm run build

# Build da versão legacy (original)
npm run build:legacy
```

### 3. Desenvolvimento

```bash
npm run dev
```

## 📊 Dashboard de Métricas

O novo dashboard exibe:
- Taxa de extração (membros/minuto)
- Uso de CPU e memória
- Bottlenecks de performance
- Logs em tempo real
- Estatísticas de segurança

## 🔒 Configuração de Segurança

Edite `src/core/config/default.ts`:

```typescript
security: {
    enableRateLimiting: true,
    rateLimits: {
        extraction: {
            windowMs: 60000,  // 1 minuto
            maxRequests: 100  // máximo 100 extrações
        }
    }
}
```

## 🛡️ Recursos de Segurança

1. **Rate Limiting**: Previne uso excessivo
2. **Anomaly Detection**: Detecta padrões suspeitos
3. **Input Validation**: Valida todos os dados
4. **Audit Trail**: Rastreia todas as operações
5. **Secure Storage**: Dados criptografados

## 📈 Monitoramento

### Níveis de Log
- `DEBUG`: Informações detalhadas de debug
- `INFO`: Informações gerais
- `WARN`: Avisos importantes
- `ERROR`: Erros que precisam atenção
- `CRITICAL`: Falhas críticas

### Métricas Coletadas
- `members.extracted`: Total de membros extraídos
- `extraction.sessions`: Sessões de extração
- `exports.success`: Exportações bem-sucedidas
- `security.threats`: Ameaças detectadas
- `performance.bottlenecks`: Gargalos identificados

## 🔧 Configuração Avançada

### Dependency Injection

```typescript
// Registrar novo serviço
container.singleton(TOKENS.MyService, () => new MyService());

// Resolver serviço
const myService = container.resolve<IMyService>(TOKENS.MyService);
```

### Event Bus

```typescript
// Ouvir eventos
eventBus.on('member:extracted', (data) => {
    console.log('Membro extraído:', data.member);
});

// Emitir eventos
eventBus.emit('custom:event', { data: 'value' });
```

## 📝 Guia de Migração

Veja [MIGRATION_GUIDE.md](docs/MIGRATION_GUIDE.md) para migrar do código original.

## 🧪 Testes

```bash
# Rodar testes (configuração necessária)
npm test
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch de feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

MIT

## 🎯 Próximos Passos

- [ ] Adicionar testes unitários
- [ ] Implementar exportação para Excel
- [ ] Adicionar suporte a múltiplos idiomas
- [ ] Criar API REST
- [ ] Adicionar webhooks

---

**Nota**: Esta é a versão refatorada com melhorias significativas. A versão original ainda está disponível em `src/main.ts`.