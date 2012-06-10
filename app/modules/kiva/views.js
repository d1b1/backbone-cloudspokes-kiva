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

    events: {
      "keyup input[type=text]": "updateOnEnter",
      "focus input[type=text]": "setSelected"
    },

    setSelected: function(evt, ui) {

      this.table.selected = this.model.id;

      console.log(this.table.selected,'setting selected');
    },

    hasTime: false,

    updateOnEnter: function(evt, ui) {

      var $this = this;
      if ($this.hasTime == false) {

        $this.hasTime = true;

        timeout = setTimeout(function() {
          $this.hasTime = false;
          $this.model.set("loan_amount", $(evt.target).val());

          $this.collection.sort();

        }, 200);
      }

    },

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

      this.table = this.options.table;

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

        console.log(item.id, this.selected);

        item.dd = (this.selected == item.id);
        console.log(item);
        
        this.insertView(new Views.Item({
          model: item, 
          collection: $this.collection,
          table: $this,
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
