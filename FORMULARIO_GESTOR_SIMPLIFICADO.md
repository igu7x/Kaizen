# ✅ FORMULÁRIO DE GESTORES - VERSÃO SIMPLIFICADA

## 📋 RESUMO DAS MUDANÇAS

O formulário de criação/edição de gestores do organograma foi **simplificado** de 10 campos para apenas **6 campos essenciais**.

### ❌ Campos Removidos:
1. **Cor da Barra** - Agora é automático baseado no nível hierárquico
2. **Diretoria Raiz** - Calculado automaticamente a partir da subordinação
3. **Ordem de Exibição** - Gerenciado automaticamente pelo sistema

### ✅ Campos Mantidos (6 campos):
1. **Nome da Área** * (obrigatório)
2. **Nome do Gestor** * (obrigatório)
3. **Cargo do Gestor** * (obrigatório)
4. **Foto do Gestor** (opcional - com upload)
5. **Linha do Organograma** * (obrigatório - dropdown com 4 níveis)
6. **Subordinação** (condicional - obrigatório para níveis 2+, desabilitado para nível 1)

---

## 🎨 NOVO LAYOUT DO FORMULÁRIO

### Modal Dividido em 2 Seções:

```
┌─────────────────────────────────────────────────────────┐
│ [X] Nova Área/Gestor                                    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ INFORMAÇÕES DA ÁREA                                     │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ Nome da Área *                                          │
│ [_____________________________________________]         │
│                                                         │
│ Linha do Organograma *      Subordinação *              │
│ [▼ Nível 1 - Diretoria]    [▼ Selecione...]           │
│                                                         │
│                                                         │
│ INFORMAÇÕES DO GESTOR                                   │
│ ─────────────────────────────────────────────────────── │
│                                                         │
│ Nome do Gestor *                                        │
│ [_____________________________________________]         │
│                                                         │
│ Cargo do Gestor *                                       │
│ [_____________________________________________]         │
│                                                         │
│ Foto do Gestor                                          │
│ [📷 Imagem Preview]  [Escolher foto]                   │
│ Formatos: JPG, JPEG, PNG • Máximo: 2MB                 │
│                                                         │
├─────────────────────────────────────────────────────────┤
│                      [Cancelar]  [💾 Criar]            │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 ARQUIVOS MODIFICADOS

### Frontend:

1. **`frontend/src/components/pessoas/ModalGestor.tsx`**
   - ✅ Removidos campos: `cor_barra`, `diretoria`, `ordem_exibicao`
   - ✅ Adicionado: campo de upload de foto com preview
   - ✅ Simplificado para 4 níveis (em vez de 5)
   - ✅ Validação atualizada
   - ✅ FormData para upload de arquivo

2. **`frontend/src/services/apiClient.ts`**
   - ✅ Suporte para FormData nos métodos POST e PUT
   - ✅ Detecção automática de FormData (não adiciona Content-Type)

3. **`frontend/src/services/colaboradoresApi.ts`**
   - ✅ Já estava pronto para aceitar FormData

### Backend:

4. **`api/src/routes/colaboradores.ts`**
   - ✅ Configuração do Multer para upload de fotos
   - ✅ Middleware `upload.single('foto')` nas rotas POST e PUT do organograma
   - ✅ Salvamento do caminho da foto
   - ✅ Limpeza de arquivo em caso de erro

5. **`api/src/server.ts`**
   - ✅ Rota estática `/uploads` para servir arquivos de fotos

---

## 🚀 COMO TESTAR

### 1. Reiniciar o Backend

```bash
# Parar o backend (Ctrl+C)
cd api
npm run dev
```

### 2. Atualizar o Frontend

- Pressione **F5** no navegador

### 3. Criar Nova Área

1. Acesse **Pessoas → Painel**
2. Clique no botão **"Criar Área"** (canto superior direito do organograma)
3. Modal abre com formulário simplificado

**Preencha os dados:**
```
Nome da Área: Núcleo de Inovação
Linha do Organograma: Nível 4 - Núcleo
Subordinação: Divisão de Tecnologia
Nome do Gestor: Maria Silva
Cargo do Gestor: Chefe de Núcleo
Foto do Gestor: [Escolher arquivo]
```

4. Clique em **"Criar"**

### 4. Editar Área Existente

1. **Passe o mouse** sobre um card do organograma
2. Aparecerão botões de **Editar** (lápis) e **Excluir** (lixeira)
3. Clique no botão de **Editar**
4. Modal abre com dados preenchidos
5. Modifique o que quiser e clique em **"Atualizar"**

### 5. Upload de Foto

**Ao escolher uma foto:**
- ✅ Preview aparece instantaneamente
- ✅ Validação de tipo de arquivo (JPG, JPEG, PNG)
- ✅ Validação de tamanho (máximo 2MB)
- ✅ Botão "Remover foto" aparece
- ✅ Ao salvar, foto é enviada para o servidor

**Foto será salva em:**
```
Backend: api/uploads/gestores/gestor-1234567890-123456789.jpg
URL: http://localhost:3001/uploads/gestores/gestor-1234567890-123456789.jpg
```

---

## 🔍 VALIDAÇÕES IMPLEMENTADAS

### Campos Obrigatórios:
- ✅ Nome da Área (sempre)
- ✅ Nome do Gestor (sempre)
- ✅ Cargo do Gestor (sempre)
- ✅ Linha do Organograma (sempre)
- ✅ Subordinação (apenas para níveis 2, 3 e 4)

### Regras de Negócio:
- ✅ **Nível 1:** Não pode ter subordinação
- ✅ **Níveis 2+:** Devem ter subordinação
- ✅ **Subordinação:** Apenas áreas do nível anterior aparecem como opção
- ✅ **Foto:** Opcional, mas se fornecida deve ser JPG/JPEG/PNG e máximo 2MB

### Feedback Visual:
- 🔴 Campo obrigatório não preenchido → borda vermelha
- ⚠️ Erro de validação → mensagem vermelha abaixo do campo
- ✅ Sucesso → toast verde "Área criada com sucesso!"
- ❌ Erro → toast vermelho com mensagem de erro

---

## 📊 COMPORTAMENTO DO CAMPO "SUBORDINAÇÃO"

### Linha 1 (Diretoria/Secretaria):
```
Subordinação: [▼ (Sem subordinação)]  ← Desabilitado
```

### Linha 2 (Coordenadoria):
```
Subordinação: [▼ Selecione...] *  ← Obrigatório
Opções:
  - Secretaria de Governança (SGJT)
  - Diretoria XYZ (DPE)
```

### Linha 3 (Divisão):
```
Subordinação: [▼ Selecione...] *  ← Obrigatório
Opções:
  - Coordenadoria de Governança
  - Coordenadoria de Tecnologia
```

### Linha 4 (Núcleo):
```
Subordinação: [▼ Selecione...] *  ← Obrigatório
Opções:
  - Divisão de Desenvolvimento
  - Divisão de Infraestrutura
```

---

## 🎯 NÍVEIS DO ORGANOGRAMA

| Nível | Nome | Exemplo |
|-------|------|---------|
| 1 | Diretoria/Secretaria | Secretaria de Governança Judiciária |
| 2 | Coordenadoria | Coordenadoria de Governança |
| 3 | Divisão | Divisão de Planejamento |
| 4 | Núcleo | Núcleo de Inovação |

---

## 🖼️ UPLOAD DE FOTO - DETALHES TÉCNICOS

### Frontend:
```typescript
// Validações no cliente
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  
  // Validar tamanho (2MB)
  if (file.size > 2 * 1024 * 1024) {
    toast.error('Arquivo muito grande. Máximo 2MB');
    return;
  }
  
  // Validar tipo
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (!allowedTypes.includes(file.type)) {
    toast.error('Apenas imagens JPG, JPEG e PNG são permitidas');
    return;
  }
  
  // Gerar preview
  const reader = new FileReader();
  reader.onloadend = () => {
    setFotoPreview(reader.result as string);
  };
  reader.readAsDataURL(file);
};
```

### Backend:
```typescript
// Configuração do Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'api/uploads/gestores');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `gestor-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens JPG, JPEG e PNG são permitidas'));
    }
  }
});
```

---

## 🔧 TROUBLESHOOTING

### Problema 1: "Foto não aparece no card"

**Causa:** URL da foto está incorreta ou arquivo não foi salvo

**Solução:**
1. Verificar se o diretório `api/uploads/gestores` existe
2. Verificar no console do backend se o arquivo foi salvo
3. Testar acessar diretamente: `http://localhost:3001/uploads/gestores/[nome-do-arquivo]`

### Problema 2: "Erro ao fazer upload: File too large"

**Causa:** Arquivo maior que 2MB

**Solução:**
- Redimensionar imagem antes de enviar
- Usar ferramenta online para comprimir: https://tinypng.com/

### Problema 3: "Subordinação não carrega opções"

**Causa:** API `getPossiveisPais` não está retornando dados

**Solução:**
1. Verificar no console do browser (F12 → Network)
2. Verificar no console do backend se a query está sendo executada
3. Certificar que existem áreas criadas no nível anterior

### Problema 4: "Modal não abre ao clicar em 'Criar Área'"

**Causa:** Erro no estado do React

**Solução:**
1. Verificar console do browser (F12)
2. Certificar que `isModalOpen` está mudando de estado
3. Recarregar a página (F5)

---

## ✅ CHECKLIST DE VALIDAÇÃO

Após implementar, testar:

- [ ] Criar área de Nível 1 (sem subordinação)
- [ ] Criar área de Nível 2 (com subordinação obrigatória)
- [ ] Criar área de Nível 3 (com subordinação obrigatória)
- [ ] Criar área de Nível 4 (com subordinação obrigatória)
- [ ] Upload de foto JPG
- [ ] Upload de foto PNG
- [ ] Tentar upload de arquivo > 2MB (deve dar erro)
- [ ] Tentar upload de arquivo PDF (deve dar erro)
- [ ] Editar área existente
- [ ] Editar e alterar foto
- [ ] Editar e remover foto
- [ ] Excluir área sem subordinados
- [ ] Validação de campos obrigatórios
- [ ] Subordinação dinâmica ao trocar nível
- [ ] Preview de foto antes de salvar
- [ ] Botões de editar/excluir aparecem no hover
- [ ] Toast de sucesso ao criar
- [ ] Toast de sucesso ao editar
- [ ] Toast de erro em caso de falha

---

## 📈 BENEFÍCIOS DA SIMPLIFICAÇÃO

### Antes (10 campos):
- ❌ Formulário longo e intimidador
- ❌ Campos confusos para o usuário
- ❌ Muitas decisões manuais
- ❌ Alto risco de erro

### Depois (6 campos):
- ✅ Formulário limpo e objetivo
- ✅ Apenas informações essenciais
- ✅ Automação de campos técnicos
- ✅ Experiência mais fluida

---

## 🎉 RESULTADO ESPERADO

Ao abrir o modal para criar/editar uma área, o usuário verá:

1. **Interface clean** com apenas 6 campos
2. **Validações em tempo real**
3. **Preview de foto** ao selecionar arquivo
4. **Subordinação dinâmica** baseada no nível
5. **Feedback visual** de sucesso/erro
6. **Responsivo** em mobile

---

**Status:** ✅ **IMPLEMENTADO E PRONTO PARA TESTAR**

**Próximos Passos:**
1. Reiniciar o backend
2. Atualizar o frontend (F5)
3. Testar criação de área
4. Testar upload de foto
5. Testar edição de área

🚀 **Bora testar!**







