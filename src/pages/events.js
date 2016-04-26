import '../lib/es6-promise.min.js'
import Templates from "../Templates"

export function events(key) {
  Promise.all([
    Templates.get("events"),
  ]).then(function(res) {
    const [template] = res;
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
