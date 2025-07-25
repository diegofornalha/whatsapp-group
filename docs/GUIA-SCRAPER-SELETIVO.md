# 🎯 WhatsApp Scraper Seletivo - Guia Completo

## 📋 Funcionalidades da Versão Seletiva

### ✨ Novos Recursos:

1. **Seletor de Grupos**: Lista dropdown com todos os grupos disponíveis
2. **Extração Direcionada**: Extrai apenas membros do grupo selecionado
3. **Controle Manual**: Botão Iniciar/Parar extração
4. **Nome do Grupo no CSV**: Arquivo baixado inclui nome do grupo
5. **Automação Melhorada**: Tenta abrir modal de membros automaticamente

## 🚀 Como Usar

### 1. Compilar a Versão Seletiva

```bash
# Instalar dependências (se ainda não instalou)
npm install

# Compilar versão seletiva
npm run build-selective
```

### 2. Executar no WhatsApp Web

1. **Abra o WhatsApp Web** no Chrome
2. **Faça login** escaneando o QR code
3. **Abra o Console** (F12 → Console)
4. **Cole o script** do arquivo `dist/main-selective.min.js`

### 3. Interface do Scraper Seletivo

Após colar o script, você verá uma interface flutuante com:

```
[Dropdown: Selecione um grupo...] | [Iniciar Extração] | [Download X users] | [Reset]
```

### 4. Passo a Passo da Extração

#### 📱 Selecionar o Grupo:
1. Clique no dropdown "Selecione um grupo..."
2. Escolha o grupo desejado da lista
3. O botão mudará para "Iniciar Extração" (verde)

#### ▶️ Iniciar Extração:
1. Clique em "Iniciar Extração"
2. O scraper automaticamente:
   - Abre o grupo selecionado
   - Tenta abrir o modal de membros
   - Inicia a captura de dados

#### 📜 Rolar para Capturar:
1. Quando o modal de membros abrir
2. **Role LENTAMENTE** para cima e para baixo
3. Observe o contador aumentar
4. O histórico mostra membros sendo extraídos

#### ⏸️ Parar Extração:
1. Clique em "Parar Extração" (vermelho)
2. A captura será pausada
3. Você pode mudar de grupo e continuar

#### 📥 Baixar Dados:
1. Clique em "Download X users"
2. O arquivo CSV incluirá:
   - Nome do grupo no nome do arquivo
   - Coluna "Source" com o grupo de origem

## 🎨 Visual da Interface

```
┌─────────────────────────────────────────────────────────┐
│  🔽 Grupo Família ▼ │ 🟢 Iniciar │ 📥 Download 42 │ 🔄 Reset │
├─────────────────────────────────────────────────────────┤
│ #4 Extraído: João Silva                                 │
│ #3 Extraído: Maria Santos                               │
│ #2 Grupo selecionado: Grupo Família                     │
│ #1 5 grupos encontrados                                 │
└─────────────────────────────────────────────────────────┘
```

## 🔧 Recursos Avançados

### Múltiplos Grupos
Você pode extrair membros de vários grupos:
1. Extraia do Grupo A
2. Pare a extração
3. Selecione Grupo B
4. Continue extraindo
5. O CSV final terá membros de ambos com fonte identificada

### Filtros Automáticos
O scraper automaticamente ignora:
- Mensagens do sistema ("Loading About...")
- Status padrão do WhatsApp
- Entradas duplicadas

### Persistência de Dados
- Dados salvos no IndexedDB
- Sobrevivem a recarregamentos
- Use "Reset" para limpar tudo

## 🛡️ Boas Práticas

1. **Use em grupos próprios** ou com permissão
2. **Role devagar** no modal (1-2 segundos por tela)
3. **Verifique o contador** para confirmar captura
4. **Exporte regularmente** para não perder dados
5. **Respeite a privacidade** dos membros

## 📊 Formato do CSV

```csv
Phone Number,Name,Description,Source
+5511999999999,João Silva,Desenvolvedor,Grupo Família
+5511888888888,Maria Santos,Designer,Grupo Família
+5511777777777,Pedro Costa,,Grupo Trabalho
```

## 🐛 Troubleshooting

### Dropdown vazio?
- Aguarde 5 segundos para carregar grupos
- Verifique se está na tela principal do WhatsApp

### Modal não abre?
- Tente clicar manualmente em "Dados do grupo"
- Depois clique em "Ver todos"

### Contador não aumenta?
- Role mais devagar
- Verifique se a extração está ativa (botão vermelho)

### Dados duplicados?
- Normal se o membro aparece múltiplas vezes
- O script atualiza informações existentes

## 💡 Dicas Pro

1. **Teste primeiro** em grupo pequeno
2. **Use nomes descritivos** ao exportar
3. **Organize por fonte** no Excel/Google Sheets
4. **Combine com MCP** para automação total

## 🔗 Integração com MCP

Para usar com o servidor MCP:

```javascript
// 1. Navegue para WhatsApp Web
await mcp.puppeteer_navigate({ url: "https://web.whatsapp.com" })

// 2. Injete o script seletivo
await mcp.puppeteer_evaluate({ 
  script: fs.readFileSync('dist/main-selective.min.js', 'utf8') 
})

// 3. Interaja programaticamente
await mcp.puppeteer_click({ selector: '#group-selector' })
```

---

**Lembre-se**: Use esta ferramenta de forma ética e responsável! 🙏