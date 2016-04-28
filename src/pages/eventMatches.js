import '../lib/es6-promise.min.js'
import Templates from "../Templates"
import API, { TBA } from "../API"
import { round } from "../helpers"

export function eventMatches(eventKey) {
  Promise.all([
    Templates.get("event-matches"),
    TBA.get("event/"+eventKey),
    TBA.get("event/"+eventKey+"/stats"),
  ]).then(function(res) {
    const [template, event, eventStats] = res;
    const predictionsCounts = {
      "oprs": [],
      "dprs": [],
      "ccwms": [],
    };
    const ractive = new Ractive({
      template: template,
      data: {
        event: event,
        eventStats: eventStats,
        matches: [],
        loading: 1,
        moment: function(date) {
          return moment(date).fromNow();
        },
        getAllianceSum(teams, key) {
          return teams.map(team => eventStats[key][team.replace(/[^\d]/g, '')]).reduce((a, b) => a + b);
        },
        getWinner(redTeams, blueTeams, key) {
          return this.get("getAllianceSum")(redTeams, key) > this.get("getAllianceSum")(blueTeams, key);
        }
      },
      computed: {
        mobile() {
          return $(window).width() < 900;
        }
      },
    });
    TBA.get("event/"+eventKey+"/matches").then(function(matches) {
      return matches;
    }).then(function(matches) {
      const sum = ractive.get("getAllianceSum").bind(ractive);
      const predictedWinner = ractive.get("getWinner").bind(ractive);
      matches.forEach(function(match) {
        const red = match.alliances.red,
              blue = match.alliances.blue;
        const winner = red.score > blue.score;
        const redTeams = red.teams.map(team => team.replace(/[^\d]/g, ''))
        const blueTeams = blue.teams.map(team => team.replace(/[^\d]/g, ''))
        const oprPred = predictedWinner(redTeams, blueTeams, 'oprs')
        const dprPred = predictedWinner(redTeams, blueTeams, 'dprs')
        const ccwmPred = predictedWinner(redTeams, blueTeams, 'ccwms')
        predictionsCounts.oprs.push(oprPred == winner)
        predictionsCounts.dprs.push(dprPred == winner)
        predictionsCounts.ccwms.push(ccwmPred == winner)
      });
      ractive.set({
        matches: matches,
        loading: 2,
        predictions: 1
      });
      Promise.all(matches.map(match => API.get(`work/match/${eventKey}/${match.key}`))).then(function(matches) {
        ractive.set("loading", 0);
        ractive.set({
          matches: ractive.get("matches").map((match, i) => {
            match.predictions = matches[i].map(score => round(score, 2));
            return match;
          }),
        });
      });
    });
  });
}
