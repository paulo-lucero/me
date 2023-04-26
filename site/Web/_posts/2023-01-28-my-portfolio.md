---
layout: project
short_description: "My portfolio website"
technologies:
  - Javascript
  - Ruby
  - Sass
  - HTML
  - Jekyll
  - Webpack
title:  "My Portfolio"
image: "/assets/images/projects/my-portfolio.jpg"
---
# Key points

- Simple design. Focuses more on content and interaction visibility. Inspired by material design.
- The static site generator used is **Jekyll**.
- I have written a custom markdown processor to automate adding a CSS class for non-highlighted code elements so they can be easily styled separately.
- Animation is done through javascript instead of css, so I can focus more on creating predictable html structure and ease of css styling.
- Responsive design.

# Tools used

{% for tech in page.technologies %}
- {{ tech }}
{% endfor %}

# Url

[paulo-lucero.github.io/me/](https://paulo-lucero.github.io/me/)

# Repository

[github.com/paulo-lucero/me](https://github.com/paulo-lucero/me)
