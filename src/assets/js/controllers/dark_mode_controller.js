import { Controller } from "@hotwired/stimulus"

// Dark-mode toggle. Pre-paint FOUC guard lives in
// `_includes/head-darkmode-check.html` — it sets `<html class="dark">`
// before stylesheet parse based on `localStorage.theme` + system preference.
// This controller owns click-to-toggle and the desktop icon swap.
export default class extends Controller {
  static targets = ["darkIcon", "lightIcon"]

  connect() {
    if (this.hasLightIconTarget && this.hasDarkIconTarget) {
      if (this.isDark()) {
        this.lightIconTarget.classList.remove("hidden")
      } else {
        this.darkIconTarget.classList.remove("hidden")
      }
    }
  }

  toggle() {
    if (this.hasLightIconTarget && this.hasDarkIconTarget) {
      this.lightIconTarget.classList.toggle("hidden")
      this.darkIconTarget.classList.toggle("hidden")
    }
    document.documentElement.classList.toggle("dark")
    localStorage.theme = document.documentElement.classList.contains("dark") ? "dark" : "light"
  }

  isDark() {
    return localStorage.theme !== "light"
  }
}
