define([
  "app",

  // Libs
  "backbone",

  // Modules
  "modules/kiva/views",

  // Plugins
],

function(app, Backbone, Views) {

  var Kiva = app.module();

  Kiva.Model = Backbone.Model.extend({

    // This adds a pledge attribute to the defaults, and 
    // to all models as they are mapped into the collection.
    defaults: {
      pledge: null
    }

  });

  // This defines the Collection for all client side
  // models.
  Kiva.List = Backbone.Collection.extend({

    model: Kiva.Model,

    // Defins the JSON loan endpoint.
    url: 'http://api.kivaws.org/v1/loans/newest.json',

    // Use the parse() method to extra a specific value
    // from the JSON data source.
    parse: function (response) {
      return response.loans;
    },

    // The comparator ensures that the collection 
    // remains sorted in order.
    comparator: function( loan ) {
      return -loan.get("pledge");
    }

  });

  Kiva.Views = Views;

  return Kiva;

});
