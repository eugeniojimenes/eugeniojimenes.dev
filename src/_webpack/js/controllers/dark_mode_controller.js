import { Controller } from "@hotwired/stimulus"

export default class extends Controller {

  connect() {
    console.log(`Hello, I'm the Stimulus DarkModeController`)
  }

  useDarkMode() {
    if(localStorage.theme === 'light') {
      document.documentElement.classList.add('dark')
      // localStorage.setItem('color-theme', 'dark')
      localStorage.theme = 'dark'
    }
  }

  useLightMode() {
    if(localStorage.theme === 'dark') {
      document.documentElement.classList.remove('dark')
      // localStorage.setItem('color-theme', 'light')
      localStorage.theme = 'light'
    }
  }

  // checkTheme() {
  //   if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
  //     document.documentElement.classList.add('dark')
  //   } else {
  //     document.documentElement.classList.remove('dark')
  //   }
  // }
}
