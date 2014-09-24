(function(){

  window.app = window.app || {};

  window.app.FeaturedItems = function(items, config) {

    this.initialize = function(items, config) {
      config = config || {};
      // Container
      this.container = $(config.container || '#featured-items');

      if (items) {
        this.setItems(items);
      }

    };

    this.setItems = function(items) {
      if (items) {
        // Reset container
        this.container.empty();
        // Run application view builder
        new _viewCollection({
          container: this.container,
          items: items
        });
      }
    };

    // Templates

    this.templates = {
      container: ' \
        <div class="container-fluid"> \
          <div id="featured-items-container" class="row-fluid"> \
          </div> \
        </div> \
      ',
      item: ' \
          <h4><%= title %></h4> \
          <a href="store.html?vid=<%= vendorid %>&iid=<%= itemid %>"><img src="<%= cimage %>"/></a> \
          <div class="prev-price"> \
            <label>was:</label> \
            <span>$ <%= listprice %></span> \
          </div> \
          <div class="price"> \
            <label>On Sale:</label> \
            <span>$ <%= price %></span> \
          </div> \
          <form class="form-inline"> \
            <a href="store.html?vid=<%= vendorid %>&iid=<%= itemid %>">About this item</a> \
            <button class="btn btn-info btn-small buy-button" type="button">Buy</button> \
          </form> \
      '
    };

    // Private inaccesible methods
    var _model = Backbone.Model.extend({
      
      url: function() {
        return baselink + 'getitems.ajx?itemid=' + this.get('itemid') + '&vid=' + vid;
      },

      parse: function(response) {
        var data = response.__Result[0];
        data.cimage = data.cimage.replace(/^store\//, "");
        data.listprice = data.prices[0].listprice.toFixed(2);
        data.price = data.prices[0].price_1.toFixed(2);
        return data;
      },

      initialize: function(options) {
        this.set('itemid', options.itemid);
      }
    });

    var _collection = Backbone.Collection.extend({
      model: _model
    });

    var _viewModel = Backbone.View.extend({
      
      tagName: 'div',

      className: 'span3 featured-item',

      template: _.template(this.templates.item),

      events: {
        "click .buy-button" : "_goToUrl"
      },

      initialize: function(options) {
        var self = this;
        // Wait for data, then renders itself 
        this.model.on("change", function(model){
          self.render();
        });
        this.model.fetch();
      },

      render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        this._adjustBox();
      },

      _adjustBox: function() {
        var bigger = 0;
        $('.featured-item h4').each(function(idx, obj){
          bigger = ($(obj).height() > bigger) ? $(obj).height() : bigger;
        });

        $('.featured-item h4').css('height', bigger + 'px');
      },

      _goToUrl: function() {
        window.location = baselink + 'store.html?vid=' + this.model.get('vendorid') + '&iid=' +  this.model.get('itemid');
      }

    });

    var _viewCollection = Backbone.View.extend({
      
      template: _.template(this.templates.container),

      views: [],

      initialize: function(config) {
        this._items = (typeof config.items === "string") ? config.items.split(',') : config.items;
        this._models = this._loadModels(this._items);
        this._collection = this._loadCollection(this._models);
        
        if (config.container) {
          this.setElement(config.container);
        }

        // Create container from template
        this.$el.html(this.template());

        this.render();
      },

      // Private view methods

      _loadCollection: function(models) {
        return new _collection(models);
      },

      _loadModels: function(ids) {
        return _.map(ids, function(id){
          return new _model({itemid: id});
        });
      },

      // Models need to be loaded before they can be added to the collection for proper

      _renderReady: function(renderedView) {
        this.views.push(renderedView);
        if (this.views.length === this._collection.length) {
          this.$el.find('#featured-items-container').html(this.template({elements: this.views.join('')}));  
        }
        return true;
      },

      render: function() {
        var container = this.$el.find('#featured-items-container');
        container.empty();
        _.each(this._collection.models, function(model){
          var view = new _viewModel({model: model});
          container.append(view.$el);
        });
      }
    });

    // Call constructor
    this.initialize(items,config);
  };
})();