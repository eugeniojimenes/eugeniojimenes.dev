---
layout: post
title: "Dyslexic Diary: Now with my own domain"
date: 2022-07-13 20:12:51 -0300
locale: en_US
lang-ref: now-with-my-domain
tags: Jekyll Hotwire Tailwind
main_image: /assets/svg/jekyll-netlify.svg
image: /assets/images/jekyll-netlify.webp
image_alt: "Jekyll and Netlify logos"
image_light_bg: true
description: >-
  I rebuilt my blog using Jekyll, Tailwind, and Hotwire Turbo.

---

I rebuilt my blog: from scratch with [Jekyll](https://jekyllrb.com){:target="_blank"},
[Tailwind](https://tailwindcss.com/docs/installation){:target="_blank"}, Turbo Frame (from
[Hotwire Turbo package](https://turbo.hotwired.dev/handbook/frames){:target="_blank"}), and deployed it
with [Netlify](https://www.netlify.com/blog/2020/04/02/a-step-by-step-guide-jekyll-4.0-on-netlify/){:target="_blank"}.
Later on, I plan to release a step-by-step guide or tutorial of what I did, maybe even offer a template
with these tools properly configured under an open-source license.
<!-- excerpt-end -->

## Context and motivation
For some time now, I've been thinking about having my own domain with some kind of resume/portfolio.
In mid-December 2020, I used [Github Pages](https://pages.github.com/){:target="_blank"} to set up a blog/diary,
with no intention of promotion, just to force myself to have some organization and focus on what I was studying
and developing.

As I wrote in my [first post]({% post_url 2020-12-10-my-first-post %}){:target="_blank"},
I've always admired (in a good way) programming blogs, whether they feature extensive and valuable tutorials or
even those with small yet valuable **TIL** ("Today I Learned") articles. Now, I have my humble technological corner.

## Development
I basically followed the
[step-by-step guide](https://mzrn.sh/2022/04/09/starting-a-blank-jekyll-site-with-tailwind-css-in-2022/)
by [Giorgi Mzrnsh](https://twitter.com/mzrnsh){:target="_blank"}, which involves creating a blank site
with Jekyll using the `--blank` flag and setting up
[jekyll-postcss](https://github.com/mhanberg/jekyll-postcss){:target="_blank"} and Tailwind. This
wasn't exactly trivial; I made several silly mistakes like changing folder structures and forgetting
to include them in the `content` key of the `tailwind.config.js` file, among others.

Another important credit I cannot fail to mention is to
[Max Chadwick](https://twitter.com/maxpchadwick) who adapted the CSS themes for the *syntax highlighter*
from the [Pygments CSS project](https://github.com/richleland/pygments-css){:target="_blank"} to
meet the [WCAG](https://www.w3.org/WAI/WCAG2AA-Conformance){:target="_blank"} accessibility standard.

As I mentioned earlier, I intend to release a template with everything I did here. Until then, the code for
this blog is available [in this repository](https://github.com/eugeniojimenes/eugeniojimenes.dev){:target="_blank"}.

## Next steps

After all the work I put into creating this layout, which is responsive, by the way, I still have
some ambitions:
  - Retire my old Github Pages, leaving only redirects from posts to here.
  - Set up multi-language support to complement my English language studies and give it an "international" feel,
    since it's also a portfolio;
  - Add some JS functionalities like smooth scroll for internal post links, sidebar menu, etc. Maybe I'll use
    the Hotwire package and utilize Stimulus;
  - Implement the *dark mode* option, which Tailwind already
    [covers](https://tailwindcss.com/docs/dark-mode){:target="_blank"}.
  - Keep writing here, of course.

For now, that's it.
![Thumbs Up Okay - gif](https://c.tenor.com/h3hKmL66_JUAAAAC/thumbs-up-okay.gif){: .align-center}

