import * as Pages from './Pages'
import Components from './Components'
import {
  documentReady
} from './helpers'
import './lib/es6-promise.min.js'

const el = "#main";

const router = Router({
  "/login": Pages.login,
  "/a": {
    "/team/:key": Pages.team,
    "/event/:key": Pages.event,
    "/event/:key/matches": Pages.eventMatches,
    "/events": Pages.events
  }
}).configure({
  html5history: false,
  before: [],
  after: [],
  recurse: 'forward'
});

Promise.all([documentReady, Components.load()]).then(function(res) {
  const [, Components] = res;
  Ractive = Ractive.extend({
    el: el,
    components: Components.components,
    before: [function() {
      $(window).scrollTop(0);
    }]
  });
  router.init();
  if (!router.getRoute().filter(Boolean).length) {
    if (localStorage.getItem('token')) {
      router.setRoute("/a/events");
    } else {
      router.setRoute("/login");
    }
  }

  $(".navbar").on("click", "a[href][href!='#']", function() {
    if ($('.collapse.in').length > 0) {
      $('.navbar-toggle').click();
    }
  });

  const $overlay = $("<div>", {
    class: "overlay",
    css: {
      "display": "none"
    },
    click() {
      if ($('.collapse.in').length > 0) {
        $('.navbar-toggle').click();
      }
    }
  });

  $overlay.prependTo("html");

  $('.navbar-toggle').click(function() {
    if ($('.collapse.in').length > 0) {
      $overlay.hide();
    } else {
      $overlay.show();
    }
  });

});
