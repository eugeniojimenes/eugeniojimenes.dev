---
layout: post
title:  "Tutorial: Rails7, Tailwind e Hotwire"
date:   2021-12-07 17:48:12 -0300
tags: Tutorial Rails Ruby Tailwind Hotwire
main_image: /assets/svg/rails7-tailwind-hotwire.svg
image: /assets/images/rails7-tailwind-hotwire.webp
image_alt: "Rails 7 + Tailwind + Hotwire Logo"
description: >-
  Tutorial sobre Rails 7 com esbuild, tailwind e Hotwire(Turbo e Stimulus). Como desenvolver um
  aplicação estilo Kanban, com cards/tarefas e persistência simultânea via websockets.
categories: blog

---

Depois de meses desenvolvendo em Typescript com [NestJS](https://docs.nestjs.com/){:target="_blank"}
por demanda do meu atual trabalho, consegui um tempinho para meu tão amado Ruby on Rails. Melhor
ainda agora, como não trabalho oficialmente com Rails, posso me dar o luxo de me aventurar na
versão 7, recém lançada em modo alfa, em meus projetos pessoais.
<!-- excerpt-end -->

**OBS:** Pretendo escrever alguns artigos sobre minhas cabeçadas com NestJS e Typescript. Alguns
temas que pretendo abordar é *TypeOrm* com *migrations* e aplicação Multitenant usando PostgreSQL
RLS.
{: .note-info }

## Objetivo Geral
Neste tutorial eu pretendo desenvolver (e aprender) utilizando Rails 7, esbuild, Tailwind e Hotwire
(Turbo e Stimulus), mas meu foco será mais sobre o pacote Hotwire e como ele pode nos ajudar.
Conforme avanço nos estudos e na implementação, vou complementando este tutorial. Por enquanto
temos:
* [Parte 0: Rails 7](#etapa-zero---rails-7) → página atual
* [Parte 1: Tailwind]({% post_url 2021-12-09-tutorial-rails7-hotwire-parte-1 %}){:target="_blank"}
* [Parte 2: Hotwire Turbo]({% post_url 2021-12-19-tutorial-rails7-hotwire-parte-2 %}){:target="_blank"}
* ~~Parte 3: Hotwire Stimulus~~ → em breve

O pano de fundo é uma aplicação estilo Kanban, com um quadro em que podemos incluir, ver, editar e
excluir os cards/tarefas e isso ser persistido simultaneamente via *websockets* para todas as
sessões abertas da aplicação. Todo código esta disponível neste
[repositório](https://github.com/callmarx/LearningHotwire){:target="_blank"}. Note que incluí
algumas [*branches*](https://github.com/callmarx/LearningHotwire/branches/all){:target="_blank"} que
representam as partes abordadas aqui.

## Etapa Zero - Rails 7
Nesta parte inicial, explico como configurar o Rails 7, com suas novas opções, e como "dockerizar"
os bancos de dados PostgreSQL e Redis. O resultado final desta etapa é o disponível na *branch*
[blog-part-0](https://github.com/callmarx/LearningHotwire/tree/blog-part-0){:target="_blank"}.

### Criando um novo projeto com Rails 7
Utilizei as seguintes versões para este projeto:
```bash
$ ruby -v
# ruby 3.0.3p157 (2021-11-24 revision 3fb7d2cadc) [x86_64-linux]

$ rails -v
# Rails 7.0.0.rc1

$ yarn -v
# 1.22.17
```

Criei um novo projeto com o seguinte comando:
```bash
$ rails new LearningHotwire \
              -d=postgresql \
              --skip-test \
              -j esbuild \
              --css tailwind
```

Nada de novo nas duas primeiras *flags*: será uma aplicação com banco de dados PostgreSQL
(`-d=postgresql`) e sem o pacote padrão de testes com Minitest (`--skip-test`).

Nas duas últimas temos algumas novidades: escolho o [*esbuild*](https://esbuild.github.io/){:target="_blank"}
como *JavaScript bundler* (`-j esbuild`) e o [*tailwind*](https://tailwindcss.com){:target="_blank"}
como *CSS processor/framework* (`--css tailwind`). Estas novas flags correspondem as gemas
[*jsbundling-rails*](https://github.com/rails/jsbundling-rails){:target="_blank"} e
[*cssbundling-rails*](https://github.com/rails/cssbundling-rails){:target="_blank"}, incluídas
automaticamente no Gemfile.

### Algumas inclusões
No [Gemfile](https://github.com/callmarx/LearningHotwire/blob/blog-part-0/Gemfile){:target="_blank"}
eu removi os comentários e inclui algumas gemas ficando assim:

```ruby
# Gemfile
source "https://rubygems.org"
git_source(:github) { |repo| "https://github.com/#{repo}.git" }

ruby "3.0.3"
gem "rails", "~> 7.0.0.rc1"

gem "cssbundling-rails", ">= 0.1.0"
gem "jbuilder", "~> 2.7"
gem "jsbundling-rails", "~> 0.1.0"
gem "pg", "~> 1.1"
gem "puma", "~> 5.0"
gem "redis", "~> 4.0"
gem "sprockets-rails", ">= 3.4.1"
gem "stimulus-rails", ">= 0.7.3"
gem "turbo-rails", ">= 0.9.0"

gem "bootsnap", ">= 1.4.4", require: false

group :development, :test do
  gem "byebug"
  gem "rspec-rails", "~> 4.0.0"
end

group :development do
  gem "web-console", ">= 4.1.0"

  gem "foreman", require: false
  gem "rubocop", require: false
  gem "rubocop-packaging", require: false
  gem "rubocop-performance", require: false
  gem "rubocop-rails", require: false
  gem "rubocop-rspec", require: false
  gem "rubycritic", require: false
end
```

O Redis vem comentado automaticamente, mas vamos utilizá-lo mais a frente para o *ActionCable* com
o [turbo-rails](https://github.com/hotwired/turbo-rails){:target="_blank"}.

Nos blocos de `:development` e `:test` inclui algumas gemas para teste e lint. Não sei ainda se vou
ou não desenvolver testes, mas na dúvida instalei o RSpec com o comando padrão
`rails generate rspec:install` e inclui arquivos de configuração como
[.reek.yml](https://github.com/callmarx/LearningHotwire/blob/blog-part-0/.reek.yml){:target="_blank"},
[.rubocop.yml](https://github.com/callmarx/LearningHotwire/blob/blog-part-0/.rubocop.yml){:target="_blank"},
[.rubycritic.yml](https://github.com/callmarx/LearningHotwire/blob/blog-part-0/.rubycritic.yml){:target="_blank"},
entre outros.

### Docker
Para facilitar o desenvolvimento eu "dockerizei" o PostgreSQL e Redis com o seguinte
[docker-compose.yml](https://github.com/callmarx/LearningHotwire/blob/blog-part-0/docker-compose.yml){:target="_blank"}:

```yml
# docker-compose.yml
version: '3.4'

services:
  db:
    image: postgres:14-alpine
    container_name: learhot-db-ctr
    mem_limit: 256m
    command: -c fsync=off --client-min-messages=warning
    volumes:
      - db:/var/lib/postgresql/data
    ports:
      - "127.0.0.1:5432:5432"
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_INITDB_ARGS: '--encoding=UTF-8 --lc-collate=C --lc-ctype=C'
    restart: on-failure
    logging:
      driver: none

  redis:
    image: redis:6-alpine
    container_name: learhot-redis-ctr
    mem_limit: 256m
    volumes:
      - redis-data:/var/lib/redis/data
    ports:
      - "127.0.0.1:6379:6379"
    restart: on-failure
    logging:
      driver: none

volumes:
  db:
  redis-data:
```

Para se comunicar com esses bancos alterei o
[config/database.yml](https://github.com/callmarx/LearningHotwire/blob/blog-part-0/config/database.yml){:target="_blank"}
e o
[config/cable.yml](https://github.com/callmarx/LearningHotwire/blob/blog-part-0/config/cable.yml){:target="_blank"}:

```yml
# config/database.yml
default: &default
  adapter: postgresql
  encoding: UTF8
  host: localhost
  user: postgres
  password: postgres
  pool: <%= ENV.fetch("RAILS_MAX_THREADS") { 5 } %>

development:
  <<: *default
  database: LearningHotwire_development
  port: 5432

test:
  <<: *default
  database: LearningHotwire_development
  port: 5432

# config/cable.yml
development:
  adapter: redis
  url: <%= "#{ENV.fetch("REDIS_URL") { "redis://localhost:6379" }}/1" %>
  channel_prefix: LearningHotwire_development

test:
  adapter: async

production:
  adapter: redis
  url: <%= "#{ENV.fetch("REDIS_URL") { "redis://localhost:6379" }}/1" %>
  channel_prefix: LearningHotwire_production
```

### Procfile
Com as novas inclusões de *JavaScript bundler* e *CSS processor/framework*, o Rails 7 utiliza para
subir todo o ambiente de desenvolvimento a gema
[*foreman*](https://github.com/ddollar/foreman){:target="_blank"} que chama os processos listados
no arquivo
[Procfile.dev](https://github.com/callmarx/LearningHotwire/blob/blog-part-0/Procfile.dev){:target="_blank"}.
Isso tudo porque não mais apenas o servidor do Rails precisa ser executado em modo *watch*, ou
seja, em modo de reload automático (em inglês chamamos de *watch process*), mas agora também essas
duas novas inclusões.

Como incluímos o PostgreSQL e Redis no docker, podemos incluir também a chamada `docker-compose up`
no
[Procfile.dev](https://github.com/callmarx/LearningHotwire/blob/blog-part-0/Procfile.dev){:target="_blank"},
ficando assim:

```text
docker: docker-compose up
web: bin/rails server -p 3000
js: yarn build --watch
css: yarn build:css --watch
```

### Yay! You’re on Rails!
É isso. Basta agora executar o script disponível `bin/dev` que chama o *foreman* para o Procfile
que atualizamos.

```bash
# esse script já vem com permissão de execução
$ bin/dev
```

Você deve obter algo assim como saída no seu terminal:
![bin/dev](/assets/images/bin-dev.webp){: .align-center}

Não esqueça de criar o banco de dados. Você pode fazer isso agora na página web:
![create-db-web](/assets/images/create-db-web.webp){: .align-center}

Ou, em um outro terminal já que precisamos do docker em execução, utilize:
```bash
$ rails db:create
```

E acesse <http://localhost:3000/> e veja a clássica telinha do Rails.
![welcome-rails](/assets/images/welcome-rails.webp){: .align-center}

Por agora, é isso.
![cat leaving - gif](https://c.tenor.com/uICGiTPlUpgAAAAd/cat-leaving.gif){: .align-center }
