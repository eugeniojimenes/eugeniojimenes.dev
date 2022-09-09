---
layout: post
title:  "Controller magro e model gordo, mas não perca o foco"
date:   2020-12-17 09:46:13 -0300
locale: pt_BR
lang-ref: skinny-controller-fat-model
tags: Ruby Rails DesignPatterns
image: /assets/images/mvc-wiki.webp
image_alt: "MVC Diagram - Wikipedia"
description: >-
  Mantra “Skinny Controller, Fat Model”, padrão MVC e conceito DRY. É o velho desfaio do código
  limpo e claro. Veja exemplos em Ruby on Rails.
categories: blog

---

Jamis Buck escreveu em 2006 o famoso post
[Skinny Controller, Fat Model](http://weblog.jamisbuck.org/2006/10/18/skinny-controller-fat-model){:target="_blank"},
tornando-se quase que um mantra para seguir o padrão MVC -
***M****odel-****V****iew-****C****ontroller*. No caso, toda lógica não relacionada à resposta ao
usuário/cliente (View-Controller) deve entrar no model, mantendo assim a comunicação simples, ou
melhor dizendo, “magra”.
<!-- excerpt-end -->

Por que disso? Simples, por conta dos testes e da organização. Se uma parte do seu código é
responsável pela comunicação, ou parte dela, é esperado que, e somente que, testes de comunicação
sejam feitos para esta parte do código.

## Mas o que é MVC?

Em uma tradução livre seria a arquitetura Modelo-Visão-Controle. Trata-se de um padrão de projeto
de software (arquitetura de software) na qual propõe a separação de conceitos em três camadas
interconectadas, onde a apresentação dos dados aos usuários é separada dos métodos que interagem
com o banco de dados, vulgo “protege a lógica de negócio”.


![Padrão MVC](/assets/images/padrao-mvc.webp)


É comumente aplicada junto ao conceito DRY - ***D****on’t* ***R****epeat* ***Y****ourself* -
focando na não repetição de código, mas reutilizando-o, o que facilita refatorações e depuração
(*debugging*).


## Codando e exemplificando

Para entender o porquê do problema com “controllers obesos”, vamos dar um exemplo - em uma
aplicação boba em Ruby on Rails, dado um modelo Post, temos o seguinte PostsController:

```ruby
class PostsController < ApplicationController

...
  def index
    @posts = Post.all
  end
...

end
```

Surgiu então a demanda do usuário poder fazer buscas na listagem dos posts. Uma solução, sem
pensar muito, séria:

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

Vê o problema? Não faz sentido o controller ter uma lógica de busca. Se o modelo Post está sendo
percorrido, porque não mover o método ```search_post``` para o próprio Post? Poderia ser apenas
com o nome ```search```, como método de classe, sendo chamado na forma ```Post.search(args)```,
bem mais intuitivo inclusive. Além de organizar a lógica, podemos agora manter todos os testes
sobre o contexto de postagens - validação, busca, ranqueamento etc - sob o mesmo e não ter que
executá-las para o controller. O exemplo também rompia o padrão MVC, o controller detinha lógica
de chamadas ao banco quando isso é de responsabilidade do model.

**Obs**: Não vou entrar no mérito do desempenho da busca em si, que por sinal está
horrível com todos esses ```OR``` na *query* SQL, não considera erros de digitação, coesão da frase
buscada, enfim, apenas remove os acentos com *unaccent* do PostgreSQL. Existem inúmeras técnicas
de *Full Text Searching*, como indexação léxica, caracteres-coringa, ranqueamento de palavras etc.
Mas isso é tema para outro momento, ~~quem sabe.~~ &#10144;
[Busca em texto otimizada com a Gem pg_search]({% post_url pt-br/2021-01-17-busca-texto-otimizada-com-pg-search-p1 %}){:target="_blank"}
{: .note-info }

## Sempre bom controlar o colesterol

Models obesos também são um problema. Isso pode desmotivá-lo a seguir os padrões mencionados, mas
quando lidamos com uma lógica extensa e complexa de uma classe/arquivo, fica bem mais fácil
“diluir” se ela é focada em um mesmo contexto, em um conjunto específico de responsabilidades.

A própria programação orientada a objetos possui inúmeras estratégias como composição, herança e
delegação. Abstrair uma classe com heranças, por exemplo, fica mais difícil se ela é responsável
por diversas tarefas de contextos diferentes, mais ainda se essas tarefas e contextos então
misturados ou não bem definidos. Muitas vezes não trata-se de uma problema técnico, com o código
em si, mas no entendimento do que está querendo ser feito.

> “Não entre em pânico.” -  Guia do Mochileiros das Galáxias

Em Rails podemos contornar “códigos extensos” com *concerns*, *services* e até *jobs* dependendo
do objetivo. Vale repetir a importância em focar as funcionalidades de cada classe de modo a
melhor granular o todo. No exemplo “codado”, pode acontecer de que não apenas Post tenha
```search```, mas outros models também como Comments, Papers etc. Isso chama (ou “cheira” se você
é fã do termo *Code Smell*) à movermos o método para um concern, algo como SearchConcern sem ser
muito criativo, que pode ser incluído nos models “buscaveis” da nossa aplicação, sejam eles
existentes ou futuros . Veja que com isso, além de emagrecer o Model, a granulação feita joga a
funcionalidade e complexidade de buscas para um único arquivo, mantendo assim o foco de
funcionalidades para aquele trecho de código.

