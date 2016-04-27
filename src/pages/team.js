import '../lib/es6-promise.min.js'
import Templates from "../Templates"
import LoginCheck from "../Templates"
import { getJSON, round } from "../helpers"
import API, { getTeamStats } from "../API"

export function team(key) {
  Promise.all([
    LoginCheck.get(),
    Templates.get("team"),
    getJSON("stats-config.json"),
    getTeamStats(API, key),
  ]).then(function(res) {
    const [, template, stats, teamData] = res;
    const ractive = new Ractive({
      template: template,
      data: {
        stats: stats,
        statKeys: ['calcs', 'goals', 'defenses'],
        key: key,
        team: teamData,
        round: round,
        mobile: $(window).width() < 900,
        token: localStorage.getItem('token'),
        user: {
          name: localStorage.getItem('user.name') || '',
          team: localStorage.getItem('user.team') || ''
        }
      },
    });
  }).catch(console.error.bind(console));
}
