import '../lib/es6-promise.min.js'
import Templates from "../Templates"
import API, { TBA } from "../API"

export function eventMatches(eventKey) {
  Promise.all([
    Templates.get("event-matches"),
    TBA.get("event/"+eventKey),
    TBA.get("event/"+eventKey+"/matches").then(function(matches) {
      return matches.sort(function(a, b) {
        return a.time - b.time;
      });
    }),
  ]).then(function(res) {
    const [template, event, matches] = res;
    const ractive = new Ractive({
      template: template,
      data: {
        event: event,
        matches: matches,
        moment: function(date) {
          return moment(date).fromNow();
        },

      },
      computed: {
        mobile() {
          return $(window).width() < 900;
        }
      },
    });
  });
}
