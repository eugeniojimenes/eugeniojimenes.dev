import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [ "darkIcon", "lightIcon" ]

  connect() {
    // console.log(`Hello, I'm the Stimulus DarkModeController`)

    // Change the icons inside the button based on previous settings
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.lightIconTarget.classList.remove('hidden');
    } else {
      this.darkIconTarget.classList.remove('hidden');
    }
  }

  toggle() {
    // toggle icons inside button
    this.lightIconTarget.classList.toggle('hidden');
    this.darkIconTarget.classList.toggle('hidden');
    // if set via local storage previously
    if (localStorage.theme) {
        if (localStorage.theme === 'light') {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark'
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light'
        }

    // if NOT set via local storage previously
    } else {
        if (document.documentElement.classList.contains('dark')) {
            document.documentElement.classList.remove('dark');
            localStorage.theme = 'light'
        } else {
            document.documentElement.classList.add('dark');
            localStorage.theme = 'dark'
        }
    }
  }
}
