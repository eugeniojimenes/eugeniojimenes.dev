---
layout: post
title:  "Tracking my English mistakes with a Claude Code hook"
date:   2026-05-08 10:00:00 -0300
locale: en_US
lang-ref: english-notes-claude-hook
tags: ClaudeCode Hooks SQLite English TIL Bash
image: /assets/images/robot-english-teacher.webp
image_alt: "A illustration of a robot teacher standing beside a whiteboard. The robot has a white and gray mechanical body with blue glowing accents and points at an English lesson on the board. The whiteboard reads “Today’s Lesson: English Made Easy!” and includes sections for verbs, pronunciation, and example sentences."
description: >-
  How I turned every Claude Code session into a personal English-tutor logger
  using a Stop hook, a hidden HTML-comment payload, and a SQLite database.

---

I'm Brazilian and I've been studying English hard for the last couple of years. I keep tripping on the same things: prepositions after gerunds, *make* vs *do*, the eternal *then* vs *than*. The corrections were already happening every time I prompted Claude Code, because my global `CLAUDE.md` tells Claude to review my English. I just had no way to look at them later. So I built a tiny pipeline that captures every correction Claude emits during a session and stores it in a local SQLite database for later review.
<!-- excerpt-end -->

The whole thing is two shell scripts, one tiny CLI, and a contract written into my global `CLAUDE.md`. Lives in my [dotfiles](https://github.com/callmarx/dotfiles){:target="_blank"} under the `claude-code` Stow module.

## The idea

Claude Code supports [hooks](https://docs.claude.com/en/docs/claude-code/hooks){:target="_blank"}: shell commands that run on lifecycle events (`Stop`, `PreToolUse`, `PostToolUse`, etc.). The `Stop` hook fires after Claude finishes a turn and gets a JSON payload on stdin including the path to the session transcript (a JSONL file).

That's enough to do something interesting: if I can convince Claude to **mark** every English correction with a machine-readable tag, the `Stop` hook can grep that tag out of the transcript and shove the rows into SQLite.

## What's already in my global `CLAUDE.md`

Before the hook story, the prerequisite. My `~/.claude/CLAUDE.md` (loaded into every Claude Code session, regardless of project) carries a section telling Claude how to handle my English:

1. Address the main task fully first (code review, implementation, debug, whatever).
2. After that, append a brief **English Notes** section pointing out grammar, vocabulary, or phrasing improvements in my prompt. Skip the section entirely if the prompt was clean. Explain *why*, not only the fix.
3. Pick the `rule_id` from a fixed taxonomy I keep in `~/.claude/english-rules.md` (entries like `preposition-plus-gerund`, `make-vs-do`, `then-vs-than`, `pt_calque` flag, etc). For real typos use `spelling`. For genuinely new patterns use `novel`.

That's the part the LLM does. None of it would matter if the corrections evaporated at the end of the session. I needed something that scrapes them out before the transcript closes.

## The hook contract

After the **English Notes** section, the same `CLAUDE.md` rule asks Claude to append a hidden JSON payload inside an HTML comment. The HTML comment is invisible in the rendered chat UI but still present in the transcript. Looks like this:

```
## English Notes
- *"I setted up"* → **"I set up"**. `set` is an irregular verb; past form is identical.

<!-- english-notes
[{"wrong":"I setted up","correct":"I set up","rule_id":"past-participle-after-have","category":"grammar","pt_calque":false,"explanation":"set is irregular"}]
-->
```

Two literal sentinels (`<!-- english-notes` and `-->`) plus exactly one line of JSON between them. `rule_id` comes from a fixed taxonomy I keep in `~/.claude/english-rules.md` so the data stays groupable later.

## The pipeline

```
┌─ user prompt (English) ──────────────────────────────────────────────┐
│                                                                       │
│  Claude reads ~/.claude/CLAUDE.md → must append:                      │
│    1. "English Notes" markdown section (visible in chat)              │
│    2. <!-- english-notes [ ... ] --> JSON (hidden HTML comment)       │
│                                                                       │
└──────────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
              Claude Code writes turn to transcript JSONL
                                 │
                                 ▼
              Stop event → settings.json hook fires
                                 │
                                 ▼
       ~/.claude/hooks/log-english-notes.sh   (Stop hook)
         • reads transcript_path from stdin payload
         • locates last assistant text block in CURRENT turn
         • extracts JSON between the HTML comment sentinels
         • INSERTs each correction into ~/.claude/english-notes.db
                                 │
                                 ▼
                  SQLite DB queried via `eng-stats <subcmd>`
```

Five files do the work:

| Path | Role |
|------|------|
| `CLAUDE.md` | Contract. Tells Claude WHAT to emit. |
| `english-rules.md` | Rule taxonomy, source of truth for `rule_id`. |
| `hooks/init-english-db.sh` | Idempotent SQLite schema bootstrap. |
| `hooks/log-english-notes.sh` | The `Stop` hook. Parses transcript, inserts rows. |
| `bin/eng-stats` | Tiny query CLI (`top`, `calques`, `search`, …). |

**Tip:** the hook runs with `set -uo pipefail`. Note the missing `-e`. A buggy hook must never block the session. Errors land in `~/.claude/english-notes.log`, the user keeps coding.
{: .note-info }

## Querying

`bin/eng-stats` is a thin wrapper around `sqlite3 -header -column`. Subcommands:

| Command | Output |
|---------|--------|
| `top [N]` | Top N `rule_id`s by hit count (excludes `spelling`). |
| `calques [N]` | Only rows where `pt_calque=1`, with examples. |
| `search <term>` | FTS5 match across `wrong/correct/explanation`. |
| `by-project` | Counts grouped by project (basename of `cwd`). |
| `by-month` | Counts grouped by `strftime('%Y-%m', ts)`. |
| `recent [N]` | Last N corrections. |
| `rule <rule_id>` | All hits for a specific rule. |

A real run on my own DB right now:

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

That table is humbling. The top entry is a pain every Portuguese brain knows. You want to say *vale a pena estudar*: a word-for-word translation gives you *"it's worth to study"*, but the correct form is *"it's worth studying"* (preposition-like *worth* takes the gerund, not the infinitive). Same trap with *antes de sair* → *"before to leave"* instead of *"before leaving"*, or *insistir em fazer* → *"insist on to do"* instead of *"insist on doing"*. Now I have a number on top of the feeling.

## Why this is worth the trouble

Two reasons.

The first one is obvious: I get a real dataset of my own English mistakes, grouped by pattern, searchable, with timestamps. After a month of use it stops being anecdotal. You literally see which rule_id dominates and you can study *that one* instead of "English in general".

The second is less obvious: it's a tiny showcase of what `Stop` hooks can do when you stop thinking of them as "run a linter after every turn" and start thinking of them as "scrape structured data out of the conversation itself". The transcript is just JSONL on disk. The HTML-comment sentinel is just a way to smuggle machine-readable data through a UI that strips it. There is a lot of room to play here.

![ok - gif](/assets/images/ok-computer-boy.gif){: .align-center}

## References
 - <https://docs.claude.com/en/docs/claude-code/hooks>
 - The Claude Code module of my dotfiles repo: <https://github.com/callmarx/dotfiles/tree/develop/claude-code/.claude>
 - <https://www.sqlite.org/fts5.html>
