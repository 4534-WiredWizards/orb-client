import './lib/es6-promise.min.js'
import cacheable from './cacheable'

export default cacheable(function(key) {
  const url = "templates/"+key+".html";
  return new Promise(function(resolve, reject) {
    return $.ajax({
      method: "get",
      url: url,
      error: reject
    }).then(resolve);
  }).catch(function(res) {
    console.error("Template Request Unsuccessful", url, res);
    return res;
  });
});
