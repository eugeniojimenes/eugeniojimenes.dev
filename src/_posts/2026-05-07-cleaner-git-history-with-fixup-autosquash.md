---
layout: post
title:  "Cleaner Git history with --fixup and --autosquash (and when it doesn't matter)"
date:   2026-05-07 10:00:00 -0300
locale: en_US
lang-ref: git-fixup-autosquash
tags: Git Workflow Rebase Lazygit TIL
image: /assets/images/git-fixup-history.webp
image_alt: "A messy git history view with commits of fixing, merge pull and refactoring."
description: >-
  How to use `git commit --fixup` together with `git rebase --autosquash` to keep
  feature-branch history clean and when it actually pays off.

---

I was studying Git for a senior interview prep when I rediscovered a workflow I keep forgetting: the `--fixup` + `--autosquash` combo. It's one of those features that feels invisible until you try it once, and then you wonder how you ever lived without it.
<!-- excerpt-end -->

## The problem

You're three commits deep into a feature branch:

```
abc1234  feat(user): Add User model
def5678  feat(article): Add Article model
789abcd  feat(article): Add ArticleController
```

Then you spot a small typo in `abc1234` (the User model). You fixed it locally and now what?

- `git commit --amend` only works if the broken commit is `HEAD`. It's not.
- `git commit -m "fix typo"` works, but now your branch has a dangling `fix typo` commit that reviewers will see and (rightfully) sigh at.
- `git rebase -i HEAD~3`, mark the typo commit `fixup`, manually drag it next to its target, save... it works, but it's a lot of clicks for a typo.

There is a better way.

## The two-step recipe

### Step 1 — during work: `git commit --fixup=<sha>`

Stage the fix and run:

```bash
git add app/models/user.rb
git commit --fixup=abc1234
```

Git creates a commit with the message `fixup! feat(user): Add User model` automatically and no editor opens (there is no message to type). Keep coding and stack as many `fixup!` commits as you need:

```
abc1234  feat(user): Add User model
def5678  feat(article): Add Article model
789abcd  feat(article): Add ArticleController
xyz9999  fixup! feat(user): Add User model     ← auto-named, sits at the tip
```

### Step 2 — before opening the PR: `git rebase -i --autosquash`

```bash
git rebase -i --autosquash origin/main
```

Git opens the rebase todo list **already arranged for you**! The `fixup! ...` commit moved next to its target and marked `fixup`:

```
pick   abc1234  feat(user): Add User model
fixup  xyz9999  fixup! feat(user): Add User model    ← auto-moved, auto-marked
pick   def5678  feat(article): Add Article model
pick   789abcd  feat(article): Add ArticleController
```

Save and close. The fix collapses into `abc1234`, the `fixup!` message is dropped and the original commit message survives untouched. Clean and readable history.

![mind blown - gif](/assets/images/cosmo-kramer-mind-blown.gif){: .align-center}

## `fixup` vs `squash`

Both combine commits. They differ in what happens to the message:

| Verb     | Combines? | Keeps the fix's message?                           |
| -------- | --------- | -------------------------------------------------- |
| `fixup`  | Yes       | **No** — discarded silently                        |
| `squash` | Yes       | Yes — opens an editor to merge both messages       |

Use `fixup` for typos, missed `binding.pry`, forgotten file etc. Use `squash` when the fix commit
adds context worth keeping in the log.

## Bonus variants (Git 2.32+)

Two cousins of `--fixup` that fewer people know about:

```bash
git commit --fixup=amend:abc1234   # fold staged changes AND let you reword the target
git commit --fixup=reword:abc1234  # reword target only, no diff folding
```

I'll reach for `reword:` whenever I realize a commit message landed badly. Stage nothing, run the command, edit the message during autosquash. Clean.

**Tip:** Add `--fixup` and `--autosquash` to your muscle memory before you reach for `git rebase -i HEAD~N`. The interactive editor is slower in most cases.
{: .note-info }

## Make it the default

Tired of typing `--autosquash` every time? Set it globally:

```bash
git config --global rebase.autoSquash true
```

After that, plain `git rebase -i origin/main` already arranges your fixups. Combine with `pull.rebase=true` and `push.followTags=true` for a saner default Git experience.

## Lazygit users

If you live in [`lazygit`](https://github.com/jesseduffield/lazygit) (I do), the same workflow is two keystrokes:

- **`Shift+F` in the Commits view**: create a `fixup!` commit targeting the selected commit. Equivalent to `git commit --fixup=<sha>`.
- **`Shift+S` in the Commits view**: autosquash all `fixup!` commits above the selected commit (or in the whole branch).
- **`Ctrl+f` in the Files view**: auto-find the base commit for the fixup. Stage the related hunks first to narrow the scope; if nothing is staged, lazygit analyzes all unstaged modifications.

**Watch out:** don't confuse **`F`** (capital, *create* fixup commit) with **`f`** (lowercase, *meld* the selected commit into the one below it — **different action**).
{: .note-warning }

## Does this matter if your team squash-merges?

Honest answer: **it helps partially**. The payoff depends on how PRs land on `main`:

| Team merge style                            | When does the clean history live?                    |
| ------------------------------------------- | ---------------------------------------------------- |
| Merge commit (`--no-ff`)                    | **Forever** — every commit lands on `main`           |
| Rebase merge (GitHub "Rebase and merge")    | **Forever** — linear, but each commit kept           |
| **Squash merge** (GitHub default for many)  | **Only during PR review** — collapses on merge       |

A concrete before/after on the same branch:

Starting branch (4 commits, fixup not yet absorbed):

```
abc1234  feat(user): Add User model
def5678  feat(article): Add Article model
789abcd  feat(article): Add ArticleController
xyz9999  fixup! feat(user): Add User model     ← auto-named, sits at the tip
```

Merging *without* running `--autosquash` first:

```
─ Squash merge:  M1   Add user/article models + controller (#42)   ← fixup invisible (everything collapsed)
─ Merge commit:  abc1234, def5678, 789abcd, xyz9999, M1            ← fixup VISIBLE forever on main
```

Merging *after* `git rebase -i --autosquash origin/main`:

```
─ Squash merge:  M1   Add user/article models + controller (#42)   ← still 1 commit, no log-cleanliness win
─ Merge commit:  abc1234, def5678, 789abcd, M1                     ← 3 clean commits, fixup absorbed
```

So if your team squash-merges, the long-term `git log` payoff vanishes, but the **review experience** still wins. Reviewers read commit-by-commit on the PR's "Commits" tab and see a clean story: `Add User model` → `Add Article model` → `Add ArticleController`. It's better than the same three commits plus a `fixup! Add User model` floating at the end. Faster review, less mental load.

![Ok - gif](/assets/images/ok-computer-boy.gif){: .align-center}

## References
 - <https://git-scm.com/docs/git-commit>
 - <https://git-scm.com/docs/git-rebase>
 - <https://thoughtbot.com/blog/autosquashing-git-commits>
 - <https://github.com/jesseduffield/lazygit>
