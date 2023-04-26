---
layout: project
short_description: "A web app that provides random quotes"
technologies:
  - React
  - Javascript
  - Sass
  - HTML
  - create-react-app
  - svgo
title:  "Random Quotes App"
image: "/assets/images/projects/random-quote.jpg"
---
# Key points

- The web app displayed one quote at a time, but it stores up to 10 quotes. The visitor can visit a previous quote or request a new one.
- For touch screen devices, the quotes can be changed by swiping.
- Can request a new quote/s or visit the previous ones during mid-animation, regardless of direction.
- The quotes can be tweeted.
- Built on the **Create React App** toolchain.
- Responsive design.

# Tools used

{% for tech in page.technologies %}
- {{ tech }}
{% endfor %}

# Url

[paulo-lucero.github.io/randomquote/](https://paulo-lucero.github.io/randomquote/)

# Repository

[github.com/paulo-lucero/randomquote](https://github.com/paulo-lucero/randomquote)
