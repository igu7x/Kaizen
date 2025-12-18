# 🔧 SOLUÇÃO: Executar Migration do Organograma

## ❌ Problema Identificado

**Erro:** Autenticação do tipo senha falhou para o usuário "postgres"
**Código:** 28P01

O script Node.js não conseguiu conectar ao banco de dados PostgreSQL porque:
1. A senha do usuário "postgres" está incorreta
2. As variáveis de ambiente não estão configuradas
3. O arquivo `.env` não existe ou está com valores incorretos

---

## ✅ SOLUÇÃO 1: Configurar Variáveis de Ambiente (Recomendado)

### Passo 1: Verificar/Criar arquivo `.env`

No diretório `api/`, crie ou edite o arquivo `.env`:

```env
# Configuração do Banco de Dados PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=plataforma_sgjt
DB_USER=postgres
DB_PASSWORD=SUA_SENHA_AQUI

# Outras configurações
PORT=3000
NODE_ENV=development
JWT_SECRET=seu_jwt_secret_aqui
```

**⚠️ IMPORTANTE:** Substitua `SUA_SENHA_AQUI` pela senha real do seu PostgreSQL!

### Passo 2: Executar o Script

```bash
cd api/scripts
node run-organograma-migration.js
```

---

## ✅ SOLUÇÃO 2: Executar SQL Manualmente via psql (Mais Rápido)

### Opção A: Linha de Comando

```bash
# Conectar ao banco
psql -h localhost -U postgres -d plataforma_sgjt

# Executar o arquivo SQL
\i C:/Users/ifccteixeira/Documents/plataforma-sgjt/api/sql/migrations/031_create_organograma_completo.sql

# Ou se estiver no diretório correto:
\i api/sql/migrations/031_create_organograma_completo.sql
```

### Opção B: pgAdmin (Interface Gráfica)

1. Abra o **pgAdmin**
2. Conecte-se ao servidor PostgreSQL
3. Selecione o banco de dados `plataforma_sgjt`
4. Clique em **Tools → Query Tool** (ou pressione Alt+Shift+Q)
5. Abra o arquivo: **File → Open**
   - Navegue até: `C:\Users\ifccteixeira\Documents\plataforma-sgjt\api\sql\migrations\031_create_organograma_completo.sql`
6. Clique em **Execute** (ou pressione F5)

### Opção C: DBeaver / Outro Cliente SQL

1. Abra seu cliente SQL
2. Conecte-se ao banco `plataforma_sgjt`
3. Abra o arquivo `031_create_organograma_completo.sql`
4. Execute o script

---

## ✅ SOLUÇÃO 3: Executar SQL Direto (Copiar e Colar)

Se preferir, copie e cole o conteúdo do arquivo SQL diretamente no seu cliente PostgreSQL:

### Localização do arquivo:
```
C:\Users\ifccteixeira\Documents\plataforma-sgjt\api\sql\migrations\031_create_organograma_completo.sql
```

### Passos:
1. Abra o arquivo no seu editor de texto
2. Copie TODO o conteúdo (Ctrl+A, Ctrl+C)
3. Cole no Query Tool do pgAdmin ou psql
4. Execute (F5 ou Ctrl+Enter)

---

## 🔍 Verificar se a Migration foi Executada com Sucesso

Execute estas queries para verificar:

```sql
-- 1. Verificar se a tabela foi criada
SELECT COUNT(*) FROM pessoas_organograma_gestores;
-- Resultado esperado: 16

-- 2. Verificar se a view foi criada
SELECT * FROM pessoas_organograma_hierarquia;
-- Deve mostrar 16 linhas com hierarquia

-- 3. Contar registros por nível
SELECT linha_organograma, COUNT(*) as total
FROM pessoas_organograma_gestores
WHERE ativo = TRUE
GROUP BY linha_organograma
ORDER BY linha_organograma;

-- Resultado esperado:
-- Linha 1: 1 (Diretoria)
-- Linha 2: 3 (Coordenadorias)
-- Linha 3: 6 (Divisões)
-- Linha 4: 6 (Núcleos)
```

Se todos os comandos acima funcionarem, a migration foi executada com sucesso! ✅

---

## 🔐 Descobrir a Senha do PostgreSQL

Se você não sabe a senha do usuário "postgres":

### Windows:

1. **Verificar durante a instalação:**
   - A senha foi definida durante a instalação do PostgreSQL
   - Verifique suas anotações ou arquivo de configuração

2. **Redefinir a senha (se tiver acesso ao Windows como admin):**
   ```bash
   # Abra o psql como administrador
   psql -U postgres
   
   # Dentro do psql, redefina a senha:
   ALTER USER postgres PASSWORD 'nova_senha_aqui';
   ```

3. **Usar autenticação trust temporariamente:**
   - Edite o arquivo `pg_hba.conf` (geralmente em `C:\Program Files\PostgreSQL\XX\data\`)
   - Altere a linha do localhost para `trust`:
     ```
     # TYPE  DATABASE        USER            ADDRESS                 METHOD
     host    all             all             127.0.0.1/32            trust
     ```
   - Reinicie o serviço PostgreSQL
   - Conecte sem senha e redefina:
     ```sql
     ALTER USER postgres PASSWORD 'nova_senha';
     ```
   - Volte a configuração original em `pg_hba.conf`

---

## 🎯 RECOMENDAÇÃO RÁPIDA

Para executar agora mesmo, **use a SOLUÇÃO 2** (pgAdmin ou psql):

1. Abra o pgAdmin
2. Query Tool
3. Abra o arquivo `031_create_organograma_completo.sql`
4. Execute (F5)
5. Pronto! ✅

Isso vai funcionar independentemente das variáveis de ambiente do Node.js.

Depois, você pode configurar o `.env` com calma para usar os scripts automatizados.

---

## ✅ Próximos Passos Após a Migration

Após executar a migration com sucesso:

1. **Iniciar o Backend:**
   ```bash
   cd api
   npm run dev
   ```

2. **Iniciar o Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Acessar o Módulo:**
   - Abra o navegador: `http://localhost:5173`
   - Navegue até: **Menu → Pessoas → Painel**
   - Verifique se o organograma aparece com 16 cards! 🎉

---

## 📞 Precisa de Ajuda?

Se ainda tiver problemas:

1. Verifique se o PostgreSQL está rodando:
   ```bash
   # Windows - Verificar serviço
   sc query postgresql-x64-XX
   ```

2. Teste a conexão manualmente:
   ```bash
   psql -h localhost -U postgres -d plataforma_sgjt
   ```

3. Verifique os logs do PostgreSQL:
   - Windows: `C:\Program Files\PostgreSQL\XX\data\log\`

**Status:** 🟡 **AGUARDANDO EXECUÇÃO DA MIGRATION**

Depois de executar a migration, o módulo estará 100% funcional! 🚀







