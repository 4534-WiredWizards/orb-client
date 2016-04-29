import "../lib/es6-promise.min.js"
import Templates from "../Templates"
import API, { TBA, matchLabel } from "../API"
import { round } from "../helpers"
import LoginCheck from "../LoginCheck"

export function match(key) {
  const [eventKey, matchKey] = key.split("_");
  Promise.all([
    LoginCheck.get(),
    Templates.get("match"),
    TBA.get("event/"+eventKey),
    TBA.get("match/"+eventKey+"_"+matchKey),
    API.get("work/match/"+eventKey+"/"+eventKey+"_"+matchKey),
    API.get("work/defense/"+eventKey+"/"+eventKey+"_"+matchKey),
  ]).then(function(res) {
    let [, template, event, match, predictions, defenses] = res;
    console.log(res)

    match.label = matchLabel(match);

    const ractive = new Ractive({
      template: template,
      data: {
        event,
        match,
        predictions,
        defenses: defenses.map(row => row.map(d => d.join(", "))),
        ucfirst(str) {
          return str.charAt(0).toUpperCase() + str.slice(1);
        },
      },
    });
  })
}
