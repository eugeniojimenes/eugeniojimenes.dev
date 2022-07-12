---
layout: post
title:  "Hoje eu aprendi: configurar verificador ortográfico PT-BR no editor Vim"
date:   2021-04-25 14:02:53 -0300
tags: TIL Vim Config
image: /assets/images/vim-br.webp
image_alt: "Vim + Reginaldo Rossi"
description: >-
  Como configurar verificador ortográfico (spellcheck) para português brasileiro no seu vim.
categories: blog
header:
  og_image: assets/images/vim-logo.webp

---

Editando esse mesmo blog em meu **vim** (utilizo o [Jekyll](https://jekyllrb.com){:target="_blank"})
me questionei: "Porque diabos estou usando o Google Docs como corretor?". Decidi então buscar como
configurar meu próprio **vim** - na verdade **nvim**, cheio plugins e firulas visuais - para fazer
este trabalho e me poupar dos CTRL+C e CTRL+V.
<!-- excerpt-end -->

## Mãos à obra

Primeiro precisamos fazer download do
[VERO](https://pt-br.libreoffice.org/projetos/vero/){:target="_blank"} - VERificador Ortográfico do
LibreOffice - e descompactá-lo para então gerar o arquivo de *spellcheck* do **vim**.

```bash
$ cd ~/Downloads
$ wget https://pt-br.libreoffice.org/assets/Uploads/\
PT-BR-Documents/VERO/VeroptBRV320AOC.oxt

$ unzip -x VeroptBRV320AOC.oxt
```
**Obs**: Caso não baixe, dê erro 404, por exemplo, verifique no site do libreoffice se o link não mudou ou
expirou.
{: .note-warning }

Agora vamos utilizar o próprio **vim** para compilar o arquivo de correção em português brasileiro:

```bash
# Na pasta onde você baixou e descompactou o Vero, abra o vim
$ vim

# dentro do vim excute
:mkspell pt pt_BR
# Vá dando ENTER até finalizar a compilação

# Saia do vim
:q
```

Com isso o arquivo ```pt.utf-8.spl``` foi gerado, agora basta copiá-lo para a pasta ```/spell/```
do seu **vim**.

```bash
# Caso utilize o vim (não o nvim, nem o gvim) copie o arquivo
# com o seguinte comando:
$ sudo cp pt.utf-8.spl /usr/share/vim/vim*/spell/

# Caso utilize nvim:
$ sudo cp pt.utf-8.spl /usr/share/nvim/runtime/spell/
```

Agora basta especificar no seu arquivo configuração, ```~/.vimrc``` para o **vim** ou
```~/.config/nvim/init.vim``` para o **nvim**. Note que não habilitei globalmente o corretor,
apenas para os arquivos do tipo texto ou Markdown. Fique à vontade para incluir outros tipos que
lhe for conveniente.

```vim
" SpellCheck
:set spelllang=pt-BR
autocmd FileType md,markdown,txt,text, setlocal spell spelllang=pt,en
```

Pronto! Minha dislexia agradece.
![Dyslexia cure - gif](https://c.tenor.com/Frkh91Ts3i8AAAAC/dyslexia-cure.gif){: .align-center }
