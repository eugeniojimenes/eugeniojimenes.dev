---
layout: post
title:  "Tutorial: Rails7, Tailwind, and Hotwire - Part 2"
date:   2021-12-19 14:42:03 -0300
locale: en_US
lang-ref: rails7-tailwind-hotwire-2
tags: Tutorial Rails Ruby Tailwind Hotwire
main_image: /assets/svg/hotwire-turbo.svg
image: /assets/images/hotwire-turbo.webp
image_alt: "Hotwire Turbo Logo"
description: >-
  Part 2: Partial rendering with Hotwire Turbo - Tutorial on Rails 7 with esbuild, tailwind, and
  Hotwire (Turbo and Stimulus). How to develop a Kanban-style application with cards/tasks and
  simultaneous persistence via websockets.

---

In the [previous part]({% post_url en/2021-12-09-tutorial-rails7-hotwire-part-1 %}){:target="_blank"} of this tutorial,
I explained how to customize and use Tailwind without a single line of CSS and JavaScript. Now, I'll discuss a bit
about the [Hotwire Turbo](https://turbo.hotwired.dev){:target="_blank"} package.
<!-- excerpt-end -->

## Overall Objective
The goal is to develop (and learn) using Rails 7, esbuild, Tailwind, and Hotwire (Turbo and
Stimulus), but my focus will mainly be on the Hotwire package and how it can help us. As I
progress through the studies and implementation, I'll continue to add to this tutorial. For now,
we have:
* [Part 0: Rails 7]({% post_url en/2021-12-07-tutorial-rails7-hotwire %}){:target="_blank"}
* [Part 1: Tailwind]({% post_url en/2021-12-09-tutorial-rails7-hotwire-part-1 %}){:target="_blank"}
* [Part 2: Hotwire Turbo](#step-2---hotwire-turbo) → current page
* [Part 3: Hotwire Stimulus]({% post_url en/2022-06-29-tutorial-rails7-hotwire-part-3 %}){:target="_blank"}

The backdrop is a Kanban-style application, featuring a board where we can include, view, edit,
and delete cards/tasks, with simultaneous persistence via *websockets* for all open sessions
of the application. All code is available in this
[repository](https://github.com/eugeniojimenes/LearningHotwire){:target="_blank"}. Note that it includes
some [*branches*](https://github.com/eugeniojimenes/LearningHotwire/branches/all){:target="_blank"} that
represent the parts covered here.

## Step 2 - Hotwire Turbo
In this step, I explain the purpose of this tool and implement the *render* mode `turbo_stream` along with `broadcast`
via *ActionCable*. The result of this step is divided into two parts: the *branch*
[blog-part-2.1](https://github.com/eugeniojimenes/LearningHotwire/tree/blog-part-2.1){:target="_blank"}, where I use only
`turbo_stream` without `broadcast`, and the final one with `broadcast` in the *branch*
[blog-part-2.2](https://github.com/eugeniojimenes/LearningHotwire/tree/blog-part-2.2){:target="_blank"}.

### Conceptually: Turbo what?
Consulting the introduction of the [Handbook](https://turbo.hotwired.dev/handbook/introduction){:target="_blank"},we
have:
> Bundles a set of tools for creating fast, modern, progressively enhanced web applications with minimal JavaScript.

Perhaps the concept of
[*Progressive Enhancement*](https://www.freecodecamp.org/news/what-is-progressive-enhancement-and-why-it-matters-e80c7aaf834a/){:target="_blank"}
does not sound very clear. Created in 2003, it is basically a design strategy, a web architecture that emphasizes the
progressive loading of the page, prioritizing the main content (HTML) and distributing the others (CSS, JavaScript,
additional HTML, etc.) in other presentation/loading layers.

Continuing on the guidelines of *Hotwire Turbo*, we have:
> Offers a simpler alternative against the dominance of client-side frameworks, which put all the logic on the
> front-end, confining the server-side of the application to little more than a JSON API.

This is the **passage that caught my attention the most**, captivated me, and motivated me to study and want to use
this. The "*dominance of client-side frameworks*" is something that has been drawing my attention in recent years, it
seems that **suddenly the entire back-end area has been "*confined*" to the JSON API**. However, with all the dynamism
that a web page needs nowadays, like data processing according to user behavior and navigation, this ended up being
done on the client-side, front-end, via JavaScript with libraries like jQuery. Since certain logic of this processing
must be protected on the back-end, not being completely exposed on the front-end, meaning it cannot be entirely done on
the client-side of the application, **we eventually face "*mirroring the logic on both sides*"**. And the guidelines
continue exactly in this direction:
> With Turbo, you allow the server to deliver HTML directly (...). You no longer deal with mirroring the logic on both
> sides of the application, permeated via JSON. All logic resides on the server, and the browser only handles the final
> HTML.

This is the concept of *HTML-Over-The-Wire* - Hotwire. 🤓

### *Turbo Frame* VS. *Turbo Stream*
Something that confused me quite a bit at first was understanding the difference between *Turbo Frame* and
*Turbo Stream*, as they are different approaches. Fortunately, I found this table published by
[*The Pragmatic Programmers*](https://medium.com/pragmatic-programmers/turbo-frames-vs-turbo-streams-4eee1c574d23){:target="_blank"}:
```
----------------------------------------------------------------------------+-------------------------------------------------------------------------------------------------+
                Turbo Frames                                                |                     Turbo Streams                                                               |
----------------------------------------------------------------------------+-------------------------------------------------------------------------------------------------+
A response can only change one DOM element.                                 |  A response can change an arbitrary number of DOM elements.                                     |
A response will update the inner HTML of the element.                       |  A response can append, prepend, remove, replace, or update the affected elements.              |
The affected element must be a turbo-frame with the same DOM ID.            |  Affected elements can be any type of HTML with a matching DOM ID to the target of the stream.  |
Turbo Frames are evaluated on any navigation inside a turbo-frame element.  |  Turbo Streams are evaluated on form responses or ActionCable broadcasts.                       |
----------------------------------------------------------------------------+-------------------------------------------------------------------------------------------------+
```
**Note**: I don't intend to use *Turbo Frames* in this project. I might reconsider this to take advantage of the
*lazily load* functionality, but if that happens, I'll add a separate post about it.
{: .note-info }

### Starting with *Turbo Stream*
To separately explain the *render* mode `turbo_stream`, I included the code for this subpart in the *branch*
[blog-part-2.1](https://github.com/eugeniojimenes/LearningHotwire/tree/blog-part-2.1){:target="_blank"}.

In the `ChoresController` that we generated with `rails generate scaffold` in the
[previous step]({% post_url en/2021-12-09-tutorial-rails7-hotwire-part-1 %}#a-simple-scaffold){:target="_blank"} of
this tutorial, Rails included multiple rendering formats by default, in this case, HTML and JSON. Since we included
`gem "turbo-rails"` in the Gemfile, we also have access to rendering via *Turbo Stream*, just by adding
`format.turbo_stream` inside the `respond_to do |format|` block. Doing this for the *create* and *destroy* methods, we
have in [app/controllers/chores_controller.rb](https://github.com/eugeniojimenes/LearningHotwire/blob/blog-part-2.1/app/controllers/chores_controller.rb){:target="_blank"}:
```ruby
# file app/controllers/chores_controller.rb of blog-part-2.1 branch
class ChoresController < ApplicationController
  ...
  def create
    ...
    respond_to do |format|
      if @chore.save
        format.turbo_stream # include this
        format.html { redirect_to @chore, notice: "Chore was successfully created." }
        format.json { render :show, status: :created, location: @chore }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @chore.errors, status: :unprocessable_entity }
      end
    end
  end
  ...
  def destroy
    @chore.destroy
    respond_to do |format|
      format.turbo_stream # include this
      format.html { redirect_to chores_url, notice: "Chore was successfully destroyed." }
      format.json { head :no_content }
    end
  end
  ...
end
```

For this type of rendering, we also need dedicated files in `app/views`, just like we have for HTML and JSON. Thus, we
have the following [app/views/chores/create.turbo_stream.erb](https://github.com/eugeniojimenes/LearningHotwire/blob/blog-part-2.1/app/views/chores/create.turbo_stream.erb){:target="_blank"}:
```erb
<!-- file app/views/chores/create.turbo_stream.erb of blog-part-2.1 branch -->
<%= turbo_stream.append "chores", partial: "chores/chore", locals: { chore: @chore } %>
<%= turbo_stream.replace "chore_form", partial: "chores/form", locals: { chore: Chore.new } %>
```

Since we want to see this application without reloading the entire page, that is, to be able to **render only a part**
of the page, we will do this in the *index* of *chores*. Therefore, we use the methods `turbo_stream.append` and
`turbo_stream.replace` above, pointing to the DOM ID of the page. In other words, the first arguments `"chores"` and
`"chore_form"` respectively must be present on the **fully rendered** page by
[app/views/chores/index.html.erb](https://github.com/eugeniojimenes/LearningHotwire/blob/blog-part-2.1/app/views/chores/index.html.erb){:target="_blank"}.
Thus, we need to include `id="chores"` in the `<div>` that wraps the listing of *chores*:
```erb
<!-- file app/views/chores/index.html.erb  of blog-part-2.1 branch -->
<div ...>
  <div ...>
    <div id="chores" ...> <!-- include id="chores" for turbo_stream.append -->
      <% @chores.each do |chore| %>
        <%= render "chore", chore:chore %>
      <% end %>
    </div>
  </div>
  <div ...>               <!-- don't include id="chore_form" here!         -->
    <%= render "form", chore: @chore %>
  </div>
</div>
```

Now, for `id="chore_form"`, we can't include it in the `<div>` that wraps `<%= render "form", chore: @chore %>` because
the `turbo_stream.replace` method **completely replaces the element**. Since we are replacing it with the partial view
[app/views/chores/_form.html.erb](https://github.com/eugeniojimenes/LearningHotwire/blob/blog-part-2.1/app/views/chores/_form.html.erb){:target="_blank"},
this `<div>` would be deleted. Therefore, we should include `id="chore_form"` in the form file itself:
```erb
<!-- file app/views/chores/_form.html.erb  of blog-part-2.1 branch -->
<%= form_with(model: chore, id: "chore_form") do |form| %>
  ...
<% end %>
```

Now, to delete a *chore* is even simpler. We have the following
[app/views/chores/destroy.turbo_stream.erb](https://github.com/eugeniojimenes/LearningHotwire/blob/blog-part-2.1/app/views/chores/destroy.turbo_stream.erb){:target="_blank"}:
```erb
<!-- file app/views/chores/destroy.turbo_stream.erb of blog-part-2.1 branch -->
<%= turbo_stream.remove dom_id(@chore) %>
```

Similarly, we need to include the DOM ID, but in this case specific to each *chore*, hence `dom_id(@chore)`.
Additionally, we also need to edit the `<button>` for the delete icon to point to the *destroy* method of the
*controller*. Therefore, in
[app/views/chores/_chore.html.erb](https://github.com/eugeniojimenes/LearningHotwire/blob/blog-part-2.1/app/views/chores/_chore.html.erb){:target="_blank"}:
```erb
<!-- file app/views/chores/_chore.html.erb of blog-part-2.1 branch -->
<div id="<%= dom_id(chore) %>" ...> <!-- include dom_id(chore) for turbo_stream.remove -->
  <div ...>
    ...
    <div ...>
      ...
      <%= button_to chore_path(chore), method: :delete, class: ... do %> <!-- make button point to delete method -->
        <svg ...>
          ...
        </svg>
      <% end %>
      ...
```

Now, when removing a *chore*, we also have a **partial rendering** that removes the HTML of the deleted *chore* without
reloading the entire page. The final result of this subpart, when creating or deleting a *chore* at
[http://localhost:3000/chores](http://localhost:3000/chores){:target="_blank"}, looks like this:
![Turbo-Stream Add](/assets/gifs/turbo-stream-add.gif){: .align-center}

**Note**: There is no full page reload after each addition or deletion; the page is partially reloaded via
[*fetch*](https://developer.mozilla.org/pt-BR/docs/Web/API/Fetch_API/Using_Fetch){:target="_blank"}.
{: .note-info }

However, if you open two windows of [http://localhost:3000/chores](http://localhost:3000/chores){:target="_blank"} and
add or delete *chores* in one window, you will see that the changes are only reflected in the window where the action
was performed; **there is no persistence across all sessions**. To achieve that, we need to implement it via
*ActionCable* with `broadcast`.

### Applying *broadcast*
This corresponds to the final part of this tutorial stage. The previous subpart was solely to explain the isolated use
of `turbo_stream` rendering. As the goal is to create a Kanban-style application, I intend to predominantly use this
rendering method along with `broadcast` going forward. The complete code for this stage is in the
[blog-part-2.2](https://github.com/eugeniojimenes/LearningHotwire/tree/blog-part-2.2){:target="_blank"} branch.

To apply changes to *chores* across all sessions, we'll utilize `Turbo::StreamsChannel`, which comes with the
`turbo-rails` gem. This channel can be invoked directly in the model or controller, depending on the preferred approach.
The idea here is that **we'll be implementing partial renders in a Publish/Subscribe pattern**. Behind the scenes,
we'll use *Active Jobs* to asynchronously "publish" the `turbo_stream` partial render and *Action Cable* to deliver
these updates to "subscribers".

In our case, our "subscribers" are all open sessions of
[http://localhost:3000/chores](http://localhost:3000/chores){:target="_blank"}, and we can map this using the
`turbo_stream_from` helper. Therefore, in
[app/views/chores/index.html.erb](https://github.com/eugeniojimenes/LearningHotwire/blob/blog-part-2.2/app/views/chores/index.html.erb){:target="_blank"},
we have:
```erb
<!-- file app/views/chores/index.html.erb  of blog-part-2.2 branch -->
<%= turbo_stream_from "chores" %>
<div ...>
  ...
</div>
```

As mentioned earlier, we can include `Turbo::StreamsChannel` in the model or controller to cover the modifications of
*create*, *update*, and *delete*. Specifically, this can be achieved through methods like `.broadcast_append_to`,
`.broadcast_replace_to`, `.broadcast_remove_to`, among others. If we include this in the model using Active Record
callbacks, such as `after_create_commit`, **every time the model is altered**, we will trigger partial rendering
"publications". However, since I currently want to trigger these changes only through user requests, I don't want
`rails db:seed`, for example, to trigger this. So, I opted to include it in the controller.

Therefore, in
[app/controllers/chores_controller.rb](https://github.com/eugeniojimenes/LearningHotwire/blob/blog-part-2.2/app/controllers/chores_controller.rb){:target="_blank"},
we have:
```ruby
# file app/controllers/chores_controller.rb of blog-part-2.2 branch
class ChoresController < ApplicationController
  before_action :set_chore, only: %i[ show edit update destroy ]
  after_action :broadcast_insert, only: %i[create]
  after_action :broadcast_remove, only: %i[destroy]

  ...

  private
    ...
    def broadcast_insert
      return if @chore.errors.any?
      Turbo::StreamsChannel.broadcast_append_to(
        "chores",
        target: "chores",
        partial: "chores/chore",
        locals: { chore: @chore }
      )
    end

    def broadcast_remove
      return unless @chore.destroyed?
      Turbo::StreamsChannel.broadcast_remove_to(
        "chores",
        target: ActionView::RecordIdentifier.dom_id(@chore)
      )
    end
end
```

Since the private methods `broadcast_insert` and `broadcast_remove` above handle the insertion and removal of chores,
we no longer need to do this in the `*.turbo_stream.erb` views created in the previous subpart. Therefore, for this
final part, I have removed the `app/views/destroy.turbo_stream.erb` view and kept
[app/views/chores/create.turbo_stream.erb](https://github.com/eugeniojimenes/LearningHotwire/blob/blog-part-2.2/app/views/chores/create.turbo_stream.erb){:target="_blank"}
with the following content:
```erb
<!-- file app/views/chores/create.turbo_stream.erb of blog-part-2.2 branch -->
<%= turbo_stream.replace "chore_form", partial: "chores/form", locals: { chore: Chore.new } %>
```
**Note**: Pay attention! We're not broadcasting the *replace* of the *form* via *ActionCable* like the other partial
renders. I've kept it here with `turbo_stream` for the current session only, which makes total sense since we don't
need to clear the form in other sessions. In fact, doing so could erase a form that another user is currently filling
out and hasn't submitted yet.
{: .note-info }

Done! Just start the project with `bin/dev` and access it in more than one window at
<http://localhost:3000/chores>{:target="_blank"}. You should achieve this final result:
![Turbo-Stream with Broadcast](/assets/gifs/turbo-stream--with--broadcast.gif){: .align-center}

![Nice Michael Scott - gif](https://c.tenor.com/S_wekPtfKm4AAAAd/nice-michael-scott.gif){: .align-center}
