# About
The repository of my [portfolio](https://paulo-lucero.github.io/me/) website.

# Requirements
* **[Ruby](https://www.ruby-lang.org/en/downloads/)**
  * You may also refer to [jekyllrb.com/docs/installation/](https://jekyllrb.com/docs/installation/)
* **RubyGems**, needed for installing Jekyll and other gems
  * In newer versions of Ruby, RubyGems is already included, you may check it by executing `gem -v`
* **Bundler**, for tracking and managing gems dependencies
  * Install it by executing `gem install bundler`
  * By default, the gems will install on `<project_directory>/gems_lib/bundle/`. You can change it, [Learn how](https://jekyllrb.com/tutorials/using-jekyll-with-bundler/)
* **[Node.js](https://nodejs.org/en/download)**
  * You can also use version managers like [nvm](https://github.com/nvm-sh/nvm)
* **npm**
  * In newer versions of Node.js, npm is already included, you may check it by executing `npm -v`

# Set up
After meeting the requirements, just execute these commands to install the necessary packages.
```bash
$ bundle install
$ npm install
```

For building the site.
```bash
$ npm run start # build the site in development environment and serve it locally. It includes the draft posts.
```

Or

```bash
$ npm run build # build the site in production environment, It doesn't include the draft posts.
```

Optionally, you can also do this:
```bash
$ npm run serve-build # build the site in production environment and serve it locally.
```