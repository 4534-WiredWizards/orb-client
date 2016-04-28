import './lib/es6-promise.min.js'
import cacheable from './cacheable'

export default cacheable(function() {
  return new Promise(function(resolve, reject) {
    if(localStorage.getItem("token")) {
      resolve(1);
    } else {
      location.hash = "#/login"
      reject();
    }
  });
});
