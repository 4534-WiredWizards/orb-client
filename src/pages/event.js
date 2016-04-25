import '../lib/es6-promise.min.js'
import Templates from "../Templates"
import { getJSON, round } from "../helpers"
import API, { getTeams, getTeamStats } from "../API"

export function event(key) {
  Promise.all([
    Templates.get("event"),
    getJSON("stats-config.json")
  ]).then(function(res) {
    const [template, stats] = res;
    const $container = $("#main").closest(".container");
    const containerClass = $container.attr("class");
    $container.addClass("wide");
    const ractive = new Ractive({
      template: template,
      data: {
        key: key,
        statConfig: stats,
        loading: true,
        teams: [],
        round: round,
        statColor(value, stat) {
          const value = parseFloat(value);
          for(let i = 0; i < stat.progress.length; i++) {
            if ((!stat.progress[i].min || value >= stat.progress[i].min) && (!stat.progress[i].max || value <= stat.progress[i].max)) {
              return stat.progress[i].class;
            }
          }
        }
      },
      computed: {
        mobile: function() {
          return $(window).width() < 900;
        }
      },
      ondestroy: function() {
        $container.attr("class", containerClass);
      }
    });

    getTeams(API, key).then(function(teams) {
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
