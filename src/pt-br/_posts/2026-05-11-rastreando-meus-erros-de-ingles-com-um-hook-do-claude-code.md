---
layout: post
title:  "Rastreando meus erros de inglês com um hook do Claude Code"
date:   2026-05-11 20:37:00 -0300
locale: pt_BR
lang-ref: english-notes-claude-hook
tags: ClaudeCode Hooks SQLite Ingles TIL Bash
image: /assets/images/robot-english-teacher.webp
image_alt: "Uma ilustração de um robô professor em pé ao lado de um quadro branco. O robô tem um corpo mecânico branco e cinza com detalhes em azul brilhante e aponta para uma lição de inglês no quadro. O quadro branco exibe a frase “Lição de hoje: Inglês Facilitado!” e inclui seções para verbos, pronúncia e frases de exemplo."
description: >-
  Como transformei toda sessão do Claude Code num tutor pessoal de inglês usando
  um hook de Stop, um payload escondido em comentário HTML e um banco SQLite.

---

Sou brasileiro e venho estudando inglês forte nos últimos dois anos. Vivo tropeçando nas mesmas coisas: preposição depois de gerúndio, *make* vs *do*, o eterno *then* vs *than*. As correções já aconteciam toda vez que eu prompt o Claude Code, porque meu `CLAUDE.md` global manda o Claude revisar meu inglês. Eu só não tinha como olhar para elas depois. Então montei um pipeline pequeno que captura toda correção que o Claude emite durante uma sessão e guarda num banco SQLite local para revisão posterior.
<!-- excerpt-end -->

A coisa toda são dois shell scripts, uma CLI minúscula e um contrato escrito no meu `CLAUDE.md` global. Mora nos meus [dotfiles](https://github.com/callmarx/dotfiles){:target="_blank"} dentro do módulo Stow `claude-code`.

## A ideia

O Claude Code suporta [hooks](https://docs.claude.com/en/docs/claude-code/hooks){:target="_blank"}: comandos shell que rodam em eventos do ciclo de vida (`Stop`, `PreToolUse`, `PostToolUse` etc). O hook `Stop` dispara depois que o Claude termina um turno e recebe um payload JSON via stdin que inclui o caminho do transcript da sessão (um arquivo JSONL).

Isso já é o suficiente para fazer algo interessante: se eu conseguir convencer o Claude a **marcar** toda correção de inglês com uma tag legível por máquina, o hook `Stop` consegue extrair essa tag do transcript e jogar as linhas no SQLite.

## O que já está no meu `CLAUDE.md` global

Antes da história do hook, o pré-requisito. Meu `~/.claude/CLAUDE.md` (carregado em toda sessão do Claude Code, independente do projeto) tem uma seção dizendo ao Claude como tratar meu inglês:

1. Resolver a tarefa principal por completo primeiro (revisão de código, implementação, debug, o que for).
2. Depois disso, anexar uma seção curta **English Notes** apontando melhorias de gramática, vocabulário ou frasing no meu prompt. Pular a seção inteira se o prompt estava limpo. Explicar *o porquê*, não só a correção.
3. Escolher o `rule_id` de uma taxonomia fixa que mantenho em `~/.claude/english-rules.md` (entradas como `preposition-plus-gerund`, `make-vs-do`, `then-vs-than`, flag `pt_calque` etc). Para typos puros usar `spelling`. Para padrões genuinamente novos usar `novel`.

Essa é a parte que o LLM faz. Nada disso importaria se as correções evaporassem no fim da sessão. Eu precisava de algo que extraísse elas antes do transcript fechar.

## O contrato do hook

Depois da seção **English Notes**, a mesma regra do `CLAUDE.md` pede para o Claude anexar um payload JSON escondido dentro de um comentário HTML. O comentário HTML é invisível na UI renderizada do chat mas continua presente no transcript. Fica assim:

```
## English Notes
- *"I setted up"* → **"I set up"**. `set` é verbo irregular; o passado tem a mesma forma.

<!-- english-notes
[{"wrong":"I setted up","correct":"I set up","rule_id":"past-participle-after-have","category":"grammar","pt_calque":false,"explanation":"set is irregular"}]
-->
```

Dois sentinelas literais (`<!-- english-notes` e `-->`) e exatamente uma linha de JSON entre eles. O `rule_id` vem de uma taxonomia fixa que mantenho em `~/.claude/english-rules.md`, para que os dados continuem agrupáveis depois.

## O pipeline

```
┌─ prompt do usuário (em inglês) ──────────────────────────────────────┐
│                                                                       │
│  Claude lê ~/.claude/CLAUDE.md → deve anexar:                         │
│    1. seção markdown "English Notes" (visível no chat)                │
│    2. <!-- english-notes [ ... ] --> JSON (comentário HTML escondido) │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
              Claude Code escreve o turno no transcript JSONL
                                 │
                                 ▼
              Evento Stop → hook do settings.json dispara
                                 │
                                 ▼
       ~/.claude/hooks/log-english-notes.sh   (hook Stop)
         • lê transcript_path do payload na stdin
         • localiza o último bloco de texto do assistant no turno ATUAL
         • extrai o JSON entre os sentinelas do comentário HTML
         • INSERT de cada correção em ~/.claude/english-notes.db
                                 │
                                 ▼
                Banco SQLite consultado via `eng-stats <subcmd>`
```

Cinco arquivos fazem o trabalho:

| Caminho | Papel |
|---------|-------|
| `CLAUDE.md` | Contrato. Diz ao Claude O QUE emitir. |
| `english-rules.md` | Taxonomia das regras, fonte da verdade do `rule_id`. |
| `hooks/init-english-db.sh` | Bootstrap idempotente do schema SQLite. |
| `hooks/log-english-notes.sh` | O hook `Stop`. Parseia transcript, insere linhas. |
| `bin/eng-stats` | CLI minúscula de consulta (`top`, `calques`, `search`, …). |

**Dica:** o hook roda com `set -uo pipefail`. Repare na ausência do `-e`. Hook bugado JAMAIS pode travar a sessão. Erros vão para `~/.claude/english-notes.log` e o usuário continua codando.
{: .note-info }

## Consultando

`bin/eng-stats` é um wrapper finíssimo em volta de `sqlite3 -header -column`. Subcomandos:

| Comando | Saída |
|---------|-------|
| `top [N]` | Top N `rule_id`s por contagem (exclui `spelling`). |
| `calques [N]` | Só linhas com `pt_calque=1`, com exemplos. |
| `search <termo>` | Match FTS5 em `wrong/correct/explanation`. |
| `by-project` | Contagem agrupada por projeto (basename do `cwd`). |
| `by-month` | Contagem agrupada por `strftime('%Y-%m', ts)`. |
| `recent [N]` | Últimas N correções. |
| `rule <rule_id>` | Todos os hits de uma regra específica. |

Uma rodada real no meu próprio banco agora:

```
$ eng-stats top 5
rule_id                       hits
----------------------------  ----
preposition-plus-gerund         23
make-vs-do                      11
missing-article                  9
search-vs-research-vs-look-into  7
then-vs-than                     4
```

Essa tabela é humilhante. O topo da lista é uma dor que todo cérebro brasileiro conhece. Você quer dizer *vale a pena estudar*: uma tradução palavra por palavra vira *"it's worth to study"*, mas o correto é *"it's worth studying"* (depois de *worth* vai gerúndio, não infinitivo). Mesma armadilha com *antes de sair* → *"before to leave"* em vez de *"before leaving"*, ou *insistir em fazer* → *"insist on to do"* em vez de *"insist on doing"*. Agora eu tenho um número em cima da sensação.

## Por que vale o trabalho

Dois motivos.

O primeiro é óbvio: tenho um dataset real dos meus próprios erros de inglês, agrupado por padrão, pesquisável, com timestamp. Depois de um mês de uso isso deixa de ser anedota. Você literalmente vê qual `rule_id` domina e estuda *aquela* regra em vez de "inglês em geral".

O segundo é menos óbvio: é uma vitrine pequena do que hooks `Stop` conseguem fazer quando você para de pensar neles como "rodar um linter depois de todo turno" e começa a pensar neles como "extrair dado estruturado da própria conversa". O transcript é só um JSONL no disco. O sentinela em comentário HTML é só um jeito de contrabandear dado legível por máquina por uma UI que o esconde. Tem muito espaço pra brincar.

![proud of you - gif](/assets/gifs/proud-of-you.gif){: .align-center}

## Referências
 - <https://docs.claude.com/en/docs/claude-code/hooks>
 - O módulo do Claude Code do meu dotfiles: <https://github.com/callmarx/dotfiles/tree/develop/claude-code/.claude>
 - <https://www.sqlite.org/fts5.html>
