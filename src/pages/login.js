import '../lib/es6-promise.min.js'
import Templates from "../Templates"
import { getJSON, round } from "../helpers"
import API, { getTeamStats, generateToken } from "../API"

export function login() {
  Promise.all([
    Templates.get("login")
  ]).then(function(res) {
    const [template] = res;
    const ractive = new Ractive({
      template: template,
      data: {
        mobile: $(window).width() < 900,
        token: localStorage.getItem('token'),
        user: {
          name: localStorage.getItem('user.name') || '',
          team: localStorage.getItem('user.team') || ''
        }
      },
    });
    ractive.on('login', function(node) {
      var name = this.get("user.name");
      var team = this.get("user.team");
      localStorage.setItem("user.name",name);
      localStorage.setItem("user.team",team);
      var token = generateToken(team,name);
      location.hash = "#/events";
    });
  }).catch(console.error.bind(console));
}
