import * as Pages from './Pages'
import Components from './Components'
import { documentReady } from './helpers'
import './lib/es6-promise.min.js'

const el = "#main";

const router = Router({
  "/login": Pages.login,
  "/team/:key": Pages.team,
  "/event/:key": Pages.event,
}).configure({
  html5history: false,
  before: [function() {
  }],
});

Promise.all([documentReady, Components.load()]).then(function(res) {
  const [, Components] = res;
  Ractive = Ractive.extend({
    el: el,
    components: Components.components,
    before: [function() {
      $(window).scrollTop(0);
    }],
  });
  router.init();
  if (!router.getRoute().filter(Boolean).length) {
    if(localStorage.getItem('token')) {
      router.setRoute("/event/2016arc");
    } else {
      router.setRoute("/login");
    }
  }
});
