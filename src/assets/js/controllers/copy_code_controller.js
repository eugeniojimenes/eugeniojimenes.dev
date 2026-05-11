import { Controller } from "@hotwired/stimulus"

// Copy-to-clipboard button injected on every Rouge-highlighted code block.
// Attached by main.js — it sets data-controller="copy-code" on each
// `div.highlight` after `turbo:load` / `turbo:render`.
export default class extends Controller {
  connect() {
    // Clipboard API needs HTTPS or localhost. Bail silently on HTTP / old browsers
    // so we don't render a button that can't work.
    if (!navigator.clipboard) return

    // Guard against double-injection — Turbo morph may re-run `connect()` on the
    // same node. Use `:scope >` so a copy-button further down the tree (nested
    // code block) doesn't fool the check.
    if (this.element.querySelector(":scope > .copy-code-btn")) return

    // `relative` = positioning context for the absolute-positioned button.
    // `group`    = Tailwind hover-group parent so `group-hover:` on the button works.
    this.element.classList.add("relative", "group")

    this.button = document.createElement("button")
    this.button.type = "button" // prevent form-submit default if ever placed inside a <form>
    this.button.setAttribute("aria-label", "Copy code to clipboard")
    this.button.className = [
      "copy-code-btn absolute top-2 right-2 px-2 py-1 text-xs font-mono",
      "border border-stone-500 dark:border-tokyo-border rounded-sm",
      "text-stone-200 dark:text-tokyo-fg bg-stone-800/60 dark:bg-tokyo-bg-alt/60",
      "hover:border-tokyo-blue hover:text-tokyo-blue",
      // Hidden by default; revealed on hover (mouse) or focus (keyboard).
      "opacity-0 group-hover:opacity-100 focus:opacity-100",
      "transition duration-150"
    ].join(" ")

    // Visible label — kept in its own span so future icon swaps don't fight
    // with the screen-reader status node below.
    this.label = document.createElement("span")
    this.label.textContent = "copy"
    this.button.appendChild(this.label)

    // Screen-reader-only live region. Announces "copied!" / "error" without
    // duplicating the visible label, since aria-live re-reads on text change.
    this.status = document.createElement("span")
    this.status.className = "sr-only"
    this.status.setAttribute("role", "status")
    this.status.setAttribute("aria-live", "polite")
    this.button.appendChild(this.status)

    this.button.addEventListener("click", this.copy)
    this.element.appendChild(this.button)
  }

  // Clean up when Stimulus disconnects the controller (element removed,
  // controller swapped, Turbo navigation). Detach listener + cancel pending
  // flash timer so we don't leak handlers or write to a removed DOM node.
  disconnect() {
    clearTimeout(this.resetTimer)
    if (this.button) {
      this.button.removeEventListener("click", this.copy)
      this.button.remove()
    }
  }

  // Class-field arrow → `this` is auto-bound. Lets us pass the same function
  // reference to both `addEventListener` and `removeEventListener` (symmetric
  // cleanup wouldn't work with `.bind(this)` — each call returns a new fn).
  copy = async () => {
    // Prefer `<pre><code>` (kramdown fenced blocks) → fall back to `<pre>` alone
    // (`{% highlight %}` Liquid tag). Both forms exist in Jekyll output.
    const code = this.element.querySelector("pre code, pre")
    if (!code) return

    try {
      // `innerText` (not `textContent`) preserves visible newlines across block
      // elements — `textContent` would join lines without breaks.
      await navigator.clipboard.writeText(code.innerText)
      this.flash("copied!")
    } catch {
      // Permission denied, document not focused, etc. Show a generic error
      // rather than swallowing silently — user sees the click did *something*.
      this.flash("error")
    }
  }

  // Swap label + status for 1.5s, then restore. clearTimeout prevents flicker
  // on rapid clicks (each click resets the countdown).
  flash(text) {
    this.label.textContent = text
    this.status.textContent = text
    clearTimeout(this.resetTimer)
    this.resetTimer = setTimeout(() => {
      this.label.textContent = "copy"
      this.status.textContent = ""
    }, 1500)
  }
}
