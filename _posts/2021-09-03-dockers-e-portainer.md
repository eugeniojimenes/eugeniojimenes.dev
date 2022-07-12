---
layout: post
title:  "Hoje eu aprendi: Gerenciar dockers locais com Portainer CE"
date:   2021-09-03 12:09:32 -0300
tags: Hoje-eu-aprendi Config Docker
image: /assets/images/portainer-docker.webp
image_alt: "Portainer + Docker Logo"
description: >-
  Mini tutorial de gerenciamento local de contêineres com Portainer CE.
categories: blog
header:
  og_image: assets/images/portainer-docker-ogimage.webp

---

Mesmo não sendo um especialista, e tendo bem claro isso, ficou óbvio que definitivamente sou um
entusiasta de contêineres. Hoje me deparei com a minha partição *root* do Linux quase cheia e por
qual motivo? Inúmeras imagens, volumes e contêineres, que a maior parte eu nem estava mais
utilizando, ocupando grande parte do espaço. Eis que o Google me sugere o mamão com mel que é
[Portainer CE](https://github.com/portainer/portainer){:target="_blank"}.
<!-- excerpt-end -->

## Primeiro de tudo

Ok vai... Isso de encher minha *root* por conta do docker já tinha ocorrido outras vezes, confesso.
O que fazia era *excluir tudo* e então baixar novamente o que fosse precisar. Até porque os
projetos em que atuo (pessoais e do trabalho) estão todos com
[docker compose](https://docs.docker.com/compose/){:target="_blank"} e até um *make file* com os
comandos pra subir tudo bonitinho,
[podem me julgar](https://youtu.be/w-8A4DbXcy4){:target="_blank"}. Acho legal fazer essa "limpeza"
de tempos em tempos, então segue o comando **por sua conta e risco**

```bash
$ docker container stop $(docker container ls --all -q)  # para todos os containers
$ docker system prune -a -f --volumes                    # exclui tudo, CUIDADO!
```
**Cuidado**: Com esses comandos você vai <u>EXCLUIR TODOS OS contêineres, imagens e volumes</u>
da onde for executado.
{: .note-warning }

## Mamão com mel

Para "instalar" o Portainer CE você precisa de duas linhas de comando, essa GUI é ironicamente
executada em docker :)

```bash
$ docker volume create portainer_data
$ docker run -d -p 8000:8000 -p 9000:9000 --name=portainer --restart=always -v /var/run/docker.sock:/var/run/docker.sock -v portainer_data:/data portainer/portainer-ce
```

O primeiro comando cria um volume que será utilizado pelo Portainer que é executado pelo segundo
comando. Nada mais preciso ser feito, basta acessar o endereço <http://localhost:9000/>. No
primeiro acesso ele vai pedir o pra você criar um login de acesso, pessoalmente não ligo isso,
ponho qualquer coisa, afinal é para uso pessoal e local para desenvolvimento.

Você deve ver algo assim na *home* se tudo der certo:
![Portainer Home](/assets/images/portainer-home.webp)

## Já passei por isso

Talvez você não obtenha um endpoint listando seus contêineres, volumes e imagens, com uma
notificação "*Object not found inside the database*", algo como a imagem a seguir.

![Portainer Error](/assets/images/portainer-error.webp)

Depois de pesquisar um pouco encontrei a solução
[aqui](https://github.com/portainer/portainer/issues/3562#issuecomment-620579326){:target="_blank"}.
Bastou limpar o *Storage* de <http://localhost:9000> do meu navegador. No chromium você faz isso em
"*Application* > *Storage* > *Clear site data*". Como eu não soube fazer isso de cara (e ninguém
têm obrigação de saber), fiz o *screenshot* abaixo para mostrar esse cominho.

![Clear Storage](/assets/images/portainer-clear-storage.webp)

Por agora, é isso.
