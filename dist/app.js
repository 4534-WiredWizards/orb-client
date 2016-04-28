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
      ccwms: [],
      orb: []
    };
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
        loading: 2 });
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
          }) });
        ractive.get("matches").forEach(function (match) {
          var red = match.alliances.red,
              blue = match.alliances.blue;
          var winner = red.score > blue.score;
          var orbPred = match.predictions[0] > match.predictions[1];
          predictionsCounts.orb.push(orbPred == winner);
        });
        console.log(predictionsCounts.orb);
        console.log("ORB", predictionsCounts.orb.filter(Boolean).length / predictionsCounts.orb.length);
        console.log("OPR", predictionsCounts.oprs.filter(Boolean).length / predictionsCounts.oprs.length);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9kYW5pZWwvRG9jdW1lbnRzL3Byb2plY3RzL29yYi1jbGllbnQvc3JjL21haW4uanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiL2hvbWUvZGFuaWVsL0RvY3VtZW50cy9wcm9qZWN0cy9vcmItY2xpZW50L3NyYy9BUEkuanMiLCIvaG9tZS9kYW5pZWwvRG9jdW1lbnRzL3Byb2plY3RzL29yYi1jbGllbnQvc3JjL0NvbXBvbmVudHMuanMiLCIvaG9tZS9kYW5pZWwvRG9jdW1lbnRzL3Byb2plY3RzL29yYi1jbGllbnQvc3JjL0xvZ2luQ2hlY2suanMiLCIvaG9tZS9kYW5pZWwvRG9jdW1lbnRzL3Byb2plY3RzL29yYi1jbGllbnQvc3JjL1BhZ2VzLmpzIiwiL2hvbWUvZGFuaWVsL0RvY3VtZW50cy9wcm9qZWN0cy9vcmItY2xpZW50L3NyYy9UZW1wbGF0ZXMuanMiLCIvaG9tZS9kYW5pZWwvRG9jdW1lbnRzL3Byb2plY3RzL29yYi1jbGllbnQvc3JjL2NhY2hlYWJsZS5qcyIsIi9ob21lL2RhbmllbC9Eb2N1bWVudHMvcHJvamVjdHMvb3JiLWNsaWVudC9zcmMvaGVscGVycy5qcyIsInNyYy9saWIvZXM2LXByb21pc2UubWluLmpzIiwiL2hvbWUvZGFuaWVsL0RvY3VtZW50cy9wcm9qZWN0cy9vcmItY2xpZW50L3NyYy9wYWdlcy9ldmVudC5qcyIsIi9ob21lL2RhbmllbC9Eb2N1bWVudHMvcHJvamVjdHMvb3JiLWNsaWVudC9zcmMvcGFnZXMvZXZlbnRNYXRjaGVzLmpzIiwiL2hvbWUvZGFuaWVsL0RvY3VtZW50cy9wcm9qZWN0cy9vcmItY2xpZW50L3NyYy9wYWdlcy9ldmVudHMuanMiLCIvaG9tZS9kYW5pZWwvRG9jdW1lbnRzL3Byb2plY3RzL29yYi1jbGllbnQvc3JjL3BhZ2VzL2xvZ2luLmpzIiwiL2hvbWUvZGFuaWVsL0RvY3VtZW50cy9wcm9q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QztLQUNaO0dBQ0YsQ0FBQyxDQUFDO0NBQ0o7O0FBRU0sU0FBUyxNQUFNLEdBQUc7QUFDdkIsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzVCLE9BQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFO0FBQ3hDLFNBQUksSUFBSSxHQUFHLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFO0FBQzNCLFlBQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7S0FDakM7R0FDRjtBQUNELFNBQU8sTUFBTSxDQUFDO0NBQ2Y7OztBQzFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwT0EsWUFBWSxDQUFDOztBQUViLElBQUksZUFBZSxHQUFHLFNBQUEsZUFBQSxDQUFVLEdBQUcsRUFBRTtBQUFFLFNBQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxVQUFVLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEdBQUcsQ0FBQztDQUFFLENBQUM7O0FBRTlGLElBQUksY0FBYyxHQUFHLFNBQUEsY0FBQSxDQUFVLEdBQUcsRUFBRSxDQUFDLEVBQUU7QUFBRSxNQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7QUFBRSxXQUFPLEdBQUcsQ0FBQztHQUFFLE1BQU0sSUFBSSxNQUFNLENBQUMsUUFBUSxJQUFJLE1BQU0sQ0FBQyxHQUFH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Q0osYUFBSyxFQUFFLEtBQUs7QUFDWixnQkFBUSxFQUFFLENBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsT0FBTyxDQUFDO0FBQ2pELFdBQUcsRUFBRSxHQUFHO0FBQ1IsWUFBSSxFQUFFLFFBQVE7QUFDZCxhQUFLLEVBQUUsS0FBSztBQUNaLGNBQU0sRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxFQUFFLEdBQUcsR0FBRztBQUMvQixhQUFLLEVBQUUsWUFBWSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUM7QUFDcEMsWUFBSSxFQUFFO0FBQ0osY0FBSSxFQUFFLFlBQVksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRTtBQUM3QyxjQUFJLEVBQUUsWUFBWSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsSUFBSSxFQUFFLEVBQzlDLEVBQ0YsRUFDRixDQUFDLENBQUM7R0FDSixDQUFDLENBQUEsT0FBQSxDQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztDQUN2QyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgKiBhcyBQYWdlcyBmcm9tICcuL1BhZ2VzJ1xuaW1wb3J0IENvbXBvbmVudHMgZnJvbSAnLi9Db21wb25lbnRzJ1xuaW1wb3J0IHtcbiAgZG9jdW1lbnRSZWFkeVxufSBmcm9tICcuL2hlbHBlcnMnXG5pbXBvcnQgJy4vbGliL2VzNi1wcm9taXNlLm1pbi5qcydcblxuY29uc3QgZWwgPSBcIiNtYWluXCI7XG5cbmNvbnN0IHJvdXRlciA9IFJvdXRlcih7XG4gIFwiL2xvZ2luXCI6IFBhZ2VzLmxvZ2luLFxuICBcIi9hXCI6IHtcbiAgICBcIi90ZWFtLzprZXlcIjogUGFnZXMudGVhbSxcbiAgICBcIi9tYXRjaC86a2V5XCI6IFBhZ2VzLm1hdGNoLFxuICAgIFwiL2V2ZW50LzprZXlcIjogUGFnZXMuZXZlbnQsXG4gICAgXCIvbWF0Y2hlcy86a2V5XCI6IFBhZ2VzLmV2ZW50TWF0Y2hlcyxcbiAgICBcIi9ldmVudHNcIjogUGFnZXMuZXZlbnRzXG4gIH1cbn0pLmNvbmZpZ3VyZSh7XG4gIGh0bWw1aGlzdG9yeTogZmFsc2UsXG4gIGJlZm9yZTogW10sXG4gIGFmdGVyOiBbXSxcbiAgcmVjdXJzZTogJ2ZvcndhcmQnLFxufSk7XG5cblByb21pc2UuYWxsKFtkb2N1bWVudFJlYWR5LCBDb21wb25lbnRzLmxvYWQoKV0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gIGNvbnN0IFssIENvbXBvbmVudHNdID0gcmVzO1xuICBSYWN0aXZlID0gUmFjdGl2ZS5leHRlbmQoe1xuICAgIGVsOiBlbCxcbiAgICBjb21wb25lbnRzOiBDb21wb25lbnRzLmNvbXBvbmVudHMsXG4gICAgYmVmb3JlOiBbZnVuY3Rpb24oKSB7XG4gICAgICAkKHdpbmRvdykuc2Nyb2xsVG9wKDApO1xuICAgIH1dLFxuICB9KTtcbiAgcm91dGVyLmluaXQoKTtcbiAgaWYgKCFyb3V0ZXIuZ2V0Um91dGUoKS5maWx0ZXIoQm9vbGVhbikubGVuZ3RoKSB7XG4gICAgaWYgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpKSB7XG4gICAgICByb3V0ZXIuc2V0Um91dGUoXCIvYS9ldmVudHNcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJvdXRlci5zZXRSb3V0ZShcIi9sb2dpblwiKTtcbiAgICB9XG4gIH1cblxuICAkKFwiLm5hdmJhclwiKS5vbihcImNsaWNrXCIsIFwiYVtocmVmXVtocmVmIT0nIyddXCIsIGZ1bmN0aW9uKCkge1xuICAgIGlmICgkKCcuY29sbGFwc2UuaW4nKS5sZW5ndGggPiAwKSB7XG4gICAgICAkKCcubmF2YmFyLXRvZ2dsZScpLmNsaWNrKCk7XG4gICAgfVxuICB9KTtcblxuICBjb25zdCAkb3ZlcmxheSA9ICQoXCI8ZGl2PlwiLCB7XG4gICAgY2xhc3M6IFwib3ZlcmxheVwiLFxuICAgIGNzczoge1xuICAgICAgXCJkaXNwbGF5XCI6IFwibm9uZVwiXG4gICAgfSxcbiAgICBjbGljaygpIHtcbiAgICAgIGlmICgkKCcuY29sbGFwc2UuaW4nKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICQoJy5uYXZiYXItdG9nZ2xlJykuY2xpY2soKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gICRvdmVybGF5LnByZXBlbmRUbyhcImh0bWxcIik7XG5cbiAgJCgnLm5hdmJhci10b2dnbGUnKS5jbGljayhmdW5jdGlvbigpIHtcbiAgICBpZiAoJCgnLmNvbGxhcHNlLmluJykubGVuZ3RoID4gMCkge1xuICAgICAgJG92ZXJsYXkuaGlkZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkb3ZlcmxheS5zaG93KCk7XG4gICAgfVxuICB9KTtcblxufSk7XG4iLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xuXG5wcm9jZXNzLm5leHRUaWNrID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FuU2V0SW1tZWRpYXRlID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuc2V0SW1tZWRpYXRlO1xuICAgIHZhciBjYW5NdXRhdGlvbk9ic2VydmVyID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCdcbiAgICAmJiB3aW5kb3cuTXV0YXRpb25PYnNlcnZlcjtcbiAgICB2YXIgY2FuUG9zdCA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnBvc3RNZXNzYWdlICYmIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyXG4gICAgO1xuXG4gICAgaWYgKGNhblNldEltbWVkaWF0ZSkge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKGYpIHsgcmV0dXJuIHdpbmRvdy5zZXRJbW1lZGlhdGUoZikgfTtcbiAgICB9XG5cbiAgICB2YXIgcXVldWUgPSBbXTtcblxuICAgIGlmIChjYW5NdXRhdGlvbk9ic2VydmVyKSB7XG4gICAgICAgIHZhciBoaWRkZW5EaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICB2YXIgb2JzZXJ2ZXIgPSBuZXcgTXV0YXRpb25PYnNlcnZlcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgcXVldWVMaXN0ID0gcXVldWUuc2xpY2UoKTtcbiAgICAgICAgICAgIHF1ZXVlLmxlbmd0aCA9IDA7XG4gICAgICAgICAgICBxdWV1ZUxpc3QuZm9yRWFjaChmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIG9ic2VydmVyLm9ic2VydmUoaGlkZGVuRGl2LCB7IGF0dHJpYnV0ZXM6IHRydWUgfSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBpZiAoIXF1ZXVlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGhpZGRlbkRpdi5zZXRBdHRyaWJ1dGUoJ3llcycsICdubycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ21lc3NhZ2UnLCBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBldi5zb3VyY2U7XG4gICAgICAgICAgICBpZiAoKHNvdXJjZSA9PT0gd2luZG93IHx8IHNvdXJjZSA9PT0gbnVsbCkgJiYgZXYuZGF0YSA9PT0gJ3Byb2Nlc3MtdGljaycpIHtcbiAgICAgICAgICAgICAgICBldi5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZm4gPSBxdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSwgdHJ1ZSk7XG5cbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgICAgICBxdWV1ZS5wdXNoKGZuKTtcbiAgICAgICAgICAgIHdpbmRvdy5wb3N0TWVzc2FnZSgncHJvY2Vzcy10aWNrJywgJyonKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24gbmV4dFRpY2soZm4pIHtcbiAgICAgICAgc2V0VGltZW91dChmbiwgMCk7XG4gICAgfTtcbn0pKCk7XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuIiwiaW1wb3J0ICcuL2xpYi9lczYtcHJvbWlzZS5taW4uanMnXG5pbXBvcnQgY2FjaGVhYmxlIGZyb20gJy4vY2FjaGVhYmxlJ1xuaW1wb3J0IHsgZXh0ZW5kIH0gZnJvbSAnLi9oZWxwZXJzJ1xuXG5leHBvcnQgZGVmYXVsdCBjYWNoZWFibGUoZnVuY3Rpb24oa2V5KSB7XG4gIGNvbnN0IGtleSA9IGtleS5yZXBsYWNlKC9eXFwvLywgXCJcIikucmVwbGFjZSgvXFwvJC8sIFwiXCIpO1xuICBsZXQgdXJsID0gXCJodHRwOi8vb3JiLnNjb3V0ZnJjLmlvL1wiK2tleTtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgbWV0aG9kOiBcImdldFwiLFxuICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxuICAgICAgZGF0YToge1xuICAgICAgICB0b2tlbjogbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJ0b2tlblwiKSxcbiAgICAgIH0sXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGVycm9yOiByZWplY3QsXG4gICAgfSkudGhlbihyZXNvbHZlKTtcbiAgfSkuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkFQSSBSZXF1ZXN0IFVuc3VjY2Vzc2Z1bFwiLCB1cmwsIHJlcyk7XG4gICAgcmV0dXJuIHJlcztcbiAgfSk7XG59KTtcblxuZXhwb3J0IGxldCBUQkEgPSBjYWNoZWFibGUoZnVuY3Rpb24ocGF0aCkge1xuICBjb25zdCB1cmwgPSBcImh0dHA6Ly93d3cudGhlYmx1ZWFsbGlhbmNlLmNvbS9hcGkvdjIvXCIgKyBwYXRoO1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgcmV0dXJuICQuYWpheCh7XG4gICAgICBtZXRob2Q6IFwiZ2V0XCIsXG4gICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICBkYXRhOiB7XG4gICAgICAgICdYLVRCQS1BcHAtSWQnOiBcImZyYzQ1MzQ6b3JiOmNsaWVudFwiXG4gICAgICB9LFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBlcnJvcjogcmVqZWN0XG4gICAgfSkudGhlbihyZXNvbHZlKTtcbiAgfSkuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkFQSSBSZXF1ZXN0IFVuc3VjY2Vzc2Z1bFwiLCB1cmwsIHJlcyk7XG4gICAgcmV0dXJuIHJlcztcbiAgfSk7XG59KTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldFRlYW1TdGF0cyhBUEksIGtleSwgdGVhbSkge1xuICBsZXQgcHJvbWlzZXMgPSBbXTtcbiAgaWYgKHR5cGVvZiB0ZWFtID09IFwib2JqZWN0XCIgJiYgdGVhbS50ZWFtX251bWJlciA9PSBrZXkpIHtcbiAgICBwcm9taXNlcy5wdXNoKG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHJlc29sdmUodGVhbSkpKVxuICB9IGVsc2Uge1xuICAgIHByb21pc2VzLnB1c2goQVBJLmdldChcInRlYW0vXCIra2V5KSk7XG4gIH1cbiAgaWYgKHR5cGVvZiB0ZWFtID09IFwib2JqZWN0XCIgJiYgdHlwZW9mIHRlYW0uc3RhdHMgPT0gXCJvYmplY3RcIikge1xuICAgIHByb21pc2VzLnB1c2gobmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4gcmVzb2x2ZSh0ZWFtLnN0YXRzLnNjb3JlKSkpO1xuICAgIHByb21pc2VzLnB1c2gobmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4gcmVzb2x2ZSh0ZWFtLnN0YXRzLmRlZmVuc2VzKSkpO1xuICAgIHByb21pc2VzLnB1c2gobmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4gcmVzb2x2ZSh0ZWFtLnN0YXRzLmdvYWxzKSkpO1xuICAgIHByb21pc2VzLnB1c2gobmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4gcmVzb2x2ZSh0ZWFtLnN0YXRzLnNjYWxlKSkpO1xuICAgIHByb21pc2VzLnB1c2gobmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4gcmVzb2x2ZSh0ZWFtLnN0YXRzLmNoYWxsZW5nZSkpKTtcbiAgfSBlbHNlIHtcbiAgICBwcm9taXNlcy5wdXNoKEFQSS5nZXQoXCJ0ZWFtL1wiK2tleStcIi9zY29yZVwiKSk7XG4gICAgcHJvbWlzZXMucHVzaChBUEkuZ2V0KFwidGVhbS9cIitrZXkrXCIvZGVmZW5zZVwiKSk7XG4gICAgcHJvbWlzZXMucHVzaChBUEkuZ2V0KFwidGVhbS9cIitrZXkrXCIvZ29hbHNcIikpO1xuICAgIHByb21pc2VzLnB1c2goQVBJLmdldChcInRlYW0vXCIra2V5K1wiL3NjYWxlXCIpKTtcbiAgICBwcm9taXNlcy5wdXNoKEFQSS5nZXQoXCJ0ZWFtL1wiK2tleStcIi9jaGFsbGVuZ2VcIikpO1xuICB9XG4gIHJldHVybiBQcm9taXNlLmFsbChwcm9taXNlcykudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICBsZXQgW3RlYW0sIHNjb3JlLCBkZWZlbnNlcywgZ29hbHMsIHNjYWxlLCBjaGFsbGVuZ2VdID0gcmVzO1xuICAgIHJldHVybiBleHRlbmQodGVhbSwge1xuICAgICAgc3RhdHM6IHtcbiAgICAgICAgY2FsY3M6IHtcbiAgICAgICAgICBzY29yZTogc2NvcmVcbiAgICAgICAgfSxcbiAgICAgICAgZGVmZW5zZXM6IHtcbiAgICAgICAgICBsb3dfYmFyOiBkZWZlbnNlc1swXSxcbiAgICAgICAgICBwb3J0Y3VsbGlzOiBkZWZlbnNlc1sxXSxcbiAgICAgICAgICBjaGV2YWxfZGVfZnJpc2U6IGRlZmVuc2VzWzJdLFxuICAgICAgICAgIG1vYXQ6IGRlZmVuc2VzWzNdLFxuICAgICAgICAgIHJhbXBhcnRzOiBkZWZlbnNlc1s0XSxcbiAgICAgICAgICBkcmF3YnJpZGdlOiBkZWZlbnNlc1s1XSxcbiAgICAgICAgICBzYWxseV9wb3J0OiBkZWZlbnNlc1s2XSxcbiAgICAgICAgICByb2NrX3dhbGw6IGRlZmVuc2VzWzddLFxuICAgICAgICAgIHJvdWdoX3RlcnJhaW46IGRlZmVuc2VzWzhdLFxuICAgICAgICB9LFxuICAgICAgICBnb2Fsczoge1xuICAgICAgICAgIGF1dG9fbG93OiBnb2Fsc1swXSxcbiAgICAgICAgICBhdXRvX2hpZ2g6IGdvYWxzWzFdLFxuICAgICAgICAgIHRlbGVvcF9sb3c6IGdvYWxzWzJdLFxuICAgICAgICAgIHRlbGVvcF9oaWdoOiBnb2Fsc1szXSxcbiAgICAgICAgfSxcbiAgICAgICAgdG93ZXI6IHtcbiAgICAgICAgICBzY2FsZTogc2NhbGVbMF0sXG4gICAgICAgICAgY2hhbGxlbmdlOiBjaGFsbGVuZ2VbMF1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFRlYW1zKEFQSSwga2V5KSB7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICByZXNvbHZlKEFQSS5nZXQoXCJsaXN0L1wiK2tleSkpO1xuICB9KS50aGVuKGZ1bmN0aW9uKHRlYW1zKSB7XG4gICAgcmV0dXJuIFByb21pc2UuYWxsKHRlYW1zLm1hcCh0ZWFtID0+IGdldFRlYW1TdGF0cyhBUEksIHRlYW0udGVhbV9udW1iZXIsIHRlYW0pKSk7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVUb2tlbih0ZWFtLG5hbWUpIHtcbiAgdmFyIHRva2VuID0gdGVhbSArIFwiLlwiICsgbWQ1KG5hbWUpO1xuICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInRva2VuXCIsdG9rZW4pO1xuICByZXR1cm4gdG9rZW47XG59XG4iLCJpbXBvcnQgJy4vbGliL2VzNi1wcm9taXNlLm1pbi5qcydcbmltcG9ydCBUZW1wbGF0ZXMgZnJvbSAnLi9UZW1wbGF0ZXMnXG5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgdGVtcGxhdGVzOiB7fSxcbiAgY29tcG9uZW50czoge30sXG4gIGNyZWF0ZTogZnVuY3Rpb24oZG9uZSkge1xuICAgIHRoaXMuY29tcG9uZW50cy5Qcm9ncmVzcyA9IFJhY3RpdmUuZXh0ZW5kKHtcbiAgICAgICBpc29sYXRlZDogZmFsc2UsXG4gICAgICAgdGVtcGxhdGU6IHRoaXMudGVtcGxhdGVzLnByb2dyZXNzLFxuICAgICAgIG9uaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgICBjb25zdCBzdGF0ID0gdGhpcy5nZXQoXCJzdGF0XCIpO1xuICAgICAgICAgY29uc3QgdmFsdWUgPSB0aGlzLmdldChcInZhbHVlXCIpO1xuICAgICAgICAgbGV0IHByb2dyZXNzQ2xhc3M7XG4gICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgc3RhdC5wcm9ncmVzcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICBpZiAoKCFzdGF0LnByb2dyZXNzW2ldLm1pbiB8fCB2YWx1ZSA+PSBzdGF0LnByb2dyZXNzW2ldLm1pbikgJiYgKCFzdGF0LnByb2dyZXNzW2ldLm1heCB8fCB2YWx1ZSA8PSBzdGF0LnByb2dyZXNzW2ldLm1heCkpIHtcbiAgICAgICAgICAgICBwcm9ncmVzc0NsYXNzID0gc3RhdC5wcm9ncmVzc1tpXS5jbGFzcztcbiAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgfVxuICAgICAgICAgfVxuICAgICAgICAgdGhpcy5zZXQoe1xuICAgICAgICAgICBtaW46IHN0YXQubWluLFxuICAgICAgICAgICBtYXg6IHN0YXQubWF4LFxuICAgICAgICAgICB3aWR0aDogKHN0YXQubWluICsgdmFsdWUpL3N0YXQubWF4ICogMTAwLFxuICAgICAgICAgICBwcm9ncmVzc0NsYXNzOiBwcm9ncmVzc0NsYXNzLFxuICAgICAgICAgfSlcbiAgICAgICB9LFxuXG4gICAgfSk7XG4gIH0sXG4gIGxvYWQ6IGZ1bmN0aW9uKGRvbmUpIHtcbiAgICBjb25zdCBfdGhpcyA9IHRoaXM7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgVGVtcGxhdGVzLmdldChcImNvbXBvbmVudHNcIikudGhlbihmdW5jdGlvbih0ZW1wbGF0ZXMpIHtcbiAgICAgICAgJChcIjxkaXY+XCIpLmh0bWwodGVtcGxhdGVzKS5maW5kKFwic2NyaXB0LnRlbXBsYXRlXCIpLmVhY2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgY29uc3QgJHRoaXMgPSAkKHRoaXMpO1xuICAgICAgICAgIF90aGlzLnRlbXBsYXRlc1skdGhpcy5hdHRyKFwibmFtZVwiKV0gPSAkdGhpcy5odG1sKCkudHJpbSgpO1xuICAgICAgICB9KTtcbiAgICAgICAgX3RoaXMuY3JlYXRlKCk7XG4gICAgICAgIHJlc29sdmUoX3RoaXMpO1xuICAgICAgfSkuY2F0Y2gocmVqZWN0KTtcbiAgICB9KTtcbiAgfSxcbn07XG4iLCJpbXBvcnQgJy4vbGliL2VzNi1wcm9taXNlLm1pbi5qcydcbmltcG9ydCBjYWNoZWFibGUgZnJvbSAnLi9jYWNoZWFibGUnXG5cbmV4cG9ydCBkZWZhdWx0IGNhY2hlYWJsZShmdW5jdGlvbigpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgIGlmKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwidG9rZW5cIikpIHtcbiAgICAgIHJlc29sdmUoMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvY2F0aW9uLmhhc2ggPSBcIiMvbG9naW5cIlxuICAgICAgcmVqZWN0KCk7XG4gICAgfVxuICB9KTtcbn0pO1xuIiwiZXhwb3J0ICogZnJvbSAnLi9wYWdlcy90ZWFtJ1xuZXhwb3J0ICogZnJvbSAnLi9wYWdlcy9ldmVudCdcbmV4cG9ydCAqIGZyb20gJy4vcGFnZXMvbG9naW4nXG5leHBvcnQgKiBmcm9tICcuL3BhZ2VzL2V2ZW50cydcbmV4cG9ydCAqIGZyb20gJy4vcGFnZXMvZXZlbnRNYXRjaGVzJ1xuIiwiaW1wb3J0ICcuL2xpYi9lczYtcHJvbWlzZS5taW4uanMnXG5pbXBvcnQgY2FjaGVhYmxlIGZyb20gJy4vY2FjaGVhYmxlJ1xuXG5leHBvcnQgZGVmYXVsdCBjYWNoZWFibGUoZnVuY3Rpb24oa2V5KSB7XG4gIGNvbnN0IHVybCA9IFwidGVtcGxhdGVzL1wiK2tleStcIi5odG1sXCI7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICByZXR1cm4gJC5hamF4KHtcbiAgICAgIG1ldGhvZDogXCJnZXRcIixcbiAgICAgIHVybDogdXJsLFxuICAgICAgZXJyb3I6IHJlamVjdFxuICAgIH0pLnRoZW4ocmVzb2x2ZSk7XG4gIH0pLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgIGNvbnNvbGUuZXJyb3IoXCJUZW1wbGF0ZSBSZXF1ZXN0IFVuc3VjY2Vzc2Z1bFwiLCB1cmwsIHJlcyk7XG4gICAgcmV0dXJuIHJlcztcbiAgfSk7XG59KTtcbiIsImltcG9ydCAnLi9saWIvZXM2LXByb21pc2UubWluLmpzJ1xuaW1wb3J0IGNhY2hlYWJsZSBmcm9tICcuL2NhY2hlYWJsZSdcblxuZXhwb3J0IGRlZmF1bHQgZnVuY3Rpb24gY2FjaGVhYmxlKGdldFByb21pc2UpIHtcbiAgY29uc3QgX2NhY2hlID0ge307XG5cbiAgZnVuY3Rpb24gc2V0KGtleSwgdmFsdWUpIHtcbiAgICByZXR1cm4gX2NhY2hlW2tleV0gPSB2YWx1ZTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgZ2V0KGtleSwgY2FsbGJhY2spIHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgaWYgKF9jYWNoZVtrZXldKSB7XG4gICAgICAgICAgcmV0dXJuIHJlc29sdmUoX2NhY2hlW2tleV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2V0UHJvbWlzZShrZXkpXG4gICAgICAgICAgLnRoZW4odmFsdWUgPT4gc2V0KGtleSwgdmFsdWUpKVxuICAgICAgICAgIC50aGVuKHJlc29sdmUpXG4gICAgICAgICAgLmNhdGNoKHJlamVjdCk7XG5cbiAgICAgIH0pLnRoZW4oY2FsbGJhY2spO1xuICAgIH0sXG4gIH1cbn1cbiIsImltcG9ydCAnLi9saWIvZXM2LXByb21pc2UubWluLmpzJ1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SlNPTih1cmwpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAkLmFqYXgoe1xuICAgICAgbWV0aG9kOiBcImdldFwiLFxuICAgICAgZGF0YVR5cGU6IFwianNvblwiLFxuICAgICAgZGF0YToge30sXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGVycm9yOiByZWplY3RcbiAgICB9KS50aGVuKHJlc29sdmUpO1xuICB9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJvdW5kKG4sIGRpZ2l0cykge1xuICBjb25zdCBuID0gcGFyc2VGbG9hdChuKTtcbiAgY29uc3QgZGlnaXRzID0gcGFyc2VJbnQoZGlnaXRzKTtcbiAgY29uc3QgcGFydHMgPSAoTWF0aC5yb3VuZChuICogTWF0aC5wb3coMTAsIGRpZ2l0cykpL01hdGgucG93KDEwLCBkaWdpdHMpKS50b1N0cmluZygpLnNwbGl0KFwiLlwiKTtcbiAgaWYgKHBhcnRzLmxlbmd0aCA9PSAxKSB7XG4gICAgcGFydHMucHVzaChcIlwiKTtcbiAgfVxuICByZXR1cm4gcGFydHNbMF0gKyAoZGlnaXRzID8gXCIuXCIgOiBcIlwiKSArIHBhcnRzWzFdICsgQXJyYXkoTWF0aC5tYXgoMCwgZGlnaXRzIC0gcGFydHNbMV0ubGVuZ3RoICsgMSkpLmpvaW4oXCIwXCIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZG9jdW1lbnRSZWFkeSgpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgIGlmICgkLmlzUmVhZHkpIHtcbiAgICAgIHJlc29sdmUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJChyZXNvbHZlKTtcbiAgICB9XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZXh0ZW5kKCkge1xuICBjb25zdCByZXN1bHQgPSBhcmd1bWVudHNbMF07XG4gIGZvcihsZXQgaSA9IDE7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICBmb3IobGV0IGtleSBpbiBhcmd1bWVudHNbaV0pIHtcbiAgICAgIHJlc3VsdFtrZXldID0gYXJndW1lbnRzW2ldW2tleV07XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG4iLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsKXtcbi8qIVxuICogQG92ZXJ2aWV3IGVzNi1wcm9taXNlIC0gYSB0aW55IGltcGxlbWVudGF0aW9uIG9mIFByb21pc2VzL0ErLlxuICogQGNvcHlyaWdodCBDb3B5cmlnaHQgKGMpIDIwMTQgWWVodWRhIEthdHosIFRvbSBEYWxlLCBTdGVmYW4gUGVubmVyIGFuZCBjb250cmlidXRvcnMgKENvbnZlcnNpb24gdG8gRVM2IEFQSSBieSBKYWtlIEFyY2hpYmFsZClcbiAqIEBsaWNlbnNlICAgTGljZW5zZWQgdW5kZXIgTUlUIGxpY2Vuc2VcbiAqICAgICAgICAgICAgU2VlIGh0dHBzOi8vcmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbS9qYWtlYXJjaGliYWxkL2VzNi1wcm9taXNlL21hc3Rlci9MSUNFTlNFXG4gKiBAdmVyc2lvbiAgIDMuMi4xXG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbihmdW5jdGlvbiAoKSB7XG4gIFwidXNlIHN0cmljdFwiO2Z1bmN0aW9uIHQodCkge1xuICAgIHJldHVybiBcImZ1bmN0aW9uXCIgPT0gdHlwZW9mIHQgfHwgXCJvYmplY3RcIiA9PSB0eXBlb2YgdCAmJiBudWxsICE9PSB0O1xuICB9ZnVuY3Rpb24gZSh0KSB7XG4gICAgcmV0dXJuIFwiZnVuY3Rpb25cIiA9PSB0eXBlb2YgdDtcbiAgfWZ1bmN0aW9uIG4odCkge1xuICAgIEcgPSB0O1xuICB9ZnVuY3Rpb24gcih0KSB7XG4gICAgUSA9IHQ7XG4gIH1mdW5jdGlvbiBvKCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICBwcm9jZXNzLm5leHRUaWNrKGEpO1xuICAgIH07XG4gIH1mdW5jdGlvbiBpKCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICBCKGEpO1xuICAgIH07XG4gIH1mdW5jdGlvbiBzKCkge1xuICAgIHZhciB0ID0gMCxcbiAgICAgICAgZSA9IG5ldyBYKGEpLFxuICAgICAgICBuID0gZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJcIik7cmV0dXJuIChlLm9ic2VydmUobiwgeyBjaGFyYWN0ZXJEYXRhOiAhMCB9KSwgZnVuY3Rpb24gKCkge1xuICAgICAgbi5kYXRhID0gdCA9ICsrdCAlIDI7XG4gICAgfSk7XG4gIH1mdW5jdGlvbiB1KCkge1xuICAgIHZhciB0ID0gbmV3IE1lc3NhZ2VDaGFubmVsKCk7cmV0dXJuICh0LnBvcnQxLm9ubWVzc2FnZSA9IGEsIGZ1bmN0aW9uICgpIHtcbiAgICAgIHQucG9ydDIucG9zdE1lc3NhZ2UoMCk7XG4gICAgfSk7XG4gIH1mdW5jdGlvbiBjKCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICBzZXRUaW1lb3V0KGEsIDEpO1xuICAgIH07XG4gIH1mdW5jdGlvbiBhKCkge1xuICAgIGZvciAodmFyIHQgPSAwOyBKID4gdDsgdCArPSAyKSB7XG4gICAgICB2YXIgZSA9IHR0W3RdLFxuICAgICAgICAgIG4gPSB0dFt0ICsgMV07ZShuKSwgdHRbdF0gPSB2b2lkIDAsIHR0W3QgKyAxXSA9IHZvaWQgMDtcbiAgICB9SiA9IDA7XG4gIH1mdW5jdGlvbiBmKCkge1xuICAgIHRyeSB7XG4gICAgICB2YXIgdCA9IHJlcXVpcmUsXG4gICAgICAgICAgZSA9IHQoXCJ2ZXJ0eFwiKTtyZXR1cm4gKEIgPSBlLnJ1bk9uTG9vcCB8fCBlLnJ1bk9uQ29udGV4dCwgaSgpKTtcbiAgICB9IGNhdGNoIChuKSB7XG4gICAgICByZXR1cm4gYygpO1xuICAgIH1cbiAgfWZ1bmN0aW9uIGwodCwgZSkge1xuICAgIHZhciBuID0gdGhpcyxcbiAgICAgICAgciA9IG5ldyB0aGlzLmNvbnN0cnVjdG9yKHApO3ZvaWQgMCA9PT0gcltydF0gJiYgayhyKTt2YXIgbyA9IG4uX3N0YXRlO2lmIChvKSB7XG4gICAgICB2YXIgaSA9IGFyZ3VtZW50c1tvIC0gMV07UShmdW5jdGlvbiAoKSB7XG4gICAgICAgIHgobywgciwgaSwgbi5fcmVzdWx0KTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSBFKG4sIHIsIHQsIGUpO3JldHVybiByO1xuICB9ZnVuY3Rpb24gaCh0KSB7XG4gICAgdmFyIGUgPSB0aGlzO2lmICh0ICYmIFwib2JqZWN0XCIgPT0gdHlwZW9mIHQgJiYgdC5jb25zdHJ1Y3RvciA9PT0gZSkge1xuICAgICAgcmV0dXJuIHQ7XG4gICAgfXZhciBuID0gbmV3IGUocCk7cmV0dXJuIChnKG4sIHQpLCBuKTtcbiAgfWZ1bmN0aW9uIHAoKSB7fWZ1bmN0aW9uIF8oKSB7XG4gICAgcmV0dXJuIG5ldyBUeXBlRXJyb3IoXCJZb3UgY2Fubm90IHJlc29sdmUgYSBwcm9taXNlIHdpdGggaXRzZWxmXCIpO1xuICB9ZnVuY3Rpb24gZCgpIHtcbiAgICByZXR1cm4gbmV3IFR5cGVFcnJvcihcIkEgcHJvbWlzZXMgY2FsbGJhY2sgY2Fubm90IHJldHVybiB0aGF0IHNhbWUgcHJvbWlzZS5cIik7XG4gIH1mdW5jdGlvbiB2KHQpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHQudGhlbjtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICByZXR1cm4gKHV0LmVycm9yID0gZSwgdXQpO1xuICAgIH1cbiAgfWZ1bmN0aW9uIHkodCwgZSwgbiwgcikge1xuICAgIHRyeSB7XG4gICAgICB0LmNhbGwoZSwgbiwgcik7XG4gICAgfSBjYXRjaCAobykge1xuICAgICAgcmV0dXJuIG87XG4gICAgfVxuICB9ZnVuY3Rpb24gbSh0LCBlLCBuKSB7XG4gICAgUShmdW5jdGlvbiAodCkge1xuICAgICAgdmFyIHIgPSAhMSxcbiAgICAgICAgICBvID0geShuLCBlLCBmdW5jdGlvbiAobikge1xuICAgICAgICByIHx8IChyID0gITAsIGUgIT09IG4gPyBnKHQsIG4pIDogUyh0LCBuKSk7XG4gICAgICB9LCBmdW5jdGlvbiAoZSkge1xuICAgICAgICByIHx8IChyID0gITAsIGoodCwgZSkpO1xuICAgICAgfSwgXCJTZXR0bGU6IFwiICsgKHQuX2xhYmVsIHx8IFwiIHVua25vd24gcHJvbWlzZVwiKSk7IXIgJiYgbyAmJiAociA9ICEwLCBqKHQsIG8pKTtcbiAgICB9LCB0KTtcbiAgfWZ1bmN0aW9uIGIodCwgZSkge1xuICAgIGUuX3N0YXRlID09PSBpdCA/IFModCwgZS5fcmVzdWx0KSA6IGUuX3N0YXRlID09PSBzdCA/IGoodCwgZS5fcmVzdWx0KSA6IEUoZSwgdm9pZCAwLCBmdW5jdGlvbiAoZSkge1xuICAgICAgZyh0LCBlKTtcbiAgICB9LCBmdW5jdGlvbiAoZSkge1xuICAgICAgaih0LCBlKTtcbiAgICB9KTtcbiAgfWZ1bmN0aW9uIHcodCwgbiwgcikge1xuICAgIG4uY29uc3RydWN0b3IgPT09IHQuY29uc3RydWN0b3IgJiYgciA9PT0gZXQgJiYgY29uc3RydWN0b3IucmVzb2x2ZSA9PT0gbnQgPyBiKHQsIG4pIDogciA9PT0gdXQgPyBqKHQsIHV0LmVycm9yKSA6IHZvaWQgMCA9PT0gciA/IFModCwgbikgOiBlKHIpID8gbSh0LCBuLCByKSA6IFModCwgbik7XG4gIH1mdW5jdGlvbiBnKGUsIG4pIHtcbiAgICBlID09PSBuID8gaihlLCBfKCkpIDogdChuKSA/IHcoZSwgbiwgdihuKSkgOiBTKGUsIG4pO1xuICB9ZnVuY3Rpb24gQSh0KSB7XG4gICAgdC5fb25lcnJvciAmJiB0Ll9vbmVycm9yKHQuX3Jlc3VsdCksIFQodCk7XG4gIH1mdW5jdGlvbiBTKHQsIGUpIHtcbiAgICB0Ll9zdGF0ZSA9PT0gb3QgJiYgKHQuX3Jlc3VsdCA9IGUsIHQuX3N0YXRlID0gaXQsIDAgIT09IHQuX3N1YnNjcmliZXJzLmxlbmd0aCAmJiBRKFQsIHQpKTtcbiAgfWZ1bmN0aW9uIGoodCwgZSkge1xuICAgIHQuX3N0YXRlID09PSBvdCAmJiAodC5fc3RhdGUgPSBzdCwgdC5fcmVzdWx0ID0gZSwgUShBLCB0KSk7XG4gIH1mdW5jdGlvbiBFKHQsIGUsIG4sIHIpIHtcbiAgICB2YXIgbyA9IHQuX3N1YnNjcmliZXJzLFxuICAgICAgICBpID0gby5sZW5ndGg7dC5fb25lcnJvciA9IG51bGwsIG9baV0gPSBlLCBvW2kgKyBpdF0gPSBuLCBvW2kgKyBzdF0gPSByLCAwID09PSBpICYmIHQuX3N0YXRlICYmIFEoVCwgdCk7XG4gIH1mdW5jdGlvbiBUKHQpIHtcbiAgICB2YXIgZSA9IHQuX3N1YnNjcmliZXJzLFxuICAgICAgICBuID0gdC5fc3RhdGU7aWYgKDAgIT09IGUubGVuZ3RoKSB7XG4gICAgICBmb3IgKHZhciByLCBvLCBpID0gdC5fcmVzdWx0LCBzID0gMDsgcyA8IGUubGVuZ3RoOyBzICs9IDMpIHIgPSBlW3NdLCBvID0gZVtzICsgbl0sIHIgPyB4KG4sIHIsIG8sIGkpIDogbyhpKTt0Ll9zdWJzY3JpYmVycy5sZW5ndGggPSAwO1xuICAgIH1cbiAgfWZ1bmN0aW9uIE0oKSB7XG4gICAgdGhpcy5lcnJvciA9IG51bGw7XG4gIH1mdW5jdGlvbiBQKHQsIGUpIHtcbiAgICB0cnkge1xuICAgICAgcmV0dXJuIHQoZSk7XG4gICAgfSBjYXRjaCAobikge1xuICAgICAgcmV0dXJuIChjdC5lcnJvciA9IG4sIGN0KTtcbiAgICB9XG4gIH1mdW5jdGlvbiB4KHQsIG4sIHIsIG8pIHtcbiAgICB2YXIgaSxcbiAgICAgICAgcyxcbiAgICAgICAgdSxcbiAgICAgICAgYyxcbiAgICAgICAgYSA9IGUocik7aWYgKGEpIHtcbiAgICAgIGlmICgoaSA9IFAociwgbyksIGkgPT09IGN0ID8gKGMgPSAhMCwgcyA9IGkuZXJyb3IsIGkgPSBudWxsKSA6IHUgPSAhMCwgbiA9PT0gaSkpIHtcbiAgICAgICAgcmV0dXJuIHZvaWQgaihuLCBkKCkpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpID0gbywgdSA9ICEwO24uX3N0YXRlICE9PSBvdCB8fCAoYSAmJiB1ID8gZyhuLCBpKSA6IGMgPyBqKG4sIHMpIDogdCA9PT0gaXQgPyBTKG4sIGkpIDogdCA9PT0gc3QgJiYgaihuLCBpKSk7XG4gIH1mdW5jdGlvbiBDKHQsIGUpIHtcbiAgICB0cnkge1xuICAgICAgZShmdW5jdGlvbiAoZSkge1xuICAgICAgICBnKHQsIGUpO1xuICAgICAgfSwgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgaih0LCBlKTtcbiAgICAgIH0pO1xuICAgIH0gY2F0Y2ggKG4pIHtcbiAgICAgIGoodCwgbik7XG4gICAgfVxuICB9ZnVuY3Rpb24gTygpIHtcbiAgICByZXR1cm4gYXQrKztcbiAgfWZ1bmN0aW9uIGsodCkge1xuICAgIHRbcnRdID0gYXQrKywgdC5fc3RhdGUgPSB2b2lkIDAsIHQuX3Jlc3VsdCA9IHZvaWQgMCwgdC5fc3Vic2NyaWJlcnMgPSBbXTtcbiAgfWZ1bmN0aW9uIFkodCkge1xuICAgIHJldHVybiBuZXcgX3QodGhpcywgdCkucHJvbWlzZTtcbiAgfWZ1bmN0aW9uIHEodCkge1xuICAgIHZhciBlID0gdGhpcztyZXR1cm4gbmV3IGUoSSh0KSA/IGZ1bmN0aW9uIChuLCByKSB7XG4gICAgICBmb3IgKHZhciBvID0gdC5sZW5ndGgsIGkgPSAwOyBvID4gaTsgaSsrKSBlLnJlc29sdmUodFtpXSkudGhlbihuLCByKTtcbiAgICB9IDogZnVuY3Rpb24gKHQsIGUpIHtcbiAgICAgIGUobmV3IFR5cGVFcnJvcihcIllvdSBtdXN0IHBhc3MgYW4gYXJyYXkgdG8gcmFjZS5cIikpO1xuICAgIH0pO1xuICB9ZnVuY3Rpb24gRih0KSB7XG4gICAgdmFyIGUgPSB0aGlzLFxuICAgICAgICBuID0gbmV3IGUocCk7cmV0dXJuIChqKG4sIHQpLCBuKTtcbiAgfWZ1bmN0aW9uIEQoKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIllvdSBtdXN0IHBhc3MgYSByZXNvbHZlciBmdW5jdGlvbiBhcyB0aGUgZmlyc3QgYXJndW1lbnQgdG8gdGhlIHByb21pc2UgY29uc3RydWN0b3JcIik7XG4gIH1mdW5jdGlvbiBLKCkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJGYWlsZWQgdG8gY29uc3RydWN0ICdQcm9taXNlJzogUGxlYXNlIHVzZSB0aGUgJ25ldycgb3BlcmF0b3IsIHRoaXMgb2JqZWN0IGNvbnN0cnVjdG9yIGNhbm5vdCBiZSBjYWxsZWQgYXMgYSBmdW5jdGlvbi5cIik7XG4gIH1mdW5jdGlvbiBMKHQpIHtcbiAgICB0aGlzW3J0XSA9IE8oKSwgdGhpcy5fcmVzdWx0ID0gdGhpcy5fc3RhdGUgPSB2b2lkIDAsIHRoaXMuX3N1YnNjcmliZXJzID0gW10sIHAgIT09IHQgJiYgKFwiZnVuY3Rpb25cIiAhPSB0eXBlb2YgdCAmJiBEKCksIHRoaXMgaW5zdGFuY2VvZiBMID8gQyh0aGlzLCB0KSA6IEsoKSk7XG4gIH1mdW5jdGlvbiBOKHQsIGUpIHtcbiAgICB0aGlzLl9pbnN0YW5jZUNvbnN0cnVjdG9yID0gdCwgdGhpcy5wcm9taXNlID0gbmV3IHQocCksIHRoaXMucHJvbWlzZVtydF0gfHwgayh0aGlzLnByb21pc2UpLCBBcnJheS5pc0FycmF5KGUpID8gKHRoaXMuX2lucHV0ID0gZSwgdGhpcy5sZW5ndGggPSBlLmxlbmd0aCwgdGhpcy5fcmVtYWluaW5nID0gZS5sZW5ndGgsIHRoaXMuX3Jlc3VsdCA9IG5ldyBBcnJheSh0aGlzLmxlbmd0aCksIDAgPT09IHRoaXMubGVuZ3RoID8gUyh0aGlzLnByb21pc2UsIHRoaXMuX3Jlc3VsdCkgOiAodGhpcy5sZW5ndGggPSB0aGlzLmxlbmd0aCB8fCAwLCB0aGlzLl9lbnVtZXJhdGUoKSwgMCA9PT0gdGhpcy5fcmVtYWluaW5nICYmIFModGhpcy5wcm9taXNlLCB0aGlzLl9yZXN1bHQpKSkgOiBqKHRoaXMucHJvbWlzZSwgVSgpKTtcbiAgfWZ1bmN0aW9uIFUoKSB7XG4gICAgcmV0dXJuIG5ldyBFcnJvcihcIkFycmF5IE1ldGhvZHMgbXVzdCBiZSBwcm92aWRlZCBhbiBBcnJheVwiKTtcbiAgfWZ1bmN0aW9uIFcoKSB7XG4gICAgdmFyIHQ7aWYgKFwidW5kZWZpbmVkXCIgIT0gdHlwZW9mIGdsb2JhbCkgdCA9IGdsb2JhbDtlbHNlIGlmIChcInVuZGVmaW5lZFwiICE9IHR5cGVvZiBzZWxmKSB0ID0gc2VsZjtlbHNlIHRyeSB7XG4gICAgICB0ID0gRnVuY3Rpb24oXCJyZXR1cm4gdGhpc1wiKSgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcInBvbHlmaWxsIGZhaWxlZCBiZWNhdXNlIGdsb2JhbCBvYmplY3QgaXMgdW5hdmFpbGFibGUgaW4gdGhpcyBlbnZpcm9ubWVudFwiKTtcbiAgICB9dmFyIG4gPSB0LlByb21pc2U7KCFuIHx8IFwiW29iamVjdCBQcm9taXNlXVwiICE9PSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwobi5yZXNvbHZlKCkpIHx8IG4uY2FzdCkgJiYgKHQuUHJvbWlzZSA9IHB0KTtcbiAgfXZhciB6O3ogPSBBcnJheS5pc0FycmF5ID8gQXJyYXkuaXNBcnJheSA6IGZ1bmN0aW9uICh0KSB7XG4gICAgcmV0dXJuIFwiW29iamVjdCBBcnJheV1cIiA9PT0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHQpO1xuICB9O3ZhciBCLFxuICAgICAgRyxcbiAgICAgIEgsXG4gICAgICBJID0geixcbiAgICAgIEogPSAwLFxuICAgICAgUSA9IGZ1bmN0aW9uIFEodCwgZSkge1xuICAgIHR0W0pdID0gdCwgdHRbSiArIDFdID0gZSwgSiArPSAyLCAyID09PSBKICYmIChHID8gRyhhKSA6IEgoKSk7XG4gIH0sXG4gICAgICBSID0gXCJ1bmRlZmluZWRcIiAhPSB0eXBlb2Ygd2luZG93ID8gd2luZG93IDogdm9pZCAwLFxuICAgICAgViA9IFIgfHwge30sXG4gICAgICBYID0gVi5NdXRhdGlvbk9ic2VydmVyIHx8IFYuV2ViS2l0TXV0YXRpb25PYnNlcnZlcixcbiAgICAgIFogPSBcInVuZGVmaW5lZFwiID09IHR5cGVvZiBzZWxmICYmIFwidW5kZWZpbmVkXCIgIT0gdHlwZW9mIHByb2Nlc3MgJiYgXCJbb2JqZWN0IHByb2Nlc3NdXCIgPT09ICh7fSkudG9TdHJpbmcuY2FsbChwcm9jZXNzKSxcbiAgICAgICQgPSBcInVuZGVmaW5lZFwiICE9IHR5cGVvZiBVaW50OENsYW1wZWRBcnJheSAmJiBcInVuZGVmaW5lZFwiICE9IHR5cGVvZiBpbXBvcnRTY3JpcHRzICYmIFwidW5kZWZpbmVkXCIgIT0gdHlwZW9mIE1lc3NhZ2VDaGFubmVsLFxuICAgICAgdHQgPSBuZXcgQXJyYXkoMTAwMCk7SCA9IFogPyBvKCkgOiBYID8gcygpIDogJCA/IHUoKSA6IHZvaWQgMCA9PT0gUiAmJiBcImZ1bmN0aW9uXCIgPT0gdHlwZW9mIHJlcXVpcmUgPyBmKCkgOiBjKCk7dmFyIGV0ID0gbCxcbiAgICAgIG50ID0gaCxcbiAgICAgIHJ0ID0gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDE2KSxcbiAgICAgIG90ID0gdm9pZCAwLFxuICAgICAgaXQgPSAxLFxuICAgICAgc3QgPSAyLFxuICAgICAgdXQgPSBuZXcgTSgpLFxuICAgICAgY3QgPSBuZXcgTSgpLFxuICAgICAgYXQgPSAwLFxuICAgICAgZnQgPSBZLFxuICAgICAgbHQgPSBxLFxuICAgICAgaHQgPSBGLFxuICAgICAgcHQgPSBMO0wuYWxsID0gZnQsIEwucmFjZSA9IGx0LCBMLnJlc29sdmUgPSBudCwgTC5yZWplY3QgPSBodCwgTC5fc2V0U2NoZWR1bGVyID0gbiwgTC5fc2V0QXNhcCA9IHIsIEwuX2FzYXAgPSBRLCBMLnByb3RvdHlwZSA9IHsgY29uc3RydWN0b3I6IEwsIHRoZW46IGV0LCBcImNhdGNoXCI6IGZ1bmN0aW9uIF9jYXRjaCh0KSB7XG4gICAgICByZXR1cm4gdGhpcy50aGVuKG51bGwsIHQpO1xuICAgIH0gfTt2YXIgX3QgPSBOO04ucHJvdG90eXBlLl9lbnVtZXJhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgZm9yICh2YXIgdCA9IHRoaXMubGVuZ3RoLCBlID0gdGhpcy5faW5wdXQsIG4gPSAwOyB0aGlzLl9zdGF0ZSA9PT0gb3QgJiYgdCA+IG47IG4rKykgdGhpcy5fZWFjaEVudHJ5KGVbbl0sIG4pO1xuICB9LCBOLnByb3RvdHlwZS5fZWFjaEVudHJ5ID0gZnVuY3Rpb24gKHQsIGUpIHtcbiAgICB2YXIgbiA9IHRoaXMuX2luc3RhbmNlQ29uc3RydWN0b3IsXG4gICAgICAgIHIgPSBuLnJlc29sdmU7aWYgKHIgPT09IG50KSB7XG4gICAgICB2YXIgbyA9IHYodCk7aWYgKG8gPT09IGV0ICYmIHQuX3N0YXRlICE9PSBvdCkgdGhpcy5fc2V0dGxlZEF0KHQuX3N0YXRlLCBlLCB0Ll9yZXN1bHQpO2Vsc2UgaWYgKFwiZnVuY3Rpb25cIiAhPSB0eXBlb2YgbykgdGhpcy5fcmVtYWluaW5nLS0sIHRoaXMuX3Jlc3VsdFtlXSA9IHQ7ZWxzZSBpZiAobiA9PT0gcHQpIHtcbiAgICAgICAgdmFyIGkgPSBuZXcgbihwKTt3KGksIHQsIG8pLCB0aGlzLl93aWxsU2V0dGxlQXQoaSwgZSk7XG4gICAgICB9IGVsc2UgdGhpcy5fd2lsbFNldHRsZUF0KG5ldyBuKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGUodCk7XG4gICAgICB9KSwgZSk7XG4gICAgfSBlbHNlIHRoaXMuX3dpbGxTZXR0bGVBdChyKHQpLCBlKTtcbiAgfSwgTi5wcm90b3R5cGUuX3NldHRsZWRBdCA9IGZ1bmN0aW9uICh0LCBlLCBuKSB7XG4gICAgdmFyIHIgPSB0aGlzLnByb21pc2U7ci5fc3RhdGUgPT09IG90ICYmICh0aGlzLl9yZW1haW5pbmctLSwgdCA9PT0gc3QgPyBqKHIsIG4pIDogdGhpcy5fcmVzdWx0W2VdID0gbiksIDAgPT09IHRoaXMuX3JlbWFpbmluZyAmJiBTKHIsIHRoaXMuX3Jlc3VsdCk7XG4gIH0sIE4ucHJvdG90eXBlLl93aWxsU2V0dGxlQXQgPSBmdW5jdGlvbiAodCwgZSkge1xuICAgIHZhciBuID0gdGhpcztFKHQsIHZvaWQgMCwgZnVuY3Rpb24gKHQpIHtcbiAgICAgIG4uX3NldHRsZWRBdChpdCwgZSwgdCk7XG4gICAgfSwgZnVuY3Rpb24gKHQpIHtcbiAgICAgIG4uX3NldHRsZWRBdChzdCwgZSwgdCk7XG4gICAgfSk7XG4gIH07dmFyIGR0ID0gVyxcbiAgICAgIHZ0ID0geyBQcm9taXNlOiBwdCwgcG9seWZpbGw6IGR0IH07XCJmdW5jdGlvblwiID09IHR5cGVvZiBkZWZpbmUgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHZ0O1xuICB9KSA6IFwidW5kZWZpbmVkXCIgIT0gdHlwZW9mIG1vZHVsZSAmJiBtb2R1bGUuZXhwb3J0cyA/IG1vZHVsZS5leHBvcnRzID0gdnQgOiBcInVuZGVmaW5lZFwiICE9IHR5cGVvZiB0aGlzICYmICh0aGlzLkVTNlByb21pc2UgPSB2dCksIGR0KCk7XG59KS5jYWxsKHVuZGVmaW5lZCk7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKCdfcHJvY2VzcycpLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldDp1dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnpiM1Z5WTJWeklqcGJJaTlvYjIxbEwyUmhibWxsYkM5RWIyTjFiV1Z1ZEhNdmNISnZhbVZqZEhNdmIzSmlMV05zYVdWdWRDOXpjbU12YkdsaUwyVnpOaTF3Y205dGFYTmxMbTFwYmk1cWN5SmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaU96czdPenM3T3pzN096dEJRVkZCTEVOQlFVTXNXVUZCVlR0QlFVRkRMR05CUVZrc1EwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTTdRVUZCUXl4WFFVRk5MRlZCUVZVc1NVRkJSU3hQUVVGUExFTkJRVU1zU1VGQlJTeFJRVUZSTEVsQlFVVXNUMEZCVHl4RFFVRkRMRWxCUVVVc1NVRkJTU3hMUVVGSExFTkJRVU1zUTBGQlFUdEhRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJRenRCUVVGRExGZEJRVTBzVlVGQlZTeEpRVUZGTEU5QlFVOHNRMEZCUXl4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETzBGQlFVTXNTMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJRVHRIUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXp0QlFVRkRMRXRCUVVNc1IwRkJReXhEUVVGRExFTkJRVUU3UjBGQlF5eFRRVUZUTEVOQlFVTXNSMEZCUlR0QlFVRkRMRmRCUVU4c1dVRkJWVHRCUVVGRExHRkJRVThzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVFN1MwRkJReXhEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVkQlFVVTdRVUZCUXl4WFFVRlBMRmxCUVZVN1FVRkJReXhQUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVRTdTMEZCUXl4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFZEJRVVU3UVVGQlF5eFJRVUZKTEVOQlFVTXNSMEZCUXl4RFFVRkRPMUZCUVVNc1EwRkJReXhIUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0UlFVRkRMRU5CUVVNc1IwRkJReXhSUVVGUkxFTkJRVU1zWTBGQll5eERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRMRkZCUVU4c1EwRkJReXhEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETEVWQlFVTXNSVUZCUXl4aFFVRmhMRVZCUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eEZRVUZETEZsQlFWVTdRVUZCUXl4UFFVRkRMRU5CUVVNc1NVRkJTU3hIUVVGRExFTkJRVU1zUjBGQlF5eEZRVUZGTEVOQlFVTXNSMEZCUXl4RFFVRkRMRU5CUVVFN1MwRkJReXhEUVVGQkxFTkJRVUU3UjBGQlF5eFRRVUZUTEVOQlFVTXNSMEZCUlR0QlFVRkRMRkZCUVVrc1EwRkJReXhIUVVGRExFbEJRVWtzWTBGQll5eEZRVUZCTEVOQlFVTXNVVUZCVHl4RFFVRkRMRU5CUVVNc1MwRkJTeXhEUVVGRExGTkJRVk1zUjBGQlF5eERRVUZETEVWQlFVTXNXVUZCVlR0QlFVRkRMRTlCUVVNc1EwRkJReXhMUVVGTExFTkJRVU1zVjBGQlZ5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkJPMHRCUVVNc1EwRkJRU3hEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVkQlFVVTdRVUZCUXl4WFFVRlBMRmxCUVZVN1FVRkJReXhuUWtGQlZTeERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRVHRMUVVGRExFTkJRVUU3UjBGQlF5eFRRVUZUTEVOQlFVTXNSMEZCUlR0QlFVRkRMRk5CUVVrc1NVRkJTU3hEUVVGRExFZEJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhKUVVGRkxFTkJRVU1zUlVGQlF6dEJRVUZETEZWQlFVa3NRMEZCUXl4SFFVRkRMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU03VlVGQlF5eERRVUZETEVkQlFVTXNSVUZCUlN4RFFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1JVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZETEV0QlFVc3NRMEZCUXl4RlFVRkRMRVZCUVVVc1EwRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVkQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVFN1MwRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZCTzBkQlFVTXNVMEZCVXl4RFFVRkRMRWRCUVVVN1FVRkJReXhSUVVGSE8wRkJRVU1zVlVGQlNTeERRVUZETEVkQlFVTXNUMEZCVHp0VlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTXNVVUZCVHl4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGRExGTkJRVk1zU1VGQlJTeERRVUZETEVOQlFVTXNXVUZCV1N4RlFVRkRMRU5CUVVNc1JVRkJSU3hEUVVGQkxFTkJRVUU3UzBGQlF5eERRVUZCTEU5QlFVMHNRMEZCUXl4RlFVRkRPMEZCUVVNc1lVRkJUeXhEUVVGRExFVkJRVVVzUTBGQlFUdExRVUZETzBkQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF6dEJRVUZETEZGQlFVa3NRMEZCUXl4SFFVRkRMRWxCUVVrN1VVRkJReXhEUVVGRExFZEJRVU1zU1VGQlNTeEpRVUZKTEVOQlFVTXNWMEZCVnl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFdEJRVXNzUTBGQlF5eExRVUZITEVOQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1NVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGRExFMUJRVTBzUTBGQlF5eEpRVUZITEVOQlFVTXNSVUZCUXp0QlFVRkRMRlZCUVVrc1EwRkJReXhIUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExGbEJRVlU3UVVGQlF5eFRRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkJPMDlCUVVNc1EwRkJReXhEUVVGQk8wdEJRVU1zVFVGQlN5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVFN1IwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTTdRVUZCUXl4UlFVRkpMRU5CUVVNc1IwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlJ5eERRVUZETEVsQlFVVXNVVUZCVVN4SlFVRkZMRTlCUVU4c1EwRkJReXhKUVVGRkxFTkJRVU1zUTBGQlF5eFhRVUZYTEV0QlFVY3NRMEZCUXp0QlFVRkRMR0ZCUVU4c1EwRkJReXhEUVVGRE8wdEJRVUVzU1VGQlNTeERRVUZETEVkQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zVVVGQlR5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUTBGQlFTeERRVUZCTzBkQlFVTXNVMEZCVXl4RFFVRkRMRWRCUVVVc1JVRkJSU3hUUVVGVExFTkJRVU1zUjBGQlJUdEJRVUZETEZkQlFVOHNTVUZCU1N4VFFVRlRMRU5CUVVNc01FTkJRVEJETEVOQlFVTXNRMEZCUVR0SFFVRkRMRk5CUVZNc1EwRkJReXhIUVVGRk8wRkJRVU1zVjBGQlR5eEpRVUZKTEZOQlFWTXNRMEZCUXl4elJFRkJjMFFzUTBGQlF5eERRVUZCTzBkQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRE8wRkJRVU1zVVVGQlJ6dEJRVUZETEdGQlFVOHNRMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJRVHRMUVVGRExFTkJRVUVzVDBGQlRTeERRVUZETEVWQlFVTTdRVUZCUXl4alFVRlBMRVZCUVVVc1EwRkJReXhMUVVGTExFZEJRVU1zUTBGQlF5eEZRVUZETEVWQlFVVXNRMEZCUVN4RFFVRkJPMHRCUVVNN1IwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFVkJRVU03UVVGQlF5eFJRVUZITzBGQlFVTXNUMEZCUXl4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkJPMHRCUVVNc1EwRkJRU3hQUVVGTkxFTkJRVU1zUlVGQlF6dEJRVUZETEdGQlFVOHNRMEZCUXl4RFFVRkJPMHRCUVVNN1IwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1JVRkJRenRCUVVGRExFdEJRVU1zUTBGQlF5eFZRVUZUTEVOQlFVTXNSVUZCUXp0QlFVRkRMRlZCUVVrc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF6dFZRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF5eFZRVUZUTEVOQlFVTXNSVUZCUXp0QlFVRkRMRk5CUVVNc1MwRkJSeXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4TFFVRkhMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVOQlFVRXNRVUZCUXl4RFFVRkJPMDlCUVVNc1JVRkJReXhWUVVGVExFTkJRVU1zUlVGQlF6dEJRVUZETEZOQlFVTXNTMEZCUnl4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRU3hCUVVGRExFTkJRVUU3VDBGQlF5eEZRVUZETEZWQlFWVXNTVUZCUlN4RFFVRkRMRU5CUVVNc1RVRkJUU3hKUVVGRkxHdENRVUZyUWl4RFFVRkJMRUZCUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEpRVUZGTEVOQlFVTXNTMEZCUnl4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRU3hCUVVGRExFTkJRVUU3UzBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXp0QlFVRkRMRXRCUVVNc1EwRkJReXhOUVVGTkxFdEJRVWNzUlVGQlJTeEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFOUJRVThzUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRXRCUVVjc1JVRkJSU3hIUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRTlCUVU4c1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNTMEZCU3l4RFFVRkRMRVZCUVVNc1ZVRkJVeXhEUVVGRExFVkJRVU03UVVGQlF5eFBRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1EwRkJReXhEUVVGQk8wdEJRVU1zUlVGQlF5eFZRVUZUTEVOQlFVTXNSVUZCUXp0QlFVRkRMRTlCUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVOQlFVRTdTMEZCUXl4RFFVRkRMRU5CUVVFN1IwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1JVRkJRenRCUVVGRExFdEJRVU1zUTBGQlF5eFhRVUZYTEV0QlFVY3NRMEZCUXl4RFFVRkRMRmRCUVZjc1NVRkJSU3hEUVVGRExFdEJRVWNzUlVGQlJTeEpRVUZGTEZkQlFWY3NRMEZCUXl4UFFVRlBMRXRCUVVjc1JVRkJSU3hIUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVNc1EwRkJReXhMUVVGSExFVkJRVVVzUjBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRVZCUVVVc1EwRkJReXhMUVVGTExFTkJRVU1zUjBGQlF5eExRVUZMTEVOQlFVTXNTMEZCUnl4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRVHRIUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNN1FVRkJReXhMUVVGRExFdEJRVWNzUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRkxFTkJRVU1zUjBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRVHRIUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXp0QlFVRkRMRXRCUVVNc1EwRkJReXhSUVVGUkxFbEJRVVVzUTBGQlF5eERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRMRU5CUVVNc1QwRkJUeXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXp0QlFVRkRMRXRCUVVNc1EwRkJReXhOUVVGTkxFdEJRVWNzUlVGQlJTeExRVUZITEVOQlFVTXNRMEZCUXl4UFFVRlBMRWRCUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUTBGQlF5eE5RVUZOTEVkQlFVTXNSVUZCUlN4RlFVRkRMRU5CUVVNc1MwRkJSeXhEUVVGRExFTkJRVU1zV1VGQldTeERRVUZETEUxQlFVMHNTVUZCUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUTBGQlF5eERRVUZCTEVGQlFVTXNRMEZCUVR0SFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVTTdRVUZCUXl4TFFVRkRMRU5CUVVNc1RVRkJUU3hMUVVGSExFVkJRVVVzUzBGQlJ5eERRVUZETEVOQlFVTXNUVUZCVFN4SFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFTkJRVU1zVDBGQlR5eEhRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUTBGQlF5eERRVUZCTEVGQlFVTXNRMEZCUVR0SFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1JVRkJRenRCUVVGRExGRkJRVWtzUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4WlFVRlpPMUZCUVVNc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eE5RVUZOTEVOQlFVTXNRMEZCUXl4RFFVRkRMRkZCUVZFc1IwRkJReXhKUVVGSkxFVkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZETEVWQlFVVXNRMEZCUXl4SFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZETEVWQlFVVXNRMEZCUXl4SFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFdEJRVWNzUTBGQlF5eEpRVUZGTEVOQlFVTXNRMEZCUXl4TlFVRk5MRWxCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUVR0SFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF6dEJRVUZETEZGQlFVa3NRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhaUVVGWk8xRkJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRU5CUVVNc1NVRkJSeXhEUVVGRExFdEJRVWNzUTBGQlF5eERRVUZETEUxQlFVMHNSVUZCUXp0QlFVRkRMRmRCUVVrc1NVRkJTU3hEUVVGRExFVkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRU5CUVVNc1QwRkJUeXhGUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhOUVVGTkxFVkJRVU1zUTBGQlF5eEpRVUZGTEVOQlFVTXNSVUZCUXl4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4WlFVRlpMRU5CUVVNc1RVRkJUU3hIUVVGRExFTkJRVU1zUTBGQlFUdExRVUZETzBkQlFVTXNVMEZCVXl4RFFVRkRMRWRCUVVVN1FVRkJReXhSUVVGSkxFTkJRVU1zUzBGQlN5eEhRVUZETEVsQlFVa3NRMEZCUVR0SFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVTTdRVUZCUXl4UlFVRkhPMEZCUVVNc1lVRkJUeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVRTdTMEZCUXl4RFFVRkJMRTlCUVUwc1EwRkJReXhGUVVGRE8wRkJRVU1zWTBGQlR5eEZRVUZGTEVOQlFVTXNTMEZCU3l4SFFVRkRMRU5CUVVNc1JVRkJReXhGUVVGRkxFTkJRVUVzUTBGQlFUdExRVUZETzBkQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkRPMEZCUVVNc1VVRkJTU3hEUVVGRE8xRkJRVU1zUTBGQlF6dFJRVUZETEVOQlFVTTdVVUZCUXl4RFFVRkRPMUZCUVVNc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SlFVRkhMRU5CUVVNc1JVRkJRenRCUVVGRExGZEJRVWNzUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eExRVUZITEVWQlFVVXNTVUZCUlN4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4TFFVRkxMRVZCUVVNc1EwRkJReXhIUVVGRExFbEJRVWtzUTBGQlFTeEhRVUZGTEVOQlFVTXNSMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFdEJRVWNzUTBGQlF5eERRVUZCTzBGQlFVTXNaVUZCVHl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eEZRVUZGTEVOQlFVTXNRMEZCUVR0UFFVRkJPMHRCUVVNc1RVRkJTeXhEUVVGRExFZEJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zVFVGQlRTeExRVUZITEVWQlFVVXNTMEZCUnl4RFFVRkRMRWxCUVVVc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVNc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVNc1EwRkJReXhMUVVGSExFVkJRVVVzUjBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1EwRkJReXhIUVVGRExFTkJRVU1zUzBGQlJ5eEZRVUZGTEVsQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlFTeEJRVUZETEVOQlFVRTdSMEZCUXl4VFFVRlRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eEZRVUZETzBGQlFVTXNVVUZCUnp0QlFVRkRMRTlCUVVNc1EwRkJReXhWUVVGVExFTkJRVU1zUlVGQlF6dEJRVUZETEZOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFTkJRVUU3VDBGQlF5eEZRVUZETEZWQlFWTXNRMEZCUXl4RlFVRkRPMEZCUVVNc1UwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUVR0UFFVRkRMRU5CUVVNc1EwRkJRVHRMUVVGRExFTkJRVUVzVDBGQlRTeERRVUZETEVWQlFVTTdRVUZCUXl4UFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUTBGQlF5eERRVUZCTzB0QlFVTTdSMEZCUXl4VFFVRlRMRU5CUVVNc1IwRkJSVHRCUVVGRExGZEJRVThzUlVGQlJTeEZRVUZGTEVOQlFVRTdSMEZCUXl4VFFVRlRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU03UVVGQlF5eExRVUZETEVOQlFVTXNSVUZCUlN4RFFVRkRMRWRCUVVNc1JVRkJSU3hGUVVGRkxFVkJRVU1zUTBGQlF5eERRVUZETEUxQlFVMHNSMEZCUXl4TFFVRkxMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zVDBGQlR5eEhRVUZETEV0QlFVc3NRMEZCUXl4RlFVRkRMRU5CUVVNc1EwRkJReXhaUVVGWkxFZEJRVU1zUlVGQlJTeERRVUZCTzBkQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRE8wRkJRVU1zVjBGQlR5eEpRVUZKTEVWQlFVVXNRMEZCUXl4SlFVRkpMRVZCUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zVDBGQlR5eERRVUZCTzBkQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRE8wRkJRVU1zVVVGQlNTeERRVUZETEVkQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkRMRlZCUVZNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF6dEJRVUZETEZkQlFVa3NTVUZCU1N4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGRExFMUJRVTBzUlVGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVTXNRMEZCUXl4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUTBGQlF5eERRVUZCTzB0QlFVTXNSMEZCUXl4VlFVRlRMRU5CUVVNc1JVRkJReXhEUVVGRExFVkJRVU03UVVGQlF5eFBRVUZETEVOQlFVTXNTVUZCU1N4VFFVRlRMRU5CUVVNc2FVTkJRV2xETEVOQlFVTXNRMEZCUXl4RFFVRkJPMHRCUVVNc1EwRkJReXhEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRPMEZCUVVNc1VVRkJTU3hEUVVGRExFZEJRVU1zU1VGQlNUdFJRVUZETEVOQlFVTXNSMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eFJRVUZQTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZCTEVOQlFVRTdSMEZCUXl4VFFVRlRMRU5CUVVNc1IwRkJSVHRCUVVGRExGVkJRVTBzU1VGQlNTeFRRVUZUTEVOQlFVTXNiMFpCUVc5R0xFTkJRVU1zUTBGQlFUdEhRVUZETEZOQlFWTXNRMEZCUXl4SFFVRkZPMEZCUVVNc1ZVRkJUU3hKUVVGSkxGTkJRVk1zUTBGQlF5eDFTRUZCZFVnc1EwRkJReXhEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRPMEZCUVVNc1VVRkJTU3hEUVVGRExFVkJRVVVzUTBGQlF5eEhRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFZEJRVU1zU1VGQlNTeERRVUZETEUxQlFVMHNSMEZCUXl4TFFVRkxMRU5CUVVNc1JVRkJReXhKUVVGSkxFTkJRVU1zV1VGQldTeEhRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRXRCUVVjc1EwRkJReXhMUVVGSExGVkJRVlVzU1VGQlJTeFBRVUZQTEVOQlFVTXNTVUZCUlN4RFFVRkRMRVZCUVVVc1JVRkJReXhKUVVGSkxGbEJRVmtzUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4SlFVRkpMRVZCUVVNc1EwRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eEZRVUZGTEVOQlFVRXNRVUZCUXl4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXp0QlFVRkRMRkZCUVVrc1EwRkJReXh2UWtGQmIwSXNSMEZCUXl4RFFVRkRMRVZCUVVNc1NVRkJTU3hEUVVGRExFOUJRVThzUjBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEVWQlFVVXNRMEZCUXl4SlFVRkZMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEVWQlFVTXNTMEZCU3l4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRExFTkJRVU1zU1VGQlJTeEpRVUZKTEVOQlFVTXNUVUZCVFN4SFFVRkRMRU5CUVVNc1JVRkJReXhKUVVGSkxFTkJRVU1zVFVGQlRTeEhRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRVZCUVVNc1NVRkJTU3hEUVVGRExGVkJRVlVzUjBGQlF5eERRVUZETEVOQlFVTXNUVUZCVFN4RlFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFZEJRVU1zU1VGQlNTeExRVUZMTEVOQlFVTXNTVUZCU1N4RFFVRkRMRTFCUVUwc1EwRkJReXhGUVVGRExFTkJRVU1zUzBGQlJ5eEpRVUZKTEVOQlFVTXNUVUZCVFN4SFFVRkRMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zVDBGQlR5eEZRVUZETEVsQlFVa3NRMEZCUXl4UFFVRlBMRU5CUVVNc1NVRkJSU3hKUVVGSkxFTkJRVU1zVFVGQlRTeEhRVUZETEVsQlFVa3NRMEZCUXl4TlFVRk5MRWxCUVVVc1EwRkJReXhGUVVGRExFbEJRVWtzUTBGQlF5eFZRVUZWTEVWQlFVVXNSVUZCUXl4RFFVRkRMRXRCUVVjc1NVRkJTU3hEUVVGRExGVkJRVlVzU1VGQlJTeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1JVRkJReXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVRXNRVUZCUXl4RFFVRkJMRWRCUVVVc1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVWQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1EwRkJRVHRIUVVGRExGTkJRVk1zUTBGQlF5eEhRVUZGTzBGQlFVTXNWMEZCVHl4SlFVRkpMRXRCUVVzc1EwRkJReXg1UTBGQmVVTXNRMEZCUXl4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFZEJRVVU3UVVGQlF5eFJRVUZKTEVOQlFVTXNRMEZCUXl4SlFVRkhMRmRCUVZjc1NVRkJSU3hQUVVGUExFMUJRVTBzUlVGQlF5eERRVUZETEVkQlFVTXNUVUZCVFN4RFFVRkRMRXRCUVVzc1NVRkJSeXhYUVVGWExFbEJRVVVzVDBGQlR5eEpRVUZKTEVWQlFVTXNRMEZCUXl4SFFVRkRMRWxCUVVrc1EwRkJReXhMUVVGTExFbEJRVWM3UVVGQlF5eFBRVUZETEVkQlFVTXNVVUZCVVN4RFFVRkRMR0ZCUVdFc1EwRkJReXhGUVVGRkxFTkJRVUU3UzBGQlF5eERRVUZCTEU5QlFVMHNRMEZCUXl4RlFVRkRPMEZCUVVNc1dVRkJUU3hKUVVGSkxFdEJRVXNzUTBGQlF5d3dSVUZCTUVVc1EwRkJReXhEUVVGQk8wdEJRVU1zU1VGQlNTeERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEpRVUZGTEd0Q1FVRnJRaXhMUVVGSExFMUJRVTBzUTBGQlF5eFRRVUZUTEVOQlFVTXNVVUZCVVN4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zVDBGQlR5eEZRVUZGTEVOQlFVTXNTVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGQkxFdEJRVWtzUTBGQlF5eERRVUZETEU5QlFVOHNSMEZCUXl4RlFVRkZMRU5CUVVFc1FVRkJReXhEUVVGQk8wZEJRVU1zU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkRMRXRCUVVzc1EwRkJReXhQUVVGUExFZEJRVU1zUzBGQlN5eERRVUZETEU5QlFVOHNSMEZCUXl4VlFVRlRMRU5CUVVNc1JVRkJRenRCUVVGRExGZEJRVTBzWjBKQlFXZENMRXRCUVVjc1RVRkJUU3hEUVVGRExGTkJRVk1zUTBGQlF5eFJRVUZSTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGQk8wZEJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTTdUVUZCUXl4RFFVRkRPMDFCUVVNc1EwRkJRenROUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETzAxQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNN1RVRkJReXhEUVVGRExFZEJRVU1zVjBGQlV5eERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkRPMEZCUVVNc1RVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNSVUZCUXl4RlFVRkZMRU5CUVVNc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRWxCUVVVc1EwRkJReXhGUVVGRExFTkJRVU1zUzBGQlJ5eERRVUZETEV0QlFVY3NRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVWQlFVVXNRMEZCUVN4QlFVRkRMRU5CUVVFN1IwRkJRenROUVVGRExFTkJRVU1zUjBGQlF5eFhRVUZYTEVsQlFVVXNUMEZCVHl4TlFVRk5MRWRCUVVNc1RVRkJUU3hIUVVGRExFdEJRVXNzUTBGQlF6dE5RVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRWxCUVVVc1JVRkJSVHROUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVOQlFVTXNaMEpCUVdkQ0xFbEJRVVVzUTBGQlF5eERRVUZETEhOQ1FVRnpRanROUVVGRExFTkJRVU1zUjBGQlF5eFhRVUZYTEVsQlFVVXNUMEZCVHl4SlFVRkpMRWxCUVVVc1YwRkJWeXhKUVVGRkxFOUJRVThzVDBGQlR5eEpRVUZGTEd0Q1FVRnJRaXhMUVVGSExFTkJRVUVzUjBGQlJTeERRVUZETEZGQlFWRXNRMEZCUXl4SlFVRkpMRU5CUVVNc1QwRkJUeXhEUVVGRE8wMUJRVU1zUTBGQlF5eEhRVUZETEZkQlFWY3NTVUZCUlN4UFFVRlBMR2xDUVVGcFFpeEpRVUZGTEZkQlFWY3NTVUZCUlN4UFFVRlBMR0ZCUVdFc1NVRkJSU3hYUVVGWExFbEJRVVVzVDBGQlR5eGpRVUZqTzAxQlFVTXNSVUZCUlN4SFFVRkRMRWxCUVVrc1MwRkJTeXhEUVVGRExFbEJRVWNzUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRWRCUVVNc1EwRkJReXhGUVVGRkxFZEJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNSVUZCUlN4SFFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFVkJRVVVzUjBGQlF5eExRVUZMTEVOQlFVTXNTMEZCUnl4RFFVRkRMRWxCUVVVc1ZVRkJWU3hKUVVGRkxFOUJRVThzVDBGQlR5eEhRVUZETEVOQlFVTXNSVUZCUlN4SFFVRkRMRU5CUVVNc1JVRkJSU3hEUVVGRExFbEJRVWtzUlVGQlJTeEhRVUZETEVOQlFVTTdUVUZCUXl4RlFVRkZMRWRCUVVNc1EwRkJRenROUVVGRExFVkJRVVVzUjBGQlF5eEpRVUZKTEVOQlFVTXNUVUZCVFN4RlFVRkZMRU5CUVVNc1VVRkJVU3hEUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETEZOQlFWTXNRMEZCUXl4RlFVRkZMRU5CUVVNN1RVRkJReXhGUVVGRkxFZEJRVU1zUzBGQlN5eERRVUZETzAxQlFVTXNSVUZCUlN4SFFVRkRMRU5CUVVNN1RVRkJReXhGUVVGRkxFZEJRVU1zUTBGQlF6dE5RVUZETEVWQlFVVXNSMEZCUXl4SlFVRkpMRU5CUVVNc1JVRkJRVHROUVVGRExFVkJRVVVzUjBGQlF5eEpRVUZKTEVOQlFVTXNSVUZCUVR0TlFVRkRMRVZCUVVVc1IwRkJReXhEUVVGRE8wMUJRVU1zUlVGQlJTeEhRVUZETEVOQlFVTTdUVUZCUXl4RlFVRkZMRWRCUVVNc1EwRkJRenROUVVGRExFVkJRVVVzUjBGQlF5eERRVUZETzAxQlFVTXNSVUZCUlN4SFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eEhRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRU5CUVVNc1NVRkJTU3hIUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4SFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFTkJRVU1zVFVGQlRTeEhRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRU5CUVVNc1lVRkJZU3hIUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNVVUZCVVN4SFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUzBGQlN5eEhRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1UwRkJVeXhIUVVGRExFVkJRVU1zVjBGQlZ5eEZRVUZETEVOQlFVTXNSVUZCUXl4SlFVRkpMRVZCUVVNc1JVRkJSU3hGUVVGRExFOUJRVThzUlVGQlF5eG5Ra0ZCVXl4RFFVRkRMRVZCUVVNN1FVRkJReXhoUVVGUExFbEJRVWtzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RlFVRkRMRU5CUVVNc1EwRkJReXhEUVVGQk8wdEJRVU1zUlVGQlF5eERRVUZETEVsQlFVa3NSVUZCUlN4SFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zVTBGQlV5eERRVUZETEZWQlFWVXNSMEZCUXl4WlFVRlZPMEZCUVVNc1UwRkJTU3hKUVVGSkxFTkJRVU1zUjBGQlF5eEpRVUZKTEVOQlFVTXNUVUZCVFN4RlFVRkRMRU5CUVVNc1IwRkJReXhKUVVGSkxFTkJRVU1zVFVGQlRTeEZRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRVZCUVVNc1NVRkJTU3hEUVVGRExFMUJRVTBzUzBGQlJ5eEZRVUZGTEVsQlFVVXNRMEZCUXl4SFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFVkJRVVVzUlVGQlF5eEpRVUZKTEVOQlFVTXNWVUZCVlN4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUVR0SFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExGTkJRVk1zUTBGQlF5eFZRVUZWTEVkQlFVTXNWVUZCVXl4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRE8wRkJRVU1zVVVGQlNTeERRVUZETEVkQlFVTXNTVUZCU1N4RFFVRkRMRzlDUVVGdlFqdFJRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRU5CUVVNc1QwRkJUeXhEUVVGRExFbEJRVWNzUTBGQlF5eExRVUZITEVWQlFVVXNSVUZCUXp0QlFVRkRMRlZCUVVrc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SlFVRkhMRU5CUVVNc1MwRkJSeXhGUVVGRkxFbEJRVVVzUTBGQlF5eERRVUZETEUxQlFVMHNTMEZCUnl4RlFVRkZMRVZCUVVNc1NVRkJTU3hEUVVGRExGVkJRVlVzUTBGQlF5eERRVUZETEVOQlFVTXNUVUZCVFN4RlFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTXNTMEZCU3l4SlFVRkhMRlZCUVZVc1NVRkJSU3hQUVVGUExFTkJRVU1zUlVGQlF5eEpRVUZKTEVOQlFVTXNWVUZCVlN4RlFVRkZMRVZCUVVNc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRU5CUVVNc1MwRkJTeXhKUVVGSExFTkJRVU1zUzBGQlJ5eEZRVUZGTEVWQlFVTTdRVUZCUXl4WlFVRkpMRU5CUVVNc1IwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4SlFVRkpMRU5CUVVNc1lVRkJZU3hEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUVR0UFFVRkRMRTFCUVVzc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4VlFVRlRMRU5CUVVNc1JVRkJRenRCUVVGRExGTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUVR0UFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlFUdExRVUZETEUxQlFVc3NTVUZCU1N4RFFVRkRMR0ZCUVdFc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVFN1IwRkJReXhGUVVGRExFTkJRVU1zUTBGQlF5eFRRVUZUTEVOQlFVTXNWVUZCVlN4SFFVRkRMRlZCUVZNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVTTdRVUZCUXl4UlFVRkpMRU5CUVVNc1IwRkJReXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRXRCUVVjc1JVRkJSU3hMUVVGSExFbEJRVWtzUTBGQlF5eFZRVUZWTEVWQlFVVXNSVUZCUXl4RFFVRkRMRXRCUVVjc1JVRkJSU3hIUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVNc1NVRkJTU3hEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRU5CUVVFc1FVRkJReXhGUVVGRExFTkJRVU1zUzBGQlJ5eEpRVUZKTEVOQlFVTXNWVUZCVlN4SlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkJPMGRCUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zVTBGQlV5eERRVUZETEdGQlFXRXNSMEZCUXl4VlFVRlRMRU5CUVVNc1JVRkJReXhEUVVGRExFVkJRVU03UVVGQlF5eFJRVUZKTEVOQlFVTXNSMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eExRVUZMTEVOQlFVTXNSVUZCUXl4VlFVRlRMRU5CUVVNc1JVRkJRenRCUVVGRExFOUJRVU1zUTBGQlF5eFZRVUZWTEVOQlFVTXNSVUZCUlN4RlFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlFUdExRVUZETEVWQlFVTXNWVUZCVXl4RFFVRkRMRVZCUVVNN1FVRkJReXhQUVVGRExFTkJRVU1zVlVGQlZTeERRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFTkJRVUU3UzBGQlF5eERRVUZETEVOQlFVRTdSMEZCUXl4RFFVRkRMRWxCUVVrc1JVRkJSU3hIUVVGRExFTkJRVU03VFVGQlF5eEZRVUZGTEVkQlFVTXNSVUZCUXl4UFFVRlBMRVZCUVVNc1JVRkJSU3hGUVVGRExGRkJRVkVzUlVGQlF5eEZRVUZGTEVWQlFVTXNRMEZCUXl4VlFVRlZMRWxCUVVVc1QwRkJUeXhOUVVGTkxFbEJRVVVzVFVGQlRTeERRVUZETEVkQlFVY3NSMEZCUXl4TlFVRk5MRU5CUVVNc1dVRkJWVHRCUVVGRExGZEJRVThzUlVGQlJTeERRVUZCTzBkQlFVTXNRMEZCUXl4SFFVRkRMRmRCUVZjc1NVRkJSU3hQUVVGUExFMUJRVTBzU1VGQlJTeE5RVUZOTEVOQlFVTXNUMEZCVHl4SFFVRkRMRTFCUVUwc1EwRkJReXhQUVVGUExFZEJRVU1zUlVGQlJTeEhRVUZETEZkQlFWY3NTVUZCUlN4UFFVRlBMRWxCUVVrc1MwRkJSeXhKUVVGSkxFTkJRVU1zVlVGQlZTeEhRVUZETEVWQlFVVXNRMEZCUVN4QlFVRkRMRVZCUVVNc1JVRkJSU3hGUVVGRkxFTkJRVUU3UTBGQlF5eERRVUZCTEVOQlFVVXNTVUZCU1N4WFFVRk5MRU5CUVVNaUxDSm1hV3hsSWpvaVoyVnVaWEpoZEdWa0xtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTkRiMjUwWlc1MElqcGJJaThxSVZ4dUlDb2dRRzkyWlhKMmFXVjNJR1Z6Tmkxd2NtOXRhWE5sSUMwZ1lTQjBhVzU1SUdsdGNHeGxiV1Z1ZEdGMGFXOXVJRzltSUZCeWIyMXBjMlZ6TDBFckxseHVJQ29nUUdOdmNIbHlhV2RvZENCRGIzQjVjbWxuYUhRZ0tHTXBJREl3TVRRZ1dXVm9kV1JoSUV0aGRIb3NJRlJ2YlNCRVlXeGxMQ0JUZEdWbVlXNGdVR1Z1Ym1WeUlHRnVaQ0JqYjI1MGNtbGlkWFJ2Y25NZ0tFTnZiblpsY25OcGIyNGdkRzhnUlZNMklFRlFTU0JpZVNCS1lXdGxJRUZ5WTJocFltRnNaQ2xjYmlBcUlFQnNhV05sYm5ObElDQWdUR2xqWlc1elpXUWdkVzVrWlhJZ1RVbFVJR3hwWTJWdWMyVmNiaUFxSUNBZ0lDQWdJQ0FnSUNBZ1UyVmxJR2gwZEhCek9pOHZjbUYzTG1kcGRHaDFZblZ6WlhKamIyNTBaVzUwTG1OdmJTOXFZV3RsWVhKamFHbGlZV3hrTDJWek5pMXdjbTl0YVhObEwyMWhjM1JsY2k5TVNVTkZUbE5GWEc0Z0tpQkFkbVZ5YzJsdmJpQWdJRE11TWk0eFhHNGdLaTljYmx4dUtHWjFibU4wYVc5dUtDbDdYQ0oxYzJVZ2MzUnlhV04wWENJN1puVnVZM1JwYjI0Z2RDaDBLWHR5WlhSMWNtNWNJbVoxYm1OMGFXOXVYQ0k5UFhSNWNHVnZaaUIwZkh4Y0ltOWlhbVZqZEZ3aVBUMTBlWEJsYjJZZ2RDWW1iblZzYkNFOVBYUjlablZ1WTNScGIyNGdaU2gwS1h0eVpYUjFjbTVjSW1aMWJtTjBhVzl1WENJOVBYUjVjR1Z2WmlCMGZXWjFibU4wYVc5dUlHNG9kQ2w3UnoxMGZXWjFibU4wYVc5dUlISW9kQ2w3VVQxMGZXWjFibU4wYVc5dUlHOG9LWHR5WlhSMWNtNGdablZ1WTNScGIyNG9LWHR3Y205alpYTnpMbTVsZUhSVWFXTnJLR0VwZlgxbWRXNWpkR2x2YmlCcEtDbDdjbVYwZFhKdUlHWjFibU4wYVc5dUtDbDdRaWhoS1gxOVpuVnVZM1JwYjI0Z2N5Z3BlM1poY2lCMFBUQXNaVDF1WlhjZ1dDaGhLU3h1UFdSdlkzVnRaVzUwTG1OeVpXRjBaVlJsZUhST2IyUmxLRndpWENJcE8zSmxkSFZ5YmlCbExtOWljMlZ5ZG1Vb2JpeDdZMmhoY21GamRHVnlSR0YwWVRvaE1IMHBMR1oxYm1OMGFXOXVLQ2w3Ymk1a1lYUmhQWFE5S3l0MEpUSjlmV1oxYm1OMGFXOXVJSFVvS1h0MllYSWdkRDF1WlhjZ1RXVnpjMkZuWlVOb1lXNXVaV3c3Y21WMGRYSnVJSFF1Y0c5eWRERXViMjV0WlhOellXZGxQV0VzWm5WdVkzUnBiMjRvS1h0MExuQnZjblF5TG5CdmMzUk5aWE56WVdkbEtEQXBmWDFtZFc1amRHbHZiaUJqS0NsN2NtVjBkWEp1SUdaMWJtTjBhVzl1S0NsN2MyVjBWR2x0Wlc5MWRDaGhMREVwZlgxbWRXNWpkR2x2YmlCaEtDbDdabTl5S0haaGNpQjBQVEE3U2o1ME8zUXJQVElwZTNaaGNpQmxQWFIwVzNSZExHNDlkSFJiZENzeFhUdGxLRzRwTEhSMFczUmRQWFp2YVdRZ01DeDBkRnQwS3pGZFBYWnZhV1FnTUgxS1BUQjlablZ1WTNScGIyNGdaaWdwZTNSeWVYdDJZWElnZEQxeVpYRjFhWEpsTEdVOWRDaGNJblpsY25SNFhDSXBPM0psZEhWeWJpQkNQV1V1Y25WdVQyNU1iMjl3Zkh4bExuSjFiazl1UTI5dWRHVjRkQ3hwS0NsOVkyRjBZMmdvYmlsN2NtVjBkWEp1SUdNb0tYMTlablZ1WTNScGIyNGdiQ2gwTEdVcGUzWmhjaUJ1UFhSb2FYTXNjajF1WlhjZ2RHaHBjeTVqYjI1emRISjFZM1J2Y2lod0tUdDJiMmxrSURBOVBUMXlXM0owWFNZbWF5aHlLVHQyWVhJZ2J6MXVMbDl6ZEdGMFpUdHBaaWh2S1h0MllYSWdhVDFoY21kMWJXVnVkSE5iYnkweFhUdFJLR1oxYm1OMGFXOXVLQ2w3ZUNodkxISXNhU3h1TGw5eVpYTjFiSFFwZlNsOVpXeHpaU0JGS0c0c2NpeDBMR1VwTzNKbGRIVnliaUJ5ZldaMWJtTjBhVzl1SUdnb2RDbDdkbUZ5SUdVOWRHaHBjenRwWmloMEppWmNJbTlpYW1WamRGd2lQVDEwZVhCbGIyWWdkQ1ltZEM1amIyNXpkSEoxWTNSdmNqMDlQV1VwY21WMGRYSnVJSFE3ZG1GeUlHNDlibVYzSUdVb2NDazdjbVYwZFhKdUlHY29iaXgwS1N4dWZXWjFibU4wYVc5dUlIQW9LWHQ5Wm5WdVkzUnBiMjRnWHlncGUzSmxkSFZ5YmlCdVpYY2dWSGx3WlVWeWNtOXlLRndpV1c5MUlHTmhibTV2ZENCeVpYTnZiSFpsSUdFZ2NISnZiV2x6WlNCM2FYUm9JR2wwYzJWc1psd2lLWDFtZFc1amRHbHZiaUJrS0NsN2NtVjBkWEp1SUc1bGR5QlVlWEJsUlhKeWIzSW9YQ0pCSUhCeWIyMXBjMlZ6SUdOaGJHeGlZV05ySUdOaGJtNXZkQ0J5WlhSMWNtNGdkR2hoZENCellXMWxJSEJ5YjIxcGMyVXVYQ0lwZldaMWJtTjBhVzl1SUhZb2RDbDdkSEo1ZTNKbGRIVnliaUIwTG5Sb1pXNTlZMkYwWTJnb1pTbDdjbVYwZFhKdUlIVjBMbVZ5Y205eVBXVXNkWFI5ZldaMWJtTjBhVzl1SUhrb2RDeGxMRzRzY2lsN2RISjVlM1F1WTJGc2JDaGxMRzRzY2lsOVkyRjBZMmdvYnlsN2NtVjBkWEp1SUc5OWZXWjFibU4wYVc5dUlHMG9kQ3hsTEc0cGUxRW9ablZ1WTNScGIyNG9kQ2w3ZG1GeUlISTlJVEVzYnoxNUtHNHNaU3htZFc1amRHbHZiaWh1S1h0eWZId29jajBoTUN4bElUMDliajluS0hRc2JpazZVeWgwTEc0cEtYMHNablZ1WTNScGIyNG9aU2w3Y254OEtISTlJVEFzYWloMExHVXBLWDBzWENKVFpYUjBiR1U2SUZ3aUt5aDBMbDlzWVdKbGJIeDhYQ0lnZFc1cmJtOTNiaUJ3Y205dGFYTmxYQ0lwS1RzaGNpWW1ieVltS0hJOUlUQXNhaWgwTEc4cEtYMHNkQ2w5Wm5WdVkzUnBiMjRnWWloMExHVXBlMlV1WDNOMFlYUmxQVDA5YVhRL1V5aDBMR1V1WDNKbGMzVnNkQ2s2WlM1ZmMzUmhkR1U5UFQxemREOXFLSFFzWlM1ZmNtVnpkV3gwS1RwRktHVXNkbTlwWkNBd0xHWjFibU4wYVc5dUtHVXBlMmNvZEN4bEtYMHNablZ1WTNScGIyNG9aU2w3YWloMExHVXBmU2w5Wm5WdVkzUnBiMjRnZHloMExHNHNjaWw3Ymk1amIyNXpkSEoxWTNSdmNqMDlQWFF1WTI5dWMzUnlkV04wYjNJbUpuSTlQVDFsZENZbVkyOXVjM1J5ZFdOMGIzSXVjbVZ6YjJ4MlpUMDlQVzUwUDJJb2RDeHVLVHB5UFQwOWRYUS9haWgwTEhWMExtVnljbTl5S1RwMmIybGtJREE5UFQxeVAxTW9kQ3h1S1RwbEtISXBQMjBvZEN4dUxISXBPbE1vZEN4dUtYMW1kVzVqZEdsdmJpQm5LR1VzYmlsN1pUMDlQVzQvYWlobExGOG9LU2s2ZENodUtUOTNLR1VzYml4MktHNHBLVHBUS0dVc2JpbDlablZ1WTNScGIyNGdRU2gwS1h0MExsOXZibVZ5Y205eUppWjBMbDl2Ym1WeWNtOXlLSFF1WDNKbGMzVnNkQ2tzVkNoMEtYMW1kVzVqZEdsdmJpQlRLSFFzWlNsN2RDNWZjM1JoZEdVOVBUMXZkQ1ltS0hRdVgzSmxjM1ZzZEQxbExIUXVYM04wWVhSbFBXbDBMREFoUFQxMExsOXpkV0p6WTNKcFltVnljeTVzWlc1bmRHZ21KbEVvVkN4MEtTbDlablZ1WTNScGIyNGdhaWgwTEdVcGUzUXVYM04wWVhSbFBUMDliM1FtSmloMExsOXpkR0YwWlQxemRDeDBMbDl5WlhOMWJIUTlaU3hSS0VFc2RDa3BmV1oxYm1OMGFXOXVJRVVvZEN4bExHNHNjaWw3ZG1GeUlHODlkQzVmYzNWaWMyTnlhV0psY25Nc2FUMXZMbXhsYm1kMGFEdDBMbDl2Ym1WeWNtOXlQVzUxYkd3c2IxdHBYVDFsTEc5YmFTdHBkRjA5Yml4dlcya3JjM1JkUFhJc01EMDlQV2ttSm5RdVgzTjBZWFJsSmlaUktGUXNkQ2w5Wm5WdVkzUnBiMjRnVkNoMEtYdDJZWElnWlQxMExsOXpkV0p6WTNKcFltVnljeXh1UFhRdVgzTjBZWFJsTzJsbUtEQWhQVDFsTG14bGJtZDBhQ2w3Wm05eUtIWmhjaUJ5TEc4c2FUMTBMbDl5WlhOMWJIUXNjejB3TzNNOFpTNXNaVzVuZEdnN2N5czlNeWx5UFdWYmMxMHNiejFsVzNNcmJsMHNjajk0S0c0c2NpeHZMR2twT204b2FTazdkQzVmYzNWaWMyTnlhV0psY25NdWJHVnVaM1JvUFRCOWZXWjFibU4wYVc5dUlFMG9LWHQwYUdsekxtVnljbTl5UFc1MWJHeDlablZ1WTNScGIyNGdVQ2gwTEdVcGUzUnllWHR5WlhSMWNtNGdkQ2hsS1gxallYUmphQ2h1S1h0eVpYUjFjbTRnWTNRdVpYSnliM0k5Yml4amRIMTlablZ1WTNScGIyNGdlQ2gwTEc0c2NpeHZLWHQyWVhJZ2FTeHpMSFVzWXl4aFBXVW9jaWs3YVdZb1lTbDdhV1lvYVQxUUtISXNieWtzYVQwOVBXTjBQeWhqUFNFd0xITTlhUzVsY25KdmNpeHBQVzUxYkd3cE9uVTlJVEFzYmowOVBXa3BjbVYwZFhKdUlIWnZhV1FnYWlodUxHUW9LU2w5Wld4elpTQnBQVzhzZFQwaE1EdHVMbDl6ZEdGMFpTRTlQVzkwZkh3b1lTWW1kVDluS0c0c2FTazZZejlxS0c0c2N5azZkRDA5UFdsMFAxTW9iaXhwS1RwMFBUMDljM1FtSm1vb2JpeHBLU2w5Wm5WdVkzUnBiMjRnUXloMExHVXBlM1J5ZVh0bEtHWjFibU4wYVc5dUtHVXBlMmNvZEN4bEtYMHNablZ1WTNScGIyNG9aU2w3YWloMExHVXBmU2w5WTJGMFkyZ29iaWw3YWloMExHNHBmWDFtZFc1amRHbHZiaUJQS0NsN2NtVjBkWEp1SUdGMEt5dDlablZ1WTNScGIyNGdheWgwS1h0MFczSjBYVDFoZENzckxIUXVYM04wWVhSbFBYWnZhV1FnTUN4MExsOXlaWE4xYkhROWRtOXBaQ0F3TEhRdVgzTjFZbk5qY21saVpYSnpQVnRkZldaMWJtTjBhVzl1SUZrb2RDbDdjbVYwZFhKdUlHNWxkeUJmZENoMGFHbHpMSFFwTG5CeWIyMXBjMlY5Wm5WdVkzUnBiMjRnY1NoMEtYdDJZWElnWlQxMGFHbHpPM0psZEhWeWJpQnVaWGNnWlNoSktIUXBQMloxYm1OMGFXOXVLRzRzY2lsN1ptOXlLSFpoY2lCdlBYUXViR1Z1WjNSb0xHazlNRHR2UG1rN2FTc3JLV1V1Y21WemIyeDJaU2gwVzJsZEtTNTBhR1Z1S0c0c2NpbDlPbVoxYm1OMGFXOXVLSFFzWlNsN1pTaHVaWGNnVkhsd1pVVnljbTl5S0Z3aVdXOTFJRzExYzNRZ2NHRnpjeUJoYmlCaGNuSmhlU0IwYnlCeVlXTmxMbHdpS1NsOUtYMW1kVzVqZEdsdmJpQkdLSFFwZTNaaGNpQmxQWFJvYVhNc2JqMXVaWGNnWlNod0tUdHlaWFIxY200Z2FpaHVMSFFwTEc1OVpuVnVZM1JwYjI0Z1JDZ3BlM1JvY205M0lHNWxkeUJVZVhCbFJYSnliM0lvWENKWmIzVWdiWFZ6ZENCd1lYTnpJR0VnY21WemIyeDJaWElnWm5WdVkzUnBiMjRnWVhNZ2RHaGxJR1pwY25OMElHRnlaM1Z0Wlc1MElIUnZJSFJvWlNCd2NtOXRhWE5sSUdOdmJuTjBjblZqZEc5eVhDSXBmV1oxYm1OMGFXOXVJRXNvS1h0MGFISnZkeUJ1WlhjZ1ZIbHdaVVZ5Y205eUtGd2lSbUZwYkdWa0lIUnZJR052Ym5OMGNuVmpkQ0FuVUhKdmJXbHpaU2M2SUZCc1pXRnpaU0IxYzJVZ2RHaGxJQ2R1WlhjbklHOXdaWEpoZEc5eUxDQjBhR2x6SUc5aWFtVmpkQ0JqYjI1emRISjFZM1J2Y2lCallXNXViM1FnWW1VZ1kyRnNiR1ZrSUdGeklHRWdablZ1WTNScGIyNHVYQ0lwZldaMWJtTjBhVzl1SUV3b2RDbDdkR2hwYzF0eWRGMDlUeWdwTEhSb2FYTXVYM0psYzNWc2REMTBhR2x6TGw5emRHRjBaVDEyYjJsa0lEQXNkR2hwY3k1ZmMzVmljMk55YVdKbGNuTTlXMTBzY0NFOVBYUW1KaWhjSW1aMWJtTjBhVzl1WENJaFBYUjVjR1Z2WmlCMEppWkVLQ2tzZEdocGN5QnBibk4wWVc1alpXOW1JRXcvUXloMGFHbHpMSFFwT2tzb0tTbDlablZ1WTNScGIyNGdUaWgwTEdVcGUzUm9hWE11WDJsdWMzUmhibU5sUTI5dWMzUnlkV04wYjNJOWRDeDBhR2x6TG5CeWIyMXBjMlU5Ym1WM0lIUW9jQ2tzZEdocGN5NXdjbTl0YVhObFczSjBYWHg4YXloMGFHbHpMbkJ5YjIxcGMyVXBMRUZ5Y21GNUxtbHpRWEp5WVhrb1pTay9LSFJvYVhNdVgybHVjSFYwUFdVc2RHaHBjeTVzWlc1bmRHZzlaUzVzWlc1bmRHZ3NkR2hwY3k1ZmNtVnRZV2x1YVc1blBXVXViR1Z1WjNSb0xIUm9hWE11WDNKbGMzVnNkRDF1WlhjZ1FYSnlZWGtvZEdocGN5NXNaVzVuZEdncExEQTlQVDEwYUdsekxteGxibWQwYUQ5VEtIUm9hWE11Y0hKdmJXbHpaU3gwYUdsekxsOXlaWE4xYkhRcE9paDBhR2x6TG14bGJtZDBhRDEwYUdsekxteGxibWQwYUh4OE1DeDBhR2x6TGw5bGJuVnRaWEpoZEdVb0tTd3dQVDA5ZEdocGN5NWZjbVZ0WVdsdWFXNW5KaVpUS0hSb2FYTXVjSEp2YldselpTeDBhR2x6TGw5eVpYTjFiSFFwS1NrNmFpaDBhR2x6TG5CeWIyMXBjMlVzVlNncEtYMW1kVzVqZEdsdmJpQlZLQ2w3Y21WMGRYSnVJRzVsZHlCRmNuSnZjaWhjSWtGeWNtRjVJRTFsZEdodlpITWdiWFZ6ZENCaVpTQndjbTkyYVdSbFpDQmhiaUJCY25KaGVWd2lLWDFtZFc1amRHbHZiaUJYS0NsN2RtRnlJSFE3YVdZb1hDSjFibVJsWm1sdVpXUmNJaUU5ZEhsd1pXOW1JR2RzYjJKaGJDbDBQV2RzYjJKaGJEdGxiSE5sSUdsbUtGd2lkVzVrWldacGJtVmtYQ0loUFhSNWNHVnZaaUJ6Wld4bUtYUTljMlZzWmp0bGJITmxJSFJ5ZVh0MFBVWjFibU4wYVc5dUtGd2ljbVYwZFhKdUlIUm9hWE5jSWlrb0tYMWpZWFJqYUNobEtYdDBhSEp2ZHlCdVpYY2dSWEp5YjNJb1hDSndiMng1Wm1sc2JDQm1ZV2xzWldRZ1ltVmpZWFZ6WlNCbmJHOWlZV3dnYjJKcVpXTjBJR2x6SUhWdVlYWmhhV3hoWW14bElHbHVJSFJvYVhNZ1pXNTJhWEp2Ym0xbGJuUmNJaWw5ZG1GeUlHNDlkQzVRY205dGFYTmxPeWdoYm54OFhDSmJiMkpxWldOMElGQnliMjFwYzJWZFhDSWhQVDFQWW1wbFkzUXVjSEp2ZEc5MGVYQmxMblJ2VTNSeWFXNW5MbU5oYkd3b2JpNXlaWE52YkhabEtDa3BmSHh1TG1OaGMzUXBKaVlvZEM1UWNtOXRhWE5sUFhCMEtYMTJZWElnZWp0NlBVRnljbUY1TG1selFYSnlZWGsvUVhKeVlYa3VhWE5CY25KaGVUcG1kVzVqZEdsdmJpaDBLWHR5WlhSMWNtNWNJbHR2WW1wbFkzUWdRWEp5WVhsZFhDSTlQVDFQWW1wbFkzUXVjSEp2ZEc5MGVYQmxMblJ2VTNSeWFXNW5MbU5oYkd3b2RDbDlPM1poY2lCQ0xFY3NTQ3hKUFhvc1NqMHdMRkU5Wm5WdVkzUnBiMjRvZEN4bEtYdDBkRnRLWFQxMExIUjBXMG9yTVYwOVpTeEtLejB5TERJOVBUMUtKaVlvUno5SEtHRXBPa2dvS1NsOUxGSTlYQ0oxYm1SbFptbHVaV1JjSWlFOWRIbHdaVzltSUhkcGJtUnZkejkzYVc1a2IzYzZkbTlwWkNBd0xGWTlVbng4ZTMwc1dEMVdMazExZEdGMGFXOXVUMkp6WlhKMlpYSjhmRll1VjJWaVMybDBUWFYwWVhScGIyNVBZbk5sY25abGNpeGFQVndpZFc1a1pXWnBibVZrWENJOVBYUjVjR1Z2WmlCelpXeG1KaVpjSW5WdVpHVm1hVzVsWkZ3aUlUMTBlWEJsYjJZZ2NISnZZMlZ6Y3lZbVhDSmJiMkpxWldOMElIQnliMk5sYzNOZFhDSTlQVDE3ZlM1MGIxTjBjbWx1Wnk1allXeHNLSEJ5YjJObGMzTXBMQ1E5WENKMWJtUmxabWx1WldSY0lpRTlkSGx3Wlc5bUlGVnBiblE0UTJ4aGJYQmxaRUZ5Y21GNUppWmNJblZ1WkdWbWFXNWxaRndpSVQxMGVYQmxiMllnYVcxd2IzSjBVMk55YVhCMGN5WW1YQ0oxYm1SbFptbHVaV1JjSWlFOWRIbHdaVzltSUUxbGMzTmhaMlZEYUdGdWJtVnNMSFIwUFc1bGR5QkJjbkpoZVNneFpUTXBPMGc5V2o5dktDazZXRDl6S0NrNkpEOTFLQ2s2ZG05cFpDQXdQVDA5VWlZbVhDSm1kVzVqZEdsdmJsd2lQVDEwZVhCbGIyWWdjbVZ4ZFdseVpUOW1LQ2s2WXlncE8zWmhjaUJsZEQxc0xHNTBQV2dzY25ROVRXRjBhQzV5WVc1a2IyMG9LUzUwYjFOMGNtbHVaeWd6TmlrdWMzVmljM1J5YVc1bktERTJLU3h2ZEQxMmIybGtJREFzYVhROU1TeHpkRDB5TEhWMFBXNWxkeUJOTEdOMFBXNWxkeUJOTEdGMFBUQXNablE5V1N4c2REMXhMR2gwUFVZc2NIUTlURHRNTG1Gc2JEMW1kQ3hNTG5KaFkyVTliSFFzVEM1eVpYTnZiSFpsUFc1MExFd3VjbVZxWldOMFBXaDBMRXd1WDNObGRGTmphR1ZrZFd4bGNqMXVMRXd1WDNObGRFRnpZWEE5Y2l4TUxsOWhjMkZ3UFZFc1RDNXdjbTkwYjNSNWNHVTllMk52Ym5OMGNuVmpkRzl5T2t3c2RHaGxianBsZEN4Y0ltTmhkR05vWENJNlpuVnVZM1JwYjI0b2RDbDdjbVYwZFhKdUlIUm9hWE11ZEdobGJpaHVkV3hzTEhRcGZYMDdkbUZ5SUY5MFBVNDdUaTV3Y205MGIzUjVjR1V1WDJWdWRXMWxjbUYwWlQxbWRXNWpkR2x2YmlncGUyWnZjaWgyWVhJZ2REMTBhR2x6TG14bGJtZDBhQ3hsUFhSb2FYTXVYMmx1Y0hWMExHNDlNRHQwYUdsekxsOXpkR0YwWlQwOVBXOTBKaVowUG00N2Jpc3JLWFJvYVhNdVgyVmhZMmhGYm5SeWVTaGxXMjVkTEc0cGZTeE9MbkJ5YjNSdmRIbHdaUzVmWldGamFFVnVkSEo1UFdaMWJtTjBhVzl1S0hRc1pTbDdkbUZ5SUc0OWRHaHBjeTVmYVc1emRHRnVZMlZEYjI1emRISjFZM1J2Y2l4eVBXNHVjbVZ6YjJ4MlpUdHBaaWh5UFQwOWJuUXBlM1poY2lCdlBYWW9kQ2s3YVdZb2J6MDlQV1YwSmlaMExsOXpkR0YwWlNFOVBXOTBLWFJvYVhNdVgzTmxkSFJzWldSQmRDaDBMbDl6ZEdGMFpTeGxMSFF1WDNKbGMzVnNkQ2s3Wld4elpTQnBaaWhjSW1aMWJtTjBhVzl1WENJaFBYUjVjR1Z2WmlCdktYUm9hWE11WDNKbGJXRnBibWx1WnkwdExIUm9hWE11WDNKbGMzVnNkRnRsWFQxME8yVnNjMlVnYVdZb2JqMDlQWEIwS1h0MllYSWdhVDF1WlhjZ2JpaHdLVHQzS0drc2RDeHZLU3gwYUdsekxsOTNhV3hzVTJWMGRHeGxRWFFvYVN4bEtYMWxiSE5sSUhSb2FYTXVYM2RwYkd4VFpYUjBiR1ZCZENodVpYY2diaWhtZFc1amRHbHZiaWhsS1h0bEtIUXBmU2tzWlNsOVpXeHpaU0IwYUdsekxsOTNhV3hzVTJWMGRHeGxRWFFvY2loMEtTeGxLWDBzVGk1d2NtOTBiM1I1Y0dVdVgzTmxkSFJzWldSQmREMW1kVzVqZEdsdmJpaDBMR1VzYmlsN2RtRnlJSEk5ZEdocGN5NXdjbTl0YVhObE8zSXVYM04wWVhSbFBUMDliM1FtSmloMGFHbHpMbDl5WlcxaGFXNXBibWN0TFN4MFBUMDljM1EvYWloeUxHNHBPblJvYVhNdVgzSmxjM1ZzZEZ0bFhUMXVLU3d3UFQwOWRHaHBjeTVmY21WdFlXbHVhVzVuSmlaVEtISXNkR2hwY3k1ZmNtVnpkV3gwS1gwc1RpNXdjbTkwYjNSNWNHVXVYM2RwYkd4VFpYUjBiR1ZCZEQxbWRXNWpkR2x2YmloMExHVXBlM1poY2lCdVBYUm9hWE03UlNoMExIWnZhV1FnTUN4bWRXNWpkR2x2YmloMEtYdHVMbDl6WlhSMGJHVmtRWFFvYVhRc1pTeDBLWDBzWm5WdVkzUnBiMjRvZENsN2JpNWZjMlYwZEd4bFpFRjBLSE4wTEdVc2RDbDlLWDA3ZG1GeUlHUjBQVmNzZG5ROWUxQnliMjFwYzJVNmNIUXNjRzlzZVdacGJHdzZaSFI5TzF3aVpuVnVZM1JwYjI1Y0lqMDlkSGx3Wlc5bUlHUmxabWx1WlNZbVpHVm1hVzVsTG1GdFpEOWtaV1pwYm1Vb1puVnVZM1JwYjI0b0tYdHlaWFIxY200Z2RuUjlLVHBjSW5WdVpHVm1hVzVsWkZ3aUlUMTBlWEJsYjJZZ2JXOWtkV3hsSmladGIyUjFiR1V1Wlhod2IzSjBjejl0YjJSMWJHVXVaWGh3YjNKMGN6MTJkRHBjSW5WdVpHVm1hVzVsWkZ3aUlUMTBlWEJsYjJZZ2RHaHBjeVltS0hSb2FYTXVSVk0yVUhKdmJXbHpaVDEyZENrc1pIUW9LWDBwTG1OaGJHd29kR2hwY3lrN0lsMTkiLCJpbXBvcnQgJy4uL2xpYi9lczYtcHJvbWlzZS5taW4uanMnXG5pbXBvcnQgVGVtcGxhdGVzIGZyb20gXCIuLi9UZW1wbGF0ZXNcIlxuaW1wb3J0IExvZ2luQ2hlY2sgZnJvbSBcIi4uL0xvZ2luQ2hlY2tcIlxuaW1wb3J0IHsgZ2V0SlNPTiwgcm91bmQgfSBmcm9tIFwiLi4vaGVscGVyc1wiXG5pbXBvcnQgQVBJLCB7IFRCQSwgZ2V0VGVhbXMsIGdldFRlYW1TdGF0cyB9IGZyb20gXCIuLi9BUElcIlxuXG5leHBvcnQgZnVuY3Rpb24gZXZlbnQoa2V5KSB7XG4gIFByb21pc2UuYWxsKFtcbiAgICBMb2dpbkNoZWNrLmdldCgpLFxuICAgIFRlbXBsYXRlcy5nZXQoXCJldmVudFwiKSxcbiAgICBnZXRKU09OKFwic3RhdHMtY29uZmlnLmpzb25cIiksXG4gICAgVEJBLmdldChcImV2ZW50L1wiK2tleSksXG4gIF0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgY29uc3QgWywgdGVtcGxhdGUsIHN0YXRzLCBldmVudF0gPSByZXM7XG4gICAgY29uc3QgJGNvbnRhaW5lciA9ICQoXCIjbWFpblwiKS5jbG9zZXN0KFwiLmNvbnRhaW5lclwiKTtcbiAgICBjb25zdCBjb250YWluZXJDbGFzcyA9ICRjb250YWluZXIuYXR0cihcImNsYXNzXCIpO1xuICAgIGNvbnN0IHJhY3RpdmUgPSBuZXcgUmFjdGl2ZSh7XG4gICAgICB0ZW1wbGF0ZTogdGVtcGxhdGUsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGtleToga2V5LFxuICAgICAgICBzdGF0Q29uZmlnOiBzdGF0cyxcbiAgICAgICAgbG9hZGluZzogdHJ1ZSxcbiAgICAgICAgdGVhbXM6IFtdLFxuICAgICAgICByb3VuZDogcm91bmQsXG4gICAgICAgIGV2ZW50OiBldmVudCxcbiAgICAgICAgc3RhdENvbG9yKHZhbHVlLCBzdGF0KSB7XG4gICAgICAgICAgY29uc3QgdmFsdWUgPSBwYXJzZUZsb2F0KHZhbHVlKTtcbiAgICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgc3RhdC5wcm9ncmVzcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKCghc3RhdC5wcm9ncmVzc1tpXS5taW4gfHwgdmFsdWUgPj0gc3RhdC5wcm9ncmVzc1tpXS5taW4pICYmICghc3RhdC5wcm9ncmVzc1tpXS5tYXggfHwgdmFsdWUgPD0gc3RhdC5wcm9ncmVzc1tpXS5tYXgpKSB7XG4gICAgICAgICAgICAgIHJldHVybiBzdGF0LnByb2dyZXNzW2ldLmNsYXNzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgbW9iaWxlOiAkKHdpbmRvdykud2lkdGgoKSA8IDkwMCxcbiAgICAgICAgdG9rZW46IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpLFxuICAgICAgICB1c2VyOiB7XG4gICAgICAgICAgbmFtZTogbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VzZXIubmFtZScpIHx8ICcnLFxuICAgICAgICAgIHRlYW06IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1c2VyLnRlYW0nKSB8fCAnJ1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgY29tcHV0ZWQ6IHtcbiAgICAgICAgbW9iaWxlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gJCh3aW5kb3cpLndpZHRoKCkgPCA5MDA7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBvbnJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICRjb250YWluZXIuYWRkQ2xhc3MoXCJ3aWRlXCIpO1xuICAgICAgfSxcbiAgICAgIG9udW5yZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAkY29udGFpbmVyLmF0dHIoXCJjbGFzc1wiLCBjb250YWluZXJDbGFzcyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICBnZXRUZWFtcyhBUEksIGtleSkudGhlbihmdW5jdGlvbih0ZWFtcykge1xuICAgICAgY29uc29sZS5sb2codGVhbXMpXG4gICAgICByYWN0aXZlLnNldCh7XG4gICAgICAgIHRlYW1zOiB0ZWFtcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICByZXR1cm4gYS50ZWFtX251bWJlciAtIGIudGVhbV9udW1iZXJcbiAgICAgICAgfSksXG4gICAgICAgIGxvYWRpbmc6IGZhbHNlXG4gICAgICB9KTtcbiAgICAgIFNvcnRhYmxlLmluaXQoKTtcbiAgICB9KTtcbiAgfSk7XG59XG4iLCJpbXBvcnQgJy4uL2xpYi9lczYtcHJvbWlzZS5taW4uanMnXG5pbXBvcnQgVGVtcGxhdGVzIGZyb20gXCIuLi9UZW1wbGF0ZXNcIlxuaW1wb3J0IEFQSSwgeyBUQkEgfSBmcm9tIFwiLi4vQVBJXCJcbmltcG9ydCB7IHJvdW5kIH0gZnJvbSBcIi4uL2hlbHBlcnNcIlxuXG5leHBvcnQgZnVuY3Rpb24gZXZlbnRNYXRjaGVzKGV2ZW50S2V5KSB7XG4gIFByb21pc2UuYWxsKFtcbiAgICBUZW1wbGF0ZXMuZ2V0KFwiZXZlbnQtbWF0Y2hlc1wiKSxcbiAgICBUQkEuZ2V0KFwiZXZlbnQvXCIrZXZlbnRLZXkpLFxuICAgIFRCQS5nZXQoXCJldmVudC9cIitldmVudEtleStcIi9zdGF0c1wiKSxcbiAgXSkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICBjb25zdCBbdGVtcGxhdGUsIGV2ZW50LCBldmVudFN0YXRzXSA9IHJlcztcbiAgICBjb25zdCBwcmVkaWN0aW9uc0NvdW50cyA9IHtcbiAgICAgIFwib3Byc1wiOiBbXSxcbiAgICAgIFwiZHByc1wiOiBbXSxcbiAgICAgIFwiY2N3bXNcIjogW10sXG4gICAgICBcIm9yYlwiOiBbXVxuICAgIH07XG4gICAgY29uc3QgcmFjdGl2ZSA9IG5ldyBSYWN0aXZlKHtcbiAgICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZSxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgZXZlbnQ6IGV2ZW50LFxuICAgICAgICBldmVudFN0YXRzOiBldmVudFN0YXRzLFxuICAgICAgICBtYXRjaGVzOiBbXSxcbiAgICAgICAgbG9hZGluZzogMSxcbiAgICAgICAgbW9tZW50OiBmdW5jdGlvbihkYXRlKSB7XG4gICAgICAgICAgcmV0dXJuIG1vbWVudChkYXRlKS5mcm9tTm93KCk7XG4gICAgICAgIH0sXG4gICAgICAgIGdldEFsbGlhbmNlU3VtKHRlYW1zLCBrZXkpIHtcbiAgICAgICAgICByZXR1cm4gdGVhbXMubWFwKHRlYW0gPT4gZXZlbnRTdGF0c1trZXldW3RlYW0ucmVwbGFjZSgvW15cXGRdL2csICcnKV0pLnJlZHVjZSgoYSwgYikgPT4gYSArIGIpO1xuICAgICAgICB9LFxuICAgICAgICBnZXRXaW5uZXIocmVkVGVhbXMsIGJsdWVUZWFtcywga2V5KSB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0KFwiZ2V0QWxsaWFuY2VTdW1cIikocmVkVGVhbXMsIGtleSkgPiB0aGlzLmdldChcImdldEFsbGlhbmNlU3VtXCIpKGJsdWVUZWFtcywga2V5KTtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGNvbXB1dGVkOiB7XG4gICAgICAgIG1vYmlsZSgpIHtcbiAgICAgICAgICByZXR1cm4gJCh3aW5kb3cpLndpZHRoKCkgPCA5MDA7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSk7XG4gICAgVEJBLmdldChcImV2ZW50L1wiK2V2ZW50S2V5K1wiL21hdGNoZXNcIikudGhlbihmdW5jdGlvbihtYXRjaGVzKSB7XG4gICAgICByZXR1cm4gbWF0Y2hlcztcbiAgICB9KS50aGVuKGZ1bmN0aW9uKG1hdGNoZXMpIHtcbiAgICAgIGNvbnN0IHN1bSA9IHJhY3RpdmUuZ2V0KFwiZ2V0QWxsaWFuY2VTdW1cIikuYmluZChyYWN0aXZlKTtcbiAgICAgIGNvbnN0IHByZWRpY3RlZFdpbm5lciA9IHJhY3RpdmUuZ2V0KFwiZ2V0V2lubmVyXCIpLmJpbmQocmFjdGl2ZSk7XG4gICAgICBtYXRjaGVzLmZvckVhY2goZnVuY3Rpb24obWF0Y2gpIHtcbiAgICAgICAgY29uc3QgcmVkID0gbWF0Y2guYWxsaWFuY2VzLnJlZCxcbiAgICAgICAgICAgICAgYmx1ZSA9IG1hdGNoLmFsbGlhbmNlcy5ibHVlO1xuICAgICAgICBjb25zdCB3aW5uZXIgPSByZWQuc2NvcmUgPiBibHVlLnNjb3JlO1xuICAgICAgICBjb25zdCByZWRUZWFtcyA9IHJlZC50ZWFtcy5tYXAodGVhbSA9PiB0ZWFtLnJlcGxhY2UoL1teXFxkXS9nLCAnJykpXG4gICAgICAgIGNvbnN0IGJsdWVUZWFtcyA9IGJsdWUudGVhbXMubWFwKHRlYW0gPT4gdGVhbS5yZXBsYWNlKC9bXlxcZF0vZywgJycpKVxuICAgICAgICBjb25zdCBvcHJQcmVkID0gcHJlZGljdGVkV2lubmVyKHJlZFRlYW1zLCBibHVlVGVhbXMsICdvcHJzJylcbiAgICAgICAgY29uc3QgZHByUHJlZCA9IHByZWRpY3RlZFdpbm5lcihyZWRUZWFtcywgYmx1ZVRlYW1zLCAnZHBycycpXG4gICAgICAgIGNvbnN0IGNjd21QcmVkID0gcHJlZGljdGVkV2lubmVyKHJlZFRlYW1zLCBibHVlVGVhbXMsICdjY3dtcycpXG4gICAgICAgIHByZWRpY3Rpb25zQ291bnRzLm9wcnMucHVzaChvcHJQcmVkID09IHdpbm5lcilcbiAgICAgICAgcHJlZGljdGlvbnNDb3VudHMuZHBycy5wdXNoKGRwclByZWQgPT0gd2lubmVyKVxuICAgICAgICBwcmVkaWN0aW9uc0NvdW50cy5jY3dtcy5wdXNoKGNjd21QcmVkID09IHdpbm5lcilcbiAgICAgIH0pO1xuICAgICAgcmFjdGl2ZS5zZXQoe1xuICAgICAgICBtYXRjaGVzOiBtYXRjaGVzLnNvcnQoKGEsIGIpID0+IGEudGltZSAtIGIudGltZSksXG4gICAgICAgIGxvYWRpbmc6IDIsXG4gICAgICB9KTtcbiAgICAgIFByb21pc2UuYWxsKG1hdGNoZXMubWFwKG1hdGNoID0+IEFQSS5nZXQoYHdvcmsvbWF0Y2gvJHtldmVudEtleX0vJHttYXRjaC5rZXl9YCkpKS50aGVuKGZ1bmN0aW9uKG1hdGNoZXMpIHtcbiAgICAgICAgcmFjdGl2ZS5zZXQoXCJsb2FkaW5nXCIsIDApO1xuICAgICAgICByYWN0aXZlLnNldCh7XG4gICAgICAgICAgbWF0Y2hlczogcmFjdGl2ZS5nZXQoXCJtYXRjaGVzXCIpLm1hcCgobWF0Y2gsIGkpID0+IHtcbiAgICAgICAgICAgIG1hdGNoLnByZWRpY3Rpb25zID0gbWF0Y2hlc1tpXS5tYXAoc2NvcmUgPT4gcm91bmQoc2NvcmUsIDIpKTtcbiAgICAgICAgICAgIHJldHVybiBtYXRjaDtcbiAgICAgICAgICB9KSxcbiAgICAgICAgfSk7XG4gICAgICAgIHJhY3RpdmUuZ2V0KFwibWF0Y2hlc1wiKS5mb3JFYWNoKGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgICAgICAgY29uc3QgcmVkID0gbWF0Y2guYWxsaWFuY2VzLnJlZCxcbiAgICAgICAgICAgICAgICBibHVlID0gbWF0Y2guYWxsaWFuY2VzLmJsdWU7XG4gICAgICAgICAgY29uc3Qgd2lubmVyID0gcmVkLnNjb3JlID4gYmx1ZS5zY29yZTtcbiAgICAgICAgICBjb25zdCBvcmJQcmVkID0gbWF0Y2gucHJlZGljdGlvbnNbMF0gPiBtYXRjaC5wcmVkaWN0aW9uc1sxXTtcbiAgICAgICAgICBwcmVkaWN0aW9uc0NvdW50cy5vcmIucHVzaChvcmJQcmVkID09IHdpbm5lcilcbiAgICAgICAgfSlcbiAgICAgICAgY29uc29sZS5sb2cocHJlZGljdGlvbnNDb3VudHMub3JiKVxuICAgICAgICBjb25zb2xlLmxvZyhcIk9SQlwiLCBwcmVkaWN0aW9uc0NvdW50cy5vcmIuZmlsdGVyKEJvb2xlYW4pLmxlbmd0aC9wcmVkaWN0aW9uc0NvdW50cy5vcmIubGVuZ3RoKVxuICAgICAgICBjb25zb2xlLmxvZyhcIk9QUlwiLCBwcmVkaWN0aW9uc0NvdW50cy5vcHJzLmZpbHRlcihCb29sZWFuKS5sZW5ndGgvcHJlZGljdGlvbnNDb3VudHMub3Bycy5sZW5ndGgpXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfSk7XG59XG5cbi8qXG57eyNpZiBwcmVkaWN0aW9uc319XG4gIDxiPlByZWRpY3RlZDwvYj46XG4gIHt7I2lmIHByZWRpY3Rpb25zWzBdID4gcHJlZGljdGlvbnNbMV19fVxuICAgIDxzcGFuIGNsYXNzPVwicmVkXCI+UmVkPC9zcGFuPlxuICB7e2Vsc2V9fVxuICAgIDxzcGFuIGNsYXNzPVwiYmx1ZVwiPkJsdWU8L3NwYW4+XG4gIHt7L2lmfX1cbiAgKHt7cHJlZGljdGlvbnNbMF19fSAtIHt7cHJlZGljdGlvbnNbMV19fSlcbiAgPGJyPlxuICBPUFI6XG4gIHt7I2lmIGdldFdpbm5lcihhbGxpYW5jZXMucmVkLnRlYW1zLCBhbGxpYW5jZXMuYmx1ZS50ZWFtcywgJ29wcnMnKX19XG4gICAgPHNwYW4gY2xhc3M9XCJyZWRcIj5SZWQ8L3NwYW4+XG4gIHt7ZWxzZX19XG4gICAgPHNwYW4gY2xhc3M9XCJibHVlXCI+Qmx1ZTwvc3Bhbj5cbiAge3svaWZ9fVxuICAoe3tnZXRBbGxpYW5jZVN1bShhbGxpYW5jZXMucmVkLnRlYW1zLCAnb3BycycpfX0gLSB7e2dldEFsbGlhbmNlU3VtKGFsbGlhbmNlcy5ibHVlLnRlYW1zLCAnb3BycycpfX0pXG4gIDxicj5cbiAgRFBSOlxuICB7eyNpZiBnZXRXaW5uZXIoYWxsaWFuY2VzLnJlZC50ZWFtcywgYWxsaWFuY2VzLmJsdWUudGVhbXMsICdkcHJzJyl9fVxuICAgIDxzcGFuIGNsYXNzPVwicmVkXCI+UmVkPC9zcGFuPlxuICB7e2Vsc2V9fVxuICAgIDxzcGFuIGNsYXNzPVwiYmx1ZVwiPkJsdWU8L3NwYW4+XG4gIHt7L2lmfX1cbiAgKHt7Z2V0QWxsaWFuY2VTdW0oYWxsaWFuY2VzLnJlZC50ZWFtcywgJ2RwcnMnKX19IC0ge3tnZXRBbGxpYW5jZVN1bShhbGxpYW5jZXMuYmx1ZS50ZWFtcywgJ2RwcnMnKX19KVxuICA8YnI+XG4gIENDV006XG4gIHt7I2lmIGdldFdpbm5lcihhbGxpYW5jZXMucmVkLnRlYW1zLCBhbGxpYW5jZXMuYmx1ZS50ZWFtcywgJ2Njd21zJyl9fVxuICAgIDxzcGFuIGNsYXNzPVwicmVkXCI+UmVkPC9zcGFuPlxuICB7e2Vsc2V9fVxuICAgIDxzcGFuIGNsYXNzPVwiYmx1ZVwiPkJsdWU8L3NwYW4+XG4gIHt7L2lmfX1cbiAgKHt7Z2V0QWxsaWFuY2VTdW0oYWxsaWFuY2VzLnJlZC50ZWFtcywgJ2Njd21zJyl9fSAtIHt7Z2V0QWxsaWFuY2VTdW0oYWxsaWFuY2VzLmJsdWUudGVhbXMsICdjY3dtcycpfX0pXG57ey9pZn19Ki9cbiIsImltcG9ydCAnLi4vbGliL2VzNi1wcm9taXNlLm1pbi5qcydcbmltcG9ydCBUZW1wbGF0ZXMgZnJvbSBcIi4uL1RlbXBsYXRlc1wiXG5pbXBvcnQgTG9naW5DaGVjayBmcm9tIFwiLi4vTG9naW5DaGVja1wiXG5cbmV4cG9ydCBmdW5jdGlvbiBldmVudHMoa2V5KSB7XG4gIFByb21pc2UuYWxsKFtcbiAgICBMb2dpbkNoZWNrLmdldCgpLFxuICAgIFRlbXBsYXRlcy5nZXQoXCJldmVudHNcIiksXG4gIF0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgY29uc3QgWywgdGVtcGxhdGVdID0gcmVzO1xuICAgIGNvbnN0IHJhY3RpdmUgPSBuZXcgUmFjdGl2ZSh7XG4gICAgICB0ZW1wbGF0ZTogdGVtcGxhdGUsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGV2ZW50czoge1xuICAgICAgICAgIFwiMjAxNmFyY1wiOiBcIkFyY2hpbWVkZXNcIixcbiAgICAgICAgICBcIjIwMTZjYXJzXCI6IFwiQ2Fyc29uXCIsXG4gICAgICAgICAgXCIyMDE2Y2FydlwiOiBcIkNhcnZlclwiLFxuICAgICAgICAgIFwiMjAxNmN1clwiOiBcIkN1cmllXCIsXG4gICAgICAgICAgXCIyMDE2Z2FsXCI6IFwiR2FsaWxlb1wiLFxuICAgICAgICAgIFwiMjAxNmhvcFwiOiBcIkhvcHBlclwiLFxuICAgICAgICAgIFwiMjAxNm5ld1wiOiBcIk5ld3RvblwiLFxuICAgICAgICAgIFwiMjAxNnRlc1wiOiBcIlRlc2xhXCIsXG4gICAgICAgICAgXCIyMDE2Y21wXCI6IFwiRWluc3RlaW5cIixcbiAgICAgICAgfSxcbiAgICAgICAgbW9iaWxlOiAkKHdpbmRvdykud2lkdGgoKSA8IDkwMCxcbiAgICAgICAgdG9rZW46IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpLFxuICAgICAgICB1c2VyOiB7XG4gICAgICAgICAgbmFtZTogbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VzZXIubmFtZScpIHx8ICcnLFxuICAgICAgICAgIHRlYW06IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1c2VyLnRlYW0nKSB8fCAnJ1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgY29tcHV0ZWQ6IHtcbiAgICAgICAgbW9iaWxlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gJCh3aW5kb3cpLndpZHRoKCkgPCA5MDA7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSk7XG4gIH0pO1xufVxuIiwiaW1wb3J0ICcuLi9saWIvZXM2LXByb21pc2UubWluLmpzJ1xuaW1wb3J0IFRlbXBsYXRlcyBmcm9tIFwiLi4vVGVtcGxhdGVzXCJcbmltcG9ydCBMb2dpbkNoZWNrIGZyb20gXCIuLi9Mb2dpbkNoZWNrXCJcbmltcG9ydCB7XG4gIGdldEpTT04sXG4gIHJvdW5kXG59IGZyb20gXCIuLi9oZWxwZXJzXCJcbmltcG9ydCBBUEksIHtcbiAgZ2V0VGVhbVN0YXRzLFxuICBnZW5lcmF0ZVRva2VuXG59IGZyb20gXCIuLi9BUElcIlxuXG5leHBvcnQgZnVuY3Rpb24gbG9naW4oKSB7XG4gIFByb21pc2UuYWxsKFtcbiAgICBUZW1wbGF0ZXMuZ2V0KFwibG9naW5cIilcbiAgXSkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICBjb25zdCBbdGVtcGxhdGVdID0gcmVzO1xuICAgIGlmIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9rZW4nKSkge1xuICAgICAgbG9jYXRpb24uaGFzaCA9IFwiIy9hL2V2ZW50c1wiXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHJhY3RpdmUgPSBuZXcgUmFjdGl2ZSh7XG4gICAgICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZSxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIG1vYmlsZTogJCh3aW5kb3cpLndpZHRoKCkgPCA5MDAsXG4gICAgICAgICAgdG9rZW46IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpLFxuICAgICAgICAgIHVzZXI6IHtcbiAgICAgICAgICAgIG5hbWU6IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1c2VyLm5hbWUnKSB8fCAnJyxcbiAgICAgICAgICAgIHRlYW06IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1c2VyLnRlYW0nKSB8fCAnJ1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgICAgcmFjdGl2ZS5vbignbG9naW4nLCBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgIHZhciBuYW1lID0gdGhpcy5nZXQoXCJ1c2VyLm5hbWVcIik7XG4gICAgICAgIHZhciB0ZWFtID0gdGhpcy5nZXQoXCJ1c2VyLnRlYW1cIik7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwidXNlci5uYW1lXCIsIG5hbWUpO1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInVzZXIudGVhbVwiLCB0ZWFtKTtcbiAgICAgICAgdmFyIHRva2VuID0gZ2VuZXJhdGVUb2tlbih0ZWFtLCBuYW1lKTtcbiAgICAgICAgbG9jYXRpb24uaGFzaCA9IFwiIy9hL2V2ZW50c1wiO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9KTtcbiAgICB9XG4gIH0pLmNhdGNoKGNvbnNvbGUuZXJyb3IuYmluZChjb25zb2xlKSk7XG59XG4iLCJpbXBvcnQgJy4uL2xpYi9lczYtcHJvbWlzZS5taW4uanMnXG5pbXBvcnQgVGVtcGxhdGVzIGZyb20gXCIuLi9UZW1wbGF0ZXNcIlxuaW1wb3J0IExvZ2luQ2hlY2sgZnJvbSBcIi4uL0xvZ2luQ2hlY2tcIlxuaW1wb3J0IHsgZ2V0SlNPTiwgcm91bmQgfSBmcm9tIFwiLi4vaGVscGVyc1wiXG5pbXBvcnQgQVBJLCB7IGdldFRlYW1TdGF0cyB9IGZyb20gXCIuLi9BUElcIlxuXG5leHBvcnQgZnVuY3Rpb24gdGVhbShrZXkpIHtcbiAgUHJvbWlzZS5hbGwoW1xuICAgIExvZ2luQ2hlY2suZ2V0KCksXG4gICAgVGVtcGxhdGVzLmdldChcInRlYW1cIiksXG4gICAgZ2V0SlNPTihcInN0YXRzLWNvbmZpZy5qc29uXCIpLFxuICAgIGdldFRlYW1TdGF0cyhBUEksIGtleSksXG4gIF0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgY29uc3QgWywgdGVtcGxhdGUsIHN0YXRzLCB0ZWFtRGF0YV0gPSByZXM7XG4gICAgY29uc3QgcmFjdGl2ZSA9IG5ldyBSYWN0aXZlKHtcbiAgICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZSxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgc3RhdHM6IHN0YXRzLFxuICAgICAgICBzdGF0S2V5czogWydjYWxjcycsICdnb2FscycsICdkZWZlbnNlcycsICd0b3dlciddLFxuICAgICAgICBrZXk6IGtleSxcbiAgICAgICAgdGVhbTogdGVhbURhdGEsXG4gICAgICAgIHJvdW5kOiByb3VuZCxcbiAgICAgICAgbW9iaWxlOiAkKHdpbmRvdykud2lkdGgoKSA8IDkwMCxcbiAgICAgICAgdG9rZW46IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpLFxuICAgICAgICB1c2VyOiB7XG4gICAgICAgICAgbmFtZTogbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VzZXIubmFtZScpIHx8ICcnLFxuICAgICAgICAgIHRlYW06IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1c2VyLnRlYW0nKSB8fCAnJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH0pLmNhdGNoKGNvbnNvbGUuZXJyb3IuYmluZChjb25zb2xlKSk7XG59XG4iXX0=
