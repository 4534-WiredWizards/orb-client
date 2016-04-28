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
  "/a": {
    "/team/:key": Pages.team,
    "/match/:key": Pages.match,
    "/event/:key": Pages.event,
    "/matches/:key": Pages.eventMatches,
    "/events": Pages.events
  }
}).configure({
  html5history: false,
  before: [],
  after: [],
  recurse: "forward" });

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
  var url = "http://orb.scoutfrc.io/" + key;
  return new Promise(function (resolve, reject) {
    return $.ajax({
      method: "get",
      dataType: "json",
      data: {
        token: localStorage.getItem("token") },
      url: url,
      error: reject }).then(resolve);
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
  var promises = [];
  if (typeof team == "object" && team.team_number == key) {
    promises.push(new Promise(function (resolve, reject) {
      return resolve(team);
    }));
  } else {
    promises.push(API.get("team/" + key));
  }
  if (typeof team == "object" && typeof team.stats == "object") {
    promises.push(new Promise(function (resolve, reject) {
      return resolve(team.stats.score);
    }));
    promises.push(new Promise(function (resolve, reject) {
      return resolve(team.stats.defenses);
    }));
    promises.push(new Promise(function (resolve, reject) {
      return resolve(team.stats.goals);
    }));
    promises.push(new Promise(function (resolve, reject) {
      return resolve(team.stats.scale);
    }));
    promises.push(new Promise(function (resolve, reject) {
      return resolve(team.stats.challenge);
    }));
  } else {
    promises.push(API.get("team/" + key + "/score"));
    promises.push(API.get("team/" + key + "/defense"));
    promises.push(API.get("team/" + key + "/goals"));
    promises.push(API.get("team/" + key + "/scale"));
    promises.push(API.get("team/" + key + "/challenge"));
  }
  return Promise.all(promises).then(function (res) {
    var _res = _slicedToArray(res, 6);

    var team = _res[0];
    var score = _res[1];
    var defenses = _res[2];
    var goals = _res[3];
    var scale = _res[4];
    var challenge = _res[5];

    return extend(team, {
      stats: {
        calcs: {
          score: score
        },
        defenses: {
          low_bar: defenses[0],
          portcullis: defenses[1],
          cheval_de_frise: defenses[2],
          moat: defenses[3],
          ramparts: defenses[4],
          drawbridge: defenses[5],
          sally_port: defenses[6],
          rock_wall: defenses[7],
          rough_terrain: defenses[8] },
        goals: {
          auto_low: goals[0],
          auto_high: goals[1],
          teleop_low: goals[2],
          teleop_high: goals[3] },
        tower: {
          scale: scale[0],
          challenge: challenge[0]
        }
      }
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

var _interopRequire = function _interopRequire(obj) {
  return obj && obj.__esModule ? obj["default"] : obj;
};

require("./lib/es6-promise.min.js");

var cacheable = _interopRequire(require("./cacheable"));

module.exports = cacheable(function () {
  return new Promise(function (resolve, reject) {
    if (localStorage.getItem("token")) {
      resolve(1);
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

var _interopRequire = function _interopRequire(obj) {
  return obj && obj.__esModule ? obj["default"] : obj;
};

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
      console.log(teams);
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

exports.eventMatches = eventMatches;
Object.defineProperty(exports, "__esModule", {
  value: true
});

require("../lib/es6-promise.min.js");

var Templates = _interopRequire(require("../Templates"));

var _API = require("../API");

var API = _interopRequire(_API);

var TBA = _API.TBA;

var round = require("../helpers").round;

function eventMatches(eventKey) {
  Promise.all([Templates.get("event-matches"), TBA.get("event/" + eventKey), TBA.get("event/" + eventKey + "/stats")]).then(function (res) {
    var _res = _slicedToArray(res, 3);

    var template = _res[0];
    var event = _res[1];
    var eventStats = _res[2];

    var predictionsCounts = {
      oprs: [],
      dprs: [],
      ccwms: [] };
    var ractive = new Ractive({
      template: template,
      data: {
        event: event,
        eventStats: eventStats,
        matches: [],
        loading: 1,
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
        }),
        getAllianceSum: function getAllianceSum(teams, key) {
          return teams.map(function (team) {
            return eventStats[key][team.replace(/[^\d]/g, "")];
          }).reduce(function (a, b) {
            return a + b;
          });
        },
        getWinner: function getWinner(redTeams, blueTeams, key) {
          return this.get("getAllianceSum")(redTeams, key) > this.get("getAllianceSum")(blueTeams, key);
        }
      },
      computed: {
        mobile: function mobile() {
          return $(window).width() < 900;
        }
      } });
    TBA.get("event/" + eventKey + "/matches").then(function (matches) {
      return matches;
    }).then(function (matches) {
      var sum = ractive.get("getAllianceSum").bind(ractive);
      var predictedWinner = ractive.get("getWinner").bind(ractive);
      matches.forEach(function (match) {
        var red = match.alliances.red,
            blue = match.alliances.blue;
        var winner = red.score > blue.score;
        var redTeams = red.teams.map(function (team) {
          return team.replace(/[^\d]/g, "");
        });
        var blueTeams = blue.teams.map(function (team) {
          return team.replace(/[^\d]/g, "");
        });
        var oprPred = predictedWinner(redTeams, blueTeams, "oprs");
        var dprPred = predictedWinner(redTeams, blueTeams, "dprs");
        var ccwmPred = predictedWinner(redTeams, blueTeams, "ccwms");
        predictionsCounts.oprs.push(oprPred == winner);
        predictionsCounts.dprs.push(dprPred == winner);
        predictionsCounts.ccwms.push(ccwmPred == winner);
      });
      ractive.set({
        matches: matches.sort(function (a, b) {
          return a.time - b.time;
        }),
        loading: 2,
        predictions: 1
      });
      Promise.all(matches.map(function (match) {
        return API.get("work/match/" + eventKey + "/" + match.key);
      })).then(function (matches) {
        ractive.set("loading", 0);
        ractive.set({
          matches: ractive.get("matches").map(function (match, i) {
            match.predictions = matches[i].map(function (score) {
              return round(score, 2);
            });
            return match;
          }).sort(function (match, i) {
            console.log(match);
          }) });
      });
    });
  });
}

/*
{{#if predictions}}
  <b>Predicted</b>:
  {{#if predictions[0] > predictions[1]}}
    <span class="red">Red</span>
  {{else}}
    <span class="blue">Blue</span>
  {{/if}}
  ({{predictions[0]}} - {{predictions[1]}})
  <br>
  OPR:
  {{#if getWinner(alliances.red.teams, alliances.blue.teams, 'oprs')}}
    <span class="red">Red</span>
  {{else}}
    <span class="blue">Blue</span>
  {{/if}}
  ({{getAllianceSum(alliances.red.teams, 'oprs')}} - {{getAllianceSum(alliances.blue.teams, 'oprs')}})
  <br>
  DPR:
  {{#if getWinner(alliances.red.teams, alliances.blue.teams, 'dprs')}}
    <span class="red">Red</span>
  {{else}}
    <span class="blue">Blue</span>
  {{/if}}
  ({{getAllianceSum(alliances.red.teams, 'dprs')}} - {{getAllianceSum(alliances.blue.teams, 'dprs')}})
  <br>
  CCWM:
  {{#if getWinner(alliances.red.teams, alliances.blue.teams, 'ccwms')}}
    <span class="red">Red</span>
  {{else}}
    <span class="blue">Blue</span>
  {{/if}}
  ({{getAllianceSum(alliances.red.teams, 'ccwms')}} - {{getAllianceSum(alliances.blue.teams, 'ccwms')}})
{{/if}}*/

},{"../API":3,"../Templates":7,"../helpers":9,"../lib/es6-promise.min.js":10}],13:[function(require,module,exports){
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

exports.team = team;
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
        statKeys: ["calcs", "goals", "defenses", "tower"],
        key: key,
        team: teamData,
        round: round,
        mobile: $(window).width() < 900,
        token: localStorage.getItem("token"),
        user: {
          name: localStorage.getItem("user.name") || "",
          team: localStorage.getItem("user.team") || "" } } });
  })["catch"](console.error.bind(console));
}

},{"../API":3,"../LoginCheck":5,"../Templates":7,"../helpers":9,"../lib/es6-promise.min.js":10}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9kYW5pZWwvRG9jdW1lbnRzL3Byb2plY3RzL29yYi1jbGllbnQvc3JjL21haW4uanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiL2hvbWUvZGFuaWVsL0RvY3VtZW50cy9wcm9qZWN0cy9vcmItY2xpZW50L3NyYy9BUEkuanMiLCIvaG9tZS9kYW5pZWwvRG9jdW1lbnRzL3Byb2plY3RzL29yYi1jbGllbnQvc3JjL0NvbXBvbmVudHMuanMiLCIvaG9tZS9kYW5pZWwvRG9jdW1lbnRzL3Byb2plY3RzL29yYi1jbGllbnQvc3JjL0xvZ2luQ2hlY2suanMiLCIvaG9tZS9kYW5pZWwvRG9jdW1lbnRzL3Byb2plY3RzL29yYi1jbGllbnQvc3JjL1BhZ2VzLmpzIiwiL2hvbWUvZGFuaWVsL0RvY3VtZW50cy9wcm9qZWN0cy9vcmItY2xpZW50L3NyYy9UZW1wbGF0ZXMuanMiLCIvaG9tZS9kYW5pZWwvRG9jdW1lbnRzL3Byb2plY3RzL29yYi1jbGllbnQvc3JjL2NhY2hlYWJsZS5qcyIsIi9ob21lL2RhbmllbC9Eb2N1bWVudHMvcHJvamVjdHMvb3JiLWNsaWVudC9zcmMvaGVscGVycy5qcyIsInNyYy9saWIvZXM2LXByb21pc2UubWluLmpzIiwiL2hvbWUvZGFuaWVsL0RvY3VtZW50cy9wcm9qZWN0cy9vcmItY2xpZW50L3NyYy9wYWdlcy9ldmVudC5qcyIsIi9ob21lL2RhbmllbC9Eb2N1bWVudHMvcHJvamVjdHMvb3JiLWNsaWVudC9zcmMvcGFnZXMvZXZlbnRNYXRjaGVzLmpzIiwiL2hvbWUvZGFuaWVsL0RvY3VtZW50cy9wcm9qZWN0cy9vcmItY2xpZW50L3NyYy9wYWdlcy9ldmVudHMuanMiLCIvaG9tZS9kYW5pZWwvRG9jdW1lbnRzL3Byb2plY3RzL29yYi1jbGllbnQvc3JjL3BhZ2VzL2xvZ2luLmpzIiwiL2hvbWUvZGFuaWVsL0RvY3VtZW50cy9wcm9q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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcE9BLFlBQVksQ0FBQzs7QUFFYixJQUFJLGVBQWUsR0FBRyxTQUFBLGVBQUEsQ0FBVSxHQUFHLEVBQUU7QUFBRSxTQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsVUFBVSxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsR0FBRyxHQUFHLENBQUM7Q0FBRSxDQUFDOztBQUU5RixJQUFJLGNBQWMsR0FBRyxTQUFBLGNBQUEsQ0FBVSxHQUFHLEVBQUUsQ0FBQyxFQUFFO0FBQUUsTUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQUUsV0FBTyxHQUFHLENBQUM7R0FBRSxNQUFNLElBQUksTUFBTSxDQUFDLFFBQVEsSUFBSSxNQUFNLENBQUMsR0FBRyxD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R0FBRyxFQUFFO0FBa0JwQixRQUFJLElBQUksR0FBRyxjQUFjLENBakJhLEdBQUcsRUFBQSxDQUFBLENBQUEsQ0FBQTs7QUFtQnpDLFFBbkJTLFFBQVEsR0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7QUFvQmpCLFFBcEJtQixLQUFLLEdBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0FBcUJ4QixRQXJCMEIsUUFBUSxHQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTs7QUFDbEMsUUFBTSxPQUFPLEdBQUcsSUFBSSxPQUFPLENBQUM7QUFDMUIsY0FBUSxFQUFFLFFBQVE7QUFDbEIsVUFBSSxFQUFFO0FBQ0osYUFBSyxFQUFFLEtBQUs7QUFDWixnQkFBUSxFQUFFLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsT0FBTyxDQUFDO0FBQ2pELFdBQUcsRUFBRSxHQUFHO0FBQ1IsWUFBSSxFQUFFLFFBQVE7QUFDZCxhQUFLLEVBQUUsS0FBSztBQUNaLGNBQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxFQUFFLEdBQUcsR0FBRztBQUMvQixhQUFLLEVBQUUsWUFBWSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7QUFDcEMsWUFBSSxFQUFFO0FBQ0osY0FBSSxFQUFFLFlBQVksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRTtBQUM3QyxjQUFJLEVBQUUsWUFBWSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEVBQzlDLEVBQ0YsRUFDRixDQUFDLENBQUM7R0FDSixDQUFDLENBQUEsT0FBQSxDQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztDQUN2QyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgKiBhcyBQYWdlcyBmcm9tICcuL1BhZ2VzJ1xuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAnLi9Db21wb25lbnRzJ1xuaW1wb3J0IHtcbiAgZG9jdW1lbnRSZWFkeVxufSBmcm9tICcuL2hlbHBlcnMnXG5pbXBvcnQgJy4vbGliL2VzNi1wcm9taXNlLm1pbi5qcydcblxuY29uc3QgZWwgPSBcIiNtYWluXCI7XG5cbmNvbnN0IHJvdXRlciA9IFJvdXRlcih7XG4gIFwiL2xvZ2luXCI6IFBhZ2VzLmxvZ2luLFxuICBcIi9hXCI6IHtcbiAgICBcIi90ZWFtLzprZXlcIjogUGFnZXMudGVhbSxcbiAgICBcIi9tYXRjaC86a2V5XCI6IFBhZ2VzLm1hdGNoLFxuICAgIFwiL2V2ZW50LzprZXlcIjogUGFnZXMuZXZlbnQsXG4gICAgXCIvbWF0Y2hlcy86a2V5XCI6IFBhZ2VzLmV2ZW50TWF0Y2hlcyxcbiAgICBcIi9ldmVudHNcIjogUGFnZXMuZXZlbnRzXG4gIH1cbn0pLmNvbmZpZ3VyZSh7XG4gIGh0bWw1aGlzdG9yeTogZmFsc2UsXG4gIGJlZm9yZTogW10sXG4gIGFmdGVyOiBbXSxcbiAgcmVjdXJzZTogJ2ZvcndhcmQnLFxufSk7XG5cblByb21pc2UuYWxsKFtkb2N1bWVudFJlYWR5LCBDb21wb25lbnRzLmxvYWQoKV0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gIGNvbnN0IFssIENvbXBvbmVudHNdID0gcmVzO1xuICBSYWN0aXZlID0gUmFjdGl2ZS5leHRlbmQoe1xuICAgIGVsOiBlbCxcbiAgICBjb21wb25lbnRzOiBDb21wb25lbnRzLmNvbXBvbmVudHMsXG4gICAgYmVmb3JlOiBbZnVuY3Rpb24oKSB7XG4gICAgICAkKHdpbmRvdykuc2Nyb2xsVG9wKDApO1xuICAgIH1dLFxuICB9KTtcbiAgcm91dGVyLmluaXQoKTtcbiAgaWYgKCFyb3V0ZXIuZ2V0Um91dGUoKS5maWx0ZXIoQm9vbGVhbikubGVuZ3RoKSB7XG4gICAgaWYgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpKSB7XG4gICAgICByb3V0ZXIuc2V0Um91dGUoXCIvYS9ldmVudHNcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJvdXRlci5zZXRSb3V0ZShcIi9sb2dpblwiKTtcbiAgICB9XG4gIH1cblxuICAkKFwiLm5hdmJhclwiKS5vbihcImNsaWNrXCIsIFwiYVtocmVmXVtocmVmIT0nIyddXCIsIGZ1bmN0aW9uKCkge1xuICAgIGlmICgkKCcuY29sbGFwc2UuaW4nKS5sZW5ndGggPiAwKSB7XG4gICAgICAkKCcubmF2YmFyLXRvZ2dsZScpLmNsaWNrKCk7XG4gICAgfVxuICB9KTtcblxuICBjb25zdCAkb3ZlcmxheSA9ICQoXCI8ZGl2PlwiLCB7XG4gICAgY2xhc3M6IFwib3ZlcmxheVwiLFxuICAgIGNzczoge1xuICAgICAgXCJkaXNwbGF5XCI6IFwibm9uZVwiXG4gICAgfSxcbiAgICBjbGljaygpIHtcbiAgICAgIGlmICgkKCcuY29sbGFwc2UuaW4nKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICQoJy5uYXZiYXItdG9nZ2xlJykuY2xpY2soKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gICRvdmVybGF5LnByZXBlbmRUbyhcImh0bWxcIik7XG5cbiAgJCgnLm5hdmJhci10b2dnbGUnKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICBpZiAoJCgnLmNvbGxhcHNlLmluJykubGVuZ3RoID4gMCkge1xuICAgICAgJG92ZXJsYXkuaGlkZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkb3ZlcmxheS5zaG93KCk7XG4gICAgfVxuICB9KTtcblxufSk7XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5wcm9jZXNzLm5leHRUaWNrID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgIHZhciBjYW5NdXRhdGlvbk9ic2VydmVyID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuTXV0YXRpb25PYnNlcnZlcjtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICB2YXIgcXVldWUgPSBbXTtcblxuICAgIGlmIChjYW5NdXRhdGlvbk9ic2VydmVyKSB7XG4gICAgICAgIHZhciBoaWRkZW5EaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICB2YXIgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgcXVldWVMaXN0ID0gcXVldWUuc2xpY2UoKTtcbiAgICAgICAgICAgIHF1ZXVlLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICBxdWV1ZUxpc3QuZm9yRWFjaChmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUoaGlkZGVuRGl2LCB7IGF0dHJpYnV0ZXM6IHRydWUgfSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBpZiAoIXF1ZXVlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGhpZGRlbkRpdi5zZXRBdHRyaWJ1dGUoJ3llcycsICdubycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuIiwiaW1wb3J0ICcuL2xpYi9lczYtcHJvbWlzZS5taW4uanMnXG5pbXBvcnQgY2FjaGVhYmxlIGZyb20gJy4vY2FjaGVhYmxlJ1xuaW1wb3J0IHsgZXh0ZW5kIH0gZnJvbSAnLi9oZWxwZXJzJ1xuXG5cblxuZXhwb3J0IGRlZmF1bHQgY2FjaGVhYmxlKGZ1bmN0aW9uKGtleSkge1xuICBjb25zdCBrZXkgPSBrZXkucmVwbGFjZSgvXlxcLy8sIFwiXCIpLnJlcGxhY2UoL1xcLyQvLCBcIlwiKTtcbiAgbGV0IHVybCA9IFwiaHR0cDovL29yYi5zY291dGZyYy5pby9cIitrZXk7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICByZXR1cm4gJC5hamF4KHtcbiAgICAgIG1ldGhvZDogXCJnZXRcIixcbiAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgdG9rZW46IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwidG9rZW5cIiksXG4gICAgICB9LFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBlcnJvcjogcmVqZWN0LFxuICAgIH0pLnRoZW4ocmVzb2x2ZSk7XG4gIH0pLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJBUEkgUmVxdWVzdCBVbnN1Y2Nlc3NmdWxcIiwgdXJsLCByZXMpO1xuICAgIHJldHVybiByZXM7XG4gIH0pO1xufSk7XG5cbmV4cG9ydCBsZXQgVEJBID0gY2FjaGVhYmxlKGZ1bmN0aW9uKHBhdGgpIHtcbiAgY29uc3QgdXJsID0gXCJodHRwOi8vd3d3LnRoZWJsdWVhbGxpYW5jZS5jb20vYXBpL3YyL1wiICsgcGF0aDtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgbWV0aG9kOiBcImdldFwiLFxuICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxuICAgICAgZGF0YToge1xuICAgICAgICAnWC1UQkEtQXBwLUlkJzogXCJmcmM0NTM0Om9yYjpjbGllbnRcIlxuICAgICAgfSxcbiAgICAgIHVybDogdXJsLFxuICAgICAgZXJyb3I6IHJlamVjdFxuICAgIH0pLnRoZW4ocmVzb2x2ZSk7XG4gIH0pLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJBUEkgUmVxdWVzdCBVbnN1Y2Nlc3NmdWxcIiwgdXJsLCByZXMpO1xuICAgIHJldHVybiByZXM7XG4gIH0pO1xufSk7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUZWFtU3RhdHMoQVBJLCBrZXksIHRlYW0pIHtcbiAgbGV0IHByb21pc2VzID0gW107XG4gIGlmICh0eXBlb2YgdGVhbSA9PSBcIm9iamVjdFwiICYmIHRlYW0udGVhbV9udW1iZXIgPT0ga2V5KSB7XG4gICAgcHJvbWlzZXMucHVzaChuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiByZXNvbHZlKHRlYW0pKSlcbiAgfSBlbHNlIHtcbiAgICBwcm9taXNlcy5wdXNoKEFQSS5nZXQoXCJ0ZWFtL1wiK2tleSkpO1xuICB9XG4gIGlmICh0eXBlb2YgdGVhbSA9PSBcIm9iamVjdFwiICYmIHR5cGVvZiB0ZWFtLnN0YXRzID09IFwib2JqZWN0XCIpIHtcbiAgICBwcm9taXNlcy5wdXNoKG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHJlc29sdmUodGVhbS5zdGF0cy5zY29yZSkpKTtcbiAgICBwcm9taXNlcy5wdXNoKG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHJlc29sdmUodGVhbS5zdGF0cy5kZWZlbnNlcykpKTtcbiAgICBwcm9taXNlcy5wdXNoKG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHJlc29sdmUodGVhbS5zdGF0cy5nb2FscykpKTtcbiAgICBwcm9taXNlcy5wdXNoKG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHJlc29sdmUodGVhbS5zdGF0cy5zY2FsZSkpKTtcbiAgICBwcm9taXNlcy5wdXNoKG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHJlc29sdmUodGVhbS5zdGF0cy5jaGFsbGVuZ2UpKSk7XG4gIH0gZWxzZSB7XG4gICAgcHJvbWlzZXMucHVzaChBUEkuZ2V0KFwidGVhbS9cIitrZXkrXCIvc2NvcmVcIikpO1xuICAgIHByb21pc2VzLnB1c2goQVBJLmdldChcInRlYW0vXCIra2V5K1wiL2RlZmVuc2VcIikpO1xuICAgIHByb21pc2VzLnB1c2goQVBJLmdldChcInRlYW0vXCIra2V5K1wiL2dvYWxzXCIpKTtcbiAgICBwcm9taXNlcy5wdXNoKEFQSS5nZXQoXCJ0ZWFtL1wiK2tleStcIi9zY2FsZVwiKSk7XG4gICAgcHJvbWlzZXMucHVzaChBUEkuZ2V0KFwidGVhbS9cIitrZXkrXCIvY2hhbGxlbmdlXCIpKTtcbiAgfVxuICByZXR1cm4gUHJvbWlzZS5hbGwocHJvbWlzZXMpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgbGV0IFt0ZWFtLCBzY29yZSwgZGVmZW5zZXMsIGdvYWxzLCBzY2FsZSwgY2hhbGxlbmdlXSA9IHJlcztcbiAgICByZXR1cm4gZXh0ZW5kKHRlYW0sIHtcbiAgICAgIHN0YXRzOiB7XG4gICAgICAgIGNhbGNzOiB7XG4gICAgICAgICAgc2NvcmU6IHNjb3JlXG4gICAgICAgIH0sXG4gICAgICAgIGRlZmVuc2VzOiB7XG4gICAgICAgICAgbG93X2JhcjogZGVmZW5zZXNbMF0sXG4gICAgICAgICAgcG9ydGN1bGxpczogZGVmZW5zZXNbMV0sXG4gICAgICAgICAgY2hldmFsX2RlX2ZyaXNlOiBkZWZlbnNlc1syXSxcbiAgICAgICAgICBtb2F0OiBkZWZlbnNlc1szXSxcbiAgICAgICAgICByYW1wYXJ0czogZGVmZW5zZXNbNF0sXG4gICAgICAgICAgZHJhd2JyaWRnZTogZGVmZW5zZXNbNV0sXG4gICAgICAgICAgc2FsbHlfcG9ydDogZGVmZW5zZXNbNl0sXG4gICAgICAgICAgcm9ja193YWxsOiBkZWZlbnNlc1s3XSxcbiAgICAgICAgICByb3VnaF90ZXJyYWluOiBkZWZlbnNlc1s4XSxcbiAgICAgICAgfSxcbiAgICAgICAgZ29hbHM6IHtcbiAgICAgICAgICBhdXRvX2xvdzogZ29hbHNbMF0sXG4gICAgICAgICAgYXV0b19oaWdoOiBnb2Fsc1sxXSxcbiAgICAgICAgICB0ZWxlb3BfbG93OiBnb2Fsc1syXSxcbiAgICAgICAgICB0ZWxlb3BfaGlnaDogZ29hbHNbM10sXG4gICAgICAgIH0sXG4gICAgICAgIHRvd2VyOiB7XG4gICAgICAgICAgc2NhbGU6IHNjYWxlWzBdLFxuICAgICAgICAgIGNoYWxsZW5nZTogY2hhbGxlbmdlWzBdXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUZWFtcyhBUEksIGtleSkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgcmVzb2x2ZShBUEkuZ2V0KFwibGlzdC9cIitrZXkpKTtcbiAgfSkudGhlbihmdW5jdGlvbih0ZWFtcykge1xuICAgIHJldHVybiBQcm9taXNlLmFsbCh0ZWFtcy5tYXAodGVhbSA9PiBnZXRUZWFtU3RhdHMoQVBJLCB0ZWFtLnRlYW1fbnVtYmVyLCB0ZWFtKSkpO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdlbmVyYXRlVG9rZW4odGVhbSxuYW1lKSB7XG4gIHZhciB0b2tlbiA9IHRlYW0gKyBcIi5cIiArIG1kNShuYW1lKTtcbiAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ0b2tlblwiLHRva2VuKTtcbiAgcmV0dXJuIHRva2VuO1xufVxuIiwiaW1wb3J0ICcuL2xpYi9lczYtcHJvbWlzZS5taW4uanMnXG5pbXBvcnQgVGVtcGxhdGVzIGZyb20gJy4vVGVtcGxhdGVzJ1xuXG5leHBvcnQgZGVmYXVsdCB7XG4gIHRlbXBsYXRlczoge30sXG4gIGNvbXBvbmVudHM6IHt9LFxuICBjcmVhdGU6IGZ1bmN0aW9uKGRvbmUpIHtcbiAgICB0aGlzLmNvbXBvbmVudHMuUHJvZ3Jlc3MgPSBSYWN0aXZlLmV4dGVuZCh7XG4gICAgICAgaXNvbGF0ZWQ6IGZhbHNlLFxuICAgICAgIHRlbXBsYXRlOiB0aGlzLnRlbXBsYXRlcy5wcm9ncmVzcyxcbiAgICAgICBvbmluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgY29uc3Qgc3RhdCA9IHRoaXMuZ2V0KFwic3RhdFwiKTtcbiAgICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy5nZXQoXCJ2YWx1ZVwiKTtcbiAgICAgICAgIGxldCBwcm9ncmVzc0NsYXNzO1xuICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHN0YXQucHJvZ3Jlc3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgaWYgKCghc3RhdC5wcm9ncmVzc1tpXS5taW4gfHwgdmFsdWUgPj0gc3RhdC5wcm9ncmVzc1tpXS5taW4pICYmICghc3RhdC5wcm9ncmVzc1tpXS5tYXggfHwgdmFsdWUgPD0gc3RhdC5wcm9ncmVzc1tpXS5tYXgpKSB7XG4gICAgICAgICAgICAgcHJvZ3Jlc3NDbGFzcyA9IHN0YXQucHJvZ3Jlc3NbaV0uY2xhc3M7XG4gICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgIH1cbiAgICAgICAgIH1cbiAgICAgICAgIHRoaXMuc2V0KHtcbiAgICAgICAgICAgbWluOiBzdGF0Lm1pbixcbiAgICAgICAgICAgbWF4OiBzdGF0Lm1heCxcbiAgICAgICAgICAgd2lkdGg6IChzdGF0Lm1pbiArIHZhbHVlKS9zdGF0Lm1heCAqIDEwMCxcbiAgICAgICAgICAgcHJvZ3Jlc3NDbGFzczogcHJvZ3Jlc3NDbGFzcyxcbiAgICAgICAgIH0pXG4gICAgICAgfSxcblxuICAgIH0pO1xuICB9LFxuICBsb2FkOiBmdW5jdGlvbihkb25lKSB7XG4gICAgY29uc3QgX3RoaXMgPSB0aGlzO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIFRlbXBsYXRlcy5nZXQoXCJjb21wb25lbnRzXCIpLnRoZW4oZnVuY3Rpb24odGVtcGxhdGVzKSB7XG4gICAgICAgICQoXCI8ZGl2PlwiKS5odG1sKHRlbXBsYXRlcykuZmluZChcInNjcmlwdC50ZW1wbGF0ZVwiKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGNvbnN0ICR0aGlzID0gJCh0aGlzKTtcbiAgICAgICAgICBfdGhpcy50ZW1wbGF0ZXNbJHRoaXMuYXR0cihcIm5hbWVcIildID0gJHRoaXMuaHRtbCgpLnRyaW0oKTtcbiAgICAgICAgfSk7XG4gICAgICAgIF90aGlzLmNyZWF0ZSgpO1xuICAgICAgICByZXNvbHZlKF90aGlzKTtcbiAgICAgIH0pLmNhdGNoKHJlamVjdCk7XG4gICAgfSk7XG4gIH0sXG59O1xuIiwiaW1wb3J0ICcuL2xpYi9lczYtcHJvbWlzZS5taW4uanMnXG5pbXBvcnQgY2FjaGVhYmxlIGZyb20gJy4vY2FjaGVhYmxlJ1xuXG5leHBvcnQgZGVmYXVsdCBjYWNoZWFibGUoZnVuY3Rpb24oKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICBpZihsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInRva2VuXCIpKSB7XG4gICAgICByZXNvbHZlKDEpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsb2NhdGlvbi5oYXNoID0gXCIjL2xvZ2luXCJcbiAgICAgIHJlamVjdCgpO1xuICAgIH1cbiAgfSk7XG59KTtcbiIsImV4cG9ydCAqIGZyb20gJy4vcGFnZXMvdGVhbSdcbmV4cG9ydCAqIGZyb20gJy4vcGFnZXMvZXZlbnQnXG5leHBvcnQgKiBmcm9tICcuL3BhZ2VzL2xvZ2luJ1xuZXhwb3J0ICogZnJvbSAnLi9wYWdlcy9ldmVudHMnXG5leHBvcnQgKiBmcm9tICcuL3BhZ2VzL2V2ZW50TWF0Y2hlcydcbiIsImltcG9ydCAnLi9saWIvZXM2LXByb21pc2UubWluLmpzJ1xuaW1wb3J0IGNhY2hlYWJsZSBmcm9tICcuL2NhY2hlYWJsZSdcblxuZXhwb3J0IGRlZmF1bHQgY2FjaGVhYmxlKGZ1bmN0aW9uKGtleSkge1xuICBjb25zdCB1cmwgPSBcInRlbXBsYXRlcy9cIitrZXkrXCIuaHRtbFwiO1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgcmV0dXJuICQuYWpheCh7XG4gICAgICBtZXRob2Q6IFwiZ2V0XCIsXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGVycm9yOiByZWplY3RcbiAgICB9KS50aGVuKHJlc29sdmUpO1xuICB9KS5jYXRjaChmdW5jdGlvbihyZXMpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiVGVtcGxhdGUgUmVxdWVzdCBVbnN1Y2Nlc3NmdWxcIiwgdXJsLCByZXMpO1xuICAgIHJldHVybiByZXM7XG4gIH0pO1xufSk7XG4iLCJpbXBvcnQgJy4vbGliL2VzNi1wcm9taXNlLm1pbi5qcydcbmltcG9ydCBjYWNoZWFibGUgZnJvbSAnLi9jYWNoZWFibGUnXG5cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGNhY2hlYWJsZShnZXRQcm9taXNlKSB7XG4gIGNvbnN0IF9jYWNoZSA9IHt9O1xuXG4gIGZ1bmN0aW9uIHNldChrZXksIHZhbHVlKSB7XG4gICAgcmV0dXJuIF9jYWNoZVtrZXldID0gdmFsdWU7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIGdldChrZXksIGNhbGxiYWNrKSB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIGlmIChfY2FjaGVba2V5XSkge1xuICAgICAgICAgIHJldHVybiByZXNvbHZlKF9jYWNoZVtrZXldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdldFByb21pc2Uoa2V5KVxuICAgICAgICAgIC50aGVuKHZhbHVlID0+IHNldChrZXksIHZhbHVlKSlcbiAgICAgICAgICAudGhlbihyZXNvbHZlKVxuICAgICAgICAgIC5jYXRjaChyZWplY3QpO1xuXG4gICAgICB9KS50aGVuKGNhbGxiYWNrKTtcbiAgICB9LFxuICB9XG59XG4iLCJpbXBvcnQgJy4vbGliL2VzNi1wcm9taXNlLm1pbi5qcydcblxuZXhwb3J0IGZ1bmN0aW9uIGdldEpTT04odXJsKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgJC5hamF4KHtcbiAgICAgIG1ldGhvZDogXCJnZXRcIixcbiAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcbiAgICAgIGRhdGE6IHt9LFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBlcnJvcjogcmVqZWN0XG4gICAgfSkudGhlbihyZXNvbHZlKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByb3VuZChuLCBkaWdpdHMpIHtcbiAgY29uc3QgbiA9IHBhcnNlRmxvYXQobik7XG4gIGNvbnN0IGRpZ2l0cyA9IHBhcnNlSW50KGRpZ2l0cyk7XG4gIGNvbnN0IHBhcnRzID0gKE1hdGgucm91bmQobiAqIE1hdGgucG93KDEwLCBkaWdpdHMpKS9NYXRoLnBvdygxMCwgZGlnaXRzKSkudG9TdHJpbmcoKS5zcGxpdChcIi5cIik7XG4gIGlmIChwYXJ0cy5sZW5ndGggPT0gMSkge1xuICAgIHBhcnRzLnB1c2goXCJcIik7XG4gIH1cbiAgcmV0dXJuIHBhcnRzWzBdICsgKGRpZ2l0cyA/IFwiLlwiIDogXCJcIikgKyBwYXJ0c1sxXSArIEFycmF5KE1hdGgubWF4KDAsIGRpZ2l0cyAtIHBhcnRzWzFdLmxlbmd0aCArIDEpKS5qb2luKFwiMFwiKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRvY3VtZW50UmVhZHkoKSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICBpZiAoJC5pc1JlYWR5KSB7XG4gICAgICByZXNvbHZlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICQocmVzb2x2ZSk7XG4gICAgfVxuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4dGVuZCgpIHtcbiAgY29uc3QgcmVzdWx0ID0gYXJndW1lbnRzWzBdO1xuICBmb3IobGV0IGkgPSAxOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgZm9yKGxldCBrZXkgaW4gYXJndW1lbnRzW2ldKSB7XG4gICAgICByZXN1bHRba2V5XSA9IGFyZ3VtZW50c1tpXVtrZXldO1xuICAgIH1cbiAgfVxuICByZXR1cm4gcmVzdWx0O1xufVxuIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCl7XG4vKiFcbiAqIEBvdmVydmlldyBlczYtcHJvbWlzZSAtIGEgdGlueSBpbXBsZW1lbnRhdGlvbiBvZiBQcm9taXNlcy9BKy5cbiAqIEBjb3B5cmlnaHQgQ29weXJpZ2h0IChjKSAyMDE0IFllaHVkYSBLYXR6LCBUb20gRGFsZSwgU3RlZmFuIFBlbm5lciBhbmQgY29udHJpYnV0b3JzIChDb252ZXJzaW9uIHRvIEVTNiBBUEkgYnkgSmFrZSBBcmNoaWJhbGQpXG4gKiBAbGljZW5zZSAgIExpY2Vuc2VkIHVuZGVyIE1JVCBsaWNlbnNlXG4gKiAgICAgICAgICAgIFNlZSBodHRwczovL3Jhdy5naXRodWJ1c2VyY29udGVudC5jb20vamFrZWFyY2hpYmFsZC9lczYtcHJvbWlzZS9tYXN0ZXIvTElDRU5TRVxuICogQHZlcnNpb24gICAzLjIuMVxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG4oZnVuY3Rpb24gKCkge1xuICBcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiB0KHQpIHtcbiAgICByZXR1cm4gXCJmdW5jdGlvblwiID09IHR5cGVvZiB0IHx8IFwib2JqZWN0XCIgPT0gdHlwZW9mIHQgJiYgbnVsbCAhPT0gdDtcbiAgfWZ1bmN0aW9uIGUodCkge1xuICAgIHJldHVybiBcImZ1bmN0aW9uXCIgPT0gdHlwZW9mIHQ7XG4gIH1mdW5jdGlvbiBuKHQpIHtcbiAgICBHID0gdDtcbiAgfWZ1bmN0aW9uIHIodCkge1xuICAgIFEgPSB0O1xuICB9ZnVuY3Rpb24gbygpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgcHJvY2Vzcy5uZXh0VGljayhhKTtcbiAgICB9O1xuICB9ZnVuY3Rpb24gaSgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgQihhKTtcbiAgICB9O1xuICB9ZnVuY3Rpb24gcygpIHtcbiAgICB2YXIgdCA9IDAsXG4gICAgICAgIGUgPSBuZXcgWChhKSxcbiAgICAgICAgbiA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiXCIpO3JldHVybiAoZS5vYnNlcnZlKG4sIHsgY2hhcmFjdGVyRGF0YTogITAgfSksIGZ1bmN0aW9uICgpIHtcbiAgICAgIG4uZGF0YSA9IHQgPSArK3QgJSAyO1xuICAgIH0pO1xuICB9ZnVuY3Rpb24gdSgpIHtcbiAgICB2YXIgdCA9IG5ldyBNZXNzYWdlQ2hhbm5lbCgpO3JldHVybiAodC5wb3J0MS5vbm1lc3NhZ2UgPSBhLCBmdW5jdGlvbiAoKSB7XG4gICAgICB0LnBvcnQyLnBvc3RNZXNzYWdlKDApO1xuICAgIH0pO1xuICB9ZnVuY3Rpb24gYygpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgc2V0VGltZW91dChhLCAxKTtcbiAgICB9O1xuICB9ZnVuY3Rpb24gYSgpIHtcbiAgICBmb3IgKHZhciB0ID0gMDsgSiA+IHQ7IHQgKz0gMikge1xuICAgICAgdmFyIGUgPSB0dFt0XSxcbiAgICAgICAgICBuID0gdHRbdCArIDFdO2UobiksIHR0W3RdID0gdm9pZCAwLCB0dFt0ICsgMV0gPSB2b2lkIDA7XG4gICAgfUogPSAwO1xuICB9ZnVuY3Rpb24gZigpIHtcbiAgICB0cnkge1xuICAgICAgdmFyIHQgPSByZXF1aXJlLFxuICAgICAgICAgIGUgPSB0KFwidmVydHhcIik7cmV0dXJuIChCID0gZS5ydW5Pbkxvb3AgfHwgZS5ydW5PbkNvbnRleHQsIGkoKSk7XG4gICAgfSBjYXRjaCAobikge1xuICAgICAgcmV0dXJuIGMoKTtcbiAgICB9XG4gIH1mdW5jdGlvbiBsKHQsIGUpIHtcbiAgICB2YXIgbiA9IHRoaXMsXG4gICAgICAgIHIgPSBuZXcgdGhpcy5jb25zdHJ1Y3RvcihwKTt2b2lkIDAgPT09IHJbcnRdICYmIGsocik7dmFyIG8gPSBuLl9zdGF0ZTtpZiAobykge1xuICAgICAgdmFyIGkgPSBhcmd1bWVudHNbbyAtIDFdO1EoZnVuY3Rpb24gKCkge1xuICAgICAgICB4KG8sIHIsIGksIG4uX3Jlc3VsdCk7XG4gICAgICB9KTtcbiAgICB9IGVsc2UgRShuLCByLCB0LCBlKTtyZXR1cm4gcjtcbiAgfWZ1bmN0aW9uIGgodCkge1xuICAgIHZhciBlID0gdGhpcztpZiAodCAmJiBcIm9iamVjdFwiID09IHR5cGVvZiB0ICYmIHQuY29uc3RydWN0b3IgPT09IGUpIHtcbiAgICAgIHJldHVybiB0O1xuICAgIH12YXIgbiA9IG5ldyBlKHApO3JldHVybiAoZyhuLCB0KSwgbik7XG4gIH1mdW5jdGlvbiBwKCkge31mdW5jdGlvbiBfKCkge1xuICAgIHJldHVybiBuZXcgVHlwZUVycm9yKFwiWW91IGNhbm5vdCByZXNvbHZlIGEgcHJvbWlzZSB3aXRoIGl0c2VsZlwiKTtcbiAgfWZ1bmN0aW9uIGQoKSB7XG4gICAgcmV0dXJuIG5ldyBUeXBlRXJyb3IoXCJBIHByb21pc2VzIGNhbGxiYWNrIGNhbm5vdCByZXR1cm4gdGhhdCBzYW1lIHByb21pc2UuXCIpO1xuICB9ZnVuY3Rpb24gdih0KSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB0LnRoZW47XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmV0dXJuICh1dC5lcnJvciA9IGUsIHV0KTtcbiAgICB9XG4gIH1mdW5jdGlvbiB5KHQsIGUsIG4sIHIpIHtcbiAgICB0cnkge1xuICAgICAgdC5jYWxsKGUsIG4sIHIpO1xuICAgIH0gY2F0Y2ggKG8pIHtcbiAgICAgIHJldHVybiBvO1xuICAgIH1cbiAgfWZ1bmN0aW9uIG0odCwgZSwgbikge1xuICAgIFEoZnVuY3Rpb24gKHQpIHtcbiAgICAgIHZhciByID0gITEsXG4gICAgICAgICAgbyA9IHkobiwgZSwgZnVuY3Rpb24gKG4pIHtcbiAgICAgICAgciB8fCAociA9ICEwLCBlICE9PSBuID8gZyh0LCBuKSA6IFModCwgbikpO1xuICAgICAgfSwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgciB8fCAociA9ICEwLCBqKHQsIGUpKTtcbiAgICAgIH0sIFwiU2V0dGxlOiBcIiArICh0Ll9sYWJlbCB8fCBcIiB1bmtub3duIHByb21pc2VcIikpOyFyICYmIG8gJiYgKHIgPSAhMCwgaih0LCBvKSk7XG4gICAgfSwgdCk7XG4gIH1mdW5jdGlvbiBiKHQsIGUpIHtcbiAgICBlLl9zdGF0ZSA9PT0gaXQgPyBTKHQsIGUuX3Jlc3VsdCkgOiBlLl9zdGF0ZSA9PT0gc3QgPyBqKHQsIGUuX3Jlc3VsdCkgOiBFKGUsIHZvaWQgMCwgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGcodCwgZSk7XG4gICAgfSwgZnVuY3Rpb24gKGUpIHtcbiAgICAgIGoodCwgZSk7XG4gICAgfSk7XG4gIH1mdW5jdGlvbiB3KHQsIG4sIHIpIHtcbiAgICBuLmNvbnN0cnVjdG9yID09PSB0LmNvbnN0cnVjdG9yICYmIHIgPT09IGV0ICYmIGNvbnN0cnVjdG9yLnJlc29sdmUgPT09IG50ID8gYih0LCBuKSA6IHIgPT09IHV0ID8gaih0LCB1dC5lcnJvcikgOiB2b2lkIDAgPT09IHIgPyBTKHQsIG4pIDogZShyKSA/IG0odCwgbiwgcikgOiBTKHQsIG4pO1xuICB9ZnVuY3Rpb24gZyhlLCBuKSB7XG4gICAgZSA9PT0gbiA/IGooZSwgXygpKSA6IHQobikgPyB3KGUsIG4sIHYobikpIDogUyhlLCBuKTtcbiAgfWZ1bmN0aW9uIEEodCkge1xuICAgIHQuX29uZXJyb3IgJiYgdC5fb25lcnJvcih0Ll9yZXN1bHQpLCBUKHQpO1xuICB9ZnVuY3Rpb24gUyh0LCBlKSB7XG4gICAgdC5fc3RhdGUgPT09IG90ICYmICh0Ll9yZXN1bHQgPSBlLCB0Ll9zdGF0ZSA9IGl0LCAwICE9PSB0Ll9zdWJzY3JpYmVycy5sZW5ndGggJiYgUShULCB0KSk7XG4gIH1mdW5jdGlvbiBqKHQsIGUpIHtcbiAgICB0Ll9zdGF0ZSA9PT0gb3QgJiYgKHQuX3N0YXRlID0gc3QsIHQuX3Jlc3VsdCA9IGUsIFEoQSwgdCkpO1xuICB9ZnVuY3Rpb24gRSh0LCBlLCBuLCByKSB7XG4gICAgdmFyIG8gPSB0Ll9zdWJzY3JpYmVycyxcbiAgICAgICAgaSA9IG8ubGVuZ3RoO3QuX29uZXJyb3IgPSBudWxsLCBvW2ldID0gZSwgb1tpICsgaXRdID0gbiwgb1tpICsgc3RdID0gciwgMCA9PT0gaSAmJiB0Ll9zdGF0ZSAmJiBRKFQsIHQpO1xuICB9ZnVuY3Rpb24gVCh0KSB7XG4gICAgdmFyIGUgPSB0Ll9zdWJzY3JpYmVycyxcbiAgICAgICAgbiA9IHQuX3N0YXRlO2lmICgwICE9PSBlLmxlbmd0aCkge1xuICAgICAgZm9yICh2YXIgciwgbywgaSA9IHQuX3Jlc3VsdCwgcyA9IDA7IHMgPCBlLmxlbmd0aDsgcyArPSAzKSByID0gZVtzXSwgbyA9IGVbcyArIG5dLCByID8geChuLCByLCBvLCBpKSA6IG8oaSk7dC5fc3Vic2NyaWJlcnMubGVuZ3RoID0gMDtcbiAgICB9XG4gIH1mdW5jdGlvbiBNKCkge1xuICAgIHRoaXMuZXJyb3IgPSBudWxsO1xuICB9ZnVuY3Rpb24gUCh0LCBlKSB7XG4gICAgdHJ5IHtcbiAgICAgIHJldHVybiB0KGUpO1xuICAgIH0gY2F0Y2ggKG4pIHtcbiAgICAgIHJldHVybiAoY3QuZXJyb3IgPSBuLCBjdCk7XG4gICAgfVxuICB9ZnVuY3Rpb24geCh0LCBuLCByLCBvKSB7XG4gICAgdmFyIGksXG4gICAgICAgIHMsXG4gICAgICAgIHUsXG4gICAgICAgIGMsXG4gICAgICAgIGEgPSBlKHIpO2lmIChhKSB7XG4gICAgICBpZiAoKGkgPSBQKHIsIG8pLCBpID09PSBjdCA/IChjID0gITAsIHMgPSBpLmVycm9yLCBpID0gbnVsbCkgOiB1ID0gITAsIG4gPT09IGkpKSB7XG4gICAgICAgIHJldHVybiB2b2lkIGoobiwgZCgpKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaSA9IG8sIHUgPSAhMDtuLl9zdGF0ZSAhPT0gb3QgfHwgKGEgJiYgdSA/IGcobiwgaSkgOiBjID8gaihuLCBzKSA6IHQgPT09IGl0ID8gUyhuLCBpKSA6IHQgPT09IHN0ICYmIGoobiwgaSkpO1xuICB9ZnVuY3Rpb24gQyh0LCBlKSB7XG4gICAgdHJ5IHtcbiAgICAgIGUoZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZyh0LCBlKTtcbiAgICAgIH0sIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGoodCwgZSk7XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChuKSB7XG4gICAgICBqKHQsIG4pO1xuICAgIH1cbiAgfWZ1bmN0aW9uIE8oKSB7XG4gICAgcmV0dXJuIGF0Kys7XG4gIH1mdW5jdGlvbiBrKHQpIHtcbiAgICB0W3J0XSA9IGF0KyssIHQuX3N0YXRlID0gdm9pZCAwLCB0Ll9yZXN1bHQgPSB2b2lkIDAsIHQuX3N1YnNjcmliZXJzID0gW107XG4gIH1mdW5jdGlvbiBZKHQpIHtcbiAgICByZXR1cm4gbmV3IF90KHRoaXMsIHQpLnByb21pc2U7XG4gIH1mdW5jdGlvbiBxKHQpIHtcbiAgICB2YXIgZSA9IHRoaXM7cmV0dXJuIG5ldyBlKEkodCkgPyBmdW5jdGlvbiAobiwgcikge1xuICAgICAgZm9yICh2YXIgbyA9IHQubGVuZ3RoLCBpID0gMDsgbyA+IGk7IGkrKykgZS5yZXNvbHZlKHRbaV0pLnRoZW4obiwgcik7XG4gICAgfSA6IGZ1bmN0aW9uICh0LCBlKSB7XG4gICAgICBlKG5ldyBUeXBlRXJyb3IoXCJZb3UgbXVzdCBwYXNzIGFuIGFycmF5IHRvIHJhY2UuXCIpKTtcbiAgICB9KTtcbiAgfWZ1bmN0aW9uIEYodCkge1xuICAgIHZhciBlID0gdGhpcyxcbiAgICAgICAgbiA9IG5ldyBlKHApO3JldHVybiAoaihuLCB0KSwgbik7XG4gIH1mdW5jdGlvbiBEKCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJZb3UgbXVzdCBwYXNzIGEgcmVzb2x2ZXIgZnVuY3Rpb24gYXMgdGhlIGZpcnN0IGFyZ3VtZW50IHRvIHRoZSBwcm9taXNlIGNvbnN0cnVjdG9yXCIpO1xuICB9ZnVuY3Rpb24gSygpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiRmFpbGVkIHRvIGNvbnN0cnVjdCAnUHJvbWlzZSc6IFBsZWFzZSB1c2UgdGhlICduZXcnIG9wZXJhdG9yLCB0aGlzIG9iamVjdCBjb25zdHJ1Y3RvciBjYW5ub3QgYmUgY2FsbGVkIGFzIGEgZnVuY3Rpb24uXCIpO1xuICB9ZnVuY3Rpb24gTCh0KSB7XG4gICAgdGhpc1tydF0gPSBPKCksIHRoaXMuX3Jlc3VsdCA9IHRoaXMuX3N0YXRlID0gdm9pZCAwLCB0aGlzLl9zdWJzY3JpYmVycyA9IFtdLCBwICE9PSB0ICYmIChcImZ1bmN0aW9uXCIgIT0gdHlwZW9mIHQgJiYgRCgpLCB0aGlzIGluc3RhbmNlb2YgTCA/IEModGhpcywgdCkgOiBLKCkpO1xuICB9ZnVuY3Rpb24gTih0LCBlKSB7XG4gICAgdGhpcy5faW5zdGFuY2VDb25zdHJ1Y3RvciA9IHQsIHRoaXMucHJvbWlzZSA9IG5ldyB0KHApLCB0aGlzLnByb21pc2VbcnRdIHx8IGsodGhpcy5wcm9taXNlKSwgQXJyYXkuaXNBcnJheShlKSA/ICh0aGlzLl9pbnB1dCA9IGUsIHRoaXMubGVuZ3RoID0gZS5sZW5ndGgsIHRoaXMuX3JlbWFpbmluZyA9IGUubGVuZ3RoLCB0aGlzLl9yZXN1bHQgPSBuZXcgQXJyYXkodGhpcy5sZW5ndGgpLCAwID09PSB0aGlzLmxlbmd0aCA/IFModGhpcy5wcm9taXNlLCB0aGlzLl9yZXN1bHQpIDogKHRoaXMubGVuZ3RoID0gdGhpcy5sZW5ndGggfHwgMCwgdGhpcy5fZW51bWVyYXRlKCksIDAgPT09IHRoaXMuX3JlbWFpbmluZyAmJiBTKHRoaXMucHJvbWlzZSwgdGhpcy5fcmVzdWx0KSkpIDogaih0aGlzLnByb21pc2UsIFUoKSk7XG4gIH1mdW5jdGlvbiBVKCkge1xuICAgIHJldHVybiBuZXcgRXJyb3IoXCJBcnJheSBNZXRob2RzIG11c3QgYmUgcHJvdmlkZWQgYW4gQXJyYXlcIik7XG4gIH1mdW5jdGlvbiBXKCkge1xuICAgIHZhciB0O2lmIChcInVuZGVmaW5lZFwiICE9IHR5cGVvZiBnbG9iYWwpIHQgPSBnbG9iYWw7ZWxzZSBpZiAoXCJ1bmRlZmluZWRcIiAhPSB0eXBlb2Ygc2VsZikgdCA9IHNlbGY7ZWxzZSB0cnkge1xuICAgICAgdCA9IEZ1bmN0aW9uKFwicmV0dXJuIHRoaXNcIikoKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJwb2x5ZmlsbCBmYWlsZWQgYmVjYXVzZSBnbG9iYWwgb2JqZWN0IGlzIHVuYXZhaWxhYmxlIGluIHRoaXMgZW52aXJvbm1lbnRcIik7XG4gICAgfXZhciBuID0gdC5Qcm9taXNlOyghbiB8fCBcIltvYmplY3QgUHJvbWlzZV1cIiAhPT0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG4ucmVzb2x2ZSgpKSB8fCBuLmNhc3QpICYmICh0LlByb21pc2UgPSBwdCk7XG4gIH12YXIgejt6ID0gQXJyYXkuaXNBcnJheSA/IEFycmF5LmlzQXJyYXkgOiBmdW5jdGlvbiAodCkge1xuICAgIHJldHVybiBcIltvYmplY3QgQXJyYXldXCIgPT09IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh0KTtcbiAgfTt2YXIgQixcbiAgICAgIEcsXG4gICAgICBILFxuICAgICAgSSA9IHosXG4gICAgICBKID0gMCxcbiAgICAgIFEgPSBmdW5jdGlvbiBRKHQsIGUpIHtcbiAgICB0dFtKXSA9IHQsIHR0W0ogKyAxXSA9IGUsIEogKz0gMiwgMiA9PT0gSiAmJiAoRyA/IEcoYSkgOiBIKCkpO1xuICB9LFxuICAgICAgUiA9IFwidW5kZWZpbmVkXCIgIT0gdHlwZW9mIHdpbmRvdyA/IHdpbmRvdyA6IHZvaWQgMCxcbiAgICAgIFYgPSBSIHx8IHt9LFxuICAgICAgWCA9IFYuTXV0YXRpb25PYnNlcnZlciB8fCBWLldlYktpdE11dGF0aW9uT2JzZXJ2ZXIsXG4gICAgICBaID0gXCJ1bmRlZmluZWRcIiA9PSB0eXBlb2Ygc2VsZiAmJiBcInVuZGVmaW5lZFwiICE9IHR5cGVvZiBwcm9jZXNzICYmIFwiW29iamVjdCBwcm9jZXNzXVwiID09PSAoe30pLnRvU3RyaW5nLmNhbGwocHJvY2VzcyksXG4gICAgICAkID0gXCJ1bmRlZmluZWRcIiAhPSB0eXBlb2YgVWludDhDbGFtcGVkQXJyYXkgJiYgXCJ1bmRlZmluZWRcIiAhPSB0eXBlb2YgaW1wb3J0U2NyaXB0cyAmJiBcInVuZGVmaW5lZFwiICE9IHR5cGVvZiBNZXNzYWdlQ2hhbm5lbCxcbiAgICAgIHR0ID0gbmV3IEFycmF5KDEwMDApO0ggPSBaID8gbygpIDogWCA/IHMoKSA6ICQgPyB1KCkgOiB2b2lkIDAgPT09IFIgJiYgXCJmdW5jdGlvblwiID09IHR5cGVvZiByZXF1aXJlID8gZigpIDogYygpO3ZhciBldCA9IGwsXG4gICAgICBudCA9IGgsXG4gICAgICBydCA9IE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cmluZygxNiksXG4gICAgICBvdCA9IHZvaWQgMCxcbiAgICAgIGl0ID0gMSxcbiAgICAgIHN0ID0gMixcbiAgICAgIHV0ID0gbmV3IE0oKSxcbiAgICAgIGN0ID0gbmV3IE0oKSxcbiAgICAgIGF0ID0gMCxcbiAgICAgIGZ0ID0gWSxcbiAgICAgIGx0ID0gcSxcbiAgICAgIGh0ID0gRixcbiAgICAgIHB0ID0gTDtMLmFsbCA9IGZ0LCBMLnJhY2UgPSBsdCwgTC5yZXNvbHZlID0gbnQsIEwucmVqZWN0ID0gaHQsIEwuX3NldFNjaGVkdWxlciA9IG4sIEwuX3NldEFzYXAgPSByLCBMLl9hc2FwID0gUSwgTC5wcm90b3R5cGUgPSB7IGNvbnN0cnVjdG9yOiBMLCB0aGVuOiBldCwgXCJjYXRjaFwiOiBmdW5jdGlvbiBfY2F0Y2godCkge1xuICAgICAgcmV0dXJuIHRoaXMudGhlbihudWxsLCB0KTtcbiAgICB9IH07dmFyIF90ID0gTjtOLnByb3RvdHlwZS5fZW51bWVyYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIGZvciAodmFyIHQgPSB0aGlzLmxlbmd0aCwgZSA9IHRoaXMuX2lucHV0LCBuID0gMDsgdGhpcy5fc3RhdGUgPT09IG90ICYmIHQgPiBuOyBuKyspIHRoaXMuX2VhY2hFbnRyeShlW25dLCBuKTtcbiAgfSwgTi5wcm90b3R5cGUuX2VhY2hFbnRyeSA9IGZ1bmN0aW9uICh0LCBlKSB7XG4gICAgdmFyIG4gPSB0aGlzLl9pbnN0YW5jZUNvbnN0cnVjdG9yLFxuICAgICAgICByID0gbi5yZXNvbHZlO2lmIChyID09PSBudCkge1xuICAgICAgdmFyIG8gPSB2KHQpO2lmIChvID09PSBldCAmJiB0Ll9zdGF0ZSAhPT0gb3QpIHRoaXMuX3NldHRsZWRBdCh0Ll9zdGF0ZSwgZSwgdC5fcmVzdWx0KTtlbHNlIGlmIChcImZ1bmN0aW9uXCIgIT0gdHlwZW9mIG8pIHRoaXMuX3JlbWFpbmluZy0tLCB0aGlzLl9yZXN1bHRbZV0gPSB0O2Vsc2UgaWYgKG4gPT09IHB0KSB7XG4gICAgICAgIHZhciBpID0gbmV3IG4ocCk7dyhpLCB0LCBvKSwgdGhpcy5fd2lsbFNldHRsZUF0KGksIGUpO1xuICAgICAgfSBlbHNlIHRoaXMuX3dpbGxTZXR0bGVBdChuZXcgbihmdW5jdGlvbiAoZSkge1xuICAgICAgICBlKHQpO1xuICAgICAgfSksIGUpO1xuICAgIH0gZWxzZSB0aGlzLl93aWxsU2V0dGxlQXQocih0KSwgZSk7XG4gIH0sIE4ucHJvdG90eXBlLl9zZXR0bGVkQXQgPSBmdW5jdGlvbiAodCwgZSwgbikge1xuICAgIHZhciByID0gdGhpcy5wcm9taXNlO3IuX3N0YXRlID09PSBvdCAmJiAodGhpcy5fcmVtYWluaW5nLS0sIHQgPT09IHN0ID8gaihyLCBuKSA6IHRoaXMuX3Jlc3VsdFtlXSA9IG4pLCAwID09PSB0aGlzLl9yZW1haW5pbmcgJiYgUyhyLCB0aGlzLl9yZXN1bHQpO1xuICB9LCBOLnByb3RvdHlwZS5fd2lsbFNldHRsZUF0ID0gZnVuY3Rpb24gKHQsIGUpIHtcbiAgICB2YXIgbiA9IHRoaXM7RSh0LCB2b2lkIDAsIGZ1bmN0aW9uICh0KSB7XG4gICAgICBuLl9zZXR0bGVkQXQoaXQsIGUsIHQpO1xuICAgIH0sIGZ1bmN0aW9uICh0KSB7XG4gICAgICBuLl9zZXR0bGVkQXQoc3QsIGUsIHQpO1xuICAgIH0pO1xuICB9O3ZhciBkdCA9IFcsXG4gICAgICB2dCA9IHsgUHJvbWlzZTogcHQsIHBvbHlmaWxsOiBkdCB9O1wiZnVuY3Rpb25cIiA9PSB0eXBlb2YgZGVmaW5lICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB2dDtcbiAgfSkgOiBcInVuZGVmaW5lZFwiICE9IHR5cGVvZiBtb2R1bGUgJiYgbW9kdWxlLmV4cG9ydHMgPyBtb2R1bGUuZXhwb3J0cyA9IHZ0IDogXCJ1bmRlZmluZWRcIiAhPSB0eXBlb2YgdGhpcyAmJiAodGhpcy5FUzZQcm9taXNlID0gdnQpLCBkdCgpO1xufSkuY2FsbCh1bmRlZmluZWQpO1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZSgnX3Byb2Nlc3MnKSx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ6dXRmLTg7YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiSWk5b2IyMWxMMlJoYm1sbGJDOUViMk4xYldWdWRITXZjSEp2YW1WamRITXZiM0ppTFdOc2FXVnVkQzl6Y21NdmJHbGlMMlZ6Tmkxd2NtOXRhWE5sTG0xcGJpNXFjeUpkTENKdVlXMWxjeUk2VzEwc0ltMWhjSEJwYm1keklqb2lPenM3T3pzN096czdPenRCUVZGQkxFTkJRVU1zV1VGQlZUdEJRVUZETEdOQlFWa3NRMEZCUXl4VFFVRlRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU03UVVGQlF5eFhRVUZOTEZWQlFWVXNTVUZCUlN4UFFVRlBMRU5CUVVNc1NVRkJSU3hSUVVGUkxFbEJRVVVzVDBGQlR5eERRVUZETEVsQlFVVXNTVUZCU1N4TFFVRkhMRU5CUVVNc1EwRkJRVHRIUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXp0QlFVRkRMRmRCUVUwc1ZVRkJWU3hKUVVGRkxFOUJRVThzUTBGQlF5eERRVUZCTzBkQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRE8wRkJRVU1zUzBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUVR0SFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF6dEJRVUZETEV0QlFVTXNSMEZCUXl4RFFVRkRMRU5CUVVFN1IwRkJReXhUUVVGVExFTkJRVU1zUjBGQlJUdEJRVUZETEZkQlFVOHNXVUZCVlR0QlFVRkRMR0ZCUVU4c1EwRkJReXhSUVVGUkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVRTdTMEZCUXl4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFZEJRVVU3UVVGQlF5eFhRVUZQTEZsQlFWVTdRVUZCUXl4UFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVUU3UzBGQlF5eERRVUZCTzBkQlFVTXNVMEZCVXl4RFFVRkRMRWRCUVVVN1FVRkJReXhSUVVGSkxFTkJRVU1zUjBGQlF5eERRVUZETzFGQlFVTXNRMEZCUXl4SFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF6dFJRVUZETEVOQlFVTXNSMEZCUXl4UlFVRlJMRU5CUVVNc1kwRkJZeXhEUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETEZGQlFVOHNRMEZCUXl4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRExFVkJRVU1zUlVGQlF5eGhRVUZoTEVWQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRExGbEJRVlU3UVVGQlF5eFBRVUZETEVOQlFVTXNTVUZCU1N4SFFVRkRMRU5CUVVNc1IwRkJReXhGUVVGRkxFTkJRVU1zUjBGQlF5eERRVUZETEVOQlFVRTdTMEZCUXl4RFFVRkJMRU5CUVVFN1IwRkJReXhUUVVGVExFTkJRVU1zUjBGQlJUdEJRVUZETEZGQlFVa3NRMEZCUXl4SFFVRkRMRWxCUVVrc1kwRkJZeXhGUVVGQkxFTkJRVU1zVVVGQlR5eERRVUZETEVOQlFVTXNTMEZCU3l4RFFVRkRMRk5CUVZNc1IwRkJReXhEUVVGRExFVkJRVU1zV1VGQlZUdEJRVUZETEU5QlFVTXNRMEZCUXl4TFFVRkxMRU5CUVVNc1YwRkJWeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZCTzB0QlFVTXNRMEZCUVN4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFZEJRVVU3UVVGQlF5eFhRVUZQTEZsQlFWVTdRVUZCUXl4blFrRkJWU3hEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUVR0TFFVRkRMRU5CUVVFN1IwRkJReXhUUVVGVExFTkJRVU1zUjBGQlJUdEJRVUZETEZOQlFVa3NTVUZCU1N4RFFVRkRMRWRCUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4SlFVRkZMRU5CUVVNc1JVRkJRenRCUVVGRExGVkJRVWtzUTBGQlF5eEhRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNN1ZVRkJReXhEUVVGRExFZEJRVU1zUlVGQlJTeERRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNSVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGRExFdEJRVXNzUTBGQlF5eEZRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGRExFZEJRVU1zUzBGQlN5eERRVUZETEVOQlFVRTdTMEZCUXl4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVkQlFVVTdRVUZCUXl4UlFVRkhPMEZCUVVNc1ZVRkJTU3hEUVVGRExFZEJRVU1zVDBGQlR6dFZRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zVVVGQlR5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRk5CUVZNc1NVRkJSU3hEUVVGRExFTkJRVU1zV1VGQldTeEZRVUZETEVOQlFVTXNSVUZCUlN4RFFVRkJMRU5CUVVFN1MwRkJReXhEUVVGQkxFOUJRVTBzUTBGQlF5eEZRVUZETzBGQlFVTXNZVUZCVHl4RFFVRkRMRVZCUVVVc1EwRkJRVHRMUVVGRE8wZEJRVU1zVTBGQlV5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1JVRkJRenRCUVVGRExGRkJRVWtzUTBGQlF5eEhRVUZETEVsQlFVazdVVUZCUXl4RFFVRkRMRWRCUVVNc1NVRkJTU3hKUVVGSkxFTkJRVU1zVjBGQlZ5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRXRCUVVzc1EwRkJReXhMUVVGSExFTkJRVU1zUTBGQlF5eEZRVUZGTEVOQlFVTXNTVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRTFCUVUwc1EwRkJReXhKUVVGSExFTkJRVU1zUlVGQlF6dEJRVUZETEZWQlFVa3NRMEZCUXl4SFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRmxCUVZVN1FVRkJReXhUUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFOUJRVThzUTBGQlF5eERRVUZCTzA5QlFVTXNRMEZCUXl4RFFVRkJPMHRCUVVNc1RVRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVRTdSMEZCUXl4VFFVRlRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU03UVVGQlF5eFJRVUZKTEVOQlFVTXNSMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJSeXhEUVVGRExFbEJRVVVzVVVGQlVTeEpRVUZGTEU5QlFVOHNRMEZCUXl4SlFVRkZMRU5CUVVNc1EwRkJReXhYUVVGWExFdEJRVWNzUTBGQlF6dEJRVUZETEdGQlFVOHNRMEZCUXl4RFFVRkRPMHRCUVVFc1NVRkJTU3hEUVVGRExFZEJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1VVRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1EwRkJRU3hEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVkQlFVVXNSVUZCUlN4VFFVRlRMRU5CUVVNc1IwRkJSVHRCUVVGRExGZEJRVThzU1VGQlNTeFRRVUZUTEVOQlFVTXNNRU5CUVRCRExFTkJRVU1zUTBGQlFUdEhRVUZETEZOQlFWTXNRMEZCUXl4SFFVRkZPMEZCUVVNc1YwRkJUeXhKUVVGSkxGTkJRVk1zUTBGQlF5eHpSRUZCYzBRc1EwRkJReXhEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRPMEZCUVVNc1VVRkJSenRCUVVGRExHRkJRVThzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUVR0TFFVRkRMRU5CUVVFc1QwRkJUU3hEUVVGRExFVkJRVU03UVVGQlF5eGpRVUZQTEVWQlFVVXNRMEZCUXl4TFFVRkxMRWRCUVVNc1EwRkJReXhGUVVGRExFVkJRVVVzUTBGQlFTeERRVUZCTzB0QlFVTTdSMEZCUXl4VFFVRlRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNN1FVRkJReXhSUVVGSE8wRkJRVU1zVDBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUTBGQlF5eERRVUZCTzB0QlFVTXNRMEZCUVN4UFFVRk5MRU5CUVVNc1JVRkJRenRCUVVGRExHRkJRVThzUTBGQlF5eERRVUZCTzB0QlFVTTdSMEZCUXl4VFFVRlRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXp0QlFVRkRMRXRCUVVNc1EwRkJReXhWUVVGVExFTkJRVU1zUlVGQlF6dEJRVUZETEZWQlFVa3NRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJRenRWUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1JVRkJReXhWUVVGVExFTkJRVU1zUlVGQlF6dEJRVUZETEZOQlFVTXNTMEZCUnl4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eExRVUZITEVOQlFVTXNSMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFTkJRVUVzUVVGQlF5eERRVUZCTzA5QlFVTXNSVUZCUXl4VlFVRlRMRU5CUVVNc1JVRkJRenRCUVVGRExGTkJRVU1zUzBGQlJ5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUVN4QlFVRkRMRU5CUVVFN1QwRkJReXhGUVVGRExGVkJRVlVzU1VGQlJTeERRVUZETEVOQlFVTXNUVUZCVFN4SlFVRkZMR3RDUVVGclFpeERRVUZCTEVGQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhKUVVGRkxFTkJRVU1zUzBGQlJ5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUVN4QlFVRkRMRU5CUVVFN1MwRkJReXhGUVVGRExFTkJRVU1zUTBGQlF5eERRVUZCTzBkQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF6dEJRVUZETEV0QlFVTXNRMEZCUXl4TlFVRk5MRXRCUVVjc1JVRkJSU3hIUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRTlCUVU4c1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eE5RVUZOTEV0QlFVY3NSVUZCUlN4SFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEU5QlFVOHNRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUzBGQlN5eERRVUZETEVWQlFVTXNWVUZCVXl4RFFVRkRMRVZCUVVNN1FVRkJReXhQUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkJPMHRCUVVNc1JVRkJReXhWUVVGVExFTkJRVU1zUlVGQlF6dEJRVUZETEU5QlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFTkJRVUU3UzBGQlF5eERRVUZETEVOQlFVRTdSMEZCUXl4VFFVRlRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXp0QlFVRkRMRXRCUVVNc1EwRkJReXhYUVVGWExFdEJRVWNzUTBGQlF5eERRVUZETEZkQlFWY3NTVUZCUlN4RFFVRkRMRXRCUVVjc1JVRkJSU3hKUVVGRkxGZEJRVmNzUTBGQlF5eFBRVUZQTEV0QlFVY3NSVUZCUlN4SFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4TFFVRkhMRVZCUVVVc1IwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVWQlFVVXNRMEZCUXl4TFFVRkxMRU5CUVVNc1IwRkJReXhMUVVGTExFTkJRVU1zUzBGQlJ5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUVR0SFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVTTdRVUZCUXl4TFFVRkRMRXRCUVVjc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUVR0SFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF6dEJRVUZETEV0QlFVTXNRMEZCUXl4UlFVRlJMRWxCUVVVc1EwRkJReXhEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZCTzBkQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF6dEJRVUZETEV0QlFVTXNRMEZCUXl4TlFVRk5MRXRCUVVjc1JVRkJSU3hMUVVGSExFTkJRVU1zUTBGQlF5eFBRVUZQTEVkQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1EwRkJReXhOUVVGTkxFZEJRVU1zUlVGQlJTeEZRVUZETEVOQlFVTXNTMEZCUnl4RFFVRkRMRU5CUVVNc1dVRkJXU3hEUVVGRExFMUJRVTBzU1VGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1EwRkJReXhEUVVGQkxFRkJRVU1zUTBGQlFUdEhRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFVkJRVU03UVVGQlF5eExRVUZETEVOQlFVTXNUVUZCVFN4TFFVRkhMRVZCUVVVc1MwRkJSeXhEUVVGRExFTkJRVU1zVFVGQlRTeEhRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRU5CUVVNc1QwRkJUeXhIUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1EwRkJReXhEUVVGQkxFRkJRVU1zUTBGQlFUdEhRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXp0QlFVRkRMRkZCUVVrc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eFpRVUZaTzFGQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5eERRVUZETEZGQlFWRXNSMEZCUXl4SlFVRkpMRVZCUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGRExFVkJRVVVzUTBGQlF5eEhRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGRExFVkJRVVVzUTBGQlF5eEhRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRXRCUVVjc1EwRkJReXhKUVVGRkxFTkJRVU1zUTBGQlF5eE5RVUZOTEVsQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlFUdEhRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJRenRCUVVGRExGRkJRVWtzUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4WlFVRlpPMUZCUVVNc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eE5RVUZOTEVOQlFVTXNTVUZCUnl4RFFVRkRMRXRCUVVjc1EwRkJReXhEUVVGRExFMUJRVTBzUlVGQlF6dEJRVUZETEZkQlFVa3NTVUZCU1N4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4RlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRVZCUVVNc1EwRkJReXhKUVVGRkxFTkJRVU1zUlVGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eFpRVUZaTEVOQlFVTXNUVUZCVFN4SFFVRkRMRU5CUVVNc1EwRkJRVHRMUVVGRE8wZEJRVU1zVTBGQlV5eERRVUZETEVkQlFVVTdRVUZCUXl4UlFVRkpMRU5CUVVNc1MwRkJTeXhIUVVGRExFbEJRVWtzUTBGQlFUdEhRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFVkJRVU03UVVGQlF5eFJRVUZITzBGQlFVTXNZVUZCVHl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVUU3UzBGQlF5eERRVUZCTEU5QlFVMHNRMEZCUXl4RlFVRkRPMEZCUVVNc1kwRkJUeXhGUVVGRkxFTkJRVU1zUzBGQlN5eEhRVUZETEVOQlFVTXNSVUZCUXl4RlFVRkZMRU5CUVVFc1EwRkJRVHRMUVVGRE8wZEJRVU1zVTBGQlV5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eEZRVUZETzBGQlFVTXNVVUZCU1N4RFFVRkRPMUZCUVVNc1EwRkJRenRSUVVGRExFTkJRVU03VVVGQlF5eERRVUZETzFGQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEpRVUZITEVOQlFVTXNSVUZCUXp0QlFVRkRMRmRCUVVjc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhMUVVGSExFVkJRVVVzU1VGQlJTeERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eExRVUZMTEVWQlFVTXNRMEZCUXl4SFFVRkRMRWxCUVVrc1EwRkJRU3hIUVVGRkxFTkJRVU1zUjBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRXRCUVVjc1EwRkJReXhEUVVGQk8wRkJRVU1zWlVGQlR5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlFUdFBRVUZCTzB0QlFVTXNUVUZCU3l4RFFVRkRMRWRCUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1RVRkJUU3hMUVVGSExFVkJRVVVzUzBGQlJ5eERRVUZETEVsQlFVVXNRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4TFFVRkhMRVZCUVVVc1IwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNc1MwRkJSeXhGUVVGRkxFbEJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRU3hCUVVGRExFTkJRVUU3UjBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRE8wRkJRVU1zVVVGQlJ6dEJRVUZETEU5QlFVTXNRMEZCUXl4VlFVRlRMRU5CUVVNc1JVRkJRenRCUVVGRExGTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVFN1QwRkJReXhGUVVGRExGVkJRVk1zUTBGQlF5eEZRVUZETzBGQlFVTXNVMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlFUdFBRVUZETEVOQlFVTXNRMEZCUVR0TFFVRkRMRU5CUVVFc1QwRkJUU3hEUVVGRExFVkJRVU03UVVGQlF5eFBRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1EwRkJReXhEUVVGQk8wdEJRVU03UjBGQlF5eFRRVUZUTEVOQlFVTXNSMEZCUlR0QlFVRkRMRmRCUVU4c1JVRkJSU3hGUVVGRkxFTkJRVUU3UjBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNN1FVRkJReXhMUVVGRExFTkJRVU1zUlVGQlJTeERRVUZETEVkQlFVTXNSVUZCUlN4RlFVRkZMRVZCUVVNc1EwRkJReXhEUVVGRExFMUJRVTBzUjBGQlF5eExRVUZMTEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1QwRkJUeXhIUVVGRExFdEJRVXNzUTBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUXl4WlFVRlpMRWRCUVVNc1JVRkJSU3hEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRPMEZCUVVNc1YwRkJUeXhKUVVGSkxFVkJRVVVzUTBGQlF5eEpRVUZKTEVWQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1QwRkJUeXhEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRPMEZCUVVNc1VVRkJTU3hEUVVGRExFZEJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZETEZWQlFWTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1JVRkJRenRCUVVGRExGZEJRVWtzU1VGQlNTeERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRTFCUVUwc1JVRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRkxFVkJRVU1zUTBGQlF5eERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1EwRkJReXhEUVVGQk8wdEJRVU1zUjBGQlF5eFZRVUZUTEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNN1FVRkJReXhQUVVGRExFTkJRVU1zU1VGQlNTeFRRVUZUTEVOQlFVTXNhVU5CUVdsRExFTkJRVU1zUTBGQlF5eERRVUZCTzB0QlFVTXNRMEZCUXl4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETzBGQlFVTXNVVUZCU1N4RFFVRkRMRWRCUVVNc1NVRkJTVHRSUVVGRExFTkJRVU1zUjBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhSUVVGUExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGQkxFTkJRVUU3UjBGQlF5eFRRVUZUTEVOQlFVTXNSMEZCUlR0QlFVRkRMRlZCUVUwc1NVRkJTU3hUUVVGVExFTkJRVU1zYjBaQlFXOUdMRU5CUVVNc1EwRkJRVHRIUVVGRExGTkJRVk1zUTBGQlF5eEhRVUZGTzBGQlFVTXNWVUZCVFN4SlFVRkpMRk5CUVZNc1EwRkJReXgxU0VGQmRVZ3NRMEZCUXl4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETzBGQlFVTXNVVUZCU1N4RFFVRkRMRVZCUVVVc1EwRkJReXhIUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZETEVsQlFVa3NRMEZCUXl4UFFVRlBMRWRCUVVNc1NVRkJTU3hEUVVGRExFMUJRVTBzUjBGQlF5eExRVUZMTEVOQlFVTXNSVUZCUXl4SlFVRkpMRU5CUVVNc1dVRkJXU3hIUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEV0QlFVY3NRMEZCUXl4TFFVRkhMRlZCUVZVc1NVRkJSU3hQUVVGUExFTkJRVU1zU1VGQlJTeERRVUZETEVWQlFVVXNSVUZCUXl4SlFVRkpMRmxCUVZrc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eEpRVUZKTEVWQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVNc1EwRkJReXhGUVVGRkxFTkJRVUVzUVVGQlF5eERRVUZCTzBkQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF6dEJRVUZETEZGQlFVa3NRMEZCUXl4dlFrRkJiMElzUjBGQlF5eERRVUZETEVWQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1IwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFVkJRVVVzUTBGQlF5eEpRVUZGTEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFVkJRVU1zUzBGQlN5eERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNc1NVRkJSU3hKUVVGSkxFTkJRVU1zVFVGQlRTeEhRVUZETEVOQlFVTXNSVUZCUXl4SlFVRkpMRU5CUVVNc1RVRkJUU3hIUVVGRExFTkJRVU1zUTBGQlF5eE5RVUZOTEVWQlFVTXNTVUZCU1N4RFFVRkRMRlZCUVZVc1IwRkJReXhEUVVGRExFTkJRVU1zVFVGQlRTeEZRVUZETEVsQlFVa3NRMEZCUXl4UFFVRlBMRWRCUVVNc1NVRkJTU3hMUVVGTExFTkJRVU1zU1VGQlNTeERRVUZETEUxQlFVMHNRMEZCUXl4RlFVRkRMRU5CUVVNc1MwRkJSeXhKUVVGSkxFTkJRVU1zVFVGQlRTeEhRVUZETEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhGUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVOQlFVTXNTVUZCUlN4SlFVRkpMRU5CUVVNc1RVRkJUU3hIUVVGRExFbEJRVWtzUTBGQlF5eE5RVUZOTEVsQlFVVXNRMEZCUXl4RlFVRkRMRWxCUVVrc1EwRkJReXhWUVVGVkxFVkJRVVVzUlVGQlF5eERRVUZETEV0QlFVY3NTVUZCU1N4RFFVRkRMRlZCUVZVc1NVRkJSU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNSVUZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVUVzUVVGQlF5eERRVUZCTEVkQlFVVXNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFVkJRVU1zUTBGQlF5eEZRVUZGTEVOQlFVTXNRMEZCUVR0SFFVRkRMRk5CUVZNc1EwRkJReXhIUVVGRk8wRkJRVU1zVjBGQlR5eEpRVUZKTEV0QlFVc3NRMEZCUXl4NVEwRkJlVU1zUTBGQlF5eERRVUZCTzBkQlFVTXNVMEZCVXl4RFFVRkRMRWRCUVVVN1FVRkJReXhSUVVGSkxFTkJRVU1zUTBGQlF5eEpRVUZITEZkQlFWY3NTVUZCUlN4UFFVRlBMRTFCUVUwc1JVRkJReXhEUVVGRExFZEJRVU1zVFVGQlRTeERRVUZETEV0QlFVc3NTVUZCUnl4WFFVRlhMRWxCUVVVc1QwRkJUeXhKUVVGSkxFVkJRVU1zUTBGQlF5eEhRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRWxCUVVjN1FVRkJReXhQUVVGRExFZEJRVU1zVVVGQlVTeERRVUZETEdGQlFXRXNRMEZCUXl4RlFVRkZMRU5CUVVFN1MwRkJReXhEUVVGQkxFOUJRVTBzUTBGQlF5eEZRVUZETzBGQlFVTXNXVUZCVFN4SlFVRkpMRXRCUVVzc1EwRkJReXd3UlVGQk1FVXNRMEZCUXl4RFFVRkJPMHRCUVVNc1NVRkJTU3hEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhKUVVGRkxHdENRVUZyUWl4TFFVRkhMRTFCUVUwc1EwRkJReXhUUVVGVExFTkJRVU1zVVVGQlVTeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1QwRkJUeXhGUVVGRkxFTkJRVU1zU1VGQlJTeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkJMRXRCUVVrc1EwRkJReXhEUVVGRExFOUJRVThzUjBGQlF5eEZRVUZGTEVOQlFVRXNRVUZCUXl4RFFVRkJPMGRCUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZETEV0QlFVc3NRMEZCUXl4UFFVRlBMRWRCUVVNc1MwRkJTeXhEUVVGRExFOUJRVThzUjBGQlF5eFZRVUZUTEVOQlFVTXNSVUZCUXp0QlFVRkRMRmRCUVUwc1owSkJRV2RDTEV0QlFVY3NUVUZCVFN4RFFVRkRMRk5CUVZNc1EwRkJReXhSUVVGUkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkJPMGRCUVVNc1EwRkJReXhKUVVGSkxFTkJRVU03VFVGQlF5eERRVUZETzAxQlFVTXNRMEZCUXp0TlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRE8wMUJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTTdUVUZCUXl4RFFVRkRMRWRCUVVNc1YwRkJVeXhEUVVGRExFVkJRVU1zUTBGQlF5eEZRVUZETzBGQlFVTXNUVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGRExFTkJRVU1zUlVGQlF5eEZRVUZGTEVOQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVsQlFVVXNRMEZCUXl4RlFVRkRMRU5CUVVNc1MwRkJSeXhEUVVGRExFdEJRVWNzUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFVkJRVVVzUTBGQlFTeEJRVUZETEVOQlFVRTdSMEZCUXp0TlFVRkRMRU5CUVVNc1IwRkJReXhYUVVGWExFbEJRVVVzVDBGQlR5eE5RVUZOTEVkQlFVTXNUVUZCVFN4SFFVRkRMRXRCUVVzc1EwRkJRenROUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVsQlFVVXNSVUZCUlR0TlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zWjBKQlFXZENMRWxCUVVVc1EwRkJReXhEUVVGRExITkNRVUZ6UWp0TlFVRkRMRU5CUVVNc1IwRkJReXhYUVVGWExFbEJRVVVzVDBGQlR5eEpRVUZKTEVsQlFVVXNWMEZCVnl4SlFVRkZMRTlCUVU4c1QwRkJUeXhKUVVGRkxHdENRVUZyUWl4TFFVRkhMRU5CUVVFc1IwRkJSU3hEUVVGRExGRkJRVkVzUTBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRPMDFCUVVNc1EwRkJReXhIUVVGRExGZEJRVmNzU1VGQlJTeFBRVUZQTEdsQ1FVRnBRaXhKUVVGRkxGZEJRVmNzU1VGQlJTeFBRVUZQTEdGQlFXRXNTVUZCUlN4WFFVRlhMRWxCUVVVc1QwRkJUeXhqUVVGak8wMUJRVU1zUlVGQlJTeEhRVUZETEVsQlFVa3NTMEZCU3l4RFFVRkRMRWxCUVVjc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4RlFVRkZMRWRCUVVNc1EwRkJReXhIUVVGRExFTkJRVU1zUlVGQlJTeEhRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRVZCUVVVc1IwRkJReXhMUVVGTExFTkJRVU1zUzBGQlJ5eERRVUZETEVsQlFVVXNWVUZCVlN4SlFVRkZMRTlCUVU4c1QwRkJUeXhIUVVGRExFTkJRVU1zUlVGQlJTeEhRVUZETEVOQlFVTXNSVUZCUlN4RFFVRkRMRWxCUVVrc1JVRkJSU3hIUVVGRExFTkJRVU03VFVGQlF5eEZRVUZGTEVkQlFVTXNRMEZCUXp0TlFVRkRMRVZCUVVVc1IwRkJReXhKUVVGSkxFTkJRVU1zVFVGQlRTeEZRVUZGTEVOQlFVTXNVVUZCVVN4RFFVRkRMRVZCUVVVc1EwRkJReXhEUVVGRExGTkJRVk1zUTBGQlF5eEZRVUZGTEVOQlFVTTdUVUZCUXl4RlFVRkZMRWRCUVVNc1MwRkJTeXhEUVVGRE8wMUJRVU1zUlVGQlJTeEhRVUZETEVOQlFVTTdUVUZCUXl4RlFVRkZMRWRCUVVNc1EwRkJRenROUVVGRExFVkJRVVVzUjBGQlF5eEpRVUZKTEVOQlFVTXNSVUZCUVR0TlFVRkRMRVZCUVVVc1IwRkJReXhKUVVGSkxFTkJRVU1zUlVGQlFUdE5RVUZETEVWQlFVVXNSMEZCUXl4RFFVRkRPMDFCUVVNc1JVRkJSU3hIUVVGRExFTkJRVU03VFVGQlF5eEZRVUZGTEVkQlFVTXNRMEZCUXp0TlFVRkRMRVZCUVVVc1IwRkJReXhEUVVGRE8wMUJRVU1zUlVGQlJTeEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJSeXhIUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEVOQlFVTXNTVUZCU1N4SFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFTkJRVU1zVDBGQlR5eEhRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRU5CUVVNc1RVRkJUU3hIUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEVOQlFVTXNZVUZCWVN4SFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zVVVGQlVTeEhRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1MwRkJTeXhIUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNVMEZCVXl4SFFVRkRMRVZCUVVNc1YwRkJWeXhGUVVGRExFTkJRVU1zUlVGQlF5eEpRVUZKTEVWQlFVTXNSVUZCUlN4RlFVRkRMRTlCUVU4c1JVRkJReXhuUWtGQlV5eERRVUZETEVWQlFVTTdRVUZCUXl4aFFVRlBMRWxCUVVrc1EwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlNTeEZRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkJPMHRCUVVNc1JVRkJReXhEUVVGRExFbEJRVWtzUlVGQlJTeEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1UwRkJVeXhEUVVGRExGVkJRVlVzUjBGQlF5eFpRVUZWTzBGQlFVTXNVMEZCU1N4SlFVRkpMRU5CUVVNc1IwRkJReXhKUVVGSkxFTkJRVU1zVFVGQlRTeEZRVUZETEVOQlFVTXNSMEZCUXl4SlFVRkpMRU5CUVVNc1RVRkJUU3hGUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVWQlFVTXNTVUZCU1N4RFFVRkRMRTFCUVUwc1MwRkJSeXhGUVVGRkxFbEJRVVVzUTBGQlF5eEhRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVVc1JVRkJReXhKUVVGSkxFTkJRVU1zVlVGQlZTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlFUdEhRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRk5CUVZNc1EwRkJReXhWUVVGVkxFZEJRVU1zVlVGQlV5eERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkRPMEZCUVVNc1VVRkJTU3hEUVVGRExFZEJRVU1zU1VGQlNTeERRVUZETEc5Q1FVRnZRanRSUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4RFFVRkRMRWxCUVVjc1EwRkJReXhMUVVGSExFVkJRVVVzUlVGQlF6dEJRVUZETEZWQlFVa3NRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEpRVUZITEVOQlFVTXNTMEZCUnl4RlFVRkZMRWxCUVVVc1EwRkJReXhEUVVGRExFMUJRVTBzUzBGQlJ5eEZRVUZGTEVWQlFVTXNTVUZCU1N4RFFVRkRMRlZCUVZVc1EwRkJReXhEUVVGRExFTkJRVU1zVFVGQlRTeEZRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zUzBGQlN5eEpRVUZITEZWQlFWVXNTVUZCUlN4UFFVRlBMRU5CUVVNc1JVRkJReXhKUVVGSkxFTkJRVU1zVlVGQlZTeEZRVUZGTEVWQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVOQlFVTXNTMEZCU3l4SlFVRkhMRU5CUVVNc1MwRkJSeXhGUVVGRkxFVkJRVU03UVVGQlF5eFpRVUZKTEVOQlFVTXNSMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eEpRVUZKTEVOQlFVTXNZVUZCWVN4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlFUdFBRVUZETEUxQlFVc3NTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eFZRVUZUTEVOQlFVTXNSVUZCUXp0QlFVRkRMRk5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlFUdFBRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRVHRMUVVGRExFMUJRVXNzU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVOQlFVRTdSMEZCUXl4RlFVRkRMRU5CUVVNc1EwRkJReXhUUVVGVExFTkJRVU1zVlVGQlZTeEhRVUZETEZWQlFWTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFVkJRVU03UVVGQlF5eFJRVUZKTEVOQlFVTXNSMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF5eE5RVUZOTEV0QlFVY3NSVUZCUlN4TFFVRkhMRWxCUVVrc1EwRkJReXhWUVVGVkxFVkJRVVVzUlVGQlF5eERRVUZETEV0QlFVY3NSVUZCUlN4SFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVkQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVOQlFVRXNRVUZCUXl4RlFVRkRMRU5CUVVNc1MwRkJSeXhKUVVGSkxFTkJRVU1zVlVGQlZTeEpRVUZGTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eERRVUZCTzBkQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1UwRkJVeXhEUVVGRExHRkJRV0VzUjBGQlF5eFZRVUZUTEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNN1FVRkJReXhSUVVGSkxFTkJRVU1zUjBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhMUVVGTExFTkJRVU1zUlVGQlF5eFZRVUZUTEVOQlFVTXNSVUZCUXp0QlFVRkRMRTlCUVVNc1EwRkJReXhWUVVGVkxFTkJRVU1zUlVGQlJTeEZRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRVHRMUVVGRExFVkJRVU1zVlVGQlV5eERRVUZETEVWQlFVTTdRVUZCUXl4UFFVRkRMRU5CUVVNc1ZVRkJWU3hEUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVFN1MwRkJReXhEUVVGRExFTkJRVUU3UjBGQlF5eERRVUZETEVsQlFVa3NSVUZCUlN4SFFVRkRMRU5CUVVNN1RVRkJReXhGUVVGRkxFZEJRVU1zUlVGQlF5eFBRVUZQTEVWQlFVTXNSVUZCUlN4RlFVRkRMRkZCUVZFc1JVRkJReXhGUVVGRkxFVkJRVU1zUTBGQlF5eFZRVUZWTEVsQlFVVXNUMEZCVHl4TlFVRk5MRWxCUVVVc1RVRkJUU3hEUVVGRExFZEJRVWNzUjBGQlF5eE5RVUZOTEVOQlFVTXNXVUZCVlR0QlFVRkRMRmRCUVU4c1JVRkJSU3hEUVVGQk8wZEJRVU1zUTBGQlF5eEhRVUZETEZkQlFWY3NTVUZCUlN4UFFVRlBMRTFCUVUwc1NVRkJSU3hOUVVGTkxFTkJRVU1zVDBGQlR5eEhRVUZETEUxQlFVMHNRMEZCUXl4UFFVRlBMRWRCUVVNc1JVRkJSU3hIUVVGRExGZEJRVmNzU1VGQlJTeFBRVUZQTEVsQlFVa3NTMEZCUnl4SlFVRkpMRU5CUVVNc1ZVRkJWU3hIUVVGRExFVkJRVVVzUTBGQlFTeEJRVUZETEVWQlFVTXNSVUZCUlN4RlFVRkZMRU5CUVVFN1EwRkJReXhEUVVGQkxFTkJRVVVzU1VGQlNTeFhRVUZOTEVOQlFVTWlMQ0ptYVd4bElqb2laMlZ1WlhKaGRHVmtMbXB6SWl3aWMyOTFjbU5sVW05dmRDSTZJaUlzSW5OdmRYSmpaWE5EYjI1MFpXNTBJanBiSWk4cUlWeHVJQ29nUUc5MlpYSjJhV1YzSUdWek5pMXdjbTl0YVhObElDMGdZU0IwYVc1NUlHbHRjR3hsYldWdWRHRjBhVzl1SUc5bUlGQnliMjFwYzJWekwwRXJMbHh1SUNvZ1FHTnZjSGx5YVdkb2RDQkRiM0I1Y21sbmFIUWdLR01wSURJd01UUWdXV1ZvZFdSaElFdGhkSG9zSUZSdmJTQkVZV3hsTENCVGRHVm1ZVzRnVUdWdWJtVnlJR0Z1WkNCamIyNTBjbWxpZFhSdmNuTWdLRU52Ym5abGNuTnBiMjRnZEc4Z1JWTTJJRUZRU1NCaWVTQktZV3RsSUVGeVkyaHBZbUZzWkNsY2JpQXFJRUJzYVdObGJuTmxJQ0FnVEdsalpXNXpaV1FnZFc1a1pYSWdUVWxVSUd4cFkyVnVjMlZjYmlBcUlDQWdJQ0FnSUNBZ0lDQWdVMlZsSUdoMGRIQnpPaTh2Y21GM0xtZHBkR2gxWW5WelpYSmpiMjUwWlc1MExtTnZiUzlxWVd0bFlYSmphR2xpWVd4a0wyVnpOaTF3Y205dGFYTmxMMjFoYzNSbGNpOU1TVU5GVGxORlhHNGdLaUJBZG1WeWMybHZiaUFnSURNdU1pNHhYRzRnS2k5Y2JseHVLR1oxYm1OMGFXOXVLQ2w3WENKMWMyVWdjM1J5YVdOMFhDSTdablZ1WTNScGIyNGdkQ2gwS1h0eVpYUjFjbTVjSW1aMWJtTjBhVzl1WENJOVBYUjVjR1Z2WmlCMGZIeGNJbTlpYW1WamRGd2lQVDEwZVhCbGIyWWdkQ1ltYm5Wc2JDRTlQWFI5Wm5WdVkzUnBiMjRnWlNoMEtYdHlaWFIxY201Y0ltWjFibU4wYVc5dVhDSTlQWFI1Y0dWdlppQjBmV1oxYm1OMGFXOXVJRzRvZENsN1J6MTBmV1oxYm1OMGFXOXVJSElvZENsN1VUMTBmV1oxYm1OMGFXOXVJRzhvS1h0eVpYUjFjbTRnWm5WdVkzUnBiMjRvS1h0d2NtOWpaWE56TG01bGVIUlVhV05yS0dFcGZYMW1kVzVqZEdsdmJpQnBLQ2w3Y21WMGRYSnVJR1oxYm1OMGFXOXVLQ2w3UWloaEtYMTlablZ1WTNScGIyNGdjeWdwZTNaaGNpQjBQVEFzWlQxdVpYY2dXQ2hoS1N4dVBXUnZZM1Z0Wlc1MExtTnlaV0YwWlZSbGVIUk9iMlJsS0Z3aVhDSXBPM0psZEhWeWJpQmxMbTlpYzJWeWRtVW9iaXg3WTJoaGNtRmpkR1Z5UkdGMFlUb2hNSDBwTEdaMWJtTjBhVzl1S0NsN2JpNWtZWFJoUFhROUt5dDBKVEo5ZldaMWJtTjBhVzl1SUhVb0tYdDJZWElnZEQxdVpYY2dUV1Z6YzJGblpVTm9ZVzV1Wld3N2NtVjBkWEp1SUhRdWNHOXlkREV1YjI1dFpYTnpZV2RsUFdFc1puVnVZM1JwYjI0b0tYdDBMbkJ2Y25ReUxuQnZjM1JOWlhOellXZGxLREFwZlgxbWRXNWpkR2x2YmlCaktDbDdjbVYwZFhKdUlHWjFibU4wYVc5dUtDbDdjMlYwVkdsdFpXOTFkQ2hoTERFcGZYMW1kVzVqZEdsdmJpQmhLQ2w3Wm05eUtIWmhjaUIwUFRBN1NqNTBPM1FyUFRJcGUzWmhjaUJsUFhSMFczUmRMRzQ5ZEhSYmRDc3hYVHRsS0c0cExIUjBXM1JkUFhadmFXUWdNQ3gwZEZ0MEt6RmRQWFp2YVdRZ01IMUtQVEI5Wm5WdVkzUnBiMjRnWmlncGUzUnllWHQyWVhJZ2REMXlaWEYxYVhKbExHVTlkQ2hjSW5abGNuUjRYQ0lwTzNKbGRIVnliaUJDUFdVdWNuVnVUMjVNYjI5d2ZIeGxMbkoxYms5dVEyOXVkR1Y0ZEN4cEtDbDlZMkYwWTJnb2JpbDdjbVYwZFhKdUlHTW9LWDE5Wm5WdVkzUnBiMjRnYkNoMExHVXBlM1poY2lCdVBYUm9hWE1zY2oxdVpYY2dkR2hwY3k1amIyNXpkSEoxWTNSdmNpaHdLVHQyYjJsa0lEQTlQVDF5VzNKMFhTWW1heWh5S1R0MllYSWdiejF1TGw5emRHRjBaVHRwWmlodktYdDJZWElnYVQxaGNtZDFiV1Z1ZEhOYmJ5MHhYVHRSS0daMWJtTjBhVzl1S0NsN2VDaHZMSElzYVN4dUxsOXlaWE4xYkhRcGZTbDlaV3h6WlNCRktHNHNjaXgwTEdVcE8zSmxkSFZ5YmlCeWZXWjFibU4wYVc5dUlHZ29kQ2w3ZG1GeUlHVTlkR2hwY3p0cFppaDBKaVpjSW05aWFtVmpkRndpUFQxMGVYQmxiMllnZENZbWRDNWpiMjV6ZEhKMVkzUnZjajA5UFdVcGNtVjBkWEp1SUhRN2RtRnlJRzQ5Ym1WM0lHVW9jQ2s3Y21WMGRYSnVJR2NvYml4MEtTeHVmV1oxYm1OMGFXOXVJSEFvS1h0OVpuVnVZM1JwYjI0Z1h5Z3BlM0psZEhWeWJpQnVaWGNnVkhsd1pVVnljbTl5S0Z3aVdXOTFJR05oYm01dmRDQnlaWE52YkhabElHRWdjSEp2YldselpTQjNhWFJvSUdsMGMyVnNabHdpS1gxbWRXNWpkR2x2YmlCa0tDbDdjbVYwZFhKdUlHNWxkeUJVZVhCbFJYSnliM0lvWENKQklIQnliMjFwYzJWeklHTmhiR3hpWVdOcklHTmhibTV2ZENCeVpYUjFjbTRnZEdoaGRDQnpZVzFsSUhCeWIyMXBjMlV1WENJcGZXWjFibU4wYVc5dUlIWW9kQ2w3ZEhKNWUzSmxkSFZ5YmlCMExuUm9aVzU5WTJGMFkyZ29aU2w3Y21WMGRYSnVJSFYwTG1WeWNtOXlQV1VzZFhSOWZXWjFibU4wYVc5dUlIa29kQ3hsTEc0c2NpbDdkSEo1ZTNRdVkyRnNiQ2hsTEc0c2NpbDlZMkYwWTJnb2J5bDdjbVYwZFhKdUlHOTlmV1oxYm1OMGFXOXVJRzBvZEN4bExHNHBlMUVvWm5WdVkzUnBiMjRvZENsN2RtRnlJSEk5SVRFc2J6MTVLRzRzWlN4bWRXNWpkR2x2YmlodUtYdHlmSHdvY2owaE1DeGxJVDA5Ymo5bktIUXNiaWs2VXloMExHNHBLWDBzWm5WdVkzUnBiMjRvWlNsN2NueDhLSEk5SVRBc2FpaDBMR1VwS1gwc1hDSlRaWFIwYkdVNklGd2lLeWgwTGw5c1lXSmxiSHg4WENJZ2RXNXJibTkzYmlCd2NtOXRhWE5sWENJcEtUc2hjaVltYnlZbUtISTlJVEFzYWloMExHOHBLWDBzZENsOVpuVnVZM1JwYjI0Z1lpaDBMR1VwZTJVdVgzTjBZWFJsUFQwOWFYUS9VeWgwTEdVdVgzSmxjM1ZzZENrNlpTNWZjM1JoZEdVOVBUMXpkRDlxS0hRc1pTNWZjbVZ6ZFd4MEtUcEZLR1VzZG05cFpDQXdMR1oxYm1OMGFXOXVLR1VwZTJjb2RDeGxLWDBzWm5WdVkzUnBiMjRvWlNsN2FpaDBMR1VwZlNsOVpuVnVZM1JwYjI0Z2R5aDBMRzRzY2lsN2JpNWpiMjV6ZEhKMVkzUnZjajA5UFhRdVkyOXVjM1J5ZFdOMGIzSW1Kbkk5UFQxbGRDWW1ZMjl1YzNSeWRXTjBiM0l1Y21WemIyeDJaVDA5UFc1MFAySW9kQ3h1S1RweVBUMDlkWFEvYWloMExIVjBMbVZ5Y205eUtUcDJiMmxrSURBOVBUMXlQMU1vZEN4dUtUcGxLSElwUDIwb2RDeHVMSElwT2xNb2RDeHVLWDFtZFc1amRHbHZiaUJuS0dVc2JpbDdaVDA5UFc0L2FpaGxMRjhvS1NrNmRDaHVLVDkzS0dVc2JpeDJLRzRwS1RwVEtHVXNiaWw5Wm5WdVkzUnBiMjRnUVNoMEtYdDBMbDl2Ym1WeWNtOXlKaVowTGw5dmJtVnljbTl5S0hRdVgzSmxjM1ZzZENrc1ZDaDBLWDFtZFc1amRHbHZiaUJUS0hRc1pTbDdkQzVmYzNSaGRHVTlQVDF2ZENZbUtIUXVYM0psYzNWc2REMWxMSFF1WDNOMFlYUmxQV2wwTERBaFBUMTBMbDl6ZFdKelkzSnBZbVZ5Y3k1c1pXNW5kR2dtSmxFb1ZDeDBLU2w5Wm5WdVkzUnBiMjRnYWloMExHVXBlM1F1WDNOMFlYUmxQVDA5YjNRbUppaDBMbDl6ZEdGMFpUMXpkQ3gwTGw5eVpYTjFiSFE5WlN4UktFRXNkQ2twZldaMWJtTjBhVzl1SUVVb2RDeGxMRzRzY2lsN2RtRnlJRzg5ZEM1ZmMzVmljMk55YVdKbGNuTXNhVDF2TG14bGJtZDBhRHQwTGw5dmJtVnljbTl5UFc1MWJHd3NiMXRwWFQxbExHOWJhU3RwZEYwOWJpeHZXMmtyYzNSZFBYSXNNRDA5UFdrbUpuUXVYM04wWVhSbEppWlJLRlFzZENsOVpuVnVZM1JwYjI0Z1ZDaDBLWHQyWVhJZ1pUMTBMbDl6ZFdKelkzSnBZbVZ5Y3l4dVBYUXVYM04wWVhSbE8ybG1LREFoUFQxbExteGxibWQwYUNsN1ptOXlLSFpoY2lCeUxHOHNhVDEwTGw5eVpYTjFiSFFzY3owd08zTThaUzVzWlc1bmRHZzdjeXM5TXlseVBXVmJjMTBzYnoxbFczTXJibDBzY2o5NEtHNHNjaXh2TEdrcE9tOG9hU2s3ZEM1ZmMzVmljMk55YVdKbGNuTXViR1Z1WjNSb1BUQjlmV1oxYm1OMGFXOXVJRTBvS1h0MGFHbHpMbVZ5Y205eVBXNTFiR3g5Wm5WdVkzUnBiMjRnVUNoMExHVXBlM1J5ZVh0eVpYUjFjbTRnZENobEtYMWpZWFJqYUNodUtYdHlaWFIxY200Z1kzUXVaWEp5YjNJOWJpeGpkSDE5Wm5WdVkzUnBiMjRnZUNoMExHNHNjaXh2S1h0MllYSWdhU3h6TEhVc1l5eGhQV1VvY2lrN2FXWW9ZU2w3YVdZb2FUMVFLSElzYnlrc2FUMDlQV04wUHloalBTRXdMSE05YVM1bGNuSnZjaXhwUFc1MWJHd3BPblU5SVRBc2JqMDlQV2twY21WMGRYSnVJSFp2YVdRZ2FpaHVMR1FvS1NsOVpXeHpaU0JwUFc4c2RUMGhNRHR1TGw5emRHRjBaU0U5UFc5MGZId29ZU1ltZFQ5bktHNHNhU2s2WXo5cUtHNHNjeWs2ZEQwOVBXbDBQMU1vYml4cEtUcDBQVDA5YzNRbUptb29iaXhwS1NsOVpuVnVZM1JwYjI0Z1F5aDBMR1VwZTNSeWVYdGxLR1oxYm1OMGFXOXVLR1VwZTJjb2RDeGxLWDBzWm5WdVkzUnBiMjRvWlNsN2FpaDBMR1VwZlNsOVkyRjBZMmdvYmlsN2FpaDBMRzRwZlgxbWRXNWpkR2x2YmlCUEtDbDdjbVYwZFhKdUlHRjBLeXQ5Wm5WdVkzUnBiMjRnYXloMEtYdDBXM0owWFQxaGRDc3JMSFF1WDNOMFlYUmxQWFp2YVdRZ01DeDBMbDl5WlhOMWJIUTlkbTlwWkNBd0xIUXVYM04xWW5OamNtbGlaWEp6UFZ0ZGZXWjFibU4wYVc5dUlGa29kQ2w3Y21WMGRYSnVJRzVsZHlCZmRDaDBhR2x6TEhRcExuQnliMjFwYzJWOVpuVnVZM1JwYjI0Z2NTaDBLWHQyWVhJZ1pUMTBhR2x6TzNKbGRIVnliaUJ1WlhjZ1pTaEpLSFFwUDJaMWJtTjBhVzl1S0c0c2NpbDdabTl5S0haaGNpQnZQWFF1YkdWdVozUm9MR2s5TUR0dlBtazdhU3NyS1dVdWNtVnpiMngyWlNoMFcybGRLUzUwYUdWdUtHNHNjaWw5T21aMWJtTjBhVzl1S0hRc1pTbDdaU2h1WlhjZ1ZIbHdaVVZ5Y205eUtGd2lXVzkxSUcxMWMzUWdjR0Z6Y3lCaGJpQmhjbkpoZVNCMGJ5QnlZV05sTGx3aUtTbDlLWDFtZFc1amRHbHZiaUJHS0hRcGUzWmhjaUJsUFhSb2FYTXNiajF1WlhjZ1pTaHdLVHR5WlhSMWNtNGdhaWh1TEhRcExHNTlablZ1WTNScGIyNGdSQ2dwZTNSb2NtOTNJRzVsZHlCVWVYQmxSWEp5YjNJb1hDSlpiM1VnYlhWemRDQndZWE56SUdFZ2NtVnpiMngyWlhJZ1puVnVZM1JwYjI0Z1lYTWdkR2hsSUdacGNuTjBJR0Z5WjNWdFpXNTBJSFJ2SUhSb1pTQndjbTl0YVhObElHTnZibk4wY25WamRHOXlYQ0lwZldaMWJtTjBhVzl1SUVzb0tYdDBhSEp2ZHlCdVpYY2dWSGx3WlVWeWNtOXlLRndpUm1GcGJHVmtJSFJ2SUdOdmJuTjBjblZqZENBblVISnZiV2x6WlNjNklGQnNaV0Z6WlNCMWMyVWdkR2hsSUNkdVpYY25JRzl3WlhKaGRHOXlMQ0IwYUdseklHOWlhbVZqZENCamIyNXpkSEoxWTNSdmNpQmpZVzV1YjNRZ1ltVWdZMkZzYkdWa0lHRnpJR0VnWm5WdVkzUnBiMjR1WENJcGZXWjFibU4wYVc5dUlFd29kQ2w3ZEdocGMxdHlkRjA5VHlncExIUm9hWE11WDNKbGMzVnNkRDEwYUdsekxsOXpkR0YwWlQxMmIybGtJREFzZEdocGN5NWZjM1ZpYzJOeWFXSmxjbk05VzEwc2NDRTlQWFFtSmloY0ltWjFibU4wYVc5dVhDSWhQWFI1Y0dWdlppQjBKaVpFS0Nrc2RHaHBjeUJwYm5OMFlXNWpaVzltSUV3L1F5aDBhR2x6TEhRcE9rc29LU2w5Wm5WdVkzUnBiMjRnVGloMExHVXBlM1JvYVhNdVgybHVjM1JoYm1ObFEyOXVjM1J5ZFdOMGIzSTlkQ3gwYUdsekxuQnliMjFwYzJVOWJtVjNJSFFvY0Nrc2RHaHBjeTV3Y205dGFYTmxXM0owWFh4OGF5aDBhR2x6TG5CeWIyMXBjMlVwTEVGeWNtRjVMbWx6UVhKeVlYa29aU2svS0hSb2FYTXVYMmx1Y0hWMFBXVXNkR2hwY3k1c1pXNW5kR2c5WlM1c1pXNW5kR2dzZEdocGN5NWZjbVZ0WVdsdWFXNW5QV1V1YkdWdVozUm9MSFJvYVhNdVgzSmxjM1ZzZEQxdVpYY2dRWEp5WVhrb2RHaHBjeTVzWlc1bmRHZ3BMREE5UFQxMGFHbHpMbXhsYm1kMGFEOVRLSFJvYVhNdWNISnZiV2x6WlN4MGFHbHpMbDl5WlhOMWJIUXBPaWgwYUdsekxteGxibWQwYUQxMGFHbHpMbXhsYm1kMGFIeDhNQ3gwYUdsekxsOWxiblZ0WlhKaGRHVW9LU3d3UFQwOWRHaHBjeTVmY21WdFlXbHVhVzVuSmlaVEtIUm9hWE11Y0hKdmJXbHpaU3gwYUdsekxsOXlaWE4xYkhRcEtTazZhaWgwYUdsekxuQnliMjFwYzJVc1ZTZ3BLWDFtZFc1amRHbHZiaUJWS0NsN2NtVjBkWEp1SUc1bGR5QkZjbkp2Y2loY0lrRnljbUY1SUUxbGRHaHZaSE1nYlhWemRDQmlaU0J3Y205MmFXUmxaQ0JoYmlCQmNuSmhlVndpS1gxbWRXNWpkR2x2YmlCWEtDbDdkbUZ5SUhRN2FXWW9YQ0oxYm1SbFptbHVaV1JjSWlFOWRIbHdaVzltSUdkc2IySmhiQ2wwUFdkc2IySmhiRHRsYkhObElHbG1LRndpZFc1a1pXWnBibVZrWENJaFBYUjVjR1Z2WmlCelpXeG1LWFE5YzJWc1pqdGxiSE5sSUhSeWVYdDBQVVoxYm1OMGFXOXVLRndpY21WMGRYSnVJSFJvYVhOY0lpa29LWDFqWVhSamFDaGxLWHQwYUhKdmR5QnVaWGNnUlhKeWIzSW9YQ0p3YjJ4NVptbHNiQ0JtWVdsc1pXUWdZbVZqWVhWelpTQm5iRzlpWVd3Z2IySnFaV04wSUdseklIVnVZWFpoYVd4aFlteGxJR2x1SUhSb2FYTWdaVzUyYVhKdmJtMWxiblJjSWlsOWRtRnlJRzQ5ZEM1UWNtOXRhWE5sT3lnaGJueDhYQ0piYjJKcVpXTjBJRkJ5YjIxcGMyVmRYQ0loUFQxUFltcGxZM1F1Y0hKdmRHOTBlWEJsTG5SdlUzUnlhVzVuTG1OaGJHd29iaTV5WlhOdmJIWmxLQ2twZkh4dUxtTmhjM1FwSmlZb2RDNVFjbTl0YVhObFBYQjBLWDEyWVhJZ2VqdDZQVUZ5Y21GNUxtbHpRWEp5WVhrL1FYSnlZWGt1YVhOQmNuSmhlVHBtZFc1amRHbHZiaWgwS1h0eVpYUjFjbTVjSWx0dlltcGxZM1FnUVhKeVlYbGRYQ0k5UFQxUFltcGxZM1F1Y0hKdmRHOTBlWEJsTG5SdlUzUnlhVzVuTG1OaGJHd29kQ2w5TzNaaGNpQkNMRWNzU0N4SlBYb3NTajB3TEZFOVpuVnVZM1JwYjI0b2RDeGxLWHQwZEZ0S1hUMTBMSFIwVzBvck1WMDlaU3hLS3oweUxESTlQVDFLSmlZb1J6OUhLR0VwT2tnb0tTbDlMRkk5WENKMWJtUmxabWx1WldSY0lpRTlkSGx3Wlc5bUlIZHBibVJ2ZHo5M2FXNWtiM2M2ZG05cFpDQXdMRlk5VW54OGUzMHNXRDFXTGsxMWRHRjBhVzl1VDJKelpYSjJaWEo4ZkZZdVYyVmlTMmwwVFhWMFlYUnBiMjVQWW5ObGNuWmxjaXhhUFZ3aWRXNWtaV1pwYm1Wa1hDSTlQWFI1Y0dWdlppQnpaV3htSmlaY0luVnVaR1ZtYVc1bFpGd2lJVDEwZVhCbGIyWWdjSEp2WTJWemN5WW1YQ0piYjJKcVpXTjBJSEJ5YjJObGMzTmRYQ0k5UFQxN2ZTNTBiMU4wY21sdVp5NWpZV3hzS0hCeWIyTmxjM01wTENROVhDSjFibVJsWm1sdVpXUmNJaUU5ZEhsd1pXOW1JRlZwYm5RNFEyeGhiWEJsWkVGeWNtRjVKaVpjSW5WdVpHVm1hVzVsWkZ3aUlUMTBlWEJsYjJZZ2FXMXdiM0owVTJOeWFYQjBjeVltWENKMWJtUmxabWx1WldSY0lpRTlkSGx3Wlc5bUlFMWxjM05oWjJWRGFHRnVibVZzTEhSMFBXNWxkeUJCY25KaGVTZ3haVE1wTzBnOVdqOXZLQ2s2V0Q5ektDazZKRDkxS0NrNmRtOXBaQ0F3UFQwOVVpWW1YQ0ptZFc1amRHbHZibHdpUFQxMGVYQmxiMllnY21WeGRXbHlaVDltS0NrNll5Z3BPM1poY2lCbGREMXNMRzUwUFdnc2NuUTlUV0YwYUM1eVlXNWtiMjBvS1M1MGIxTjBjbWx1Wnlnek5pa3VjM1ZpYzNSeWFXNW5LREUyS1N4dmREMTJiMmxrSURBc2FYUTlNU3h6ZEQweUxIVjBQVzVsZHlCTkxHTjBQVzVsZHlCTkxHRjBQVEFzWm5ROVdTeHNkRDF4TEdoMFBVWXNjSFE5VER0TUxtRnNiRDFtZEN4TUxuSmhZMlU5YkhRc1RDNXlaWE52YkhabFBXNTBMRXd1Y21WcVpXTjBQV2gwTEV3dVgzTmxkRk5qYUdWa2RXeGxjajF1TEV3dVgzTmxkRUZ6WVhBOWNpeE1MbDloYzJGd1BWRXNUQzV3Y205MGIzUjVjR1U5ZTJOdmJuTjBjblZqZEc5eU9rd3NkR2hsYmpwbGRDeGNJbU5oZEdOb1hDSTZablZ1WTNScGIyNG9kQ2w3Y21WMGRYSnVJSFJvYVhNdWRHaGxiaWh1ZFd4c0xIUXBmWDA3ZG1GeUlGOTBQVTQ3VGk1d2NtOTBiM1I1Y0dVdVgyVnVkVzFsY21GMFpUMW1kVzVqZEdsdmJpZ3BlMlp2Y2loMllYSWdkRDEwYUdsekxteGxibWQwYUN4bFBYUm9hWE11WDJsdWNIVjBMRzQ5TUR0MGFHbHpMbDl6ZEdGMFpUMDlQVzkwSmlaMFBtNDdiaXNyS1hSb2FYTXVYMlZoWTJoRmJuUnllU2hsVzI1ZExHNHBmU3hPTG5CeWIzUnZkSGx3WlM1ZlpXRmphRVZ1ZEhKNVBXWjFibU4wYVc5dUtIUXNaU2w3ZG1GeUlHNDlkR2hwY3k1ZmFXNXpkR0Z1WTJWRGIyNXpkSEoxWTNSdmNpeHlQVzR1Y21WemIyeDJaVHRwWmloeVBUMDliblFwZTNaaGNpQnZQWFlvZENrN2FXWW9iejA5UFdWMEppWjBMbDl6ZEdGMFpTRTlQVzkwS1hSb2FYTXVYM05sZEhSc1pXUkJkQ2gwTGw5emRHRjBaU3hsTEhRdVgzSmxjM1ZzZENrN1pXeHpaU0JwWmloY0ltWjFibU4wYVc5dVhDSWhQWFI1Y0dWdlppQnZLWFJvYVhNdVgzSmxiV0ZwYm1sdVp5MHRMSFJvYVhNdVgzSmxjM1ZzZEZ0bFhUMTBPMlZzYzJVZ2FXWW9iajA5UFhCMEtYdDJZWElnYVQxdVpYY2diaWh3S1R0M0tHa3NkQ3h2S1N4MGFHbHpMbDkzYVd4c1UyVjBkR3hsUVhRb2FTeGxLWDFsYkhObElIUm9hWE11WDNkcGJHeFRaWFIwYkdWQmRDaHVaWGNnYmlobWRXNWpkR2x2YmlobEtYdGxLSFFwZlNrc1pTbDlaV3h6WlNCMGFHbHpMbDkzYVd4c1UyVjBkR3hsUVhRb2NpaDBLU3hsS1gwc1RpNXdjbTkwYjNSNWNHVXVYM05sZEhSc1pXUkJkRDFtZFc1amRHbHZiaWgwTEdVc2JpbDdkbUZ5SUhJOWRHaHBjeTV3Y205dGFYTmxPM0l1WDNOMFlYUmxQVDA5YjNRbUppaDBhR2x6TGw5eVpXMWhhVzVwYm1jdExTeDBQVDA5YzNRL2FpaHlMRzRwT25Sb2FYTXVYM0psYzNWc2RGdGxYVDF1S1N3d1BUMDlkR2hwY3k1ZmNtVnRZV2x1YVc1bkppWlRLSElzZEdocGN5NWZjbVZ6ZFd4MEtYMHNUaTV3Y205MGIzUjVjR1V1WDNkcGJHeFRaWFIwYkdWQmREMW1kVzVqZEdsdmJpaDBMR1VwZTNaaGNpQnVQWFJvYVhNN1JTaDBMSFp2YVdRZ01DeG1kVzVqZEdsdmJpaDBLWHR1TGw5elpYUjBiR1ZrUVhRb2FYUXNaU3gwS1gwc1puVnVZM1JwYjI0b2RDbDdiaTVmYzJWMGRHeGxaRUYwS0hOMExHVXNkQ2w5S1gwN2RtRnlJR1IwUFZjc2RuUTllMUJ5YjIxcGMyVTZjSFFzY0c5c2VXWnBiR3c2WkhSOU8xd2lablZ1WTNScGIyNWNJajA5ZEhsd1pXOW1JR1JsWm1sdVpTWW1aR1ZtYVc1bExtRnRaRDlrWldacGJtVW9ablZ1WTNScGIyNG9LWHR5WlhSMWNtNGdkblI5S1RwY0luVnVaR1ZtYVc1bFpGd2lJVDEwZVhCbGIyWWdiVzlrZFd4bEppWnRiMlIxYkdVdVpYaHdiM0owY3o5dGIyUjFiR1V1Wlhod2IzSjBjejEyZERwY0luVnVaR1ZtYVc1bFpGd2lJVDEwZVhCbGIyWWdkR2hwY3lZbUtIUm9hWE11UlZNMlVISnZiV2x6WlQxMmRDa3NaSFFvS1gwcExtTmhiR3dvZEdocGN5azdJbDE5IiwiaW1wb3J0ICcuLi9saWIvZXM2LXByb21pc2UubWluLmpzJ1xuaW1wb3J0IFRlbXBsYXRlcyBmcm9tIFwiLi4vVGVtcGxhdGVzXCJcbmltcG9ydCBMb2dpbkNoZWNrIGZyb20gXCIuLi9Mb2dpbkNoZWNrXCJcbmltcG9ydCB7IGdldEpTT04sIHJvdW5kIH0gZnJvbSBcIi4uL2hlbHBlcnNcIlxuaW1wb3J0IEFQSSwgeyBUQkEsIGdldFRlYW1zLCBnZXRUZWFtU3RhdHMgfSBmcm9tIFwiLi4vQVBJXCJcblxuZXhwb3J0IGZ1bmN0aW9uIGV2ZW50KGtleSkge1xuICBQcm9taXNlLmFsbChbXG4gICAgTG9naW5DaGVjay5nZXQoKSxcbiAgICBUZW1wbGF0ZXMuZ2V0KFwiZXZlbnRcIiksXG4gICAgZ2V0SlNPTihcInN0YXRzLWNvbmZpZy5qc29uXCIpLFxuICAgIFRCQS5nZXQoXCJldmVudC9cIitrZXkpLFxuICBdKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgIGNvbnN0IFssIHRlbXBsYXRlLCBzdGF0cywgZXZlbnRdID0gcmVzO1xuICAgIGNvbnN0ICRjb250YWluZXIgPSAkKFwiI21haW5cIikuY2xvc2VzdChcIi5jb250YWluZXJcIik7XG4gICAgY29uc3QgY29udGFpbmVyQ2xhc3MgPSAkY29udGFpbmVyLmF0dHIoXCJjbGFzc1wiKTtcbiAgICBjb25zdCByYWN0aXZlID0gbmV3IFJhY3RpdmUoe1xuICAgICAgdGVtcGxhdGU6IHRlbXBsYXRlLFxuICAgICAgZGF0YToge1xuICAgICAgICBrZXk6IGtleSxcbiAgICAgICAgc3RhdENvbmZpZzogc3RhdHMsXG4gICAgICAgIGxvYWRpbmc6IHRydWUsXG4gICAgICAgIHRlYW1zOiBbXSxcbiAgICAgICAgcm91bmQ6IHJvdW5kLFxuICAgICAgICBldmVudDogZXZlbnQsXG4gICAgICAgIHN0YXRDb2xvcih2YWx1ZSwgc3RhdCkge1xuICAgICAgICAgIGNvbnN0IHZhbHVlID0gcGFyc2VGbG9hdCh2YWx1ZSk7XG4gICAgICAgICAgZm9yKGxldCBpID0gMDsgaSA8IHN0YXQucHJvZ3Jlc3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmICgoIXN0YXQucHJvZ3Jlc3NbaV0ubWluIHx8IHZhbHVlID49IHN0YXQucHJvZ3Jlc3NbaV0ubWluKSAmJiAoIXN0YXQucHJvZ3Jlc3NbaV0ubWF4IHx8IHZhbHVlIDw9IHN0YXQucHJvZ3Jlc3NbaV0ubWF4KSkge1xuICAgICAgICAgICAgICByZXR1cm4gc3RhdC5wcm9ncmVzc1tpXS5jbGFzcztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIG1vYmlsZTogJCh3aW5kb3cpLndpZHRoKCkgPCA5MDAsXG4gICAgICAgIHRva2VuOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9rZW4nKSxcbiAgICAgICAgdXNlcjoge1xuICAgICAgICAgIG5hbWU6IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1c2VyLm5hbWUnKSB8fCAnJyxcbiAgICAgICAgICB0ZWFtOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlci50ZWFtJykgfHwgJydcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGNvbXB1dGVkOiB7XG4gICAgICAgIG1vYmlsZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuICQod2luZG93KS53aWR0aCgpIDwgOTAwO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgb25yZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAkY29udGFpbmVyLmFkZENsYXNzKFwid2lkZVwiKTtcbiAgICAgIH0sXG4gICAgICBvbnVucmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgJGNvbnRhaW5lci5hdHRyKFwiY2xhc3NcIiwgY29udGFpbmVyQ2xhc3MpO1xuICAgICAgfVxuICAgIH0pO1xuXG4gICAgZ2V0VGVhbXMoQVBJLCBrZXkpLnRoZW4oZnVuY3Rpb24odGVhbXMpIHtcbiAgICAgIGNvbnNvbGUubG9nKHRlYW1zKVxuICAgICAgcmFjdGl2ZS5zZXQoe1xuICAgICAgICB0ZWFtczogdGVhbXMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgcmV0dXJuIGEudGVhbV9udW1iZXIgLSBiLnRlYW1fbnVtYmVyXG4gICAgICAgIH0pLFxuICAgICAgICBsb2FkaW5nOiBmYWxzZVxuICAgICAgfSk7XG4gICAgICBTb3J0YWJsZS5pbml0KCk7XG4gICAgfSk7XG4gIH0pO1xufVxuIiwiaW1wb3J0ICcuLi9saWIvZXM2LXByb21pc2UubWluLmpzJ1xuaW1wb3J0IFRlbXBsYXRlcyBmcm9tIFwiLi4vVGVtcGxhdGVzXCJcbmltcG9ydCBBUEksIHsgVEJBIH0gZnJvbSBcIi4uL0FQSVwiXG5pbXBvcnQgeyByb3VuZCB9IGZyb20gXCIuLi9oZWxwZXJzXCJcblxuZXhwb3J0IGZ1bmN0aW9uIGV2ZW50TWF0Y2hlcyhldmVudEtleSkge1xuICBQcm9taXNlLmFsbChbXG4gICAgVGVtcGxhdGVzLmdldChcImV2ZW50LW1hdGNoZXNcIiksXG4gICAgVEJBLmdldChcImV2ZW50L1wiK2V2ZW50S2V5KSxcbiAgICBUQkEuZ2V0KFwiZXZlbnQvXCIrZXZlbnRLZXkrXCIvc3RhdHNcIiksXG4gIF0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgY29uc3QgW3RlbXBsYXRlLCBldmVudCwgZXZlbnRTdGF0c10gPSByZXM7XG4gICAgY29uc3QgcHJlZGljdGlvbnNDb3VudHMgPSB7XG4gICAgICBcIm9wcnNcIjogW10sXG4gICAgICBcImRwcnNcIjogW10sXG4gICAgICBcImNjd21zXCI6IFtdLFxuICAgIH07XG4gICAgY29uc3QgcmFjdGl2ZSA9IG5ldyBSYWN0aXZlKHtcbiAgICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZSxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgZXZlbnQ6IGV2ZW50LFxuICAgICAgICBldmVudFN0YXRzOiBldmVudFN0YXRzLFxuICAgICAgICBtYXRjaGVzOiBbXSxcbiAgICAgICAgbG9hZGluZzogMSxcbiAgICAgICAgbW9tZW50OiBmdW5jdGlvbihkYXRlKSB7XG4gICAgICAgICAgcmV0dXJuIG1vbWVudChkYXRlKS5mcm9tTm93KCk7XG4gICAgICAgIH0sXG4gICAgICAgIGdldEFsbGlhbmNlU3VtKHRlYW1zLCBrZXkpIHtcbiAgICAgICAgICByZXR1cm4gdGVhbXMubWFwKHRlYW0gPT4gZXZlbnRTdGF0c1trZXldW3RlYW0ucmVwbGFjZSgvW15cXGRdL2csICcnKV0pLnJlZHVjZSgoYSwgYikgPT4gYSArIGIpO1xuICAgICAgICB9LFxuICAgICAgICBnZXRXaW5uZXIocmVkVGVhbXMsIGJsdWVUZWFtcywga2V5KSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KFwiZ2V0QWxsaWFuY2VTdW1cIikocmVkVGVhbXMsIGtleSkgPiB0aGlzLmdldChcImdldEFsbGlhbmNlU3VtXCIpKGJsdWVUZWFtcywga2V5KTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGNvbXB1dGVkOiB7XG4gICAgICAgIG1vYmlsZSgpIHtcbiAgICAgICAgICByZXR1cm4gJCh3aW5kb3cpLndpZHRoKCkgPCA5MDA7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSk7XG4gICAgVEJBLmdldChcImV2ZW50L1wiK2V2ZW50S2V5K1wiL21hdGNoZXNcIikudGhlbihmdW5jdGlvbihtYXRjaGVzKSB7XG4gICAgICByZXR1cm4gbWF0Y2hlcztcbiAgICB9KS50aGVuKGZ1bmN0aW9uKG1hdGNoZXMpIHtcbiAgICAgIGNvbnN0IHN1bSA9IHJhY3RpdmUuZ2V0KFwiZ2V0QWxsaWFuY2VTdW1cIikuYmluZChyYWN0aXZlKTtcbiAgICAgIGNvbnN0IHByZWRpY3RlZFdpbm5lciA9IHJhY3RpdmUuZ2V0KFwiZ2V0V2lubmVyXCIpLmJpbmQocmFjdGl2ZSk7XG4gICAgICBtYXRjaGVzLmZvckVhY2goZnVuY3Rpb24obWF0Y2gpIHtcbiAgICAgICAgY29uc3QgcmVkID0gbWF0Y2guYWxsaWFuY2VzLnJlZCxcbiAgICAgICAgICAgICAgYmx1ZSA9IG1hdGNoLmFsbGlhbmNlcy5ibHVlO1xuICAgICAgICBjb25zdCB3aW5uZXIgPSByZWQuc2NvcmUgPiBibHVlLnNjb3JlO1xuICAgICAgICBjb25zdCByZWRUZWFtcyA9IHJlZC50ZWFtcy5tYXAodGVhbSA9PiB0ZWFtLnJlcGxhY2UoL1teXFxkXS9nLCAnJykpXG4gICAgICAgIGNvbnN0IGJsdWVUZWFtcyA9IGJsdWUudGVhbXMubWFwKHRlYW0gPT4gdGVhbS5yZXBsYWNlKC9bXlxcZF0vZywgJycpKVxuICAgICAgICBjb25zdCBvcHJQcmVkID0gcHJlZGljdGVkV2lubmVyKHJlZFRlYW1zLCBibHVlVGVhbXMsICdvcHJzJylcbiAgICAgICAgY29uc3QgZHByUHJlZCA9IHByZWRpY3RlZFdpbm5lcihyZWRUZWFtcywgYmx1ZVRlYW1zLCAnZHBycycpXG4gICAgICAgIGNvbnN0IGNjd21QcmVkID0gcHJlZGljdGVkV2lubmVyKHJlZFRlYW1zLCBibHVlVGVhbXMsICdjY3dtcycpXG4gICAgICAgIHByZWRpY3Rpb25zQ291bnRzLm9wcnMucHVzaChvcHJQcmVkID09IHdpbm5lcilcbiAgICAgICAgcHJlZGljdGlvbnNDb3VudHMuZHBycy5wdXNoKGRwclByZWQgPT0gd2lubmVyKVxuICAgICAgICBwcmVkaWN0aW9uc0NvdW50cy5jY3dtcy5wdXNoKGNjd21QcmVkID09IHdpbm5lcilcbiAgICAgIH0pO1xuICAgICAgcmFjdGl2ZS5zZXQoe1xuICAgICAgICBtYXRjaGVzOiBtYXRjaGVzLnNvcnQoKGEsIGIpID0+IGEudGltZSAtIGIudGltZSksXG4gICAgICAgIGxvYWRpbmc6IDIsXG4gICAgICAgIHByZWRpY3Rpb25zOiAxXG4gICAgICB9KTtcbiAgICAgIFByb21pc2UuYWxsKG1hdGNoZXMubWFwKG1hdGNoID0+IEFQSS5nZXQoYHdvcmsvbWF0Y2gvJHtldmVudEtleX0vJHttYXRjaC5rZXl9YCkpKS50aGVuKGZ1bmN0aW9uKG1hdGNoZXMpIHtcbiAgICAgICAgcmFjdGl2ZS5zZXQoXCJsb2FkaW5nXCIsIDApO1xuICAgICAgICByYWN0aXZlLnNldCh7XG4gICAgICAgICAgbWF0Y2hlczogcmFjdGl2ZS5nZXQoXCJtYXRjaGVzXCIpLm1hcCgobWF0Y2gsIGkpID0+IHtcbiAgICAgICAgICAgIG1hdGNoLnByZWRpY3Rpb25zID0gbWF0Y2hlc1tpXS5tYXAoc2NvcmUgPT4gcm91bmQoc2NvcmUsIDIpKTtcbiAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICB9KS5zb3J0KChtYXRjaCwgaSkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2cobWF0Y2gpXG4gICAgICAgICAgfSksXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH0pO1xufVxuXG4vKlxue3sjaWYgcHJlZGljdGlvbnN9fVxuICA8Yj5QcmVkaWN0ZWQ8L2I+OlxuICB7eyNpZiBwcmVkaWN0aW9uc1swXSA+IHByZWRpY3Rpb25zWzFdfX1cbiAgICA8c3BhbiBjbGFzcz1cInJlZFwiPlJlZDwvc3Bhbj5cbiAge3tlbHNlfX1cbiAgICA8c3BhbiBjbGFzcz1cImJsdWVcIj5CbHVlPC9zcGFuPlxuICB7ey9pZn19XG4gICh7e3ByZWRpY3Rpb25zWzBdfX0gLSB7e3ByZWRpY3Rpb25zWzFdfX0pXG4gIDxicj5cbiAgT1BSOlxuICB7eyNpZiBnZXRXaW5uZXIoYWxsaWFuY2VzLnJlZC50ZWFtcywgYWxsaWFuY2VzLmJsdWUudGVhbXMsICdvcHJzJyl9fVxuICAgIDxzcGFuIGNsYXNzPVwicmVkXCI+UmVkPC9zcGFuPlxuICB7e2Vsc2V9fVxuICAgIDxzcGFuIGNsYXNzPVwiYmx1ZVwiPkJsdWU8L3NwYW4+XG4gIHt7L2lmfX1cbiAgKHt7Z2V0QWxsaWFuY2VTdW0oYWxsaWFuY2VzLnJlZC50ZWFtcywgJ29wcnMnKX19IC0ge3tnZXRBbGxpYW5jZVN1bShhbGxpYW5jZXMuYmx1ZS50ZWFtcywgJ29wcnMnKX19KVxuICA8YnI+XG4gIERQUjpcbiAge3sjaWYgZ2V0V2lubmVyKGFsbGlhbmNlcy5yZWQudGVhbXMsIGFsbGlhbmNlcy5ibHVlLnRlYW1zLCAnZHBycycpfX1cbiAgICA8c3BhbiBjbGFzcz1cInJlZFwiPlJlZDwvc3Bhbj5cbiAge3tlbHNlfX1cbiAgICA8c3BhbiBjbGFzcz1cImJsdWVcIj5CbHVlPC9zcGFuPlxuICB7ey9pZn19XG4gICh7e2dldEFsbGlhbmNlU3VtKGFsbGlhbmNlcy5yZWQudGVhbXMsICdkcHJzJyl9fSAtIHt7Z2V0QWxsaWFuY2VTdW0oYWxsaWFuY2VzLmJsdWUudGVhbXMsICdkcHJzJyl9fSlcbiAgPGJyPlxuICBDQ1dNOlxuICB7eyNpZiBnZXRXaW5uZXIoYWxsaWFuY2VzLnJlZC50ZWFtcywgYWxsaWFuY2VzLmJsdWUudGVhbXMsICdjY3dtcycpfX1cbiAgICA8c3BhbiBjbGFzcz1cInJlZFwiPlJlZDwvc3Bhbj5cbiAge3tlbHNlfX1cbiAgICA8c3BhbiBjbGFzcz1cImJsdWVcIj5CbHVlPC9zcGFuPlxuICB7ey9pZn19XG4gICh7e2dldEFsbGlhbmNlU3VtKGFsbGlhbmNlcy5yZWQudGVhbXMsICdjY3dtcycpfX0gLSB7e2dldEFsbGlhbmNlU3VtKGFsbGlhbmNlcy5ibHVlLnRlYW1zLCAnY2N3bXMnKX19KVxue3svaWZ9fSovXG4iLCJpbXBvcnQgJy4uL2xpYi9lczYtcHJvbWlzZS5taW4uanMnXG5pbXBvcnQgVGVtcGxhdGVzIGZyb20gXCIuLi9UZW1wbGF0ZXNcIlxuaW1wb3J0IExvZ2luQ2hlY2sgZnJvbSBcIi4uL0xvZ2luQ2hlY2tcIlxuXG5leHBvcnQgZnVuY3Rpb24gZXZlbnRzKGtleSkge1xuICBQcm9taXNlLmFsbChbXG4gICAgTG9naW5DaGVjay5nZXQoKSxcbiAgICBUZW1wbGF0ZXMuZ2V0KFwiZXZlbnRzXCIpLFxuICBdKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgIGNvbnN0IFssIHRlbXBsYXRlXSA9IHJlcztcbiAgICBjb25zdCByYWN0aXZlID0gbmV3IFJhY3RpdmUoe1xuICAgICAgdGVtcGxhdGU6IHRlbXBsYXRlLFxuICAgICAgZGF0YToge1xuICAgICAgICBldmVudHM6IHtcbiAgICAgICAgICBcIjIwMTZhcmNcIjogXCJBcmNoaW1lZGVzXCIsXG4gICAgICAgICAgXCIyMDE2Y2Fyc1wiOiBcIkNhcnNvblwiLFxuICAgICAgICAgIFwiMjAxNmNhcnZcIjogXCJDYXJ2ZXJcIixcbiAgICAgICAgICBcIjIwMTZjdXJcIjogXCJDdXJpZVwiLFxuICAgICAgICAgIFwiMjAxNmdhbFwiOiBcIkdhbGlsZW9cIixcbiAgICAgICAgICBcIjIwMTZob3BcIjogXCJIb3BwZXJcIixcbiAgICAgICAgICBcIjIwMTZuZXdcIjogXCJOZXd0b25cIixcbiAgICAgICAgICBcIjIwMTZ0ZXNcIjogXCJUZXNsYVwiLFxuICAgICAgICAgIFwiMjAxNmNtcFwiOiBcIkVpbnN0ZWluXCIsXG4gICAgICAgIH0sXG4gICAgICAgIG1vYmlsZTogJCh3aW5kb3cpLndpZHRoKCkgPCA5MDAsXG4gICAgICAgIHRva2VuOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9rZW4nKSxcbiAgICAgICAgdXNlcjoge1xuICAgICAgICAgIG5hbWU6IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1c2VyLm5hbWUnKSB8fCAnJyxcbiAgICAgICAgICB0ZWFtOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlci50ZWFtJykgfHwgJydcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGNvbXB1dGVkOiB7XG4gICAgICAgIG1vYmlsZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgcmV0dXJuICQod2luZG93KS53aWR0aCgpIDwgOTAwO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0pO1xuICB9KTtcbn1cbiIsImltcG9ydCAnLi4vbGliL2VzNi1wcm9taXNlLm1pbi5qcydcbmltcG9ydCBUZW1wbGF0ZXMgZnJvbSBcIi4uL1RlbXBsYXRlc1wiXG5pbXBvcnQgTG9naW5DaGVjayBmcm9tIFwiLi4vTG9naW5DaGVja1wiXG5pbXBvcnQge1xuICBnZXRKU09OLFxuICByb3VuZFxufSBmcm9tIFwiLi4vaGVscGVyc1wiXG5pbXBvcnQgQVBJLCB7XG4gIGdldFRlYW1TdGF0cyxcbiAgZ2VuZXJhdGVUb2tlblxufSBmcm9tIFwiLi4vQVBJXCJcblxuZXhwb3J0IGZ1bmN0aW9uIGxvZ2luKCkge1xuICBQcm9taXNlLmFsbChbXG4gICAgVGVtcGxhdGVzLmdldChcImxvZ2luXCIpXG4gIF0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgY29uc3QgW3RlbXBsYXRlXSA9IHJlcztcbiAgICBpZiAobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuJykpIHtcbiAgICAgIGxvY2F0aW9uLmhhc2ggPSBcIiMvYS9ldmVudHNcIlxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCByYWN0aXZlID0gbmV3IFJhY3RpdmUoe1xuICAgICAgICB0ZW1wbGF0ZTogdGVtcGxhdGUsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICBtb2JpbGU6ICQod2luZG93KS53aWR0aCgpIDwgOTAwLFxuICAgICAgICAgIHRva2VuOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9rZW4nKSxcbiAgICAgICAgICB1c2VyOiB7XG4gICAgICAgICAgICBuYW1lOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlci5uYW1lJykgfHwgJycsXG4gICAgICAgICAgICB0ZWFtOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlci50ZWFtJykgfHwgJydcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICB9KTtcbiAgICAgIHJhY3RpdmUub24oJ2xvZ2luJywgZnVuY3Rpb24obm9kZSkge1xuICAgICAgICB2YXIgbmFtZSA9IHRoaXMuZ2V0KFwidXNlci5uYW1lXCIpO1xuICAgICAgICB2YXIgdGVhbSA9IHRoaXMuZ2V0KFwidXNlci50ZWFtXCIpO1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInVzZXIubmFtZVwiLCBuYW1lKTtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ1c2VyLnRlYW1cIiwgdGVhbSk7XG4gICAgICAgIHZhciB0b2tlbiA9IGdlbmVyYXRlVG9rZW4odGVhbSwgbmFtZSk7XG4gICAgICAgIGxvY2F0aW9uLmhhc2ggPSBcIiMvYS9ldmVudHNcIjtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfSk7XG4gICAgfVxuICB9KS5jYXRjaChjb25zb2xlLmVycm9yLmJpbmQoY29uc29sZSkpO1xufVxuIiwiaW1wb3J0ICcuLi9saWIvZXM2LXByb21pc2UubWluLmpzJ1xuaW1wb3J0IFRlbXBsYXRlcyBmcm9tIFwiLi4vVGVtcGxhdGVzXCJcbmltcG9ydCBMb2dpbkNoZWNrIGZyb20gXCIuLi9Mb2dpbkNoZWNrXCJcbmltcG9ydCB7IGdldEpTT04sIHJvdW5kIH0gZnJvbSBcIi4uL2hlbHBlcnNcIlxuaW1wb3J0IEFQSSwgeyBnZXRUZWFtU3RhdHMgfSBmcm9tIFwiLi4vQVBJXCJcblxuZXhwb3J0IGZ1bmN0aW9uIHRlYW0oa2V5KSB7XG4gIFByb21pc2UuYWxsKFtcbiAgICBMb2dpbkNoZWNrLmdldCgpLFxuICAgIFRlbXBsYXRlcy5nZXQoXCJ0ZWFtXCIpLFxuICAgIGdldEpTT04oXCJzdGF0cy1jb25maWcuanNvblwiKSxcbiAgICBnZXRUZWFtU3RhdHMoQVBJLCBrZXkpLFxuICBdKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgIGNvbnN0IFssIHRlbXBsYXRlLCBzdGF0cywgdGVhbURhdGFdID0gcmVzO1xuICAgIGNvbnN0IHJhY3RpdmUgPSBuZXcgUmFjdGl2ZSh7XG4gICAgICB0ZW1wbGF0ZTogdGVtcGxhdGUsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIHN0YXRzOiBzdGF0cyxcbiAgICAgICAgc3RhdEtleXM6IFsnY2FsY3MnLCAnZ29hbHMnLCAnZGVmZW5zZXMnLCAndG93ZXInXSxcbiAgICAgICAga2V5OiBrZXksXG4gICAgICAgIHRlYW06IHRlYW1EYXRhLFxuICAgICAgICByb3VuZDogcm91bmQsXG4gICAgICAgIG1vYmlsZTogJCh3aW5kb3cpLndpZHRoKCkgPCA5MDAsXG4gICAgICAgIHRva2VuOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9rZW4nKSxcbiAgICAgICAgdXNlcjoge1xuICAgICAgICAgIG5hbWU6IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1c2VyLm5hbWUnKSB8fCAnJyxcbiAgICAgICAgICB0ZWFtOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlci50ZWFtJykgfHwgJycsXG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIH0pO1xuICB9KS5jYXRjaChjb25zb2xlLmVycm9yLmJpbmQoY29uc29sZSkpO1xufVxuIl19
