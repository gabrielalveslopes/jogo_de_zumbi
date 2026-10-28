# 🧟 Zombie Apocalypse: Last Stand

> Roguelite de sobrevivência 2D em pixel art 16-bit, com hordas de zumbis, armas automáticas e progressão de personagens. Roda direto no navegador.

Projeto acadêmico de **desenvolvimento de jogos assistido por Inteligência Artificial**, no qual a IA atua como engenheira de software sob uma especificação técnica detalhada, e o desenvolvedor humano conduz, valida e corrige o processo.

---

## 📌 Sobre o projeto

*Zombie Apocalypse: Last Stand* é inspirado na fórmula popularizada por *Vampire Survivors*: o jogador se move enquanto as armas atacam automaticamente, enfrenta hordas crescentes, sobe de nível escolhendo melhorias e tenta sobreviver o máximo possível. A identidade, o cenário (uma cidade devastada por uma pandemia zumbi) e todo o conteúdo são originais.

### Contexto acadêmico

| | |
|---|---|
| **Instituição** | _preencher_ |
| **Curso** | _preencher_ |
| **Disciplina** | _preencher_ |
| **Professor(a)** | _preencher_ |
| **Autor(es)** | _preencher_ |
| **Semestre** | _preencher_ |

### Objetivo do trabalho

Investigar, na prática, até onde o desenvolvimento assistido por IA (frequentemente chamado de *vibe coding*) consegue ir na construção de um jogo completo, e quais práticas de engenharia são necessárias para que o resultado seja **funcional, testável e sustentável**, e não apenas uma demonstração.

---

## 🤖 Metodologia de desenvolvimento com IA

O projeto parte de uma **especificação única e extensa** (prompt de engenharia) que define stack, arquitetura, requisitos de desempenho, conteúdo e regras de conduta para a IA. O desenvolvimento segue **8 fases incrementais**, e cada fase deve terminar com uma versão executável.

**Regras impostas à IA** (trechos centrais da especificação):

- Inspecionar os arquivos existentes antes de modificá-los.
- Entregar arquivos completos e coerentes, sem pseudocódigo nos sistemas essenciais.
- **Nunca afirmar que executou testes ou build sem ter executado de fato.**
- Se não houver acesso a terminal, informar os comandos e pedir os erros reais ao usuário.
- Não apresentar conteúdo planejado como se já estivesse pronto.
- Manter um registro do que foi concluído e testado.

**Divisão de papéis**

| Papel | Responsabilidades |
|---|---|
| **IA** | Gerar código, configurar a stack, escrever testes, propor correções |
| **Humano** | Especificar, executar os comandos, reportar erros reais, avaliar a jogabilidade, decidir o escopo |

---

## 🗺️ Roadmap

| Fase | Descrição | Status |
|---|---|---|
| 1 | Fundação: stack, cenas iniciais, testes configurados | 🟡 Implementada (validação local pendente) |
| 2 | Protótipo jogável: jogador, inimigos, colisão, primeira arma, morte/reinício | 🟡 Implementada (validação local pendente) |
| 3 | Núcleo roguelite: XP, níveis, escolha de melhorias | 🟡 Implementada (validação local pendente) |
| 4 | Desempenho: object pooling, grade espacial, benchmarks | ⬜ Não iniciada |
| 5 | Conteúdo: 20 famílias de inimigos, 12 armas, 6 personagens, 5 mapas, 5 chefes | ⬜ Não iniciada |
| 6 | Progressão: loja permanente, conquistas, estatísticas, saves com migração | ⬜ Não iniciada |
| 7 | Apresentação: pixel art final, animações, áudio, HUD | ⬜ Não iniciada |
| 8 | Estabilização: testes completos, benchmarks, build de produção | ⬜ Não iniciada |

> Atualize esta tabela a cada fase concluída e validada.

---

## 🛠️ Stack

| Tecnologia | Uso |
|---|---|
| **TypeScript** (strict) | Linguagem principal |
| **Phaser 3** | Motor do jogo (WebGL com fallback para Canvas) |
| **Vite** | Servidor de desenvolvimento e build |
| **Vitest** | Testes unitários |
| **Playwright** | Testes de navegador (E2E) |
| **ESLint + Prettier** | Qualidade e padronização de código |

Sem backend: o jogo funciona offline, e os saves serão locais (IndexedDB/localStorage).

---

## 🚀 Como executar

**Requisitos:** [Node.js](https://nodejs.org) 20.19 ou superior e npm.

```bash
# 1. Instalar dependências
npm install

# 2. Iniciar em modo de desenvolvimento
npm run dev
# Abra a URL exibida (normalmente http://localhost:5173)
```

### Todos os comandos

| Comando | Função |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Typecheck + build de produção em `dist/` |
| `npm run preview` | Serve o build localmente |
| `npm run test` | Testes unitários (Vitest) |
| `npm run test:e2e` | Testes de navegador (Playwright) |
| `npm run lint` | Análise estática (ESLint) |
| `npm run typecheck` | Verificação de tipos |
| `npm run format` | Formata o código (Prettier) |

Na primeira vez que for rodar o E2E, instale o navegador do Playwright:

```bash
npx playwright install chromium
```

---

## 🎮 Controles

| Tecla | Ação |
|---|---|
| **W A S D** / **Setas** | Mover o personagem |
| **ESC** | Pausar / continuar |
| **M** (pausado) | Voltar ao menu |
| **F3** | Mostrar FPS e contadores |
| **← →** + **Enter**, **1-3** ou clique | Escolher melhoria ao subir de nível |
| **Enter** / **R** (derrota) | Tentar de novo |
| **Enter** / **Espaço** | Confirmar no menu |
| **Mouse** | Interagir com menus |

---

## 🗂️ Estrutura do projeto

```
zombie-apocalypse/
├── public/assets/        # Assets estáticos (sprites, áudio, dados)
├── src/
│   ├── main.ts           # Ponto de entrada
│   ├── game/             # Configuração, constantes, EventBus
│   ├── scenes/           # Boot, Preload, MainMenu, Game, Upgrade, GameOver
│   ├── entities/         # Player, Enemy, Projectile, Pickup
│   ├── systems/          # Combate, spawn, dificuldade, XP, melhorias, loot (sem Phaser)
│   ├── data/             # Definições de inimigos, armas e melhorias
│   ├── ui/               # HUD
│   └── utils/            # math, random (PRNG com semente), format
├── tests/
│   ├── unit/             # Vitest
│   └── e2e/              # Playwright
├── index.html
├── vite.config.ts
├── vitest.config.ts
├── playwright.config.ts
└── eslint.config.js
```

A estrutura será expandida nas próximas fases com `entities/`, `systems/`, `data/`, `progression/` e `ui/`, mantendo a lógica dos sistemas fora das cenas.

---

## 🧠 Decisões técnicas

- **Resolução interna 640×360** com `pixelArt: true` (filtragem nearest-neighbor) e escala proporcional centralizada.
- **Renderizador automático:** WebGL quando disponível, com fallback para Canvas. Falhas de inicialização exibem uma mensagem ao jogador.
- **Delta limitado por frame** para evitar saltos na simulação após pausa ou perda de foco.
- **Sem assets externos na Fase 1:** as texturas placeholder são geradas por código, então o jogo nunca depende de arte final nem de rede.
- **Dados separados da lógica** (planejado): inimigos, armas, personagens e melhorias definidos em arquivos de dados.
- **Desempenho desde o início** (planejado): object pooling, grade espacial e degradação visual progressiva em hordas grandes.

---

## ✅ Testes

- **Unitários (Vitest):** lógica independente do Phaser (matemática, e futuramente dano, XP, evolução de armas, saves e spawn).
- **E2E (Playwright):** inicialização sem erros, navegação entre cenas e, futuramente, fluxos críticos de partida.

---

## 🌐 Publicação

O build usa caminhos relativos (`base: './'`), então a pasta `dist/` pode ser hospedada em qualquer serviço estático:

- **GitHub Pages:** publique o conteúdo de `dist/` (por exemplo com a action oficial de deploy).
- **Netlify / Cloudflare Pages:** comando de build `npm run build`, diretório de saída `dist`.

---

## ⚠️ Limitações conhecidas

- O jogo está em desenvolvimento: **apenas as Fases 1 a 3 foram implementadas**: há 4 tipos de inimigos, uma arma (pistola), XP, níveis e escolha de melhorias com 5 raridades, mas ainda não há chefes, mais armas, áudio ou saves.
- A escala da tela usa o modo `FIT`, que pode produzir escala fracionária em algumas janelas.
- Os dados salvos localmente (quando implementados) podem ser apagados pelo navegador e **não são seguros contra edição** pelo jogador.
- As metas de desempenho (60 FPS, benchmarks de 500 a 3.000 inimigos) são objetivos de teste, não garantias para qualquer computador.

---

## 📚 Reflexões sobre o desenvolvimento com IA

_Preencha com as conclusões do seu trabalho. Sugestões de pontos a discutir:_

- O que a IA fez bem (boilerplate, configuração, testes, consistência de código)?
- Onde foi necessária intervenção humana (validação, erros de ambiente, decisões de design)?
- Quantas iterações de correção foram necessárias por fase?
- A IA respeitou as regras da especificação (por exemplo, não afirmar testes que não executou)?
- Qual o impacto da qualidade do prompt na qualidade do resultado?
- Riscos: dependências desatualizadas, código não compreendido, falta de testes, questões de licença e autoria.

---

## 🙏 Créditos e inspiração

- Inspirado na mecânica de *Vampire Survivors* (poncle). Este projeto não usa seus assets, código ou marca.
- Construído com [Phaser](https://phaser.io) e [Vite](https://vitejs.dev).
- Código gerado com auxílio de IA (Claude, da Anthropic), com supervisão do(s) autor(es).

## 📄 Licença

_Defina a licença do projeto (por exemplo, MIT) e adicione o arquivo `LICENSE`._
