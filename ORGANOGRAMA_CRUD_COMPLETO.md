# 🎯 ORGANOGRAMA - CRUD COMPLETO IMPLEMENTADO

## ✅ O QUE FOI IMPLEMENTADO

### Backend (API):
- ✅ `POST /api/colaboradores/organograma` - Criar nova área/gestor
- ✅ `PUT /api/colaboradores/organograma/:id` - Atualizar área/gestor
- ✅ `DELETE /api/colaboradores/organograma/:id` - Excluir área/gestor (soft delete)
- ✅ `GET /api/colaboradores/organograma/possiveis-pais/:linha` - Buscar áreas superiores para subordinação
- ✅ Validações de regras de negócio
- ✅ Service methods completos

### Frontend (Interface):
- ✅ Botão **"Criar Área"** no header do organograma
- ✅ Modal completo para criar/editar áreas e gestores
- ✅ Botões de editar e excluir nos cards (aparecem no hover)
- ✅ Validações em tempo real
- ✅ Seleção automática de áreas superiores (subordinação)
- ✅ Permissões (apenas ADMIN e MANAGER podem criar/editar/excluir)

---

## 🚀 COMO USAR

### 1. Reiniciar o Backend

Para que as novas rotas estejam disponíveis, **reinicie o backend**:

```bash
# Pare o backend (Ctrl+C no terminal)
# Depois reinicie:
cd api
npm run dev
```

### 2. Atualizar o Frontend

Pressione **F5** no navegador para recarregar a aplicação.

---

## 📝 CRIAR NOVA ÁREA/GESTOR

### Passo a Passo:

1. **Clique no botão "Criar Área"** (no header azul do organograma)
2. **Preencha o formulário:**

**Informações da Área:**
- **Nome da Área*** (obrigatório)
  - Ex: "Coordenadoria de Desenvolvimento"
- **Nível Hierárquico*** (obrigatório)
  - Nível 1: Diretoria/Secretaria
  - Nível 2: Coordenadoria
  - Nível 3: Divisão
  - Nível 4: Núcleo/Seção
  - Nível 5: Setor
- **Cor da Barra** (opcional)
  - Escolha entre 10 cores disponíveis
- **Diretoria Raiz*** (obrigatório apenas para Nível 1)
  - SGJT, DPE, DTI, DIJUD, etc.
- **Área Superior (Subordinação)*** (obrigatório para Níveis 2+)
  - Selecione a área à qual esta estará subordinada

**Informações do Gestor:**
- **Nome do Gestor*** (obrigatório)
  - Ex: "João Silva"
- **Cargo do Gestor*** (obrigatório)
  - Ex: "Coordenador", "Diretor", "Chefe de Divisão"
- **Ordem de Exibição** (opcional)
  - Define a ordem em que as áreas aparecem no mesmo nível
  - Ex: 1, 2, 3...

3. **Clique em "Criar"**

---

## ✏️ EDITAR ÁREA/GESTOR

1. **Passe o mouse sobre um card** do organograma
2. **Clique no ícone de lápis** (editar) que aparece no canto superior direito
3. **Modifique os campos desejados**
4. **Clique em "Atualizar"**

---

## 🗑️ EXCLUIR ÁREA/GESTOR

1. **Passe o mouse sobre um card** do organograma
2. **Clique no ícone de lixeira** (excluir) que aparece no canto superior direito
3. **Confirme a exclusão**

**⚠️ IMPORTANTE:**
- Não é possível excluir áreas que tenham subordinados
- Primeiro exclua todas as áreas subordinadas
- A exclusão é **soft delete** (os dados ficam no banco para auditoria)

---

## 🔒 REGRAS DE NEGÓCIO IMPLEMENTADAS

### Validações Automáticas:

✅ **Nível 1 (Diretoria):**
- NÃO pode ter subordinação
- DEVE ter diretoria raiz informada

✅ **Níveis 2+:**
- DEVE ter subordinação (área superior)
- A subordinação DEVE ser de um nível imediatamente anterior
- Herda automaticamente a diretoria raiz

✅ **Ordem Hierárquica:**
- Nível 2 só pode ser subordinado ao Nível 1
- Nível 3 só pode ser subordinado ao Nível 2
- Nível 4 só pode ser subordinado ao Nível 3
- E assim por diante...

✅ **Exclusão:**
- Não permite excluir área com subordinados
- Exibe mensagem clara: "Não é possível excluir: existem áreas subordinadas"

---

## 🎨 CORES DISPONÍVEIS

As seguintes cores estão disponíveis para as barras dos cards:

1. **Azul** (#1976D2)
2. **Verde** (#2E7D32)
3. **Vermelho** (#D32F2F)
4. **Laranja** (#F57C00)
5. **Roxo** (#7B1FA2)
6. **Azul Claro** (#0288D1)
7. **Cinza** (#616161)
8. **Vermelho Escuro** (#C62828)
9. **Verde Claro** (#4CAF50)
10. **Roxo Claro** (#AB47BC)

**Dica:** Use cores diferentes para diferenciar áreas do mesmo nível!

---

## 📊 EXEMPLO PRÁTICO

### Criar uma estrutura completa:

**1. Criar Diretoria (Nível 1):**
```
Nome da Área: Diretoria de Tecnologia da Informação
Nível: 1 - Diretoria
Diretoria Raiz: DTI
Nome do Gestor: José Silva
Cargo: Diretor
Cor: Azul
```

**2. Criar Coordenadoria (Nível 2):**
```
Nome da Área: Coordenadoria de Infraestrutura
Nível: 2 - Coordenadoria
Subordinação: Diretoria de Tecnologia da Informação (DTI)
Nome do Gestor: Maria Santos
Cargo: Coordenadora
Cor: Verde
Ordem: 1
```

**3. Criar Divisão (Nível 3):**
```
Nome da Área: Divisão de Redes e Comunicação
Nível: 3 - Divisão
Subordinação: Coordenadoria de Infraestrutura
Nome do Gestor: Pedro Costa
Cargo: Chefe de Divisão
Cor: Vermelho
Ordem: 1
```

**4. Criar Núcleo (Nível 4):**
```
Nome da Área: Núcleo de Segurança da Informação
Nível: 4 - Núcleo
Subordinação: Divisão de Redes e Comunicação
Nome do Gestor: Ana Lima
Cargo: Diretor de Serviço
Cor: Cinza
Ordem: 1
```

---

## 🔍 VISUALIZAÇÃO

Após criar, você verá:

```
┌──────────────────────────────────────┐
│ Diretoria de TI                      │ ← Nível 1 (Azul)
│ José Silva - Diretor                 │
└──────────────────────────────────────┘
              │
┌──────────────────────────────────────┐
│ Coord. de Infraestrutura             │ ← Nível 2 (Verde)
│ Maria Santos - Coordenadora          │
└──────────────────────────────────────┘
              │
┌──────────────────────────────────────┐
│ Div. de Redes e Comunicação          │ ← Nível 3 (Vermelho)
│ Pedro Costa - Chefe de Divisão       │
└──────────────────────────────────────┘
              │
┌──────────────────────────────────────┐
│ Núcleo de Segurança da Informação    │ ← Nível 4 (Cinza)
│ Ana Lima - Diretor de Serviço        │
└──────────────────────────────────────┘
```

---

## 🔐 PERMISSÕES

| Ação | ADMIN | MANAGER | VIEWER |
|------|-------|---------|--------|
| Visualizar organograma | ✅ | ✅ | ✅ |
| Criar área | ✅ | ✅ | ❌ |
| Editar área | ✅ | ✅ | ❌ |
| Excluir área | ✅ | ✅ | ❌ |

---

## 📝 OBSERVAÇÕES IMPORTANTES

1. **Subordinação Automática:**
   - O sistema mostra apenas as áreas do nível imediatamente anterior
   - Ex: Ao criar Nível 3, só aparecerão áreas do Nível 2

2. **Diretoria Herdada:**
   - Níveis 2+ herdam automaticamente a diretoria do nível superior
   - Não é necessário informar novamente

3. **Ordem de Exibição:**
   - Use números sequenciais (1, 2, 3...)
   - Se não informar, a ordem será aleatória

4. **Fotos:**
   - Atualmente os avatares são gerados automaticamente
   - Em breve: upload de fotos reais dos gestores

5. **Filtro de Diretoria:**
   - O filtro no topo funciona normalmente
   - Mostra apenas os cards da diretoria selecionada

---

## 🐛 SOLUÇÃO DE PROBLEMAS

### Organograma não aparece:
1. Verifique se o backend está rodando
2. Verifique se existem dados no banco (execute `node api/scripts/verificar-organograma.js`)
3. Verifique o console do navegador (F12) para erros
4. Verifique se a diretoria filtrada tem dados

### Não consigo criar área:
1. Verifique se você está logado como ADMIN ou MANAGER
2. Verifique se preencheu todos os campos obrigatórios (*)
3. Verifique se selecionou a subordinação correta (para Níveis 2+)

### Erro ao excluir:
- Verifique se a área tem subordinados
- Primeiro exclua as áreas subordinadas

---

## ✅ PRÓXIMOS PASSOS

Agora você pode:

1. ✅ Criar sua própria estrutura organizacional
2. ✅ Editar áreas existentes
3. ✅ Reorganizar a hierarquia
4. ✅ Excluir áreas desnecessárias
5. ✅ Personalizar cores por coordenadoria

---

**Status:** 🟢 **ORGANOGRAMA CRUD COMPLETO E FUNCIONAL!**

Reinicie o backend (`npm run dev` no diretório `api`) e pressione F5 no navegador para começar a usar! 🚀







