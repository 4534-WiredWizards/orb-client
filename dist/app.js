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

  $(".navbar").on("click", "a[href][href!='#']", function () {
    if ($(".collapse.in").length > 0) {
      $(".navbar-toggle").click();
    }
  });

  var $overlay = $("<div>", {
    "class": "overlay",
    css: {
      display: "none"
    },
    click: function click() {
      if ($(".collapse.in").length > 0) {
        $(".navbar-toggle").click();
      }
    }
  });

  $overlay.prependTo("html");

  $(".navbar-toggle").click(function () {
    if ($(".collapse.in").length > 0) {
      $overlay.hide();
    } else {
      $overlay.show();
    }
  });
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
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2RhbmllbC9Eb2N1bWVudHMvcHJvamVjdHMvb3JiLWNsaWVudC9zcmMvbGliL2VzNi1wcm9taXNlLm1pbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLENBQUMsWUFBVTtBQUFDLGNBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUM7QUFBQyxXQUFNLFVBQVUsSUFBRSxPQUFPLENBQUMsSUFBRSxRQUFRLElBQUUsT0FBTyxDQUFDLElBQUUsSUFBSSxLQUFHLENBQUMsQ0FBQTtHQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBQztBQUFDLFdBQU0sVUFBVSxJQUFFLE9BQU8sQ0FBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDO0FBQUMsS0FBQyxHQUFDLENBQUMsQ0FBQTtHQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBQztBQUFDLEtBQUMsR0FBQyxDQUFDLENBQUE7R0FBQyxTQUFTLENBQUMsR0FBRTtBQUFDLFdBQU8sWUFBVTtBQUFDLGFBQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLEdBQUU7QUFBQyxXQUFPLFlBQVU7QUFBQyxPQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLEdBQUU7QUFBQyxRQUFJLENBQUMsR0FBQyxDQUFDO1FBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUFDLENBQUMsR0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxDQUFDLFFBQU8sQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUMsRUFBQyxhQUFhLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLFlBQVU7QUFBQyxPQUFDLENBQUMsSUFBSSxHQUFDLENBQUMsR0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUE7S0FBQyxDQUFBLENBQUE7R0FBQyxTQUFTLENBQUMsR0FBRTtBQUFDLFFBQUksQ0FBQyxHQUFDLElBQUksY0FBYyxFQUFBLENBQUMsUUFBTyxDQUFDLENBQUMsS0FBSyxDQUFDLFNBQVMsR0FBQyxDQUFDLEVBQUMsWUFBVTtBQUFDLE9BQUMsQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsQ0FBQSxDQUFBO0dBQUMsU0FBUyxDQUFDLEdBQUU7QUFBQyxXQUFPLFlBQVU7QUFBQyxnQkFBVSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLENBQUE7R0FBQyxTQUFTLENBQUMsR0FBRTtBQUFDLFNBQUksSUFBSSxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxJQUFFLENBQUMsRUFBQztBQUFDLFVBQUksQ0FBQyxHQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7VUFBQyxDQUFDLEdBQUMsRUFBRSxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFDLEtBQUssQ0FBQyxFQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEdBQUMsS0FBSyxDQUFDLENBQUE7S0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLEdBQUU7QUFBQyxRQUFHO0FBQUMsVUFBSSxDQUFDLEdBQUMsT0FBTztVQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBTyxDQUFDLEdBQUMsQ0FBQyxDQUFDLFNBQVMsSUFBRSxDQUFDLENBQUMsWUFBWSxFQUFDLENBQUMsRUFBRSxDQUFBLENBQUE7S0FBQyxDQUFBLE9BQU0sQ0FBQyxFQUFDO0FBQUMsYUFBTyxDQUFDLEVBQUUsQ0FBQTtLQUFDO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLFFBQUksQ0FBQyxHQUFDLElBQUk7UUFBQyxDQUFDLEdBQUMsSUFBSSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxLQUFHLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFHLENBQUMsRUFBQztBQUFDLFVBQUksQ0FBQyxHQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFlBQVU7QUFBQyxTQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFBO09BQUMsQ0FBQyxDQUFBO0tBQUMsTUFBSyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUE7R0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsSUFBRyxDQUFDLElBQUUsUUFBUSxJQUFFLE9BQU8sQ0FBQyxJQUFFLENBQUMsQ0FBQyxXQUFXLEtBQUcsQ0FBQztBQUFDLGFBQU8sQ0FBQyxDQUFDO0tBQUEsSUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBTyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQSxDQUFBO0dBQUMsU0FBUyxDQUFDLEdBQUUsRUFBRSxTQUFTLENBQUMsR0FBRTtBQUFDLFdBQU8sSUFBSSxTQUFTLENBQUMsMENBQTBDLENBQUMsQ0FBQTtHQUFDLFNBQVMsQ0FBQyxHQUFFO0FBQUMsV0FBTyxJQUFJLFNBQVMsQ0FBQyxzREFBc0QsQ0FBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBRztBQUFDLGFBQU8sQ0FBQyxDQUFDLElBQUksQ0FBQTtLQUFDLENBQUEsT0FBTSxDQUFDLEVBQUM7QUFBQyxjQUFPLEVBQUUsQ0FBQyxLQUFLLEdBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQSxDQUFBO0tBQUM7R0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxRQUFHO0FBQUMsT0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsQ0FBQSxPQUFNLENBQUMsRUFBQztBQUFDLGFBQU8sQ0FBQyxDQUFBO0tBQUM7R0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLEtBQUMsQ0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFVBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQztVQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxVQUFTLENBQUMsRUFBQztBQUFDLFNBQUMsS0FBRyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxLQUFHLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUEsQUFBQyxDQUFBO09BQUMsRUFBQyxVQUFTLENBQUMsRUFBQztBQUFDLFNBQUMsS0FBRyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQSxBQUFDLENBQUE7T0FBQyxFQUFDLFVBQVUsSUFBRSxDQUFDLENBQUMsTUFBTSxJQUFFLGtCQUFrQixDQUFBLEFBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFFLENBQUMsS0FBRyxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQSxBQUFDLENBQUE7S0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLEtBQUMsQ0FBQyxNQUFNLEtBQUcsRUFBRSxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUcsRUFBRSxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsS0FBSyxDQUFDLEVBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxPQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsRUFBQyxVQUFTLENBQUMsRUFBQztBQUFDLE9BQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxDQUFDLENBQUE7R0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLEtBQUMsQ0FBQyxXQUFXLEtBQUcsQ0FBQyxDQUFDLFdBQVcsSUFBRSxDQUFDLEtBQUcsRUFBRSxJQUFFLFdBQVcsQ0FBQyxPQUFPLEtBQUcsRUFBRSxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxLQUFHLEVBQUUsR0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsR0FBQyxLQUFLLENBQUMsS0FBRyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxLQUFDLEtBQUcsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFFLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBQztBQUFDLEtBQUMsQ0FBQyxRQUFRLElBQUUsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLEtBQUMsQ0FBQyxNQUFNLEtBQUcsRUFBRSxLQUFHLENBQUMsQ0FBQyxPQUFPLEdBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxNQUFNLEdBQUMsRUFBRSxFQUFDLENBQUMsS0FBRyxDQUFDLENBQUMsWUFBWSxDQUFDLE1BQU0sSUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFBLEFBQUMsQ0FBQTtHQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxLQUFDLENBQUMsTUFBTSxLQUFHLEVBQUUsS0FBRyxDQUFDLENBQUMsTUFBTSxHQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsT0FBTyxHQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFBLEFBQUMsQ0FBQTtHQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLFFBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQyxZQUFZO1FBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsR0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEtBQUcsQ0FBQyxJQUFFLENBQUMsQ0FBQyxNQUFNLElBQUUsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBQztBQUFDLFFBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQyxZQUFZO1FBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBRyxDQUFDLEtBQUcsQ0FBQyxDQUFDLE1BQU0sRUFBQztBQUFDLFdBQUksSUFBSSxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsT0FBTyxFQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUMsQ0FBQyxJQUFFLENBQUMsRUFBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxZQUFZLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQTtLQUFDO0dBQUMsU0FBUyxDQUFDLEdBQUU7QUFBQyxRQUFJLENBQUMsS0FBSyxHQUFDLElBQUksQ0FBQTtHQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxRQUFHO0FBQUMsYUFBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxDQUFBLE9BQU0sQ0FBQyxFQUFDO0FBQUMsY0FBTyxFQUFFLENBQUMsS0FBSyxHQUFDLENBQUMsRUFBQyxFQUFFLENBQUEsQ0FBQTtLQUFDO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDO1FBQUMsQ0FBQztRQUFDLENBQUM7UUFBQyxDQUFDO1FBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLENBQUMsRUFBQztBQUFDLFdBQUcsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxLQUFHLEVBQUUsSUFBRSxDQUFDLEdBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUMsQ0FBQyxHQUFDLElBQUksQ0FBQSxHQUFFLENBQUMsR0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEtBQUcsQ0FBQyxDQUFBO0FBQUMsZUFBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQTtPQUFBO0tBQUMsTUFBSyxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFHLEVBQUUsS0FBRyxDQUFDLElBQUUsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxLQUFHLEVBQUUsR0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxHQUFDLENBQUMsS0FBRyxFQUFFLElBQUUsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQSxBQUFDLENBQUE7R0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBRztBQUFDLE9BQUMsQ0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFNBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUE7T0FBQyxFQUFDLFVBQVMsQ0FBQyxFQUFDO0FBQUMsU0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtPQUFDLENBQUMsQ0FBQTtLQUFDLENBQUEsT0FBTSxDQUFDLEVBQUM7QUFBQyxPQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUM7R0FBQyxTQUFTLENBQUMsR0FBRTtBQUFDLFdBQU8sRUFBRSxFQUFFLENBQUE7R0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUM7QUFBQyxLQUFDLENBQUMsRUFBRSxDQUFDLEdBQUMsRUFBRSxFQUFFLEVBQUMsQ0FBQyxDQUFDLE1BQU0sR0FBQyxLQUFLLENBQUMsRUFBQyxDQUFDLENBQUMsT0FBTyxHQUFDLEtBQUssQ0FBQyxFQUFDLENBQUMsQ0FBQyxZQUFZLEdBQUMsRUFBRSxDQUFBO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDO0FBQUMsV0FBTyxJQUFJLEVBQUUsQ0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFBO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFDLFVBQVMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLFdBQUksSUFBSSxDQUFDLEdBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBQyxDQUFDLEdBQUMsQ0FBQyxFQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsR0FBQyxVQUFTLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxPQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsaUNBQWlDLENBQUMsQ0FBQyxDQUFBO0tBQUMsQ0FBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsSUFBSTtRQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFBLENBQUE7R0FBQyxTQUFTLENBQUMsR0FBRTtBQUFDLFVBQU0sSUFBSSxTQUFTLENBQUMsb0ZBQW9GLENBQUMsQ0FBQTtHQUFDLFNBQVMsQ0FBQyxHQUFFO0FBQUMsVUFBTSxJQUFJLFNBQVMsQ0FBQyx1SEFBdUgsQ0FBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFDLENBQUMsRUFBRSxFQUFDLElBQUksQ0FBQyxPQUFPLEdBQUMsSUFBSSxDQUFDLE1BQU0sR0FBQyxLQUFLLENBQUMsRUFBQyxJQUFJLENBQUMsWUFBWSxHQUFDLEVBQUUsRUFBQyxDQUFDLEtBQUcsQ0FBQyxLQUFHLFVBQVUsSUFBRSxPQUFPLENBQUMsSUFBRSxDQUFDLEVBQUUsRUFBQyxJQUFJLFlBQVksQ0FBQyxHQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLEdBQUMsQ0FBQyxFQUFFLENBQUEsQUFBQyxDQUFBO0dBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQztBQUFDLFFBQUksQ0FBQyxvQkFBb0IsR0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLE9BQU8sR0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxJQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEVBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBRSxJQUFJLENBQUMsTUFBTSxHQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUMsSUFBSSxDQUFDLFVBQVUsR0FBQyxDQUFDLENBQUMsTUFBTSxFQUFDLElBQUksQ0FBQyxPQUFPLEdBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxFQUFDLENBQUMsS0FBRyxJQUFJLENBQUMsTUFBTSxHQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBRSxJQUFJLENBQUMsTUFBTSxHQUFDLElBQUksQ0FBQyxNQUFNLElBQUUsQ0FBQyxFQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBQyxDQUFDLEtBQUcsSUFBSSxDQUFDLFVBQVUsSUFBRSxDQUFD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QyxFQUFFLENBQUM7TUFBQyxFQUFFLEdBQUMsS0FBSyxDQUFDO01BQUMsRUFBRSxHQUFDLENBQUM7TUFBQyxFQUFFLEdBQUMsQ0FBQztNQUFDLEVBQUUsR0FBQyxJQUFJLENBQUMsRUFBQTtNQUFDLEVBQUUsR0FBQyxJQUFJLENBQUMsRUFBQTtNQUFDLEVBQUUsR0FBQyxDQUFDO01BQUMsRUFBRSxHQUFDLENBQUM7TUFBQyxFQUFFLEdBQUMsQ0FBQztNQUFDLEVBQUUsR0FBQyxDQUFDO01BQUMsRUFBRSxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsSUFBSSxHQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsT0FBTyxHQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsTUFBTSxHQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsYUFBYSxHQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsUUFBUSxHQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsS0FBSyxHQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsU0FBUyxHQUFDLEVBQUMsV0FBVyxFQUFDLENBQUMsRUFBQyxJQUFJLEVBQUMsRUFBRSxFQUFDLE9BQU8sRUFBQyxnQkFBUyxDQUFDLEVBQUM7QUFBQyxhQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFDLENBQUMsQ0FBQyxDQUFBO0tBQUMsRUFBQyxDQUFDLElBQUksRUFBRSxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFVBQVUsR0FBQyxZQUFVO0FBQUMsU0FBSSxJQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsTUFBTSxFQUFDLENBQUMsR0FBQyxJQUFJLENBQUMsTUFBTSxFQUFDLENBQUMsR0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLE1BQU0sS0FBRyxFQUFFLElBQUUsQ0FBQyxHQUFDLENBQUMsRUFBQyxDQUFDLEVBQUUsRUFBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtHQUFDLEVBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxVQUFVLEdBQUMsVUFBUyxDQUFDLEVBQUMsQ0FBQyxFQUFDO0FBQUMsUUFBSSxDQUFDLEdBQUMsSUFBSSxDQUFDLG9CQUFvQjtRQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUcsQ0FBQyxLQUFHLEVBQUUsRUFBQztBQUFDLFVBQUksQ0FBQyxHQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFHLENBQUMsS0FBRyxFQUFFLElBQUUsQ0FBQyxDQUFDLE1BQU0sS0FBRyxFQUFFLEVBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsTUFBTSxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxJQUFHLFVBQVUsSUFBRSxPQUFPLENBQUMsRUFBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUMsS0FBSyxJQUFHLENBQUMsS0FBRyxFQUFFLEVBQUM7QUFBQyxZQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtPQUFDLE1BQUssSUFBSSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFTLENBQUMsRUFBQztBQUFDLFNBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtPQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLE1BQUssSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUE7R0FBQyxFQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsVUFBVSxHQUFDLFVBQVMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUcsRUFBRSxLQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBQyxDQUFDLEtBQUcsRUFBRSxHQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBQyxDQUFDLENBQUEsQUFBQyxFQUFDLENBQUMsS0FBRyxJQUFJLENBQUMsVUFBVSxJQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFBO0dBQUMsRUFBQyxDQUFDLENBQUMsU0FBUyxDQUFDLGFBQWEsR0FBQyxVQUFTLENBQUMsRUFBQyxDQUFDLEVBQUM7QUFBQyxRQUFJLENBQUMsR0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBQyxLQUFLLENBQUMsRUFBQyxVQUFTLENBQUMsRUFBQztBQUFDLE9BQUMsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTtLQUFDLEVBQUMsVUFBUyxDQUFDLEVBQUM7QUFBQyxPQUFDLENBQUMsVUFBVSxDQUFDLEVBQUUsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUE7S0FBQyxDQUFDLENBQUE7R0FBQyxDQUFDLElBQUksRUFBRSxHQUFDLENBQUM7TUFBQyxFQUFFLEdBQUMsRUFBQyxPQUFPLEVBQUMsRUFBRSxFQUFDLFFBQVEsRUFBQyxFQUFFLEVBQUMsQ0FBQyxVQUFVLElBQUUsT0FBTyxNQUFNLElBQUUsTUFBTSxDQUFDLEdBQUcsR0FBQyxNQUFNLENBQUMsWUFBVTtBQUFDLFdBQU8sRUFBRSxDQUFBO0dBQUMsQ0FBQyxHQUFDLFdBQVcsSUFBRSxPQUFPLE1BQU0sSUFBRSxNQUFNLENBQUMsT0FBTyxHQUFDLE1BQU0sQ0FBQyxPQUFPLEdBQUMsRUFBRSxHQUFDLFdBQVcsSUFBRSxPQUFPLElBQUksS0FBRyxJQUFJLENBQUMsVUFBVSxHQUFDLEVBQUUsQ0FBQSxBQUFDLEVBQUMsRUFBRSxFQUFFLENBQUE7Q0FBQyxDQUFBLENBQUUsSUFBSSxXQUFNLENBQUMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIi8qIVxuICogQG92ZXJ2aWV3IGVzNi1wcm9taXNlIC0gYSB0aW55IGltcGxlbWVudGF0aW9uIG9mIFByb21pc2VzL0ErLlxuICogQGNvcHlyaWdodCBDb3B5cmlnaHQgKGMpIDIwMTQgWWVodWRhIEthdHosIFRvbSBEYWxlLCBTdGVmYW4gUGVubmVyIGFuZCBjb250cmlidXRvcnMgKENvbnZlcnNpb24gdG8gRVM2IEFQSSBieSBKYWtlIEFyY2hpYmFsZClcbiAqIEBsaWNlbnNlICAgTGljZW5zZWQgdW5kZXIgTUlUIGxpY2Vuc2VcbiAqICAgICAgICAgICAgU2VlIGh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9qYWtlYXJjaGliYWxkL2VzNi1wcm9taXNlL21hc3Rlci9MSUNFTlNFXG4gKiBAdmVyc2lvbiAgIDMuMi4xXG4gKi9cblxuKGZ1bmN0aW9uKCl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gdCh0KXtyZXR1cm5cImZ1bmN0aW9uXCI9PXR5cGVvZiB0fHxcIm9iamVjdFwiPT10eXBlb2YgdCYmbnVsbCE9PXR9ZnVuY3Rpb24gZSh0KXtyZXR1cm5cImZ1bmN0aW9uXCI9PXR5cGVvZiB0fWZ1bmN0aW9uIG4odCl7Rz10fWZ1bmN0aW9uIHIodCl7UT10fWZ1bmN0aW9uIG8oKXtyZXR1cm4gZnVuY3Rpb24oKXtwcm9jZXNzLm5leHRUaWNrKGEpfX1mdW5jdGlvbiBpKCl7cmV0dXJuIGZ1bmN0aW9uKCl7QihhKX19ZnVuY3Rpb24gcygpe3ZhciB0PTAsZT1uZXcgWChhKSxuPWRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiXCIpO3JldHVybiBlLm9ic2VydmUobix7Y2hhcmFjdGVyRGF0YTohMH0pLGZ1bmN0aW9uKCl7bi5kYXRhPXQ9Kyt0JTJ9fWZ1bmN0aW9uIHUoKXt2YXIgdD1uZXcgTWVzc2FnZUNoYW5uZWw7cmV0dXJuIHQucG9ydDEub25tZXNzYWdlPWEsZnVuY3Rpb24oKXt0LnBvcnQyLnBvc3RNZXNzYWdlKDApfX1mdW5jdGlvbiBjKCl7cmV0dXJuIGZ1bmN0aW9uKCl7c2V0VGltZW91dChhLDEpfX1mdW5jdGlvbiBhKCl7Zm9yKHZhciB0PTA7Sj50O3QrPTIpe3ZhciBlPXR0W3RdLG49dHRbdCsxXTtlKG4pLHR0W3RdPXZvaWQgMCx0dFt0KzFdPXZvaWQgMH1KPTB9ZnVuY3Rpb24gZigpe3RyeXt2YXIgdD1yZXF1aXJlLGU9dChcInZlcnR4XCIpO3JldHVybiBCPWUucnVuT25Mb29wfHxlLnJ1bk9uQ29udGV4dCxpKCl9Y2F0Y2gobil7cmV0dXJuIGMoKX19ZnVuY3Rpb24gbCh0LGUpe3ZhciBuPXRoaXMscj1uZXcgdGhpcy5jb25zdHJ1Y3RvcihwKTt2b2lkIDA9PT1yW3J0XSYmayhyKTt2YXIgbz1uLl9zdGF0ZTtpZihvKXt2YXIgaT1hcmd1bWVudHNbby0xXTtRKGZ1bmN0aW9uKCl7eChvLHIsaSxuLl9yZXN1bHQpfSl9ZWxzZSBFKG4scix0LGUpO3JldHVybiByfWZ1bmN0aW9uIGgodCl7dmFyIGU9dGhpcztpZih0JiZcIm9iamVjdFwiPT10eXBlb2YgdCYmdC5jb25zdHJ1Y3Rvcj09PWUpcmV0dXJuIHQ7dmFyIG49bmV3IGUocCk7cmV0dXJuIGcobix0KSxufWZ1bmN0aW9uIHAoKXt9ZnVuY3Rpb24gXygpe3JldHVybiBuZXcgVHlwZUVycm9yKFwiWW91IGNhbm5vdCByZXNvbHZlIGEgcHJvbWlzZSB3aXRoIGl0c2VsZlwiKX1mdW5jdGlvbiBkKCl7cmV0dXJuIG5ldyBUeXBlRXJyb3IoXCJBIHByb21pc2VzIGNhbGxiYWNrIGNhbm5vdCByZXR1cm4gdGhhdCBzYW1lIHByb21pc2UuXCIpfWZ1bmN0aW9uIHYodCl7dHJ5e3JldHVybiB0LnRoZW59Y2F0Y2goZSl7cmV0dXJuIHV0LmVycm9yPWUsdXR9fWZ1bmN0aW9uIHkodCxlLG4scil7dHJ5e3QuY2FsbChlLG4scil9Y2F0Y2gobyl7cmV0dXJuIG99fWZ1bmN0aW9uIG0odCxlLG4pe1EoZnVuY3Rpb24odCl7dmFyIHI9ITEsbz15KG4sZSxmdW5jdGlvbihuKXtyfHwocj0hMCxlIT09bj9nKHQsbik6Uyh0LG4pKX0sZnVuY3Rpb24oZSl7cnx8KHI9ITAsaih0LGUpKX0sXCJTZXR0bGU6IFwiKyh0Ll9sYWJlbHx8XCIgdW5rbm93biBwcm9taXNlXCIpKTshciYmbyYmKHI9ITAsaih0LG8pKX0sdCl9ZnVuY3Rpb24gYih0LGUpe2UuX3N0YXRlPT09aXQ/Uyh0LGUuX3Jlc3VsdCk6ZS5fc3RhdGU9PT1zdD9qKHQsZS5fcmVzdWx0KTpFKGUsdm9pZCAwLGZ1bmN0aW9uKGUpe2codCxlKX0sZnVuY3Rpb24oZSl7aih0LGUpfSl9ZnVuY3Rpb24gdyh0LG4scil7bi5jb25zdHJ1Y3Rvcj09PXQuY29uc3RydWN0b3ImJnI9PT1ldCYmY29uc3RydWN0b3IucmVzb2x2ZT09PW50P2IodCxuKTpyPT09dXQ/aih0LHV0LmVycm9yKTp2b2lkIDA9PT1yP1ModCxuKTplKHIpP20odCxuLHIpOlModCxuKX1mdW5jdGlvbiBnKGUsbil7ZT09PW4/aihlLF8oKSk6dChuKT93KGUsbix2KG4pKTpTKGUsbil9ZnVuY3Rpb24gQSh0KXt0Ll9vbmVycm9yJiZ0Ll9vbmVycm9yKHQuX3Jlc3VsdCksVCh0KX1mdW5jdGlvbiBTKHQsZSl7dC5fc3RhdGU9PT1vdCYmKHQuX3Jlc3VsdD1lLHQuX3N0YXRlPWl0LDAhPT10Ll9zdWJzY3JpYmVycy5sZW5ndGgmJlEoVCx0KSl9ZnVuY3Rpb24gaih0LGUpe3QuX3N0YXRlPT09b3QmJih0Ll9zdGF0ZT1zdCx0Ll9yZXN1bHQ9ZSxRKEEsdCkpfWZ1bmN0aW9uIEUodCxlLG4scil7dmFyIG89dC5fc3Vic2NyaWJlcnMsaT1vLmxlbmd0aDt0Ll9vbmVycm9yPW51bGwsb1tpXT1lLG9baStpdF09bixvW2krc3RdPXIsMD09PWkmJnQuX3N0YXRlJiZRKFQsdCl9ZnVuY3Rpb24gVCh0KXt2YXIgZT10Ll9zdWJzY3JpYmVycyxuPXQuX3N0YXRlO2lmKDAhPT1lLmxlbmd0aCl7Zm9yKHZhciByLG8saT10Ll9yZXN1bHQscz0wO3M8ZS5sZW5ndGg7cys9MylyPWVbc10sbz1lW3Mrbl0scj94KG4scixvLGkpOm8oaSk7dC5fc3Vic2NyaWJlcnMubGVuZ3RoPTB9fWZ1bmN0aW9uIE0oKXt0aGlzLmVycm9yPW51bGx9ZnVuY3Rpb24gUCh0LGUpe3RyeXtyZXR1cm4gdChlKX1jYXRjaChuKXtyZXR1cm4gY3QuZXJyb3I9bixjdH19ZnVuY3Rpb24geCh0LG4scixvKXt2YXIgaSxzLHUsYyxhPWUocik7aWYoYSl7aWYoaT1QKHIsbyksaT09PWN0PyhjPSEwLHM9aS5lcnJvcixpPW51bGwpOnU9ITAsbj09PWkpcmV0dXJuIHZvaWQgaihuLGQoKSl9ZWxzZSBpPW8sdT0hMDtuLl9zdGF0ZSE9PW90fHwoYSYmdT9nKG4saSk6Yz9qKG4scyk6dD09PWl0P1MobixpKTp0PT09c3QmJmoobixpKSl9ZnVuY3Rpb24gQyh0LGUpe3RyeXtlKGZ1bmN0aW9uKGUpe2codCxlKX0sZnVuY3Rpb24oZSl7aih0LGUpfSl9Y2F0Y2gobil7aih0LG4pfX1mdW5jdGlvbiBPKCl7cmV0dXJuIGF0Kyt9ZnVuY3Rpb24gayh0KXt0W3J0XT1hdCsrLHQuX3N0YXRlPXZvaWQgMCx0Ll9yZXN1bHQ9dm9pZCAwLHQuX3N1YnNjcmliZXJzPVtdfWZ1bmN0aW9uIFkodCl7cmV0dXJuIG5ldyBfdCh0aGlzLHQpLnByb21pc2V9ZnVuY3Rpb24gcSh0KXt2YXIgZT10aGlzO3JldHVybiBuZXcgZShJKHQpP2Z1bmN0aW9uKG4scil7Zm9yKHZhciBvPXQubGVuZ3RoLGk9MDtvPmk7aSsrKWUucmVzb2x2ZSh0W2ldKS50aGVuKG4scil9OmZ1bmN0aW9uKHQsZSl7ZShuZXcgVHlwZUVycm9yKFwiWW91IG11c3QgcGFzcyBhbiBhcnJheSB0byByYWNlLlwiKSl9KX1mdW5jdGlvbiBGKHQpe3ZhciBlPXRoaXMsbj1uZXcgZShwKTtyZXR1cm4gaihuLHQpLG59ZnVuY3Rpb24gRCgpe3Rocm93IG5ldyBUeXBlRXJyb3IoXCJZb3UgbXVzdCBwYXNzIGEgcmVzb2x2ZXIgZnVuY3Rpb24gYXMgdGhlIGZpcnN0IGFyZ3VtZW50IHRvIHRoZSBwcm9taXNlIGNvbnN0cnVjdG9yXCIpfWZ1bmN0aW9uIEsoKXt0aHJvdyBuZXcgVHlwZUVycm9yKFwiRmFpbGVkIHRvIGNvbnN0cnVjdCAnUHJvbWlzZSc6IFBsZWFzZSB1c2UgdGhlICduZXcnIG9wZXJhdG9yLCB0aGlzIG9iamVjdCBjb25zdHJ1Y3RvciBjYW5ub3QgYmUgY2FsbGVkIGFzIGEgZnVuY3Rpb24uXCIpfWZ1bmN0aW9uIEwodCl7dGhpc1tydF09TygpLHRoaXMuX3Jlc3VsdD10aGlzLl9zdGF0ZT12b2lkIDAsdGhpcy5fc3Vic2NyaWJlcnM9W10scCE9PXQmJihcImZ1bmN0aW9uXCIhPXR5cGVvZiB0JiZEKCksdGhpcyBpbnN0YW5jZW9mIEw/Qyh0aGlzLHQpOksoKSl9ZnVuY3Rpb24gTih0LGUpe3RoaXMuX2luc3RhbmNlQ29uc3RydWN0b3I9dCx0aGlzLnByb21pc2U9bmV3IHQocCksdGhpcy5wcm9taXNlW3J0XXx8ayh0aGlzLnByb21pc2UpLEFycmF5LmlzQXJyYXkoZSk/KHRoaXMuX2lucHV0PWUsdGhpcy5sZW5ndGg9ZS5sZW5ndGgsdGhpcy5fcmVtYWluaW5nPWUubGVuZ3RoLHRoaXMuX3Jlc3VsdD1uZXcgQXJyYXkodGhpcy5sZW5ndGgpLDA9PT10aGlzLmxlbmd0aD9TKHRoaXMucHJvbWlzZSx0aGlzLl9yZXN1bHQpOih0aGlzLmxlbmd0aD10aGlzLmxlbmd0aHx8MCx0aGlzLl9lbnVtZXJhdGUoKSwwPT09dGhpcy5fcmVtYWluaW5nJiZTKHRoaXMucHJvbWlzZSx0aGlzLl9yZXN1bHQpKSk6aih0aGlzLnByb21pc2UsVSgpKX1mdW5jdGlvbiBVKCl7cmV0dXJuIG5ldyBFcnJvcihcIkFycmF5IE1ldGhvZHMgbXVzdCBiZSBwcm92aWRlZCBhbiBBcnJheVwiKX1mdW5jdGlvbiBXKCl7dmFyIHQ7aWYoXCJ1bmRlZmluZWRcIiE9dHlwZW9mIGdsb2JhbCl0PWdsb2JhbDtlbHNlIGlmKFwidW5kZWZpbmVkXCIhPXR5cGVvZiBzZWxmKXQ9c2VsZjtlbHNlIHRyeXt0PUZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKX1jYXRjaChlKXt0aHJvdyBuZXcgRXJyb3IoXCJwb2x5ZmlsbCBmYWlsZWQgYmVjYXVzZSBnbG9iYWwgb2JqZWN0IGlzIHVuYXZhaWxhYmxlIGluIHRoaXMgZW52aXJvbm1lbnRcIil9dmFyIG49dC5Qcm9taXNlOyghbnx8XCJbb2JqZWN0IFByb21pc2VdXCIhPT1PYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobi5yZXNvbHZlKCkpfHxuLmNhc3QpJiYodC5Qcm9taXNlPXB0KX12YXIgejt6PUFycmF5LmlzQXJyYXk/QXJyYXkuaXNBcnJheTpmdW5jdGlvbih0KXtyZXR1cm5cIltvYmplY3QgQXJyYXldXCI9PT1PYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodCl9O3ZhciBCLEcsSCxJPXosSj0wLFE9ZnVuY3Rpb24odCxlKXt0dFtKXT10LHR0W0orMV09ZSxKKz0yLDI9PT1KJiYoRz9HKGEpOkgoKSl9LFI9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdpbmRvdz93aW5kb3c6dm9pZCAwLFY9Unx8e30sWD1WLk11dGF0aW9uT2JzZXJ2ZXJ8fFYuV2ViS2l0TXV0YXRpb25PYnNlcnZlcixaPVwidW5kZWZpbmVkXCI9PXR5cGVvZiBzZWxmJiZcInVuZGVmaW5lZFwiIT10eXBlb2YgcHJvY2VzcyYmXCJbb2JqZWN0IHByb2Nlc3NdXCI9PT17fS50b1N0cmluZy5jYWxsKHByb2Nlc3MpLCQ9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIFVpbnQ4Q2xhbXBlZEFycmF5JiZcInVuZGVmaW5lZFwiIT10eXBlb2YgaW1wb3J0U2NyaXB0cyYmXCJ1bmRlZmluZWRcIiE9dHlwZW9mIE1lc3NhZ2VDaGFubmVsLHR0PW5ldyBBcnJheSgxZTMpO0g9Wj9vKCk6WD9zKCk6JD91KCk6dm9pZCAwPT09UiYmXCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZT9mKCk6YygpO3ZhciBldD1sLG50PWgscnQ9TWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDE2KSxvdD12b2lkIDAsaXQ9MSxzdD0yLHV0PW5ldyBNLGN0PW5ldyBNLGF0PTAsZnQ9WSxsdD1xLGh0PUYscHQ9TDtMLmFsbD1mdCxMLnJhY2U9bHQsTC5yZXNvbHZlPW50LEwucmVqZWN0PWh0LEwuX3NldFNjaGVkdWxlcj1uLEwuX3NldEFzYXA9cixMLl9hc2FwPVEsTC5wcm90b3R5cGU9e2NvbnN0cnVjdG9yOkwsdGhlbjpldCxcImNhdGNoXCI6ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMudGhlbihudWxsLHQpfX07dmFyIF90PU47Ti5wcm90b3R5cGUuX2VudW1lcmF0ZT1mdW5jdGlvbigpe2Zvcih2YXIgdD10aGlzLmxlbmd0aCxlPXRoaXMuX2lucHV0LG49MDt0aGlzLl9zdGF0ZT09PW90JiZ0Pm47bisrKXRoaXMuX2VhY2hFbnRyeShlW25dLG4pfSxOLnByb3RvdHlwZS5fZWFjaEVudHJ5PWZ1bmN0aW9uKHQsZSl7dmFyIG49dGhpcy5faW5zdGFuY2VDb25zdHJ1Y3RvcixyPW4ucmVzb2x2ZTtpZihyPT09bnQpe3ZhciBvPXYodCk7aWYobz09PWV0JiZ0Ll9zdGF0ZSE9PW90KXRoaXMuX3NldHRsZWRBdCh0Ll9zdGF0ZSxlLHQuX3Jlc3VsdCk7ZWxzZSBpZihcImZ1bmN0aW9uXCIhPXR5cGVvZiBvKXRoaXMuX3JlbWFpbmluZy0tLHRoaXMuX3Jlc3VsdFtlXT10O2Vsc2UgaWYobj09PXB0KXt2YXIgaT1uZXcgbihwKTt3KGksdCxvKSx0aGlzLl93aWxsU2V0dGxlQXQoaSxlKX1lbHNlIHRoaXMuX3dpbGxTZXR0bGVBdChuZXcgbihmdW5jdGlvbihlKXtlKHQpfSksZSl9ZWxzZSB0aGlzLl93aWxsU2V0dGxlQXQocih0KSxlKX0sTi5wcm90b3R5cGUuX3NldHRsZWRBdD1mdW5jdGlvbih0LGUsbil7dmFyIHI9dGhpcy5wcm9taXNlO3IuX3N0YXRlPT09b3QmJih0aGlzLl9yZW1haW5pbmctLSx0PT09c3Q/aihyLG4pOnRoaXMuX3Jlc3VsdFtlXT1uKSwwPT09dGhpcy5fcmVtYWluaW5nJiZTKHIsdGhpcy5fcmVzdWx0KX0sTi5wcm90b3R5cGUuX3dpbGxTZXR0bGVBdD1mdW5jdGlvbih0LGUpe3ZhciBuPXRoaXM7RSh0LHZvaWQgMCxmdW5jdGlvbih0KXtuLl9zZXR0bGVkQXQoaXQsZSx0KX0sZnVuY3Rpb24odCl7bi5fc2V0dGxlZEF0KHN0LGUsdCl9KX07dmFyIGR0PVcsdnQ9e1Byb21pc2U6cHQscG9seWZpbGw6ZHR9O1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoZnVuY3Rpb24oKXtyZXR1cm4gdnR9KTpcInVuZGVmaW5lZFwiIT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz12dDpcInVuZGVmaW5lZFwiIT10eXBlb2YgdGhpcyYmKHRoaXMuRVM2UHJvbWlzZT12dCksZHQoKX0pLmNhbGwodGhpcyk7Il19
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
        return false;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9kYW5pZWwvRG9jdW1lbnRzL3Byb2plY3RzL29yYi1jbGllbnQvc3JjL21haW4uanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiL2hvbWUvZGFuaWVsL0RvY3VtZW50cy9wcm9qZWN0cy9vcmItY2xpZW50L3NyYy9BUEkuanMiLCIvaG9tZS9kYW5pZWwvRG9jdW1lbnRzL3Byb2plY3RzL29yYi1jbGllbnQvc3JjL0NvbXBvbmVudHMuanMiLCIvaG9tZS9kYW5pZWwvRG9jdW1lbnRzL3Byb2plY3RzL29yYi1jbGllbnQvc3JjL0xvZ2luQ2hlY2suanMiLCIvaG9tZS9kYW5pZWwvRG9jdW1lbnRzL3Byb2plY3RzL29yYi1jbGllbnQvc3JjL1BhZ2VzLmpzIiwiL2hvbWUvZGFuaWVsL0RvY3VtZW50cy9wcm9qZWN0cy9vcmItY2xpZW50L3NyYy9UZW1wbGF0ZXMuanMiLCIvaG9tZS9kYW5pZWwvRG9jdW1lbnRzL3Byb2plY3RzL29yYi1jbGllbnQvc3JjL2NhY2hlYWJsZS5qcyIsIi9ob21lL2RhbmllbC9Eb2N1bWVudHMvcHJvamVjdHMvb3JiLWNsaWVudC9zcmMvaGVscGVycy5qcyIsInNyYy9saWIvZXM2LXByb21pc2UubWluLmpzIiwiL2hvbWUvZGFuaWVsL0RvY3VtZW50cy9wcm9qZWN0cy9vcmItY2xpZW50L3NyYy9wYWdlcy9ldmVudC5qcyIsIi9ob21lL2RhbmllbC9Eb2N1bWVudHMvcHJvamVjdHMvb3JiLWNsaWVudC9zcmMvcGFnZXMvZXZlbnRNYXRjaGVzLmpzIiwiL2hvbWUvZGFuaWVsL0RvY3VtZW50cy9wcm9qZWN0cy9vcmItY2xpZW50L3NyYy9wYWdlcy9ldmVudHMuanMiLCIvaG9tZS9kYW5pZWwvRG9jdW1lbnRzL3Byb2plY3RzL29yYi1jbGllbnQvc3JjL3BhZ2VzL2xvZ2luLmpzIiwiL2hvbWUvZGFuaWVsL0RvY3VtZW50cy9wcm9q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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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LE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFO1NBQzlDO09BQ0YsRUFDRixDQUFDLENBQUM7R0FDSixDQUFDLFNBQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO0NBQ3ZDIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCAqIGFzIFBhZ2VzIGZyb20gJy4vUGFnZXMnXG5pbXBvcnQgQ29tcG9uZW50cyBmcm9tICcuL0NvbXBvbmVudHMnXG5pbXBvcnQge1xuICBkb2N1bWVudFJlYWR5XG59IGZyb20gJy4vaGVscGVycydcbmltcG9ydCAnLi9saWIvZXM2LXByb21pc2UubWluLmpzJ1xuXG5jb25zdCBlbCA9IFwiI21haW5cIjtcblxuY29uc3Qgcm91dGVyID0gUm91dGVyKHtcbiAgXCIvbG9naW5cIjogUGFnZXMubG9naW4sXG4gIFwiL2FcIjoge1xuICAgIFwiL3RlYW0vOmtleVwiOiBQYWdlcy50ZWFtLFxuICAgIFwiL2V2ZW50LzprZXlcIjogUGFnZXMuZXZlbnQsXG4gICAgXCIvZXZlbnQvOmtleS9tYXRjaGVzXCI6IFBhZ2VzLmV2ZW50TWF0Y2hlcyxcbiAgICBcIi9ldmVudHNcIjogUGFnZXMuZXZlbnRzXG4gIH1cbn0pLmNvbmZpZ3VyZSh7XG4gIGh0bWw1aGlzdG9yeTogZmFsc2UsXG4gIGJlZm9yZTogW10sXG4gIGFmdGVyOiBbXSxcbiAgcmVjdXJzZTogJ2ZvcndhcmQnXG59KTtcblxuUHJvbWlzZS5hbGwoW2RvY3VtZW50UmVhZHksIENvbXBvbmVudHMubG9hZCgpXSkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgY29uc3QgWywgQ29tcG9uZW50c10gPSByZXM7XG4gIFJhY3RpdmUgPSBSYWN0aXZlLmV4dGVuZCh7XG4gICAgZWw6IGVsLFxuICAgIGNvbXBvbmVudHM6IENvbXBvbmVudHMuY29tcG9uZW50cyxcbiAgICBiZWZvcmU6IFtmdW5jdGlvbigpIHtcbiAgICAgICQod2luZG93KS5zY3JvbGxUb3AoMCk7XG4gICAgfV1cbiAgfSk7XG4gIHJvdXRlci5pbml0KCk7XG4gIGlmICghcm91dGVyLmdldFJvdXRlKCkuZmlsdGVyKEJvb2xlYW4pLmxlbmd0aCkge1xuICAgIGlmIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9rZW4nKSkge1xuICAgICAgcm91dGVyLnNldFJvdXRlKFwiL2EvZXZlbnRzXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICByb3V0ZXIuc2V0Um91dGUoXCIvbG9naW5cIik7XG4gICAgfVxuICB9XG5cbiAgJChcIi5uYXZiYXJcIikub24oXCJjbGlja1wiLCBcImFbaHJlZl1baHJlZiE9JyMnXVwiLCBmdW5jdGlvbigpIHtcbiAgICBpZiAoJCgnLmNvbGxhcHNlLmluJykubGVuZ3RoID4gMCkge1xuICAgICAgJCgnLm5hdmJhci10b2dnbGUnKS5jbGljaygpO1xuICAgIH1cbiAgfSk7XG5cbiAgY29uc3QgJG92ZXJsYXkgPSAkKFwiPGRpdj5cIiwge1xuICAgIGNsYXNzOiBcIm92ZXJsYXlcIixcbiAgICBjc3M6IHtcbiAgICAgIFwiZGlzcGxheVwiOiBcIm5vbmVcIlxuICAgIH0sXG4gICAgY2xpY2soKSB7XG4gICAgICBpZiAoJCgnLmNvbGxhcHNlLmluJykubGVuZ3RoID4gMCkge1xuICAgICAgICAkKCcubmF2YmFyLXRvZ2dsZScpLmNsaWNrKCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICAkb3ZlcmxheS5wcmVwZW5kVG8oXCJodG1sXCIpO1xuXG4gICQoJy5uYXZiYXItdG9nZ2xlJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgaWYgKCQoJy5jb2xsYXBzZS5pbicpLmxlbmd0aCA+IDApIHtcbiAgICAgICRvdmVybGF5LmhpZGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJG92ZXJsYXkuc2hvdygpO1xuICAgIH1cbiAgfSk7XG5cbn0pO1xuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuTXV0YXRpb25PYnNlcnZlciA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93Lk11dGF0aW9uT2JzZXJ2ZXI7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgdmFyIHF1ZXVlID0gW107XG5cbiAgICBpZiAoY2FuTXV0YXRpb25PYnNlcnZlcikge1xuICAgICAgICB2YXIgaGlkZGVuRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgdmFyIG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHF1ZXVlTGlzdCA9IHF1ZXVlLnNsaWNlKCk7XG4gICAgICAgICAgICBxdWV1ZS5sZW5ndGggPSAwO1xuICAgICAgICAgICAgcXVldWVMaXN0LmZvckVhY2goZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGhpZGRlbkRpdiwgeyBhdHRyaWJ1dGVzOiB0cnVlIH0pO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgaWYgKCFxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBoaWRkZW5EaXYuc2V0QXR0cmlidXRlKCd5ZXMnLCAnbm8nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZm4pO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGlmIChjYW5Qb3N0KSB7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbiIsImltcG9ydCAnLi9saWIvZXM2LXByb21pc2UubWluLmpzJ1xuaW1wb3J0IGNhY2hlYWJsZSBmcm9tICcuL2NhY2hlYWJsZSdcbmltcG9ydCB7IGV4dGVuZCB9IGZyb20gJy4vaGVscGVycydcblxuXG5cbmV4cG9ydCBkZWZhdWx0IGNhY2hlYWJsZShmdW5jdGlvbihrZXkpIHtcbiAgY29uc3Qga2V5ID0ga2V5LnJlcGxhY2UoL15cXC8vLCBcIlwiKS5yZXBsYWNlKC9cXC8kLywgXCJcIik7XG4gIGxldCB1cmwgPSBcImh0dHA6Ly9vcmIuc2NvdXRmcmMuaW8vXCIra2V5K1wiL1wiO1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgcmV0dXJuICQuYWpheCh7XG4gICAgICBtZXRob2Q6IFwiZ2V0XCIsXG4gICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICBkYXRhOiB7fSxcbiAgICAgIHVybDogdXJsLFxuICAgICAgZXJyb3I6IHJlamVjdFxuICAgIH0pLnRoZW4ocmVzb2x2ZSk7XG4gIH0pLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJBUEkgUmVxdWVzdCBVbnN1Y2Nlc3NmdWxcIiwgdXJsLCByZXMpO1xuICAgIHJldHVybiByZXM7XG4gIH0pO1xufSk7XG5cbmV4cG9ydCBsZXQgVEJBID0gY2FjaGVhYmxlKGZ1bmN0aW9uKHBhdGgpIHtcbiAgY29uc3QgdXJsID0gXCJodHRwOi8vd3d3LnRoZWJsdWVhbGxpYW5jZS5jb20vYXBpL3YyL1wiICsgcGF0aDtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgbWV0aG9kOiBcImdldFwiLFxuICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxuICAgICAgZGF0YToge1xuICAgICAgICAnWC1UQkEtQXBwLUlkJzogXCJmcmM0NTM0Om9yYjpjbGllbnRcIlxuICAgICAgfSxcbiAgICAgIHVybDogdXJsLFxuICAgICAgZXJyb3I6IHJlamVjdFxuICAgIH0pLnRoZW4ocmVzb2x2ZSk7XG4gIH0pLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJBUEkgUmVxdWVzdCBVbnN1Y2Nlc3NmdWxcIiwgdXJsLCByZXMpO1xuICAgIHJldHVybiByZXM7XG4gIH0pO1xufSk7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUZWFtU3RhdHMoQVBJLCBrZXksIHRlYW0pIHtcbiAgbGV0IHByb21pc2VzID0gW1xuICAgIEFQSS5nZXQoXCJ0ZWFtL1wiK2tleStcIi9kZWZlbnNlXCIpLFxuICAgIEFQSS5nZXQoXCJ0ZWFtL1wiK2tleStcIi9nb2Fsc1wiKSxcbiAgICBBUEkuZ2V0KFwidGVhbS9cIitrZXkrXCIvc2NvcmVcIiksXG4gIF07XG4gIGlmICh0eXBlb2YgdGVhbSA9PSBcIm9iamVjdFwiICYmIHRlYW0udGVhbV9udW1iZXIgPT0gdGVhbSkge1xuICAgIHByb21pc2VzLnB1c2goKHJlc29sdmUsIHJlamVjdCkgPT4gcmVzb2x2ZSh0ZWFtKSlcbiAgfSBlbHNlIHtcbiAgICBwcm9taXNlcy5wdXNoKEFQSS5nZXQoXCJ0ZWFtL1wiK2tleSkpO1xuICB9XG4gIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcykudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICBsZXQgW2RlZmVuc2VzLCBnb2Fscywgc2NvcmUsIHRlYW1dID0gcmVzO1xuICAgIHJldHVybiBleHRlbmQodGVhbSwge1xuICAgICAgc3RhdHM6IHtcbiAgICAgICAgY2FsY3M6IHtcbiAgICAgICAgICBwcmVkaWN0ZWRfcnA6IDAsXG4gICAgICAgICAgc2NvcmU6IHNjb3JlXG4gICAgICAgIH0sXG4gICAgICAgIGRlZmVuc2VzOiB7XG4gICAgICAgICAgbG93X2JhcjogZGVmZW5zZXNbMV0sXG4gICAgICAgICAgcG9ydGN1bGxpczogZGVmZW5zZXNbMl0sXG4gICAgICAgICAgY2hldmFsX2RlX2ZyaXNlOiBkZWZlbnNlc1szXSxcbiAgICAgICAgICBtb2F0OiBkZWZlbnNlc1s0XSxcbiAgICAgICAgICByYW1wYXJ0czogZGVmZW5zZXNbNV0sXG4gICAgICAgICAgZHJhd2JyaWRnZTogZGVmZW5zZXNbNl0sXG4gICAgICAgICAgc2FsbHlfcG9ydDogZGVmZW5zZXNbN10sXG4gICAgICAgICAgcm9ja193YWxsOiBkZWZlbnNlc1s4XSxcbiAgICAgICAgICByb3VnaF90ZXJyYWluOiBkZWZlbnNlc1s5XSxcbiAgICAgICAgfSxcbiAgICAgICAgZ29hbHM6IHtcbiAgICAgICAgICBhdXRvX2xvdzogZ29hbHNbMV0sXG4gICAgICAgICAgYXV0b19oaWdoOiBnb2Fsc1syXSxcbiAgICAgICAgICB0ZWxlb3BfbG93OiBnb2Fsc1szXSxcbiAgICAgICAgICB0ZWxlb3BfaGlnaDogZ29hbHNbNF0sXG4gICAgICAgIH0sXG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGVhbXMoQVBJLCBrZXkpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgIHJlc29sdmUoQVBJLmdldChcImxpc3QvXCIra2V5KSk7XG4gIH0pLnRoZW4oZnVuY3Rpb24odGVhbXMpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwodGVhbXMubWFwKHRlYW0gPT4gZ2V0VGVhbVN0YXRzKEFQSSwgdGVhbS50ZWFtX251bWJlciwgdGVhbSkpKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZVRva2VuKHRlYW0sbmFtZSkge1xuICB2YXIgdG9rZW4gPSB0ZWFtICsgXCIuXCIgKyBtZDUobmFtZSk7XG4gIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwidG9rZW5cIix0b2tlbik7XG4gIHJldHVybiB0b2tlbjtcbn1cbiIsImltcG9ydCAnLi9saWIvZXM2LXByb21pc2UubWluLmpzJ1xuaW1wb3J0IFRlbXBsYXRlcyBmcm9tICcuL1RlbXBsYXRlcydcblxuZXhwb3J0IGRlZmF1bHQge1xuICB0ZW1wbGF0ZXM6IHt9LFxuICBjb21wb25lbnRzOiB7fSxcbiAgY3JlYXRlOiBmdW5jdGlvbihkb25lKSB7XG4gICAgdGhpcy5jb21wb25lbnRzLlByb2dyZXNzID0gUmFjdGl2ZS5leHRlbmQoe1xuICAgICAgIGlzb2xhdGVkOiBmYWxzZSxcbiAgICAgICB0ZW1wbGF0ZTogdGhpcy50ZW1wbGF0ZXMucHJvZ3Jlc3MsXG4gICAgICAgb25pbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgIGNvbnN0IHN0YXQgPSB0aGlzLmdldChcInN0YXRcIik7XG4gICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuZ2V0KFwidmFsdWVcIik7XG4gICAgICAgICBsZXQgcHJvZ3Jlc3NDbGFzcztcbiAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBzdGF0LnByb2dyZXNzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgIGlmICgoIXN0YXQucHJvZ3Jlc3NbaV0ubWluIHx8IHZhbHVlID49IHN0YXQucHJvZ3Jlc3NbaV0ubWluKSAmJiAoIXN0YXQucHJvZ3Jlc3NbaV0ubWF4IHx8IHZhbHVlIDw9IHN0YXQucHJvZ3Jlc3NbaV0ubWF4KSkge1xuICAgICAgICAgICAgIHByb2dyZXNzQ2xhc3MgPSBzdGF0LnByb2dyZXNzW2ldLmNsYXNzO1xuICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICB9XG4gICAgICAgICB9XG4gICAgICAgICB0aGlzLnNldCh7XG4gICAgICAgICAgIG1pbjogc3RhdC5taW4sXG4gICAgICAgICAgIG1heDogc3RhdC5tYXgsXG4gICAgICAgICAgIHdpZHRoOiAoc3RhdC5taW4gKyB2YWx1ZSkvc3RhdC5tYXggKiAxMDAsXG4gICAgICAgICAgIHByb2dyZXNzQ2xhc3M6IHByb2dyZXNzQ2xhc3MsXG4gICAgICAgICB9KVxuICAgICAgIH0sXG5cbiAgICB9KTtcbiAgfSxcbiAgbG9hZDogZnVuY3Rpb24oZG9uZSkge1xuICAgIGNvbnN0IF90aGlzID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBUZW1wbGF0ZXMuZ2V0KFwiY29tcG9uZW50c1wiKS50aGVuKGZ1bmN0aW9uKHRlbXBsYXRlcykge1xuICAgICAgICAkKFwiPGRpdj5cIikuaHRtbCh0ZW1wbGF0ZXMpLmZpbmQoXCJzY3JpcHQudGVtcGxhdGVcIikuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICBjb25zdCAkdGhpcyA9ICQodGhpcyk7XG4gICAgICAgICAgX3RoaXMudGVtcGxhdGVzWyR0aGlzLmF0dHIoXCJuYW1lXCIpXSA9ICR0aGlzLmh0bWwoKS50cmltKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBfdGhpcy5jcmVhdGUoKTtcbiAgICAgICAgcmVzb2x2ZShfdGhpcyk7XG4gICAgICB9KS5jYXRjaChyZWplY3QpO1xuICAgIH0pO1xuICB9LFxufTtcbiIsImltcG9ydCAnLi9saWIvZXM2LXByb21pc2UubWluLmpzJ1xuaW1wb3J0IGNhY2hlYWJsZSBmcm9tICcuL2NhY2hlYWJsZSdcblxuZXhwb3J0IGRlZmF1bHQgY2FjaGVhYmxlKGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgaWYobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJ0b2tlblwiKSkge1xuICAgICAgcmVzb2x2ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2NhdGlvbi5oYXNoID0gXCIjL2xvZ2luXCJcbiAgICAgIHJlamVjdCgpO1xuICAgIH1cbiAgfSk7XG59KTtcbiIsImV4cG9ydCAqIGZyb20gJy4vcGFnZXMvdGVhbSdcbmV4cG9ydCAqIGZyb20gJy4vcGFnZXMvZXZlbnQnXG5leHBvcnQgKiBmcm9tICcuL3BhZ2VzL2xvZ2luJ1xuZXhwb3J0ICogZnJvbSAnLi9wYWdlcy9ldmVudHMnXG5leHBvcnQgKiBmcm9tICcuL3BhZ2VzL2V2ZW50TWF0Y2hlcydcbiIsImltcG9ydCAnLi9saWIvZXM2LXByb21pc2UubWluLmpzJ1xuaW1wb3J0IGNhY2hlYWJsZSBmcm9tICcuL2NhY2hlYWJsZSdcblxuZXhwb3J0IGRlZmF1bHQgY2FjaGVhYmxlKGZ1bmN0aW9uKGtleSkge1xuICBjb25zdCB1cmwgPSBcInRlbXBsYXRlcy9cIitrZXkrXCIuaHRtbFwiO1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgcmV0dXJuICQuYWpheCh7XG4gICAgICBtZXRob2Q6IFwiZ2V0XCIsXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGVycm9yOiByZWplY3RcbiAgICB9KS50aGVuKHJlc29sdmUpO1xuICB9KS5jYXRjaChmdW5jdGlvbihyZXMpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiVGVtcGxhdGUgUmVxdWVzdCBVbnN1Y2Nlc3NmdWxcIiwgdXJsLCByZXMpO1xuICAgIHJldHVybiByZXM7XG4gIH0pO1xufSk7XG4iLCJpbXBvcnQgJy4vbGliL2VzNi1wcm9taXNlLm1pbi5qcydcbmltcG9ydCBjYWNoZWFibGUgZnJvbSAnLi9jYWNoZWFibGUnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNhY2hlYWJsZShnZXRQcm9taXNlKSB7XG4gIGNvbnN0IF9jYWNoZSA9IHt9O1xuXG4gIGZ1bmN0aW9uIHNldChrZXksIHZhbHVlKSB7XG4gICAgcmV0dXJuIF9jYWNoZVtrZXldID0gdmFsdWU7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGdldChrZXksIGNhbGxiYWNrKSB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGlmIChfY2FjaGVba2V5XSkge1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKF9jYWNoZVtrZXldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdldFByb21pc2Uoa2V5KVxuICAgICAgICAgIC50aGVuKHZhbHVlID0+IHNldChrZXksIHZhbHVlKSlcbiAgICAgICAgICAudGhlbihyZXNvbHZlKVxuICAgICAgICAgIC5jYXRjaChyZWplY3QpO1xuXG4gICAgICB9KS50aGVuKGNhbGxiYWNrKTtcbiAgICB9LFxuICB9XG59XG4iLCJpbXBvcnQgJy4vbGliL2VzNi1wcm9taXNlLm1pbi5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIGdldEpTT04odXJsKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgJC5hamF4KHtcbiAgICAgIG1ldGhvZDogXCJnZXRcIixcbiAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcbiAgICAgIGRhdGE6IHt9LFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBlcnJvcjogcmVqZWN0XG4gICAgfSkudGhlbihyZXNvbHZlKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByb3VuZChuLCBkaWdpdHMpIHtcbiAgY29uc3QgbiA9IHBhcnNlRmxvYXQobik7XG4gIGNvbnN0IGRpZ2l0cyA9IHBhcnNlSW50KGRpZ2l0cyk7XG4gIGNvbnN0IHBhcnRzID0gKE1hdGgucm91bmQobiAqIE1hdGgucG93KDEwLCBkaWdpdHMpKS9NYXRoLnBvdygxMCwgZGlnaXRzKSkudG9TdHJpbmcoKS5zcGxpdChcIi5cIik7XG4gIGlmIChwYXJ0cy5sZW5ndGggPT0gMSkge1xuICAgIHBhcnRzLnB1c2goXCJcIik7XG4gIH1cbiAgcmV0dXJuIHBhcnRzWzBdICsgKGRpZ2l0cyA/IFwiLlwiIDogXCJcIikgKyBwYXJ0c1sxXSArIEFycmF5KE1hdGgubWF4KDAsIGRpZ2l0cyAtIHBhcnRzWzFdLmxlbmd0aCArIDEpKS5qb2luKFwiMFwiKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRvY3VtZW50UmVhZHkoKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICBpZiAoJC5pc1JlYWR5KSB7XG4gICAgICByZXNvbHZlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICQocmVzb2x2ZSk7XG4gICAgfVxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4dGVuZCgpIHtcbiAgY29uc3QgcmVzdWx0ID0gYXJndW1lbnRzWzBdO1xuICBmb3IobGV0IGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgZm9yKGxldCBrZXkgaW4gYXJndW1lbnRzW2ldKSB7XG4gICAgICByZXN1bHRba2V5XSA9IGFyZ3VtZW50c1tpXVtrZXldO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCl7XG4vKiFcbiAqIEBvdmVydmlldyBlczYtcHJvbWlzZSAtIGEgdGlueSBpbXBsZW1lbnRhdGlvbiBvZiBQcm9taXNlcy9BKy5cbiAqIEBjb3B5cmlnaHQgQ29weXJpZ2h0IChjKSAyMDE0IFllaHVkYSBLYXR6LCBUb20gRGFsZSwgU3RlZmFuIFBlbm5lciBhbmQgY29udHJpYnV0b3JzIChDb252ZXJzaW9uIHRvIEVTNiBBUEkgYnkgSmFrZSBBcmNoaWJhbGQpXG4gKiBAbGljZW5zZSAgIExpY2Vuc2VkIHVuZGVyIE1JVCBsaWNlbnNlXG4gKiAgICAgICAgICAgIFNlZSBodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vamFrZWFyY2hpYmFsZC9lczYtcHJvbWlzZS9tYXN0ZXIvTElDRU5TRVxuICogQHZlcnNpb24gICAzLjIuMVxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG4oZnVuY3Rpb24gKCkge1xuICBcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiB0KHQpIHtcbiAgICByZXR1cm4gXCJmdW5jdGlvblwiID09IHR5cGVvZiB0IHx8IFwib2JqZWN0XCIgPT0gdHlwZW9mIHQgJiYgbnVsbCAhPT0gdDtcbiAgfWZ1bmN0aW9uIGUodCkge1xuICAgIHJldHVybiBcImZ1bmN0aW9uXCIgPT0gdHlwZW9mIHQ7XG4gIH1mdW5jdGlvbiBuKHQpIHtcbiAgICBHID0gdDtcbiAgfWZ1bmN0aW9uIHIodCkge1xuICAgIFEgPSB0O1xuICB9ZnVuY3Rpb24gbygpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhhKTtcbiAgICB9O1xuICB9ZnVuY3Rpb24gaSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgQihhKTtcbiAgICB9O1xuICB9ZnVuY3Rpb24gcygpIHtcbiAgICB2YXIgdCA9IDAsXG4gICAgICAgIGUgPSBuZXcgWChhKSxcbiAgICAgICAgbiA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiXCIpO3JldHVybiAoZS5vYnNlcnZlKG4sIHsgY2hhcmFjdGVyRGF0YTogITAgfSksIGZ1bmN0aW9uICgpIHtcbiAgICAgIG4uZGF0YSA9IHQgPSArK3QgJSAyO1xuICAgIH0pO1xuICB9ZnVuY3Rpb24gdSgpIHtcbiAgICB2YXIgdCA9IG5ldyBNZXNzYWdlQ2hhbm5lbCgpO3JldHVybiAodC5wb3J0MS5vbm1lc3NhZ2UgPSBhLCBmdW5jdGlvbiAoKSB7XG4gICAgICB0LnBvcnQyLnBvc3RNZXNzYWdlKDApO1xuICAgIH0pO1xuICB9ZnVuY3Rpb24gYygpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgc2V0VGltZW91dChhLCAxKTtcbiAgICB9O1xuICB9ZnVuY3Rpb24gYSgpIHtcbiAgICBmb3IgKHZhciB0ID0gMDsgSiA+IHQ7IHQgKz0gMikge1xuICAgICAgdmFyIGUgPSB0dFt0XSxcbiAgICAgICAgICBuID0gdHRbdCArIDFdO2UobiksIHR0W3RdID0gdm9pZCAwLCB0dFt0ICsgMV0gPSB2b2lkIDA7XG4gICAgfUogPSAwO1xuICB9ZnVuY3Rpb24gZigpIHtcbiAgICB0cnkge1xuICAgICAgdmFyIHQgPSByZXF1aXJlLFxuICAgICAgICAgIGUgPSB0KFwidmVydHhcIik7cmV0dXJuIChCID0gZS5ydW5Pbkxvb3AgfHwgZS5ydW5PbkNvbnRleHQsIGkoKSk7XG4gICAgfSBjYXRjaCAobikge1xuICAgICAgcmV0dXJuIGMoKTtcbiAgICB9XG4gIH1mdW5jdGlvbiBsKHQsIGUpIHtcbiAgICB2YXIgbiA9IHRoaXMsXG4gICAgICAgIHIgPSBuZXcgdGhpcy5jb25zdHJ1Y3RvcihwKTt2b2lkIDAgPT09IHJbcnRdICYmIGsocik7dmFyIG8gPSBuLl9zdGF0ZTtpZiAobykge1xuICAgICAgdmFyIGkgPSBhcmd1bWVudHNbbyAtIDFdO1EoZnVuY3Rpb24gKCkge1xuICAgICAgICB4KG8sIHIsIGksIG4uX3Jlc3VsdCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2UgRShuLCByLCB0LCBlKTtyZXR1cm4gcjtcbiAgfWZ1bmN0aW9uIGgodCkge1xuICAgIHZhciBlID0gdGhpcztpZiAodCAmJiBcIm9iamVjdFwiID09IHR5cGVvZiB0ICYmIHQuY29uc3RydWN0b3IgPT09IGUpIHtcbiAgICAgIHJldHVybiB0O1xuICAgIH12YXIgbiA9IG5ldyBlKHApO3JldHVybiAoZyhuLCB0KSwgbik7XG4gIH1mdW5jdGlvbiBwKCkge31mdW5jdGlvbiBfKCkge1xuICAgIHJldHVybiBuZXcgVHlwZUVycm9yKFwiWW91IGNhbm5vdCByZXNvbHZlIGEgcHJvbWlzZSB3aXRoIGl0c2VsZlwiKTtcbiAgfWZ1bmN0aW9uIGQoKSB7XG4gICAgcmV0dXJuIG5ldyBUeXBlRXJyb3IoXCJBIHByb21pc2VzIGNhbGxiYWNrIGNhbm5vdCByZXR1cm4gdGhhdCBzYW1lIHByb21pc2UuXCIpO1xuICB9ZnVuY3Rpb24gdih0KSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB0LnRoZW47XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuICh1dC5lcnJvciA9IGUsIHV0KTtcbiAgICB9XG4gIH1mdW5jdGlvbiB5KHQsIGUsIG4sIHIpIHtcbiAgICB0cnkge1xuICAgICAgdC5jYWxsKGUsIG4sIHIpO1xuICAgIH0gY2F0Y2ggKG8pIHtcbiAgICAgIHJldHVybiBvO1xuICAgIH1cbiAgfWZ1bmN0aW9uIG0odCwgZSwgbikge1xuICAgIFEoZnVuY3Rpb24gKHQpIHtcbiAgICAgIHZhciByID0gITEsXG4gICAgICAgICAgbyA9IHkobiwgZSwgZnVuY3Rpb24gKG4pIHtcbiAgICAgICAgciB8fCAociA9ICEwLCBlICE9PSBuID8gZyh0LCBuKSA6IFModCwgbikpO1xuICAgICAgfSwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgciB8fCAociA9ICEwLCBqKHQsIGUpKTtcbiAgICAgIH0sIFwiU2V0dGxlOiBcIiArICh0Ll9sYWJlbCB8fCBcIiB1bmtub3duIHByb21pc2VcIikpOyFyICYmIG8gJiYgKHIgPSAhMCwgaih0LCBvKSk7XG4gICAgfSwgdCk7XG4gIH1mdW5jdGlvbiBiKHQsIGUpIHtcbiAgICBlLl9zdGF0ZSA9PT0gaXQgPyBTKHQsIGUuX3Jlc3VsdCkgOiBlLl9zdGF0ZSA9PT0gc3QgPyBqKHQsIGUuX3Jlc3VsdCkgOiBFKGUsIHZvaWQgMCwgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGcodCwgZSk7XG4gICAgfSwgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGoodCwgZSk7XG4gICAgfSk7XG4gIH1mdW5jdGlvbiB3KHQsIG4sIHIpIHtcbiAgICBuLmNvbnN0cnVjdG9yID09PSB0LmNvbnN0cnVjdG9yICYmIHIgPT09IGV0ICYmIGNvbnN0cnVjdG9yLnJlc29sdmUgPT09IG50ID8gYih0LCBuKSA6IHIgPT09IHV0ID8gaih0LCB1dC5lcnJvcikgOiB2b2lkIDAgPT09IHIgPyBTKHQsIG4pIDogZShyKSA/IG0odCwgbiwgcikgOiBTKHQsIG4pO1xuICB9ZnVuY3Rpb24gZyhlLCBuKSB7XG4gICAgZSA9PT0gbiA/IGooZSwgXygpKSA6IHQobikgPyB3KGUsIG4sIHYobikpIDogUyhlLCBuKTtcbiAgfWZ1bmN0aW9uIEEodCkge1xuICAgIHQuX29uZXJyb3IgJiYgdC5fb25lcnJvcih0Ll9yZXN1bHQpLCBUKHQpO1xuICB9ZnVuY3Rpb24gUyh0LCBlKSB7XG4gICAgdC5fc3RhdGUgPT09IG90ICYmICh0Ll9yZXN1bHQgPSBlLCB0Ll9zdGF0ZSA9IGl0LCAwICE9PSB0Ll9zdWJzY3JpYmVycy5sZW5ndGggJiYgUShULCB0KSk7XG4gIH1mdW5jdGlvbiBqKHQsIGUpIHtcbiAgICB0Ll9zdGF0ZSA9PT0gb3QgJiYgKHQuX3N0YXRlID0gc3QsIHQuX3Jlc3VsdCA9IGUsIFEoQSwgdCkpO1xuICB9ZnVuY3Rpb24gRSh0LCBlLCBuLCByKSB7XG4gICAgdmFyIG8gPSB0Ll9zdWJzY3JpYmVycyxcbiAgICAgICAgaSA9IG8ubGVuZ3RoO3QuX29uZXJyb3IgPSBudWxsLCBvW2ldID0gZSwgb1tpICsgaXRdID0gbiwgb1tpICsgc3RdID0gciwgMCA9PT0gaSAmJiB0Ll9zdGF0ZSAmJiBRKFQsIHQpO1xuICB9ZnVuY3Rpb24gVCh0KSB7XG4gICAgdmFyIGUgPSB0Ll9zdWJzY3JpYmVycyxcbiAgICAgICAgbiA9IHQuX3N0YXRlO2lmICgwICE9PSBlLmxlbmd0aCkge1xuICAgICAgZm9yICh2YXIgciwgbywgaSA9IHQuX3Jlc3VsdCwgcyA9IDA7IHMgPCBlLmxlbmd0aDsgcyArPSAzKSByID0gZVtzXSwgbyA9IGVbcyArIG5dLCByID8geChuLCByLCBvLCBpKSA6IG8oaSk7dC5fc3Vic2NyaWJlcnMubGVuZ3RoID0gMDtcbiAgICB9XG4gIH1mdW5jdGlvbiBNKCkge1xuICAgIHRoaXMuZXJyb3IgPSBudWxsO1xuICB9ZnVuY3Rpb24gUCh0LCBlKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB0KGUpO1xuICAgIH0gY2F0Y2ggKG4pIHtcbiAgICAgIHJldHVybiAoY3QuZXJyb3IgPSBuLCBjdCk7XG4gICAgfVxuICB9ZnVuY3Rpb24geCh0LCBuLCByLCBvKSB7XG4gICAgdmFyIGksXG4gICAgICAgIHMsXG4gICAgICAgIHUsXG4gICAgICAgIGMsXG4gICAgICAgIGEgPSBlKHIpO2lmIChhKSB7XG4gICAgICBpZiAoKGkgPSBQKHIsIG8pLCBpID09PSBjdCA/IChjID0gITAsIHMgPSBpLmVycm9yLCBpID0gbnVsbCkgOiB1ID0gITAsIG4gPT09IGkpKSB7XG4gICAgICAgIHJldHVybiB2b2lkIGoobiwgZCgpKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaSA9IG8sIHUgPSAhMDtuLl9zdGF0ZSAhPT0gb3QgfHwgKGEgJiYgdSA/IGcobiwgaSkgOiBjID8gaihuLCBzKSA6IHQgPT09IGl0ID8gUyhuLCBpKSA6IHQgPT09IHN0ICYmIGoobiwgaSkpO1xuICB9ZnVuY3Rpb24gQyh0LCBlKSB7XG4gICAgdHJ5IHtcbiAgICAgIGUoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZyh0LCBlKTtcbiAgICAgIH0sIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGoodCwgZSk7XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChuKSB7XG4gICAgICBqKHQsIG4pO1xuICAgIH1cbiAgfWZ1bmN0aW9uIE8oKSB7XG4gICAgcmV0dXJuIGF0Kys7XG4gIH1mdW5jdGlvbiBrKHQpIHtcbiAgICB0W3J0XSA9IGF0KyssIHQuX3N0YXRlID0gdm9pZCAwLCB0Ll9yZXN1bHQgPSB2b2lkIDAsIHQuX3N1YnNjcmliZXJzID0gW107XG4gIH1mdW5jdGlvbiBZKHQpIHtcbiAgICByZXR1cm4gbmV3IF90KHRoaXMsIHQpLnByb21pc2U7XG4gIH1mdW5jdGlvbiBxKHQpIHtcbiAgICB2YXIgZSA9IHRoaXM7cmV0dXJuIG5ldyBlKEkodCkgPyBmdW5jdGlvbiAobiwgcikge1xuICAgICAgZm9yICh2YXIgbyA9IHQubGVuZ3RoLCBpID0gMDsgbyA+IGk7IGkrKykgZS5yZXNvbHZlKHRbaV0pLnRoZW4obiwgcik7XG4gICAgfSA6IGZ1bmN0aW9uICh0LCBlKSB7XG4gICAgICBlKG5ldyBUeXBlRXJyb3IoXCJZb3UgbXVzdCBwYXNzIGFuIGFycmF5IHRvIHJhY2UuXCIpKTtcbiAgICB9KTtcbiAgfWZ1bmN0aW9uIEYodCkge1xuICAgIHZhciBlID0gdGhpcyxcbiAgICAgICAgbiA9IG5ldyBlKHApO3JldHVybiAoaihuLCB0KSwgbik7XG4gIH1mdW5jdGlvbiBEKCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJZb3UgbXVzdCBwYXNzIGEgcmVzb2x2ZXIgZnVuY3Rpb24gYXMgdGhlIGZpcnN0IGFyZ3VtZW50IHRvIHRoZSBwcm9taXNlIGNvbnN0cnVjdG9yXCIpO1xuICB9ZnVuY3Rpb24gSygpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRmFpbGVkIHRvIGNvbnN0cnVjdCAnUHJvbWlzZSc6IFBsZWFzZSB1c2UgdGhlICduZXcnIG9wZXJhdG9yLCB0aGlzIG9iamVjdCBjb25zdHJ1Y3RvciBjYW5ub3QgYmUgY2FsbGVkIGFzIGEgZnVuY3Rpb24uXCIpO1xuICB9ZnVuY3Rpb24gTCh0KSB7XG4gICAgdGhpc1tydF0gPSBPKCksIHRoaXMuX3Jlc3VsdCA9IHRoaXMuX3N0YXRlID0gdm9pZCAwLCB0aGlzLl9zdWJzY3JpYmVycyA9IFtdLCBwICE9PSB0ICYmIChcImZ1bmN0aW9uXCIgIT0gdHlwZW9mIHQgJiYgRCgpLCB0aGlzIGluc3RhbmNlb2YgTCA/IEModGhpcywgdCkgOiBLKCkpO1xuICB9ZnVuY3Rpb24gTih0LCBlKSB7XG4gICAgdGhpcy5faW5zdGFuY2VDb25zdHJ1Y3RvciA9IHQsIHRoaXMucHJvbWlzZSA9IG5ldyB0KHApLCB0aGlzLnByb21pc2VbcnRdIHx8IGsodGhpcy5wcm9taXNlKSwgQXJyYXkuaXNBcnJheShlKSA/ICh0aGlzLl9pbnB1dCA9IGUsIHRoaXMubGVuZ3RoID0gZS5sZW5ndGgsIHRoaXMuX3JlbWFpbmluZyA9IGUubGVuZ3RoLCB0aGlzLl9yZXN1bHQgPSBuZXcgQXJyYXkodGhpcy5sZW5ndGgpLCAwID09PSB0aGlzLmxlbmd0aCA/IFModGhpcy5wcm9taXNlLCB0aGlzLl9yZXN1bHQpIDogKHRoaXMubGVuZ3RoID0gdGhpcy5sZW5ndGggfHwgMCwgdGhpcy5fZW51bWVyYXRlKCksIDAgPT09IHRoaXMuX3JlbWFpbmluZyAmJiBTKHRoaXMucHJvbWlzZSwgdGhpcy5fcmVzdWx0KSkpIDogaih0aGlzLnByb21pc2UsIFUoKSk7XG4gIH1mdW5jdGlvbiBVKCkge1xuICAgIHJldHVybiBuZXcgRXJyb3IoXCJBcnJheSBNZXRob2RzIG11c3QgYmUgcHJvdmlkZWQgYW4gQXJyYXlcIik7XG4gIH1mdW5jdGlvbiBXKCkge1xuICAgIHZhciB0O2lmIChcInVuZGVmaW5lZFwiICE9IHR5cGVvZiBnbG9iYWwpIHQgPSBnbG9iYWw7ZWxzZSBpZiAoXCJ1bmRlZmluZWRcIiAhPSB0eXBlb2Ygc2VsZikgdCA9IHNlbGY7ZWxzZSB0cnkge1xuICAgICAgdCA9IEZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJwb2x5ZmlsbCBmYWlsZWQgYmVjYXVzZSBnbG9iYWwgb2JqZWN0IGlzIHVuYXZhaWxhYmxlIGluIHRoaXMgZW52aXJvbm1lbnRcIik7XG4gICAgfXZhciBuID0gdC5Qcm9taXNlOyghbiB8fCBcIltvYmplY3QgUHJvbWlzZV1cIiAhPT0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG4ucmVzb2x2ZSgpKSB8fCBuLmNhc3QpICYmICh0LlByb21pc2UgPSBwdCk7XG4gIH12YXIgejt6ID0gQXJyYXkuaXNBcnJheSA/IEFycmF5LmlzQXJyYXkgOiBmdW5jdGlvbiAodCkge1xuICAgIHJldHVybiBcIltvYmplY3QgQXJyYXldXCIgPT09IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0KTtcbiAgfTt2YXIgQixcbiAgICAgIEcsXG4gICAgICBILFxuICAgICAgSSA9IHosXG4gICAgICBKID0gMCxcbiAgICAgIFEgPSBmdW5jdGlvbiBRKHQsIGUpIHtcbiAgICB0dFtKXSA9IHQsIHR0W0ogKyAxXSA9IGUsIEogKz0gMiwgMiA9PT0gSiAmJiAoRyA/IEcoYSkgOiBIKCkpO1xuICB9LFxuICAgICAgUiA9IFwidW5kZWZpbmVkXCIgIT0gdHlwZW9mIHdpbmRvdyA/IHdpbmRvdyA6IHZvaWQgMCxcbiAgICAgIFYgPSBSIHx8IHt9LFxuICAgICAgWCA9IFYuTXV0YXRpb25PYnNlcnZlciB8fCBWLldlYktpdE11dGF0aW9uT2JzZXJ2ZXIsXG4gICAgICBaID0gXCJ1bmRlZmluZWRcIiA9PSB0eXBlb2Ygc2VsZiAmJiBcInVuZGVmaW5lZFwiICE9IHR5cGVvZiBwcm9jZXNzICYmIFwiW29iamVjdCBwcm9jZXNzXVwiID09PSAoe30pLnRvU3RyaW5nLmNhbGwocHJvY2VzcyksXG4gICAgICAkID0gXCJ1bmRlZmluZWRcIiAhPSB0eXBlb2YgVWludDhDbGFtcGVkQXJyYXkgJiYgXCJ1bmRlZmluZWRcIiAhPSB0eXBlb2YgaW1wb3J0U2NyaXB0cyAmJiBcInVuZGVmaW5lZFwiICE9IHR5cGVvZiBNZXNzYWdlQ2hhbm5lbCxcbiAgICAgIHR0ID0gbmV3IEFycmF5KDEwMDApO0ggPSBaID8gbygpIDogWCA/IHMoKSA6ICQgPyB1KCkgOiB2b2lkIDAgPT09IFIgJiYgXCJmdW5jdGlvblwiID09IHR5cGVvZiByZXF1aXJlID8gZigpIDogYygpO3ZhciBldCA9IGwsXG4gICAgICBudCA9IGgsXG4gICAgICBydCA9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygxNiksXG4gICAgICBvdCA9IHZvaWQgMCxcbiAgICAgIGl0ID0gMSxcbiAgICAgIHN0ID0gMixcbiAgICAgIHV0ID0gbmV3IE0oKSxcbiAgICAgIGN0ID0gbmV3IE0oKSxcbiAgICAgIGF0ID0gMCxcbiAgICAgIGZ0ID0gWSxcbiAgICAgIGx0ID0gcSxcbiAgICAgIGh0ID0gRixcbiAgICAgIHB0ID0gTDtMLmFsbCA9IGZ0LCBMLnJhY2UgPSBsdCwgTC5yZXNvbHZlID0gbnQsIEwucmVqZWN0ID0gaHQsIEwuX3NldFNjaGVkdWxlciA9IG4sIEwuX3NldEFzYXAgPSByLCBMLl9hc2FwID0gUSwgTC5wcm90b3R5cGUgPSB7IGNvbnN0cnVjdG9yOiBMLCB0aGVuOiBldCwgXCJjYXRjaFwiOiBmdW5jdGlvbiBfY2F0Y2godCkge1xuICAgICAgcmV0dXJuIHRoaXMudGhlbihudWxsLCB0KTtcbiAgICB9IH07dmFyIF90ID0gTjtOLnByb3RvdHlwZS5fZW51bWVyYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIGZvciAodmFyIHQgPSB0aGlzLmxlbmd0aCwgZSA9IHRoaXMuX2lucHV0LCBuID0gMDsgdGhpcy5fc3RhdGUgPT09IG90ICYmIHQgPiBuOyBuKyspIHRoaXMuX2VhY2hFbnRyeShlW25dLCBuKTtcbiAgfSwgTi5wcm90b3R5cGUuX2VhY2hFbnRyeSA9IGZ1bmN0aW9uICh0LCBlKSB7XG4gICAgdmFyIG4gPSB0aGlzLl9pbnN0YW5jZUNvbnN0cnVjdG9yLFxuICAgICAgICByID0gbi5yZXNvbHZlO2lmIChyID09PSBudCkge1xuICAgICAgdmFyIG8gPSB2KHQpO2lmIChvID09PSBldCAmJiB0Ll9zdGF0ZSAhPT0gb3QpIHRoaXMuX3NldHRsZWRBdCh0Ll9zdGF0ZSwgZSwgdC5fcmVzdWx0KTtlbHNlIGlmIChcImZ1bmN0aW9uXCIgIT0gdHlwZW9mIG8pIHRoaXMuX3JlbWFpbmluZy0tLCB0aGlzLl9yZXN1bHRbZV0gPSB0O2Vsc2UgaWYgKG4gPT09IHB0KSB7XG4gICAgICAgIHZhciBpID0gbmV3IG4ocCk7dyhpLCB0LCBvKSwgdGhpcy5fd2lsbFNldHRsZUF0KGksIGUpO1xuICAgICAgfSBlbHNlIHRoaXMuX3dpbGxTZXR0bGVBdChuZXcgbihmdW5jdGlvbiAoZSkge1xuICAgICAgICBlKHQpO1xuICAgICAgfSksIGUpO1xuICAgIH0gZWxzZSB0aGlzLl93aWxsU2V0dGxlQXQocih0KSwgZSk7XG4gIH0sIE4ucHJvdG90eXBlLl9zZXR0bGVkQXQgPSBmdW5jdGlvbiAodCwgZSwgbikge1xuICAgIHZhciByID0gdGhpcy5wcm9taXNlO3IuX3N0YXRlID09PSBvdCAmJiAodGhpcy5fcmVtYWluaW5nLS0sIHQgPT09IHN0ID8gaihyLCBuKSA6IHRoaXMuX3Jlc3VsdFtlXSA9IG4pLCAwID09PSB0aGlzLl9yZW1haW5pbmcgJiYgUyhyLCB0aGlzLl9yZXN1bHQpO1xuICB9LCBOLnByb3RvdHlwZS5fd2lsbFNldHRsZUF0ID0gZnVuY3Rpb24gKHQsIGUpIHtcbiAgICB2YXIgbiA9IHRoaXM7RSh0LCB2b2lkIDAsIGZ1bmN0aW9uICh0KSB7XG4gICAgICBuLl9zZXR0bGVkQXQoaXQsIGUsIHQpO1xuICAgIH0sIGZ1bmN0aW9uICh0KSB7XG4gICAgICBuLl9zZXR0bGVkQXQoc3QsIGUsIHQpO1xuICAgIH0pO1xuICB9O3ZhciBkdCA9IFcsXG4gICAgICB2dCA9IHsgUHJvbWlzZTogcHQsIHBvbHlmaWxsOiBkdCB9O1wiZnVuY3Rpb25cIiA9PSB0eXBlb2YgZGVmaW5lICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB2dDtcbiAgfSkgOiBcInVuZGVmaW5lZFwiICE9IHR5cGVvZiBtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMgPyBtb2R1bGUuZXhwb3J0cyA9IHZ0IDogXCJ1bmRlZmluZWRcIiAhPSB0eXBlb2YgdGhpcyAmJiAodGhpcy5FUzZQcm9taXNlID0gdnQpLCBkdCgpO1xufSkuY2FsbCh1bmRlZmluZWQpO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZSgnX3Byb2Nlc3MnKSx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ6dXRmLTg7YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiSWk5b2IyMWxMMlJoYm1sbGJDOUViMk4xYldWdWRITXZjSEp2YW1WamRITXZiM0ppTFdOc2FXVnVkQzl6Y21NdmJHbGlMMlZ6Tmkxd2NtOXRhWE5sTG0xcGJpNXFjeUpkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lPenM3T3pzN096czdPenRCUVZGQkxFTkJRVU1zV1VGQlZUdEJRVUZETEdOQlFWa3NRMEZCUXl4VFFVRlRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU03UVVGQlF5eFhRVUZOTEZWQlFWVXNTVUZCUlN4UFFVRlBMRU5CUVVNc1NVRkJSU3hSUVVGUkxFbEJRVVVzVDBGQlR5eERRVUZETEVsQlFVVXNTVUZCU1N4TFFVRkhMRU5CUVVNc1EwRkJRVHRIUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXp0QlFVRkRMRmRCUVUwc1ZVRkJWU3hKUVVGRkxFOUJRVThzUTBGQlF5eERRVUZCTzBkQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRE8wRkJRVU1zUzBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUVR0SFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF6dEJRVUZETEV0QlFVTXNSMEZCUXl4RFFVRkRMRU5CUVVFN1IwRkJReXhUUVVGVExFTkJRVU1zUjBGQlJUdEJRVUZETEZkQlFVOHNXVUZCVlR0QlFVRkRMR0ZCUVU4c1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVRTdTMEZCUXl4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFZEJRVVU3UVVGQlF5eFhRVUZQTEZsQlFWVTdRVUZCUXl4UFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVUU3UzBGQlF5eERRVUZCTzBkQlFVTXNVMEZCVXl4RFFVRkRMRWRCUVVVN1FVRkJReXhSUVVGSkxFTkJRVU1zUjBGQlF5eERRVUZETzFGQlFVTXNRMEZCUXl4SFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFJRVUZETEVOQlFVTXNSMEZCUXl4UlFVRlJMRU5CUVVNc1kwRkJZeXhEUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETEZGQlFVOHNRMEZCUXl4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRExFVkJRVU1zUlVGQlF5eGhRVUZoTEVWQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRExGbEJRVlU3UVVGQlF5eFBRVUZETEVOQlFVTXNTVUZCU1N4SFFVRkRMRU5CUVVNc1IwRkJReXhGUVVGRkxFTkJRVU1zUjBGQlF5eERRVUZETEVOQlFVRTdTMEZCUXl4RFFVRkJMRU5CUVVFN1IwRkJReXhUUVVGVExFTkJRVU1zUjBGQlJUdEJRVUZETEZGQlFVa3NRMEZCUXl4SFFVRkRMRWxCUVVrc1kwRkJZeXhGUVVGQkxFTkJRVU1zVVVGQlR5eERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRMRk5CUVZNc1IwRkJReXhEUVVGRExFVkJRVU1zV1VGQlZUdEJRVUZETEU5QlFVTXNRMEZCUXl4TFFVRkxMRU5CUVVNc1YwRkJWeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZCTzB0QlFVTXNRMEZCUVN4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFZEJRVVU3UVVGQlF5eFhRVUZQTEZsQlFWVTdRVUZCUXl4blFrRkJWU3hEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUVR0TFFVRkRMRU5CUVVFN1IwRkJReXhUUVVGVExFTkJRVU1zUjBGQlJUdEJRVUZETEZOQlFVa3NTVUZCU1N4RFFVRkRMRWRCUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4SlFVRkZMRU5CUVVNc1JVRkJRenRCUVVGRExGVkJRVWtzUTBGQlF5eEhRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNN1ZVRkJReXhEUVVGRExFZEJRVU1zUlVGQlJTeERRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGRExFdEJRVXNzUTBGQlF5eEZRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGRExFZEJRVU1zUzBGQlN5eERRVUZETEVOQlFVRTdTMEZCUXl4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVkQlFVVTdRVUZCUXl4UlFVRkhPMEZCUVVNc1ZVRkJTU3hEUVVGRExFZEJRVU1zVDBGQlR6dFZRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zVVVGQlR5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRk5CUVZNc1NVRkJSU3hEUVVGRExFTkJRVU1zV1VGQldTeEZRVUZETEVOQlFVTXNSVUZCUlN4RFFVRkJMRU5CUVVFN1MwRkJReXhEUVVGQkxFOUJRVTBzUTBGQlF5eEZRVUZETzBGQlFVTXNZVUZCVHl4RFFVRkRMRVZCUVVVc1EwRkJRVHRMUVVGRE8wZEJRVU1zVTBGQlV5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1JVRkJRenRCUVVGRExGRkJRVWtzUTBGQlF5eEhRVUZETEVsQlFVazdVVUZCUXl4RFFVRkRMRWRCUVVNc1NVRkJTU3hKUVVGSkxFTkJRVU1zVjBGQlZ5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRXRCUVVzc1EwRkJReXhMUVVGSExFTkJRVU1zUTBGQlF5eEZRVUZGTEVOQlFVTXNTVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRTFCUVUwc1EwRkJReXhKUVVGSExFTkJRVU1zUlVGQlF6dEJRVUZETEZWQlFVa3NRMEZCUXl4SFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRmxCUVZVN1FVRkJReXhUUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFOUJRVThzUTBGQlF5eERRVUZCTzA5QlFVTXNRMEZCUXl4RFFVRkJPMHRCUVVNc1RVRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVRTdSMEZCUXl4VFFVRlRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU03UVVGQlF5eFJRVUZKTEVOQlFVTXNSMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJSeXhEUVVGRExFbEJRVVVzVVVGQlVTeEpRVUZGTEU5QlFVOHNRMEZCUXl4SlFVRkZMRU5CUVVNc1EwRkJReXhYUVVGWExFdEJRVWNzUTBGQlF6dEJRVUZETEdGQlFVOHNRMEZCUXl4RFFVRkRPMHRCUVVFc1NVRkJTU3hEUVVGRExFZEJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1VVRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1EwRkJRU3hEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVkQlFVVXNSVUZCUlN4VFFVRlRMRU5CUVVNc1IwRkJSVHRCUVVGRExGZEJRVThzU1VGQlNTeFRRVUZUTEVOQlFVTXNNRU5CUVRCRExFTkJRVU1zUTBGQlFUdEhRVUZETEZOQlFWTXNRMEZCUXl4SFFVRkZPMEZCUVVNc1YwRkJUeXhKUVVGSkxGTkJRVk1zUTBGQlF5eHpSRUZCYzBRc1EwRkJReXhEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRPMEZCUVVNc1VVRkJSenRCUVVGRExHRkJRVThzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUVR0TFFVRkRMRU5CUVVFc1QwRkJUU3hEUVVGRExFVkJRVU03UVVGQlF5eGpRVUZQTEVWQlFVVXNRMEZCUXl4TFFVRkxMRWRCUVVNc1EwRkJReXhGUVVGRExFVkJRVVVzUTBGQlFTeERRVUZCTzB0QlFVTTdSMEZCUXl4VFFVRlRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNN1FVRkJReXhSUVVGSE8wRkJRVU1zVDBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUTBGQlF5eERRVUZCTzB0QlFVTXNRMEZCUVN4UFFVRk5MRU5CUVVNc1JVRkJRenRCUVVGRExHRkJRVThzUTBGQlF5eERRVUZCTzB0QlFVTTdSMEZCUXl4VFFVRlRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXp0QlFVRkRMRXRCUVVNc1EwRkJReXhWUVVGVExFTkJRVU1zUlVGQlF6dEJRVUZETEZWQlFVa3NRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJRenRWUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1JVRkJReXhWUVVGVExFTkJRVU1zUlVGQlF6dEJRVUZETEZOQlFVTXNTMEZCUnl4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eExRVUZITEVOQlFVTXNSMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFTkJRVUVzUVVGQlF5eERRVUZCTzA5QlFVTXNSVUZCUXl4VlFVRlRMRU5CUVVNc1JVRkJRenRCUVVGRExGTkJRVU1zUzBGQlJ5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUVN4QlFVRkRMRU5CUVVFN1QwRkJReXhGUVVGRExGVkJRVlVzU1VGQlJTeERRVUZETEVOQlFVTXNUVUZCVFN4SlFVRkZMR3RDUVVGclFpeERRVUZCTEVGQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhKUVVGRkxFTkJRVU1zUzBGQlJ5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUVN4QlFVRkRMRU5CUVVFN1MwRkJReXhGUVVGRExFTkJRVU1zUTBGQlF5eERRVUZCTzBkQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF6dEJRVUZETEV0QlFVTXNRMEZCUXl4TlFVRk5MRXRCUVVjc1JVRkJSU3hIUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRTlCUVU4c1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eE5RVUZOTEV0QlFVY3NSVUZCUlN4SFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEU5QlFVOHNRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUzBGQlN5eERRVUZETEVWQlFVTXNWVUZCVXl4RFFVRkRMRVZCUVVNN1FVRkJReXhQUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkJPMHRCUVVNc1JVRkJReXhWUVVGVExFTkJRVU1zUlVGQlF6dEJRVUZETEU5QlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFTkJRVUU3UzBGQlF5eERRVUZETEVOQlFVRTdSMEZCUXl4VFFVRlRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXp0QlFVRkRMRXRCUVVNc1EwRkJReXhYUVVGWExFdEJRVWNzUTBGQlF5eERRVUZETEZkQlFWY3NTVUZCUlN4RFFVRkRMRXRCUVVjc1JVRkJSU3hKUVVGRkxGZEJRVmNzUTBGQlF5eFBRVUZQTEV0QlFVY3NSVUZCUlN4SFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4TFFVRkhMRVZCUVVVc1IwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVWQlFVVXNRMEZCUXl4TFFVRkxMRU5CUVVNc1IwRkJReXhMUVVGTExFTkJRVU1zUzBGQlJ5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUVR0SFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVTTdRVUZCUXl4TFFVRkRMRXRCUVVjc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUVR0SFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF6dEJRVUZETEV0QlFVTXNRMEZCUXl4UlFVRlJMRWxCUVVVc1EwRkJReXhEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZCTzBkQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF6dEJRVUZETEV0QlFVTXNRMEZCUXl4TlFVRk5MRXRCUVVjc1JVRkJSU3hMUVVGSExFTkJRVU1zUTBGQlF5eFBRVUZQTEVkQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1EwRkJReXhOUVVGTkxFZEJRVU1zUlVGQlJTeEZRVUZETEVOQlFVTXNTMEZCUnl4RFFVRkRMRU5CUVVNc1dVRkJXU3hEUVVGRExFMUJRVTBzU1VGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1EwRkJReXhEUVVGQkxFRkJRVU1zUTBGQlFUdEhRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFVkJRVU03UVVGQlF5eExRVUZETEVOQlFVTXNUVUZCVFN4TFFVRkhMRVZCUVVVc1MwRkJSeXhEUVVGRExFTkJRVU1zVFVGQlRTeEhRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRU5CUVVNc1QwRkJUeXhIUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1EwRkJReXhEUVVGQkxFRkJRVU1zUTBGQlFUdEhRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXp0QlFVRkRMRkZCUVVrc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eFpRVUZaTzFGQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5eERRVUZETEZGQlFWRXNSMEZCUXl4SlFVRkpMRVZCUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGRExFVkJRVVVzUTBGQlF5eEhRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGRExFVkJRVVVzUTBGQlF5eEhRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRXRCUVVjc1EwRkJReXhKUVVGRkxFTkJRVU1zUTBGQlF5eE5RVUZOTEVsQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlFUdEhRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJRenRCUVVGRExGRkJRVWtzUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4WlFVRlpPMUZCUVVNc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eE5RVUZOTEVOQlFVTXNTVUZCUnl4RFFVRkRMRXRCUVVjc1EwRkJReXhEUVVGRExFMUJRVTBzUlVGQlF6dEJRVUZETEZkQlFVa3NTVUZCU1N4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4RlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRVZCUVVNc1EwRkJReXhKUVVGRkxFTkJRVU1zUlVGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eFpRVUZaTEVOQlFVTXNUVUZCVFN4SFFVRkRMRU5CUVVNc1EwRkJRVHRMUVVGRE8wZEJRVU1zVTBGQlV5eERRVUZETEVkQlFVVTdRVUZCUXl4UlFVRkpMRU5CUVVNc1MwRkJTeXhIUVVGRExFbEJRVWtzUTBGQlFUdEhRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFVkJRVU03UVVGQlF5eFJRVUZITzBGQlFVTXNZVUZCVHl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVUU3UzBGQlF5eERRVUZCTEU5QlFVMHNRMEZCUXl4RlFVRkRPMEZCUVVNc1kwRkJUeXhGUVVGRkxFTkJRVU1zUzBGQlN5eEhRVUZETEVOQlFVTXNSVUZCUXl4RlFVRkZMRU5CUVVFc1EwRkJRVHRMUVVGRE8wZEJRVU1zVTBGQlV5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eEZRVUZETzBGQlFVTXNVVUZCU1N4RFFVRkRPMUZCUVVNc1EwRkJRenRSUVVGRExFTkJRVU03VVVGQlF5eERRVUZETzFGQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEpRVUZITEVOQlFVTXNSVUZCUXp0QlFVRkRMRmRCUVVjc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhMUVVGSExFVkJRVVVzU1VGQlJTeERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eExRVUZMTEVWQlFVTXNRMEZCUXl4SFFVRkRMRWxCUVVrc1EwRkJRU3hIUVVGRkxFTkJRVU1zUjBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRXRCUVVjc1EwRkJReXhEUVVGQk8wRkJRVU1zWlVGQlR5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlFUdFBRVUZCTzB0QlFVTXNUVUZCU3l4RFFVRkRMRWRCUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1RVRkJUU3hMUVVGSExFVkJRVVVzUzBGQlJ5eERRVUZETEVsQlFVVXNRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4TFFVRkhMRVZCUVVVc1IwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNc1MwRkJSeXhGUVVGRkxFbEJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRU3hCUVVGRExFTkJRVUU3UjBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRE8wRkJRVU1zVVVGQlJ6dEJRVUZETEU5QlFVTXNRMEZCUXl4VlFVRlRMRU5CUVVNc1JVRkJRenRCUVVGRExGTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVFN1QwRkJReXhGUVVGRExGVkJRVk1zUTBGQlF5eEZRVUZETzBGQlFVTXNVMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlFUdFBRVUZETEVOQlFVTXNRMEZCUVR0TFFVRkRMRU5CUVVFc1QwRkJUU3hEUVVGRExFVkJRVU03UVVGQlF5eFBRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1EwRkJReXhEUVVGQk8wdEJRVU03UjBGQlF5eFRRVUZUTEVOQlFVTXNSMEZCUlR0QlFVRkRMRmRCUVU4c1JVRkJSU3hGUVVGRkxFTkJRVUU3UjBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNN1FVRkJReXhMUVVGRExFTkJRVU1zUlVGQlJTeERRVUZETEVkQlFVTXNSVUZCUlN4RlFVRkZMRVZCUVVNc1EwRkJReXhEUVVGRExFMUJRVTBzUjBGQlF5eExRVUZMTEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1QwRkJUeXhIUVVGRExFdEJRVXNzUTBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUXl4WlFVRlpMRWRCUVVNc1JVRkJSU3hEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRPMEZCUVVNc1YwRkJUeXhKUVVGSkxFVkJRVVVzUTBGQlF5eEpRVUZKTEVWQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1QwRkJUeXhEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRPMEZCUVVNc1VVRkJTU3hEUVVGRExFZEJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZETEZWQlFWTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1JVRkJRenRCUVVGRExGZEJRVWtzU1VGQlNTeERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRTFCUVUwc1JVRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRkxFVkJRVU1zUTBGQlF5eERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1EwRkJReXhEUVVGQk8wdEJRVU1zUjBGQlF5eFZRVUZUTEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNN1FVRkJReXhQUVVGRExFTkJRVU1zU1VGQlNTeFRRVUZUTEVOQlFVTXNhVU5CUVdsRExFTkJRVU1zUTBGQlF5eERRVUZCTzB0QlFVTXNRMEZCUXl4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETzBGQlFVTXNVVUZCU1N4RFFVRkRMRWRCUVVNc1NVRkJTVHRSUVVGRExFTkJRVU1zUjBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhSUVVGUExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGQkxFTkJRVUU3UjBGQlF5eFRRVUZUTEVOQlFVTXNSMEZCUlR0QlFVRkRMRlZCUVUwc1NVRkJTU3hUUVVGVExFTkJRVU1zYjBaQlFXOUdMRU5CUVVNc1EwRkJRVHRIUVVGRExGTkJRVk1zUTBGQlF5eEhRVUZGTzBGQlFVTXNWVUZCVFN4SlFVRkpMRk5CUVZNc1EwRkJReXgxU0VGQmRVZ3NRMEZCUXl4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETzBGQlFVTXNVVUZCU1N4RFFVRkRMRVZCUVVVc1EwRkJReXhIUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZETEVsQlFVa3NRMEZCUXl4UFFVRlBMRWRCUVVNc1NVRkJTU3hEUVVGRExFMUJRVTBzUjBGQlF5eExRVUZMTEVOQlFVTXNSVUZCUXl4SlFVRkpMRU5CUVVNc1dVRkJXU3hIUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEV0QlFVY3NRMEZCUXl4TFFVRkhMRlZCUVZVc1NVRkJSU3hQUVVGUExFTkJRVU1zU1VGQlJTeERRVUZETEVWQlFVVXNSVUZCUXl4SlFVRkpMRmxCUVZrc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eEpRVUZKTEVWQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVNc1EwRkJReXhGUVVGRkxFTkJRVUVzUVVGQlF5eERRVUZCTzBkQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF6dEJRVUZETEZGQlFVa3NRMEZCUXl4dlFrRkJiMElzUjBGQlF5eERRVUZETEVWQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1IwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFVkJRVVVzUTBGQlF5eEpRVUZGTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFVkJRVU1zUzBGQlN5eERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNc1NVRkJSU3hKUVVGSkxFTkJRVU1zVFVGQlRTeEhRVUZETEVOQlFVTXNSVUZCUXl4SlFVRkpMRU5CUVVNc1RVRkJUU3hIUVVGRExFTkJRVU1zUTBGQlF5eE5RVUZOTEVWQlFVTXNTVUZCU1N4RFFVRkRMRlZCUVZVc1IwRkJReXhEUVVGRExFTkJRVU1zVFVGQlRTeEZRVUZETEVsQlFVa3NRMEZCUXl4UFFVRlBMRWRCUVVNc1NVRkJTU3hMUVVGTExFTkJRVU1zU1VGQlNTeERRVUZETEUxQlFVMHNRMEZCUXl4RlFVRkRMRU5CUVVNc1MwRkJSeXhKUVVGSkxFTkJRVU1zVFVGQlRTeEhRVUZETEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhGUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNTVUZCUlN4SlFVRkpMRU5CUVVNc1RVRkJUU3hIUVVGRExFbEJRVWtzUTBGQlF5eE5RVUZOTEVsQlFVVXNRMEZCUXl4RlFVRkRMRWxCUVVrc1EwRkJReXhWUVVGVkxFVkJRVVVzUlVGQlF5eERRVUZETEV0QlFVY3NTVUZCU1N4RFFVRkRMRlZCUVZVc1NVRkJSU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNSVUZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVUVzUVVGQlF5eERRVUZCTEVkQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFVkJRVU1zUTBGQlF5eEZRVUZGTEVOQlFVTXNRMEZCUVR0SFFVRkRMRk5CUVZNc1EwRkJReXhIUVVGRk8wRkJRVU1zVjBGQlR5eEpRVUZKTEV0QlFVc3NRMEZCUXl4NVEwRkJlVU1zUTBGQlF5eERRVUZCTzBkQlFVTXNVMEZCVXl4RFFVRkRMRWRCUVVVN1FVRkJReXhSUVVGSkxFTkJRVU1zUTBGQlF5eEpRVUZITEZkQlFWY3NTVUZCUlN4UFFVRlBMRTFCUVUwc1JVRkJReXhEUVVGRExFZEJRVU1zVFVGQlRTeERRVUZETEV0QlFVc3NTVUZCUnl4WFFVRlhMRWxCUVVVc1QwRkJUeXhKUVVGSkxFVkJRVU1zUTBGQlF5eEhRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRWxCUVVjN1FVRkJReXhQUVVGRExFZEJRVU1zVVVGQlVTeERRVUZETEdGQlFXRXNRMEZCUXl4RlFVRkZMRU5CUVVFN1MwRkJReXhEUVVGQkxFOUJRVTBzUTBGQlF5eEZRVUZETzBGQlFVTXNXVUZCVFN4SlFVRkpMRXRCUVVzc1EwRkJReXd3UlVGQk1FVXNRMEZCUXl4RFFVRkJPMHRCUVVNc1NVRkJTU3hEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhKUVVGRkxHdENRVUZyUWl4TFFVRkhMRTFCUVUwc1EwRkJReXhUUVVGVExFTkJRVU1zVVVGQlVTeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1QwRkJUeXhGUVVGRkxFTkJRVU1zU1VGQlJTeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkJMRXRCUVVrc1EwRkJReXhEUVVGRExFOUJRVThzUjBGQlF5eEZRVUZGTEVOQlFVRXNRVUZCUXl4RFFVRkJPMGRCUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZETEV0QlFVc3NRMEZCUXl4UFFVRlBMRWRCUVVNc1MwRkJTeXhEUVVGRExFOUJRVThzUjBGQlF5eFZRVUZUTEVOQlFVTXNSVUZCUXp0QlFVRkRMRmRCUVUwc1owSkJRV2RDTEV0QlFVY3NUVUZCVFN4RFFVRkRMRk5CUVZNc1EwRkJReXhSUVVGUkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkJPMGRCUVVNc1EwRkJReXhKUVVGSkxFTkJRVU03VFVGQlF5eERRVUZETzAxQlFVTXNRMEZCUXp0TlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRE8wMUJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTTdUVUZCUXl4RFFVRkRMRWRCUVVNc1YwRkJVeXhEUVVGRExFVkJRVU1zUTBGQlF5eEZRVUZETzBGQlFVTXNUVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGRExFTkJRVU1zUlVGQlF5eEZRVUZGTEVOQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVsQlFVVXNRMEZCUXl4RlFVRkRMRU5CUVVNc1MwRkJSeXhEUVVGRExFdEJRVWNzUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFVkJRVVVzUTBGQlFTeEJRVUZETEVOQlFVRTdSMEZCUXp0TlFVRkRMRU5CUVVNc1IwRkJReXhYUVVGWExFbEJRVVVzVDBGQlR5eE5RVUZOTEVkQlFVTXNUVUZCVFN4SFFVRkRMRXRCUVVzc1EwRkJRenROUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVsQlFVVXNSVUZCUlR0TlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zWjBKQlFXZENMRWxCUVVVc1EwRkJReXhEUVVGRExITkNRVUZ6UWp0TlFVRkRMRU5CUVVNc1IwRkJReXhYUVVGWExFbEJRVVVzVDBGQlR5eEpRVUZKTEVsQlFVVXNWMEZCVnl4SlFVRkZMRTlCUVU4c1QwRkJUeXhKUVVGRkxHdENRVUZyUWl4TFFVRkhMRU5CUVVFc1IwRkJSU3hEUVVGRExGRkJRVkVzUTBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRPMDFCUVVNc1EwRkJReXhIUVVGRExGZEJRVmNzU1VGQlJTeFBRVUZQTEdsQ1FVRnBRaXhKUVVGRkxGZEJRVmNzU1VGQlJTeFBRVUZQTEdGQlFXRXNTVUZCUlN4WFFVRlhMRWxCUVVVc1QwRkJUeXhqUVVGak8wMUJRVU1zUlVGQlJTeEhRVUZETEVsQlFVa3NTMEZCU3l4RFFVRkRMRWxCUVVjc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4RlFVRkZMRWRCUVVNc1EwRkJReXhIUVVGRExFTkJRVU1zUlVGQlJTeEhRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRVZCUVVVc1IwRkJReXhMUVVGTExFTkJRVU1zUzBGQlJ5eERRVUZETEVsQlFVVXNWVUZCVlN4SlFVRkZMRTlCUVU4c1QwRkJUeXhIUVVGRExFTkJRVU1zUlVGQlJTeEhRVUZETEVOQlFVTXNSVUZCUlN4RFFVRkRMRWxCUVVrc1JVRkJSU3hIUVVGRExFTkJRVU03VFVGQlF5eEZRVUZGTEVkQlFVTXNRMEZCUXp0TlFVRkRMRVZCUVVVc1IwRkJReXhKUVVGSkxFTkJRVU1zVFVGQlRTeEZRVUZGTEVOQlFVTXNVVUZCVVN4RFFVRkRMRVZCUVVVc1EwRkJReXhEUVVGRExGTkJRVk1zUTBGQlF5eEZRVUZGTEVOQlFVTTdUVUZCUXl4RlFVRkZMRWRCUVVNc1MwRkJTeXhEUVVGRE8wMUJRVU1zUlVGQlJTeEhRVUZETEVOQlFVTTdUVUZCUXl4RlFVRkZMRWRCUVVNc1EwRkJRenROUVVGRExFVkJRVVVzUjBGQlF5eEpRVUZKTEVOQlFVTXNSVUZCUVR0TlFVRkRMRVZCUVVVc1IwRkJReXhKUVVGSkxFTkJRVU1zUlVGQlFUdE5RVUZETEVWQlFVVXNSMEZCUXl4RFFVRkRPMDFCUVVNc1JVRkJSU3hIUVVGRExFTkJRVU03VFVGQlF5eEZRVUZGTEVkQlFVTXNRMEZCUXp0TlFVRkRMRVZCUVVVc1IwRkJReXhEUVVGRE8wMUJRVU1zUlVGQlJTeEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhIUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEVOQlFVTXNTVUZCU1N4SFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFTkJRVU1zVDBGQlR5eEhRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRU5CUVVNc1RVRkJUU3hIUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEVOQlFVTXNZVUZCWVN4SFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zVVVGQlVTeEhRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1MwRkJTeXhIUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNVMEZCVXl4SFFVRkRMRVZCUVVNc1YwRkJWeXhGUVVGRExFTkJRVU1zUlVGQlF5eEpRVUZKTEVWQlFVTXNSVUZCUlN4RlFVRkRMRTlCUVU4c1JVRkJReXhuUWtGQlV5eERRVUZETEVWQlFVTTdRVUZCUXl4aFFVRlBMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlNTeEZRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkJPMHRCUVVNc1JVRkJReXhEUVVGRExFbEJRVWtzUlVGQlJTeEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1UwRkJVeXhEUVVGRExGVkJRVlVzUjBGQlF5eFpRVUZWTzBGQlFVTXNVMEZCU1N4SlFVRkpMRU5CUVVNc1IwRkJReXhKUVVGSkxFTkJRVU1zVFVGQlRTeEZRVUZETEVOQlFVTXNSMEZCUXl4SlFVRkpMRU5CUVVNc1RVRkJUU3hGUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVWQlFVTXNTVUZCU1N4RFFVRkRMRTFCUVUwc1MwRkJSeXhGUVVGRkxFbEJRVVVzUTBGQlF5eEhRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVVc1JVRkJReXhKUVVGSkxFTkJRVU1zVlVGQlZTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlFUdEhRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRk5CUVZNc1EwRkJReXhWUVVGVkxFZEJRVU1zVlVGQlV5eERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkRPMEZCUVVNc1VVRkJTU3hEUVVGRExFZEJRVU1zU1VGQlNTeERRVUZETEc5Q1FVRnZRanRSUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4RFFVRkRMRWxCUVVjc1EwRkJReXhMUVVGSExFVkJRVVVzUlVGQlF6dEJRVUZETEZWQlFVa3NRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEpRVUZITEVOQlFVTXNTMEZCUnl4RlFVRkZMRWxCUVVVc1EwRkJReXhEUVVGRExFMUJRVTBzUzBGQlJ5eEZRVUZGTEVWQlFVTXNTVUZCU1N4RFFVRkRMRlZCUVZVc1EwRkJReXhEUVVGRExFTkJRVU1zVFVGQlRTeEZRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zUzBGQlN5eEpRVUZITEZWQlFWVXNTVUZCUlN4UFFVRlBMRU5CUVVNc1JVRkJReXhKUVVGSkxFTkJRVU1zVlVGQlZTeEZRVUZGTEVWQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVOQlFVTXNTMEZCU3l4SlFVRkhMRU5CUVVNc1MwRkJSeXhGUVVGRkxFVkJRVU03UVVGQlF5eFpRVUZKTEVOQlFVTXNSMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlFUdFBRVUZETEUxQlFVc3NTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eFZRVUZUTEVOQlFVTXNSVUZCUXp0QlFVRkRMRk5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlFUdFBRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRVHRMUVVGRExFMUJRVXNzU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVOQlFVRTdSMEZCUXl4RlFVRkRMRU5CUVVNc1EwRkJReXhUUVVGVExFTkJRVU1zVlVGQlZTeEhRVUZETEZWQlFWTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFVkJRVU03UVVGQlF5eFJRVUZKTEVOQlFVTXNSMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF5eE5RVUZOTEV0QlFVY3NSVUZCUlN4TFFVRkhMRWxCUVVrc1EwRkJReXhWUVVGVkxFVkJRVVVzUlVGQlF5eERRVUZETEV0QlFVY3NSVUZCUlN4SFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVkQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVOQlFVRXNRVUZCUXl4RlFVRkRMRU5CUVVNc1MwRkJSeXhKUVVGSkxFTkJRVU1zVlVGQlZTeEpRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eERRVUZCTzBkQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1UwRkJVeXhEUVVGRExHRkJRV0VzUjBGQlF5eFZRVUZUTEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNN1FVRkJReXhSUVVGSkxFTkJRVU1zUjBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhMUVVGTExFTkJRVU1zUlVGQlF5eFZRVUZUTEVOQlFVTXNSVUZCUXp0QlFVRkRMRTlCUVVNc1EwRkJReXhWUVVGVkxFTkJRVU1zUlVGQlJTeEZRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRVHRMUVVGRExFVkJRVU1zVlVGQlV5eERRVUZETEVWQlFVTTdRVUZCUXl4UFFVRkRMRU5CUVVNc1ZVRkJWU3hEUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVFN1MwRkJReXhEUVVGRExFTkJRVUU3UjBGQlF5eERRVUZETEVsQlFVa3NSVUZCUlN4SFFVRkRMRU5CUVVNN1RVRkJReXhGUVVGRkxFZEJRVU1zUlVGQlF5eFBRVUZQTEVWQlFVTXNSVUZCUlN4RlFVRkRMRkZCUVZFc1JVRkJReXhGUVVGRkxFVkJRVU1zUTBGQlF5eFZRVUZWTEVsQlFVVXNUMEZCVHl4TlFVRk5MRWxCUVVVc1RVRkJUU3hEUVVGRExFZEJRVWNzUjBGQlF5eE5RVUZOTEVOQlFVTXNXVUZCVlR0QlFVRkRMRmRCUVU4c1JVRkJSU3hEUVVGQk8wZEJRVU1zUTBGQlF5eEhRVUZETEZkQlFWY3NTVUZCUlN4UFFVRlBMRTFCUVUwc1NVRkJSU3hOUVVGTkxFTkJRVU1zVDBGQlR5eEhRVUZETEUxQlFVMHNRMEZCUXl4UFFVRlBMRWRCUVVNc1JVRkJSU3hIUVVGRExGZEJRVmNzU1VGQlJTeFBRVUZQTEVsQlFVa3NTMEZCUnl4SlFVRkpMRU5CUVVNc1ZVRkJWU3hIUVVGRExFVkJRVVVzUTBGQlFTeEJRVUZETEVWQlFVTXNSVUZCUlN4RlFVRkZMRU5CUVVFN1EwRkJReXhEUVVGQkxFTkJRVVVzU1VGQlNTeFhRVUZOTEVOQlFVTWlMQ0ptYVd4bElqb2laMlZ1WlhKaGRHVmtMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE5EYjI1MFpXNTBJanBiSWk4cUlWeHVJQ29nUUc5MlpYSjJhV1YzSUdWek5pMXdjbTl0YVhObElDMGdZU0IwYVc1NUlHbHRjR3hsYldWdWRHRjBhVzl1SUc5bUlGQnliMjFwYzJWekwwRXJMbHh1SUNvZ1FHTnZjSGx5YVdkb2RDQkRiM0I1Y21sbmFIUWdLR01wSURJd01UUWdXV1ZvZFdSaElFdGhkSG9zSUZSdmJTQkVZV3hsTENCVGRHVm1ZVzRnVUdWdWJtVnlJR0Z1WkNCamIyNTBjbWxpZFhSdmNuTWdLRU52Ym5abGNuTnBiMjRnZEc4Z1JWTTJJRUZRU1NCaWVTQktZV3RsSUVGeVkyaHBZbUZzWkNsY2JpQXFJRUJzYVdObGJuTmxJQ0FnVEdsalpXNXpaV1FnZFc1a1pYSWdUVWxVSUd4cFkyVnVjMlZjYmlBcUlDQWdJQ0FnSUNBZ0lDQWdVMlZsSUdoMGRIQnpPaTh2Y21GM0xtZHBkR2gxWW5WelpYSmpiMjUwWlc1MExtTnZiUzlxWVd0bFlYSmphR2xpWVd4a0wyVnpOaTF3Y205dGFYTmxMMjFoYzNSbGNpOU1TVU5GVGxORlhHNGdLaUJBZG1WeWMybHZiaUFnSURNdU1pNHhYRzRnS2k5Y2JseHVLR1oxYm1OMGFXOXVLQ2w3WENKMWMyVWdjM1J5YVdOMFhDSTdablZ1WTNScGIyNGdkQ2gwS1h0eVpYUjFjbTVjSW1aMWJtTjBhVzl1WENJOVBYUjVjR1Z2WmlCMGZIeGNJbTlpYW1WamRGd2lQVDEwZVhCbGIyWWdkQ1ltYm5Wc2JDRTlQWFI5Wm5WdVkzUnBiMjRnWlNoMEtYdHlaWFIxY201Y0ltWjFibU4wYVc5dVhDSTlQWFI1Y0dWdlppQjBmV1oxYm1OMGFXOXVJRzRvZENsN1J6MTBmV1oxYm1OMGFXOXVJSElvZENsN1VUMTBmV1oxYm1OMGFXOXVJRzhvS1h0eVpYUjFjbTRnWm5WdVkzUnBiMjRvS1h0d2NtOWpaWE56TG01bGVIUlVhV05yS0dFcGZYMW1kVzVqZEdsdmJpQnBLQ2w3Y21WMGRYSnVJR1oxYm1OMGFXOXVLQ2w3UWloaEtYMTlablZ1WTNScGIyNGdjeWdwZTNaaGNpQjBQVEFzWlQxdVpYY2dXQ2hoS1N4dVBXUnZZM1Z0Wlc1MExtTnlaV0YwWlZSbGVIUk9iMlJsS0Z3aVhDSXBPM0psZEhWeWJpQmxMbTlpYzJWeWRtVW9iaXg3WTJoaGNtRmpkR1Z5UkdGMFlUb2hNSDBwTEdaMWJtTjBhVzl1S0NsN2JpNWtZWFJoUFhROUt5dDBKVEo5ZldaMWJtTjBhVzl1SUhVb0tYdDJZWElnZEQxdVpYY2dUV1Z6YzJGblpVTm9ZVzV1Wld3N2NtVjBkWEp1SUhRdWNHOXlkREV1YjI1dFpYTnpZV2RsUFdFc1puVnVZM1JwYjI0b0tYdDBMbkJ2Y25ReUxuQnZjM1JOWlhOellXZGxLREFwZlgxbWRXNWpkR2x2YmlCaktDbDdjbVYwZFhKdUlHWjFibU4wYVc5dUtDbDdjMlYwVkdsdFpXOTFkQ2hoTERFcGZYMW1kVzVqZEdsdmJpQmhLQ2w3Wm05eUtIWmhjaUIwUFRBN1NqNTBPM1FyUFRJcGUzWmhjaUJsUFhSMFczUmRMRzQ5ZEhSYmRDc3hYVHRsS0c0cExIUjBXM1JkUFhadmFXUWdNQ3gwZEZ0MEt6RmRQWFp2YVdRZ01IMUtQVEI5Wm5WdVkzUnBiMjRnWmlncGUzUnllWHQyWVhJZ2REMXlaWEYxYVhKbExHVTlkQ2hjSW5abGNuUjRYQ0lwTzNKbGRIVnliaUJDUFdVdWNuVnVUMjVNYjI5d2ZIeGxMbkoxYms5dVEyOXVkR1Y0ZEN4cEtDbDlZMkYwWTJnb2JpbDdjbVYwZFhKdUlHTW9LWDE5Wm5WdVkzUnBiMjRnYkNoMExHVXBlM1poY2lCdVBYUm9hWE1zY2oxdVpYY2dkR2hwY3k1amIyNXpkSEoxWTNSdmNpaHdLVHQyYjJsa0lEQTlQVDF5VzNKMFhTWW1heWh5S1R0MllYSWdiejF1TGw5emRHRjBaVHRwWmlodktYdDJZWElnYVQxaGNtZDFiV1Z1ZEhOYmJ5MHhYVHRSS0daMWJtTjBhVzl1S0NsN2VDaHZMSElzYVN4dUxsOXlaWE4xYkhRcGZTbDlaV3h6WlNCRktHNHNjaXgwTEdVcE8zSmxkSFZ5YmlCeWZXWjFibU4wYVc5dUlHZ29kQ2w3ZG1GeUlHVTlkR2hwY3p0cFppaDBKaVpjSW05aWFtVmpkRndpUFQxMGVYQmxiMllnZENZbWRDNWpiMjV6ZEhKMVkzUnZjajA5UFdVcGNtVjBkWEp1SUhRN2RtRnlJRzQ5Ym1WM0lHVW9jQ2s3Y21WMGRYSnVJR2NvYml4MEtTeHVmV1oxYm1OMGFXOXVJSEFvS1h0OVpuVnVZM1JwYjI0Z1h5Z3BlM0psZEhWeWJpQnVaWGNnVkhsd1pVVnljbTl5S0Z3aVdXOTFJR05oYm01dmRDQnlaWE52YkhabElHRWdjSEp2YldselpTQjNhWFJvSUdsMGMyVnNabHdpS1gxbWRXNWpkR2x2YmlCa0tDbDdjbVYwZFhKdUlHNWxkeUJVZVhCbFJYSnliM0lvWENKQklIQnliMjFwYzJWeklHTmhiR3hpWVdOcklHTmhibTV2ZENCeVpYUjFjbTRnZEdoaGRDQnpZVzFsSUhCeWIyMXBjMlV1WENJcGZXWjFibU4wYVc5dUlIWW9kQ2w3ZEhKNWUzSmxkSFZ5YmlCMExuUm9aVzU5WTJGMFkyZ29aU2w3Y21WMGRYSnVJSFYwTG1WeWNtOXlQV1VzZFhSOWZXWjFibU4wYVc5dUlIa29kQ3hsTEc0c2NpbDdkSEo1ZTNRdVkyRnNiQ2hsTEc0c2NpbDlZMkYwWTJnb2J5bDdjbVYwZFhKdUlHOTlmV1oxYm1OMGFXOXVJRzBvZEN4bExHNHBlMUVvWm5WdVkzUnBiMjRvZENsN2RtRnlJSEk5SVRFc2J6MTVLRzRzWlN4bWRXNWpkR2x2YmlodUtYdHlmSHdvY2owaE1DeGxJVDA5Ymo5bktIUXNiaWs2VXloMExHNHBLWDBzWm5WdVkzUnBiMjRvWlNsN2NueDhLSEk5SVRBc2FpaDBMR1VwS1gwc1hDSlRaWFIwYkdVNklGd2lLeWgwTGw5c1lXSmxiSHg4WENJZ2RXNXJibTkzYmlCd2NtOXRhWE5sWENJcEtUc2hjaVltYnlZbUtISTlJVEFzYWloMExHOHBLWDBzZENsOVpuVnVZM1JwYjI0Z1lpaDBMR1VwZTJVdVgzTjBZWFJsUFQwOWFYUS9VeWgwTEdVdVgzSmxjM1ZzZENrNlpTNWZjM1JoZEdVOVBUMXpkRDlxS0hRc1pTNWZjbVZ6ZFd4MEtUcEZLR1VzZG05cFpDQXdMR1oxYm1OMGFXOXVLR1VwZTJjb2RDeGxLWDBzWm5WdVkzUnBiMjRvWlNsN2FpaDBMR1VwZlNsOVpuVnVZM1JwYjI0Z2R5aDBMRzRzY2lsN2JpNWpiMjV6ZEhKMVkzUnZjajA5UFhRdVkyOXVjM1J5ZFdOMGIzSW1Kbkk5UFQxbGRDWW1ZMjl1YzNSeWRXTjBiM0l1Y21WemIyeDJaVDA5UFc1MFAySW9kQ3h1S1RweVBUMDlkWFEvYWloMExIVjBMbVZ5Y205eUtUcDJiMmxrSURBOVBUMXlQMU1vZEN4dUtUcGxLSElwUDIwb2RDeHVMSElwT2xNb2RDeHVLWDFtZFc1amRHbHZiaUJuS0dVc2JpbDdaVDA5UFc0L2FpaGxMRjhvS1NrNmRDaHVLVDkzS0dVc2JpeDJLRzRwS1RwVEtHVXNiaWw5Wm5WdVkzUnBiMjRnUVNoMEtYdDBMbDl2Ym1WeWNtOXlKaVowTGw5dmJtVnljbTl5S0hRdVgzSmxjM1ZzZENrc1ZDaDBLWDFtZFc1amRHbHZiaUJUS0hRc1pTbDdkQzVmYzNSaGRHVTlQVDF2ZENZbUtIUXVYM0psYzNWc2REMWxMSFF1WDNOMFlYUmxQV2wwTERBaFBUMTBMbDl6ZFdKelkzSnBZbVZ5Y3k1c1pXNW5kR2dtSmxFb1ZDeDBLU2w5Wm5WdVkzUnBiMjRnYWloMExHVXBlM1F1WDNOMFlYUmxQVDA5YjNRbUppaDBMbDl6ZEdGMFpUMXpkQ3gwTGw5eVpYTjFiSFE5WlN4UktFRXNkQ2twZldaMWJtTjBhVzl1SUVVb2RDeGxMRzRzY2lsN2RtRnlJRzg5ZEM1ZmMzVmljMk55YVdKbGNuTXNhVDF2TG14bGJtZDBhRHQwTGw5dmJtVnljbTl5UFc1MWJHd3NiMXRwWFQxbExHOWJhU3RwZEYwOWJpeHZXMmtyYzNSZFBYSXNNRDA5UFdrbUpuUXVYM04wWVhSbEppWlJLRlFzZENsOVpuVnVZM1JwYjI0Z1ZDaDBLWHQyWVhJZ1pUMTBMbDl6ZFdKelkzSnBZbVZ5Y3l4dVBYUXVYM04wWVhSbE8ybG1LREFoUFQxbExteGxibWQwYUNsN1ptOXlLSFpoY2lCeUxHOHNhVDEwTGw5eVpYTjFiSFFzY3owd08zTThaUzVzWlc1bmRHZzdjeXM5TXlseVBXVmJjMTBzYnoxbFczTXJibDBzY2o5NEtHNHNjaXh2TEdrcE9tOG9hU2s3ZEM1ZmMzVmljMk55YVdKbGNuTXViR1Z1WjNSb1BUQjlmV1oxYm1OMGFXOXVJRTBvS1h0MGFHbHpMbVZ5Y205eVBXNTFiR3g5Wm5WdVkzUnBiMjRnVUNoMExHVXBlM1J5ZVh0eVpYUjFjbTRnZENobEtYMWpZWFJqYUNodUtYdHlaWFIxY200Z1kzUXVaWEp5YjNJOWJpeGpkSDE5Wm5WdVkzUnBiMjRnZUNoMExHNHNjaXh2S1h0MllYSWdhU3h6TEhVc1l5eGhQV1VvY2lrN2FXWW9ZU2w3YVdZb2FUMVFLSElzYnlrc2FUMDlQV04wUHloalBTRXdMSE05YVM1bGNuSnZjaXhwUFc1MWJHd3BPblU5SVRBc2JqMDlQV2twY21WMGRYSnVJSFp2YVdRZ2FpaHVMR1FvS1NsOVpXeHpaU0JwUFc4c2RUMGhNRHR1TGw5emRHRjBaU0U5UFc5MGZId29ZU1ltZFQ5bktHNHNhU2s2WXo5cUtHNHNjeWs2ZEQwOVBXbDBQMU1vYml4cEtUcDBQVDA5YzNRbUptb29iaXhwS1NsOVpuVnVZM1JwYjI0Z1F5aDBMR1VwZTNSeWVYdGxLR1oxYm1OMGFXOXVLR1VwZTJjb2RDeGxLWDBzWm5WdVkzUnBiMjRvWlNsN2FpaDBMR1VwZlNsOVkyRjBZMmdvYmlsN2FpaDBMRzRwZlgxbWRXNWpkR2x2YmlCUEtDbDdjbVYwZFhKdUlHRjBLeXQ5Wm5WdVkzUnBiMjRnYXloMEtYdDBXM0owWFQxaGRDc3JMSFF1WDNOMFlYUmxQWFp2YVdRZ01DeDBMbDl5WlhOMWJIUTlkbTlwWkNBd0xIUXVYM04xWW5OamNtbGlaWEp6UFZ0ZGZXWjFibU4wYVc5dUlGa29kQ2w3Y21WMGRYSnVJRzVsZHlCZmRDaDBhR2x6TEhRcExuQnliMjFwYzJWOVpuVnVZM1JwYjI0Z2NTaDBLWHQyWVhJZ1pUMTBhR2x6TzNKbGRIVnliaUJ1WlhjZ1pTaEpLSFFwUDJaMWJtTjBhVzl1S0c0c2NpbDdabTl5S0haaGNpQnZQWFF1YkdWdVozUm9MR2s5TUR0dlBtazdhU3NyS1dVdWNtVnpiMngyWlNoMFcybGRLUzUwYUdWdUtHNHNjaWw5T21aMWJtTjBhVzl1S0hRc1pTbDdaU2h1WlhjZ1ZIbHdaVVZ5Y205eUtGd2lXVzkxSUcxMWMzUWdjR0Z6Y3lCaGJpQmhjbkpoZVNCMGJ5QnlZV05sTGx3aUtTbDlLWDFtZFc1amRHbHZiaUJHS0hRcGUzWmhjaUJsUFhSb2FYTXNiajF1WlhjZ1pTaHdLVHR5WlhSMWNtNGdhaWh1TEhRcExHNTlablZ1WTNScGIyNGdSQ2dwZTNSb2NtOTNJRzVsZHlCVWVYQmxSWEp5YjNJb1hDSlpiM1VnYlhWemRDQndZWE56SUdFZ2NtVnpiMngyWlhJZ1puVnVZM1JwYjI0Z1lYTWdkR2hsSUdacGNuTjBJR0Z5WjNWdFpXNTBJSFJ2SUhSb1pTQndjbTl0YVhObElHTnZibk4wY25WamRHOXlYQ0lwZldaMWJtTjBhVzl1SUVzb0tYdDBhSEp2ZHlCdVpYY2dWSGx3WlVWeWNtOXlLRndpUm1GcGJHVmtJSFJ2SUdOdmJuTjBjblZqZENBblVISnZiV2x6WlNjNklGQnNaV0Z6WlNCMWMyVWdkR2hsSUNkdVpYY25JRzl3WlhKaGRHOXlMQ0IwYUdseklHOWlhbVZqZENCamIyNXpkSEoxWTNSdmNpQmpZVzV1YjNRZ1ltVWdZMkZzYkdWa0lHRnpJR0VnWm5WdVkzUnBiMjR1WENJcGZXWjFibU4wYVc5dUlFd29kQ2w3ZEdocGMxdHlkRjA5VHlncExIUm9hWE11WDNKbGMzVnNkRDEwYUdsekxsOXpkR0YwWlQxMmIybGtJREFzZEdocGN5NWZjM1ZpYzJOeWFXSmxjbk05VzEwc2NDRTlQWFFtSmloY0ltWjFibU4wYVc5dVhDSWhQWFI1Y0dWdlppQjBKaVpFS0Nrc2RHaHBjeUJwYm5OMFlXNWpaVzltSUV3L1F5aDBhR2x6TEhRcE9rc29LU2w5Wm5WdVkzUnBiMjRnVGloMExHVXBlM1JvYVhNdVgybHVjM1JoYm1ObFEyOXVjM1J5ZFdOMGIzSTlkQ3gwYUdsekxuQnliMjFwYzJVOWJtVjNJSFFvY0Nrc2RHaHBjeTV3Y205dGFYTmxXM0owWFh4OGF5aDBhR2x6TG5CeWIyMXBjMlVwTEVGeWNtRjVMbWx6UVhKeVlYa29aU2svS0hSb2FYTXVYMmx1Y0hWMFBXVXNkR2hwY3k1c1pXNW5kR2c5WlM1c1pXNW5kR2dzZEdocGN5NWZjbVZ0WVdsdWFXNW5QV1V1YkdWdVozUm9MSFJvYVhNdVgzSmxjM1ZzZEQxdVpYY2dRWEp5WVhrb2RHaHBjeTVzWlc1bmRHZ3BMREE5UFQxMGFHbHpMbXhsYm1kMGFEOVRLSFJvYVhNdWNISnZiV2x6WlN4MGFHbHpMbDl5WlhOMWJIUXBPaWgwYUdsekxteGxibWQwYUQxMGFHbHpMbXhsYm1kMGFIeDhNQ3gwYUdsekxsOWxiblZ0WlhKaGRHVW9LU3d3UFQwOWRHaHBjeTVmY21WdFlXbHVhVzVuSmlaVEtIUm9hWE11Y0hKdmJXbHpaU3gwYUdsekxsOXlaWE4xYkhRcEtTazZhaWgwYUdsekxuQnliMjFwYzJVc1ZTZ3BLWDFtZFc1amRHbHZiaUJWS0NsN2NtVjBkWEp1SUc1bGR5QkZjbkp2Y2loY0lrRnljbUY1SUUxbGRHaHZaSE1nYlhWemRDQmlaU0J3Y205MmFXUmxaQ0JoYmlCQmNuSmhlVndpS1gxbWRXNWpkR2x2YmlCWEtDbDdkbUZ5SUhRN2FXWW9YQ0oxYm1SbFptbHVaV1JjSWlFOWRIbHdaVzltSUdkc2IySmhiQ2wwUFdkc2IySmhiRHRsYkhObElHbG1LRndpZFc1a1pXWnBibVZrWENJaFBYUjVjR1Z2WmlCelpXeG1LWFE5YzJWc1pqdGxiSE5sSUhSeWVYdDBQVVoxYm1OMGFXOXVLRndpY21WMGRYSnVJSFJvYVhOY0lpa29LWDFqWVhSamFDaGxLWHQwYUhKdmR5QnVaWGNnUlhKeWIzSW9YQ0p3YjJ4NVptbHNiQ0JtWVdsc1pXUWdZbVZqWVhWelpTQm5iRzlpWVd3Z2IySnFaV04wSUdseklIVnVZWFpoYVd4aFlteGxJR2x1SUhSb2FYTWdaVzUyYVhKdmJtMWxiblJjSWlsOWRtRnlJRzQ5ZEM1UWNtOXRhWE5sT3lnaGJueDhYQ0piYjJKcVpXTjBJRkJ5YjIxcGMyVmRYQ0loUFQxUFltcGxZM1F1Y0hKdmRHOTBlWEJsTG5SdlUzUnlhVzVuTG1OaGJHd29iaTV5WlhOdmJIWmxLQ2twZkh4dUxtTmhjM1FwSmlZb2RDNVFjbTl0YVhObFBYQjBLWDEyWVhJZ2VqdDZQVUZ5Y21GNUxtbHpRWEp5WVhrL1FYSnlZWGt1YVhOQmNuSmhlVHBtZFc1amRHbHZiaWgwS1h0eVpYUjFjbTVjSWx0dlltcGxZM1FnUVhKeVlYbGRYQ0k5UFQxUFltcGxZM1F1Y0hKdmRHOTBlWEJsTG5SdlUzUnlhVzVuTG1OaGJHd29kQ2w5TzNaaGNpQkNMRWNzU0N4SlBYb3NTajB3TEZFOVpuVnVZM1JwYjI0b2RDeGxLWHQwZEZ0S1hUMTBMSFIwVzBvck1WMDlaU3hLS3oweUxESTlQVDFLSmlZb1J6OUhLR0VwT2tnb0tTbDlMRkk5WENKMWJtUmxabWx1WldSY0lpRTlkSGx3Wlc5bUlIZHBibVJ2ZHo5M2FXNWtiM2M2ZG05cFpDQXdMRlk5VW54OGUzMHNXRDFXTGsxMWRHRjBhVzl1VDJKelpYSjJaWEo4ZkZZdVYyVmlTMmwwVFhWMFlYUnBiMjVQWW5ObGNuWmxjaXhhUFZ3aWRXNWtaV1pwYm1Wa1hDSTlQWFI1Y0dWdlppQnpaV3htSmlaY0luVnVaR1ZtYVc1bFpGd2lJVDEwZVhCbGIyWWdjSEp2WTJWemN5WW1YQ0piYjJKcVpXTjBJSEJ5YjJObGMzTmRYQ0k5UFQxN2ZTNTBiMU4wY21sdVp5NWpZV3hzS0hCeWIyTmxjM01wTENROVhDSjFibVJsWm1sdVpXUmNJaUU5ZEhsd1pXOW1JRlZwYm5RNFEyeGhiWEJsWkVGeWNtRjVKaVpjSW5WdVpHVm1hVzVsWkZ3aUlUMTBlWEJsYjJZZ2FXMXdiM0owVTJOeWFYQjBjeVltWENKMWJtUmxabWx1WldSY0lpRTlkSGx3Wlc5bUlFMWxjM05oWjJWRGFHRnVibVZzTEhSMFBXNWxkeUJCY25KaGVTZ3haVE1wTzBnOVdqOXZLQ2s2V0Q5ektDazZKRDkxS0NrNmRtOXBaQ0F3UFQwOVVpWW1YQ0ptZFc1amRHbHZibHdpUFQxMGVYQmxiMllnY21WeGRXbHlaVDltS0NrNll5Z3BPM1poY2lCbGREMXNMRzUwUFdnc2NuUTlUV0YwYUM1eVlXNWtiMjBvS1M1MGIxTjBjbWx1Wnlnek5pa3VjM1ZpYzNSeWFXNW5LREUyS1N4dmREMTJiMmxrSURBc2FYUTlNU3h6ZEQweUxIVjBQVzVsZHlCTkxHTjBQVzVsZHlCTkxHRjBQVEFzWm5ROVdTeHNkRDF4TEdoMFBVWXNjSFE5VER0TUxtRnNiRDFtZEN4TUxuSmhZMlU5YkhRc1RDNXlaWE52YkhabFBXNTBMRXd1Y21WcVpXTjBQV2gwTEV3dVgzTmxkRk5qYUdWa2RXeGxjajF1TEV3dVgzTmxkRUZ6WVhBOWNpeE1MbDloYzJGd1BWRXNUQzV3Y205MGIzUjVjR1U5ZTJOdmJuTjBjblZqZEc5eU9rd3NkR2hsYmpwbGRDeGNJbU5oZEdOb1hDSTZablZ1WTNScGIyNG9kQ2w3Y21WMGRYSnVJSFJvYVhNdWRHaGxiaWh1ZFd4c0xIUXBmWDA3ZG1GeUlGOTBQVTQ3VGk1d2NtOTBiM1I1Y0dVdVgyVnVkVzFsY21GMFpUMW1kVzVqZEdsdmJpZ3BlMlp2Y2loMllYSWdkRDEwYUdsekxteGxibWQwYUN4bFBYUm9hWE11WDJsdWNIVjBMRzQ5TUR0MGFHbHpMbDl6ZEdGMFpUMDlQVzkwSmlaMFBtNDdiaXNyS1hSb2FYTXVYMlZoWTJoRmJuUnllU2hsVzI1ZExHNHBmU3hPTG5CeWIzUnZkSGx3WlM1ZlpXRmphRVZ1ZEhKNVBXWjFibU4wYVc5dUtIUXNaU2w3ZG1GeUlHNDlkR2hwY3k1ZmFXNXpkR0Z1WTJWRGIyNXpkSEoxWTNSdmNpeHlQVzR1Y21WemIyeDJaVHRwWmloeVBUMDliblFwZTNaaGNpQnZQWFlvZENrN2FXWW9iejA5UFdWMEppWjBMbDl6ZEdGMFpTRTlQVzkwS1hSb2FYTXVYM05sZEhSc1pXUkJkQ2gwTGw5emRHRjBaU3hsTEhRdVgzSmxjM1ZzZENrN1pXeHpaU0JwWmloY0ltWjFibU4wYVc5dVhDSWhQWFI1Y0dWdlppQnZLWFJvYVhNdVgzSmxiV0ZwYm1sdVp5MHRMSFJvYVhNdVgzSmxjM1ZzZEZ0bFhUMTBPMlZzYzJVZ2FXWW9iajA5UFhCMEtYdDJZWElnYVQxdVpYY2diaWh3S1R0M0tHa3NkQ3h2S1N4MGFHbHpMbDkzYVd4c1UyVjBkR3hsUVhRb2FTeGxLWDFsYkhObElIUm9hWE11WDNkcGJHeFRaWFIwYkdWQmRDaHVaWGNnYmlobWRXNWpkR2x2YmlobEtYdGxLSFFwZlNrc1pTbDlaV3h6WlNCMGFHbHpMbDkzYVd4c1UyVjBkR3hsUVhRb2NpaDBLU3hsS1gwc1RpNXdjbTkwYjNSNWNHVXVYM05sZEhSc1pXUkJkRDFtZFc1amRHbHZiaWgwTEdVc2JpbDdkbUZ5SUhJOWRHaHBjeTV3Y205dGFYTmxPM0l1WDNOMFlYUmxQVDA5YjNRbUppaDBhR2x6TGw5eVpXMWhhVzVwYm1jdExTeDBQVDA5YzNRL2FpaHlMRzRwT25Sb2FYTXVYM0psYzNWc2RGdGxYVDF1S1N3d1BUMDlkR2hwY3k1ZmNtVnRZV2x1YVc1bkppWlRLSElzZEdocGN5NWZjbVZ6ZFd4MEtYMHNUaTV3Y205MGIzUjVjR1V1WDNkcGJHeFRaWFIwYkdWQmREMW1kVzVqZEdsdmJpaDBMR1VwZTNaaGNpQnVQWFJvYVhNN1JTaDBMSFp2YVdRZ01DeG1kVzVqZEdsdmJpaDBLWHR1TGw5elpYUjBiR1ZrUVhRb2FYUXNaU3gwS1gwc1puVnVZM1JwYjI0b2RDbDdiaTVmYzJWMGRHeGxaRUYwS0hOMExHVXNkQ2w5S1gwN2RtRnlJR1IwUFZjc2RuUTllMUJ5YjIxcGMyVTZjSFFzY0c5c2VXWnBiR3c2WkhSOU8xd2lablZ1WTNScGIyNWNJajA5ZEhsd1pXOW1JR1JsWm1sdVpTWW1aR1ZtYVc1bExtRnRaRDlrWldacGJtVW9ablZ1WTNScGIyNG9LWHR5WlhSMWNtNGdkblI5S1RwY0luVnVaR1ZtYVc1bFpGd2lJVDEwZVhCbGIyWWdiVzlrZFd4bEppWnRiMlIxYkdVdVpYaHdiM0owY3o5dGIyUjFiR1V1Wlhod2IzSjBjejEyZERwY0luVnVaR1ZtYVc1bFpGd2lJVDEwZVhCbGIyWWdkR2hwY3lZbUtIUm9hWE11UlZNMlVISnZiV2x6WlQxMmRDa3NaSFFvS1gwcExtTmhiR3dvZEdocGN5azdJbDE5IiwiaW1wb3J0ICcuLi9saWIvZXM2LXByb21pc2UubWluLmpzJ1xuaW1wb3J0IFRlbXBsYXRlcyBmcm9tIFwiLi4vVGVtcGxhdGVzXCJcbmltcG9ydCBMb2dpbkNoZWNrIGZyb20gXCIuLi9Mb2dpbkNoZWNrXCJcbmltcG9ydCB7IGdldEpTT04sIHJvdW5kIH0gZnJvbSBcIi4uL2hlbHBlcnNcIlxuaW1wb3J0IEFQSSwgeyBUQkEsIGdldFRlYW1zLCBnZXRUZWFtU3RhdHMgfSBmcm9tIFwiLi4vQVBJXCJcblxuZXhwb3J0IGZ1bmN0aW9uIGV2ZW50KGtleSkge1xuICBQcm9taXNlLmFsbChbXG4gICAgTG9naW5DaGVjay5nZXQoKSxcbiAgICBUZW1wbGF0ZXMuZ2V0KFwiZXZlbnRcIiksXG4gICAgZ2V0SlNPTihcInN0YXRzLWNvbmZpZy5qc29uXCIpLFxuICAgIFRCQS5nZXQoXCJldmVudC9cIitrZXkpLFxuICBdKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgIGNvbnN0IFssIHRlbXBsYXRlLCBzdGF0cywgZXZlbnRdID0gcmVzO1xuICAgIGNvbnN0ICRjb250YWluZXIgPSAkKFwiI21haW5cIikuY2xvc2VzdChcIi5jb250YWluZXJcIik7XG4gICAgY29uc3QgY29udGFpbmVyQ2xhc3MgPSAkY29udGFpbmVyLmF0dHIoXCJjbGFzc1wiKTtcbiAgICBjb25zdCByYWN0aXZlID0gbmV3IFJhY3RpdmUoe1xuICAgICAgdGVtcGxhdGU6IHRlbXBsYXRlLFxuICAgICAgZGF0YToge1xuICAgICAgICBrZXk6IGtleSxcbiAgICAgICAgc3RhdENvbmZpZzogc3RhdHMsXG4gICAgICAgIGxvYWRpbmc6IHRydWUsXG4gICAgICAgIHRlYW1zOiBbXSxcbiAgICAgICAgcm91bmQ6IHJvdW5kLFxuICAgICAgICBldmVudDogZXZlbnQsXG4gICAgICAgIHN0YXRDb2xvcih2YWx1ZSwgc3RhdCkge1xuICAgICAgICAgIGNvbnN0IHZhbHVlID0gcGFyc2VGbG9hdCh2YWx1ZSk7XG4gICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHN0YXQucHJvZ3Jlc3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICgoIXN0YXQucHJvZ3Jlc3NbaV0ubWluIHx8IHZhbHVlID49IHN0YXQucHJvZ3Jlc3NbaV0ubWluKSAmJiAoIXN0YXQucHJvZ3Jlc3NbaV0ubWF4IHx8IHZhbHVlIDw9IHN0YXQucHJvZ3Jlc3NbaV0ubWF4KSkge1xuICAgICAgICAgICAgICByZXR1cm4gc3RhdC5wcm9ncmVzc1tpXS5jbGFzcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIG1vYmlsZTogJCh3aW5kb3cpLndpZHRoKCkgPCA5MDAsXG4gICAgICAgIHRva2VuOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9rZW4nKSxcbiAgICAgICAgdXNlcjoge1xuICAgICAgICAgIG5hbWU6IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1c2VyLm5hbWUnKSB8fCAnJyxcbiAgICAgICAgICB0ZWFtOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlci50ZWFtJykgfHwgJydcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGNvbXB1dGVkOiB7XG4gICAgICAgIG1vYmlsZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuICQod2luZG93KS53aWR0aCgpIDwgOTAwO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgb25yZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAkY29udGFpbmVyLmFkZENsYXNzKFwid2lkZVwiKTtcbiAgICAgIH0sXG4gICAgICBvbnVucmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgJGNvbnRhaW5lci5hdHRyKFwiY2xhc3NcIiwgY29udGFpbmVyQ2xhc3MpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgZ2V0VGVhbXMoQVBJLCBrZXkpLnRoZW4oZnVuY3Rpb24odGVhbXMpIHtcbiAgICAgIHJhY3RpdmUuc2V0KHtcbiAgICAgICAgdGVhbXM6IHRlYW1zLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICAgIHJldHVybiBhLnRlYW1fbnVtYmVyIC0gYi50ZWFtX251bWJlclxuICAgICAgICB9KSxcbiAgICAgICAgbG9hZGluZzogZmFsc2VcbiAgICAgIH0pO1xuICAgICAgU29ydGFibGUuaW5pdCgpO1xuICAgIH0pO1xuICB9KTtcbn1cbiIsImltcG9ydCAnLi4vbGliL2VzNi1wcm9taXNlLm1pbi5qcydcbmltcG9ydCBUZW1wbGF0ZXMgZnJvbSBcIi4uL1RlbXBsYXRlc1wiXG5pbXBvcnQgQVBJLCB7IFRCQSB9IGZyb20gXCIuLi9BUElcIlxuXG5leHBvcnQgZnVuY3Rpb24gZXZlbnRNYXRjaGVzKGV2ZW50S2V5KSB7XG4gIFByb21pc2UuYWxsKFtcbiAgICBUZW1wbGF0ZXMuZ2V0KFwiZXZlbnQtbWF0Y2hlc1wiKSxcbiAgICBUQkEuZ2V0KFwiZXZlbnQvXCIrZXZlbnRLZXkpLFxuICAgIFRCQS5nZXQoXCJldmVudC9cIitldmVudEtleStcIi9tYXRjaGVzXCIpLnRoZW4oZnVuY3Rpb24obWF0Y2hlcykge1xuICAgICAgcmV0dXJuIG1hdGNoZXMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgIHJldHVybiBhLnRpbWUgLSBiLnRpbWU7XG4gICAgICB9KTtcbiAgICB9KSxcbiAgXSkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICBjb25zdCBbdGVtcGxhdGUsIGV2ZW50LCBtYXRjaGVzXSA9IHJlcztcbiAgICBjb25zdCByYWN0aXZlID0gbmV3IFJhY3RpdmUoe1xuICAgICAgdGVtcGxhdGU6IHRlbXBsYXRlLFxuICAgICAgZGF0YToge1xuICAgICAgICBldmVudDogZXZlbnQsXG4gICAgICAgIG1hdGNoZXM6IG1hdGNoZXMsXG4gICAgICAgIG1vbWVudDogZnVuY3Rpb24oZGF0ZSkge1xuICAgICAgICAgIHJldHVybiBtb21lbnQoZGF0ZSkuZnJvbU5vdygpO1xuICAgICAgICB9LFxuXG4gICAgICB9LFxuICAgICAgY29tcHV0ZWQ6IHtcbiAgICAgICAgbW9iaWxlKCkge1xuICAgICAgICAgIHJldHVybiAkKHdpbmRvdykud2lkdGgoKSA8IDkwMDtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICB9KTtcbiAgfSk7XG59XG4iLCJpbXBvcnQgJy4uL2xpYi9lczYtcHJvbWlzZS5taW4uanMnXG5pbXBvcnQgVGVtcGxhdGVzIGZyb20gXCIuLi9UZW1wbGF0ZXNcIlxuaW1wb3J0IExvZ2luQ2hlY2sgZnJvbSBcIi4uL0xvZ2luQ2hlY2tcIlxuXG5leHBvcnQgZnVuY3Rpb24gZXZlbnRzKGtleSkge1xuICBQcm9taXNlLmFsbChbXG4gICAgTG9naW5DaGVjay5nZXQoKSxcbiAgICBUZW1wbGF0ZXMuZ2V0KFwiZXZlbnRzXCIpLFxuICBdKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgIGNvbnN0IFssIHRlbXBsYXRlXSA9IHJlcztcbiAgICBjb25zdCByYWN0aXZlID0gbmV3IFJhY3RpdmUoe1xuICAgICAgdGVtcGxhdGU6IHRlbXBsYXRlLFxuICAgICAgZGF0YToge1xuICAgICAgICBldmVudHM6IHtcbiAgICAgICAgICBcIjIwMTZhcmNcIjogXCJBcmNoaW1lZGVzXCIsXG4gICAgICAgICAgXCIyMDE2Y2Fyc1wiOiBcIkNhcnNvblwiLFxuICAgICAgICAgIFwiMjAxNmNhcnZcIjogXCJDYXJ2ZXJcIixcbiAgICAgICAgICBcIjIwMTZjdXJcIjogXCJDdXJpZVwiLFxuICAgICAgICAgIFwiMjAxNmdhbFwiOiBcIkdhbGlsZW9cIixcbiAgICAgICAgICBcIjIwMTZob3BcIjogXCJIb3BwZXJcIixcbiAgICAgICAgICBcIjIwMTZuZXdcIjogXCJOZXd0b25cIixcbiAgICAgICAgICBcIjIwMTZ0ZXNcIjogXCJUZXNsYVwiLFxuICAgICAgICAgIFwiMjAxNmNtcFwiOiBcIkVpbnN0ZWluXCIsXG4gICAgICAgIH0sXG4gICAgICAgIG1vYmlsZTogJCh3aW5kb3cpLndpZHRoKCkgPCA5MDAsXG4gICAgICAgIHRva2VuOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9rZW4nKSxcbiAgICAgICAgdXNlcjoge1xuICAgICAgICAgIG5hbWU6IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1c2VyLm5hbWUnKSB8fCAnJyxcbiAgICAgICAgICB0ZWFtOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlci50ZWFtJykgfHwgJydcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGNvbXB1dGVkOiB7XG4gICAgICAgIG1vYmlsZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuICQod2luZG93KS53aWR0aCgpIDwgOTAwO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0pO1xuICB9KTtcbn1cbiIsImltcG9ydCAnLi4vbGliL2VzNi1wcm9taXNlLm1pbi5qcydcbmltcG9ydCBUZW1wbGF0ZXMgZnJvbSBcIi4uL1RlbXBsYXRlc1wiXG5pbXBvcnQgTG9naW5DaGVjayBmcm9tIFwiLi4vTG9naW5DaGVja1wiXG5pbXBvcnQge1xuICBnZXRKU09OLFxuICByb3VuZFxufSBmcm9tIFwiLi4vaGVscGVyc1wiXG5pbXBvcnQgQVBJLCB7XG4gIGdldFRlYW1TdGF0cyxcbiAgZ2VuZXJhdGVUb2tlblxufSBmcm9tIFwiLi4vQVBJXCJcblxuZXhwb3J0IGZ1bmN0aW9uIGxvZ2luKCkge1xuICBQcm9taXNlLmFsbChbXG4gICAgVGVtcGxhdGVzLmdldChcImxvZ2luXCIpXG4gIF0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgY29uc3QgW3RlbXBsYXRlXSA9IHJlcztcbiAgICBpZiAobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuJykpIHtcbiAgICAgIGxvY2F0aW9uLmhhc2ggPSBcIiMvYS9ldmVudHNcIlxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCByYWN0aXZlID0gbmV3IFJhY3RpdmUoe1xuICAgICAgICB0ZW1wbGF0ZTogdGVtcGxhdGUsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBtb2JpbGU6ICQod2luZG93KS53aWR0aCgpIDwgOTAwLFxuICAgICAgICAgIHRva2VuOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9rZW4nKSxcbiAgICAgICAgICB1c2VyOiB7XG4gICAgICAgICAgICBuYW1lOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlci5uYW1lJykgfHwgJycsXG4gICAgICAgICAgICB0ZWFtOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlci50ZWFtJykgfHwgJydcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICAgIHJhY3RpdmUub24oJ2xvZ2luJywgZnVuY3Rpb24obm9kZSkge1xuICAgICAgICB2YXIgbmFtZSA9IHRoaXMuZ2V0KFwidXNlci5uYW1lXCIpO1xuICAgICAgICB2YXIgdGVhbSA9IHRoaXMuZ2V0KFwidXNlci50ZWFtXCIpO1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInVzZXIubmFtZVwiLCBuYW1lKTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ1c2VyLnRlYW1cIiwgdGVhbSk7XG4gICAgICAgIHZhciB0b2tlbiA9IGdlbmVyYXRlVG9rZW4odGVhbSwgbmFtZSk7XG4gICAgICAgIGxvY2F0aW9uLmhhc2ggPSBcIiMvYS9ldmVudHNcIjtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSk7XG4gICAgfVxuICB9KS5jYXRjaChjb25zb2xlLmVycm9yLmJpbmQoY29uc29sZSkpO1xufVxuIiwiaW1wb3J0ICcuLi9saWIvZXM2LXByb21pc2UubWluLmpzJ1xuaW1wb3J0IFRlbXBsYXRlcyBmcm9tIFwiLi4vVGVtcGxhdGVzXCJcbmltcG9ydCBMb2dpbkNoZWNrIGZyb20gXCIuLi9UZW1wbGF0ZXNcIlxuaW1wb3J0IHsgZ2V0SlNPTiwgcm91bmQgfSBmcm9tIFwiLi4vaGVscGVyc1wiXG5pbXBvcnQgQVBJLCB7IGdldFRlYW1TdGF0cyB9IGZyb20gXCIuLi9BUElcIlxuXG5leHBvcnQgZnVuY3Rpb24gdGVhbShrZXkpIHtcbiAgUHJvbWlzZS5hbGwoW1xuICAgIExvZ2luQ2hlY2suZ2V0KCksXG4gICAgVGVtcGxhdGVzLmdldChcInRlYW1cIiksXG4gICAgZ2V0SlNPTihcInN0YXRzLWNvbmZpZy5qc29uXCIpLFxuICAgIGdldFRlYW1TdGF0cyhBUEksIGtleSksXG4gIF0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgY29uc3QgWywgdGVtcGxhdGUsIHN0YXRzLCB0ZWFtRGF0YV0gPSByZXM7XG4gICAgY29uc3QgcmFjdGl2ZSA9IG5ldyBSYWN0aXZlKHtcbiAgICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZSxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgc3RhdHM6IHN0YXRzLFxuICAgICAgICBzdGF0S2V5czogWydjYWxjcycsICdnb2FscycsICdkZWZlbnNlcyddLFxuICAgICAgICBrZXk6IGtleSxcbiAgICAgICAgdGVhbTogdGVhbURhdGEsXG4gICAgICAgIHJvdW5kOiByb3VuZCxcbiAgICAgICAgbW9iaWxlOiAkKHdpbmRvdykud2lkdGgoKSA8IDkwMCxcbiAgICAgICAgdG9rZW46IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpLFxuICAgICAgICB1c2VyOiB7XG4gICAgICAgICAgbmFtZTogbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VzZXIubmFtZScpIHx8ICcnLFxuICAgICAgICAgIHRlYW06IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1c2VyLnRlYW0nKSB8fCAnJ1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0pO1xuICB9KS5jYXRjaChjb25zb2xlLmVycm9yLmJpbmQoY29uc29sZSkpO1xufVxuIl19
