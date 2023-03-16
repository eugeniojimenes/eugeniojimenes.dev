---
layout: post
title:  "Ruby Metaprogramming - unraveling the world!"
date:   2023-03-15 17:35:53 -0300
locale: en_US
lang-ref: ruby-metaprogramming
tags: Ruby
image: /assets/images/hand-to-hand.webp
image_alt: "Two mechanical hands fixing each other"
description: >-
  Understanding the concept and usage of Metaprogramming in the Ruby language.

---

Some days ago I've tried to explain the concept of Metaprogramming to a friend who is starting in
the IT area and is studying Ruby as her first language, my influence by the way, but I wasn't
satisfied with what I managed to teach about this subject.

I follow this motto: "You really understand something when you are able to comfortably teach it".
So here I'm, teaching myself with this article.
<!-- excerpt-end -->

## What does Metaprogramming mean?
With a quick web search I found the following:

> Metaprogramming is a technique by which you can write code that writes code by itself dynamically
> at runtime. This means you can define methods and classes during runtime. Crazy, right? In a
> nutshell, using metaprogramming you can reopen and modify classes, catch methods that don’t exist
> and create them on the fly, create code that is DRY by avoiding repetitions, and more.

**Source:** <https://www.toptal.com/ruby/ruby-metaprogramming-cooler-than-it-sounds#metaprogramming>

So, in other words, it means that we use metaprogramming when we need to implement something
dynamically, something that we can't know exactly what will be, but we have a general notion of
how it should behave.

## A quick example in Rails
When we need to check the current environment in Rails, we usually use
`Rails.env.<environment_name>?`, something like this:
```ruby
if Rails.env.production?
  ... # Do something in the Production environment.
end
```

What you may not know is that `Rails.env` belongs to `ActiveSupport::StringInquirer` class. This
class uses `method_missing`, so that you can call `env.<environment_name>?` instead of
`env == "environment_name"`.

The part of code that does this metaprogramming in `ActiveSupport::StringInquirer` looks like:
```ruby
def method_missing(method_name, *arguments)
  if method_name.end_with?("?")
    self == method_name[0..-2]
  else
    super
  end
end
```
You can see the full original code
[here](https://github.com/rails/rails/blob/f921804182e45e5a22bfd64502dc3c096bb451dd/activesupport/lib/active_support/string_inquirer.rb#L25).

These use of `method_missing` here means that if a method that wasn't implemented directly with
`def ... end`, so a missing method, and its name ends with `?` then compare its name with the value
of the instance of `ActiveSupport::StringInquirer`.

Another example that you can try is running the following code in some Rails application that you
have in its `rails console`:
```ruby
# Inside a Rails console
vehicle = ActiveSupport::StringInquirer.new('car') # => "car"
vehicle.car? # => true 
vehicle.bike? # => false
vehicle.motorcycle? # => false
vehicle.dummy? # => false
```
As you can see, a multitude of methods are available for this `vehicle`, which is an instance of
`ActiveSupport::StringInquirer`, where only `vehicle.car?` returns `true` because its value is
`"car"`.

## More about `method_missing` in Ruby

This method is a private method in the `BasicObject`, which **is the parent class of all classes in
Ruby, it’s an explicit blank class**. When some part of a code tries to execute a nonexistent method
of Class, `method_missing` is called. The trick here is that you can override this method to
provide some dynamic behavior, like we saw in `ActiveSupport::StringInquirer`.


In the [official documentation](https://docs.ruby-lang.org/en/3.1/BasicObject.html#method-i-method_missing),
we find this explanation:
> `method_missing(symbol [, *args] ) → result`
>
> Invoked by Ruby when obj is sent a message it cannot handle. `symbol` is the symbol for the
> method called, and `args` are any arguments that were passed to it. By default, the interpreter
> raises an error when this method is called. However, it is possible to override the method to
> provide more dynamic behavior. If it is decided that a particular method should not be handled,
> then `super` should be called, so that ancestors can pick up the missing method.

So as you can see, `method_missing` was implemented in the `BasicObject` not only to deal with
nonexistent methods, but also to be overridden in classes that we code. Here is an example with the
usage with `super`:

```ruby
class Dummy
  def method_missing(method_name, *args)
    name = method_name.to_s
    super unless name.start_with? "set_"

    attr_name = name.delete_prefix("set_")
    instance_variable_set("@#{attr_name}", args[0])
  end
end

dummy = Dummy.new
dummy.set_name("Eugenio")
dummy.instance_variable_get("@name")
# => "Eugenio"

dummy.set_hash({key: "vaule"})
dummy.instance_variable_get("@hash")
# => {:key=>"vaule"}

dummy.nonexistent_method # it will trown an error
# => undefined method `nonexistent_method' for #<Dummy:0x00007f5e2dac29d8 @name="Eugenio", @hash={:key=>"vaule"}> (NoMethodError)
```

In this example a bunch of methods is dynamic defined to set and to allocate local variables of an
instance of `Dummy`, but if this method name doesn't start with "set_" than the original behavior
of `method_name` is called through `super`.

## About `define_method` in Ruby

Besides `method_missing`, we also can use `define_method` to do some metaprogramming. Both these
methods are the most used to do this.

`define_method` is written in the `Module` class, which is a collection of methods and constants.
Although `method_missing` is defined in the `BasicObject`, instead of this class `Module`, the
usage of both are quite the same.

**Note:** If you read more about this `Module` class you will probably see something like
*"`Module` is the superclass of `Class` and is also an instance of `Class`"*. It is confusing, I
know, but the best explanation that I found is
[this answer by John Douthat in the Stackoverflow](https://stackoverflow.com/questions/10558504/can-someone-explain-the-class-superclass-class-superclass-paradox/10560958#10560958).
{: .note-info }

In the [official documentation](https://docs.ruby-lang.org/en/3.1/Module.html#method-i-define_method),
we find this explanation of `define_method`:
> `define_method(symbol, method) → symbol`
>
> `define_method(symbol) { block } → symbol`
>
> Defines an instance method in the receiver. The method parameter can be a Proc, a Method or an
> UnboundMethod object. If a block is specified, it is used as the method body. If a block or the
> method parameter has parameters, they’re used as method parameters. This block is evaluated using
> `instance_eval`.

The meaning of *"This block is evaluated using `instance_eval`"* is that a code with `define_method`
will be evaluated by a Ruby interpreter in the context where it is called, so if you call it inside
some class it will be treated as an instance method, like a `def some_instance_method; end`, on the
other hand if you call it inside a `class << self; end` it will be treated as a class method. Here
is a simple example:

```ruby
class MyClass
  define_method :some_instance_method do 
   "Hi, I'm a instance method --> self value: #{self}"
  end

  class << self
    define_method :some_class_method do 
     "Hi, I'm a class method --> self value: #{self}"
    end
  end
end

MyClass.some_class_method
# => "Hi, I'm a class method --> self value: MyClass" 
my_obj = MyClass.new
# => #<MyClass:0x00007f564213a818> 
my_obj.some_instance_method
# => "Hi, I'm a instance method --> self value: #<MyClass:0x00007f564213a818>"
```

## A real life example for `define_method` use.

Imagine that you have a `Post` class for some blog and this class has a *status* attribute that
can be *draft*, *published* or *unpublished*. To build some *"status check"* for each of these
possibilities this code was written:
```ruby
class Post
 # have a status attribute that can be draft, published or unpublished.
 def draft?
   status == "draft"
 end
 def published?
   status == "published"
 end
 def unpublished?
   status == "unpublished"
 end
end
```

We definitely can do this better with `define_method`:

```ruby
class Post
 define_method "#{method_name}?" do
  status == method_name
 end
end
```
With this approach we not only build the three methods for the three states of *status* attribute,
but also build the methods for **possible future new states**! If an *edited* status appears
besides the others, we already have the `edited?` method. Also, if some *status* is no longer used
we don't need to erase its check method. **All methods are dynamically built!**


## References
 - <https://www.rubyguides.com/2016/04/metaprogramming-in-the-wild/>
 - <https://www.toptal.com/ruby/ruby-metaprogramming-cooler-than-it-sounds>
 - <https://docs.ruby-lang.org/en/3.1/BasicObject.html#method-i-method_missing>
 - <https://docs.ruby-lang.org/en/3.1/Module.html#method-i-define_method>
