import '../lib/es6-promise.min.js'
import Templates from "../Templates"
import API, { TBA, matchLabel } from "../API"
import { extend, round } from "../helpers"
import LoginCheck from "../LoginCheck"

export function eventMatches(eventKey) {
  Promise.all([
    LoginCheck.get(),
    Templates.get("event-matches"),
    TBA.get("event/"+eventKey),
    TBA.get("event/"+eventKey+"/stats"),
  ]).then(function(res) {
    const [, template, event, eventStats] = res;
    const predictionsCounts = {
      "oprs": [],
      "dprs": [],
      "ccwms": [],
      "orb": []
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
      return matches.map(match => extend(match, {label: matchLabel(match)}));
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
        matches: matches.sort((a, b) => a.time - b.time),
        loading: 2,
      });
      Promise.all(matches.map(match => API.get(`work/match/${eventKey}/${match.key}`))).then(function(matches) {
        ractive.set("loading", 0);
        ractive.set({
          matches: ractive.get("matches").map((match, i) => {
            if (!matches[i].map) {
              return;
            }
            match.predictions = matches[i].map(score => round(score, 2));
            return match;
          }),
        });
        ractive.get("matches").forEach(function(match) {
          const red = match.alliances.red,
                blue = match.alliances.blue;
          const winner = red.score > blue.score;
          const orbPred = match.predictions[0] > match.predictions[1];
          predictionsCounts.orb.push(orbPred == winner)
        })
        console.log(predictionsCounts.orb)
        console.log("ORB", predictionsCounts.orb.filter(Boolean).length/predictionsCounts.orb.length)
        console.log("OPR", predictionsCounts.oprs.filter(Boolean).length/predictionsCounts.oprs.length)
      });
    });
  });
}

/*
{{#if predictions}}
  <b>Predicted</b>:
  {{#if predictions[0] > predictions[1]}}
    <span class="red">Red</span>
  {{else}}
    <span class="blue">Blue</span>
  {{/if}}
  ({{predictions[0]}} - {{predictions[1]}})
  <br>
  OPR:
  {{#if getWinner(alliances.red.teams, alliances.blue.teams, 'oprs')}}
    <span class="red">Red</span>
  {{else}}
    <span class="blue">Blue</span>
  {{/if}}
  ({{getAllianceSum(alliances.red.teams, 'oprs')}} - {{getAllianceSum(alliances.blue.teams, 'oprs')}})
  <br>
  DPR:
  {{#if getWinner(alliances.red.teams, alliances.blue.teams, 'dprs')}}
    <span class="red">Red</span>
  {{else}}
    <span class="blue">Blue</span>
  {{/if}}
  ({{getAllianceSum(alliances.red.teams, 'dprs')}} - {{getAllianceSum(alliances.blue.teams, 'dprs')}})
  <br>
  CCWM:
  {{#if getWinner(alliances.red.teams, alliances.blue.teams, 'ccwms')}}
    <span class="red">Red</span>
  {{else}}
    <span class="blue">Blue</span>
  {{/if}}
  ({{getAllianceSum(alliances.red.teams, 'ccwms')}} - {{getAllianceSum(alliances.blue.teams, 'ccwms')}})
{{/if}}*/
