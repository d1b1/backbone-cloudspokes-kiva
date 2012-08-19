// Set the Require.js elements.
require.config({
  // Setup the Main application file
  deps: ["main"],

  paths: {
    // JavaScript folders
    libs: "../assets/js/libs",
    plugins: "../assets/js/plugins",

    // Libraries
    jquery: "../assets/js/libs/jquery",
    lodash: "../assets/js/libs/lodash",
    backbone: "../assets/js/libs/backbone"
  },

  shim: {
    backbone: {
      deps: ["lodash", "jquery"],
      exports: "Backbone"
    },
    // Add the Backbone LocalStorage plugin in
    "plugins/backbone.layoutmanager": {
      deps: ["backbone"]
    }
  }
});
