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

},{"./pages/event":11,"./pages/events":12,"./pages/login":13,"./pages/team":14}],7:[function(require,module,exports){
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

},{"../LoginCheck":5,"../Templates":7,"../lib/es6-promise.min.js":10}],13:[function(require,module,exports){
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

},{"../API":3,"../LoginCheck":5,"../Templates":7,"../helpers":9,"../lib/es6-promise.min.js":10}],14:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiQzovVXNlcnMvU2FtdWVsL0RvY3VtZW50cy9vcmItY2xpZW50L3NyYy9tYWluLmpzIiwibm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXHByb2Nlc3NcXGJyb3dzZXIuanMiLCJDOi9Vc2Vycy9TYW11ZWwvRG9jdW1lbnRzL29yYi1jbGllbnQvc3JjL0FQSS5qcyIsIkM6L1VzZXJzL1NhbXVlbC9Eb2N1bWVudHMvb3JiLWNsaWVudC9zcmMvQ29tcG9uZW50cy5qcyIsIkM6L1VzZXJzL1NhbXVlbC9Eb2N1bWVudHMvb3JiLWNsaWVudC9zcmMvTG9naW5DaGVjay5qcyIsIkM6L1VzZXJzL1NhbXVlbC9Eb2N1bWVudHMvb3JiLWNsaWVudC9zcmMvUGFnZXMuanMiLCJDOi9Vc2Vycy9TYW11ZWwvRG9jdW1lbnRzL29yYi1jbGllbnQvc3JjL1RlbXBsYXRlcy5qcyIsIkM6L1VzZXJzL1NhbXVlbC9Eb2N1bWVudHMvb3JiLWNsaWVudC9zcmMvY2FjaGVhYmxlLmpzIiwiQzovVXNlcnMvU2FtdWVsL0RvY3VtZW50cy9vcmItY2xpZW50L3NyYy9oZWxwZXJzLmpzIiwic3JjXFxsaWJcXGVzNi1wcm9taXNlLm1pbi5qcyIsIkM6L1VzZXJzL1NhbXVlbC9Eb2N1bWVudHMvb3JiLWNsaWVudC9zcmMvcGFnZXMvZXZlbnQuanMiLCJDOi9Vc2Vycy9TYW11ZWwvRG9jdW1lbnRzL29yYi1jbGllbnQvc3JjL3BhZ2VzL2V2ZW50cy5qcyIsIkM6L1VzZXJzL1NhbXVlbC9Eb2N1bWVudHMvb3JiLWNsaWVudC9zcmMvcGFnZXMvbG9naW4uanMiLCJDOi9Vc2Vycy9TYW11ZWwvRG9jdW1lbnRzL29yYi1jbGllbnQvc3JjL3BhZ2VzL3RlYW0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7OztJQ0FZLEtBQUssbUNBQU0sU0FBUzs7SUFDekIsVUFBVSwyQkFBTSxjQUFjOztJQUVuQyxhQUFhLFdBQ1IsV0FBVyxFQURoQixhQUFhOztRQUVSLDBCQUEwQjs7QUFFakMsSUFBTSxFQUFFLEdBQUcsT0FBTyxDQUFDOztBQUVuQixJQUFNLE1BQU0sR0FBRyxNQUFNLENBQUM7QUFDcEIsVUFBUSxFQUFFLEtBQUssQ0FBQyxLQUFLO0FBQ3JCLE1BQUksRUFBRTtBQUNKLGdCQUFZLEVBQUUsS0FBSyxDQUFDLElBQUk7QUFDeEIsaUJBQWEsRUFBRSxLQUFLLENBQUMsS0FBSztBQUMxQixhQUFTLEVBQUUsS0FBSyxDQUFDLE1BQU07R0FDeEI7Q0FDRixDQUFDLENBQUMsU0FBUyxDQUFDO0FBQ1gsY0FBWSxFQUFFLEtBQUs7QUFDbkIsUUFBTSxFQUFFLEVBQUU7QUFDVixPQUFLLEVBQUUsRUFBRTtBQUNULFNBQU8sRUFBRSxTQUFTO0NBQ25CLENBQUMsQ0FBQzs7QUFFSCxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsYUFBYSxFQUFFLFVBQVUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVMsR0FBRyxFQUFFOzRCQUMxQyxHQUFHOztNQUFqQixVQUFVOztBQUNuQixTQUFPLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQztBQUN2QixNQUFFLEVBQUUsRUFBRTtBQUNOLGNBQVUsRUFBRSxVQUFVLENBQUMsVUFBVTtBQUNqQyxVQUFNLEVBQUUsQ0FBQyxZQUFXO0FBQ2xCLE9BQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDeEIsQ0FBQztHQUNILENBQUMsQ0FBQztBQUNILFFBQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUNkLE1BQUksQ0FBQyxNQUFNLENBQUMsUUFBUSxFQUFFLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sRUFBRTtBQUM3QyxRQUFJLFlBQVksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDakMsWUFBTSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQztLQUM5QixNQUFNO0FBQ0wsWUFBTSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUMzQjtHQUNGO0NBQ0YsQ0FBQyxDQUFDOzs7QUN4Q0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7Ozs7OztRQzdDZ0IsWUFBWSxHQUFaLFlBQVk7UUF5Q1osUUFBUSxHQUFSLFFBQVE7UUFRUixhQUFhLEdBQWIsYUFBYTs7Ozs7UUExRnRCLDBCQUEwQjs7SUFDMUIsU0FBUywyQkFBTSxhQUFhOztJQUMxQixNQUFNLFdBQVEsV0FBVyxFQUF6QixNQUFNOztxQkFJQSxTQUFTLENBQUMsVUFBUyxHQUFHLEVBQUU7QUFDckMsTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztBQUN0RCxNQUFJLEdBQUcsR0FBRyx5QkFBeUIsR0FBQyxHQUFHLEdBQUMsR0FBRyxDQUFDO0FBQzVDLFNBQU8sSUFBSSxPQUFPLENBQUMsVUFBUyxPQUFPLEVBQUUsTUFBTSxFQUFFO0FBQzNDLFdBQU8sQ0FBQyxDQUFDLElBQUksQ0FBQztBQUNaLFlBQU0sRUFBRSxLQUFLO0FBQ2IsY0FBUSxFQUFFLE1BQU07QUFDaEIsVUFBSSxFQUFFLEVBQUU7QUFDUixTQUFHLEVBQUUsR0FBRztBQUNSLFdBQUssRUFBRSxNQUFNO0tBQ2QsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztHQUNsQixDQUFDLFNBQU0sQ0FBQyxVQUFTLEdBQUcsRUFBRTtBQUNyQixXQUFPLENBQUMsS0FBSyxDQUFDLDBCQUEwQixFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNwRCxXQUFPLEdBQUcsQ0FBQztHQUNaLENBQUMsQ0FBQztDQUNKLENBQUM7QUFFSyxJQUFJLEdBQUcsR0FBRyxTQUFTLENBQUMsVUFBUyxJQUFJLEVBQUU7QUFDeEMsTUFBTSxHQUFHLEdBQUcsd0NBQXdDLEdBQUcsSUFBSSxDQUFDO0FBQzVELFNBQU8sSUFBSSxPQUFPLENBQUMsVUFBUyxPQUFPLEVBQUUsTUFBTSxFQUFFO0FBQzNDLFdBQU8sQ0FBQyxDQUFDLElBQUksQ0FBQztBQUNaLFlBQU0sRUFBRSxLQUFLO0FBQ2IsY0FBUSxFQUFFLE1BQU07QUFDaEIsVUFBSSxFQUFFO0FBQ0osc0JBQWMsRUFBRSxvQkFBb0I7T0FDckM7QUFDRCxTQUFHLEVBQUUsR0FBRztBQUNSLFdBQUssRUFBRSxNQUFNO0tBQ2QsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztHQUNsQixDQUFDLFNBQU0sQ0FBQyxVQUFTLEdBQUcsRUFBRTtBQUNyQixXQUFPLENBQUMsS0FBSyxDQUFDLDBCQUEwQixFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUNwRCxXQUFPLEdBQUcsQ0FBQztHQUNaLENBQUMsQ0FBQztDQUNKLENBQUMsQ0FBQzs7UUFoQlEsR0FBRyxHQUFILEdBQUc7O0FBa0JQLFNBQVMsWUFBWSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFO0FBQzNDLE1BQUksUUFBUSxHQUFHLENBQ2IsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEdBQUMsR0FBRyxHQUFDLFVBQVUsQ0FBQyxFQUMvQixHQUFHLENBQUMsR0FBRyxDQUFDLE9BQU8sR0FBQyxHQUFHLEdBQUMsUUFBUSxDQUFDLEVBQzdCLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxHQUFDLEdBQUcsR0FBQyxRQUFRLENBQUMsQ0FDOUIsQ0FBQztBQUNGLE1BQUksT0FBTyxJQUFJLElBQUksUUFBUSxJQUFJLElBQUksQ0FBQyxXQUFXLElBQUksSUFBSSxFQUFFO0FBQ3ZELFlBQVEsQ0FBQyxJQUFJLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTTthQUFLLE9BQU8sQ0FBQyxJQUFJLENBQUM7S0FBQSxDQUFDLENBQUE7R0FDbEQsTUFBTTtBQUNMLFlBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEdBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztHQUNyQztBQUNELFNBQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBUyxHQUFHLEVBQUU7OEJBQ1QsR0FBRzs7UUFBbkMsUUFBUTtRQUFFLEtBQUs7UUFBRSxLQUFLO1FBQUUsSUFBSTs7QUFDakMsV0FBTyxNQUFNLENBQUMsSUFBSSxFQUFFO0FBQ2xCLFdBQUssRUFBRTtBQUNMLGFBQUssRUFBRTtBQUNMLHNCQUFZLEVBQUUsQ0FBQztBQUNmLGVBQUssRUFBRSxLQUFLO1NBQ2I7QUFDRCxnQkFBUSxFQUFFO0FBQ1IsaUJBQU8sRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO0FBQ3BCLG9CQUFVLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztBQUN2Qix5QkFBZSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7QUFDNUIsY0FBSSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7QUFDakIsa0JBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO0FBQ3JCLG9CQUFVLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztBQUN2QixvQkFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7QUFDdkIsbUJBQVMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO0FBQ3RCLHVCQUFhLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUMzQjtBQUNELGFBQUssRUFBRTtBQUNMLGtCQUFRLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUNsQixtQkFBUyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7QUFDbkIsb0JBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDO0FBQ3BCLHFCQUFXLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUN0QixFQUNGO0tBQ0YsQ0FBQyxDQUFDO0dBQ0osQ0FBQyxDQUFDO0NBQ0o7O0FBRU0sU0FBUyxRQUFRLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRTtBQUNqQyxTQUFPLElBQUksT0FBTyxDQUFDLFVBQVMsT0FBTyxFQUFFLE1BQU0sRUFBRTtBQUMzQyxXQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEdBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztHQUMvQixDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVMsS0FBSyxFQUFFO0FBQ3RCLFdBQU8sT0FBTyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQUEsSUFBSTthQUFJLFlBQVksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUM7S0FBQSxDQUFDLENBQUMsQ0FBQztHQUNsRixDQUFDLENBQUM7Q0FDSjs7QUFFTSxTQUFTLGFBQWEsQ0FBQyxJQUFJLEVBQUMsSUFBSSxFQUFFO0FBQ3ZDLE1BQUksS0FBSyxHQUFHLElBQUksR0FBRyxHQUFHLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ25DLGNBQVksQ0FBQyxPQUFPLENBQUMsT0FBTyxFQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ3BDLFNBQU8sS0FBSyxDQUFDO0NBQ2Q7Ozs7Ozs7UUM5Rk0sMEJBQTBCOztJQUMxQixTQUFTLDJCQUFNLGFBQWE7O2lCQUVwQjtBQUNiLFdBQVMsRUFBRSxFQUFFO0FBQ2IsWUFBVSxFQUFFLEVBQUU7QUFDZCxRQUFNLEVBQUUsZ0JBQVMsSUFBSSxFQUFFO0FBQ3JCLFFBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxNQUFNLENBQUM7QUFDdkMsY0FBUSxFQUFFLEtBQUs7QUFDZixjQUFRLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRO0FBQ2pDLFlBQU0sRUFBRSxrQkFBVztBQUNqQixZQUFNLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQzlCLFlBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDaEMsWUFBSSxhQUFhLFlBQUEsQ0FBQztBQUNsQixhQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDNUMsY0FBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFBLEtBQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUEsQUFBQyxFQUFFO0FBQ3hILHlCQUFhLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsU0FBTSxDQUFDO0FBQ3ZDLGtCQUFNO1dBQ1A7U0FDRjtBQUNELFlBQUksQ0FBQyxHQUFHLENBQUM7QUFDUCxhQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7QUFDYixhQUFHLEVBQUUsSUFBSSxDQUFDLEdBQUc7QUFDYixlQUFLLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxHQUFHLEtBQUssQ0FBQSxHQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRztBQUN4Qyx1QkFBYSxFQUFFLGFBQWEsRUFDN0IsQ0FBQyxDQUFBO09BQ0gsRUFFSCxDQUFDLENBQUM7R0FDSjtBQUNELE1BQUksRUFBRSxjQUFTLElBQUksRUFBRTtBQUNuQixRQUFNLEtBQUssR0FBRyxJQUFJLENBQUM7QUFDbkIsV0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFTLE9BQU8sRUFBRSxNQUFNLEVBQUU7QUFDM0MsZUFBUyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBUyxTQUFTLEVBQUU7QUFDbkQsU0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxJQUFJLENBQUMsWUFBVztBQUNqRSxjQUFNLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDdEIsZUFBSyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO1NBQzNELENBQUMsQ0FBQztBQUNILGFBQUssQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNmLGVBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQztPQUNoQixDQUFDLFNBQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUNsQixDQUFDLENBQUM7R0FDSixFQUNGOzs7Ozs7O1FDM0NNLDBCQUEwQjs7SUFDMUIsU0FBUywyQkFBTSxhQUFhOztpQkFFcEIsU0FBUyxDQUFDLFlBQVc7QUFDbEMsU0FBTyxJQUFJLE9BQU8sQ0FBQyxVQUFTLE9BQU8sRUFBRSxNQUFNLEVBQUU7QUFDM0MsUUFBRyxZQUFZLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxFQUFFO0FBQ2hDLGFBQU8sRUFBRSxDQUFDO0tBQ1gsTUFBTTtBQUNMLGNBQVEsQ0FBQyxJQUFJLEdBQUcsU0FBUyxDQUFBO0FBQ3pCLFlBQU0sRUFBRSxDQUFDO0tBQ1Y7R0FDRixDQUFDLENBQUM7Q0FDSixDQUFDOzs7Ozs7Ozs7Ozs7O21EQ1pZLGNBQWM7O21EQUNkLGVBQWU7O21EQUNmLGVBQWU7O21EQUNmLGdCQUFnQjs7Ozs7OztRQ0h2QiwwQkFBMEI7O0lBQzFCLFNBQVMsMkJBQU0sYUFBYTs7aUJBRXBCLFNBQVMsQ0FBQyxVQUFTLEdBQUcsRUFBRTtBQUNyQyxNQUFNLEdBQUcsR0FBRyxZQUFZLEdBQUMsR0FBRyxHQUFDLE9BQU8sQ0FBQztBQUNyQyxTQUFPLElBQUksT0FBTyxDQUFDLFVBQVMsT0FBTyxFQUFFLE1BQU0sRUFBRTtBQUMzQyxXQUFPLENBQUMsQ0FBQyxJQUFJLENBQUM7QUFDWixZQUFNLEVBQUUsS0FBSztBQUNiLFNBQUcsRUFBRSxHQUFHO0FBQ1IsV0FBSyxFQUFFLE1BQU07S0FDZCxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0dBQ2xCLENBQUMsU0FBTSxDQUFDLFVBQVMsR0FBRyxFQUFFO0FBQ3JCLFdBQU8sQ0FBQyxLQUFLLENBQUMsK0JBQStCLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO0FBQ3pELFdBQU8sR0FBRyxDQUFDO0dBQ1osQ0FBQyxDQUFDO0NBQ0osQ0FBQzs7Ozs7OztpQkNac0IsU0FBUzs7UUFIMUIsMEJBQTBCOztJQUMxQixTQUFTLDJCQUFNLGFBQWE7O0FBRXBCLFNBQVMsU0FBUyxDQUFDLFVBQVUsRUFBRTtBQUM1QyxNQUFNLE1BQU0sR0FBRyxFQUFFLENBQUM7O0FBRWxCLFdBQVMsR0FBRyxDQUFDLEdBQUcsRUFBRSxLQUFLLEVBQUU7QUFDdkIsV0FBTyxNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsS0FBSyxDQUFDO0dBQzVCOztBQUVELFNBQU87QUFDTCxPQUFHLEVBQUEsYUFBQyxHQUFHLEVBQUUsUUFBUSxFQUFFO0FBQ2pCLGFBQU8sSUFBSSxPQUFPLENBQUMsVUFBUyxPQUFPLEVBQUUsTUFBTSxFQUFFO0FBQzNDLFlBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQ2YsaUJBQU8sT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1NBQzdCOztBQUVELGtCQUFVLENBQUMsR0FBRyxDQUFDLENBQ1osSUFBSSxDQUFDLFVBQUEsS0FBSztpQkFBSSxHQUFHLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQztTQUFBLENBQUMsQ0FDOUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxTQUNSLENBQUMsTUFBTSxDQUFDLENBQUM7T0FFbEIsQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUNuQixFQUNGLENBQUE7Q0FDRjs7Ozs7UUN2QmUsT0FBTyxHQUFQLE9BQU87UUFZUCxLQUFLLEdBQUwsS0FBSztRQVVMLGFBQWEsR0FBYixhQUFhO1FBVWIsTUFBTSxHQUFOLE1BQU07Ozs7O1FBbENmLDBCQUEwQjs7QUFFMUIsU0FBUyxPQUFPLENBQUMsR0FBRyxFQUFFO0FBQzNCLFNBQU8sSUFBSSxPQUFPLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTSxFQUFLO0FBQ3RDLEtBQUMsQ0FBQyxJQUFJLENBQUM7QUFDTCxZQUFNLEVBQUUsS0FBSztBQUNiLGNBQVEsRUFBRSxNQUFNO0FBQ2hCLFVBQUksRUFBRSxFQUFFO0FBQ1IsU0FBRyxFQUFFLEdBQUc7QUFDUixXQUFLLEVBQUUsTUFBTTtLQUNkLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7R0FDbEIsQ0FBQyxDQUFDO0NBQ0o7O0FBRU0sU0FBUyxLQUFLLENBQUMsQ0FBQyxFQUFFLE1BQU0sRUFBRTtBQUMvQixNQUFNLENBQUMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDeEIsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2hDLE1BQU0sS0FBSyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsTUFBTSxDQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxNQUFNLENBQUMsQ0FBQSxDQUFFLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNoRyxNQUFJLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO0FBQ3JCLFNBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7R0FDaEI7QUFDRCxTQUFPLEtBQUssQ0FBQyxDQUFDLENBQUMsSUFBSSxNQUFNLEdBQUcsR0FBRyxHQUFHLEVBQUUsQ0FBQSxBQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxNQUFNLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztDQUMvRzs7QUFFTSxTQUFTLGFBQWEsR0FBRztBQUM5QixTQUFPLElBQUksT0FBTyxDQUFDLFVBQVMsT0FBTyxFQUFFLE1BQU0sRUFBRTtBQUMzQyxRQUFJLENBQUMsQ0FBQyxPQUFPLEVBQUU7QUFDYixhQUFPLEVBQUUsQ0FBQztLQUNYLE1BQU07QUFDTCxPQUFDLENBQUMsT0FBTyxDQUFDLENBQUM7S0FDWjtHQUNGLENBQUMsQ0FBQztDQUNKOztBQUVNLFNBQVMsTUFBTSxHQUFHO0FBQ3ZCLE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1QixPQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUN4QyxTQUFJLElBQUksR0FBRyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRTtBQUMzQixZQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ2pDO0dBQ0Y7QUFDRCxTQUFPLE1BQU0sQ0FBQztDQUNmOzs7QUMxQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7Ozs7O1FDOU5nQixLQUFLLEdBQUwsS0FBSzs7Ozs7UUFOZCwyQkFBMkI7O0lBQzNCLFNBQVMsMkJBQU0sY0FBYzs7SUFDN0IsVUFBVSwyQkFBTSxlQUFlOzt1QkFDUCxZQUFZOztJQUFsQyxPQUFPLFlBQVAsT0FBTztJQUFFLEtBQUssWUFBTCxLQUFLOzttQkFDMEIsUUFBUTs7SUFBbEQsR0FBRzs7SUFBSSxHQUFHLFFBQUgsR0FBRztJQUFFLFFBQVEsUUFBUixRQUFRO0lBQUUsWUFBWSxRQUFaLFlBQVk7O0FBRWxDLFNBQVMsS0FBSyxDQUFDLEdBQUcsRUFBRTtBQUN6QixTQUFPLENBQUMsR0FBRyxDQUFDLENBQ1YsVUFBVSxDQUFDLEdBQUcsRUFBRSxFQUNoQixTQUFTLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxFQUN0QixPQUFPLENBQUMsbUJBQW1CLENBQUMsRUFDNUIsR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLEdBQUMsR0FBRyxDQUFDLENBQ3RCLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBUyxHQUFHLEVBQUU7OEJBQ2UsR0FBRzs7UUFBN0IsUUFBUTtRQUFFLEtBQUs7UUFBRSxLQUFLOztBQUMvQixRQUFNLFVBQVUsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3BELFFBQU0sY0FBYyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDaEQsUUFBTSxPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUM7QUFDMUIsY0FBUSxFQUFFLFFBQVE7QUFDbEIsVUFBSSxFQUFFO0FBQ0osV0FBRyxFQUFFLEdBQUc7QUFDUixrQkFBVSxFQUFFLEtBQUs7QUFDakIsZUFBTyxFQUFFLElBQUk7QUFDYixhQUFLLEVBQUUsRUFBRTtBQUNULGFBQUssRUFBRSxLQUFLO0FBQ1osYUFBSyxFQUFFLEtBQUs7QUFDWixpQkFBUyxFQUFBLG1CQUFDLEtBQUssRUFBRSxJQUFJLEVBQUU7QUFDckIsY0FBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2hDLGVBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUM1QyxnQkFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFBLEtBQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUEsQUFBQyxFQUFFO0FBQ3hILHFCQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFNBQU0sQ0FBQzthQUMvQjtXQUNGO1NBQ0Y7QUFDRCxjQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssRUFBRSxHQUFHLEdBQUc7QUFDL0IsYUFBSyxFQUFFLFlBQVksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO0FBQ3BDLFlBQUksRUFBRTtBQUNKLGNBQUksRUFBRSxZQUFZLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUU7QUFDN0MsY0FBSSxFQUFFLFlBQVksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRTtTQUM5QztPQUNGO0FBQ0QsY0FBUSxFQUFFO0FBQ1IsY0FBTSxFQUFFLGtCQUFXO0FBQ2pCLGlCQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxHQUFHLENBQUM7U0FDaEM7T0FDRjtBQUNELGNBQVEsRUFBRSxvQkFBVztBQUNuQixrQkFBVSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztPQUM3QjtBQUNELGdCQUFVLEVBQUUsc0JBQVc7QUFDckIsa0JBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDO09BQzFDO0tBQ0YsQ0FBQyxDQUFDOztBQUVILFlBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVMsS0FBSyxFQUFFO0FBQ3RDLGFBQU8sQ0FBQyxHQUFHLENBQUM7QUFDVixhQUFLLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFTLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDL0IsaUJBQU8sQ0FBQyxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFBO1NBQ3JDLENBQUM7QUFDRixlQUFPLEVBQUUsS0FBSztPQUNmLENBQUMsQ0FBQztBQUNILGNBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUNqQixDQUFDLENBQUM7R0FDSixDQUFDLENBQUM7Q0FDSjs7Ozs7Ozs7O1FDM0RlLE1BQU0sR0FBTixNQUFNOzs7OztRQUpmLDJCQUEyQjs7SUFDM0IsU0FBUywyQkFBTSxjQUFjOztJQUM3QixVQUFVLDJCQUFNLGVBQWU7O0FBRS9CLFNBQVMsTUFBTSxDQUFDLEdBQUcsRUFBRTtBQUMxQixTQUFPLENBQUMsR0FBRyxDQUFDLENBQ1YsVUFBVSxDQUFDLEdBQUcsRUFBRSxFQUNoQixTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUN4QixDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVMsR0FBRyxFQUFFOzhCQUNDLEdBQUc7O1FBQWYsUUFBUTs7QUFDakIsUUFBTSxPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUM7QUFDMUIsY0FBUSxFQUFFLFFBQVE7QUFDbEIsVUFBSSxFQUFFO0FBQ0osY0FBTSxFQUFFO0FBQ04sbUJBQVMsRUFBRSxZQUFZO0FBQ3ZCLG9CQUFVLEVBQUUsUUFBUTtBQUNwQixvQkFBVSxFQUFFLFFBQVE7QUFDcEIsbUJBQVMsRUFBRSxPQUFPO0FBQ2xCLG1CQUFTLEVBQUUsU0FBUztBQUNwQixtQkFBUyxFQUFFLFFBQVE7QUFDbkIsbUJBQVMsRUFBRSxRQUFRO0FBQ25CLG1CQUFTLEVBQUUsT0FBTztBQUNsQixtQkFBUyxFQUFFLFVBQVUsRUFDdEI7QUFDRCxjQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssRUFBRSxHQUFHLEdBQUc7QUFDL0IsYUFBSyxFQUFFLFlBQVksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO0FBQ3BDLFlBQUksRUFBRTtBQUNKLGNBQUksRUFBRSxZQUFZLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUU7QUFDN0MsY0FBSSxFQUFFLFlBQVksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRTtTQUM5QztPQUNGO0FBQ0QsY0FBUSxFQUFFO0FBQ1IsY0FBTSxFQUFFLGtCQUFXO0FBQ2pCLGlCQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxHQUFHLENBQUM7U0FDaEM7T0FDRixFQUNGLENBQUMsQ0FBQztHQUNKLENBQUMsQ0FBQztDQUNKOzs7Ozs7Ozs7UUMxQmUsS0FBSyxHQUFMLEtBQUs7Ozs7O1FBWmQsMkJBQTJCOztJQUMzQixTQUFTLDJCQUFNLGNBQWM7O0lBQzdCLFVBQVUsMkJBQU0sZUFBZTs7dUJBSS9CLFlBQVk7O0lBRmpCLE9BQU8sWUFBUCxPQUFPO0lBQ1AsS0FBSyxZQUFMLEtBQUs7O21CQUtBLFFBQVE7O0lBSFIsR0FBRzs7SUFDUixZQUFZLFFBQVosWUFBWTtJQUNaLGFBQWEsUUFBYixhQUFhOztBQUdSLFNBQVMsS0FBSyxHQUFHO0FBQ3RCLFNBQU8sQ0FBQyxHQUFHLENBQUMsQ0FDVixTQUFTLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUN2QixDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVMsR0FBRyxFQUFFOzhCQUNELEdBQUc7O1FBQWYsUUFBUTs7QUFDZixRQUFJLFlBQVksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUU7QUFDakMsY0FBUSxDQUFDLElBQUksR0FBRyxZQUFZLENBQUE7S0FDN0IsTUFBTTtBQUNMLFVBQU0sT0FBTyxHQUFHLElBQUksT0FBTyxDQUFDO0FBQzFCLGdCQUFRLEVBQUUsUUFBUTtBQUNsQixZQUFJLEVBQUU7QUFDSixnQkFBTSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxLQUFLLEVBQUUsR0FBRyxHQUFHO0FBQy9CLGVBQUssRUFBRSxZQUFZLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQztBQUNwQyxjQUFJLEVBQUU7QUFDSixnQkFBSSxFQUFFLFlBQVksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRTtBQUM3QyxnQkFBSSxFQUFFLFlBQVksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRTtXQUM5QztTQUNGLEVBQ0YsQ0FBQyxDQUFDO0FBQ0gsYUFBTyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsVUFBUyxJQUFJLEVBQUU7QUFDakMsWUFBSSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNqQyxZQUFJLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ2pDLG9CQUFZLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN4QyxvQkFBWSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDeEMsWUFBSSxLQUFLLEdBQUcsYUFBYSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztBQUN0QyxnQkFBUSxDQUFDLElBQUksR0FBRyxZQUFZLENBQUM7T0FDOUIsQ0FBQyxDQUFDO0tBQ0o7R0FDRixDQUFDLFNBQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0NBQ3ZDOzs7Ozs7Ozs7UUNuQ2UsSUFBSSxHQUFKLElBQUk7Ozs7O1FBTmIsMkJBQTJCOzt5QkFDWixjQUFjOztJQUE3QixTQUFTOztJQUNULFVBQVU7O3VCQUNjLFlBQVk7O0lBQWxDLE9BQU8sWUFBUCxPQUFPO0lBQUUsS0FBSyxZQUFMLEtBQUs7O21CQUNXLFFBQVE7O0lBQW5DLEdBQUc7O0lBQUksWUFBWSxRQUFaLFlBQVk7O0FBRW5CLFNBQVMsSUFBSSxDQUFDLEdBQUcsRUFBRTtBQUN4QixTQUFPLENBQUMsR0FBRyxDQUFDLENBQ1YsVUFBVSxDQUFDLEdBQUcsRUFBRSxFQUNoQixTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxFQUNyQixPQUFPLENBQUMsbUJBQW1CLENBQUMsRUFDNUIsWUFBWSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FDdkIsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFTLEdBQUcsRUFBRTs4QkFDa0IsR0FBRzs7UUFBaEMsUUFBUTtRQUFFLEtBQUs7UUFBRSxRQUFROztBQUNsQyxRQUFNLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBQztBQUMxQixjQUFRLEVBQUUsUUFBUTtBQUNsQixVQUFJLEVBQUU7QUFDSixhQUFLLEVBQUUsS0FBSztBQUNaLGdCQUFRLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLFVBQVUsQ0FBQztBQUN4QyxXQUFHLEVBQUUsR0FBRztBQUNSLFlBQUksRUFBRSxRQUFRO0FBQ2QsYUFBSyxFQUFFLEtBQUs7QUFDWixjQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssRUFBRSxHQUFHLEdBQUc7QUFDL0IsYUFBSyxFQUFFLFlBQVksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO0FBQ3BDLFlBQUksRUFBRTtBQUNKLGNBQUksRUFBRSxZQUFZLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUU7QUFDN0MsY0FBSSxFQUFFLFlBQVksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRTtTQUM5QztPQUNGLEVBQ0YsQ0FBQyxDQUFDO0dBQ0osQ0FBQyxTQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztDQUN2QyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgKiBhcyBQYWdlcyBmcm9tICcuL1BhZ2VzJ1xyXG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tICcuL0NvbXBvbmVudHMnXHJcbmltcG9ydCB7XHJcbiAgZG9jdW1lbnRSZWFkeVxyXG59IGZyb20gJy4vaGVscGVycydcclxuaW1wb3J0ICcuL2xpYi9lczYtcHJvbWlzZS5taW4uanMnXHJcblxyXG5jb25zdCBlbCA9IFwiI21haW5cIjtcclxuXHJcbmNvbnN0IHJvdXRlciA9IFJvdXRlcih7XHJcbiAgXCIvbG9naW5cIjogUGFnZXMubG9naW4sXHJcbiAgXCIvYVwiOiB7XHJcbiAgICBcIi90ZWFtLzprZXlcIjogUGFnZXMudGVhbSxcclxuICAgIFwiL2V2ZW50LzprZXlcIjogUGFnZXMuZXZlbnQsXHJcbiAgICBcIi9ldmVudHNcIjogUGFnZXMuZXZlbnRzXHJcbiAgfVxyXG59KS5jb25maWd1cmUoe1xyXG4gIGh0bWw1aGlzdG9yeTogZmFsc2UsXHJcbiAgYmVmb3JlOiBbXSxcclxuICBhZnRlcjogW10sXHJcbiAgcmVjdXJzZTogJ2ZvcndhcmQnXHJcbn0pO1xyXG5cclxuUHJvbWlzZS5hbGwoW2RvY3VtZW50UmVhZHksIENvbXBvbmVudHMubG9hZCgpXSkudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICBjb25zdCBbLCBDb21wb25lbnRzXSA9IHJlcztcclxuICBSYWN0aXZlID0gUmFjdGl2ZS5leHRlbmQoe1xyXG4gICAgZWw6IGVsLFxyXG4gICAgY29tcG9uZW50czogQ29tcG9uZW50cy5jb21wb25lbnRzLFxyXG4gICAgYmVmb3JlOiBbZnVuY3Rpb24oKSB7XHJcbiAgICAgICQod2luZG93KS5zY3JvbGxUb3AoMCk7XHJcbiAgICB9XVxyXG4gIH0pO1xyXG4gIHJvdXRlci5pbml0KCk7XHJcbiAgaWYgKCFyb3V0ZXIuZ2V0Um91dGUoKS5maWx0ZXIoQm9vbGVhbikubGVuZ3RoKSB7XHJcbiAgICBpZiAobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuJykpIHtcclxuICAgICAgcm91dGVyLnNldFJvdXRlKFwiL2EvZXZlbnRzXCIpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcm91dGVyLnNldFJvdXRlKFwiL2xvZ2luXCIpO1xyXG4gICAgfVxyXG4gIH1cclxufSk7XHJcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhbk11dGF0aW9uT2JzZXJ2ZXIgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5NdXRhdGlvbk9ic2VydmVyO1xuICAgIHZhciBjYW5Qb3N0ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cucG9zdE1lc3NhZ2UgJiYgd2luZG93LmFkZEV2ZW50TGlzdGVuZXJcbiAgICA7XG5cbiAgICBpZiAoY2FuU2V0SW1tZWRpYXRlKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoZikgeyByZXR1cm4gd2luZG93LnNldEltbWVkaWF0ZShmKSB9O1xuICAgIH1cblxuICAgIHZhciBxdWV1ZSA9IFtdO1xuXG4gICAgaWYgKGNhbk11dGF0aW9uT2JzZXJ2ZXIpIHtcbiAgICAgICAgdmFyIGhpZGRlbkRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgICAgIHZhciBvYnNlcnZlciA9IG5ldyBNdXRhdGlvbk9ic2VydmVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBxdWV1ZUxpc3QgPSBxdWV1ZS5zbGljZSgpO1xuICAgICAgICAgICAgcXVldWUubGVuZ3RoID0gMDtcbiAgICAgICAgICAgIHF1ZXVlTGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChmbikge1xuICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgb2JzZXJ2ZXIub2JzZXJ2ZShoaWRkZW5EaXYsIHsgYXR0cmlidXRlczogdHJ1ZSB9KTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgICAgIGlmICghcXVldWUubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgaGlkZGVuRGl2LnNldEF0dHJpYnV0ZSgneWVzJywgJ25vJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoY2FuUG9zdCkge1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbWVzc2FnZScsIGZ1bmN0aW9uIChldikge1xuICAgICAgICAgICAgdmFyIHNvdXJjZSA9IGV2LnNvdXJjZTtcbiAgICAgICAgICAgIGlmICgoc291cmNlID09PSB3aW5kb3cgfHwgc291cmNlID09PSBudWxsKSAmJiBldi5kYXRhID09PSAncHJvY2Vzcy10aWNrJykge1xuICAgICAgICAgICAgICAgIGV2LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgICAgIGlmIChxdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmbiA9IHF1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LCB0cnVlKTtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZm4pO1xuICAgICAgICAgICAgd2luZG93LnBvc3RNZXNzYWdlKCdwcm9jZXNzLXRpY2snLCAnKicpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcbiAgICB9O1xufSkoKTtcblxucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG4iLCJpbXBvcnQgJy4vbGliL2VzNi1wcm9taXNlLm1pbi5qcydcclxuaW1wb3J0IGNhY2hlYWJsZSBmcm9tICcuL2NhY2hlYWJsZSdcclxuaW1wb3J0IHsgZXh0ZW5kIH0gZnJvbSAnLi9oZWxwZXJzJ1xyXG5cclxuXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjYWNoZWFibGUoZnVuY3Rpb24oa2V5KSB7XHJcbiAgY29uc3Qga2V5ID0ga2V5LnJlcGxhY2UoL15cXC8vLCBcIlwiKS5yZXBsYWNlKC9cXC8kLywgXCJcIik7XHJcbiAgbGV0IHVybCA9IFwiaHR0cDovL29yYi5zY291dGZyYy5pby9cIitrZXkrXCIvXCI7XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgcmV0dXJuICQuYWpheCh7XHJcbiAgICAgIG1ldGhvZDogXCJnZXRcIixcclxuICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxyXG4gICAgICBkYXRhOiB7fSxcclxuICAgICAgdXJsOiB1cmwsXHJcbiAgICAgIGVycm9yOiByZWplY3RcclxuICAgIH0pLnRoZW4ocmVzb2x2ZSk7XHJcbiAgfSkuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKFwiQVBJIFJlcXVlc3QgVW5zdWNjZXNzZnVsXCIsIHVybCwgcmVzKTtcclxuICAgIHJldHVybiByZXM7XHJcbiAgfSk7XHJcbn0pO1xyXG5cclxuZXhwb3J0IGxldCBUQkEgPSBjYWNoZWFibGUoZnVuY3Rpb24ocGF0aCkge1xyXG4gIGNvbnN0IHVybCA9IFwiaHR0cDovL3d3dy50aGVibHVlYWxsaWFuY2UuY29tL2FwaS92Mi9cIiArIHBhdGg7XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgcmV0dXJuICQuYWpheCh7XHJcbiAgICAgIG1ldGhvZDogXCJnZXRcIixcclxuICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxyXG4gICAgICBkYXRhOiB7XHJcbiAgICAgICAgJ1gtVEJBLUFwcC1JZCc6IFwiZnJjNDUzNDpvcmI6Y2xpZW50XCJcclxuICAgICAgfSxcclxuICAgICAgdXJsOiB1cmwsXHJcbiAgICAgIGVycm9yOiByZWplY3RcclxuICAgIH0pLnRoZW4ocmVzb2x2ZSk7XHJcbiAgfSkuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XHJcbiAgICBjb25zb2xlLmVycm9yKFwiQVBJIFJlcXVlc3QgVW5zdWNjZXNzZnVsXCIsIHVybCwgcmVzKTtcclxuICAgIHJldHVybiByZXM7XHJcbiAgfSk7XHJcbn0pO1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldFRlYW1TdGF0cyhBUEksIGtleSwgdGVhbSkge1xyXG4gIGxldCBwcm9taXNlcyA9IFtcclxuICAgIEFQSS5nZXQoXCJ0ZWFtL1wiK2tleStcIi9kZWZlbnNlXCIpLFxyXG4gICAgQVBJLmdldChcInRlYW0vXCIra2V5K1wiL2dvYWxzXCIpLFxyXG4gICAgQVBJLmdldChcInRlYW0vXCIra2V5K1wiL3Njb3JlXCIpLFxyXG4gIF07XHJcbiAgaWYgKHR5cGVvZiB0ZWFtID09IFwib2JqZWN0XCIgJiYgdGVhbS50ZWFtX251bWJlciA9PSB0ZWFtKSB7XHJcbiAgICBwcm9taXNlcy5wdXNoKChyZXNvbHZlLCByZWplY3QpID0+IHJlc29sdmUodGVhbSkpXHJcbiAgfSBlbHNlIHtcclxuICAgIHByb21pc2VzLnB1c2goQVBJLmdldChcInRlYW0vXCIra2V5KSk7XHJcbiAgfVxyXG4gIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcykudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgIGxldCBbZGVmZW5zZXMsIGdvYWxzLCBzY29yZSwgdGVhbV0gPSByZXM7XHJcbiAgICByZXR1cm4gZXh0ZW5kKHRlYW0sIHtcclxuICAgICAgc3RhdHM6IHtcclxuICAgICAgICBjYWxjczoge1xyXG4gICAgICAgICAgcHJlZGljdGVkX3JwOiAwLFxyXG4gICAgICAgICAgc2NvcmU6IHNjb3JlXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkZWZlbnNlczoge1xyXG4gICAgICAgICAgbG93X2JhcjogZGVmZW5zZXNbMV0sXHJcbiAgICAgICAgICBwb3J0Y3VsbGlzOiBkZWZlbnNlc1syXSxcclxuICAgICAgICAgIGNoZXZhbF9kZV9mcmlzZTogZGVmZW5zZXNbM10sXHJcbiAgICAgICAgICBtb2F0OiBkZWZlbnNlc1s0XSxcclxuICAgICAgICAgIHJhbXBhcnRzOiBkZWZlbnNlc1s1XSxcclxuICAgICAgICAgIGRyYXdicmlkZ2U6IGRlZmVuc2VzWzZdLFxyXG4gICAgICAgICAgc2FsbHlfcG9ydDogZGVmZW5zZXNbN10sXHJcbiAgICAgICAgICByb2NrX3dhbGw6IGRlZmVuc2VzWzhdLFxyXG4gICAgICAgICAgcm91Z2hfdGVycmFpbjogZGVmZW5zZXNbOV0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICBnb2Fsczoge1xyXG4gICAgICAgICAgYXV0b19sb3c6IGdvYWxzWzFdLFxyXG4gICAgICAgICAgYXV0b19oaWdoOiBnb2Fsc1syXSxcclxuICAgICAgICAgIHRlbGVvcF9sb3c6IGdvYWxzWzNdLFxyXG4gICAgICAgICAgdGVsZW9wX2hpZ2g6IGdvYWxzWzRdLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGVhbXMoQVBJLCBrZXkpIHtcclxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICByZXNvbHZlKEFQSS5nZXQoXCJsaXN0L1wiK2tleSkpO1xyXG4gIH0pLnRoZW4oZnVuY3Rpb24odGVhbXMpIHtcclxuICAgIHJldHVybiBQcm9taXNlLmFsbCh0ZWFtcy5tYXAodGVhbSA9PiBnZXRUZWFtU3RhdHMoQVBJLCB0ZWFtLnRlYW1fbnVtYmVyLCB0ZWFtKSkpO1xyXG4gIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVUb2tlbih0ZWFtLG5hbWUpIHtcclxuICB2YXIgdG9rZW4gPSB0ZWFtICsgXCIuXCIgKyBtZDUobmFtZSk7XHJcbiAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ0b2tlblwiLHRva2VuKTtcclxuICByZXR1cm4gdG9rZW47XHJcbn1cclxuIiwiaW1wb3J0ICcuL2xpYi9lczYtcHJvbWlzZS5taW4uanMnXHJcbmltcG9ydCBUZW1wbGF0ZXMgZnJvbSAnLi9UZW1wbGF0ZXMnXHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgdGVtcGxhdGVzOiB7fSxcclxuICBjb21wb25lbnRzOiB7fSxcclxuICBjcmVhdGU6IGZ1bmN0aW9uKGRvbmUpIHtcclxuICAgIHRoaXMuY29tcG9uZW50cy5Qcm9ncmVzcyA9IFJhY3RpdmUuZXh0ZW5kKHtcclxuICAgICAgIGlzb2xhdGVkOiBmYWxzZSxcclxuICAgICAgIHRlbXBsYXRlOiB0aGlzLnRlbXBsYXRlcy5wcm9ncmVzcyxcclxuICAgICAgIG9uaW5pdDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgIGNvbnN0IHN0YXQgPSB0aGlzLmdldChcInN0YXRcIik7XHJcbiAgICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5nZXQoXCJ2YWx1ZVwiKTtcclxuICAgICAgICAgbGV0IHByb2dyZXNzQ2xhc3M7XHJcbiAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBzdGF0LnByb2dyZXNzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgaWYgKCghc3RhdC5wcm9ncmVzc1tpXS5taW4gfHwgdmFsdWUgPj0gc3RhdC5wcm9ncmVzc1tpXS5taW4pICYmICghc3RhdC5wcm9ncmVzc1tpXS5tYXggfHwgdmFsdWUgPD0gc3RhdC5wcm9ncmVzc1tpXS5tYXgpKSB7XHJcbiAgICAgICAgICAgICBwcm9ncmVzc0NsYXNzID0gc3RhdC5wcm9ncmVzc1tpXS5jbGFzcztcclxuICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgIH1cclxuICAgICAgICAgfVxyXG4gICAgICAgICB0aGlzLnNldCh7XHJcbiAgICAgICAgICAgbWluOiBzdGF0Lm1pbixcclxuICAgICAgICAgICBtYXg6IHN0YXQubWF4LFxyXG4gICAgICAgICAgIHdpZHRoOiAoc3RhdC5taW4gKyB2YWx1ZSkvc3RhdC5tYXggKiAxMDAsXHJcbiAgICAgICAgICAgcHJvZ3Jlc3NDbGFzczogcHJvZ3Jlc3NDbGFzcyxcclxuICAgICAgICAgfSlcclxuICAgICAgIH0sXHJcblxyXG4gICAgfSk7XHJcbiAgfSxcclxuICBsb2FkOiBmdW5jdGlvbihkb25lKSB7XHJcbiAgICBjb25zdCBfdGhpcyA9IHRoaXM7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgIFRlbXBsYXRlcy5nZXQoXCJjb21wb25lbnRzXCIpLnRoZW4oZnVuY3Rpb24odGVtcGxhdGVzKSB7XHJcbiAgICAgICAgJChcIjxkaXY+XCIpLmh0bWwodGVtcGxhdGVzKS5maW5kKFwic2NyaXB0LnRlbXBsYXRlXCIpLmVhY2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBjb25zdCAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICAgICAgICBfdGhpcy50ZW1wbGF0ZXNbJHRoaXMuYXR0cihcIm5hbWVcIildID0gJHRoaXMuaHRtbCgpLnRyaW0oKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBfdGhpcy5jcmVhdGUoKTtcclxuICAgICAgICByZXNvbHZlKF90aGlzKTtcclxuICAgICAgfSkuY2F0Y2gocmVqZWN0KTtcclxuICAgIH0pO1xyXG4gIH0sXHJcbn07XHJcbiIsImltcG9ydCAnLi9saWIvZXM2LXByb21pc2UubWluLmpzJ1xyXG5pbXBvcnQgY2FjaGVhYmxlIGZyb20gJy4vY2FjaGVhYmxlJ1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2FjaGVhYmxlKGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcclxuICAgIGlmKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwidG9rZW5cIikpIHtcclxuICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbG9jYXRpb24uaGFzaCA9IFwiIy9sb2dpblwiXHJcbiAgICAgIHJlamVjdCgpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59KTtcclxuIiwiZXhwb3J0ICogZnJvbSAnLi9wYWdlcy90ZWFtJ1xyXG5leHBvcnQgKiBmcm9tICcuL3BhZ2VzL2V2ZW50J1xyXG5leHBvcnQgKiBmcm9tICcuL3BhZ2VzL2xvZ2luJ1xyXG5leHBvcnQgKiBmcm9tICcuL3BhZ2VzL2V2ZW50cyciLCJpbXBvcnQgJy4vbGliL2VzNi1wcm9taXNlLm1pbi5qcydcclxuaW1wb3J0IGNhY2hlYWJsZSBmcm9tICcuL2NhY2hlYWJsZSdcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGNhY2hlYWJsZShmdW5jdGlvbihrZXkpIHtcclxuICBjb25zdCB1cmwgPSBcInRlbXBsYXRlcy9cIitrZXkrXCIuaHRtbFwiO1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcclxuICAgIHJldHVybiAkLmFqYXgoe1xyXG4gICAgICBtZXRob2Q6IFwiZ2V0XCIsXHJcbiAgICAgIHVybDogdXJsLFxyXG4gICAgICBlcnJvcjogcmVqZWN0XHJcbiAgICB9KS50aGVuKHJlc29sdmUpO1xyXG4gIH0pLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgY29uc29sZS5lcnJvcihcIlRlbXBsYXRlIFJlcXVlc3QgVW5zdWNjZXNzZnVsXCIsIHVybCwgcmVzKTtcclxuICAgIHJldHVybiByZXM7XHJcbiAgfSk7XHJcbn0pO1xyXG4iLCJpbXBvcnQgJy4vbGliL2VzNi1wcm9taXNlLm1pbi5qcydcclxuaW1wb3J0IGNhY2hlYWJsZSBmcm9tICcuL2NhY2hlYWJsZSdcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNhY2hlYWJsZShnZXRQcm9taXNlKSB7XHJcbiAgY29uc3QgX2NhY2hlID0ge307XHJcblxyXG4gIGZ1bmN0aW9uIHNldChrZXksIHZhbHVlKSB7XHJcbiAgICByZXR1cm4gX2NhY2hlW2tleV0gPSB2YWx1ZTtcclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBnZXQoa2V5LCBjYWxsYmFjaykge1xyXG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgICAgaWYgKF9jYWNoZVtrZXldKSB7XHJcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZShfY2FjaGVba2V5XSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBnZXRQcm9taXNlKGtleSlcclxuICAgICAgICAgIC50aGVuKHZhbHVlID0+IHNldChrZXksIHZhbHVlKSlcclxuICAgICAgICAgIC50aGVuKHJlc29sdmUpXHJcbiAgICAgICAgICAuY2F0Y2gocmVqZWN0KTtcclxuXHJcbiAgICAgIH0pLnRoZW4oY2FsbGJhY2spO1xyXG4gICAgfSxcclxuICB9XHJcbn1cclxuIiwiaW1wb3J0ICcuL2xpYi9lczYtcHJvbWlzZS5taW4uanMnXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0SlNPTih1cmwpIHtcclxuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgJC5hamF4KHtcclxuICAgICAgbWV0aG9kOiBcImdldFwiLFxyXG4gICAgICBkYXRhVHlwZTogXCJqc29uXCIsXHJcbiAgICAgIGRhdGE6IHt9LFxyXG4gICAgICB1cmw6IHVybCxcclxuICAgICAgZXJyb3I6IHJlamVjdFxyXG4gICAgfSkudGhlbihyZXNvbHZlKTtcclxuICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHJvdW5kKG4sIGRpZ2l0cykge1xyXG4gIGNvbnN0IG4gPSBwYXJzZUZsb2F0KG4pO1xyXG4gIGNvbnN0IGRpZ2l0cyA9IHBhcnNlSW50KGRpZ2l0cyk7XHJcbiAgY29uc3QgcGFydHMgPSAoTWF0aC5yb3VuZChuICogTWF0aC5wb3coMTAsIGRpZ2l0cykpL01hdGgucG93KDEwLCBkaWdpdHMpKS50b1N0cmluZygpLnNwbGl0KFwiLlwiKTtcclxuICBpZiAocGFydHMubGVuZ3RoID09IDEpIHtcclxuICAgIHBhcnRzLnB1c2goXCJcIik7XHJcbiAgfVxyXG4gIHJldHVybiBwYXJ0c1swXSArIChkaWdpdHMgPyBcIi5cIiA6IFwiXCIpICsgcGFydHNbMV0gKyBBcnJheShNYXRoLm1heCgwLCBkaWdpdHMgLSBwYXJ0c1sxXS5sZW5ndGggKyAxKSkuam9pbihcIjBcIik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBkb2N1bWVudFJlYWR5KCkge1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcclxuICAgIGlmICgkLmlzUmVhZHkpIHtcclxuICAgICAgcmVzb2x2ZSgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgJChyZXNvbHZlKTtcclxuICAgIH1cclxuICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGV4dGVuZCgpIHtcclxuICBjb25zdCByZXN1bHQgPSBhcmd1bWVudHNbMF07XHJcbiAgZm9yKGxldCBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgZm9yKGxldCBrZXkgaW4gYXJndW1lbnRzW2ldKSB7XHJcbiAgICAgIHJlc3VsdFtrZXldID0gYXJndW1lbnRzW2ldW2tleV07XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiByZXN1bHQ7XHJcbn1cclxuIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCl7XG4vKiFcclxuICogQG92ZXJ2aWV3IGVzNi1wcm9taXNlIC0gYSB0aW55IGltcGxlbWVudGF0aW9uIG9mIFByb21pc2VzL0ErLlxyXG4gKiBAY29weXJpZ2h0IENvcHlyaWdodCAoYykgMjAxNCBZZWh1ZGEgS2F0eiwgVG9tIERhbGUsIFN0ZWZhbiBQZW5uZXIgYW5kIGNvbnRyaWJ1dG9ycyAoQ29udmVyc2lvbiB0byBFUzYgQVBJIGJ5IEpha2UgQXJjaGliYWxkKVxyXG4gKiBAbGljZW5zZSAgIExpY2Vuc2VkIHVuZGVyIE1JVCBsaWNlbnNlXHJcbiAqICAgICAgICAgICAgU2VlIGh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9qYWtlYXJjaGliYWxkL2VzNi1wcm9taXNlL21hc3Rlci9MSUNFTlNFXHJcbiAqIEB2ZXJzaW9uICAgMy4yLjFcclxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG4oZnVuY3Rpb24gKCkge1xuICBcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiB0KHQpIHtcbiAgICByZXR1cm4gXCJmdW5jdGlvblwiID09IHR5cGVvZiB0IHx8IFwib2JqZWN0XCIgPT0gdHlwZW9mIHQgJiYgbnVsbCAhPT0gdDtcbiAgfWZ1bmN0aW9uIGUodCkge1xuICAgIHJldHVybiBcImZ1bmN0aW9uXCIgPT0gdHlwZW9mIHQ7XG4gIH1mdW5jdGlvbiBuKHQpIHtcbiAgICBHID0gdDtcbiAgfWZ1bmN0aW9uIHIodCkge1xuICAgIFEgPSB0O1xuICB9ZnVuY3Rpb24gbygpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhhKTtcbiAgICB9O1xuICB9ZnVuY3Rpb24gaSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgQihhKTtcbiAgICB9O1xuICB9ZnVuY3Rpb24gcygpIHtcbiAgICB2YXIgdCA9IDAsXG4gICAgICAgIGUgPSBuZXcgWChhKSxcbiAgICAgICAgbiA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiXCIpO3JldHVybiAoZS5vYnNlcnZlKG4sIHsgY2hhcmFjdGVyRGF0YTogITAgfSksIGZ1bmN0aW9uICgpIHtcbiAgICAgIG4uZGF0YSA9IHQgPSArK3QgJSAyO1xuICAgIH0pO1xuICB9ZnVuY3Rpb24gdSgpIHtcbiAgICB2YXIgdCA9IG5ldyBNZXNzYWdlQ2hhbm5lbCgpO3JldHVybiAodC5wb3J0MS5vbm1lc3NhZ2UgPSBhLCBmdW5jdGlvbiAoKSB7XG4gICAgICB0LnBvcnQyLnBvc3RNZXNzYWdlKDApO1xuICAgIH0pO1xuICB9ZnVuY3Rpb24gYygpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgc2V0VGltZW91dChhLCAxKTtcbiAgICB9O1xuICB9ZnVuY3Rpb24gYSgpIHtcbiAgICBmb3IgKHZhciB0ID0gMDsgSiA+IHQ7IHQgKz0gMikge1xuICAgICAgdmFyIGUgPSB0dFt0XSxcbiAgICAgICAgICBuID0gdHRbdCArIDFdO2UobiksIHR0W3RdID0gdm9pZCAwLCB0dFt0ICsgMV0gPSB2b2lkIDA7XG4gICAgfUogPSAwO1xuICB9ZnVuY3Rpb24gZigpIHtcbiAgICB0cnkge1xuICAgICAgdmFyIHQgPSByZXF1aXJlLFxuICAgICAgICAgIGUgPSB0KFwidmVydHhcIik7cmV0dXJuIChCID0gZS5ydW5Pbkxvb3AgfHwgZS5ydW5PbkNvbnRleHQsIGkoKSk7XG4gICAgfSBjYXRjaCAobikge1xuICAgICAgcmV0dXJuIGMoKTtcbiAgICB9XG4gIH1mdW5jdGlvbiBsKHQsIGUpIHtcbiAgICB2YXIgbiA9IHRoaXMsXG4gICAgICAgIHIgPSBuZXcgdGhpcy5jb25zdHJ1Y3RvcihwKTt2b2lkIDAgPT09IHJbcnRdICYmIGsocik7dmFyIG8gPSBuLl9zdGF0ZTtpZiAobykge1xuICAgICAgdmFyIGkgPSBhcmd1bWVudHNbbyAtIDFdO1EoZnVuY3Rpb24gKCkge1xuICAgICAgICB4KG8sIHIsIGksIG4uX3Jlc3VsdCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2UgRShuLCByLCB0LCBlKTtyZXR1cm4gcjtcbiAgfWZ1bmN0aW9uIGgodCkge1xuICAgIHZhciBlID0gdGhpcztpZiAodCAmJiBcIm9iamVjdFwiID09IHR5cGVvZiB0ICYmIHQuY29uc3RydWN0b3IgPT09IGUpIHtcbiAgICAgIHJldHVybiB0O1xuICAgIH12YXIgbiA9IG5ldyBlKHApO3JldHVybiAoZyhuLCB0KSwgbik7XG4gIH1mdW5jdGlvbiBwKCkge31mdW5jdGlvbiBfKCkge1xuICAgIHJldHVybiBuZXcgVHlwZUVycm9yKFwiWW91IGNhbm5vdCByZXNvbHZlIGEgcHJvbWlzZSB3aXRoIGl0c2VsZlwiKTtcbiAgfWZ1bmN0aW9uIGQoKSB7XG4gICAgcmV0dXJuIG5ldyBUeXBlRXJyb3IoXCJBIHByb21pc2VzIGNhbGxiYWNrIGNhbm5vdCByZXR1cm4gdGhhdCBzYW1lIHByb21pc2UuXCIpO1xuICB9ZnVuY3Rpb24gdih0KSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB0LnRoZW47XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuICh1dC5lcnJvciA9IGUsIHV0KTtcbiAgICB9XG4gIH1mdW5jdGlvbiB5KHQsIGUsIG4sIHIpIHtcbiAgICB0cnkge1xuICAgICAgdC5jYWxsKGUsIG4sIHIpO1xuICAgIH0gY2F0Y2ggKG8pIHtcbiAgICAgIHJldHVybiBvO1xuICAgIH1cbiAgfWZ1bmN0aW9uIG0odCwgZSwgbikge1xuICAgIFEoZnVuY3Rpb24gKHQpIHtcbiAgICAgIHZhciByID0gITEsXG4gICAgICAgICAgbyA9IHkobiwgZSwgZnVuY3Rpb24gKG4pIHtcbiAgICAgICAgciB8fCAociA9ICEwLCBlICE9PSBuID8gZyh0LCBuKSA6IFModCwgbikpO1xuICAgICAgfSwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgciB8fCAociA9ICEwLCBqKHQsIGUpKTtcbiAgICAgIH0sIFwiU2V0dGxlOiBcIiArICh0Ll9sYWJlbCB8fCBcIiB1bmtub3duIHByb21pc2VcIikpOyFyICYmIG8gJiYgKHIgPSAhMCwgaih0LCBvKSk7XG4gICAgfSwgdCk7XG4gIH1mdW5jdGlvbiBiKHQsIGUpIHtcbiAgICBlLl9zdGF0ZSA9PT0gaXQgPyBTKHQsIGUuX3Jlc3VsdCkgOiBlLl9zdGF0ZSA9PT0gc3QgPyBqKHQsIGUuX3Jlc3VsdCkgOiBFKGUsIHZvaWQgMCwgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGcodCwgZSk7XG4gICAgfSwgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGoodCwgZSk7XG4gICAgfSk7XG4gIH1mdW5jdGlvbiB3KHQsIG4sIHIpIHtcbiAgICBuLmNvbnN0cnVjdG9yID09PSB0LmNvbnN0cnVjdG9yICYmIHIgPT09IGV0ICYmIGNvbnN0cnVjdG9yLnJlc29sdmUgPT09IG50ID8gYih0LCBuKSA6IHIgPT09IHV0ID8gaih0LCB1dC5lcnJvcikgOiB2b2lkIDAgPT09IHIgPyBTKHQsIG4pIDogZShyKSA/IG0odCwgbiwgcikgOiBTKHQsIG4pO1xuICB9ZnVuY3Rpb24gZyhlLCBuKSB7XG4gICAgZSA9PT0gbiA/IGooZSwgXygpKSA6IHQobikgPyB3KGUsIG4sIHYobikpIDogUyhlLCBuKTtcbiAgfWZ1bmN0aW9uIEEodCkge1xuICAgIHQuX29uZXJyb3IgJiYgdC5fb25lcnJvcih0Ll9yZXN1bHQpLCBUKHQpO1xuICB9ZnVuY3Rpb24gUyh0LCBlKSB7XG4gICAgdC5fc3RhdGUgPT09IG90ICYmICh0Ll9yZXN1bHQgPSBlLCB0Ll9zdGF0ZSA9IGl0LCAwICE9PSB0Ll9zdWJzY3JpYmVycy5sZW5ndGggJiYgUShULCB0KSk7XG4gIH1mdW5jdGlvbiBqKHQsIGUpIHtcbiAgICB0Ll9zdGF0ZSA9PT0gb3QgJiYgKHQuX3N0YXRlID0gc3QsIHQuX3Jlc3VsdCA9IGUsIFEoQSwgdCkpO1xuICB9ZnVuY3Rpb24gRSh0LCBlLCBuLCByKSB7XG4gICAgdmFyIG8gPSB0Ll9zdWJzY3JpYmVycyxcbiAgICAgICAgaSA9IG8ubGVuZ3RoO3QuX29uZXJyb3IgPSBudWxsLCBvW2ldID0gZSwgb1tpICsgaXRdID0gbiwgb1tpICsgc3RdID0gciwgMCA9PT0gaSAmJiB0Ll9zdGF0ZSAmJiBRKFQsIHQpO1xuICB9ZnVuY3Rpb24gVCh0KSB7XG4gICAgdmFyIGUgPSB0Ll9zdWJzY3JpYmVycyxcbiAgICAgICAgbiA9IHQuX3N0YXRlO2lmICgwICE9PSBlLmxlbmd0aCkge1xuICAgICAgZm9yICh2YXIgciwgbywgaSA9IHQuX3Jlc3VsdCwgcyA9IDA7IHMgPCBlLmxlbmd0aDsgcyArPSAzKSByID0gZVtzXSwgbyA9IGVbcyArIG5dLCByID8geChuLCByLCBvLCBpKSA6IG8oaSk7dC5fc3Vic2NyaWJlcnMubGVuZ3RoID0gMDtcbiAgICB9XG4gIH1mdW5jdGlvbiBNKCkge1xuICAgIHRoaXMuZXJyb3IgPSBudWxsO1xuICB9ZnVuY3Rpb24gUCh0LCBlKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB0KGUpO1xuICAgIH0gY2F0Y2ggKG4pIHtcbiAgICAgIHJldHVybiAoY3QuZXJyb3IgPSBuLCBjdCk7XG4gICAgfVxuICB9ZnVuY3Rpb24geCh0LCBuLCByLCBvKSB7XG4gICAgdmFyIGksXG4gICAgICAgIHMsXG4gICAgICAgIHUsXG4gICAgICAgIGMsXG4gICAgICAgIGEgPSBlKHIpO2lmIChhKSB7XG4gICAgICBpZiAoKGkgPSBQKHIsIG8pLCBpID09PSBjdCA/IChjID0gITAsIHMgPSBpLmVycm9yLCBpID0gbnVsbCkgOiB1ID0gITAsIG4gPT09IGkpKSB7XG4gICAgICAgIHJldHVybiB2b2lkIGoobiwgZCgpKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaSA9IG8sIHUgPSAhMDtuLl9zdGF0ZSAhPT0gb3QgfHwgKGEgJiYgdSA/IGcobiwgaSkgOiBjID8gaihuLCBzKSA6IHQgPT09IGl0ID8gUyhuLCBpKSA6IHQgPT09IHN0ICYmIGoobiwgaSkpO1xuICB9ZnVuY3Rpb24gQyh0LCBlKSB7XG4gICAgdHJ5IHtcbiAgICAgIGUoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZyh0LCBlKTtcbiAgICAgIH0sIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGoodCwgZSk7XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChuKSB7XG4gICAgICBqKHQsIG4pO1xuICAgIH1cbiAgfWZ1bmN0aW9uIE8oKSB7XG4gICAgcmV0dXJuIGF0Kys7XG4gIH1mdW5jdGlvbiBrKHQpIHtcbiAgICB0W3J0XSA9IGF0KyssIHQuX3N0YXRlID0gdm9pZCAwLCB0Ll9yZXN1bHQgPSB2b2lkIDAsIHQuX3N1YnNjcmliZXJzID0gW107XG4gIH1mdW5jdGlvbiBZKHQpIHtcbiAgICByZXR1cm4gbmV3IF90KHRoaXMsIHQpLnByb21pc2U7XG4gIH1mdW5jdGlvbiBxKHQpIHtcbiAgICB2YXIgZSA9IHRoaXM7cmV0dXJuIG5ldyBlKEkodCkgPyBmdW5jdGlvbiAobiwgcikge1xuICAgICAgZm9yICh2YXIgbyA9IHQubGVuZ3RoLCBpID0gMDsgbyA+IGk7IGkrKykgZS5yZXNvbHZlKHRbaV0pLnRoZW4obiwgcik7XG4gICAgfSA6IGZ1bmN0aW9uICh0LCBlKSB7XG4gICAgICBlKG5ldyBUeXBlRXJyb3IoXCJZb3UgbXVzdCBwYXNzIGFuIGFycmF5IHRvIHJhY2UuXCIpKTtcbiAgICB9KTtcbiAgfWZ1bmN0aW9uIEYodCkge1xuICAgIHZhciBlID0gdGhpcyxcbiAgICAgICAgbiA9IG5ldyBlKHApO3JldHVybiAoaihuLCB0KSwgbik7XG4gIH1mdW5jdGlvbiBEKCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJZb3UgbXVzdCBwYXNzIGEgcmVzb2x2ZXIgZnVuY3Rpb24gYXMgdGhlIGZpcnN0IGFyZ3VtZW50IHRvIHRoZSBwcm9taXNlIGNvbnN0cnVjdG9yXCIpO1xuICB9ZnVuY3Rpb24gSygpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRmFpbGVkIHRvIGNvbnN0cnVjdCAnUHJvbWlzZSc6IFBsZWFzZSB1c2UgdGhlICduZXcnIG9wZXJhdG9yLCB0aGlzIG9iamVjdCBjb25zdHJ1Y3RvciBjYW5ub3QgYmUgY2FsbGVkIGFzIGEgZnVuY3Rpb24uXCIpO1xuICB9ZnVuY3Rpb24gTCh0KSB7XG4gICAgdGhpc1tydF0gPSBPKCksIHRoaXMuX3Jlc3VsdCA9IHRoaXMuX3N0YXRlID0gdm9pZCAwLCB0aGlzLl9zdWJzY3JpYmVycyA9IFtdLCBwICE9PSB0ICYmIChcImZ1bmN0aW9uXCIgIT0gdHlwZW9mIHQgJiYgRCgpLCB0aGlzIGluc3RhbmNlb2YgTCA/IEModGhpcywgdCkgOiBLKCkpO1xuICB9ZnVuY3Rpb24gTih0LCBlKSB7XG4gICAgdGhpcy5faW5zdGFuY2VDb25zdHJ1Y3RvciA9IHQsIHRoaXMucHJvbWlzZSA9IG5ldyB0KHApLCB0aGlzLnByb21pc2VbcnRdIHx8IGsodGhpcy5wcm9taXNlKSwgQXJyYXkuaXNBcnJheShlKSA/ICh0aGlzLl9pbnB1dCA9IGUsIHRoaXMubGVuZ3RoID0gZS5sZW5ndGgsIHRoaXMuX3JlbWFpbmluZyA9IGUubGVuZ3RoLCB0aGlzLl9yZXN1bHQgPSBuZXcgQXJyYXkodGhpcy5sZW5ndGgpLCAwID09PSB0aGlzLmxlbmd0aCA/IFModGhpcy5wcm9taXNlLCB0aGlzLl9yZXN1bHQpIDogKHRoaXMubGVuZ3RoID0gdGhpcy5sZW5ndGggfHwgMCwgdGhpcy5fZW51bWVyYXRlKCksIDAgPT09IHRoaXMuX3JlbWFpbmluZyAmJiBTKHRoaXMucHJvbWlzZSwgdGhpcy5fcmVzdWx0KSkpIDogaih0aGlzLnByb21pc2UsIFUoKSk7XG4gIH1mdW5jdGlvbiBVKCkge1xuICAgIHJldHVybiBuZXcgRXJyb3IoXCJBcnJheSBNZXRob2RzIG11c3QgYmUgcHJvdmlkZWQgYW4gQXJyYXlcIik7XG4gIH1mdW5jdGlvbiBXKCkge1xuICAgIHZhciB0O2lmIChcInVuZGVmaW5lZFwiICE9IHR5cGVvZiBnbG9iYWwpIHQgPSBnbG9iYWw7ZWxzZSBpZiAoXCJ1bmRlZmluZWRcIiAhPSB0eXBlb2Ygc2VsZikgdCA9IHNlbGY7ZWxzZSB0cnkge1xuICAgICAgdCA9IEZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJwb2x5ZmlsbCBmYWlsZWQgYmVjYXVzZSBnbG9iYWwgb2JqZWN0IGlzIHVuYXZhaWxhYmxlIGluIHRoaXMgZW52aXJvbm1lbnRcIik7XG4gICAgfXZhciBuID0gdC5Qcm9taXNlOyghbiB8fCBcIltvYmplY3QgUHJvbWlzZV1cIiAhPT0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG4ucmVzb2x2ZSgpKSB8fCBuLmNhc3QpICYmICh0LlByb21pc2UgPSBwdCk7XG4gIH12YXIgejt6ID0gQXJyYXkuaXNBcnJheSA/IEFycmF5LmlzQXJyYXkgOiBmdW5jdGlvbiAodCkge1xuICAgIHJldHVybiBcIltvYmplY3QgQXJyYXldXCIgPT09IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0KTtcbiAgfTt2YXIgQixcbiAgICAgIEcsXG4gICAgICBILFxuICAgICAgSSA9IHosXG4gICAgICBKID0gMCxcbiAgICAgIFEgPSBmdW5jdGlvbiBRKHQsIGUpIHtcbiAgICB0dFtKXSA9IHQsIHR0W0ogKyAxXSA9IGUsIEogKz0gMiwgMiA9PT0gSiAmJiAoRyA/IEcoYSkgOiBIKCkpO1xuICB9LFxuICAgICAgUiA9IFwidW5kZWZpbmVkXCIgIT0gdHlwZW9mIHdpbmRvdyA/IHdpbmRvdyA6IHZvaWQgMCxcbiAgICAgIFYgPSBSIHx8IHt9LFxuICAgICAgWCA9IFYuTXV0YXRpb25PYnNlcnZlciB8fCBWLldlYktpdE11dGF0aW9uT2JzZXJ2ZXIsXG4gICAgICBaID0gXCJ1bmRlZmluZWRcIiA9PSB0eXBlb2Ygc2VsZiAmJiBcInVuZGVmaW5lZFwiICE9IHR5cGVvZiBwcm9jZXNzICYmIFwiW29iamVjdCBwcm9jZXNzXVwiID09PSAoe30pLnRvU3RyaW5nLmNhbGwocHJvY2VzcyksXG4gICAgICAkID0gXCJ1bmRlZmluZWRcIiAhPSB0eXBlb2YgVWludDhDbGFtcGVkQXJyYXkgJiYgXCJ1bmRlZmluZWRcIiAhPSB0eXBlb2YgaW1wb3J0U2NyaXB0cyAmJiBcInVuZGVmaW5lZFwiICE9IHR5cGVvZiBNZXNzYWdlQ2hhbm5lbCxcbiAgICAgIHR0ID0gbmV3IEFycmF5KDEwMDApO0ggPSBaID8gbygpIDogWCA/IHMoKSA6ICQgPyB1KCkgOiB2b2lkIDAgPT09IFIgJiYgXCJmdW5jdGlvblwiID09IHR5cGVvZiByZXF1aXJlID8gZigpIDogYygpO3ZhciBldCA9IGwsXG4gICAgICBudCA9IGgsXG4gICAgICBydCA9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygxNiksXG4gICAgICBvdCA9IHZvaWQgMCxcbiAgICAgIGl0ID0gMSxcbiAgICAgIHN0ID0gMixcbiAgICAgIHV0ID0gbmV3IE0oKSxcbiAgICAgIGN0ID0gbmV3IE0oKSxcbiAgICAgIGF0ID0gMCxcbiAgICAgIGZ0ID0gWSxcbiAgICAgIGx0ID0gcSxcbiAgICAgIGh0ID0gRixcbiAgICAgIHB0ID0gTDtMLmFsbCA9IGZ0LCBMLnJhY2UgPSBsdCwgTC5yZXNvbHZlID0gbnQsIEwucmVqZWN0ID0gaHQsIEwuX3NldFNjaGVkdWxlciA9IG4sIEwuX3NldEFzYXAgPSByLCBMLl9hc2FwID0gUSwgTC5wcm90b3R5cGUgPSB7IGNvbnN0cnVjdG9yOiBMLCB0aGVuOiBldCwgXCJjYXRjaFwiOiBmdW5jdGlvbiBfY2F0Y2godCkge1xuICAgICAgcmV0dXJuIHRoaXMudGhlbihudWxsLCB0KTtcbiAgICB9IH07dmFyIF90ID0gTjtOLnByb3RvdHlwZS5fZW51bWVyYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIGZvciAodmFyIHQgPSB0aGlzLmxlbmd0aCwgZSA9IHRoaXMuX2lucHV0LCBuID0gMDsgdGhpcy5fc3RhdGUgPT09IG90ICYmIHQgPiBuOyBuKyspIHRoaXMuX2VhY2hFbnRyeShlW25dLCBuKTtcbiAgfSwgTi5wcm90b3R5cGUuX2VhY2hFbnRyeSA9IGZ1bmN0aW9uICh0LCBlKSB7XG4gICAgdmFyIG4gPSB0aGlzLl9pbnN0YW5jZUNvbnN0cnVjdG9yLFxuICAgICAgICByID0gbi5yZXNvbHZlO2lmIChyID09PSBudCkge1xuICAgICAgdmFyIG8gPSB2KHQpO2lmIChvID09PSBldCAmJiB0Ll9zdGF0ZSAhPT0gb3QpIHRoaXMuX3NldHRsZWRBdCh0Ll9zdGF0ZSwgZSwgdC5fcmVzdWx0KTtlbHNlIGlmIChcImZ1bmN0aW9uXCIgIT0gdHlwZW9mIG8pIHRoaXMuX3JlbWFpbmluZy0tLCB0aGlzLl9yZXN1bHRbZV0gPSB0O2Vsc2UgaWYgKG4gPT09IHB0KSB7XG4gICAgICAgIHZhciBpID0gbmV3IG4ocCk7dyhpLCB0LCBvKSwgdGhpcy5fd2lsbFNldHRsZUF0KGksIGUpO1xuICAgICAgfSBlbHNlIHRoaXMuX3dpbGxTZXR0bGVBdChuZXcgbihmdW5jdGlvbiAoZSkge1xuICAgICAgICBlKHQpO1xuICAgICAgfSksIGUpO1xuICAgIH0gZWxzZSB0aGlzLl93aWxsU2V0dGxlQXQocih0KSwgZSk7XG4gIH0sIE4ucHJvdG90eXBlLl9zZXR0bGVkQXQgPSBmdW5jdGlvbiAodCwgZSwgbikge1xuICAgIHZhciByID0gdGhpcy5wcm9taXNlO3IuX3N0YXRlID09PSBvdCAmJiAodGhpcy5fcmVtYWluaW5nLS0sIHQgPT09IHN0ID8gaihyLCBuKSA6IHRoaXMuX3Jlc3VsdFtlXSA9IG4pLCAwID09PSB0aGlzLl9yZW1haW5pbmcgJiYgUyhyLCB0aGlzLl9yZXN1bHQpO1xuICB9LCBOLnByb3RvdHlwZS5fd2lsbFNldHRsZUF0ID0gZnVuY3Rpb24gKHQsIGUpIHtcbiAgICB2YXIgbiA9IHRoaXM7RSh0LCB2b2lkIDAsIGZ1bmN0aW9uICh0KSB7XG4gICAgICBuLl9zZXR0bGVkQXQoaXQsIGUsIHQpO1xuICAgIH0sIGZ1bmN0aW9uICh0KSB7XG4gICAgICBuLl9zZXR0bGVkQXQoc3QsIGUsIHQpO1xuICAgIH0pO1xuICB9O3ZhciBkdCA9IFcsXG4gICAgICB2dCA9IHsgUHJvbWlzZTogcHQsIHBvbHlmaWxsOiBkdCB9O1wiZnVuY3Rpb25cIiA9PSB0eXBlb2YgZGVmaW5lICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB2dDtcbiAgfSkgOiBcInVuZGVmaW5lZFwiICE9IHR5cGVvZiBtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMgPyBtb2R1bGUuZXhwb3J0cyA9IHZ0IDogXCJ1bmRlZmluZWRcIiAhPSB0eXBlb2YgdGhpcyAmJiAodGhpcy5FUzZQcm9taXNlID0gdnQpLCBkdCgpO1xufSkuY2FsbCh1bmRlZmluZWQpO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZSgnX3Byb2Nlc3MnKSx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ6dXRmLTg7YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiSWtNNkwxVnpaWEp6TDFOaGJYVmxiQzlFYjJOMWJXVnVkSE12YjNKaUxXTnNhV1Z1ZEM5emNtTXZiR2xpTDJWek5pMXdjbTl0YVhObExtMXBiaTVxY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pT3pzN096czdPenM3T3p0QlFWRkJMRU5CUVVNc1dVRkJWVHRCUVVGRExHTkJRVmtzUTBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNN1FVRkJReXhYUVVGTkxGVkJRVlVzU1VGQlJTeFBRVUZQTEVOQlFVTXNTVUZCUlN4UlFVRlJMRWxCUVVVc1QwRkJUeXhEUVVGRExFbEJRVVVzU1VGQlNTeExRVUZITEVOQlFVTXNRMEZCUVR0SFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF6dEJRVUZETEZkQlFVMHNWVUZCVlN4SlFVRkZMRTlCUVU4c1EwRkJReXhEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRPMEZCUVVNc1MwRkJReXhIUVVGRExFTkJRVU1zUTBGQlFUdEhRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJRenRCUVVGRExFdEJRVU1zUjBGQlF5eERRVUZETEVOQlFVRTdSMEZCUXl4VFFVRlRMRU5CUVVNc1IwRkJSVHRCUVVGRExGZEJRVThzV1VGQlZUdEJRVUZETEdGQlFVOHNRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVUU3UzBGQlF5eERRVUZCTzBkQlFVTXNVMEZCVXl4RFFVRkRMRWRCUVVVN1FVRkJReXhYUVVGUExGbEJRVlU3UVVGQlF5eFBRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVFN1MwRkJReXhEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVkQlFVVTdRVUZCUXl4UlFVRkpMRU5CUVVNc1IwRkJReXhEUVVGRE8xRkJRVU1zUTBGQlF5eEhRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVGRExFTkJRVU1zUjBGQlF5eFJRVUZSTEVOQlFVTXNZMEZCWXl4RFFVRkRMRVZCUVVVc1EwRkJReXhEUVVGRExGRkJRVThzUTBGQlF5eERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRVZCUVVNc1JVRkJReXhoUVVGaExFVkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkRMRmxCUVZVN1FVRkJReXhQUVVGRExFTkJRVU1zU1VGQlNTeEhRVUZETEVOQlFVTXNSMEZCUXl4RlFVRkZMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVUU3UzBGQlF5eERRVUZCTEVOQlFVRTdSMEZCUXl4VFFVRlRMRU5CUVVNc1IwRkJSVHRCUVVGRExGRkJRVWtzUTBGQlF5eEhRVUZETEVsQlFVa3NZMEZCWXl4RlFVRkJMRU5CUVVNc1VVRkJUeXhEUVVGRExFTkJRVU1zUzBGQlN5eERRVUZETEZOQlFWTXNSMEZCUXl4RFFVRkRMRVZCUVVNc1dVRkJWVHRCUVVGRExFOUJRVU1zUTBGQlF5eExRVUZMTEVOQlFVTXNWMEZCVnl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGQk8wdEJRVU1zUTBGQlFTeERRVUZCTzBkQlFVTXNVMEZCVXl4RFFVRkRMRWRCUVVVN1FVRkJReXhYUVVGUExGbEJRVlU3UVVGQlF5eG5Ra0ZCVlN4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlFUdExRVUZETEVOQlFVRTdSMEZCUXl4VFFVRlRMRU5CUVVNc1IwRkJSVHRCUVVGRExGTkJRVWtzU1VGQlNTeERRVUZETEVkQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eEpRVUZGTEVOQlFVTXNSVUZCUXp0QlFVRkRMRlZCUVVrc1EwRkJReXhIUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTTdWVUZCUXl4RFFVRkRMRWRCUVVNc1JVRkJSU3hEUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkRMRXRCUVVzc1EwRkJReXhGUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVNc1MwRkJTeXhEUVVGRExFTkJRVUU3UzBGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFZEJRVVU3UVVGQlF5eFJRVUZITzBGQlFVTXNWVUZCU1N4RFFVRkRMRWRCUVVNc1QwRkJUenRWUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1VVRkJUeXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEZOQlFWTXNTVUZCUlN4RFFVRkRMRU5CUVVNc1dVRkJXU3hGUVVGRExFTkJRVU1zUlVGQlJTeERRVUZCTEVOQlFVRTdTMEZCUXl4RFFVRkJMRTlCUVUwc1EwRkJReXhGUVVGRE8wRkJRVU1zWVVGQlR5eERRVUZETEVWQlFVVXNRMEZCUVR0TFFVRkRPMGRCUVVNc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXp0QlFVRkRMRkZCUVVrc1EwRkJReXhIUVVGRExFbEJRVWs3VVVGQlF5eERRVUZETEVkQlFVTXNTVUZCU1N4SlFVRkpMRU5CUVVNc1YwRkJWeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEV0QlFVc3NRMEZCUXl4TFFVRkhMRU5CUVVNc1EwRkJReXhGUVVGRkxFTkJRVU1zU1VGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEUxQlFVMHNRMEZCUXl4SlFVRkhMRU5CUVVNc1JVRkJRenRCUVVGRExGVkJRVWtzUTBGQlF5eEhRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEZsQlFWVTdRVUZCUXl4VFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGQk8wOUJRVU1zUTBGQlF5eERRVUZCTzB0QlFVTXNUVUZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVUU3UjBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNN1FVRkJReXhSUVVGSkxFTkJRVU1zUjBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCUnl4RFFVRkRMRWxCUVVVc1VVRkJVU3hKUVVGRkxFOUJRVThzUTBGQlF5eEpRVUZGTEVOQlFVTXNRMEZCUXl4WFFVRlhMRXRCUVVjc1EwRkJRenRCUVVGRExHRkJRVThzUTBGQlF5eERRVUZETzB0QlFVRXNTVUZCU1N4RFFVRkRMRWRCUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNVVUZCVHl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUVN4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFZEJRVVVzUlVGQlJTeFRRVUZUTEVOQlFVTXNSMEZCUlR0QlFVRkRMRmRCUVU4c1NVRkJTU3hUUVVGVExFTkJRVU1zTUVOQlFUQkRMRU5CUVVNc1EwRkJRVHRIUVVGRExGTkJRVk1zUTBGQlF5eEhRVUZGTzBGQlFVTXNWMEZCVHl4SlFVRkpMRk5CUVZNc1EwRkJReXh6UkVGQmMwUXNRMEZCUXl4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETzBGQlFVTXNVVUZCUnp0QlFVRkRMR0ZCUVU4c1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlFUdExRVUZETEVOQlFVRXNUMEZCVFN4RFFVRkRMRVZCUVVNN1FVRkJReXhqUVVGUExFVkJRVVVzUTBGQlF5eExRVUZMTEVkQlFVTXNRMEZCUXl4RlFVRkRMRVZCUVVVc1EwRkJRU3hEUVVGQk8wdEJRVU03UjBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVTTdRVUZCUXl4UlFVRkhPMEZCUVVNc1QwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1EwRkJReXhEUVVGQk8wdEJRVU1zUTBGQlFTeFBRVUZOTEVOQlFVTXNSVUZCUXp0QlFVRkRMR0ZCUVU4c1EwRkJReXhEUVVGQk8wdEJRVU03UjBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF6dEJRVUZETEV0QlFVTXNRMEZCUXl4VlFVRlRMRU5CUVVNc1JVRkJRenRCUVVGRExGVkJRVWtzUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXp0VlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXl4VlFVRlRMRU5CUVVNc1JVRkJRenRCUVVGRExGTkJRVU1zUzBGQlJ5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhMUVVGSExFTkJRVU1zUjBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVFc1FVRkJReXhEUVVGQk8wOUJRVU1zUlVGQlF5eFZRVUZUTEVOQlFVTXNSVUZCUXp0QlFVRkRMRk5CUVVNc1MwRkJSeXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlFTeEJRVUZETEVOQlFVRTdUMEZCUXl4RlFVRkRMRlZCUVZVc1NVRkJSU3hEUVVGRExFTkJRVU1zVFVGQlRTeEpRVUZGTEd0Q1FVRnJRaXhEUVVGQkxFRkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SlFVRkZMRU5CUVVNc1MwRkJSeXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlFTeEJRVUZETEVOQlFVRTdTMEZCUXl4RlFVRkRMRU5CUVVNc1EwRkJReXhEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1JVRkJRenRCUVVGRExFdEJRVU1zUTBGQlF5eE5RVUZOTEV0QlFVY3NSVUZCUlN4SFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEU5QlFVOHNRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhOUVVGTkxFdEJRVWNzUlVGQlJTeEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFOUJRVThzUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1MwRkJTeXhEUVVGRExFVkJRVU1zVlVGQlV5eERRVUZETEVWQlFVTTdRVUZCUXl4UFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUTBGQlF5eERRVUZCTzB0QlFVTXNSVUZCUXl4VlFVRlRMRU5CUVVNc1JVRkJRenRCUVVGRExFOUJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVFN1MwRkJReXhEUVVGRExFTkJRVUU3UjBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF6dEJRVUZETEV0QlFVTXNRMEZCUXl4WFFVRlhMRXRCUVVjc1EwRkJReXhEUVVGRExGZEJRVmNzU1VGQlJTeERRVUZETEV0QlFVY3NSVUZCUlN4SlFVRkZMRmRCUVZjc1EwRkJReXhQUVVGUExFdEJRVWNzUlVGQlJTeEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eExRVUZITEVWQlFVVXNSMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFVkJRVVVzUTBGQlF5eExRVUZMTEVOQlFVTXNSMEZCUXl4TFFVRkxMRU5CUVVNc1MwRkJSeXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlFUdEhRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFVkJRVU03UVVGQlF5eExRVUZETEV0QlFVY3NRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eEZRVUZGTEVOQlFVTXNSMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlFUdEhRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJRenRCUVVGRExFdEJRVU1zUTBGQlF5eFJRVUZSTEVsQlFVVXNRMEZCUXl4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRExFTkJRVU1zVDBGQlR5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1JVRkJRenRCUVVGRExFdEJRVU1zUTBGQlF5eE5RVUZOTEV0QlFVY3NSVUZCUlN4TFFVRkhMRU5CUVVNc1EwRkJReXhQUVVGUExFZEJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRWRCUVVNc1JVRkJSU3hGUVVGRExFTkJRVU1zUzBGQlJ5eERRVUZETEVOQlFVTXNXVUZCV1N4RFFVRkRMRTFCUVUwc1NVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkJMRUZCUVVNc1EwRkJRVHRIUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNN1FVRkJReXhMUVVGRExFTkJRVU1zVFVGQlRTeExRVUZITEVWQlFVVXNTMEZCUnl4RFFVRkRMRU5CUVVNc1RVRkJUU3hIUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4SFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkJMRUZCUVVNc1EwRkJRVHRIUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF6dEJRVUZETEZGQlFVa3NRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhaUVVGWk8xRkJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRExGRkJRVkVzUjBGQlF5eEpRVUZKTEVWQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkRMRVZCUVVVc1EwRkJReXhIUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkRMRVZCUVVVc1EwRkJReXhIUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEV0QlFVY3NRMEZCUXl4SlFVRkZMRU5CUVVNc1EwRkJReXhOUVVGTkxFbEJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRVHRIUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXp0QlFVRkRMRkZCUVVrc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eFpRVUZaTzFGQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhOUVVGTkxFTkJRVU1zU1VGQlJ5eERRVUZETEV0QlFVY3NRMEZCUXl4RFFVRkRMRTFCUVUwc1JVRkJRenRCUVVGRExGZEJRVWtzU1VGQlNTeERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zVDBGQlR5eEZRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eE5RVUZOTEVWQlFVTXNRMEZCUXl4SlFVRkZMRU5CUVVNc1JVRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhaUVVGWkxFTkJRVU1zVFVGQlRTeEhRVUZETEVOQlFVTXNRMEZCUVR0TFFVRkRPMGRCUVVNc1UwRkJVeXhEUVVGRExFZEJRVVU3UVVGQlF5eFJRVUZKTEVOQlFVTXNTMEZCU3l4SFFVRkRMRWxCUVVrc1EwRkJRVHRIUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNN1FVRkJReXhSUVVGSE8wRkJRVU1zWVVGQlR5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVFN1MwRkJReXhEUVVGQkxFOUJRVTBzUTBGQlF5eEZRVUZETzBGQlFVTXNZMEZCVHl4RlFVRkZMRU5CUVVNc1MwRkJTeXhIUVVGRExFTkJRVU1zUlVGQlF5eEZRVUZGTEVOQlFVRXNRMEZCUVR0TFFVRkRPMGRCUVVNc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRE8wRkJRVU1zVVVGQlNTeERRVUZETzFGQlFVTXNRMEZCUXp0UlFVRkRMRU5CUVVNN1VVRkJReXhEUVVGRE8xRkJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhKUVVGSExFTkJRVU1zUlVGQlF6dEJRVUZETEZkQlFVY3NRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4TFFVRkhMRVZCUVVVc1NVRkJSU3hEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhMUVVGTExFVkJRVU1zUTBGQlF5eEhRVUZETEVsQlFVa3NRMEZCUVN4SFFVRkZMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEV0QlFVY3NRMEZCUXl4RFFVRkJPMEZCUVVNc1pVRkJUeXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1EwRkJRVHRQUVVGQk8wdEJRVU1zVFVGQlN5eERRVUZETEVkQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNUVUZCVFN4TFFVRkhMRVZCUVVVc1MwRkJSeXhEUVVGRExFbEJRVVVzUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eExRVUZITEVWQlFVVXNSMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNTMEZCUnl4RlFVRkZMRWxCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUVN4QlFVRkRMRU5CUVVFN1IwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkRPMEZCUVVNc1VVRkJSenRCUVVGRExFOUJRVU1zUTBGQlF5eFZRVUZUTEVOQlFVTXNSVUZCUXp0QlFVRkRMRk5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVOQlFVRTdUMEZCUXl4RlFVRkRMRlZCUVZNc1EwRkJReXhGUVVGRE8wRkJRVU1zVTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRVHRQUVVGRExFTkJRVU1zUTBGQlFUdExRVUZETEVOQlFVRXNUMEZCVFN4RFFVRkRMRVZCUVVNN1FVRkJReXhQUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkJPMHRCUVVNN1IwRkJReXhUUVVGVExFTkJRVU1zUjBGQlJUdEJRVUZETEZkQlFVOHNSVUZCUlN4RlFVRkZMRU5CUVVFN1IwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTTdRVUZCUXl4TFFVRkRMRU5CUVVNc1JVRkJSU3hEUVVGRExFZEJRVU1zUlVGQlJTeEZRVUZGTEVWQlFVTXNRMEZCUXl4RFFVRkRMRTFCUVUwc1IwRkJReXhMUVVGTExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4SFFVRkRMRXRCUVVzc1EwRkJReXhGUVVGRExFTkJRVU1zUTBGQlF5eFpRVUZaTEVkQlFVTXNSVUZCUlN4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETzBGQlFVTXNWMEZCVHl4SlFVRkpMRVZCUVVVc1EwRkJReXhKUVVGSkxFVkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETzBGQlFVTXNVVUZCU1N4RFFVRkRMRWRCUVVNc1NVRkJTU3hEUVVGRExFOUJRVThzU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGRExGVkJRVk1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXp0QlFVRkRMRmRCUVVrc1NVRkJTU3hEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEUxQlFVMHNSVUZCUXl4RFFVRkRMRWRCUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVNc1EwRkJReXhEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkJPMHRCUVVNc1IwRkJReXhWUVVGVExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVTTdRVUZCUXl4UFFVRkRMRU5CUVVNc1NVRkJTU3hUUVVGVExFTkJRVU1zYVVOQlFXbERMRU5CUVVNc1EwRkJReXhEUVVGQk8wdEJRVU1zUTBGQlF5eERRVUZCTzBkQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRE8wRkJRVU1zVVVGQlNTeERRVUZETEVkQlFVTXNTVUZCU1R0UlFVRkRMRU5CUVVNc1IwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4UlFVRlBMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkJMRU5CUVVFN1IwRkJReXhUUVVGVExFTkJRVU1zUjBGQlJUdEJRVUZETEZWQlFVMHNTVUZCU1N4VFFVRlRMRU5CUVVNc2IwWkJRVzlHTEVOQlFVTXNRMEZCUVR0SFFVRkRMRk5CUVZNc1EwRkJReXhIUVVGRk8wRkJRVU1zVlVGQlRTeEpRVUZKTEZOQlFWTXNRMEZCUXl4MVNFRkJkVWdzUTBGQlF5eERRVUZCTzBkQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRE8wRkJRVU1zVVVGQlNTeERRVUZETEVWQlFVVXNRMEZCUXl4SFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVkQlFVTXNTVUZCU1N4RFFVRkRMRTFCUVUwc1IwRkJReXhMUVVGTExFTkJRVU1zUlVGQlF5eEpRVUZKTEVOQlFVTXNXVUZCV1N4SFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFdEJRVWNzUTBGQlF5eExRVUZITEZWQlFWVXNTVUZCUlN4UFFVRlBMRU5CUVVNc1NVRkJSU3hEUVVGRExFVkJRVVVzUlVGQlF5eEpRVUZKTEZsQlFWa3NRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhKUVVGSkxFVkJRVU1zUTBGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVFc1FVRkJReXhEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1JVRkJRenRCUVVGRExGRkJRVWtzUTBGQlF5eHZRa0ZCYjBJc1IwRkJReXhEUVVGRExFVkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNSMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRVZCUVVVc1EwRkJReXhKUVVGRkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRVZCUVVNc1MwRkJTeXhEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETEVOQlFVTXNTVUZCUlN4SlFVRkpMRU5CUVVNc1RVRkJUU3hIUVVGRExFTkJRVU1zUlVGQlF5eEpRVUZKTEVOQlFVTXNUVUZCVFN4SFFVRkRMRU5CUVVNc1EwRkJReXhOUVVGTkxFVkJRVU1zU1VGQlNTeERRVUZETEZWQlFWVXNSMEZCUXl4RFFVRkRMRU5CUVVNc1RVRkJUU3hGUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVkQlFVTXNTVUZCU1N4TFFVRkxMRU5CUVVNc1NVRkJTU3hEUVVGRExFMUJRVTBzUTBGQlF5eEZRVUZETEVOQlFVTXNTMEZCUnl4SlFVRkpMRU5CUVVNc1RVRkJUU3hIUVVGRExFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RlFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zU1VGQlJTeEpRVUZKTEVOQlFVTXNUVUZCVFN4SFFVRkRMRWxCUVVrc1EwRkJReXhOUVVGTkxFbEJRVVVzUTBGQlF5eEZRVUZETEVsQlFVa3NRMEZCUXl4VlFVRlZMRVZCUVVVc1JVRkJReXhEUVVGRExFdEJRVWNzU1VGQlNTeERRVUZETEZWQlFWVXNTVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFOUJRVThzUlVGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVFc1FVRkJReXhEUVVGQkxFZEJRVVVzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4UFFVRlBMRVZCUVVNc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlFUdEhRVUZETEZOQlFWTXNRMEZCUXl4SFFVRkZPMEZCUVVNc1YwRkJUeXhKUVVGSkxFdEJRVXNzUTBGQlF5eDVRMEZCZVVNc1EwRkJReXhEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVkQlFVVTdRVUZCUXl4UlFVRkpMRU5CUVVNc1EwRkJReXhKUVVGSExGZEJRVmNzU1VGQlJTeFBRVUZQTEUxQlFVMHNSVUZCUXl4RFFVRkRMRWRCUVVNc1RVRkJUU3hEUVVGRExFdEJRVXNzU1VGQlJ5eFhRVUZYTEVsQlFVVXNUMEZCVHl4SlFVRkpMRVZCUVVNc1EwRkJReXhIUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVsQlFVYzdRVUZCUXl4UFFVRkRMRWRCUVVNc1VVRkJVU3hEUVVGRExHRkJRV0VzUTBGQlF5eEZRVUZGTEVOQlFVRTdTMEZCUXl4RFFVRkJMRTlCUVUwc1EwRkJReXhGUVVGRE8wRkJRVU1zV1VGQlRTeEpRVUZKTEV0QlFVc3NRMEZCUXl3d1JVRkJNRVVzUTBGQlF5eERRVUZCTzB0QlFVTXNTVUZCU1N4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SlFVRkZMR3RDUVVGclFpeExRVUZITEUxQlFVMHNRMEZCUXl4VFFVRlRMRU5CUVVNc1VVRkJVU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4RlFVRkZMRU5CUVVNc1NVRkJSU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZCTEV0QlFVa3NRMEZCUXl4RFFVRkRMRTlCUVU4c1IwRkJReXhGUVVGRkxFTkJRVUVzUVVGQlF5eERRVUZCTzBkQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGRExFdEJRVXNzUTBGQlF5eFBRVUZQTEVkQlFVTXNTMEZCU3l4RFFVRkRMRTlCUVU4c1IwRkJReXhWUVVGVExFTkJRVU1zUlVGQlF6dEJRVUZETEZkQlFVMHNaMEpCUVdkQ0xFdEJRVWNzVFVGQlRTeERRVUZETEZOQlFWTXNRMEZCUXl4UlFVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZCTzBkQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNN1RVRkJReXhEUVVGRE8wMUJRVU1zUTBGQlF6dE5RVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRPMDFCUVVNc1EwRkJReXhIUVVGRExFTkJRVU03VFVGQlF5eERRVUZETEVkQlFVTXNWMEZCVXl4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRE8wRkJRVU1zVFVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNc1JVRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFbEJRVVVzUTBGQlF5eEZRVUZETEVOQlFVTXNTMEZCUnl4RFFVRkRMRXRCUVVjc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRVZCUVVVc1EwRkJRU3hCUVVGRExFTkJRVUU3UjBGQlF6dE5RVUZETEVOQlFVTXNSMEZCUXl4WFFVRlhMRWxCUVVVc1QwRkJUeXhOUVVGTkxFZEJRVU1zVFVGQlRTeEhRVUZETEV0QlFVc3NRMEZCUXp0TlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFbEJRVVVzUlVGQlJUdE5RVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRU5CUVVNc1owSkJRV2RDTEVsQlFVVXNRMEZCUXl4RFFVRkRMSE5DUVVGelFqdE5RVUZETEVOQlFVTXNSMEZCUXl4WFFVRlhMRWxCUVVVc1QwRkJUeXhKUVVGSkxFbEJRVVVzVjBGQlZ5eEpRVUZGTEU5QlFVOHNUMEZCVHl4SlFVRkZMR3RDUVVGclFpeExRVUZITEVOQlFVRXNSMEZCUlN4RFFVRkRMRkZCUVZFc1EwRkJReXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETzAxQlFVTXNRMEZCUXl4SFFVRkRMRmRCUVZjc1NVRkJSU3hQUVVGUExHbENRVUZwUWl4SlFVRkZMRmRCUVZjc1NVRkJSU3hQUVVGUExHRkJRV0VzU1VGQlJTeFhRVUZYTEVsQlFVVXNUMEZCVHl4alFVRmpPMDFCUVVNc1JVRkJSU3hIUVVGRExFbEJRVWtzUzBGQlN5eERRVUZETEVsQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eEZRVUZGTEVkQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNc1JVRkJSU3hIUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVWQlFVVXNSMEZCUXl4TFFVRkxMRU5CUVVNc1MwRkJSeXhEUVVGRExFbEJRVVVzVlVGQlZTeEpRVUZGTEU5QlFVOHNUMEZCVHl4SFFVRkRMRU5CUVVNc1JVRkJSU3hIUVVGRExFTkJRVU1zUlVGQlJTeERRVUZETEVsQlFVa3NSVUZCUlN4SFFVRkRMRU5CUVVNN1RVRkJReXhGUVVGRkxFZEJRVU1zUTBGQlF6dE5RVUZETEVWQlFVVXNSMEZCUXl4SlFVRkpMRU5CUVVNc1RVRkJUU3hGUVVGRkxFTkJRVU1zVVVGQlVTeERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRMRk5CUVZNc1EwRkJReXhGUVVGRkxFTkJRVU03VFVGQlF5eEZRVUZGTEVkQlFVTXNTMEZCU3l4RFFVRkRPMDFCUVVNc1JVRkJSU3hIUVVGRExFTkJRVU03VFVGQlF5eEZRVUZGTEVkQlFVTXNRMEZCUXp0TlFVRkRMRVZCUVVVc1IwRkJReXhKUVVGSkxFTkJRVU1zUlVGQlFUdE5RVUZETEVWQlFVVXNSMEZCUXl4SlFVRkpMRU5CUVVNc1JVRkJRVHROUVVGRExFVkJRVVVzUjBGQlF5eERRVUZETzAxQlFVTXNSVUZCUlN4SFFVRkRMRU5CUVVNN1RVRkJReXhGUVVGRkxFZEJRVU1zUTBGQlF6dE5RVUZETEVWQlFVVXNSMEZCUXl4RFFVRkRPMDFCUVVNc1JVRkJSU3hIUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUnl4SFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFTkJRVU1zU1VGQlNTeEhRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRU5CUVVNc1QwRkJUeXhIUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEVOQlFVTXNUVUZCVFN4SFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFTkJRVU1zWVVGQllTeEhRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1VVRkJVU3hIUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNTMEZCU3l4SFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zVTBGQlV5eEhRVUZETEVWQlFVTXNWMEZCVnl4RlFVRkRMRU5CUVVNc1JVRkJReXhKUVVGSkxFVkJRVU1zUlVGQlJTeEZRVUZETEU5QlFVOHNSVUZCUXl4blFrRkJVeXhEUVVGRExFVkJRVU03UVVGQlF5eGhRVUZQTEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hGUVVGRExFTkJRVU1zUTBGQlF5eERRVUZCTzB0QlFVTXNSVUZCUXl4RFFVRkRMRWxCUVVrc1JVRkJSU3hIUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNVMEZCVXl4RFFVRkRMRlZCUVZVc1IwRkJReXhaUVVGVk8wRkJRVU1zVTBGQlNTeEpRVUZKTEVOQlFVTXNSMEZCUXl4SlFVRkpMRU5CUVVNc1RVRkJUU3hGUVVGRExFTkJRVU1zUjBGQlF5eEpRVUZKTEVOQlFVTXNUVUZCVFN4RlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFVkJRVU1zU1VGQlNTeERRVUZETEUxQlFVMHNTMEZCUnl4RlFVRkZMRWxCUVVVc1EwRkJReXhIUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVVXNSVUZCUXl4SlFVRkpMRU5CUVVNc1ZVRkJWU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRVHRIUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEZOQlFWTXNRMEZCUXl4VlFVRlZMRWRCUVVNc1ZVRkJVeXhEUVVGRExFVkJRVU1zUTBGQlF5eEZRVUZETzBGQlFVTXNVVUZCU1N4RFFVRkRMRWRCUVVNc1NVRkJTU3hEUVVGRExHOUNRVUZ2UWp0UlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zVDBGQlR5eERRVUZETEVsQlFVY3NRMEZCUXl4TFFVRkhMRVZCUVVVc1JVRkJRenRCUVVGRExGVkJRVWtzUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhKUVVGSExFTkJRVU1zUzBGQlJ5eEZRVUZGTEVsQlFVVXNRMEZCUXl4RFFVRkRMRTFCUVUwc1MwRkJSeXhGUVVGRkxFVkJRVU1zU1VGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1RVRkJUU3hGUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1MwRkJTeXhKUVVGSExGVkJRVlVzU1VGQlJTeFBRVUZQTEVOQlFVTXNSVUZCUXl4SlFVRkpMRU5CUVVNc1ZVRkJWU3hGUVVGRkxFVkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zUzBGQlN5eEpRVUZITEVOQlFVTXNTMEZCUnl4RlFVRkZMRVZCUVVNN1FVRkJReXhaUVVGSkxFTkJRVU1zUjBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRVHRQUVVGRExFMUJRVXNzU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhWUVVGVExFTkJRVU1zUlVGQlF6dEJRVUZETEZOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRVHRQUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUVR0TFFVRkRMRTFCUVVzc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFTkJRVUU3UjBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUXl4VFFVRlRMRU5CUVVNc1ZVRkJWU3hIUVVGRExGVkJRVk1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNN1FVRkJReXhSUVVGSkxFTkJRVU1zUjBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJReXhOUVVGTkxFdEJRVWNzUlVGQlJTeExRVUZITEVsQlFVa3NRMEZCUXl4VlFVRlZMRVZCUVVVc1JVRkJReXhEUVVGRExFdEJRVWNzUlVGQlJTeEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFZEJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVUVzUVVGQlF5eEZRVUZETEVOQlFVTXNTMEZCUnl4SlFVRkpMRU5CUVVNc1ZVRkJWU3hKUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGQk8wZEJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNVMEZCVXl4RFFVRkRMR0ZCUVdFc1IwRkJReXhWUVVGVExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVTTdRVUZCUXl4UlFVRkpMRU5CUVVNc1IwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4TFFVRkxMRU5CUVVNc1JVRkJReXhWUVVGVExFTkJRVU1zUlVGQlF6dEJRVUZETEU5QlFVTXNRMEZCUXl4VlFVRlZMRU5CUVVNc1JVRkJSU3hGUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUVR0TFFVRkRMRVZCUVVNc1ZVRkJVeXhEUVVGRExFVkJRVU03UVVGQlF5eFBRVUZETEVOQlFVTXNWVUZCVlN4RFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVOQlFVRTdTMEZCUXl4RFFVRkRMRU5CUVVFN1IwRkJReXhEUVVGRExFbEJRVWtzUlVGQlJTeEhRVUZETEVOQlFVTTdUVUZCUXl4RlFVRkZMRWRCUVVNc1JVRkJReXhQUVVGUExFVkJRVU1zUlVGQlJTeEZRVUZETEZGQlFWRXNSVUZCUXl4RlFVRkZMRVZCUVVNc1EwRkJReXhWUVVGVkxFbEJRVVVzVDBGQlR5eE5RVUZOTEVsQlFVVXNUVUZCVFN4RFFVRkRMRWRCUVVjc1IwRkJReXhOUVVGTkxFTkJRVU1zV1VGQlZUdEJRVUZETEZkQlFVOHNSVUZCUlN4RFFVRkJPMGRCUVVNc1EwRkJReXhIUVVGRExGZEJRVmNzU1VGQlJTeFBRVUZQTEUxQlFVMHNTVUZCUlN4TlFVRk5MRU5CUVVNc1QwRkJUeXhIUVVGRExFMUJRVTBzUTBGQlF5eFBRVUZQTEVkQlFVTXNSVUZCUlN4SFFVRkRMRmRCUVZjc1NVRkJSU3hQUVVGUExFbEJRVWtzUzBGQlJ5eEpRVUZKTEVOQlFVTXNWVUZCVlN4SFFVRkRMRVZCUVVVc1EwRkJRU3hCUVVGRExFVkJRVU1zUlVGQlJTeEZRVUZGTEVOQlFVRTdRMEZCUXl4RFFVRkJMRU5CUVVVc1NVRkJTU3hYUVVGTkxFTkJRVU1pTENKbWFXeGxJam9pWjJWdVpYSmhkR1ZrTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhORGIyNTBaVzUwSWpwYklpOHFJVnh5WEc0Z0tpQkFiM1psY25acFpYY2daWE0yTFhCeWIyMXBjMlVnTFNCaElIUnBibmtnYVcxd2JHVnRaVzUwWVhScGIyNGdiMllnVUhKdmJXbHpaWE12UVNzdVhISmNiaUFxSUVCamIzQjVjbWxuYUhRZ1EyOXdlWEpwWjJoMElDaGpLU0F5TURFMElGbGxhSFZrWVNCTFlYUjZMQ0JVYjIwZ1JHRnNaU3dnVTNSbFptRnVJRkJsYm01bGNpQmhibVFnWTI5dWRISnBZblYwYjNKeklDaERiMjUyWlhKemFXOXVJSFJ2SUVWVE5pQkJVRWtnWW5rZ1NtRnJaU0JCY21Ob2FXSmhiR1FwWEhKY2JpQXFJRUJzYVdObGJuTmxJQ0FnVEdsalpXNXpaV1FnZFc1a1pYSWdUVWxVSUd4cFkyVnVjMlZjY2x4dUlDb2dJQ0FnSUNBZ0lDQWdJQ0JUWldVZ2FIUjBjSE02THk5eVlYY3VaMmwwYUhWaWRYTmxjbU52Ym5SbGJuUXVZMjl0TDJwaGEyVmhjbU5vYVdKaGJHUXZaWE0yTFhCeWIyMXBjMlV2YldGemRHVnlMMHhKUTBWT1UwVmNjbHh1SUNvZ1FIWmxjbk5wYjI0Z0lDQXpMakl1TVZ4eVhHNGdLaTljY2x4dVhISmNiaWhtZFc1amRHbHZiaWdwZTF3aWRYTmxJSE4wY21samRGd2lPMloxYm1OMGFXOXVJSFFvZENsN2NtVjBkWEp1WENKbWRXNWpkR2x2Ymx3aVBUMTBlWEJsYjJZZ2RIeDhYQ0p2WW1wbFkzUmNJajA5ZEhsd1pXOW1JSFFtSm01MWJHd2hQVDEwZldaMWJtTjBhVzl1SUdVb2RDbDdjbVYwZFhKdVhDSm1kVzVqZEdsdmJsd2lQVDEwZVhCbGIyWWdkSDFtZFc1amRHbHZiaUJ1S0hRcGUwYzlkSDFtZFc1amRHbHZiaUJ5S0hRcGUxRTlkSDFtZFc1amRHbHZiaUJ2S0NsN2NtVjBkWEp1SUdaMWJtTjBhVzl1S0NsN2NISnZZMlZ6Y3k1dVpYaDBWR2xqYXloaEtYMTlablZ1WTNScGIyNGdhU2dwZTNKbGRIVnliaUJtZFc1amRHbHZiaWdwZTBJb1lTbDlmV1oxYm1OMGFXOXVJSE1vS1h0MllYSWdkRDB3TEdVOWJtVjNJRmdvWVNrc2JqMWtiMk4xYldWdWRDNWpjbVZoZEdWVVpYaDBUbTlrWlNoY0lsd2lLVHR5WlhSMWNtNGdaUzV2WW5ObGNuWmxLRzRzZTJOb1lYSmhZM1JsY2tSaGRHRTZJVEI5S1N4bWRXNWpkR2x2YmlncGUyNHVaR0YwWVQxMFBTc3JkQ1V5ZlgxbWRXNWpkR2x2YmlCMUtDbDdkbUZ5SUhROWJtVjNJRTFsYzNOaFoyVkRhR0Z1Ym1Wc08zSmxkSFZ5YmlCMExuQnZjblF4TG05dWJXVnpjMkZuWlQxaExHWjFibU4wYVc5dUtDbDdkQzV3YjNKME1pNXdiM04wVFdWemMyRm5aU2d3S1gxOVpuVnVZM1JwYjI0Z1l5Z3BlM0psZEhWeWJpQm1kVzVqZEdsdmJpZ3BlM05sZEZScGJXVnZkWFFvWVN3eEtYMTlablZ1WTNScGIyNGdZU2dwZTJadmNpaDJZWElnZEQwd08wbytkRHQwS3oweUtYdDJZWElnWlQxMGRGdDBYU3h1UFhSMFczUXJNVjA3WlNodUtTeDBkRnQwWFQxMmIybGtJREFzZEhSYmRDc3hYVDEyYjJsa0lEQjlTajB3ZldaMWJtTjBhVzl1SUdZb0tYdDBjbmw3ZG1GeUlIUTljbVZ4ZFdseVpTeGxQWFFvWENKMlpYSjBlRndpS1R0eVpYUjFjbTRnUWoxbExuSjFiazl1VEc5dmNIeDhaUzV5ZFc1UGJrTnZiblJsZUhRc2FTZ3BmV05oZEdOb0tHNHBlM0psZEhWeWJpQmpLQ2w5ZldaMWJtTjBhVzl1SUd3b2RDeGxLWHQyWVhJZ2JqMTBhR2x6TEhJOWJtVjNJSFJvYVhNdVkyOXVjM1J5ZFdOMGIzSW9jQ2s3ZG05cFpDQXdQVDA5Y2x0eWRGMG1KbXNvY2lrN2RtRnlJRzg5Ymk1ZmMzUmhkR1U3YVdZb2J5bDdkbUZ5SUdrOVlYSm5kVzFsYm5SelcyOHRNVjA3VVNobWRXNWpkR2x2YmlncGUzZ29ieXh5TEdrc2JpNWZjbVZ6ZFd4MEtYMHBmV1ZzYzJVZ1JTaHVMSElzZEN4bEtUdHlaWFIxY200Z2NuMW1kVzVqZEdsdmJpQm9LSFFwZTNaaGNpQmxQWFJvYVhNN2FXWW9kQ1ltWENKdlltcGxZM1JjSWowOWRIbHdaVzltSUhRbUpuUXVZMjl1YzNSeWRXTjBiM0k5UFQxbEtYSmxkSFZ5YmlCME8zWmhjaUJ1UFc1bGR5QmxLSEFwTzNKbGRIVnliaUJuS0c0c2RDa3NibjFtZFc1amRHbHZiaUJ3S0NsN2ZXWjFibU4wYVc5dUlGOG9LWHR5WlhSMWNtNGdibVYzSUZSNWNHVkZjbkp2Y2loY0lsbHZkU0JqWVc1dWIzUWdjbVZ6YjJ4MlpTQmhJSEJ5YjIxcGMyVWdkMmwwYUNCcGRITmxiR1pjSWlsOVpuVnVZM1JwYjI0Z1pDZ3BlM0psZEhWeWJpQnVaWGNnVkhsd1pVVnljbTl5S0Z3aVFTQndjbTl0YVhObGN5QmpZV3hzWW1GamF5QmpZVzV1YjNRZ2NtVjBkWEp1SUhSb1lYUWdjMkZ0WlNCd2NtOXRhWE5sTGx3aUtYMW1kVzVqZEdsdmJpQjJLSFFwZTNSeWVYdHlaWFIxY200Z2RDNTBhR1Z1ZldOaGRHTm9LR1VwZTNKbGRIVnliaUIxZEM1bGNuSnZjajFsTEhWMGZYMW1kVzVqZEdsdmJpQjVLSFFzWlN4dUxISXBlM1J5ZVh0MExtTmhiR3dvWlN4dUxISXBmV05oZEdOb0tHOHBlM0psZEhWeWJpQnZmWDFtZFc1amRHbHZiaUJ0S0hRc1pTeHVLWHRSS0daMWJtTjBhVzl1S0hRcGUzWmhjaUJ5UFNFeExHODllU2h1TEdVc1puVnVZM1JwYjI0b2JpbDdjbng4S0hJOUlUQXNaU0U5UFc0L1p5aDBMRzRwT2xNb2RDeHVLU2w5TEdaMWJtTjBhVzl1S0dVcGUzSjhmQ2h5UFNFd0xHb29kQ3hsS1NsOUxGd2lVMlYwZEd4bE9pQmNJaXNvZEM1ZmJHRmlaV3g4ZkZ3aUlIVnVhMjV2ZDI0Z2NISnZiV2x6WlZ3aUtTazdJWEltSm04bUppaHlQU0V3TEdvb2RDeHZLU2w5TEhRcGZXWjFibU4wYVc5dUlHSW9kQ3hsS1h0bExsOXpkR0YwWlQwOVBXbDBQMU1vZEN4bExsOXlaWE4xYkhRcE9tVXVYM04wWVhSbFBUMDljM1EvYWloMExHVXVYM0psYzNWc2RDazZSU2hsTEhadmFXUWdNQ3htZFc1amRHbHZiaWhsS1h0bktIUXNaU2w5TEdaMWJtTjBhVzl1S0dVcGUyb29kQ3hsS1gwcGZXWjFibU4wYVc5dUlIY29kQ3h1TEhJcGUyNHVZMjl1YzNSeWRXTjBiM0k5UFQxMExtTnZibk4wY25WamRHOXlKaVp5UFQwOVpYUW1KbU52Ym5OMGNuVmpkRzl5TG5KbGMyOXNkbVU5UFQxdWREOWlLSFFzYmlrNmNqMDlQWFYwUDJvb2RDeDFkQzVsY25KdmNpazZkbTlwWkNBd1BUMDljajlUS0hRc2JpazZaU2h5S1Q5dEtIUXNiaXh5S1RwVEtIUXNiaWw5Wm5WdVkzUnBiMjRnWnlobExHNHBlMlU5UFQxdVAyb29aU3hmS0NrcE9uUW9iaWsvZHlobExHNHNkaWh1S1NrNlV5aGxMRzRwZldaMWJtTjBhVzl1SUVFb2RDbDdkQzVmYjI1bGNuSnZjaVltZEM1ZmIyNWxjbkp2Y2loMExsOXlaWE4xYkhRcExGUW9kQ2w5Wm5WdVkzUnBiMjRnVXloMExHVXBlM1F1WDNOMFlYUmxQVDA5YjNRbUppaDBMbDl5WlhOMWJIUTlaU3gwTGw5emRHRjBaVDFwZEN3d0lUMDlkQzVmYzNWaWMyTnlhV0psY25NdWJHVnVaM1JvSmlaUktGUXNkQ2twZldaMWJtTjBhVzl1SUdvb2RDeGxLWHQwTGw5emRHRjBaVDA5UFc5MEppWW9kQzVmYzNSaGRHVTljM1FzZEM1ZmNtVnpkV3gwUFdVc1VTaEJMSFFwS1gxbWRXNWpkR2x2YmlCRktIUXNaU3h1TEhJcGUzWmhjaUJ2UFhRdVgzTjFZbk5qY21saVpYSnpMR2s5Ynk1c1pXNW5kR2c3ZEM1ZmIyNWxjbkp2Y2oxdWRXeHNMRzliYVYwOVpTeHZXMmtyYVhSZFBXNHNiMXRwSzNOMFhUMXlMREE5UFQxcEppWjBMbDl6ZEdGMFpTWW1VU2hVTEhRcGZXWjFibU4wYVc5dUlGUW9kQ2w3ZG1GeUlHVTlkQzVmYzNWaWMyTnlhV0psY25Nc2JqMTBMbDl6ZEdGMFpUdHBaaWd3SVQwOVpTNXNaVzVuZEdncGUyWnZjaWgyWVhJZ2NpeHZMR2s5ZEM1ZmNtVnpkV3gwTEhNOU1EdHpQR1V1YkdWdVozUm9PM01yUFRNcGNqMWxXM05kTEc4OVpWdHpLMjVkTEhJL2VDaHVMSElzYnl4cEtUcHZLR2twTzNRdVgzTjFZbk5qY21saVpYSnpMbXhsYm1kMGFEMHdmWDFtZFc1amRHbHZiaUJOS0NsN2RHaHBjeTVsY25KdmNqMXVkV3hzZldaMWJtTjBhVzl1SUZBb2RDeGxLWHQwY25sN2NtVjBkWEp1SUhRb1pTbDlZMkYwWTJnb2JpbDdjbVYwZFhKdUlHTjBMbVZ5Y205eVBXNHNZM1I5ZldaMWJtTjBhVzl1SUhnb2RDeHVMSElzYnlsN2RtRnlJR2tzY3l4MUxHTXNZVDFsS0hJcE8ybG1LR0VwZTJsbUtHazlVQ2h5TEc4cExHazlQVDFqZEQ4b1l6MGhNQ3h6UFdrdVpYSnliM0lzYVQxdWRXeHNLVHAxUFNFd0xHNDlQVDFwS1hKbGRIVnliaUIyYjJsa0lHb29iaXhrS0NrcGZXVnNjMlVnYVQxdkxIVTlJVEE3Ymk1ZmMzUmhkR1VoUFQxdmRIeDhLR0VtSm5VL1p5aHVMR2twT21NL2FpaHVMSE1wT25ROVBUMXBkRDlUS0c0c2FTazZkRDA5UFhOMEppWnFLRzRzYVNrcGZXWjFibU4wYVc5dUlFTW9kQ3hsS1h0MGNubDdaU2htZFc1amRHbHZiaWhsS1h0bktIUXNaU2w5TEdaMWJtTjBhVzl1S0dVcGUyb29kQ3hsS1gwcGZXTmhkR05vS0c0cGUyb29kQ3h1S1gxOVpuVnVZM1JwYjI0Z1R5Z3BlM0psZEhWeWJpQmhkQ3NyZldaMWJtTjBhVzl1SUdzb2RDbDdkRnR5ZEYwOVlYUXJLeXgwTGw5emRHRjBaVDEyYjJsa0lEQXNkQzVmY21WemRXeDBQWFp2YVdRZ01DeDBMbDl6ZFdKelkzSnBZbVZ5Y3oxYlhYMW1kVzVqZEdsdmJpQlpLSFFwZTNKbGRIVnliaUJ1WlhjZ1gzUW9kR2hwY3l4MEtTNXdjbTl0YVhObGZXWjFibU4wYVc5dUlIRW9kQ2w3ZG1GeUlHVTlkR2hwY3p0eVpYUjFjbTRnYm1WM0lHVW9TU2gwS1Q5bWRXNWpkR2x2YmlodUxISXBlMlp2Y2loMllYSWdiejEwTG14bGJtZDBhQ3hwUFRBN2J6NXBPMmtyS3lsbExuSmxjMjlzZG1Vb2RGdHBYU2t1ZEdobGJpaHVMSElwZlRwbWRXNWpkR2x2YmloMExHVXBlMlVvYm1WM0lGUjVjR1ZGY25KdmNpaGNJbGx2ZFNCdGRYTjBJSEJoYzNNZ1lXNGdZWEp5WVhrZ2RHOGdjbUZqWlM1Y0lpa3BmU2w5Wm5WdVkzUnBiMjRnUmloMEtYdDJZWElnWlQxMGFHbHpMRzQ5Ym1WM0lHVW9jQ2s3Y21WMGRYSnVJR29vYml4MEtTeHVmV1oxYm1OMGFXOXVJRVFvS1h0MGFISnZkeUJ1WlhjZ1ZIbHdaVVZ5Y205eUtGd2lXVzkxSUcxMWMzUWdjR0Z6Y3lCaElISmxjMjlzZG1WeUlHWjFibU4wYVc5dUlHRnpJSFJvWlNCbWFYSnpkQ0JoY21kMWJXVnVkQ0IwYnlCMGFHVWdjSEp2YldselpTQmpiMjV6ZEhKMVkzUnZjbHdpS1gxbWRXNWpkR2x2YmlCTEtDbDdkR2h5YjNjZ2JtVjNJRlI1Y0dWRmNuSnZjaWhjSWtaaGFXeGxaQ0IwYnlCamIyNXpkSEoxWTNRZ0oxQnliMjFwYzJVbk9pQlFiR1ZoYzJVZ2RYTmxJSFJvWlNBbmJtVjNKeUJ2Y0dWeVlYUnZjaXdnZEdocGN5QnZZbXBsWTNRZ1kyOXVjM1J5ZFdOMGIzSWdZMkZ1Ym05MElHSmxJR05oYkd4bFpDQmhjeUJoSUdaMWJtTjBhVzl1TGx3aUtYMW1kVzVqZEdsdmJpQk1LSFFwZTNSb2FYTmJjblJkUFU4b0tTeDBhR2x6TGw5eVpYTjFiSFE5ZEdocGN5NWZjM1JoZEdVOWRtOXBaQ0F3TEhSb2FYTXVYM04xWW5OamNtbGlaWEp6UFZ0ZExIQWhQVDEwSmlZb1hDSm1kVzVqZEdsdmJsd2lJVDEwZVhCbGIyWWdkQ1ltUkNncExIUm9hWE1nYVc1emRHRnVZMlZ2WmlCTVAwTW9kR2hwY3l4MEtUcExLQ2twZldaMWJtTjBhVzl1SUU0b2RDeGxLWHQwYUdsekxsOXBibk4wWVc1alpVTnZibk4wY25WamRHOXlQWFFzZEdocGN5NXdjbTl0YVhObFBXNWxkeUIwS0hBcExIUm9hWE11Y0hKdmJXbHpaVnR5ZEYxOGZHc29kR2hwY3k1d2NtOXRhWE5sS1N4QmNuSmhlUzVwYzBGeWNtRjVLR1VwUHloMGFHbHpMbDlwYm5CMWREMWxMSFJvYVhNdWJHVnVaM1JvUFdVdWJHVnVaM1JvTEhSb2FYTXVYM0psYldGcGJtbHVaejFsTG14bGJtZDBhQ3gwYUdsekxsOXlaWE4xYkhROWJtVjNJRUZ5Y21GNUtIUm9hWE11YkdWdVozUm9LU3d3UFQwOWRHaHBjeTVzWlc1bmRHZy9VeWgwYUdsekxuQnliMjFwYzJVc2RHaHBjeTVmY21WemRXeDBLVG9vZEdocGN5NXNaVzVuZEdnOWRHaHBjeTVzWlc1bmRHaDhmREFzZEdocGN5NWZaVzUxYldWeVlYUmxLQ2tzTUQwOVBYUm9hWE11WDNKbGJXRnBibWx1WnlZbVV5aDBhR2x6TG5CeWIyMXBjMlVzZEdocGN5NWZjbVZ6ZFd4MEtTa3BPbW9vZEdocGN5NXdjbTl0YVhObExGVW9LU2w5Wm5WdVkzUnBiMjRnVlNncGUzSmxkSFZ5YmlCdVpYY2dSWEp5YjNJb1hDSkJjbkpoZVNCTlpYUm9iMlJ6SUcxMWMzUWdZbVVnY0hKdmRtbGtaV1FnWVc0Z1FYSnlZWGxjSWlsOVpuVnVZM1JwYjI0Z1Z5Z3BlM1poY2lCME8ybG1LRndpZFc1a1pXWnBibVZrWENJaFBYUjVjR1Z2WmlCbmJHOWlZV3dwZEQxbmJHOWlZV3c3Wld4elpTQnBaaWhjSW5WdVpHVm1hVzVsWkZ3aUlUMTBlWEJsYjJZZ2MyVnNaaWwwUFhObGJHWTdaV3h6WlNCMGNubDdkRDFHZFc1amRHbHZiaWhjSW5KbGRIVnliaUIwYUdselhDSXBLQ2w5WTJGMFkyZ29aU2w3ZEdoeWIzY2dibVYzSUVWeWNtOXlLRndpY0c5c2VXWnBiR3dnWm1GcGJHVmtJR0psWTJGMWMyVWdaMnh2WW1Gc0lHOWlhbVZqZENCcGN5QjFibUYyWVdsc1lXSnNaU0JwYmlCMGFHbHpJR1Z1ZG1seWIyNXRaVzUwWENJcGZYWmhjaUJ1UFhRdVVISnZiV2x6WlRzb0lXNThmRndpVzI5aWFtVmpkQ0JRY205dGFYTmxYVndpSVQwOVQySnFaV04wTG5CeWIzUnZkSGx3WlM1MGIxTjBjbWx1Wnk1allXeHNLRzR1Y21WemIyeDJaU2dwS1h4OGJpNWpZWE4wS1NZbUtIUXVVSEp2YldselpUMXdkQ2w5ZG1GeUlIbzdlajFCY25KaGVTNXBjMEZ5Y21GNVAwRnljbUY1TG1selFYSnlZWGs2Wm5WdVkzUnBiMjRvZENsN2NtVjBkWEp1WENKYmIySnFaV04wSUVGeWNtRjVYVndpUFQwOVQySnFaV04wTG5CeWIzUnZkSGx3WlM1MGIxTjBjbWx1Wnk1allXeHNLSFFwZlR0MllYSWdRaXhITEVnc1NUMTZMRW85TUN4UlBXWjFibU4wYVc5dUtIUXNaU2w3ZEhSYlNsMDlkQ3gwZEZ0S0t6RmRQV1VzU2lzOU1pd3lQVDA5U2lZbUtFYy9SeWhoS1RwSUtDa3BmU3hTUFZ3aWRXNWtaV1pwYm1Wa1hDSWhQWFI1Y0dWdlppQjNhVzVrYjNjL2QybHVaRzkzT25admFXUWdNQ3hXUFZKOGZIdDlMRmc5Vmk1TmRYUmhkR2x2Yms5aWMyVnlkbVZ5Zkh4V0xsZGxZa3RwZEUxMWRHRjBhVzl1VDJKelpYSjJaWElzV2oxY0luVnVaR1ZtYVc1bFpGd2lQVDEwZVhCbGIyWWdjMlZzWmlZbVhDSjFibVJsWm1sdVpXUmNJaUU5ZEhsd1pXOW1JSEJ5YjJObGMzTW1KbHdpVzI5aWFtVmpkQ0J3Y205alpYTnpYVndpUFQwOWUzMHVkRzlUZEhKcGJtY3VZMkZzYkNod2NtOWpaWE56S1N3a1BWd2lkVzVrWldacGJtVmtYQ0loUFhSNWNHVnZaaUJWYVc1ME9FTnNZVzF3WldSQmNuSmhlU1ltWENKMWJtUmxabWx1WldSY0lpRTlkSGx3Wlc5bUlHbHRjRzl5ZEZOamNtbHdkSE1tSmx3aWRXNWtaV1pwYm1Wa1hDSWhQWFI1Y0dWdlppQk5aWE56WVdkbFEyaGhibTVsYkN4MGREMXVaWGNnUVhKeVlYa29NV1V6S1R0SVBWby9ieWdwT2xnL2N5Z3BPaVEvZFNncE9uWnZhV1FnTUQwOVBWSW1KbHdpWm5WdVkzUnBiMjVjSWowOWRIbHdaVzltSUhKbGNYVnBjbVUvWmlncE9tTW9LVHQyWVhJZ1pYUTliQ3h1ZEQxb0xISjBQVTFoZEdndWNtRnVaRzl0S0NrdWRHOVRkSEpwYm1jb016WXBMbk4xWW5OMGNtbHVaeWd4Tmlrc2IzUTlkbTlwWkNBd0xHbDBQVEVzYzNROU1peDFkRDF1WlhjZ1RTeGpkRDF1WlhjZ1RTeGhkRDB3TEdaMFBWa3NiSFE5Y1N4b2REMUdMSEIwUFV3N1RDNWhiR3c5Wm5Rc1RDNXlZV05sUFd4MExFd3VjbVZ6YjJ4MlpUMXVkQ3hNTG5KbGFtVmpkRDFvZEN4TUxsOXpaWFJUWTJobFpIVnNaWEk5Yml4TUxsOXpaWFJCYzJGd1BYSXNUQzVmWVhOaGNEMVJMRXd1Y0hKdmRHOTBlWEJsUFh0amIyNXpkSEoxWTNSdmNqcE1MSFJvWlc0NlpYUXNYQ0pqWVhSamFGd2lPbVoxYm1OMGFXOXVLSFFwZTNKbGRIVnliaUIwYUdsekxuUm9aVzRvYm5Wc2JDeDBLWDE5TzNaaGNpQmZkRDFPTzA0dWNISnZkRzkwZVhCbExsOWxiblZ0WlhKaGRHVTlablZ1WTNScGIyNG9LWHRtYjNJb2RtRnlJSFE5ZEdocGN5NXNaVzVuZEdnc1pUMTBhR2x6TGw5cGJuQjFkQ3h1UFRBN2RHaHBjeTVmYzNSaGRHVTlQVDF2ZENZbWRENXVPMjRyS3lsMGFHbHpMbDlsWVdOb1JXNTBjbmtvWlZ0dVhTeHVLWDBzVGk1d2NtOTBiM1I1Y0dVdVgyVmhZMmhGYm5SeWVUMW1kVzVqZEdsdmJpaDBMR1VwZTNaaGNpQnVQWFJvYVhNdVgybHVjM1JoYm1ObFEyOXVjM1J5ZFdOMGIzSXNjajF1TG5KbGMyOXNkbVU3YVdZb2NqMDlQVzUwS1h0MllYSWdiejEyS0hRcE8ybG1LRzg5UFQxbGRDWW1kQzVmYzNSaGRHVWhQVDF2ZENsMGFHbHpMbDl6WlhSMGJHVmtRWFFvZEM1ZmMzUmhkR1VzWlN4MExsOXlaWE4xYkhRcE8yVnNjMlVnYVdZb1hDSm1kVzVqZEdsdmJsd2lJVDEwZVhCbGIyWWdieWwwYUdsekxsOXlaVzFoYVc1cGJtY3RMU3gwYUdsekxsOXlaWE4xYkhSYlpWMDlkRHRsYkhObElHbG1LRzQ5UFQxd2RDbDdkbUZ5SUdrOWJtVjNJRzRvY0NrN2R5aHBMSFFzYnlrc2RHaHBjeTVmZDJsc2JGTmxkSFJzWlVGMEtHa3NaU2w5Wld4elpTQjBhR2x6TGw5M2FXeHNVMlYwZEd4bFFYUW9ibVYzSUc0b1puVnVZM1JwYjI0b1pTbDdaU2gwS1gwcExHVXBmV1ZzYzJVZ2RHaHBjeTVmZDJsc2JGTmxkSFJzWlVGMEtISW9kQ2tzWlNsOUxFNHVjSEp2ZEc5MGVYQmxMbDl6WlhSMGJHVmtRWFE5Wm5WdVkzUnBiMjRvZEN4bExHNHBlM1poY2lCeVBYUm9hWE11Y0hKdmJXbHpaVHR5TGw5emRHRjBaVDA5UFc5MEppWW9kR2hwY3k1ZmNtVnRZV2x1YVc1bkxTMHNkRDA5UFhOMFAyb29jaXh1S1RwMGFHbHpMbDl5WlhOMWJIUmJaVjA5Ymlrc01EMDlQWFJvYVhNdVgzSmxiV0ZwYm1sdVp5WW1VeWh5TEhSb2FYTXVYM0psYzNWc2RDbDlMRTR1Y0hKdmRHOTBlWEJsTGw5M2FXeHNVMlYwZEd4bFFYUTlablZ1WTNScGIyNG9kQ3hsS1h0MllYSWdiajEwYUdsek8wVW9kQ3gyYjJsa0lEQXNablZ1WTNScGIyNG9kQ2w3Ymk1ZmMyVjBkR3hsWkVGMEtHbDBMR1VzZENsOUxHWjFibU4wYVc5dUtIUXBlMjR1WDNObGRIUnNaV1JCZENoemRDeGxMSFFwZlNsOU8zWmhjaUJrZEQxWExIWjBQWHRRY205dGFYTmxPbkIwTEhCdmJIbG1hV3hzT21SMGZUdGNJbVoxYm1OMGFXOXVYQ0k5UFhSNWNHVnZaaUJrWldacGJtVW1KbVJsWm1sdVpTNWhiV1EvWkdWbWFXNWxLR1oxYm1OMGFXOXVLQ2w3Y21WMGRYSnVJSFowZlNrNlhDSjFibVJsWm1sdVpXUmNJaUU5ZEhsd1pXOW1JRzF2WkhWc1pTWW1iVzlrZFd4bExtVjRjRzl5ZEhNL2JXOWtkV3hsTG1WNGNHOXlkSE05ZG5RNlhDSjFibVJsWm1sdVpXUmNJaUU5ZEhsd1pXOW1JSFJvYVhNbUppaDBhR2x6TGtWVE5sQnliMjFwYzJVOWRuUXBMR1IwS0NsOUtTNWpZV3hzS0hSb2FYTXBPeUpkZlE9PSIsImltcG9ydCAnLi4vbGliL2VzNi1wcm9taXNlLm1pbi5qcydcclxuaW1wb3J0IFRlbXBsYXRlcyBmcm9tIFwiLi4vVGVtcGxhdGVzXCJcclxuaW1wb3J0IExvZ2luQ2hlY2sgZnJvbSBcIi4uL0xvZ2luQ2hlY2tcIlxyXG5pbXBvcnQgeyBnZXRKU09OLCByb3VuZCB9IGZyb20gXCIuLi9oZWxwZXJzXCJcclxuaW1wb3J0IEFQSSwgeyBUQkEsIGdldFRlYW1zLCBnZXRUZWFtU3RhdHMgfSBmcm9tIFwiLi4vQVBJXCJcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBldmVudChrZXkpIHtcclxuICBQcm9taXNlLmFsbChbXHJcbiAgICBMb2dpbkNoZWNrLmdldCgpLFxyXG4gICAgVGVtcGxhdGVzLmdldChcImV2ZW50XCIpLFxyXG4gICAgZ2V0SlNPTihcInN0YXRzLWNvbmZpZy5qc29uXCIpLFxyXG4gICAgVEJBLmdldChcImV2ZW50L1wiK2tleSksXHJcbiAgXSkudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgIGNvbnN0IFssIHRlbXBsYXRlLCBzdGF0cywgZXZlbnRdID0gcmVzO1xyXG4gICAgY29uc3QgJGNvbnRhaW5lciA9ICQoXCIjbWFpblwiKS5jbG9zZXN0KFwiLmNvbnRhaW5lclwiKTtcclxuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzID0gJGNvbnRhaW5lci5hdHRyKFwiY2xhc3NcIik7XHJcbiAgICBjb25zdCByYWN0aXZlID0gbmV3IFJhY3RpdmUoe1xyXG4gICAgICB0ZW1wbGF0ZTogdGVtcGxhdGUsXHJcbiAgICAgIGRhdGE6IHtcclxuICAgICAgICBrZXk6IGtleSxcclxuICAgICAgICBzdGF0Q29uZmlnOiBzdGF0cyxcclxuICAgICAgICBsb2FkaW5nOiB0cnVlLFxyXG4gICAgICAgIHRlYW1zOiBbXSxcclxuICAgICAgICByb3VuZDogcm91bmQsXHJcbiAgICAgICAgZXZlbnQ6IGV2ZW50LFxyXG4gICAgICAgIHN0YXRDb2xvcih2YWx1ZSwgc3RhdCkge1xyXG4gICAgICAgICAgY29uc3QgdmFsdWUgPSBwYXJzZUZsb2F0KHZhbHVlKTtcclxuICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBzdGF0LnByb2dyZXNzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICgoIXN0YXQucHJvZ3Jlc3NbaV0ubWluIHx8IHZhbHVlID49IHN0YXQucHJvZ3Jlc3NbaV0ubWluKSAmJiAoIXN0YXQucHJvZ3Jlc3NbaV0ubWF4IHx8IHZhbHVlIDw9IHN0YXQucHJvZ3Jlc3NbaV0ubWF4KSkge1xyXG4gICAgICAgICAgICAgIHJldHVybiBzdGF0LnByb2dyZXNzW2ldLmNsYXNzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBtb2JpbGU6ICQod2luZG93KS53aWR0aCgpIDwgOTAwLFxyXG4gICAgICAgIHRva2VuOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9rZW4nKSxcclxuICAgICAgICB1c2VyOiB7XHJcbiAgICAgICAgICBuYW1lOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlci5uYW1lJykgfHwgJycsXHJcbiAgICAgICAgICB0ZWFtOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlci50ZWFtJykgfHwgJydcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIGNvbXB1dGVkOiB7XHJcbiAgICAgICAgbW9iaWxlOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHJldHVybiAkKHdpbmRvdykud2lkdGgoKSA8IDkwMDtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICAgIG9ucmVuZGVyOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAkY29udGFpbmVyLmFkZENsYXNzKFwid2lkZVwiKTtcclxuICAgICAgfSxcclxuICAgICAgb251bnJlbmRlcjogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJGNvbnRhaW5lci5hdHRyKFwiY2xhc3NcIiwgY29udGFpbmVyQ2xhc3MpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBnZXRUZWFtcyhBUEksIGtleSkudGhlbihmdW5jdGlvbih0ZWFtcykge1xyXG4gICAgICByYWN0aXZlLnNldCh7XHJcbiAgICAgICAgdGVhbXM6IHRlYW1zLnNvcnQoZnVuY3Rpb24oYSwgYikge1xyXG4gICAgICAgICAgcmV0dXJuIGEudGVhbV9udW1iZXIgLSBiLnRlYW1fbnVtYmVyXHJcbiAgICAgICAgfSksXHJcbiAgICAgICAgbG9hZGluZzogZmFsc2VcclxuICAgICAgfSk7XHJcbiAgICAgIFNvcnRhYmxlLmluaXQoKTtcclxuICAgIH0pO1xyXG4gIH0pO1xyXG59XHJcbiIsImltcG9ydCAnLi4vbGliL2VzNi1wcm9taXNlLm1pbi5qcydcclxuaW1wb3J0IFRlbXBsYXRlcyBmcm9tIFwiLi4vVGVtcGxhdGVzXCJcclxuaW1wb3J0IExvZ2luQ2hlY2sgZnJvbSBcIi4uL0xvZ2luQ2hlY2tcIlxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGV2ZW50cyhrZXkpIHtcclxuICBQcm9taXNlLmFsbChbXHJcbiAgICBMb2dpbkNoZWNrLmdldCgpLFxyXG4gICAgVGVtcGxhdGVzLmdldChcImV2ZW50c1wiKSxcclxuICBdKS50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgY29uc3QgWywgdGVtcGxhdGVdID0gcmVzO1xyXG4gICAgY29uc3QgcmFjdGl2ZSA9IG5ldyBSYWN0aXZlKHtcclxuICAgICAgdGVtcGxhdGU6IHRlbXBsYXRlLFxyXG4gICAgICBkYXRhOiB7XHJcbiAgICAgICAgZXZlbnRzOiB7XHJcbiAgICAgICAgICBcIjIwMTZhcmNcIjogXCJBcmNoaW1lZGVzXCIsXHJcbiAgICAgICAgICBcIjIwMTZjYXJzXCI6IFwiQ2Fyc29uXCIsXHJcbiAgICAgICAgICBcIjIwMTZjYXJ2XCI6IFwiQ2FydmVyXCIsXHJcbiAgICAgICAgICBcIjIwMTZjdXJcIjogXCJDdXJpZVwiLFxyXG4gICAgICAgICAgXCIyMDE2Z2FsXCI6IFwiR2FsaWxlb1wiLFxyXG4gICAgICAgICAgXCIyMDE2aG9wXCI6IFwiSG9wcGVyXCIsXHJcbiAgICAgICAgICBcIjIwMTZuZXdcIjogXCJOZXd0b25cIixcclxuICAgICAgICAgIFwiMjAxNnRlc1wiOiBcIlRlc2xhXCIsXHJcbiAgICAgICAgICBcIjIwMTZjbXBcIjogXCJFaW5zdGVpblwiLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgbW9iaWxlOiAkKHdpbmRvdykud2lkdGgoKSA8IDkwMCxcclxuICAgICAgICB0b2tlbjogbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuJyksXHJcbiAgICAgICAgdXNlcjoge1xyXG4gICAgICAgICAgbmFtZTogbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VzZXIubmFtZScpIHx8ICcnLFxyXG4gICAgICAgICAgdGVhbTogbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VzZXIudGVhbScpIHx8ICcnXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBjb21wdXRlZDoge1xyXG4gICAgICAgIG1vYmlsZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICByZXR1cm4gJCh3aW5kb3cpLndpZHRoKCkgPCA5MDA7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgfSk7XHJcbiAgfSk7XHJcbn1cclxuIiwiaW1wb3J0ICcuLi9saWIvZXM2LXByb21pc2UubWluLmpzJ1xyXG5pbXBvcnQgVGVtcGxhdGVzIGZyb20gXCIuLi9UZW1wbGF0ZXNcIlxyXG5pbXBvcnQgTG9naW5DaGVjayBmcm9tIFwiLi4vTG9naW5DaGVja1wiXHJcbmltcG9ydCB7XHJcbiAgZ2V0SlNPTixcclxuICByb3VuZFxyXG59IGZyb20gXCIuLi9oZWxwZXJzXCJcclxuaW1wb3J0IEFQSSwge1xyXG4gIGdldFRlYW1TdGF0cyxcclxuICBnZW5lcmF0ZVRva2VuXHJcbn0gZnJvbSBcIi4uL0FQSVwiXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gbG9naW4oKSB7XHJcbiAgUHJvbWlzZS5hbGwoW1xyXG4gICAgVGVtcGxhdGVzLmdldChcImxvZ2luXCIpXHJcbiAgXSkudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgIGNvbnN0IFt0ZW1wbGF0ZV0gPSByZXM7XHJcbiAgICBpZiAobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuJykpIHtcclxuICAgICAgbG9jYXRpb24uaGFzaCA9IFwiIy9hL2V2ZW50c1wiXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCByYWN0aXZlID0gbmV3IFJhY3RpdmUoe1xyXG4gICAgICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZSxcclxuICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICBtb2JpbGU6ICQod2luZG93KS53aWR0aCgpIDwgOTAwLFxyXG4gICAgICAgICAgdG9rZW46IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpLFxyXG4gICAgICAgICAgdXNlcjoge1xyXG4gICAgICAgICAgICBuYW1lOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlci5uYW1lJykgfHwgJycsXHJcbiAgICAgICAgICAgIHRlYW06IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1c2VyLnRlYW0nKSB8fCAnJ1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0pO1xyXG4gICAgICByYWN0aXZlLm9uKCdsb2dpbicsIGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgICAgICB2YXIgbmFtZSA9IHRoaXMuZ2V0KFwidXNlci5uYW1lXCIpO1xyXG4gICAgICAgIHZhciB0ZWFtID0gdGhpcy5nZXQoXCJ1c2VyLnRlYW1cIik7XHJcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ1c2VyLm5hbWVcIiwgbmFtZSk7XHJcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ1c2VyLnRlYW1cIiwgdGVhbSk7XHJcbiAgICAgICAgdmFyIHRva2VuID0gZ2VuZXJhdGVUb2tlbih0ZWFtLCBuYW1lKTtcclxuICAgICAgICBsb2NhdGlvbi5oYXNoID0gXCIjL2EvZXZlbnRzXCI7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH0pLmNhdGNoKGNvbnNvbGUuZXJyb3IuYmluZChjb25zb2xlKSk7XHJcbn1cclxuIiwiaW1wb3J0ICcuLi9saWIvZXM2LXByb21pc2UubWluLmpzJ1xyXG5pbXBvcnQgVGVtcGxhdGVzIGZyb20gXCIuLi9UZW1wbGF0ZXNcIlxyXG5pbXBvcnQgTG9naW5DaGVjayBmcm9tIFwiLi4vVGVtcGxhdGVzXCJcclxuaW1wb3J0IHsgZ2V0SlNPTiwgcm91bmQgfSBmcm9tIFwiLi4vaGVscGVyc1wiXHJcbmltcG9ydCBBUEksIHsgZ2V0VGVhbVN0YXRzIH0gZnJvbSBcIi4uL0FQSVwiXHJcblxyXG5leHBvcnQgZnVuY3Rpb24gdGVhbShrZXkpIHtcclxuICBQcm9taXNlLmFsbChbXHJcbiAgICBMb2dpbkNoZWNrLmdldCgpLFxyXG4gICAgVGVtcGxhdGVzLmdldChcInRlYW1cIiksXHJcbiAgICBnZXRKU09OKFwic3RhdHMtY29uZmlnLmpzb25cIiksXHJcbiAgICBnZXRUZWFtU3RhdHMoQVBJLCBrZXkpLFxyXG4gIF0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICBjb25zdCBbLCB0ZW1wbGF0ZSwgc3RhdHMsIHRlYW1EYXRhXSA9IHJlcztcclxuICAgIGNvbnN0IHJhY3RpdmUgPSBuZXcgUmFjdGl2ZSh7XHJcbiAgICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZSxcclxuICAgICAgZGF0YToge1xyXG4gICAgICAgIHN0YXRzOiBzdGF0cyxcclxuICAgICAgICBzdGF0S2V5czogWydjYWxjcycsICdnb2FscycsICdkZWZlbnNlcyddLFxyXG4gICAgICAgIGtleToga2V5LFxyXG4gICAgICAgIHRlYW06IHRlYW1EYXRhLFxyXG4gICAgICAgIHJvdW5kOiByb3VuZCxcclxuICAgICAgICBtb2JpbGU6ICQod2luZG93KS53aWR0aCgpIDwgOTAwLFxyXG4gICAgICAgIHRva2VuOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9rZW4nKSxcclxuICAgICAgICB1c2VyOiB7XHJcbiAgICAgICAgICBuYW1lOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlci5uYW1lJykgfHwgJycsXHJcbiAgICAgICAgICB0ZWFtOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlci50ZWFtJykgfHwgJydcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuICB9KS5jYXRjaChjb25zb2xlLmVycm9yLmJpbmQoY29uc29sZSkpO1xyXG59XHJcbiJdfQ==
