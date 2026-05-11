---
layout: post
title:  "Today I learned: Etags in Rails"
date:   2024-06-21 13:10:53 -0300
locale: en_US
lang-ref: etags-in-rails
tags: TIL Ruby Rails Etag Cache
image: /assets/images/paper-tag.webp
image_alt: "A light brown paper label attached with a piece of jute rope."
description: >-
  When and how to use Etags in Rails.

---

Recently I've been studying about Browser caching and noticed that I didn't really know how to use Etags in Ruby on
Rails. Then came the excellent opportunity for this "Today I learned".
<!-- excerpt-end -->

## What are ETags?
ETags (Entity Tags) are part of the HTTP specification that helps optimize web performance by allowing conditional GET
requests. They provide a way for web servers to tell browsers that the response to a GET request hasn't changed since
the last request, enabling the browser to pull the response from its cache instead of re-downloading it.

#### How ETags Work
It works by using the `HTTP_IF_NONE_MATCH` and `HTTP_IF_MODIFIED_SINCE` headers to pass a unique content identifier
and the timestamp of when the content was last modified between the browser and server. If the browser's ETag or last
modified timestamp matches the server's version, the server sends back an empty response with a `304 Not Modified`
status, indicating that the cached version is still valid.

## Using ETags in Rails
In Rails, conditional GET support is implemented using ETags and the `stale?` and `fresh_when` methods. Here's how to
use them:

#### Using `stale?`
The `stale?` method checks if a request is stale based on the provided timestamp and ETag value. If the request is
stale, the block is executed; otherwise, a `304 Not Modified` response is automatically sent.
```ruby
class ProductsController < ApplicationController
  def show
    @product = Product.find(params[:id])

    if stale?(last_modified: @product.updated_at.utc, etag: @product.cache_key_with_version)
      respond_to do |format|
        # Normal response processing
      end
    end
  end
end
```

You can also pass a model directly to `stale?`, which uses the model's `updated_at` and `cache_key_with_version`
methods.
```ruby
class ProductsController < ApplicationController
  def show
    @product = Product.find(params[:id])

    if stale?(@product)
      respond_to do |format|
        # Normal response processing
      end
    end
  end
end
```

#### Using `fresh_when`
The `fresh_when` method is a shortcut for setting the `last_modified` and `etag` headers. It sends a `304 Not Modified`
response if the request is fresh, or renders the default template if it's stale.
```ruby
class ProductsController < ApplicationController
  def show
    @product = Product.find(params[:id])
    fresh_when last_modified: @product.updated_at.utc, etag: @product
  end
end
```
#### Using `http_cache_forever`
For static pages that never expire, use the `http_cache_forever` helper. This sets the `last_modified` header to a
fixed date and the expires header to 100 years in the future.
By default, cached responses will be private, cached only on the user's web browser. To allow proxies to cache the
response, using `http_cache_forever(public: true)` to indicate that they can serve the cached response to all users.
```ruby
class HomeController < ApplicationController
  def index
    http_cache_forever(public: true) do
      render
    end
  end
end
```
**Attention:** Use this method carefully as browser/proxy won't be able to invalidate the cached response unless browser
cache is forcefully cleared. With this approach Rails sends the 100 years cache header
`Cache-Control: public, max-age=31536000`.
{: .note-warning }

Here is a better approach with `fresh_when` instead of using `http_cache_forever`:
```ruby
class HomeController < ApplicationController
  def index
    # lmd tracks the last modified time of the view file. This could be done by
    # `lmd = File.mtime(Rails.root.join("app/views/home/index.html.erb")).utc`,
    # but instead of checking the timestamp on every request, it is better to
    # set the date of the last modification and update it when the view is changed.
    lmd = Time.parse("2024-06-12 22:39:18 UTC").utc
    fresh_when last_modified: lmd, etag: lmd, public: true
    render
  end
end
```
Another (and much better) approach is to use `response.body` as a tracker for the ETag:
```ruby
class HomeController < ApplicationController
  def index
    response.etag = response.body # when the view is changed the response.body will also be different
    fresh_when etag: response.etag, public: true
  end
end
```


### Strong vs. Weak ETags
Rails generates weak ETags by default, which are prefixed with `W/` and allow semantically equivalent responses to have
the same ETag. Strong ETags, which do not have this prefix, imply that the response must be byte-by-byte identical.

#### Generating Strong ETags
To generate a strong ETag in Rails, use the `strong_etag` option with `fresh_when`:
```ruby
class ProductsController < ApplicationController
  def show
    @product = Product.find(params[:id])
    fresh_when last_modified: @product.updated_at.utc, strong_etag: @product
  end
end
```
You can also set the strong ETag directly on the response:

```ruby
# The following line only set the strong ETag.
# You still need `stale?` or `fresh_when` to track the desired cache refresh
response.strong_etag = response.body # => "618bbc92e2d35ea1945008b42799b0e7"
```
**Note:** Strong ETag is useful when doing Range requests (a request that asks the server to send only a portion of an
HTTP message back to a client) within a large video or PDF file. Some CDNs support only strong ETags.
{: .note-info }

## References
 - <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag>
 - <https://guides.rubyonrails.org/caching_with_rails.html#conditional-get-support>
