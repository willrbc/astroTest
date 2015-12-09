PersonBase = Astro.Class({
  name: 'PersonBase',
  fields: {
    firstName: {
      type: 'string'
    },
    lastName: {
      type: 'string'
    },
    fullName: {
      type: 'string'
    }
  },
  events: {
    afterChange: function (e) {

      if (e.data.fieldName === 'firstName' || e.data.fieldName === 'lastName') {
        this.setFullName();
      }
    },
    afterInit: function () {
      this.setFullName();
    }
  },
  methods: {
    setFullName: function () {
      if (this.firstName && this.lastName) {
        this.set('fullName', this.firstName + ' ' + this.lastName);
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
  }
});


if (Meteor.isClient) {

  Template.hello.helpers({
    people: function () {
      return People.find();
    }
  });

  Template.person.events({
    'change .person input': function (e, tmpl) {
      var person = tmpl.data;
      var input = e.currentTarget;
      person.set(input.id, input.value);
      console.log('top level', input);
      console.log(person);
    },
    'change, input': function (e, tmpl) {
      var person = tmpl.data.get();
      person.save();
    }
  });

  Template.friend.events({
    'change .friend input': function (e, tmpl) {
      var person = tmpl.data;
      var input = e.currentTarget;
      person.set(input.id, input.value);
      console.log('friendsOfFriends', input);
      console.log(person);
      //person.save();
    }
  });

  Template.friendsOfFriends.events({
    'change .friendsOfFriends input': function (e, tmpl) {
      var person = tmpl.data;
      var input = e.currentTarget;
      person.set(input.id, input.value);
      console.log('friendsOfFriends', input);
      console.log(person);
      //person.save();
    }
  });

}

if (Meteor.isServer) {
  Meteor.startup(function () {


    if (People.find()
      .count() < 2) {
      _.each(_.range(2), function () {
        console.log('creating people');
        var p = new Person();
        p.set('firstName', faker.name.firstName());
        p.set('lastName', faker.name.lastName());
        var friends = [];
        _.each(_.range(1), function () {
          var friendsOfFriends = [];
          _.each(_.range(1), function () {
            friendsOfFriends.push({
              firstName: faker.name.firstName(),
              lastName: faker.name.lastName()
            });
          });
          friends.push({
            firstName: faker.name.firstName(),
            lastName: faker.name.lastName(),
            friendsOfFriends: friendsOfFriends
          });
        });
        p.set('friends', friends);
        p.save();
      });
    }
  });
}
