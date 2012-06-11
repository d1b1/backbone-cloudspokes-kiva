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

    requestBin: function() {
      var $this = this;

      $.post('http://requestb.in/1i9g7vo1',
        $this.toJSON(),
        function() { alert('asdf'); },
        'json'
      );

    }

  });

  Kiva.List = Backbone.Collection.extend({

    model: Kiva.Model,

    url: 'http://api.kivaws.org/v1/loans/newest.json',

    parse: function (response) {
      return response.loans;
    },

    comparator: function( loan ) {
      return -loan.get("loan_amount");
    }

  });

  Kiva.Views = Views;

  return Kiva;

});
