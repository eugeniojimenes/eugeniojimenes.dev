import { Controller } from "stimulus"

export default class extends Controller {
  static targets = [ "name" ]

  connect() {
    console.log(`Hello, I'm the Stimulus HelloController`)
    // if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    //   document.documentElement.classList.add('dark')
    // } else {
    //   document.documentElement.classList.remove('dark')
    // }
  }

  // change() {
  //   document.documentElement.classList.add('dark')
  // }

  greet() {
    const element = this.nameTarget
    const name = element.value
    console.log(`Hello, ${name}`)
  }
}
