---
layout: post
title:  "Tutorial: Rails7, Tailwind e Hotwire - Parte 1"
date:   2021-12-09 11:12:54 -0300
locale: pt_BR
lang-ref: rails7-tailwind-hotwire-1
tags: Tutorial Rails Ruby Tailwind Hotwire
main_image: /assets/svg/tailwind.svg
image: /assets/images/tailwind.webp
image_alt: "Tailwind Logo"
description: >-
  Parte 1: Montando um layout com Tailwind - Tutorial sobre Rails 7 com esbuild, tailwind e
  Hotwire(Turbo e Stimulus). Como desenvolver um aplicação estilo Kanban, com cards/tarefas e
  persistência simultânea via websockets.
categories: blog

---

Na [parte anterior]({% post_url pt-br/2021-12-07-tutorial-rails7-hotwire %}){:target="_blank"} deste
tutorial, expliquei como configurar o Rails 7, com suas novas opções e como "dockerizei" os bancos
de dados PostgreSQL e Redis. Agora vou abordar um pouco sobre Tailwind.
<!-- excerpt-end -->

## Objetivo Geral
A meta é desenvolver (e aprender) utilizando Rails 7, esbuild, Tailwind e Hotwire (Turbo e
Stimulus), mas meu foco será mais sobre o pacote Hotwire e como ele pode nos ajudar. Conforme
avanço nos estudos e na implementação, vou complementando este tutorial. Por enquanto temos:
* [Parte 0: Rails 7]({% post_url pt-br/2021-12-07-tutorial-rails7-hotwire %}){:target="_blank"}
* [Parte 1: Tailwind](#etapa-1---tailwind) → página atual
* [Parte 2: Hotwire Turbo]({% post_url pt-br/2021-12-19-tutorial-rails7-hotwire-parte-2 %}){:target="_blank"}
* ~~Parte 3: Hotwire Stimulus~~ → em breve

O pano de fundo é uma aplicação estilo Kanban, com um quadro em que podemos incluir, ver, editar e
excluir os cards/tarefas e isso ser persistido simultaneamente via *websockets* para todas as
sessões abertas da aplicação. Todo código esta disponível neste
[repositório](https://github.com/callmarx/LearningHotwire){:target="_blank"}. Note que incluí
algumas [*branches*](https://github.com/callmarx/LearningHotwire/branches/all){:target="_blank"} que
representam as partes abordadas aqui.

## Etapa 1 - Tailwind
Nesta parte explico como utilizar e customizar o Tailwind. O resultado final desta etapa é o
disponível na *branch*
[blog-part-1](https://github.com/callmarx/LearningHotwire/tree/blog-part-1){:target="_blank"}.

### Um simples *scaffold*
Antes de começar a brincar com HTML ~~e CSS~~ eu gerei um conjunto simples de *models*,
*controllers* e *views* de ***chores*** (do inglês, equivalente à tarefas, pequenos trabalhos,
designação etc).
```bash
$ rails generate scaffold chore title:string content:text
```

E também um
[db/seeds.rb](https://github.com/callmarx/LearningHotwire/blob/blog-part-1/db/seeds.rb){:target="_blank"}
para já termos algo à visualizar no *index*.
```ruby
# db/seeds.rb
Chore.create([
  {
    title: "Gave up",
    content: "Would it save you a lot of time if I just gave up and went mad now?",
    created_at: 15.days.ago
  },
  {
    title: "More than big",
    content: "Space is big. You just won't believe how vastly, hugely, mind-bogglingly big it is. I mean, you may think it's a long way down the road to the chemist's, but that's just peanuts to space.",
    created_at: 4.days.ago
  },
  {
    title: "What did happen?",
    content: "For a moment, nothing happened. Then, after a second or so, nothing continued to happen.",
    created_at: 9.days.ago
  },
  {
    title: "About be President",
    content: "Anyone who is capable of getting themselves made President should on no account be allowed to do the job.",
    created_at: 36.days.ago
  },
  {
    title: "UX/UI",
    content: "A common mistake that people make when trying to design something completely foolproof is to underestimate the ingenuity of complete fools",
    created_at: 6.days.ago
  },
  {
    title: "42",
    content: "Forty-two.",
    created_at: 1.days.ago
  },
])
```

E rodei as *migrations* e o *seeds*.
```bash
$ rails db:migrate && rails db:seed
```

### Não configurando o Tailwindo
Acessando <http://localhost:3000/chores>{:target="_blank"} você deve obter algo como o seguinte.
![ugly-chores](/assets/images/ugly-chores.webp){: .align-center}

> "Ué?" - Eu, quando vi esta tela.

Parece que o tailwind não está configurado, mas confia, esta sim. Se você envolver o conteúdo por
algo como `<div class="text-gray-100 bg-gray-900"> ... </div>`, que são classes do Tailwind, verá a
mesma página com fundo escuro (`bg-gray-900`) e o texto claro (`text-gray-100`).

Seria algo assim:
```erb
<!-- app/views/chores/index.html.erb -->
<div class="text-gray-100 bg-gray-900"
  <p><%= notice %></p>

  <h1>Chores</h1>

  <div id="chores">
    <%= render @chores %>
  </div>

  <%= link_to "New chore", new_chore_path %>
</div>
```

Acontece que o comando `rails generate scaffold` do rails 7 não vêm com um algum tipo de "layout
padrão de geração" de *views* para o Tailwind, o mesmo vale para `rails generate controller`. Então
cabe à nós editar, mas Tailwind é mamão com mel, confia.

### Customizando Tailwind
Para customizar ou incluir funcionalidades basta editar o arquivo
[tailwind.config.js](https://github.com/callmarx/LearningHotwire/blob/blog-part-0/tailwind.config.js){:target="_blank"}
na raiz do projeto. Na
[parte anterior]({% post_url pt-br/2021-12-07-tutorial-rails7-hotwire %}){:target="_blank"} deste
tutorial, quando criamos o projeto com a *flag* `--css tailwind` o Rails já nos faz o trabalho de
instalar e referenciar o framework.

**UPDATE**: No momento em que estava escrevendo este post saiu a
[versão 3 do tailwind](https://tailwindcss.com/blog/tailwindcss-v3){:target="_blank"} e mudou tudo
que tinha customizado 🤡. Inclui a atualização para nova versão no repositório.
{: .note-info }

Eu fiz algumas customizações para exemplificar aqui no blog, mas recomendo a leitura da
[documentação oficial](https://tailwindcss.com/docs/configuration){:target="_blank"}, muito boa
por sinal.
```js
// tailwind.config.js
module.exports = {
  mode: 'jit',
  content: [ // 'purge' foi substituido por 'content' na v3.
    './app/views/**/*.html.erb',
    './app/helpers/**/*.rb',
    './app/javascript/**/*.js'
  ],
  theme: {
    extend: {
      spacing: {
        '100': '25rem',
        '104': '26rem',
        '108': '27rem',
        '112': '28rem',
      },
      colors: {
        wood: {
          50: '#f7eee9',
          100: '#efddd3',
          150: '#e7cdbd',
          200: '#dfbca7',
          250: '#d7ac91',
          300: '#cf9b7b',
          350: '#c78a65',
          400: '#bf7a4f',
          450: '#b76939',
          500: '#af5924',
          550: '#9d5020',
          600: '#8c471c',
          650: '#7a3e19',
          700: '#693515',
          750: '#572c12',
          800: '#46230e',
          850: '#341a0a',
          900: '#231107',
          950: '#110803',
        }
      }
    }
  }
}
```

Explico:

**Primeiro** incluí um conjunto "manual" de cores que nomeei como `wood`, com graduações de 50 à 950.
Ou seja, com isso você tem acesso a classes como `bg-wood-650` (equivalente à *background color*
[#7a3e19](https://www.colorhexa.com/7a3e19){:target="_blank"}), `text-wood-300` (equivalente à
*text color* [#cf9b7b](https://www.colorhexa.com/cf9b7b){:target="_blank"}), `border-wood-850`
(equivalente à *border color* [#341a0a](https://www.colorhexa.com/341a0a){:target="_blank"}) etc.
No final das contas eu acabei nem usando essas cores ~~porque achei que ficou tudo com cara de cor
de cocô~~, mas fique a vontade em utilizá-las. Você pode ver mais sobre isso aqui
<https://tailwindcss.com/docs/customizing-colors>{:target="_blank"}.

**Depois** aumentei os valores dos "espaçamentos". Quando ponho, por exemplo, `'108': '27rem'`
dentro das chaves `spacing: { ... }`, tenho acesso à classes como `p-108` (*padding* de *27rem*),
`m-108` (*margin* de *27rem*), `h-108` (*height* de *27rem*) etc. Você pode ver mais sobre isso
aqui <https://tailwindcss.com/docs/customizing-spacing>{:target="_blank"}.

### Sou um designer preguiçoso
Sem mais delongas, depois de ~~me cansar de ficar enfeitando as páginas~~ um tempinho
experimentando eu alterei os seguintes arquivos.

Em [app/views/chores/index.html.erb](https://github.com/callmarx/LearningHotwire/blob/blog-part-1/app/views/chores/index.html.erb){:target="_blank"}
```erb
<!-- app/views/chores/index.html.erb -->
<div class="z-0 flex flex-col justify-start h-screen justify-items-center bg-slate-300">
  <div class="z-0 w-4/5 mx-auto mt-4 overflow-hidden h-2/3 bg-slate-200 rounded-md transition transform duration-600 ease-in-out hover:bg-slate-400 hover:overflow-visible">
    <div id="chores" class="z-0 px-5 pt-1 pb-3 grid grid-cols-3 gap-2">
      <% @chores.each do |chore| %>
        <%= render "chore", chore:chore %>
      <% end %>
    </div>
  </div>
  <div class="w-4/5 mx-auto my-4 h-80 bg-slate-200 rounded-md hover:bg-slate-400 transition duration-600 ease-linear">
    <%= render "form", chore: @chore %>
  </div>
</div>
```

Em [app/views/chores/_chore.html.erb](https://github.com/callmarx/LearningHotwire/blob/blog-part-1/app/views/chores/_chore.html.erb){:target="_blank"}
```erb
<!-- app/views/chores/_chore.html.erb -->
<div
  id="<%= dom_id chore %>"
  class="p-3 my-3 bg-white shadow-lg group transition duration-700 ease-in-out transform hover:scale-125 hover:z-10 rounded-md"
>
  <a href="#">
    <div class="flex flex-col">
      <div class="flex justify-between">
        <p class="text-lg font-semibold leading-snug text-gray-900 mr-0.5">
          <%= chore.title %>
        </p>
        <time
          datetime=<%= chore.created_at.strftime("%Y-%m-%d") %>
          class="invisible text-sm text-indigo-700 group-hover:visible"
        >
          <%= chore.created_at.strftime("%b %d") %>
        </time>
      </div>
        <p class="leading-snug text-gray-900">
          <%= chore.content %>
        </p>
        <div class="flex justify-end space-x-2">
          <button class="invisible w-5 h-5 text-indigo-500 cursor-pointer group-hover:visible hover:text-black transition-all duration-600 ease-in-out">
            <svg stroke="currentColor" fill="none" stroke-width="1.7" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          <button class="invisible w-5 h-5 text-indigo-500 cursor-pointer group-hover:visible hover:text-black transition-all duration-600 ease-in-out">
            <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 16 16">
              <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"></path><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
            </svg>
          </button>
        </div>
    </div>
  </a>
</div>
```

E em [app/views/chores/_form.html.erb](https://github.com/callmarx/LearningHotwire/blob/blog-part-1/app/views/chores/_form.html.erb){:target="_blank"}
```erb
<!-- app/views/chores/_form.html.erb -->
<%= form_with(model: chore) do |form| %>
  <% if chore.errors.any? %>
    <div id="error_explanation">
      <h2><%= pluralize(chore.errors.count, "error") %> prohibited this chore from being saved:</h2>

      <ul>
        <% chore.errors.each do |error| %>
          <li><%= error.full_message %></li>
        <% end %>
      </ul>
    </div>
  <% end %>

  <div class="items-center mt-8">
    <div class="flex flex-col w-5/6 mx-auto">
      <%= form.text_field :title, placeholder: "Title", class: "p-3 mt-2 leading-none text-gray-900 bg-gray-100 border border-gray-200 rounded" %>
    </div>
  </div>

  <div class="flex flex-col w-5/6 mx-auto">
    <%= form.text_area :content, placeholder: "Content", class: "h-40 p-3 mt-2 text-base leading-none text-gray-900 bg-gray-100 border border-gray-200 rounded" %>
  </div>

  <div class="flex items-center justify-center w-full">
    <%= form.submit class: "px-10 py-4 my-2 font-semibold leading-none text-white rounded bg-slate-700 hover:bg-slate-900" %>
  </div>
<% end %>
```
Essas alterações correspondem basicamente ao que há na *branch*
[blog-part-1](https://github.com/callmarx/LearningHotwire/tree/blog-part-1){:target="_blank"}.
Então, agora se você subir o projeto com `bin/dev` e acessar <http://localhost:3000/chores>{:target="_blank"},
deve obter este resultado:
![Tailwind Result](/assets/gifs/tailwind-result.gif){: .align-center}

E isso **sem uma ~~*fucking*~~ linha** de JavaScript e CSS!

![Friends Matt Leblanc - gif](https://c.tenor.com/ykVAsEud6fwAAAAC/friends-matt-leblanc.gif){: .align-start}

### Como pode?!
Vou tentar explicar aqui algumas das classes do Tailwind que inclui HTML das quais permitiram esse
resultado.

**Primeiro** vamos as *divs* que separam o "quadro de tarefas" da "inserção de uma nova tarefa" em
[app/views/chores/index.html.erb](https://github.com/callmarx/LearningHotwire/blob/blog-part-1/app/views/chores/index.html.erb){:target="_blank"}.
Na *div* de inserção, temos:
```erb
<!-- app/views/chores/index.html.erb -->
<div ...>
  ...
  <div class="w-4/5 mx-auto my-4 h-80 bg-slate-200 rounded-md hover:bg-slate-400 transition duration-600 ease-linear">
    <%= render "form", chore: @chore %>
  </div>
</div>
```
A classe `bg-slate-200` com `hover:bg-slate-400` montam o gatilho de *mouseover*, alterando a cor
de fundo de "*slate-200*" para "*slate-400*" quando passamos o mouse por cima. Adicionando ainda o
conjunto `transition duration-600 ease-linear` à isso, temos essa transição com um efeito gradual,
mais sutil aos olhos. A classe `duration-600` impõe um tempo de 600 milissegundos para essa
transição. Você pode ver mais sobre isso em
<https://tailwindcss.com/docs/transition-timing-function>{:target="_blank"}.

Na *div* do quadro de tarefas, temos:
```erb
<!-- app/views/chores/index.html.erb -->
<div ...>
  <div class="z-0 w-4/5 mx-auto mt-4 overflow-hidden h-2/3 bg-slate-200 rounded-md transition transform duration-600 ease-in-out hover:bg-slate-400 hover:overflow-visible">
    ...
  </div>
  ...
</div>
```
As classes `bg-slate-200` e `overflow-hidden` com `hover:bg-slate-400` e `hover:overflow-visible`,
montam o gatilho de *mouseover* não apenas para mudar a cor, mas também para mudar o comportamento
do "transbordar de conteúdo" - `overflow-hidden` omite as tarefas que não couberem na *div* (quando
você redimensiona a janela do navegador, por exemplo), mas ao passar o mouse por cima isso é
alterando para `overflow-visible`, tornando as tarefas visíveis. Novamente, com o conjunto
`transition transform duration-600 ease-linear` à isso para termos a transição gradual.

**Agora** vamos as tarefas, no arquivo
[app/views/chores/_chore.html.erb](https://github.com/callmarx/LearningHotwire/blob/blog-part-1/app/views/chores/_chore.html.erb){:target="_blank"},
para explicar os efeitos de "aumentar o card da tarefa" e o de "exibir os ícones de edição e
remoção".

Na *div* mais externa, a primeira, temos:
```erb
<!-- app/views/chores/_chore.html.erb -->
<div
  ...
  class="p-3 my-3 bg-white shadow-lg group transition duration-700 ease-in-out transform hover:scale-125 hover:z-10 rounded-md"
>
  ...
</div>
```
Com as classes `hover:scale-125` e `hover:z-10`, montamos o gatilho para aumentar seu tamanho com
`scale-125` e sobrepor qualquer outro conteúdo com `z-10`. Também incluí o conjunto `transition
transform duration-600 ease-linear` para a transição gradual. Note também que incluí a classe
`group`, ela serve para mapear a parte seguinte.


Nas tags *button* que envolvem os SVG dos ícones de edição e remoção, temos:
```erb
<!-- app/views/chores/_chore.html.erb -->
<div ...>
  <a href="#">
    <div class="flex flex-col">
      ...
      <div ...>
        <!-- botão de edição -->
        <button class="invisible w-5 h-5 text-indigo-500 cursor-pointer group-hover:visible hover:text-black transition-all duration-600 ease-in-out">
          <svg ...>
          </svg>
        </button>
        <!-- botão de remoção -->
        <button class="invisible w-5 h-5 text-indigo-500 cursor-pointer group-hover:visible hover:text-black transition-all duration-600 ease-in-out">
          <svg ...>
          </svg>
        </button>
      </div>
    </div>
  </a>
</div>
```
Com as classes `invisible` e `group-hover:visible` em ambos `<button> ... </button>`, somado à
classe `group` que adicionei na *div* mais externa, a "pai" de todas, como pontuei antes, dizemos
ao Tailwind que ao passar o mouse dentro dessa *div* mais externa é para tornar visível ambos os
botões, simples assim! Trata-se de um *efeito em grupo*. Note que o *efeito individual* de cada
botão, no caso o de alterar a cor de preenchimento dos ícones com `text-indigo-500` e
`hover:text-black`, é diferente, será acionado quando passamos o mouse no ícone, individualmente.
Você pode ver mais sobre isso em
<https://tailwindcss.com/docs/hover-focus-and-other-states#styling-based-on-parent-state>{:target="_blank"}.

**Recomendo**: No
[canal do Adam Wathan no YouTube](https://www.youtube.com/channel/UCy1H38XrN7hi7wHSClfXPqQ){:target="_blank"}
há várias *lives* gravadas em que ele monta um layout do zero com Tailwind, mexendo apenas com HTML,
muito bom!
{: .note-info }

Por agora, é isso.
![Cat driving - gif](https://c.tenor.com/UrRng6Gv67UAAAAC/cat-driving.gif){: .align-start}
