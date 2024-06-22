---
layout: post
title:  "Tutorial: Rails7, Tailwind, and Hotwire - Part 3"
date:   2022-06-29 21:34:03 -0300
locale: pt_BR
lang-ref: rails7-tailwind-hotwire-3
tags: Tutorial Rails Ruby Tailwind Hotwire
main_image: /assets/svg/stimulus.svg
image: /assets/images/stimulus.webp
image_alt: "Hotwire Stimulus Logo"
description: >-
  Part 3: Modal for insertion and editing with Stimulus. Rails 7 with esbuild, Tailwind, and Hotwire
  (Turbo and Stimulus) - How to develop a Kanban-style application with cards/tasks and simultaneous
  persistence via websockets.

---

In the [previous part]({% post_url en/2021-12-19-tutorial-rails7-hotwire-part-2 %}){:target="_blank"} of this tutorial,
I explained how to use partial HTML rendering with `turbo_stream` from
[Hotwire Turbo](https://turbo.hotwired.dev){:target="_blank"}, allowing us to display newly inserted or deleted cards
in our humble Kanban prototype. Now, I'll delve into the
[Hotwire Stimulus](https://stimulus.hotwired.dev/){:target="_blank"} package.
<!-- excerpt-end -->

## Overall Objective
The goal is to develop (and learn) using Rails 7, esbuild, Tailwind, and Hotwire (Turbo and
Stimulus), but my focus will mainly be on the Hotwire package and how it can help us. As I
progress through the studies and implementation, I'll continue to add to this tutorial. For now,
we have:
* [Part 0: Rails 7]({% post_url en/2021-12-07-tutorial-rails7-hotwire %}){:target="_blank"}
* [Part 1: Tailwind]({% post_url en/2021-12-09-tutorial-rails7-hotwire-part-1 %}){:target="_blank"}
* [Part 2: Hotwire Turbo]({% post_url en/2021-12-19-tutorial-rails7-hotwire-part-2 %}){:target="_blank"}
* [Part 3: Hotwire Stimulus](#step-3---hotwire-stimulus)  → current page

The backdrop is a Kanban-style application, featuring a board where we can include, view, edit,
and delete cards/tasks, with simultaneous persistence via *websockets* for all open sessions
of the application. All code is available in this
[repository](https://github.com/callmarx/LearningHotwire){:target="_blank"}. Note that it includes
some [*branches*](https://github.com/callmarx/LearningHotwire/branches/all){:target="_blank"} that
represent the parts covered here.

## Step 3 - Hotwire Stimulus
In this final stage, I implemented a modal (the famous pop-up that's not exactly a pop-up) controlled via JS through
Hotwire Stimulus. I divided this stage into 3 branches:
* [blog-part-3.1](https://github.com/callmarx/LearningHotwire/blob/blog-part-3.1){:target="_blank"} -
  Where I use Turbo Frame and Stimulus to dynamically render and remove HTML.
* [blog-part-3.2](https://github.com/callmarx/LearningHotwire/blob/blog-part-3.2){:target="_blank"} -
  Where I use more Tailwind to create the modal and Stimulus to handle other necessary actions.
* [blog-part-3.4](https://github.com/callmarx/LearningHotwire/blob/blog-part-3.3){:target="_blank"} -
  Bonus subpart where I use the gem [ViewComponent](https://viewcomponent.org/){:target="_blank"} to better organize
  the modal's code.

### Just when I said I wouldn't use Turbo Frame...
In the previous stage, while briefly explaining the difference between
[turbo-frame and turbo-stream]({% post_url en/2021-12-19-tutorial-rails7-hotwire-part-2 %}#turbo-frame-vs-turbo-stream){:target="_blank"},
I mentioned that I didn't intend to use Turbo Frame. However, an opportunity arose: with Turbo Frame, we can
dynamically render the chore form for the user when they need to insert or edit.

First, I added the line `<%= turbo_frame_tag "modal" %>` to the file
[app/views/layouts/application.html.erb](https://github.com/callmarx/LearningHotwire/blob/blog-part-3.1/app/views/layouts/application.html.erb){:target="_blank"},
resulting in the following:
```erb
<!-- file app/views/layouts/application.html.erb of blog-part-3.1 branch -->
<!DOCTYPE html>
<html>
  <head>
    <title>LearningHotwire</title>
    <%= csrf_meta_tags %>
    <%= csp_meta_tag %>

    <%= stylesheet_link_tag "application", "data-turbo-track": "reload" %>
    <%= javascript_include_tag "application", "data-turbo-track": "reload", defer: true %>
  </head>

  <body>
    <%= turbo_frame_tag "modal" %> <!-- add this -->
    <%= yield %>
  </body>
</html>
```

Then I wrapped the content of
[app/views/chores/new.html.erb](https://github.com/callmarx/LearningHotwire/blob/46e4871993ac592a990d7d0e3a4e7c29d0e69626/app/views/chores/new.html.erb){:target="_blank"}
inside a `<%= turbo_frame_tag "modal" do %>...</% end %>` block, which in this case was used solely to render the
partial form:
```erb
<!-- file app/views/chores/new.html.erb of blog-part-3.1 branch -->
<%= turbo_frame_tag "modal" do %>
  <%= render "form", chore: @chore %>
<% end %>
```

And then I modified the link to add a new *chore*, adding the option `data: { turbo_frame: 'modal' }` in
[app/views/chores/index.html.erb](https://github.com/callmarx/LearningHotwire/blob/blog-part-3.1/app/views/chores/index.html.erb){:target="_blank"},
also including an icon for the button and removing the `render` for the `form` that was at the end:
```erb
<!-- file app/views/chores/index.html.erb of blog-part-3.1 branch -->
<%= turbo_stream_from "chores" %>
<div class="z-0 flex flex-col h-screen bg-slate-300">
  <div class="flex justify-end py-2">
    <%= link_to new_chore_path,
      data: { turbo_frame: 'modal' }, # required for turbo frame
      class:"flex m-1 mr-12 p-2 w-fit h-fit text-white bg-slate-600 hover:bg-slate-900 rounded-md" do %>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8 0c-.176 0-.35.006-.523.017l.064.998a7.117 7.117 0 0 1 .918 0l.064-.998A8.113 8.113 0 0 0 8 0zM6.44.152c-.346.069-.684.16-1.012.27l.321.948c.287-.098.582-.177.884-.237L6.44.153zm4.132.271a7.946 7.946 0 0 0-1.011-.27l-.194.98c.302.06.597.14.884.237l.321-.947zm1.873.925a8 8 0 0 0-.906-.524l-.443.896c.275.136.54.29.793.459l.556-.831zM4.46.824c-.314.155-.616.33-.905.524l.556.83a7.07 7.07 0 0 1 .793-.458L4.46.824zM2.725 1.985c-.262.23-.51.478-.74.74l.752.66c.202-.23.418-.446.648-.648l-.66-.752zm11.29.74a8.058 8.058 0 0 0-.74-.74l-.66.752c.23.202.447.418.648.648l.752-.66zm1.161 1.735a7.98 7.98 0 0 0-.524-.905l-.83.556c.169.253.322.518.458.793l.896-.443zM1.348 3.555c-.194.289-.37.591-.524.906l.896.443c.136-.275.29-.54.459-.793l-.831-.556zM.423 5.428a7.945 7.945 0 0 0-.27 1.011l.98.194c.06-.302.14-.597.237-.884l-.947-.321zM15.848 6.44a7.943 7.943 0 0 0-.27-1.012l-.948.321c.098.287.177.582.237.884l.98-.194zM.017 7.477a8.113 8.113 0 0 0 0 1.046l.998-.064a7.117 7.117 0 0 1 0-.918l-.998-.064zM16 8a8.1 8.1 0 0 0-.017-.523l-.998.064a7.11 7.11 0 0 1 0 .918l.998.064A8.1 8.1 0 0 0 16 8zM.152 9.56c.069.346.16.684.27 1.012l.948-.321a6.944 6.944 0 0 1-.237-.884l-.98.194zm15.425 1.012c.112-.328.202-.666.27-1.011l-.98-.194c-.06.302-.14.597-.237.884l.947.321zM.824 11.54a8 8 0 0 0 .524.905l.83-.556a6.999 6.999 0 0 1-.458-.793l-.896.443zm13.828.905c.194-.289.37-.591.524-.906l-.896-.443c-.136.275-.29.54-.459.793l.831.556zm-12.667.83c.23.262.478.51.74.74l.66-.752a7.047 7.047 0 0 1-.648-.648l-.752.66zm11.29.74c.262-.23.51-.478.74-.74l-.752-.66c-.201.23-.418.447-.648.648l.66.752zm-1.735 1.161c.314-.155.616-.33.905-.524l-.556-.83a7.07 7.07 0 0 1-.793.458l.443.896zm-7.985-.524c.289.194.591.37.906.524l.443-.896a6.998 6.998 0 0 1-.793-.459l-.556.831zm1.873.925c.328.112.666.202 1.011.27l.194-.98a6.953 6.953 0 0 1-.884-.237l-.321.947zm4.132.271a7.944 7.944 0 0 0 1.012-.27l-.321-.948a6.954 6.954 0 0 1-.884.237l.194.98zm-2.083.135a8.1 8.1 0 0 0 1.046 0l-.064-.998a7.11 7.11 0 0 1-.918 0l-.064.998zM8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3v-3z"/>
      </svg>
      <span class="ml-2 font-semibold">New Chore</span>
    <% end %>
  </div>
  <div class="z-0 w-4/5 mx-auto overflow-hidden h-4/5 bg-slate-200 rounded-md transition transform duration-600 ease-in-out hover:bg-slate-400 hover:overflow-visible">
    <div id="chores" class="z-0 px-5 pt-1 pb-3 grid grid-cols-3 gap-2">
      <% @chores.each do |chore| %>
        <%= render "chore", chore:chore %>
      <% end %>
    </div>
  </div>
</div> <!-- remove 'render "form"' -->
```
With this change, when you click on the *New Chore* button, `src="http://localhost:3000/chores/new"` will be included
in the area reserved with `<%= turbo_frame_tag "modal" %>` which is now in the file
[app/views/layouts/application.html.erb](https://github.com/callmarx/LearningHotwire/blob/blog-part-3.1/app/views/layouts/application.html.erb){:target="_blank"}.
As a result, [app/views/chores/new.html.erb](https://github.com/callmarx/LearningHotwire/blob/blog-part-3.1/app/views/chores/new.html.erb){:target="_blank"}
will be dynamically rendered within this tag.
![Triggering Turbo Frame](/assets/gifs/triggering-turbo-frame.gif){: .align-center}

Note that once you click on "New Chore", it's not possible to remove the form, either with a close button or even after
inserting a new card. For that, we'll use Stimulus, as I'll show in the next steps.

**Note**: I placed `<%= turbo_frame_tag "modal" %>` in "app/views/layouts/application.html.erb" because I expect to
render the insertion modal on any page of my application. Since it's a Kanban board, users would likely want to add a
new card from any page, but this could be restricted to, for example, only when viewing all cards, i.e., in
"app/views/chores/index.html.erb".
{: .note-info }

### Getting Started with Stimulus
First, I generated a new Stimulus controller in the project using the following command and output:
```bash
$ rails generate stimulus chore-modal
       create  app/javascript/controllers/chore_modal_controller.js
       rails  stimulus:manifest:update
```

As noted earlier, we are not "removing" the dynamically inserted HTML by Turbo Frame, so let's implement this as our
first method in `ChoreModalController`, located in
[app/javascript/controllers/chore_modal_controller.js](https://github.com/callmarx/LearningHotwire/blob/blog-part-3.1/app/javascript/controllers/chore_modal_controller.js){:target="_blank"}:
```js
// file app/javascript/controllers/chore_modal_controller.js of blog-part-3.1 branch
import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="chore-modal"
export default class extends Controller {
  connect() {
    console.log("Hi! we are in ChoreModalController from Stimulus")
  }

  // action: "chore-modal#hideModal"
  hideModal() {
    this.element.parentElement.removeAttribute("src")
    this.element.remove()
    console.log("You've just called ChoreModalController#hideModal")
  }
}
```
To close the insertion form, I simply remove the `src` attribute from the parent element, which in this case needs to
be the `<turbo-frame ...></turbo-frame>` tag, and then the element itself where `ChoreModalController` is called, which
in this case is in the insertion view. Also note that I include some `console.log()` statements to show when we are
passing through each part of `ChoreModalController`.

Now we need to specify where in our HTML we will call it, for that we just need to wrap it under a `div` with
`data-controller="chore-modal"`. It is also necessary to indicate where the action that will invoke
`ChoreModalController#hideModal` will be, and this is done with `data-action="chore-modal#hideModal"`. Therefore,
[app/views/chores/new.html.erb](https://github.com/callmarx/LearningHotwire/blob/blog-part-3.1/app/views/chores/new.html.erb){:target="_blank"}
looks like this:
```erb
<!-- file app/views/chores/new.html.erb of blog-part-3.1 branch -->
<%= turbo_frame_tag "modal" do %>
  <%= tag.div data: { controller: "chore-modal" } do %>
    <%= render "form", chore: @chore %>
    <%= button_tag "Close", data: { action: "chore-modal#hideModal" }, type: "button", class: "fixed top-0 right-0 rounded-lg p-3 m-2 bg-red-700 text-white" %>
  <% end %>
<% end %>
```
The action where I applied `data-action="chore-modal#hideModal"` was on a red button labeled "Close". In this case, the
erb `<%= button_tag ... %>` will result in the following HTML:
```html
<button
  name="button"
  type="button"
  data-action="chore-modal#hideModal"
  class="fixed right-0 rounded-lg p-3 m-2 bg-red-700 text-white">Close</button>
```
and since `<%= tag.div data: { controller: "chore-modal" } do %>` is inside `<%= turbo_frame_tag "modal" do %>`,
`ChoreModalController#hideModal` will remove the `src` attribute from the `<turbo-frame id="modal" ...></turbo-frame>`
tag and its content.

The expected result is as follows:
![Removing rendered Turbo Frame with Stimulus](/assets/gifs/removing-turbo-frame.gif){: .align-center}

In the "Console" tab, we can see the `console.log()` messages that I added:
![Removing rendered Turbo Frame with Stimulus - Console](/assets/gifs/removing-turbo-frame-console.gif){: .align-center}

All the work done up to this point corresponds to the *branch*
[blog-part-3.1](https://github.com/callmarx/LearningHotwire/blob/blog-part-3.1).

### But where is the modal?
Well, currently the insertion form is included at the top of the page, pushing everything else down. It's definitely
not a modal ~~and not at all pretty or pleasant~~. To fix this, we just need to use Tailwind.

In [app/views/chores/new.html.erb](https://github.com/callmarx/LearningHotwire/blob/blog-part-3.2/app/views/chores/new.html.erb){:target="_blank"},
we have:
```erb
<!-- file app/views/chores/new.html.erb of blog-part-3.2 branch -->
<%= turbo_frame_tag "modal" do %>
  <%= tag.div data: {
      controller: "chore-modal",
    },
    # add the following classes
    class: "z-40 fixed flex justify-center inset-0 bg-gray-600 bg-opacity-50 h-screen w-screen" do %>
    <div class="flex flex-col p-4 m-12 rounded-md w-2/3 h-2/3 bg-slate-200 rounded-md hover:bg-slate-400 transition duration-600 ease-linear">
      <div class="flex justify-between">
        <div></div>
        <div></div>
        <!-- replace button to a better one -->
        <%= button_tag data: { action: "chore-modal#hideModal" }, type: "button", class: "flex-none w-8 h-8 text-slate-600 hover:text-black transition-all duration-600 ease-in-out" do %>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
          </svg>
        <% end %>
      </div>
      <%= render "form", chore: @chore %>
    </div>
  <% end %>
<% end %>
```

With the classes `fixed` and `z-40`, Tailwind will generate CSS that overlays the form on top of the rest of the page
content. Combined with `h-screen`, `w-screen`, `bg-gray-600`, and `bg-opacity-50`, this means that the modal will
occupy the entire screen with a gray and transparent background. I also took the opportunity to replace the glaring red
"Close" button ~~which looked awful~~ with a more discreet dark gray "x" icon in the top right corner, resulting in:
![tailwind modal](/assets/images/tailwind-modal.webp){: .align-center}

### More Actions with Stimulus
For now, the modal closes only when clicking the "x" icon. Ideally, it should also close after a successful chore
insertion. Fortunately, the Hotwire Turbo package emits a series of events that allow tracking the navigation lifecycle.
The complete list of these events can be checked [here](https://turbo.hotwired.dev/reference/events){:target="_blank"}.

For our case, we have the `turbo:submit-end` event which is triggered immediately after a form submission, storing the
`FormSubmissionResult` properties in `event.detail`. Therefore, in
[app/javascript/controllers/chore_modal_controller.js](https://github.com/callmarx/LearningHotwire/blob/blog-part-3.2/app/javascript/controllers/chore_modal_controller.js){:target="_blank"},
we have:
```js
// file app/javascript/controllers/chore_modal_controller.js of blog-part-3.2 branch
import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="chore-modal"
export default class extends Controller {
  // action: "chore-modal#hideModal"
  hideModal() {
    this.element.parentElement.removeAttribute("src")
    this.element.remove()
  }

  // action: "turbo:submit-end->chore-modal#submitEnd"
  submitEnd(e) { // add this method
    if (e.detail.success) {
      this.hideModal()
    }
  }
}
```
Notice that we check if `event.detail` was successful before calling the `hideModal()` method. It's important to note
that the method named `submitEnd()` **is not yet associated** with the `turbo:submit-end` event. This association needs
to be made in the `data-action` attribute where `ChoreModalController` is called, specifically in
[app/views/chores/new.html.erb](https://github.com/callmarx/LearningHotwire/blob/blog-part-3.2/app/views/chores/new.html.erb){:target="_blank"}:
```erb
<!-- file app/views/chores/new.html.erb of blog-part-3.2 branch -->
<%= turbo_frame_tag "modal" do %>
  <%= tag.div data: {
      controller: "chore-modal",
      action: "turbo:submit-end->chore-modal#submitEnd" # add this
    },
    class: "z-40 fixed flex justify-center inset-0 bg-gray-600 bg-opacity-50 h-screen w-screen" do %>
    <div class="flex flex-col p-4 m-12 rounded-md w-2/3 h-2/3 bg-slate-200 rounded-md hover:bg-slate-400 transition duration-600 ease-linear">
      <div class="flex justify-between">
        <div></div>
        <div></div>
        <%= button_tag data: { action: "chore-modal#hideModal" }, type: "button", class: "flex-none w-8 h-8 text-slate-600 hover:text-black transition-all duration-600 ease-in-out" do %>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
          </svg>
        <% end %>
      </div>
      <%= render "form", chore: @chore %>
    </div>
  <% end %>
<% end %>
```

Quando incluo `<div ... data-action="turbo:submit-end->chore-modal#submitEnd" ...>`, agora sim,
estou dizendo para chamar `ChoreModalController#submitEnd()` quando o evento `turbo:submit-end` for
disparado. Para testar que inserção mal sucedida de um *chore* não feche o *modal*, inclui o seguinte
validador em
[app/models/chore.rb](https://github.com/callmarx/LearningHotwire/blob/blog-part-3.2/app/models/chore.rb){:target="_blank"}:

When I include `<div ... data-action="turbo:submit-end->chore-modal#submitEnd" ...>`, I'm now instructing it to call
`ChoreModalController#submitEnd()` when the `turbo:submit-end` event is triggered. To test that an unsuccessful chore
insertion doesn't close the modal, I added the following validator in
[app/models/chore.rb](https://github.com/callmarx/LearningHotwire/blob/blog-part-3.2/app/models/chore.rb){:target="_blank"}:
```ruby
# file app/models/chore.rb of blog-part-3.2 branch

class Chore < ApplicationRecord
  validates :title, presence: true # add this
end
```

The result was as follows:
![Turbo submit-end event](/assets/gifs/turbo--submit-end--event.gif){: .align-center}

I utilized other events to implement more scenarios where the user would want the modal to close, specifically when
pressing the ESC key and clicking "outside" the modal, meaning on the transparent gray background. In
[app/javascript/controllers/chore_modal_controller.js](https://github.com/callmarx/LearningHotwire/blob/blog-part-3.2/app/javascript/controllers/chore_modal_controller.js){:target="_blank"}:
```js
// file app/javascript/controllers/chore_modal_controller.js of blog-part-3.2 branch
import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="chore-modal"
export default class extends Controller {
  static targets = ["form"] // required to track when user are clicling outside the form

  // hide modal
  // action: "chore-modal#hideModal"
  hideModal() {
    this.element.parentElement.removeAttribute("src")
    this.element.remove()
  }

  // hide modal on successful form submission
  // action: "turbo:submit-end->chore-modal#submitEnd"
  submitEnd(e) {
    if (e.detail.success) {
      this.hideModal()
    }
  }

  // hide modal when clicking ESC
  // action: "keyup@window->chore-modal#closeWithKeyboard"
  closeWithKeyboard(e) {
    if (e.code == "Escape") {
      this.hideModal()
    }
  }

  // hide modal when clicking outside of modal
  // action: "click@window->chore-modal#closeBackground"
  closeBackground(e) {
    if (e && this.formTarget.contains(e.target)) { // check with user are clicking inside the form
      return
    }
    this.hideModal()
  }
}
```
Again, it's worth noting that events are defined within the HTML using the `data-action="..."` attribute. In this case,
I used the `keyup@window` and `click@window` events, attached to the
[Document Object Model](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model){:target="_blank"}. You
can read more about these events [here](https://www.w3.org/TR/DOM-Level-3-Events/#dom-event-architecture){:target="_blank"}.

For these new methods, in
[app/views/chores/new.html.erb](https://github.com/callmarx/LearningHotwire/blob/blog-part-3.2/app/views/chores/new.html.erb){:target="_blank"},
I included:
```erb
<!-- file app/views/chores/new.html.erb of blog-part-3.2 branch -->
<%= turbo_frame_tag "modal" do %>
  <%= tag.div data: {
      controller: "chore-modal",
      # add all other actions, separated with space, as the following
      action: "turbo:submit-end->chore-modal#submitEnd keyup@window->chore-modal#closeWithKeyboard click@window->chore-modal#closeBackground"
    },
    class: "z-40 fixed flex justify-center inset-0 bg-gray-600 bg-opacity-50 h-screen w-screen" do %>
    <%= tag.div data: { chore_modal_target: "form" }, # add this data target
      class: "flex flex-col p-4 m-12 rounded-md w-2/3 h-2/3 bg-slate-200 rounded-md hover:bg-slate-400 transition duration-600 ease-linear" do %>
      <div class="flex justify-between">
        <div></div>
        <div></div>
        <%= button_tag data: { action: "chore-modal#hideModal" }, type: "button", class: "flex-none w-8 h-8 text-slate-600 hover:text-black transition-all duration-600 ease-in-out" do %>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
          </svg>
        <% end %>
      </div>
      <%= render "form", chore: @chore %>
    <% end %>
  <% end %>
<% end %>
```
Note that I also use the `<div data-chore-modal-target="form" ...>` attribute in
[app/views/chores/new.html.erb](https://github.com/callmarx/LearningHotwire/blob/blog-part-3.2/app/views/chores/new.html.erb){:target="_blank"}.
This corresponds to a functionality of the Hotwire Stimulus package that allows us to reference an element. In this
case, it enables the `ChoreModalController#closeBackground()` method to detect when the user clicks outside the form in
the modal. This is why I define the target, as you can see in the line `static targets = ["form"]` in
[app/javascript/controllers/chore_modal_controller.js](https://github.com/callmarx/LearningHotwire/blob/blog-part-3.2/app/javascript/controllers/chore_modal_controller.js){:target="_blank"},
accessible within `ChoreModalController` as `this.formTarget`, where `<target name>` is replaced with the actual target
name.

All that has been done up to this point corresponds to the `blog-part-3.2` branch.

### Bonus: Applying the Modal with ViewComponent
So far, the modal is only available in the
[app/views/chores/new.html.erb](https://github.com/callmarx/LearningHotwire/blob/blog-part-3.2/app/views/chores/new.html.erb){:target="_blank"}
view, which means I would have to replicate the code for the edit view, which is not organizationally correct. To
address this, instead of creating a traditional
[Rails partial](https://guides.rubyonrails.org/layouts_and_rendering.html#using-partials){:target="_blank"}, I decided
to test the [ViewComponent](https://viewcomponent.org/){:target="_blank"} gem, which, crudely summarizing, allows for
dynamic "componentization" of HTML pieces, a concept introduced by the [React](https://reactjs.org/){:target="_blank"}
framework.

In the [Gemfile](https://github.com/callmarx/LearningHotwire/blob/blog-part-3.3/Gemfile){:target="_blank"}, I included:
```ruby
gem "view_component"
```

And installed it with:
```bash
$ bundle install
```

Then I generated a new component with the command:
```bash
$ rails generate component ChoreModal title
      create  app/components/chore_modal_component.rb
      invoke  rspec
      create    spec/components/chore_modal_component_spec.rb
      invoke  erb
      create    app/components/chore_modal_component.html.erb
```

With the command above, ViewComponent will already create an `initialize()` method for the `title` variable, which I'll
use to name the modal whether it's for insertion or editing. Additionally, because I use Turbo Frame, I need to include
`include Turbo::FramesHelper` in
[app/components/chore_modal_component.rb](https://github.com/callmarx/LearningHotwire/blob/blog-part-3.3/app/components/chore_modal_component.rb){:target="_blank"}:
```ruby
class ChoreModalComponent < ViewComponent::Base
  include Turbo::FramesHelper # add this

  def initialize(title:)
    @title = title
  end

end
```

So, I basically moved all the modal code to
[app/components/chore_modal_component.html.erb](https://github.com/callmarx/LearningHotwire/blob/blog-part-3.3/app/components/chore_modal_component.html.erb){:target="_blank"}:
```erb
<!-- file app/components/chore_modal_component.html.erb of blog-part-3.3 branch -->
<%= turbo_frame_tag "modal" do %>
  <%= tag.div data: {
      controller: "chore-modal",
      action: "turbo:submit-end->chore-modal#submitEnd keyup@window->chore-modal#closeWithKeyboard click@window->chore-modal#closeBackground"
    },
    class: "z-40 fixed flex justify-center inset-0 bg-gray-600 bg-opacity-50 h-screen w-screen" do %>
    <%= tag.div data: { chore_modal_target: "form" },
      class: "flex flex-col p-4 m-12 rounded-md w-2/3 h-2/3 bg-slate-200 rounded-md hover:bg-slate-400 transition duration-600 ease-linear" do %>
      <div class="flex justify-between">
        <div></div>
        <h1 class="text-2xl font-semibold"><%= @title %></h1>
        <%= button_tag data: { action: "chore-modal#hideModal" }, type: "button", class: "flex-none w-8 h-8 text-slate-600 hover:text-black transition-all duration-600 ease-in-out" do %>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
          </svg>
        <% end %>
      </div>
      <%= content %>
    <% end %>
  <% end %>
<% end %>
```

The line with `<%= content %>` will render the content of the block where `ChoreModalComponent.new` is called,
specifically for
[app/views/chores/new.html.erb](https://github.com/callmarx/LearningHotwire/blob/blog-part-3.3/app/views/chores/new.html.erb){:target="_blank"}
and [app/views/chores/edit.html.erb](https://github.com/callmarx/LearningHotwire/blob/blog-part-3.3/app/views/chores/edit.html.erb){:target="_blank"}
as follows:
```erb
<!-- file app/views/chores/new.html.erb of blog-part-3.3 branch -->
<%= render ChoreModalComponent.new(title: "New Chore") do %>
  <%= render "form", chore: @chore %>
<% end %>

<!-- file app/views/chores/edit.html.erb of blog-part-3.3 branch -->
<%= render ChoreModalComponent.new(title: "Editing Chore") do %>
  <%= render "form", chore: @chore %>
<% end %>
```

After making these additions, if you start the Rails server with `bin/dev`, you'll notice that the appearance is not as
expected, something like:
![Bug Tailwind + ViewComponent](/assets/images/bug-tailwind-viewcomponent.webp){: .align-center}

**Why?** This happens because I need to instruct Tailwind to also "look" at the files present in the `app/components/`
folder. Therefore, in
[tailwind.config.js](https://github.com/callmarx/LearningHotwire/blob/blog-part-3.3/tailwind.config.js){:target="_blank"}:
```js
// file tailwind.config.js of blog-part-3.3 branch
module.exports = {
  mode: 'jit',
  content: [
    './app/views/**/*.{erb,html}',
    './app/components/**/*.{erb,html}', // add this
    './app/helpers/**/*.rb',
    './app/javascript/**/*.js'
  ],
  ...
}
```
Additionally, we need to link the editing of a *chore*. For this, I utilized the edit icon that we had included but was
previously dummy. In
[app/views/chores/_chore.html.erb](https://github.com/callmarx/LearningHotwire/blob/blog-part-3.3/app/views/chores/_chore.html.erb){:target="_blank"},
we have:
```erb
<div
  id="<%= dom_id chore %>"
  class="p-3 my-3 bg-white shadow-lg group transition duration-700 ease-in-out transform hover:scale-125 hover:z-10 rounded-md"
>
  <div class="flex flex-col">
    <div class="flex justify-between">
      <p class="text-lg font-bold leading-snug text-gray-900 mr-0.5">
        <%= chore.title %>
      </p>
      <time
        datetime=<%= chore.created_at.strftime("%Y-%m-%d") %>
        class="invisible text-sm text-indigo-700 group-hover:visible"
      >
        <%= chore.created_at.strftime("%b %d") %>
      </time>
    </div>
    <a href="#">
      <p class="leading-snug text-gray-900">
        <%= chore.content %>
      </p>
    </a>
    <div class="flex justify-end space-x-2">
      <!-- replace the dummy button as following -->
      <%= button_to edit_chore_path(chore), method: :get, data: { turbo_frame: 'modal' }, class:"invisible w-5 h-5 text-indigo-500 cursor-pointer group-hover:visible hover:text-black transition-all duration-600 ease-in-out" do %>
        <svg stroke="currentColor" fill="none" stroke-width="1.7" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
        </svg>
      <% end %>
      <%= button_to chore_path(chore), method: :delete, class: "invisible w-5 h-5 text-indigo-500 cursor-pointer group-hover:visible hover:text-black transition-all duration-600 ease-in-out" do %>
        <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16">
          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"></path><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
        </svg>
      <% end %>
    </div>
  </div>
</div>
```

Done!

As I've been writing, my intention was to create a Kanban-style application. In the end, it turned out to be just a
board with tasks/notes arranged without any order. It would be nice to have columns representing states, something like
the classic *to do*, *doing*, *testing*, and *done*; users with authentication and some degree of hierarchy. Anyway,
I didn't implement any tests either, although I have installed and configured RSpec. Maybe I'll do that in the future,
I don't know yet.

For now, that's it.

![Baby Yoda - gif](https://c.tenor.com/JSyRTClMMQAAAAAd/baby-yoda.gif){: .align-center}
