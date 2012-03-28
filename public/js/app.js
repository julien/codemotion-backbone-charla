(function () {
  var root = this,
    app = root.app || {};

  $(function () {

    app.User = Backbone.Model.extend({
      url: '/users',
      
      // When working with a model
      // that does not belong to a 
      // Backbone.Collection
      // use the urlRoot property
      // urlRoot: '/user',
      
      validate: function (attrs) {
        // console.log('validating ...');
        if (!attrs.name) return 'A name is required';
        
        if (attrs.name.length < 4) 
          return 'Name must be at least 4 characters long';
      }   
    });

    app.Users = Backbone.Collection.extend({
      model: app.User,
      url: '/users'
    });

    app.UserView = Backbone.View.extend({
      tagName: 'li',
      
      template: _.template($('#tpl-user').html()),

      events: {
        'click #edit': 'onEditClick',
        'click #delete': 'onDeleteClick'
      },

      initialize: function () {
        _.bindAll(this);
        this.model.on('change', this.render, this);
      },

      render: function () {
        this.$el.html(this.template(this.model.toJSON())); 
        return this;
      },

      onEditClick: function (e) {
        e.preventDefault();    
        var newName = prompt('Enter a new name for this user');
        if (newName) {
          this.model.save({name: newName}, {
            error: function (model, resp, xhr) {
              alert(resp);       
            }
          });
        }
      },

      onDeleteClick: function (e) {
        e.preventDefault();              
        var me = this;
        this.model.destroy({
          error: function (model, resp) {
            // console.log('error deleting user: ', arguments);
            alert('Error deleting user');
          },
          success: function (model, resp) {
            // console.log('user successfully destroyed: ', arguments);  
            me.remove();
          }
        });
      }
    });

    app.UsersView = Backbone.View.extend({
      tagName: 'section',

      template: _.template($('#tpl-users').html()),

      events: {
        'click #add': 'onAddClick'
      },

      initialize: function () {
        _.bindAll(this);
        this.collection.on('add', this.render, this);
        this.collection.on('reset', this.render, this);
      },

      render: function () {        
        this.$el.html(this.template());
        this.collection.each(this.renderUser);
        return this;
      },
      
      renderUser: function (user) {
        var view = new app.UserView({model: user});
        this.$('#users').append(view.render().el);
      },

      onAddClick: function (e) {
        e.preventDefault();
        var name = prompt('Enter a name for the new user');
        if (name) {
          var user = new app.User(), me = this;
          user.save({name: name}, {
            error: function (model, resp, xhr) {
              // console.log('error saving user: ', arguments);
              alert(resp);
            },
            success: function (model, resp, xhr) {
              // console.log('user saved successfully: ', arguments);       
              me.collection.add(model);
            }
          });
        }
      }
    });

    app.Router = Backbone.Router.extend({
      routes: {
        '': 'listUsers',        
        '/': 'listUsers'        
      },

      initialize: function () {
        this.users = new app.Users();
        this.usersView = new app.UsersView({ collection: this.users });
        $(document.body).append(this.usersView.render().el);
      },

      listUsers: function () {
        if (this.usersView.collection.models.length === 0) {
          this.usersView.collection.fetch();
        }           
      }
    
    });
    // 
    
    app.router = new app.Router();
    Backbone.history.start({pushState: true});

    root.app = app;
  });
}());
