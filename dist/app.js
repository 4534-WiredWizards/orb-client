(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

var Pages = _interopRequireWildcard(require("./Pages"));

var Components = _interopRequire(require("./Components"));

var documentReady = require("./helpers").documentReady;

require("./lib/es6-promise.min.js");

var el = "#main";

var router = Router({
  "/login": Pages.login,
  "/a": {
    "/team/:key": Pages.team,
    "/event/:key": Pages.event,
    "/event/:key/matches": Pages.eventMatches,
    "/events": Pages.events
  }
}).configure({
  html5history: false,
  before: [],
  after: [],
  recurse: "forward"
});

Promise.all([documentReady, Components.load()]).then(function (res) {
  var _res = _slicedToArray(res, 2);

  var Components = _res[1];

  Ractive = Ractive.extend({
    el: el,
    components: Components.components,
    before: [function () {
      $(window).scrollTop(0);
    }]
  });
  router.init();
  if (!router.getRoute().filter(Boolean).length) {
    if (localStorage.getItem("token")) {
      router.setRoute("/a/events");
    } else {
      router.setRoute("/login");
    }
  }
});

},{"./Components":4,"./Pages":6,"./helpers":9,"./lib/es6-promise.min.js":10}],2:[function(require,module,exports){
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

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

exports.getTeamStats = getTeamStats;
exports.getTeams = getTeams;
exports.generateToken = generateToken;
Object.defineProperty(exports, "__esModule", {
  value: true
});

require("./lib/es6-promise.min.js");

var cacheable = _interopRequire(require("./cacheable"));

var extend = require("./helpers").extend;

exports["default"] = cacheable(function (key) {
  var key = key.replace(/^\//, "").replace(/\/$/, "");
  var url = "http://orb.scoutfrc.io/" + key + "/";
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
var TBA = cacheable(function (path) {
  var url = "http://www.thebluealliance.com/api/v2/" + path;
  return new Promise(function (resolve, reject) {
    return $.ajax({
      method: "get",
      dataType: "json",
      data: {
        "X-TBA-App-Id": "frc4534:orb:client"
      },
      url: url,
      error: reject
    }).then(resolve);
  })["catch"](function (res) {
    console.error("API Request Unsuccessful", url, res);
    return res;
  });
});

exports.TBA = TBA;

function getTeamStats(API, key, team) {
  var promises = [API.get("team/" + key + "/defense"), API.get("team/" + key + "/goals"), API.get("team/" + key + "/score")];
  if (typeof team == "object" && team.team_number == team) {
    promises.push(function (resolve, reject) {
      return resolve(team);
    });
  } else {
    promises.push(API.get("team/" + key));
  }
  return Promise.all(promises).then(function (res) {
    var _res = _slicedToArray(res, 4);

    var defenses = _res[0];
    var goals = _res[1];
    var score = _res[2];
    var team = _res[3];

    return extend(team, {
      stats: {
        calcs: {
          predicted_rp: 0,
          score: score
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

function generateToken(team, name) {
  var token = team + "." + md5(name);
  localStorage.setItem("token", token);
  return token;
}

},{"./cacheable":8,"./helpers":9,"./lib/es6-promise.min.js":10}],4:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

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

},{"./Templates":7,"./lib/es6-promise.min.js":10}],5:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

require("./lib/es6-promise.min.js");

var cacheable = _interopRequire(require("./cacheable"));

module.exports = cacheable(function () {
  return new Promise(function (resolve, reject) {
    if (localStorage.getItem("token")) {
      resolve();
    } else {
      location.hash = "#/login";
      reject();
    }
  });
});

},{"./cacheable":8,"./lib/es6-promise.min.js":10}],6:[function(require,module,exports){
"use strict";

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };

var _defaults = function (obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; };

Object.defineProperty(exports, "__esModule", {
  value: true
});

_defaults(exports, _interopRequireWildcard(require("./pages/team")));

_defaults(exports, _interopRequireWildcard(require("./pages/event")));

_defaults(exports, _interopRequireWildcard(require("./pages/login")));

_defaults(exports, _interopRequireWildcard(require("./pages/events")));

_defaults(exports, _interopRequireWildcard(require("./pages/eventMatches")));

},{"./pages/event":11,"./pages/eventMatches":12,"./pages/events":13,"./pages/login":14,"./pages/team":15}],7:[function(require,module,exports){
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

},{"./cacheable":8,"./lib/es6-promise.min.js":10}],8:[function(require,module,exports){
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

},{"./cacheable":8,"./lib/es6-promise.min.js":10}],9:[function(require,module,exports){
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

},{"./lib/es6-promise.min.js":10}],10:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL1NhbXVlbC9Eb2N1bWVudHMvb3JiLWNsaWVudC9zcmMvbGliL2VzNi1wcm9taXNlLm1pbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLENBQUMsWUFBVTtBQUFDLGNBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUM7QUFBQyxXQUFNLFVBQVUsSUFBRSxPQUFPLENBQUMsSUFBRSxRQUFRLElBQUUsT0FBTyxDQUFDLElBQUUsSUFBSSxLQUFHLENBQUMsQ0FBQTtHQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBQztBQUFDLFdBQU0sVUFBVSxJQUFFLE9BQU8sQ0FBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDO0FBQUMsS0FBQyxHQUFDLENBQUMsQ0FBQTtHQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBQztBQUFDLEtBQUMsR0FBQyxDQUFDLENBQUE7R0FBQyxTQUFTLENBQUMsR0FBRTtBQUFDLFdBQU8sWUFBVTtBQUFDLGFBQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLEdBQUU7QUFBQyxXQUFPLFlBQVU7QUFBQyxPQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLEdBQUU7QUFBQyxRQUFJLENBQUMsR0FBQyxDQUFDO1FBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUFDLENBQUMsR0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLFlBQVU7QUFBQyxPQUFDLENBQUMsSUFBSSxHQUFDLENBQUMsR0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUE7S0FBQyxDQUFBLENBQUE7R0FBQyxTQUFTLENBQUMsR0FBRTtBQUFDLFFBQUksQ0FBQyxHQUFDLElBQUksY0FBYyxFQUFBLENBQUMsUUFBTyxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBQyxDQUFDLEVBQUMsWUFBVTtBQUFDLE9BQUMsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsQ0FBQSxDQUFBO0dBQUMsU0FBUyxDQUFDLEdBQUU7QUFBQyxXQUFPLFlBQVU7QUFBQyxnQkFBVSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLENBQUE7R0FBQyxTQUFTLENBQUMsR0FBRTtBQUFDLFNBQUksSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxJQUFFLENBQUMsRUFBQztBQUFDLFVBQUksQ0FBQyxHQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7VUFBQyxDQUFDLEdBQUMsRUFBRSxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFDLEtBQUssQ0FBQyxFQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEdBQUMsS0FBSyxDQUFDLENBQUE7S0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLEdBQUU7QUFBQyxRQUFHO0FBQUMsVUFBSSxDQUFDLEdBQUMsT0FBTztVQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBTyxDQUFDLEdBQUMsQ0FBQyxDQUFDLFNBQVMsSUFBRSxDQUFDLENBQUMsWUFBWSxFQUFDLENBQUMsRUFBRSxDQUFBLENBQUE7S0FBQyxDQUFBLE9BQU0sQ0FBQyxFQUFDO0FBQUMsYUFBTyxDQUFDLEVBQUUsQ0FBQTtLQUFDO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLFFBQUksQ0FBQyxHQUFDLElBQUk7UUFBQyxDQUFDLEdBQUMsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFHLENBQUMsRUFBQztBQUFDLFVBQUksQ0FBQyxHQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVU7QUFBQyxTQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFBO09BQUMsQ0FBQyxDQUFBO0tBQUMsTUFBSyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUE7R0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBRyxDQUFDLElBQUUsUUFBUSxJQUFFLE9BQU8sQ0FBQyxJQUFFLENBQUMsQ0FBQyxXQUFXLEtBQUcsQ0FBQztBQUFDLGFBQU8sQ0FBQyxDQUFDO0tBQUEsSUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBTyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQSxDQUFBO0dBQUMsU0FBUyxDQUFDLEdBQUUsRUFBRSxTQUFTLENBQUMsR0FBRTtBQUFDLFdBQU8sSUFBSSxTQUFTLENBQUMsMENBQTBDLENBQUMsQ0FBQTtHQUFDLFNBQVMsQ0FBQyxHQUFFO0FBQUMsV0FBTyxJQUFJLFNBQVMsQ0FBQyxzREFBc0QsQ0FBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBRztBQUFDLGFBQU8sQ0FBQyxDQUFDLElBQUksQ0FBQTtLQUFDLENBQUEsT0FBTSxDQUFDLEVBQUM7QUFBQyxjQUFPLEVBQUUsQ0FBQyxLQUFLLEdBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQSxDQUFBO0tBQUM7R0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxRQUFHO0FBQUMsT0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsQ0FBQSxPQUFNLENBQUMsRUFBQztBQUFDLGFBQU8sQ0FBQyxDQUFBO0tBQUM7R0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLEtBQUMsQ0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFVBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQztVQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxVQUFTLENBQUMsRUFBQztBQUFDLFNBQUMsS0FBRyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxLQUFHLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUEsQUFBQyxDQUFBO09BQUMsRUFBQyxVQUFTLENBQUMsRUFBQztBQUFDLFNBQUMsS0FBRyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQSxBQUFDLENBQUE7T0FBQyxFQUFDLFVBQVUsSUFBRSxDQUFDLENBQUMsTUFBTSxJQUFFLGtCQUFrQixDQUFBLEFBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFFLENBQUMsS0FBRyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQSxBQUFDLENBQUE7S0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLEtBQUMsQ0FBQyxNQUFNLEtBQUcsRUFBRSxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUcsRUFBRSxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsS0FBSyxDQUFDLEVBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxPQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsRUFBQyxVQUFTLENBQUMsRUFBQztBQUFDLE9BQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxDQUFDLENBQUE7R0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLEtBQUMsQ0FBQyxXQUFXLEtBQUcsQ0FBQyxDQUFDLFdBQVcsSUFBRSxDQUFDLEtBQUcsRUFBRSxJQUFFLFdBQVcsQ0FBQyxPQUFPLEtBQUcsRUFBRSxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxLQUFHLEVBQUUsR0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBQyxLQUFLLENBQUMsS0FBRyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxLQUFDLEtBQUcsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBQztBQUFDLEtBQUMsQ0FBQyxRQUFRLElBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLEtBQUMsQ0FBQyxNQUFNLEtBQUcsRUFBRSxLQUFHLENBQUMsQ0FBQyxPQUFPLEdBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUMsRUFBRSxFQUFDLENBQUMsS0FBRyxDQUFDLENBQUMsWUFBWSxDQUFDLE1BQU0sSUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFBLEFBQUMsQ0FBQTtHQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxLQUFDLENBQUMsTUFBTSxLQUFHLEVBQUUsS0FBRyxDQUFDLENBQUMsTUFBTSxHQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsT0FBTyxHQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFBLEFBQUMsQ0FBQTtHQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLFFBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQyxZQUFZO1FBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsR0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEtBQUcsQ0FBQyxJQUFFLENBQUMsQ0FBQyxNQUFNLElBQUUsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBQztBQUFDLFFBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQyxZQUFZO1FBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBRyxDQUFDLEtBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBQztBQUFDLFdBQUksSUFBSSxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsT0FBTyxFQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUMsQ0FBQyxJQUFFLENBQUMsRUFBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQTtLQUFDO0dBQUMsU0FBUyxDQUFDLEdBQUU7QUFBQyxRQUFJLENBQUMsS0FBSyxHQUFDLElBQUksQ0FBQTtHQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxRQUFHO0FBQUMsYUFBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxDQUFBLE9BQU0sQ0FBQyxFQUFDO0FBQUMsY0FBTyxFQUFFLENBQUMsS0FBSyxHQUFDLENBQUMsRUFBQyxFQUFFLENBQUEsQ0FBQTtLQUFDO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDO1FBQUMsQ0FBQztRQUFDLENBQUM7UUFBQyxDQUFDO1FBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLENBQUMsRUFBQztBQUFDLFdBQUcsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxLQUFHLEVBQUUsSUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQSxHQUFFLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEtBQUcsQ0FBQyxDQUFBO0FBQUMsZUFBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtPQUFBO0tBQUMsTUFBSyxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFHLEVBQUUsS0FBRyxDQUFDLElBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxLQUFHLEVBQUUsR0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsS0FBRyxFQUFFLElBQUUsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQSxBQUFDLENBQUE7R0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBRztBQUFDLE9BQUMsQ0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFNBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUE7T0FBQyxFQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsU0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtPQUFDLENBQUMsQ0FBQTtLQUFDLENBQUEsT0FBTSxDQUFDLEVBQUM7QUFBQyxPQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUM7R0FBQyxTQUFTLENBQUMsR0FBRTtBQUFDLFdBQU8sRUFBRSxFQUFFLENBQUE7R0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUM7QUFBQyxLQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsRUFBRSxFQUFFLEVBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBQyxLQUFLLENBQUMsRUFBQyxDQUFDLENBQUMsT0FBTyxHQUFDLEtBQUssQ0FBQyxFQUFDLENBQUMsQ0FBQyxZQUFZLEdBQUMsRUFBRSxDQUFBO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDO0FBQUMsV0FBTyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFBO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLFVBQVMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLFdBQUksSUFBSSxDQUFDLEdBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBQyxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsR0FBQyxVQUFTLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxPQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsaUNBQWlDLENBQUMsQ0FBQyxDQUFBO0tBQUMsQ0FBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsSUFBSTtRQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFBLENBQUE7R0FBQyxTQUFTLENBQUMsR0FBRTtBQUFDLFVBQU0sSUFBSSxTQUFTLENBQUMsb0ZBQW9GLENBQUMsQ0FBQTtHQUFDLFNBQVMsQ0FBQyxHQUFFO0FBQUMsVUFBTSxJQUFJLFNBQVMsQ0FBQyx1SEFBdUgsQ0FBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsRUFBRSxFQUFDLElBQUksQ0FBQyxPQUFPLEdBQUMsSUFBSSxDQUFDLE1BQU0sR0FBQyxLQUFLLENBQUMsRUFBQyxJQUFJLENBQUMsWUFBWSxHQUFDLEVBQUUsRUFBQyxDQUFDLEtBQUcsQ0FBQyxLQUFHLFVBQVUsSUFBRSxPQUFPLENBQUMsSUFBRSxDQUFDLEVBQUUsRUFBQyxJQUFJLFlBQVksQ0FBQyxHQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUEsQUFBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLFFBQUksQ0FBQyxvQkFBb0IsR0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLE9BQU8sR0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxJQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBRSxJQUFJLENBQUMsTUFBTSxHQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUMsSUFBSSxDQUFDLFVBQVUsR0FBQyxDQUFDLENBQUMsTUFBTSxFQUFDLElBQUksQ0FBQyxPQUFPLEdBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFDLENBQUMsS0FBRyxJQUFJLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBRSxJQUFJLENBQUMsTUFBTSxHQUFDLElBQUksQ0FBQyxNQUFNLElBQUUsQ0FBQyxFQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBQyxDQUFDLEtBQUcsSUFBSSxDQUFDLFVBQVUsSUFBRSxDQUFDLENBQUMs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LENBQUM7TUFBQyxFQUFFLEdBQUMsS0FBSyxDQUFDO01BQUMsRUFBRSxHQUFDLENBQUM7TUFBQyxFQUFFLEdBQUMsQ0FBQztNQUFDLEVBQUUsR0FBQyxJQUFJLENBQUMsRUFBQTtNQUFDLEVBQUUsR0FBQyxJQUFJLENBQUMsRUFBQTtNQUFDLEVBQUUsR0FBQyxDQUFDO01BQUMsRUFBRSxHQUFDLENBQUM7TUFBQyxFQUFFLEdBQUMsQ0FBQztNQUFDLEVBQUUsR0FBQyxDQUFDO01BQUMsRUFBRSxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsSUFBSSxHQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsT0FBTyxHQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsTUFBTSxHQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsYUFBYSxHQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsUUFBUSxHQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsS0FBSyxHQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsU0FBUyxHQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxJQUFJLEVBQUMsRUFBRSxFQUFDLE9BQU8sRUFBQyxnQkFBUyxDQUFDLEVBQUM7QUFBQyxhQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsRUFBQyxDQUFDLElBQUksRUFBRSxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBQyxZQUFVO0FBQUMsU0FBSSxJQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsTUFBTSxFQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsTUFBTSxFQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLE1BQU0sS0FBRyxFQUFFLElBQUUsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLEVBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUMsVUFBUyxDQUFDLEVBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLG9CQUFvQjtRQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUcsQ0FBQyxLQUFHLEVBQUUsRUFBQztBQUFDLFVBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLENBQUMsS0FBRyxFQUFFLElBQUUsQ0FBQyxDQUFDLE1BQU0sS0FBRyxFQUFFLEVBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxJQUFHLFVBQVUsSUFBRSxPQUFPLENBQUMsRUFBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsS0FBSyxJQUFHLENBQUMsS0FBRyxFQUFFLEVBQUM7QUFBQyxZQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtPQUFDLE1BQUssSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFNBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtPQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLE1BQUssSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUE7R0FBQyxFQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFDLFVBQVMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUcsRUFBRSxLQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBQyxDQUFDLEtBQUcsRUFBRSxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUEsQUFBQyxFQUFDLENBQUMsS0FBRyxJQUFJLENBQUMsVUFBVSxJQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0dBQUMsRUFBQyxDQUFDLENBQUMsU0FBUyxDQUFDLGFBQWEsR0FBQyxVQUFTLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxLQUFLLENBQUMsRUFBQyxVQUFTLENBQUMsRUFBQztBQUFDLE9BQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLEVBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxPQUFDLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLElBQUksRUFBRSxHQUFDLENBQUM7TUFBQyxFQUFFLEdBQUMsRUFBQyxPQUFPLEVBQUMsRUFBRSxFQUFDLFFBQVEsRUFBQyxFQUFFLEVBQUMsQ0FBQyxVQUFVLElBQUUsT0FBTyxNQUFNLElBQUUsTUFBTSxDQUFDLEdBQUcsR0FBQyxNQUFNLENBQUMsWUFBVTtBQUFDLFdBQU8sRUFBRSxDQUFBO0dBQUMsQ0FBQyxHQUFDLFdBQVcsSUFBRSxPQUFPLE1BQU0sSUFBRSxNQUFNLENBQUMsT0FBTyxHQUFDLE1BQU0sQ0FBQyxPQUFPLEdBQUMsRUFBRSxHQUFDLFdBQVcsSUFBRSxPQUFPLElBQUksS0FBRyxJQUFJLENBQUMsVUFBVSxHQUFDLEVBQUUsQ0FBQSxBQUFDLEVBQUMsRUFBRSxFQUFFLENBQUE7Q0FBQyxDQUFBLENBQUUsSUFBSSxXQUFNLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIi8qIVxyXG4gKiBAb3ZlcnZpZXcgZXM2LXByb21pc2UgLSBhIHRpbnkgaW1wbGVtZW50YXRpb24gb2YgUHJvbWlzZXMvQSsuXHJcbiAqIEBjb3B5cmlnaHQgQ29weXJpZ2h0IChjKSAyMDE0IFllaHVkYSBLYXR6LCBUb20gRGFsZSwgU3RlZmFuIFBlbm5lciBhbmQgY29udHJpYnV0b3JzIChDb252ZXJzaW9uIHRvIEVTNiBBUEkgYnkgSmFrZSBBcmNoaWJhbGQpXHJcbiAqIEBsaWNlbnNlICAgTGljZW5zZWQgdW5kZXIgTUlUIGxpY2Vuc2VcclxuICogICAgICAgICAgICBTZWUgaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2pha2VhcmNoaWJhbGQvZXM2LXByb21pc2UvbWFzdGVyL0xJQ0VOU0VcclxuICogQHZlcnNpb24gICAzLjIuMVxyXG4gKi9cclxuXHJcbihmdW5jdGlvbigpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHQodCl7cmV0dXJuXCJmdW5jdGlvblwiPT10eXBlb2YgdHx8XCJvYmplY3RcIj09dHlwZW9mIHQmJm51bGwhPT10fWZ1bmN0aW9uIGUodCl7cmV0dXJuXCJmdW5jdGlvblwiPT10eXBlb2YgdH1mdW5jdGlvbiBuKHQpe0c9dH1mdW5jdGlvbiByKHQpe1E9dH1mdW5jdGlvbiBvKCl7cmV0dXJuIGZ1bmN0aW9uKCl7cHJvY2Vzcy5uZXh0VGljayhhKX19ZnVuY3Rpb24gaSgpe3JldHVybiBmdW5jdGlvbigpe0IoYSl9fWZ1bmN0aW9uIHMoKXt2YXIgdD0wLGU9bmV3IFgoYSksbj1kb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIlwiKTtyZXR1cm4gZS5vYnNlcnZlKG4se2NoYXJhY3RlckRhdGE6ITB9KSxmdW5jdGlvbigpe24uZGF0YT10PSsrdCUyfX1mdW5jdGlvbiB1KCl7dmFyIHQ9bmV3IE1lc3NhZ2VDaGFubmVsO3JldHVybiB0LnBvcnQxLm9ubWVzc2FnZT1hLGZ1bmN0aW9uKCl7dC5wb3J0Mi5wb3N0TWVzc2FnZSgwKX19ZnVuY3Rpb24gYygpe3JldHVybiBmdW5jdGlvbigpe3NldFRpbWVvdXQoYSwxKX19ZnVuY3Rpb24gYSgpe2Zvcih2YXIgdD0wO0o+dDt0Kz0yKXt2YXIgZT10dFt0XSxuPXR0W3QrMV07ZShuKSx0dFt0XT12b2lkIDAsdHRbdCsxXT12b2lkIDB9Sj0wfWZ1bmN0aW9uIGYoKXt0cnl7dmFyIHQ9cmVxdWlyZSxlPXQoXCJ2ZXJ0eFwiKTtyZXR1cm4gQj1lLnJ1bk9uTG9vcHx8ZS5ydW5PbkNvbnRleHQsaSgpfWNhdGNoKG4pe3JldHVybiBjKCl9fWZ1bmN0aW9uIGwodCxlKXt2YXIgbj10aGlzLHI9bmV3IHRoaXMuY29uc3RydWN0b3IocCk7dm9pZCAwPT09cltydF0mJmsocik7dmFyIG89bi5fc3RhdGU7aWYobyl7dmFyIGk9YXJndW1lbnRzW28tMV07UShmdW5jdGlvbigpe3gobyxyLGksbi5fcmVzdWx0KX0pfWVsc2UgRShuLHIsdCxlKTtyZXR1cm4gcn1mdW5jdGlvbiBoKHQpe3ZhciBlPXRoaXM7aWYodCYmXCJvYmplY3RcIj09dHlwZW9mIHQmJnQuY29uc3RydWN0b3I9PT1lKXJldHVybiB0O3ZhciBuPW5ldyBlKHApO3JldHVybiBnKG4sdCksbn1mdW5jdGlvbiBwKCl7fWZ1bmN0aW9uIF8oKXtyZXR1cm4gbmV3IFR5cGVFcnJvcihcIllvdSBjYW5ub3QgcmVzb2x2ZSBhIHByb21pc2Ugd2l0aCBpdHNlbGZcIil9ZnVuY3Rpb24gZCgpe3JldHVybiBuZXcgVHlwZUVycm9yKFwiQSBwcm9taXNlcyBjYWxsYmFjayBjYW5ub3QgcmV0dXJuIHRoYXQgc2FtZSBwcm9taXNlLlwiKX1mdW5jdGlvbiB2KHQpe3RyeXtyZXR1cm4gdC50aGVufWNhdGNoKGUpe3JldHVybiB1dC5lcnJvcj1lLHV0fX1mdW5jdGlvbiB5KHQsZSxuLHIpe3RyeXt0LmNhbGwoZSxuLHIpfWNhdGNoKG8pe3JldHVybiBvfX1mdW5jdGlvbiBtKHQsZSxuKXtRKGZ1bmN0aW9uKHQpe3ZhciByPSExLG89eShuLGUsZnVuY3Rpb24obil7cnx8KHI9ITAsZSE9PW4/Zyh0LG4pOlModCxuKSl9LGZ1bmN0aW9uKGUpe3J8fChyPSEwLGoodCxlKSl9LFwiU2V0dGxlOiBcIisodC5fbGFiZWx8fFwiIHVua25vd24gcHJvbWlzZVwiKSk7IXImJm8mJihyPSEwLGoodCxvKSl9LHQpfWZ1bmN0aW9uIGIodCxlKXtlLl9zdGF0ZT09PWl0P1ModCxlLl9yZXN1bHQpOmUuX3N0YXRlPT09c3Q/aih0LGUuX3Jlc3VsdCk6RShlLHZvaWQgMCxmdW5jdGlvbihlKXtnKHQsZSl9LGZ1bmN0aW9uKGUpe2oodCxlKX0pfWZ1bmN0aW9uIHcodCxuLHIpe24uY29uc3RydWN0b3I9PT10LmNvbnN0cnVjdG9yJiZyPT09ZXQmJmNvbnN0cnVjdG9yLnJlc29sdmU9PT1udD9iKHQsbik6cj09PXV0P2oodCx1dC5lcnJvcik6dm9pZCAwPT09cj9TKHQsbik6ZShyKT9tKHQsbixyKTpTKHQsbil9ZnVuY3Rpb24gZyhlLG4pe2U9PT1uP2ooZSxfKCkpOnQobik/dyhlLG4sdihuKSk6UyhlLG4pfWZ1bmN0aW9uIEEodCl7dC5fb25lcnJvciYmdC5fb25lcnJvcih0Ll9yZXN1bHQpLFQodCl9ZnVuY3Rpb24gUyh0LGUpe3QuX3N0YXRlPT09b3QmJih0Ll9yZXN1bHQ9ZSx0Ll9zdGF0ZT1pdCwwIT09dC5fc3Vic2NyaWJlcnMubGVuZ3RoJiZRKFQsdCkpfWZ1bmN0aW9uIGoodCxlKXt0Ll9zdGF0ZT09PW90JiYodC5fc3RhdGU9c3QsdC5fcmVzdWx0PWUsUShBLHQpKX1mdW5jdGlvbiBFKHQsZSxuLHIpe3ZhciBvPXQuX3N1YnNjcmliZXJzLGk9by5sZW5ndGg7dC5fb25lcnJvcj1udWxsLG9baV09ZSxvW2kraXRdPW4sb1tpK3N0XT1yLDA9PT1pJiZ0Ll9zdGF0ZSYmUShULHQpfWZ1bmN0aW9uIFQodCl7dmFyIGU9dC5fc3Vic2NyaWJlcnMsbj10Ll9zdGF0ZTtpZigwIT09ZS5sZW5ndGgpe2Zvcih2YXIgcixvLGk9dC5fcmVzdWx0LHM9MDtzPGUubGVuZ3RoO3MrPTMpcj1lW3NdLG89ZVtzK25dLHI/eChuLHIsbyxpKTpvKGkpO3QuX3N1YnNjcmliZXJzLmxlbmd0aD0wfX1mdW5jdGlvbiBNKCl7dGhpcy5lcnJvcj1udWxsfWZ1bmN0aW9uIFAodCxlKXt0cnl7cmV0dXJuIHQoZSl9Y2F0Y2gobil7cmV0dXJuIGN0LmVycm9yPW4sY3R9fWZ1bmN0aW9uIHgodCxuLHIsbyl7dmFyIGkscyx1LGMsYT1lKHIpO2lmKGEpe2lmKGk9UChyLG8pLGk9PT1jdD8oYz0hMCxzPWkuZXJyb3IsaT1udWxsKTp1PSEwLG49PT1pKXJldHVybiB2b2lkIGoobixkKCkpfWVsc2UgaT1vLHU9ITA7bi5fc3RhdGUhPT1vdHx8KGEmJnU/ZyhuLGkpOmM/aihuLHMpOnQ9PT1pdD9TKG4saSk6dD09PXN0JiZqKG4saSkpfWZ1bmN0aW9uIEModCxlKXt0cnl7ZShmdW5jdGlvbihlKXtnKHQsZSl9LGZ1bmN0aW9uKGUpe2oodCxlKX0pfWNhdGNoKG4pe2oodCxuKX19ZnVuY3Rpb24gTygpe3JldHVybiBhdCsrfWZ1bmN0aW9uIGsodCl7dFtydF09YXQrKyx0Ll9zdGF0ZT12b2lkIDAsdC5fcmVzdWx0PXZvaWQgMCx0Ll9zdWJzY3JpYmVycz1bXX1mdW5jdGlvbiBZKHQpe3JldHVybiBuZXcgX3QodGhpcyx0KS5wcm9taXNlfWZ1bmN0aW9uIHEodCl7dmFyIGU9dGhpcztyZXR1cm4gbmV3IGUoSSh0KT9mdW5jdGlvbihuLHIpe2Zvcih2YXIgbz10Lmxlbmd0aCxpPTA7bz5pO2krKyllLnJlc29sdmUodFtpXSkudGhlbihuLHIpfTpmdW5jdGlvbih0LGUpe2UobmV3IFR5cGVFcnJvcihcIllvdSBtdXN0IHBhc3MgYW4gYXJyYXkgdG8gcmFjZS5cIikpfSl9ZnVuY3Rpb24gRih0KXt2YXIgZT10aGlzLG49bmV3IGUocCk7cmV0dXJuIGoobix0KSxufWZ1bmN0aW9uIEQoKXt0aHJvdyBuZXcgVHlwZUVycm9yKFwiWW91IG11c3QgcGFzcyBhIHJlc29sdmVyIGZ1bmN0aW9uIGFzIHRoZSBmaXJzdCBhcmd1bWVudCB0byB0aGUgcHJvbWlzZSBjb25zdHJ1Y3RvclwiKX1mdW5jdGlvbiBLKCl7dGhyb3cgbmV3IFR5cGVFcnJvcihcIkZhaWxlZCB0byBjb25zdHJ1Y3QgJ1Byb21pc2UnOiBQbGVhc2UgdXNlIHRoZSAnbmV3JyBvcGVyYXRvciwgdGhpcyBvYmplY3QgY29uc3RydWN0b3IgY2Fubm90IGJlIGNhbGxlZCBhcyBhIGZ1bmN0aW9uLlwiKX1mdW5jdGlvbiBMKHQpe3RoaXNbcnRdPU8oKSx0aGlzLl9yZXN1bHQ9dGhpcy5fc3RhdGU9dm9pZCAwLHRoaXMuX3N1YnNjcmliZXJzPVtdLHAhPT10JiYoXCJmdW5jdGlvblwiIT10eXBlb2YgdCYmRCgpLHRoaXMgaW5zdGFuY2VvZiBMP0ModGhpcyx0KTpLKCkpfWZ1bmN0aW9uIE4odCxlKXt0aGlzLl9pbnN0YW5jZUNvbnN0cnVjdG9yPXQsdGhpcy5wcm9taXNlPW5ldyB0KHApLHRoaXMucHJvbWlzZVtydF18fGsodGhpcy5wcm9taXNlKSxBcnJheS5pc0FycmF5KGUpPyh0aGlzLl9pbnB1dD1lLHRoaXMubGVuZ3RoPWUubGVuZ3RoLHRoaXMuX3JlbWFpbmluZz1lLmxlbmd0aCx0aGlzLl9yZXN1bHQ9bmV3IEFycmF5KHRoaXMubGVuZ3RoKSwwPT09dGhpcy5sZW5ndGg/Uyh0aGlzLnByb21pc2UsdGhpcy5fcmVzdWx0KToodGhpcy5sZW5ndGg9dGhpcy5sZW5ndGh8fDAsdGhpcy5fZW51bWVyYXRlKCksMD09PXRoaXMuX3JlbWFpbmluZyYmUyh0aGlzLnByb21pc2UsdGhpcy5fcmVzdWx0KSkpOmoodGhpcy5wcm9taXNlLFUoKSl9ZnVuY3Rpb24gVSgpe3JldHVybiBuZXcgRXJyb3IoXCJBcnJheSBNZXRob2RzIG11c3QgYmUgcHJvdmlkZWQgYW4gQXJyYXlcIil9ZnVuY3Rpb24gVygpe3ZhciB0O2lmKFwidW5kZWZpbmVkXCIhPXR5cGVvZiBnbG9iYWwpdD1nbG9iYWw7ZWxzZSBpZihcInVuZGVmaW5lZFwiIT10eXBlb2Ygc2VsZil0PXNlbGY7ZWxzZSB0cnl7dD1GdW5jdGlvbihcInJldHVybiB0aGlzXCIpKCl9Y2F0Y2goZSl7dGhyb3cgbmV3IEVycm9yKFwicG9seWZpbGwgZmFpbGVkIGJlY2F1c2UgZ2xvYmFsIG9iamVjdCBpcyB1bmF2YWlsYWJsZSBpbiB0aGlzIGVudmlyb25tZW50XCIpfXZhciBuPXQuUHJvbWlzZTsoIW58fFwiW29iamVjdCBQcm9taXNlXVwiIT09T2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG4ucmVzb2x2ZSgpKXx8bi5jYXN0KSYmKHQuUHJvbWlzZT1wdCl9dmFyIHo7ej1BcnJheS5pc0FycmF5P0FycmF5LmlzQXJyYXk6ZnVuY3Rpb24odCl7cmV0dXJuXCJbb2JqZWN0IEFycmF5XVwiPT09T2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHQpfTt2YXIgQixHLEgsST16LEo9MCxRPWZ1bmN0aW9uKHQsZSl7dHRbSl09dCx0dFtKKzFdPWUsSis9MiwyPT09SiYmKEc/RyhhKTpIKCkpfSxSPVwidW5kZWZpbmVkXCIhPXR5cGVvZiB3aW5kb3c/d2luZG93OnZvaWQgMCxWPVJ8fHt9LFg9Vi5NdXRhdGlvbk9ic2VydmVyfHxWLldlYktpdE11dGF0aW9uT2JzZXJ2ZXIsWj1cInVuZGVmaW5lZFwiPT10eXBlb2Ygc2VsZiYmXCJ1bmRlZmluZWRcIiE9dHlwZW9mIHByb2Nlc3MmJlwiW29iamVjdCBwcm9jZXNzXVwiPT09e30udG9TdHJpbmcuY2FsbChwcm9jZXNzKSwkPVwidW5kZWZpbmVkXCIhPXR5cGVvZiBVaW50OENsYW1wZWRBcnJheSYmXCJ1bmRlZmluZWRcIiE9dHlwZW9mIGltcG9ydFNjcmlwdHMmJlwidW5kZWZpbmVkXCIhPXR5cGVvZiBNZXNzYWdlQ2hhbm5lbCx0dD1uZXcgQXJyYXkoMWUzKTtIPVo/bygpOlg/cygpOiQ/dSgpOnZvaWQgMD09PVImJlwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmU/ZigpOmMoKTt2YXIgZXQ9bCxudD1oLHJ0PU1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygxNiksb3Q9dm9pZCAwLGl0PTEsc3Q9Mix1dD1uZXcgTSxjdD1uZXcgTSxhdD0wLGZ0PVksbHQ9cSxodD1GLHB0PUw7TC5hbGw9ZnQsTC5yYWNlPWx0LEwucmVzb2x2ZT1udCxMLnJlamVjdD1odCxMLl9zZXRTY2hlZHVsZXI9bixMLl9zZXRBc2FwPXIsTC5fYXNhcD1RLEwucHJvdG90eXBlPXtjb25zdHJ1Y3RvcjpMLHRoZW46ZXQsXCJjYXRjaFwiOmZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLnRoZW4obnVsbCx0KX19O3ZhciBfdD1OO04ucHJvdG90eXBlLl9lbnVtZXJhdGU9ZnVuY3Rpb24oKXtmb3IodmFyIHQ9dGhpcy5sZW5ndGgsZT10aGlzLl9pbnB1dCxuPTA7dGhpcy5fc3RhdGU9PT1vdCYmdD5uO24rKyl0aGlzLl9lYWNoRW50cnkoZVtuXSxuKX0sTi5wcm90b3R5cGUuX2VhY2hFbnRyeT1mdW5jdGlvbih0LGUpe3ZhciBuPXRoaXMuX2luc3RhbmNlQ29uc3RydWN0b3Iscj1uLnJlc29sdmU7aWYocj09PW50KXt2YXIgbz12KHQpO2lmKG89PT1ldCYmdC5fc3RhdGUhPT1vdCl0aGlzLl9zZXR0bGVkQXQodC5fc3RhdGUsZSx0Ll9yZXN1bHQpO2Vsc2UgaWYoXCJmdW5jdGlvblwiIT10eXBlb2Ygbyl0aGlzLl9yZW1haW5pbmctLSx0aGlzLl9yZXN1bHRbZV09dDtlbHNlIGlmKG49PT1wdCl7dmFyIGk9bmV3IG4ocCk7dyhpLHQsbyksdGhpcy5fd2lsbFNldHRsZUF0KGksZSl9ZWxzZSB0aGlzLl93aWxsU2V0dGxlQXQobmV3IG4oZnVuY3Rpb24oZSl7ZSh0KX0pLGUpfWVsc2UgdGhpcy5fd2lsbFNldHRsZUF0KHIodCksZSl9LE4ucHJvdG90eXBlLl9zZXR0bGVkQXQ9ZnVuY3Rpb24odCxlLG4pe3ZhciByPXRoaXMucHJvbWlzZTtyLl9zdGF0ZT09PW90JiYodGhpcy5fcmVtYWluaW5nLS0sdD09PXN0P2oocixuKTp0aGlzLl9yZXN1bHRbZV09biksMD09PXRoaXMuX3JlbWFpbmluZyYmUyhyLHRoaXMuX3Jlc3VsdCl9LE4ucHJvdG90eXBlLl93aWxsU2V0dGxlQXQ9ZnVuY3Rpb24odCxlKXt2YXIgbj10aGlzO0UodCx2b2lkIDAsZnVuY3Rpb24odCl7bi5fc2V0dGxlZEF0KGl0LGUsdCl9LGZ1bmN0aW9uKHQpe24uX3NldHRsZWRBdChzdCxlLHQpfSl9O3ZhciBkdD1XLHZ0PXtQcm9taXNlOnB0LHBvbHlmaWxsOmR0fTtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKGZ1bmN0aW9uKCl7cmV0dXJuIHZ0fSk6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9dnQ6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHRoaXMmJih0aGlzLkVTNlByb21pc2U9dnQpLGR0KCl9KS5jYWxsKHRoaXMpOyJdfQ==
},{"_process":2}],11:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

exports.event = event;
Object.defineProperty(exports, "__esModule", {
  value: true
});

require("../lib/es6-promise.min.js");

var Templates = _interopRequire(require("../Templates"));

var LoginCheck = _interopRequire(require("../LoginCheck"));

var _helpers = require("../helpers");

var getJSON = _helpers.getJSON;
var round = _helpers.round;

var _API = require("../API");

var API = _interopRequire(_API);

var TBA = _API.TBA;
var getTeams = _API.getTeams;
var getTeamStats = _API.getTeamStats;

function event(key) {
  Promise.all([LoginCheck.get(), Templates.get("event"), getJSON("stats-config.json"), TBA.get("event/" + key)]).then(function (res) {
    var _res = _slicedToArray(res, 4);

    var template = _res[1];
    var stats = _res[2];
    var event = _res[3];

    var $container = $("#main").closest(".container");
    var containerClass = $container.attr("class");
    var ractive = new Ractive({
      template: template,
      data: {
        key: key,
        statConfig: stats,
        loading: true,
        teams: [],
        round: round,
        event: event,
        statColor: function statColor(value, stat) {
          var value = parseFloat(value);
          for (var i = 0; i < stat.progress.length; i++) {
            if ((!stat.progress[i].min || value >= stat.progress[i].min) && (!stat.progress[i].max || value <= stat.progress[i].max)) {
              return stat.progress[i]["class"];
            }
          }
        },
        mobile: $(window).width() < 900,
        token: localStorage.getItem("token"),
        user: {
          name: localStorage.getItem("user.name") || "",
          team: localStorage.getItem("user.team") || ""
        }
      },
      computed: {
        mobile: function mobile() {
          return $(window).width() < 900;
        }
      },
      onrender: function onrender() {
        $container.addClass("wide");
      },
      onunrender: function onunrender() {
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

},{"../API":3,"../LoginCheck":5,"../Templates":7,"../helpers":9,"../lib/es6-promise.min.js":10}],12:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

exports.eventMatches = eventMatches;
Object.defineProperty(exports, "__esModule", {
  value: true
});

require("../lib/es6-promise.min.js");

var Templates = _interopRequire(require("../Templates"));

var _API = require("../API");

var API = _interopRequire(_API);

var TBA = _API.TBA;

function eventMatches(eventKey) {
  Promise.all([Templates.get("event-matches"), TBA.get("event/" + eventKey), TBA.get("event/" + eventKey + "/matches").then(function (matches) {
    return matches.sort(function (a, b) {
      return a.time - b.time;
    });
  })]).then(function (res) {
    var _res = _slicedToArray(res, 3);

    var template = _res[0];
    var event = _res[1];
    var matches = _res[2];

    var ractive = new Ractive({
      template: template,
      data: {
        event: event,
        matches: matches,
        moment: (function (_moment) {
          var _momentWrapper = function moment(_x) {
            return _moment.apply(this, arguments);
          };

          _momentWrapper.toString = function () {
            return _moment.toString();
          };

          return _momentWrapper;
        })(function (date) {
          return moment(date).fromNow();
        }) },
      computed: {
        mobile: function mobile() {
          return $(window).width() < 900;
        }
      } });
  });
}

},{"../API":3,"../Templates":7,"../lib/es6-promise.min.js":10}],13:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

exports.events = events;
Object.defineProperty(exports, "__esModule", {
  value: true
});

require("../lib/es6-promise.min.js");

var Templates = _interopRequire(require("../Templates"));

var LoginCheck = _interopRequire(require("../LoginCheck"));

function events(key) {
  Promise.all([LoginCheck.get(), Templates.get("events")]).then(function (res) {
    var _res = _slicedToArray(res, 2);

    var template = _res[1];

    var ractive = new Ractive({
      template: template,
      data: {
        events: {
          "2016arc": "Archimedes",
          "2016cars": "Carson",
          "2016carv": "Carver",
          "2016cur": "Curie",
          "2016gal": "Galileo",
          "2016hop": "Hopper",
          "2016new": "Newton",
          "2016tes": "Tesla",
          "2016cmp": "Einstein" },
        mobile: $(window).width() < 900,
        token: localStorage.getItem("token"),
        user: {
          name: localStorage.getItem("user.name") || "",
          team: localStorage.getItem("user.team") || ""
        }
      },
      computed: {
        mobile: function mobile() {
          return $(window).width() < 900;
        }
      } });
  });
}

},{"../LoginCheck":5,"../Templates":7,"../lib/es6-promise.min.js":10}],14:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

exports.login = login;
Object.defineProperty(exports, "__esModule", {
  value: true
});

require("../lib/es6-promise.min.js");

var Templates = _interopRequire(require("../Templates"));

var LoginCheck = _interopRequire(require("../LoginCheck"));

var _helpers = require("../helpers");

var getJSON = _helpers.getJSON;
var round = _helpers.round;

var _API = require("../API");

var API = _interopRequire(_API);

var getTeamStats = _API.getTeamStats;
var generateToken = _API.generateToken;

function login() {
  Promise.all([Templates.get("login")]).then(function (res) {
    var _res = _slicedToArray(res, 1);

    var template = _res[0];

    if (localStorage.getItem("token")) {
      location.hash = "#/a/events";
    } else {
      var ractive = new Ractive({
        template: template,
        data: {
          mobile: $(window).width() < 900,
          token: localStorage.getItem("token"),
          user: {
            name: localStorage.getItem("user.name") || "",
            team: localStorage.getItem("user.team") || ""
          }
        } });
      ractive.on("login", function (node) {
        var name = this.get("user.name");
        var team = this.get("user.team");
        localStorage.setItem("user.name", name);
        localStorage.setItem("user.team", team);
        var token = generateToken(team, name);
        location.hash = "#/a/events";
      });
    }
  })["catch"](console.error.bind(console));
}

},{"../API":3,"../LoginCheck":5,"../Templates":7,"../helpers":9,"../lib/es6-promise.min.js":10}],15:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

exports.team = team;
Object.defineProperty(exports, "__esModule", {
  value: true
});

require("../lib/es6-promise.min.js");

var _Templates = require("../Templates");

var Templates = _interopRequire(_Templates);

var LoginCheck = _interopRequire(_Templates);

var _helpers = require("../helpers");

var getJSON = _helpers.getJSON;
var round = _helpers.round;

var _API = require("../API");

var API = _interopRequire(_API);

var getTeamStats = _API.getTeamStats;

function team(key) {
  Promise.all([LoginCheck.get(), Templates.get("team"), getJSON("stats-config.json"), getTeamStats(API, key)]).then(function (res) {
    var _res = _slicedToArray(res, 4);

    var template = _res[1];
    var stats = _res[2];
    var teamData = _res[3];

    var ractive = new Ractive({
      template: template,
      data: {
        stats: stats,
        statKeys: ["calcs", "goals", "defenses"],
        key: key,
        team: teamData,
        round: round,
        mobile: $(window).width() < 900,
        token: localStorage.getItem("token"),
        user: {
          name: localStorage.getItem("user.name") || "",
          team: localStorage.getItem("user.team") || ""
        }
      } });
  })["catch"](console.error.bind(console));
}

},{"../API":3,"../Templates":7,"../helpers":9,"../lib/es6-promise.min.js":10}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiQzovVXNlcnMvU2FtdWVsL0RvY3VtZW50cy9vcmItY2xpZW50L3NyYy9tYWluLmpzIiwibm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXHByb2Nlc3NcXGJyb3dzZXIuanMiLCJDOi9Vc2Vycy9TYW11ZWwvRG9jdW1lbnRzL29yYi1jbGllbnQvc3JjL0FQSS5qcyIsIkM6L1VzZXJzL1NhbXVlbC9Eb2N1bWVudHMvb3JiLWNsaWVudC9zcmMvQ29tcG9uZW50cy5qcyIsIkM6L1VzZXJzL1NhbXVlbC9Eb2N1bWVudHMvb3JiLWNsaWVudC9zcmMvTG9naW5DaGVjay5qcyIsIkM6L1VzZXJzL1NhbXVlbC9Eb2N1bWVudHMvb3JiLWNsaWVudC9zcmMvUGFnZXMuanMiLCJDOi9Vc2Vycy9TYW11ZWwvRG9jdW1lbnRzL29yYi1jbGllbnQvc3JjL1RlbXBsYXRlcy5qcyIsIkM6L1VzZXJzL1NhbXVlbC9Eb2N1bWVudHMvb3JiLWNsaWVudC9zcmMvY2FjaGVhYmxlLmpzIiwiQzovVXNlcnMvU2FtdWVsL0RvY3VtZW50cy9vcmItY2xpZW50L3NyYy9oZWxwZXJzLmpzIiwic3JjXFxsaWJcXGVzNi1wcm9taXNlLm1pbi5qcyIsIkM6L1VzZXJzL1NhbXVlbC9Eb2N1bWVudHMvb3JiLWNsaWVudC9zcmMvcGFnZXMvZXZlbnQuanMiLCJDOi9Vc2Vycy9TYW11ZWwvRG9jdW1lbnRzL29yYi1jbGllbnQvc3JjL3BhZ2VzL2V2ZW50TWF0Y2hlcy5qcyIsIkM6L1VzZXJzL1NhbXVlbC9Eb2N1bWVudHMvb3JiLWNsaWVudC9zcmMvcGFnZXMvZXZlbnRzLmpzIiwiQzovVXNlcnMvU2FtdWVsL0RvY3VtZW50cy9vcmItY2xpZW50L3NyYy9wYWdlcy9sb2dpbi5qcyIsIkM6L1VzZXJzL1NhbXVlbC9Eb2N1bWVudHMvb3JiLWNsaWVudC9zcmMv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Q0FBQyxFQUFFO0FBQzNCLFlBQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDakM7R0FDRjtBQUNELFNBQU8sTUFBTSxDQUFDO0NBQ2Y7OztBQzFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssRUFBRSxHQUFHLEdBQUc7QUFDL0IsYUFBSyxFQUFFLFlBQVksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO0FBQ3BDLFlBQUksRUFBRTtBQUNKLGNBQUksRUFBRSxZQUFZLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUU7QUFDN0MsY0FBSSxFQUFFLFlBQVksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRTtTQUM5QztPQUNGLEVBQ0YsQ0FBQyxDQUFDO0dBQ0osQ0FBQyxTQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztDQUN2QyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgKiBhcyBQYWdlcyBmcm9tICcuL1BhZ2VzJ1xyXG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tICcuL0NvbXBvbmVudHMnXHJcbmltcG9ydCB7XHJcbiAgZG9jdW1lbnRSZWFkeVxyXG59IGZyb20gJy4vaGVscGVycydcclxuaW1wb3J0ICcuL2xpYi9lczYtcHJvbWlzZS5taW4uanMnXHJcblxyXG5jb25zdCBlbCA9IFwiI21haW5cIjtcclxuXHJcbmNvbnN0IHJvdXRlciA9IFJvdXRlcih7XHJcbiAgXCIvbG9naW5cIjogUGFnZXMubG9naW4sXHJcbiAgXCIvYVwiOiB7XHJcbiAgICBcIi90ZWFtLzprZXlcIjogUGFnZXMudGVhbSxcclxuICAgIFwiL2V2ZW50LzprZXlcIjogUGFnZXMuZXZlbnQsXHJcbiAgICBcIi9ldmVudC86a2V5L21hdGNoZXNcIjogUGFnZXMuZXZlbnRNYXRjaGVzLFxyXG4gICAgXCIvZXZlbnRzXCI6IFBhZ2VzLmV2ZW50c1xyXG4gIH1cclxufSkuY29uZmlndXJlKHtcclxuICBodG1sNWhpc3Rvcnk6IGZhbHNlLFxyXG4gIGJlZm9yZTogW10sXHJcbiAgYWZ0ZXI6IFtdLFxyXG4gIHJlY3Vyc2U6ICdmb3J3YXJkJ1xyXG59KTtcclxuXHJcblByb21pc2UuYWxsKFtkb2N1bWVudFJlYWR5LCBDb21wb25lbnRzLmxvYWQoKV0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgY29uc3QgWywgQ29tcG9uZW50c10gPSByZXM7XHJcbiAgUmFjdGl2ZSA9IFJhY3RpdmUuZXh0ZW5kKHtcclxuICAgIGVsOiBlbCxcclxuICAgIGNvbXBvbmVudHM6IENvbXBvbmVudHMuY29tcG9uZW50cyxcclxuICAgIGJlZm9yZTogW2Z1bmN0aW9uKCkge1xyXG4gICAgICAkKHdpbmRvdykuc2Nyb2xsVG9wKDApO1xyXG4gICAgfV1cclxuICB9KTtcclxuICByb3V0ZXIuaW5pdCgpO1xyXG4gIGlmICghcm91dGVyLmdldFJvdXRlKCkuZmlsdGVyKEJvb2xlYW4pLmxlbmd0aCkge1xyXG4gICAgaWYgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpKSB7XHJcbiAgICAgIHJvdXRlci5zZXRSb3V0ZShcIi9hL2V2ZW50c1wiKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJvdXRlci5zZXRSb3V0ZShcIi9sb2dpblwiKTtcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5wcm9jZXNzLm5leHRUaWNrID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgIHZhciBjYW5NdXRhdGlvbk9ic2VydmVyID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuTXV0YXRpb25PYnNlcnZlcjtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICB2YXIgcXVldWUgPSBbXTtcblxuICAgIGlmIChjYW5NdXRhdGlvbk9ic2VydmVyKSB7XG4gICAgICAgIHZhciBoaWRkZW5EaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICB2YXIgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgcXVldWVMaXN0ID0gcXVldWUuc2xpY2UoKTtcbiAgICAgICAgICAgIHF1ZXVlLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICBxdWV1ZUxpc3QuZm9yRWFjaChmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUoaGlkZGVuRGl2LCB7IGF0dHJpYnV0ZXM6IHRydWUgfSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBpZiAoIXF1ZXVlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGhpZGRlbkRpdi5zZXRBdHRyaWJ1dGUoJ3llcycsICdubycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuIiwiaW1wb3J0ICcuL2xpYi9lczYtcHJvbWlzZS5taW4uanMnXHJcbmltcG9ydCBjYWNoZWFibGUgZnJvbSAnLi9jYWNoZWFibGUnXHJcbmltcG9ydCB7IGV4dGVuZCB9IGZyb20gJy4vaGVscGVycydcclxuXHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2FjaGVhYmxlKGZ1bmN0aW9uKGtleSkge1xyXG4gIGNvbnN0IGtleSA9IGtleS5yZXBsYWNlKC9eXFwvLywgXCJcIikucmVwbGFjZSgvXFwvJC8sIFwiXCIpO1xyXG4gIGxldCB1cmwgPSBcImh0dHA6Ly9vcmIuc2NvdXRmcmMuaW8vXCIra2V5K1wiL1wiO1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcclxuICAgIHJldHVybiAkLmFqYXgoe1xyXG4gICAgICBtZXRob2Q6IFwiZ2V0XCIsXHJcbiAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcclxuICAgICAgZGF0YToge30sXHJcbiAgICAgIHVybDogdXJsLFxyXG4gICAgICBlcnJvcjogcmVqZWN0XHJcbiAgICB9KS50aGVuKHJlc29sdmUpO1xyXG4gIH0pLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgY29uc29sZS5lcnJvcihcIkFQSSBSZXF1ZXN0IFVuc3VjY2Vzc2Z1bFwiLCB1cmwsIHJlcyk7XHJcbiAgICByZXR1cm4gcmVzO1xyXG4gIH0pO1xyXG59KTtcclxuXHJcbmV4cG9ydCBsZXQgVEJBID0gY2FjaGVhYmxlKGZ1bmN0aW9uKHBhdGgpIHtcclxuICBjb25zdCB1cmwgPSBcImh0dHA6Ly93d3cudGhlYmx1ZWFsbGlhbmNlLmNvbS9hcGkvdjIvXCIgKyBwYXRoO1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcclxuICAgIHJldHVybiAkLmFqYXgoe1xyXG4gICAgICBtZXRob2Q6IFwiZ2V0XCIsXHJcbiAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcclxuICAgICAgZGF0YToge1xyXG4gICAgICAgICdYLVRCQS1BcHAtSWQnOiBcImZyYzQ1MzQ6b3JiOmNsaWVudFwiXHJcbiAgICAgIH0sXHJcbiAgICAgIHVybDogdXJsLFxyXG4gICAgICBlcnJvcjogcmVqZWN0XHJcbiAgICB9KS50aGVuKHJlc29sdmUpO1xyXG4gIH0pLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgY29uc29sZS5lcnJvcihcIkFQSSBSZXF1ZXN0IFVuc3VjY2Vzc2Z1bFwiLCB1cmwsIHJlcyk7XHJcbiAgICByZXR1cm4gcmVzO1xyXG4gIH0pO1xyXG59KTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRUZWFtU3RhdHMoQVBJLCBrZXksIHRlYW0pIHtcclxuICBsZXQgcHJvbWlzZXMgPSBbXHJcbiAgICBBUEkuZ2V0KFwidGVhbS9cIitrZXkrXCIvZGVmZW5zZVwiKSxcclxuICAgIEFQSS5nZXQoXCJ0ZWFtL1wiK2tleStcIi9nb2Fsc1wiKSxcclxuICAgIEFQSS5nZXQoXCJ0ZWFtL1wiK2tleStcIi9zY29yZVwiKSxcclxuICBdO1xyXG4gIGlmICh0eXBlb2YgdGVhbSA9PSBcIm9iamVjdFwiICYmIHRlYW0udGVhbV9udW1iZXIgPT0gdGVhbSkge1xyXG4gICAgcHJvbWlzZXMucHVzaCgocmVzb2x2ZSwgcmVqZWN0KSA9PiByZXNvbHZlKHRlYW0pKVxyXG4gIH0gZWxzZSB7XHJcbiAgICBwcm9taXNlcy5wdXNoKEFQSS5nZXQoXCJ0ZWFtL1wiK2tleSkpO1xyXG4gIH1cclxuICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICBsZXQgW2RlZmVuc2VzLCBnb2Fscywgc2NvcmUsIHRlYW1dID0gcmVzO1xyXG4gICAgcmV0dXJuIGV4dGVuZCh0ZWFtLCB7XHJcbiAgICAgIHN0YXRzOiB7XHJcbiAgICAgICAgY2FsY3M6IHtcclxuICAgICAgICAgIHByZWRpY3RlZF9ycDogMCxcclxuICAgICAgICAgIHNjb3JlOiBzY29yZVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZGVmZW5zZXM6IHtcclxuICAgICAgICAgIGxvd19iYXI6IGRlZmVuc2VzWzFdLFxyXG4gICAgICAgICAgcG9ydGN1bGxpczogZGVmZW5zZXNbMl0sXHJcbiAgICAgICAgICBjaGV2YWxfZGVfZnJpc2U6IGRlZmVuc2VzWzNdLFxyXG4gICAgICAgICAgbW9hdDogZGVmZW5zZXNbNF0sXHJcbiAgICAgICAgICByYW1wYXJ0czogZGVmZW5zZXNbNV0sXHJcbiAgICAgICAgICBkcmF3YnJpZGdlOiBkZWZlbnNlc1s2XSxcclxuICAgICAgICAgIHNhbGx5X3BvcnQ6IGRlZmVuc2VzWzddLFxyXG4gICAgICAgICAgcm9ja193YWxsOiBkZWZlbnNlc1s4XSxcclxuICAgICAgICAgIHJvdWdoX3RlcnJhaW46IGRlZmVuc2VzWzldLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZ29hbHM6IHtcclxuICAgICAgICAgIGF1dG9fbG93OiBnb2Fsc1sxXSxcclxuICAgICAgICAgIGF1dG9faGlnaDogZ29hbHNbMl0sXHJcbiAgICAgICAgICB0ZWxlb3BfbG93OiBnb2Fsc1szXSxcclxuICAgICAgICAgIHRlbGVvcF9oaWdoOiBnb2Fsc1s0XSxcclxuICAgICAgICB9LFxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFRlYW1zKEFQSSwga2V5KSB7XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgcmVzb2x2ZShBUEkuZ2V0KFwibGlzdC9cIitrZXkpKTtcclxuICB9KS50aGVuKGZ1bmN0aW9uKHRlYW1zKSB7XHJcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwodGVhbXMubWFwKHRlYW0gPT4gZ2V0VGVhbVN0YXRzKEFQSSwgdGVhbS50ZWFtX251bWJlciwgdGVhbSkpKTtcclxuICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlVG9rZW4odGVhbSxuYW1lKSB7XHJcbiAgdmFyIHRva2VuID0gdGVhbSArIFwiLlwiICsgbWQ1KG5hbWUpO1xyXG4gIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwidG9rZW5cIix0b2tlbik7XHJcbiAgcmV0dXJuIHRva2VuO1xyXG59XHJcbiIsImltcG9ydCAnLi9saWIvZXM2LXByb21pc2UubWluLmpzJ1xyXG5pbXBvcnQgVGVtcGxhdGVzIGZyb20gJy4vVGVtcGxhdGVzJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQge1xyXG4gIHRlbXBsYXRlczoge30sXHJcbiAgY29tcG9uZW50czoge30sXHJcbiAgY3JlYXRlOiBmdW5jdGlvbihkb25lKSB7XHJcbiAgICB0aGlzLmNvbXBvbmVudHMuUHJvZ3Jlc3MgPSBSYWN0aXZlLmV4dGVuZCh7XHJcbiAgICAgICBpc29sYXRlZDogZmFsc2UsXHJcbiAgICAgICB0ZW1wbGF0ZTogdGhpcy50ZW1wbGF0ZXMucHJvZ3Jlc3MsXHJcbiAgICAgICBvbmluaXQ6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICBjb25zdCBzdGF0ID0gdGhpcy5nZXQoXCJzdGF0XCIpO1xyXG4gICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuZ2V0KFwidmFsdWVcIik7XHJcbiAgICAgICAgIGxldCBwcm9ncmVzc0NsYXNzO1xyXG4gICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgc3RhdC5wcm9ncmVzcy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgIGlmICgoIXN0YXQucHJvZ3Jlc3NbaV0ubWluIHx8IHZhbHVlID49IHN0YXQucHJvZ3Jlc3NbaV0ubWluKSAmJiAoIXN0YXQucHJvZ3Jlc3NbaV0ubWF4IHx8IHZhbHVlIDw9IHN0YXQucHJvZ3Jlc3NbaV0ubWF4KSkge1xyXG4gICAgICAgICAgICAgcHJvZ3Jlc3NDbGFzcyA9IHN0YXQucHJvZ3Jlc3NbaV0uY2xhc3M7XHJcbiAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICB9XHJcbiAgICAgICAgIH1cclxuICAgICAgICAgdGhpcy5zZXQoe1xyXG4gICAgICAgICAgIG1pbjogc3RhdC5taW4sXHJcbiAgICAgICAgICAgbWF4OiBzdGF0Lm1heCxcclxuICAgICAgICAgICB3aWR0aDogKHN0YXQubWluICsgdmFsdWUpL3N0YXQubWF4ICogMTAwLFxyXG4gICAgICAgICAgIHByb2dyZXNzQ2xhc3M6IHByb2dyZXNzQ2xhc3MsXHJcbiAgICAgICAgIH0pXHJcbiAgICAgICB9LFxyXG5cclxuICAgIH0pO1xyXG4gIH0sXHJcbiAgbG9hZDogZnVuY3Rpb24oZG9uZSkge1xyXG4gICAgY29uc3QgX3RoaXMgPSB0aGlzO1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICBUZW1wbGF0ZXMuZ2V0KFwiY29tcG9uZW50c1wiKS50aGVuKGZ1bmN0aW9uKHRlbXBsYXRlcykge1xyXG4gICAgICAgICQoXCI8ZGl2PlwiKS5odG1sKHRlbXBsYXRlcykuZmluZChcInNjcmlwdC50ZW1wbGF0ZVwiKS5lYWNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgY29uc3QgJHRoaXMgPSAkKHRoaXMpO1xyXG4gICAgICAgICAgX3RoaXMudGVtcGxhdGVzWyR0aGlzLmF0dHIoXCJuYW1lXCIpXSA9ICR0aGlzLmh0bWwoKS50cmltKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgX3RoaXMuY3JlYXRlKCk7XHJcbiAgICAgICAgcmVzb2x2ZShfdGhpcyk7XHJcbiAgICAgIH0pLmNhdGNoKHJlamVjdCk7XHJcbiAgICB9KTtcclxuICB9LFxyXG59O1xyXG4iLCJpbXBvcnQgJy4vbGliL2VzNi1wcm9taXNlLm1pbi5qcydcclxuaW1wb3J0IGNhY2hlYWJsZSBmcm9tICcuL2NhY2hlYWJsZSdcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNhY2hlYWJsZShmdW5jdGlvbigpIHtcclxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICBpZihsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInRva2VuXCIpKSB7XHJcbiAgICAgIHJlc29sdmUoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGxvY2F0aW9uLmhhc2ggPSBcIiMvbG9naW5cIlxyXG4gICAgICByZWplY3QoKTtcclxuICAgIH1cclxuICB9KTtcclxufSk7XHJcbiIsImV4cG9ydCAqIGZyb20gJy4vcGFnZXMvdGVhbSdcclxuZXhwb3J0ICogZnJvbSAnLi9wYWdlcy9ldmVudCdcclxuZXhwb3J0ICogZnJvbSAnLi9wYWdlcy9sb2dpbidcclxuZXhwb3J0ICogZnJvbSAnLi9wYWdlcy9ldmVudHMnXHJcbmV4cG9ydCAqIGZyb20gJy4vcGFnZXMvZXZlbnRNYXRjaGVzJ1xyXG4iLCJpbXBvcnQgJy4vbGliL2VzNi1wcm9taXNlLm1pbi5qcydcclxuaW1wb3J0IGNhY2hlYWJsZSBmcm9tICcuL2NhY2hlYWJsZSdcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNhY2hlYWJsZShmdW5jdGlvbihrZXkpIHtcclxuICBjb25zdCB1cmwgPSBcInRlbXBsYXRlcy9cIitrZXkrXCIuaHRtbFwiO1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcclxuICAgIHJldHVybiAkLmFqYXgoe1xyXG4gICAgICBtZXRob2Q6IFwiZ2V0XCIsXHJcbiAgICAgIHVybDogdXJsLFxyXG4gICAgICBlcnJvcjogcmVqZWN0XHJcbiAgICB9KS50aGVuKHJlc29sdmUpO1xyXG4gIH0pLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgY29uc29sZS5lcnJvcihcIlRlbXBsYXRlIFJlcXVlc3QgVW5zdWNjZXNzZnVsXCIsIHVybCwgcmVzKTtcclxuICAgIHJldHVybiByZXM7XHJcbiAgfSk7XHJcbn0pO1xyXG4iLCJpbXBvcnQgJy4vbGliL2VzNi1wcm9taXNlLm1pbi5qcydcclxuaW1wb3J0IGNhY2hlYWJsZSBmcm9tICcuL2NhY2hlYWJsZSdcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNhY2hlYWJsZShnZXRQcm9taXNlKSB7XHJcbiAgY29uc3QgX2NhY2hlID0ge307XHJcblxyXG4gIGZ1bmN0aW9uIHNldChrZXksIHZhbHVlKSB7XHJcbiAgICByZXR1cm4gX2NhY2hlW2tleV0gPSB2YWx1ZTtcclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBnZXQoa2V5LCBjYWxsYmFjaykge1xyXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgaWYgKF9jYWNoZVtrZXldKSB7XHJcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZShfY2FjaGVba2V5XSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnZXRQcm9taXNlKGtleSlcclxuICAgICAgICAgIC50aGVuKHZhbHVlID0+IHNldChrZXksIHZhbHVlKSlcclxuICAgICAgICAgIC50aGVuKHJlc29sdmUpXHJcbiAgICAgICAgICAuY2F0Y2gocmVqZWN0KTtcclxuXHJcbiAgICAgIH0pLnRoZW4oY2FsbGJhY2spO1xyXG4gICAgfSxcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0ICcuL2xpYi9lczYtcHJvbWlzZS5taW4uanMnXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0SlNPTih1cmwpIHtcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgJC5hamF4KHtcclxuICAgICAgbWV0aG9kOiBcImdldFwiLFxyXG4gICAgICBkYXRhVHlwZTogXCJqc29uXCIsXHJcbiAgICAgIGRhdGE6IHt9LFxyXG4gICAgICB1cmw6IHVybCxcclxuICAgICAgZXJyb3I6IHJlamVjdFxyXG4gICAgfSkudGhlbihyZXNvbHZlKTtcclxuICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJvdW5kKG4sIGRpZ2l0cykge1xyXG4gIGNvbnN0IG4gPSBwYXJzZUZsb2F0KG4pO1xyXG4gIGNvbnN0IGRpZ2l0cyA9IHBhcnNlSW50KGRpZ2l0cyk7XHJcbiAgY29uc3QgcGFydHMgPSAoTWF0aC5yb3VuZChuICogTWF0aC5wb3coMTAsIGRpZ2l0cykpL01hdGgucG93KDEwLCBkaWdpdHMpKS50b1N0cmluZygpLnNwbGl0KFwiLlwiKTtcclxuICBpZiAocGFydHMubGVuZ3RoID09IDEpIHtcclxuICAgIHBhcnRzLnB1c2goXCJcIik7XHJcbiAgfVxyXG4gIHJldHVybiBwYXJ0c1swXSArIChkaWdpdHMgPyBcIi5cIiA6IFwiXCIpICsgcGFydHNbMV0gKyBBcnJheShNYXRoLm1heCgwLCBkaWdpdHMgLSBwYXJ0c1sxXS5sZW5ndGggKyAxKSkuam9pbihcIjBcIik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBkb2N1bWVudFJlYWR5KCkge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcclxuICAgIGlmICgkLmlzUmVhZHkpIHtcclxuICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgJChyZXNvbHZlKTtcclxuICAgIH1cclxuICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGV4dGVuZCgpIHtcclxuICBjb25zdCByZXN1bHQgPSBhcmd1bWVudHNbMF07XHJcbiAgZm9yKGxldCBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgZm9yKGxldCBrZXkgaW4gYXJndW1lbnRzW2ldKSB7XHJcbiAgICAgIHJlc3VsdFtrZXldID0gYXJndW1lbnRzW2ldW2tleV07XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiByZXN1bHQ7XHJcbn1cclxuIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCl7XG4vKiFcclxuICogQG92ZXJ2aWV3IGVzNi1wcm9taXNlIC0gYSB0aW55IGltcGxlbWVudGF0aW9uIG9mIFByb21pc2VzL0ErLlxyXG4gKiBAY29weXJpZ2h0IENvcHlyaWdodCAoYykgMjAxNCBZZWh1ZGEgS2F0eiwgVG9tIERhbGUsIFN0ZWZhbiBQZW5uZXIgYW5kIGNvbnRyaWJ1dG9ycyAoQ29udmVyc2lvbiB0byBFUzYgQVBJIGJ5IEpha2UgQXJjaGliYWxkKVxyXG4gKiBAbGljZW5zZSAgIExpY2Vuc2VkIHVuZGVyIE1JVCBsaWNlbnNlXHJcbiAqICAgICAgICAgICAgU2VlIGh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9qYWtlYXJjaGliYWxkL2VzNi1wcm9taXNlL21hc3Rlci9MSUNFTlNFXHJcbiAqIEB2ZXJzaW9uICAgMy4yLjFcclxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG4oZnVuY3Rpb24gKCkge1xuICBcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiB0KHQpIHtcbiAgICByZXR1cm4gXCJmdW5jdGlvblwiID09IHR5cGVvZiB0IHx8IFwib2JqZWN0XCIgPT0gdHlwZW9mIHQgJiYgbnVsbCAhPT0gdDtcbiAgfWZ1bmN0aW9uIGUodCkge1xuICAgIHJldHVybiBcImZ1bmN0aW9uXCIgPT0gdHlwZW9mIHQ7XG4gIH1mdW5jdGlvbiBuKHQpIHtcbiAgICBHID0gdDtcbiAgfWZ1bmN0aW9uIHIodCkge1xuICAgIFEgPSB0O1xuICB9ZnVuY3Rpb24gbygpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhhKTtcbiAgICB9O1xuICB9ZnVuY3Rpb24gaSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgQihhKTtcbiAgICB9O1xuICB9ZnVuY3Rpb24gcygpIHtcbiAgICB2YXIgdCA9IDAsXG4gICAgICAgIGUgPSBuZXcgWChhKSxcbiAgICAgICAgbiA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiXCIpO3JldHVybiAoZS5vYnNlcnZlKG4sIHsgY2hhcmFjdGVyRGF0YTogITAgfSksIGZ1bmN0aW9uICgpIHtcbiAgICAgIG4uZGF0YSA9IHQgPSArK3QgJSAyO1xuICAgIH0pO1xuICB9ZnVuY3Rpb24gdSgpIHtcbiAgICB2YXIgdCA9IG5ldyBNZXNzYWdlQ2hhbm5lbCgpO3JldHVybiAodC5wb3J0MS5vbm1lc3NhZ2UgPSBhLCBmdW5jdGlvbiAoKSB7XG4gICAgICB0LnBvcnQyLnBvc3RNZXNzYWdlKDApO1xuICAgIH0pO1xuICB9ZnVuY3Rpb24gYygpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgc2V0VGltZW91dChhLCAxKTtcbiAgICB9O1xuICB9ZnVuY3Rpb24gYSgpIHtcbiAgICBmb3IgKHZhciB0ID0gMDsgSiA+IHQ7IHQgKz0gMikge1xuICAgICAgdmFyIGUgPSB0dFt0XSxcbiAgICAgICAgICBuID0gdHRbdCArIDFdO2UobiksIHR0W3RdID0gdm9pZCAwLCB0dFt0ICsgMV0gPSB2b2lkIDA7XG4gICAgfUogPSAwO1xuICB9ZnVuY3Rpb24gZigpIHtcbiAgICB0cnkge1xuICAgICAgdmFyIHQgPSByZXF1aXJlLFxuICAgICAgICAgIGUgPSB0KFwidmVydHhcIik7cmV0dXJuIChCID0gZS5ydW5Pbkxvb3AgfHwgZS5ydW5PbkNvbnRleHQsIGkoKSk7XG4gICAgfSBjYXRjaCAobikge1xuICAgICAgcmV0dXJuIGMoKTtcbiAgICB9XG4gIH1mdW5jdGlvbiBsKHQsIGUpIHtcbiAgICB2YXIgbiA9IHRoaXMsXG4gICAgICAgIHIgPSBuZXcgdGhpcy5jb25zdHJ1Y3RvcihwKTt2b2lkIDAgPT09IHJbcnRdICYmIGsocik7dmFyIG8gPSBuLl9zdGF0ZTtpZiAobykge1xuICAgICAgdmFyIGkgPSBhcmd1bWVudHNbbyAtIDFdO1EoZnVuY3Rpb24gKCkge1xuICAgICAgICB4KG8sIHIsIGksIG4uX3Jlc3VsdCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2UgRShuLCByLCB0LCBlKTtyZXR1cm4gcjtcbiAgfWZ1bmN0aW9uIGgodCkge1xuICAgIHZhciBlID0gdGhpcztpZiAodCAmJiBcIm9iamVjdFwiID09IHR5cGVvZiB0ICYmIHQuY29uc3RydWN0b3IgPT09IGUpIHtcbiAgICAgIHJldHVybiB0O1xuICAgIH12YXIgbiA9IG5ldyBlKHApO3JldHVybiAoZyhuLCB0KSwgbik7XG4gIH1mdW5jdGlvbiBwKCkge31mdW5jdGlvbiBfKCkge1xuICAgIHJldHVybiBuZXcgVHlwZUVycm9yKFwiWW91IGNhbm5vdCByZXNvbHZlIGEgcHJvbWlzZSB3aXRoIGl0c2VsZlwiKTtcbiAgfWZ1bmN0aW9uIGQoKSB7XG4gICAgcmV0dXJuIG5ldyBUeXBlRXJyb3IoXCJBIHByb21pc2VzIGNhbGxiYWNrIGNhbm5vdCByZXR1cm4gdGhhdCBzYW1lIHByb21pc2UuXCIpO1xuICB9ZnVuY3Rpb24gdih0KSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB0LnRoZW47XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuICh1dC5lcnJvciA9IGUsIHV0KTtcbiAgICB9XG4gIH1mdW5jdGlvbiB5KHQsIGUsIG4sIHIpIHtcbiAgICB0cnkge1xuICAgICAgdC5jYWxsKGUsIG4sIHIpO1xuICAgIH0gY2F0Y2ggKG8pIHtcbiAgICAgIHJldHVybiBvO1xuICAgIH1cbiAgfWZ1bmN0aW9uIG0odCwgZSwgbikge1xuICAgIFEoZnVuY3Rpb24gKHQpIHtcbiAgICAgIHZhciByID0gITEsXG4gICAgICAgICAgbyA9IHkobiwgZSwgZnVuY3Rpb24gKG4pIHtcbiAgICAgICAgciB8fCAociA9ICEwLCBlICE9PSBuID8gZyh0LCBuKSA6IFModCwgbikpO1xuICAgICAgfSwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgciB8fCAociA9ICEwLCBqKHQsIGUpKTtcbiAgICAgIH0sIFwiU2V0dGxlOiBcIiArICh0Ll9sYWJlbCB8fCBcIiB1bmtub3duIHByb21pc2VcIikpOyFyICYmIG8gJiYgKHIgPSAhMCwgaih0LCBvKSk7XG4gICAgfSwgdCk7XG4gIH1mdW5jdGlvbiBiKHQsIGUpIHtcbiAgICBlLl9zdGF0ZSA9PT0gaXQgPyBTKHQsIGUuX3Jlc3VsdCkgOiBlLl9zdGF0ZSA9PT0gc3QgPyBqKHQsIGUuX3Jlc3VsdCkgOiBFKGUsIHZvaWQgMCwgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGcodCwgZSk7XG4gICAgfSwgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGoodCwgZSk7XG4gICAgfSk7XG4gIH1mdW5jdGlvbiB3KHQsIG4sIHIpIHtcbiAgICBuLmNvbnN0cnVjdG9yID09PSB0LmNvbnN0cnVjdG9yICYmIHIgPT09IGV0ICYmIGNvbnN0cnVjdG9yLnJlc29sdmUgPT09IG50ID8gYih0LCBuKSA6IHIgPT09IHV0ID8gaih0LCB1dC5lcnJvcikgOiB2b2lkIDAgPT09IHIgPyBTKHQsIG4pIDogZShyKSA/IG0odCwgbiwgcikgOiBTKHQsIG4pO1xuICB9ZnVuY3Rpb24gZyhlLCBuKSB7XG4gICAgZSA9PT0gbiA/IGooZSwgXygpKSA6IHQobikgPyB3KGUsIG4sIHYobikpIDogUyhlLCBuKTtcbiAgfWZ1bmN0aW9uIEEodCkge1xuICAgIHQuX29uZXJyb3IgJiYgdC5fb25lcnJvcih0Ll9yZXN1bHQpLCBUKHQpO1xuICB9ZnVuY3Rpb24gUyh0LCBlKSB7XG4gICAgdC5fc3RhdGUgPT09IG90ICYmICh0Ll9yZXN1bHQgPSBlLCB0Ll9zdGF0ZSA9IGl0LCAwICE9PSB0Ll9zdWJzY3JpYmVycy5sZW5ndGggJiYgUShULCB0KSk7XG4gIH1mdW5jdGlvbiBqKHQsIGUpIHtcbiAgICB0Ll9zdGF0ZSA9PT0gb3QgJiYgKHQuX3N0YXRlID0gc3QsIHQuX3Jlc3VsdCA9IGUsIFEoQSwgdCkpO1xuICB9ZnVuY3Rpb24gRSh0LCBlLCBuLCByKSB7XG4gICAgdmFyIG8gPSB0Ll9zdWJzY3JpYmVycyxcbiAgICAgICAgaSA9IG8ubGVuZ3RoO3QuX29uZXJyb3IgPSBudWxsLCBvW2ldID0gZSwgb1tpICsgaXRdID0gbiwgb1tpICsgc3RdID0gciwgMCA9PT0gaSAmJiB0Ll9zdGF0ZSAmJiBRKFQsIHQpO1xuICB9ZnVuY3Rpb24gVCh0KSB7XG4gICAgdmFyIGUgPSB0Ll9zdWJzY3JpYmVycyxcbiAgICAgICAgbiA9IHQuX3N0YXRlO2lmICgwICE9PSBlLmxlbmd0aCkge1xuICAgICAgZm9yICh2YXIgciwgbywgaSA9IHQuX3Jlc3VsdCwgcyA9IDA7IHMgPCBlLmxlbmd0aDsgcyArPSAzKSByID0gZVtzXSwgbyA9IGVbcyArIG5dLCByID8geChuLCByLCBvLCBpKSA6IG8oaSk7dC5fc3Vic2NyaWJlcnMubGVuZ3RoID0gMDtcbiAgICB9XG4gIH1mdW5jdGlvbiBNKCkge1xuICAgIHRoaXMuZXJyb3IgPSBudWxsO1xuICB9ZnVuY3Rpb24gUCh0LCBlKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB0KGUpO1xuICAgIH0gY2F0Y2ggKG4pIHtcbiAgICAgIHJldHVybiAoY3QuZXJyb3IgPSBuLCBjdCk7XG4gICAgfVxuICB9ZnVuY3Rpb24geCh0LCBuLCByLCBvKSB7XG4gICAgdmFyIGksXG4gICAgICAgIHMsXG4gICAgICAgIHUsXG4gICAgICAgIGMsXG4gICAgICAgIGEgPSBlKHIpO2lmIChhKSB7XG4gICAgICBpZiAoKGkgPSBQKHIsIG8pLCBpID09PSBjdCA/IChjID0gITAsIHMgPSBpLmVycm9yLCBpID0gbnVsbCkgOiB1ID0gITAsIG4gPT09IGkpKSB7XG4gICAgICAgIHJldHVybiB2b2lkIGoobiwgZCgpKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaSA9IG8sIHUgPSAhMDtuLl9zdGF0ZSAhPT0gb3QgfHwgKGEgJiYgdSA/IGcobiwgaSkgOiBjID8gaihuLCBzKSA6IHQgPT09IGl0ID8gUyhuLCBpKSA6IHQgPT09IHN0ICYmIGoobiwgaSkpO1xuICB9ZnVuY3Rpb24gQyh0LCBlKSB7XG4gICAgdHJ5IHtcbiAgICAgIGUoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZyh0LCBlKTtcbiAgICAgIH0sIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGoodCwgZSk7XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChuKSB7XG4gICAgICBqKHQsIG4pO1xuICAgIH1cbiAgfWZ1bmN0aW9uIE8oKSB7XG4gICAgcmV0dXJuIGF0Kys7XG4gIH1mdW5jdGlvbiBrKHQpIHtcbiAgICB0W3J0XSA9IGF0KyssIHQuX3N0YXRlID0gdm9pZCAwLCB0Ll9yZXN1bHQgPSB2b2lkIDAsIHQuX3N1YnNjcmliZXJzID0gW107XG4gIH1mdW5jdGlvbiBZKHQpIHtcbiAgICByZXR1cm4gbmV3IF90KHRoaXMsIHQpLnByb21pc2U7XG4gIH1mdW5jdGlvbiBxKHQpIHtcbiAgICB2YXIgZSA9IHRoaXM7cmV0dXJuIG5ldyBlKEkodCkgPyBmdW5jdGlvbiAobiwgcikge1xuICAgICAgZm9yICh2YXIgbyA9IHQubGVuZ3RoLCBpID0gMDsgbyA+IGk7IGkrKykgZS5yZXNvbHZlKHRbaV0pLnRoZW4obiwgcik7XG4gICAgfSA6IGZ1bmN0aW9uICh0LCBlKSB7XG4gICAgICBlKG5ldyBUeXBlRXJyb3IoXCJZb3UgbXVzdCBwYXNzIGFuIGFycmF5IHRvIHJhY2UuXCIpKTtcbiAgICB9KTtcbiAgfWZ1bmN0aW9uIEYodCkge1xuICAgIHZhciBlID0gdGhpcyxcbiAgICAgICAgbiA9IG5ldyBlKHApO3JldHVybiAoaihuLCB0KSwgbik7XG4gIH1mdW5jdGlvbiBEKCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJZb3UgbXVzdCBwYXNzIGEgcmVzb2x2ZXIgZnVuY3Rpb24gYXMgdGhlIGZpcnN0IGFyZ3VtZW50IHRvIHRoZSBwcm9taXNlIGNvbnN0cnVjdG9yXCIpO1xuICB9ZnVuY3Rpb24gSygpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRmFpbGVkIHRvIGNvbnN0cnVjdCAnUHJvbWlzZSc6IFBsZWFzZSB1c2UgdGhlICduZXcnIG9wZXJhdG9yLCB0aGlzIG9iamVjdCBjb25zdHJ1Y3RvciBjYW5ub3QgYmUgY2FsbGVkIGFzIGEgZnVuY3Rpb24uXCIpO1xuICB9ZnVuY3Rpb24gTCh0KSB7XG4gICAgdGhpc1tydF0gPSBPKCksIHRoaXMuX3Jlc3VsdCA9IHRoaXMuX3N0YXRlID0gdm9pZCAwLCB0aGlzLl9zdWJzY3JpYmVycyA9IFtdLCBwICE9PSB0ICYmIChcImZ1bmN0aW9uXCIgIT0gdHlwZW9mIHQgJiYgRCgpLCB0aGlzIGluc3RhbmNlb2YgTCA/IEModGhpcywgdCkgOiBLKCkpO1xuICB9ZnVuY3Rpb24gTih0LCBlKSB7XG4gICAgdGhpcy5faW5zdGFuY2VDb25zdHJ1Y3RvciA9IHQsIHRoaXMucHJvbWlzZSA9IG5ldyB0KHApLCB0aGlzLnByb21pc2VbcnRdIHx8IGsodGhpcy5wcm9taXNlKSwgQXJyYXkuaXNBcnJheShlKSA/ICh0aGlzLl9pbnB1dCA9IGUsIHRoaXMubGVuZ3RoID0gZS5sZW5ndGgsIHRoaXMuX3JlbWFpbmluZyA9IGUubGVuZ3RoLCB0aGlzLl9yZXN1bHQgPSBuZXcgQXJyYXkodGhpcy5sZW5ndGgpLCAwID09PSB0aGlzLmxlbmd0aCA/IFModGhpcy5wcm9taXNlLCB0aGlzLl9yZXN1bHQpIDogKHRoaXMubGVuZ3RoID0gdGhpcy5sZW5ndGggfHwgMCwgdGhpcy5fZW51bWVyYXRlKCksIDAgPT09IHRoaXMuX3JlbWFpbmluZyAmJiBTKHRoaXMucHJvbWlzZSwgdGhpcy5fcmVzdWx0KSkpIDogaih0aGlzLnByb21pc2UsIFUoKSk7XG4gIH1mdW5jdGlvbiBVKCkge1xuICAgIHJldHVybiBuZXcgRXJyb3IoXCJBcnJheSBNZXRob2RzIG11c3QgYmUgcHJvdmlkZWQgYW4gQXJyYXlcIik7XG4gIH1mdW5jdGlvbiBXKCkge1xuICAgIHZhciB0O2lmIChcInVuZGVmaW5lZFwiICE9IHR5cGVvZiBnbG9iYWwpIHQgPSBnbG9iYWw7ZWxzZSBpZiAoXCJ1bmRlZmluZWRcIiAhPSB0eXBlb2Ygc2VsZikgdCA9IHNlbGY7ZWxzZSB0cnkge1xuICAgICAgdCA9IEZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJwb2x5ZmlsbCBmYWlsZWQgYmVjYXVzZSBnbG9iYWwgb2JqZWN0IGlzIHVuYXZhaWxhYmxlIGluIHRoaXMgZW52aXJvbm1lbnRcIik7XG4gICAgfXZhciBuID0gdC5Qcm9taXNlOyghbiB8fCBcIltvYmplY3QgUHJvbWlzZV1cIiAhPT0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG4ucmVzb2x2ZSgpKSB8fCBuLmNhc3QpICYmICh0LlByb21pc2UgPSBwdCk7XG4gIH12YXIgejt6ID0gQXJyYXkuaXNBcnJheSA/IEFycmF5LmlzQXJyYXkgOiBmdW5jdGlvbiAodCkge1xuICAgIHJldHVybiBcIltvYmplY3QgQXJyYXldXCIgPT09IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0KTtcbiAgfTt2YXIgQixcbiAgICAgIEcsXG4gICAgICBILFxuICAgICAgSSA9IHosXG4gICAgICBKID0gMCxcbiAgICAgIFEgPSBmdW5jdGlvbiBRKHQsIGUpIHtcbiAgICB0dFtKXSA9IHQsIHR0W0ogKyAxXSA9IGUsIEogKz0gMiwgMiA9PT0gSiAmJiAoRyA/IEcoYSkgOiBIKCkpO1xuICB9LFxuICAgICAgUiA9IFwidW5kZWZpbmVkXCIgIT0gdHlwZW9mIHdpbmRvdyA/IHdpbmRvdyA6IHZvaWQgMCxcbiAgICAgIFYgPSBSIHx8IHt9LFxuICAgICAgWCA9IFYuTXV0YXRpb25PYnNlcnZlciB8fCBWLldlYktpdE11dGF0aW9uT2JzZXJ2ZXIsXG4gICAgICBaID0gXCJ1bmRlZmluZWRcIiA9PSB0eXBlb2Ygc2VsZiAmJiBcInVuZGVmaW5lZFwiICE9IHR5cGVvZiBwcm9jZXNzICYmIFwiW29iamVjdCBwcm9jZXNzXVwiID09PSAoe30pLnRvU3RyaW5nLmNhbGwocHJvY2VzcyksXG4gICAgICAkID0gXCJ1bmRlZmluZWRcIiAhPSB0eXBlb2YgVWludDhDbGFtcGVkQXJyYXkgJiYgXCJ1bmRlZmluZWRcIiAhPSB0eXBlb2YgaW1wb3J0U2NyaXB0cyAmJiBcInVuZGVmaW5lZFwiICE9IHR5cGVvZiBNZXNzYWdlQ2hhbm5lbCxcbiAgICAgIHR0ID0gbmV3IEFycmF5KDEwMDApO0ggPSBaID8gbygpIDogWCA/IHMoKSA6ICQgPyB1KCkgOiB2b2lkIDAgPT09IFIgJiYgXCJmdW5jdGlvblwiID09IHR5cGVvZiByZXF1aXJlID8gZigpIDogYygpO3ZhciBldCA9IGwsXG4gICAgICBudCA9IGgsXG4gICAgICBydCA9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygxNiksXG4gICAgICBvdCA9IHZvaWQgMCxcbiAgICAgIGl0ID0gMSxcbiAgICAgIHN0ID0gMixcbiAgICAgIHV0ID0gbmV3IE0oKSxcbiAgICAgIGN0ID0gbmV3IE0oKSxcbiAgICAgIGF0ID0gMCxcbiAgICAgIGZ0ID0gWSxcbiAgICAgIGx0ID0gcSxcbiAgICAgIGh0ID0gRixcbiAgICAgIHB0ID0gTDtMLmFsbCA9IGZ0LCBMLnJhY2UgPSBsdCwgTC5yZXNvbHZlID0gbnQsIEwucmVqZWN0ID0gaHQsIEwuX3NldFNjaGVkdWxlciA9IG4sIEwuX3NldEFzYXAgPSByLCBMLl9hc2FwID0gUSwgTC5wcm90b3R5cGUgPSB7IGNvbnN0cnVjdG9yOiBMLCB0aGVuOiBldCwgXCJjYXRjaFwiOiBmdW5jdGlvbiBfY2F0Y2godCkge1xuICAgICAgcmV0dXJuIHRoaXMudGhlbihudWxsLCB0KTtcbiAgICB9IH07dmFyIF90ID0gTjtOLnByb3RvdHlwZS5fZW51bWVyYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIGZvciAodmFyIHQgPSB0aGlzLmxlbmd0aCwgZSA9IHRoaXMuX2lucHV0LCBuID0gMDsgdGhpcy5fc3RhdGUgPT09IG90ICYmIHQgPiBuOyBuKyspIHRoaXMuX2VhY2hFbnRyeShlW25dLCBuKTtcbiAgfSwgTi5wcm90b3R5cGUuX2VhY2hFbnRyeSA9IGZ1bmN0aW9uICh0LCBlKSB7XG4gICAgdmFyIG4gPSB0aGlzLl9pbnN0YW5jZUNvbnN0cnVjdG9yLFxuICAgICAgICByID0gbi5yZXNvbHZlO2lmIChyID09PSBudCkge1xuICAgICAgdmFyIG8gPSB2KHQpO2lmIChvID09PSBldCAmJiB0Ll9zdGF0ZSAhPT0gb3QpIHRoaXMuX3NldHRsZWRBdCh0Ll9zdGF0ZSwgZSwgdC5fcmVzdWx0KTtlbHNlIGlmIChcImZ1bmN0aW9uXCIgIT0gdHlwZW9mIG8pIHRoaXMuX3JlbWFpbmluZy0tLCB0aGlzLl9yZXN1bHRbZV0gPSB0O2Vsc2UgaWYgKG4gPT09IHB0KSB7XG4gICAgICAgIHZhciBpID0gbmV3IG4ocCk7dyhpLCB0LCBvKSwgdGhpcy5fd2lsbFNldHRsZUF0KGksIGUpO1xuICAgICAgfSBlbHNlIHRoaXMuX3dpbGxTZXR0bGVBdChuZXcgbihmdW5jdGlvbiAoZSkge1xuICAgICAgICBlKHQpO1xuICAgICAgfSksIGUpO1xuICAgIH0gZWxzZSB0aGlzLl93aWxsU2V0dGxlQXQocih0KSwgZSk7XG4gIH0sIE4ucHJvdG90eXBlLl9zZXR0bGVkQXQgPSBmdW5jdGlvbiAodCwgZSwgbikge1xuICAgIHZhciByID0gdGhpcy5wcm9taXNlO3IuX3N0YXRlID09PSBvdCAmJiAodGhpcy5fcmVtYWluaW5nLS0sIHQgPT09IHN0ID8gaihyLCBuKSA6IHRoaXMuX3Jlc3VsdFtlXSA9IG4pLCAwID09PSB0aGlzLl9yZW1haW5pbmcgJiYgUyhyLCB0aGlzLl9yZXN1bHQpO1xuICB9LCBOLnByb3RvdHlwZS5fd2lsbFNldHRsZUF0ID0gZnVuY3Rpb24gKHQsIGUpIHtcbiAgICB2YXIgbiA9IHRoaXM7RSh0LCB2b2lkIDAsIGZ1bmN0aW9uICh0KSB7XG4gICAgICBuLl9zZXR0bGVkQXQoaXQsIGUsIHQpO1xuICAgIH0sIGZ1bmN0aW9uICh0KSB7XG4gICAgICBuLl9zZXR0bGVkQXQoc3QsIGUsIHQpO1xuICAgIH0pO1xuICB9O3ZhciBkdCA9IFcsXG4gICAgICB2dCA9IHsgUHJvbWlzZTogcHQsIHBvbHlmaWxsOiBkdCB9O1wiZnVuY3Rpb25cIiA9PSB0eXBlb2YgZGVmaW5lICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB2dDtcbiAgfSkgOiBcInVuZGVmaW5lZFwiICE9IHR5cGVvZiBtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMgPyBtb2R1bGUuZXhwb3J0cyA9IHZ0IDogXCJ1bmRlZmluZWRcIiAhPSB0eXBlb2YgdGhpcyAmJiAodGhpcy5FUzZQcm9taXNlID0gdnQpLCBkdCgpO1xufSkuY2FsbCh1bmRlZmluZWQpO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZSgnX3Byb2Nlc3MnKSx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ6dXRmLTg7YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiSWtNNkwxVnpaWEp6TDFOaGJYVmxiQzlFYjJOMWJXVnVkSE12YjNKaUxXTnNhV1Z1ZEM5emNtTXZiR2xpTDJWek5pMXdjbTl0YVhObExtMXBiaTVxY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pT3pzN096czdPenM3T3p0QlFWRkJMRU5CUVVNc1dVRkJWVHRCUVVGRExHTkJRVmtzUTBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNN1FVRkJReXhYUVVGTkxGVkJRVlVzU1VGQlJTeFBRVUZQTEVOQlFVTXNTVUZCUlN4UlFVRlJMRWxCUVVVc1QwRkJUeXhEUVVGRExFbEJRVVVzU1VGQlNTeExRVUZITEVOQlFVTXNRMEZCUVR0SFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF6dEJRVUZETEZkQlFVMHNWVUZCVlN4SlFVRkZMRTlCUVU4c1EwRkJReXhEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRPMEZCUVVNc1MwRkJReXhIUVVGRExFTkJRVU1zUTBGQlFUdEhRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJRenRCUVVGRExFdEJRVU1zUjBGQlF5eERRVUZETEVOQlFVRTdSMEZCUXl4VFFVRlRMRU5CUVVNc1IwRkJSVHRCUVVGRExGZEJRVThzV1VGQlZUdEJRVUZETEdGQlFVOHNRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVUU3UzBGQlF5eERRVUZCTzBkQlFVTXNVMEZCVXl4RFFVRkRMRWRCUVVVN1FVRkJReXhYUVVGUExGbEJRVlU3UVVGQlF5eFBRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVFN1MwRkJReXhEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVkQlFVVTdRVUZCUXl4UlFVRkpMRU5CUVVNc1IwRkJReXhEUVVGRE8xRkJRVU1zUTBGQlF5eEhRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVGRExFTkJRVU1zUjBGQlF5eFJRVUZSTEVOQlFVTXNZMEZCWXl4RFFVRkRMRVZCUVVVc1EwRkJReXhEUVVGRExGRkJRVThzUTBGQlF5eERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRVZCUVVNc1JVRkJReXhoUVVGaExFVkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkRMRmxCUVZVN1FVRkJReXhQUVVGRExFTkJRVU1zU1VGQlNTeEhRVUZETEVOQlFVTXNSMEZCUXl4RlFVRkZMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVUU3UzBGQlF5eERRVUZCTEVOQlFVRTdSMEZCUXl4VFFVRlRMRU5CUVVNc1IwRkJSVHRCUVVGRExGRkJRVWtzUTBGQlF5eEhRVUZETEVsQlFVa3NZMEZCWXl4RlFVRkJMRU5CUVVNc1VVRkJUeXhEUVVGRExFTkJRVU1zUzBGQlN5eERRVUZETEZOQlFWTXNSMEZCUXl4RFFVRkRMRVZCUVVNc1dVRkJWVHRCUVVGRExFOUJRVU1zUTBGQlF5eExRVUZMTEVOQlFVTXNWMEZCVnl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGQk8wdEJRVU1zUTBGQlFTeERRVUZCTzBkQlFVTXNVMEZCVXl4RFFVRkRMRWRCUVVVN1FVRkJReXhYUVVGUExGbEJRVlU3UVVGQlF5eG5Ra0ZCVlN4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlFUdExRVUZETEVOQlFVRTdSMEZCUXl4VFFVRlRMRU5CUVVNc1IwRkJSVHRCUVVGRExGTkJRVWtzU1VGQlNTeERRVUZETEVkQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eEpRVUZGTEVOQlFVTXNSVUZCUXp0QlFVRkRMRlZCUVVrc1EwRkJReXhIUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTTdWVUZCUXl4RFFVRkRMRWRCUVVNc1JVRkJSU3hEUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkRMRXRCUVVzc1EwRkJReXhGUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVNc1MwRkJTeXhEUVVGRExFTkJRVUU3UzBGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFZEJRVVU3UVVGQlF5eFJRVUZITzBGQlFVTXNWVUZCU1N4RFFVRkRMRWRCUVVNc1QwRkJUenRWUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1VVRkJUeXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEZOQlFWTXNTVUZCUlN4RFFVRkRMRU5CUVVNc1dVRkJXU3hGUVVGRExFTkJRVU1zUlVGQlJTeERRVUZCTEVOQlFVRTdTMEZCUXl4RFFVRkJMRTlCUVUwc1EwRkJReXhGUVVGRE8wRkJRVU1zWVVGQlR5eERRVUZETEVWQlFVVXNRMEZCUVR0TFFVRkRPMGRCUVVNc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXp0QlFVRkRMRkZCUVVrc1EwRkJReXhIUVVGRExFbEJRVWs3VVVGQlF5eERRVUZETEVkQlFVTXNTVUZCU1N4SlFVRkpMRU5CUVVNc1YwRkJWeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEV0QlFVc3NRMEZCUXl4TFFVRkhMRU5CUVVNc1EwRkJReXhGUVVGRkxFTkJRVU1zU1VGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEUxQlFVMHNRMEZCUXl4SlFVRkhMRU5CUVVNc1JVRkJRenRCUVVGRExGVkJRVWtzUTBGQlF5eEhRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEZsQlFWVTdRVUZCUXl4VFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGQk8wOUJRVU1zUTBGQlF5eERRVUZCTzB0QlFVTXNUVUZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVUU3UjBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNN1FVRkJReXhSUVVGSkxFTkJRVU1zUjBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCUnl4RFFVRkRMRWxCUVVVc1VVRkJVU3hKUVVGRkxFOUJRVThzUTBGQlF5eEpRVUZGTEVOQlFVTXNRMEZCUXl4WFFVRlhMRXRCUVVjc1EwRkJRenRCUVVGRExHRkJRVThzUTBGQlF5eERRVUZETzB0QlFVRXNTVUZCU1N4RFFVRkRMRWRCUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNVVUZCVHl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUVN4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFZEJRVVVzUlVGQlJTeFRRVUZUTEVOQlFVTXNSMEZCUlR0QlFVRkRMRmRCUVU4c1NVRkJTU3hUUVVGVExFTkJRVU1zTUVOQlFUQkRMRU5CUVVNc1EwRkJRVHRIUVVGRExGTkJRVk1zUTBGQlF5eEhRVUZGTzBGQlFVTXNWMEZCVHl4SlFVRkpMRk5CUVZNc1EwRkJReXh6UkVGQmMwUXNRMEZCUXl4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETzBGQlFVTXNVVUZCUnp0QlFVRkRMR0ZCUVU4c1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlFUdExRVUZETEVOQlFVRXNUMEZCVFN4RFFVRkRMRVZCUVVNN1FVRkJReXhqUVVGUExFVkJRVVVzUTBGQlF5eExRVUZMTEVkQlFVTXNRMEZCUXl4RlFVRkRMRVZCUVVVc1EwRkJRU3hEUVVGQk8wdEJRVU03UjBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVTTdRVUZCUXl4UlFVRkhPMEZCUVVNc1QwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1EwRkJReXhEUVVGQk8wdEJRVU1zUTBGQlFTeFBRVUZOTEVOQlFVTXNSVUZCUXp0QlFVRkRMR0ZCUVU4c1EwRkJReXhEUVVGQk8wdEJRVU03UjBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF6dEJRVUZETEV0QlFVTXNRMEZCUXl4VlFVRlRMRU5CUVVNc1JVRkJRenRCUVVGRExGVkJRVWtzUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXp0VlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXl4VlFVRlRMRU5CUVVNc1JVRkJRenRCUVVGRExGTkJRVU1zUzBGQlJ5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhMUVVGSExFTkJRVU1zUjBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVFc1FVRkJReXhEUVVGQk8wOUJRVU1zUlVGQlF5eFZRVUZUTEVOQlFVTXNSVUZCUXp0QlFVRkRMRk5CUVVNc1MwRkJSeXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlFTeEJRVUZETEVOQlFVRTdUMEZCUXl4RlFVRkRMRlZCUVZVc1NVRkJSU3hEUVVGRExFTkJRVU1zVFVGQlRTeEpRVUZGTEd0Q1FVRnJRaXhEUVVGQkxFRkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SlFVRkZMRU5CUVVNc1MwRkJSeXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlFTeEJRVUZETEVOQlFVRTdTMEZCUXl4RlFVRkRMRU5CUVVNc1EwRkJReXhEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1JVRkJRenRCUVVGRExFdEJRVU1zUTBGQlF5eE5RVUZOTEV0QlFVY3NSVUZCUlN4SFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEU5QlFVOHNRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhOUVVGTkxFdEJRVWNzUlVGQlJTeEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFOUJRVThzUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1MwRkJTeXhEUVVGRExFVkJRVU1zVlVGQlV5eERRVUZETEVWQlFVTTdRVUZCUXl4UFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUTBGQlF5eERRVUZCTzB0QlFVTXNSVUZCUXl4VlFVRlRMRU5CUVVNc1JVRkJRenRCUVVGRExFOUJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVFN1MwRkJReXhEUVVGRExFTkJRVUU3UjBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF6dEJRVUZETEV0QlFVTXNRMEZCUXl4WFFVRlhMRXRCUVVjc1EwRkJReXhEUVVGRExGZEJRVmNzU1VGQlJTeERRVUZETEV0QlFVY3NSVUZCUlN4SlFVRkZMRmRCUVZjc1EwRkJReXhQUVVGUExFdEJRVWNzUlVGQlJTeEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eExRVUZITEVWQlFVVXNSMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFVkJRVVVzUTBGQlF5eExRVUZMTEVOQlFVTXNSMEZCUXl4TFFVRkxMRU5CUVVNc1MwRkJSeXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlFUdEhRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFVkJRVU03UVVGQlF5eExRVUZETEV0QlFVY3NRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eEZRVUZGTEVOQlFVTXNSMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlFUdEhRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJRenRCUVVGRExFdEJRVU1zUTBGQlF5eFJRVUZSTEVsQlFVVXNRMEZCUXl4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRExFTkJRVU1zVDBGQlR5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1JVRkJRenRCUVVGRExFdEJRVU1zUTBGQlF5eE5RVUZOTEV0QlFVY3NSVUZCUlN4TFFVRkhMRU5CUVVNc1EwRkJReXhQUVVGUExFZEJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRWRCUVVNc1JVRkJSU3hGUVVGRExFTkJRVU1zUzBGQlJ5eERRVUZETEVOQlFVTXNXVUZCV1N4RFFVRkRMRTFCUVUwc1NVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkJMRUZCUVVNc1EwRkJRVHRIUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNN1FVRkJReXhMUVVGRExFTkJRVU1zVFVGQlRTeExRVUZITEVWQlFVVXNTMEZCUnl4RFFVRkRMRU5CUVVNc1RVRkJUU3hIUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4SFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkJMRUZCUVVNc1EwRkJRVHRIUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF6dEJRVUZETEZGQlFVa3NRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhaUVVGWk8xRkJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRExGRkJRVkVzUjBGQlF5eEpRVUZKTEVWQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkRMRVZCUVVVc1EwRkJReXhIUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkRMRVZCUVVVc1EwRkJReXhIUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEV0QlFVY3NRMEZCUXl4SlFVRkZMRU5CUVVNc1EwRkJReXhOUVVGTkxFbEJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRVHRIUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXp0QlFVRkRMRkZCUVVrc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eFpRVUZaTzFGQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhOUVVGTkxFTkJRVU1zU1VGQlJ5eERRVUZETEV0QlFVY3NRMEZCUXl4RFFVRkRMRTFCUVUwc1JVRkJRenRCUVVGRExGZEJRVWtzU1VGQlNTeERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zVDBGQlR5eEZRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eE5RVUZOTEVWQlFVTXNRMEZCUXl4SlFVRkZMRU5CUVVNc1JVRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhaUVVGWkxFTkJRVU1zVFVGQlRTeEhRVUZETEVOQlFVTXNRMEZCUVR0TFFVRkRPMGRCUVVNc1UwRkJVeXhEUVVGRExFZEJRVVU3UVVGQlF5eFJRVUZKTEVOQlFVTXNTMEZCU3l4SFFVRkRMRWxCUVVrc1EwRkJRVHRIUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNN1FVRkJReXhSUVVGSE8wRkJRVU1zWVVGQlR5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVFN1MwRkJReXhEUVVGQkxFOUJRVTBzUTBGQlF5eEZRVUZETzBGQlFVTXNZMEZCVHl4RlFVRkZMRU5CUVVNc1MwRkJTeXhIUVVGRExFTkJRVU1zUlVGQlF5eEZRVUZGTEVOQlFVRXNRMEZCUVR0TFFVRkRPMGRCUVVNc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRE8wRkJRVU1zVVVGQlNTeERRVUZETzFGQlFVTXNRMEZCUXp0UlFVRkRMRU5CUVVNN1VVRkJReXhEUVVGRE8xRkJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhKUVVGSExFTkJRVU1zUlVGQlF6dEJRVUZETEZkQlFVY3NRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4TFFVRkhMRVZCUVVVc1NVRkJSU3hEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhMUVVGTExFVkJRVU1zUTBGQlF5eEhRVUZETEVsQlFVa3NRMEZCUVN4SFFVRkZMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEV0QlFVY3NRMEZCUXl4RFFVRkJPMEZCUVVNc1pVRkJUeXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1EwRkJRVHRQUVVGQk8wdEJRVU1zVFVGQlN5eERRVUZETEVkQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNUVUZCVFN4TFFVRkhMRVZCUVVVc1MwRkJSeXhEUVVGRExFbEJRVVVzUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eExRVUZITEVWQlFVVXNSMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNTMEZCUnl4RlFVRkZMRWxCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUVN4QlFVRkRMRU5CUVVFN1IwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkRPMEZCUVVNc1VVRkJSenRCUVVGRExFOUJRVU1zUTBGQlF5eFZRVUZUTEVOQlFVTXNSVUZCUXp0QlFVRkRMRk5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVOQlFVRTdUMEZCUXl4RlFVRkRMRlZCUVZNc1EwRkJReXhGUVVGRE8wRkJRVU1zVTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRVHRQUVVGRExFTkJRVU1zUTBGQlFUdExRVUZETEVOQlFVRXNUMEZCVFN4RFFVRkRMRVZCUVVNN1FVRkJReXhQUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkJPMHRCUVVNN1IwRkJReXhUUVVGVExFTkJRVU1zUjBGQlJUdEJRVUZETEZkQlFVOHNSVUZCUlN4RlFVRkZMRU5CUVVFN1IwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTTdRVUZCUXl4TFFVRkRMRU5CUVVNc1JVRkJSU3hEUVVGRExFZEJRVU1zUlVGQlJTeEZRVUZGTEVWQlFVTXNRMEZCUXl4RFFVRkRMRTFCUVUwc1IwRkJReXhMUVVGTExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4SFFVRkRMRXRCUVVzc1EwRkJReXhGUVVGRExFTkJRVU1zUTBGQlF5eFpRVUZaTEVkQlFVTXNSVUZCUlN4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETzBGQlFVTXNWMEZCVHl4SlFVRkpMRVZCUVVVc1EwRkJReXhKUVVGSkxFVkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETzBGQlFVTXNVVUZCU1N4RFFVRkRMRWRCUVVNc1NVRkJTU3hEUVVGRExFOUJRVThzU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGRExGVkJRVk1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXp0QlFVRkRMRmRCUVVrc1NVRkJTU3hEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEUxQlFVMHNSVUZCUXl4RFFVRkRMRWRCUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVNc1EwRkJReXhEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkJPMHRCUVVNc1IwRkJReXhWUVVGVExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVTTdRVUZCUXl4UFFVRkRMRU5CUVVNc1NVRkJTU3hUUVVGVExFTkJRVU1zYVVOQlFXbERMRU5CUVVNc1EwRkJReXhEUVVGQk8wdEJRVU1zUTBGQlF5eERRVUZCTzBkQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRE8wRkJRVU1zVVVGQlNTeERRVUZETEVkQlFVTXNTVUZCU1R0UlFVRkRMRU5CUVVNc1IwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4UlFVRlBMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkJMRU5CUVVFN1IwRkJReXhUUVVGVExFTkJRVU1zUjBGQlJUdEJRVUZETEZWQlFVMHNTVUZCU1N4VFFVRlRMRU5CUVVNc2IwWkJRVzlHTEVOQlFVTXNRMEZCUVR0SFFVRkRMRk5CUVZNc1EwRkJReXhIUVVGRk8wRkJRVU1zVlVGQlRTeEpRVUZKTEZOQlFWTXNRMEZCUXl4MVNFRkJkVWdzUTBGQlF5eERRVUZCTzBkQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRE8wRkJRVU1zVVVGQlNTeERRVUZETEVWQlFVVXNRMEZCUXl4SFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVkQlFVTXNTVUZCU1N4RFFVRkRMRTFCUVUwc1IwRkJReXhMUVVGTExFTkJRVU1zUlVGQlF5eEpRVUZKTEVOQlFVTXNXVUZCV1N4SFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFdEJRVWNzUTBGQlF5eExRVUZITEZWQlFWVXNTVUZCUlN4UFFVRlBMRU5CUVVNc1NVRkJSU3hEUVVGRExFVkJRVVVzUlVGQlF5eEpRVUZKTEZsQlFWa3NRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhKUVVGSkxFVkJRVU1zUTBGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVFc1FVRkJReXhEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1JVRkJRenRCUVVGRExGRkJRVWtzUTBGQlF5eHZRa0ZCYjBJc1IwRkJReXhEUVVGRExFVkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNSMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRVZCUVVVc1EwRkJReXhKUVVGRkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRVZCUVVNc1MwRkJTeXhEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETEVOQlFVTXNTVUZCUlN4SlFVRkpMRU5CUVVNc1RVRkJUU3hIUVVGRExFTkJRVU1zUlVGQlF5eEpRVUZKTEVOQlFVTXNUVUZCVFN4SFFVRkRMRU5CUVVNc1EwRkJReXhOUVVGTkxFVkJRVU1zU1VGQlNTeERRVUZETEZWQlFWVXNSMEZCUXl4RFFVRkRMRU5CUVVNc1RVRkJUU3hGUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVkQlFVTXNTVUZCU1N4TFFVRkxMRU5CUVVNc1NVRkJTU3hEUVVGRExFMUJRVTBzUTBGQlF5eEZRVUZETEVOQlFVTXNTMEZCUnl4SlFVRkpMRU5CUVVNc1RVRkJUU3hIUVVGRExFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RlFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zU1VGQlJTeEpRVUZKTEVOQlFVTXNUVUZCVFN4SFFVRkRMRWxCUVVrc1EwRkJReXhOUVVGTkxFbEJRVVVzUTBGQlF5eEZRVUZETEVsQlFVa3NRMEZCUXl4VlFVRlZMRVZCUVVVc1JVRkJReXhEUVVGRExFdEJRVWNzU1VGQlNTeERRVUZETEZWQlFWVXNTVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFOUJRVThzUlVGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVFc1FVRkJReXhEUVVGQkxFZEJRVVVzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4UFFVRlBMRVZCUVVNc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlFUdEhRVUZETEZOQlFWTXNRMEZCUXl4SFFVRkZPMEZCUVVNc1YwRkJUeXhKUVVGSkxFdEJRVXNzUTBGQlF5eDVRMEZCZVVNc1EwRkJReXhEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVkQlFVVTdRVUZCUXl4UlFVRkpMRU5CUVVNc1EwRkJReXhKUVVGSExGZEJRVmNzU1VGQlJTeFBRVUZQTEUxQlFVMHNSVUZCUXl4RFFVRkRMRWRCUVVNc1RVRkJUU3hEUVVGRExFdEJRVXNzU1VGQlJ5eFhRVUZYTEVsQlFVVXNUMEZCVHl4SlFVRkpMRVZCUVVNc1EwRkJReXhIUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVsQlFVYzdRVUZCUXl4UFFVRkRMRWRCUVVNc1VVRkJVU3hEUVVGRExHRkJRV0VzUTBGQlF5eEZRVUZGTEVOQlFVRTdTMEZCUXl4RFFVRkJMRTlCUVUwc1EwRkJReXhGUVVGRE8wRkJRVU1zV1VGQlRTeEpRVUZKTEV0QlFVc3NRMEZCUXl3d1JVRkJNRVVzUTBGQlF5eERRVUZCTzB0QlFVTXNTVUZCU1N4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SlFVRkZMR3RDUVVGclFpeExRVUZITEUxQlFVMHNRMEZCUXl4VFFVRlRMRU5CUVVNc1VVRkJVU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4RlFVRkZMRU5CUVVNc1NVRkJSU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZCTEV0QlFVa3NRMEZCUXl4RFFVRkRMRTlCUVU4c1IwRkJReXhGUVVGRkxFTkJRVUVzUVVGQlF5eERRVUZCTzBkQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGRExFdEJRVXNzUTBGQlF5eFBRVUZQTEVkQlFVTXNTMEZCU3l4RFFVRkRMRTlCUVU4c1IwRkJReXhWUVVGVExFTkJRVU1zUlVGQlF6dEJRVUZETEZkQlFVMHNaMEpCUVdkQ0xFdEJRVWNzVFVGQlRTeERRVUZETEZOQlFWTXNRMEZCUXl4UlFVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZCTzBkQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNN1RVRkJReXhEUVVGRE8wMUJRVU1zUTBGQlF6dE5RVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRPMDFCUVVNc1EwRkJReXhIUVVGRExFTkJRVU03VFVGQlF5eERRVUZETEVkQlFVTXNWMEZCVXl4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRE8wRkJRVU1zVFVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNc1JVRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFbEJRVVVzUTBGQlF5eEZRVUZETEVOQlFVTXNTMEZCUnl4RFFVRkRMRXRCUVVjc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRVZCUVVVc1EwRkJRU3hCUVVGRExFTkJRVUU3UjBGQlF6dE5RVUZETEVOQlFVTXNSMEZCUXl4WFFVRlhMRWxCUVVVc1QwRkJUeXhOUVVGTkxFZEJRVU1zVFVGQlRTeEhRVUZETEV0QlFVc3NRMEZCUXp0TlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFbEJRVVVzUlVGQlJUdE5RVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRU5CUVVNc1owSkJRV2RDTEVsQlFVVXNRMEZCUXl4RFFVRkRMSE5DUVVGelFqdE5RVUZETEVOQlFVTXNSMEZCUXl4WFFVRlhMRWxCUVVVc1QwRkJUeXhKUVVGSkxFbEJRVVVzVjBGQlZ5eEpRVUZGTEU5QlFVOHNUMEZCVHl4SlFVRkZMR3RDUVVGclFpeExRVUZITEVOQlFVRXNSMEZCUlN4RFFVRkRMRkZCUVZFc1EwRkJReXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETzAxQlFVTXNRMEZCUXl4SFFVRkRMRmRCUVZjc1NVRkJSU3hQUVVGUExHbENRVUZwUWl4SlFVRkZMRmRCUVZjc1NVRkJSU3hQUVVGUExHRkJRV0VzU1VGQlJTeFhRVUZYTEVsQlFVVXNUMEZCVHl4alFVRmpPMDFCUVVNc1JVRkJSU3hIUVVGRExFbEJRVWtzUzBGQlN5eERRVUZETEVsQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eEZRVUZGTEVkQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNc1JVRkJSU3hIUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVWQlFVVXNSMEZCUXl4TFFVRkxMRU5CUVVNc1MwRkJSeXhEUVVGRExFbEJRVVVzVlVGQlZTeEpRVUZGTEU5QlFVOHNUMEZCVHl4SFFVRkRMRU5CUVVNc1JVRkJSU3hIUVVGRExFTkJRVU1zUlVGQlJTeERRVUZETEVsQlFVa3NSVUZCUlN4SFFVRkRMRU5CUVVNN1RVRkJReXhGUVVGRkxFZEJRVU1zUTBGQlF6dE5RVUZETEVWQlFVVXNSMEZCUXl4SlFVRkpMRU5CUVVNc1RVRkJUU3hGUVVGRkxFTkJRVU1zVVVGQlVTeERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRMRk5CUVZNc1EwRkJReXhGUVVGRkxFTkJRVU03VFVGQlF5eEZRVUZGTEVkQlFVTXNTMEZCU3l4RFFVRkRPMDFCUVVNc1JVRkJSU3hIUVVGRExFTkJRVU03VFVGQlF5eEZRVUZGTEVkQlFVTXNRMEZCUXp0TlFVRkRMRVZCUVVVc1IwRkJReXhKUVVGSkxFTkJRVU1zUlVGQlFUdE5RVUZETEVWQlFVVXNSMEZCUXl4SlFVRkpMRU5CUVVNc1JVRkJRVHROUVVGRExFVkJRVVVzUjBGQlF5eERRVUZETzAxQlFVTXNSVUZCUlN4SFFVRkRMRU5CUVVNN1RVRkJReXhGUVVGRkxFZEJRVU1zUTBGQlF6dE5RVUZETEVWQlFVVXNSMEZCUXl4RFFVRkRPMDFCUVVNc1JVRkJSU3hIUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUnl4SFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFTkJRVU1zU1VGQlNTeEhRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRU5CUVVNc1QwRkJUeXhIUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEVOQlFVTXNUVUZCVFN4SFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFTkJRVU1zWVVGQllTeEhRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1VVRkJVU3hIUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNTMEZCU3l4SFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zVTBGQlV5eEhRVUZETEVWQlFVTXNWMEZCVnl4RlFVRkRMRU5CUVVNc1JVRkJReXhKUVVGSkxFVkJRVU1zUlVGQlJTeEZRVUZETEU5QlFVOHNSVUZCUXl4blFrRkJVeXhEUVVGRExFVkJRVU03UVVGQlF5eGhRVUZQTEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hGUVVGRExFTkJRVU1zUTBGQlF5eERRVUZCTzB0QlFVTXNSVUZCUXl4RFFVRkRMRWxCUVVrc1JVRkJSU3hIUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNVMEZCVXl4RFFVRkRMRlZCUVZVc1IwRkJReXhaUVVGVk8wRkJRVU1zVTBGQlNTeEpRVUZKTEVOQlFVTXNSMEZCUXl4SlFVRkpMRU5CUVVNc1RVRkJUU3hGUVVGRExFTkJRVU1zUjBGQlF5eEpRVUZKTEVOQlFVTXNUVUZCVFN4RlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFVkJRVU1zU1VGQlNTeERRVUZETEUxQlFVMHNTMEZCUnl4RlFVRkZMRWxCUVVVc1EwRkJReXhIUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVVXNSVUZCUXl4SlFVRkpMRU5CUVVNc1ZVRkJWU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRVHRIUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEZOQlFWTXNRMEZCUXl4VlFVRlZMRWRCUVVNc1ZVRkJVeXhEUVVGRExFVkJRVU1zUTBGQlF5eEZRVUZETzBGQlFVTXNVVUZCU1N4RFFVRkRMRWRCUVVNc1NVRkJTU3hEUVVGRExHOUNRVUZ2UWp0UlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zVDBGQlR5eERRVUZETEVsQlFVY3NRMEZCUXl4TFFVRkhMRVZCUVVVc1JVRkJRenRCUVVGRExGVkJRVWtzUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhKUVVGSExFTkJRVU1zUzBGQlJ5eEZRVUZGTEVsQlFVVXNRMEZCUXl4RFFVRkRMRTFCUVUwc1MwRkJSeXhGUVVGRkxFVkJRVU1zU1VGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1RVRkJUU3hGUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1MwRkJTeXhKUVVGSExGVkJRVlVzU1VGQlJTeFBRVUZQTEVOQlFVTXNSVUZCUXl4SlFVRkpMRU5CUVVNc1ZVRkJWU3hGUVVGRkxFVkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zUzBGQlN5eEpRVUZITEVOQlFVTXNTMEZCUnl4RlFVRkZMRVZCUVVNN1FVRkJReXhaUVVGSkxFTkJRVU1zUjBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRVHRQUVVGRExFMUJRVXNzU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhWUVVGVExFTkJRVU1zUlVGQlF6dEJRVUZETEZOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRVHRQUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUVR0TFFVRkRMRTFCUVVzc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFTkJRVUU3UjBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUXl4VFFVRlRMRU5CUVVNc1ZVRkJWU3hIUVVGRExGVkJRVk1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNN1FVRkJReXhSUVVGSkxFTkJRVU1zUjBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJReXhOUVVGTkxFdEJRVWNzUlVGQlJTeExRVUZITEVsQlFVa3NRMEZCUXl4VlFVRlZMRVZCUVVVc1JVRkJReXhEUVVGRExFdEJRVWNzUlVGQlJTeEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFZEJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVUVzUVVGQlF5eEZRVUZETEVOQlFVTXNTMEZCUnl4SlFVRkpMRU5CUVVNc1ZVRkJWU3hKUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGQk8wZEJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNVMEZCVXl4RFFVRkRMR0ZCUVdFc1IwRkJReXhWUVVGVExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVTTdRVUZCUXl4UlFVRkpMRU5CUVVNc1IwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4TFFVRkxMRU5CUVVNc1JVRkJReXhWUVVGVExFTkJRVU1zUlVGQlF6dEJRVUZETEU5QlFVTXNRMEZCUXl4VlFVRlZMRU5CUVVNc1JVRkJSU3hGUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUVR0TFFVRkRMRVZCUVVNc1ZVRkJVeXhEUVVGRExFVkJRVU03UVVGQlF5eFBRVUZETEVOQlFVTXNWVUZCVlN4RFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVOQlFVRTdTMEZCUXl4RFFVRkRMRU5CUVVFN1IwRkJReXhEUVVGRExFbEJRVWtzUlVGQlJTeEhRVUZETEVOQlFVTTdUVUZCUXl4RlFVRkZMRWRCUVVNc1JVRkJReXhQUVVGUExFVkJRVU1zUlVGQlJTeEZRVUZETEZGQlFWRXNSVUZCUXl4RlFVRkZMRVZCUVVNc1EwRkJReXhWUVVGVkxFbEJRVVVzVDBGQlR5eE5RVUZOTEVsQlFVVXNUVUZCVFN4RFFVRkRMRWRCUVVjc1IwRkJReXhOUVVGTkxFTkJRVU1zV1VGQlZUdEJRVUZETEZkQlFVOHNSVUZCUlN4RFFVRkJPMGRCUVVNc1EwRkJReXhIUVVGRExGZEJRVmNzU1VGQlJTeFBRVUZQTEUxQlFVMHNTVUZCUlN4TlFVRk5MRU5CUVVNc1QwRkJUeXhIUVVGRExFMUJRVTBzUTBGQlF5eFBRVUZQTEVkQlFVTXNSVUZCUlN4SFFVRkRMRmRCUVZjc1NVRkJSU3hQUVVGUExFbEJRVWtzUzBGQlJ5eEpRVUZKTEVOQlFVTXNWVUZCVlN4SFFVRkRMRVZCUVVVc1EwRkJRU3hCUVVGRExFVkJRVU1zUlVGQlJTeEZRVUZGTEVOQlFVRTdRMEZCUXl4RFFVRkJMRU5CUVVVc1NVRkJTU3hYUVVGTkxFTkJRVU1pTENKbWFXeGxJam9pWjJWdVpYSmhkR1ZrTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhORGIyNTBaVzUwSWpwYklpOHFJVnh5WEc0Z0tpQkFiM1psY25acFpYY2daWE0yTFhCeWIyMXBjMlVnTFNCaElIUnBibmtnYVcxd2JHVnRaVzUwWVhScGIyNGdiMllnVUhKdmJXbHpaWE12UVNzdVhISmNiaUFxSUVCamIzQjVjbWxuYUhRZ1EyOXdlWEpwWjJoMElDaGpLU0F5TURFMElGbGxhSFZrWVNCTFlYUjZMQ0JVYjIwZ1JHRnNaU3dnVTNSbFptRnVJRkJsYm01bGNpQmhibVFnWTI5dWRISnBZblYwYjNKeklDaERiMjUyWlhKemFXOXVJSFJ2SUVWVE5pQkJVRWtnWW5rZ1NtRnJaU0JCY21Ob2FXSmhiR1FwWEhKY2JpQXFJRUJzYVdObGJuTmxJQ0FnVEdsalpXNXpaV1FnZFc1a1pYSWdUVWxVSUd4cFkyVnVjMlZjY2x4dUlDb2dJQ0FnSUNBZ0lDQWdJQ0JUWldVZ2FIUjBjSE02THk5eVlYY3VaMmwwYUhWaWRYTmxjbU52Ym5SbGJuUXVZMjl0TDJwaGEyVmhjbU5vYVdKaGJHUXZaWE0yTFhCeWIyMXBjMlV2YldGemRHVnlMMHhKUTBWT1UwVmNjbHh1SUNvZ1FIWmxjbk5wYjI0Z0lDQXpMakl1TVZ4eVhHNGdLaTljY2x4dVhISmNiaWhtZFc1amRHbHZiaWdwZTF3aWRYTmxJSE4wY21samRGd2lPMloxYm1OMGFXOXVJSFFvZENsN2NtVjBkWEp1WENKbWRXNWpkR2x2Ymx3aVBUMTBlWEJsYjJZZ2RIeDhYQ0p2WW1wbFkzUmNJajA5ZEhsd1pXOW1JSFFtSm01MWJHd2hQVDEwZldaMWJtTjBhVzl1SUdVb2RDbDdjbVYwZFhKdVhDSm1kVzVqZEdsdmJsd2lQVDEwZVhCbGIyWWdkSDFtZFc1amRHbHZiaUJ1S0hRcGUwYzlkSDFtZFc1amRHbHZiaUJ5S0hRcGUxRTlkSDFtZFc1amRHbHZiaUJ2S0NsN2NtVjBkWEp1SUdaMWJtTjBhVzl1S0NsN2NISnZZMlZ6Y3k1dVpYaDBWR2xqYXloaEtYMTlablZ1WTNScGIyNGdhU2dwZTNKbGRIVnliaUJtZFc1amRHbHZiaWdwZTBJb1lTbDlmV1oxYm1OMGFXOXVJSE1vS1h0MllYSWdkRDB3TEdVOWJtVjNJRmdvWVNrc2JqMWtiMk4xYldWdWRDNWpjbVZoZEdWVVpYaDBUbTlrWlNoY0lsd2lLVHR5WlhSMWNtNGdaUzV2WW5ObGNuWmxLRzRzZTJOb1lYSmhZM1JsY2tSaGRHRTZJVEI5S1N4bWRXNWpkR2x2YmlncGUyNHVaR0YwWVQxMFBTc3JkQ1V5ZlgxbWRXNWpkR2x2YmlCMUtDbDdkbUZ5SUhROWJtVjNJRTFsYzNOaFoyVkRhR0Z1Ym1Wc08zSmxkSFZ5YmlCMExuQnZjblF4TG05dWJXVnpjMkZuWlQxaExHWjFibU4wYVc5dUtDbDdkQzV3YjNKME1pNXdiM04wVFdWemMyRm5aU2d3S1gxOVpuVnVZM1JwYjI0Z1l5Z3BlM0psZEhWeWJpQm1kVzVqZEdsdmJpZ3BlM05sZEZScGJXVnZkWFFvWVN3eEtYMTlablZ1WTNScGIyNGdZU2dwZTJadmNpaDJZWElnZEQwd08wbytkRHQwS3oweUtYdDJZWElnWlQxMGRGdDBYU3h1UFhSMFczUXJNVjA3WlNodUtTeDBkRnQwWFQxMmIybGtJREFzZEhSYmRDc3hYVDEyYjJsa0lEQjlTajB3ZldaMWJtTjBhVzl1SUdZb0tYdDBjbmw3ZG1GeUlIUTljbVZ4ZFdseVpTeGxQWFFvWENKMlpYSjBlRndpS1R0eVpYUjFjbTRnUWoxbExuSjFiazl1VEc5dmNIeDhaUzV5ZFc1UGJrTnZiblJsZUhRc2FTZ3BmV05oZEdOb0tHNHBlM0psZEhWeWJpQmpLQ2w5ZldaMWJtTjBhVzl1SUd3b2RDeGxLWHQyWVhJZ2JqMTBhR2x6TEhJOWJtVjNJSFJvYVhNdVkyOXVjM1J5ZFdOMGIzSW9jQ2s3ZG05cFpDQXdQVDA5Y2x0eWRGMG1KbXNvY2lrN2RtRnlJRzg5Ymk1ZmMzUmhkR1U3YVdZb2J5bDdkbUZ5SUdrOVlYSm5kVzFsYm5SelcyOHRNVjA3VVNobWRXNWpkR2x2YmlncGUzZ29ieXh5TEdrc2JpNWZjbVZ6ZFd4MEtYMHBmV1ZzYzJVZ1JTaHVMSElzZEN4bEtUdHlaWFIxY200Z2NuMW1kVzVqZEdsdmJpQm9LSFFwZTNaaGNpQmxQWFJvYVhNN2FXWW9kQ1ltWENKdlltcGxZM1JjSWowOWRIbHdaVzltSUhRbUpuUXVZMjl1YzNSeWRXTjBiM0k5UFQxbEtYSmxkSFZ5YmlCME8zWmhjaUJ1UFc1bGR5QmxLSEFwTzNKbGRIVnliaUJuS0c0c2RDa3NibjFtZFc1amRHbHZiaUJ3S0NsN2ZXWjFibU4wYVc5dUlGOG9LWHR5WlhSMWNtNGdibVYzSUZSNWNHVkZjbkp2Y2loY0lsbHZkU0JqWVc1dWIzUWdjbVZ6YjJ4MlpTQmhJSEJ5YjIxcGMyVWdkMmwwYUNCcGRITmxiR1pjSWlsOVpuVnVZM1JwYjI0Z1pDZ3BlM0psZEhWeWJpQnVaWGNnVkhsd1pVVnljbTl5S0Z3aVFTQndjbTl0YVhObGN5QmpZV3hzWW1GamF5QmpZVzV1YjNRZ2NtVjBkWEp1SUhSb1lYUWdjMkZ0WlNCd2NtOXRhWE5sTGx3aUtYMW1kVzVqZEdsdmJpQjJLSFFwZTNSeWVYdHlaWFIxY200Z2RDNTBhR1Z1ZldOaGRHTm9LR1VwZTNKbGRIVnliaUIxZEM1bGNuSnZjajFsTEhWMGZYMW1kVzVqZEdsdmJpQjVLSFFzWlN4dUxISXBlM1J5ZVh0MExtTmhiR3dvWlN4dUxISXBmV05oZEdOb0tHOHBlM0psZEhWeWJpQnZmWDFtZFc1amRHbHZiaUJ0S0hRc1pTeHVLWHRSS0daMWJtTjBhVzl1S0hRcGUzWmhjaUJ5UFNFeExHODllU2h1TEdVc1puVnVZM1JwYjI0b2JpbDdjbng4S0hJOUlUQXNaU0U5UFc0L1p5aDBMRzRwT2xNb2RDeHVLU2w5TEdaMWJtTjBhVzl1S0dVcGUzSjhmQ2h5UFNFd0xHb29kQ3hsS1NsOUxGd2lVMlYwZEd4bE9pQmNJaXNvZEM1ZmJHRmlaV3g4ZkZ3aUlIVnVhMjV2ZDI0Z2NISnZiV2x6WlZ3aUtTazdJWEltSm04bUppaHlQU0V3TEdvb2RDeHZLU2w5TEhRcGZXWjFibU4wYVc5dUlHSW9kQ3hsS1h0bExsOXpkR0YwWlQwOVBXbDBQMU1vZEN4bExsOXlaWE4xYkhRcE9tVXVYM04wWVhSbFBUMDljM1EvYWloMExHVXVYM0psYzNWc2RDazZSU2hsTEhadmFXUWdNQ3htZFc1amRHbHZiaWhsS1h0bktIUXNaU2w5TEdaMWJtTjBhVzl1S0dVcGUyb29kQ3hsS1gwcGZXWjFibU4wYVc5dUlIY29kQ3h1TEhJcGUyNHVZMjl1YzNSeWRXTjBiM0k5UFQxMExtTnZibk4wY25WamRHOXlKaVp5UFQwOVpYUW1KbU52Ym5OMGNuVmpkRzl5TG5KbGMyOXNkbVU5UFQxdWREOWlLSFFzYmlrNmNqMDlQWFYwUDJvb2RDeDFkQzVsY25KdmNpazZkbTlwWkNBd1BUMDljajlUS0hRc2JpazZaU2h5S1Q5dEtIUXNiaXh5S1RwVEtIUXNiaWw5Wm5WdVkzUnBiMjRnWnlobExHNHBlMlU5UFQxdVAyb29aU3hmS0NrcE9uUW9iaWsvZHlobExHNHNkaWh1S1NrNlV5aGxMRzRwZldaMWJtTjBhVzl1SUVFb2RDbDdkQzVmYjI1bGNuSnZjaVltZEM1ZmIyNWxjbkp2Y2loMExsOXlaWE4xYkhRcExGUW9kQ2w5Wm5WdVkzUnBiMjRnVXloMExHVXBlM1F1WDNOMFlYUmxQVDA5YjNRbUppaDBMbDl5WlhOMWJIUTlaU3gwTGw5emRHRjBaVDFwZEN3d0lUMDlkQzVmYzNWaWMyTnlhV0psY25NdWJHVnVaM1JvSmlaUktGUXNkQ2twZldaMWJtTjBhVzl1SUdvb2RDeGxLWHQwTGw5emRHRjBaVDA5UFc5MEppWW9kQzVmYzNSaGRHVTljM1FzZEM1ZmNtVnpkV3gwUFdVc1VTaEJMSFFwS1gxbWRXNWpkR2x2YmlCRktIUXNaU3h1TEhJcGUzWmhjaUJ2UFhRdVgzTjFZbk5qY21saVpYSnpMR2s5Ynk1c1pXNW5kR2c3ZEM1ZmIyNWxjbkp2Y2oxdWRXeHNMRzliYVYwOVpTeHZXMmtyYVhSZFBXNHNiMXRwSzNOMFhUMXlMREE5UFQxcEppWjBMbDl6ZEdGMFpTWW1VU2hVTEhRcGZXWjFibU4wYVc5dUlGUW9kQ2w3ZG1GeUlHVTlkQzVmYzNWaWMyTnlhV0psY25Nc2JqMTBMbDl6ZEdGMFpUdHBaaWd3SVQwOVpTNXNaVzVuZEdncGUyWnZjaWgyWVhJZ2NpeHZMR2s5ZEM1ZmNtVnpkV3gwTEhNOU1EdHpQR1V1YkdWdVozUm9PM01yUFRNcGNqMWxXM05kTEc4OVpWdHpLMjVkTEhJL2VDaHVMSElzYnl4cEtUcHZLR2twTzNRdVgzTjFZbk5qY21saVpYSnpMbXhsYm1kMGFEMHdmWDFtZFc1amRHbHZiaUJOS0NsN2RHaHBjeTVsY25KdmNqMXVkV3hzZldaMWJtTjBhVzl1SUZBb2RDeGxLWHQwY25sN2NtVjBkWEp1SUhRb1pTbDlZMkYwWTJnb2JpbDdjbVYwZFhKdUlHTjBMbVZ5Y205eVBXNHNZM1I5ZldaMWJtTjBhVzl1SUhnb2RDeHVMSElzYnlsN2RtRnlJR2tzY3l4MUxHTXNZVDFsS0hJcE8ybG1LR0VwZTJsbUtHazlVQ2h5TEc4cExHazlQVDFqZEQ4b1l6MGhNQ3h6UFdrdVpYSnliM0lzYVQxdWRXeHNLVHAxUFNFd0xHNDlQVDFwS1hKbGRIVnliaUIyYjJsa0lHb29iaXhrS0NrcGZXVnNjMlVnYVQxdkxIVTlJVEE3Ymk1ZmMzUmhkR1VoUFQxdmRIeDhLR0VtSm5VL1p5aHVMR2twT21NL2FpaHVMSE1wT25ROVBUMXBkRDlUS0c0c2FTazZkRDA5UFhOMEppWnFLRzRzYVNrcGZXWjFibU4wYVc5dUlFTW9kQ3hsS1h0MGNubDdaU2htZFc1amRHbHZiaWhsS1h0bktIUXNaU2w5TEdaMWJtTjBhVzl1S0dVcGUyb29kQ3hsS1gwcGZXTmhkR05vS0c0cGUyb29kQ3h1S1gxOVpuVnVZM1JwYjI0Z1R5Z3BlM0psZEhWeWJpQmhkQ3NyZldaMWJtTjBhVzl1SUdzb2RDbDdkRnR5ZEYwOVlYUXJLeXgwTGw5emRHRjBaVDEyYjJsa0lEQXNkQzVmY21WemRXeDBQWFp2YVdRZ01DeDBMbDl6ZFdKelkzSnBZbVZ5Y3oxYlhYMW1kVzVqZEdsdmJpQlpLSFFwZTNKbGRIVnliaUJ1WlhjZ1gzUW9kR2hwY3l4MEtTNXdjbTl0YVhObGZXWjFibU4wYVc5dUlIRW9kQ2w3ZG1GeUlHVTlkR2hwY3p0eVpYUjFjbTRnYm1WM0lHVW9TU2gwS1Q5bWRXNWpkR2x2YmlodUxISXBlMlp2Y2loMllYSWdiejEwTG14bGJtZDBhQ3hwUFRBN2J6NXBPMmtyS3lsbExuSmxjMjlzZG1Vb2RGdHBYU2t1ZEdobGJpaHVMSElwZlRwbWRXNWpkR2x2YmloMExHVXBlMlVvYm1WM0lGUjVjR1ZGY25KdmNpaGNJbGx2ZFNCdGRYTjBJSEJoYzNNZ1lXNGdZWEp5WVhrZ2RHOGdjbUZqWlM1Y0lpa3BmU2w5Wm5WdVkzUnBiMjRnUmloMEtYdDJZWElnWlQxMGFHbHpMRzQ5Ym1WM0lHVW9jQ2s3Y21WMGRYSnVJR29vYml4MEtTeHVmV1oxYm1OMGFXOXVJRVFvS1h0MGFISnZkeUJ1WlhjZ1ZIbHdaVVZ5Y205eUtGd2lXVzkxSUcxMWMzUWdjR0Z6Y3lCaElISmxjMjlzZG1WeUlHWjFibU4wYVc5dUlHRnpJSFJvWlNCbWFYSnpkQ0JoY21kMWJXVnVkQ0IwYnlCMGFHVWdjSEp2YldselpTQmpiMjV6ZEhKMVkzUnZjbHdpS1gxbWRXNWpkR2x2YmlCTEtDbDdkR2h5YjNjZ2JtVjNJRlI1Y0dWRmNuSnZjaWhjSWtaaGFXeGxaQ0IwYnlCamIyNXpkSEoxWTNRZ0oxQnliMjFwYzJVbk9pQlFiR1ZoYzJVZ2RYTmxJSFJvWlNBbmJtVjNKeUJ2Y0dWeVlYUnZjaXdnZEdocGN5QnZZbXBsWTNRZ1kyOXVjM1J5ZFdOMGIzSWdZMkZ1Ym05MElHSmxJR05oYkd4bFpDQmhjeUJoSUdaMWJtTjBhVzl1TGx3aUtYMW1kVzVqZEdsdmJpQk1LSFFwZTNSb2FYTmJjblJkUFU4b0tTeDBhR2x6TGw5eVpYTjFiSFE5ZEdocGN5NWZjM1JoZEdVOWRtOXBaQ0F3TEhSb2FYTXVYM04xWW5OamNtbGlaWEp6UFZ0ZExIQWhQVDEwSmlZb1hDSm1kVzVqZEdsdmJsd2lJVDEwZVhCbGIyWWdkQ1ltUkNncExIUm9hWE1nYVc1emRHRnVZMlZ2WmlCTVAwTW9kR2hwY3l4MEtUcExLQ2twZldaMWJtTjBhVzl1SUU0b2RDeGxLWHQwYUdsekxsOXBibk4wWVc1alpVTnZibk4wY25WamRHOXlQWFFzZEdocGN5NXdjbTl0YVhObFBXNWxkeUIwS0hBcExIUm9hWE11Y0hKdmJXbHpaVnR5ZEYxOGZHc29kR2hwY3k1d2NtOXRhWE5sS1N4QmNuSmhlUzVwYzBGeWNtRjVLR1VwUHloMGFHbHpMbDlwYm5CMWREMWxMSFJvYVhNdWJHVnVaM1JvUFdVdWJHVnVaM1JvTEhSb2FYTXVYM0psYldGcGJtbHVaejFsTG14bGJtZDBhQ3gwYUdsekxsOXlaWE4xYkhROWJtVjNJRUZ5Y21GNUtIUm9hWE11YkdWdVozUm9LU3d3UFQwOWRHaHBjeTVzWlc1bmRHZy9VeWgwYUdsekxuQnliMjFwYzJVc2RHaHBjeTVmY21WemRXeDBLVG9vZEdocGN5NXNaVzVuZEdnOWRHaHBjeTVzWlc1bmRHaDhmREFzZEdocGN5NWZaVzUxYldWeVlYUmxLQ2tzTUQwOVBYUm9hWE11WDNKbGJXRnBibWx1WnlZbVV5aDBhR2x6TG5CeWIyMXBjMlVzZEdocGN5NWZjbVZ6ZFd4MEtTa3BPbW9vZEdocGN5NXdjbTl0YVhObExGVW9LU2w5Wm5WdVkzUnBiMjRnVlNncGUzSmxkSFZ5YmlCdVpYY2dSWEp5YjNJb1hDSkJjbkpoZVNCTlpYUm9iMlJ6SUcxMWMzUWdZbVVnY0hKdmRtbGtaV1FnWVc0Z1FYSnlZWGxjSWlsOVpuVnVZM1JwYjI0Z1Z5Z3BlM1poY2lCME8ybG1LRndpZFc1a1pXWnBibVZrWENJaFBYUjVjR1Z2WmlCbmJHOWlZV3dwZEQxbmJHOWlZV3c3Wld4elpTQnBaaWhjSW5WdVpHVm1hVzVsWkZ3aUlUMTBlWEJsYjJZZ2MyVnNaaWwwUFhObGJHWTdaV3h6WlNCMGNubDdkRDFHZFc1amRHbHZiaWhjSW5KbGRIVnliaUIwYUdselhDSXBLQ2w5WTJGMFkyZ29aU2w3ZEdoeWIzY2dibVYzSUVWeWNtOXlLRndpY0c5c2VXWnBiR3dnWm1GcGJHVmtJR0psWTJGMWMyVWdaMnh2WW1Gc0lHOWlhbVZqZENCcGN5QjFibUYyWVdsc1lXSnNaU0JwYmlCMGFHbHpJR1Z1ZG1seWIyNXRaVzUwWENJcGZYWmhjaUJ1UFhRdVVISnZiV2x6WlRzb0lXNThmRndpVzI5aWFtVmpkQ0JRY205dGFYTmxYVndpSVQwOVQySnFaV04wTG5CeWIzUnZkSGx3WlM1MGIxTjBjbWx1Wnk1allXeHNLRzR1Y21WemIyeDJaU2dwS1h4OGJpNWpZWE4wS1NZbUtIUXVVSEp2YldselpUMXdkQ2w5ZG1GeUlIbzdlajFCY25KaGVTNXBjMEZ5Y21GNVAwRnljbUY1TG1selFYSnlZWGs2Wm5WdVkzUnBiMjRvZENsN2NtVjBkWEp1WENKYmIySnFaV04wSUVGeWNtRjVYVndpUFQwOVQySnFaV04wTG5CeWIzUnZkSGx3WlM1MGIxTjBjbWx1Wnk1allXeHNLSFFwZlR0MllYSWdRaXhITEVnc1NUMTZMRW85TUN4UlBXWjFibU4wYVc5dUtIUXNaU2w3ZEhSYlNsMDlkQ3gwZEZ0S0t6RmRQV1VzU2lzOU1pd3lQVDA5U2lZbUtFYy9SeWhoS1RwSUtDa3BmU3hTUFZ3aWRXNWtaV1pwYm1Wa1hDSWhQWFI1Y0dWdlppQjNhVzVrYjNjL2QybHVaRzkzT25admFXUWdNQ3hXUFZKOGZIdDlMRmc5Vmk1TmRYUmhkR2x2Yms5aWMyVnlkbVZ5Zkh4V0xsZGxZa3RwZEUxMWRHRjBhVzl1VDJKelpYSjJaWElzV2oxY0luVnVaR1ZtYVc1bFpGd2lQVDEwZVhCbGIyWWdjMlZzWmlZbVhDSjFibVJsWm1sdVpXUmNJaUU5ZEhsd1pXOW1JSEJ5YjJObGMzTW1KbHdpVzI5aWFtVmpkQ0J3Y205alpYTnpYVndpUFQwOWUzMHVkRzlUZEhKcGJtY3VZMkZzYkNod2NtOWpaWE56S1N3a1BWd2lkVzVrWldacGJtVmtYQ0loUFhSNWNHVnZaaUJWYVc1ME9FTnNZVzF3WldSQmNuSmhlU1ltWENKMWJtUmxabWx1WldSY0lpRTlkSGx3Wlc5bUlHbHRjRzl5ZEZOamNtbHdkSE1tSmx3aWRXNWtaV1pwYm1Wa1hDSWhQWFI1Y0dWdlppQk5aWE56WVdkbFEyaGhibTVsYkN4MGREMXVaWGNnUVhKeVlYa29NV1V6S1R0SVBWby9ieWdwT2xnL2N5Z3BPaVEvZFNncE9uWnZhV1FnTUQwOVBWSW1KbHdpWm5WdVkzUnBiMjVjSWowOWRIbHdaVzltSUhKbGNYVnBjbVUvWmlncE9tTW9LVHQyWVhJZ1pYUTliQ3h1ZEQxb0xISjBQVTFoZEdndWNtRnVaRzl0S0NrdWRHOVRkSEpwYm1jb016WXBMbk4xWW5OMGNtbHVaeWd4Tmlrc2IzUTlkbTlwWkNBd0xHbDBQVEVzYzNROU1peDFkRDF1WlhjZ1RTeGpkRDF1WlhjZ1RTeGhkRDB3TEdaMFBWa3NiSFE5Y1N4b2REMUdMSEIwUFV3N1RDNWhiR3c5Wm5Rc1RDNXlZV05sUFd4MExFd3VjbVZ6YjJ4MlpUMXVkQ3hNTG5KbGFtVmpkRDFvZEN4TUxsOXpaWFJUWTJobFpIVnNaWEk5Yml4TUxsOXpaWFJCYzJGd1BYSXNUQzVmWVhOaGNEMVJMRXd1Y0hKdmRHOTBlWEJsUFh0amIyNXpkSEoxWTNSdmNqcE1MSFJvWlc0NlpYUXNYQ0pqWVhSamFGd2lPbVoxYm1OMGFXOXVLSFFwZTNKbGRIVnliaUIwYUdsekxuUm9aVzRvYm5Wc2JDeDBLWDE5TzNaaGNpQmZkRDFPTzA0dWNISnZkRzkwZVhCbExsOWxiblZ0WlhKaGRHVTlablZ1WTNScGIyNG9LWHRtYjNJb2RtRnlJSFE5ZEdocGN5NXNaVzVuZEdnc1pUMTBhR2x6TGw5cGJuQjFkQ3h1UFRBN2RHaHBjeTVmYzNSaGRHVTlQVDF2ZENZbWRENXVPMjRyS3lsMGFHbHpMbDlsWVdOb1JXNTBjbmtvWlZ0dVhTeHVLWDBzVGk1d2NtOTBiM1I1Y0dVdVgyVmhZMmhGYm5SeWVUMW1kVzVqZEdsdmJpaDBMR1VwZTNaaGNpQnVQWFJvYVhNdVgybHVjM1JoYm1ObFEyOXVjM1J5ZFdOMGIzSXNjajF1TG5KbGMyOXNkbVU3YVdZb2NqMDlQVzUwS1h0MllYSWdiejEyS0hRcE8ybG1LRzg5UFQxbGRDWW1kQzVmYzNSaGRHVWhQVDF2ZENsMGFHbHpMbDl6WlhSMGJHVmtRWFFvZEM1ZmMzUmhkR1VzWlN4MExsOXlaWE4xYkhRcE8yVnNjMlVnYVdZb1hDSm1kVzVqZEdsdmJsd2lJVDEwZVhCbGIyWWdieWwwYUdsekxsOXlaVzFoYVc1cGJtY3RMU3gwYUdsekxsOXlaWE4xYkhSYlpWMDlkRHRsYkhObElHbG1LRzQ5UFQxd2RDbDdkbUZ5SUdrOWJtVjNJRzRvY0NrN2R5aHBMSFFzYnlrc2RHaHBjeTVmZDJsc2JGTmxkSFJzWlVGMEtHa3NaU2w5Wld4elpTQjBhR2x6TGw5M2FXeHNVMlYwZEd4bFFYUW9ibVYzSUc0b1puVnVZM1JwYjI0b1pTbDdaU2gwS1gwcExHVXBmV1ZzYzJVZ2RHaHBjeTVmZDJsc2JGTmxkSFJzWlVGMEtISW9kQ2tzWlNsOUxFNHVjSEp2ZEc5MGVYQmxMbDl6WlhSMGJHVmtRWFE5Wm5WdVkzUnBiMjRvZEN4bExHNHBlM1poY2lCeVBYUm9hWE11Y0hKdmJXbHpaVHR5TGw5emRHRjBaVDA5UFc5MEppWW9kR2hwY3k1ZmNtVnRZV2x1YVc1bkxTMHNkRDA5UFhOMFAyb29jaXh1S1RwMGFHbHpMbDl5WlhOMWJIUmJaVjA5Ymlrc01EMDlQWFJvYVhNdVgzSmxiV0ZwYm1sdVp5WW1VeWh5TEhSb2FYTXVYM0psYzNWc2RDbDlMRTR1Y0hKdmRHOTBlWEJsTGw5M2FXeHNVMlYwZEd4bFFYUTlablZ1WTNScGIyNG9kQ3hsS1h0MllYSWdiajEwYUdsek8wVW9kQ3gyYjJsa0lEQXNablZ1WTNScGIyNG9kQ2w3Ymk1ZmMyVjBkR3hsWkVGMEtHbDBMR1VzZENsOUxHWjFibU4wYVc5dUtIUXBlMjR1WDNObGRIUnNaV1JCZENoemRDeGxMSFFwZlNsOU8zWmhjaUJrZEQxWExIWjBQWHRRY205dGFYTmxPbkIwTEhCdmJIbG1hV3hzT21SMGZUdGNJbVoxYm1OMGFXOXVYQ0k5UFhSNWNHVnZaaUJrWldacGJtVW1KbVJsWm1sdVpTNWhiV1EvWkdWbWFXNWxLR1oxYm1OMGFXOXVLQ2w3Y21WMGRYSnVJSFowZlNrNlhDSjFibVJsWm1sdVpXUmNJaUU5ZEhsd1pXOW1JRzF2WkhWc1pTWW1iVzlrZFd4bExtVjRjRzl5ZEhNL2JXOWtkV3hsTG1WNGNHOXlkSE05ZG5RNlhDSjFibVJsWm1sdVpXUmNJaUU5ZEhsd1pXOW1JSFJvYVhNbUppaDBhR2x6TGtWVE5sQnliMjFwYzJVOWRuUXBMR1IwS0NsOUtTNWpZV3hzS0hSb2FYTXBPeUpkZlE9PSIsImltcG9ydCAnLi4vbGliL2VzNi1wcm9taXNlLm1pbi5qcydcclxuaW1wb3J0IFRlbXBsYXRlcyBmcm9tIFwiLi4vVGVtcGxhdGVzXCJcclxuaW1wb3J0IExvZ2luQ2hlY2sgZnJvbSBcIi4uL0xvZ2luQ2hlY2tcIlxyXG5pbXBvcnQgeyBnZXRKU09OLCByb3VuZCB9IGZyb20gXCIuLi9oZWxwZXJzXCJcclxuaW1wb3J0IEFQSSwgeyBUQkEsIGdldFRlYW1zLCBnZXRUZWFtU3RhdHMgfSBmcm9tIFwiLi4vQVBJXCJcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBldmVudChrZXkpIHtcclxuICBQcm9taXNlLmFsbChbXHJcbiAgICBMb2dpbkNoZWNrLmdldCgpLFxyXG4gICAgVGVtcGxhdGVzLmdldChcImV2ZW50XCIpLFxyXG4gICAgZ2V0SlNPTihcInN0YXRzLWNvbmZpZy5qc29uXCIpLFxyXG4gICAgVEJBLmdldChcImV2ZW50L1wiK2tleSksXHJcbiAgXSkudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgIGNvbnN0IFssIHRlbXBsYXRlLCBzdGF0cywgZXZlbnRdID0gcmVzO1xyXG4gICAgY29uc3QgJGNvbnRhaW5lciA9ICQoXCIjbWFpblwiKS5jbG9zZXN0KFwiLmNvbnRhaW5lclwiKTtcclxuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzID0gJGNvbnRhaW5lci5hdHRyKFwiY2xhc3NcIik7XHJcbiAgICBjb25zdCByYWN0aXZlID0gbmV3IFJhY3RpdmUoe1xyXG4gICAgICB0ZW1wbGF0ZTogdGVtcGxhdGUsXHJcbiAgICAgIGRhdGE6IHtcclxuICAgICAgICBrZXk6IGtleSxcclxuICAgICAgICBzdGF0Q29uZmlnOiBzdGF0cyxcclxuICAgICAgICBsb2FkaW5nOiB0cnVlLFxyXG4gICAgICAgIHRlYW1zOiBbXSxcclxuICAgICAgICByb3VuZDogcm91bmQsXHJcbiAgICAgICAgZXZlbnQ6IGV2ZW50LFxyXG4gICAgICAgIHN0YXRDb2xvcih2YWx1ZSwgc3RhdCkge1xyXG4gICAgICAgICAgY29uc3QgdmFsdWUgPSBwYXJzZUZsb2F0KHZhbHVlKTtcclxuICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBzdGF0LnByb2dyZXNzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICgoIXN0YXQucHJvZ3Jlc3NbaV0ubWluIHx8IHZhbHVlID49IHN0YXQucHJvZ3Jlc3NbaV0ubWluKSAmJiAoIXN0YXQucHJvZ3Jlc3NbaV0ubWF4IHx8IHZhbHVlIDw9IHN0YXQucHJvZ3Jlc3NbaV0ubWF4KSkge1xyXG4gICAgICAgICAgICAgIHJldHVybiBzdGF0LnByb2dyZXNzW2ldLmNsYXNzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBtb2JpbGU6ICQod2luZG93KS53aWR0aCgpIDwgOTAwLFxyXG4gICAgICAgIHRva2VuOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9rZW4nKSxcclxuICAgICAgICB1c2VyOiB7XHJcbiAgICAgICAgICBuYW1lOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlci5uYW1lJykgfHwgJycsXHJcbiAgICAgICAgICB0ZWFtOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlci50ZWFtJykgfHwgJydcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIGNvbXB1dGVkOiB7XHJcbiAgICAgICAgbW9iaWxlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHJldHVybiAkKHdpbmRvdykud2lkdGgoKSA8IDkwMDtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIG9ucmVuZGVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAkY29udGFpbmVyLmFkZENsYXNzKFwid2lkZVwiKTtcclxuICAgICAgfSxcclxuICAgICAgb251bnJlbmRlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJGNvbnRhaW5lci5hdHRyKFwiY2xhc3NcIiwgY29udGFpbmVyQ2xhc3MpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBnZXRUZWFtcyhBUEksIGtleSkudGhlbihmdW5jdGlvbih0ZWFtcykge1xyXG4gICAgICByYWN0aXZlLnNldCh7XHJcbiAgICAgICAgdGVhbXM6IHRlYW1zLnNvcnQoZnVuY3Rpb24oYSwgYikge1xyXG4gICAgICAgICAgcmV0dXJuIGEudGVhbV9udW1iZXIgLSBiLnRlYW1fbnVtYmVyXHJcbiAgICAgICAgfSksXHJcbiAgICAgICAgbG9hZGluZzogZmFsc2VcclxuICAgICAgfSk7XHJcbiAgICAgIFNvcnRhYmxlLmluaXQoKTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG59XHJcbiIsImltcG9ydCAnLi4vbGliL2VzNi1wcm9taXNlLm1pbi5qcydcclxuaW1wb3J0IFRlbXBsYXRlcyBmcm9tIFwiLi4vVGVtcGxhdGVzXCJcclxuaW1wb3J0IEFQSSwgeyBUQkEgfSBmcm9tIFwiLi4vQVBJXCJcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBldmVudE1hdGNoZXMoZXZlbnRLZXkpIHtcclxuICBQcm9taXNlLmFsbChbXHJcbiAgICBUZW1wbGF0ZXMuZ2V0KFwiZXZlbnQtbWF0Y2hlc1wiKSxcclxuICAgIFRCQS5nZXQoXCJldmVudC9cIitldmVudEtleSksXHJcbiAgICBUQkEuZ2V0KFwiZXZlbnQvXCIrZXZlbnRLZXkrXCIvbWF0Y2hlc1wiKS50aGVuKGZ1bmN0aW9uKG1hdGNoZXMpIHtcclxuICAgICAgcmV0dXJuIG1hdGNoZXMuc29ydChmdW5jdGlvbihhLCBiKSB7XHJcbiAgICAgICAgcmV0dXJuIGEudGltZSAtIGIudGltZTtcclxuICAgICAgfSk7XHJcbiAgICB9KSxcclxuICBdKS50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgY29uc3QgW3RlbXBsYXRlLCBldmVudCwgbWF0Y2hlc10gPSByZXM7XHJcbiAgICBjb25zdCByYWN0aXZlID0gbmV3IFJhY3RpdmUoe1xyXG4gICAgICB0ZW1wbGF0ZTogdGVtcGxhdGUsXHJcbiAgICAgIGRhdGE6IHtcclxuICAgICAgICBldmVudDogZXZlbnQsXHJcbiAgICAgICAgbWF0Y2hlczogbWF0Y2hlcyxcclxuICAgICAgICBtb21lbnQ6IGZ1bmN0aW9uKGRhdGUpIHtcclxuICAgICAgICAgIHJldHVybiBtb21lbnQoZGF0ZSkuZnJvbU5vdygpO1xyXG4gICAgICAgIH0sXHJcblxyXG4gICAgICB9LFxyXG4gICAgICBjb21wdXRlZDoge1xyXG4gICAgICAgIG1vYmlsZSgpIHtcclxuICAgICAgICAgIHJldHVybiAkKHdpbmRvdykud2lkdGgoKSA8IDkwMDtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuICB9KTtcclxufVxyXG4iLCJpbXBvcnQgJy4uL2xpYi9lczYtcHJvbWlzZS5taW4uanMnXHJcbmltcG9ydCBUZW1wbGF0ZXMgZnJvbSBcIi4uL1RlbXBsYXRlc1wiXHJcbmltcG9ydCBMb2dpbkNoZWNrIGZyb20gXCIuLi9Mb2dpbkNoZWNrXCJcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBldmVudHMoa2V5KSB7XHJcbiAgUHJvbWlzZS5hbGwoW1xyXG4gICAgTG9naW5DaGVjay5nZXQoKSxcclxuICAgIFRlbXBsYXRlcy5nZXQoXCJldmVudHNcIiksXHJcbiAgXSkudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgIGNvbnN0IFssIHRlbXBsYXRlXSA9IHJlcztcclxuICAgIGNvbnN0IHJhY3RpdmUgPSBuZXcgUmFjdGl2ZSh7XHJcbiAgICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZSxcclxuICAgICAgZGF0YToge1xyXG4gICAgICAgIGV2ZW50czoge1xyXG4gICAgICAgICAgXCIyMDE2YXJjXCI6IFwiQXJjaGltZWRlc1wiLFxyXG4gICAgICAgICAgXCIyMDE2Y2Fyc1wiOiBcIkNhcnNvblwiLFxyXG4gICAgICAgICAgXCIyMDE2Y2FydlwiOiBcIkNhcnZlclwiLFxyXG4gICAgICAgICAgXCIyMDE2Y3VyXCI6IFwiQ3VyaWVcIixcclxuICAgICAgICAgIFwiMjAxNmdhbFwiOiBcIkdhbGlsZW9cIixcclxuICAgICAgICAgIFwiMjAxNmhvcFwiOiBcIkhvcHBlclwiLFxyXG4gICAgICAgICAgXCIyMDE2bmV3XCI6IFwiTmV3dG9uXCIsXHJcbiAgICAgICAgICBcIjIwMTZ0ZXNcIjogXCJUZXNsYVwiLFxyXG4gICAgICAgICAgXCIyMDE2Y21wXCI6IFwiRWluc3RlaW5cIixcclxuICAgICAgICB9LFxyXG4gICAgICAgIG1vYmlsZTogJCh3aW5kb3cpLndpZHRoKCkgPCA5MDAsXHJcbiAgICAgICAgdG9rZW46IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpLFxyXG4gICAgICAgIHVzZXI6IHtcclxuICAgICAgICAgIG5hbWU6IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1c2VyLm5hbWUnKSB8fCAnJyxcclxuICAgICAgICAgIHRlYW06IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1c2VyLnRlYW0nKSB8fCAnJ1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgICAgY29tcHV0ZWQ6IHtcclxuICAgICAgICBtb2JpbGU6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgcmV0dXJuICQod2luZG93KS53aWR0aCgpIDwgOTAwO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH0pO1xyXG4gIH0pO1xyXG59XHJcbiIsImltcG9ydCAnLi4vbGliL2VzNi1wcm9taXNlLm1pbi5qcydcclxuaW1wb3J0IFRlbXBsYXRlcyBmcm9tIFwiLi4vVGVtcGxhdGVzXCJcclxuaW1wb3J0IExvZ2luQ2hlY2sgZnJvbSBcIi4uL0xvZ2luQ2hlY2tcIlxyXG5pbXBvcnQge1xyXG4gIGdldEpTT04sXHJcbiAgcm91bmRcclxufSBmcm9tIFwiLi4vaGVscGVyc1wiXHJcbmltcG9ydCBBUEksIHtcclxuICBnZXRUZWFtU3RhdHMsXHJcbiAgZ2VuZXJhdGVUb2tlblxyXG59IGZyb20gXCIuLi9BUElcIlxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGxvZ2luKCkge1xyXG4gIFByb21pc2UuYWxsKFtcclxuICAgIFRlbXBsYXRlcy5nZXQoXCJsb2dpblwiKVxyXG4gIF0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICBjb25zdCBbdGVtcGxhdGVdID0gcmVzO1xyXG4gICAgaWYgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpKSB7XHJcbiAgICAgIGxvY2F0aW9uLmhhc2ggPSBcIiMvYS9ldmVudHNcIlxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29uc3QgcmFjdGl2ZSA9IG5ldyBSYWN0aXZlKHtcclxuICAgICAgICB0ZW1wbGF0ZTogdGVtcGxhdGUsXHJcbiAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgbW9iaWxlOiAkKHdpbmRvdykud2lkdGgoKSA8IDkwMCxcclxuICAgICAgICAgIHRva2VuOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9rZW4nKSxcclxuICAgICAgICAgIHVzZXI6IHtcclxuICAgICAgICAgICAgbmFtZTogbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VzZXIubmFtZScpIHx8ICcnLFxyXG4gICAgICAgICAgICB0ZWFtOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlci50ZWFtJykgfHwgJydcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICB9KTtcclxuICAgICAgcmFjdGl2ZS5vbignbG9naW4nLCBmdW5jdGlvbihub2RlKSB7XHJcbiAgICAgICAgdmFyIG5hbWUgPSB0aGlzLmdldChcInVzZXIubmFtZVwiKTtcclxuICAgICAgICB2YXIgdGVhbSA9IHRoaXMuZ2V0KFwidXNlci50ZWFtXCIpO1xyXG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwidXNlci5uYW1lXCIsIG5hbWUpO1xyXG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwidXNlci50ZWFtXCIsIHRlYW0pO1xyXG4gICAgICAgIHZhciB0b2tlbiA9IGdlbmVyYXRlVG9rZW4odGVhbSwgbmFtZSk7XHJcbiAgICAgICAgbG9jYXRpb24uaGFzaCA9IFwiIy9hL2V2ZW50c1wiO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9KS5jYXRjaChjb25zb2xlLmVycm9yLmJpbmQoY29uc29sZSkpO1xyXG59XHJcbiIsImltcG9ydCAnLi4vbGliL2VzNi1wcm9taXNlLm1pbi5qcydcclxuaW1wb3J0IFRlbXBsYXRlcyBmcm9tIFwiLi4vVGVtcGxhdGVzXCJcclxuaW1wb3J0IExvZ2luQ2hlY2sgZnJvbSBcIi4uL1RlbXBsYXRlc1wiXHJcbmltcG9ydCB7IGdldEpTT04sIHJvdW5kIH0gZnJvbSBcIi4uL2hlbHBlcnNcIlxyXG5pbXBvcnQgQVBJLCB7IGdldFRlYW1TdGF0cyB9IGZyb20gXCIuLi9BUElcIlxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHRlYW0oa2V5KSB7XHJcbiAgUHJvbWlzZS5hbGwoW1xyXG4gICAgTG9naW5DaGVjay5nZXQoKSxcclxuICAgIFRlbXBsYXRlcy5nZXQoXCJ0ZWFtXCIpLFxyXG4gICAgZ2V0SlNPTihcInN0YXRzLWNvbmZpZy5qc29uXCIpLFxyXG4gICAgZ2V0VGVhbVN0YXRzKEFQSSwga2V5KSxcclxuICBdKS50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgY29uc3QgWywgdGVtcGxhdGUsIHN0YXRzLCB0ZWFtRGF0YV0gPSByZXM7XHJcbiAgICBjb25zdCByYWN0aXZlID0gbmV3IFJhY3RpdmUoe1xyXG4gICAgICB0ZW1wbGF0ZTogdGVtcGxhdGUsXHJcbiAgICAgIGRhdGE6IHtcclxuICAgICAgICBzdGF0czogc3RhdHMsXHJcbiAgICAgICAgc3RhdEtleXM6IFsnY2FsY3MnLCAnZ29hbHMnLCAnZGVmZW5zZXMnXSxcclxuICAgICAgICBrZXk6IGtleSxcclxuICAgICAgICB0ZWFtOiB0ZWFtRGF0YSxcclxuICAgICAgICByb3VuZDogcm91bmQsXHJcbiAgICAgICAgbW9iaWxlOiAkKHdpbmRvdykud2lkdGgoKSA8IDkwMCxcclxuICAgICAgICB0b2tlbjogbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuJyksXHJcbiAgICAgICAgdXNlcjoge1xyXG4gICAgICAgICAgbmFtZTogbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VzZXIubmFtZScpIHx8ICcnLFxyXG4gICAgICAgICAgdGVhbTogbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VzZXIudGVhbScpIHx8ICcnXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgfSk7XHJcbiAgfSkuY2F0Y2goY29uc29sZS5lcnJvci5iaW5kKGNvbnNvbGUpKTtcclxufVxyXG4iXX0=
