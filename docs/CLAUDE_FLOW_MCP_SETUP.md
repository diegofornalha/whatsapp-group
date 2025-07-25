# Como Configurar Claude Flow como Servidor MCP no Claude Code

Este guia detalha como configurar o Claude Flow como um servidor MCP (Model Context Protocol) local no Claude Code.

## 📋 Pré-requisitos

- Claude Code instalado
- Node.js (versão 20 ou superior)
- Projeto Claude Flow disponível localmente

## 🚀 Passos para Configuração

### 1. Verificar a Estrutura do Projeto

Primeiro, certifique-se de que o projeto Claude Flow está disponível localmente:

```bash
ls /Users/agents/Desktop/whatsapp-group/claude-flow/
```

Deve conter:
- `package.json` com as dependências necessárias
- `src/mcp/mcp-server.js` - o servidor MCP principal
- Estrutura completa do projeto

### 2. Verificar Servidores MCP Existentes

Antes de adicionar, verifique quais servidores já estão configurados:

```bash
claude mcp list
```

### 3. Remover Configuração Existente (se necessário)

Se o claude-flow já estiver configurado mas com problemas:

```bash
claude mcp remove claude-flow
```

### 4. Adicionar Claude Flow como Servidor MCP Local

Configure o servidor MCP apontando para o arquivo local:

```bash
claude mcp add claude-flow node /Users/agents/Desktop/whatsapp-group/claude-flow/src/mcp/mcp-server.js
```

**Explicação do comando:**
- `claude-flow`: Nome do servidor MCP
- `node`: Runtime para executar o servidor
- Caminho absoluto para o arquivo `mcp-server.js`

### 5. Verificar a Conexão

Confirme que o servidor está funcionando:

```bash
claude mcp list
```

Você deve ver:
```
claude-flow: node /Users/agents/Desktop/whatsapp-group/claude-flow/src/mcp/mcp-server.js - ✓ Connected
```

## 🛠️ Ferramentas Disponíveis

Após a configuração, você terá acesso a mais de 80 ferramentas organizadas em categorias:

### Coordenação de Swarm (12)
- `mcp__claude-flow__swarm_init` - Inicializar topologia de swarm
- `mcp__claude-flow__agent_spawn` - Criar agentes especializados
- `mcp__claude-flow__task_orchestrate` - Orquestrar tarefas complexas
- `mcp__claude-flow__swarm_status` - Monitorar status do swarm
- `mcp__claude-flow__agent_list` - Listar agentes ativos
- `mcp__claude-flow__swarm_monitor` - Monitoramento em tempo real
- `mcp__claude-flow__topology_optimize` - Otimizar topologia
- `mcp__claude-flow__load_balance` - Balanceamento de carga
- `mcp__claude-flow__coordination_sync` - Sincronizar coordenação
- `mcp__claude-flow__swarm_scale` - Escalar automaticamente
- `mcp__claude-flow__swarm_destroy` - Finalizar swarm

### Redes Neurais (15)
- `mcp__claude-flow__neural_status` - Status das redes neurais
- `mcp__claude-flow__neural_train` - Treinar padrões com WASM SIMD
- `mcp__claude-flow__neural_patterns` - Análise de padrões cognitivos
- `mcp__claude-flow__neural_predict` - Fazer predições
- `mcp__claude-flow__model_load` - Carregar modelos pré-treinados
- `mcp__claude-flow__model_save` - Salvar modelos treinados
- `mcp__claude-flow__pattern_recognize` - Reconhecimento de padrões
- `mcp__claude-flow__cognitive_analyze` - Análise comportamental
- `mcp__claude-flow__learning_adapt` - Aprendizado adaptativo
- `mcp__claude-flow__neural_compress` - Compressão de modelos
- `mcp__claude-flow__ensemble_create` - Criar ensembles
- `mcp__claude-flow__transfer_learn` - Aprendizado por transferência
- `mcp__claude-flow__neural_explain` - Explicabilidade da IA

### Memória & Persistência (12)
- `mcp__claude-flow__memory_usage` - Memória persistente com TTL
- `mcp__claude-flow__memory_search` - Busca por padrões
- `mcp__claude-flow__memory_persist` - Persistência entre sessões
- `mcp__claude-flow__memory_namespace` - Gerenciar namespaces
- `mcp__claude-flow__memory_backup` - Backup da memória
- `mcp__claude-flow__memory_restore` - Restaurar backups
- `mcp__claude-flow__cache_manage` - Gerenciar cache
- `mcp__claude-flow__state_snapshot` - Snapshots de estado
- `mcp__claude-flow__context_restore` - Restaurar contexto

### GitHub Integration (8)
- `mcp__claude-flow__github_repo_analyze` - Análise de repositórios
- `mcp__claude-flow__github_pr_manage` - Gerenciar pull requests
- `mcp__claude-flow__github_issue_track` - Rastreamento de issues
- `mcp__claude-flow__github_code_review` - Review automatizado
- `mcp__claude-flow__github_workflow_auto` - Automação de workflows
- `mcp__claude-flow__github_metrics` - Métricas do repositório

### Análise & Monitoramento (13)
- `mcp__claude-flow__performance_report` - Relatórios de performance
- `mcp__claude-flow__bottleneck_analyze` - Análise de gargalos
- `mcp__claude-flow__token_usage` - Análise de consumo de tokens
- `mcp__claude-flow__task_status` - Status de execução
- `mcp__claude-flow__benchmark_run` - Benchmarks de performance
- `mcp__claude-flow__health_check` - Monitoramento de saúde

### Workflows & Automação (11)
- `mcp__claude-flow__workflow_create` - Criar workflows customizados
- `mcp__claude-flow__sparc_mode` - Executar modos SPARC
- `mcp__claude-flow__workflow_execute` - Executar workflows
- `mcp__claude-flow__automation_setup` - Configurar automação
- `mcp__claude-flow__pipeline_create` - Criar pipelines CI/CD

## 📁 Estrutura do Arquivo de Configuração

A configuração é salva em `~/.claude.json` no formato:

```json
{
  "mcpServers": {
    "claude-flow": {
      "command": "node",
      "args": ["/Users/agents/Desktop/whatsapp-group/claude-flow/src/mcp/mcp-server.js"],
      "env": {}
    }
  }
}
```

## 🔧 Solução de Problemas

### Servidor não conecta
1. Verifique se o Node.js está instalado
2. Confirme que o caminho para o arquivo está correto
3. Verifique permissões do arquivo

### Reinstalar servidor
```bash
claude mcp remove claude-flow
claude mcp add claude-flow node /caminho/para/claude-flow/src/mcp/mcp-server.js
```

### Verificar logs
O servidor MCP gera logs no stderr que podem ajudar na resolução de problemas.

## ✅ Verificação Final

Para confirmar que tudo está funcionando:

1. Execute `claude mcp list` e veja ✓ Connected
2. Tente usar uma ferramenta como `mcp__claude-flow__swarm_init`
3. Verifique os logs para atividade do servidor

## 📚 Recursos Adicionais

- **Documentação**: `/Users/agents/Desktop/whatsapp-group/claude-flow/docs/`
- **Exemplos**: `/Users/agents/Desktop/whatsapp-group/claude-flow/examples/`
- **Package.json**: Veja dependências e scripts disponíveis
- **README**: Informações do projeto principal

---

**Nota**: Este setup utiliza o caminho local do projeto. Para um deployment em produção, considere publicar o pacote no npm e usar `npx claude-flow@latest mcp start`.