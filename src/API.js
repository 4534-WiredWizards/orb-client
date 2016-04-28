import './lib/es6-promise.min.js'
import cacheable from './cacheable'
import { extend } from './helpers'

export default cacheable(function(key) {
  const key = key.replace(/^\//, "").replace(/\/$/, "");
  let url = "http://orb.scoutfrc.io/"+key;
  return new Promise(function(resolve, reject) {
    return $.ajax({
      method: "get",
      dataType: "json",
      data: {
        token: localStorage.getItem("token"),
      },
      url: url,
      error: reject,
    }).then(resolve);
  }).catch(function(res) {
    console.error("API Request Unsuccessful", url, res);
    return res;
  });
});

export let TBA = cacheable(function(path) {
  const url = "http://www.thebluealliance.com/api/v2/" + path;
  return new Promise(function(resolve, reject) {
    return $.ajax({
      method: "get",
      dataType: "json",
      data: {
        'X-TBA-App-Id': "frc4534:orb:client"
      },
      url: url,
      error: reject
    }).then(resolve);
  }).catch(function(res) {
    console.error("API Request Unsuccessful", url, res);
    return res;
  });
});

export function getTeamStats(API, key, teamObject) {
  let promises = [];
  if (typeof teamObject == "object" && teamObject.team_number == key) {
    promises.push(new Promise((resolve, reject) => resolve(teamObject)))
  } else {
    promises.push(API.get("team/"+key));
  }
  if (typeof teamObject == "object" && teamObject.team_number == key && typeof teamObject.stats == "object") {
    promises.push(new Promise((resolve, reject) => resolve(teamObject.stats.score)));
    promises.push(new Promise((resolve, reject) => resolve(teamObject.stats.defenses)));
    promises.push(new Promise((resolve, reject) => resolve(teamObject.stats.goals)));
    promises.push(new Promise((resolve, reject) => resolve(teamObject.stats.scale)));
    promises.push(new Promise((resolve, reject) => resolve(teamObject.stats.challenge)));
  } else {
    promises.push(API.get("team/"+key+"/score"));
    promises.push(API.get("team/"+key+"/defense"));
    promises.push(API.get("team/"+key+"/goals"));
    promises.push(API.get("team/"+key+"/scale"));
    promises.push(API.get("team/"+key+"/challenge"));
  }
  return Promise.all(promises).then(function(res) {
    let [team, score, defenses, goals, scale, challenge] = res;
    scale = scale && scale.length >= 1 ? scale : [0];
    defenses = defenses && defenses.length >= 8 ? defenses : [0,0,0,0,0,0,0,0];
    challenge = challenge && challenge.length >= 1 ? challenge : [0];
    goals = goals && goals.length >= 4 ? goals : [0,0,0,0];
    score = !isNaN(Number(score)) ? score : 0
    return extend({}, team, {
      stats: {
        calcs: {
          score: score
        },
        defenses: {
          low_bar: defenses[0],
          portcullis: defenses[1],
          cheval_de_frise: defenses[2],
          moat: defenses[3],
          ramparts: defenses[4],
          drawbridge: defenses[5],
          sally_port: defenses[6],
          rock_wall: defenses[7],
          rough_terrain: defenses[8],
        },
        goals: {
          auto_low: goals[0],
          auto_high: goals[1],
          teleop_low: goals[2],
          teleop_high: goals[3],
        },
        tower: {
          scale: scale[0],
          challenge: challenge[0]
        }
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

export function generateToken(team,name) {
  var token = team + "." + md5(name);
  localStorage.setItem("token",token);
  return token;
}
