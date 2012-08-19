require([
  "app",
  "jquery",
  "backbone",
  "modules/kiva",
],
function(app, $, Bb, Kiva) {

  // Defining the application router.
  var Router = Bb.Router.extend({
    routes: {
      "": "index"
    },

    index: function() {
      // Create a collection for the kiva loans.
      var list = new Kiva.List();

      window.theData = list;

      // This create a Backbone Layout manager for the route. This
      // allows the user to attach more then one view to an element 
      // and render all into the DOM as a single action. 

      var main = new Bb.LayoutManager({
        template: "main",

        views: {
          ".kivaNotes": new Kiva.Views.Notes(),

          ".kivatableHolder": new Kiva.Views.List({
            collection: list
          }),

        }
      });

      // This pattern was part of the most recent code in the 
      // example provided in the 'bbb init:todomcv' example. It
      // appears to attach the rendered HTML to the DOM #main
      // before it is actually rendered. This seems like an interest
      // way to stage content into the UI.

      main.$el.appendTo("#main");

      // Render the main.
      main.render();

      // Call the collection and its mapped end point to
      // retrieve the JSON data for loans.

      list.fetch();

      // Hacky - this is not a great solution. But since I almost
      // never use tables in HTML anymore, I figure it will work 
      // for now. This will add a table Header to the view once
      // the table is build. It seems better to use the fewer views
      // and try out the tagName : 'table', and this approach of 
      // adding the table header elements late in the render.

      $('.kivaTable').prepend( $('<thead class="theader">\
                                   <tr>\
                                    <th width="5%">Loan</th>\
                                    <th width="15%">Name</th>\
                                    <th width="30%">Activity</th>\
                                    <th width="10%">State</th>\
                                    <th width="5%">Amount</th>\
                                    <th width="20%">Location</th>\
                                    <th width="15%" >Pledge</th>\
                                   </tr>\
                                  </thead>')
                                 );

     // Supper hacky, but DRY and easy to work with. This code will
     // find the element with class name .selected and scroll the users
     // view up or down. Since the collection and view will re-render 
     // each time a pledge amount changes, it was a better UI if the 
     // user was able to follow a given model as it moved up or down in
     // the table.

     // Moved this into the module. Still working 
     // with the correct placements. 
     // // $('html,body').animate({scrollTop: $('.selected').position.top},'slow');

    }
  });

  // SS - All comments below are form the github boilerplate project. Not my work.
  // --------------------------------------------------------------

  $(function() {
    // Define your master router on the application namespace and trigger all
    // navigation from this instance.
    app.router = new Router();

    // Trigger the initial route and enable HTML5 History API support
    Bb.history.start({ pushState: true });
  });

  // All navigation that is relative should be passed through the navigate
  // method, to be processed by the router.  If the link has a data-bypass
  // attribute, bypass the delegation completely.
  $(document).on("click", "a:not([data-bypass])", function(evt) {
    // Get the anchor href and protcol
    var href = $(this).attr("href");
    var protocol = this.protocol + "//";

    // Ensure the protocol is not part of URL, meaning its relative.
    if (href && href.slice(0, protocol.length) !== protocol &&
        href.indexOf("javascript:") !== 0) {
      // Stop the default event to ensure the link will not cause a page
      // refresh.
      evt.preventDefault();

      // `Backbone.history.navigate` is sufficient for all Routers and will
      // trigger the correct events.  The Router's internal `navigate` method
      // calls this anyways.
      Bb.history.navigate(href, true);
    }
  });

});
