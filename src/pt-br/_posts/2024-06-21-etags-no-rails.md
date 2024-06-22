---
layout: post
title:  "Hoje eu aprendi: Etags no Rails"
date:   2024-06-21 13:10:53 -0300
locale: pt_BR
lang-ref: etags-in-rails
tags: TIL Ruby Rails Etag Cache
image: /assets/images/paper-tag.webp
image_alt: "Uma etiqueta de papel marrom claro presa com um pedaço de corda de juta."
description: >-
  Quando e como usar Etags no Rails.

---

Estava eu estudando sobre cache de navegador quando percebi que não sabia direito como usar Etags no Ruby on
Rails. Então, surgiu a excelente oportunidade para este "Hoje eu aprendi".
<!-- excerpt-end -->

## O que são ETags?
ETags (Entity Tags) fazem parte da especificação HTTP que ajuda a otimizar o desempenho da web, permitindo requisições
GET condicionais. Elas fornecem uma maneira para os servidores web informarem aos navegadores que a resposta a uma
solicitação GET não mudou desde a última solicitação, permitindo que o navegador recupere a resposta de seu cache em
vez de baixá-la novamente.

#### Como as ETags Funcionam
Elas funcionam usando os cabeçalhos `HTTP_IF_NONE_MATCH` e `HTTP_IF_MODIFIED_SINCE` para passar um identificador de
conteúdo único e o timestamp da última modificação do conteúdo entre o navegador e o servidor. Se o ETag ou
o timestamp da última modificação do navegador corresponder à versão do servidor, o servidor envia uma
resposta vazia com o status `304 Not Modified`, indicando que a versão em cache ainda é válida.

## Usando ETags no Rails
No Rails, o suporte a GET condicional é implementado usando ETags e os métodos `stale?` e `fresh_when`. Veja como
usá-los:

#### Usando `stale?`
O método `stale?` verifica se uma solicitação está obsoleta com base no carimbo de data/hora e no valor do ETag
fornecidos. Se a solicitação estiver obsoleta, o bloco é executado; caso contrário, uma resposta `304 Not Modified` é
enviada automaticamente.
```ruby
class ProductsController < ApplicationController
  def show
    @product = Product.find(params[:id])

    if stale?(last_modified: @product.updated_at.utc, etag: @product.cache_key_with_version)
      respond_to do |format|
        # Processamento normal da resposta
      end
    end
  end
end
```
Você também pode passar um *model* diretamente para `stale?`, que usa os métodos `updated_at` e
`cache_key_with_version` do *model*.
```ruby
class ProductsController < ApplicationController
  def show
    @product = Product.find(params[:id])

    if stale?(@product)
      respond_to do |format|
        # Processamento normal da resposta
      end
    end
  end
end

```

#### Usando `fresh_when`
O método `fresh_when` é um atalho para definir os cabeçalhos `last_modified` e `etag`. Ele envia uma resposta
`304 Not Modified` se a solicitação estiver ainda valida ou renderiza o template padrão se estiver obsoleta.
```ruby
class ProductsController < ApplicationController
  def show
    @product = Product.find(params[:id])
    fresh_when last_modified: @product.updated_at.utc, etag: @product
  end
end
```
#### Usando `http_cache_forever`
Para páginas estáticas que "nunca" expiram, use o helper `http_cache_forever` . Isso define o cabeçalho `last_modified`
para uma data fixa e o cabeçalho `expires` para 100 anos no futuro. Por padrão, as respostas em cache serão privadas,
armazenadas apenas no navegador do usuário. Para permitir que proxies armazenem a resposta em cache, use
`http_cache_forever(public: true)` para indicar que eles podem servir a resposta em cache para todos os usuários.
```ruby
class HomeController < ApplicationController
  def index
    http_cache_forever(public: true) do
      render
    end
  end
end
```
**Atenção:** Use este método com cuidado, pois o navegador/proxy não poderá invalidar a resposta em cache a menos que o
cache do navegador seja limpo à força. Com essa abordagem, o Rails envia o cabeçalho de cache de 100 anos
`Cache-Control: public, max-age=31536000`.
{: .note-warning }

Aqui está uma abordagem melhor com `fresh_when` em vez de usar `http_cache_forever`:
```ruby
class HomeController < ApplicationController
  def index
    # lmd rastreia o horário da última modificação do arquivo da view. Isso poderia ser feito por
    # `lmd = File.mtime(Rails.root.join("app/views/home/index.html.erb")).utc`,
    # mas em vez de verificar o timestamp da view em cada solicitção, é melhor
    # definir a data da última modificação e atualizá-la quando a view for alterada.
    lmd = Time.parse("2024-06-12 22:39:18 UTC").utc
    fresh_when last_modified: lmd, etag: lmd, public: true
    render
  end
end
```
Outra (e muito melhor) abordagem é usar `response.body` como rastreador para o ETag:
```ruby
class HomeController < ApplicationController
  def index
    response.etag = response.body # quando a view for alterada, o response.body também será diferente
    fresh_when etag: response.etag, public: true
  end
end
```

### ETags Fortes vs. Fracas
O Rails gera ETags fracas por padrão, que são prefixadas com `W/` e permitem que respostas semanticamente equivalentes
tenham o mesmo ETag. ETags fortes, que não têm esse prefixo, implicam que a resposta deve ser idêntica byte a byte.

#### Gerando ETags Fortes
Para gerar um ETag forte no Rails, use a opção `strong_etag` com `fresh_when`:
```ruby
class ProductsController < ApplicationController
  def show
    @product = Product.find(params[:id])
    fresh_when last_modified: @product.updated_at.utc, strong_etag: @product
  end
end
```
Você também pode definir o ETag forte diretamente na resposta:

```ruby
# A linha a seguir define apenas o ETag forte.
# Você ainda precisa de `stale?` ou `fresh_when` para rastrear a atualização desejada do cache
response.strong_etag = response.body # => "618bbc92e2d35ea1945008b42799b0e7"
```
**Nota:** O ETag forte é útil ao fazer solicitações de intervalo (uma solicitação que pede ao servidor para enviar
apenas uma parte de uma mensagem HTTP de volta a um cliente) dentro de um grande arquivo de vídeo ou PDF. Alguns CDNs
suportam apenas ETags fortes.
{: .note-info }

## Referências
 - <https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/ETag>
 - <https://guides.rubyonrails.org/caching_with_rails.html#conditional-get-support>
