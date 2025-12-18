# 🚀 Plataforma de Gestão - Backend PostgreSQL

Backend completo com PostgreSQL para sistema de OKR + Formulários Dinâmicos.

## 🎯 Quick Start

```bash
# 1. Instalar dependências
npm install

# 2. Configurar .env
cp .env.example .env
# Editar .env com suas credenciais PostgreSQL

# 3. Criar banco de dados
npm run db:setup

# 4. Migrar dados (se tiver) ou usar seeds
npm run migrate  # OU
npm run db:seed

# 5. Iniciar servidor
npm run dev
```

## 📦 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor em desenvolvimento |
| `npm run build` | Build para produção |
| `npm start` | Inicia servidor de produção |
| `npm run db:setup` | Cria banco e executa schema |
| `npm run migrate` | Migra dados do localStorage |
| `npm run db:seed` | Popula dados de exemplo |
| `npm run backup` | Cria backup do banco |
| `npm run test` | Executa testes de validação |

## 📊 Estrutura

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts       # Configuração PostgreSQL
│   ├── routes/
│   │   ├── users.ts          # Rotas de usuários
│   │   ├── okr.ts            # Rotas OKR
│   │   └── forms.ts          # Rotas formulários
│   ├── middleware/
│   │   └── auth.ts           # Autenticação
│   └── server.ts             # Servidor principal
├── scripts/
│   ├── migrate.js            # Migração JSON → PostgreSQL
│   ├── setup-database.js     # Setup inicial
│   ├── backup.js             # Backup automático
│   ├── test.js               # Testes
│   └── seeds.js              # Dados de exemplo
├── sql/
│   └── schema.sql            # Schema completo
├── .env.example              # Template de configuração
└── README_MIGRACAO.md        # Documentação completa
```

## 🗄️ Banco de Dados

- **13 tabelas** criadas
- **Triggers automáticos** para cálculos
- **Integridade referencial** completa
- **Índices otimizados**

Ver [README_MIGRACAO.md](./README_MIGRACAO.md) para documentação completa.

## 🔐 Credenciais Padrão (Seeds)

```
Email: admin@tjgo.jus.br | gestor@tjgo.jus.br | viewer@tjgo.jus.br
Senha: senha123
```

## 📝 Licença

MIT
