import './lib/es6-promise.min.js'
import cacheable from './cacheable'

export default function cacheable(getPromise) {
  const _cache = {};

  function set(key, value) {
    return _cache[key] = value;
  }

  return {
    get(key, callback) {
      return new Promise(function(resolve, reject) {
        if (_cache[key]) {
          return resolve(_cache[key]);
        }

        getPromise(key)
          .then(value => set(key, value))
          .then(resolve)
          .catch(reject);

      }).then(callback);
    },
  }
}
