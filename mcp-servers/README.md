# WhatsApp Scraper MCP Servers

## 🚀 Servidores MCP para WhatsApp Group Scraper

Este diretório contém os servidores MCP (Model Context Protocol) que estendem as funcionalidades do WhatsApp Scraper, transformando-o em uma solução enterprise completa.

## 📦 Servidores Disponíveis

### 1. Storage Server (`storage-server/`)
Fornece armazenamento seguro e distribuído para os dados coletados.

**Funcionalidades**:
- ✅ Criptografia end-to-end
- ✅ Sincronização multi-dispositivo
- ✅ Backup automático
- ✅ Versionamento de dados
- ✅ TTL configurável

**Tools disponíveis**:
- `store_member`: Armazena membro com criptografia
- `search_members`: Busca com filtros avançados
- `sync_data`: Sincronização entre dispositivos
- `create_backup`: Criação de backups

### 2. Analytics Server (`analytics-server/`)
Processamento e análise em tempo real dos dados coletados.

**Funcionalidades**:
- 📊 Dashboard em tempo real
- 🔍 Detecção de padrões
- 📈 Análise preditiva
- 🎯 Detecção de anomalias
- 📑 Relatórios automatizados

**Tools disponíveis**:
- `process_member`: Análise em tempo real
- `get_dashboard_data`: Dados para dashboard
- `predict_trends`: Previsão de tendências
- `detect_anomalies`: Detecção de anomalias

### 3. Context7 Integration (Planejado)
Integração com Context7 para gerenciamento avançado de contexto.

### 4. Security Server (Planejado)
Camada adicional de segurança e conformidade.

## 🛠️ Instalação

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- PostgreSQL (para storage server)

### Setup

1. **Instalar dependências globais**:
```bash
npm install -g @modelcontextprotocol/server @modelcontextprotocol/transport-stdio
```

2. **Configurar Storage Server**:
```bash
cd storage-server
npm install
cp .env.example .env
# Editar .env com suas configurações
npm run build
```

3. **Configurar Analytics Server**:
```bash
cd analytics-server
npm install
npm run build
```

## 🚀 Executando os Servidores

### Desenvolvimento

**Storage Server**:
```bash
cd storage-server
npm run dev
```

**Analytics Server**:
```bash
cd analytics-server
npm run dev
```

### Produção

**Com PM2**:
```bash
pm2 start ecosystem.config.js
```

**Com Docker**:
```bash
docker-compose up -d
```

## 🔧 Configuração no Claude

Para usar os servidores MCP no Claude:

1. **Adicionar Storage Server**:
```bash
claude mcp add whatsapp-storage node /path/to/storage-server/dist/server.js
```

2. **Adicionar Analytics Server**:
```bash
claude mcp add whatsapp-analytics node /path/to/analytics-server/dist/server.js
```

## 📖 Uso na Extensão

### Exemplo de integração:

```typescript
// No arquivo main.ts da extensão
import { MCPClient } from '@modelcontextprotocol/client';

// Conectar aos servidores
const storage = new MCPClient('whatsapp-storage');
const analytics = new MCPClient('whatsapp-analytics');

// Salvar membro
async function saveMember(member: WhatsAppMember) {
  // Salvar no storage
  await storage.call('store_member', { member });
  
  // Processar analytics
  const insights = await analytics.call('process_member', { member });
  
  // Usar insights para melhorar UX
  if (insights.isDuplicate) {
    showNotification('Membro duplicado detectado');
  }
}
```

## 🔒 Segurança

- Todos os dados são criptografados em repouso e em trânsito
- Autenticação via tokens JWT
- Rate limiting implementado
- Logs de auditoria completos
- Conformidade LGPD/GDPR

## 📊 Monitoramento

### Métricas disponíveis:
- Taxa de processamento
- Latência média
- Uso de armazenamento
- Taxa de erros
- Usuários ativos

### Endpoints de saúde:
- `/health` - Status do servidor
- `/metrics` - Métricas Prometheus
- `/stats` - Estatísticas detalhadas

## 🤝 Contribuindo

1. Fork o repositório
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📝 Licença

MIT License - veja LICENSE para detalhes.