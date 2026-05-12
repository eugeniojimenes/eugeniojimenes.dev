---
layout: post
title:  "Histórico Git mais limpo com --fixup e --autosquash (e quando isso não importa)"
date:   2026-05-07 10:00:00 -0300
locale: pt_BR
lang-ref: git-fixup-autosquash
tags: Git Workflow Rebase Lazygit TIL
image: /assets/images/git-fixup-history.webp
image_alt: "A visualização de histórico git bagunçado com commits de correção, merge pull e refatoração."
description: >-
  Como usar `git commit --fixup` em conjunto com `git rebase --autosquash` para manter
  o histórico da feature branch limpo e quando isso realmente compensa.

---

Estava eu estudando Git para uma entrevista sênior quando redescobri um workflow que vivo esquecendo: a combinação `--fixup` + `--autosquash`. É uma daquelas funcionalidades que parece invisível até você usar uma vez — depois você se pergunta como conseguia viver sem.
<!-- excerpt-end -->

## O problema

Você está três commits dentro de uma feature branch:

```
abc1234  feat(user): Add User model
def5678  feat(article): Add Article model
789abcd  feat(article): Add ArticleController
```

Aí você percebe um typo no `abc1234` (o User model). Corrige localmente e agora?

- `git commit --amend` só funciona se o commit quebrado for o `HEAD`. Não é o caso.
- `git commit -m "fix typo"` resolve, mas agora sua branch tem um commit solto `fix typo` que os revisores vão ver e (com razão) suspirar.
- `git rebase -i HEAD~3`, marcar o commit do typo como `fixup`, arrastar manualmente até perto do alvo, salvar... funciona, mas é muito clique pra um typo.

Existe um jeito melhor.

## A receita em dois passos

### Passo 1 — durante o trabalho: `git commit --fixup=<sha>`

Faça stage da correção e rode:

```bash
git add app/models/user.rb
git commit --fixup=abc1234
```

O Git cria um commit com a mensagem `fixup! feat(user): Add User model` automaticamente e nenhum editor abre (não há nenhuma mensagem pra digitar). Continue codando e acumule quantos `fixup!` precisar:

```
abc1234  feat(user): Add User model
def5678  feat(article): Add Article model
789abcd  feat(article): Add ArticleController
xyz9999  fixup! feat(user): Add User model     ← nomeado automaticamente, fica no topo
```

### Passo 2 — antes de abrir o PR: `git rebase -i --autosquash`

```bash
git rebase -i --autosquash origin/main
```

O Git abre a lista do rebase **já organizada pra você**! O commit `fixup! ...` foi movido pra junto do alvo e marcado como `fixup`:

```
pick   abc1234  feat(user): Add User model
fixup  xyz9999  fixup! feat(user): Add User model    ← auto-movido, auto-marcado
pick   def5678  feat(article): Add Article model
pick   789abcd  feat(article): Add ArticleController
```

Salve e feche. A correção colapsa dentro do `abc1234`, a mensagem do `fixup!` é descartada e a mensagem original do commit sobrevive intacta. Histórico limpo e legivel.

![mind blown - gif](/assets/gifs/cosmo-kramer-mind-blown.gif){: .align-center}

## `fixup` vs `squash`

Os dois combinam commits. A diferença está no que acontece com a mensagem:

| Verbo    | Combina? | Mantém a mensagem do fix?                          |
| -------- | -------- | -------------------------------------------------- |
| `fixup`  | Sim      | **Não** — descartada silenciosamente               |
| `squash` | Sim      | Sim — abre editor para juntar as duas mensagens    |

Use `fixup` para typos, `binding.pry` esquecido, arquivo faltando etc. Use `squash` quando o commit da correção tem um contexto que vale a pena manter no log.

## Variantes bônus (Git 2.32+)

Dois primos do `--fixup` que pouca gente conhece:

```bash
git commit --fixup=amend:abc1234   # incorpora o stage E permite reescrever a mensagem do alvo
git commit --fixup=reword:abc1234  # só reescreve a mensagem do alvo, sem incorporar diff
```

Vou recorrer ao `reword:` sempre que perceber que a mensagem de um commit ficou ruim. Sem fazer stage de nada, rodo o comando e edito a mensagem durante o autosquash. Limpo.

**Dica:** Coloque `--fixup` e `--autosquash` na memória muscular antes de partir pro `git rebase -i HEAD~N`. O editor interativo é mais lento na maioria dos casos.
{: .note-info }

## Tornando isso o padrão

Cansou de digitar `--autosquash` toda vez? Configure globalmente:

```bash
git config --global rebase.autoSquash true
```

Depois disso, o simples `git rebase -i origin/main` já organiza seus fixups. Combine com `pull.rebase=true` e `push.followTags=true` pra ter uma experiência Git mais sã por padrão.

## Para usuários do Lazygit

Se você vive no [`lazygit`](https://github.com/jesseduffield/lazygit) (eu vivo), o mesmo workflow sai em duas teclas:

- **`Shift+F` na view de Commits**: cria um commit `fixup!` mirando no commit selecionado. Equivalente a `git commit --fixup=<sha>`.
- **`Shift+S` na view de Commits**: faz autosquash de todos os `fixup!` acima do commit selecionado (ou da branch inteira).
- **`Ctrl+f` na view de Files**: encontra automaticamente o commit base para o fixup. Faça stage dos hunks relacionados antes para limitar o escopo; se nada estiver em stage, o lazygit analisa todas as modificações fora de stage.

**Atenção:** Não confunda **`F`** (maiúsculo, *cria* o commit fixup) com **`f`** (minúsculo, *funde* o commit selecionado com o de baixo — **ação diferente**).
{: .note-warning }

## E se meu time usa squash-merge?

Resposta honesta: **ajuda parcialmente**. O ganho depende de como os PRs caem no `main`:

| Estilo de merge do time                        | Por quanto tempo o histórico limpo dura?           |
| ---------------------------------------------- | -------------------------------------------------- |
| Merge commit (`--no-ff`)                       | **Para sempre** — cada commit cai no `main`        |
| Rebase merge (GitHub "Rebase and merge")       | **Para sempre** — linear, mas cada commit mantido  |
| **Squash merge** (padrão do GitHub pra muitos) | **Só durante a review** — colapsa ao dar merge     |

Um exemplo concreto, antes e depois, na mesma branch:

Branch inicial (4 commits, fixup ainda não absorvido):

```
abc1234  feat(user): Add User model
def5678  feat(article): Add Article model
789abcd  feat(article): Add ArticleController
xyz9999  fixup! feat(user): Add User model     ← nomeado automaticamente, fica no topo
```

Mergeando *sem* rodar `--autosquash` antes:

```
─ Squash merge:  M1   Add user/article models + controller (#42)   ← fixup invisível (tudo colapsado)
─ Merge commit:  abc1234, def5678, 789abcd, xyz9999, M1            ← fixup VISÍVEL pra sempre no main
```

Mergeando *depois* de `git rebase -i --autosquash origin/main`:

```
─ Squash merge:  M1   Add user/article models + controller (#42)   ← continua 1 commit, zero ganho no log
─ Merge commit:  abc1234, def5678, 789abcd, M1                     ← 3 commits limpos, fixup absorvido
```

Então, se seu time usa squash-merge, o ganho de longo prazo no `git log` desaparece, mas a **experiência de review** continua valendo. Os revisores leem commit por commit na aba "Commits" do PR e veem uma narrativa limpa: `Add User model` → `Add Article model` → `Add ArticleController`, melhor do que esses três mais um `fixup! Add User model` flutuando no fim. Review mais rápida, menos carga mental.

![Ok - gif](/assets/gifs/ok-computer-boy.gif){: .align-center}

## Referências
 - <https://git-scm.com/docs/git-commit>
 - <https://git-scm.com/docs/git-rebase>
 - <https://thoughtbot.com/blog/autosquashing-git-commits>
 - <https://github.com/jesseduffield/lazygit>
