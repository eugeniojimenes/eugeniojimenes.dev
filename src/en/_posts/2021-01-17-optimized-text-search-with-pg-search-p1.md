---
layout: post
title:  "Optimized text search with pg_search gem - Part I"
date:   2021-01-17 22:58:53 -0300
locale: en_US
lang-ref: optimized-text-search-1
tags: Ruby Rails Optimization PostgreSQL Config
image: /assets/images/text-search.webp
image_alt: "Magnifying glass on a text"
description: >-
  Breaking down PostgreSQL's "Full Text Searching" functionality with pg_search gem in a
  Ruby on Rails application - Part I
categories: blog

---

Sinking on the internet I found the [PgSearch gem](https://github.com/Casecommons/pg_search){:target="_blank"}
which takes advantage of the [Full Text Searching features of PostgreSQL](https://www.postgresql.org/docs/current/textsearch-intro.html){:target="_blank"}.
This [Full Text Searching concept](https://en.wikipedia.org/wiki/Full-text_search){:target="_blank"}
refers to computer strategies and techniques to optimize searches of words, phrases or even
combinations of words, in big and multiple texts stored in a database. It has been a wide area of
study and research within Computer Science since 1990.
<!-- excerpt-end -->

But first I confess, I have prejudices against NoSQL (or better saying Non-relational database).

The Relational database goal is very intuitive. As Wikipedia describes it:

> A relational database is a database that models the data in such a way that it is perceived by
> the user as tables or, more formally, relationships.

**Note:** This quote refers to the Portuguese version of the Relational Database article in
Wikipedia.
{: .note-info }

In the democracy of giant excel spreadsheets, abstracting a table strategy (trying a different
approach) is quite complicated. When we translate the business logic into an application, attending
a company’s demands, for example, entities like user, product, account, profile etc are intuitively
applied as classes in an OOP - *Object Oriented Programming - and commonly stored as tables. In the
end, when we talk about PostgreSQL, MySQL or WhateverItMayBeSQL, we are essentially dealing with an
ORDBMS - Object–Relational Database Management System - object-relational, right?! But let's get
down to business, although it fills my heart to spread my ~~hatred for the fad~~ worries about
NoSQL to the world. The goal here is more about the usage and advantages of this gem.

## PostgreSQL, you handsome!

![PostgreSQL, you handsome!](/assets/images/elephants-love.webp){: .align-left}

Fanboy that I am of this ORDBMS, any excuses to study and take advantage of this powerful tool is
valid. So, let's go exploring the features it offers for *Full Text Searching*.

The next codes were executed in a Docker container with PostgreSQL. To do the same use these
following commands:

```bash
$ docker run --rm --name testing-textsearch -p 5432:5432 \
-e POSTGRES_USER=test -e POSTGRES_PASSWORD=test \
-e POSTGRES_DB=textsearchdb \
-d postgres:latest

$ docker exec -it testing-textsearch psql -d textsearchdb -U test
```

You should have access to the `psql` console, something like this:

```sql
psql (13.1 (Debian 13.1-1.pgdg100+1))
Type "help" for help.

textsearchdb=#
```

Let's start with the `ts_vector` function:

```sql
textsearchdb=# SELECT to_tsvector('english', 'Life is like riding a bicycle.
To keep your balance, you must keep moving.');
                                    to_tsvector
-----------------------------------------------------------------------------------
 'balanc':10 'bicycl':6 'keep':8,13 'life':1 'like':3 'move':14 'must':12 'ride':4
(1 row)
```

We have the "*Life is like riding a bicycle. To keep your balance, you must keep moving*" text,
usually referred to as a *document* in the *Full Text Searching* area. This document is analyzed
and converted into a special type of data called `tsvector` which is basically
[lexemes](https://radames.manosso.nom.br/linguagem/gramatica/morfologia/lexema/){:target="_blank"},
normalized keywords contained in the text. In this case we use the English language dictionary to
normalize the words, minimizing them to their root. That's why "*balance*" was reduced to
"*balanc*", "*riding*" to "*ride*", "*moving*" to "*move*" etc. The numbering next to each lexeme
(the reduced word) is its position in the text (document). Terms and communal words like "*is*",
"*to*", "*you*" etc are removed to reduce data size and the chance of false positives.

To verify if one or more words are inside a document we use the `to_tsquery` function. It
normalizes what will be searched in the same way that `to_tsvector` before the search.

```sql
textsearchdb=# SELECT to_tsquery('english', 'keep & moves');
   to_tsquery
-----------------
 'keep' & 'move'
(1 row)
```

With the `@@` operator we can verify if a `tsquery` is inside a `tsvector`, or better saying, if a
normalized word (or more with boolean operators like `|` and `&`) is in a document.

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
**Note:** The letters 't' and 'f' here stand for *true* and *false*, respectively.
{: .note-info }

With the `ts_rank` function we can sort the search results, being able to order from the highest
to the lowest when we search for a term in multiple documents.

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

There are innumerable factors that affect this evaluation, such as the position of a term in the
document, the quantity of words that this document has, how many times this term appears and many
more. It is also worth mentioning that there are a lot of strategies of ranking which depend on
the context and objective, such as adding the date of edition or creation of the text, emphasizing
parts which are more important, like the title in relation to the body of a post, for example.

Well, that was just an introduction to
[PostgreSQL's Full Text Searching features](https://www.postgresql.org/docs/current/textsearch-intro.html){:target="_blank"},
in the next part I'll show how to apply some of them with the
[PgSearch gem](https://github.com/Casecommons/pg_search){:target="_blank"} in a silly Ruby on Rails
application.

[Link to part II]({% post_url pt-br/2021-04-08-busca-texto-otimizada-com-pg-search-p2 %}){:target="_blank"}
