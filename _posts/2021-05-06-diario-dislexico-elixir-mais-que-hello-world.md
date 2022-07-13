---
layout: post
title:  "Diário disléxico - Elixir: Um pouco mais que um \"Hello World\""
date:   2021-05-06 22:26:09 -0300
tags: Elixir
main_image: /assets/images/elixir-logo.webp
image: /assets/images/elixir-logo.webp
image_alt: "Elixir Logo"
description: >-
  Começando pelo básico: curiosidades, instalação, configuração e o clássico "Hello World".
categories: blog

---

<!-- excerpt-start -->
Para além de instalar e codar o clássico "Hello World", vamos explorar os passos iniciais com a
tecnologia. Entender os *data types*, as operações básicas e algumas curiosidades.
<!-- excerpt-end -->

## Um pouco de história
Elixir é uma linguagem de programação dinâmica, funcional e concorrente, compilada e executada na
máquina virtual Erlang (BEAM - *Bogdan/Björn’s Erlang Abstract Machine*). Criada em 2012 pelo
brasileiro [José Valim](https://github.com/josevalim){:target="_blank"} em um projeto de pesquisa e
desenvolvimento da empresa [Plataformatec](http://blog.plataformatec.com.br){:target="_blank"},
hoje uma subsidiária do Nubank.

<br/>
![Erlang logo](/assets/images/erlang-logo.webp){: .align-left}
Mas e esse tal de [Erlang](https://en.wikipedia.org/wiki/Erlang_(programming_language)){:target="_blank"}?
Trata-se de uma linguagem também funcional e concorrente criada pela empresa Ericson em 1986.
Projetada para lidar com as demandas de telecomunicações, ou seja, alta capacidade de resposta,
escalabilidade e disponibilidade constante. Afinal uma ligação não podia (e ainda não pode) ser
afetada pelas outras, um imprevisto ou atualização não pode derrubar o sistema telefônico. Com o
avanço da internet e a sofisticação das aplicações como redes sociais, jogos multiplayer, sistemas
de gerenciamento de conteúdo (CMS - *Content Management Systems*), compartilhamento e execução
online de arquivos multimídia, entre outros exemplos, a necessidade de alta-performance e o chamado
*non-stop system* deixou de ser exclusividade para as telecoms. Por isso o Elixir foi desenvolvido
[sob a tecnologia](https://vimeo.com/53221562){:target="_blank"} da Ericson

Isto pode ser visto não apenas com a popularidade do Elixir, mas como do próprio Erlang, utilizado
por exemplo no desenvolvimento do WhatsApp, por grandes empresas como MasterCard, Nintendo, Amazon e
[entre outros](https://www.erlang-solutions.com/blog/which-companies-are-using-erlang-and-why-mytopdogstatus){:target="_blank"}.
No lado do Elixir, mesmo sendo uma tecnologia mais recente, temos casos de sucesso com as empresas
Pinterest, Financial Times, Discord (sim, aquele mesmo que você pra conversar com os amiguinhos em
jogos online), PepsiCo, Toyota Connected [etc](https://www.monterail.com/blog/famous-companies-using-elixir){:target="_blank"}.

## Instalação e configuração
Inicialmente pensei em utilizar algum gerenciador de versão como faço com Ruby através do RVM, mas
optei, por agora, em instalar diretamente no meu Linux, no caso Arch Linux. Para outros sistemas
operacionais veja em <https://elixir-lang.org/install.html>{:target="_blank"}.

```bash
# instalação
$ sudo pacman -S elixir
```

Você deve obter algo como:

```
$ elixir -v
Erlang/OTP 23 [erts-11.2] [source] [64-bit] [smp:12:12] [ds:12:12:10] [async-threads:1] [hipe]

Elixir 1.11.3 (compiled with Erlang/OTP 23)
```

Além do comando ```elixir``` temos o ```iex```, que é o *Elixir's interactive shell*, e o ```mix```,
que é o *build tool* da linguagem. Aparentemente equivalentes ao ```irb``` e ```bundle``` do Ruby.

```elixir
$ iex
Erlang/OTP 23 [erts-11.2] [source] [64-bit] [smp:12:12] [ds:12:12:10] [async-threads:1] [hipe]

Interactive Elixir (1.11.3) - press Ctrl+C to exit (type h() ENTER for help)
iex> 1 + 1
2
iex> 2 < 3
true
iex> 8 == 8.0
true
iex> 8 === 8.0
false
iex> true == :true
true
iex> String.split("Duas palavras", " ")
["Duas", "palavras"]
```
**Obs**: Mais a diante explico melhor, e com mais exemplos, as interações do console acima. Caso
esteja perdido ~~como eu fiquei~~ para sair do ```iex```, basta dar CTRL+C duas vezes.
{: .note-warning }

Existem diversas funcionalidades contempladas pelo ```mix``` como podemos ver em
<https://hexdocs.pm/mix/Mix.html>{:target="_blank"}. Para esta primeira parte utilizei para criar
um projeto.

```
$ mix new hello
* creating README.md
* creating .formatter.exs
* creating .gitignore
* creating mix.exs
* creating lib
* creating lib/hello.ex
* creating test
* creating test/test_helper.exs
* creating test/hello_test.exs

Your Mix project was created successfully.
You can use "mix" to compile it, test it, and more:

    cd hello
    mix test

Run "mix help" for more commands.
```

Este comando gera uma estrutura de pastas e arquivos para abranger testes, dependências, ambiente e
versão.

**Curiosidade**: Arquivos de extensão ```.ex``` são compilados pelo Elixir para arquivos ```.beam```,
que é o *bytecode* interpretado pela máquina virtual do Erlang, enquanto os de
extensão ```.exs``` rodam como *script*, ou seja, compilados e disponibilizados em memória RAM.
{: .note-info }

## Um pouco sobre tipos de dados e operações básicas

Através do ```iex``` podemos brincar com algumas operações matemáticas, nada muito diferente das
outras linguagens.

```elixir
iex> 7 + 2
9
iex> 8 * 3
24
iex> 12/3
4.0
iex> div(33, 3)
11
iex> div 33, 4
8
iex> rem(33, 4)
1
iex> rem 4, 2
0
```
**Curiosidade**: Podemos notar que a divisão com ```/``` retorna um *float*, mesmo sendo inteira.
Alguns funções gerais já são disponibilizadas globalmente e, da mesma forma que o Ruby, os
parenteses de uma chamada de função não é obrigatório.
{: .note-info }

Os tipos básicos de dados são: *integers*, *floats*, *strings*, *booleans*, *atoms*, *lists*,
*tuples* e *maps*. Suporta também notações de atalho para inserir números binários, octais e
hexadecimais, além de notação científica para *floats*. *Atoms* talvez seja "o novo" aqui, trata-se
de uma constante cujo valor é o próprio nome, parecido com o *symbol* do Ruby e outras linguagens.
*Booleans* também são considerados como *atoms*.

```elixir
iex> 6                          # integer
6
iex> 0x1F                       # integer
31
iex> 1.8                        # float
1.8
iex> 1.0e-10                    # floats are 64-bit double precision
1.0e-10
iex> "Hello World"              # string
"Hello World"
iex> true                       # boolean
true
iex> false                      # boolean
false
iex> :atom                      # atom / symbol
:atom
iex> :true                      # atom / symbol
true
iex> false == :false            # boolean is a atom
true
iex> is_atom(true)
true
iex> is_boolean(:true)
true
iex> [1, 2, 3]                  # list
[1, 2, 3]
iex> {4, 5, 6}                  # tuple
{4, 5, 6}
iex> map = %{:a => 1, 2 => :b}  # map
%{2 => :b, :a => 1}
iex> map[:a]
1
iex> map[2]
:b
iex> map[:c]
nil
```

*Strings* são definidas por aspas duplas, sequências de escape como quebra de linha, o ```\n```,
também são aceitas e o mesmo açúcar sintático para interpolação do Ruby é utilizado. Algo que me
chamou a atenção é que para o Elixir, internamente, ```strings``` são binários.

```elixir
iex> string = :world
iex> "hello #{string}"
"hello world"
iex> "hello
...> world"
"hello\nworld"
iex> "hello\nworld"
"hello\nworld"
iex> IO.puts("hello\nworld")
hello
world
:ok
iex> is_binary("I'm a binary guy")
true
iex> byte_size("I'm a binary guy")
16
```
**Curiosidade**: Através de ```IO.puts``` podemos ver a saída de uma *string* com a quebra literal
de linha. O módulo ```IO``` traz diversas funções de entrada e saída - *Input & Output*, irei
abordar mais sobre isso nos próximos posts.
{: .note-info }

Sobre *lists*, *tuples* e *maps* eu pretendo explicar mais a fundo nas próximas partes. Tratam-se
de estruturas de dados com diversas operações e peculiaridades. Os dados em Elixir (e na maioria
das linguagens funcionais) são imutáveis, ou seja, uma vez declarados não podem ser alterados. Uma
concatenação de duas *lists*, por exemplo, não as altera, mas cria uma nova em memória. Por isso
que não vemos aqui o conceito direto de *array*, quer seria uma especie de lista com valores
acessíveis (indexáveis) e mutáveis, logo não imutáveis.

## E vamos pro "Hello World"
![thumbs up cool meme - gif](https://c.tenor.com/aSAUONK9oEcAAAAC/thumbs-up-cool.gif){: .align-center .img-increase}

Acessando nosso projeto, criado com ```mix new hello```, temos a seguinte base no arquivo ```hello/lib/hello.ex```:

```elixir
defmodule Hello do
  @moduledoc """
  Documentation for `Hello`.
  """

  @doc """
  Hello world.

  ## Examples

      iex> Hello.hello()
      :world

  """
  def hello do
    :world
  end
end
```

As tags *@moduledoc* e *@doc* são para documentar módulos e funções, respectivamente. São ignoradas
na compilação do mesmo modo que os comentários (feito com ```#``` no começo da linha). A diferença é
que o conteúdo dessas tags, delimitado por 3 aspas duplas, são renderizados pela *help* do ```iex```
quando invocada para o módulo e/ou função. Também serve para gerar a documentação geral do projeto
em HTML e EPUB através da dependência [ExDoc](https://github.com/elixir-lang/ex_doc){:target="_blank"}.

O curioso aqui é que ao criamos um projeto, o comando ```mix```, por padrão, já cria uma função de
"Hello World". Para executar basta utilizar o ```iex``` com a opção ```-S mix``` dentro da pasta do
projeto para compila-lo.

```bash
# Execute dentro da pasta do projeto
$ iex -S mix
Erlang/OTP 23 [erts-11.2.1] [source] [64-bit] [smp:12:12] [ds:12:12:10] [async-threads:1] [hipe]

Compiling 1 file (.ex)
Generated hello app
Interactive Elixir (1.11.3) - press Ctrl+C to exit (type h() ENTER for help)
iex> Hello.hello()
:world
```

A chamada de ```Hello.hello()``` retorna o *atom* ```:world```. Da mesma forma que o Ruby, o Elixir
omite o *"return"* de uma função, considera o último valor apresentado como o retorno.

Como isso veio fácil demais, vamos incrementar um pouco:

```elixir
defmodule Hello do
  def hello(name), do: "Hello #{name}"
  def hello(name1, name2), do: "Hello #{name1} and #{name2}"
  def hello, do: "Hello World"
end
```

Bem, já temos algumas coisas interessantes aqui. Primeiro vemos que é possível omitir o ```end```
de uma função, simplificando-a em uma linha. Segundo, é mais maluco pra mim quando eu vi, é que
podemos ter múltiplas funções com mesmo nome e quantidades diferentes de argumentos.
Isto porque o Elixir refere as funções por nome + aridade (quantidade de argumentos).

**Obs**: É possível ainda ter mais de uma função com o mesmo nome e aridade, diferenciando-as pela
condição feita com os argumentos em cada uma. Isso faz com que tenha bem menos *if/else* em seus
códigos Elixir.
{: .note-warning }

Para executar as alterações basta rodar o ```recompile``` no terminal ```iex``` aberto anteriormente

```bash
iex> recompile
Compiling 1 file (.ex)
:ok
iex> Hello.hello
"Hello World"
iex> Hello.hello("Eugenio")
"Hello Eugenio"
iex> Hello.hello "Eugenio", "Nila"
"Hello Eugenio and Nila"
```

Por agora, é isso.

![Noice nice meme - gif](https://c.tenor.com/H6sjheSkU1wAAAAC/noice-nice.gif){: .align-center .img-increase}
