---
layout: post
title:  "Diário disléxico: Agora com meu próprio domínio"
date:   2022-07-13 20:12:51 -0300
locale: pt_BR
lang-ref: now-with-my-domain
tags: Jekyll Hotwire Tailwind
main_image: /assets/svg/jekyll-netlify.svg
image: /assets/images/jekyll-netlify.webp
image_alt: "Jekyll and Netlify logos"
description: >-
  Refiz meu blog com Jekyll, Tailwind e Hotwire Turbo.

---

Refiz o meu blog: implementei do zero com [Jekyll](https://jekyllrb.com){:target="_blank"},
[Tailwind](https://tailwindcss.com/docs/installation){:target="_blank"}, Turbo Frame (do
[pacote Hotwire Turbo](https://turbo.hotwired.dev/handbook/frames){:target="_blank"}) e *deploy*
com o [Netlify](https://www.netlify.com/blog/2020/04/02/a-step-by-step-guide-jekyll-4.0-on-netlify/){:target="_blank"}.
Mais para frente eu pretendo lançar um passo-a-passo ou tutorial do que eu fiz, quem sabe até
disponibilizar um *template* com este conjunto de ferramentas devidamente configuradas, sob alguma
uma licença *OpenSource*.
<!-- excerpt-end -->

## Contexto e motivação
Há um tempo já que venho pensando em ter o meu próprio domínio com alguma espécie de
currículo/portfólio. Em meados de Dezembro de 2020, aproveitei o [Github Pages](https://pages.github.com/){:target="_blank"}
para montar um blog/diário, sem nenhuma pretensão de divulgação, apenas com intuito de me
~~forçar~~ estimular a ter alguma organização e foco no que eu vinha estudando e desenvolvendo.

Como escrevi no meu [primeiro post]({% post_url pt-br/2020-12-10-meu-primeiro-post %}){:target="_blank"},
eu sempre invejei (no bom sentido) os blogs sobre programação, seja os com extensos e valiosos
tutoriais ou mesmo os com pequenos, e tão valiosos quanto, artigos do tipo **TIL** -
*"Today I Learned"*. Agora eu tenho meu humilde cantinho tecnológico.

## Desenvolvimento
Eu basicamente segui o
[passo-a-passo](https://mzrn.sh/2022/04/09/starting-a-blank-jekyll-site-with-tailwind-css-in-2022/)
de [Giorgi Mzrnsh](https://twitter.com/mzrnsh){:target="_blank"}, no qual consiste em criar um site
em branco com Jekyll através da flag `--blank` e configurar o
[jekyll-postcss](https://github.com/mhanberg/jekyll-postcss){:target="_blank"} e o Tailwind. Isso
não foi exatamente trivial, dei varias cabeçadas bobas do tipo mudar a estrutura de pastas e
esquecer de incluir na chave `content` do arquivo `tailwind.config.js`, entre outras.

Outro crédito importante que não posso deixar de mencionar é para
[Max Chadwick](https://twitter.com/maxpchadwick) que adaptou os temas CSS de *syntax highlighter*
do projeto [Pygments CSS](https://github.com/richleland/pygments-css){:target="_blank"} para
atender o padrão [WCAG](https://www.w3.org/WAI/WCAG2AA-Conformance){:target="_blank"} de
acessibilidade.

Como disse inicialmente, pretendo lançar um *template* com tudo que fiz aqui. Até lá o código deste
blog está disponível [neste repositório](https://github.com/callmarx/callmarx.dev){:target="_blank"}.

## Proximos passos

Depois de todo trabalho que tive criando esse layout, responsivo diga-se de passagem, ainda tenho
mais algumas ambições:
  - Aposentar meu antigo Github Pages, deixando apenas redirecionamentos dos posts para aqui.
  - Configurar multi-idioma para complementar meus estudos com a língua inglesa e dar uma cara de
    "internacional", já que se trata de um portfólio também;
  - Adicionar algumas funcionalidades com JS como *smooth scroll* para links internos da postagem,
    menu lateral etc. Quem sabe eu aproveito o pacote Hotwire e utilizo o Stimulus;
  - Implementar a opção *dark mode*, da qual o Tailwind já
    [possui cobertura](https://tailwindcss.com/docs/dark-mode){:target="_blank"}.
  - Continuar escrevendo aqui, claro.


Por agora, é isso.
![Thumbs Up Okay - gif](https://c.tenor.com/h3hKmL66_JUAAAAC/thumbs-up-okay.gif){: .align-center}

