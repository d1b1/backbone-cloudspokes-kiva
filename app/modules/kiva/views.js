define([
  "app",
  "backbone"
],
function(app, Bb) {
  
  var Views = {};

  // Define a variable to hold the selection. This is not
  // the best approach, but it works now.

  var selectedModel = 0;

  Views.Notes = Bb.View.extend({
    template: "kiva/notes",
    tagName: 'p',

    // bind the methods to form elements.
    events: {
      "click .moreNotes"   : function(evt, ui) {
        $('.notes').toggle();
      }
    },
  });

  // Setup a view to handle each item or tr. Each tr
  // maps to a visible model in the JSON collection of
  // kiva loans.

  Views.Item = Bb.View.extend({
    template: "kiva/item",

    tagName: 'tr',

    render: function(manage) {
      
      if (selectedModel == this.model.id) {
        this.options.className = 'selected';
      } else {
        this.options.className = '';
      }
      
      return manage(this).render();
    },

    // bind the methods to form elements.
    events: {
      "keyup input[type=text]"   : "onKeyUp",
      "focus input[type=text]"   : "setSelected",
      "keydown input[type=text]" : "onKeyDown"
    },

    // This is called each time the input is clicked
    // to set the focused.
    setSelected: function(evt, ui) {

      this.table.selected = this.model.id;

      selectedModel = this.model.id;
      
      // Remove the .selected class from any table elements.
      $('.selected').removeClass('selected');

      // Now add the selected to the current TR/TD selection.
      $(evt.target).parent().parent().addClass('selected');
    },

    // Sets a default values for the model.
    hasTime: false,

    // This function is bound to the input onKeyDown. This seems
    // like a candidate for a helper function or light validation
    // setup. 
    onKeyDown: function(evt, ui) {

      var charCode = (evt.which) ? evt.which : event.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
      }

      return true;
    },

    // This handles the on Key Up event and does to things, prevents
    // the entry of non-numeric values, as well as save the changes
    // to a model. It uses a timeout to debounce the model save and
    // collection sort and table render.

    onKeyUp: function(evt, ui) {

      // Last minute check to make certain we are not 
      // getting a characters. 
      var charCode = (evt.which) ? evt.which : event.keyCode;
      if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
      }

      // Ok if valid value, then we need to process the change.
      var $this = this;

      // hasTime can only be enabled once per model.
      // This prevents multiple updates per input
      // element.

      if ($this.hasTime == false) {
        $this.hasTime = true;

        // Set a timeOut to process the save when user enters data.
        setTimeout(function() {
          $this.hasTime = false;
          $this.model.set( { "pledge" : parseFloat($(evt.target).val()) }, {silent: false} );

          clearTimeout();

          // Ok, so we have altered the data, so now we 
          // force the collection to sort and render.
          $this.collection.sort();
     
        }, 800);
      }

    },

    // This function is used by the LayoutManager
    // to filter the model before it goes into the 
    // render function.

    serialize: function() {
      return {
        className  : this.options.className,
        inc        : this.options.inc,
        id         : this.model.get("id"),
        name       : this.model.get("name"),
        loan_amount: this.model.get("loan_amount"),
        status     : this.model.get("status"),
        use        : this.model.get("use"),
        activity   : this.model.get("activity"),
        town       : this.model.get("location").town,
        country    : this.model.get("location").country,
        pledge     : this.model.get("pledge")
      };
    },

    initialize: function() {

      // Set the table into the model scope.
      this.table = this.options.table;

    },

  });

  // Define the base Table for the display of the data.
  Views.List = Bb.View.extend({
    tagName: "table",

    className: "kivaTable",

    // bind the methods to form elements.
    events: {
      "click .savebutton": "saveKivaPledges"
    },

    // This method handles the collection and posting of the 
    // users loan and pledge amounts to the requestb.in. It will
    // only post data when at least one load pledge had been entered.
    // The save button should really use a collection method to change
    // its state, but its late...

    saveKivaPledges: function() {

      var data = [];
      var subCollection = this.collection.each(function(item, i) {
         if (item.has('pledge')) {
           data.push({ loan: item.get('id'), pledge: item.get('pledge') });
         }
      });

      if (data.length==0) {
        $('.message').html('<font color=red>Sorry, you need to pledge a bit a of green first...</font>').fadeOut(5000);
      } else {

        // Not a great solution. The Requestb.in site really needs 
        // better examples. God I hate messing with cross domain issues.
        // There must be a better way!

        $.post('http://requestb.in/1i9g7vo1?jsonp=pledgeData',
          JSON.stringify(data),
          'jsonp'
        );  

        $('.message').html('Posting your pledge to Requestb.in...').show().fadeOut(5000);
      }

    },

    // This is an extension of the BB render function for a view. It 
    // uses the attached collection and renders individual view for each
    // model in the collection. 

    render: function(manage) {

      var $this = this;
      var i = 0;
      this.collection.each(function(item) {

        // For each time in the collection, we need to 
        // create a view and pass in the model data.
        this.insertView(new Views.Item({
          inc        : i,
          model      : item, 
          collection : $this.collection,
          table      : $this
        }));

        // Increment the counter.
        i += 1;

      }, this);

      // Returns the manage method for the view render.
      return manage(this).render();
    },

    initialize: function() {
      
      var $this = this;

      // More table work arounds. This is not the greatest place
      // to bind the save button to a view method. Keeping the save
      // bound to this view makes sense, but the use of a table makes
      // the bb tagName smell off. 

      $('.savebutton').live('click', function() {
        $this.saveKivaPledges();
      });

      this.collection.on("reset", function() {

        // Call the render first.
        this.render();

        // After render, we need to move the users display
        // to ensure that the change is visible. Large data set
        // will require a scroll.

        if ($(".selected").length > 0) {
          $('html,body').animate({scrollTop: $(".selected").offset().top - 100}, 'slow');
          $('html,body').animate();


          // Simple way to keep the users in the flow of editing the 
          // loan amounts. This will set the focus and keep the browser
          // from selecting the entire value of the input element. 

          $(".selected input").focus().val($(".selected input").val());
        }

      }, this);

    }
  });

  // Ok we have our module views in a single namespace. So roll it
  // back to the previous AMD call.

  return Views;
});
