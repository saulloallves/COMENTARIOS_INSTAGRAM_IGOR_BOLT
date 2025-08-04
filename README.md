# 🏢 Cresci e Perdi - Plataforma de Gestão

## 📋 Visão Geral

A **Cresci e Perdi** é uma plataforma completa de gestão para franquias de brechó, desenvolvida com tecnologias modernas para automatizar e otimizar operações através de inteligência artificial e gestão de fases operacionais.

## 🎯 Objetivo Principal

Gerenciar o ciclo completo de vida das unidades franqueadas, desde a fase inicial de interação até a operação plena, utilizando IA para automatizar respostas, classificar comentários do Instagram e otimizar a comunicação com clientes.

## 🏗️ Arquitetura Técnica

### **Frontend**
- **React 18** com TypeScript
- **Tailwind CSS** para estilização
- **Vite** como bundler
- **Lucide React** para ícones
- **React Quill** para editor de texto rico
- **Recharts** para gráficos e visualizações

### **Backend & Database**
- **Supabase** como BaaS (Backend as a Service)
- **PostgreSQL** com Row Level Security (RLS)
- **Real-time subscriptions** para atualizações em tempo real
- **Edge Functions** para processamento serverless

### **Inteligência Artificial**
- **GPT-4.1** integração via API
- **RAG (Retrieval-Augmented Generation)** para contexto
- **Classificação automática** de comentários Instagram
- **Geração de respostas** baseada em fases operacionais

## 🔄 Fases Operacionais

### **1. Interação** 🔵
- Fase inicial de atração e engajamento
- Construção de audiência e expectativa
- **Restrições:** Não revelar preços, não aceitar desapegos

### **2. Pré-Compras** 🟡
- Preparação para início das compras
- Comunicação sobre cronograma
- **Duração:** 1-2 semanas antes das compras

### **3. Compras** 🟢
- Período ativo de recebimento de desapegos
- Avaliação e precificação de itens
- **Duração:** 2-4 semanas de compras ativas

### **4. Pré-Inauguração - Semana 1** 🟣
- Última semana de compras com urgência
- Finalização do estoque necessário

### **5. Pré-Inauguração - Semana 2** 🩷
- Compras encerradas, preparação final
- Comunicação da data de inauguração

### **6. Inauguração** 🔷
- Evento de abertura oficial
- Primeiras vendas e estabelecimento local
- **Duração:** 1-3 dias

### **7. Operação** 🟢
- Funcionamento normal da loja
- Vendas regulares e atendimento
- **Duração:** Até esgotamento do estoque

### **8. Loja Fechada Temporariamente** 🟠
- Fechamento para manutenção/reforma
- Preparação de novo ciclo

### **9. Loja Fechada Definitivamente** 🔴
- Encerramento definitivo das operações

## 🧠 Sistema de IA

### **Classificação de Comentários Instagram**
- **Aprovado:** Comentários positivos/neutros
- **Reprovado:** Comentários negativos/spam
- **Pendente:** Necessita análise humana
- **Confiança:** Score de 0-100% da classificação

### **Geração de Respostas**
- Baseada na fase operacional atual
- Considera documentações ativas
- Respeita restrições por fase
- Histórico de interações para personalização

### **Grupos de Comportamento**
- Configurações específicas por fase
- Permissões e restrições da IA
- Respostas padrão personalizáveis

## 📊 Funcionalidades Principais

### **Dashboard** 📈
- Visão geral do sistema
- Métricas de unidades ativas
- Status de tickets e colaboradores
- Gráficos de atividade por dia
- Distribuição de feedback

### **Gestão de Unidades** 🏪
- CRUD completo de unidades
- Transição entre fases
- Status operacional
- Localização e códigos

### **Documentações** 📚
- Editor de texto rico
- Documentações por fase
- Versionamento e aprovação
- Ativação automática por fase

### **Direct Instagram** 💬
- Interface de chat em tempo real
- Gerenciamento de conversas
- Mensagens não lidas
- Integração com WhatsApp
- Player de áudio para mensagens de voz

### **Moderação de Comentários** 🛡️
- Classificação automática via IA
- Interface de aprovação/rejeição
- Respostas sugeridas
- Ações de moderação (comentar/apagar)
- Filtros por status e unidade

### **Treinamento da IA** 🎓
- Teste de funcionalidades
- Histórico de interações
- Métricas de performance
- Configuração de prompts

## 🎨 Design System

### **Paleta de Cores**
- **Primário:** `#8B4513` (Marrom terroso)
- **Sucesso:** `#10B981` (Verde)
- **Atenção:** `#F59E0B` (Laranja)
- **Erro:** `#EF4444` (Vermelho)
- **Info:** `#3B82F6` (Azul)
- **CTA:** `#FCD34D` (Amarelo)

### **Tipografia**
- **Fonte:** Inter (Sistema moderno)
- **Hierarquia:** 4 níveis (12px-32px)
- **Pesos:** 400, 500, 600, 700

### **Componentes**
- Cards com sombras sutis
- Botões arredondados (rounded-xl)
- Barras de progresso animadas
- Status badges coloridos
- Layout responsivo completo

## 📱 Responsividade

### **Mobile First**
- Layout adaptável para telas verticais
- Sidebar colapsável
- Cards empilhados
- Touch-friendly interfaces

### **Breakpoints**
- **Mobile:** < 768px
- **Tablet:** 768px - 1024px
- **Desktop:** > 1024px

## 🔐 Segurança

### **Row Level Security (RLS)**
- Políticas por tabela
- Controle de acesso baseado em roles
- Isolamento de dados por unidade

### **Roles de Usuário**
- **Admin:** Acesso total
- **Gestor:** Gestão de unidades
- **Consultor:** Visualização e suporte
- **Operador:** Operações básicas

## 📊 Banco de Dados

### **Tabelas Principais**
- `unidades` - Dados das franquias
- `fases` - Fases operacionais
- `usuarios` - Gestão de usuários
- `documentacoes` - Base de conhecimento
- `grupos_comportamento` - Configurações IA
- `historico_interacoes` - Log de IA
- `comentarios_instagram` - Moderação
- `direct_instagram_conversas` - Chat

### **Relacionamentos**
- Unidades ↔ Fases (1:N)
- Fases ↔ Documentações (N:M)
- Fases ↔ Grupos Comportamento (1:1)
- Unidades ↔ Conversas Instagram (1:N)

## 🚀 Deploy & Infraestrutura

### **Desenvolvimento**
- **Vite Dev Server** para desenvolvimento local
- **Hot Module Replacement** para atualizações rápidas
- **TypeScript** para type safety

### **Produção**
- **Netlify** para deploy do frontend
- **Supabase** para backend e database
- **Edge Functions** para processamento serverless

## 📈 Métricas e Analytics

### **KPIs Principais**
- Taxa de sucesso da IA (88% atual)
- Tempo médio de resposta
- Comentários classificados por dia
- Unidades ativas por fase
- Tickets resolvidos

### **Dashboards**
- Visão geral executiva
- Métricas por unidade
- Performance da IA
- Status operacional

## 🔄 Integrações

### **Instagram Business API**
- Comentários em tempo real
- Direct messages
- Moderação automática

### **WhatsApp Business**
- Integração com conversas
- Notificações

### **Webhooks**
- Processamento de eventos
- Automações externas

## 🛠️ Desenvolvimento

### **Estrutura do Projeto**
```
src/
├── components/          # Componentes React
├── hooks/              # Custom hooks
├── services/           # Serviços (IA, API)
├── lib/               # Configurações (Supabase)
├── types/             # Definições TypeScript
└── styles/            # CSS e Tailwind
```

### **Padrões de Código**
- **ESLint** para linting
- **TypeScript** para tipagem
- **Prettier** para formatação
- **Conventional Commits** para versionamento

## 🎯 Roadmap Futuro

### **Próximas Features**
- [ ] App mobile nativo
- [ ] Integração com Facebook
- [ ] Analytics avançados
- [ ] Automação de marketing
- [ ] API pública para integrações

### **Melhorias Técnicas**
- [ ] Testes automatizados
- [ ] CI/CD pipeline
- [ ] Monitoramento de performance
- [ ] Cache inteligente
- [ ] Otimizações de bundle

## 📞 Suporte

Para suporte técnico ou dúvidas sobre a plataforma:
- **Email:** suporte@crescieperdi.com.br
- **Documentação:** [docs.crescieperdi.com.br]
- **Status:** [status.crescieperdi.com.br]

---

**Desenvolvido com ❤️ para revolucionar a gestão de franquias de brechó através da tecnologia e inteligência artificial.**
