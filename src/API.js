import './lib/es6-promise.min.js'
import cacheable from './cacheable'
import { extend } from './helpers'



export default cacheable(function(key) {
  const key = key.replace(/^\//, "").replace(/\/$/, "");
  let url = "http://c5032021.ngrok.io/"+key+"/";
  url = "api.php?url="+encodeURIComponent(url);
  return new Promise(function(resolve, reject) {
    return $.ajax({
      method: "get",
      dataType: "json",
      data: {},
      url: url,
      error: reject
    }).then(resolve);
  }).catch(function(res) {
    console.error("API Request Unsuccessful", url, res);
    return res;
  });
});

export function getTeamStats(API, key, team) {
  let promises = [
    API.get("team/"+key+"/defense"),
    API.get("team/"+key+"/goals"),
  ];
  if (typeof team == "object" && team.team_number == team) {
    promises.push((resolve, reject) => resolve(team))
  } else {
    promises.push(API.get("team/"+key));
  }
  return Promise.all(promises).then(function(res) {
    let [defenses, goals, team] = res;
    defenses = goals = [
      4534,
      Math.random()*2,
      Math.random()*2,
      Math.random()*2,
      Math.random()*2,
      Math.random()*2,
      Math.random()*2,
      Math.random()*2,
      Math.random()*2,
      Math.random()*2,
    ];
    return extend(team, {
      stats: {
        calcs: {
          predicted_rp: Math.random()*2*10,
          score: 0
        },
        defenses: {
          low_bar: defenses[1],
          portcullis: defenses[2],
          cheval_de_frise: defenses[3],
          moat: defenses[4],
          ramparts: defenses[5],
          drawbridge: defenses[6],
          sally_port: defenses[7],
          rock_wall: defenses[8],
          rough_terrain: defenses[9],
        },
        goals: {
          auto_low: goals[1],
          auto_high: goals[2],
          teleop_low: goals[3],
          teleop_high: goals[4],
        },
      }
    });
  });
}

export function getTeams(API, key) {
  return new Promise(function(resolve, reject) {
    resolve(API.get("list/"+key));
  }).then(function(teams) {
    return Promise.all(teams.map(team => getTeamStats(API, team.team_number, team)));
  });
}
