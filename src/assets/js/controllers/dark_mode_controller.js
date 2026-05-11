import { Controller } from "@hotwired/stimulus"

// Dark-mode toggle. Pre-paint FOUC guard lives in
// `_includes/head-darkmode-check.html` — it sets `<html class="dark">`
// before stylesheet parse based on `localStorage.theme` + system preference.
// This controller only owns the click-to-toggle behavior and the icon swap.
export default class extends Controller {
  static targets = ["darkIcon", "lightIcon"]

  connect() {
    // Sync icon to whatever state the FOUC guard already applied.
    // Show light-icon (i.e. "switch to light" affordance) when dark is active,
    // and vice versa.
    if (this.isDark()) {
      this.lightIconTarget.classList.remove("hidden")
    } else {
      this.darkIconTarget.classList.remove("hidden")
    }
  }

  toggle() {
    // Flip both icons. Whichever was hidden becomes visible.
    this.lightIconTarget.classList.toggle("hidden")
    this.darkIconTarget.classList.toggle("hidden")

    // Single source of truth: the DOM class on <html>. Flip it, persist the
    // new state to localStorage so the FOUC guard restores it on next load.
    document.documentElement.classList.toggle("dark")
    localStorage.theme = document.documentElement.classList.contains("dark") ? "dark" : "light"
  }

  // Resolves the current effective theme. Default is dark — only an explicit
  // 'light' choice in localStorage opts out. Mirrors the FOUC guard logic so
  // icons render in sync on first paint.
  isDark() {
    return localStorage.theme !== "light"
  }
}
