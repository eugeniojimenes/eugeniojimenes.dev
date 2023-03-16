---
layout: post
title:  "Metaprogramação Ruby - desvendando o mundo!"
date:   2023-03-15 17:35:53 -0300
locale: pt_BR
lang-ref: ruby-metaprogramming
tags: Ruby
image: /assets/images/hand-to-hand.webp
image_alt: "Duas mãos mecanicas se concertando"
description: >-
  Compreendendo o conceito e uso da Metaprogramação na linguagem Ruby.

---
Há alguns dias tentei explicar o conceito de Metaprogramação para uma amiga que está iniciando na
área de TI e também estudando Ruby como sua primeira linguagem, minha influência por sinal, mas eu
não fiquei satisfeito com o que consegui ensinar sobre esse assunto.

Eu sigo este lema: “Você realmente entende algo quando consegue confortavelmente ensinar sobre”.
Então aqui estou, ensinando a mim mesmo com este artigo.
<!-- excerpt-end -->

## O que significa Metaprogramação?
Com uma rápida pesquisa na web, encontrei o seguinte:

> A metaprogramação é uma técnica pela qual você pode escrever um código que escreve código por si
> só dinamicamente em tempo de execução. Isso significa poder definir métodos e classes durante o
> tempo de execução. Louco, certo? Resumindo, usando a metaprogramação, você pode reabrir e
> modificar classes, capturar métodos que não existem e criá-los na hora, criar código DRY evitando
> repetições e muito mais.

**Fonte:** <https://www.toptal.com/ruby/ruby-metaprogramming-cooler-than-it-sounds#metaprogramming>

Então, em outras palavras, significa que usamos a metaprogramação quando precisamos implementar
algo dinamicamente, algo que não conseguimos saber exatamente o que será, mas temos uma noção geral
de como deve se comportar.

## Um exemplo rápido em Rails
Quando precisamos verificar o ambiente atual no Rails, normalmente usamos
`Rails.env.<environment_name>?`, algo como:
```ruby
if Rails.env.production?
  ... # Do something in the Production environment.
end
```
O que você pode não saber é que `Rails.env` pertence à classe `ActiveSupport::StringInquirer`. Essa
classe usa `method_missing` para que você possa chamar `env.<environment_name>?` em vez de
`env == "environment_name"`.

A parte do código que faz essa metaprogramação em `ActiveSupport::StringInquirer` consiste em:
```ruby
def method_missing(method_name, *arguments)
  if method_name.end_with?("?")
    self == method_name[0..-2]
  else
    super
  end
end
```

Você pode ver o código original
[aqui](https://github.com/rails/rails/blob/f921804182e45e5a22bfd64502dc3c096bb451dd/activesupport/lib/active_support/string_inquirer.rb#L25).

O uso de `method_missing` aqui significa que se um método que não foi implementado diretamente com
`def ... end`, portanto um *método ausente*, e além disso seu nome termina com `?` então compare seu
nome com o próprio valor da instância de `ActiveSupport::StringInquirer`.

Para exemplificar isso melhor você pode rodar o seguinte código em alguma aplicação Rails que você
tenha pelo `rails console`:
```ruby
# Inside a Rails console
vehicle = ActiveSupport::StringInquirer.new('car') # => "car"
vehicle.car? # => true 
vehicle.bike? # => false
vehicle.motorcycle? # => false
vehicle.dummy? # => false
```
Como você pode ver, uma infinidade de métodos estão disponíveis para `vehicle`, que é uma instância
de `ActiveSupport::StringInquirer`, onde apenas `vehicle.car?` retorna `true` porque seu valor é
`"car"`.

## Mais sobre `method_missing`

Este método é um método privado de `BasicObject`, que **é a classe pai de todas as classes em Ruby,
é uma classe em branco explícita**. Quando algum trecho de código tenta executar um método
inexistente de alguma classe, `method_missing` é chamado. O truque aqui é que podemos reescrever
esse método para fornecer algum comportamento dinâmico, como vimos em
`ActiveSupport::StringInquirer`.


Na [documentação oficial](https://docs.ruby-lang.org/en/3.1/BasicObject.html#method-i-method_missing),
encontramos esta explicação:
> `method_missing(symbol [, *args] ) → result`
>
> Invoked by Ruby when obj is sent a message it cannot handle. `symbol` is the symbol for the
> method called, and `args` are any arguments that were passed to it. By default, the interpreter
> raises an error when this method is called. However, it is possible to override the method to
> provide more dynamic behavior. If it is decided that a particular method should not be handled,
> then `super` should be called, so that ancestors can pick up the missing method.

Como você pode ver, `method_missing` foi implementado no `BasicObject` não apenas para lidar com
métodos inexistentes, mas também para ser reescrito em classes que codificamos. Aqui está um exemplo
com o uso de `super`:

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

Neste exemplo, um monte de métodos é definido dinamicamente para "settar" e alocar variáveis locais
de uma instância de Dummy, mas se o nome deste método não começar com "set_" então o comportamento
original de `method_name` é chamado através do uso de `super`.

## Sobre `define_method` no Ruby

Além de `method_missing`, também podemos usar `define_method` para implementar alguma
metaprogramação. Ambos os métodos são os mais usados para fazer isso.

`define_method` é definido na classe `Module`, que **é uma coleção de métodos e constantes**.
Embora `method_missing` seja definido no `BasicObject`, em vez desta classe `Module`, o uso de
ambos é praticamente o mesmo.

**OBS**: Se você ler mais sobre esta classe `Module`, provavelmente verá algo como *"`Module` é a
superclasse de `Class` e também é uma instância de `Class`"*. É confuso, eu sei, mas a melhor
explicação que encontrei é
[esta resposta de John Douthat no Stackoverflow](https://stackoverflow.com/questions/10558504/can-someone-explain-the-class-superclass-class-superclass-paradox/10560958#10560958).
{: .note-info }

Na [documentação oficial](https://docs.ruby-lang.org/en/3.1/Module.html#method-i-define_method),
encontramos a seguinte explicação para `define_method`:

> `define_method(symbol, method) → symbol`
>
> `define_method(symbol) { block } → symbol`
>
> Defines an instance method in the receiver. The method parameter can be a Proc, a Method or an
> UnboundMethod object. If a block is specified, it is used as the method body. If a block or the
> method parameter has parameters, they’re used as method parameters. This block is evaluated using
> `instance_eval`.

O significado de *"This block is evaluated using `instance_eval`"* é que um código com
`define_method` será avaliado por um interpretador Ruby no contexto onde for chamado, então se você
chamar dentro de alguma classe ele será tratado como um método de instância, como um
`def some_instance_method; end`, por outro lado, se você chamá-lo dentro de uma
`class << self; end` será tratado como um método de classe. Segue um exemplo simples disso:

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

## Um exemplo mais real do use de `define_method`.

Imagine que você tem uma classe `Post` para algum blog e esta classe possui um atributo de *status*
que pode ser *draft*, *published* ou *unpublished*. Para construir alguma "verificação de status"
para cada uma dessas possibilidades, este código foi escrito:

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

Nós definitivamente podemos fazer isso melhor com `define_method`:

```ruby
class Post
 define_method "#{method_name}?" do
  status == method_name
 end
end
```
Com esta abordagem, não apenas construímos os três métodos para os três estados do atributo
*status*, mas também construímos os métodos para **possíveis novos estados futuros**! Se aparecer
um *status* *edited* além dos demais, já temos o método `edited?`. Além disso, se algum *status*
não for mais usado, não precisamos apagar seu respectivo método de verificação. **Todos os métodos
são construídos dinamicamente!**


## Referências
 - <https://www.rubyguides.com/2016/04/metaprogramming-in-the-wild/>
 - <https://www.toptal.com/ruby/ruby-metaprogramming-cooler-than-it-sounds>
 - <https://docs.ruby-lang.org/en/3.1/BasicObject.html#method-i-method_missing>
 - <https://docs.ruby-lang.org/en/3.1/Module.html#method-i-define_method>
