# 🔧 Sistema de Configuração Dual

Este projeto possui **duas configurações de ambiente**:

## 📁 Arquivos de Configuração

- **`.env.local`** → PostgreSQL **pessoal** (localhost) para desenvolvimento
- **`.env.corporativo`** → PostgreSQL **corporativo** (tribunal) para deploy
- **`.env`** → Arquivo ativo (gerado automaticamente pelos scripts)

## 🚀 Como Usar

### Para Desenvolver Localmente (PostgreSQL pessoal)

1. **Edite `.env.local`** com suas credenciais locais:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=plataforma_db
   DB_USER=postgres
   DB_PASSWORD=sua_senha_aqui
   ```

2. **Ative a configuração local:**
   ```powershell
   .\use-local.ps1
   ```

3. **Rode o servidor:**
   ```bash
   npm run dev
   ```

---

### Para Deploy no OpenShift (PostgreSQL corporativo)

1. **Ative a configuração corporativa:**
   ```powershell
   .\use-corporativo.ps1
   ```

2. **Faça commit e push:**
   ```bash
   git add .
   git commit -m "mensagem"
   git push
   ```

3. **OpenShift fará deploy automaticamente**

---

## ⚠️ IMPORTANTE

- **`.env.local`** e **`.env.corporativo`** estão no `.gitignore` (não vão para o Git)
- **`.env`** também está no `.gitignore`
- No OpenShift, as variáveis são configuradas via **environment variables** (ConfigMap/Secret)

---

## 📝 Configuração do OpenShift

As variáveis devem estar configuradas no OpenShift:

```bash
DB_HOST=sv-bd-h01.tjgo.ldc
DB_PORT=6432
DB_NAME=dbpainel_sgjt
DB_USER=sgjt
DB_PASSWORD=@SgJT03D3z2025@
NODE_ENV=production
PORT=8080
SESSION_SECRET=12ade17fd321991bee2af1af1e73403003ff26e39cee1fc538d0768616d2474b
```

---

## 🔍 Verificar Configuração Ativa

```powershell
Get-Content .env
```

---

## 🛠️ Troubleshooting

### "Connection timeout" ao rodar localmente
- Você está com `.env.corporativo` ativo
- Execute `use-local.bat` para alternar

### "desculpe, muitos clientes conectados"
- Há processos Node.js antigos ainda conectados
- **Solução rápida:** Execute `restart-dev.bat`
- **Solução manual:** 
  ```cmd
  taskkill /F /IM node.exe
  npm run dev
  ```

### Login não funciona no OpenShift
- Verifique se o backup foi restaurado no banco corporativo
- Verifique as variáveis de ambiente no OpenShift

### Servidor trava ou não responde
- Pressione `Ctrl+C` para parar
- Execute `restart-dev.bat` para reiniciar limpo

---

## ✅ Checklist Rápido

**Para desenvolver:**
- [ ] `.\use-local.ps1`
- [ ] PostgreSQL local rodando
- [ ] `npm run dev`

**Para deploy:**
- [ ] `.\use-corporativo.ps1` (opcional, só para referência)
- [ ] `git add . && git commit -m "..." && git push`
- [ ] Variáveis configuradas no OpenShift

