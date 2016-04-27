import '../lib/es6-promise.min.js'
import Templates from "../Templates"
import API, { TBA } from "../API"
import { round } from "../helpers"

export function eventMatches(eventKey) {
  Promise.all([
    Templates.get("event-matches"),
    TBA.get("event/"+eventKey),
  ]).then(function(res) {
    const [template, event] = res;
    const ractive = new Ractive({
      template: template,
      data: {
        event: event,
        matches: [],
        loading: 1,
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
    TBA.get("event/"+eventKey+"/matches").then(function(matches) {
      return matches.sort(function(a, b) {
        return a.time - b.time;
      });
    }).then(function(matches) {
      ractive.set({
        matches: matches,
        loading: 2
      });
      Promise.all(matches.map(match => API.get(`work/match/${eventKey}/${match.key}`))).then(function(matches) {
        ractive.set({
          matches: ractive.get("matches").map((match, i) => {
            match.predictions = matches[i].map(score => round(score, 2));
            return match;
          }),
          loading: 0
        });
      });
    });
  });
}
