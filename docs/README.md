# 📚 WhatsApp Group Scraper - Documentação Completa

## 🎯 Visão Geral

O **WhatsApp Group Scraper** é uma ferramenta JavaScript que permite extrair informações de membros de grupos do WhatsApp Web de forma automatizada. O projeto funciona diretamente no navegador através do console de desenvolvedor, sem necessidade de extensões ou proxies externos.

## 📁 Estrutura da Documentação

A documentação está organizada em **clusters temáticos** para facilitar a navegação e manutenção:

### 🏗️ Clusters Principais

| Cluster | Descrição | Status |
|---------|-----------|--------|
| **[Overview](./overview/)** | Visão geral, propósito e funcionalidades principais | ✅ |
| **[Architecture](./architecture/)** | Estrutura técnica, componentes e design patterns | ✅ |
| **[Features](./features/)** | Funcionalidades detalhadas e comparação de versões | ✅ |
| **[API](./api/)** | Interfaces TypeScript, APIs e contratos | ✅ |
| **[Development](./development/)** | Setup, build, testes e contribuição | ✅ |
| **[Security](./security/)** | Práticas seguras e considerações éticas | ✅ |
| **[Troubleshooting](./troubleshooting/)** | Resolução de problemas e FAQ | ✅ |

### 🚀 Quick Start

1. **[Setup Inicial](./development/setup.md)** - Configure o ambiente de desenvolvimento
2. **[Como Usar](./features/usage-guide.md)** - Guia passo-a-passo para usuários
3. **[Arquitetura](./architecture/overview.md)** - Entenda a estrutura técnica
4. **[Contribuição](./development/contributing.md)** - Como contribuir com o projeto

### 🔍 Navegação Rápida

#### Para Usuários Finais
- 📖 [Guia de Uso Básico](./features/basic-usage.md)
- 🎯 [Versão Seletiva](./features/selective-scraper.md)
- 🛡️ [Práticas Seguras](./security/best-practices.md)
- ❓ [FAQ e Problemas Comuns](./troubleshooting/common-issues.md)

#### Para Desenvolvedores
- 🏗️ [Arquitetura do Sistema](./architecture/system-design.md)
- 📝 [Interface TypeScript](./api/typescript-interfaces.md)
- 🔧 [Setup de Desenvolvimento](./development/setup.md)
- 🧪 [Guia de Testes](./development/testing.md)

#### Para Auditores/Segurança
- 🔒 [Análise de Segurança](./security/security-analysis.md)
- ⚖️ [Considerações Legais](./security/legal-considerations.md)
- 🛡️ [Melhores Práticas](./security/best-practices.md)

## 🎨 Convenções da Documentação

### Símbolos Utilizados
- 🎯 **Foco Principal** - Informações essenciais
- 🔧 **Técnico** - Detalhes de implementação
- 🛡️ **Segurança** - Considerações de segurança
- 💡 **Dica** - Sugestões e otimizações
- ⚠️ **Atenção** - Avisos importantes
- 🚨 **Crítico** - Informações críticas de segurança

### Estrutura dos Documentos
Cada cluster segue uma estrutura consistente:
1. **Introdução** - Contexto e objetivo
2. **Conteúdo Principal** - Informações detalhadas
3. **Exemplos Práticos** - Casos de uso
4. **Referências** - Links para documentos relacionados

## 📊 Métricas do Projeto

### Funcionalidades Implementadas
- ✅ Extração básica de membros
- ✅ Interface de usuário flutuante
- ✅ Exportação para CSV
- ✅ Cache local com IndexedDB
- ✅ Versão seletiva de grupos
- ✅ Sistema de histórico/logs
- ✅ Testes automatizados

### Tecnologias Utilizadas
- **TypeScript** - Linguagem principal
- **Vite** - Build tool
- **Puppeteer** - Testes automatizados
- **IndexedDB** - Armazenamento local
- **MutationObserver** - Monitoramento DOM
- **browser-scraping-utils** - Utilitários de scraping

## 🔄 Atualizações e Versionamento

### Versão Atual: `v1.0.0`
- **Última atualização**: Janeiro 2025
- **Compatibilidade**: WhatsApp Web atual
- **Status**: Produção

### Versões Disponíveis
- **Básica** (`main.ts`) - Scraping manual tradicional
- **Seletiva** (`main-selective.ts`) - Seleção específica de grupos

## 🤝 Contribuição

Este projeto é **open source** e aceita contribuições! Consulte o [Guia de Contribuição](./development/contributing.md) para:

- 🐛 Reportar bugs
- 💡 Sugerir melhorias
- 🔧 Contribuir com código
- 📝 Melhorar documentação

## 📞 Suporte

### Canais de Suporte
- **Issues GitHub** - Para bugs e melhorias
- **Discussões** - Para dúvidas gerais
- **Documentação** - Para referências técnicas

### SLA de Resposta
- 🐛 **Bugs críticos**: 24h
- 🔧 **Melhorias**: 7 dias
- ❓ **Dúvidas gerais**: 3 dias

---

**💡 Dica**: Comece pela [Visão Geral](./overview/) se é sua primeira vez no projeto, ou vá direto para o [Guia de Uso](./features/usage-guide.md) se quer usar a ferramenta imediatamente.

---

*Esta documentação é mantida pela comunidade e atualizada regularmente. Última revisão: Janeiro 2025*