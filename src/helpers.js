import './lib/es6-promise.min.js'

export function getJSON(url) {
  return new Promise((resolve, reject) => {
    $.ajax({
      method: "get",
      dataType: "json",
      data: {},
      url: url,
      error: reject
    }).then(resolve);
  });
}

export function round(n, digits) {
  const n = parseFloat(n);
  const digits = parseInt(digits);
  const parts = (Math.round(n * Math.pow(10, digits))/Math.pow(10, digits)).toString().split(".");
  if (parts.length == 1) {
    parts.push("");
  }
  return parts[0] + (digits ? "." : "") + parts[1] + Array(Math.max(0, digits - parts[1].length + 1)).join("0");
}

export function documentReady() {
  return new Promise(function(resolve, reject) {
    if ($.isReady) {
      resolve();
    } else {
      $(resolve);
    }
  });
}

export function extend() {
  const result = arguments[0];
  for(let i = 1; i < arguments.length; i++) {
    for(let key in arguments[i]) {
      result[key] = arguments[i][key];
    }
  }
  return result;
}
