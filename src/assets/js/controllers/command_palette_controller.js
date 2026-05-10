import { Controller } from "@hotwired/stimulus"

// Cmd+K / Ctrl+K command palette. Loads a flat index of posts + static pages
// from /search.json (emitted by a Jekyll template), filters by substring,
// navigates via Turbo on selection.
//
// Markup contract (set in default.html / layout include):
//   - data-controller="command-palette"
//   - data-command-palette-target="dialog"  → dialog wrapper (hidden by default)
//   - data-command-palette-target="input"   → search <input>
//   - data-command-palette-target="list"    → <ul> container for results
//   - data-action="input->command-palette#filter" on the input
//   - data-action="click->command-palette#backdropClick" on dialog wrapper
export default class extends Controller {
  static targets = ["dialog", "input", "list"]

  connect() {
    this.items = []
    this.activeIndex = 0
    // Bind once so disconnect() can remove the same fn reference. Arrow class
    // fields would also work; .bind() kept for symmetry with prior style.
    this.keydownHandler = this.handleGlobalKeydown.bind(this)
    document.addEventListener("keydown", this.keydownHandler)
    this.loadIndex()
  }

  disconnect() {
    // Prevent the global keydown listener from leaking across Turbo navigations.
    document.removeEventListener("keydown", this.keydownHandler)
  }

  // Fetches the post index once per controller lifecycle. On any error the
  // palette stays open but shows "no matches" — silent degradation is fine
  // for a non-critical search affordance.
  async loadIndex() {
    try {
      const res = await fetch("/search.json")
      const posts = await res.json()
      // Locale lives on <html lang>. paginate-v2 mangles `page.locale` on
      // tag pages, so the DOM attribute is the most reliable signal here.
      const locale = document.documentElement.lang.startsWith("pt") ? "pt_BR" : "en_US"
      const filtered = posts.filter(p => p.locale === locale)
      // Hardcoded static pages — not worth a second fetch.
      const staticPages = locale === "pt_BR"
        ? [
            { title: "Sobre mim", url: "/pt-br/about/", kind: "page" },
            { title: "Tags", url: "/pt-br/tags/", kind: "page" }
          ]
        : [
            { title: "About me", url: "/about/", kind: "page" },
            { title: "Tags", url: "/tags/", kind: "page" }
          ]
      this.items = [...staticPages, ...filtered.map(p => ({ ...p, kind: "post" }))]
    } catch (e) {
      this.items = []
    }
  }

  // Global Cmd/Ctrl+K opens the palette from anywhere. Other keys only act
  // when the palette is already open (gated by `this.isOpen`, which is
  // `undefined` initially → falsy → handlers skipped pre-open).
  handleGlobalKeydown(event) {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
      event.preventDefault() // suppress browser's default Cmd+K (search bar focus in some browsers)
      this.open()
      return
    }
    if (!this.isOpen) return
    if (event.key === "Escape") this.close()
    if (event.key === "ArrowDown") { event.preventDefault(); this.move(1) }
    if (event.key === "ArrowUp")   { event.preventDefault(); this.move(-1) }
    if (event.key === "Enter")     { event.preventDefault(); this.select() }
  }

  open() {
    // Dialog visibility uses a hidden/flex class pair instead of [hidden]
    // because Tailwind v4 utility ordering can let `flex` win over `hidden`
    // depending on declaration order — explicit toggles avoid that footgun.
    this.dialogTarget.classList.remove("hidden")
    this.dialogTarget.classList.add("flex")
    this.isOpen = true
    this.inputTarget.value = ""
    this.render(this.items)
    // setTimeout lets the browser paint the dialog before focusing the input,
    // otherwise focus can fail silently while the element is still display:none.
    setTimeout(() => this.inputTarget.focus(), 10)
  }

  close() {
    this.dialogTarget.classList.add("hidden")
    this.dialogTarget.classList.remove("flex")
    this.isOpen = false
  }

  // Close when the user clicks the dialog *backdrop* (the wrapper itself),
  // not when they click inside the panel.
  backdropClick(event) {
    if (event.target === this.dialogTarget) this.close()
  }

  // Triggered on input event. Empty query → show everything; otherwise
  // substring match on title + tags.
  filter() {
    const q = this.inputTarget.value.toLowerCase().trim()
    if (!q) return this.render(this.items)
    this.render(this.matchQuery(q))
  }

  // Substring match across title + flattened tags. Shared between filter()
  // and getFiltered() so the visible list and the keyboard selection always
  // agree on which items are in scope.
  matchQuery(q) {
    return this.items.filter(item => {
      const haystack = (item.title + " " + (item.tags || []).join(" ")).toLowerCase()
      return haystack.includes(q)
    })
  }

  render(items) {
    this.activeIndex = 0
    this.listTarget.innerHTML = items.length === 0
      ? `<li class="px-4 py-3 text-sm text-stone-500 dark:text-tokyo-fg-dim">no matches</li>`
      : items.map((item, i) => this.itemHtml(item, i)).join("")
  }

  // First item is pre-highlighted via the `active` class so Enter works
  // before the user touches the arrow keys.
  itemHtml(item, i) {
    const active = i === 0 ? "bg-stone-100 dark:bg-tokyo-bg" : ""
    const prefix = item.kind === "post" ? "$ open" : "$ cd"
    return `
      <li data-index="${i}" class="px-4 py-2 cursor-pointer hover:bg-stone-100 dark:hover:bg-tokyo-bg ${active}" data-action="click->command-palette#clickItem">
        <span class="text-tokyo-green text-xs">${prefix}</span>
        <span class="ml-2 text-stone-800 dark:text-tokyo-fg">${this.escape(item.title)}</span>
      </li>
    `
  }

  // Minimal HTML-entity escape — titles come from front-matter and shouldn't
  // contain markup, but a single hostile post would otherwise XSS the palette.
  escape(s) {
    return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]))
  }

  clickItem(event) {
    const idx = parseInt(event.currentTarget.dataset.index, 10)
    this.activeIndex = idx
    this.select()
  }

  // Move the active row by `delta`, wrapping around either end.
  // scrollIntoView keeps the row visible inside the scrollable list panel.
  move(delta) {
    const lis = this.listTarget.querySelectorAll("li[data-index]")
    if (!lis.length) return
    lis[this.activeIndex]?.classList.remove("bg-stone-100", "dark:bg-tokyo-bg")
    this.activeIndex = (this.activeIndex + delta + lis.length) % lis.length
    lis[this.activeIndex].classList.add("bg-stone-100", "dark:bg-tokyo-bg")
    lis[this.activeIndex].scrollIntoView({ block: "nearest" })
  }

  select() {
    const lis = this.listTarget.querySelectorAll("li[data-index]")
    if (!lis.length) return
    // Resolve the item from the *currently filtered* list, not the full index —
    // activeIndex is positional within whatever the user is seeing.
    const item = this.getFiltered()[this.activeIndex]
    if (!item) return
    this.close()
    // Prefer Turbo.visit for the SPA-like nav experience; fall back to a
    // hard navigation if Turbo somehow isn't on `window`.
    window.Turbo ? window.Turbo.visit(item.url) : (window.location.href = item.url)
  }

  getFiltered() {
    const q = this.inputTarget.value.toLowerCase().trim()
    return q ? this.matchQuery(q) : this.items
  }
}
