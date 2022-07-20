import { Controller } from "stimulus"

export default class extends Controller {

  connect() {
    console.log(`Hello, I'm the Stimulus ThemeController`)
    this.checkTheme()
  }

  useDarkMode() {
    localStorage.theme = 'dark'
    this.checkTheme()
  }

  useLightMode() {
    localStorage.theme = 'light'
    this.checkTheme()
  }

  checkTheme() {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
}
