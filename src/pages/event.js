import '../lib/es6-promise.min.js'
import Templates from "../Templates"
import LoginCheck from "../LoginCheck"
import { getJSON, round } from "../helpers"
import API, { TBA, getTeams, getTeamStats } from "../API"

export function event(key) {
  Promise.all([
    LoginCheck.get(),
    Templates.get("event"),
    getJSON("stats-config.json"),
    TBA.get("event/"+key),
  ]).then(function(res) {
    const [, template, stats, event] = res;
    const $container = $("#main").closest(".container");
    const containerClass = $container.attr("class");
    const ractive = new Ractive({
      template: template,
      data: {
        key: key,
        statConfig: stats,
        loading: true,
        teams: [],
        round: round,
        event: event,
        statColor(value, stat) {
          const value = parseFloat(value);
          for(let i = 0; i < stat.progress.length; i++) {
            if ((!stat.progress[i].min || value >= stat.progress[i].min) && (!stat.progress[i].max || value <= stat.progress[i].max)) {
              return stat.progress[i].class;
            }
          }
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
      onrender: function() {
        $container.addClass("wide");
      },
      onunrender: function() {
        $container.attr("class", containerClass);
      }
    });

    getTeams(API, key).then(function(teams) {
      console.log(teams)
      ractive.set({
        teams: teams.sort(function(a, b) {
          return a.team_number - b.team_number
        }),
        loading: false
      });
      Sortable.init();
    });
  });
}
