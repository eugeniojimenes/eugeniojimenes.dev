---
layout: post
title:  "Diário disléxico - Elixir: preciso falar sobre \"Pattern Matching\""
date:   2021-05-14 19:27:21 -0300
tags: Elixir
image: /assets/images/elixir-logo.webp
image_alt: "Elixir Logo"
description: >-
  Essa parte provavelmente vai parecer confusa e desnecessária, mas confie, "pattern matching" é
  uma característica poderosa do Elixir.
categories: blog
header:
  og_image: assets/images/elixir-logo.webp

---

Quanto mais eu pesquiso sobre Elixir em tutoriais, artigos, livros e vídeos pela internet, mais eu
vejo isso sendo enfatizado. Inicialmente acreditei que fosse apenas por conta de legibilidade do
código, mas provou-se bem mais do que isto, justificando a vasta cobertura que diversos autores dão.
<!-- excerpt-end -->

## "Pattern Matching"
Essa parte provavelmente vai parecer confusa e desnecessária, mas confie, *pattern matching* é uma
característica poderosa do Elixir. Inicialmente precisamos entender que ```=``` é um operador
*match*, em uma tradução livre de *match* seria "correspondência". Sim, também o utilizamos para
atribuição, mas a aplicação vai mais além.

```elixir
iex> x = 3
iex> 3 = x
3
iex> 4 = x
** (MatchError) no match of right hand side value: 3
```
**Curiosidade**: Caso queira remover a numeração das linhas e habilitar histórico de comandos para
o seu ```iex```, consulte este tutorial
<https://www.toptechskills.com/elixir-phoenix-tutorials-courses/how-to-change-prompt-in-iex-elixir-tutorial-examples/>{:target="_blank"}.
{: .note-info }

A atribuição ```x = 3``` ocorre como a maioria das linguagens, mas o que aconteceu com ```3 = x```?
Retornou ```3``` e não um erro como o caso seguinte, ou seja, foi uma expressão válida. Quando essa
expressão não faz sentido, devolve um erro, melhor dizendo, quando a operação *match* não é feita
sob dois valores iguais temos um *MatchError*.

Note que a atribuição é **sempre** feita da esquerda para direita, ```4 = x``` não define a
variável x como 4. Porém, podemos fazer a operação *match* da esquerda para direita com o uso de
```^```, operador *pin*, antes da variável para não reatribui-la.

```elixir
iex> x = 2
iex> 2 = x
2
iex> ^x = 3
** (MatchError) no match of right hand side value: 3

iex> ^x = 2
2
```

O mesmo padrão se repete com *lists* e *tuples*.

```elixir
iex> list = [1, 2, 3]
iex> [1, 2, 3] = list
[1, 2, 3]
iex> [4, 5, 6] = list
** (MatchError) no match of right hand side value: [1, 2, 3]

iex> x = 2
iex> [^x, 3, 4, 5] = [2, 3, 4, 5]
[2, 3, 4, 5]
iex> {y, ^x} = {1, 2}
iex> y
1
```

Inclusive, a atribuição pode ser feita sob toda uma *list* ou *tuple*, quando correta.

```elixir
iex> [a, b, c] = [1, 2, 3]
iex> a
1
iex> b
2
iex> c
3
iex> {:ok, var} = {:ok, 3}
iex> var
3
iex> {:ok, var} = {:nonok, 3}
** (MatchError) no match of right hand side value: {:nonok, 3}
```
Conseguimos fazer também o *pattern matching* com a "cabeça" e "calda" de uma lista. Isso é feito
com auxílio do operador ```|``` e o comportamento é similar aos das funções ```hd/1``` e ```tl/1```.

```elixir
iex> [head | tail] = [1, 2, 3, 4]
iex> head
1
iex> tail
[2, 3, 4]
iex> [head | tail] = [1]
iex> head
1
iex> tail
[]
iex> [head | tail] = []
** (MatchError) no match of right hand side value: []

iex> tl([1])
[]
iex> hd([1])
1
iex> tl([])
** (ArgumentError) argument error
    :erlang.tl([])
```

Note que a expressão ```[head | tail] = []``` retorna um erro pois uma lista vazia, ```[]```, não
possui "calda". Da mesma forma, obtemos erro ao chamar a função ```tl/1``` sob o mesmo valor.

## Funções e o "pattern matching"
Por traz dos panos, as funções fazem *pattern match* nos seus argumentos.

```elixir
defmodule Greeter1 do
  def hello(%{name: person_name}) do
    IO.puts "Hello, " <> person_name
  end
end

iex> my_cat = %{name: "Nila", age: "16", favorite_hobby: "sleep"}
iex> Greeter1.hello my_cat
Hello, Nila

iex> no_name = %{age: "35", favorite_hobby: "coding"}
iex> Greeter1.hello no_name
** (FunctionClauseError) no function clause matching in Greeter1.hello/1

    The following arguments were given to Greeter1.hello/1:

        # 1
        %{age: "35", favorite_hobby: "coding"}

    iex:2: Greeter1.hello/1
```
**Curiosidade**: O operador ```<>``` é usado para concatenar strings.
{: .note-info }

Quando invocamos a função com ```my_cat = %{name: "Nila", age: "16", favorite_hobby: "sleep"}```
ela "olha" para a chave ```name:``` do *map* e ignora o resto. Como ```no_name = %{age: "35", favorite_hobby: "coding"}```
não têm essa chave obtemos o erro "*no function clause matching*".

Podemos também fazer *matching*s dentro da própria definição de argumento. No exemplo abaixo,
utiliza-se não apenas do valor da chave ```name:``` mas também o *map* inteiro passado, *printando*
com ```IO.inspect```.

```elixir
defmodule Greeter2 do
  def hello(%{name: person_name} = person) do
    IO.puts "Hello, " <> person_name
    IO.inspect person
  end
end

iex> my_cat = %{name: "Nila", age: "16", favorite_hobby: "sleep"}
iex> Greeter2.hello my_cat
Hello, Nila
%{age: "16", favorite_hobby: "sleep", name: "Nila"}

iex> just_my_name = %{name: "Eugenio"}
iex> Greeter2.hello just_my_name
Hello, Eugenio
%{name: "Eugenio"}
```

Mesmo a função ```Greeter2.hello/1``` tendo apenas um argumento, são disponibilizados para dentro
dela dois parâmetros, ou seja, duas variáveis. No exemplo com a entrada utilizada com sucesso,
temos:
 - ```person_name```, que recebe ```"Nila"```
 - ```person```, que recebe todo *map*, ```%{name: "Nila", age: "16", favorite_hobby: "sleep"}```

Importante ressaltar que, o *pattern matching* é feito para **ambos** os lados de ```=```, dentro da
definição do argumento, sob o valor de entrada da função. Isso fica provado quando invertemos a
ordem de ```%{name: person_name} = person``` para ```person = %{name: person_name}```, note que
continuamos a obter o **mesmo** resultado.

```elixir
defmodule Greeter3 do
  def hello(person = %{name: person_name}) do
    IO.puts "Hello, " <> person_name
    IO.inspect person
  end
end

iex> Greeter3.hello my_cat
Hello, Nila
%{age: "16", favorite_hobby: "sleep", name: "Nila"}
```

Resumindo, as funções fazem *pattern match* com os dados de entrada sob os seus argumentos de
maneira independente. Podemos usar isso para atribuir valores à variáveis separadas para dentro da
função.

## Não confunda com argumentos padrões
Tome cuidado é com a similaridade da escrita. No Ruby utilizamos ```=``` no argumento para definir
um valor padrão, tornado sua entrada opcional. Já no Elixir, como vimos, ```=``` vai além da
associação, para definir um argumento com um valor padrão, como no Ruby, utiliza-se ```\\```.

```elixir
defmodule Greeter4 do
  def hello(name, language_code \\ "en") do
    phrase(language_code) <> name
  end

  defp phrase("en"), do: "Hello, "
  defp phrase("pt"), do: "Olá, "
end

iex> Greeter4.hello "Eugenio"
"Hello, Eugenio"
iex> Greeter4.hello "Eugenio", "en"
"Hello, Eugenio"
iex> Greeter4.hello "Eugenio", "pt"
"Olá, Eugenio"
```
**Obs**: No exemplo, ```defp phrase``` é uma função privada e seu comportamento é o padrão: só pode
ser invocada internamente do seu escopo, ou seja, dentro de ```defmodule```.
{: .note-warning }

Por agora, é isso.

![Thumbsup - gif](https://c.tenor.com/DfgYj_VhPGcAAAAC/thumbsup-%D8%A7%D9%84%D8%A5%D8%A8%D9%87%D8%A7%D9%85.gif){: .align-start}
