import '../lib/es6-promise.min.js'
import Templates from "../Templates"
import LoginCheck from "../LoginCheck"

export function events(key) {
  Promise.all([
    LoginCheck.get(),
    Templates.get("events"),
  ]).then(function(res) {
    const [, template] = res;
    const ractive = new Ractive({
      template: template,
      data: {
        events: {
          "2016arc": "Archimedes",
          "2016cars": "Carson",
          "2016carv": "Carver",
          "2016cur": "Curie",
          "2016gal": "Galileo",
          "2016hop": "Hopper",
          "2016new": "Newton",
          "2016tes": "Tesla",
          "2016cmp": "Einstein",
        },
        mobile: $(window).width() < 900,
        token: localStorage.getItem('token'),
        user: {
          name: localStorage.getItem('user.name') || '',
          team: localStorage.getItem('user.team') || ''
        }
      },
      computed: {
        mobile: function() {
          return $(window).width() < 900;
        }
      },
    });
  });
}
