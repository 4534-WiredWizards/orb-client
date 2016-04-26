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
    if (localStorage.getItem("token")) {
      router.setRoute("/event/2016arc");
    } else {
      router.setRoute("/login");
    }
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
exports.generateToken = generateToken;
Object.defineProperty(exports, "__esModule", {
  value: true
});

require("./lib/es6-promise.min.js");

var cacheable = _interopRequire(require("./cacheable"));

var extend = require("./helpers").extend;

exports["default"] = cacheable(function (key) {
  var key = key.replace(/^\//, "").replace(/\/$/, "");
  var url = "http://c5032021.ngrok.io/" + key + "/";
  //url = "api.php?url="+encodeURIComponent(url);
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

function generateToken(team, name) {
  var token = team + "." + md5(name);
  localStorage.setItem("token", token);
  return token;
}

},{"./cacheable":7,"./helpers":8,"./lib/es6-promise.min.js":9}],4:[function(require,module,exports){
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

},{"./Templates":6,"./lib/es6-promise.min.js":9}],5:[function(require,module,exports){
"use strict";

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };

var _defaults = function (obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; };

Object.defineProperty(exports, "__esModule", {
  value: true
});

_defaults(exports, _interopRequireWildcard(require("./pages/team")));

_defaults(exports, _interopRequireWildcard(require("./pages/event")));

_defaults(exports, _interopRequireWildcard(require("./pages/login")));

},{"./pages/event":10,"./pages/login":11,"./pages/team":12}],6:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkM6L1VzZXJzL1NhbXVlbC9Eb2N1bWVudHMvb3JiLWNsaWVudC9zcmMvbGliL2VzNi1wcm9taXNlLm1pbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLENBQUMsWUFBVTtBQUFDLGNBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUM7QUFBQyxXQUFNLFVBQVUsSUFBRSxPQUFPLENBQUMsSUFBRSxRQUFRLElBQUUsT0FBTyxDQUFDLElBQUUsSUFBSSxLQUFHLENBQUMsQ0FBQTtHQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBQztBQUFDLFdBQU0sVUFBVSxJQUFFLE9BQU8sQ0FBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDO0FBQUMsS0FBQyxHQUFDLENBQUMsQ0FBQTtHQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBQztBQUFDLEtBQUMsR0FBQyxDQUFDLENBQUE7R0FBQyxTQUFTLENBQUMsR0FBRTtBQUFDLFdBQU8sWUFBVTtBQUFDLGFBQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLEdBQUU7QUFBQyxXQUFPLFlBQVU7QUFBQyxPQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLEdBQUU7QUFBQyxRQUFJLENBQUMsR0FBQyxDQUFDO1FBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUFDLENBQUMsR0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLFlBQVU7QUFBQyxPQUFDLENBQUMsSUFBSSxHQUFDLENBQUMsR0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUE7S0FBQyxDQUFBLENBQUE7R0FBQyxTQUFTLENBQUMsR0FBRTtBQUFDLFFBQUksQ0FBQyxHQUFDLElBQUksY0FBYyxFQUFBLENBQUMsUUFBTyxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBQyxDQUFDLEVBQUMsWUFBVTtBQUFDLE9BQUMsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsQ0FBQSxDQUFBO0dBQUMsU0FBUyxDQUFDLEdBQUU7QUFBQyxXQUFPLFlBQVU7QUFBQyxnQkFBVSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLENBQUE7R0FBQyxTQUFTLENBQUMsR0FBRTtBQUFDLFNBQUksSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxJQUFFLENBQUMsRUFBQztBQUFDLFVBQUksQ0FBQyxHQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7VUFBQyxDQUFDLEdBQUMsRUFBRSxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFDLEtBQUssQ0FBQyxFQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEdBQUMsS0FBSyxDQUFDLENBQUE7S0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLEdBQUU7QUFBQyxRQUFHO0FBQUMsVUFBSSxDQUFDLEdBQUMsT0FBTztVQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBTyxDQUFDLEdBQUMsQ0FBQyxDQUFDLFNBQVMsSUFBRSxDQUFDLENBQUMsWUFBWSxFQUFDLENBQUMsRUFBRSxDQUFBLENBQUE7S0FBQyxDQUFBLE9BQU0sQ0FBQyxFQUFDO0FBQUMsYUFBTyxDQUFDLEVBQUUsQ0FBQTtLQUFDO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLFFBQUksQ0FBQyxHQUFDLElBQUk7UUFBQyxDQUFDLEdBQUMsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFHLENBQUMsRUFBQztBQUFDLFVBQUksQ0FBQyxHQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVU7QUFBQyxTQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFBO09BQUMsQ0FBQyxDQUFBO0tBQUMsTUFBSyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUE7R0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBRyxDQUFDLElBQUUsUUFBUSxJQUFFLE9BQU8sQ0FBQyxJQUFFLENBQUMsQ0FBQyxXQUFXLEtBQUcsQ0FBQztBQUFDLGFBQU8sQ0FBQyxDQUFDO0tBQUEsSUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBTyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQSxDQUFBO0dBQUMsU0FBUyxDQUFDLEdBQUUsRUFBRSxTQUFTLENBQUMsR0FBRTtBQUFDLFdBQU8sSUFBSSxTQUFTLENBQUMsMENBQTBDLENBQUMsQ0FBQTtHQUFDLFNBQVMsQ0FBQyxHQUFFO0FBQUMsV0FBTyxJQUFJLFNBQVMsQ0FBQyxzREFBc0QsQ0FBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBRztBQUFDLGFBQU8sQ0FBQyxDQUFDLElBQUksQ0FBQTtLQUFDLENBQUEsT0FBTSxDQUFDLEVBQUM7QUFBQyxjQUFPLEVBQUUsQ0FBQyxLQUFLLEdBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQSxDQUFBO0tBQUM7R0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxRQUFHO0FBQUMsT0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsQ0FBQSxPQUFNLENBQUMsRUFBQztBQUFDLGFBQU8sQ0FBQyxDQUFBO0tBQUM7R0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLEtBQUMsQ0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFVBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQztVQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxVQUFTLENBQUMsRUFBQztBQUFDLFNBQUMsS0FBRyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxLQUFHLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUEsQUFBQyxDQUFBO09BQUMsRUFBQyxVQUFTLENBQUMsRUFBQztBQUFDLFNBQUMsS0FBRyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQSxBQUFDLENBQUE7T0FBQyxFQUFDLFVBQVUsSUFBRSxDQUFDLENBQUMsTUFBTSxJQUFFLGtCQUFrQixDQUFBLEFBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFFLENBQUMsS0FBRyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQSxBQUFDLENBQUE7S0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLEtBQUMsQ0FBQyxNQUFNLEtBQUcsRUFBRSxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUcsRUFBRSxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsS0FBSyxDQUFDLEVBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxPQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsRUFBQyxVQUFTLENBQUMsRUFBQztBQUFDLE9BQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxDQUFDLENBQUE7R0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLEtBQUMsQ0FBQyxXQUFXLEtBQUcsQ0FBQyxDQUFDLFdBQVcsSUFBRSxDQUFDLEtBQUcsRUFBRSxJQUFFLFdBQVcsQ0FBQyxPQUFPLEtBQUcsRUFBRSxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxLQUFHLEVBQUUsR0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBQyxLQUFLLENBQUMsS0FBRyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxLQUFDLEtBQUcsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBQztBQUFDLEtBQUMsQ0FBQyxRQUFRLElBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLEtBQUMsQ0FBQyxNQUFNLEtBQUcsRUFBRSxLQUFHLENBQUMsQ0FBQyxPQUFPLEdBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUMsRUFBRSxFQUFDLENBQUMsS0FBRyxDQUFDLENBQUMsWUFBWSxDQUFDLE1BQU0sSUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFBLEFBQUMsQ0FBQTtHQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxLQUFDLENBQUMsTUFBTSxLQUFHLEVBQUUsS0FBRyxDQUFDLENBQUMsTUFBTSxHQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsT0FBTyxHQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFBLEFBQUMsQ0FBQTtHQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLFFBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQyxZQUFZO1FBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsR0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEtBQUcsQ0FBQyxJQUFFLENBQUMsQ0FBQyxNQUFNLElBQUUsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBQztBQUFDLFFBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQyxZQUFZO1FBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBRyxDQUFDLEtBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBQztBQUFDLFdBQUksSUFBSSxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsT0FBTyxFQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUMsQ0FBQyxJQUFFLENBQUMsRUFBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQTtLQUFDO0dBQUMsU0FBUyxDQUFDLEdBQUU7QUFBQyxRQUFJLENBQUMsS0FBSyxHQUFDLElBQUksQ0FBQTtHQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxRQUFHO0FBQUMsYUFBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxDQUFBLE9BQU0sQ0FBQyxFQUFDO0FBQUMsY0FBTyxFQUFFLENBQUMsS0FBSyxHQUFDLENBQUMsRUFBQyxFQUFFLENBQUEsQ0FBQTtLQUFDO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDO1FBQUMsQ0FBQztRQUFDLENBQUM7UUFBQyxDQUFDO1FBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLENBQUMsRUFBQztBQUFDLFdBQUcsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxLQUFHLEVBQUUsSUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQSxHQUFFLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEtBQUcsQ0FBQyxDQUFBO0FBQUMsZUFBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtPQUFBO0tBQUMsTUFBSyxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFHLEVBQUUsS0FBRyxDQUFDLElBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxLQUFHLEVBQUUsR0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsS0FBRyxFQUFFLElBQUUsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQSxBQUFDLENBQUE7R0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBRztBQUFDLE9BQUMsQ0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFNBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUE7T0FBQyxFQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsU0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtPQUFDLENBQUMsQ0FBQTtLQUFDLENBQUEsT0FBTSxDQUFDLEVBQUM7QUFBQyxPQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUM7R0FBQyxTQUFTLENBQUMsR0FBRTtBQUFDLFdBQU8sRUFBRSxFQUFFLENBQUE7R0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUM7QUFBQyxLQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsRUFBRSxFQUFFLEVBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBQyxLQUFLLENBQUMsRUFBQyxDQUFDLENBQUMsT0FBTyxHQUFDLEtBQUssQ0FBQyxFQUFDLENBQUMsQ0FBQyxZQUFZLEdBQUMsRUFBRSxDQUFBO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDO0FBQUMsV0FBTyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFBO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLFVBQVMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLFdBQUksSUFBSSxDQUFDLEdBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBQyxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsR0FBQyxVQUFTLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxPQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsaUNBQWlDLENBQUMsQ0FBQyxDQUFBO0tBQUMsQ0FBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsSUFBSTtRQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFBLENBQUE7R0FBQyxTQUFTLENBQUMsR0FBRTtBQUFDLFVBQU0sSUFBSSxTQUFTLENBQUMsb0ZBQW9GLENBQUMsQ0FBQTtHQUFDLFNBQVMsQ0FBQyxHQUFFO0FBQUMsVUFBTSxJQUFJLFNBQVMsQ0FBQyx1SEFBdUgsQ0FBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsRUFBRSxFQUFDLElBQUksQ0FBQyxPQUFPLEdBQUMsSUFBSSxDQUFDLE1BQU0sR0FBQyxLQUFLLENBQUMsRUFBQyxJQUFJLENBQUMsWUFBWSxHQUFDLEVBQUUsRUFBQyxDQUFDLEtBQUcsQ0FBQyxLQUFHLFVBQVUsSUFBRSxPQUFPLENBQUMsSUFBRSxDQUFDLEVBQUUsRUFBQyxJQUFJLFlBQVksQ0FBQyxHQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUEsQUFBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLFFBQUksQ0FBQyxvQkFBb0IsR0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLE9BQU8sR0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxJQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBRSxJQUFJLENBQUMsTUFBTSxHQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUMsSUFBSSxDQUFDLFVBQVUsR0FBQyxDQUFDLENBQUMsTUFBTSxFQUFDLElBQUksQ0FBQyxPQUFPLEdBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFDLENBQUMsS0FBRyxJQUFJLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBRSxJQUFJLENBQUMsTUFBTSxHQUFDLElBQUksQ0FBQyxNQUFNLElBQUUsQ0FBQyxFQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBQyxDQUFDLEtBQUcsSUFBSSxDQUFDLFVBQVUsSUFBRSxDQUFDLENBQUMs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LENBQUM7TUFBQyxFQUFFLEdBQUMsS0FBSyxDQUFDO01BQUMsRUFBRSxHQUFDLENBQUM7TUFBQyxFQUFFLEdBQUMsQ0FBQztNQUFDLEVBQUUsR0FBQyxJQUFJLENBQUMsRUFBQTtNQUFDLEVBQUUsR0FBQyxJQUFJLENBQUMsRUFBQTtNQUFDLEVBQUUsR0FBQyxDQUFDO01BQUMsRUFBRSxHQUFDLENBQUM7TUFBQyxFQUFFLEdBQUMsQ0FBQztNQUFDLEVBQUUsR0FBQyxDQUFDO01BQUMsRUFBRSxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsSUFBSSxHQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsT0FBTyxHQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsTUFBTSxHQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsYUFBYSxHQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsUUFBUSxHQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsS0FBSyxHQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsU0FBUyxHQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxJQUFJLEVBQUMsRUFBRSxFQUFDLE9BQU8sRUFBQyxnQkFBUyxDQUFDLEVBQUM7QUFBQyxhQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsRUFBQyxDQUFDLElBQUksRUFBRSxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBQyxZQUFVO0FBQUMsU0FBSSxJQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsTUFBTSxFQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsTUFBTSxFQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLE1BQU0sS0FBRyxFQUFFLElBQUUsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLEVBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUMsVUFBUyxDQUFDLEVBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLG9CQUFvQjtRQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUcsQ0FBQyxLQUFHLEVBQUUsRUFBQztBQUFDLFVBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLENBQUMsS0FBRyxFQUFFLElBQUUsQ0FBQyxDQUFDLE1BQU0sS0FBRyxFQUFFLEVBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxJQUFHLFVBQVUsSUFBRSxPQUFPLENBQUMsRUFBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsS0FBSyxJQUFHLENBQUMsS0FBRyxFQUFFLEVBQUM7QUFBQyxZQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtPQUFDLE1BQUssSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFNBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtPQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLE1BQUssSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUE7R0FBQyxFQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFDLFVBQVMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUcsRUFBRSxLQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBQyxDQUFDLEtBQUcsRUFBRSxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUEsQUFBQyxFQUFDLENBQUMsS0FBRyxJQUFJLENBQUMsVUFBVSxJQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0dBQUMsRUFBQyxDQUFDLENBQUMsU0FBUyxDQUFDLGFBQWEsR0FBQyxVQUFTLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxLQUFLLENBQUMsRUFBQyxVQUFTLENBQUMsRUFBQztBQUFDLE9BQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLEVBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxPQUFDLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLElBQUksRUFBRSxHQUFDLENBQUM7TUFBQyxFQUFFLEdBQUMsRUFBQyxPQUFPLEVBQUMsRUFBRSxFQUFDLFFBQVEsRUFBQyxFQUFFLEVBQUMsQ0FBQyxVQUFVLElBQUUsT0FBTyxNQUFNLElBQUUsTUFBTSxDQUFDLEdBQUcsR0FBQyxNQUFNLENBQUMsWUFBVTtBQUFDLFdBQU8sRUFBRSxDQUFBO0dBQUMsQ0FBQyxHQUFDLFdBQVcsSUFBRSxPQUFPLE1BQU0sSUFBRSxNQUFNLENBQUMsT0FBTyxHQUFDLE1BQU0sQ0FBQyxPQUFPLEdBQUMsRUFBRSxHQUFDLFdBQVcsSUFBRSxPQUFPLElBQUksS0FBRyxJQUFJLENBQUMsVUFBVSxHQUFDLEVBQUUsQ0FBQSxBQUFDLEVBQUMsRUFBRSxFQUFFLENBQUE7Q0FBQyxDQUFBLENBQUUsSUFBSSxXQUFNLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIi8qIVxyXG4gKiBAb3ZlcnZpZXcgZXM2LXByb21pc2UgLSBhIHRpbnkgaW1wbGVtZW50YXRpb24gb2YgUHJvbWlzZXMvQSsuXHJcbiAqIEBjb3B5cmlnaHQgQ29weXJpZ2h0IChjKSAyMDE0IFllaHVkYSBLYXR6LCBUb20gRGFsZSwgU3RlZmFuIFBlbm5lciBhbmQgY29udHJpYnV0b3JzIChDb252ZXJzaW9uIHRvIEVTNiBBUEkgYnkgSmFrZSBBcmNoaWJhbGQpXHJcbiAqIEBsaWNlbnNlICAgTGljZW5zZWQgdW5kZXIgTUlUIGxpY2Vuc2VcclxuICogICAgICAgICAgICBTZWUgaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2pha2VhcmNoaWJhbGQvZXM2LXByb21pc2UvbWFzdGVyL0xJQ0VOU0VcclxuICogQHZlcnNpb24gICAzLjIuMVxyXG4gKi9cclxuXHJcbihmdW5jdGlvbigpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHQodCl7cmV0dXJuXCJmdW5jdGlvblwiPT10eXBlb2YgdHx8XCJvYmplY3RcIj09dHlwZW9mIHQmJm51bGwhPT10fWZ1bmN0aW9uIGUodCl7cmV0dXJuXCJmdW5jdGlvblwiPT10eXBlb2YgdH1mdW5jdGlvbiBuKHQpe0c9dH1mdW5jdGlvbiByKHQpe1E9dH1mdW5jdGlvbiBvKCl7cmV0dXJuIGZ1bmN0aW9uKCl7cHJvY2Vzcy5uZXh0VGljayhhKX19ZnVuY3Rpb24gaSgpe3JldHVybiBmdW5jdGlvbigpe0IoYSl9fWZ1bmN0aW9uIHMoKXt2YXIgdD0wLGU9bmV3IFgoYSksbj1kb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIlwiKTtyZXR1cm4gZS5vYnNlcnZlKG4se2NoYXJhY3RlckRhdGE6ITB9KSxmdW5jdGlvbigpe24uZGF0YT10PSsrdCUyfX1mdW5jdGlvbiB1KCl7dmFyIHQ9bmV3IE1lc3NhZ2VDaGFubmVsO3JldHVybiB0LnBvcnQxLm9ubWVzc2FnZT1hLGZ1bmN0aW9uKCl7dC5wb3J0Mi5wb3N0TWVzc2FnZSgwKX19ZnVuY3Rpb24gYygpe3JldHVybiBmdW5jdGlvbigpe3NldFRpbWVvdXQoYSwxKX19ZnVuY3Rpb24gYSgpe2Zvcih2YXIgdD0wO0o+dDt0Kz0yKXt2YXIgZT10dFt0XSxuPXR0W3QrMV07ZShuKSx0dFt0XT12b2lkIDAsdHRbdCsxXT12b2lkIDB9Sj0wfWZ1bmN0aW9uIGYoKXt0cnl7dmFyIHQ9cmVxdWlyZSxlPXQoXCJ2ZXJ0eFwiKTtyZXR1cm4gQj1lLnJ1bk9uTG9vcHx8ZS5ydW5PbkNvbnRleHQsaSgpfWNhdGNoKG4pe3JldHVybiBjKCl9fWZ1bmN0aW9uIGwodCxlKXt2YXIgbj10aGlzLHI9bmV3IHRoaXMuY29uc3RydWN0b3IocCk7dm9pZCAwPT09cltydF0mJmsocik7dmFyIG89bi5fc3RhdGU7aWYobyl7dmFyIGk9YXJndW1lbnRzW28tMV07UShmdW5jdGlvbigpe3gobyxyLGksbi5fcmVzdWx0KX0pfWVsc2UgRShuLHIsdCxlKTtyZXR1cm4gcn1mdW5jdGlvbiBoKHQpe3ZhciBlPXRoaXM7aWYodCYmXCJvYmplY3RcIj09dHlwZW9mIHQmJnQuY29uc3RydWN0b3I9PT1lKXJldHVybiB0O3ZhciBuPW5ldyBlKHApO3JldHVybiBnKG4sdCksbn1mdW5jdGlvbiBwKCl7fWZ1bmN0aW9uIF8oKXtyZXR1cm4gbmV3IFR5cGVFcnJvcihcIllvdSBjYW5ub3QgcmVzb2x2ZSBhIHByb21pc2Ugd2l0aCBpdHNlbGZcIil9ZnVuY3Rpb24gZCgpe3JldHVybiBuZXcgVHlwZUVycm9yKFwiQSBwcm9taXNlcyBjYWxsYmFjayBjYW5ub3QgcmV0dXJuIHRoYXQgc2FtZSBwcm9taXNlLlwiKX1mdW5jdGlvbiB2KHQpe3RyeXtyZXR1cm4gdC50aGVufWNhdGNoKGUpe3JldHVybiB1dC5lcnJvcj1lLHV0fX1mdW5jdGlvbiB5KHQsZSxuLHIpe3RyeXt0LmNhbGwoZSxuLHIpfWNhdGNoKG8pe3JldHVybiBvfX1mdW5jdGlvbiBtKHQsZSxuKXtRKGZ1bmN0aW9uKHQpe3ZhciByPSExLG89eShuLGUsZnVuY3Rpb24obil7cnx8KHI9ITAsZSE9PW4/Zyh0LG4pOlModCxuKSl9LGZ1bmN0aW9uKGUpe3J8fChyPSEwLGoodCxlKSl9LFwiU2V0dGxlOiBcIisodC5fbGFiZWx8fFwiIHVua25vd24gcHJvbWlzZVwiKSk7IXImJm8mJihyPSEwLGoodCxvKSl9LHQpfWZ1bmN0aW9uIGIodCxlKXtlLl9zdGF0ZT09PWl0P1ModCxlLl9yZXN1bHQpOmUuX3N0YXRlPT09c3Q/aih0LGUuX3Jlc3VsdCk6RShlLHZvaWQgMCxmdW5jdGlvbihlKXtnKHQsZSl9LGZ1bmN0aW9uKGUpe2oodCxlKX0pfWZ1bmN0aW9uIHcodCxuLHIpe24uY29uc3RydWN0b3I9PT10LmNvbnN0cnVjdG9yJiZyPT09ZXQmJmNvbnN0cnVjdG9yLnJlc29sdmU9PT1udD9iKHQsbik6cj09PXV0P2oodCx1dC5lcnJvcik6dm9pZCAwPT09cj9TKHQsbik6ZShyKT9tKHQsbixyKTpTKHQsbil9ZnVuY3Rpb24gZyhlLG4pe2U9PT1uP2ooZSxfKCkpOnQobik/dyhlLG4sdihuKSk6UyhlLG4pfWZ1bmN0aW9uIEEodCl7dC5fb25lcnJvciYmdC5fb25lcnJvcih0Ll9yZXN1bHQpLFQodCl9ZnVuY3Rpb24gUyh0LGUpe3QuX3N0YXRlPT09b3QmJih0Ll9yZXN1bHQ9ZSx0Ll9zdGF0ZT1pdCwwIT09dC5fc3Vic2NyaWJlcnMubGVuZ3RoJiZRKFQsdCkpfWZ1bmN0aW9uIGoodCxlKXt0Ll9zdGF0ZT09PW90JiYodC5fc3RhdGU9c3QsdC5fcmVzdWx0PWUsUShBLHQpKX1mdW5jdGlvbiBFKHQsZSxuLHIpe3ZhciBvPXQuX3N1YnNjcmliZXJzLGk9by5sZW5ndGg7dC5fb25lcnJvcj1udWxsLG9baV09ZSxvW2kraXRdPW4sb1tpK3N0XT1yLDA9PT1pJiZ0Ll9zdGF0ZSYmUShULHQpfWZ1bmN0aW9uIFQodCl7dmFyIGU9dC5fc3Vic2NyaWJlcnMsbj10Ll9zdGF0ZTtpZigwIT09ZS5sZW5ndGgpe2Zvcih2YXIgcixvLGk9dC5fcmVzdWx0LHM9MDtzPGUubGVuZ3RoO3MrPTMpcj1lW3NdLG89ZVtzK25dLHI/eChuLHIsbyxpKTpvKGkpO3QuX3N1YnNjcmliZXJzLmxlbmd0aD0wfX1mdW5jdGlvbiBNKCl7dGhpcy5lcnJvcj1udWxsfWZ1bmN0aW9uIFAodCxlKXt0cnl7cmV0dXJuIHQoZSl9Y2F0Y2gobil7cmV0dXJuIGN0LmVycm9yPW4sY3R9fWZ1bmN0aW9uIHgodCxuLHIsbyl7dmFyIGkscyx1LGMsYT1lKHIpO2lmKGEpe2lmKGk9UChyLG8pLGk9PT1jdD8oYz0hMCxzPWkuZXJyb3IsaT1udWxsKTp1PSEwLG49PT1pKXJldHVybiB2b2lkIGoobixkKCkpfWVsc2UgaT1vLHU9ITA7bi5fc3RhdGUhPT1vdHx8KGEmJnU/ZyhuLGkpOmM/aihuLHMpOnQ9PT1pdD9TKG4saSk6dD09PXN0JiZqKG4saSkpfWZ1bmN0aW9uIEModCxlKXt0cnl7ZShmdW5jdGlvbihlKXtnKHQsZSl9LGZ1bmN0aW9uKGUpe2oodCxlKX0pfWNhdGNoKG4pe2oodCxuKX19ZnVuY3Rpb24gTygpe3JldHVybiBhdCsrfWZ1bmN0aW9uIGsodCl7dFtydF09YXQrKyx0Ll9zdGF0ZT12b2lkIDAsdC5fcmVzdWx0PXZvaWQgMCx0Ll9zdWJzY3JpYmVycz1bXX1mdW5jdGlvbiBZKHQpe3JldHVybiBuZXcgX3QodGhpcyx0KS5wcm9taXNlfWZ1bmN0aW9uIHEodCl7dmFyIGU9dGhpcztyZXR1cm4gbmV3IGUoSSh0KT9mdW5jdGlvbihuLHIpe2Zvcih2YXIgbz10Lmxlbmd0aCxpPTA7bz5pO2krKyllLnJlc29sdmUodFtpXSkudGhlbihuLHIpfTpmdW5jdGlvbih0LGUpe2UobmV3IFR5cGVFcnJvcihcIllvdSBtdXN0IHBhc3MgYW4gYXJyYXkgdG8gcmFjZS5cIikpfSl9ZnVuY3Rpb24gRih0KXt2YXIgZT10aGlzLG49bmV3IGUocCk7cmV0dXJuIGoobix0KSxufWZ1bmN0aW9uIEQoKXt0aHJvdyBuZXcgVHlwZUVycm9yKFwiWW91IG11c3QgcGFzcyBhIHJlc29sdmVyIGZ1bmN0aW9uIGFzIHRoZSBmaXJzdCBhcmd1bWVudCB0byB0aGUgcHJvbWlzZSBjb25zdHJ1Y3RvclwiKX1mdW5jdGlvbiBLKCl7dGhyb3cgbmV3IFR5cGVFcnJvcihcIkZhaWxlZCB0byBjb25zdHJ1Y3QgJ1Byb21pc2UnOiBQbGVhc2UgdXNlIHRoZSAnbmV3JyBvcGVyYXRvciwgdGhpcyBvYmplY3QgY29uc3RydWN0b3IgY2Fubm90IGJlIGNhbGxlZCBhcyBhIGZ1bmN0aW9uLlwiKX1mdW5jdGlvbiBMKHQpe3RoaXNbcnRdPU8oKSx0aGlzLl9yZXN1bHQ9dGhpcy5fc3RhdGU9dm9pZCAwLHRoaXMuX3N1YnNjcmliZXJzPVtdLHAhPT10JiYoXCJmdW5jdGlvblwiIT10eXBlb2YgdCYmRCgpLHRoaXMgaW5zdGFuY2VvZiBMP0ModGhpcyx0KTpLKCkpfWZ1bmN0aW9uIE4odCxlKXt0aGlzLl9pbnN0YW5jZUNvbnN0cnVjdG9yPXQsdGhpcy5wcm9taXNlPW5ldyB0KHApLHRoaXMucHJvbWlzZVtydF18fGsodGhpcy5wcm9taXNlKSxBcnJheS5pc0FycmF5KGUpPyh0aGlzLl9pbnB1dD1lLHRoaXMubGVuZ3RoPWUubGVuZ3RoLHRoaXMuX3JlbWFpbmluZz1lLmxlbmd0aCx0aGlzLl9yZXN1bHQ9bmV3IEFycmF5KHRoaXMubGVuZ3RoKSwwPT09dGhpcy5sZW5ndGg/Uyh0aGlzLnByb21pc2UsdGhpcy5fcmVzdWx0KToodGhpcy5sZW5ndGg9dGhpcy5sZW5ndGh8fDAsdGhpcy5fZW51bWVyYXRlKCksMD09PXRoaXMuX3JlbWFpbmluZyYmUyh0aGlzLnByb21pc2UsdGhpcy5fcmVzdWx0KSkpOmoodGhpcy5wcm9taXNlLFUoKSl9ZnVuY3Rpb24gVSgpe3JldHVybiBuZXcgRXJyb3IoXCJBcnJheSBNZXRob2RzIG11c3QgYmUgcHJvdmlkZWQgYW4gQXJyYXlcIil9ZnVuY3Rpb24gVygpe3ZhciB0O2lmKFwidW5kZWZpbmVkXCIhPXR5cGVvZiBnbG9iYWwpdD1nbG9iYWw7ZWxzZSBpZihcInVuZGVmaW5lZFwiIT10eXBlb2Ygc2VsZil0PXNlbGY7ZWxzZSB0cnl7dD1GdW5jdGlvbihcInJldHVybiB0aGlzXCIpKCl9Y2F0Y2goZSl7dGhyb3cgbmV3IEVycm9yKFwicG9seWZpbGwgZmFpbGVkIGJlY2F1c2UgZ2xvYmFsIG9iamVjdCBpcyB1bmF2YWlsYWJsZSBpbiB0aGlzIGVudmlyb25tZW50XCIpfXZhciBuPXQuUHJvbWlzZTsoIW58fFwiW29iamVjdCBQcm9taXNlXVwiIT09T2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG4ucmVzb2x2ZSgpKXx8bi5jYXN0KSYmKHQuUHJvbWlzZT1wdCl9dmFyIHo7ej1BcnJheS5pc0FycmF5P0FycmF5LmlzQXJyYXk6ZnVuY3Rpb24odCl7cmV0dXJuXCJbb2JqZWN0IEFycmF5XVwiPT09T2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHQpfTt2YXIgQixHLEgsST16LEo9MCxRPWZ1bmN0aW9uKHQsZSl7dHRbSl09dCx0dFtKKzFdPWUsSis9MiwyPT09SiYmKEc/RyhhKTpIKCkpfSxSPVwidW5kZWZpbmVkXCIhPXR5cGVvZiB3aW5kb3c/d2luZG93OnZvaWQgMCxWPVJ8fHt9LFg9Vi5NdXRhdGlvbk9ic2VydmVyfHxWLldlYktpdE11dGF0aW9uT2JzZXJ2ZXIsWj1cInVuZGVmaW5lZFwiPT10eXBlb2Ygc2VsZiYmXCJ1bmRlZmluZWRcIiE9dHlwZW9mIHByb2Nlc3MmJlwiW29iamVjdCBwcm9jZXNzXVwiPT09e30udG9TdHJpbmcuY2FsbChwcm9jZXNzKSwkPVwidW5kZWZpbmVkXCIhPXR5cGVvZiBVaW50OENsYW1wZWRBcnJheSYmXCJ1bmRlZmluZWRcIiE9dHlwZW9mIGltcG9ydFNjcmlwdHMmJlwidW5kZWZpbmVkXCIhPXR5cGVvZiBNZXNzYWdlQ2hhbm5lbCx0dD1uZXcgQXJyYXkoMWUzKTtIPVo/bygpOlg/cygpOiQ/dSgpOnZvaWQgMD09PVImJlwiZnVuY3Rpb25cIj09dHlwZW9mIHJlcXVpcmU/ZigpOmMoKTt2YXIgZXQ9bCxudD1oLHJ0PU1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygxNiksb3Q9dm9pZCAwLGl0PTEsc3Q9Mix1dD1uZXcgTSxjdD1uZXcgTSxhdD0wLGZ0PVksbHQ9cSxodD1GLHB0PUw7TC5hbGw9ZnQsTC5yYWNlPWx0LEwucmVzb2x2ZT1udCxMLnJlamVjdD1odCxMLl9zZXRTY2hlZHVsZXI9bixMLl9zZXRBc2FwPXIsTC5fYXNhcD1RLEwucHJvdG90eXBlPXtjb25zdHJ1Y3RvcjpMLHRoZW46ZXQsXCJjYXRjaFwiOmZ1bmN0aW9uKHQpe3JldHVybiB0aGlzLnRoZW4obnVsbCx0KX19O3ZhciBfdD1OO04ucHJvdG90eXBlLl9lbnVtZXJhdGU9ZnVuY3Rpb24oKXtmb3IodmFyIHQ9dGhpcy5sZW5ndGgsZT10aGlzLl9pbnB1dCxuPTA7dGhpcy5fc3RhdGU9PT1vdCYmdD5uO24rKyl0aGlzLl9lYWNoRW50cnkoZVtuXSxuKX0sTi5wcm90b3R5cGUuX2VhY2hFbnRyeT1mdW5jdGlvbih0LGUpe3ZhciBuPXRoaXMuX2luc3RhbmNlQ29uc3RydWN0b3Iscj1uLnJlc29sdmU7aWYocj09PW50KXt2YXIgbz12KHQpO2lmKG89PT1ldCYmdC5fc3RhdGUhPT1vdCl0aGlzLl9zZXR0bGVkQXQodC5fc3RhdGUsZSx0Ll9yZXN1bHQpO2Vsc2UgaWYoXCJmdW5jdGlvblwiIT10eXBlb2Ygbyl0aGlzLl9yZW1haW5pbmctLSx0aGlzLl9yZXN1bHRbZV09dDtlbHNlIGlmKG49PT1wdCl7dmFyIGk9bmV3IG4ocCk7dyhpLHQsbyksdGhpcy5fd2lsbFNldHRsZUF0KGksZSl9ZWxzZSB0aGlzLl93aWxsU2V0dGxlQXQobmV3IG4oZnVuY3Rpb24oZSl7ZSh0KX0pLGUpfWVsc2UgdGhpcy5fd2lsbFNldHRsZUF0KHIodCksZSl9LE4ucHJvdG90eXBlLl9zZXR0bGVkQXQ9ZnVuY3Rpb24odCxlLG4pe3ZhciByPXRoaXMucHJvbWlzZTtyLl9zdGF0ZT09PW90JiYodGhpcy5fcmVtYWluaW5nLS0sdD09PXN0P2oocixuKTp0aGlzLl9yZXN1bHRbZV09biksMD09PXRoaXMuX3JlbWFpbmluZyYmUyhyLHRoaXMuX3Jlc3VsdCl9LE4ucHJvdG90eXBlLl93aWxsU2V0dGxlQXQ9ZnVuY3Rpb24odCxlKXt2YXIgbj10aGlzO0UodCx2b2lkIDAsZnVuY3Rpb24odCl7bi5fc2V0dGxlZEF0KGl0LGUsdCl9LGZ1bmN0aW9uKHQpe24uX3NldHRsZWRBdChzdCxlLHQpfSl9O3ZhciBkdD1XLHZ0PXtQcm9taXNlOnB0LHBvbHlmaWxsOmR0fTtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKGZ1bmN0aW9uKCl7cmV0dXJuIHZ0fSk6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9dnQ6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHRoaXMmJih0aGlzLkVTNlByb21pc2U9dnQpLGR0KCl9KS5jYWxsKHRoaXMpOyJdfQ==
},{"_process":2}],10:[function(require,module,exports){
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _slicedToArray = function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { var _arr = []; for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) { _arr.push(_step.value); if (i && _arr.length === i) break; } return _arr; } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } };

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

exports.login = login;
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
var generateToken = _API.generateToken;

function login() {
  Promise.all([Templates.get("login")]).then(function (res) {
    var _res = _slicedToArray(res, 1);

    var template = _res[0];

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
      location.hash = "#/events";
    });
  })["catch"](console.error.bind(console));
}

},{"../API":3,"../Templates":6,"../helpers":8,"../lib/es6-promise.min.js":9}],12:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwiQzovVXNlcnMvU2FtdWVsL0RvY3VtZW50cy9vcmItY2xpZW50L3NyYy9tYWluLmpzIiwibm9kZV9tb2R1bGVzXFxicm93c2VyaWZ5XFxub2RlX21vZHVsZXNcXHByb2Nlc3NcXGJyb3dzZXIuanMiLCJDOi9Vc2Vycy9TYW11ZWwvRG9jdW1lbnRzL29yYi1jbGllbnQvc3JjL0FQSS5qcyIsIkM6L1VzZXJzL1NhbXVlbC9Eb2N1bWVudHMvb3JiLWNsaWVudC9zcmMvQ29tcG9uZW50cy5qcyIsIkM6L1VzZXJzL1NhbXVlbC9Eb2N1bWVudHMvb3JiLWNsaWVudC9zcmMvUGFnZXMuanMiLCJDOi9Vc2Vycy9TYW11ZWwvRG9jdW1lbnRzL29yYi1jbGllbnQvc3JjL1RlbXBsYXRlcy5qcyIsIkM6L1VzZXJzL1NhbXVlbC9Eb2N1bWVudHMvb3JiLWNsaWVudC9zcmMvY2FjaGVhYmxlLmpzIiwiQzovVXNlcnMvU2FtdWVsL0RvY3VtZW50cy9vcmItY2xpZW50L3NyYy9oZWxwZXJzLmpzIiwic3JjXFxsaWJcXGVzNi1wcm9taXNlLm1pbi5qcyIsIkM6L1VzZXJzL1NhbXVlbC9Eb2N1bWVudHMvb3JiLWNsaWVudC9zcmMvcGFnZXMvZXZlbnQuanMiLCJDOi9Vc2Vycy9TYW11ZWwvRG9jdW1lbnRzL29yYi1jbGllbnQvc3JjL3BhZ2VzL2xvZ2luLmpzIiwiQzovVXNlcnMvU2FtdWVsL0RvY3VtZW50cy9vcmItY2xpZW50L3NyYy9wYWdlcy90ZWFtLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUEsWUFBWSxDQUFDOztBQUViLElBQUksZUFBZSxHQUFHLFNBQUEsZUFBQSxDQUFVLEdBQUcsRUFBRTtBQUFFLFNBQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztD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O0dBQ0Y7Q0FDRixDQUFDLENBQUM7OztBQ2xDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBLFlBQVksQ0FBQzs7QUFFYixJQUFJLGVBQWUsR0FBRyxTQUFBLGVBQUEsQ0FBVSxHQUFHLEVBQUU7QUFBRSxTQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLENBQUM7Q0FBRSxDQUFDOztBQUU5RixJQUFJLGNBQWMsR0FBRyxTQUFBLGNBQUEsQ0FBVSxHQUFHLEVBQUUsQ0FBQyxFQUFFO0FBQUUsTUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQUUsV0FBTyxHQUFHLENBQUM7R0FBRSxNQUFNLElBQUksTUFBTSxDQUFDLFFBQVEsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFBRSxRQUFJLElBQUksR0FBRyxFQUFFLENBQUMsS0FBTSxJQUFJLFNBQVMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxL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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7UUMvTmdCLEtBQUssR0FBTCxLQUFLOzs7OztRQUxkLDJCQUEyQjs7SUFDM0IsU0FBUywyQkFBTSxjQUFjOzt1QkFDTCxZQUFZOztJQUFsQyxPQUFPLFlBQVAsT0FBTztJQUFFLEtBQUssWUFBTCxLQUFLOzttQkFDcUIsUUFBUTs7SUFBN0MsR0FBRzs7SUFBSSxRQUFRLFFBQVIsUUFBUTtJQUFFLFlBQVksUUFBWixZQUFZOztBQUU3QixTQUFTLEtBQUssQ0FBQyxHQUFHLEVBQUU7QUFDekIsU0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUNWLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQ3RCLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUM3QixDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVMsR0FBRyxFQUFFOzhCQUNNLEdBQUc7O1FBQXRCLFFBQVE7UUFBRSxLQUFLOztBQUN0QixRQUFNLFVBQVUsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsT0FBTyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3BELFFBQU0sY0FBYyxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDaEQsY0FBVSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUM1QixRQUFNLE9BQU8sR0FBRyxJQUFJLE9BQU8sQ0FBQztBQUMxQixjQUFRLEVBQUUsUUFBUTtBQUNsQixVQUFJLEVBQUU7QUFDSixXQUFHLEVBQUUsR0FBRztBQUNSLGtCQUFVLEVBQUUsS0FBSztBQUNqQixlQUFPLEVBQUUsSUFBSTtBQUNiLGFBQUssRUFBRSxFQUFFO0FBQ1QsYUFBSyxFQUFFLEtBQUs7QUFDWixpQkFBUyxFQUFBLG1CQUFDLEtBQUssRUFBRSxJQUFJLEVBQUU7QUFDckIsY0FBTSxLQUFLLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2hDLGVBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtBQUM1QyxnQkFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksS0FBSyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFBLEtBQU0sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxLQUFLLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUEsQUFBQyxFQUFFO0FBQ3hILHFCQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFNBQU0sQ0FBQzthQUMvQjtXQUNGO1NBQ0Y7T0FDRjtBQUNELGNBQVEsRUFBRTtBQUNSLGNBQU0sRUFBRSxrQkFBVztBQUNqQixpQkFBTyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxFQUFFLEdBQUcsR0FBRyxDQUFDO1NBQ2hDO09BQ0Y7QUFDRCxlQUFTLEVBQUUscUJBQVc7QUFDcEIsa0JBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLGNBQWMsQ0FBQyxDQUFDO09BQzFDO0tBQ0YsQ0FBQyxDQUFDOztBQUVILFlBQVEsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVMsS0FBSyxFQUFFO0FBQ3RDLGFBQU8sQ0FBQyxHQUFHLENBQUM7QUFDVixhQUFLLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFTLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDL0IsaUJBQU8sQ0FBQyxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFBO1NBQ3JDLENBQUM7QUFDRixlQUFPLEVBQUUsS0FBSztPQUNmLENBQUMsQ0FBQztBQUNILGNBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQztLQUNqQixDQUFDLENBQUM7R0FDSixDQUFDLENBQUM7Q0FDSjs7O0FDbkRELFlBQVksQ0FBQzs7QUFFYixJQUFJLGVBQWUsR0FBRyxTQUFBLGVBQUEsQ0FBVSxHQUFHLEVBQUU7QUFBRSxTQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLENBQUM7Q0FBRSxDQUFDOztBQUU5RixJQUFJLGNBQWMsR0FBRyxTQUFBLGNBQUEsQ0FBVSxHQUFHLEVBQUUsQ0FBQyxFQUFFO0FBQUUsTUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQUUsV0FBTyxHQUFHLENBQUM7R0FBRSxNQUFNLElBQUksTUFBTSxDQUFDLFFBQVEsSUFBSSxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFBRSxRQUFJLElBQUksR0FBRyxFQUFFLENBQUMsS0FBTSxJQUFJLFNBQVMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLLEdBQUcsU0FBUyxDQUFDLElBQUksRUFBRSxDQUFBLENBQUUsSUFBSSxHQUFHO0FBQUUsVUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsTUFBTTtLQUFFLE9BQVEsSUFBSSxDQUFDO0dBQUUsTUFBTTtBQUFFLFVBQU0sSUFBSSxTQUFTLENBQUMsc0RBQXNELENBQUMsQ0FBQztHQUFFO0NBQUUsQ0FBQzs7QUFFeFksT0FBTyxDQURTLEtBQUssR0FBTCxLQUFLLENBQUE7QUFFckIsTUFBTSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsWUFBWSxFQUFFO0FBQzNDLE9BQUssRUFBRSxJQUFJO0NBQ1osQ0FBQyxDQUFDOztBQUVILE9BQU8sQ0FYQSwyQkFBMkIsQ0FBQSxDQUFBOztBQWFsQyxJQVpPLFNBQVMsR0FBQSxlQUFBLENBQUEsT0FBQSxDQUFNLGNBQWMsQ0FBQSxDQUFBLENBQUE7O0FBY3BDLElBQUksUUFBUSxHQUFHLE9BQU8sQ0FiUyxZQUFZLENBQUEsQ0FBQTs7QUFlM0MsSUFmUyxPQUFPLEdBQUEsUUFBQSxDQUFQLE9BQU8sQ0FBQTtBQWdCaEIsSUFoQmtCLEtBQUssR0FBQSxRQUFBLENBQUwsS0FBSyxDQUFBOztBQWtCdkIsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQWpCK0IsUUFBUSxDQUFBLENBQUE7O0FBbUJ6RCxJQW5CTyxHQUFHLEdBQUEsZUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBOztBQXFCVixJQXJCYyxZQUFZLEdBQUEsSUFBQSxDQUFaLFlBQVksQ0FBQTtBQXNCMUIsSUF0QjRCLGFBQWEsR0FBQSxJQUFBLENBQWIsYUFBYSxDQUFBOztBQUVsQyxTQUFTLEtBQUssR0FBRztBQUN0QixTQUFPLENBQUMsR0FBRyxDQUFDLENBQ1YsU0FBUyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FDdkIsQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFTLEdBQUcsRUFBRTtBQXFCcEIsUUFBSSxJQUFJLEdBQUcsY0FBYyxDQXBCTixHQUFHLEVBQUEsQ0FBQSxDQUFBLENBQUE7O0FBc0J0QixRQXRCTyxRQUFRLEdBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBOztBQUNmLFFBQU0sT0FBTyxHQUFHLElBQUksT0FBTyxDQUFDO0FBQzFCLGNBQVEsRUFBRSxRQUFRO0FBQ2xCLFVBQUksRUFBRTtBQUNKLGNBQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxFQUFFLEdBQUcsR0FBRztBQUMvQixhQUFLLEVBQUUsWUFBWSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7QUFDcEMsWUFBSSxFQUFFO0FBQ0osY0FBSSxFQUFFLFlBQVksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRTtBQUM3QyxjQUFJLEVBQUUsWUFBWSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFO1NBQzlDO09BQ0YsRUFDRixDQUFDLENBQUM7QUFDSCxXQUFPLENBQUMsRUFBRSxDQUFDLE9BQU8sRUFBRSxVQUFTLElBQUksRUFBRTtBQUNqQyxVQUFJLElBQUksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ2pDLFVBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDakMsa0JBQVksQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3ZDLGtCQUFZLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBQyxJQUFJLENBQUMsQ0FBQztBQUN2QyxVQUFJLEtBQUssR0FBRyxhQUFhLENBQUMsSUFBSSxFQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3JDLGNBQVEsQ0FBQyxJQUFJLEdBQUcsVUFBVSxDQUFDO0tBQzVCLENBQUMsQ0FBQztHQUNKLENBQUMsQ0FBQSxPQUFBLENBQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0NBQ3ZDOzs7Ozs7Ozs7UUN6QmUsSUFBSSxHQUFKLElBQUk7Ozs7O1FBTGIsMkJBQTJCOztJQUMzQixTQUFTLDJCQUFNLGNBQWM7O3VCQUNMLFlBQVk7O0lBQWxDLE9BQU8sWUFBUCxPQUFPO0lBQUUsS0FBSyxZQUFMLEtBQUs7O21CQUNXLFFBQVE7O0lBQW5DLEdBQUc7O0lBQUksWUFBWSxRQUFaLFlBQVk7O0FBRW5CLFNBQVMsSUFBSSxDQUFDLEdBQUcsRUFBRTtBQUN4QixTQUFPLENBQUMsR0FBRyxDQUFDLENBQ1YsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFDckIsT0FBTyxDQUFDLG1CQUFtQixDQUFDLEVBQzVCLFlBQVksQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQ3ZCLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBUyxHQUFHLEVBQUU7OEJBQ2dCLEdBQUc7O1FBQWhDLFFBQVE7UUFBRSxLQUFLO1FBQUUsUUFBUTs7QUFDaEMsUUFBTSxPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUM7QUFDMUIsY0FBUSxFQUFFLFFBQVE7QUFDbEIsVUFBSSxFQUFFO0FBQ0osYUFBSyxFQUFFLEtBQUs7QUFDWixnQkFBUSxFQUFFLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxVQUFVLENBQUM7QUFDeEMsV0FBRyxFQUFFLEdBQUc7QUFDUixZQUFJLEVBQUUsUUFBUTtBQUNkLGNBQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxFQUFFLEdBQUcsR0FBRztBQUMvQixhQUFLLEVBQUUsS0FBSyxFQUNiLEVBQ0YsQ0FBQyxDQUFDO0dBQ0osQ0FBQyxTQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztDQUN2QyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgKiBhcyBQYWdlcyBmcm9tICcuL1BhZ2VzJ1xyXG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tICcuL0NvbXBvbmVudHMnXHJcbmltcG9ydCB7IGRvY3VtZW50UmVhZHkgfSBmcm9tICcuL2hlbHBlcnMnXHJcbmltcG9ydCAnLi9saWIvZXM2LXByb21pc2UubWluLmpzJ1xyXG5cclxuY29uc3QgZWwgPSBcIiNtYWluXCI7XHJcblxyXG5jb25zdCByb3V0ZXIgPSBSb3V0ZXIoe1xyXG4gIFwiL2xvZ2luXCI6IFBhZ2VzLmxvZ2luLFxyXG4gIFwiL3RlYW0vOmtleVwiOiBQYWdlcy50ZWFtLFxyXG4gIFwiL2V2ZW50LzprZXlcIjogUGFnZXMuZXZlbnQsXHJcbn0pLmNvbmZpZ3VyZSh7XHJcbiAgaHRtbDVoaXN0b3J5OiBmYWxzZSxcclxuICBiZWZvcmU6IFtmdW5jdGlvbigpIHtcclxuICB9XSxcclxufSk7XHJcblxyXG5Qcm9taXNlLmFsbChbZG9jdW1lbnRSZWFkeSwgQ29tcG9uZW50cy5sb2FkKCldKS50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gIGNvbnN0IFssIENvbXBvbmVudHNdID0gcmVzO1xyXG4gIFJhY3RpdmUgPSBSYWN0aXZlLmV4dGVuZCh7XHJcbiAgICBlbDogZWwsXHJcbiAgICBjb21wb25lbnRzOiBDb21wb25lbnRzLmNvbXBvbmVudHMsXHJcbiAgICBiZWZvcmU6IFtmdW5jdGlvbigpIHtcclxuICAgICAgJCh3aW5kb3cpLnNjcm9sbFRvcCgwKTtcclxuICAgIH1dLFxyXG4gIH0pO1xyXG4gIHJvdXRlci5pbml0KCk7XHJcbiAgaWYgKCFyb3V0ZXIuZ2V0Um91dGUoKS5maWx0ZXIoQm9vbGVhbikubGVuZ3RoKSB7XHJcbiAgICBpZihsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9rZW4nKSkge1xyXG4gICAgICByb3V0ZXIuc2V0Um91dGUoXCIvZXZlbnQvMjAxNmFyY1wiKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJvdXRlci5zZXRSb3V0ZShcIi9sb2dpblwiKTtcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5wcm9jZXNzLm5leHRUaWNrID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgIHZhciBjYW5NdXRhdGlvbk9ic2VydmVyID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuTXV0YXRpb25PYnNlcnZlcjtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICB2YXIgcXVldWUgPSBbXTtcblxuICAgIGlmIChjYW5NdXRhdGlvbk9ic2VydmVyKSB7XG4gICAgICAgIHZhciBoaWRkZW5EaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICB2YXIgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgcXVldWVMaXN0ID0gcXVldWUuc2xpY2UoKTtcbiAgICAgICAgICAgIHF1ZXVlLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICBxdWV1ZUxpc3QuZm9yRWFjaChmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUoaGlkZGVuRGl2LCB7IGF0dHJpYnV0ZXM6IHRydWUgfSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBpZiAoIXF1ZXVlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGhpZGRlbkRpdi5zZXRBdHRyaWJ1dGUoJ3llcycsICdubycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuIiwiaW1wb3J0ICcuL2xpYi9lczYtcHJvbWlzZS5taW4uanMnXHJcbmltcG9ydCBjYWNoZWFibGUgZnJvbSAnLi9jYWNoZWFibGUnXHJcbmltcG9ydCB7IGV4dGVuZCB9IGZyb20gJy4vaGVscGVycydcclxuXHJcblxyXG5cclxuZXhwb3J0IGRlZmF1bHQgY2FjaGVhYmxlKGZ1bmN0aW9uKGtleSkge1xyXG4gIGNvbnN0IGtleSA9IGtleS5yZXBsYWNlKC9eXFwvLywgXCJcIikucmVwbGFjZSgvXFwvJC8sIFwiXCIpO1xyXG4gIGxldCB1cmwgPSBcImh0dHA6Ly9jNTAzMjAyMS5uZ3Jvay5pby9cIitrZXkrXCIvXCI7XHJcbiAgLy91cmwgPSBcImFwaS5waHA/dXJsPVwiK2VuY29kZVVSSUNvbXBvbmVudCh1cmwpO1xyXG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcclxuICAgIHJldHVybiAkLmFqYXgoe1xyXG4gICAgICBtZXRob2Q6IFwiZ2V0XCIsXHJcbiAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcclxuICAgICAgZGF0YToge30sXHJcbiAgICAgIHVybDogdXJsLFxyXG4gICAgICBlcnJvcjogcmVqZWN0XHJcbiAgICB9KS50aGVuKHJlc29sdmUpO1xyXG4gIH0pLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgY29uc29sZS5lcnJvcihcIkFQSSBSZXF1ZXN0IFVuc3VjY2Vzc2Z1bFwiLCB1cmwsIHJlcyk7XHJcbiAgICByZXR1cm4gcmVzO1xyXG4gIH0pO1xyXG59KTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBnZXRUZWFtU3RhdHMoQVBJLCBrZXksIHRlYW0pIHtcclxuICBsZXQgcHJvbWlzZXMgPSBbXHJcbiAgICBBUEkuZ2V0KFwidGVhbS9cIitrZXkrXCIvZGVmZW5zZVwiKSxcclxuICAgIEFQSS5nZXQoXCJ0ZWFtL1wiK2tleStcIi9nb2Fsc1wiKSxcclxuICBdO1xyXG4gIGlmICh0eXBlb2YgdGVhbSA9PSBcIm9iamVjdFwiICYmIHRlYW0udGVhbV9udW1iZXIgPT0gdGVhbSkge1xyXG4gICAgcHJvbWlzZXMucHVzaCgocmVzb2x2ZSwgcmVqZWN0KSA9PiByZXNvbHZlKHRlYW0pKVxyXG4gIH0gZWxzZSB7XHJcbiAgICBwcm9taXNlcy5wdXNoKEFQSS5nZXQoXCJ0ZWFtL1wiK2tleSkpO1xyXG4gIH1cclxuICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICBsZXQgW2RlZmVuc2VzLCBnb2FscywgdGVhbV0gPSByZXM7XHJcbiAgICBkZWZlbnNlcyA9IGdvYWxzID0gW1xyXG4gICAgICA0NTM0LFxyXG4gICAgICBNYXRoLnJhbmRvbSgpKjIsXHJcbiAgICAgIE1hdGgucmFuZG9tKCkqMixcclxuICAgICAgTWF0aC5yYW5kb20oKSoyLFxyXG4gICAgICBNYXRoLnJhbmRvbSgpKjIsXHJcbiAgICAgIE1hdGgucmFuZG9tKCkqMixcclxuICAgICAgTWF0aC5yYW5kb20oKSoyLFxyXG4gICAgICBNYXRoLnJhbmRvbSgpKjIsXHJcbiAgICAgIE1hdGgucmFuZG9tKCkqMixcclxuICAgICAgTWF0aC5yYW5kb20oKSoyLFxyXG4gICAgXTtcclxuICAgIHJldHVybiBleHRlbmQodGVhbSwge1xyXG4gICAgICBzdGF0czoge1xyXG4gICAgICAgIGNhbGNzOiB7XHJcbiAgICAgICAgICBwcmVkaWN0ZWRfcnA6IE1hdGgucmFuZG9tKCkqMioxMCxcclxuICAgICAgICAgIHNjb3JlOiAwXHJcbiAgICAgICAgfSxcclxuICAgICAgICBkZWZlbnNlczoge1xyXG4gICAgICAgICAgbG93X2JhcjogZGVmZW5zZXNbMV0sXHJcbiAgICAgICAgICBwb3J0Y3VsbGlzOiBkZWZlbnNlc1syXSxcclxuICAgICAgICAgIGNoZXZhbF9kZV9mcmlzZTogZGVmZW5zZXNbM10sXHJcbiAgICAgICAgICBtb2F0OiBkZWZlbnNlc1s0XSxcclxuICAgICAgICAgIHJhbXBhcnRzOiBkZWZlbnNlc1s1XSxcclxuICAgICAgICAgIGRyYXdicmlkZ2U6IGRlZmVuc2VzWzZdLFxyXG4gICAgICAgICAgc2FsbHlfcG9ydDogZGVmZW5zZXNbN10sXHJcbiAgICAgICAgICByb2NrX3dhbGw6IGRlZmVuc2VzWzhdLFxyXG4gICAgICAgICAgcm91Z2hfdGVycmFpbjogZGVmZW5zZXNbOV0sXHJcbiAgICAgICAgfSxcclxuICAgICAgICBnb2Fsczoge1xyXG4gICAgICAgICAgYXV0b19sb3c6IGdvYWxzWzFdLFxyXG4gICAgICAgICAgYXV0b19oaWdoOiBnb2Fsc1syXSxcclxuICAgICAgICAgIHRlbGVvcF9sb3c6IGdvYWxzWzNdLFxyXG4gICAgICAgICAgdGVsZW9wX2hpZ2g6IGdvYWxzWzRdLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGVhbXMoQVBJLCBrZXkpIHtcclxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICByZXNvbHZlKEFQSS5nZXQoXCJsaXN0L1wiK2tleSkpO1xyXG4gIH0pLnRoZW4oZnVuY3Rpb24odGVhbXMpIHtcclxuICAgIHJldHVybiBQcm9taXNlLmFsbCh0ZWFtcy5tYXAodGVhbSA9PiBnZXRUZWFtU3RhdHMoQVBJLCB0ZWFtLnRlYW1fbnVtYmVyLCB0ZWFtKSkpO1xyXG4gIH0pO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVUb2tlbih0ZWFtLG5hbWUpIHtcclxuICB2YXIgdG9rZW4gPSB0ZWFtICsgXCIuXCIgKyBtZDUobmFtZSk7XHJcbiAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ0b2tlblwiLHRva2VuKTtcclxuICByZXR1cm4gdG9rZW47XHJcbn1cclxuIiwiaW1wb3J0ICcuL2xpYi9lczYtcHJvbWlzZS5taW4uanMnXHJcbmltcG9ydCBUZW1wbGF0ZXMgZnJvbSAnLi9UZW1wbGF0ZXMnXHJcblxyXG5leHBvcnQgZGVmYXVsdCB7XHJcbiAgdGVtcGxhdGVzOiB7fSxcclxuICBjb21wb25lbnRzOiB7fSxcclxuICBjcmVhdGU6IGZ1bmN0aW9uKGRvbmUpIHtcclxuICAgIHRoaXMuY29tcG9uZW50cy5Qcm9ncmVzcyA9IFJhY3RpdmUuZXh0ZW5kKHtcclxuICAgICAgIGlzb2xhdGVkOiBmYWxzZSxcclxuICAgICAgIHRlbXBsYXRlOiB0aGlzLnRlbXBsYXRlcy5wcm9ncmVzcyxcclxuICAgICAgIG9uaW5pdDogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgIGNvbnN0IHN0YXQgPSB0aGlzLmdldChcInN0YXRcIik7XHJcbiAgICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5nZXQoXCJ2YWx1ZVwiKTtcclxuICAgICAgICAgbGV0IHByb2dyZXNzQ2xhc3M7XHJcbiAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBzdGF0LnByb2dyZXNzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgaWYgKCghc3RhdC5wcm9ncmVzc1tpXS5taW4gfHwgdmFsdWUgPj0gc3RhdC5wcm9ncmVzc1tpXS5taW4pICYmICghc3RhdC5wcm9ncmVzc1tpXS5tYXggfHwgdmFsdWUgPD0gc3RhdC5wcm9ncmVzc1tpXS5tYXgpKSB7XHJcbiAgICAgICAgICAgICBwcm9ncmVzc0NsYXNzID0gc3RhdC5wcm9ncmVzc1tpXS5jbGFzcztcclxuICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgIH1cclxuICAgICAgICAgfVxyXG4gICAgICAgICB0aGlzLnNldCh7XHJcbiAgICAgICAgICAgbWluOiBzdGF0Lm1pbixcclxuICAgICAgICAgICBtYXg6IHN0YXQubWF4LFxyXG4gICAgICAgICAgIHdpZHRoOiAoc3RhdC5taW4gKyB2YWx1ZSkvc3RhdC5tYXggKiAxMDAsXHJcbiAgICAgICAgICAgcHJvZ3Jlc3NDbGFzczogcHJvZ3Jlc3NDbGFzcyxcclxuICAgICAgICAgfSlcclxuICAgICAgIH0sXHJcblxyXG4gICAgfSk7XHJcbiAgfSxcclxuICBsb2FkOiBmdW5jdGlvbihkb25lKSB7XHJcbiAgICBjb25zdCBfdGhpcyA9IHRoaXM7XHJcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICAgIFRlbXBsYXRlcy5nZXQoXCJjb21wb25lbnRzXCIpLnRoZW4oZnVuY3Rpb24odGVtcGxhdGVzKSB7XHJcbiAgICAgICAgJChcIjxkaXY+XCIpLmh0bWwodGVtcGxhdGVzKS5maW5kKFwic2NyaXB0LnRlbXBsYXRlXCIpLmVhY2goZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBjb25zdCAkdGhpcyA9ICQodGhpcyk7XHJcbiAgICAgICAgICBfdGhpcy50ZW1wbGF0ZXNbJHRoaXMuYXR0cihcIm5hbWVcIildID0gJHRoaXMuaHRtbCgpLnRyaW0oKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBfdGhpcy5jcmVhdGUoKTtcclxuICAgICAgICByZXNvbHZlKF90aGlzKTtcclxuICAgICAgfSkuY2F0Y2gocmVqZWN0KTtcclxuICAgIH0pO1xyXG4gIH0sXHJcbn07XHJcbiIsImV4cG9ydCAqIGZyb20gJy4vcGFnZXMvdGVhbSdcclxuZXhwb3J0ICogZnJvbSAnLi9wYWdlcy9ldmVudCdcclxuZXhwb3J0ICogZnJvbSAnLi9wYWdlcy9sb2dpbidcclxuIiwiaW1wb3J0ICcuL2xpYi9lczYtcHJvbWlzZS5taW4uanMnXHJcbmltcG9ydCBjYWNoZWFibGUgZnJvbSAnLi9jYWNoZWFibGUnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBjYWNoZWFibGUoZnVuY3Rpb24oa2V5KSB7XHJcbiAgY29uc3QgdXJsID0gXCJ0ZW1wbGF0ZXMvXCIra2V5K1wiLmh0bWxcIjtcclxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICByZXR1cm4gJC5hamF4KHtcclxuICAgICAgbWV0aG9kOiBcImdldFwiLFxyXG4gICAgICB1cmw6IHVybCxcclxuICAgICAgZXJyb3I6IHJlamVjdFxyXG4gICAgfSkudGhlbihyZXNvbHZlKTtcclxuICB9KS5jYXRjaChmdW5jdGlvbihyZXMpIHtcclxuICAgIGNvbnNvbGUuZXJyb3IoXCJUZW1wbGF0ZSBSZXF1ZXN0IFVuc3VjY2Vzc2Z1bFwiLCB1cmwsIHJlcyk7XHJcbiAgICByZXR1cm4gcmVzO1xyXG4gIH0pO1xyXG59KTtcclxuIiwiaW1wb3J0ICcuL2xpYi9lczYtcHJvbWlzZS5taW4uanMnXHJcbmltcG9ydCBjYWNoZWFibGUgZnJvbSAnLi9jYWNoZWFibGUnXHJcblxyXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjYWNoZWFibGUoZ2V0UHJvbWlzZSkge1xyXG4gIGNvbnN0IF9jYWNoZSA9IHt9O1xyXG5cclxuICBmdW5jdGlvbiBzZXQoa2V5LCB2YWx1ZSkge1xyXG4gICAgcmV0dXJuIF9jYWNoZVtrZXldID0gdmFsdWU7XHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgZ2V0KGtleSwgY2FsbGJhY2spIHtcclxuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xyXG4gICAgICAgIGlmIChfY2FjaGVba2V5XSkge1xyXG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUoX2NhY2hlW2tleV0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZ2V0UHJvbWlzZShrZXkpXHJcbiAgICAgICAgICAudGhlbih2YWx1ZSA9PiBzZXQoa2V5LCB2YWx1ZSkpXHJcbiAgICAgICAgICAudGhlbihyZXNvbHZlKVxyXG4gICAgICAgICAgLmNhdGNoKHJlamVjdCk7XHJcblxyXG4gICAgICB9KS50aGVuKGNhbGxiYWNrKTtcclxuICAgIH0sXHJcbiAgfVxyXG59XHJcbiIsImltcG9ydCAnLi9saWIvZXM2LXByb21pc2UubWluLmpzJ1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGdldEpTT04odXJsKSB7XHJcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICQuYWpheCh7XHJcbiAgICAgIG1ldGhvZDogXCJnZXRcIixcclxuICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxyXG4gICAgICBkYXRhOiB7fSxcclxuICAgICAgdXJsOiB1cmwsXHJcbiAgICAgIGVycm9yOiByZWplY3RcclxuICAgIH0pLnRoZW4ocmVzb2x2ZSk7XHJcbiAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiByb3VuZChuLCBkaWdpdHMpIHtcclxuICBjb25zdCBuID0gcGFyc2VGbG9hdChuKTtcclxuICBjb25zdCBkaWdpdHMgPSBwYXJzZUludChkaWdpdHMpO1xyXG4gIGNvbnN0IHBhcnRzID0gKE1hdGgucm91bmQobiAqIE1hdGgucG93KDEwLCBkaWdpdHMpKS9NYXRoLnBvdygxMCwgZGlnaXRzKSkudG9TdHJpbmcoKS5zcGxpdChcIi5cIik7XHJcbiAgaWYgKHBhcnRzLmxlbmd0aCA9PSAxKSB7XHJcbiAgICBwYXJ0cy5wdXNoKFwiXCIpO1xyXG4gIH1cclxuICByZXR1cm4gcGFydHNbMF0gKyAoZGlnaXRzID8gXCIuXCIgOiBcIlwiKSArIHBhcnRzWzFdICsgQXJyYXkoTWF0aC5tYXgoMCwgZGlnaXRzIC0gcGFydHNbMV0ubGVuZ3RoICsgMSkpLmpvaW4oXCIwXCIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gZG9jdW1lbnRSZWFkeSgpIHtcclxuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XHJcbiAgICBpZiAoJC5pc1JlYWR5KSB7XHJcbiAgICAgIHJlc29sdmUoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICQocmVzb2x2ZSk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBleHRlbmQoKSB7XHJcbiAgY29uc3QgcmVzdWx0ID0gYXJndW1lbnRzWzBdO1xyXG4gIGZvcihsZXQgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcclxuICAgIGZvcihsZXQga2V5IGluIGFyZ3VtZW50c1tpXSkge1xyXG4gICAgICByZXN1bHRba2V5XSA9IGFyZ3VtZW50c1tpXVtrZXldO1xyXG4gICAgfVxyXG4gIH1cclxuICByZXR1cm4gcmVzdWx0O1xyXG59XHJcbiIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwpe1xuLyohXHJcbiAqIEBvdmVydmlldyBlczYtcHJvbWlzZSAtIGEgdGlueSBpbXBsZW1lbnRhdGlvbiBvZiBQcm9taXNlcy9BKy5cclxuICogQGNvcHlyaWdodCBDb3B5cmlnaHQgKGMpIDIwMTQgWWVodWRhIEthdHosIFRvbSBEYWxlLCBTdGVmYW4gUGVubmVyIGFuZCBjb250cmlidXRvcnMgKENvbnZlcnNpb24gdG8gRVM2IEFQSSBieSBKYWtlIEFyY2hpYmFsZClcclxuICogQGxpY2Vuc2UgICBMaWNlbnNlZCB1bmRlciBNSVQgbGljZW5zZVxyXG4gKiAgICAgICAgICAgIFNlZSBodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vamFrZWFyY2hpYmFsZC9lczYtcHJvbWlzZS9tYXN0ZXIvTElDRU5TRVxyXG4gKiBAdmVyc2lvbiAgIDMuMi4xXHJcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuKGZ1bmN0aW9uICgpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gdCh0KSB7XG4gICAgcmV0dXJuIFwiZnVuY3Rpb25cIiA9PSB0eXBlb2YgdCB8fCBcIm9iamVjdFwiID09IHR5cGVvZiB0ICYmIG51bGwgIT09IHQ7XG4gIH1mdW5jdGlvbiBlKHQpIHtcbiAgICByZXR1cm4gXCJmdW5jdGlvblwiID09IHR5cGVvZiB0O1xuICB9ZnVuY3Rpb24gbih0KSB7XG4gICAgRyA9IHQ7XG4gIH1mdW5jdGlvbiByKHQpIHtcbiAgICBRID0gdDtcbiAgfWZ1bmN0aW9uIG8oKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soYSk7XG4gICAgfTtcbiAgfWZ1bmN0aW9uIGkoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIEIoYSk7XG4gICAgfTtcbiAgfWZ1bmN0aW9uIHMoKSB7XG4gICAgdmFyIHQgPSAwLFxuICAgICAgICBlID0gbmV3IFgoYSksXG4gICAgICAgIG4gPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIlwiKTtyZXR1cm4gKGUub2JzZXJ2ZShuLCB7IGNoYXJhY3RlckRhdGE6ICEwIH0pLCBmdW5jdGlvbiAoKSB7XG4gICAgICBuLmRhdGEgPSB0ID0gKyt0ICUgMjtcbiAgICB9KTtcbiAgfWZ1bmN0aW9uIHUoKSB7XG4gICAgdmFyIHQgPSBuZXcgTWVzc2FnZUNoYW5uZWwoKTtyZXR1cm4gKHQucG9ydDEub25tZXNzYWdlID0gYSwgZnVuY3Rpb24gKCkge1xuICAgICAgdC5wb3J0Mi5wb3N0TWVzc2FnZSgwKTtcbiAgICB9KTtcbiAgfWZ1bmN0aW9uIGMoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHNldFRpbWVvdXQoYSwgMSk7XG4gICAgfTtcbiAgfWZ1bmN0aW9uIGEoKSB7XG4gICAgZm9yICh2YXIgdCA9IDA7IEogPiB0OyB0ICs9IDIpIHtcbiAgICAgIHZhciBlID0gdHRbdF0sXG4gICAgICAgICAgbiA9IHR0W3QgKyAxXTtlKG4pLCB0dFt0XSA9IHZvaWQgMCwgdHRbdCArIDFdID0gdm9pZCAwO1xuICAgIH1KID0gMDtcbiAgfWZ1bmN0aW9uIGYoKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhciB0ID0gcmVxdWlyZSxcbiAgICAgICAgICBlID0gdChcInZlcnR4XCIpO3JldHVybiAoQiA9IGUucnVuT25Mb29wIHx8IGUucnVuT25Db250ZXh0LCBpKCkpO1xuICAgIH0gY2F0Y2ggKG4pIHtcbiAgICAgIHJldHVybiBjKCk7XG4gICAgfVxuICB9ZnVuY3Rpb24gbCh0LCBlKSB7XG4gICAgdmFyIG4gPSB0aGlzLFxuICAgICAgICByID0gbmV3IHRoaXMuY29uc3RydWN0b3IocCk7dm9pZCAwID09PSByW3J0XSAmJiBrKHIpO3ZhciBvID0gbi5fc3RhdGU7aWYgKG8pIHtcbiAgICAgIHZhciBpID0gYXJndW1lbnRzW28gLSAxXTtRKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgeChvLCByLCBpLCBuLl9yZXN1bHQpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIEUobiwgciwgdCwgZSk7cmV0dXJuIHI7XG4gIH1mdW5jdGlvbiBoKHQpIHtcbiAgICB2YXIgZSA9IHRoaXM7aWYgKHQgJiYgXCJvYmplY3RcIiA9PSB0eXBlb2YgdCAmJiB0LmNvbnN0cnVjdG9yID09PSBlKSB7XG4gICAgICByZXR1cm4gdDtcbiAgICB9dmFyIG4gPSBuZXcgZShwKTtyZXR1cm4gKGcobiwgdCksIG4pO1xuICB9ZnVuY3Rpb24gcCgpIHt9ZnVuY3Rpb24gXygpIHtcbiAgICByZXR1cm4gbmV3IFR5cGVFcnJvcihcIllvdSBjYW5ub3QgcmVzb2x2ZSBhIHByb21pc2Ugd2l0aCBpdHNlbGZcIik7XG4gIH1mdW5jdGlvbiBkKCkge1xuICAgIHJldHVybiBuZXcgVHlwZUVycm9yKFwiQSBwcm9taXNlcyBjYWxsYmFjayBjYW5ub3QgcmV0dXJuIHRoYXQgc2FtZSBwcm9taXNlLlwiKTtcbiAgfWZ1bmN0aW9uIHYodCkge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gdC50aGVuO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiAodXQuZXJyb3IgPSBlLCB1dCk7XG4gICAgfVxuICB9ZnVuY3Rpb24geSh0LCBlLCBuLCByKSB7XG4gICAgdHJ5IHtcbiAgICAgIHQuY2FsbChlLCBuLCByKTtcbiAgICB9IGNhdGNoIChvKSB7XG4gICAgICByZXR1cm4gbztcbiAgICB9XG4gIH1mdW5jdGlvbiBtKHQsIGUsIG4pIHtcbiAgICBRKGZ1bmN0aW9uICh0KSB7XG4gICAgICB2YXIgciA9ICExLFxuICAgICAgICAgIG8gPSB5KG4sIGUsIGZ1bmN0aW9uIChuKSB7XG4gICAgICAgIHIgfHwgKHIgPSAhMCwgZSAhPT0gbiA/IGcodCwgbikgOiBTKHQsIG4pKTtcbiAgICAgIH0sIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHIgfHwgKHIgPSAhMCwgaih0LCBlKSk7XG4gICAgICB9LCBcIlNldHRsZTogXCIgKyAodC5fbGFiZWwgfHwgXCIgdW5rbm93biBwcm9taXNlXCIpKTshciAmJiBvICYmIChyID0gITAsIGoodCwgbykpO1xuICAgIH0sIHQpO1xuICB9ZnVuY3Rpb24gYih0LCBlKSB7XG4gICAgZS5fc3RhdGUgPT09IGl0ID8gUyh0LCBlLl9yZXN1bHQpIDogZS5fc3RhdGUgPT09IHN0ID8gaih0LCBlLl9yZXN1bHQpIDogRShlLCB2b2lkIDAsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBnKHQsIGUpO1xuICAgIH0sIGZ1bmN0aW9uIChlKSB7XG4gICAgICBqKHQsIGUpO1xuICAgIH0pO1xuICB9ZnVuY3Rpb24gdyh0LCBuLCByKSB7XG4gICAgbi5jb25zdHJ1Y3RvciA9PT0gdC5jb25zdHJ1Y3RvciAmJiByID09PSBldCAmJiBjb25zdHJ1Y3Rvci5yZXNvbHZlID09PSBudCA/IGIodCwgbikgOiByID09PSB1dCA/IGoodCwgdXQuZXJyb3IpIDogdm9pZCAwID09PSByID8gUyh0LCBuKSA6IGUocikgPyBtKHQsIG4sIHIpIDogUyh0LCBuKTtcbiAgfWZ1bmN0aW9uIGcoZSwgbikge1xuICAgIGUgPT09IG4gPyBqKGUsIF8oKSkgOiB0KG4pID8gdyhlLCBuLCB2KG4pKSA6IFMoZSwgbik7XG4gIH1mdW5jdGlvbiBBKHQpIHtcbiAgICB0Ll9vbmVycm9yICYmIHQuX29uZXJyb3IodC5fcmVzdWx0KSwgVCh0KTtcbiAgfWZ1bmN0aW9uIFModCwgZSkge1xuICAgIHQuX3N0YXRlID09PSBvdCAmJiAodC5fcmVzdWx0ID0gZSwgdC5fc3RhdGUgPSBpdCwgMCAhPT0gdC5fc3Vic2NyaWJlcnMubGVuZ3RoICYmIFEoVCwgdCkpO1xuICB9ZnVuY3Rpb24gaih0LCBlKSB7XG4gICAgdC5fc3RhdGUgPT09IG90ICYmICh0Ll9zdGF0ZSA9IHN0LCB0Ll9yZXN1bHQgPSBlLCBRKEEsIHQpKTtcbiAgfWZ1bmN0aW9uIEUodCwgZSwgbiwgcikge1xuICAgIHZhciBvID0gdC5fc3Vic2NyaWJlcnMsXG4gICAgICAgIGkgPSBvLmxlbmd0aDt0Ll9vbmVycm9yID0gbnVsbCwgb1tpXSA9IGUsIG9baSArIGl0XSA9IG4sIG9baSArIHN0XSA9IHIsIDAgPT09IGkgJiYgdC5fc3RhdGUgJiYgUShULCB0KTtcbiAgfWZ1bmN0aW9uIFQodCkge1xuICAgIHZhciBlID0gdC5fc3Vic2NyaWJlcnMsXG4gICAgICAgIG4gPSB0Ll9zdGF0ZTtpZiAoMCAhPT0gZS5sZW5ndGgpIHtcbiAgICAgIGZvciAodmFyIHIsIG8sIGkgPSB0Ll9yZXN1bHQsIHMgPSAwOyBzIDwgZS5sZW5ndGg7IHMgKz0gMykgciA9IGVbc10sIG8gPSBlW3MgKyBuXSwgciA/IHgobiwgciwgbywgaSkgOiBvKGkpO3QuX3N1YnNjcmliZXJzLmxlbmd0aCA9IDA7XG4gICAgfVxuICB9ZnVuY3Rpb24gTSgpIHtcbiAgICB0aGlzLmVycm9yID0gbnVsbDtcbiAgfWZ1bmN0aW9uIFAodCwgZSkge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gdChlKTtcbiAgICB9IGNhdGNoIChuKSB7XG4gICAgICByZXR1cm4gKGN0LmVycm9yID0gbiwgY3QpO1xuICAgIH1cbiAgfWZ1bmN0aW9uIHgodCwgbiwgciwgbykge1xuICAgIHZhciBpLFxuICAgICAgICBzLFxuICAgICAgICB1LFxuICAgICAgICBjLFxuICAgICAgICBhID0gZShyKTtpZiAoYSkge1xuICAgICAgaWYgKChpID0gUChyLCBvKSwgaSA9PT0gY3QgPyAoYyA9ICEwLCBzID0gaS5lcnJvciwgaSA9IG51bGwpIDogdSA9ICEwLCBuID09PSBpKSkge1xuICAgICAgICByZXR1cm4gdm9pZCBqKG4sIGQoKSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGkgPSBvLCB1ID0gITA7bi5fc3RhdGUgIT09IG90IHx8IChhICYmIHUgPyBnKG4sIGkpIDogYyA/IGoobiwgcykgOiB0ID09PSBpdCA/IFMobiwgaSkgOiB0ID09PSBzdCAmJiBqKG4sIGkpKTtcbiAgfWZ1bmN0aW9uIEModCwgZSkge1xuICAgIHRyeSB7XG4gICAgICBlKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGcodCwgZSk7XG4gICAgICB9LCBmdW5jdGlvbiAoZSkge1xuICAgICAgICBqKHQsIGUpO1xuICAgICAgfSk7XG4gICAgfSBjYXRjaCAobikge1xuICAgICAgaih0LCBuKTtcbiAgICB9XG4gIH1mdW5jdGlvbiBPKCkge1xuICAgIHJldHVybiBhdCsrO1xuICB9ZnVuY3Rpb24gayh0KSB7XG4gICAgdFtydF0gPSBhdCsrLCB0Ll9zdGF0ZSA9IHZvaWQgMCwgdC5fcmVzdWx0ID0gdm9pZCAwLCB0Ll9zdWJzY3JpYmVycyA9IFtdO1xuICB9ZnVuY3Rpb24gWSh0KSB7XG4gICAgcmV0dXJuIG5ldyBfdCh0aGlzLCB0KS5wcm9taXNlO1xuICB9ZnVuY3Rpb24gcSh0KSB7XG4gICAgdmFyIGUgPSB0aGlzO3JldHVybiBuZXcgZShJKHQpID8gZnVuY3Rpb24gKG4sIHIpIHtcbiAgICAgIGZvciAodmFyIG8gPSB0Lmxlbmd0aCwgaSA9IDA7IG8gPiBpOyBpKyspIGUucmVzb2x2ZSh0W2ldKS50aGVuKG4sIHIpO1xuICAgIH0gOiBmdW5jdGlvbiAodCwgZSkge1xuICAgICAgZShuZXcgVHlwZUVycm9yKFwiWW91IG11c3QgcGFzcyBhbiBhcnJheSB0byByYWNlLlwiKSk7XG4gICAgfSk7XG4gIH1mdW5jdGlvbiBGKHQpIHtcbiAgICB2YXIgZSA9IHRoaXMsXG4gICAgICAgIG4gPSBuZXcgZShwKTtyZXR1cm4gKGoobiwgdCksIG4pO1xuICB9ZnVuY3Rpb24gRCgpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiWW91IG11c3QgcGFzcyBhIHJlc29sdmVyIGZ1bmN0aW9uIGFzIHRoZSBmaXJzdCBhcmd1bWVudCB0byB0aGUgcHJvbWlzZSBjb25zdHJ1Y3RvclwiKTtcbiAgfWZ1bmN0aW9uIEsoKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkZhaWxlZCB0byBjb25zdHJ1Y3QgJ1Byb21pc2UnOiBQbGVhc2UgdXNlIHRoZSAnbmV3JyBvcGVyYXRvciwgdGhpcyBvYmplY3QgY29uc3RydWN0b3IgY2Fubm90IGJlIGNhbGxlZCBhcyBhIGZ1bmN0aW9uLlwiKTtcbiAgfWZ1bmN0aW9uIEwodCkge1xuICAgIHRoaXNbcnRdID0gTygpLCB0aGlzLl9yZXN1bHQgPSB0aGlzLl9zdGF0ZSA9IHZvaWQgMCwgdGhpcy5fc3Vic2NyaWJlcnMgPSBbXSwgcCAhPT0gdCAmJiAoXCJmdW5jdGlvblwiICE9IHR5cGVvZiB0ICYmIEQoKSwgdGhpcyBpbnN0YW5jZW9mIEwgPyBDKHRoaXMsIHQpIDogSygpKTtcbiAgfWZ1bmN0aW9uIE4odCwgZSkge1xuICAgIHRoaXMuX2luc3RhbmNlQ29uc3RydWN0b3IgPSB0LCB0aGlzLnByb21pc2UgPSBuZXcgdChwKSwgdGhpcy5wcm9taXNlW3J0XSB8fCBrKHRoaXMucHJvbWlzZSksIEFycmF5LmlzQXJyYXkoZSkgPyAodGhpcy5faW5wdXQgPSBlLCB0aGlzLmxlbmd0aCA9IGUubGVuZ3RoLCB0aGlzLl9yZW1haW5pbmcgPSBlLmxlbmd0aCwgdGhpcy5fcmVzdWx0ID0gbmV3IEFycmF5KHRoaXMubGVuZ3RoKSwgMCA9PT0gdGhpcy5sZW5ndGggPyBTKHRoaXMucHJvbWlzZSwgdGhpcy5fcmVzdWx0KSA6ICh0aGlzLmxlbmd0aCA9IHRoaXMubGVuZ3RoIHx8IDAsIHRoaXMuX2VudW1lcmF0ZSgpLCAwID09PSB0aGlzLl9yZW1haW5pbmcgJiYgUyh0aGlzLnByb21pc2UsIHRoaXMuX3Jlc3VsdCkpKSA6IGoodGhpcy5wcm9taXNlLCBVKCkpO1xuICB9ZnVuY3Rpb24gVSgpIHtcbiAgICByZXR1cm4gbmV3IEVycm9yKFwiQXJyYXkgTWV0aG9kcyBtdXN0IGJlIHByb3ZpZGVkIGFuIEFycmF5XCIpO1xuICB9ZnVuY3Rpb24gVygpIHtcbiAgICB2YXIgdDtpZiAoXCJ1bmRlZmluZWRcIiAhPSB0eXBlb2YgZ2xvYmFsKSB0ID0gZ2xvYmFsO2Vsc2UgaWYgKFwidW5kZWZpbmVkXCIgIT0gdHlwZW9mIHNlbGYpIHQgPSBzZWxmO2Vsc2UgdHJ5IHtcbiAgICAgIHQgPSBGdW5jdGlvbihcInJldHVybiB0aGlzXCIpKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwicG9seWZpbGwgZmFpbGVkIGJlY2F1c2UgZ2xvYmFsIG9iamVjdCBpcyB1bmF2YWlsYWJsZSBpbiB0aGlzIGVudmlyb25tZW50XCIpO1xuICAgIH12YXIgbiA9IHQuUHJvbWlzZTsoIW4gfHwgXCJbb2JqZWN0IFByb21pc2VdXCIgIT09IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChuLnJlc29sdmUoKSkgfHwgbi5jYXN0KSAmJiAodC5Qcm9taXNlID0gcHQpO1xuICB9dmFyIHo7eiA9IEFycmF5LmlzQXJyYXkgPyBBcnJheS5pc0FycmF5IDogZnVuY3Rpb24gKHQpIHtcbiAgICByZXR1cm4gXCJbb2JqZWN0IEFycmF5XVwiID09PSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodCk7XG4gIH07dmFyIEIsXG4gICAgICBHLFxuICAgICAgSCxcbiAgICAgIEkgPSB6LFxuICAgICAgSiA9IDAsXG4gICAgICBRID0gZnVuY3Rpb24gUSh0LCBlKSB7XG4gICAgdHRbSl0gPSB0LCB0dFtKICsgMV0gPSBlLCBKICs9IDIsIDIgPT09IEogJiYgKEcgPyBHKGEpIDogSCgpKTtcbiAgfSxcbiAgICAgIFIgPSBcInVuZGVmaW5lZFwiICE9IHR5cGVvZiB3aW5kb3cgPyB3aW5kb3cgOiB2b2lkIDAsXG4gICAgICBWID0gUiB8fCB7fSxcbiAgICAgIFggPSBWLk11dGF0aW9uT2JzZXJ2ZXIgfHwgVi5XZWJLaXRNdXRhdGlvbk9ic2VydmVyLFxuICAgICAgWiA9IFwidW5kZWZpbmVkXCIgPT0gdHlwZW9mIHNlbGYgJiYgXCJ1bmRlZmluZWRcIiAhPSB0eXBlb2YgcHJvY2VzcyAmJiBcIltvYmplY3QgcHJvY2Vzc11cIiA9PT0gKHt9KS50b1N0cmluZy5jYWxsKHByb2Nlc3MpLFxuICAgICAgJCA9IFwidW5kZWZpbmVkXCIgIT0gdHlwZW9mIFVpbnQ4Q2xhbXBlZEFycmF5ICYmIFwidW5kZWZpbmVkXCIgIT0gdHlwZW9mIGltcG9ydFNjcmlwdHMgJiYgXCJ1bmRlZmluZWRcIiAhPSB0eXBlb2YgTWVzc2FnZUNoYW5uZWwsXG4gICAgICB0dCA9IG5ldyBBcnJheSgxMDAwKTtIID0gWiA/IG8oKSA6IFggPyBzKCkgOiAkID8gdSgpIDogdm9pZCAwID09PSBSICYmIFwiZnVuY3Rpb25cIiA9PSB0eXBlb2YgcmVxdWlyZSA/IGYoKSA6IGMoKTt2YXIgZXQgPSBsLFxuICAgICAgbnQgPSBoLFxuICAgICAgcnQgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoMTYpLFxuICAgICAgb3QgPSB2b2lkIDAsXG4gICAgICBpdCA9IDEsXG4gICAgICBzdCA9IDIsXG4gICAgICB1dCA9IG5ldyBNKCksXG4gICAgICBjdCA9IG5ldyBNKCksXG4gICAgICBhdCA9IDAsXG4gICAgICBmdCA9IFksXG4gICAgICBsdCA9IHEsXG4gICAgICBodCA9IEYsXG4gICAgICBwdCA9IEw7TC5hbGwgPSBmdCwgTC5yYWNlID0gbHQsIEwucmVzb2x2ZSA9IG50LCBMLnJlamVjdCA9IGh0LCBMLl9zZXRTY2hlZHVsZXIgPSBuLCBMLl9zZXRBc2FwID0gciwgTC5fYXNhcCA9IFEsIEwucHJvdG90eXBlID0geyBjb25zdHJ1Y3RvcjogTCwgdGhlbjogZXQsIFwiY2F0Y2hcIjogZnVuY3Rpb24gX2NhdGNoKHQpIHtcbiAgICAgIHJldHVybiB0aGlzLnRoZW4obnVsbCwgdCk7XG4gICAgfSB9O3ZhciBfdCA9IE47Ti5wcm90b3R5cGUuX2VudW1lcmF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBmb3IgKHZhciB0ID0gdGhpcy5sZW5ndGgsIGUgPSB0aGlzLl9pbnB1dCwgbiA9IDA7IHRoaXMuX3N0YXRlID09PSBvdCAmJiB0ID4gbjsgbisrKSB0aGlzLl9lYWNoRW50cnkoZVtuXSwgbik7XG4gIH0sIE4ucHJvdG90eXBlLl9lYWNoRW50cnkgPSBmdW5jdGlvbiAodCwgZSkge1xuICAgIHZhciBuID0gdGhpcy5faW5zdGFuY2VDb25zdHJ1Y3RvcixcbiAgICAgICAgciA9IG4ucmVzb2x2ZTtpZiAociA9PT0gbnQpIHtcbiAgICAgIHZhciBvID0gdih0KTtpZiAobyA9PT0gZXQgJiYgdC5fc3RhdGUgIT09IG90KSB0aGlzLl9zZXR0bGVkQXQodC5fc3RhdGUsIGUsIHQuX3Jlc3VsdCk7ZWxzZSBpZiAoXCJmdW5jdGlvblwiICE9IHR5cGVvZiBvKSB0aGlzLl9yZW1haW5pbmctLSwgdGhpcy5fcmVzdWx0W2VdID0gdDtlbHNlIGlmIChuID09PSBwdCkge1xuICAgICAgICB2YXIgaSA9IG5ldyBuKHApO3coaSwgdCwgbyksIHRoaXMuX3dpbGxTZXR0bGVBdChpLCBlKTtcbiAgICAgIH0gZWxzZSB0aGlzLl93aWxsU2V0dGxlQXQobmV3IG4oZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZSh0KTtcbiAgICAgIH0pLCBlKTtcbiAgICB9IGVsc2UgdGhpcy5fd2lsbFNldHRsZUF0KHIodCksIGUpO1xuICB9LCBOLnByb3RvdHlwZS5fc2V0dGxlZEF0ID0gZnVuY3Rpb24gKHQsIGUsIG4pIHtcbiAgICB2YXIgciA9IHRoaXMucHJvbWlzZTtyLl9zdGF0ZSA9PT0gb3QgJiYgKHRoaXMuX3JlbWFpbmluZy0tLCB0ID09PSBzdCA/IGoociwgbikgOiB0aGlzLl9yZXN1bHRbZV0gPSBuKSwgMCA9PT0gdGhpcy5fcmVtYWluaW5nICYmIFMociwgdGhpcy5fcmVzdWx0KTtcbiAgfSwgTi5wcm90b3R5cGUuX3dpbGxTZXR0bGVBdCA9IGZ1bmN0aW9uICh0LCBlKSB7XG4gICAgdmFyIG4gPSB0aGlzO0UodCwgdm9pZCAwLCBmdW5jdGlvbiAodCkge1xuICAgICAgbi5fc2V0dGxlZEF0KGl0LCBlLCB0KTtcbiAgICB9LCBmdW5jdGlvbiAodCkge1xuICAgICAgbi5fc2V0dGxlZEF0KHN0LCBlLCB0KTtcbiAgICB9KTtcbiAgfTt2YXIgZHQgPSBXLFxuICAgICAgdnQgPSB7IFByb21pc2U6IHB0LCBwb2x5ZmlsbDogZHQgfTtcImZ1bmN0aW9uXCIgPT0gdHlwZW9mIGRlZmluZSAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdnQ7XG4gIH0pIDogXCJ1bmRlZmluZWRcIiAhPSB0eXBlb2YgbW9kdWxlICYmIG1vZHVsZS5leHBvcnRzID8gbW9kdWxlLmV4cG9ydHMgPSB2dCA6IFwidW5kZWZpbmVkXCIgIT0gdHlwZW9mIHRoaXMgJiYgKHRoaXMuRVM2UHJvbWlzZSA9IHZ0KSwgZHQoKTtcbn0pLmNhbGwodW5kZWZpbmVkKTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoJ19wcm9jZXNzJyksdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSlcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0OnV0Zi04O2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYklrTTZMMVZ6WlhKekwxTmhiWFZsYkM5RWIyTjFiV1Z1ZEhNdmIzSmlMV05zYVdWdWRDOXpjbU12YkdsaUwyVnpOaTF3Y205dGFYTmxMbTFwYmk1cWN5SmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaU96czdPenM3T3pzN096dEJRVkZCTEVOQlFVTXNXVUZCVlR0QlFVRkRMR05CUVZrc1EwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTTdRVUZCUXl4WFFVRk5MRlZCUVZVc1NVRkJSU3hQUVVGUExFTkJRVU1zU1VGQlJTeFJRVUZSTEVsQlFVVXNUMEZCVHl4RFFVRkRMRWxCUVVVc1NVRkJTU3hMUVVGSExFTkJRVU1zUTBGQlFUdEhRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJRenRCUVVGRExGZEJRVTBzVlVGQlZTeEpRVUZGTEU5QlFVOHNRMEZCUXl4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETzBGQlFVTXNTMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJRVHRIUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXp0QlFVRkRMRXRCUVVNc1IwRkJReXhEUVVGRExFTkJRVUU3UjBGQlF5eFRRVUZUTEVOQlFVTXNSMEZCUlR0QlFVRkRMRmRCUVU4c1dVRkJWVHRCUVVGRExHRkJRVThzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVFN1MwRkJReXhEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVkQlFVVTdRVUZCUXl4WFFVRlBMRmxCUVZVN1FVRkJReXhQUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVRTdTMEZCUXl4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFZEJRVVU3UVVGQlF5eFJRVUZKTEVOQlFVTXNSMEZCUXl4RFFVRkRPMUZCUVVNc1EwRkJReXhIUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0UlFVRkRMRU5CUVVNc1IwRkJReXhSUVVGUkxFTkJRVU1zWTBGQll5eERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRMRkZCUVU4c1EwRkJReXhEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETEVWQlFVTXNSVUZCUXl4aFFVRmhMRVZCUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eEZRVUZETEZsQlFWVTdRVUZCUXl4UFFVRkRMRU5CUVVNc1NVRkJTU3hIUVVGRExFTkJRVU1zUjBGQlF5eEZRVUZGTEVOQlFVTXNSMEZCUXl4RFFVRkRMRU5CUVVFN1MwRkJReXhEUVVGQkxFTkJRVUU3UjBGQlF5eFRRVUZUTEVOQlFVTXNSMEZCUlR0QlFVRkRMRkZCUVVrc1EwRkJReXhIUVVGRExFbEJRVWtzWTBGQll5eEZRVUZCTEVOQlFVTXNVVUZCVHl4RFFVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRExGTkJRVk1zUjBGQlF5eERRVUZETEVWQlFVTXNXVUZCVlR0QlFVRkRMRTlCUVVNc1EwRkJReXhMUVVGTExFTkJRVU1zVjBGQlZ5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkJPMHRCUVVNc1EwRkJRU3hEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVkQlFVVTdRVUZCUXl4WFFVRlBMRmxCUVZVN1FVRkJReXhuUWtGQlZTeERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRVHRMUVVGRExFTkJRVUU3UjBGQlF5eFRRVUZUTEVOQlFVTXNSMEZCUlR0QlFVRkRMRk5CUVVrc1NVRkJTU3hEUVVGRExFZEJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhKUVVGRkxFTkJRVU1zUlVGQlF6dEJRVUZETEZWQlFVa3NRMEZCUXl4SFFVRkRMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU03VlVGQlF5eERRVUZETEVkQlFVTXNSVUZCUlN4RFFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZETEV0QlFVc3NRMEZCUXl4RlFVRkRMRVZCUVVVc1EwRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVkQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVFN1MwRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZCTzBkQlFVTXNVMEZCVXl4RFFVRkRMRWRCUVVVN1FVRkJReXhSUVVGSE8wRkJRVU1zVlVGQlNTeERRVUZETEVkQlFVTXNUMEZCVHp0VlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTXNVVUZCVHl4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGRExGTkJRVk1zU1VGQlJTeERRVUZETEVOQlFVTXNXVUZCV1N4RlFVRkRMRU5CUVVNc1JVRkJSU3hEUVVGQkxFTkJRVUU3UzBGQlF5eERRVUZCTEU5QlFVMHNRMEZCUXl4RlFVRkRPMEZCUVVNc1lVRkJUeXhEUVVGRExFVkJRVVVzUTBGQlFUdExRVUZETzBkQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF6dEJRVUZETEZGQlFVa3NRMEZCUXl4SFFVRkRMRWxCUVVrN1VVRkJReXhEUVVGRExFZEJRVU1zU1VGQlNTeEpRVUZKTEVOQlFVTXNWMEZCVnl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFdEJRVXNzUTBGQlF5eExRVUZITEVOQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1NVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGRExFMUJRVTBzUTBGQlF5eEpRVUZITEVOQlFVTXNSVUZCUXp0QlFVRkRMRlZCUVVrc1EwRkJReXhIUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExGbEJRVlU3UVVGQlF5eFRRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkJPMDlCUVVNc1EwRkJReXhEUVVGQk8wdEJRVU1zVFVGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVFN1IwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTTdRVUZCUXl4UlFVRkpMRU5CUVVNc1IwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlJ5eERRVUZETEVsQlFVVXNVVUZCVVN4SlFVRkZMRTlCUVU4c1EwRkJReXhKUVVGRkxFTkJRVU1zUTBGQlF5eFhRVUZYTEV0QlFVY3NRMEZCUXp0QlFVRkRMR0ZCUVU4c1EwRkJReXhEUVVGRE8wdEJRVUVzU1VGQlNTeERRVUZETEVkQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zVVVGQlR5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUTBGQlFTeERRVUZCTzBkQlFVTXNVMEZCVXl4RFFVRkRMRWRCUVVVc1JVRkJSU3hUUVVGVExFTkJRVU1zUjBGQlJUdEJRVUZETEZkQlFVOHNTVUZCU1N4VFFVRlRMRU5CUVVNc01FTkJRVEJETEVOQlFVTXNRMEZCUVR0SFFVRkRMRk5CUVZNc1EwRkJReXhIUVVGRk8wRkJRVU1zVjBGQlR5eEpRVUZKTEZOQlFWTXNRMEZCUXl4elJFRkJjMFFzUTBGQlF5eERRVUZCTzBkQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRE8wRkJRVU1zVVVGQlJ6dEJRVUZETEdGQlFVOHNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJRVHRMUVVGRExFTkJRVUVzVDBGQlRTeERRVUZETEVWQlFVTTdRVUZCUXl4alFVRlBMRVZCUVVVc1EwRkJReXhMUVVGTExFZEJRVU1zUTBGQlF5eEZRVUZETEVWQlFVVXNRMEZCUVN4RFFVRkJPMHRCUVVNN1IwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFVkJRVU03UVVGQlF5eFJRVUZITzBGQlFVTXNUMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkJPMHRCUVVNc1EwRkJRU3hQUVVGTkxFTkJRVU1zUlVGQlF6dEJRVUZETEdGQlFVOHNRMEZCUXl4RFFVRkJPMHRCUVVNN1IwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1JVRkJRenRCUVVGRExFdEJRVU1zUTBGQlF5eFZRVUZUTEVOQlFVTXNSVUZCUXp0QlFVRkRMRlZCUVVrc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF6dFZRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF5eFZRVUZUTEVOQlFVTXNSVUZCUXp0QlFVRkRMRk5CUVVNc1MwRkJSeXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4TFFVRkhMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVOQlFVRXNRVUZCUXl4RFFVRkJPMDlCUVVNc1JVRkJReXhWUVVGVExFTkJRVU1zUlVGQlF6dEJRVUZETEZOQlFVTXNTMEZCUnl4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRU3hCUVVGRExFTkJRVUU3VDBGQlF5eEZRVUZETEZWQlFWVXNTVUZCUlN4RFFVRkRMRU5CUVVNc1RVRkJUU3hKUVVGRkxHdENRVUZyUWl4RFFVRkJMRUZCUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEpRVUZGTEVOQlFVTXNTMEZCUnl4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRU3hCUVVGRExFTkJRVUU3UzBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXp0QlFVRkRMRXRCUVVNc1EwRkJReXhOUVVGTkxFdEJRVWNzUlVGQlJTeEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFOUJRVThzUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRXRCUVVjc1JVRkJSU3hIUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRTlCUVU4c1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNTMEZCU3l4RFFVRkRMRVZCUVVNc1ZVRkJVeXhEUVVGRExFVkJRVU03UVVGQlF5eFBRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1EwRkJReXhEUVVGQk8wdEJRVU1zUlVGQlF5eFZRVUZUTEVOQlFVTXNSVUZCUXp0QlFVRkRMRTlCUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVOQlFVRTdTMEZCUXl4RFFVRkRMRU5CUVVFN1IwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1JVRkJRenRCUVVGRExFdEJRVU1zUTBGQlF5eFhRVUZYTEV0QlFVY3NRMEZCUXl4RFFVRkRMRmRCUVZjc1NVRkJSU3hEUVVGRExFdEJRVWNzUlVGQlJTeEpRVUZGTEZkQlFWY3NRMEZCUXl4UFFVRlBMRXRCUVVjc1JVRkJSU3hIUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVNc1EwRkJReXhMUVVGSExFVkJRVVVzUjBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRVZCUVVVc1EwRkJReXhMUVVGTExFTkJRVU1zUjBGQlF5eExRVUZMTEVOQlFVTXNTMEZCUnl4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRVHRIUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNN1FVRkJReXhMUVVGRExFdEJRVWNzUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRkxFTkJRVU1zUjBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRVHRIUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXp0QlFVRkRMRXRCUVVNc1EwRkJReXhSUVVGUkxFbEJRVVVzUTBGQlF5eERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRMRU5CUVVNc1QwRkJUeXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXp0QlFVRkRMRXRCUVVNc1EwRkJReXhOUVVGTkxFdEJRVWNzUlVGQlJTeExRVUZITEVOQlFVTXNRMEZCUXl4UFFVRlBMRWRCUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUTBGQlF5eE5RVUZOTEVkQlFVTXNSVUZCUlN4RlFVRkRMRU5CUVVNc1MwRkJSeXhEUVVGRExFTkJRVU1zV1VGQldTeERRVUZETEUxQlFVMHNTVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUTBGQlF5eERRVUZCTEVGQlFVTXNRMEZCUVR0SFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVTTdRVUZCUXl4TFFVRkRMRU5CUVVNc1RVRkJUU3hMUVVGSExFVkJRVVVzUzBGQlJ5eERRVUZETEVOQlFVTXNUVUZCVFN4SFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFTkJRVU1zVDBGQlR5eEhRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUTBGQlF5eERRVUZCTEVGQlFVTXNRMEZCUVR0SFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1JVRkJRenRCUVVGRExGRkJRVWtzUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4WlFVRlpPMUZCUVVNc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXl4RFFVRkRMRkZCUVZFc1IwRkJReXhKUVVGSkxFVkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZETEVWQlFVVXNRMEZCUXl4SFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZETEVWQlFVVXNRMEZCUXl4SFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFdEJRVWNzUTBGQlF5eEpRVUZGTEVOQlFVTXNRMEZCUXl4TlFVRk5MRWxCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUVR0SFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF6dEJRVUZETEZGQlFVa3NRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhaUVVGWk8xRkJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRU5CUVVNc1NVRkJSeXhEUVVGRExFdEJRVWNzUTBGQlF5eERRVUZETEUxQlFVMHNSVUZCUXp0QlFVRkRMRmRCUVVrc1NVRkJTU3hEUVVGRExFVkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRU5CUVVNc1QwRkJUeXhGUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhOUVVGTkxFVkJRVU1zUTBGQlF5eEpRVUZGTEVOQlFVTXNSVUZCUXl4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4WlFVRlpMRU5CUVVNc1RVRkJUU3hIUVVGRExFTkJRVU1zUTBGQlFUdExRVUZETzBkQlFVTXNVMEZCVXl4RFFVRkRMRWRCUVVVN1FVRkJReXhSUVVGSkxFTkJRVU1zUzBGQlN5eEhRVUZETEVsQlFVa3NRMEZCUVR0SFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVTTdRVUZCUXl4UlFVRkhPMEZCUVVNc1lVRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVRTdTMEZCUXl4RFFVRkJMRTlCUVUwc1EwRkJReXhGUVVGRE8wRkJRVU1zWTBGQlR5eEZRVUZGTEVOQlFVTXNTMEZCU3l4SFFVRkRMRU5CUVVNc1JVRkJReXhGUVVGRkxFTkJRVUVzUTBGQlFUdExRVUZETzBkQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkRPMEZCUVVNc1VVRkJTU3hEUVVGRE8xRkJRVU1zUTBGQlF6dFJRVUZETEVOQlFVTTdVVUZCUXl4RFFVRkRPMUZCUVVNc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SlFVRkhMRU5CUVVNc1JVRkJRenRCUVVGRExGZEJRVWNzUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eExRVUZITEVWQlFVVXNTVUZCUlN4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4TFFVRkxMRVZCUVVNc1EwRkJReXhIUVVGRExFbEJRVWtzUTBGQlFTeEhRVUZGTEVOQlFVTXNSMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFdEJRVWNzUTBGQlF5eERRVUZCTzBGQlFVTXNaVUZCVHl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eEZRVUZGTEVOQlFVTXNRMEZCUVR0UFFVRkJPMHRCUVVNc1RVRkJTeXhEUVVGRExFZEJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zVFVGQlRTeExRVUZITEVWQlFVVXNTMEZCUnl4RFFVRkRMRWxCUVVVc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVNc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVNc1EwRkJReXhMUVVGSExFVkJRVVVzUjBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1EwRkJReXhIUVVGRExFTkJRVU1zUzBGQlJ5eEZRVUZGTEVsQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlFTeEJRVUZETEVOQlFVRTdSMEZCUXl4VFFVRlRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eEZRVUZETzBGQlFVTXNVVUZCUnp0QlFVRkRMRTlCUVVNc1EwRkJReXhWUVVGVExFTkJRVU1zUlVGQlF6dEJRVUZETEZOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFTkJRVUU3VDBGQlF5eEZRVUZETEZWQlFWTXNRMEZCUXl4RlFVRkRPMEZCUVVNc1UwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUVR0UFFVRkRMRU5CUVVNc1EwRkJRVHRMUVVGRExFTkJRVUVzVDBGQlRTeERRVUZETEVWQlFVTTdRVUZCUXl4UFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUTBGQlF5eERRVUZCTzB0QlFVTTdSMEZCUXl4VFFVRlRMRU5CUVVNc1IwRkJSVHRCUVVGRExGZEJRVThzUlVGQlJTeEZRVUZGTEVOQlFVRTdSMEZCUXl4VFFVRlRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU03UVVGQlF5eExRVUZETEVOQlFVTXNSVUZCUlN4RFFVRkRMRWRCUVVNc1JVRkJSU3hGUVVGRkxFVkJRVU1zUTBGQlF5eERRVUZETEUxQlFVMHNSMEZCUXl4TFFVRkxMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zVDBGQlR5eEhRVUZETEV0QlFVc3NRMEZCUXl4RlFVRkRMRU5CUVVNc1EwRkJReXhaUVVGWkxFZEJRVU1zUlVGQlJTeERRVUZCTzBkQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRE8wRkJRVU1zVjBGQlR5eEpRVUZKTEVWQlFVVXNRMEZCUXl4SlFVRkpMRVZCUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zVDBGQlR5eERRVUZCTzBkQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRE8wRkJRVU1zVVVGQlNTeERRVUZETEVkQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkRMRlZCUVZNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF6dEJRVUZETEZkQlFVa3NTVUZCU1N4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGRExFMUJRVTBzUlVGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVTXNRMEZCUXl4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUTBGQlF5eERRVUZCTzB0QlFVTXNSMEZCUXl4VlFVRlRMRU5CUVVNc1JVRkJReXhEUVVGRExFVkJRVU03UVVGQlF5eFBRVUZETEVOQlFVTXNTVUZCU1N4VFFVRlRMRU5CUVVNc2FVTkJRV2xETEVOQlFVTXNRMEZCUXl4RFFVRkJPMHRCUVVNc1EwRkJReXhEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRPMEZCUVVNc1VVRkJTU3hEUVVGRExFZEJRVU1zU1VGQlNUdFJRVUZETEVOQlFVTXNSMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eFJRVUZQTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZCTEVOQlFVRTdSMEZCUXl4VFFVRlRMRU5CUVVNc1IwRkJSVHRCUVVGRExGVkJRVTBzU1VGQlNTeFRRVUZUTEVOQlFVTXNiMFpCUVc5R0xFTkJRVU1zUTBGQlFUdEhRVUZETEZOQlFWTXNRMEZCUXl4SFFVRkZPMEZCUVVNc1ZVRkJUU3hKUVVGSkxGTkJRVk1zUTBGQlF5eDFTRUZCZFVnc1EwRkJReXhEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRPMEZCUVVNc1VVRkJTU3hEUVVGRExFVkJRVVVzUTBGQlF5eEhRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFZEJRVU1zU1VGQlNTeERRVUZETEUxQlFVMHNSMEZCUXl4TFFVRkxMRU5CUVVNc1JVRkJReXhKUVVGSkxFTkJRVU1zV1VGQldTeEhRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRXRCUVVjc1EwRkJReXhMUVVGSExGVkJRVlVzU1VGQlJTeFBRVUZQTEVOQlFVTXNTVUZCUlN4RFFVRkRMRVZCUVVVc1JVRkJReXhKUVVGSkxGbEJRVmtzUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4SlFVRkpMRVZCUVVNc1EwRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eEZRVUZGTEVOQlFVRXNRVUZCUXl4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXp0QlFVRkRMRkZCUVVrc1EwRkJReXh2UWtGQmIwSXNSMEZCUXl4RFFVRkRMRVZCUVVNc1NVRkJTU3hEUVVGRExFOUJRVThzUjBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEVWQlFVVXNRMEZCUXl4SlFVRkZMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEVWQlFVTXNTMEZCU3l4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRExFTkJRVU1zU1VGQlJTeEpRVUZKTEVOQlFVTXNUVUZCVFN4SFFVRkRMRU5CUVVNc1JVRkJReXhKUVVGSkxFTkJRVU1zVFVGQlRTeEhRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRVZCUVVNc1NVRkJTU3hEUVVGRExGVkJRVlVzUjBGQlF5eERRVUZETEVOQlFVTXNUVUZCVFN4RlFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFZEJRVU1zU1VGQlNTeExRVUZMTEVOQlFVTXNTVUZCU1N4RFFVRkRMRTFCUVUwc1EwRkJReXhGUVVGRExFTkJRVU1zUzBGQlJ5eEpRVUZKTEVOQlFVTXNUVUZCVFN4SFFVRkRMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zVDBGQlR5eEZRVUZETEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1NVRkJSU3hKUVVGSkxFTkJRVU1zVFVGQlRTeEhRVUZETEVsQlFVa3NRMEZCUXl4TlFVRk5MRWxCUVVVc1EwRkJReXhGUVVGRExFbEJRVWtzUTBGQlF5eFZRVUZWTEVWQlFVVXNSVUZCUXl4RFFVRkRMRXRCUVVjc1NVRkJTU3hEUVVGRExGVkJRVlVzU1VGQlJTeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1JVRkJReXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVRXNRVUZCUXl4RFFVRkJMRWRCUVVVc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVWQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1EwRkJRVHRIUVVGRExGTkJRVk1zUTBGQlF5eEhRVUZGTzBGQlFVTXNWMEZCVHl4SlFVRkpMRXRCUVVzc1EwRkJReXg1UTBGQmVVTXNRMEZCUXl4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFZEJRVVU3UVVGQlF5eFJRVUZKTEVOQlFVTXNRMEZCUXl4SlFVRkhMRmRCUVZjc1NVRkJSU3hQUVVGUExFMUJRVTBzUlVGQlF5eERRVUZETEVkQlFVTXNUVUZCVFN4RFFVRkRMRXRCUVVzc1NVRkJSeXhYUVVGWExFbEJRVVVzVDBGQlR5eEpRVUZKTEVWQlFVTXNRMEZCUXl4SFFVRkRMRWxCUVVrc1EwRkJReXhMUVVGTExFbEJRVWM3UVVGQlF5eFBRVUZETEVkQlFVTXNVVUZCVVN4RFFVRkRMR0ZCUVdFc1EwRkJReXhGUVVGRkxFTkJRVUU3UzBGQlF5eERRVUZCTEU5QlFVMHNRMEZCUXl4RlFVRkRPMEZCUVVNc1dVRkJUU3hKUVVGSkxFdEJRVXNzUTBGQlF5d3dSVUZCTUVVc1EwRkJReXhEUVVGQk8wdEJRVU1zU1VGQlNTeERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEpRVUZGTEd0Q1FVRnJRaXhMUVVGSExFMUJRVTBzUTBGQlF5eFRRVUZUTEVOQlFVTXNVVUZCVVN4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zVDBGQlR5eEZRVUZGTEVOQlFVTXNTVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGQkxFdEJRVWtzUTBGQlF5eERRVUZETEU5QlFVOHNSMEZCUXl4RlFVRkZMRU5CUVVFc1FVRkJReXhEUVVGQk8wZEJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkRMRXRCUVVzc1EwRkJReXhQUVVGUExFZEJRVU1zUzBGQlN5eERRVUZETEU5QlFVOHNSMEZCUXl4VlFVRlRMRU5CUVVNc1JVRkJRenRCUVVGRExGZEJRVTBzWjBKQlFXZENMRXRCUVVjc1RVRkJUU3hEUVVGRExGTkJRVk1zUTBGQlF5eFJRVUZSTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGQk8wZEJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTTdUVUZCUXl4RFFVRkRPMDFCUVVNc1EwRkJRenROUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETzAxQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNN1RVRkJReXhEUVVGRExFZEJRVU1zVjBGQlV5eERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkRPMEZCUVVNc1RVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNSVUZCUXl4RlFVRkZMRU5CUVVNc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRWxCUVVVc1EwRkJReXhGUVVGRExFTkJRVU1zUzBGQlJ5eERRVUZETEV0QlFVY3NRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVWQlFVVXNRMEZCUVN4QlFVRkRMRU5CUVVFN1IwRkJRenROUVVGRExFTkJRVU1zUjBGQlF5eFhRVUZYTEVsQlFVVXNUMEZCVHl4TlFVRk5MRWRCUVVNc1RVRkJUU3hIUVVGRExFdEJRVXNzUTBGQlF6dE5RVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRWxCUVVVc1JVRkJSVHROUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVOQlFVTXNaMEpCUVdkQ0xFbEJRVVVzUTBGQlF5eERRVUZETEhOQ1FVRnpRanROUVVGRExFTkJRVU1zUjBGQlF5eFhRVUZYTEVsQlFVVXNUMEZCVHl4SlFVRkpMRWxCUVVVc1YwRkJWeXhKUVVGRkxFOUJRVThzVDBGQlR5eEpRVUZGTEd0Q1FVRnJRaXhMUVVGSExFTkJRVUVzUjBGQlJTeERRVUZETEZGQlFWRXNRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRE8wMUJRVU1zUTBGQlF5eEhRVUZETEZkQlFWY3NTVUZCUlN4UFFVRlBMR2xDUVVGcFFpeEpRVUZGTEZkQlFWY3NTVUZCUlN4UFFVRlBMR0ZCUVdFc1NVRkJSU3hYUVVGWExFbEJRVVVzVDBGQlR5eGpRVUZqTzAxQlFVTXNSVUZCUlN4SFFVRkRMRWxCUVVrc1MwRkJTeXhEUVVGRExFbEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRWRCUVVNc1EwRkJReXhGUVVGRkxFZEJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNSVUZCUlN4SFFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFVkJRVVVzUjBGQlF5eExRVUZMTEVOQlFVTXNTMEZCUnl4RFFVRkRMRWxCUVVVc1ZVRkJWU3hKUVVGRkxFOUJRVThzVDBGQlR5eEhRVUZETEVOQlFVTXNSVUZCUlN4SFFVRkRMRU5CUVVNc1JVRkJSU3hEUVVGRExFbEJRVWtzUlVGQlJTeEhRVUZETEVOQlFVTTdUVUZCUXl4RlFVRkZMRWRCUVVNc1EwRkJRenROUVVGRExFVkJRVVVzUjBGQlF5eEpRVUZKTEVOQlFVTXNUVUZCVFN4RlFVRkZMRU5CUVVNc1VVRkJVU3hEUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETEZOQlFWTXNRMEZCUXl4RlFVRkZMRU5CUVVNN1RVRkJReXhGUVVGRkxFZEJRVU1zUzBGQlN5eERRVUZETzAxQlFVTXNSVUZCUlN4SFFVRkRMRU5CUVVNN1RVRkJReXhGUVVGRkxFZEJRVU1zUTBGQlF6dE5RVUZETEVWQlFVVXNSMEZCUXl4SlFVRkpMRU5CUVVNc1JVRkJRVHROUVVGRExFVkJRVVVzUjBGQlF5eEpRVUZKTEVOQlFVTXNSVUZCUVR0TlFVRkRMRVZCUVVVc1IwRkJReXhEUVVGRE8wMUJRVU1zUlVGQlJTeEhRVUZETEVOQlFVTTdUVUZCUXl4RlFVRkZMRWRCUVVNc1EwRkJRenROUVVGRExFVkJRVVVzUjBGQlF5eERRVUZETzAxQlFVTXNSVUZCUlN4SFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eEhRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRU5CUVVNc1NVRkJTU3hIUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4SFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFTkJRVU1zVFVGQlRTeEhRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRU5CUVVNc1lVRkJZU3hIUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNVVUZCVVN4SFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUzBGQlN5eEhRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1UwRkJVeXhIUVVGRExFVkJRVU1zVjBGQlZ5eEZRVUZETEVOQlFVTXNSVUZCUXl4SlFVRkpMRVZCUVVNc1JVRkJSU3hGUVVGRExFOUJRVThzUlVGQlF5eG5Ra0ZCVXl4RFFVRkRMRVZCUVVNN1FVRkJReXhoUVVGUExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RlFVRkRMRU5CUVVNc1EwRkJReXhEUVVGQk8wdEJRVU1zUlVGQlF5eERRVUZETEVsQlFVa3NSVUZCUlN4SFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zVTBGQlV5eERRVUZETEZWQlFWVXNSMEZCUXl4WlFVRlZPMEZCUVVNc1UwRkJTU3hKUVVGSkxFTkJRVU1zUjBGQlF5eEpRVUZKTEVOQlFVTXNUVUZCVFN4RlFVRkRMRU5CUVVNc1IwRkJReXhKUVVGSkxFTkJRVU1zVFVGQlRTeEZRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRVZCUVVNc1NVRkJTU3hEUVVGRExFMUJRVTBzUzBGQlJ5eEZRVUZGTEVsQlFVVXNRMEZCUXl4SFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFVkJRVVVzUlVGQlF5eEpRVUZKTEVOQlFVTXNWVUZCVlN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUVR0SFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExGTkJRVk1zUTBGQlF5eFZRVUZWTEVkQlFVTXNWVUZCVXl4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRE8wRkJRVU1zVVVGQlNTeERRVUZETEVkQlFVTXNTVUZCU1N4RFFVRkRMRzlDUVVGdlFqdFJRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWNzUTBGQlF5eExRVUZITEVWQlFVVXNSVUZCUXp0QlFVRkRMRlZCUVVrc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SlFVRkhMRU5CUVVNc1MwRkJSeXhGUVVGRkxFbEJRVVVzUTBGQlF5eERRVUZETEUxQlFVMHNTMEZCUnl4RlFVRkZMRVZCUVVNc1NVRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eERRVUZETEVOQlFVTXNUVUZCVFN4RlFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTXNTMEZCU3l4SlFVRkhMRlZCUVZVc1NVRkJSU3hQUVVGUExFTkJRVU1zUlVGQlF5eEpRVUZKTEVOQlFVTXNWVUZCVlN4RlFVRkZMRVZCUVVNc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRU5CUVVNc1MwRkJTeXhKUVVGSExFTkJRVU1zUzBGQlJ5eEZRVUZGTEVWQlFVTTdRVUZCUXl4WlFVRkpMRU5CUVVNc1IwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUVR0UFFVRkRMRTFCUVVzc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4VlFVRlRMRU5CUVVNc1JVRkJRenRCUVVGRExGTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUVR0UFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlFUdExRVUZETEUxQlFVc3NTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVFN1IwRkJReXhGUVVGRExFTkJRVU1zUTBGQlF5eFRRVUZUTEVOQlFVTXNWVUZCVlN4SFFVRkRMRlZCUVZNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVTTdRVUZCUXl4UlFVRkpMRU5CUVVNc1IwRkJReXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRXRCUVVjc1JVRkJSU3hMUVVGSExFbEJRVWtzUTBGQlF5eFZRVUZWTEVWQlFVVXNSVUZCUXl4RFFVRkRMRXRCUVVjc1JVRkJSU3hIUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVNc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRU5CUVVFc1FVRkJReXhGUVVGRExFTkJRVU1zUzBGQlJ5eEpRVUZKTEVOQlFVTXNWVUZCVlN4SlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkJPMGRCUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zVTBGQlV5eERRVUZETEdGQlFXRXNSMEZCUXl4VlFVRlRMRU5CUVVNc1JVRkJReXhEUVVGRExFVkJRVU03UVVGQlF5eFJRVUZKTEVOQlFVTXNSMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eExRVUZMTEVOQlFVTXNSVUZCUXl4VlFVRlRMRU5CUVVNc1JVRkJRenRCUVVGRExFOUJRVU1zUTBGQlF5eFZRVUZWTEVOQlFVTXNSVUZCUlN4RlFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlFUdExRVUZETEVWQlFVTXNWVUZCVXl4RFFVRkRMRVZCUVVNN1FVRkJReXhQUVVGRExFTkJRVU1zVlVGQlZTeERRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFTkJRVUU3UzBGQlF5eERRVUZETEVOQlFVRTdSMEZCUXl4RFFVRkRMRWxCUVVrc1JVRkJSU3hIUVVGRExFTkJRVU03VFVGQlF5eEZRVUZGTEVkQlFVTXNSVUZCUXl4UFFVRlBMRVZCUVVNc1JVRkJSU3hGUVVGRExGRkJRVkVzUlVGQlF5eEZRVUZGTEVWQlFVTXNRMEZCUXl4VlFVRlZMRWxCUVVVc1QwRkJUeXhOUVVGTkxFbEJRVVVzVFVGQlRTeERRVUZETEVkQlFVY3NSMEZCUXl4TlFVRk5MRU5CUVVNc1dVRkJWVHRCUVVGRExGZEJRVThzUlVGQlJTeERRVUZCTzBkQlFVTXNRMEZCUXl4SFFVRkRMRmRCUVZjc1NVRkJSU3hQUVVGUExFMUJRVTBzU1VGQlJTeE5RVUZOTEVOQlFVTXNUMEZCVHl4SFFVRkRMRTFCUVUwc1EwRkJReXhQUVVGUExFZEJRVU1zUlVGQlJTeEhRVUZETEZkQlFWY3NTVUZCUlN4UFFVRlBMRWxCUVVrc1MwRkJSeXhKUVVGSkxFTkJRVU1zVlVGQlZTeEhRVUZETEVWQlFVVXNRMEZCUVN4QlFVRkRMRVZCUVVNc1JVRkJSU3hGUVVGRkxFTkJRVUU3UTBGQlF5eERRVUZCTEVOQlFVVXNTVUZCU1N4WFFVRk5MRU5CUVVNaUxDSm1hV3hsSWpvaVoyVnVaWEpoZEdWa0xtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTkRiMjUwWlc1MElqcGJJaThxSVZ4eVhHNGdLaUJBYjNabGNuWnBaWGNnWlhNMkxYQnliMjFwYzJVZ0xTQmhJSFJwYm5rZ2FXMXdiR1Z0Wlc1MFlYUnBiMjRnYjJZZ1VISnZiV2x6WlhNdlFTc3VYSEpjYmlBcUlFQmpiM0I1Y21sbmFIUWdRMjl3ZVhKcFoyaDBJQ2hqS1NBeU1ERTBJRmxsYUhWa1lTQkxZWFI2TENCVWIyMGdSR0ZzWlN3Z1UzUmxabUZ1SUZCbGJtNWxjaUJoYm1RZ1kyOXVkSEpwWW5WMGIzSnpJQ2hEYjI1MlpYSnphVzl1SUhSdklFVlROaUJCVUVrZ1lua2dTbUZyWlNCQmNtTm9hV0poYkdRcFhISmNiaUFxSUVCc2FXTmxibk5sSUNBZ1RHbGpaVzV6WldRZ2RXNWtaWElnVFVsVUlHeHBZMlZ1YzJWY2NseHVJQ29nSUNBZ0lDQWdJQ0FnSUNCVFpXVWdhSFIwY0hNNkx5OXlZWGN1WjJsMGFIVmlkWE5sY21OdmJuUmxiblF1WTI5dEwycGhhMlZoY21Ob2FXSmhiR1F2WlhNMkxYQnliMjFwYzJVdmJXRnpkR1Z5TDB4SlEwVk9VMFZjY2x4dUlDb2dRSFpsY25OcGIyNGdJQ0F6TGpJdU1WeHlYRzRnS2k5Y2NseHVYSEpjYmlobWRXNWpkR2x2YmlncGUxd2lkWE5sSUhOMGNtbGpkRndpTzJaMWJtTjBhVzl1SUhRb2RDbDdjbVYwZFhKdVhDSm1kVzVqZEdsdmJsd2lQVDEwZVhCbGIyWWdkSHg4WENKdlltcGxZM1JjSWowOWRIbHdaVzltSUhRbUptNTFiR3doUFQxMGZXWjFibU4wYVc5dUlHVW9kQ2w3Y21WMGRYSnVYQ0ptZFc1amRHbHZibHdpUFQxMGVYQmxiMllnZEgxbWRXNWpkR2x2YmlCdUtIUXBlMGM5ZEgxbWRXNWpkR2x2YmlCeUtIUXBlMUU5ZEgxbWRXNWpkR2x2YmlCdktDbDdjbVYwZFhKdUlHWjFibU4wYVc5dUtDbDdjSEp2WTJWemN5NXVaWGgwVkdsamF5aGhLWDE5Wm5WdVkzUnBiMjRnYVNncGUzSmxkSFZ5YmlCbWRXNWpkR2x2YmlncGUwSW9ZU2w5ZldaMWJtTjBhVzl1SUhNb0tYdDJZWElnZEQwd0xHVTlibVYzSUZnb1lTa3NiajFrYjJOMWJXVnVkQzVqY21WaGRHVlVaWGgwVG05a1pTaGNJbHdpS1R0eVpYUjFjbTRnWlM1dlluTmxjblpsS0c0c2UyTm9ZWEpoWTNSbGNrUmhkR0U2SVRCOUtTeG1kVzVqZEdsdmJpZ3BlMjR1WkdGMFlUMTBQU3NyZENVeWZYMW1kVzVqZEdsdmJpQjFLQ2w3ZG1GeUlIUTlibVYzSUUxbGMzTmhaMlZEYUdGdWJtVnNPM0psZEhWeWJpQjBMbkJ2Y25ReExtOXViV1Z6YzJGblpUMWhMR1oxYm1OMGFXOXVLQ2w3ZEM1d2IzSjBNaTV3YjNOMFRXVnpjMkZuWlNnd0tYMTlablZ1WTNScGIyNGdZeWdwZTNKbGRIVnliaUJtZFc1amRHbHZiaWdwZTNObGRGUnBiV1Z2ZFhRb1lTd3hLWDE5Wm5WdVkzUnBiMjRnWVNncGUyWnZjaWgyWVhJZ2REMHdPMG8rZER0MEt6MHlLWHQyWVhJZ1pUMTBkRnQwWFN4dVBYUjBXM1FyTVYwN1pTaHVLU3gwZEZ0MFhUMTJiMmxrSURBc2RIUmJkQ3N4WFQxMmIybGtJREI5U2owd2ZXWjFibU4wYVc5dUlHWW9LWHQwY25sN2RtRnlJSFE5Y21WeGRXbHlaU3hsUFhRb1hDSjJaWEowZUZ3aUtUdHlaWFIxY200Z1FqMWxMbkoxYms5dVRHOXZjSHg4WlM1eWRXNVBia052Ym5SbGVIUXNhU2dwZldOaGRHTm9LRzRwZTNKbGRIVnliaUJqS0NsOWZXWjFibU4wYVc5dUlHd29kQ3hsS1h0MllYSWdiajEwYUdsekxISTlibVYzSUhSb2FYTXVZMjl1YzNSeWRXTjBiM0lvY0NrN2RtOXBaQ0F3UFQwOWNsdHlkRjBtSm1zb2NpazdkbUZ5SUc4OWJpNWZjM1JoZEdVN2FXWW9ieWw3ZG1GeUlHazlZWEpuZFcxbGJuUnpXMjh0TVYwN1VTaG1kVzVqZEdsdmJpZ3BlM2dvYnl4eUxHa3NiaTVmY21WemRXeDBLWDBwZldWc2MyVWdSU2h1TEhJc2RDeGxLVHR5WlhSMWNtNGdjbjFtZFc1amRHbHZiaUJvS0hRcGUzWmhjaUJsUFhSb2FYTTdhV1lvZENZbVhDSnZZbXBsWTNSY0lqMDlkSGx3Wlc5bUlIUW1KblF1WTI5dWMzUnlkV04wYjNJOVBUMWxLWEpsZEhWeWJpQjBPM1poY2lCdVBXNWxkeUJsS0hBcE8zSmxkSFZ5YmlCbktHNHNkQ2tzYm4xbWRXNWpkR2x2YmlCd0tDbDdmV1oxYm1OMGFXOXVJRjhvS1h0eVpYUjFjbTRnYm1WM0lGUjVjR1ZGY25KdmNpaGNJbGx2ZFNCallXNXViM1FnY21WemIyeDJaU0JoSUhCeWIyMXBjMlVnZDJsMGFDQnBkSE5sYkdaY0lpbDlablZ1WTNScGIyNGdaQ2dwZTNKbGRIVnliaUJ1WlhjZ1ZIbHdaVVZ5Y205eUtGd2lRU0J3Y205dGFYTmxjeUJqWVd4c1ltRmpheUJqWVc1dWIzUWdjbVYwZFhKdUlIUm9ZWFFnYzJGdFpTQndjbTl0YVhObExsd2lLWDFtZFc1amRHbHZiaUIyS0hRcGUzUnllWHR5WlhSMWNtNGdkQzUwYUdWdWZXTmhkR05vS0dVcGUzSmxkSFZ5YmlCMWRDNWxjbkp2Y2oxbExIVjBmWDFtZFc1amRHbHZiaUI1S0hRc1pTeHVMSElwZTNSeWVYdDBMbU5oYkd3b1pTeHVMSElwZldOaGRHTm9LRzhwZTNKbGRIVnliaUJ2ZlgxbWRXNWpkR2x2YmlCdEtIUXNaU3h1S1h0UktHWjFibU4wYVc5dUtIUXBlM1poY2lCeVBTRXhMRzg5ZVNodUxHVXNablZ1WTNScGIyNG9iaWw3Y254OEtISTlJVEFzWlNFOVBXNC9aeWgwTEc0cE9sTW9kQ3h1S1NsOUxHWjFibU4wYVc5dUtHVXBlM0o4ZkNoeVBTRXdMR29vZEN4bEtTbDlMRndpVTJWMGRHeGxPaUJjSWlzb2RDNWZiR0ZpWld4OGZGd2lJSFZ1YTI1dmQyNGdjSEp2YldselpWd2lLU2s3SVhJbUptOG1KaWh5UFNFd0xHb29kQ3h2S1NsOUxIUXBmV1oxYm1OMGFXOXVJR0lvZEN4bEtYdGxMbDl6ZEdGMFpUMDlQV2wwUDFNb2RDeGxMbDl5WlhOMWJIUXBPbVV1WDNOMFlYUmxQVDA5YzNRL2FpaDBMR1V1WDNKbGMzVnNkQ2s2UlNobExIWnZhV1FnTUN4bWRXNWpkR2x2YmlobEtYdG5LSFFzWlNsOUxHWjFibU4wYVc5dUtHVXBlMm9vZEN4bEtYMHBmV1oxYm1OMGFXOXVJSGNvZEN4dUxISXBlMjR1WTI5dWMzUnlkV04wYjNJOVBUMTBMbU52Ym5OMGNuVmpkRzl5SmlaeVBUMDlaWFFtSm1OdmJuTjBjblZqZEc5eUxuSmxjMjlzZG1VOVBUMXVkRDlpS0hRc2JpazZjajA5UFhWMFAyb29kQ3gxZEM1bGNuSnZjaWs2ZG05cFpDQXdQVDA5Y2o5VEtIUXNiaWs2WlNoeUtUOXRLSFFzYml4eUtUcFRLSFFzYmlsOVpuVnVZM1JwYjI0Z1p5aGxMRzRwZTJVOVBUMXVQMm9vWlN4ZktDa3BPblFvYmlrL2R5aGxMRzRzZGlodUtTazZVeWhsTEc0cGZXWjFibU4wYVc5dUlFRW9kQ2w3ZEM1ZmIyNWxjbkp2Y2lZbWRDNWZiMjVsY25KdmNpaDBMbDl5WlhOMWJIUXBMRlFvZENsOVpuVnVZM1JwYjI0Z1V5aDBMR1VwZTNRdVgzTjBZWFJsUFQwOWIzUW1KaWgwTGw5eVpYTjFiSFE5WlN4MExsOXpkR0YwWlQxcGRDd3dJVDA5ZEM1ZmMzVmljMk55YVdKbGNuTXViR1Z1WjNSb0ppWlJLRlFzZENrcGZXWjFibU4wYVc5dUlHb29kQ3hsS1h0MExsOXpkR0YwWlQwOVBXOTBKaVlvZEM1ZmMzUmhkR1U5YzNRc2RDNWZjbVZ6ZFd4MFBXVXNVU2hCTEhRcEtYMW1kVzVqZEdsdmJpQkZLSFFzWlN4dUxISXBlM1poY2lCdlBYUXVYM04xWW5OamNtbGlaWEp6TEdrOWJ5NXNaVzVuZEdnN2RDNWZiMjVsY25KdmNqMXVkV3hzTEc5YmFWMDlaU3h2VzJrcmFYUmRQVzRzYjF0cEszTjBYVDF5TERBOVBUMXBKaVowTGw5emRHRjBaU1ltVVNoVUxIUXBmV1oxYm1OMGFXOXVJRlFvZENsN2RtRnlJR1U5ZEM1ZmMzVmljMk55YVdKbGNuTXNiajEwTGw5emRHRjBaVHRwWmlnd0lUMDlaUzVzWlc1bmRHZ3BlMlp2Y2loMllYSWdjaXh2TEdrOWRDNWZjbVZ6ZFd4MExITTlNRHR6UEdVdWJHVnVaM1JvTzNNclBUTXBjajFsVzNOZExHODlaVnR6SzI1ZExISS9lQ2h1TEhJc2J5eHBLVHB2S0drcE8zUXVYM04xWW5OamNtbGlaWEp6TG14bGJtZDBhRDB3ZlgxbWRXNWpkR2x2YmlCTktDbDdkR2hwY3k1bGNuSnZjajF1ZFd4c2ZXWjFibU4wYVc5dUlGQW9kQ3hsS1h0MGNubDdjbVYwZFhKdUlIUW9aU2w5WTJGMFkyZ29iaWw3Y21WMGRYSnVJR04wTG1WeWNtOXlQVzRzWTNSOWZXWjFibU4wYVc5dUlIZ29kQ3h1TEhJc2J5bDdkbUZ5SUdrc2N5eDFMR01zWVQxbEtISXBPMmxtS0dFcGUybG1LR2s5VUNoeUxHOHBMR2s5UFQxamREOG9ZejBoTUN4elBXa3VaWEp5YjNJc2FUMXVkV3hzS1RwMVBTRXdMRzQ5UFQxcEtYSmxkSFZ5YmlCMmIybGtJR29vYml4a0tDa3BmV1ZzYzJVZ2FUMXZMSFU5SVRBN2JpNWZjM1JoZEdVaFBUMXZkSHg4S0dFbUpuVS9aeWh1TEdrcE9tTS9haWh1TEhNcE9uUTlQVDFwZEQ5VEtHNHNhU2s2ZEQwOVBYTjBKaVpxS0c0c2FTa3BmV1oxYm1OMGFXOXVJRU1vZEN4bEtYdDBjbmw3WlNobWRXNWpkR2x2YmlobEtYdG5LSFFzWlNsOUxHWjFibU4wYVc5dUtHVXBlMm9vZEN4bEtYMHBmV05oZEdOb0tHNHBlMm9vZEN4dUtYMTlablZ1WTNScGIyNGdUeWdwZTNKbGRIVnliaUJoZENzcmZXWjFibU4wYVc5dUlHc29kQ2w3ZEZ0eWRGMDlZWFFyS3l4MExsOXpkR0YwWlQxMmIybGtJREFzZEM1ZmNtVnpkV3gwUFhadmFXUWdNQ3gwTGw5emRXSnpZM0pwWW1WeWN6MWJYWDFtZFc1amRHbHZiaUJaS0hRcGUzSmxkSFZ5YmlCdVpYY2dYM1FvZEdocGN5eDBLUzV3Y205dGFYTmxmV1oxYm1OMGFXOXVJSEVvZENsN2RtRnlJR1U5ZEdocGN6dHlaWFIxY200Z2JtVjNJR1VvU1NoMEtUOW1kVzVqZEdsdmJpaHVMSElwZTJadmNpaDJZWElnYnoxMExteGxibWQwYUN4cFBUQTdiejVwTzJrckt5bGxMbkpsYzI5c2RtVW9kRnRwWFNrdWRHaGxiaWh1TEhJcGZUcG1kVzVqZEdsdmJpaDBMR1VwZTJVb2JtVjNJRlI1Y0dWRmNuSnZjaWhjSWxsdmRTQnRkWE4wSUhCaGMzTWdZVzRnWVhKeVlYa2dkRzhnY21GalpTNWNJaWtwZlNsOVpuVnVZM1JwYjI0Z1JpaDBLWHQyWVhJZ1pUMTBhR2x6TEc0OWJtVjNJR1VvY0NrN2NtVjBkWEp1SUdvb2JpeDBLU3h1ZldaMWJtTjBhVzl1SUVRb0tYdDBhSEp2ZHlCdVpYY2dWSGx3WlVWeWNtOXlLRndpV1c5MUlHMTFjM1FnY0dGemN5QmhJSEpsYzI5c2RtVnlJR1oxYm1OMGFXOXVJR0Z6SUhSb1pTQm1hWEp6ZENCaGNtZDFiV1Z1ZENCMGJ5QjBhR1VnY0hKdmJXbHpaU0JqYjI1emRISjFZM1J2Y2x3aUtYMW1kVzVqZEdsdmJpQkxLQ2w3ZEdoeWIzY2dibVYzSUZSNWNHVkZjbkp2Y2loY0lrWmhhV3hsWkNCMGJ5QmpiMjV6ZEhKMVkzUWdKMUJ5YjIxcGMyVW5PaUJRYkdWaGMyVWdkWE5sSUhSb1pTQW5ibVYzSnlCdmNHVnlZWFJ2Y2l3Z2RHaHBjeUJ2WW1wbFkzUWdZMjl1YzNSeWRXTjBiM0lnWTJGdWJtOTBJR0psSUdOaGJHeGxaQ0JoY3lCaElHWjFibU4wYVc5dUxsd2lLWDFtZFc1amRHbHZiaUJNS0hRcGUzUm9hWE5iY25SZFBVOG9LU3gwYUdsekxsOXlaWE4xYkhROWRHaHBjeTVmYzNSaGRHVTlkbTlwWkNBd0xIUm9hWE11WDNOMVluTmpjbWxpWlhKelBWdGRMSEFoUFQxMEppWW9YQ0ptZFc1amRHbHZibHdpSVQxMGVYQmxiMllnZENZbVJDZ3BMSFJvYVhNZ2FXNXpkR0Z1WTJWdlppQk1QME1vZEdocGN5eDBLVHBMS0NrcGZXWjFibU4wYVc5dUlFNG9kQ3hsS1h0MGFHbHpMbDlwYm5OMFlXNWpaVU52Ym5OMGNuVmpkRzl5UFhRc2RHaHBjeTV3Y205dGFYTmxQVzVsZHlCMEtIQXBMSFJvYVhNdWNISnZiV2x6WlZ0eWRGMThmR3NvZEdocGN5NXdjbTl0YVhObEtTeEJjbkpoZVM1cGMwRnljbUY1S0dVcFB5aDBhR2x6TGw5cGJuQjFkRDFsTEhSb2FYTXViR1Z1WjNSb1BXVXViR1Z1WjNSb0xIUm9hWE11WDNKbGJXRnBibWx1WnoxbExteGxibWQwYUN4MGFHbHpMbDl5WlhOMWJIUTlibVYzSUVGeWNtRjVLSFJvYVhNdWJHVnVaM1JvS1N3d1BUMDlkR2hwY3k1c1pXNW5kR2cvVXloMGFHbHpMbkJ5YjIxcGMyVXNkR2hwY3k1ZmNtVnpkV3gwS1Rvb2RHaHBjeTVzWlc1bmRHZzlkR2hwY3k1c1pXNW5kR2g4ZkRBc2RHaHBjeTVmWlc1MWJXVnlZWFJsS0Nrc01EMDlQWFJvYVhNdVgzSmxiV0ZwYm1sdVp5WW1VeWgwYUdsekxuQnliMjFwYzJVc2RHaHBjeTVmY21WemRXeDBLU2twT21vb2RHaHBjeTV3Y205dGFYTmxMRlVvS1NsOVpuVnVZM1JwYjI0Z1ZTZ3BlM0psZEhWeWJpQnVaWGNnUlhKeWIzSW9YQ0pCY25KaGVTQk5aWFJvYjJSeklHMTFjM1FnWW1VZ2NISnZkbWxrWldRZ1lXNGdRWEp5WVhsY0lpbDlablZ1WTNScGIyNGdWeWdwZTNaaGNpQjBPMmxtS0Z3aWRXNWtaV1pwYm1Wa1hDSWhQWFI1Y0dWdlppQm5iRzlpWVd3cGREMW5iRzlpWVd3N1pXeHpaU0JwWmloY0luVnVaR1ZtYVc1bFpGd2lJVDEwZVhCbGIyWWdjMlZzWmlsMFBYTmxiR1k3Wld4elpTQjBjbmw3ZEQxR2RXNWpkR2x2YmloY0luSmxkSFZ5YmlCMGFHbHpYQ0lwS0NsOVkyRjBZMmdvWlNsN2RHaHliM2NnYm1WM0lFVnljbTl5S0Z3aWNHOXNlV1pwYkd3Z1ptRnBiR1ZrSUdKbFkyRjFjMlVnWjJ4dlltRnNJRzlpYW1WamRDQnBjeUIxYm1GMllXbHNZV0pzWlNCcGJpQjBhR2x6SUdWdWRtbHliMjV0Wlc1MFhDSXBmWFpoY2lCdVBYUXVVSEp2YldselpUc29JVzU4ZkZ3aVcyOWlhbVZqZENCUWNtOXRhWE5sWFZ3aUlUMDlUMkpxWldOMExuQnliM1J2ZEhsd1pTNTBiMU4wY21sdVp5NWpZV3hzS0c0dWNtVnpiMngyWlNncEtYeDhiaTVqWVhOMEtTWW1LSFF1VUhKdmJXbHpaVDF3ZENsOWRtRnlJSG83ZWoxQmNuSmhlUzVwYzBGeWNtRjVQMEZ5Y21GNUxtbHpRWEp5WVhrNlpuVnVZM1JwYjI0b2RDbDdjbVYwZFhKdVhDSmJiMkpxWldOMElFRnljbUY1WFZ3aVBUMDlUMkpxWldOMExuQnliM1J2ZEhsd1pTNTBiMU4wY21sdVp5NWpZV3hzS0hRcGZUdDJZWElnUWl4SExFZ3NTVDE2TEVvOU1DeFJQV1oxYm1OMGFXOXVLSFFzWlNsN2RIUmJTbDA5ZEN4MGRGdEtLekZkUFdVc1NpczlNaXd5UFQwOVNpWW1LRWMvUnloaEtUcElLQ2twZlN4U1BWd2lkVzVrWldacGJtVmtYQ0loUFhSNWNHVnZaaUIzYVc1a2IzYy9kMmx1Wkc5M09uWnZhV1FnTUN4V1BWSjhmSHQ5TEZnOVZpNU5kWFJoZEdsdmJrOWljMlZ5ZG1WeWZIeFdMbGRsWWt0cGRFMTFkR0YwYVc5dVQySnpaWEoyWlhJc1dqMWNJblZ1WkdWbWFXNWxaRndpUFQxMGVYQmxiMllnYzJWc1ppWW1YQ0oxYm1SbFptbHVaV1JjSWlFOWRIbHdaVzltSUhCeWIyTmxjM01tSmx3aVcyOWlhbVZqZENCd2NtOWpaWE56WFZ3aVBUMDllMzB1ZEc5VGRISnBibWN1WTJGc2JDaHdjbTlqWlhOektTd2tQVndpZFc1a1pXWnBibVZrWENJaFBYUjVjR1Z2WmlCVmFXNTBPRU5zWVcxd1pXUkJjbkpoZVNZbVhDSjFibVJsWm1sdVpXUmNJaUU5ZEhsd1pXOW1JR2x0Y0c5eWRGTmpjbWx3ZEhNbUpsd2lkVzVrWldacGJtVmtYQ0loUFhSNWNHVnZaaUJOWlhOellXZGxRMmhoYm01bGJDeDBkRDF1WlhjZ1FYSnlZWGtvTVdVektUdElQVm8vYnlncE9sZy9jeWdwT2lRL2RTZ3BPblp2YVdRZ01EMDlQVkltSmx3aVpuVnVZM1JwYjI1Y0lqMDlkSGx3Wlc5bUlISmxjWFZwY21VL1ppZ3BPbU1vS1R0MllYSWdaWFE5YkN4dWREMW9MSEowUFUxaGRHZ3VjbUZ1Wkc5dEtDa3VkRzlUZEhKcGJtY29NellwTG5OMVluTjBjbWx1WnlneE5pa3NiM1E5ZG05cFpDQXdMR2wwUFRFc2MzUTlNaXgxZEQxdVpYY2dUU3hqZEQxdVpYY2dUU3hoZEQwd0xHWjBQVmtzYkhROWNTeG9kRDFHTEhCMFBVdzdUQzVoYkd3OVpuUXNUQzV5WVdObFBXeDBMRXd1Y21WemIyeDJaVDF1ZEN4TUxuSmxhbVZqZEQxb2RDeE1MbDl6WlhSVFkyaGxaSFZzWlhJOWJpeE1MbDl6WlhSQmMyRndQWElzVEM1ZllYTmhjRDFSTEV3dWNISnZkRzkwZVhCbFBYdGpiMjV6ZEhKMVkzUnZjanBNTEhSb1pXNDZaWFFzWENKallYUmphRndpT21aMWJtTjBhVzl1S0hRcGUzSmxkSFZ5YmlCMGFHbHpMblJvWlc0b2JuVnNiQ3gwS1gxOU8zWmhjaUJmZEQxT08wNHVjSEp2ZEc5MGVYQmxMbDlsYm5WdFpYSmhkR1U5Wm5WdVkzUnBiMjRvS1h0bWIzSW9kbUZ5SUhROWRHaHBjeTVzWlc1bmRHZ3NaVDEwYUdsekxsOXBibkIxZEN4dVBUQTdkR2hwY3k1ZmMzUmhkR1U5UFQxdmRDWW1kRDV1TzI0ckt5bDBhR2x6TGw5bFlXTm9SVzUwY25rb1pWdHVYU3h1S1gwc1RpNXdjbTkwYjNSNWNHVXVYMlZoWTJoRmJuUnllVDFtZFc1amRHbHZiaWgwTEdVcGUzWmhjaUJ1UFhSb2FYTXVYMmx1YzNSaGJtTmxRMjl1YzNSeWRXTjBiM0lzY2oxdUxuSmxjMjlzZG1VN2FXWW9jajA5UFc1MEtYdDJZWElnYnoxMktIUXBPMmxtS0c4OVBUMWxkQ1ltZEM1ZmMzUmhkR1VoUFQxdmRDbDBhR2x6TGw5elpYUjBiR1ZrUVhRb2RDNWZjM1JoZEdVc1pTeDBMbDl5WlhOMWJIUXBPMlZzYzJVZ2FXWW9YQ0ptZFc1amRHbHZibHdpSVQxMGVYQmxiMllnYnlsMGFHbHpMbDl5WlcxaGFXNXBibWN0TFN4MGFHbHpMbDl5WlhOMWJIUmJaVjA5ZER0bGJITmxJR2xtS0c0OVBUMXdkQ2w3ZG1GeUlHazlibVYzSUc0b2NDazdkeWhwTEhRc2J5a3NkR2hwY3k1ZmQybHNiRk5sZEhSc1pVRjBLR2tzWlNsOVpXeHpaU0IwYUdsekxsOTNhV3hzVTJWMGRHeGxRWFFvYm1WM0lHNG9ablZ1WTNScGIyNG9aU2w3WlNoMEtYMHBMR1VwZldWc2MyVWdkR2hwY3k1ZmQybHNiRk5sZEhSc1pVRjBLSElvZENrc1pTbDlMRTR1Y0hKdmRHOTBlWEJsTGw5elpYUjBiR1ZrUVhROVpuVnVZM1JwYjI0b2RDeGxMRzRwZTNaaGNpQnlQWFJvYVhNdWNISnZiV2x6WlR0eUxsOXpkR0YwWlQwOVBXOTBKaVlvZEdocGN5NWZjbVZ0WVdsdWFXNW5MUzBzZEQwOVBYTjBQMm9vY2l4dUtUcDBhR2x6TGw5eVpYTjFiSFJiWlYwOWJpa3NNRDA5UFhSb2FYTXVYM0psYldGcGJtbHVaeVltVXloeUxIUm9hWE11WDNKbGMzVnNkQ2w5TEU0dWNISnZkRzkwZVhCbExsOTNhV3hzVTJWMGRHeGxRWFE5Wm5WdVkzUnBiMjRvZEN4bEtYdDJZWElnYmoxMGFHbHpPMFVvZEN4MmIybGtJREFzWm5WdVkzUnBiMjRvZENsN2JpNWZjMlYwZEd4bFpFRjBLR2wwTEdVc2RDbDlMR1oxYm1OMGFXOXVLSFFwZTI0dVgzTmxkSFJzWldSQmRDaHpkQ3hsTEhRcGZTbDlPM1poY2lCa2REMVhMSFowUFh0UWNtOXRhWE5sT25CMExIQnZiSGxtYVd4c09tUjBmVHRjSW1aMWJtTjBhVzl1WENJOVBYUjVjR1Z2WmlCa1pXWnBibVVtSm1SbFptbHVaUzVoYldRL1pHVm1hVzVsS0daMWJtTjBhVzl1S0NsN2NtVjBkWEp1SUhaMGZTazZYQ0oxYm1SbFptbHVaV1JjSWlFOWRIbHdaVzltSUcxdlpIVnNaU1ltYlc5a2RXeGxMbVY0Y0c5eWRITS9iVzlrZFd4bExtVjRjRzl5ZEhNOWRuUTZYQ0oxYm1SbFptbHVaV1JjSWlFOWRIbHdaVzltSUhSb2FYTW1KaWgwYUdsekxrVlRObEJ5YjIxcGMyVTlkblFwTEdSMEtDbDlLUzVqWVd4c0tIUm9hWE1wT3lKZGZRPT0iLCJpbXBvcnQgJy4uL2xpYi9lczYtcHJvbWlzZS5taW4uanMnXHJcbmltcG9ydCBUZW1wbGF0ZXMgZnJvbSBcIi4uL1RlbXBsYXRlc1wiXHJcbmltcG9ydCB7IGdldEpTT04sIHJvdW5kIH0gZnJvbSBcIi4uL2hlbHBlcnNcIlxyXG5pbXBvcnQgQVBJLCB7IGdldFRlYW1zLCBnZXRUZWFtU3RhdHMgfSBmcm9tIFwiLi4vQVBJXCJcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBldmVudChrZXkpIHtcclxuICBQcm9taXNlLmFsbChbXHJcbiAgICBUZW1wbGF0ZXMuZ2V0KFwiZXZlbnRcIiksXHJcbiAgICBnZXRKU09OKFwic3RhdHMtY29uZmlnLmpzb25cIilcclxuICBdKS50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgY29uc3QgW3RlbXBsYXRlLCBzdGF0c10gPSByZXM7XHJcbiAgICBjb25zdCAkY29udGFpbmVyID0gJChcIiNtYWluXCIpLmNsb3Nlc3QoXCIuY29udGFpbmVyXCIpO1xyXG4gICAgY29uc3QgY29udGFpbmVyQ2xhc3MgPSAkY29udGFpbmVyLmF0dHIoXCJjbGFzc1wiKTtcclxuICAgICRjb250YWluZXIuYWRkQ2xhc3MoXCJ3aWRlXCIpO1xyXG4gICAgY29uc3QgcmFjdGl2ZSA9IG5ldyBSYWN0aXZlKHtcclxuICAgICAgdGVtcGxhdGU6IHRlbXBsYXRlLFxyXG4gICAgICBkYXRhOiB7XHJcbiAgICAgICAga2V5OiBrZXksXHJcbiAgICAgICAgc3RhdENvbmZpZzogc3RhdHMsXHJcbiAgICAgICAgbG9hZGluZzogdHJ1ZSxcclxuICAgICAgICB0ZWFtczogW10sXHJcbiAgICAgICAgcm91bmQ6IHJvdW5kLFxyXG4gICAgICAgIHN0YXRDb2xvcih2YWx1ZSwgc3RhdCkge1xyXG4gICAgICAgICAgY29uc3QgdmFsdWUgPSBwYXJzZUZsb2F0KHZhbHVlKTtcclxuICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBzdGF0LnByb2dyZXNzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmICgoIXN0YXQucHJvZ3Jlc3NbaV0ubWluIHx8IHZhbHVlID49IHN0YXQucHJvZ3Jlc3NbaV0ubWluKSAmJiAoIXN0YXQucHJvZ3Jlc3NbaV0ubWF4IHx8IHZhbHVlIDw9IHN0YXQucHJvZ3Jlc3NbaV0ubWF4KSkge1xyXG4gICAgICAgICAgICAgIHJldHVybiBzdGF0LnByb2dyZXNzW2ldLmNsYXNzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBjb21wdXRlZDoge1xyXG4gICAgICAgIG1vYmlsZTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICByZXR1cm4gJCh3aW5kb3cpLndpZHRoKCkgPCA5MDA7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgICBvbmRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRjb250YWluZXIuYXR0cihcImNsYXNzXCIsIGNvbnRhaW5lckNsYXNzKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgZ2V0VGVhbXMoQVBJLCBrZXkpLnRoZW4oZnVuY3Rpb24odGVhbXMpIHtcclxuICAgICAgcmFjdGl2ZS5zZXQoe1xyXG4gICAgICAgIHRlYW1zOiB0ZWFtcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcclxuICAgICAgICAgIHJldHVybiBhLnRlYW1fbnVtYmVyIC0gYi50ZWFtX251bWJlclxyXG4gICAgICAgIH0pLFxyXG4gICAgICAgIGxvYWRpbmc6IGZhbHNlXHJcbiAgICAgIH0pO1xyXG4gICAgICBTb3J0YWJsZS5pbml0KCk7XHJcbiAgICB9KTtcclxuICB9KTtcclxufVxyXG4iLCJpbXBvcnQgJy4uL2xpYi9lczYtcHJvbWlzZS5taW4uanMnXHJcbmltcG9ydCBUZW1wbGF0ZXMgZnJvbSBcIi4uL1RlbXBsYXRlc1wiXHJcbmltcG9ydCB7IGdldEpTT04sIHJvdW5kIH0gZnJvbSBcIi4uL2hlbHBlcnNcIlxyXG5pbXBvcnQgQVBJLCB7IGdldFRlYW1TdGF0cywgZ2VuZXJhdGVUb2tlbiB9IGZyb20gXCIuLi9BUElcIlxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIGxvZ2luKCkge1xyXG4gIFByb21pc2UuYWxsKFtcclxuICAgIFRlbXBsYXRlcy5nZXQoXCJsb2dpblwiKVxyXG4gIF0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICBjb25zdCBbdGVtcGxhdGVdID0gcmVzO1xyXG4gICAgY29uc3QgcmFjdGl2ZSA9IG5ldyBSYWN0aXZlKHtcclxuICAgICAgdGVtcGxhdGU6IHRlbXBsYXRlLFxyXG4gICAgICBkYXRhOiB7XHJcbiAgICAgICAgbW9iaWxlOiAkKHdpbmRvdykud2lkdGgoKSA8IDkwMCxcclxuICAgICAgICB0b2tlbjogbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuJyksXHJcbiAgICAgICAgdXNlcjoge1xyXG4gICAgICAgICAgbmFtZTogbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VzZXIubmFtZScpIHx8ICcnLFxyXG4gICAgICAgICAgdGVhbTogbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VzZXIudGVhbScpIHx8ICcnXHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgfSk7XHJcbiAgICByYWN0aXZlLm9uKCdsb2dpbicsIGZ1bmN0aW9uKG5vZGUpIHtcclxuICAgICAgdmFyIG5hbWUgPSB0aGlzLmdldChcInVzZXIubmFtZVwiKTtcclxuICAgICAgdmFyIHRlYW0gPSB0aGlzLmdldChcInVzZXIudGVhbVwiKTtcclxuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ1c2VyLm5hbWVcIixuYW1lKTtcclxuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ1c2VyLnRlYW1cIix0ZWFtKTtcclxuICAgICAgdmFyIHRva2VuID0gZ2VuZXJhdGVUb2tlbih0ZWFtLG5hbWUpO1xyXG4gICAgICBsb2NhdGlvbi5oYXNoID0gXCIjL2V2ZW50c1wiO1xyXG4gICAgfSk7XHJcbiAgfSkuY2F0Y2goY29uc29sZS5lcnJvci5iaW5kKGNvbnNvbGUpKTtcclxufVxyXG4iLCJpbXBvcnQgJy4uL2xpYi9lczYtcHJvbWlzZS5taW4uanMnXHJcbmltcG9ydCBUZW1wbGF0ZXMgZnJvbSBcIi4uL1RlbXBsYXRlc1wiXHJcbmltcG9ydCB7IGdldEpTT04sIHJvdW5kIH0gZnJvbSBcIi4uL2hlbHBlcnNcIlxyXG5pbXBvcnQgQVBJLCB7IGdldFRlYW1TdGF0cyB9IGZyb20gXCIuLi9BUElcIlxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIHRlYW0oa2V5KSB7XHJcbiAgUHJvbWlzZS5hbGwoW1xyXG4gICAgVGVtcGxhdGVzLmdldChcInRlYW1cIiksXHJcbiAgICBnZXRKU09OKFwic3RhdHMtY29uZmlnLmpzb25cIiksXHJcbiAgICBnZXRUZWFtU3RhdHMoQVBJLCBrZXkpLFxyXG4gIF0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICBjb25zdCBbdGVtcGxhdGUsIHN0YXRzLCB0ZWFtRGF0YV0gPSByZXM7XHJcbiAgICBjb25zdCByYWN0aXZlID0gbmV3IFJhY3RpdmUoe1xyXG4gICAgICB0ZW1wbGF0ZTogdGVtcGxhdGUsXHJcbiAgICAgIGRhdGE6IHtcclxuICAgICAgICBzdGF0czogc3RhdHMsXHJcbiAgICAgICAgc3RhdEtleXM6IFsnY2FsY3MnLCAnZ29hbHMnLCAnZGVmZW5zZXMnXSxcclxuICAgICAgICBrZXk6IGtleSxcclxuICAgICAgICB0ZWFtOiB0ZWFtRGF0YSxcclxuICAgICAgICBtb2JpbGU6ICQod2luZG93KS53aWR0aCgpIDwgOTAwLFxyXG4gICAgICAgIHJvdW5kOiByb3VuZCxcclxuICAgICAgfSxcclxuICAgIH0pO1xyXG4gIH0pLmNhdGNoKGNvbnNvbGUuZXJyb3IuYmluZChjb25zb2xlKSk7XHJcbn1cclxuIl19
