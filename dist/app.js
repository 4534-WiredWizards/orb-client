(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _interopRequire = function _interopRequire(obj) {
  return obj && obj.__esModule ? obj["default"] : obj;
};

var _interopRequireWildcard = function _interopRequireWildcard(obj) {
  return obj && obj.__esModule ? obj : { "default": obj };
};

var _slicedToArray = function _slicedToArray(arr, i) {
  if (Array.isArray(arr)) {
    return arr;
  } else if (Symbol.iterator in Object(arr)) {
    var _arr = [];for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
      _arr.push(_step.value);if (i && _arr.length === i) break;
    }return _arr;
  } else {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }
};

var Pages = _interopRequireWildcard(require("./Pages"));

var Components = _interopRequire(require("./Components"));

var documentReady = require("./helpers").documentReady;

require("./lib/es6-promise.min.js");

var el = "#main";

var router = Router({
  "/login": Pages.login,
  "/team/:key": Pages.team,
  "/event/:key": Pages.event }).configure({
  html5history: false,
  before: [function () {}] });

Promise.all([documentReady, Components.load()]).then(function (res) {
  var _res = _slicedToArray(res, 2);

  var Components = _res[1];

  Ractive = Ractive.extend({
    el: el,
    components: Components.components,
    before: [function () {
      $(window).scrollTop(0);
    }] });
  router.init();
  if (!router.getRoute().filter(Boolean).length) {
    router.setRoute("/event/2016arc");
  }
});

},{"./Components":4,"./Pages":5,"./helpers":8,"./lib/es6-promise.min.js":9}],2:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canMutationObserver = typeof window !== 'undefined'
    && window.MutationObserver;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    var queue = [];

    if (canMutationObserver) {
        var hiddenDiv = document.createElement("div");
        var observer = new MutationObserver(function () {
            var queueList = queue.slice();
            queue.length = 0;
            queueList.forEach(function (fn) {
                fn();
            });
        });

        observer.observe(hiddenDiv, { attributes: true });

        return function nextTick(fn) {
            if (!queue.length) {
                hiddenDiv.setAttribute('yes', 'no');
            }
            queue.push(fn);
        };
    }

    if (canPost) {
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],3:[function(require,module,exports){
"use strict";

var _interopRequire = function _interopRequire(obj) {
  return obj && obj.__esModule ? obj["default"] : obj;
};

var _slicedToArray = function _slicedToArray(arr, i) {
  if (Array.isArray(arr)) {
    return arr;
  } else if (Symbol.iterator in Object(arr)) {
    var _arr = [];for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
      _arr.push(_step.value);if (i && _arr.length === i) break;
    }return _arr;
  } else {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }
};

exports.getTeamStats = getTeamStats;
exports.getTeams = getTeams;
Object.defineProperty(exports, "__esModule", {
  value: true
});

require("./lib/es6-promise.min.js");

var cacheable = _interopRequire(require("./cacheable"));

var extend = require("./helpers").extend;

exports["default"] = cacheable(function (key) {
  var key = key.replace(/^\//, "").replace(/\/$/, "");
  var url = "http://c5032021.ngrok.io/" + key + "/";
  url = "api.php?url=" + encodeURIComponent(url);
  return new Promise(function (resolve, reject) {
    return $.ajax({
      method: "get",
      dataType: "json",
      data: {},
      url: url,
      error: reject
    }).then(resolve);
  })["catch"](function (res) {
    console.error("API Request Unsuccessful", url, res);
    return res;
  });
});

function getTeamStats(API, key, team) {
  var promises = [API.get("team/" + key + "/defense"), API.get("team/" + key + "/goals")];
  if (typeof team == "object" && team.team_number == team) {
    promises.push(function (resolve, reject) {
      return resolve(team);
    });
  } else {
    promises.push(API.get("team/" + key));
  }
  return Promise.all(promises).then(function (res) {
    var _res = _slicedToArray(res, 3);

    var defenses = _res[0];
    var goals = _res[1];
    var team = _res[2];

    defenses = goals = [4534, Math.random() * 2, Math.random() * 2, Math.random() * 2, Math.random() * 2, Math.random() * 2, Math.random() * 2, Math.random() * 2, Math.random() * 2, Math.random() * 2];
    return extend(team, {
      stats: {
        calcs: {
          predicted_rp: Math.random() * 2 * 10,
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
          rough_terrain: defenses[9] },
        goals: {
          auto_low: goals[1],
          auto_high: goals[2],
          teleop_low: goals[3],
          teleop_high: goals[4] } }
    });
  });
}

function getTeams(API, key) {
  return new Promise(function (resolve, reject) {
    resolve(API.get("list/" + key));
  }).then(function (teams) {
    return Promise.all(teams.map(function (team) {
      return getTeamStats(API, team.team_number, team);
    }));
  });
}

},{"./cacheable":7,"./helpers":8,"./lib/es6-promise.min.js":9}],4:[function(require,module,exports){
"use strict";

var _interopRequire = function _interopRequire(obj) {
  return obj && obj.__esModule ? obj["default"] : obj;
};

require("./lib/es6-promise.min.js");

var Templates = _interopRequire(require("./Templates"));

module.exports = {
  templates: {},
  components: {},
  create: function create(done) {
    this.components.Progress = Ractive.extend({
      isolated: false,
      template: this.templates.progress,
      oninit: function oninit() {
        var stat = this.get("stat");
        var value = this.get("value");
        var progressClass = undefined;
        for (var i = 0; i < stat.progress.length; i++) {
          if ((!stat.progress[i].min || value >= stat.progress[i].min) && (!stat.progress[i].max || value <= stat.progress[i].max)) {
            progressClass = stat.progress[i]["class"];
            break;
          }
        }
        this.set({
          min: stat.min,
          max: stat.max,
          width: (stat.min + value) / stat.max * 100,
          progressClass: progressClass });
      } });
  },
  load: function load(done) {
    var _this = this;
    return new Promise(function (resolve, reject) {
      Templates.get("components").then(function (templates) {
        $("<div>").html(templates).find("script.template").each(function () {
          var $this = $(this);
          _this.templates[$this.attr("name")] = $this.html().trim();
        });
        _this.create();
        resolve(_this);
      })["catch"](reject);
    });
  } };

},{"./Templates":6,"./lib/es6-promise.min.js":9}],5:[function(require,module,exports){
"use strict";

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };

var _defaults = function (obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; };

Object.defineProperty(exports, "__esModule", {
  value: true
});

_defaults(exports, _interopRequireWildcard(require("./pages/team")));

_defaults(exports, _interopRequireWildcard(require("./pages/event")));

},{"./pages/event":10,"./pages/team":11}],6:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

require("./lib/es6-promise.min.js");

var cacheable = _interopRequire(require("./cacheable"));

module.exports = cacheable(function (key) {
  var url = "templates/" + key + ".html";
  return new Promise(function (resolve, reject) {
    return $.ajax({
      method: "get",
      url: url,
      error: reject
    }).then(resolve);
  })["catch"](function (res) {
    console.error("Template Request Unsuccessful", url, res);
    return res;
  });
});

},{"./cacheable":7,"./lib/es6-promise.min.js":9}],7:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

module.exports = cacheable;

require("./lib/es6-promise.min.js");

var cacheable = _interopRequire(require("./cacheable"));

function cacheable(getPromise) {
  var _cache = {};

  function set(key, value) {
    return _cache[key] = value;
  }

  return {
    get: function get(key, callback) {
      return new Promise(function (resolve, reject) {
        if (_cache[key]) {
          return resolve(_cache[key]);
        }

        getPromise(key).then(function (value) {
          return set(key, value);
        }).then(resolve)["catch"](reject);
      }).then(callback);
    } };
}

},{"./cacheable":7,"./lib/es6-promise.min.js":9}],8:[function(require,module,exports){
"use strict";

exports.getJSON = getJSON;
exports.round = round;
exports.documentReady = documentReady;
exports.extend = extend;
Object.defineProperty(exports, "__esModule", {
  value: true
});

require("./lib/es6-promise.min.js");

function getJSON(url) {
  return new Promise(function (resolve, reject) {
    $.ajax({
      method: "get",
      dataType: "json",
      data: {},
      url: url,
      error: reject
    }).then(resolve);
  });
}

function round(n, digits) {
  var n = parseFloat(n);
  var digits = parseInt(digits);
  var parts = (Math.round(n * Math.pow(10, digits)) / Math.pow(10, digits)).toString().split(".");
  if (parts.length == 1) {
    parts.push("");
  }
  return parts[0] + (digits ? "." : "") + parts[1] + Array(Math.max(0, digits - parts[1].length + 1)).join("0");
}

function documentReady() {
  return new Promise(function (resolve, reject) {
    if ($.isReady) {
      resolve();
    } else {
      $(resolve);
    }
  });
}

function extend() {
  var result = arguments[0];
  for (var i = 1; i < arguments.length; i++) {
    for (var key in arguments[i]) {
      result[key] = arguments[i][key];
    }
  }
  return result;
}

},{"./lib/es6-promise.min.js":9}],9:[function(require,module,exports){
(function (process,global){
/*!
 * @overview es6-promise - a tiny implementation of Promises/A+.
 * @copyright Copyright (c) 2014 Yehuda Katz, Tom Dale, Stefan Penner and contributors (Conversion to ES6 API by Jake Archibald)
 * @license   Licensed under MIT license
 *            See https://raw.githubusercontent.com/jakearchibald/es6-promise/master/LICENSE
 * @version   3.2.1
 */

"use strict";

(function () {
  "use strict";function t(t) {
    return "function" == typeof t || "object" == typeof t && null !== t;
  }function e(t) {
    return "function" == typeof t;
  }function n(t) {
    G = t;
  }function r(t) {
    Q = t;
  }function o() {
    return function () {
      process.nextTick(a);
    };
  }function i() {
    return function () {
      B(a);
    };
  }function s() {
    var t = 0,
        e = new X(a),
        n = document.createTextNode("");return (e.observe(n, { characterData: !0 }), function () {
      n.data = t = ++t % 2;
    });
  }function u() {
    var t = new MessageChannel();return (t.port1.onmessage = a, function () {
      t.port2.postMessage(0);
    });
  }function c() {
    return function () {
      setTimeout(a, 1);
    };
  }function a() {
    for (var t = 0; J > t; t += 2) {
      var e = tt[t],
          n = tt[t + 1];e(n), tt[t] = void 0, tt[t + 1] = void 0;
    }J = 0;
  }function f() {
    try {
      var t = require,
          e = t("vertx");return (B = e.runOnLoop || e.runOnContext, i());
    } catch (n) {
      return c();
    }
  }function l(t, e) {
    var n = this,
        r = new this.constructor(p);void 0 === r[rt] && k(r);var o = n._state;if (o) {
      var i = arguments[o - 1];Q(function () {
        x(o, r, i, n._result);
      });
    } else E(n, r, t, e);return r;
  }function h(t) {
    var e = this;if (t && "object" == typeof t && t.constructor === e) {
      return t;
    }var n = new e(p);return (g(n, t), n);
  }function p() {}function _() {
    return new TypeError("You cannot resolve a promise with itself");
  }function d() {
    return new TypeError("A promises callback cannot return that same promise.");
  }function v(t) {
    try {
      return t.then;
    } catch (e) {
      return (ut.error = e, ut);
    }
  }function y(t, e, n, r) {
    try {
      t.call(e, n, r);
    } catch (o) {
      return o;
    }
  }function m(t, e, n) {
    Q(function (t) {
      var r = !1,
          o = y(n, e, function (n) {
        r || (r = !0, e !== n ? g(t, n) : S(t, n));
      }, function (e) {
        r || (r = !0, j(t, e));
      }, "Settle: " + (t._label || " unknown promise"));!r && o && (r = !0, j(t, o));
    }, t);
  }function b(t, e) {
    e._state === it ? S(t, e._result) : e._state === st ? j(t, e._result) : E(e, void 0, function (e) {
      g(t, e);
    }, function (e) {
      j(t, e);
    });
  }function w(t, n, r) {
    n.constructor === t.constructor && r === et && constructor.resolve === nt ? b(t, n) : r === ut ? j(t, ut.error) : void 0 === r ? S(t, n) : e(r) ? m(t, n, r) : S(t, n);
  }function g(e, n) {
    e === n ? j(e, _()) : t(n) ? w(e, n, v(n)) : S(e, n);
  }function A(t) {
    t._onerror && t._onerror(t._result), T(t);
  }function S(t, e) {
    t._state === ot && (t._result = e, t._state = it, 0 !== t._subscribers.length && Q(T, t));
  }function j(t, e) {
    t._state === ot && (t._state = st, t._result = e, Q(A, t));
  }function E(t, e, n, r) {
    var o = t._subscribers,
        i = o.length;t._onerror = null, o[i] = e, o[i + it] = n, o[i + st] = r, 0 === i && t._state && Q(T, t);
  }function T(t) {
    var e = t._subscribers,
        n = t._state;if (0 !== e.length) {
      for (var r, o, i = t._result, s = 0; s < e.length; s += 3) r = e[s], o = e[s + n], r ? x(n, r, o, i) : o(i);t._subscribers.length = 0;
    }
  }function M() {
    this.error = null;
  }function P(t, e) {
    try {
      return t(e);
    } catch (n) {
      return (ct.error = n, ct);
    }
  }function x(t, n, r, o) {
    var i,
        s,
        u,
        c,
        a = e(r);if (a) {
      if ((i = P(r, o), i === ct ? (c = !0, s = i.error, i = null) : u = !0, n === i)) {
        return void j(n, d());
      }
    } else i = o, u = !0;n._state !== ot || (a && u ? g(n, i) : c ? j(n, s) : t === it ? S(n, i) : t === st && j(n, i));
  }function C(t, e) {
    try {
      e(function (e) {
        g(t, e);
      }, function (e) {
        j(t, e);
      });
    } catch (n) {
      j(t, n);
    }
  }function O() {
    return at++;
  }function k(t) {
    t[rt] = at++, t._state = void 0, t._result = void 0, t._subscribers = [];
  }function Y(t) {
    return new _t(this, t).promise;
  }function q(t) {
    var e = this;return new e(I(t) ? function (n, r) {
      for (var o = t.length, i = 0; o > i; i++) e.resolve(t[i]).then(n, r);
    } : function (t, e) {
      e(new TypeError("You must pass an array to race."));
    });
  }function F(t) {
    var e = this,
        n = new e(p);return (j(n, t), n);
  }function D() {
    throw new TypeError("You must pass a resolver function as the first argument to the promise constructor");
  }function K() {
    throw new TypeError("Failed to construct 'Promise': Please use the 'new' operator, this object constructor cannot be called as a function.");
  }function L(t) {
    this[rt] = O(), this._result = this._state = void 0, this._subscribers = [], p !== t && ("function" != typeof t && D(), this instanceof L ? C(this, t) : K());
  }function N(t, e) {
    this._instanceConstructor = t, this.promise = new t(p), this.promise[rt] || k(this.promise), Array.isArray(e) ? (this._input = e, this.length = e.length, this._remaining = e.length, this._result = new Array(this.length), 0 === this.length ? S(this.promise, this._result) : (this.length = this.length || 0, this._enumerate(), 0 === this._remaining && S(this.promise, this._result))) : j(this.promise, U());
  }function U() {
    return new Error("Array Methods must be provided an Array");
  }function W() {
    var t;if ("undefined" != typeof global) t = global;else if ("undefined" != typeof self) t = self;else try {
      t = Function("return this")();
    } catch (e) {
      throw new Error("polyfill failed because global object is unavailable in this environment");
    }var n = t.Promise;(!n || "[object Promise]" !== Object.prototype.toString.call(n.resolve()) || n.cast) && (t.Promise = pt);
  }var z;z = Array.isArray ? Array.isArray : function (t) {
    return "[object Array]" === Object.prototype.toString.call(t);
  };var B,
      G,
      H,
      I = z,
      J = 0,
      Q = function Q(t, e) {
    tt[J] = t, tt[J + 1] = e, J += 2, 2 === J && (G ? G(a) : H());
  },
      R = "undefined" != typeof window ? window : void 0,
      V = R || {},
      X = V.MutationObserver || V.WebKitMutationObserver,
      Z = "undefined" == typeof self && "undefined" != typeof process && "[object process]" === ({}).toString.call(process),
      $ = "undefined" != typeof Uint8ClampedArray && "undefined" != typeof importScripts && "undefined" != typeof MessageChannel,
      tt = new Array(1000);H = Z ? o() : X ? s() : $ ? u() : void 0 === R && "function" == typeof require ? f() : c();var et = l,
      nt = h,
      rt = Math.random().toString(36).substring(16),
      ot = void 0,
      it = 1,
      st = 2,
      ut = new M(),
      ct = new M(),
      at = 0,
      ft = Y,
      lt = q,
      ht = F,
      pt = L;L.all = ft, L.race = lt, L.resolve = nt, L.reject = ht, L._setScheduler = n, L._setAsap = r, L._asap = Q, L.prototype = { constructor: L, then: et, "catch": function _catch(t) {
      return this.then(null, t);
    } };var _t = N;N.prototype._enumerate = function () {
    for (var t = this.length, e = this._input, n = 0; this._state === ot && t > n; n++) this._eachEntry(e[n], n);
  }, N.prototype._eachEntry = function (t, e) {
    var n = this._instanceConstructor,
        r = n.resolve;if (r === nt) {
      var o = v(t);if (o === et && t._state !== ot) this._settledAt(t._state, e, t._result);else if ("function" != typeof o) this._remaining--, this._result[e] = t;else if (n === pt) {
        var i = new n(p);w(i, t, o), this._willSettleAt(i, e);
      } else this._willSettleAt(new n(function (e) {
        e(t);
      }), e);
    } else this._willSettleAt(r(t), e);
  }, N.prototype._settledAt = function (t, e, n) {
    var r = this.promise;r._state === ot && (this._remaining--, t === st ? j(r, n) : this._result[e] = n), 0 === this._remaining && S(r, this._result);
  }, N.prototype._willSettleAt = function (t, e) {
    var n = this;E(t, void 0, function (t) {
      n._settledAt(it, e, t);
    }, function (t) {
      n._settledAt(st, e, t);
    });
  };var dt = W,
      vt = { Promise: pt, polyfill: dt };"function" == typeof define && define.amd ? define(function () {
    return vt;
  }) : "undefined" != typeof module && module.exports ? module.exports = vt : "undefined" != typeof this && (this.ES6Promise = vt), dt();
}).call(undefined);

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2RhbmllbC9Eb2N1bWVudHMvcHJvamVjdHMvb3JiLWNsaWVudC9zcmMvbGliL2VzNi1wcm9taXNlLm1pbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLENBQUMsWUFBVTtBQUFDLGNBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUM7QUFBQyxXQUFNLFVBQVUsSUFBRSxPQUFPLENBQUMsSUFBRSxRQUFRLElBQUUsT0FBTyxDQUFDLElBQUUsSUFBSSxLQUFHLENBQUMsQ0FBQTtHQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBQztBQUFDLFdBQU0sVUFBVSxJQUFFLE9BQU8sQ0FBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDO0FBQUMsS0FBQyxHQUFDLENBQUMsQ0FBQTtHQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBQztBQUFDLEtBQUMsR0FBQyxDQUFDLENBQUE7R0FBQyxTQUFTLENBQUMsR0FBRTtBQUFDLFdBQU8sWUFBVTtBQUFDLGFBQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLEdBQUU7QUFBQyxXQUFPLFlBQVU7QUFBQyxPQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLEdBQUU7QUFBQyxRQUFJLENBQUMsR0FBQyxDQUFDO1FBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUFDLENBQUMsR0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLFlBQVU7QUFBQyxPQUFDLENBQUMsSUFBSSxHQUFDLENBQUMsR0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUE7S0FBQyxDQUFBLENBQUE7R0FBQyxTQUFTLENBQUMsR0FBRTtBQUFDLFFBQUksQ0FBQyxHQUFDLElBQUksY0FBYyxFQUFBLENBQUMsUUFBTyxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBQyxDQUFDLEVBQUMsWUFBVTtBQUFDLE9BQUMsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsQ0FBQSxDQUFBO0dBQUMsU0FBUyxDQUFDLEdBQUU7QUFBQyxXQUFPLFlBQVU7QUFBQyxnQkFBVSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLENBQUE7R0FBQyxTQUFTLENBQUMsR0FBRTtBQUFDLFNBQUksSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxJQUFFLENBQUMsRUFBQztBQUFDLFVBQUksQ0FBQyxHQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7VUFBQyxDQUFDLEdBQUMsRUFBRSxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFDLEtBQUssQ0FBQyxFQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEdBQUMsS0FBSyxDQUFDLENBQUE7S0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLEdBQUU7QUFBQyxRQUFHO0FBQUMsVUFBSSxDQUFDLEdBQUMsT0FBTztVQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBTyxDQUFDLEdBQUMsQ0FBQyxDQUFDLFNBQVMsSUFBRSxDQUFDLENBQUMsWUFBWSxFQUFDLENBQUMsRUFBRSxDQUFBLENBQUE7S0FBQyxDQUFBLE9BQU0sQ0FBQyxFQUFDO0FBQUMsYUFBTyxDQUFDLEVBQUUsQ0FBQTtLQUFDO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLFFBQUksQ0FBQyxHQUFDLElBQUk7UUFBQyxDQUFDLEdBQUMsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFHLENBQUMsRUFBQztBQUFDLFVBQUksQ0FBQyxHQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVU7QUFBQyxTQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFBO09BQUMsQ0FBQyxDQUFBO0tBQUMsTUFBSyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUE7R0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBRyxDQUFDLElBQUUsUUFBUSxJQUFFLE9BQU8sQ0FBQyxJQUFFLENBQUMsQ0FBQyxXQUFXLEtBQUcsQ0FBQztBQUFDLGFBQU8sQ0FBQyxDQUFDO0tBQUEsSUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBTyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQSxDQUFBO0dBQUMsU0FBUyxDQUFDLEdBQUUsRUFBRSxTQUFTLENBQUMsR0FBRTtBQUFDLFdBQU8sSUFBSSxTQUFTLENBQUMsMENBQTBDLENBQUMsQ0FBQTtHQUFDLFNBQVMsQ0FBQyxHQUFFO0FBQUMsV0FBTyxJQUFJLFNBQVMsQ0FBQyxzREFBc0QsQ0FBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBRztBQUFDLGFBQU8sQ0FBQyxDQUFDLElBQUksQ0FBQTtLQUFDLENBQUEsT0FBTSxDQUFDLEVBQUM7QUFBQyxjQUFPLEVBQUUsQ0FBQyxLQUFLLEdBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQSxDQUFBO0tBQUM7R0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxRQUFHO0FBQUMsT0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsQ0FBQSxPQUFNLENBQUMsRUFBQztBQUFDLGFBQU8sQ0FBQyxDQUFBO0tBQUM7R0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLEtBQUMsQ0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFVBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQztVQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxVQUFTLENBQUMsRUFBQztBQUFDLFNBQUMsS0FBRyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxLQUFHLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUEsQUFBQyxDQUFBO09BQUMsRUFBQyxVQUFTLENBQUMsRUFBQztBQUFDLFNBQUMsS0FBRyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQSxBQUFDLENBQUE7T0FBQyxFQUFDLFVBQVUsSUFBRSxDQUFDLENBQUMsTUFBTSxJQUFFLGtCQUFrQixDQUFBLEFBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFFLENBQUMsS0FBRyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQSxBQUFDLENBQUE7S0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLEtBQUMsQ0FBQyxNQUFNLEtBQUcsRUFBRSxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUcsRUFBRSxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsS0FBSyxDQUFDLEVBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxPQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsRUFBQyxVQUFTLENBQUMsRUFBQztBQUFDLE9BQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxDQUFDLENBQUE7R0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLEtBQUMsQ0FBQyxXQUFXLEtBQUcsQ0FBQyxDQUFDLFdBQVcsSUFBRSxDQUFDLEtBQUcsRUFBRSxJQUFFLFdBQVcsQ0FBQyxPQUFPLEtBQUcsRUFBRSxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxLQUFHLEVBQUUsR0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBQyxLQUFLLENBQUMsS0FBRyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxLQUFDLEtBQUcsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBQztBQUFDLEtBQUMsQ0FBQyxRQUFRLElBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLEtBQUMsQ0FBQyxNQUFNLEtBQUcsRUFBRSxLQUFHLENBQUMsQ0FBQyxPQUFPLEdBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUMsRUFBRSxFQUFDLENBQUMsS0FBRyxDQUFDLENBQUMsWUFBWSxDQUFDLE1BQU0sSUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFBLEFBQUMsQ0FBQTtHQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxLQUFDLENBQUMsTUFBTSxLQUFHLEVBQUUsS0FBRyxDQUFDLENBQUMsTUFBTSxHQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsT0FBTyxHQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFBLEFBQUMsQ0FBQTtHQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLFFBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQyxZQUFZO1FBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsR0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEtBQUcsQ0FBQyxJQUFFLENBQUMsQ0FBQyxNQUFNLElBQUUsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBQztBQUFDLFFBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQyxZQUFZO1FBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBRyxDQUFDLEtBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBQztBQUFDLFdBQUksSUFBSSxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsT0FBTyxFQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUMsQ0FBQyxJQUFFLENBQUMsRUFBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQTtLQUFDO0dBQUMsU0FBUyxDQUFDLEdBQUU7QUFBQyxRQUFJLENBQUMsS0FBSyxHQUFDLElBQUksQ0FBQTtHQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxRQUFHO0FBQUMsYUFBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxDQUFBLE9BQU0sQ0FBQyxFQUFDO0FBQUMsY0FBTyxFQUFFLENBQUMsS0FBSyxHQUFDLENBQUMsRUFBQyxFQUFFLENBQUEsQ0FBQTtLQUFDO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDO1FBQUMsQ0FBQztRQUFDLENBQUM7UUFBQyxDQUFDO1FBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLENBQUMsRUFBQztBQUFDLFdBQUcsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxLQUFHLEVBQUUsSUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQSxHQUFFLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEtBQUcsQ0FBQyxDQUFBO0FBQUMsZUFBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtPQUFBO0tBQUMsTUFBSyxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFHLEVBQUUsS0FBRyxDQUFDLElBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxLQUFHLEVBQUUsR0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsS0FBRyxFQUFFLElBQUUsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQSxBQUFDLENBQUE7R0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBRztBQUFDLE9BQUMsQ0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFNBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUE7T0FBQyxFQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsU0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtPQUFDLENBQUMsQ0FBQTtLQUFDLENBQUEsT0FBTSxDQUFDLEVBQUM7QUFBQyxPQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUM7R0FBQyxTQUFTLENBQUMsR0FBRTtBQUFDLFdBQU8sRUFBRSxFQUFFLENBQUE7R0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUM7QUFBQyxLQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsRUFBRSxFQUFFLEVBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBQyxLQUFLLENBQUMsRUFBQyxDQUFDLENBQUMsT0FBTyxHQUFDLEtBQUssQ0FBQyxFQUFDLENBQUMsQ0FBQyxZQUFZLEdBQUMsRUFBRSxDQUFBO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDO0FBQUMsV0FBTyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFBO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLFVBQVMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLFdBQUksSUFBSSxDQUFDLEdBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBQyxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsR0FBQyxVQUFTLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxPQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsaUNBQWlDLENBQUMsQ0FBQyxDQUFBO0tBQUMsQ0FBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsSUFBSTtRQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFBLENBQUE7R0FBQyxTQUFTLENBQUMsR0FBRTtBQUFDLFVBQU0sSUFBSSxTQUFTLENBQUMsb0ZBQW9GLENBQUMsQ0FBQTtHQUFDLFNBQVMsQ0FBQyxHQUFFO0FBQUMsVUFBTSxJQUFJLFNBQVMsQ0FBQyx1SEFBdUgsQ0FBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsRUFBRSxFQUFDLElBQUksQ0FBQyxPQUFPLEdBQUMsSUFBSSxDQUFDLE1BQU0sR0FBQyxLQUFLLENBQUMsRUFBQyxJQUFJLENBQUMsWUFBWSxHQUFDLEVBQUUsRUFBQyxDQUFDLEtBQUcsQ0FBQyxLQUFHLFVBQVUsSUFBRSxPQUFPLENBQUMsSUFBRSxDQUFDLEVBQUUsRUFBQyxJQUFJLFlBQVksQ0FBQyxHQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUEsQUFBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLFFBQUksQ0FBQyxvQkFBb0IsR0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLE9BQU8sR0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxJQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBRSxJQUFJLENBQUMsTUFBTSxHQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUMsSUFBSSxDQUFDLFVBQVUsR0FBQyxDQUFDLENBQUMsTUFBTSxFQUFDLElBQUksQ0FBQyxPQUFPLEdBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFDLENBQUMsS0FBRyxJQUFJLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBRSxJQUFJLENBQUMsTUFBTSxHQUFDLElBQUksQ0FBQyxNQUFNLElBQUUsQ0FBQyxFQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBQyxDQUFDLEtBQUcsSUFBSSxDQUFDLFVBQVUsSUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUEsQUFBQyxDQUFBLEdBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtHQUFDLFNBQVMsQ0FBQyxHQUFFO0FBQUMsV0FBTyxJQUFJLEtBQUssQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLEdBQUU7QUFBQyxRQUFJLENBQUMsQ0FBQyxJQUFHLFdBQVcsSUFBRSxPQUFPLE1BQU0sRUFBQyxDQUFDLEdBQUMsTUFBTSxDQUFDLEtBQUssSUFBRyxXQUFXLElBQUUsT0FBTyxJQUFJLEVBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxLQUFLLElBQUc7QUFBQyxPQUFDLEdBQUMsUUFBUSxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUE7S0FBQyxDQUFBLE9BQU0sQ0FBQyxFQUFDO0FBQUMsWUFBTSxJQUFJLEtBQUssQ0FBQywwRUFBMEUsQ0FBQyxDQUFBO0tBQUMsSUFBSSxDQUFDLEdBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFFLGtCQUFrQixLQUFHLE1BQU0sQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsT0FBTyxFQUFFLENBQUMsSUFBRSxDQUFDLENBQUMsSUFBSSxDQUFBLEtBQUksQ0FBQyxDQUFDLE9BQU8sR0FBQyxFQUFFLENBQUEsQUFBQyxDQUFBO0dBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFDLEtBQUssQ0FBQyxPQUFPLEdBQUMsS0FBSyxDQUFDLE9BQU8sR0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFdBQU0sZ0JBQWdCLEtBQUcsTUFBTSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO0dBQUMsQ0FBQyxJQUFJLENBQUM7TUFBQyxDQUFDO01BQUMsQ0FBQztNQUFDLENBQUMsR0FBQyxDQUFDO01BQUMsQ0FBQyxHQUFDLENBQUM7TUFBQyxDQUFDLEdBQUMsV0FBUyxDQUFDLEVBQUMsQ0FBQyxFQUFDO0FBQUMsTUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxFQUFFLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLElBQUUsQ0FBQyxFQUFDLENBQUMsS0FBRyxDQUFDLEtBQUcsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLEVBQUUsQ0FBQSxBQUFDLENBQUE7R0FBQztNQUFDLENBQUMsR0FBQyxXQUFXLElBQUUsT0FBTyxNQUFNLEdBQUMsTUFBTSxHQUFDLEtBQUssQ0FBQztNQUFDLENBQUMsR0FBQyxDQUFDLElBQUUsRUFBRTtNQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsZ0JBQWdCLElBQUUsQ0FBQyxDQUFDLHNCQUFzQjtNQUFDLENBQUMsR0FBQyxXQUFXLElBQUUsT0FBTyxJQUFJLElBQUUsV0FBVyxJQUFFLE9BQU8sT0FBTyxJQUFFLGtCQUFrQixLQUFHLENBQUEsR0FBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO01BQUMsQ0FBQyxHQUFDLFdBQVcsSUFBRSxPQUFPLGlCQUFpQixJQUFFLFdBQVcsSUFBRSxPQUFPLGFBQWEsSUFBRSxXQUFXLElBQUUsT0FBTyxjQUFjO01BQUMsRUFBRSxHQUFDLElBQUksS0FBSyxDQUFDLElBQUcsQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLEdBQUMsQ0FBQyxFQUFFLEdBQUMsQ0FBQyxHQUFDLENBQUMsRUFBRSxHQUFDLENBQUMsR0FBQyxDQUFDLEVBQUUsR0FBQyxLQUFLLENBQUMsS0FBRyxDQUFDLElBQUUsVUFBVSxJQUFFLE9BQU8sT0FBTyxHQUFDLENBQUMsRUFBRSxHQUFDLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxHQUFDLENBQUM7TUFBQyxFQUFFLEdBQUMsQ0FBQztNQUFDLEVBQUUsR0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsUUFBUSxDQUFDLEVBQUUsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7TUFBQyxFQUFFLEdBQUMsS0FBSyxDQUFDO01BQUMsRUFBRSxHQUFDLENBQUM7TUFBQyxFQUFFLEdBQUMsQ0FBQztNQUFDLEVBQUUsR0FBQyxJQUFJLENBQUMsRUFBQTtNQUFDLEVBQUUsR0FBQyxJQUFJLENBQUMsRUFBQTtNQUFDLEVBQUUsR0FBQyxDQUFDO01BQUMsRUFBRSxHQUFDLENBQUM7TUFBQyxFQUFFLEdBQUMsQ0FBQztNQUFDLEVBQUUsR0FBQyxDQUFDO01BQUMsRUFBRSxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsSUFBSSxHQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsT0FBTyxHQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsTUFBTSxHQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsYUFBYSxHQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsUUFBUSxHQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsS0FBSyxHQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsU0FBUyxHQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxJQUFJLEVBQUMsRUFBRSxFQUFDLE9BQU8sRUFBQyxnQkFBUyxDQUFDLEVBQUM7QUFBQyxhQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsRUFBQyxDQUFDLElBQUksRUFBRSxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBQyxZQUFVO0FBQUMsU0FBSSxJQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsTUFBTSxFQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsTUFBTSxFQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLE1BQU0sS0FBRyxFQUFFLElBQUUsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLEVBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUMsVUFBUyxDQUFDLEVBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLG9CQUFvQjtRQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUcsQ0FBQyxLQUFHLEVBQUUsRUFBQztBQUFDLFVBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLENBQUMsS0FBRyxFQUFFLElBQUUsQ0FBQyxDQUFDLE1BQU0sS0FBRyxFQUFFLEVBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxJQUFHLFVBQVUsSUFBRSxPQUFPLENBQUMsRUFBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsS0FBSyxJQUFHLENBQUMsS0FBRyxFQUFFLEVBQUM7QUFBQyxZQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtPQUFDLE1BQUssSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFNBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtPQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLE1BQUssSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUE7R0FBQyxFQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFDLFVBQVMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUcsRUFBRSxLQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBQyxDQUFDLEtBQUcsRUFBRSxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUEsQUFBQyxFQUFDLENBQUMsS0FBRyxJQUFJLENBQUMsVUFBVSxJQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0dBQUMsRUFBQyxDQUFDLENBQUMsU0FBUyxDQUFDLGFBQWEsR0FBQyxVQUFTLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxLQUFLLENBQUMsRUFBQyxVQUFTLENBQUMsRUFBQztBQUFDLE9BQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLEVBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxPQUFDLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLElBQUksRUFBRSxHQUFDLENBQUM7TUFBQyxFQUFFLEdBQUMsRUFBQyxPQUFPLEVBQUMsRUFBRSxFQUFDLFFBQVEsRUFBQyxFQUFFLEVBQUMsQ0FBQyxVQUFVLElBQUUsT0FBTyxNQUFNLElBQUUsTUFBTSxDQUFDLEdBQUcsR0FBQyxNQUFNLENBQUMsWUFBVTtBQUFDLFdBQU8sRUFBRSxDQUFBO0dBQUMsQ0FBQyxHQUFDLFdBQVcsSUFBRSxPQUFPLE1BQU0sSUFBRSxNQUFNLENBQUMsT0FBTyxHQUFDLE1BQU0sQ0FBQyxPQUFPLEdBQUMsRUFBRSxHQUFDLFdBQVcsSUFBRSxPQUFPLElBQUksS0FBRyxJQUFJLENBQUMsVUFBVSxHQUFDLEVBQUUsQ0FBQSxBQUFDLEVBQUMsRUFBRSxFQUFFLENBQUE7Q0FBQyxDQUFBLENBQUUsSUFBSSxXQUFNLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIi8qIVxuICogQG92ZXJ2aWV3IGVzNi1wcm9taXNlIC0gYSB0aW55IGltcGxlbWVudGF0aW9uIG9mIFByb21pc2VzL0ErLlxuICogQGNvcHlyaWdodCBDb3B5cmlnaHQgKGMpIDIwMTQgWWVodWRhIEthdHosIFRvbSBEYWxlLCBTdGVmYW4gUGVubmVyIGFuZCBjb250cmlidXRvcnMgKENvbnZlcnNpb24gdG8gRVM2IEFQSSBieSBKYWtlIEFyY2hpYmFsZClcbiAqIEBsaWNlbnNlICAgTGljZW5zZWQgdW5kZXIgTUlUIGxpY2Vuc2VcbiAqICAgICAgICAgICAgU2VlIGh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9qYWtlYXJjaGliYWxkL2VzNi1wcm9taXNlL21hc3Rlci9MSUNFTlNFXG4gKiBAdmVyc2lvbiAgIDMuMi4xXG4gKi9cblxuKGZ1bmN0aW9uKCl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gdCh0KXtyZXR1cm5cImZ1bmN0aW9uXCI9PXR5cGVvZiB0fHxcIm9iamVjdFwiPT10eXBlb2YgdCYmbnVsbCE9PXR9ZnVuY3Rpb24gZSh0KXtyZXR1cm5cImZ1bmN0aW9uXCI9PXR5cGVvZiB0fWZ1bmN0aW9uIG4odCl7Rz10fWZ1bmN0aW9uIHIodCl7UT10fWZ1bmN0aW9uIG8oKXtyZXR1cm4gZnVuY3Rpb24oKXtwcm9jZXNzLm5leHRUaWNrKGEpfX1mdW5jdGlvbiBpKCl7cmV0dXJuIGZ1bmN0aW9uKCl7QihhKX19ZnVuY3Rpb24gcygpe3ZhciB0PTAsZT1uZXcgWChhKSxuPWRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiXCIpO3JldHVybiBlLm9ic2VydmUobix7Y2hhcmFjdGVyRGF0YTohMH0pLGZ1bmN0aW9uKCl7bi5kYXRhPXQ9Kyt0JTJ9fWZ1bmN0aW9uIHUoKXt2YXIgdD1uZXcgTWVzc2FnZUNoYW5uZWw7cmV0dXJuIHQucG9ydDEub25tZXNzYWdlPWEsZnVuY3Rpb24oKXt0LnBvcnQyLnBvc3RNZXNzYWdlKDApfX1mdW5jdGlvbiBjKCl7cmV0dXJuIGZ1bmN0aW9uKCl7c2V0VGltZW91dChhLDEpfX1mdW5jdGlvbiBhKCl7Zm9yKHZhciB0PTA7Sj50O3QrPTIpe3ZhciBlPXR0W3RdLG49dHRbdCsxXTtlKG4pLHR0W3RdPXZvaWQgMCx0dFt0KzFdPXZvaWQgMH1KPTB9ZnVuY3Rpb24gZigpe3RyeXt2YXIgdD1yZXF1aXJlLGU9dChcInZlcnR4XCIpO3JldHVybiBCPWUucnVuT25Mb29wfHxlLnJ1bk9uQ29udGV4dCxpKCl9Y2F0Y2gobil7cmV0dXJuIGMoKX19ZnVuY3Rpb24gbCh0LGUpe3ZhciBuPXRoaXMscj1uZXcgdGhpcy5jb25zdHJ1Y3RvcihwKTt2b2lkIDA9PT1yW3J0XSYmayhyKTt2YXIgbz1uLl9zdGF0ZTtpZihvKXt2YXIgaT1hcmd1bWVudHNbby0xXTtRKGZ1bmN0aW9uKCl7eChvLHIsaSxuLl9yZXN1bHQpfSl9ZWxzZSBFKG4scix0LGUpO3JldHVybiByfWZ1bmN0aW9uIGgodCl7dmFyIGU9dGhpcztpZih0JiZcIm9iamVjdFwiPT10eXBlb2YgdCYmdC5jb25zdHJ1Y3Rvcj09PWUpcmV0dXJuIHQ7dmFyIG49bmV3IGUocCk7cmV0dXJuIGcobix0KSxufWZ1bmN0aW9uIHAoKXt9ZnVuY3Rpb24gXygpe3JldHVybiBuZXcgVHlwZUVycm9yKFwiWW91IGNhbm5vdCByZXNvbHZlIGEgcHJvbWlzZSB3aXRoIGl0c2VsZlwiKX1mdW5jdGlvbiBkKCl7cmV0dXJuIG5ldyBUeXBlRXJyb3IoXCJBIHByb21pc2VzIGNhbGxiYWNrIGNhbm5vdCByZXR1cm4gdGhhdCBzYW1lIHByb21pc2UuXCIpfWZ1bmN0aW9uIHYodCl7dHJ5e3JldHVybiB0LnRoZW59Y2F0Y2goZSl7cmV0dXJuIHV0LmVycm9yPWUsdXR9fWZ1bmN0aW9uIHkodCxlLG4scil7dHJ5e3QuY2FsbChlLG4scil9Y2F0Y2gobyl7cmV0dXJuIG99fWZ1bmN0aW9uIG0odCxlLG4pe1EoZnVuY3Rpb24odCl7dmFyIHI9ITEsbz15KG4sZSxmdW5jdGlvbihuKXtyfHwocj0hMCxlIT09bj9nKHQsbik6Uyh0LG4pKX0sZnVuY3Rpb24oZSl7cnx8KHI9ITAsaih0LGUpKX0sXCJTZXR0bGU6IFwiKyh0Ll9sYWJlbHx8XCIgdW5rbm93biBwcm9taXNlXCIpKTshciYmbyYmKHI9ITAsaih0LG8pKX0sdCl9ZnVuY3Rpb24gYih0LGUpe2UuX3N0YXRlPT09aXQ/Uyh0LGUuX3Jlc3VsdCk6ZS5fc3RhdGU9PT1zdD9qKHQsZS5fcmVzdWx0KTpFKGUsdm9pZCAwLGZ1bmN0aW9uKGUpe2codCxlKX0sZnVuY3Rpb24oZSl7aih0LGUpfSl9ZnVuY3Rpb24gdyh0LG4scil7bi5jb25zdHJ1Y3Rvcj09PXQuY29uc3RydWN0b3ImJnI9PT1ldCYmY29uc3RydWN0b3IucmVzb2x2ZT09PW50P2IodCxuKTpyPT09dXQ/aih0LHV0LmVycm9yKTp2b2lkIDA9PT1yP1ModCxuKTplKHIpP20odCxuLHIpOlModCxuKX1mdW5jdGlvbiBnKGUsbil7ZT09PW4/aihlLF8oKSk6dChuKT93KGUsbix2KG4pKTpTKGUsbil9ZnVuY3Rpb24gQSh0KXt0Ll9vbmVycm9yJiZ0Ll9vbmVycm9yKHQuX3Jlc3VsdCksVCh0KX1mdW5jdGlvbiBTKHQsZSl7dC5fc3RhdGU9PT1vdCYmKHQuX3Jlc3VsdD1lLHQuX3N0YXRlPWl0LDAhPT10Ll9zdWJzY3JpYmVycy5sZW5ndGgmJlEoVCx0KSl9ZnVuY3Rpb24gaih0LGUpe3QuX3N0YXRlPT09b3QmJih0Ll9zdGF0ZT1zdCx0Ll9yZXN1bHQ9ZSxRKEEsdCkpfWZ1bmN0aW9uIEUodCxlLG4scil7dmFyIG89dC5fc3Vic2NyaWJlcnMsaT1vLmxlbmd0aDt0Ll9vbmVycm9yPW51bGwsb1tpXT1lLG9baStpdF09bixvW2krc3RdPXIsMD09PWkmJnQuX3N0YXRlJiZRKFQsdCl9ZnVuY3Rpb24gVCh0KXt2YXIgZT10Ll9zdWJzY3JpYmVycyxuPXQuX3N0YXRlO2lmKDAhPT1lLmxlbmd0aCl7Zm9yKHZhciByLG8saT10Ll9yZXN1bHQscz0wO3M8ZS5sZW5ndGg7cys9MylyPWVbc10sbz1lW3Mrbl0scj94KG4scixvLGkpOm8oaSk7dC5fc3Vic2NyaWJlcnMubGVuZ3RoPTB9fWZ1bmN0aW9uIE0oKXt0aGlzLmVycm9yPW51bGx9ZnVuY3Rpb24gUCh0LGUpe3RyeXtyZXR1cm4gdChlKX1jYXRjaChuKXtyZXR1cm4gY3QuZXJyb3I9bixjdH19ZnVuY3Rpb24geCh0LG4scixvKXt2YXIgaSxzLHUsYyxhPWUocik7aWYoYSl7aWYoaT1QKHIsbyksaT09PWN0PyhjPSEwLHM9aS5lcnJvcixpPW51bGwpOnU9ITAsbj09PWkpcmV0dXJuIHZvaWQgaihuLGQoKSl9ZWxzZSBpPW8sdT0hMDtuLl9zdGF0ZSE9PW90fHwoYSYmdT9nKG4saSk6Yz9qKG4scyk6dD09PWl0P1MobixpKTp0PT09c3QmJmoobixpKSl9ZnVuY3Rpb24gQyh0LGUpe3RyeXtlKGZ1bmN0aW9uKGUpe2codCxlKX0sZnVuY3Rpb24oZSl7aih0LGUpfSl9Y2F0Y2gobil7aih0LG4pfX1mdW5jdGlvbiBPKCl7cmV0dXJuIGF0Kyt9ZnVuY3Rpb24gayh0KXt0W3J0XT1hdCsrLHQuX3N0YXRlPXZvaWQgMCx0Ll9yZXN1bHQ9dm9pZCAwLHQuX3N1YnNjcmliZXJzPVtdfWZ1bmN0aW9uIFkodCl7cmV0dXJuIG5ldyBfdCh0aGlzLHQpLnByb21pc2V9ZnVuY3Rpb24gcSh0KXt2YXIgZT10aGlzO3JldHVybiBuZXcgZShJKHQpP2Z1bmN0aW9uKG4scil7Zm9yKHZhciBvPXQubGVuZ3RoLGk9MDtvPmk7aSsrKWUucmVzb2x2ZSh0W2ldKS50aGVuKG4scil9OmZ1bmN0aW9uKHQsZSl7ZShuZXcgVHlwZUVycm9yKFwiWW91IG11c3QgcGFzcyBhbiBhcnJheSB0byByYWNlLlwiKSl9KX1mdW5jdGlvbiBGKHQpe3ZhciBlPXRoaXMsbj1uZXcgZShwKTtyZXR1cm4gaihuLHQpLG59ZnVuY3Rpb24gRCgpe3Rocm93IG5ldyBUeXBlRXJyb3IoXCJZb3UgbXVzdCBwYXNzIGEgcmVzb2x2ZXIgZnVuY3Rpb24gYXMgdGhlIGZpcnN0IGFyZ3VtZW50IHRvIHRoZSBwcm9taXNlIGNvbnN0cnVjdG9yXCIpfWZ1bmN0aW9uIEsoKXt0aHJvdyBuZXcgVHlwZUVycm9yKFwiRmFpbGVkIHRvIGNvbnN0cnVjdCAnUHJvbWlzZSc6IFBsZWFzZSB1c2UgdGhlICduZXcnIG9wZXJhdG9yLCB0aGlzIG9iamVjdCBjb25zdHJ1Y3RvciBjYW5ub3QgYmUgY2FsbGVkIGFzIGEgZnVuY3Rpb24uXCIpfWZ1bmN0aW9uIEwodCl7dGhpc1tydF09TygpLHRoaXMuX3Jlc3VsdD10aGlzLl9zdGF0ZT12b2lkIDAsdGhpcy5fc3Vic2NyaWJlcnM9W10scCE9PXQmJihcImZ1bmN0aW9uXCIhPXR5cGVvZiB0JiZEKCksdGhpcyBpbnN0YW5jZW9mIEw/Qyh0aGlzLHQpOksoKSl9ZnVuY3Rpb24gTih0LGUpe3RoaXMuX2luc3RhbmNlQ29uc3RydWN0b3I9dCx0aGlzLnByb21pc2U9bmV3IHQocCksdGhpcy5wcm9taXNlW3J0XXx8ayh0aGlzLnByb21pc2UpLEFycmF5LmlzQXJyYXkoZSk/KHRoaXMuX2lucHV0PWUsdGhpcy5sZW5ndGg9ZS5sZW5ndGgsdGhpcy5fcmVtYWluaW5nPWUubGVuZ3RoLHRoaXMuX3Jlc3VsdD1uZXcgQXJyYXkodGhpcy5sZW5ndGgpLDA9PT10aGlzLmxlbmd0aD9TKHRoaXMucHJvbWlzZSx0aGlzLl9yZXN1bHQpOih0aGlzLmxlbmd0aD10aGlzLmxlbmd0aHx8MCx0aGlzLl9lbnVtZXJhdGUoKSwwPT09dGhpcy5fcmVtYWluaW5nJiZTKHRoaXMucHJvbWlzZSx0aGlzLl9yZXN1bHQpKSk6aih0aGlzLnByb21pc2UsVSgpKX1mdW5jdGlvbiBVKCl7cmV0dXJuIG5ldyBFcnJvcihcIkFycmF5IE1ldGhvZHMgbXVzdCBiZSBwcm92aWRlZCBhbiBBcnJheVwiKX1mdW5jdGlvbiBXKCl7dmFyIHQ7aWYoXCJ1bmRlZmluZWRcIiE9dHlwZW9mIGdsb2JhbCl0PWdsb2JhbDtlbHNlIGlmKFwidW5kZWZpbmVkXCIhPXR5cGVvZiBzZWxmKXQ9c2VsZjtlbHNlIHRyeXt0PUZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKX1jYXRjaChlKXt0aHJvdyBuZXcgRXJyb3IoXCJwb2x5ZmlsbCBmYWlsZWQgYmVjYXVzZSBnbG9iYWwgb2JqZWN0IGlzIHVuYXZhaWxhYmxlIGluIHRoaXMgZW52aXJvbm1lbnRcIil9dmFyIG49dC5Qcm9taXNlOyghbnx8XCJbb2JqZWN0IFByb21pc2VdXCIhPT1PYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobi5yZXNvbHZlKCkpfHxuLmNhc3QpJiYodC5Qcm9taXNlPXB0KX12YXIgejt6PUFycmF5LmlzQXJyYXk/QXJyYXkuaXNBcnJheTpmdW5jdGlvbih0KXtyZXR1cm5cIltvYmplY3QgQXJyYXldXCI9PT1PYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodCl9O3ZhciBCLEcsSCxJPXosSj0wLFE9ZnVuY3Rpb24odCxlKXt0dFtKXT10LHR0W0orMV09ZSxKKz0yLDI9PT1KJiYoRz9HKGEpOkgoKSl9LFI9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdpbmRvdz93aW5kb3c6dm9pZCAwLFY9Unx8e30sWD1WLk11dGF0aW9uT2JzZXJ2ZXJ8fFYuV2ViS2l0TXV0YXRpb25PYnNlcnZlcixaPVwidW5kZWZpbmVkXCI9PXR5cGVvZiBzZWxmJiZcInVuZGVmaW5lZFwiIT10eXBlb2YgcHJvY2VzcyYmXCJbb2JqZWN0IHByb2Nlc3NdXCI9PT17fS50b1N0cmluZy5jYWxsKHByb2Nlc3MpLCQ9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIFVpbnQ4Q2xhbXBlZEFycmF5JiZcInVuZGVmaW5lZFwiIT10eXBlb2YgaW1wb3J0U2NyaXB0cyYmXCJ1bmRlZmluZWRcIiE9dHlwZW9mIE1lc3NhZ2VDaGFubmVsLHR0PW5ldyBBcnJheSgxZTMpO0g9Wj9vKCk6WD9zKCk6JD91KCk6dm9pZCAwPT09UiYmXCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZT9mKCk6YygpO3ZhciBldD1sLG50PWgscnQ9TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDE2KSxvdD12b2lkIDAsaXQ9MSxzdD0yLHV0PW5ldyBNLGN0PW5ldyBNLGF0PTAsZnQ9WSxsdD1xLGh0PUYscHQ9TDtMLmFsbD1mdCxMLnJhY2U9bHQsTC5yZXNvbHZlPW50LEwucmVqZWN0PWh0LEwuX3NldFNjaGVkdWxlcj1uLEwuX3NldEFzYXA9cixMLl9hc2FwPVEsTC5wcm90b3R5cGU9e2NvbnN0cnVjdG9yOkwsdGhlbjpldCxcImNhdGNoXCI6ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMudGhlbihudWxsLHQpfX07dmFyIF90PU47Ti5wcm90b3R5cGUuX2VudW1lcmF0ZT1mdW5jdGlvbigpe2Zvcih2YXIgdD10aGlzLmxlbmd0aCxlPXRoaXMuX2lucHV0LG49MDt0aGlzLl9zdGF0ZT09PW90JiZ0Pm47bisrKXRoaXMuX2VhY2hFbnRyeShlW25dLG4pfSxOLnByb3RvdHlwZS5fZWFjaEVudHJ5PWZ1bmN0aW9uKHQsZSl7dmFyIG49dGhpcy5faW5zdGFuY2VDb25zdHJ1Y3RvcixyPW4ucmVzb2x2ZTtpZihyPT09bnQpe3ZhciBvPXYodCk7aWYobz09PWV0JiZ0Ll9zdGF0ZSE9PW90KXRoaXMuX3NldHRsZWRBdCh0Ll9zdGF0ZSxlLHQuX3Jlc3VsdCk7ZWxzZSBpZihcImZ1bmN0aW9uXCIhPXR5cGVvZiBvKXRoaXMuX3JlbWFpbmluZy0tLHRoaXMuX3Jlc3VsdFtlXT10O2Vsc2UgaWYobj09PXB0KXt2YXIgaT1uZXcgbihwKTt3KGksdCxvKSx0aGlzLl93aWxsU2V0dGxlQXQoaSxlKX1lbHNlIHRoaXMuX3dpbGxTZXR0bGVBdChuZXcgbihmdW5jdGlvbihlKXtlKHQpfSksZSl9ZWxzZSB0aGlzLl93aWxsU2V0dGxlQXQocih0KSxlKX0sTi5wcm90b3R5cGUuX3NldHRsZWRBdD1mdW5jdGlvbih0LGUsbil7dmFyIHI9dGhpcy5wcm9taXNlO3IuX3N0YXRlPT09b3QmJih0aGlzLl9yZW1haW5pbmctLSx0PT09c3Q/aihyLG4pOnRoaXMuX3Jlc3VsdFtlXT1uKSwwPT09dGhpcy5fcmVtYWluaW5nJiZTKHIsdGhpcy5fcmVzdWx0KX0sTi5wcm90b3R5cGUuX3dpbGxTZXR0bGVBdD1mdW5jdGlvbih0LGUpe3ZhciBuPXRoaXM7RSh0LHZvaWQgMCxmdW5jdGlvbih0KXtuLl9zZXR0bGVkQXQoaXQsZSx0KX0sZnVuY3Rpb24odCl7bi5fc2V0dGxlZEF0KHN0LGUsdCl9KX07dmFyIGR0PVcsdnQ9e1Byb21pc2U6cHQscG9seWZpbGw6ZHR9O1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoZnVuY3Rpb24oKXtyZXR1cm4gdnR9KTpcInVuZGVmaW5lZFwiIT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz12dDpcInVuZGVmaW5lZFwiIT10eXBlb2YgdGhpcyYmKHRoaXMuRVM2UHJvbWlzZT12dCksZHQoKX0pLmNhbGwodGhpcyk7Il19
},{"_process":2}],10:[function(require,module,exports){
"use strict";

var _interopRequire = function _interopRequire(obj) {
  return obj && obj.__esModule ? obj["default"] : obj;
};

var _slicedToArray = function _slicedToArray(arr, i) {
  if (Array.isArray(arr)) {
    return arr;
  } else if (Symbol.iterator in Object(arr)) {
    var _arr = [];for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
      _arr.push(_step.value);if (i && _arr.length === i) break;
    }return _arr;
  } else {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }
};

exports.event = event;
Object.defineProperty(exports, "__esModule", {
  value: true
});

require("../lib/es6-promise.min.js");

var Templates = _interopRequire(require("../Templates"));

var _helpers = require("../helpers");

var getJSON = _helpers.getJSON;
var round = _helpers.round;

var _API = require("../API");

var API = _interopRequire(_API);

var getTeams = _API.getTeams;
var getTeamStats = _API.getTeamStats;

function event(key) {
  Promise.all([Templates.get("event"), getJSON("stats-config.json")]).then(function (res) {
    var _res = _slicedToArray(res, 2);

    var template = _res[0];
    var stats = _res[1];

    var $container = $("#main").closest(".container");
    var containerClass = $container.attr("class");
    $container.addClass("wide");
    var ractive = new Ractive({
      template: template,
      data: {
        key: key,
        statConfig: stats,
        loading: true,
        teams: [],
        round: round,
        statColor: function statColor(value, stat) {
          var value = parseFloat(value);
          for (var i = 0; i < stat.progress.length; i++) {
            if ((!stat.progress[i].min || value >= stat.progress[i].min) && (!stat.progress[i].max || value <= stat.progress[i].max)) {
              return stat.progress[i]["class"];
            }
          }
        }
      },
      computed: {
        mobile: function mobile() {
          return $(window).width() < 900;
        }
      },
      ondestroy: function ondestroy() {
        $container.attr("class", containerClass);
      }
    });

    getTeams(API, key).then(function (teams) {
      ractive.set({
        teams: teams.sort(function (a, b) {
          return a.team_number - b.team_number;
        }),
        loading: false
      });
      Sortable.init();
    });
  });
}

},{"../API":3,"../Templates":6,"../helpers":8,"../lib/es6-promise.min.js":9}],11:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

exports.team = team;
Object.defineProperty(exports, "__esModule", {
  value: true
});

require("../lib/es6-promise.min.js");

var Templates = _interopRequire(require("../Templates"));

var _helpers = require("../helpers");

var getJSON = _helpers.getJSON;
var round = _helpers.round;

var _API = require("../API");

var API = _interopRequire(_API);

var getTeamStats = _API.getTeamStats;

function team(key) {
  Promise.all([Templates.get("team"), getJSON("stats-config.json"), getTeamStats(API, key)]).then(function (res) {
    var _res = _slicedToArray(res, 3);

    var template = _res[0];
    var stats = _res[1];
    var teamData = _res[2];

    var ractive = new Ractive({
      template: template,
      data: {
        stats: stats,
        statKeys: ["calcs", "goals", "defenses"],
        key: key,
        team: teamData,
        mobile: $(window).width() < 900,
        round: round } });
  })["catch"](console.error.bind(console));
}

},{"../API":3,"../Templates":6,"../helpers":8,"../lib/es6-promise.min.js":9}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9kYW5pZWwvRG9jdW1lbnRzL3Byb2plY3RzL29yYi1jbGllbnQvc3JjL21haW4uanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiL2hvbWUvZGFuaWVsL0RvY3VtZW50cy9wcm9qZWN0cy9vcmItY2xpZW50L3NyYy9BUEkuanMiLCIvaG9tZS9kYW5pZWwvRG9jdW1lbnRzL3Byb2plY3RzL29yYi1jbGllbnQvc3JjL0NvbXBvbmVudHMuanMiLCIvaG9tZS9kYW5pZWwvRG9jdW1lbnRzL3Byb2plY3RzL29yYi1jbGllbnQvc3JjL1BhZ2VzLmpzIiwiL2hvbWUvZGFuaWVsL0RvY3VtZW50cy9wcm9qZWN0cy9vcmItY2xpZW50L3NyYy9UZW1wbGF0ZXMuanMiLCIvaG9tZS9kYW5pZWwvRG9jdW1lbnRzL3Byb2plY3RzL29yYi1jbGllbnQvc3JjL2NhY2hlYWJsZS5qcyIsIi9ob21lL2RhbmllbC9Eb2N1bWVudHMvcHJvamVjdHMvb3JiLWNsaWVudC9zcmMvaGVscGVycy5qcyIsInNyYy9saWIvZXM2LXByb21pc2UubWluLmpzIiwiL2hvbWUvZGFuaWVsL0RvY3VtZW50cy9wcm9qZWN0cy9vcmItY2xpZW50L3NyYy9wYWdlcy9ldmVudC5qcyIsIi9ob21lL2RhbmllbC9Eb2N1bWVudHMvcHJvamVjdHMvb3JiLWNsaWVudC9zcmMvcGFnZXMvdGVhbS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBLFlBQVksQ0FBQzs7QUFFYixJQUFJLGVBQWUsR0FBRyxTQUFBLGVBQUEsQ0FBVSxHQUFHLEVBQUU7QUFBRSxTQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLENBQUM7Q0FBRSxDQUFDOztBQUU5RixJQUFJLHVCQUF1QixHQUFHLFNBQUEsdUJBQUEsQ0FBVSxHQUFHLEVBQUU7QUFB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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQSxZQUFZLENBQUM7O0FBRWIsSUFBSSxlQUFlLEdBQUcsU0FBQSxlQUFBLENBQVUsR0FBRyxFQUFFO0FBQUUsU0FBTyxHQUFHLElBQUksR0FBRyxDQUFDLFVBQVUsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBRyxDQUFDO0NBQUUsQ0FBQzs7QUFFOUYsSUFBSSxjQUFjLEdBQUcsU0FBQSxjQUFBLENBQVUsR0FBRyxFQUFFLENBQUMsRUFBRTtBQUFFLE1BQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUFFLFdBQU8sR0FBRyxDQUFDO0dBQUUsTUFBTSxJQUFJLE1BQU0sQ0FBQyxRQUFRLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQUUsUUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDLEtBQU0sSUFBSSxTQUFTLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLFNBQVMsQ0FBQyxJQUFJLEVBQUUsQ0FBQSxDQUFFLElBQUksR0FBRztBQUFFLFVBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFLE1BQU07S0FBRSxPQUFRLElBQUks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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcE9BLFlBQVksQ0FBQzs7QUFFYixJQUFJLGVBQWUsR0FBRyxTQUFBLGVBQUEsQ0FBVSxHQUFHLEVBQUU7QUFBRSxTQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLENBQUM7Q0FBRSxDQUFDOztBQUU5RixJ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QUFRLENBQUMsSUFBSSxFQUFFLENBQUM7S0FDakIsQ0FBQyxDQUFDO0dBQ0osQ0FBQyxDQUFDO0NBQ0o7Ozs7Ozs7OztRQzlDZSxJQUFJLEdBQUosSUFBSTs7Ozs7UUFMYiwyQkFBMkI7O0lBQzNCLFNBQVMsMkJBQU0sY0FBYzs7dUJBQ0wsWUFBWTs7SUFBbEMsT0FBTyxZQUFQLE9BQU87SUFBRSxLQUFLLFlBQUwsS0FBSzs7bUJBQ1csUUFBUTs7SUFBbkMsR0FBRzs7SUFBSSxZQUFZLFFBQVosWUFBWTs7QUFFbkIsU0FBUyxJQUFJLENBQUMsR0FBRyxFQUFFO0FBQ3hCLFNBQU8sQ0FBQyxHQUFHLENBQUMsQ0FDVixTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUNyQixPQUFPLENBQUMsbUJBQW1CLENBQUMsRUFDNUIsWUFBWSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FDdkIsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFTLEdBQUcsRUFBRTs4QkFDZ0IsR0FBRzs7UUFBaEMsUUFBUTtRQUFFLEtBQUs7UUFBRSxRQUFROztBQUNoQyxRQUFNLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBQztBQUMxQixjQUFRLEVBQUUsUUFBUTtBQUNsQixVQUFJLEVBQUU7QUFDSixhQUFLLEVBQUUsS0FBSztBQUNaLGdCQUFRLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLFVBQVUsQ0FBQztBQUN4QyxXQUFHLEVBQUUsR0FBRztBQUNSLFlBQUksRUFBRSxRQUFRO0FBQ2QsY0FBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxHQUFHO0FBQy9CLGFBQUssRUFBRSxLQUFLLEVBQ2IsRUFDRixDQUFDLENBQUM7R0FDSixDQUFDLFNBQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0NBQ3ZDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCAqIGFzIFBhZ2VzIGZyb20gJy4vUGFnZXMnXG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tICcuL0NvbXBvbmVudHMnXG5pbXBvcnQgeyBkb2N1bWVudFJlYWR5IH0gZnJvbSAnLi9oZWxwZXJzJ1xuaW1wb3J0ICcuL2xpYi9lczYtcHJvbWlzZS5taW4uanMnXG5cbmNvbnN0IGVsID0gXCIjbWFpblwiO1xuXG5jb25zdCByb3V0ZXIgPSBSb3V0ZXIoe1xuICBcIi9sb2dpblwiOiBQYWdlcy5sb2dpbixcbiAgXCIvdGVhbS86a2V5XCI6IFBhZ2VzLnRlYW0sXG4gIFwiL2V2ZW50LzprZXlcIjogUGFnZXMuZXZlbnQsXG59KS5jb25maWd1cmUoe1xuICBodG1sNWhpc3Rvcnk6IGZhbHNlLFxuICBiZWZvcmU6IFtmdW5jdGlvbigpIHtcbiAgfV0sXG59KTtcblxuUHJvbWlzZS5hbGwoW2RvY3VtZW50UmVhZHksIENvbXBvbmVudHMubG9hZCgpXSkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgY29uc3QgWywgQ29tcG9uZW50c10gPSByZXM7XG4gIFJhY3RpdmUgPSBSYWN0aXZlLmV4dGVuZCh7XG4gICAgZWw6IGVsLFxuICAgIGNvbXBvbmVudHM6IENvbXBvbmVudHMuY29tcG9uZW50cyxcbiAgICBiZWZvcmU6IFtmdW5jdGlvbigpIHtcbiAgICAgICQod2luZG93KS5zY3JvbGxUb3AoMCk7XG4gICAgfV0sXG4gIH0pO1xuICByb3V0ZXIuaW5pdCgpO1xuICBpZiAoIXJvdXRlci5nZXRSb3V0ZSgpLmZpbHRlcihCb29sZWFuKS5sZW5ndGgpIHtcbiAgICByb3V0ZXIuc2V0Um91dGUoXCIvZXZlbnQvMjAxNmFyY1wiKTtcbiAgfVxufSk7XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5wcm9jZXNzLm5leHRUaWNrID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgIHZhciBjYW5NdXRhdGlvbk9ic2VydmVyID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuTXV0YXRpb25PYnNlcnZlcjtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICB2YXIgcXVldWUgPSBbXTtcblxuICAgIGlmIChjYW5NdXRhdGlvbk9ic2VydmVyKSB7XG4gICAgICAgIHZhciBoaWRkZW5EaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICB2YXIgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgcXVldWVMaXN0ID0gcXVldWUuc2xpY2UoKTtcbiAgICAgICAgICAgIHF1ZXVlLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICBxdWV1ZUxpc3QuZm9yRWFjaChmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUoaGlkZGVuRGl2LCB7IGF0dHJpYnV0ZXM6IHRydWUgfSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBpZiAoIXF1ZXVlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGhpZGRlbkRpdi5zZXRBdHRyaWJ1dGUoJ3llcycsICdubycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuIiwiaW1wb3J0ICcuL2xpYi9lczYtcHJvbWlzZS5taW4uanMnXG5pbXBvcnQgY2FjaGVhYmxlIGZyb20gJy4vY2FjaGVhYmxlJ1xuaW1wb3J0IHsgZXh0ZW5kIH0gZnJvbSAnLi9oZWxwZXJzJ1xuXG5cblxuZXhwb3J0IGRlZmF1bHQgY2FjaGVhYmxlKGZ1bmN0aW9uKGtleSkge1xuICBjb25zdCBrZXkgPSBrZXkucmVwbGFjZSgvXlxcLy8sIFwiXCIpLnJlcGxhY2UoL1xcLyQvLCBcIlwiKTtcbiAgbGV0IHVybCA9IFwiaHR0cDovL2M1MDMyMDIxLm5ncm9rLmlvL1wiK2tleStcIi9cIjtcbiAgdXJsID0gXCJhcGkucGhwP3VybD1cIitlbmNvZGVVUklDb21wb25lbnQodXJsKTtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgbWV0aG9kOiBcImdldFwiLFxuICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxuICAgICAgZGF0YToge30sXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGVycm9yOiByZWplY3RcbiAgICB9KS50aGVuKHJlc29sdmUpO1xuICB9KS5jYXRjaChmdW5jdGlvbihyZXMpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiQVBJIFJlcXVlc3QgVW5zdWNjZXNzZnVsXCIsIHVybCwgcmVzKTtcbiAgICByZXR1cm4gcmVzO1xuICB9KTtcbn0pO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGVhbVN0YXRzKEFQSSwga2V5LCB0ZWFtKSB7XG4gIGxldCBwcm9taXNlcyA9IFtcbiAgICBBUEkuZ2V0KFwidGVhbS9cIitrZXkrXCIvZGVmZW5zZVwiKSxcbiAgICBBUEkuZ2V0KFwidGVhbS9cIitrZXkrXCIvZ29hbHNcIiksXG4gIF07XG4gIGlmICh0eXBlb2YgdGVhbSA9PSBcIm9iamVjdFwiICYmIHRlYW0udGVhbV9udW1iZXIgPT0gdGVhbSkge1xuICAgIHByb21pc2VzLnB1c2goKHJlc29sdmUsIHJlamVjdCkgPT4gcmVzb2x2ZSh0ZWFtKSlcbiAgfSBlbHNlIHtcbiAgICBwcm9taXNlcy5wdXNoKEFQSS5nZXQoXCJ0ZWFtL1wiK2tleSkpO1xuICB9XG4gIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcykudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICBsZXQgW2RlZmVuc2VzLCBnb2FscywgdGVhbV0gPSByZXM7XG4gICAgZGVmZW5zZXMgPSBnb2FscyA9IFtcbiAgICAgIDQ1MzQsXG4gICAgICBNYXRoLnJhbmRvbSgpKjIsXG4gICAgICBNYXRoLnJhbmRvbSgpKjIsXG4gICAgICBNYXRoLnJhbmRvbSgpKjIsXG4gICAgICBNYXRoLnJhbmRvbSgpKjIsXG4gICAgICBNYXRoLnJhbmRvbSgpKjIsXG4gICAgICBNYXRoLnJhbmRvbSgpKjIsXG4gICAgICBNYXRoLnJhbmRvbSgpKjIsXG4gICAgICBNYXRoLnJhbmRvbSgpKjIsXG4gICAgICBNYXRoLnJhbmRvbSgpKjIsXG4gICAgXTtcbiAgICByZXR1cm4gZXh0ZW5kKHRlYW0sIHtcbiAgICAgIHN0YXRzOiB7XG4gICAgICAgIGNhbGNzOiB7XG4gICAgICAgICAgcHJlZGljdGVkX3JwOiBNYXRoLnJhbmRvbSgpKjIqMTAsXG4gICAgICAgICAgc2NvcmU6IDBcbiAgICAgICAgfSxcbiAgICAgICAgZGVmZW5zZXM6IHtcbiAgICAgICAgICBsb3dfYmFyOiBkZWZlbnNlc1sxXSxcbiAgICAgICAgICBwb3J0Y3VsbGlzOiBkZWZlbnNlc1syXSxcbiAgICAgICAgICBjaGV2YWxfZGVfZnJpc2U6IGRlZmVuc2VzWzNdLFxuICAgICAgICAgIG1vYXQ6IGRlZmVuc2VzWzRdLFxuICAgICAgICAgIHJhbXBhcnRzOiBkZWZlbnNlc1s1XSxcbiAgICAgICAgICBkcmF3YnJpZGdlOiBkZWZlbnNlc1s2XSxcbiAgICAgICAgICBzYWxseV9wb3J0OiBkZWZlbnNlc1s3XSxcbiAgICAgICAgICByb2NrX3dhbGw6IGRlZmVuc2VzWzhdLFxuICAgICAgICAgIHJvdWdoX3RlcnJhaW46IGRlZmVuc2VzWzldLFxuICAgICAgICB9LFxuICAgICAgICBnb2Fsczoge1xuICAgICAgICAgIGF1dG9fbG93OiBnb2Fsc1sxXSxcbiAgICAgICAgICBhdXRvX2hpZ2g6IGdvYWxzWzJdLFxuICAgICAgICAgIHRlbGVvcF9sb3c6IGdvYWxzWzNdLFxuICAgICAgICAgIHRlbGVvcF9oaWdoOiBnb2Fsc1s0XSxcbiAgICAgICAgfSxcbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUZWFtcyhBUEksIGtleSkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgcmVzb2x2ZShBUEkuZ2V0KFwibGlzdC9cIitrZXkpKTtcbiAgfSkudGhlbihmdW5jdGlvbih0ZWFtcykge1xuICAgIHJldHVybiBQcm9taXNlLmFsbCh0ZWFtcy5tYXAodGVhbSA9PiBnZXRUZWFtU3RhdHMoQVBJLCB0ZWFtLnRlYW1fbnVtYmVyLCB0ZWFtKSkpO1xuICB9KTtcbn1cbiIsImltcG9ydCAnLi9saWIvZXM2LXByb21pc2UubWluLmpzJ1xuaW1wb3J0IFRlbXBsYXRlcyBmcm9tICcuL1RlbXBsYXRlcydcblxuZXhwb3J0IGRlZmF1bHQge1xuICB0ZW1wbGF0ZXM6IHt9LFxuICBjb21wb25lbnRzOiB7fSxcbiAgY3JlYXRlOiBmdW5jdGlvbihkb25lKSB7XG4gICAgdGhpcy5jb21wb25lbnRzLlByb2dyZXNzID0gUmFjdGl2ZS5leHRlbmQoe1xuICAgICAgIGlzb2xhdGVkOiBmYWxzZSxcbiAgICAgICB0ZW1wbGF0ZTogdGhpcy50ZW1wbGF0ZXMucHJvZ3Jlc3MsXG4gICAgICAgb25pbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgIGNvbnN0IHN0YXQgPSB0aGlzLmdldChcInN0YXRcIik7XG4gICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuZ2V0KFwidmFsdWVcIik7XG4gICAgICAgICBsZXQgcHJvZ3Jlc3NDbGFzcztcbiAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBzdGF0LnByb2dyZXNzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgIGlmICgoIXN0YXQucHJvZ3Jlc3NbaV0ubWluIHx8IHZhbHVlID49IHN0YXQucHJvZ3Jlc3NbaV0ubWluKSAmJiAoIXN0YXQucHJvZ3Jlc3NbaV0ubWF4IHx8IHZhbHVlIDw9IHN0YXQucHJvZ3Jlc3NbaV0ubWF4KSkge1xuICAgICAgICAgICAgIHByb2dyZXNzQ2xhc3MgPSBzdGF0LnByb2dyZXNzW2ldLmNsYXNzO1xuICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICB9XG4gICAgICAgICB9XG4gICAgICAgICB0aGlzLnNldCh7XG4gICAgICAgICAgIG1pbjogc3RhdC5taW4sXG4gICAgICAgICAgIG1heDogc3RhdC5tYXgsXG4gICAgICAgICAgIHdpZHRoOiAoc3RhdC5taW4gKyB2YWx1ZSkvc3RhdC5tYXggKiAxMDAsXG4gICAgICAgICAgIHByb2dyZXNzQ2xhc3M6IHByb2dyZXNzQ2xhc3MsXG4gICAgICAgICB9KVxuICAgICAgIH0sXG5cbiAgICB9KTtcbiAgfSxcbiAgbG9hZDogZnVuY3Rpb24oZG9uZSkge1xuICAgIGNvbnN0IF90aGlzID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBUZW1wbGF0ZXMuZ2V0KFwiY29tcG9uZW50c1wiKS50aGVuKGZ1bmN0aW9uKHRlbXBsYXRlcykge1xuICAgICAgICAkKFwiPGRpdj5cIikuaHRtbCh0ZW1wbGF0ZXMpLmZpbmQoXCJzY3JpcHQudGVtcGxhdGVcIikuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICBjb25zdCAkdGhpcyA9ICQodGhpcyk7XG4gICAgICAgICAgX3RoaXMudGVtcGxhdGVzWyR0aGlzLmF0dHIoXCJuYW1lXCIpXSA9ICR0aGlzLmh0bWwoKS50cmltKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBfdGhpcy5jcmVhdGUoKTtcbiAgICAgICAgcmVzb2x2ZShfdGhpcyk7XG4gICAgICB9KS5jYXRjaChyZWplY3QpO1xuICAgIH0pO1xuICB9LFxufTtcbiIsImV4cG9ydCAqIGZyb20gJy4vcGFnZXMvdGVhbSdcbmV4cG9ydCAqIGZyb20gJy4vcGFnZXMvZXZlbnQnXG4iLCJpbXBvcnQgJy4vbGliL2VzNi1wcm9taXNlLm1pbi5qcydcbmltcG9ydCBjYWNoZWFibGUgZnJvbSAnLi9jYWNoZWFibGUnXG5cbmV4cG9ydCBkZWZhdWx0IGNhY2hlYWJsZShmdW5jdGlvbihrZXkpIHtcbiAgY29uc3QgdXJsID0gXCJ0ZW1wbGF0ZXMvXCIra2V5K1wiLmh0bWxcIjtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgbWV0aG9kOiBcImdldFwiLFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBlcnJvcjogcmVqZWN0XG4gICAgfSkudGhlbihyZXNvbHZlKTtcbiAgfSkuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XG4gICAgY29uc29sZS5lcnJvcihcIlRlbXBsYXRlIFJlcXVlc3QgVW5zdWNjZXNzZnVsXCIsIHVybCwgcmVzKTtcbiAgICByZXR1cm4gcmVzO1xuICB9KTtcbn0pO1xuIiwiaW1wb3J0ICcuL2xpYi9lczYtcHJvbWlzZS5taW4uanMnXG5pbXBvcnQgY2FjaGVhYmxlIGZyb20gJy4vY2FjaGVhYmxlJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjYWNoZWFibGUoZ2V0UHJvbWlzZSkge1xuICBjb25zdCBfY2FjaGUgPSB7fTtcblxuICBmdW5jdGlvbiBzZXQoa2V5LCB2YWx1ZSkge1xuICAgIHJldHVybiBfY2FjaGVba2V5XSA9IHZhbHVlO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBnZXQoa2V5LCBjYWxsYmFjaykge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBpZiAoX2NhY2hlW2tleV0pIHtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZShfY2FjaGVba2V5XSk7XG4gICAgICAgIH1cblxuICAgICAgICBnZXRQcm9taXNlKGtleSlcbiAgICAgICAgICAudGhlbih2YWx1ZSA9PiBzZXQoa2V5LCB2YWx1ZSkpXG4gICAgICAgICAgLnRoZW4ocmVzb2x2ZSlcbiAgICAgICAgICAuY2F0Y2gocmVqZWN0KTtcblxuICAgICAgfSkudGhlbihjYWxsYmFjayk7XG4gICAgfSxcbiAgfVxufVxuIiwiaW1wb3J0ICcuL2xpYi9lczYtcHJvbWlzZS5taW4uanMnXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRKU09OKHVybCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICQuYWpheCh7XG4gICAgICBtZXRob2Q6IFwiZ2V0XCIsXG4gICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICBkYXRhOiB7fSxcbiAgICAgIHVybDogdXJsLFxuICAgICAgZXJyb3I6IHJlamVjdFxuICAgIH0pLnRoZW4ocmVzb2x2ZSk7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcm91bmQobiwgZGlnaXRzKSB7XG4gIGNvbnN0IG4gPSBwYXJzZUZsb2F0KG4pO1xuICBjb25zdCBkaWdpdHMgPSBwYXJzZUludChkaWdpdHMpO1xuICBjb25zdCBwYXJ0cyA9IChNYXRoLnJvdW5kKG4gKiBNYXRoLnBvdygxMCwgZGlnaXRzKSkvTWF0aC5wb3coMTAsIGRpZ2l0cykpLnRvU3RyaW5nKCkuc3BsaXQoXCIuXCIpO1xuICBpZiAocGFydHMubGVuZ3RoID09IDEpIHtcbiAgICBwYXJ0cy5wdXNoKFwiXCIpO1xuICB9XG4gIHJldHVybiBwYXJ0c1swXSArIChkaWdpdHMgPyBcIi5cIiA6IFwiXCIpICsgcGFydHNbMV0gKyBBcnJheShNYXRoLm1heCgwLCBkaWdpdHMgLSBwYXJ0c1sxXS5sZW5ndGggKyAxKSkuam9pbihcIjBcIik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkb2N1bWVudFJlYWR5KCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgaWYgKCQuaXNSZWFkeSkge1xuICAgICAgcmVzb2x2ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkKHJlc29sdmUpO1xuICAgIH1cbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleHRlbmQoKSB7XG4gIGNvbnN0IHJlc3VsdCA9IGFyZ3VtZW50c1swXTtcbiAgZm9yKGxldCBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIGZvcihsZXQga2V5IGluIGFyZ3VtZW50c1tpXSkge1xuICAgICAgcmVzdWx0W2tleV0gPSBhcmd1bWVudHNbaV1ba2V5XTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbiIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwpe1xuLyohXG4gKiBAb3ZlcnZpZXcgZXM2LXByb21pc2UgLSBhIHRpbnkgaW1wbGVtZW50YXRpb24gb2YgUHJvbWlzZXMvQSsuXG4gKiBAY29weXJpZ2h0IENvcHlyaWdodCAoYykgMjAxNCBZZWh1ZGEgS2F0eiwgVG9tIERhbGUsIFN0ZWZhbiBQZW5uZXIgYW5kIGNvbnRyaWJ1dG9ycyAoQ29udmVyc2lvbiB0byBFUzYgQVBJIGJ5IEpha2UgQXJjaGliYWxkKVxuICogQGxpY2Vuc2UgICBMaWNlbnNlZCB1bmRlciBNSVQgbGljZW5zZVxuICogICAgICAgICAgICBTZWUgaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2pha2VhcmNoaWJhbGQvZXM2LXByb21pc2UvbWFzdGVyL0xJQ0VOU0VcbiAqIEB2ZXJzaW9uICAgMy4yLjFcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuKGZ1bmN0aW9uICgpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gdCh0KSB7XG4gICAgcmV0dXJuIFwiZnVuY3Rpb25cIiA9PSB0eXBlb2YgdCB8fCBcIm9iamVjdFwiID09IHR5cGVvZiB0ICYmIG51bGwgIT09IHQ7XG4gIH1mdW5jdGlvbiBlKHQpIHtcbiAgICByZXR1cm4gXCJmdW5jdGlvblwiID09IHR5cGVvZiB0O1xuICB9ZnVuY3Rpb24gbih0KSB7XG4gICAgRyA9IHQ7XG4gIH1mdW5jdGlvbiByKHQpIHtcbiAgICBRID0gdDtcbiAgfWZ1bmN0aW9uIG8oKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soYSk7XG4gICAgfTtcbiAgfWZ1bmN0aW9uIGkoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIEIoYSk7XG4gICAgfTtcbiAgfWZ1bmN0aW9uIHMoKSB7XG4gICAgdmFyIHQgPSAwLFxuICAgICAgICBlID0gbmV3IFgoYSksXG4gICAgICAgIG4gPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIlwiKTtyZXR1cm4gKGUub2JzZXJ2ZShuLCB7IGNoYXJhY3RlckRhdGE6ICEwIH0pLCBmdW5jdGlvbiAoKSB7XG4gICAgICBuLmRhdGEgPSB0ID0gKyt0ICUgMjtcbiAgICB9KTtcbiAgfWZ1bmN0aW9uIHUoKSB7XG4gICAgdmFyIHQgPSBuZXcgTWVzc2FnZUNoYW5uZWwoKTtyZXR1cm4gKHQucG9ydDEub25tZXNzYWdlID0gYSwgZnVuY3Rpb24gKCkge1xuICAgICAgdC5wb3J0Mi5wb3N0TWVzc2FnZSgwKTtcbiAgICB9KTtcbiAgfWZ1bmN0aW9uIGMoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHNldFRpbWVvdXQoYSwgMSk7XG4gICAgfTtcbiAgfWZ1bmN0aW9uIGEoKSB7XG4gICAgZm9yICh2YXIgdCA9IDA7IEogPiB0OyB0ICs9IDIpIHtcbiAgICAgIHZhciBlID0gdHRbdF0sXG4gICAgICAgICAgbiA9IHR0W3QgKyAxXTtlKG4pLCB0dFt0XSA9IHZvaWQgMCwgdHRbdCArIDFdID0gdm9pZCAwO1xuICAgIH1KID0gMDtcbiAgfWZ1bmN0aW9uIGYoKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhciB0ID0gcmVxdWlyZSxcbiAgICAgICAgICBlID0gdChcInZlcnR4XCIpO3JldHVybiAoQiA9IGUucnVuT25Mb29wIHx8IGUucnVuT25Db250ZXh0LCBpKCkpO1xuICAgIH0gY2F0Y2ggKG4pIHtcbiAgICAgIHJldHVybiBjKCk7XG4gICAgfVxuICB9ZnVuY3Rpb24gbCh0LCBlKSB7XG4gICAgdmFyIG4gPSB0aGlzLFxuICAgICAgICByID0gbmV3IHRoaXMuY29uc3RydWN0b3IocCk7dm9pZCAwID09PSByW3J0XSAmJiBrKHIpO3ZhciBvID0gbi5fc3RhdGU7aWYgKG8pIHtcbiAgICAgIHZhciBpID0gYXJndW1lbnRzW28gLSAxXTtRKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgeChvLCByLCBpLCBuLl9yZXN1bHQpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIEUobiwgciwgdCwgZSk7cmV0dXJuIHI7XG4gIH1mdW5jdGlvbiBoKHQpIHtcbiAgICB2YXIgZSA9IHRoaXM7aWYgKHQgJiYgXCJvYmplY3RcIiA9PSB0eXBlb2YgdCAmJiB0LmNvbnN0cnVjdG9yID09PSBlKSB7XG4gICAgICByZXR1cm4gdDtcbiAgICB9dmFyIG4gPSBuZXcgZShwKTtyZXR1cm4gKGcobiwgdCksIG4pO1xuICB9ZnVuY3Rpb24gcCgpIHt9ZnVuY3Rpb24gXygpIHtcbiAgICByZXR1cm4gbmV3IFR5cGVFcnJvcihcIllvdSBjYW5ub3QgcmVzb2x2ZSBhIHByb21pc2Ugd2l0aCBpdHNlbGZcIik7XG4gIH1mdW5jdGlvbiBkKCkge1xuICAgIHJldHVybiBuZXcgVHlwZUVycm9yKFwiQSBwcm9taXNlcyBjYWxsYmFjayBjYW5ub3QgcmV0dXJuIHRoYXQgc2FtZSBwcm9taXNlLlwiKTtcbiAgfWZ1bmN0aW9uIHYodCkge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gdC50aGVuO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiAodXQuZXJyb3IgPSBlLCB1dCk7XG4gICAgfVxuICB9ZnVuY3Rpb24geSh0LCBlLCBuLCByKSB7XG4gICAgdHJ5IHtcbiAgICAgIHQuY2FsbChlLCBuLCByKTtcbiAgICB9IGNhdGNoIChvKSB7XG4gICAgICByZXR1cm4gbztcbiAgICB9XG4gIH1mdW5jdGlvbiBtKHQsIGUsIG4pIHtcbiAgICBRKGZ1bmN0aW9uICh0KSB7XG4gICAgICB2YXIgciA9ICExLFxuICAgICAgICAgIG8gPSB5KG4sIGUsIGZ1bmN0aW9uIChuKSB7XG4gICAgICAgIHIgfHwgKHIgPSAhMCwgZSAhPT0gbiA/IGcodCwgbikgOiBTKHQsIG4pKTtcbiAgICAgIH0sIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHIgfHwgKHIgPSAhMCwgaih0LCBlKSk7XG4gICAgICB9LCBcIlNldHRsZTogXCIgKyAodC5fbGFiZWwgfHwgXCIgdW5rbm93biBwcm9taXNlXCIpKTshciAmJiBvICYmIChyID0gITAsIGoodCwgbykpO1xuICAgIH0sIHQpO1xuICB9ZnVuY3Rpb24gYih0LCBlKSB7XG4gICAgZS5fc3RhdGUgPT09IGl0ID8gUyh0LCBlLl9yZXN1bHQpIDogZS5fc3RhdGUgPT09IHN0ID8gaih0LCBlLl9yZXN1bHQpIDogRShlLCB2b2lkIDAsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBnKHQsIGUpO1xuICAgIH0sIGZ1bmN0aW9uIChlKSB7XG4gICAgICBqKHQsIGUpO1xuICAgIH0pO1xuICB9ZnVuY3Rpb24gdyh0LCBuLCByKSB7XG4gICAgbi5jb25zdHJ1Y3RvciA9PT0gdC5jb25zdHJ1Y3RvciAmJiByID09PSBldCAmJiBjb25zdHJ1Y3Rvci5yZXNvbHZlID09PSBudCA/IGIodCwgbikgOiByID09PSB1dCA/IGoodCwgdXQuZXJyb3IpIDogdm9pZCAwID09PSByID8gUyh0LCBuKSA6IGUocikgPyBtKHQsIG4sIHIpIDogUyh0LCBuKTtcbiAgfWZ1bmN0aW9uIGcoZSwgbikge1xuICAgIGUgPT09IG4gPyBqKGUsIF8oKSkgOiB0KG4pID8gdyhlLCBuLCB2KG4pKSA6IFMoZSwgbik7XG4gIH1mdW5jdGlvbiBBKHQpIHtcbiAgICB0Ll9vbmVycm9yICYmIHQuX29uZXJyb3IodC5fcmVzdWx0KSwgVCh0KTtcbiAgfWZ1bmN0aW9uIFModCwgZSkge1xuICAgIHQuX3N0YXRlID09PSBvdCAmJiAodC5fcmVzdWx0ID0gZSwgdC5fc3RhdGUgPSBpdCwgMCAhPT0gdC5fc3Vic2NyaWJlcnMubGVuZ3RoICYmIFEoVCwgdCkpO1xuICB9ZnVuY3Rpb24gaih0LCBlKSB7XG4gICAgdC5fc3RhdGUgPT09IG90ICYmICh0Ll9zdGF0ZSA9IHN0LCB0Ll9yZXN1bHQgPSBlLCBRKEEsIHQpKTtcbiAgfWZ1bmN0aW9uIEUodCwgZSwgbiwgcikge1xuICAgIHZhciBvID0gdC5fc3Vic2NyaWJlcnMsXG4gICAgICAgIGkgPSBvLmxlbmd0aDt0Ll9vbmVycm9yID0gbnVsbCwgb1tpXSA9IGUsIG9baSArIGl0XSA9IG4sIG9baSArIHN0XSA9IHIsIDAgPT09IGkgJiYgdC5fc3RhdGUgJiYgUShULCB0KTtcbiAgfWZ1bmN0aW9uIFQodCkge1xuICAgIHZhciBlID0gdC5fc3Vic2NyaWJlcnMsXG4gICAgICAgIG4gPSB0Ll9zdGF0ZTtpZiAoMCAhPT0gZS5sZW5ndGgpIHtcbiAgICAgIGZvciAodmFyIHIsIG8sIGkgPSB0Ll9yZXN1bHQsIHMgPSAwOyBzIDwgZS5sZW5ndGg7IHMgKz0gMykgciA9IGVbc10sIG8gPSBlW3MgKyBuXSwgciA/IHgobiwgciwgbywgaSkgOiBvKGkpO3QuX3N1YnNjcmliZXJzLmxlbmd0aCA9IDA7XG4gICAgfVxuICB9ZnVuY3Rpb24gTSgpIHtcbiAgICB0aGlzLmVycm9yID0gbnVsbDtcbiAgfWZ1bmN0aW9uIFAodCwgZSkge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gdChlKTtcbiAgICB9IGNhdGNoIChuKSB7XG4gICAgICByZXR1cm4gKGN0LmVycm9yID0gbiwgY3QpO1xuICAgIH1cbiAgfWZ1bmN0aW9uIHgodCwgbiwgciwgbykge1xuICAgIHZhciBpLFxuICAgICAgICBzLFxuICAgICAgICB1LFxuICAgICAgICBjLFxuICAgICAgICBhID0gZShyKTtpZiAoYSkge1xuICAgICAgaWYgKChpID0gUChyLCBvKSwgaSA9PT0gY3QgPyAoYyA9ICEwLCBzID0gaS5lcnJvciwgaSA9IG51bGwpIDogdSA9ICEwLCBuID09PSBpKSkge1xuICAgICAgICByZXR1cm4gdm9pZCBqKG4sIGQoKSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGkgPSBvLCB1ID0gITA7bi5fc3RhdGUgIT09IG90IHx8IChhICYmIHUgPyBnKG4sIGkpIDogYyA/IGoobiwgcykgOiB0ID09PSBpdCA/IFMobiwgaSkgOiB0ID09PSBzdCAmJiBqKG4sIGkpKTtcbiAgfWZ1bmN0aW9uIEModCwgZSkge1xuICAgIHRyeSB7XG4gICAgICBlKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGcodCwgZSk7XG4gICAgICB9LCBmdW5jdGlvbiAoZSkge1xuICAgICAgICBqKHQsIGUpO1xuICAgICAgfSk7XG4gICAgfSBjYXRjaCAobikge1xuICAgICAgaih0LCBuKTtcbiAgICB9XG4gIH1mdW5jdGlvbiBPKCkge1xuICAgIHJldHVybiBhdCsrO1xuICB9ZnVuY3Rpb24gayh0KSB7XG4gICAgdFtydF0gPSBhdCsrLCB0Ll9zdGF0ZSA9IHZvaWQgMCwgdC5fcmVzdWx0ID0gdm9pZCAwLCB0Ll9zdWJzY3JpYmVycyA9IFtdO1xuICB9ZnVuY3Rpb24gWSh0KSB7XG4gICAgcmV0dXJuIG5ldyBfdCh0aGlzLCB0KS5wcm9taXNlO1xuICB9ZnVuY3Rpb24gcSh0KSB7XG4gICAgdmFyIGUgPSB0aGlzO3JldHVybiBuZXcgZShJKHQpID8gZnVuY3Rpb24gKG4sIHIpIHtcbiAgICAgIGZvciAodmFyIG8gPSB0Lmxlbmd0aCwgaSA9IDA7IG8gPiBpOyBpKyspIGUucmVzb2x2ZSh0W2ldKS50aGVuKG4sIHIpO1xuICAgIH0gOiBmdW5jdGlvbiAodCwgZSkge1xuICAgICAgZShuZXcgVHlwZUVycm9yKFwiWW91IG11c3QgcGFzcyBhbiBhcnJheSB0byByYWNlLlwiKSk7XG4gICAgfSk7XG4gIH1mdW5jdGlvbiBGKHQpIHtcbiAgICB2YXIgZSA9IHRoaXMsXG4gICAgICAgIG4gPSBuZXcgZShwKTtyZXR1cm4gKGoobiwgdCksIG4pO1xuICB9ZnVuY3Rpb24gRCgpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiWW91IG11c3QgcGFzcyBhIHJlc29sdmVyIGZ1bmN0aW9uIGFzIHRoZSBmaXJzdCBhcmd1bWVudCB0byB0aGUgcHJvbWlzZSBjb25zdHJ1Y3RvclwiKTtcbiAgfWZ1bmN0aW9uIEsoKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkZhaWxlZCB0byBjb25zdHJ1Y3QgJ1Byb21pc2UnOiBQbGVhc2UgdXNlIHRoZSAnbmV3JyBvcGVyYXRvciwgdGhpcyBvYmplY3QgY29uc3RydWN0b3IgY2Fubm90IGJlIGNhbGxlZCBhcyBhIGZ1bmN0aW9uLlwiKTtcbiAgfWZ1bmN0aW9uIEwodCkge1xuICAgIHRoaXNbcnRdID0gTygpLCB0aGlzLl9yZXN1bHQgPSB0aGlzLl9zdGF0ZSA9IHZvaWQgMCwgdGhpcy5fc3Vic2NyaWJlcnMgPSBbXSwgcCAhPT0gdCAmJiAoXCJmdW5jdGlvblwiICE9IHR5cGVvZiB0ICYmIEQoKSwgdGhpcyBpbnN0YW5jZW9mIEwgPyBDKHRoaXMsIHQpIDogSygpKTtcbiAgfWZ1bmN0aW9uIE4odCwgZSkge1xuICAgIHRoaXMuX2luc3RhbmNlQ29uc3RydWN0b3IgPSB0LCB0aGlzLnByb21pc2UgPSBuZXcgdChwKSwgdGhpcy5wcm9taXNlW3J0XSB8fCBrKHRoaXMucHJvbWlzZSksIEFycmF5LmlzQXJyYXkoZSkgPyAodGhpcy5faW5wdXQgPSBlLCB0aGlzLmxlbmd0aCA9IGUubGVuZ3RoLCB0aGlzLl9yZW1haW5pbmcgPSBlLmxlbmd0aCwgdGhpcy5fcmVzdWx0ID0gbmV3IEFycmF5KHRoaXMubGVuZ3RoKSwgMCA9PT0gdGhpcy5sZW5ndGggPyBTKHRoaXMucHJvbWlzZSwgdGhpcy5fcmVzdWx0KSA6ICh0aGlzLmxlbmd0aCA9IHRoaXMubGVuZ3RoIHx8IDAsIHRoaXMuX2VudW1lcmF0ZSgpLCAwID09PSB0aGlzLl9yZW1haW5pbmcgJiYgUyh0aGlzLnByb21pc2UsIHRoaXMuX3Jlc3VsdCkpKSA6IGoodGhpcy5wcm9taXNlLCBVKCkpO1xuICB9ZnVuY3Rpb24gVSgpIHtcbiAgICByZXR1cm4gbmV3IEVycm9yKFwiQXJyYXkgTWV0aG9kcyBtdXN0IGJlIHByb3ZpZGVkIGFuIEFycmF5XCIpO1xuICB9ZnVuY3Rpb24gVygpIHtcbiAgICB2YXIgdDtpZiAoXCJ1bmRlZmluZWRcIiAhPSB0eXBlb2YgZ2xvYmFsKSB0ID0gZ2xvYmFsO2Vsc2UgaWYgKFwidW5kZWZpbmVkXCIgIT0gdHlwZW9mIHNlbGYpIHQgPSBzZWxmO2Vsc2UgdHJ5IHtcbiAgICAgIHQgPSBGdW5jdGlvbihcInJldHVybiB0aGlzXCIpKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwicG9seWZpbGwgZmFpbGVkIGJlY2F1c2UgZ2xvYmFsIG9iamVjdCBpcyB1bmF2YWlsYWJsZSBpbiB0aGlzIGVudmlyb25tZW50XCIpO1xuICAgIH12YXIgbiA9IHQuUHJvbWlzZTsoIW4gfHwgXCJbb2JqZWN0IFByb21pc2VdXCIgIT09IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChuLnJlc29sdmUoKSkgfHwgbi5jYXN0KSAmJiAodC5Qcm9taXNlID0gcHQpO1xuICB9dmFyIHo7eiA9IEFycmF5LmlzQXJyYXkgPyBBcnJheS5pc0FycmF5IDogZnVuY3Rpb24gKHQpIHtcbiAgICByZXR1cm4gXCJbb2JqZWN0IEFycmF5XVwiID09PSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodCk7XG4gIH07dmFyIEIsXG4gICAgICBHLFxuICAgICAgSCxcbiAgICAgIEkgPSB6LFxuICAgICAgSiA9IDAsXG4gICAgICBRID0gZnVuY3Rpb24gUSh0LCBlKSB7XG4gICAgdHRbSl0gPSB0LCB0dFtKICsgMV0gPSBlLCBKICs9IDIsIDIgPT09IEogJiYgKEcgPyBHKGEpIDogSCgpKTtcbiAgfSxcbiAgICAgIFIgPSBcInVuZGVmaW5lZFwiICE9IHR5cGVvZiB3aW5kb3cgPyB3aW5kb3cgOiB2b2lkIDAsXG4gICAgICBWID0gUiB8fCB7fSxcbiAgICAgIFggPSBWLk11dGF0aW9uT2JzZXJ2ZXIgfHwgVi5XZWJLaXRNdXRhdGlvbk9ic2VydmVyLFxuICAgICAgWiA9IFwidW5kZWZpbmVkXCIgPT0gdHlwZW9mIHNlbGYgJiYgXCJ1bmRlZmluZWRcIiAhPSB0eXBlb2YgcHJvY2VzcyAmJiBcIltvYmplY3QgcHJvY2Vzc11cIiA9PT0gKHt9KS50b1N0cmluZy5jYWxsKHByb2Nlc3MpLFxuICAgICAgJCA9IFwidW5kZWZpbmVkXCIgIT0gdHlwZW9mIFVpbnQ4Q2xhbXBlZEFycmF5ICYmIFwidW5kZWZpbmVkXCIgIT0gdHlwZW9mIGltcG9ydFNjcmlwdHMgJiYgXCJ1bmRlZmluZWRcIiAhPSB0eXBlb2YgTWVzc2FnZUNoYW5uZWwsXG4gICAgICB0dCA9IG5ldyBBcnJheSgxMDAwKTtIID0gWiA/IG8oKSA6IFggPyBzKCkgOiAkID8gdSgpIDogdm9pZCAwID09PSBSICYmIFwiZnVuY3Rpb25cIiA9PSB0eXBlb2YgcmVxdWlyZSA/IGYoKSA6IGMoKTt2YXIgZXQgPSBsLFxuICAgICAgbnQgPSBoLFxuICAgICAgcnQgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoMTYpLFxuICAgICAgb3QgPSB2b2lkIDAsXG4gICAgICBpdCA9IDEsXG4gICAgICBzdCA9IDIsXG4gICAgICB1dCA9IG5ldyBNKCksXG4gICAgICBjdCA9IG5ldyBNKCksXG4gICAgICBhdCA9IDAsXG4gICAgICBmdCA9IFksXG4gICAgICBsdCA9IHEsXG4gICAgICBodCA9IEYsXG4gICAgICBwdCA9IEw7TC5hbGwgPSBmdCwgTC5yYWNlID0gbHQsIEwucmVzb2x2ZSA9IG50LCBMLnJlamVjdCA9IGh0LCBMLl9zZXRTY2hlZHVsZXIgPSBuLCBMLl9zZXRBc2FwID0gciwgTC5fYXNhcCA9IFEsIEwucHJvdG90eXBlID0geyBjb25zdHJ1Y3RvcjogTCwgdGhlbjogZXQsIFwiY2F0Y2hcIjogZnVuY3Rpb24gX2NhdGNoKHQpIHtcbiAgICAgIHJldHVybiB0aGlzLnRoZW4obnVsbCwgdCk7XG4gICAgfSB9O3ZhciBfdCA9IE47Ti5wcm90b3R5cGUuX2VudW1lcmF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBmb3IgKHZhciB0ID0gdGhpcy5sZW5ndGgsIGUgPSB0aGlzLl9pbnB1dCwgbiA9IDA7IHRoaXMuX3N0YXRlID09PSBvdCAmJiB0ID4gbjsgbisrKSB0aGlzLl9lYWNoRW50cnkoZVtuXSwgbik7XG4gIH0sIE4ucHJvdG90eXBlLl9lYWNoRW50cnkgPSBmdW5jdGlvbiAodCwgZSkge1xuICAgIHZhciBuID0gdGhpcy5faW5zdGFuY2VDb25zdHJ1Y3RvcixcbiAgICAgICAgciA9IG4ucmVzb2x2ZTtpZiAociA9PT0gbnQpIHtcbiAgICAgIHZhciBvID0gdih0KTtpZiAobyA9PT0gZXQgJiYgdC5fc3RhdGUgIT09IG90KSB0aGlzLl9zZXR0bGVkQXQodC5fc3RhdGUsIGUsIHQuX3Jlc3VsdCk7ZWxzZSBpZiAoXCJmdW5jdGlvblwiICE9IHR5cGVvZiBvKSB0aGlzLl9yZW1haW5pbmctLSwgdGhpcy5fcmVzdWx0W2VdID0gdDtlbHNlIGlmIChuID09PSBwdCkge1xuICAgICAgICB2YXIgaSA9IG5ldyBuKHApO3coaSwgdCwgbyksIHRoaXMuX3dpbGxTZXR0bGVBdChpLCBlKTtcbiAgICAgIH0gZWxzZSB0aGlzLl93aWxsU2V0dGxlQXQobmV3IG4oZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZSh0KTtcbiAgICAgIH0pLCBlKTtcbiAgICB9IGVsc2UgdGhpcy5fd2lsbFNldHRsZUF0KHIodCksIGUpO1xuICB9LCBOLnByb3RvdHlwZS5fc2V0dGxlZEF0ID0gZnVuY3Rpb24gKHQsIGUsIG4pIHtcbiAgICB2YXIgciA9IHRoaXMucHJvbWlzZTtyLl9zdGF0ZSA9PT0gb3QgJiYgKHRoaXMuX3JlbWFpbmluZy0tLCB0ID09PSBzdCA/IGoociwgbikgOiB0aGlzLl9yZXN1bHRbZV0gPSBuKSwgMCA9PT0gdGhpcy5fcmVtYWluaW5nICYmIFMociwgdGhpcy5fcmVzdWx0KTtcbiAgfSwgTi5wcm90b3R5cGUuX3dpbGxTZXR0bGVBdCA9IGZ1bmN0aW9uICh0LCBlKSB7XG4gICAgdmFyIG4gPSB0aGlzO0UodCwgdm9pZCAwLCBmdW5jdGlvbiAodCkge1xuICAgICAgbi5fc2V0dGxlZEF0KGl0LCBlLCB0KTtcbiAgICB9LCBmdW5jdGlvbiAodCkge1xuICAgICAgbi5fc2V0dGxlZEF0KHN0LCBlLCB0KTtcbiAgICB9KTtcbiAgfTt2YXIgZHQgPSBXLFxuICAgICAgdnQgPSB7IFByb21pc2U6IHB0LCBwb2x5ZmlsbDogZHQgfTtcImZ1bmN0aW9uXCIgPT0gdHlwZW9mIGRlZmluZSAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdnQ7XG4gIH0pIDogXCJ1bmRlZmluZWRcIiAhPSB0eXBlb2YgbW9kdWxlICYmIG1vZHVsZS5leHBvcnRzID8gbW9kdWxlLmV4cG9ydHMgPSB2dCA6IFwidW5kZWZpbmVkXCIgIT0gdHlwZW9mIHRoaXMgJiYgKHRoaXMuRVM2UHJvbWlzZSA9IHZ0KSwgZHQoKTtcbn0pLmNhbGwodW5kZWZpbmVkKTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoJ19wcm9jZXNzJyksdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSlcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0OnV0Zi04O2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYklpOW9iMjFsTDJSaGJtbGxiQzlFYjJOMWJXVnVkSE12Y0hKdmFtVmpkSE12YjNKaUxXTnNhV1Z1ZEM5emNtTXZiR2xpTDJWek5pMXdjbTl0YVhObExtMXBiaTVxY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pT3pzN096czdPenM3T3p0QlFWRkJMRU5CUVVNc1dVRkJWVHRCUVVGRExHTkJRVmtzUTBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNN1FVRkJReXhYUVVGTkxGVkJRVlVzU1VGQlJTeFBRVUZQTEVOQlFVTXNTVUZCUlN4UlFVRlJMRWxCUVVVc1QwRkJUeXhEUVVGRExFbEJRVVVzU1VGQlNTeExRVUZITEVOQlFVTXNRMEZCUVR0SFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF6dEJRVUZETEZkQlFVMHNWVUZCVlN4SlFVRkZMRTlCUVU4c1EwRkJReXhEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRPMEZCUVVNc1MwRkJReXhIUVVGRExFTkJRVU1zUTBGQlFUdEhRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJRenRCUVVGRExFdEJRVU1zUjBGQlF5eERRVUZETEVOQlFVRTdSMEZCUXl4VFFVRlRMRU5CUVVNc1IwRkJSVHRCUVVGRExGZEJRVThzV1VGQlZUdEJRVUZETEdGQlFVOHNRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVUU3UzBGQlF5eERRVUZCTzBkQlFVTXNVMEZCVXl4RFFVRkRMRWRCUVVVN1FVRkJReXhYUVVGUExGbEJRVlU3UVVGQlF5eFBRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVFN1MwRkJReXhEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVkQlFVVTdRVUZCUXl4UlFVRkpMRU5CUVVNc1IwRkJReXhEUVVGRE8xRkJRVU1zUTBGQlF5eEhRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVGRExFTkJRVU1zUjBGQlF5eFJRVUZSTEVOQlFVTXNZMEZCWXl4RFFVRkRMRVZCUVVVc1EwRkJReXhEUVVGRExGRkJRVThzUTBGQlF5eERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRVZCUVVNc1JVRkJReXhoUVVGaExFVkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkRMRmxCUVZVN1FVRkJReXhQUVVGRExFTkJRVU1zU1VGQlNTeEhRVUZETEVOQlFVTXNSMEZCUXl4RlFVRkZMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVUU3UzBGQlF5eERRVUZCTEVOQlFVRTdSMEZCUXl4VFFVRlRMRU5CUVVNc1IwRkJSVHRCUVVGRExGRkJRVWtzUTBGQlF5eEhRVUZETEVsQlFVa3NZMEZCWXl4RlFVRkJMRU5CUVVNc1VVRkJUeXhEUVVGRExFTkJRVU1zUzBGQlN5eERRVUZETEZOQlFWTXNSMEZCUXl4RFFVRkRMRVZCUVVNc1dVRkJWVHRCUVVGRExFOUJRVU1zUTBGQlF5eExRVUZMTEVOQlFVTXNWMEZCVnl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGQk8wdEJRVU1zUTBGQlFTeERRVUZCTzBkQlFVTXNVMEZCVXl4RFFVRkRMRWRCUVVVN1FVRkJReXhYUVVGUExGbEJRVlU3UVVGQlF5eG5Ra0ZCVlN4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlFUdExRVUZETEVOQlFVRTdSMEZCUXl4VFFVRlRMRU5CUVVNc1IwRkJSVHRCUVVGRExGTkJRVWtzU1VGQlNTeERRVUZETEVkQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eEpRVUZGTEVOQlFVTXNSVUZCUXp0QlFVRkRMRlZCUVVrc1EwRkJReXhIUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTTdWVUZCUXl4RFFVRkRMRWRCUVVNc1JVRkJSU3hEUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkRMRXRCUVVzc1EwRkJReXhGUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVNc1MwRkJTeXhEUVVGRExFTkJRVUU3UzBGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFZEJRVVU3UVVGQlF5eFJRVUZITzBGQlFVTXNWVUZCU1N4RFFVRkRMRWRCUVVNc1QwRkJUenRWUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1VVRkJUeXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEZOQlFWTXNTVUZCUlN4RFFVRkRMRU5CUVVNc1dVRkJXU3hGUVVGRExFTkJRVU1zUlVGQlJTeERRVUZCTEVOQlFVRTdTMEZCUXl4RFFVRkJMRTlCUVUwc1EwRkJReXhGUVVGRE8wRkJRVU1zWVVGQlR5eERRVUZETEVWQlFVVXNRMEZCUVR0TFFVRkRPMGRCUVVNc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXp0QlFVRkRMRkZCUVVrc1EwRkJReXhIUVVGRExFbEJRVWs3VVVGQlF5eERRVUZETEVkQlFVTXNTVUZCU1N4SlFVRkpMRU5CUVVNc1YwRkJWeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEV0QlFVc3NRMEZCUXl4TFFVRkhMRU5CUVVNc1EwRkJReXhGUVVGRkxFTkJRVU1zU1VGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEUxQlFVMHNRMEZCUXl4SlFVRkhMRU5CUVVNc1JVRkJRenRCUVVGRExGVkJRVWtzUTBGQlF5eEhRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEZsQlFWVTdRVUZCUXl4VFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGQk8wOUJRVU1zUTBGQlF5eERRVUZCTzB0QlFVTXNUVUZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVUU3UjBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNN1FVRkJReXhSUVVGSkxFTkJRVU1zUjBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCUnl4RFFVRkRMRWxCUVVVc1VVRkJVU3hKUVVGRkxFOUJRVThzUTBGQlF5eEpRVUZGTEVOQlFVTXNRMEZCUXl4WFFVRlhMRXRCUVVjc1EwRkJRenRCUVVGRExHRkJRVThzUTBGQlF5eERRVUZETzB0QlFVRXNTVUZCU1N4RFFVRkRMRWRCUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNVVUZCVHl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUVN4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFZEJRVVVzUlVGQlJTeFRRVUZUTEVOQlFVTXNSMEZCUlR0QlFVRkRMRmRCUVU4c1NVRkJTU3hUUVVGVExFTkJRVU1zTUVOQlFUQkRMRU5CUVVNc1EwRkJRVHRIUVVGRExGTkJRVk1zUTBGQlF5eEhRVUZGTzBGQlFVTXNWMEZCVHl4SlFVRkpMRk5CUVZNc1EwRkJReXh6UkVGQmMwUXNRMEZCUXl4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETzBGQlFVTXNVVUZCUnp0QlFVRkRMR0ZCUVU4c1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlFUdExRVUZETEVOQlFVRXNUMEZCVFN4RFFVRkRMRVZCUVVNN1FVRkJReXhqUVVGUExFVkJRVVVzUTBGQlF5eExRVUZMTEVkQlFVTXNRMEZCUXl4RlFVRkRMRVZCUVVVc1EwRkJRU3hEUVVGQk8wdEJRVU03UjBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVTTdRVUZCUXl4UlFVRkhPMEZCUVVNc1QwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1EwRkJReXhEUVVGQk8wdEJRVU1zUTBGQlFTeFBRVUZOTEVOQlFVTXNSVUZCUXp0QlFVRkRMR0ZCUVU4c1EwRkJReXhEUVVGQk8wdEJRVU03UjBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF6dEJRVUZETEV0QlFVTXNRMEZCUXl4VlFVRlRMRU5CUVVNc1JVRkJRenRCUVVGRExGVkJRVWtzUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXp0VlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXl4VlFVRlRMRU5CUVVNc1JVRkJRenRCUVVGRExGTkJRVU1zUzBGQlJ5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhMUVVGSExFTkJRVU1zUjBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVFc1FVRkJReXhEUVVGQk8wOUJRVU1zUlVGQlF5eFZRVUZUTEVOQlFVTXNSVUZCUXp0QlFVRkRMRk5CUVVNc1MwRkJSeXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlFTeEJRVUZETEVOQlFVRTdUMEZCUXl4RlFVRkRMRlZCUVZVc1NVRkJSU3hEUVVGRExFTkJRVU1zVFVGQlRTeEpRVUZGTEd0Q1FVRnJRaXhEUVVGQkxFRkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SlFVRkZMRU5CUVVNc1MwRkJSeXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlFTeEJRVUZETEVOQlFVRTdTMEZCUXl4RlFVRkRMRU5CUVVNc1EwRkJReXhEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1JVRkJRenRCUVVGRExFdEJRVU1zUTBGQlF5eE5RVUZOTEV0QlFVY3NSVUZCUlN4SFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEU5QlFVOHNRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhOUVVGTkxFdEJRVWNzUlVGQlJTeEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFOUJRVThzUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1MwRkJTeXhEUVVGRExFVkJRVU1zVlVGQlV5eERRVUZETEVWQlFVTTdRVUZCUXl4UFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUTBGQlF5eERRVUZCTzB0QlFVTXNSVUZCUXl4VlFVRlRMRU5CUVVNc1JVRkJRenRCUVVGRExFOUJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVFN1MwRkJReXhEUVVGRExFTkJRVUU3UjBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF6dEJRVUZETEV0QlFVTXNRMEZCUXl4WFFVRlhMRXRCUVVjc1EwRkJReXhEUVVGRExGZEJRVmNzU1VGQlJTeERRVUZETEV0QlFVY3NSVUZCUlN4SlFVRkZMRmRCUVZjc1EwRkJReXhQUVVGUExFdEJRVWNzUlVGQlJTeEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eExRVUZITEVWQlFVVXNSMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFVkJRVVVzUTBGQlF5eExRVUZMTEVOQlFVTXNSMEZCUXl4TFFVRkxMRU5CUVVNc1MwRkJSeXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlFUdEhRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFVkJRVU03UVVGQlF5eExRVUZETEV0QlFVY3NRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eEZRVUZGTEVOQlFVTXNSMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlFUdEhRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJRenRCUVVGRExFdEJRVU1zUTBGQlF5eFJRVUZSTEVsQlFVVXNRMEZCUXl4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRExFTkJRVU1zVDBGQlR5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1JVRkJRenRCUVVGRExFdEJRVU1zUTBGQlF5eE5RVUZOTEV0QlFVY3NSVUZCUlN4TFFVRkhMRU5CUVVNc1EwRkJReXhQUVVGUExFZEJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRWRCUVVNc1JVRkJSU3hGUVVGRExFTkJRVU1zUzBGQlJ5eERRVUZETEVOQlFVTXNXVUZCV1N4RFFVRkRMRTFCUVUwc1NVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkJMRUZCUVVNc1EwRkJRVHRIUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNN1FVRkJReXhMUVVGRExFTkJRVU1zVFVGQlRTeExRVUZITEVWQlFVVXNTMEZCUnl4RFFVRkRMRU5CUVVNc1RVRkJUU3hIUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4SFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkJMRUZCUVVNc1EwRkJRVHRIUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF6dEJRVUZETEZGQlFVa3NRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhaUVVGWk8xRkJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRExGRkJRVkVzUjBGQlF5eEpRVUZKTEVWQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkRMRVZCUVVVc1EwRkJReXhIUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkRMRVZCUVVVc1EwRkJReXhIUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEV0QlFVY3NRMEZCUXl4SlFVRkZMRU5CUVVNc1EwRkJReXhOUVVGTkxFbEJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRVHRIUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXp0QlFVRkRMRkZCUVVrc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eFpRVUZaTzFGQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhOUVVGTkxFTkJRVU1zU1VGQlJ5eERRVUZETEV0QlFVY3NRMEZCUXl4RFFVRkRMRTFCUVUwc1JVRkJRenRCUVVGRExGZEJRVWtzU1VGQlNTeERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zVDBGQlR5eEZRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eE5RVUZOTEVWQlFVTXNRMEZCUXl4SlFVRkZMRU5CUVVNc1JVRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhaUVVGWkxFTkJRVU1zVFVGQlRTeEhRVUZETEVOQlFVTXNRMEZCUVR0TFFVRkRPMGRCUVVNc1UwRkJVeXhEUVVGRExFZEJRVVU3UVVGQlF5eFJRVUZKTEVOQlFVTXNTMEZCU3l4SFFVRkRMRWxCUVVrc1EwRkJRVHRIUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNN1FVRkJReXhSUVVGSE8wRkJRVU1zWVVGQlR5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVFN1MwRkJReXhEUVVGQkxFOUJRVTBzUTBGQlF5eEZRVUZETzBGQlFVTXNZMEZCVHl4RlFVRkZMRU5CUVVNc1MwRkJTeXhIUVVGRExFTkJRVU1zUlVGQlF5eEZRVUZGTEVOQlFVRXNRMEZCUVR0TFFVRkRPMGRCUVVNc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRE8wRkJRVU1zVVVGQlNTeERRVUZETzFGQlFVTXNRMEZCUXp0UlFVRkRMRU5CUVVNN1VVRkJReXhEUVVGRE8xRkJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhKUVVGSExFTkJRVU1zUlVGQlF6dEJRVUZETEZkQlFVY3NRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4TFFVRkhMRVZCUVVVc1NVRkJSU3hEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhMUVVGTExFVkJRVU1zUTBGQlF5eEhRVUZETEVsQlFVa3NRMEZCUVN4SFFVRkZMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEV0QlFVY3NRMEZCUXl4RFFVRkJPMEZCUVVNc1pVRkJUeXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1EwRkJRVHRQUVVGQk8wdEJRVU1zVFVGQlN5eERRVUZETEVkQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNUVUZCVFN4TFFVRkhMRVZCUVVVc1MwRkJSeXhEUVVGRExFbEJRVVVzUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eExRVUZITEVWQlFVVXNSMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNTMEZCUnl4RlFVRkZMRWxCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUVN4QlFVRkRMRU5CUVVFN1IwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkRPMEZCUVVNc1VVRkJSenRCUVVGRExFOUJRVU1zUTBGQlF5eFZRVUZUTEVOQlFVTXNSVUZCUXp0QlFVRkRMRk5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVOQlFVRTdUMEZCUXl4RlFVRkRMRlZCUVZNc1EwRkJReXhGUVVGRE8wRkJRVU1zVTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRVHRQUVVGRExFTkJRVU1zUTBGQlFUdExRVUZETEVOQlFVRXNUMEZCVFN4RFFVRkRMRVZCUVVNN1FVRkJReXhQUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkJPMHRCUVVNN1IwRkJReXhUUVVGVExFTkJRVU1zUjBGQlJUdEJRVUZETEZkQlFVOHNSVUZCUlN4RlFVRkZMRU5CUVVFN1IwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTTdRVUZCUXl4TFFVRkRMRU5CUVVNc1JVRkJSU3hEUVVGRExFZEJRVU1zUlVGQlJTeEZRVUZGTEVWQlFVTXNRMEZCUXl4RFFVRkRMRTFCUVUwc1IwRkJReXhMUVVGTExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4SFFVRkRMRXRCUVVzc1EwRkJReXhGUVVGRExFTkJRVU1zUTBGQlF5eFpRVUZaTEVkQlFVTXNSVUZCUlN4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETzBGQlFVTXNWMEZCVHl4SlFVRkpMRVZCUVVVc1EwRkJReXhKUVVGSkxFVkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETzBGQlFVTXNVVUZCU1N4RFFVRkRMRWRCUVVNc1NVRkJTU3hEUVVGRExFOUJRVThzU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGRExGVkJRVk1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXp0QlFVRkRMRmRCUVVrc1NVRkJTU3hEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEUxQlFVMHNSVUZCUXl4RFFVRkRMRWRCUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVNc1EwRkJReXhEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkJPMHRCUVVNc1IwRkJReXhWUVVGVExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVTTdRVUZCUXl4UFFVRkRMRU5CUVVNc1NVRkJTU3hUUVVGVExFTkJRVU1zYVVOQlFXbERMRU5CUVVNc1EwRkJReXhEUVVGQk8wdEJRVU1zUTBGQlF5eERRVUZCTzBkQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRE8wRkJRVU1zVVVGQlNTeERRVUZETEVkQlFVTXNTVUZCU1R0UlFVRkRMRU5CUVVNc1IwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4UlFVRlBMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkJMRU5CUVVFN1IwRkJReXhUUVVGVExFTkJRVU1zUjBGQlJUdEJRVUZETEZWQlFVMHNTVUZCU1N4VFFVRlRMRU5CUVVNc2IwWkJRVzlHTEVOQlFVTXNRMEZCUVR0SFFVRkRMRk5CUVZNc1EwRkJReXhIUVVGRk8wRkJRVU1zVlVGQlRTeEpRVUZKTEZOQlFWTXNRMEZCUXl4MVNFRkJkVWdzUTBGQlF5eERRVUZCTzBkQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRE8wRkJRVU1zVVVGQlNTeERRVUZETEVWQlFVVXNRMEZCUXl4SFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVkQlFVTXNTVUZCU1N4RFFVRkRMRTFCUVUwc1IwRkJReXhMUVVGTExFTkJRVU1zUlVGQlF5eEpRVUZKTEVOQlFVTXNXVUZCV1N4SFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFdEJRVWNzUTBGQlF5eExRVUZITEZWQlFWVXNTVUZCUlN4UFFVRlBMRU5CUVVNc1NVRkJSU3hEUVVGRExFVkJRVVVzUlVGQlF5eEpRVUZKTEZsQlFWa3NRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhKUVVGSkxFVkJRVU1zUTBGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVFc1FVRkJReXhEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1JVRkJRenRCUVVGRExGRkJRVWtzUTBGQlF5eHZRa0ZCYjBJc1IwRkJReXhEUVVGRExFVkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNSMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRVZCUVVVc1EwRkJReXhKUVVGRkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRVZCUVVNc1MwRkJTeXhEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETEVOQlFVTXNTVUZCUlN4SlFVRkpMRU5CUVVNc1RVRkJUU3hIUVVGRExFTkJRVU1zUlVGQlF5eEpRVUZKTEVOQlFVTXNUVUZCVFN4SFFVRkRMRU5CUVVNc1EwRkJReXhOUVVGTkxFVkJRVU1zU1VGQlNTeERRVUZETEZWQlFWVXNSMEZCUXl4RFFVRkRMRU5CUVVNc1RVRkJUU3hGUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVkQlFVTXNTVUZCU1N4TFFVRkxMRU5CUVVNc1NVRkJTU3hEUVVGRExFMUJRVTBzUTBGQlF5eEZRVUZETEVOQlFVTXNTMEZCUnl4SlFVRkpMRU5CUVVNc1RVRkJUU3hIUVVGRExFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RlFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zU1VGQlJTeEpRVUZKTEVOQlFVTXNUVUZCVFN4SFFVRkRMRWxCUVVrc1EwRkJReXhOUVVGTkxFbEJRVVVzUTBGQlF5eEZRVUZETEVsQlFVa3NRMEZCUXl4VlFVRlZMRVZCUVVVc1JVRkJReXhEUVVGRExFdEJRVWNzU1VGQlNTeERRVUZETEZWQlFWVXNTVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFOUJRVThzUlVGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVFc1FVRkJReXhEUVVGQkxFZEJRVVVzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4UFFVRlBMRVZCUVVNc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlFUdEhRVUZETEZOQlFWTXNRMEZCUXl4SFFVRkZPMEZCUVVNc1YwRkJUeXhKUVVGSkxFdEJRVXNzUTBGQlF5eDVRMEZCZVVNc1EwRkJReXhEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVkQlFVVTdRVUZCUXl4UlFVRkpMRU5CUVVNc1EwRkJReXhKUVVGSExGZEJRVmNzU1VGQlJTeFBRVUZQTEUxQlFVMHNSVUZCUXl4RFFVRkRMRWRCUVVNc1RVRkJUU3hEUVVGRExFdEJRVXNzU1VGQlJ5eFhRVUZYTEVsQlFVVXNUMEZCVHl4SlFVRkpMRVZCUVVNc1EwRkJReXhIUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVsQlFVYzdRVUZCUXl4UFFVRkRMRWRCUVVNc1VVRkJVU3hEUVVGRExHRkJRV0VzUTBGQlF5eEZRVUZGTEVOQlFVRTdTMEZCUXl4RFFVRkJMRTlCUVUwc1EwRkJReXhGUVVGRE8wRkJRVU1zV1VGQlRTeEpRVUZKTEV0QlFVc3NRMEZCUXl3d1JVRkJNRVVzUTBGQlF5eERRVUZCTzB0QlFVTXNTVUZCU1N4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SlFVRkZMR3RDUVVGclFpeExRVUZITEUxQlFVMHNRMEZCUXl4VFFVRlRMRU5CUVVNc1VVRkJVU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4RlFVRkZMRU5CUVVNc1NVRkJSU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZCTEV0QlFVa3NRMEZCUXl4RFFVRkRMRTlCUVU4c1IwRkJReXhGUVVGRkxFTkJRVUVzUVVGQlF5eERRVUZCTzBkQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGRExFdEJRVXNzUTBGQlF5eFBRVUZQTEVkQlFVTXNTMEZCU3l4RFFVRkRMRTlCUVU4c1IwRkJReXhWUVVGVExFTkJRVU1zUlVGQlF6dEJRVUZETEZkQlFVMHNaMEpCUVdkQ0xFdEJRVWNzVFVGQlRTeERRVUZETEZOQlFWTXNRMEZCUXl4UlFVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZCTzBkQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNN1RVRkJReXhEUVVGRE8wMUJRVU1zUTBGQlF6dE5RVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRPMDFCUVVNc1EwRkJReXhIUVVGRExFTkJRVU03VFVGQlF5eERRVUZETEVkQlFVTXNWMEZCVXl4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRE8wRkJRVU1zVFVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNc1JVRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFbEJRVVVzUTBGQlF5eEZRVUZETEVOQlFVTXNTMEZCUnl4RFFVRkRMRXRCUVVjc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRVZCUVVVc1EwRkJRU3hCUVVGRExFTkJRVUU3UjBGQlF6dE5RVUZETEVOQlFVTXNSMEZCUXl4WFFVRlhMRWxCUVVVc1QwRkJUeXhOUVVGTkxFZEJRVU1zVFVGQlRTeEhRVUZETEV0QlFVc3NRMEZCUXp0TlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFbEJRVVVzUlVGQlJUdE5RVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRU5CUVVNc1owSkJRV2RDTEVsQlFVVXNRMEZCUXl4RFFVRkRMSE5DUVVGelFqdE5RVUZETEVOQlFVTXNSMEZCUXl4WFFVRlhMRWxCUVVVc1QwRkJUeXhKUVVGSkxFbEJRVVVzVjBGQlZ5eEpRVUZGTEU5QlFVOHNUMEZCVHl4SlFVRkZMR3RDUVVGclFpeExRVUZITEVOQlFVRXNSMEZCUlN4RFFVRkRMRkZCUVZFc1EwRkJReXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETzAxQlFVTXNRMEZCUXl4SFFVRkRMRmRCUVZjc1NVRkJSU3hQUVVGUExHbENRVUZwUWl4SlFVRkZMRmRCUVZjc1NVRkJSU3hQUVVGUExHRkJRV0VzU1VGQlJTeFhRVUZYTEVsQlFVVXNUMEZCVHl4alFVRmpPMDFCUVVNc1JVRkJSU3hIUVVGRExFbEJRVWtzUzBGQlN5eERRVUZETEVsQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eEZRVUZGTEVkQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNc1JVRkJSU3hIUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVWQlFVVXNSMEZCUXl4TFFVRkxMRU5CUVVNc1MwRkJSeXhEUVVGRExFbEJRVVVzVlVGQlZTeEpRVUZGTEU5QlFVOHNUMEZCVHl4SFFVRkRMRU5CUVVNc1JVRkJSU3hIUVVGRExFTkJRVU1zUlVGQlJTeERRVUZETEVsQlFVa3NSVUZCUlN4SFFVRkRMRU5CUVVNN1RVRkJReXhGUVVGRkxFZEJRVU1zUTBGQlF6dE5RVUZETEVWQlFVVXNSMEZCUXl4SlFVRkpMRU5CUVVNc1RVRkJUU3hGUVVGRkxFTkJRVU1zVVVGQlVTeERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRMRk5CUVZNc1EwRkJReXhGUVVGRkxFTkJRVU03VFVGQlF5eEZRVUZGTEVkQlFVTXNTMEZCU3l4RFFVRkRPMDFCUVVNc1JVRkJSU3hIUVVGRExFTkJRVU03VFVGQlF5eEZRVUZGTEVkQlFVTXNRMEZCUXp0TlFVRkRMRVZCUVVVc1IwRkJReXhKUVVGSkxFTkJRVU1zUlVGQlFUdE5RVUZETEVWQlFVVXNSMEZCUXl4SlFVRkpMRU5CUVVNc1JVRkJRVHROUVVGRExFVkJRVVVzUjBGQlF5eERRVUZETzAxQlFVTXNSVUZCUlN4SFFVRkRMRU5CUVVNN1RVRkJReXhGUVVGRkxFZEJRVU1zUTBGQlF6dE5RVUZETEVWQlFVVXNSMEZCUXl4RFFVRkRPMDFCUVVNc1JVRkJSU3hIUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUnl4SFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFTkJRVU1zU1VGQlNTeEhRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRU5CUVVNc1QwRkJUeXhIUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEVOQlFVTXNUVUZCVFN4SFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFTkJRVU1zWVVGQllTeEhRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1VVRkJVU3hIUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNTMEZCU3l4SFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zVTBGQlV5eEhRVUZETEVWQlFVTXNWMEZCVnl4RlFVRkRMRU5CUVVNc1JVRkJReXhKUVVGSkxFVkJRVU1zUlVGQlJTeEZRVUZETEU5QlFVOHNSVUZCUXl4blFrRkJVeXhEUVVGRExFVkJRVU03UVVGQlF5eGhRVUZQTEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hGUVVGRExFTkJRVU1zUTBGQlF5eERRVUZCTzB0QlFVTXNSVUZCUXl4RFFVRkRMRWxCUVVrc1JVRkJSU3hIUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNVMEZCVXl4RFFVRkRMRlZCUVZVc1IwRkJReXhaUVVGVk8wRkJRVU1zVTBGQlNTeEpRVUZKTEVOQlFVTXNSMEZCUXl4SlFVRkpMRU5CUVVNc1RVRkJUU3hGUVVGRExFTkJRVU1zUjBGQlF5eEpRVUZKTEVOQlFVTXNUVUZCVFN4RlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFVkJRVU1zU1VGQlNTeERRVUZETEUxQlFVMHNTMEZCUnl4RlFVRkZMRWxCUVVVc1EwRkJReXhIUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVVXNSVUZCUXl4SlFVRkpMRU5CUVVNc1ZVRkJWU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRVHRIUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEZOQlFWTXNRMEZCUXl4VlFVRlZMRWRCUVVNc1ZVRkJVeXhEUVVGRExFVkJRVU1zUTBGQlF5eEZRVUZETzBGQlFVTXNVVUZCU1N4RFFVRkRMRWRCUVVNc1NVRkJTU3hEUVVGRExHOUNRVUZ2UWp0UlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zVDBGQlR5eERRVUZETEVsQlFVY3NRMEZCUXl4TFFVRkhMRVZCUVVVc1JVRkJRenRCUVVGRExGVkJRVWtzUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhKUVVGSExFTkJRVU1zUzBGQlJ5eEZRVUZGTEVsQlFVVXNRMEZCUXl4RFFVRkRMRTFCUVUwc1MwRkJSeXhGUVVGRkxFVkJRVU1zU1VGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1RVRkJUU3hGUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1MwRkJTeXhKUVVGSExGVkJRVlVzU1VGQlJTeFBRVUZQTEVOQlFVTXNSVUZCUXl4SlFVRkpMRU5CUVVNc1ZVRkJWU3hGUVVGRkxFVkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zUzBGQlN5eEpRVUZITEVOQlFVTXNTMEZCUnl4RlFVRkZMRVZCUVVNN1FVRkJReXhaUVVGSkxFTkJRVU1zUjBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRVHRQUVVGRExFMUJRVXNzU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhWUVVGVExFTkJRVU1zUlVGQlF6dEJRVUZETEZOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRVHRQUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUVR0TFFVRkRMRTFCUVVzc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFTkJRVUU3UjBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUXl4VFFVRlRMRU5CUVVNc1ZVRkJWU3hIUVVGRExGVkJRVk1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNN1FVRkJReXhSUVVGSkxFTkJRVU1zUjBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJReXhOUVVGTkxFdEJRVWNzUlVGQlJTeExRVUZITEVsQlFVa3NRMEZCUXl4VlFVRlZMRVZCUVVVc1JVRkJReXhEUVVGRExFdEJRVWNzUlVGQlJTeEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFZEJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVUVzUVVGQlF5eEZRVUZETEVOQlFVTXNTMEZCUnl4SlFVRkpMRU5CUVVNc1ZVRkJWU3hKUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGQk8wZEJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNVMEZCVXl4RFFVRkRMR0ZCUVdFc1IwRkJReXhWUVVGVExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVTTdRVUZCUXl4UlFVRkpMRU5CUVVNc1IwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4TFFVRkxMRU5CUVVNc1JVRkJReXhWUVVGVExFTkJRVU1zUlVGQlF6dEJRVUZETEU5QlFVTXNRMEZCUXl4VlFVRlZMRU5CUVVNc1JVRkJSU3hGUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUVR0TFFVRkRMRVZCUVVNc1ZVRkJVeXhEUVVGRExFVkJRVU03UVVGQlF5eFBRVUZETEVOQlFVTXNWVUZCVlN4RFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVOQlFVRTdTMEZCUXl4RFFVRkRMRU5CUVVFN1IwRkJReXhEUVVGRExFbEJRVWtzUlVGQlJTeEhRVUZETEVOQlFVTTdUVUZCUXl4RlFVRkZMRWRCUVVNc1JVRkJReXhQUVVGUExFVkJRVU1zUlVGQlJTeEZRVUZETEZGQlFWRXNSVUZCUXl4RlFVRkZMRVZCUVVNc1EwRkJReXhWUVVGVkxFbEJRVVVzVDBGQlR5eE5RVUZOTEVsQlFVVXNUVUZCVFN4RFFVRkRMRWRCUVVjc1IwRkJReXhOUVVGTkxFTkJRVU1zV1VGQlZUdEJRVUZETEZkQlFVOHNSVUZCUlN4RFFVRkJPMGRCUVVNc1EwRkJReXhIUVVGRExGZEJRVmNzU1VGQlJTeFBRVUZQTEUxQlFVMHNTVUZCUlN4TlFVRk5MRU5CUVVNc1QwRkJUeXhIUVVGRExFMUJRVTBzUTBGQlF5eFBRVUZQTEVkQlFVTXNSVUZCUlN4SFFVRkRMRmRCUVZjc1NVRkJSU3hQUVVGUExFbEJRVWtzUzBGQlJ5eEpRVUZKTEVOQlFVTXNWVUZCVlN4SFFVRkRMRVZCUVVVc1EwRkJRU3hCUVVGRExFVkJRVU1zUlVGQlJTeEZRVUZGTEVOQlFVRTdRMEZCUXl4RFFVRkJMRU5CUVVVc1NVRkJTU3hYUVVGTkxFTkJRVU1pTENKbWFXeGxJam9pWjJWdVpYSmhkR1ZrTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhORGIyNTBaVzUwSWpwYklpOHFJVnh1SUNvZ1FHOTJaWEoyYVdWM0lHVnpOaTF3Y205dGFYTmxJQzBnWVNCMGFXNTVJR2x0Y0d4bGJXVnVkR0YwYVc5dUlHOW1JRkJ5YjIxcGMyVnpMMEVyTGx4dUlDb2dRR052Y0hseWFXZG9kQ0JEYjNCNWNtbG5hSFFnS0dNcElESXdNVFFnV1dWb2RXUmhJRXRoZEhvc0lGUnZiU0JFWVd4bExDQlRkR1ZtWVc0Z1VHVnVibVZ5SUdGdVpDQmpiMjUwY21saWRYUnZjbk1nS0VOdmJuWmxjbk5wYjI0Z2RHOGdSVk0ySUVGUVNTQmllU0JLWVd0bElFRnlZMmhwWW1Gc1pDbGNiaUFxSUVCc2FXTmxibk5sSUNBZ1RHbGpaVzV6WldRZ2RXNWtaWElnVFVsVUlHeHBZMlZ1YzJWY2JpQXFJQ0FnSUNBZ0lDQWdJQ0FnVTJWbElHaDBkSEJ6T2k4dmNtRjNMbWRwZEdoMVluVnpaWEpqYjI1MFpXNTBMbU52YlM5cVlXdGxZWEpqYUdsaVlXeGtMMlZ6Tmkxd2NtOXRhWE5sTDIxaGMzUmxjaTlNU1VORlRsTkZYRzRnS2lCQWRtVnljMmx2YmlBZ0lETXVNaTR4WEc0Z0tpOWNibHh1S0daMWJtTjBhVzl1S0NsN1hDSjFjMlVnYzNSeWFXTjBYQ0k3Wm5WdVkzUnBiMjRnZENoMEtYdHlaWFIxY201Y0ltWjFibU4wYVc5dVhDSTlQWFI1Y0dWdlppQjBmSHhjSW05aWFtVmpkRndpUFQxMGVYQmxiMllnZENZbWJuVnNiQ0U5UFhSOVpuVnVZM1JwYjI0Z1pTaDBLWHR5WlhSMWNtNWNJbVoxYm1OMGFXOXVYQ0k5UFhSNWNHVnZaaUIwZldaMWJtTjBhVzl1SUc0b2RDbDdSejEwZldaMWJtTjBhVzl1SUhJb2RDbDdVVDEwZldaMWJtTjBhVzl1SUc4b0tYdHlaWFIxY200Z1puVnVZM1JwYjI0b0tYdHdjbTlqWlhOekxtNWxlSFJVYVdOcktHRXBmWDFtZFc1amRHbHZiaUJwS0NsN2NtVjBkWEp1SUdaMWJtTjBhVzl1S0NsN1FpaGhLWDE5Wm5WdVkzUnBiMjRnY3lncGUzWmhjaUIwUFRBc1pUMXVaWGNnV0NoaEtTeHVQV1J2WTNWdFpXNTBMbU55WldGMFpWUmxlSFJPYjJSbEtGd2lYQ0lwTzNKbGRIVnliaUJsTG05aWMyVnlkbVVvYml4N1kyaGhjbUZqZEdWeVJHRjBZVG9oTUgwcExHWjFibU4wYVc5dUtDbDdiaTVrWVhSaFBYUTlLeXQwSlRKOWZXWjFibU4wYVc5dUlIVW9LWHQyWVhJZ2REMXVaWGNnVFdWemMyRm5aVU5vWVc1dVpXdzdjbVYwZFhKdUlIUXVjRzl5ZERFdWIyNXRaWE56WVdkbFBXRXNablZ1WTNScGIyNG9LWHQwTG5CdmNuUXlMbkJ2YzNSTlpYTnpZV2RsS0RBcGZYMW1kVzVqZEdsdmJpQmpLQ2w3Y21WMGRYSnVJR1oxYm1OMGFXOXVLQ2w3YzJWMFZHbHRaVzkxZENoaExERXBmWDFtZFc1amRHbHZiaUJoS0NsN1ptOXlLSFpoY2lCMFBUQTdTajUwTzNRclBUSXBlM1poY2lCbFBYUjBXM1JkTEc0OWRIUmJkQ3N4WFR0bEtHNHBMSFIwVzNSZFBYWnZhV1FnTUN4MGRGdDBLekZkUFhadmFXUWdNSDFLUFRCOVpuVnVZM1JwYjI0Z1ppZ3BlM1J5ZVh0MllYSWdkRDF5WlhGMWFYSmxMR1U5ZENoY0luWmxjblI0WENJcE8zSmxkSFZ5YmlCQ1BXVXVjblZ1VDI1TWIyOXdmSHhsTG5KMWJrOXVRMjl1ZEdWNGRDeHBLQ2w5WTJGMFkyZ29iaWw3Y21WMGRYSnVJR01vS1gxOVpuVnVZM1JwYjI0Z2JDaDBMR1VwZTNaaGNpQnVQWFJvYVhNc2NqMXVaWGNnZEdocGN5NWpiMjV6ZEhKMVkzUnZjaWh3S1R0MmIybGtJREE5UFQxeVczSjBYU1ltYXloeUtUdDJZWElnYnoxdUxsOXpkR0YwWlR0cFppaHZLWHQyWVhJZ2FUMWhjbWQxYldWdWRITmJieTB4WFR0UktHWjFibU4wYVc5dUtDbDdlQ2h2TEhJc2FTeHVMbDl5WlhOMWJIUXBmU2w5Wld4elpTQkZLRzRzY2l4MExHVXBPM0psZEhWeWJpQnlmV1oxYm1OMGFXOXVJR2dvZENsN2RtRnlJR1U5ZEdocGN6dHBaaWgwSmlaY0ltOWlhbVZqZEZ3aVBUMTBlWEJsYjJZZ2RDWW1kQzVqYjI1emRISjFZM1J2Y2owOVBXVXBjbVYwZFhKdUlIUTdkbUZ5SUc0OWJtVjNJR1VvY0NrN2NtVjBkWEp1SUdjb2JpeDBLU3h1ZldaMWJtTjBhVzl1SUhBb0tYdDlablZ1WTNScGIyNGdYeWdwZTNKbGRIVnliaUJ1WlhjZ1ZIbHdaVVZ5Y205eUtGd2lXVzkxSUdOaGJtNXZkQ0J5WlhOdmJIWmxJR0VnY0hKdmJXbHpaU0IzYVhSb0lHbDBjMlZzWmx3aUtYMW1kVzVqZEdsdmJpQmtLQ2w3Y21WMGRYSnVJRzVsZHlCVWVYQmxSWEp5YjNJb1hDSkJJSEJ5YjIxcGMyVnpJR05oYkd4aVlXTnJJR05oYm01dmRDQnlaWFIxY200Z2RHaGhkQ0J6WVcxbElIQnliMjFwYzJVdVhDSXBmV1oxYm1OMGFXOXVJSFlvZENsN2RISjVlM0psZEhWeWJpQjBMblJvWlc1OVkyRjBZMmdvWlNsN2NtVjBkWEp1SUhWMExtVnljbTl5UFdVc2RYUjlmV1oxYm1OMGFXOXVJSGtvZEN4bExHNHNjaWw3ZEhKNWUzUXVZMkZzYkNobExHNHNjaWw5WTJGMFkyZ29ieWw3Y21WMGRYSnVJRzk5ZldaMWJtTjBhVzl1SUcwb2RDeGxMRzRwZTFFb1puVnVZM1JwYjI0b2RDbDdkbUZ5SUhJOUlURXNiejE1S0c0c1pTeG1kVzVqZEdsdmJpaHVLWHR5Zkh3b2NqMGhNQ3hsSVQwOWJqOW5LSFFzYmlrNlV5aDBMRzRwS1gwc1puVnVZM1JwYjI0b1pTbDdjbng4S0hJOUlUQXNhaWgwTEdVcEtYMHNYQ0pUWlhSMGJHVTZJRndpS3loMExsOXNZV0psYkh4OFhDSWdkVzVyYm05M2JpQndjbTl0YVhObFhDSXBLVHNoY2lZbWJ5WW1LSEk5SVRBc2FpaDBMRzhwS1gwc2RDbDlablZ1WTNScGIyNGdZaWgwTEdVcGUyVXVYM04wWVhSbFBUMDlhWFEvVXloMExHVXVYM0psYzNWc2RDazZaUzVmYzNSaGRHVTlQVDF6ZEQ5cUtIUXNaUzVmY21WemRXeDBLVHBGS0dVc2RtOXBaQ0F3TEdaMWJtTjBhVzl1S0dVcGUyY29kQ3hsS1gwc1puVnVZM1JwYjI0b1pTbDdhaWgwTEdVcGZTbDlablZ1WTNScGIyNGdkeWgwTEc0c2NpbDdiaTVqYjI1emRISjFZM1J2Y2owOVBYUXVZMjl1YzNSeWRXTjBiM0ltSm5JOVBUMWxkQ1ltWTI5dWMzUnlkV04wYjNJdWNtVnpiMngyWlQwOVBXNTBQMklvZEN4dUtUcHlQVDA5ZFhRL2FpaDBMSFYwTG1WeWNtOXlLVHAyYjJsa0lEQTlQVDF5UDFNb2RDeHVLVHBsS0hJcFAyMG9kQ3h1TEhJcE9sTW9kQ3h1S1gxbWRXNWpkR2x2YmlCbktHVXNiaWw3WlQwOVBXNC9haWhsTEY4b0tTazZkQ2h1S1Q5M0tHVXNiaXgyS0c0cEtUcFRLR1VzYmlsOVpuVnVZM1JwYjI0Z1FTaDBLWHQwTGw5dmJtVnljbTl5SmlaMExsOXZibVZ5Y205eUtIUXVYM0psYzNWc2RDa3NWQ2gwS1gxbWRXNWpkR2x2YmlCVEtIUXNaU2w3ZEM1ZmMzUmhkR1U5UFQxdmRDWW1LSFF1WDNKbGMzVnNkRDFsTEhRdVgzTjBZWFJsUFdsMExEQWhQVDEwTGw5emRXSnpZM0pwWW1WeWN5NXNaVzVuZEdnbUpsRW9WQ3gwS1NsOVpuVnVZM1JwYjI0Z2FpaDBMR1VwZTNRdVgzTjBZWFJsUFQwOWIzUW1KaWgwTGw5emRHRjBaVDF6ZEN4MExsOXlaWE4xYkhROVpTeFJLRUVzZENrcGZXWjFibU4wYVc5dUlFVW9kQ3hsTEc0c2NpbDdkbUZ5SUc4OWRDNWZjM1ZpYzJOeWFXSmxjbk1zYVQxdkxteGxibWQwYUR0MExsOXZibVZ5Y205eVBXNTFiR3dzYjF0cFhUMWxMRzliYVN0cGRGMDliaXh2VzJrcmMzUmRQWElzTUQwOVBXa21KblF1WDNOMFlYUmxKaVpSS0ZRc2RDbDlablZ1WTNScGIyNGdWQ2gwS1h0MllYSWdaVDEwTGw5emRXSnpZM0pwWW1WeWN5eHVQWFF1WDNOMFlYUmxPMmxtS0RBaFBUMWxMbXhsYm1kMGFDbDdabTl5S0haaGNpQnlMRzhzYVQxMExsOXlaWE4xYkhRc2N6MHdPM004WlM1c1pXNW5kR2c3Y3lzOU15bHlQV1ZiYzEwc2J6MWxXM01yYmwwc2NqOTRLRzRzY2l4dkxHa3BPbThvYVNrN2RDNWZjM1ZpYzJOeWFXSmxjbk11YkdWdVozUm9QVEI5ZldaMWJtTjBhVzl1SUUwb0tYdDBhR2x6TG1WeWNtOXlQVzUxYkd4OVpuVnVZM1JwYjI0Z1VDaDBMR1VwZTNSeWVYdHlaWFIxY200Z2RDaGxLWDFqWVhSamFDaHVLWHR5WlhSMWNtNGdZM1F1WlhKeWIzSTliaXhqZEgxOVpuVnVZM1JwYjI0Z2VDaDBMRzRzY2l4dktYdDJZWElnYVN4ekxIVXNZeXhoUFdVb2NpazdhV1lvWVNsN2FXWW9hVDFRS0hJc2J5a3NhVDA5UFdOMFB5aGpQU0V3TEhNOWFTNWxjbkp2Y2l4cFBXNTFiR3dwT25VOUlUQXNiajA5UFdrcGNtVjBkWEp1SUhadmFXUWdhaWh1TEdRb0tTbDlaV3h6WlNCcFBXOHNkVDBoTUR0dUxsOXpkR0YwWlNFOVBXOTBmSHdvWVNZbWRUOW5LRzRzYVNrNll6OXFLRzRzY3lrNmREMDlQV2wwUDFNb2JpeHBLVHAwUFQwOWMzUW1KbW9vYml4cEtTbDlablZ1WTNScGIyNGdReWgwTEdVcGUzUnllWHRsS0daMWJtTjBhVzl1S0dVcGUyY29kQ3hsS1gwc1puVnVZM1JwYjI0b1pTbDdhaWgwTEdVcGZTbDlZMkYwWTJnb2JpbDdhaWgwTEc0cGZYMW1kVzVqZEdsdmJpQlBLQ2w3Y21WMGRYSnVJR0YwS3l0OVpuVnVZM1JwYjI0Z2F5aDBLWHQwVzNKMFhUMWhkQ3NyTEhRdVgzTjBZWFJsUFhadmFXUWdNQ3gwTGw5eVpYTjFiSFE5ZG05cFpDQXdMSFF1WDNOMVluTmpjbWxpWlhKelBWdGRmV1oxYm1OMGFXOXVJRmtvZENsN2NtVjBkWEp1SUc1bGR5QmZkQ2gwYUdsekxIUXBMbkJ5YjIxcGMyVjlablZ1WTNScGIyNGdjU2gwS1h0MllYSWdaVDEwYUdsek8zSmxkSFZ5YmlCdVpYY2daU2hKS0hRcFAyWjFibU4wYVc5dUtHNHNjaWw3Wm05eUtIWmhjaUJ2UFhRdWJHVnVaM1JvTEdrOU1EdHZQbWs3YVNzcktXVXVjbVZ6YjJ4MlpTaDBXMmxkS1M1MGFHVnVLRzRzY2lsOU9tWjFibU4wYVc5dUtIUXNaU2w3WlNodVpYY2dWSGx3WlVWeWNtOXlLRndpV1c5MUlHMTFjM1FnY0dGemN5QmhiaUJoY25KaGVTQjBieUJ5WVdObExsd2lLU2w5S1gxbWRXNWpkR2x2YmlCR0tIUXBlM1poY2lCbFBYUm9hWE1zYmoxdVpYY2daU2h3S1R0eVpYUjFjbTRnYWlodUxIUXBMRzU5Wm5WdVkzUnBiMjRnUkNncGUzUm9jbTkzSUc1bGR5QlVlWEJsUlhKeWIzSW9YQ0paYjNVZ2JYVnpkQ0J3WVhOeklHRWdjbVZ6YjJ4MlpYSWdablZ1WTNScGIyNGdZWE1nZEdobElHWnBjbk4wSUdGeVozVnRaVzUwSUhSdklIUm9aU0J3Y205dGFYTmxJR052Ym5OMGNuVmpkRzl5WENJcGZXWjFibU4wYVc5dUlFc29LWHQwYUhKdmR5QnVaWGNnVkhsd1pVVnljbTl5S0Z3aVJtRnBiR1ZrSUhSdklHTnZibk4wY25WamRDQW5VSEp2YldselpTYzZJRkJzWldGelpTQjFjMlVnZEdobElDZHVaWGNuSUc5d1pYSmhkRzl5TENCMGFHbHpJRzlpYW1WamRDQmpiMjV6ZEhKMVkzUnZjaUJqWVc1dWIzUWdZbVVnWTJGc2JHVmtJR0Z6SUdFZ1puVnVZM1JwYjI0dVhDSXBmV1oxYm1OMGFXOXVJRXdvZENsN2RHaHBjMXR5ZEYwOVR5Z3BMSFJvYVhNdVgzSmxjM1ZzZEQxMGFHbHpMbDl6ZEdGMFpUMTJiMmxrSURBc2RHaHBjeTVmYzNWaWMyTnlhV0psY25NOVcxMHNjQ0U5UFhRbUppaGNJbVoxYm1OMGFXOXVYQ0loUFhSNWNHVnZaaUIwSmlaRUtDa3NkR2hwY3lCcGJuTjBZVzVqWlc5bUlFdy9ReWgwYUdsekxIUXBPa3NvS1NsOVpuVnVZM1JwYjI0Z1RpaDBMR1VwZTNSb2FYTXVYMmx1YzNSaGJtTmxRMjl1YzNSeWRXTjBiM0k5ZEN4MGFHbHpMbkJ5YjIxcGMyVTlibVYzSUhRb2NDa3NkR2hwY3k1d2NtOXRhWE5sVzNKMFhYeDhheWgwYUdsekxuQnliMjFwYzJVcExFRnljbUY1TG1selFYSnlZWGtvWlNrL0tIUm9hWE11WDJsdWNIVjBQV1VzZEdocGN5NXNaVzVuZEdnOVpTNXNaVzVuZEdnc2RHaHBjeTVmY21WdFlXbHVhVzVuUFdVdWJHVnVaM1JvTEhSb2FYTXVYM0psYzNWc2REMXVaWGNnUVhKeVlYa29kR2hwY3k1c1pXNW5kR2dwTERBOVBUMTBhR2x6TG14bGJtZDBhRDlUS0hSb2FYTXVjSEp2YldselpTeDBhR2x6TGw5eVpYTjFiSFFwT2loMGFHbHpMbXhsYm1kMGFEMTBhR2x6TG14bGJtZDBhSHg4TUN4MGFHbHpMbDlsYm5WdFpYSmhkR1VvS1N3d1BUMDlkR2hwY3k1ZmNtVnRZV2x1YVc1bkppWlRLSFJvYVhNdWNISnZiV2x6WlN4MGFHbHpMbDl5WlhOMWJIUXBLU2s2YWloMGFHbHpMbkJ5YjIxcGMyVXNWU2dwS1gxbWRXNWpkR2x2YmlCVktDbDdjbVYwZFhKdUlHNWxkeUJGY25KdmNpaGNJa0Z5Y21GNUlFMWxkR2h2WkhNZ2JYVnpkQ0JpWlNCd2NtOTJhV1JsWkNCaGJpQkJjbkpoZVZ3aUtYMW1kVzVqZEdsdmJpQlhLQ2w3ZG1GeUlIUTdhV1lvWENKMWJtUmxabWx1WldSY0lpRTlkSGx3Wlc5bUlHZHNiMkpoYkNsMFBXZHNiMkpoYkR0bGJITmxJR2xtS0Z3aWRXNWtaV1pwYm1Wa1hDSWhQWFI1Y0dWdlppQnpaV3htS1hROWMyVnNaanRsYkhObElIUnllWHQwUFVaMWJtTjBhVzl1S0Z3aWNtVjBkWEp1SUhSb2FYTmNJaWtvS1gxallYUmphQ2hsS1h0MGFISnZkeUJ1WlhjZ1JYSnliM0lvWENKd2IyeDVabWxzYkNCbVlXbHNaV1FnWW1WallYVnpaU0JuYkc5aVlXd2diMkpxWldOMElHbHpJSFZ1WVhaaGFXeGhZbXhsSUdsdUlIUm9hWE1nWlc1MmFYSnZibTFsYm5SY0lpbDlkbUZ5SUc0OWRDNVFjbTl0YVhObE95Z2hibng4WENKYmIySnFaV04wSUZCeWIyMXBjMlZkWENJaFBUMVBZbXBsWTNRdWNISnZkRzkwZVhCbExuUnZVM1J5YVc1bkxtTmhiR3dvYmk1eVpYTnZiSFpsS0NrcGZIeHVMbU5oYzNRcEppWW9kQzVRY205dGFYTmxQWEIwS1gxMllYSWdlanQ2UFVGeWNtRjVMbWx6UVhKeVlYay9RWEp5WVhrdWFYTkJjbkpoZVRwbWRXNWpkR2x2YmloMEtYdHlaWFIxY201Y0lsdHZZbXBsWTNRZ1FYSnlZWGxkWENJOVBUMVBZbXBsWTNRdWNISnZkRzkwZVhCbExuUnZVM1J5YVc1bkxtTmhiR3dvZENsOU8zWmhjaUJDTEVjc1NDeEpQWG9zU2owd0xGRTlablZ1WTNScGIyNG9kQ3hsS1h0MGRGdEtYVDEwTEhSMFcwb3JNVjA5WlN4S0t6MHlMREk5UFQxS0ppWW9SejlIS0dFcE9rZ29LU2w5TEZJOVhDSjFibVJsWm1sdVpXUmNJaUU5ZEhsd1pXOW1JSGRwYm1SdmR6OTNhVzVrYjNjNmRtOXBaQ0F3TEZZOVVueDhlMzBzV0QxV0xrMTFkR0YwYVc5dVQySnpaWEoyWlhKOGZGWXVWMlZpUzJsMFRYVjBZWFJwYjI1UFluTmxjblpsY2l4YVBWd2lkVzVrWldacGJtVmtYQ0k5UFhSNWNHVnZaaUJ6Wld4bUppWmNJblZ1WkdWbWFXNWxaRndpSVQxMGVYQmxiMllnY0hKdlkyVnpjeVltWENKYmIySnFaV04wSUhCeWIyTmxjM05kWENJOVBUMTdmUzUwYjFOMGNtbHVaeTVqWVd4c0tIQnliMk5sYzNNcExDUTlYQ0oxYm1SbFptbHVaV1JjSWlFOWRIbHdaVzltSUZWcGJuUTRRMnhoYlhCbFpFRnljbUY1SmlaY0luVnVaR1ZtYVc1bFpGd2lJVDEwZVhCbGIyWWdhVzF3YjNKMFUyTnlhWEIwY3lZbVhDSjFibVJsWm1sdVpXUmNJaUU5ZEhsd1pXOW1JRTFsYzNOaFoyVkRhR0Z1Ym1Wc0xIUjBQVzVsZHlCQmNuSmhlU2d4WlRNcE8wZzlXajl2S0NrNldEOXpLQ2s2SkQ5MUtDazZkbTlwWkNBd1BUMDlVaVltWENKbWRXNWpkR2x2Ymx3aVBUMTBlWEJsYjJZZ2NtVnhkV2x5WlQ5bUtDazZZeWdwTzNaaGNpQmxkRDFzTEc1MFBXZ3NjblE5VFdGMGFDNXlZVzVrYjIwb0tTNTBiMU4wY21sdVp5Z3pOaWt1YzNWaWMzUnlhVzVuS0RFMktTeHZkRDEyYjJsa0lEQXNhWFE5TVN4emREMHlMSFYwUFc1bGR5Qk5MR04wUFc1bGR5Qk5MR0YwUFRBc1puUTlXU3hzZEQxeExHaDBQVVlzY0hROVREdE1MbUZzYkQxbWRDeE1MbkpoWTJVOWJIUXNUQzV5WlhOdmJIWmxQVzUwTEV3dWNtVnFaV04wUFdoMExFd3VYM05sZEZOamFHVmtkV3hsY2oxdUxFd3VYM05sZEVGellYQTljaXhNTGw5aGMyRndQVkVzVEM1d2NtOTBiM1I1Y0dVOWUyTnZibk4wY25WamRHOXlPa3dzZEdobGJqcGxkQ3hjSW1OaGRHTm9YQ0k2Wm5WdVkzUnBiMjRvZENsN2NtVjBkWEp1SUhSb2FYTXVkR2hsYmlodWRXeHNMSFFwZlgwN2RtRnlJRjkwUFU0N1RpNXdjbTkwYjNSNWNHVXVYMlZ1ZFcxbGNtRjBaVDFtZFc1amRHbHZiaWdwZTJadmNpaDJZWElnZEQxMGFHbHpMbXhsYm1kMGFDeGxQWFJvYVhNdVgybHVjSFYwTEc0OU1EdDBhR2x6TGw5emRHRjBaVDA5UFc5MEppWjBQbTQ3YmlzcktYUm9hWE11WDJWaFkyaEZiblJ5ZVNobFcyNWRMRzRwZlN4T0xuQnliM1J2ZEhsd1pTNWZaV0ZqYUVWdWRISjVQV1oxYm1OMGFXOXVLSFFzWlNsN2RtRnlJRzQ5ZEdocGN5NWZhVzV6ZEdGdVkyVkRiMjV6ZEhKMVkzUnZjaXh5UFc0dWNtVnpiMngyWlR0cFppaHlQVDA5Ym5RcGUzWmhjaUJ2UFhZb2RDazdhV1lvYnowOVBXVjBKaVowTGw5emRHRjBaU0U5UFc5MEtYUm9hWE11WDNObGRIUnNaV1JCZENoMExsOXpkR0YwWlN4bExIUXVYM0psYzNWc2RDazdaV3h6WlNCcFppaGNJbVoxYm1OMGFXOXVYQ0loUFhSNWNHVnZaaUJ2S1hSb2FYTXVYM0psYldGcGJtbHVaeTB0TEhSb2FYTXVYM0psYzNWc2RGdGxYVDEwTzJWc2MyVWdhV1lvYmowOVBYQjBLWHQyWVhJZ2FUMXVaWGNnYmlod0tUdDNLR2tzZEN4dktTeDBhR2x6TGw5M2FXeHNVMlYwZEd4bFFYUW9hU3hsS1gxbGJITmxJSFJvYVhNdVgzZHBiR3hUWlhSMGJHVkJkQ2h1WlhjZ2JpaG1kVzVqZEdsdmJpaGxLWHRsS0hRcGZTa3NaU2w5Wld4elpTQjBhR2x6TGw5M2FXeHNVMlYwZEd4bFFYUW9jaWgwS1N4bEtYMHNUaTV3Y205MGIzUjVjR1V1WDNObGRIUnNaV1JCZEQxbWRXNWpkR2x2YmloMExHVXNiaWw3ZG1GeUlISTlkR2hwY3k1d2NtOXRhWE5sTzNJdVgzTjBZWFJsUFQwOWIzUW1KaWgwYUdsekxsOXlaVzFoYVc1cGJtY3RMU3gwUFQwOWMzUS9haWh5TEc0cE9uUm9hWE11WDNKbGMzVnNkRnRsWFQxdUtTd3dQVDA5ZEdocGN5NWZjbVZ0WVdsdWFXNW5KaVpUS0hJc2RHaHBjeTVmY21WemRXeDBLWDBzVGk1d2NtOTBiM1I1Y0dVdVgzZHBiR3hUWlhSMGJHVkJkRDFtZFc1amRHbHZiaWgwTEdVcGUzWmhjaUJ1UFhSb2FYTTdSU2gwTEhadmFXUWdNQ3htZFc1amRHbHZiaWgwS1h0dUxsOXpaWFIwYkdWa1FYUW9hWFFzWlN4MEtYMHNablZ1WTNScGIyNG9kQ2w3Ymk1ZmMyVjBkR3hsWkVGMEtITjBMR1VzZENsOUtYMDdkbUZ5SUdSMFBWY3NkblE5ZTFCeWIyMXBjMlU2Y0hRc2NHOXNlV1pwYkd3NlpIUjlPMXdpWm5WdVkzUnBiMjVjSWowOWRIbHdaVzltSUdSbFptbHVaU1ltWkdWbWFXNWxMbUZ0WkQ5a1pXWnBibVVvWm5WdVkzUnBiMjRvS1h0eVpYUjFjbTRnZG5SOUtUcGNJblZ1WkdWbWFXNWxaRndpSVQxMGVYQmxiMllnYlc5a2RXeGxKaVp0YjJSMWJHVXVaWGh3YjNKMGN6OXRiMlIxYkdVdVpYaHdiM0owY3oxMmREcGNJblZ1WkdWbWFXNWxaRndpSVQxMGVYQmxiMllnZEdocGN5WW1LSFJvYVhNdVJWTTJVSEp2YldselpUMTJkQ2tzWkhRb0tYMHBMbU5oYkd3b2RHaHBjeWs3SWwxOSIsImltcG9ydCAnLi4vbGliL2VzNi1wcm9taXNlLm1pbi5qcydcbmltcG9ydCBUZW1wbGF0ZXMgZnJvbSBcIi4uL1RlbXBsYXRlc1wiXG5pbXBvcnQgeyBnZXRKU09OLCByb3VuZCB9IGZyb20gXCIuLi9oZWxwZXJzXCJcbmltcG9ydCBBUEksIHsgZ2V0VGVhbXMsIGdldFRlYW1TdGF0cyB9IGZyb20gXCIuLi9BUElcIlxuXG5leHBvcnQgZnVuY3Rpb24gZXZlbnQoa2V5KSB7XG4gIFByb21pc2UuYWxsKFtcbiAgICBUZW1wbGF0ZXMuZ2V0KFwiZXZlbnRcIiksXG4gICAgZ2V0SlNPTihcInN0YXRzLWNvbmZpZy5qc29uXCIpXG4gIF0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgY29uc3QgW3RlbXBsYXRlLCBzdGF0c10gPSByZXM7XG4gICAgY29uc3QgJGNvbnRhaW5lciA9ICQoXCIjbWFpblwiKS5jbG9zZXN0KFwiLmNvbnRhaW5lclwiKTtcbiAgICBjb25zdCBjb250YWluZXJDbGFzcyA9ICRjb250YWluZXIuYXR0cihcImNsYXNzXCIpO1xuICAgICRjb250YWluZXIuYWRkQ2xhc3MoXCJ3aWRlXCIpO1xuICAgIGNvbnN0IHJhY3RpdmUgPSBuZXcgUmFjdGl2ZSh7XG4gICAgICB0ZW1wbGF0ZTogdGVtcGxhdGUsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGtleToga2V5LFxuICAgICAgICBzdGF0Q29uZmlnOiBzdGF0cyxcbiAgICAgICAgbG9hZGluZzogdHJ1ZSxcbiAgICAgICAgdGVhbXM6IFtdLFxuICAgICAgICByb3VuZDogcm91bmQsXG4gICAgICAgIHN0YXRDb2xvcih2YWx1ZSwgc3RhdCkge1xuICAgICAgICAgIGNvbnN0IHZhbHVlID0gcGFyc2VGbG9hdCh2YWx1ZSk7XG4gICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHN0YXQucHJvZ3Jlc3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICgoIXN0YXQucHJvZ3Jlc3NbaV0ubWluIHx8IHZhbHVlID49IHN0YXQucHJvZ3Jlc3NbaV0ubWluKSAmJiAoIXN0YXQucHJvZ3Jlc3NbaV0ubWF4IHx8IHZhbHVlIDw9IHN0YXQucHJvZ3Jlc3NbaV0ubWF4KSkge1xuICAgICAgICAgICAgICByZXR1cm4gc3RhdC5wcm9ncmVzc1tpXS5jbGFzcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBjb21wdXRlZDoge1xuICAgICAgICBtb2JpbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiAkKHdpbmRvdykud2lkdGgoKSA8IDkwMDtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9uZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICAgICRjb250YWluZXIuYXR0cihcImNsYXNzXCIsIGNvbnRhaW5lckNsYXNzKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGdldFRlYW1zKEFQSSwga2V5KS50aGVuKGZ1bmN0aW9uKHRlYW1zKSB7XG4gICAgICByYWN0aXZlLnNldCh7XG4gICAgICAgIHRlYW1zOiB0ZWFtcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICByZXR1cm4gYS50ZWFtX251bWJlciAtIGIudGVhbV9udW1iZXJcbiAgICAgICAgfSksXG4gICAgICAgIGxvYWRpbmc6IGZhbHNlXG4gICAgICB9KTtcbiAgICAgIFNvcnRhYmxlLmluaXQoKTtcbiAgICB9KTtcbiAgfSk7XG59XG4iLCJpbXBvcnQgJy4uL2xpYi9lczYtcHJvbWlzZS5taW4uanMnXG5pbXBvcnQgVGVtcGxhdGVzIGZyb20gXCIuLi9UZW1wbGF0ZXNcIlxuaW1wb3J0IHsgZ2V0SlNPTiwgcm91bmQgfSBmcm9tIFwiLi4vaGVscGVyc1wiXG5pbXBvcnQgQVBJLCB7IGdldFRlYW1TdGF0cyB9IGZyb20gXCIuLi9BUElcIlxuXG5leHBvcnQgZnVuY3Rpb24gdGVhbShrZXkpIHtcbiAgUHJvbWlzZS5hbGwoW1xuICAgIFRlbXBsYXRlcy5nZXQoXCJ0ZWFtXCIpLFxuICAgIGdldEpTT04oXCJzdGF0cy1jb25maWcuanNvblwiKSxcbiAgICBnZXRUZWFtU3RhdHMoQVBJLCBrZXkpLFxuICBdKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgIGNvbnN0IFt0ZW1wbGF0ZSwgc3RhdHMsIHRlYW1EYXRhXSA9IHJlcztcbiAgICBjb25zdCByYWN0aXZlID0gbmV3IFJhY3RpdmUoe1xuICAgICAgdGVtcGxhdGU6IHRlbXBsYXRlLFxuICAgICAgZGF0YToge1xuICAgICAgICBzdGF0czogc3RhdHMsXG4gICAgICAgIHN0YXRLZXlzOiBbJ2NhbGNzJywgJ2dvYWxzJywgJ2RlZmVuc2VzJ10sXG4gICAgICAgIGtleToga2V5LFxuICAgICAgICB0ZWFtOiB0ZWFtRGF0YSxcbiAgICAgICAgbW9iaWxlOiAkKHdpbmRvdykud2lkdGgoKSA8IDkwMCxcbiAgICAgICAgcm91bmQ6IHJvdW5kLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfSkuY2F0Y2goY29uc29sZS5lcnJvci5iaW5kKGNvbnNvbGUpKTtcbn1cbiJdfQ==
