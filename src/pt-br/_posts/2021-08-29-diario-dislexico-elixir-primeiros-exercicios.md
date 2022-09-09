---
layout: post
title:  "Diário disléxico - Elixir: Os primeiros exercícios"
date:   2021-08-29 21:49:12 -0300
locale: pt_BR
lang-ref: learning-elixir-first-exercises
tags: Elixir
image: /assets/images/elixir-logo.webp
image_alt: "Elixir Logo"
description: >-
  Sobre os primeiros exercícios de Elixir do exercism.io
categories: blog

---

Volto aqui para falar um pouco sobre o que eu aprendi com os exercícios básicos e iniciantes do
<https://exercism.io>{:target="_blank"} sobre Elixir. Abaixo segue o que eu resolvi da trilha até
agora e o que eu aprendi/utilizei em cada.
<!-- excerpt-end -->
- **Word Count**: *Pipe*, `String.split` e *regex*
- **RNA Transcription**: *map*, `Enum.map` e *codepoint* de um caractere
- **Nucleotide Count**: *map*, `Enum.reduce` e *codepoint* de um caractere
- **Accumulate**: Múltipla definição de funções (nome + aridade) e recursão
- **Secret Handshake**: *Bitwise* e `Enum.reduce`
- **Roman Numerals**: Recursão e argumento opcional
- **Beer Song**: *case*, argumento opcional e `Enum.map_join`
- **Bob**: *Regex* com `String.match?` vs funções auxiliares como `String.trim`,
`String.downcase` e `String.ends_with?`

![Gim Gimnasio - gif](https://c.tenor.com/Q7qPxkgvueAAAAAd/gim-gimnasio.gif){: .align-center .img-increase }

## Word Count
O enunciado pode ser obtido [aqui](https://exercism.org/tracks/elixir/exercises/word-count){:target="_blank"}.
{: .note-info }

Exercício simples, perfeito para aplicar a estrutura *pipe* sem muita dificuldade. Entendi melhor
o uso de `String.split` que possui um terceiro argumento opcional, com `trim: true` strings vazias
são excluídas da lista resultante.

Solução:
```elixir
defmodule WordCount do
  @doc """
  Count the number of words in the sentence.
  Words are compared case-insensitively.
  """
  @spec count(String.t()) :: map
  def count(sentence) do
    String.downcase(sentence)
    |> String.split(~r/[^[:alnum:]-]/u, trim: true)
    |> Enum.frequencies
  end
end
```

## RNA Transcription

O enunciado pode ser obtido [aqui](https://exercism.org/tracks/elixir/exercises/rna-transcription){:target="_blank"}.
{: .note-info }

Aprendi que `?` + `caractere` devolve o seu *codepoint*, além disso podemos usar o acesso de um
*map* como função com uso de `&`, ou seja, a consulta do valor de uma chave de um *map* pode ser
tratada como função, no caso através de `&(@dna_to_rna[&1])`.

Solução:
```elixir
defmodule RnaTranscription do
  @doc """
  Transcribes a character list representing DNA nucleotides to RNA

  ## Examples

  iex> RnaTranscription.to_rna('ACTG')
  'UGAC'
  """
  @dna_to_rna %{
    ?G => ?C,
    ?C => ?G,
    ?T => ?A,
    ?A => ?U
  }

  @spec to_rna([char]) :: [char]
  def to_rna(dna) do
    Enum.map(dna, &(@dna_to_rna[&1]))
  end
end
```

## Nucleotide Count

O enunciado pode ser obtido [aqui](https://exercism.org/tracks/elixir/exercises/nucleotide-count){:target="_blank"}.
{: .note-info }

Além de reaplicar os conceitos de *codepoint* e *map* do problema anterior, foi possível verificar
como `Enum.reduce` pode trazer uma solução de melhor performance.

Solução:
```elixir
defmodule NucleotideCount do
  @nucleotides [?A, ?C, ?G, ?T]

  @doc """
  Counts individual nucleotides in a DNA strand.

  ## Examples

  iex> NucleotideCount.count('AATAA', ?A)
  4

  iex> NucleotideCount.count('AATAA', ?T)
  1
  """
  @spec count(charlist(), char()) :: non_neg_integer()
  def count(strand, nucleotide) do
    Enum.count(strand, fn char -> char == nucleotide end )
  end

  @doc """
  Returns a summary of counts by nucleotide.

  ## Examples

  iex> NucleotideCount.histogram('AATAA')
  %{?A => 4, ?T => 1, ?C => 0, ?G => 0}
  """
  @spec histogram(charlist()) :: map()
  def histogram(strand) do
    ## Solution 1:
    # Map.new(@nucleotides, fn key -> {key, count(strand, key)} end)

    ## Solution 2:
    result = Map.new(@nucleotides, &{&1, 0})
    Enum.reduce(
      strand,
      result,
      fn (char, acc) ->
        Map.update!(acc, char, &(&1 + 1))
      end
    )
  end
end
```

## Accumulate

O enunciado pode ser obtido [aqui](https://exercism.org/tracks/elixir/exercises/accumulate){:target="_blank"}.
{: .note-info }

Gostei bastante deste exercício. Mesmo tendo uma solução aparentemente direta e simples, pude
compreender o ganho que temos com a múltipla definição de funções, já que o Elixir distingue cada
função pelo seu nome + aridade. O uso de recursão torna-se ainda mais empírica, por mais que seja
algo já esperado de uma linguagem funcional. Não posso também deixar de comentar como o uso do
recurso `[ head | tail ]` é bonito demais!

Solução:
```elixir
defmodule Accumulate do
  @doc """
    Given a list and a function, apply the function to each list item and
    replace it with the function's return value.

    Returns a list.

    ## Examples

      iex> Accumulate.accumulate([], fn(x) -> x * 2 end)
      []

      iex> Accumulate.accumulate([1, 2, 3], fn(x) -> x * 2 end)
      [2, 4, 6]

  """

  @spec accumulate(list, (any -> any)) :: list
  def accumulate([], _), do: []
  def accumulate([h | t], fun), do: [fun.(h) | accumulate(t, fun)]
end
```

## Secret Handshake

O enunciado pode ser obtido [aqui](https://exercism.org/tracks/elixir/exercises/secret-handshake){:target="_blank"}.
{: .note-info }

Foi ótimo para relembrar os conceitos de
[Lógica binária](https://pt.wikipedia.org/wiki/L%C3%B3gica_bin%C3%A1ria){:target="_blank"}. Com a
linha `use Bitwise, only_operators: true` temos acesso a todos os operadores de lógica binária, por
mais que este exercício trabalhe apenas como AND, representado por `&&&`.

Solução:
```elixir
defmodule SecretHandshake do
  use Bitwise, only_operators: true

  @doc """
  Determine the actions of a secret handshake based on the binary
  representation of the given `code`.

  If the following bits are set, include the corresponding action in your list
  of commands, in order from lowest to highest.

  1 = wink
  10 = double blink
  100 = close your eyes
  1000 = jump

  10000 = Reverse the order of the operations in the secret handshake
  """
  @binary_to_handshake %{
    1 => "wink",
    2 => "double blink",
    4 => "close your eyes",
    8 => "jump"
  }
  @spec commands(code :: integer) :: list(String.t())
  def commands(code) do
    result = Enum.reduce(@binary_to_handshake, [], fn {command, action}, acc ->
      if (code &&& command) != 0, do: acc ++ [action], else: acc
    end)

    if (code &&& 16) != 0, do: Enum.reverse(result), else: result
  end
end
```

**OBS**: Caso ainda o uso de `Enum.reduce/3` esteja confuso para você, recomendo muito a leitura
[disso](https://inquisitivedeveloper.com/lwm-elixir-31/#enumreduce3){:target="_blank"} para além do
que explica na [documentação oficial](https://hexdocs.pm/elixir/1.12/Enum.html#reduce/3){:target="_blank"}
{: .note-warning }

## Roman Numerals

O enunciado pode ser obtido [aqui](https://exercism.org/tracks/elixir/exercises/roman-numerals){:target="_blank"}.
{: .note-info }

O divertido mesmo foi descobrir que números romanos possuem uma lógica recursiva de tradução da
base decimal. Acabei fazendo duas soluções: uma "manual" e outra recursiva (confesso que vi a
segunda solução bem depois).

Solução:
```elixir
defmodule RomanNumerals do
  @doc """
  Convert the number to a roman number.
  """

  @base_latters %{
    1 => "I",
    5 => "V",
    10 => "X",
    50 => "L",
    100 => "C",
    500 => "D",
    1000 => "M"
  }
  @spec numeral(pos_integer) :: String.t()
  def numeral(number, recursive_opt \\ true) do
    if recursive_opt, do: recursive_solution(number), else: manual_solution(number)
  end

  defp recursive_solution(number) do
    cond do
      number >= 1000 -> "M" <> recursive_solution(number - 1000)
      number >= 900 -> "CM" <> recursive_solution(number - 900)
      number >= 500 -> "D" <> recursive_solution(number - 500)
      number >= 400 -> "CD" <> recursive_solution(number - 400)
      number >= 100 -> "C" <> recursive_solution(number - 100)
      number >= 90 -> "XC" <> recursive_solution(number - 90)
      number >= 50 -> "L" <> recursive_solution(number - 50)
      number >= 40 -> "XL" <> recursive_solution(number - 40)
      number >= 10 -> "X" <> recursive_solution(number - 10)
      number >= 9 -> "IX" <> recursive_solution(number - 9)
      number >= 5 -> "V" <> recursive_solution(number - 5)
      number >= 4 -> "IV" <> recursive_solution(number - 4)
      number >= 1 -> "I" <> recursive_solution(number - 1)
      true -> ""
    end
  end

  defp manual_solution(number) do
    list = Integer.digits(number)
    size = length(list)
    Enum.with_index(list)
    |> Enum.reduce("", fn {num, idx}, acc ->
      acc <> composed(num, Integer.pow(10, size - idx - 1))
    end)
  end

  defp composed(num, base) do
    cond do
      num <= 3 ->
        String.duplicate(@base_latters[base], num)
      num < 5 ->
        String.duplicate(@base_latters[base], 5 - num) <> @base_latters[5 * base]
      num == 5 ->
        @base_latters[5 * base]
      num < 9 ->
        @base_latters[5 * base] <> String.duplicate(@base_latters[base], num - 5)
      true -> # num == 9
         @base_latters[base] <> @base_latters[10 * base]
    end
  end
end
```

## Beer Song

O enunciado pode ser obtido [aqui](https://exercism.org/tracks/elixir/exercises/beer-song){:target="_blank"}.
{: .note-info }

Nada muito sofisticado, apenas te "empurra" a conhecer/utilizar `Enum.map_join` e de beber umas com
os amigos (te odeio Covid).

Solução:
```elixir
defmodule BeerSong do
  @doc """
  Get a single verse of the beer song
  """
  @spec verse(integer) :: String.t()
  def verse(number) do
    case number do
      0 ->
        """
        No more bottles of beer on the wall, no more bottles of beer.
        Go to the store and buy some more, 99 bottles of beer on the wall.
        """
      1 ->
        """
        1 bottle of beer on the wall, 1 bottle of beer.
        Take it down and pass it around, no more bottles of beer on the wall.
        """
      2 ->
        """
        2 bottles of beer on the wall, 2 bottles of beer.
        Take one down and pass it around, 1 bottle of beer on the wall.
        """
      _ ->
        """
        #{number} bottles of beer on the wall, #{number} bottles of beer.
        Take one down and pass it around, #{number - 1} bottles of beer on the wall.
        """
    end
  end

  @doc """
  Get the entire beer song for a given range of numbers of bottles.
  """
  @spec lyrics(Range.t()) :: String.t()
  def lyrics(range \\ 99..0) do
    Enum.map_join(range, "\n", &verse/1)
  end
end
```

## Bob

O enunciado pode ser obtido [aqui](https://exercism.org/tracks/elixir/exercises/bob){:target="_blank"}.
{: .note-info }

Confesso que dei umas coladinhas em outras soluções para fazer este exercício. Sempre tive uma
preguiça monumental de apreender profundamente *regex*, no final das contas pode ser solucionado com
outras funções do modulo `String`.

Solução:
```elixir
defmodule Bob do

  # Bob answers 'Sure.' if you ask him a question.

  # He answers 'Whoa, chill out!' if you yell at him.

  # He answers 'Calm down, I know what I'm doing!' if you yell a question at him.
  # He says 'Fine. Be that way!' if you address him without actually saying
  # anything.

  # He answers 'Whatever.' to anything else.
  def hey(input) do
    trim = String.trim input
    cond do
      trim == "" ->
        "Fine. Be that way!"
      trim == String.upcase(trim) and trim != String.downcase(trim) ->
        if String.ends_with?(trim, "?"), do: "Calm down, I know what I'm doing!", else: "Whoa, chill out!"
      String.ends_with?(trim, "?") ->
        "Sure."
      true ->
        "Whatever."
    end
  end
end
```

## Meu aprendizado com Elixir e a trilha do exercism.io

Fiquei encantado com a plataforma. Os exercícios são muito bem feitos e os instrutores que revisam,
corrigem ou aprovam sua solução, foram todos muito legais. É a polemica pedagogia do "se vira" -
você se vê ali com um problema e precisa correr atrás para desenvolver uma resposta que muitas
vezes não será otimizada e/ou 100% correta.

Tenho outras demandas de estudo, não sei quando vou conseguir voltar a mexer, mas pretendo
continuar essa trilha até o final. Todas as minhas soluções e avanços mantenho no repositório
<https://github.com/callmarx/aprendendo_elixir>{:target="_blank"}.

Por agora, é isso.
![cat ignore and gotta sleep - gif](https://c.tenor.com/ZIXvD3e9dt4AAAAS/cat-ignore.gif){: .align-start .img-increase }
