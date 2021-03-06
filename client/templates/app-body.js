var MENU_KEY = 'menuOpen';
Session.setDefault(MENU_KEY, false);

var USER_MENU_KEY = 'userMenuOpen';
Session.setDefault(USER_MENU_KEY, false);

var SHOW_CONNECTION_ISSUE_KEY = 'showConnectionIssue';
Session.setDefault(SHOW_CONNECTION_ISSUE_KEY, false);

var CONNECTION_ISSUE_TIMEOUT = 5000;

Meteor.startup(function () {
  // set up a swipe left / right handler
  $(document.body).touchwipe({
    wipeLeft: function () {
      Session.set(MENU_KEY, false);
    },
    wipeRight: function () {
      Session.set(MENU_KEY, true);
    },
    preventDefaultEvents: false
  });

  // Only show the connection error box if it has been 5 seconds since
  // the app started
  setTimeout(function () {
    // Launch screen handle created in lib/router.js
    dataReadyHold.release();

    // Show the connection error box
    Session.set(SHOW_CONNECTION_ISSUE_KEY, true);
  }, CONNECTION_ISSUE_TIMEOUT);
});

Template.appBody.onRendered(function() {
  this.find('#content-container')._uihooks = {
    insertElement: function(node, next) {
      $(node)
        .hide()
        .insertBefore(next)
        .fadeIn(function () {
          if (listFadeInHold) {
            listFadeInHold.release();
          }
        });
    },
    removeElement: function(node) {
      $(node).fadeOut(function() {
        $(this).remove();
      });
    }
  };
});

Template.appBody.helpers({
  // We use #each on an array of one item so that the "list" template is
  // removed and a new copy is added when changing lists, which is
  // important for animation purposes. #each looks at the _id property of it's
  // items to know when to insert a new item and when to update an old one.
  thisArray: function() {
    return [this];
  },
  menuOpen: function() {
    return Session.get(MENU_KEY) && 'menu-open';
  },
  cordova: function() {
    return Meteor.isCordova && 'cordova';
  },
  emailLocalPart: function() {
    var email = Meteor.user().emails[0].address;
    return email.substring(0, email.indexOf('@'));
  },
  userMenuOpen: function() {
    return Session.get(USER_MENU_KEY);
  },
//changed by Potato
  lists: function() {
    //return Lists.find();
    Meteor.subscribe('fetch_uc_fake_alert');
    var temp_alert = uc_fake_alert.find();
    if(temp_alert.count() != 0)
        {
            var alert_id = temp_alert.fetch()[0]['_id'];
            var alert_content = temp_alert.fetch()[0]['content'];
            Bert.alert({title: '新通知',message: alert_content,type: 'info',style:'growl-top-right'});
            uc_fake_alert.remove(alert_id);
        }
    Meteor.subscribe('fetch_uc_student_rl_course');
    //alert("c"+uc_course.count());
    //alert("hhh");
    var this_courses = uc_student_rl_course.find().fetch();
    //alert(this_courses.length().toString());
    //var testprint = 123;
    //alert(Meteor.userId());
    var this_courses_length = this_courses.length;
    //alert(this_courses_length);
    var courses_id_array = new Array();
    for (var j = 0;j<this_courses_length;j++)
        {
            courses_id_array.push(this_courses[j]['course_id']);
        }
      Meteor.subscribe('fetch_uc_course_by_course_id',courses_id_array);
      //alert(uc_course.find().fetch().length);
      return uc_course.find();

  },
  activeListClass: function() {
    var current = Router.current();
    if (current.route.name === 'listsShow' && current.params._id === this._id) {
      return 'active';
    }
  },
  connected: function() {
    if (Session.get(SHOW_CONNECTION_ISSUE_KEY)) {
      return Meteor.status().connected;
    } else {
      return true;
    }
  }
});

Template.appBody.events({
  'click .js-menu': function() {
    Session.set(MENU_KEY, ! Session.get(MENU_KEY));
  },

  'click .content-overlay': function(event) {
    Session.set(MENU_KEY, false);
    event.preventDefault();
  },

  'click .js-user-menu': function(event) {
    Session.set(USER_MENU_KEY, ! Session.get(USER_MENU_KEY));
    // stop the menu from closing
    event.stopImmediatePropagation();
  },

  'click #menu a': function() {
    Session.set(MENU_KEY, false);
  },

  'click .js-setting': function() {
    Router.go('userSetting');
    Session.set("settingStatus", "home");
  },

  'click .js-logout': function() {
    Meteor.logout();

    // if we are on a private list, we'll need to go to a public one
    var current = Router.current();
    //if (current.route.name === 'listsShow' && current.data().userId) {
    //  Router.go('listsShow', Lists.findOne({userId: {$exists: false}}));
    //}
    Router.go('signin');
  },

  'click .js-new-list': function() {
// Changed by zhaozewei
// Changed by Potato
    //var list = {name: Lists.defaultName(), incompleteCount: 0};
    var course = {coursename: uc_course.Name(),schoolname:"pku",departmentname:"Unknown"};
    //list._id = Lists.insert(list);
    course._id = uc_course.insert(course);
    uc_student_rl_course.insert({student_id:Meteor.userId(),course_id:course._id,rank:0});

    //Router.go('listsShow', list);
    Router.go('listsShow', course);
  },
  'click .js-add-course-page': function(){
    Router.go('addCourse');
    Session.set("addCoursePageStatus", "list");
    Session.set("searchCourseKeyword","");
    Session.set("courseID","");
  },
});
