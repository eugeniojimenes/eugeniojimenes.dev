import './main.css';

import { Application } from "@hotwired/stimulus"
import { definitionsFromContext } from "@hotwired/stimulus-webpack-helpers"
import * as Turbo from "@hotwired/turbo"

const application = Application.start()
const context = require.context("./js/controllers", true, /\.js$/)
application.load(definitionsFromContext(context))
