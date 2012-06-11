define([
  "app",

  // Libs
  "backbone"
],

function(app, Backbone) {
  
  var Views = {};

  Views.Item = Backbone.View.extend({
    template: "kiva/item",

    tagName: 'tr',

    // bind the methods to form elements.
    events: {
      "keyup input[type=text]": "updateOnEnter",
      "focus input[type=text]": "setSelected"
    },

    // This is called each time the input is clicked
    // to set the focused.
    setSelected: function(evt, ui) {

      
      // this.table.selected = this.model.id;

      console.log(this.table,'setting selected', this.model.id);
    },

    // Sets a default values for the model.
    hasTime: false,

    updateOnEnter: function(evt, ui) {

      var $this = this;

      // hasTime can only be enabled once per model.
      // This prevents multiple updates per input
      // element.

      if ($this.hasTime == false) {
        $this.hasTime = true;

        // Set a timeOut to process the save when user enters data.
        setTimeout(function() {
          $this.hasTime = false;
          $this.model.set("loan_amount", $(evt.target).val());

          $this.model.requestBin();

          // Ok, so we have altered the data, so now we 
          // force the collection to sort and render.

          $this.collection.sort();
        }, 200);
      }

    },

    // This function is used by the LayoutManager
    // to filter the model before it goes into the 
    // render function.

    serialize: function() {
      return {
        id         : this.model.get("id"),
        name       : this.model.get("name"),
        loan_amount: this.model.get("loan_amount"),
        status     : this.model.get("status"),
        country    : this.model.get("location").country
      };
    },

    initialize: function() {

      // Set the table into the model scope.
      this.table = this.options.table,

      this.model.on("change", function() {
        this.render();
      }, this);

      this.model.on("destroy", function() {
        this.remove();
      }, this);
    },

  });

  Views.List = Backbone.View.extend({
    tagName: "table",

    selected: 0,

    render: function(manage) {

      var $this = this;

      this.collection.each(function(item) {
        this.insertView(new Views.Item({
          model: item, 
          collection: $this.collection,
          table: $this
        }));
      }, this);

      return manage(this).render();
    },

    initialize: function() {

      this.collection.on("reset", function() {
        this.render();
      }, this);

      this.collection.on("add", function(item) {
        this.insertView(new Views.Item({
          model: item
        })).render();

      }, this);


    }
  });

  return Views;

});
