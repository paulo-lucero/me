---
layout: project
short_description: "A web app that provides current weather data"
technologies:
  - OpenWeatherMap API
  - Geolocation API
  - Javascript
  - Sass
  - HTML
  - Babel
title:  "Weather App"
image: "/assets/images/projects/my-weather.jpg"
---
# Key points

- Uses the **OpenWeatherMap API** to provide the location, weather state, and temperature based on the visitor's coordinates.
- Uses the **Geolocation API** to retrieve the visitor's location coordinates for the **OpenWeatherMap API**.
- The displayed temperature unit can be changed from Celsius to Fahrenheit or vice versa.
- Weather data is reused if the visitor’s location coordinates haven’t changed and significant time has not yet passed.
- Responsive design.

# Tools used

{% for tech in page.technologies %}
- {{ tech }}
{% endfor %}

# Url

[paulo-lucero.github.io/myweather/](https://paulo-lucero.github.io/myweather/)

# Repository

[github.com/paulo-lucero/myweather](https://github.com/paulo-lucero/myweather)
