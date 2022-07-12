---
layout: post
title:  "Busca em texto otimizada com a Gem pg_search - Parte I"
date:   2021-01-17 22:58:53 -0300
tags: Ruby Rails Optimization PostgreSQL Config
image: /assets/images/text-search.webp
image_alt: "Magnifying glass on a text"
description: >-
  Destrinchando a funcionalidade “Full Text Searching" do PostgreSQL com a Gem pg_search
  em uma aplicação Ruby on Rails - Parte I
categories: blog
header:
  og_image: assets/posts/text-search.webp

---

Naufragando pela internet me deparei com a [Gem PgSearch](https://github.com/Casecommons/pg_search){:target="_blank"}
que tira proveito das funcionalidades de
[Full Text Searching do PostgreSQL](https://www.postgresql.org/docs/current/textsearch-intro.html){:target="_blank"}.
O conceito [Full Text Searching](https://en.wikipedia.org/wiki/Full-text_search){:target="_blank"}
refere a técnicas e estrateǵias computacionais para otimizar a pesquisa de palavras, e até frases,
em longos e múltiplos textos armazenados em bancos de dados. Trata-se de uma ampla área de estudo
e pesquisa dentro da Ciências da Computação, desde de 1990.
<!-- excerpt-end -->

Mas confesso: tenho preconceitos com NoSQL.

A proposta do banco de dados relacional é bem intuitiva, como diz na
[wikipédia brazuca](https://pt.wikipedia.org/wiki/Banco_de_dados_relacional){:target="_blank"}:
> é um banco de dados que modela os dados de uma forma que eles sejam percebidos pelo usuário
> como tabelas, ou mais formalmente relações

Na democracia das planilhas de excel gigantes, abstrair o conceito de tabelas é bem complicado.
Quando traduzimos a lógica de negócio a uma aplicação, atender as demandas de uma empresa, por
exemplo, entidades como usuário, produto, conta, perfil etc são intuitivamente aplicadas como
classes dentro de uma programação orientada à objetos e, mais comumente armazenadas como tabelas.
Afinal, quando falamos de PostgreSQL, MySQL ou SejaláoqueforSQL, estamos tratando de um
[sistema gerenciador de banco de dados objeto-relacional (SGBD)](https://pt.wikipedia.org/wiki/Sistema_de_gerenciamento_de_banco_de_dados){:target="_blank"}.
Objeto-relacional, né?! Mas vamos ao que interessa, apesar de encher meu coração tecer ~~meu ódio
à modinha~~ meus receios à NoSQL. Meu foco aqui será mais sobre o uso e vantagens dessa Gem.


## PostgreSQL, seu lindo!

![PostgreSQL, seu lindo!](/assets/images/elephants-love.webp){: .align-left}

Fanboy que sou desse SGBD, qualquer desculpa é válida para estudar e aproveitar ainda mais essa
poderosa ferramenta. Vamos então explorar as funcionalidades que ele nos oferece para *Full Text
Searching*.

Os códigos a seguir foram executados em um Docker de PostgreSQL, para fazer o mesmo utilize os
seguintes comandos:

```bash
$ docker run --rm --name testing-textsearch -p 5432:5432 \
-e POSTGRES_USER=test -e POSTGRES_PASSWORD=test \
-e POSTGRES_DB=textsearchdb \
-d postgres:latest

$ docker exec -it testing-textsearch psql -d textsearchdb -U test
```

Você deve obter o terminal psql com algo como:

```sql
psql (13.1 (Debian 13.1-1.pgdg100+1))
Type "help" for help.

textsearchdb=#
```

Vamos começar com a função ts_vector

```sql
textsearchdb=# SELECT to_tsvector('english', 'Life is like riding a bicycle.
To keep your balance, you must keep moving.');
                                    to_tsvector
-----------------------------------------------------------------------------------
 'balanc':10 'bicycl':6 'keep':8,13 'life':1 'like':3 'move':14 'must':12 'ride':4
(1 row)
```

Temos o texto “*Life is like riding a bicycle. To keep your balance, you must keep moving*”,
normalmente referido como *document* dentro da área de *Full Text Searching*. Esse documento é
analisado e convertido em um tipo de dados especial chamado de *tsvector*, que é basicamente
[lexemas](https://radames.manosso.nom.br/linguagem/gramatica/morfologia/lexema/){:target="_blank"},
palavras-chave normalizadas contidas no documento. No caso, usamos o dicionário do idioma inglês
para normalizar as palavras, minimizando-as em sua raiz. Por isso a palavra “*balance*” foi
reduzida à “*balanc*”, “*riding*” à “*ride*”, “*moving*” à “*move*” etc. A numeração ao lado de
cada lexema é a sua posição no texto (documento), termos e palavras muito comuns como ‘*is*’,
‘*to*’, ‘*you*’ etc, são removidos para reduzir o tamanho dos dados e a chance de falsos positivos.

Para verificar se uma ou mais palavras existem dentro de um documento utilizamos a função
```to_tsquery```. Da mesma forma que ```to_tsvector```, ela também normaliza o que será buscando
antes de fazer a busca.

```sql
textsearchdb=# SELECT to_tsquery('english', 'keep & moves');
   to_tsquery
-----------------
 'keep' & 'move'
(1 row)
```

Com o operador ```@@``` podemos verificar se um ```tsquery``` esta presente em um ```tsvector```,
ou melhor dizendo, se uma palavra (ou mais com operadores booleanos ```|``` e ```&```) normalizada
encontra-se em um documento.

```sql
textsearchdb=# SELECT
  to_tsvector('english', 'Life is like riding a bicycle.
    To keep your balance, you must keep moving.') @@
  to_tsquery('english', 'keep & moves');
 ?column?
----------
 t
(1 row)

textsearchdb=# SELECT
  to_tsvector('english', 'Life is like riding a bicycle.
    To keep your balance, you must keep moving.') @@
  to_tsquery('english', 'unpresent');
 ?column?
----------
 f
(1 row)
```

**Obs:** As letras ‘t’ e ‘f’ aqui significam, respectivamente, à *true* e *false*.
{: .note-info }

Com a função ```ts_rank``` podemos classificar os resultados da busca, podendo ordenar da mais alta
para a mais baixa quando buscamos um termo em múltiplos documentos.

```sql
textsearchdb=# SELECT
  ts_rank(
    to_tsvector('english', '
      Life is like riding a bicycle. To keep your balance, you must
      keep moving.
    '),
    to_tsquery('english', 'keep')
   );
   ts_rank
-------------
 0.075990885
(1 row)

textsearchdb=# SELECT
  ts_rank(
    to_tsvector('english', '
      Making mistakes is a natural part of the language learning process.
      The key is to learn from these mistakes. Do not be afraid to try out
      new things in English but always remember to reflect on them and decide
      what was successful and what you need to keep working on.
    '),
    to_tsquery('english', 'keep')
);
  ts_rank
------------
 0.06079271
(1 row)

textsearchdb=# SELECT
  ts_rank(
    to_tsvector('english', '
      If you really want to eat, keep climbing. The fruits are on the top of
      the tree. Stretch your hands and keep stretching them. Success is on
      the top, keep going.
    '),
    to_tsquery('english', 'keep')
   );
   ts_rank
-------------
 0.082745634
(1 row)
```

Há uma série de fatores que influenciam essa pontuação, como a posição do termo no documento, a
quantidade de palavras que o documento tem, quantas vezes o termo aparece e mais outras tantas.
Vale ressaltar que existem inúmeras estratégias de ranqueamento que dependem do contexto e
objetivo, como colocar na conta o tempo de modificação e/ou criação do texto, partes mais
importantes que outras como o título em relação ao conteúdo de um post, por exemplo.

Bem, isso foi apenas uma introdução das funcionalidades de
[Full Text Searching do PostgreSQL](https://www.postgresql.org/docs/current/textsearch-intro.html){:target="_blank"},
na próxima parte vou mostrar como aplicá-las com a
[Gem PgSearch](https://github.com/Casecommons/pg_search){:target="_blank"} em projetinho Ruby on
Rails.

[Link para parte II]({% post_url 2021-04-08-busca-texto-otimizada-com-pg-search-p2 %}){:target="_blank"}
