---
layout: post
title: "Skinny Controller and Fat Model, but don't lose focus"
date: 2020-12-17 09:46:13 -0300
locale: en_US
lang-ref: skinny-controller-fat-model
tags: Ruby Rails DesignPatterns
image: /assets/images/mvc-wiki.webp
image_alt: "MVC Diagram - Wikipedia"
description: >-
  "Skinny Controller, Fat Model" mantra, MVC pattern and DRY concept. It's the old clean and clear
  code challenge. See examples in Ruby on Rails.
categories: blog

---

Jamis Buck wrote the famous post
[Skinny Controller, Fat Model](http://weblog.jamisbuck.org/2006/10/18/skinny-controller-fat-model){:target="_blank"},
 it has become almost the mantra for the MVC pattern -
***M****odel-****V****iew-****C****ontroller*. In this case, all logic that isn't related to
client/user response - View-Controller - must be inside the model,  to keep response simple or
rather, "skinny".
<!-- excerpt-end -->

Why is that? Simple, because of the code organization and tests. If some part of your code is
responsible for communication, it's expected that, and only that, communication tests will be done
for that related part of code.

## But What is MVC?

It is a software design pattern that proposes a separation of concepts in three interconnected
layers, where the presentation of data to the users (or clients) is away from the part that
interacts with the database, aka "it protects the business logic".

![MVC Pattern](/assets/images/padrao-mvc.webp)

It's commonly applied along with the DRY concept - ***D****on’t* ***R****epeat* ***Y****ourself* -
focusing on not repeating code, but reusing it, which facilitates refactoring and debugging.

## Coding and exemplifying

For us to understand the "Fat Controllers" problem, let's take an example - in a silly Ruby on
Rails application, given a Post model, we have the following PostsController:

```ruby
class PostsController < ApplicationController

...
  def index
    @posts = Post.all
  end
...

end
```

So then came the demand for the user to be able to search in Posts. One solution, with poor
thought, could be:

```ruby
class PostsController < ApplicationController

...
  def index
    @posts = search_posts
  end
...
  private
  def search_posts
        entries = Post.all

      if params[:q].present?
        entries = entries.where(
          %(
            unaccent(title) ilike unaccent(:term)
            OR unaccent(subtitle) ilike unaccent(:term)
            OR unaccent(content) ilike unaccent(:term)
          ),
          term: "%#{params[:q]}%"
        )
      end
      entries
    end
  end
...
end
```

Can you see the problem? It makes no sense for the Controller to have a search logic. If the Post
model has been read, then why don't we move the `search_post` method to the Post itself? It could
also be named as `search` and called as `Post.search(<args>)`, which is more intuitive, by the way.
Besides organizing the logic, we can now keep all tests related to Posts - validation, search,
ranking etc -  under it instead of running them for the Controller. This example is also breaking
the MVC pattern, the controller has database calls logic when this is the model's responsibility.

**Note:** I'm not going to discuss the merits of the search performance here, which by the way is
terrible with all these ORs in the SQL query, it doesn't consider typos and cohesion of the
searched phrase. In short, it just removes accents with *unaccent* from PostgreSQL. There are
innumerable Full Text Searching techniques such as lexical indexing, wildcards, word ranking etc.
But that's a topic for another time, ~~who knows.~~ &#10144;
[Optimized text search with pg_search gem]({% post_url en/2021-01-17-optimized-text-search-with-pg-search-p1 %}){:target="_blank"}
{: .note-info }

## It's always good to control cholesterol

Obese models are also a problem. This can demotivate you to follow the mentioned patterns, but when
we deal with an extensive and complex logic of a class or file, it is much easier to "dilute" it if
it is focused on the same context, on a specific set of responsibilities.

The oriented object programming itself has innumerable strategies as composition, inheritance and
delegation. Abstracting a class with inheritance, for example, can be harder if it is responsible
for several tasks from different contexts, also, it will be even more so if these tasks and
contexts were mixed up or not well defined. Often it isn't about a technical issue, unlike with the
code, but understanding what you want to do.

> "Don't panic." - The Hitchhiker's Guide to the Galaxy

In Rails we can get around the "extensive codes" with `concerns`, `services` and even `jobs`
depending on your goal. It is worth emphasizing again the importance of focusing on each class
feature in order to better granulate the whole. In the coded example, it may happen that not only
`Post` has `search`, but other models like Comments, Papers etc. This calls (or "smells" if you're
a fan of *Code Smell* term) for us to move the method to a concern, something like `SearchConcern`
without being creative, which can be included in the "searchable models" of our application whether
existing or future. See that with this, in addition to slimming the Model, the granulation made
throws the functionality and complexity of searches into a single file, thus keeping the focus of
features for that snippet of code.
