import './main.css';

import { Application } from "@hotwired/stimulus"
import { definitionsFromContext } from "@hotwired/stimulus-webpack-helpers"
import "@hotwired/turbo"

const application = Application.start()
const context = require.context("./js/controllers", true, /\.js$/)
application.load(definitionsFromContext(context))

function decorateCodeBlocks() {
  document.querySelectorAll("div.highlight:not([data-controller])").forEach(el => {
    el.setAttribute("data-controller", "copy-code")
  })
}

document.addEventListener("turbo:load", decorateCodeBlocks)
document.addEventListener("turbo:render", decorateCodeBlocks)
