Name = Astro.Class({
  name: 'Name',
  fields: {
    zfullName: {
      type: 'string'
    },
    firstName: {
      type: 'string'
    },
    lastName: {
      type: 'string'
    }
  },
  events: {
    afterChange: function (e) {
      console.log("afterChange Event");
      console.log("changing:", this.firstName);
      console.log("Name level changed", e.data.fieldName);
      if (e.data.fieldName === 'firstName' || e.data.fieldName === 'lastName') {
        this.setzfullName();
      }
    },
    afterInit: function () {
      //this.setzfullName();
    }
  },
  methods: {
    setzfullName: function () {
      if (this.firstName && this.lastName) {
        this.set('zfullName', this.firstName + ' ' + this.lastName);
      //  console.log(this);
      }
    }
  }
});

PersonBase = Astro.Class({
  name: 'PersonBase',
  fields: {
    name: {
      type: 'object',
      nested: 'Name',
      default: function () {
        return {};
      }
    }
  }
});


Friend = PersonBase.inherit({
  name: 'Friend',
  fields: {
    friendsOfFriends: {
      type: 'array',
      nested: 'PersonBase',
      default: function () {
        return [];
      }
    }
  },

  events:{
    afterChange:function(e){
      // console.log("Friend changed", e.data.fieldName);
    }
  }
});

People = new Mongo.Collection('people');


Person = PersonBase.inherit({
  name: 'Person',
  collection: People,
  fields: {
    friends: {
      type: 'array',
      nested: 'Friend',
      default: function () {
        return [];
      }
    }
  },
  events:{
    afterChange:function(e){
      // console.log("Top Level Person changed", e.data.fieldName);
    }
  }
});


if (Meteor.isClient) {

  Template.hello.helpers({
    people: function () {
      return People.find();
    }
  });

  Template.person.events({
    'blur .person input': function (e, tmpl) {
      var person = tmpl.data;
      var input = e.currentTarget;
      person.set('name.' + input.id, input.value);

    },
    'click button': function (e, tmpl) {
      var person = tmpl.data.get();
      console.clear();
      console.log(person);
      person.save();
    }
  });

  Template.friend.events({
    'blur .friend input': function (e, tmpl) {
      var person = tmpl.data;

      var input = e.currentTarget;
      person.set('name.' + input.id, input.value);
      //console.log('friends', input);
      //console.log(friend);

    }
  });

  Template.friendsOfFriends.events({
    'blur .friendsOfFriends input': function (e, tmpl) {
      var person = tmpl.data;
      var input = e.currentTarget;
      person.set('name.' + input.id, input.value);
      // console.log('friendsOfFriends', input);
      // console.log(person);
      // person.save();
    }
  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {

    People.remove({});

    if (People.find()
      .count() < 2) {
      _.each(_.range(2), function () {
        console.log('creating people');
        var p = new Person();
        p.set('name', {
          firstName: faker.name.firstName(),
          lastName: faker.name.firstName()
        });

        var friends = [];
        _.each(_.range(1), function () {
          var friendsOfFriends = [];
          _.each(_.range(1), function () {
            friendsOfFriends.push({
              name: {
                firstName: faker.name.firstName(),
                lastName: faker.name.lastName()
              }
            });
          });
          friends.push({
            name: {
              firstName: faker.name.firstName(),
              lastName: faker.name.lastName(),
            },
            friendsOfFriends: friendsOfFriends
          });
        });
        p.set('friends', friends);
        p.save();
      });
    }
  });
}
