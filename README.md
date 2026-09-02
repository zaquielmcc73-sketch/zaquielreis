# 🎬 Veo Auto Studio — Aplicativo Desktop Windows Autossuficiente

**Veo Auto Studio** é um aplicativo desktop autossuficiente para Windows (x64), empacotado com Electron e Electron Builder, projetado para automação em escala e criação de anúncios em vídeo de alta conversão utilizando a API oficial do **Google Veo** (`veo-3.1-lite`, `veo-3.1`, `veo-2.0`) e inteligência estratégica do **Gemini 3.7**.

---

## 🚀 O que é um Aplicativo Autossuficiente?

O usuário **FINAL** recebe apenas o instalador:
* **`Veo-Auto-Studio-Setup.exe`** (ou a versão **`Veo-Auto-Studio-Portable.exe`**)

O usuário final **NÃO PRECISA** instalar:
* ❌ Node.js
* ❌ Python
* ❌ Electron
* ❌ npm / Git
* ❌ VS Code ou editores
* ❌ Bibliotecas externas
* ❌ MySQL, PostgreSQL ou servidores locais

Basta dar dois cliques no instalador `.exe` no Windows, avançar e abrir o programa.

---

## 📦 Arquivos Gerados pelo Build

Quando o desenvolvedor roda o comando `npm run dist`, os arquivos executáveis são colocados dentro da pasta:

📁 **`dist-electron/`**

| Arquivo Final | Descrição |
| :--- | :--- |
| **`Veo-Auto-Studio-Setup.exe`** | **Instalador Oficial Windows (NSIS)**: Permite escolher pasta de instalação, cria atalhos na Área de Trabalho e Menu Iniciar, possui desinstalador padrão do Windows e inicializa o programa ao concluir. |
| **`Veo-Auto-Studio-Portable.exe`** | **Versão Portátil**: Executa diretamente com duplo clique sem precisar instalar. |

---

## 🛠️ Como Gerar o Instalador Windows (Para o Desenvolvedor)

### 1. Requisitos de Build (apenas para quem vai compilar):
* Windows 10/11 x64 (ou Linux/macOS com suporte a wine para build cruzado)
* Node.js 20 LTS ou superior instalado

### 2. Instalação de Dependências:
```bash
npm install
```

### 3. Execução em Desenvolvimento:
```bash
# Modo Servidor Web / Preview:
npm run dev

# Modo Janela Nativa Electron Desktop:
npm run electron:dev
```

### 4. Geração Automática do Instalador .EXE:
```bash
npm run dist
```
Este comando compila o frontend React/Tailwind (`dist/`), empacota o backend Node/Express (`dist/server.cjs`) e chama o Electron Builder gerando os arquivos `.exe` em `dist-electron/`.

---

## 🌟 Funcionalidades e Arquitetura

### 1. Assistente de Primeira Execução (Onboarding)
Quando o usuário abre o aplicativo pela primeira vez:
* **Etapa 1:** Configurar API Key do Google AI Studio
* **Etapa 2:** Testar conexão em tempo real com os modelos Veo
* **Etapa 3:** Configurar Project Bible & Regras de Consistência de Marca
* **Etapa 4:** Gerar primeiro criativo (1 a 75 vídeos)

### 2. Modo Sem API
Se a chave de API ainda não estiver configurada:
* O usuário acessa o aplicativo normalmente.
* Pode criar e salvar produtos, campanhas, roteiros, prompts, métodos de vendas e Project Bible.
* Um aviso claro informa: *"Configure sua API para gerar vídeos reais."*
* O sistema não simula gerações falsas.

### 3. Banco de Dados Local Integrado
* O banco de dados local roda de forma embutida e grava as informações com segurança no diretório de dados do usuário (`%APPDATA%/VeoAutoStudio/db.json`), garantindo que permissões de pasta (como `C:\Program Files`) nunca impeçam o funcionamento.

### 4. 40+ Métodos e Frameworks de Vendas Inclusos
O motor de roteiros e prompts inclui todos os métodos clássicos e modernos:
1. Método China
2. Drive-Thru (<8s)
3. FOMO
4. Metodologia de Vendas Desafiadora (Challenger Sale)
5. Método de Comando de Vendas (Command of the Message)
6. Vendas Conceituais (Conceptual Selling)
7. Vendas Consultivas (Consultative Selling)
8. Vendas Centradas no Cliente (Customer-Centric Selling)
9. Venda com Diferença de Preço (Gap Selling)
10. Inbound
11. MEDDIC
12. NEAT
13. Sandler
14. SNAP
15. SPIN Selling
16. Venda Social (Social Selling)
17. Venda de Soluções (Solution Selling)
18. Vendas para Contas-Alvo (Target Account Selling - TAS)
19. Venda Baseada em Valor (ValueSelling Framework)
20. Jornada do Herói
21. Sparklines (Contraste Constante)
22. Método 4W (What, Who, Why, Where)
23. Conflito e Virada
24. Product Placement
25. Cases de Sucesso
26. "E Se?" (What If?)
27. F.A.L.A. (Fixar, Atrair, Lembrar, Ação)
28. Dor → Solução
29. Benefício Direto
30. Curiosidade / Segredo
31. Storytelling
32. Depoimento
33. UGC (User Generated Content)
34. POV (First Person View)
35. Demonstração Visual
36. Oferta Irresistível
37. Viral / Trending
38. Comparação (Nós vs Eles)
39. Status / Desejo Elevado
40. Transformação Emocional
41. Métodos Customizados

### 5. Geração em Lote de até 75 Vídeos com Fila Controlada
* Permite disparar lotes de **1, 5, 10, 25, 50 ou 75 vídeos**.
* Fila com controle de concorrência e retentativas automáticas em caso de rate limit (429) ou quota excedida, evitando bloqueios na API.

---

## 🔒 Segurança e Integração Oficial
* **`contextIsolation: true`** e **`nodeIntegration: false`** no processo Electron.
* Chave de API armazenada localmente com criptografia do sistema operacional (`safeStorage`).
* Comunicação exclusiva via endpoints oficiais da API Google Veo (`GoogleGenAI` SDK).
* Zero automação de navegadores com Puppeteer ou hacks não autorizados.
