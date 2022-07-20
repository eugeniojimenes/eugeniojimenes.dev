---
layout: post
title:  "Diário disléxico - Elixir: Aquele clássico apanhadão"
date:   2021-05-23 18:11:49 -0300
tags: Elixir
image: /assets/images/elixir-logo.webp
image_alt: "Elixir Logo"
description: >-
  Uma "rápida" síntese de mais alguns conceitos antes de ir para resolução de exercícios.
categories: blog

---

Antes de partir para a resolução de alguns exercícios, achei válido pontuar mais algumas
funcionalidades do Elixir em um "apanhadão". Neste post abordo sobre estruturas de controle,
funções e operador *Pipe*, além de rever um pouco mais sobre *pattern matching*.
<!-- excerpt-end -->

## Estruturas de Controle

**Obs**: Me senti bem idiota depois de escrever esta parte. No final das contas ficou bem próximo
ao tutorial oficial, disponível em <https://elixir-lang.org/getting-started/case-cond-and-if.html>{:target="_blank"}
e em <https://elixirschool.com/en/lessons/basics/control-structures/>{:target="_blank"}, exceto a
parte do ```with```, que dei uma atenção maior. Então sinta-se à vontade em pular para o próximo
tópico. Pelo menos me serviu pra fixar o conteúdo, que inclusive é o proposito disso aqui.
{: .note-warning }

Uma breve explicação das estruturas ```case```, ```cond```, ```if/else/unless```, ```with``` e
blocos com ```do/end```.

***case***
{: .notice--relative--primary}

Trata-se de um *switch-case*, no qual podemos simplificar múltiplos *if/else*. Quando uma condição
é satisfatória, seu resultado é devolvido e as demais condições do bloco não são averiguadas.
Repere que quando fazemos ```case``` com uma lista, **não** à percorremos item por item, mas
aplicamos cada condição nela inteira.

```elixir
case {1, 2, 3} do
  {1} ->
    "Esta condição não será correspondida."
  {1, 2, 3} ->
    "Esta condição será correspondida."
end
"Esta condição será correspondida."

case {1, 2, 3} do
  {2, 3, 4} ->
    "Esta condição não será correspondida."
  {1, x, 3} ->
    "Esta condição será correspondida e
    atribuirá 'x' à #{x}."
end
"Esta condição será correspondida e\n    atribuirá 'x' à 2."
```
**Obs**: Cuidado com o escopo, no segundo exemplo a variável ```x = 2``` é atribuída e
disponibilizada dentro da condição dela. Se, por exemplo, você fizer ```x = 7``` antes do ```case```,
depois dele verá que *x* ainda vale 7, ou seja, não é reescrito.
{: .note-warning }

Você pode usar o operador ```^``` antes de uma variável para fazer a condição sob ela. Para
definir uma condição *default*, que sempre será válida, basta utilizar ```_```.

```elixir
x = 1

case 2 do
  ^x -> "não irá corresponder."
  _ -> "irá corresponder."
end
"irá corresponder."
```
Note que ```_``` deve ser a última se não o ```case``` sempre cairá nela. Outro
detalhe é que se nenhuma condição for satisfeita é obtido o erro *CaseClauseError*.


```elixir
case 2 do
  _ -> "irá corresponder."
  ^x -> "Também corresponde, mas não chegará até aqui."
end
"irá corresponder."

case :fool do
  :smart -> "não irá corresponder."
end
** (CaseClauseError) no case clause matching: :fool
```

***cond***
{: .notice--relative--primary}

Parecido com o ```case```, mas atende a necessidade de checar múltiplos valores ou condições para
além de igualdade.

```elixir
cond do
  1 + 1 == 3 ->
   "é falso."
  2 - 1  == 3 ->
   "também é falso."
  1 + 2 == 3 ->
   "é verdadeiro."
end
"é verdadeiro."
```

Importante pontuar que tudo para além de ```nil``` e ```false``` é considerado verdadeiro.

```elixir
iex>  hd(["a", "b", "c"])
"a"

cond do
  hd(["a", "b", "c"]) ->
    "'a' é considerado como verdadeiro."
end
"'a' é considerado como verdadeiro."
```

***if*** e ***unless***
{: .notice--relative--primary}

Nada de novo, são basicamente iguais a maioria das linguagens. Ambos aceitam o bloco ```else```
e ```unless``` checa o inverso de ```if```. Lembrando, novamente, que tudo para além de ```nil```
e ```false``` é considerado verdadeiro.

```elixir
iex> if true do
...>   "isto será devolvido!"
...> end
"isto será devolvido!"

iex> unless true do
...>   "isto nunca será devolvido!"
...> end
nil

iex> if nil do
...>   "isto não será devolvido."
...> else
...>   "mas isto será."
...> end
"mas isto será."

iex> unless 1 do
...>   "isto não será devolvido, '1' é considerado true."
...> else
...>   "mas isto será."
...> end
"mas isto será."
```

Blocos ***do***/***end***
{: .notice--relative--primary}

Provavelmente você já deve ter notado que funções e estruturas de controle são delimitadas por
 ```do``` e ```end```. Nada de novo também, mas vale pontuar que é possível simplificar esse blocos
em uma linha:

```elixir
iex> if true, do: 1 + 2
3

iex> if false, do: :this, else: :that
:that
```

***with***
{: .notice--relative--primary}

Introduzido na versão 1.2 do Elixir, a estrutura ```with``` permite simplificar o código,
substituído, por exemplo, clausulas aninhadas de ```case```.

```elixir
full_name = %{first: "Nila", last: "Minha gatatinha idosa"}

with {:ok, first} <- Map.fetch(full_name, :first),
  {:ok, last} <- Map.fetch(full_name, :last),
  do: last <> ", " <> first
"Minha gatatinha idosa, Nila"

only_first = %{first: "Nila"}

with {:ok, first} <- Map.fetch(only_first, :first),
  {:ok, last} <- Map.fetch(only_first, :last),
  do: last <> ", " <> first
:error
```

Primeiro, vamos entender precisamente este exemplo. O que faz a função ```fetch/2``` do módulo
 ```Map```? Ela "pega" o valor de uma chave de um *map*:

```elixir
iex> m = %{a: 1, b: 3, c: 5}
iex> Map.fetch(m, :a)
{:ok, 1}
iex> Map.fetch(m, :b)
{:ok, 3}
iex> Map.fetch(m, :d)
:error
```

Note que seu retorno não é apenas o valor, mas uma *tuple* com o *atom* ```:ok``` mais o valor da
chave requisitada. Repare ainda que ao não encontrar devolve ```:error``` **sozinho**.

Para fazer o equivalente com ```case```, perceba como aumenta a verbosidade do código:

```elixir
full_name = %{first: "Nila", last: "Minha gatatinha idosa"}

case Map.fetch(full_name, :first) do
  {:ok, first} ->
    case Map.fetch(full_name, :last) do
      {:ok, last} -> last <> ", " <> first
      :error -> :error # retorna o atom :error
    end
  :error -> :error # retorna o atom :error
end
"Minha gatatinha idosa, Nila"

only_first = %{first: "Nila"}

case Map.fetch(only_first, :first) do
  {:ok, first} ->
    case Map.fetch(only_first, :last) do
      {:ok, last} -> last <> ", " <> first
      :error -> :error # retorna o atom :error
    end
  :error -> :error # retorna o atom :error
end
:error
```
<div class="note-warning">
 <p><strong>Obs</strong>: Note como a direção das flechas apontam a "direção de partida" da execução e, consequentemente, leitura do código:</p>
  <ul>
    <li>Quando temos <code class="language-plaintext highlighter-rouge">-></code> em <code class="language-plaintext highlighter-rouge">case</code>, significa que se o conteúdo <strong>à esquerda</strong> da flecha der <em>match</em> com o argumento do <code class="language-plaintext highlighter-rouge">case</code>, executamos então o que segue a direita dela.</li>
    <li>Quando temos <code class="language-plaintext highlighter-rouge"><-</code> em <code class="language-plaintext highlighter-rouge">with</code>, significa que se o conteúdo <strong>à direita</strong> da flecha der <em>match</em> com o da esquerda, executamos então o bloco <code class="language-plaintext highlighter-rouge">do</code>.</li>
    </ul>
</div>

Para esclarecer um pouco mais este poder de síntese com ```with```, vamos para outro exemplo.
Suponha o seguinte trecho de código encontrado em um projeto Elixir:

```elixir
case Repo.insert(changeset) do
  {:ok, user} ->
    case Guardian.encode_and_sign(user, :token, claims) do
      {:ok, token, full_claims} ->
        important_stuff(token, full_claims)

      error ->
        error
    end

  error ->
    error
end
```

Mesmo não sabendo o comportamento, e muito menos como foi implementado, algumas das chamadas feitas
neste trecho, podemos interpretar que:
- No primeiro ```case```, se ```Repo.insert(changeset)``` retornar um ```{:ok, user}``` entramos
  no segundo ```case```, caso contrário obtemos um erro.
- Já no segundo ```case```, se ```Guardian.encode_and_sign(user, :token, claims)``` retornar um
 ```{:ok, token, full_claims}``` então a chamada de ```important_stuff(token, full_claims)``` é
 feita, caso contrário obtemos o mesmo erro anterior.

Note como podemos simplificar, utilizando menos linhas, mas mantendo a lógica e até aumentando a
legibilidade.

```elixir
with {:ok, user} <- Repo.insert(changeset),
     {:ok, token, full_claims} <- Guardian.encode_and_sign(user, :token, claims) do
  important_stuff(token, full_claims)
end
```

***with*** com **else**
{: .notice--relative--primary}

A partir da versão 1.3, ```with/1``` também suporta ```else```. Vejamos primeiro um exemplo com
 ```with``` direto (não aninhado):

```elixir
full_name = %{first: "Nila", last: "Minha gatatinha idosa"}

with {:ok, first} <- Map.fetch(full_name, :first) do
  "O primeiro nome é '#{first}'"
else
  :error -> "Erro! Não há a chave ':first'"
end
"O primeiro nome é 'Nila'"

only_last = %{last: "Minha gatatinha idosa"}

with {:ok, first} <- Map.fetch(only_last, :first) do
  "O primeiro nome é '#{first}'"
else
  :error -> "Erro! Não há a chave ':first'"
end
"Erro! Não há a chave ':first'"
```

Agora refazendo o primeiro exemplo, aninhado com dois *match*s, temos:

```elixir
full_name = %{first: "Nila", last: "Minha gatatinha idosa"}

with {:ok, first} <- Map.fetch(full_name, :first),
  {:ok, last} <- Map.fetch(full_name, :last) do
    last <> ", " <> first
  else
    :error -> "Erro! precisa ter as chaves 'first' e 'last'"
end
"Minha gatatinha idosa, Nila"

only_first = %{first: "Nila"}

with {:ok, first} <- Map.fetch(only_first, :first),
  {:ok, last} <- Map.fetch(only_first, :last) do
    last <> ", " <> first
  else
    :error -> "Erro! precisa ter as chaves 'first' e 'last'"
end
"Erro! precisa ter as chaves 'first' e 'last'"

only_last = %{last: "Minha gatatinha idosa"}

with {:ok, first} <- Map.fetch(only_last, :first),
  {:ok, last} <- Map.fetch(only_last, :last) do
    last <> ", " <> first
  else
    :error -> "Erro! precisa ter as chaves 'first' e 'last'"
end
"Erro! precisa ter as chaves 'first' e 'last'"
```

Como ```Map.fetch``` é chamado em ambos os *match*s, o bloco de ```else``` precisa lidar apenas
com um único caso de negativa - quando ```Map.fetch``` retorna ```:error```. Como lidar então com
múltiplos casos de negativa?

```elixir
defmodule Fool do
  import Integer

  def check_even_on_map(m, key) do
    with {:ok, number} <- Map.fetch(m, key),
      true <- is_even(number) do
        "é par"
    else
      :error ->
        "Valor não encontrado no map"
      false ->
        "é impar"
    end
  end
end

iex> my_map = %{a: 2, b: 3}
iex> Fool.check_even_on_map(my_map, :a)
"é par"
iex> Fool.check_even_on_map(my_map, :b)
"é impar"
iex> Fool.check_even_on_map(my_map, :c)
"Valor não encontrado no map"
```

Temos um ```with``` com dois casos distintos de negativa tratados pelo bloco ```else```:
- Com ```Map.fetch```, que retorna ```:error```
- Com ```is_even/1```, do módulo ```Integer``` importado, que retorna ```false```.

## Funções

Síntese sobre função anonima, função nomeada e *pattern matching* em funções.

**Funções Anonimas**
{: .notice--relative--primary}

![I'm Anonymous - gif](https://c.tenor.com/OKpsYunjQx0AAAAd/imanonymous-anonymous.gif){: .align-center}

Definidas entre os termos ```fn``` e ```end```, funções anonimas podem ter qualquer número de
argumentos e múltiplos blocos de execução separados com ```->```, sendo à esquerda da flecha os
argumentos de um bloco e a direita o bloco desses argumentos.

```elixir
iex> sum = fn (a, b) -> a + b end
iex> sum.(3, 7)
10
iex> sum.(3, -1)
2

iex> multi = fn (a, b) -> a * b end
iex> multi.(3, 2)
6
iex> multi.(-3, 3)
-9
```

Existem ainda uma abreviação com uso de ```&1```, ```&2```, ```&3``` etc, para os argumentos da
função anonima.


```elixir
iex> sum = &(&1 + &2)
iex> sum.(7, 7)
14

iex> triple_concat = &(&1 <> &2 <> &3)
iex> triple_concat.("Olá", ", ", "mundo")
"Olá, mundo"
```


**Pattern Matching** em **Funções Anonimas**
{: .notice--relative--primary}

Justamente para utilizar múltiplos blocos de execução, ou seja, fazer diferentes execuções,
utilizamos *pattern matching* sob os argumentos de uma função anonima.

```elixir
handle_result = fn
  {:ok, result} -> "Sucesso! mensagem: #{result}"
  {:error} -> "Erro! Consulte o administrador"
end

iex> handle_result.({:ok, :uploaded})
"Sucesso! mensagem: uploaded"

iex> handle_result.({:error})
"Erro! Consulte o administrador"
```

Isso pode ser ainda mais estendido com cláusulas *guard* através do termo ```when```.

```elixir
handle_result = fn
  {:ok, result} when is_nil(result) ->
    "Sucesso! Sem resposta do servidor"
  {:ok, result} when is_number(result) ->
    "Sucesso! código: #{result}"
  {:ok, result} ->
    "Sucesso! mensagem: #{result}"
  {:error} ->
    "Erro! Consulte o administrador"
end

iex> handle_result.({:ok, nil})
"Sucesso! Sem resposta do servidor"
iex> handle_result.({:ok, 2345})
"Sucesso! código: 2345"
iex> handle_result.({:ok, :logout})
"Sucesso! mensagem: logout"
iex> handle_result.({:error})
"Erro! Consulte o administrador"
```

Um cuidado que se dever ter com *guard*s é que caso tenha um bloco com um conjunto de argumentos
direto, sem *guard*, os blocos com este mesmo conjunto de argumentos que tenham *guards* **devem**
vir antes do primeiro. Por exemplo, se no trecho anterior, o bloco
 ```{:ok, result} -> "Sucesso! mensagem: #{result}"``` fosse o primeiro, note que os blocos
 seguintes são ignorados.

```elixir
bad_handle = fn
  {:ok, result} ->
    "Sucesso! mensagem: #{result}"
  {:ok, result} when is_nil(result) ->
    "Sucesso! Sem resposta do servidor"
  {:ok, result} when is_number(result) ->
    "Sucesso! código: #{result}"
  {:error} ->
    "Erro! Consulte o administrador"
end

iex> bad_handle.({:ok, nil})
"Sucesso! mensagem: "
iex> bad_handle.({:ok, 2345})
"Sucesso! mensagem: 2345"
iex> bad_handle.({:ok, :logout})
"Sucesso! mensagem: logout"
```

**Funções Nomeadas**
{: .notice--relative--primary}

Como já vimos, funções nomeadas são definidas com o termo ```def``` dentro de um módulo. Seu bloco
é delimitado por ```do/end```, com a possibilidade de abreviação em uma linha com ```do:```.

```elixir
defmodule Greeter do
  def hello(name) do
    "Hello, " <> name
  end

  def same_hello(name), do: "Hello, " <> name
end

iex> Greeter.hello("Nila")
"Hello, Nila"
iex> Greeter.same_hello("Nila")
"Hello, Nila"
```

Lembrando também, que as funções são distinguidas pelo Elixir por seu nome + aridade (quantidade de
argumentos).

```elixir
defmodule Greeter2 do
  def hello(), do: "Olá desconhecido"           # hello/0
  def hello(name), do: "Olá, " <> name          # hello/1
  def hello(n1, n2), do: "Olá, #{n1} e #{n2}"   # hello/2
end
```

**Pattern Matching** em **Funções Nomeadas**
{: .notice--relative--primary}

Dado último post,
[Preciso falar sobre "Pattern Matching"]({% post_url 2021-05-14-diario-dislexico-elixir-pattern-matching %}){:target="_blank"},
vamos complicar um pouco somando *pattern matching* e recursão.


```elixir
defmodule Length do
  def of([]), do: 0
  def of([_ | tail]), do: 1 + of(tail)
end

iex> Length.of []
0
iex> Length.of [1]
1
iex> Length.of [1, 2]
2
iex> Length.of [1, 2, 3]
3
iex> Length.of [1, 2, 3, 4]
4
```

O laço de recursão de ```of``` gira em torno do *pattern matching*. Temos que se o argumento:
- for ```[]```, encerra o laço e devolve o valor 0.
- tiver uma calda, soma-se 1 com ```of``` da calda do argumento (segue o laço)

Por isso ```Length.of/1``` devolve o tamanho da lista.
Note ainda que o *pattern matching* não esta apenas na primeira parte, em que ```[]``` é checado,
mas como também esta na segunda parte, em que ```tail``` é associado a calda do parâmetro. É
possível fazer a mesma recursão, substituído o segundo *match* pelo método ```tl/1```.

```elixir
defmodule Length do
  def of([]), do: 0
  def of(list), do: 1 + of(tl(list))
end
```

Da mesma forma como vimos anteriormente com funções anonimas, também podemos usar *guard*s.

```elixir
defmodule Length do
  def of([]), do: 0
  def of([_ | tail]), do: 1 + of(tail)
  def of(not_a_list) when not is_list(not_a_list) do
    "Erro! O argumento precisa ser uma lista"
  end
end

iex> Length.of "ops!"
"Erro! O argumento precisa ser uma lista"
iex> Length.of [3, 4, 5]
3
```

Importante relembrar que o *pattern matching* é feito para **ambos** os lados de ```=```, dentro da
definição do argumento

```elixir
defmodule Greeter do
  def hello(%{name: person_name} = person) do
    IO.puts "Olá, #{person_name}"
    IO.inspect person
  end

  def hello(%{first: first_name} = %{last: last_name} = person) do
    IO.puts "Olá, #{first_name} #{last_name}"
    IO.inspect person
  end
end

iex> my_cat = %{name: "Nila", age: "16", favorite_hobby: "sleep"}
iex> Greeter.hello my_cat
Olá, Nila
%{age: "16", favorite_hobby: "sleep", name: "Nila"}

iex> my_self = %{first: "Eugenio Augusto", last: "Jimenes", age: "16", favorite_hobby: "sleep"}
iex> Greeter.hello my_self
Olá, Eugenio Augusto Jimenes
%{age: "16", favorite_hobby: "sleep", first: "Eugenio Augusto", last: "Jimenes"}
```

## Operador *Pipe*

Representado por ```|>```, ele passa o resultado da expressão à sua esquerda para "o que vier" à
sua direita.

```elixir
iex> "Minha gata é velhinha" |> String.split()
["Minha", "gata", "é", "velhinha"]
iex> "Minha gata é velhinha" |> String.upcase() |> String.split()
["MINHA", "GATA", "É", "VELHINHA"]
```

Quando lidamos com funções que possuem mais de um argumento o resultado que vem do *pipe* (à
esquerda) entrará sempre como o primeiro parâmetro (à direita). Por exemplo, a própria função
 ```String.split``` possui um segundo argumento opcional.

```elixir
 iex> "Minha_gata_é_velhinha" |> String.split("_")
["Minha", "gata", "é", "velhinha"]
```

Note que **sempre** entrará como primeiro parâmetro.

```elixir
iex> "_" |> String.split("Minha_gata_é_velhinha")
["_"]

iex> String.split("_", "Minha_gata_é_velhinha")
["_"]

iex> String.split("Minha_gata_é_velhinha", "_")
["Minha", "gata", "é", "velhinha"]
```

Esse operador é extremamente presente nos códigos em Elixir. Com ele é possível escrever lógicas
consecutivas, logo sucintas e de fácil leitura.

```elixir
defmodule Greeter do
  def hello(names) when is_list(names) do
    names
    |> Enum.join(", ")
    |> hello
  end

  def hello(name) when is_binary(name) do
    phrase() <> name
  end

  defp phrase, do: "Olá, "
end

iex> Greeter.hello "Eugenio"
"Olá, Eugenio"

iex> Greeter.hello ["Eugenio", "Lucas", "Tomaz"]
"Olá, Eugenio, Lucas, Tomaz"
```

Por agora, é isso.

![done so done - gif](https://c.tenor.com/uTjqYsH_j-YAAAAd/done-so-done.gif){: .align-center}
