coffeeify = require 'coffeeify'

exports.config =
  paths:
    public: './public'
    watched: ['app']

  files:
    javascripts:
      joinTo:
        '/js/options.js': /^(app[\/\\]coffee)/
    stylesheets:
      joinTo:
        '/css/master.css': /^(app[\/\\]scss)/
        '/css/fonts.css': /^(app[\/\\]scss[\/\\]font)/
  npm:
    enabled: false

  conventions:
    assets: /assets[\\/](?!javascripts)/

  plugins:
    cleancss:
      keepSpecialComments: 0
      removeEmpty: true
    sass:
      mode: 'native'
      debug: 'comments'
      allowCache: true
    cssnano:
      # Optimize z-index levels
      index: true
      # Autoprefix CSS3 properties
      autoprefixer: {add:true}
    fingerprint:
      # Mapping fingerprinted asets
      targets: '*'
      environments: ['production']
      alwaysRun: false
      manifestGenerationForce: true
      manifest: './config/assets.json'
      srcBasePath: 'public'
      destBasePath: 'public'
      autoClearOldFiles: false
    browserify:
      extensions: """
      js coffee
      """
      bundles:
        'js/index.js':
          entry: 'app/index.coffee'
          matcher: /^app/
          onBrowserifyLoad: (bundler) ->
            bundler.transform coffeeify,
              bare: false
              header: true
          onBeforeBundle: (bundler) -> console.log 'onBeforeBundle'
          onAfterBundle: (error, bundleContents) -> console.log 'onAfterBundle'
          instanceOptions: {}
