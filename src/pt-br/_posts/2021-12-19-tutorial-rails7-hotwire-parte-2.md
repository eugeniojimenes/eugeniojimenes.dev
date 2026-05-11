---
layout: post
title:  "Tutorial: Rails7, Tailwind e Hotwire - Parte 2"
date:   2021-12-19 14:42:03 -0300
locale: pt_BR
lang-ref: rails7-tailwind-hotwire-2
tags: Tutorial Rails Ruby Tailwind Hotwire
main_image: /assets/svg/hotwire-turbo.svg
image: /assets/images/hotwire-turbo.webp
image_alt: "Hotwire Turbo Logo"
image_light_bg: true
description: >-
  Parte 2: Renderização parcial com Hotwire Turbo - Tutorial sobre Rails 7 com esbuild, tailwind e
  Hotwire (Turbo e Stimulus). Como desenvolver um aplicação estilo Kanban, com cards/tarefas e
  persistência simultânea via websockets.

---

Na [parte anterior]({% post_url pt-br/2021-12-09-tutorial-rails7-hotwire-parte-1 %}){:target="_blank"}
deste tutorial eu expliquei como customizar e utilizar o Tailwind sem uma linha sequer de CSS e
JavaScript. Agora vou abordar um pouco sobre o pacote
[Hotwire Turbo](https://turbo.hotwired.dev){:target="_blank"}.
<!-- excerpt-end -->

## Objetivo Geral
A meta é desenvolver (e aprender) utilizando Rails 7, esbuild, Tailwind e Hotwire (Turbo e
Stimulus), mas meu foco será mais sobre o pacote Hotwire e como ele pode nos ajudar. Conforme
avanço nos estudos e na implementação, vou complementando este tutorial. Por enquanto temos:
* [Parte 0: Rails 7]({% post_url pt-br/2021-12-07-tutorial-rails7-hotwire %}){:target="_blank"}
* [Parte 1: Tailwind]({% post_url pt-br/2021-12-09-tutorial-rails7-hotwire-parte-1 %}){:target="_blank"}
* [Parte 2: Hotwire Turbo](#etapa-2---hotwire-turbo) → página atual
* [Part 3: Hotwire Stimulus]({% post_url pt-br/2022-06-29-tutorial-rails7-hotwire-parte-3 %}){:target="_blank"}

O pano de fundo é uma aplicação estilo Kanban, com um quadro em que podemos incluir, ver, editar e
excluir os cards/tarefas e isso ser persistido simultaneamente via *websockets* para todas as
sessões abertas da aplicação. Todo código esta disponível neste
[repositório](https://github.com/eugeniojimenes/LearningHotwire){:target="_blank"}. Note que incluí
algumas [*branches*](https://github.com/eugeniojimenes/LearningHotwire/branches/all){:target="_blank"} que
representam as partes abordadas aqui.

## Etapa 2 - Hotwire Turbo
Nesta etapa explico sobre a proposta desta ferramenta e implemento o modo *render* `turbo_stream`
juntamente com o `broadcast` via *ActionCable*. O resultado desta etapa eu dividi em duas partes:
a *branch*
[blog-part-2.1](https://github.com/eugeniojimenes/LearningHotwire/tree/blog-part-2.1){:target="_blank"},
em que uso apenas o `turbo_stream` sem `broadcast`, e a final com `broadcast` na *branch*
[blog-part-2.2](https://github.com/eugeniojimenes/LearningHotwire/tree/blog-part-2.2){:target="_blank"}.

### Conceitualmente: Turbina o que?
Consultando a introdução do
[Handbook](https://turbo.hotwired.dev/handbook/introduction){:target="_blank"}, e fazendo uma
tradução livre, conceitualmente temos um pacote que
> Agrupa uma série de ferramentas para criar aplicações web velozes, modernas e de aprimoramento
> progressivo, sem muito JavaScript.

Talvez a tradução de
[*Progressive Enhancement*](https://www.freecodecamp.org/news/what-is-progressive-enhancement-and-why-it-matters-e80c7aaf834a/){:target="_blank"} -
"aprimoramento progressivo" - não soe muito claro. Criado em 2003, trata-se basicamente de uma
estratégia de design, de arquitetura web, que enfatiza o carregamento progressivo da página,
priorizando o conteúdo principal (HTML) e distribuindo os demais (CSS, JavaScript, HTML adicionais
etc) em outras camadas de apresentação/carregamento.

Continuando minha tradução livre sobre as diretrizes do *Hotwire Turbo*
> Oferece uma alternativa mais simples contra a predominância das estruturas do lado do cliente,
> das quais colocam toda a lógica no front-end, confinando o lado do servidor da aplicação a ser
> pouco mais do que uma API JSON.

Este é o **trecho que mais me chamou atenção**, me conquistou, me incentivou a estudar e querer
utilizar isso. A "*predominância das estruturas do lado do cliente*" é algo que vem me chamando
atenção nos últimos anos, parece que **de repente toda área do back-end foi "*confinada*" à API
JSON**. Porém, com todo dinamismo que hoje em dia uma página web precisa, como processamento de
dados de acordo com o comportamento do usuário e da navegação, isso acabou sendo feito pelo lado
cliente, front-end, via JavaScript com bibliotecas como jQuery. Como determinadas lógicas desse
processamento devem estar protegidas no back-end, não podendo serem completamente expostas no
front-end, ou seja, não podendo serem totalmente feitas no lado cliente da aplicação, **nos
deparamos eventualmente com "*espelhamentos da lógica em ambos os lados*"**. E as diretrizes
continuam exatamente nesse sentido.
> Com Turbo você permite que o servidor entregue HTML diretamente (...). Você não lidera mais com
> espelhamento da lógica em ambos os lados da aplicação, permeados via JSON. Toda lógica reside no
> servidor e o navegador lida apenas com o HTML final.

É o conceito de *HTML-Over-The-Wire* - Hotwire. 🤓

### *Turbo Frame* VS. *Turbo Stream*
Algo que me confundiu bastante no começo foi a demora em entender a diferença entre *Turbo Frame* e
*Turbo Stream*, pois tratam-se de abordagens diferentes. Felizmente eu encontrei essa tabela
publicada pelo
[*The Pragmatic Programmers*](https://medium.com/pragmatic-programmers/turbo-frames-vs-turbo-streams-4eee1c574d23){:target="_blank"}.
```
---------------------------------------------------------------------------+---------------------------------------------------------------------------+
                Turbo Frames                                 |                     Turbo Streams                                                       |
----------------------------------------------------------------------------+--------------------------------------------------------------------------+
Altera apenas um elemento do DOM por requisição.             |  Altera inúmeros elementos do DOM por requisição.
Consegui apenas atualizar o elemento interno do HTML.        |  Pode concatenar ou preceder um novo elemento, além de atualizar ou remover um elemento.
Afeta apenas elementos dentro da tag turbo-frame com DOM ID. |  Afeta qualquer tipo de elemento HTML desde que tenha um DOM ID para ser referenciado.
É "ativado" na requisição dentro do elemento turbo-frame.    |  Ativado também via ActionCable/broadcasts.
```

**OBS**: Não pretendo utilizar o *Turbo Frames* neste projeto. Talvez eu repense isso para
aproveitar a funcionalidade de *lazily load*, mas se for o caso adicionarei um post separado sobre
isso.
{: .note-info }

### Começando apenas com *Turbo Stream*
Para explicar separadamente o modo *render* `turbo_stream` eu incluí o código desta subparte na
*branch* [blog-part-2.1](https://github.com/eugeniojimenes/LearningHotwire/tree/blog-part-2.1){:target="_blank"}.

No `ChoresController` que geramos com `rails generate scaffold` na
[etapa anterior]({% post_url pt-br/2021-12-09-tutorial-rails7-hotwire-parte-1 %}#um-simples-scaffold){:target="_blank"}
deste tutorial, por padrão o Rails incluiu múltiplos formatos de renderização, no caso HTML e JSON.
Como incluímos `gem "turbo-rails"` no Gemfile, temos acesso também à renderização via *Turbo Stream*,
bastando adicionar `format.turbo_stream` dentro do bloco `respond_to do |format|`. Fazendo isso
para os métodos *create* e *destroy*, temos em
[app/controllers/chores_controller.rb](https://github.com/eugeniojimenes/LearningHotwire/blob/blog-part-2.1/app/controllers/chores_controller.rb){:target="_blank"}:
```ruby
# file app/controllers/chores_controller.rb of blog-part-2.1 branch
class ChoresController < ApplicationController
  ...
  def create
    ...
    respond_to do |format|
      if @chore.save
        format.turbo_stream # include this
        format.html { redirect_to @chore, notice: "Chore was successfully created." }
        format.json { render :show, status: :created, location: @chore }
      else
        format.html { render :new, status: :unprocessable_entity }
        format.json { render json: @chore.errors, status: :unprocessable_entity }
      end
    end
  end
  ...
  def destroy
    @chore.destroy
    respond_to do |format|
      format.turbo_stream # include this
      format.html { redirect_to chores_url, notice: "Chore was successfully destroyed." }
      format.json { head :no_content }
    end
  end
  ...
end
```

Para esse tipo de renderização também precisamos de arquivos dedicados em `app/views`, como o temos
para HTML e JSON. Sendo assim, temos o seguinte
[app/views/chores/create.turbo_stream.erb](https://github.com/eugeniojimenes/LearningHotwire/blob/blog-part-2.1/app/views/chores/create.turbo_stream.erb){:target="_blank"}:
```erb
<!-- file app/views/chores/create.turbo_stream.erb of blog-part-2.1 branch -->
<%= turbo_stream.append "chores", partial: "chores/chore", locals: { chore: @chore } %>
<%= turbo_stream.replace "chore_form", partial: "chores/form", locals: { chore: Chore.new } %>
```

Como queremos ver a aplicação disso sem recarregar uma página inteira, ou seja, poder **renderizar
apenas uma parte** da página, o faremos no *index* de *chores*. Por isso usamos os métodos
`turbo_stream.append` e `turbo_stream.replace` acima apontados para o DOM ID da página, ou seja,
respectivamente os primeiros argumentos `"chores"` e `"chore_form"` devem estar presentes na página
**completamente renderizada** por
[app/views/chores/index.html.erb](https://github.com/eugeniojimenes/LearningHotwire/blob/blog-part-2.1/app/views/chores/index.html.erb){:target="_blank"}.
Sendo isso assim precisamos incluir `id="chores"` na `<div>` que envolve a listagem dos *chores*:
```erb
<!-- file app/views/chores/index.html.erb  of blog-part-2.1 branch -->
<div ...>
  <div ...>
    <div id="chores" ...> <!-- include id="chores" for turbo_stream.append -->
      <% @chores.each do |chore| %>
        <%= render "chore", chore:chore %>
      <% end %>
    </div>
  </div>
  <div ...>               <!-- don't include id="chore_form" here!         -->
    <%= render "form", chore: @chore %>
  </div>
</div>
```

Agora, para `id="chore_form"`, não podemos incluir na `<div>` que envolve
`<%= render "form", chore: @chore %>` pois o método `turbo_stream.replace` **substitui completamente
o elemento** e como o fazemos substituindo pelo *partial view*
[app/views/chores/_form.html.erb](https://github.com/eugeniojimenes/LearningHotwire/blob/blog-part-2.1/app/views/chores/_form.html.erb){:target="_blank"}
essa `<div>` seria apagada, sendo assim devemos incluir `id="chore_form"` no próprio arquivo *form*:
```erb
<!-- file app/views/chores/_form.html.erb  of blog-part-2.1 branch -->
<%= form_with(model: chore, id: "chore_form") do |form| %>
  ...
<% end %>
```


Agora, para excluir um *chore* é ainda mais simples, temos o seguinte
[app/views/chores/destroy.turbo_stream.erb](https://github.com/eugeniojimenes/LearningHotwire/blob/blog-part-2.1/app/views/chores/destroy.turbo_stream.erb){:target="_blank"}
```erb
<!-- file app/views/chores/destroy.turbo_stream.erb of blog-part-2.1 branch -->
<%= turbo_stream.remove dom_id(@chore) %>
```

Da mesma forma, devemos incluir o DOM ID, mas no caso um específico para cada *chore*, por isso o
`dom_id(@chore)`. Além disso, também precisamos editar o `<button>` do ícone de exclusão para
apontar para o método *destroy* do *controller*, sendo assim em:
[app/views/chores/_chore.html.erb](https://github.com/eugeniojimenes/LearningHotwire/blob/blog-part-2.1/app/views/chores/_chore.html.erb){:target="_blank"}
```erb
<!-- file app/views/chores/_chore.html.erb of blog-part-2.1 branch -->
<div id="<%= dom_id(chore) %>" ...> <!-- include dom_id(chore) for turbo_stream.remove -->
  <div ...>
    ...
    <div ...>
      ...
      <%= button_to chore_path(chore), method: :delete, class: ... do %> <!-- make button point to delete method -->
        <svg ...>
          ...
        </svg>
      <% end %>
      ...
```

Agora, ao remover um *chore*, também teremos uma **renderização parcialmente** que remove o HTML do
*chore* excluído sem recarregar toda a página. O resultado final desta subparte, ao criar ou
excluir um *chore* em <http://localhost:3000/chores>{:target="_blank"}, é o seguinte:
![Turbo-Stream Add](/assets/gifs/turbo-stream-add.gif){: .align-center}

**OBS**: Note que não há um carregamento total da página a cada inclusão ou exclusão, a página é
recarregada parcialmente via
[*fetch*](https://developer.mozilla.org/pt-BR/docs/Web/API/Fetch_API/Using_Fetch){:target="_blank"}.
{: .note-info }


Porém, se você abrir duas janelas de <http://localhost:3000/chores>{:target="_blank"} e incluir ou
excluir *chores* em uma delas verá que as alterações são feitas apenas na janela que está
manipulando isso, **não haverá persistência em todas as sessões**. Para isso precisamos fazer via
*ActionCable* com `broadcast`.

### Aplicando *broadcast*
Aqui corresponde a parte final desta etapa do tutorial. A subparte anterior foi apenas para
explicar o uso isolado do *render* `turbo_stream`, como objetivo é uma aplicação estilo Kanban
pretendo utilizar majoritariamente esse *render* juntamente com `broadcast` daqui para frente. O
código completo desta etapa está na *branch*
[blog-part-2.2](https://github.com/eugeniojimenes/LearningHotwire/tree/blog-part-2.2){:target="_blank"}.

Para aplicarmos as alterações dos *chores* em todas as sessões utilizaremos o
`Turbo::StreamsChannel` que vem com a gema `turbo-rails`, podendo ser chamado diretamente no
*model* ou no *controller* dependendo da abordagem que desejar. A ideia aqui é que **estaremos
implementando as renderizações parciais em um padrão
[Publish/Subscribe](https://en.wikipedia.org/wiki/Publish%E2%80%93subscribe_pattern){:target="_blank"}**.
Por trás dos panos estaremos usando o *Active Jobs* para "publicar" (*publish*) a renderização
parcial do `turbo_stream` de maneira assíncrona e o *Action Cable* para entregar essas atualizações
aos "assinantes" (*subscribers*).

No caso, nossos "assinantes" são todas as sessões abertas de
<http://localhost:3000/chores>{:target="_blank"} e podemos mapear isso usando o helper
`turbo_stream_from`. Sendo assim, em
[app/views/chores/index.html.erb](https://github.com/eugeniojimenes/LearningHotwire/blob/blog-part-2.2/app/views/chores/index.html.erb){:target="_blank"},
temos:
```erb
<!-- file app/views/chores/index.html.erb  of blog-part-2.2 branch -->
<%= turbo_stream_from "chores" %>
<div ...>
  ...
</div>
```

Como disse antes, podemos incluir `Turbo::StreamsChannel` no *model* ou *controller* para cobrir as
modificações de *create*, *update* e *delete*, mais especificamente através dos métodos
`.broadcast_append_to`, `.broadcast_replace_to`, `.broadcast_remove_to` entre outros. Se incluirmos
isso no *model* através de *Active Record Callbacks*, como `after_create_commit`, **toda vez que o
*model* for alterado** iremos disparar "publicações" de renderização parcial. Como por enquanto eu
quero disparar as alterações feitas apenas através de requisições do usuário - não quero que
`rails db:seed` dispare isso, por exemplo - optei por incluir no *controller*. Sendo assim em
[app/controllers/chores_controller.rb](https://github.com/eugeniojimenes/LearningHotwire/blob/blog-part-2.2/app/controllers/chores_controller.rb){:target="_blank"},
temos:
```ruby
# file app/controllers/chores_controller.rb of blog-part-2.2 branch
class ChoresController < ApplicationController
  before_action :set_chore, only: %i[ show edit update destroy ]
  after_action :broadcast_insert, only: %i[create]
  after_action :broadcast_remove, only: %i[destroy]

  ...

  private
    ...
    def broadcast_insert
      return if @chore.errors.any?
      Turbo::StreamsChannel.broadcast_append_to(
        "chores",
        target: "chores",
        partial: "chores/chore",
        locals: { chore: @chore }
      )
    end

    def broadcast_remove
      return unless @chore.destroyed?
      Turbo::StreamsChannel.broadcast_remove_to(
        "chores",
        target: ActionView::RecordIdentifier.dom_id(@chore)
      )
    end
end
```

Como os métodos privados `broadcast_insert` e `broadcast_remove` acima já fazem a inserção e
exclusão dos *chores* não precisamos mais fazer isso nas *views* `*.turbo_stream.erb` que criamos
na subparte anterior, por isso para essa parte final eu excluí a *view*
`app/views/destroy.turbo_stream.erb` e mantive
[app/views/chores/create.turbo_stream.erb](https://github.com/eugeniojimenes/LearningHotwire/blob/blog-part-2.2/app/views/chores/create.turbo_stream.erb){:target="_blank"},
com apenas:
```erb
<!-- file app/views/chores/create.turbo_stream.erb of blog-part-2.2 branch -->
<%= turbo_stream.replace "chore_form", partial: "chores/form", locals: { chore: Chore.new } %>
```
**OBS**: Não sei se você notou, mas não estamos "publicando" o *replace* do *form* via *ActionCable*
como as outras renderizações parciais. Mantive aqui o `turbo_stream` para sessão corrente apenas, o
que faz total sentido já que não precisamos limpar o *form* nas outras sessões, inclusive se
fizermos isso poderemos apagar o *form* de um outro usuário que o está preenchendo e não submeteu
ainda.
{: .note-info }

Pronto! Basta subir o projeto com `bin/dev` e acessar em mais de uma janela
<http://localhost:3000/chores>{:target="_blank"}, você deve obter este resultado final:
![Turbo-Stream with Broadcast](/assets/gifs/turbo-stream--with--broadcast.gif){: .align-center}

![Nice Michael Scott - gif](https://c.tenor.com/S_wekPtfKm4AAAAd/nice-michael-scott.gif){: .align-center}
