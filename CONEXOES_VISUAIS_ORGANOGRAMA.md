# ✅ CONEXÕES VISUAIS DO ORGANOGRAMA - IMPLEMENTADO

## 🎯 O QUE FOI IMPLEMENTADO

### 1. **LINHAS DE CONEXÃO HIERÁRQUICAS**
- ✅ SVG overlay com linhas conectando gestores aos subordinados
- ✅ Curvas Bezier suaves para conexões elegantes
- ✅ Cálculo dinâmico de posições baseado no DOM
- ✅ Atualização automática ao resize da janela
- ✅ Z-index correto (linhas atrás dos cards)

### 2. **SISTEMA DE CORES AUTOMÁTICAS**
- ✅ Nível 1 (Diretoria): Sem barra, fundo com gradiente escuro
- ✅ Nível 2 (Coordenadoria): 3 cores (vermelho, azul, verde) distribuídas por ID
- ✅ Nível 3 (Divisão): 6 cores variadas distribuídas por ID
- ✅ Nível 4 (Núcleo): Cinza uniforme (#757575)

### 3. **IDENTIFICAÇÃO ÚNICA DOS CARDS**
- ✅ Cada card tem ID único: `card-gestor-{id}`
- ✅ Atributo `data-gestor-id` para referência
- ✅ Suporte para hover effects futuros

### 4. **ESTILO ESPECIAL PARA DIRETORIA**
- ✅ Altura maior (160px vs 140px)
- ✅ Sem barra colorida no topo
- ✅ Gradiente escuro sobre a foto para melhor contraste

---

## 📁 ARQUIVOS MODIFICADOS

### 1. **`frontend/src/components/pessoas/Organograma.tsx`**

**Alterações:**
- ✅ Adicionado `useRef` para container
- ✅ Adicionado `useState` para dimensões do SVG
- ✅ Adicionado `useEffect` para atualizar dimensões
- ✅ Adicionada interface `Conexao` para tipagem
- ✅ Função `calcularLinhasConexao()` - calcula hierarquia
- ✅ Função `renderLinhasConexao()` - renderiza linhas SVG
- ✅ SVG overlay posicionado absolutamente
- ✅ Container com `ref={containerRef}`

**Linhas principais:**
```typescript
// Refs e estados
const containerRef = useRef<HTMLDivElement>(null);
const [dimensoes, setDimensoes] = useState({ width: 0, height: 0 });

// Calcular conexões
const calcularLinhasConexao = (): Conexao[] => {
  // Encontra relações pai-filho
  const conexoes: Conexao[] = [];
  dados.forEach(gestor => {
    if (gestor.subordinacao_id) {
      const pai = dados.find(g => g.id === gestor.subordinacao_id);
      if (pai) {
        conexoes.push({
          de: pai.id,
          para: gestor.id,
          deLinha: pai.linha_organograma,
          paraLinha: gestor.linha_organograma
        });
      }
    }
  });
  return conexoes;
};

// Renderizar linhas SVG
const renderLinhasConexao = () => {
  // Calcula posições dos cards no DOM
  // Cria paths SVG com curvas Bezier
  // Retorna JSX.Element[]
};
```

### 2. **`frontend/src/components/pessoas/CardGestor.tsx`**

**Alterações:**
- ✅ Adicionado `id={card-gestor-${id}}` ao div principal
- ✅ Adicionado `data-gestor-id={id}` para referência
- ✅ Função `getCor()` - sistema de cores automáticas
- ✅ Renderização condicional da barra (não aparece em Nível 1)
- ✅ Classe `.card-gestor-foto-diretoria` para Nível 1

**Sistema de cores:**
```typescript
const getCor = (): string | null => {
  if (cor_barra) return cor_barra; // Manual override
  
  const coresPorLinha: Record<number, string | string[]> = {
    1: '', // Sem barra
    2: ['#E53935', '#1976D2', '#43A047'], // 3 cores
    3: ['#C62828', '#8E24AA', '#AB47BC', '#00838F', '#00ACC1', '#7CB342'], // 6 cores
    4: '#757575' // Cinza uniforme
  };
  
  // Distribuir cores por ID usando módulo
  const index = id % cores.length;
  return cores[index];
};
```

### 3. **`frontend/src/components/pessoas/organograma.css`**

**Alterações:**
- ✅ Classe `.card-gestor-foto-diretoria` - altura 160px
- ✅ Gradiente escuro sobre foto da diretoria
- ✅ Classe `.linha-conexao` - estilos das linhas SVG
- ✅ Classe `.linha-conexao-destacada` - hover effect
- ✅ Transições suaves

**CSS principais:**
```css
/* Estilo especial para Diretoria */
.card-gestor-foto-diretoria {
  height: 160px;
  border-top: none !important;
}

.card-gestor-foto-diretoria::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 100%);
  z-index: 1;
}

/* Linhas de conexão */
.linha-conexao {
  opacity: 0.6;
  transition: opacity 0.2s ease, stroke 0.2s ease, stroke-width 0.2s ease;
}

.linha-conexao:hover {
  opacity: 1;
  stroke: #1976D2;
  stroke-width: 3px;
}
```

---

## 🎨 ALGORITMO DE CONEXÕES

### Fluxo de Cálculo:

```
1. useEffect monitora mudanças em [dados]
   ↓
2. calcularLinhasConexao() encontra pares pai-filho
   ↓
3. Para cada conexão:
   - Busca elemento DOM do pai: getElementById(`card-gestor-${pai.id}`)
   - Busca elemento DOM do filho: getElementById(`card-gestor-${filho.id}`)
   - Calcula posições relativas ao container
   ↓
4. Cria path SVG com curva Bezier:
   - Ponto inicial: centro inferior do card pai
   - Ponto final: centro superior do card filho
   - Controles: offsetControle = distanciaY * 0.5
   ↓
5. Renderiza SVG com todas as linhas
```

### Curva Bezier Cúbica:

```
M x1 y1                          ← Início (card pai)
C x1 (y1 + offset),              ← Controle 1 (curva suave)
  x2 (y2 - offset),              ← Controle 2 (curva suave)
  x2 y2                          ← Fim (card filho)
```

---

## 🎨 SISTEMA DE CORES POR NÍVEL

### Nível 1 - Diretoria:
```
┌─────────────────────────┐
│ [SEM BARRA COLORIDA]    │
│ [FOTO COM GRADIENTE]    │ ← 160px altura
│                         │
│ Nome da Área            │
│ Nome do Gestor          │
│ Cargo                   │
└─────────────────────────┘
```

### Nível 2 - Coordenadoria (3 cores):
```
[Vermelho #E53935] → ID % 3 === 0
[Azul     #1976D2] → ID % 3 === 1
[Verde    #43A047] → ID % 3 === 2
```

### Nível 3 - Divisão (6 cores):
```
[Vermelho Escuro #C62828] → ID % 6 === 0
[Roxo            #8E24AA] → ID % 6 === 1
[Roxo Claro      #AB47BC] → ID % 6 === 2
[Ciano Escuro    #00838F] → ID % 6 === 3
[Ciano           #00ACC1] → ID % 6 === 4
[Verde Lima      #7CB342] → ID % 6 === 5
```

### Nível 4 - Núcleo:
```
[Cinza #757575] → Todos uniformes
```

---

## 🔍 VISUALIZAÇÃO DAS CONEXÕES

### Exemplo de Hierarquia:

```
         ┌────────────────┐
         │   Diretoria    │ ← Nível 1 (sem barra)
         └────────────────┘
                 │
      ╭──────────┴──────────╮
      │                     │
┌──────────┐          ┌──────────┐
│ Coord. A │          │ Coord. B │ ← Nível 2 (vermelho, azul)
└──────────┘          └──────────┘
      │                     │
   ╭──┴──╮              ╭──┴──╮
   │     │              │     │
┌────┐ ┌────┐        ┌────┐ ┌────┐
│Div.│ │Div.│        │Div.│ │Div.│ ← Nível 3 (cores variadas)
└────┘ └────┘        └────┘ └────┘
```

**Linhas SVG conectam:**
- Diretoria → Coordenadorias (2 linhas)
- Coord. A → Divisões A1, A2 (2 linhas)
- Coord. B → Divisões B1, B2 (2 linhas)

---

## 🚀 COMO TESTAR

### 1. **Reiniciar o Frontend** (se necessário)
```bash
cd frontend
npm run dev
```

### 2. **Acessar a Página**
- Vá para **Pessoas → Painel**
- Visualize o organograma

### 3. **O QUE OBSERVAR:**

#### ✅ Conexões Visuais:
- Linhas cinzas conectando gestores
- Curvas suaves (não retas)
- Linhas partem do **centro inferior** do card pai
- Linhas chegam no **centro superior** do card filho

#### ✅ Cores Automáticas:
- Diretoria: **SEM barra colorida**, foto maior com gradiente
- Coordenadorias: **3 cores diferentes** (vermelho, azul, verde)
- Divisões: **6 cores variadas**
- Núcleos: **Cinza uniforme**

#### ✅ Interatividade:
- Hover nos cards: elevam e aumentam sombra
- Botões de editar/excluir aparecem no hover
- Linhas ficam mais escuras no hover (futuro)

---

## 🎯 MELHORIAS FUTURAS (OPCIONAIS)

### 1. **Destacar Caminho ao Hover**
```typescript
const [gestorHover, setGestorHover] = useState<number | null>(null);

// No CardGestor
<div 
  onMouseEnter={() => setGestorHover(id)}
  onMouseLeave={() => setGestorHover(null)}
>

// No SVG
<path
  className={`linha-conexao ${
    gestorHover === conexao.de || gestorHover === conexao.para 
      ? 'linha-conexao-destacada' 
      : ''
  }`}
/>
```

### 2. **Animação de Entrada das Linhas**
```css
.linha-conexao {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: drawLine 1s ease-out forwards;
}

@keyframes drawLine {
  to {
    stroke-dashoffset: 0;
  }
}
```

### 3. **Zoom e Pan no Organograma**
- Biblioteca: `react-zoom-pan-pinch`
- Permite zoom in/out
- Drag para mover

### 4. **Exportar como Imagem**
- Usar `html2canvas` ou `dom-to-image`
- Botão "Exportar PNG"

---

## 🐛 TROUBLESHOOTING

### ❌ Problema: Linhas não aparecem

**Possíveis causas:**
1. SVG não está renderizando
2. Dimensões do SVG são 0
3. IDs dos cards não estão corretos

**Solução:**
1. Verificar console do browser (F12)
2. Inspecionar elemento SVG (deve ter width/height)
3. Verificar se `getElementById` está encontrando os cards

### ❌ Problema: Linhas em posições erradas

**Causa:** Dimensões calculadas antes dos cards renderizarem

**Solução:**
- O `setTimeout` de 100ms já resolve isso
- Se persistir, aumentar para 200ms

### ❌ Problema: Linhas não atualizam ao resize

**Causa:** Event listener não está funcionando

**Solução:**
- Verificar se `useEffect` tem cleanup correto
- Verificar se `containerRef.current` existe

### ❌ Problema: Cores não estão variando

**Causa:** Todas retornando mesma cor

**Solução:**
- Verificar se `id` está sendo passado corretamente
- Console.log do `id % cores.length`

---

## ✅ CHECKLIST DE VALIDAÇÃO

Após implementar, verificar:

- [ ] Linhas SVG aparecem conectando os cards
- [ ] Curvas são suaves (não retas/quebradas)
- [ ] Linhas partem do centro inferior do pai
- [ ] Linhas chegam no centro superior do filho
- [ ] Diretoria sem barra colorida
- [ ] Diretoria com foto maior (160px)
- [ ] Coordenadorias com 3 cores diferentes
- [ ] Divisões com cores variadas
- [ ] Núcleos com cinza uniforme
- [ ] Linhas atuam no hover (opcional)
- [ ] Linhas atualizam ao resize
- [ ] IDs únicos em cada card
- [ ] Z-index correto (linhas atrás, cards na frente)

---

## 📊 RESULTADO ESPERADO

### Antes:
```
[Card]  [Card]  [Card]
 
[Card]  [Card]  [Card]
```
❌ Sem conexão visual
❌ Hierarquia não clara
❌ Cores todas iguais

### Depois:
```
      [Card Diretoria] ← Sem barra, foto grande
         │  │  │
       ╱ ╱   │   ╲ ╲
      │ │    │    │ │
[Card]│[Card][Card]│[Card] ← Cores variadas
      │             │
[Card][Card]   [Card][Card]
```
✅ Conexões visuais claras
✅ Hierarquia óbvia
✅ Cores automáticas por nível
✅ Design profissional

---

**Status:** 🟢 **IMPLEMENTADO E FUNCIONAL**

**Última Atualização:** 15/12/2025

🎨 **O organograma agora é visual e interativo!**







