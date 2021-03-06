Router.configure({
  // we use the  appBody template to define the layout for the entire app
  layoutTemplate: 'appBody',

  // the appNotFound template is used for unknown routes and missing lists
  notFoundTemplate: 'appNotFound',

  // show the appLoading template whilst the subscriptions below load their data
  loadingTemplate: 'appLoading',

  // wait on the following subscriptions before rendering the page to ensure
  // the data it's expecting is present
  waitOn: function() {
    return [
// Deleted by zhaozewei, we never use them
      //Meteor.subscribe('publicLists'),
      //Meteor.subscribe('privateLists'),
// changed by potato
      Meteor.subscribe('fetch_uc_student_rl_course')

    ];
  }
});

dataReadyHold = null;

if (Meteor.isClient) {
  // Keep showing the launch screen on mobile devices until we have loaded
  // the app's data
  dataReadyHold = LaunchScreen.hold();

  // Show the loading screen on desktop
  Router.onBeforeAction('loading', {except: ['join', 'signin']});
  Router.onBeforeAction('dataNotFound', {except: ['join', 'signin']});
}

Router.route('join');
Router.route('signin');
Router.route('about');
Router.route('userSetting',{
  path: '/setting'
});

Router.route('addCourse');

Router.route('DIYCourse');

// added by zhaozewei
Router.route('notice');
Router.route('file-page', {
  path: '/filePage'
});

Router.route('course-info');
Router.route('recentPage', {
  path: '/recent',
  action: function () {
    this.render();
  }
/*
  // subscribe to todos before the page is rendered but don't wait on the
  // subscription, we'll just render the items as they arrive
  onBeforeAction: function () {

      Meteor.subscribe('fetch_uc_student_rl_course');
      var this_courses = uc_student_rl_course.find().fetch();
      var this_courses_length = this_courses.length;
      var courses_id_array = new Array();
      for(var j = 0 ;j < this_course_length; j++)
      {
        courses_id_array.push(this_courses[j]['course_id']);
      }
      this.reNoticelistHandle = Meteor.subscribe('fetch_notification_by_course_id_list', courses_id_array);
      this.reFilelistHandle = Meteor.subscribe('fetch_file_by_course_id_list', courses_id_array);
    //this.reNoticelistHandle = Meteor.subscribe('fetch_notification_by_course_id_list', this.params._id);

// Added by zhaozewei
    //this.reFilelistHandle = Meteor.subscribe('fetch_file_by_course_id_list', this.params._id);

    if (this.ready()) {
      // Handle for launch screen defined in app-body.js
      dataReadyHold.release();
    }
  },
  data: function () {
    //return Lists.findOne(this.params._id);
    //return uc_course.findOne(this.params._id);
  },
  action: function () {
    this.render();
  }
*/
});

// Changed by zhaozewei
Router.route('listsShow', {
  path: '/lists/:_id',
  // subscribe to todos before the page is rendered but don't wait on the
  // subscription, we'll just render the items as they arrive
  onBeforeAction: function () {
    this.todosHandle = Meteor.subscribe('todos', this.params._id);
// Added by zhaozewei
    this.filelistHandle = Meteor.subscribe('fetch_file_by_course_id', this.params._id);

    if (this.ready()) {
      // Handle for launch screen defined in app-body.js
      dataReadyHold.release();
    }
  },
  data: function () {
    //return Lists.findOne(this.params._id);
    return uc_course.findOne(this.params._id);
  },
  action: function () {
    this.render();
  }
});

// Changed by zhaozewei
Router.route('home', {
  action: function() {
    //Router.go('listsShow', uc_course.findOne());
    Router.go('recentPage');
  }
});

// Changed by zhaozewei, must login everytime you visit main page
Router.route('default', {
  path: '/',
  action: function() {
    if (Meteor.user()) {
      Meteor.logout();
    }
    Router.go('signin');
  /*if (!Meteor.user()) {
      Router.go('signin');
    }
    else {
      Router.go('home');
    }
  */
  }
});
