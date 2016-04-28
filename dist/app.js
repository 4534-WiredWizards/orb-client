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
      data: {},
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
        matches: matches,
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
          }) });
      });
    });
  });
}

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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvaG9tZS9kYW5pZWwvRG9jdW1lbnRzL3Byb2plY3RzL29yYi1jbGllbnQvc3JjL21haW4uanMiLCJub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwiL2hvbWUvZGFuaWVsL0RvY3VtZW50cy9wcm9qZWN0cy9vcmItY2xpZW50L3NyYy9BUEkuanMiLCIvaG9tZS9kYW5pZWwvRG9jdW1lbnRzL3Byb2plY3RzL29yYi1jbGllbnQvc3JjL0NvbXBvbmVudHMuanMiLCIvaG9tZS9kYW5pZWwvRG9jdW1lbnRzL3Byb2plY3RzL29yYi1jbGllbnQvc3JjL0xvZ2luQ2hlY2suanMiLCIvaG9tZS9kYW5pZWwvRG9jdW1lbnRzL3Byb2plY3RzL29yYi1jbGllbnQvc3JjL1BhZ2VzLmpzIiwiL2hvbWUvZGFuaWVsL0RvY3VtZW50cy9wcm9qZWN0cy9vcmItY2xpZW50L3NyYy9UZW1wbGF0ZXMuanMiLCIvaG9tZS9kYW5pZWwvRG9jdW1lbnRzL3Byb2plY3RzL29yYi1jbGllbnQvc3JjL2NhY2hlYWJsZS5qcyIsIi9ob21lL2RhbmllbC9Eb2N1bWVudHMvcHJvamVjdHMvb3JiLWNsaWVudC9zcmMvaGVscGVycy5qcyIsInNyYy9saWIvZXM2LXByb21pc2UubWluLmpzIiwiL2hvbWUvZGFuaWVsL0RvY3VtZW50cy9wcm9qZWN0cy9vcmItY2xpZW50L3NyYy9wYWdlcy9ldmVudC5qcyIsIi9ob21lL2RhbmllbC9Eb2N1bWVudHMvcHJvamVjdHMvb3JiLWNsaWVudC9zcmMvcGFnZXMvZXZlbnRNYXRjaGVzLmpzIiwiL2hvbWUvZGFuaWVsL0RvY3VtZW50cy9wcm9qZWN0cy9vcmItY2xpZW50L3NyYy9wYWdlcy9ldmVudHMuanMiLCIvaG9tZS9kYW5pZWwvRG9jdW1lbnRzL3Byb2plY3RzL29yYi1jbGllbnQvc3JjL3BhZ2VzL2xvZ2luLmpzIiwiL2hvbWUvZGFuaWVsL0RvY3VtZW50cy9wcm9q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RztBQUN2QixNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUIsT0FBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUU7QUFDeEMsU0FBSSxJQUFJLEdBQUcsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDLEVBQUU7QUFDM0IsWUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUNqQztHQUNGO0FBQ0QsU0FBTyxNQUFNLENBQUM7Q0FDZjs7O0FDMUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BPQSxZQUFZLENBQUM7O0FBRWIsSUFBSSxlQUFlLEdBQUcsU0FBQSxlQUFBLENBQVUsR0FBRyxFQUFFO0FBQUUsU0FBTyxHQUFHLElBQUksR0FBRyxDQUFDLFVBQVUsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLEdBQUcsR0FBRyxDQUFDO0NBQUUsQ0FBQzs7QUFFOUYsSUFBSSxjQUFjLEdBQUcsU0FBQSxjQUFBLENBQVUsR0FBRyxFQUFFLENBQUMsRUFBRTtBQUFFLE1BQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtBQUFFLFdBQU8sR0FBRyxDQUFDO0dBQUUsTUFBTSxJQUFJLE1BQU0sQ0FBQyxRQUFRLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFO0FBQUUsUUFBSSxJQUFJLEdBQUcsRUFBRSxDQUFDLEtBQU0s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QUksRUFBRTtBQUNKLGFBQUssRUFBRSxLQUFLO0FBQ1osZ0JBQVEsRUFBRSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLE9BQU8sQ0FBQztBQUNqRCxXQUFHLEVBQUUsR0FBRztBQUNSLFlBQUksRUFBRSxRQUFRO0FBQ2QsYUFBSyxFQUFFLEtBQUs7QUFDWixjQUFNLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEtBQUssRUFBRSxHQUFHLEdBQUc7QUFDL0IsYUFBSyxFQUFFLFlBQVksQ0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDO0FBQ3BDLFlBQUksRUFBRTtBQUNKLGNBQUksRUFBRSxZQUFZLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxJQUFJLEVBQUU7QUFDN0MsY0FBSSxFQUFFLFlBQVksQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLElBQUksRUFBRSxFQUM5QyxFQUNGLEVBQ0YsQ0FBQyxDQUFDO0dBQ0osQ0FBQyxDQUFBLE9BQUEsQ0FBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7Q0FDdkMiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0ICogYXMgUGFnZXMgZnJvbSAnLi9QYWdlcydcbmltcG9ydCBDb21wb25lbnRzIGZyb20gJy4vQ29tcG9uZW50cydcbmltcG9ydCB7XG4gIGRvY3VtZW50UmVhZHlcbn0gZnJvbSAnLi9oZWxwZXJzJ1xuaW1wb3J0ICcuL2xpYi9lczYtcHJvbWlzZS5taW4uanMnXG5cbmNvbnN0IGVsID0gXCIjbWFpblwiO1xuXG5jb25zdCByb3V0ZXIgPSBSb3V0ZXIoe1xuICBcIi9sb2dpblwiOiBQYWdlcy5sb2dpbixcbiAgXCIvYVwiOiB7XG4gICAgXCIvdGVhbS86a2V5XCI6IFBhZ2VzLnRlYW0sXG4gICAgXCIvbWF0Y2gvOmtleVwiOiBQYWdlcy5tYXRjaCxcbiAgICBcIi9ldmVudC86a2V5XCI6IFBhZ2VzLmV2ZW50LFxuICAgIFwiL21hdGNoZXMvOmtleVwiOiBQYWdlcy5ldmVudE1hdGNoZXMsXG4gICAgXCIvZXZlbnRzXCI6IFBhZ2VzLmV2ZW50c1xuICB9XG59KS5jb25maWd1cmUoe1xuICBodG1sNWhpc3Rvcnk6IGZhbHNlLFxuICBiZWZvcmU6IFtdLFxuICBhZnRlcjogW10sXG4gIHJlY3Vyc2U6ICdmb3J3YXJkJyxcbn0pO1xuXG5Qcm9taXNlLmFsbChbZG9jdW1lbnRSZWFkeSwgQ29tcG9uZW50cy5sb2FkKCldKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICBjb25zdCBbLCBDb21wb25lbnRzXSA9IHJlcztcbiAgUmFjdGl2ZSA9IFJhY3RpdmUuZXh0ZW5kKHtcbiAgICBlbDogZWwsXG4gICAgY29tcG9uZW50czogQ29tcG9uZW50cy5jb21wb25lbnRzLFxuICAgIGJlZm9yZTogW2Z1bmN0aW9uKCkge1xuICAgICAgJCh3aW5kb3cpLnNjcm9sbFRvcCgwKTtcbiAgICB9XSxcbiAgfSk7XG4gIHJvdXRlci5pbml0KCk7XG4gIGlmICghcm91dGVyLmdldFJvdXRlKCkuZmlsdGVyKEJvb2xlYW4pLmxlbmd0aCkge1xuICAgIGlmIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9rZW4nKSkge1xuICAgICAgcm91dGVyLnNldFJvdXRlKFwiL2EvZXZlbnRzXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICByb3V0ZXIuc2V0Um91dGUoXCIvbG9naW5cIik7XG4gICAgfVxuICB9XG5cbiAgJChcIi5uYXZiYXJcIikub24oXCJjbGlja1wiLCBcImFbaHJlZl1baHJlZiE9JyMnXVwiLCBmdW5jdGlvbigpIHtcbiAgICBpZiAoJCgnLmNvbGxhcHNlLmluJykubGVuZ3RoID4gMCkge1xuICAgICAgJCgnLm5hdmJhci10b2dnbGUnKS5jbGljaygpO1xuICAgIH1cbiAgfSk7XG5cbiAgY29uc3QgJG92ZXJsYXkgPSAkKFwiPGRpdj5cIiwge1xuICAgIGNsYXNzOiBcIm92ZXJsYXlcIixcbiAgICBjc3M6IHtcbiAgICAgIFwiZGlzcGxheVwiOiBcIm5vbmVcIlxuICAgIH0sXG4gICAgY2xpY2soKSB7XG4gICAgICBpZiAoJCgnLmNvbGxhcHNlLmluJykubGVuZ3RoID4gMCkge1xuICAgICAgICAkKCcubmF2YmFyLXRvZ2dsZScpLmNsaWNrKCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICAkb3ZlcmxheS5wcmVwZW5kVG8oXCJodG1sXCIpO1xuXG4gICQoJy5uYXZiYXItdG9nZ2xlJykuY2xpY2soZnVuY3Rpb24oKSB7XG4gICAgaWYgKCQoJy5jb2xsYXBzZS5pbicpLmxlbmd0aCA+IDApIHtcbiAgICAgICRvdmVybGF5LmhpZGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJG92ZXJsYXkuc2hvdygpO1xuICAgIH1cbiAgfSk7XG5cbn0pO1xuIiwiLy8gc2hpbSBmb3IgdXNpbmcgcHJvY2VzcyBpbiBicm93c2VyXG5cbnZhciBwcm9jZXNzID0gbW9kdWxlLmV4cG9ydHMgPSB7fTtcblxucHJvY2Vzcy5uZXh0VGljayA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhblNldEltbWVkaWF0ZSA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93LnNldEltbWVkaWF0ZTtcbiAgICB2YXIgY2FuTXV0YXRpb25PYnNlcnZlciA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnXG4gICAgJiYgd2luZG93Lk11dGF0aW9uT2JzZXJ2ZXI7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgdmFyIHF1ZXVlID0gW107XG5cbiAgICBpZiAoY2FuTXV0YXRpb25PYnNlcnZlcikge1xuICAgICAgICB2YXIgaGlkZGVuRGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgICAgdmFyIG9ic2VydmVyID0gbmV3IE11dGF0aW9uT2JzZXJ2ZXIoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIHF1ZXVlTGlzdCA9IHF1ZXVlLnNsaWNlKCk7XG4gICAgICAgICAgICBxdWV1ZS5sZW5ndGggPSAwO1xuICAgICAgICAgICAgcXVldWVMaXN0LmZvckVhY2goZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICBvYnNlcnZlci5vYnNlcnZlKGhpZGRlbkRpdiwgeyBhdHRyaWJ1dGVzOiB0cnVlIH0pO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgaWYgKCFxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICBoaWRkZW5EaXYuc2V0QXR0cmlidXRlKCd5ZXMnLCAnbm8nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHF1ZXVlLnB1c2goZm4pO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGlmIChjYW5Qb3N0KSB7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbiIsImltcG9ydCAnLi9saWIvZXM2LXByb21pc2UubWluLmpzJ1xuaW1wb3J0IGNhY2hlYWJsZSBmcm9tICcuL2NhY2hlYWJsZSdcbmltcG9ydCB7IGV4dGVuZCB9IGZyb20gJy4vaGVscGVycydcblxuXG5cbmV4cG9ydCBkZWZhdWx0IGNhY2hlYWJsZShmdW5jdGlvbihrZXkpIHtcbiAgY29uc3Qga2V5ID0ga2V5LnJlcGxhY2UoL15cXC8vLCBcIlwiKS5yZXBsYWNlKC9cXC8kLywgXCJcIik7XG4gIGxldCB1cmwgPSBcImh0dHA6Ly9vcmIuc2NvdXRmcmMuaW8vXCIra2V5O1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgcmV0dXJuICQuYWpheCh7XG4gICAgICBtZXRob2Q6IFwiZ2V0XCIsXG4gICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICBkYXRhOiB7fSxcbiAgICAgIHVybDogdXJsLFxuICAgICAgZXJyb3I6IHJlamVjdCxcbiAgICB9KS50aGVuKHJlc29sdmUpO1xuICB9KS5jYXRjaChmdW5jdGlvbihyZXMpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiQVBJIFJlcXVlc3QgVW5zdWNjZXNzZnVsXCIsIHVybCwgcmVzKTtcbiAgICByZXR1cm4gcmVzO1xuICB9KTtcbn0pO1xuXG5leHBvcnQgbGV0IFRCQSA9IGNhY2hlYWJsZShmdW5jdGlvbihwYXRoKSB7XG4gIGNvbnN0IHVybCA9IFwiaHR0cDovL3d3dy50aGVibHVlYWxsaWFuY2UuY29tL2FwaS92Mi9cIiArIHBhdGg7XG4gIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcbiAgICByZXR1cm4gJC5hamF4KHtcbiAgICAgIG1ldGhvZDogXCJnZXRcIixcbiAgICAgIGRhdGFUeXBlOiBcImpzb25cIixcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgJ1gtVEJBLUFwcC1JZCc6IFwiZnJjNDUzNDpvcmI6Y2xpZW50XCJcbiAgICAgIH0sXG4gICAgICB1cmw6IHVybCxcbiAgICAgIGVycm9yOiByZWplY3RcbiAgICB9KS50aGVuKHJlc29sdmUpO1xuICB9KS5jYXRjaChmdW5jdGlvbihyZXMpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiQVBJIFJlcXVlc3QgVW5zdWNjZXNzZnVsXCIsIHVybCwgcmVzKTtcbiAgICByZXR1cm4gcmVzO1xuICB9KTtcbn0pO1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGVhbVN0YXRzKEFQSSwga2V5LCB0ZWFtKSB7XG4gIGxldCBwcm9taXNlcyA9IFtdO1xuICBpZiAodHlwZW9mIHRlYW0gPT0gXCJvYmplY3RcIiAmJiB0ZWFtLnRlYW1fbnVtYmVyID09IGtleSkge1xuICAgIHByb21pc2VzLnB1c2gobmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4gcmVzb2x2ZSh0ZWFtKSkpXG4gIH0gZWxzZSB7XG4gICAgcHJvbWlzZXMucHVzaChBUEkuZ2V0KFwidGVhbS9cIitrZXkpKTtcbiAgfVxuICBpZiAodHlwZW9mIHRlYW0gPT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgdGVhbS5zdGF0cyA9PSBcIm9iamVjdFwiKSB7XG4gICAgcHJvbWlzZXMucHVzaChuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiByZXNvbHZlKHRlYW0uc3RhdHMuc2NvcmUpKSk7XG4gICAgcHJvbWlzZXMucHVzaChuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiByZXNvbHZlKHRlYW0uc3RhdHMuZGVmZW5zZXMpKSk7XG4gICAgcHJvbWlzZXMucHVzaChuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiByZXNvbHZlKHRlYW0uc3RhdHMuZ29hbHMpKSk7XG4gICAgcHJvbWlzZXMucHVzaChuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiByZXNvbHZlKHRlYW0uc3RhdHMuc2NhbGUpKSk7XG4gICAgcHJvbWlzZXMucHVzaChuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiByZXNvbHZlKHRlYW0uc3RhdHMuY2hhbGxlbmdlKSkpO1xuICB9IGVsc2Uge1xuICAgIHByb21pc2VzLnB1c2goQVBJLmdldChcInRlYW0vXCIra2V5K1wiL3Njb3JlXCIpKTtcbiAgICBwcm9taXNlcy5wdXNoKEFQSS5nZXQoXCJ0ZWFtL1wiK2tleStcIi9kZWZlbnNlXCIpKTtcbiAgICBwcm9taXNlcy5wdXNoKEFQSS5nZXQoXCJ0ZWFtL1wiK2tleStcIi9nb2Fsc1wiKSk7XG4gICAgcHJvbWlzZXMucHVzaChBUEkuZ2V0KFwidGVhbS9cIitrZXkrXCIvc2NhbGVcIikpO1xuICAgIHByb21pc2VzLnB1c2goQVBJLmdldChcInRlYW0vXCIra2V5K1wiL2NoYWxsZW5nZVwiKSk7XG4gIH1cbiAgcmV0dXJuIFByb21pc2UuYWxsKHByb21pc2VzKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgIGxldCBbdGVhbSwgc2NvcmUsIGRlZmVuc2VzLCBnb2Fscywgc2NhbGUsIGNoYWxsZW5nZV0gPSByZXM7XG4gICAgcmV0dXJuIGV4dGVuZCh0ZWFtLCB7XG4gICAgICBzdGF0czoge1xuICAgICAgICBjYWxjczoge1xuICAgICAgICAgIHNjb3JlOiBzY29yZVxuICAgICAgICB9LFxuICAgICAgICBkZWZlbnNlczoge1xuICAgICAgICAgIGxvd19iYXI6IGRlZmVuc2VzWzBdLFxuICAgICAgICAgIHBvcnRjdWxsaXM6IGRlZmVuc2VzWzFdLFxuICAgICAgICAgIGNoZXZhbF9kZV9mcmlzZTogZGVmZW5zZXNbMl0sXG4gICAgICAgICAgbW9hdDogZGVmZW5zZXNbM10sXG4gICAgICAgICAgcmFtcGFydHM6IGRlZmVuc2VzWzRdLFxuICAgICAgICAgIGRyYXdicmlkZ2U6IGRlZmVuc2VzWzVdLFxuICAgICAgICAgIHNhbGx5X3BvcnQ6IGRlZmVuc2VzWzZdLFxuICAgICAgICAgIHJvY2tfd2FsbDogZGVmZW5zZXNbN10sXG4gICAgICAgICAgcm91Z2hfdGVycmFpbjogZGVmZW5zZXNbOF0sXG4gICAgICAgIH0sXG4gICAgICAgIGdvYWxzOiB7XG4gICAgICAgICAgYXV0b19sb3c6IGdvYWxzWzBdLFxuICAgICAgICAgIGF1dG9faGlnaDogZ29hbHNbMV0sXG4gICAgICAgICAgdGVsZW9wX2xvdzogZ29hbHNbMl0sXG4gICAgICAgICAgdGVsZW9wX2hpZ2g6IGdvYWxzWzNdLFxuICAgICAgICB9LFxuICAgICAgICB0b3dlcjoge1xuICAgICAgICAgIHNjYWxlOiBzY2FsZVswXSxcbiAgICAgICAgICBjaGFsbGVuZ2U6IGNoYWxsZW5nZVswXVxuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGVhbXMoQVBJLCBrZXkpIHtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgIHJlc29sdmUoQVBJLmdldChcImxpc3QvXCIra2V5KSk7XG4gIH0pLnRoZW4oZnVuY3Rpb24odGVhbXMpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5hbGwodGVhbXMubWFwKHRlYW0gPT4gZ2V0VGVhbVN0YXRzKEFQSSwgdGVhbS50ZWFtX251bWJlciwgdGVhbSkpKTtcbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZVRva2VuKHRlYW0sbmFtZSkge1xuICB2YXIgdG9rZW4gPSB0ZWFtICsgXCIuXCIgKyBtZDUobmFtZSk7XG4gIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwidG9rZW5cIix0b2tlbik7XG4gIHJldHVybiB0b2tlbjtcbn1cbiIsImltcG9ydCAnLi9saWIvZXM2LXByb21pc2UubWluLmpzJ1xuaW1wb3J0IFRlbXBsYXRlcyBmcm9tICcuL1RlbXBsYXRlcydcblxuZXhwb3J0IGRlZmF1bHQge1xuICB0ZW1wbGF0ZXM6IHt9LFxuICBjb21wb25lbnRzOiB7fSxcbiAgY3JlYXRlOiBmdW5jdGlvbihkb25lKSB7XG4gICAgdGhpcy5jb21wb25lbnRzLlByb2dyZXNzID0gUmFjdGl2ZS5leHRlbmQoe1xuICAgICAgIGlzb2xhdGVkOiBmYWxzZSxcbiAgICAgICB0ZW1wbGF0ZTogdGhpcy50ZW1wbGF0ZXMucHJvZ3Jlc3MsXG4gICAgICAgb25pbml0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgIGNvbnN0IHN0YXQgPSB0aGlzLmdldChcInN0YXRcIik7XG4gICAgICAgICBjb25zdCB2YWx1ZSA9IHRoaXMuZ2V0KFwidmFsdWVcIik7XG4gICAgICAgICBsZXQgcHJvZ3Jlc3NDbGFzcztcbiAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBzdGF0LnByb2dyZXNzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgIGlmICgoIXN0YXQucHJvZ3Jlc3NbaV0ubWluIHx8IHZhbHVlID49IHN0YXQucHJvZ3Jlc3NbaV0ubWluKSAmJiAoIXN0YXQucHJvZ3Jlc3NbaV0ubWF4IHx8IHZhbHVlIDw9IHN0YXQucHJvZ3Jlc3NbaV0ubWF4KSkge1xuICAgICAgICAgICAgIHByb2dyZXNzQ2xhc3MgPSBzdGF0LnByb2dyZXNzW2ldLmNsYXNzO1xuICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICB9XG4gICAgICAgICB9XG4gICAgICAgICB0aGlzLnNldCh7XG4gICAgICAgICAgIG1pbjogc3RhdC5taW4sXG4gICAgICAgICAgIG1heDogc3RhdC5tYXgsXG4gICAgICAgICAgIHdpZHRoOiAoc3RhdC5taW4gKyB2YWx1ZSkvc3RhdC5tYXggKiAxMDAsXG4gICAgICAgICAgIHByb2dyZXNzQ2xhc3M6IHByb2dyZXNzQ2xhc3MsXG4gICAgICAgICB9KVxuICAgICAgIH0sXG5cbiAgICB9KTtcbiAgfSxcbiAgbG9hZDogZnVuY3Rpb24oZG9uZSkge1xuICAgIGNvbnN0IF90aGlzID0gdGhpcztcbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBUZW1wbGF0ZXMuZ2V0KFwiY29tcG9uZW50c1wiKS50aGVuKGZ1bmN0aW9uKHRlbXBsYXRlcykge1xuICAgICAgICAkKFwiPGRpdj5cIikuaHRtbCh0ZW1wbGF0ZXMpLmZpbmQoXCJzY3JpcHQudGVtcGxhdGVcIikuZWFjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICBjb25zdCAkdGhpcyA9ICQodGhpcyk7XG4gICAgICAgICAgX3RoaXMudGVtcGxhdGVzWyR0aGlzLmF0dHIoXCJuYW1lXCIpXSA9ICR0aGlzLmh0bWwoKS50cmltKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBfdGhpcy5jcmVhdGUoKTtcbiAgICAgICAgcmVzb2x2ZShfdGhpcyk7XG4gICAgICB9KS5jYXRjaChyZWplY3QpO1xuICAgIH0pO1xuICB9LFxufTtcbiIsImltcG9ydCAnLi9saWIvZXM2LXByb21pc2UubWluLmpzJ1xuaW1wb3J0IGNhY2hlYWJsZSBmcm9tICcuL2NhY2hlYWJsZSdcblxuZXhwb3J0IGRlZmF1bHQgY2FjaGVhYmxlKGZ1bmN0aW9uKCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgaWYobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJ0b2tlblwiKSkge1xuICAgICAgcmVzb2x2ZSgxKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbG9jYXRpb24uaGFzaCA9IFwiIy9sb2dpblwiXG4gICAgICByZWplY3QoKTtcbiAgICB9XG4gIH0pO1xufSk7XG4iLCJleHBvcnQgKiBmcm9tICcuL3BhZ2VzL3RlYW0nXG5leHBvcnQgKiBmcm9tICcuL3BhZ2VzL2V2ZW50J1xuZXhwb3J0ICogZnJvbSAnLi9wYWdlcy9sb2dpbidcbmV4cG9ydCAqIGZyb20gJy4vcGFnZXMvZXZlbnRzJ1xuZXhwb3J0ICogZnJvbSAnLi9wYWdlcy9ldmVudE1hdGNoZXMnXG4iLCJpbXBvcnQgJy4vbGliL2VzNi1wcm9taXNlLm1pbi5qcydcbmltcG9ydCBjYWNoZWFibGUgZnJvbSAnLi9jYWNoZWFibGUnXG5cbmV4cG9ydCBkZWZhdWx0IGNhY2hlYWJsZShmdW5jdGlvbihrZXkpIHtcbiAgY29uc3QgdXJsID0gXCJ0ZW1wbGF0ZXMvXCIra2V5K1wiLmh0bWxcIjtcbiAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgIHJldHVybiAkLmFqYXgoe1xuICAgICAgbWV0aG9kOiBcImdldFwiLFxuICAgICAgdXJsOiB1cmwsXG4gICAgICBlcnJvcjogcmVqZWN0XG4gICAgfSkudGhlbihyZXNvbHZlKTtcbiAgfSkuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XG4gICAgY29uc29sZS5lcnJvcihcIlRlbXBsYXRlIFJlcXVlc3QgVW5zdWNjZXNzZnVsXCIsIHVybCwgcmVzKTtcbiAgICByZXR1cm4gcmVzO1xuICB9KTtcbn0pO1xuIiwiaW1wb3J0ICcuL2xpYi9lczYtcHJvbWlzZS5taW4uanMnXG5pbXBvcnQgY2FjaGVhYmxlIGZyb20gJy4vY2FjaGVhYmxlJ1xuXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBjYWNoZWFibGUoZ2V0UHJvbWlzZSkge1xuICBjb25zdCBfY2FjaGUgPSB7fTtcblxuICBmdW5jdGlvbiBzZXQoa2V5LCB2YWx1ZSkge1xuICAgIHJldHVybiBfY2FjaGVba2V5XSA9IHZhbHVlO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBnZXQoa2V5LCBjYWxsYmFjaykge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBpZiAoX2NhY2hlW2tleV0pIHtcbiAgICAgICAgICByZXR1cm4gcmVzb2x2ZShfY2FjaGVba2V5XSk7XG4gICAgICAgIH1cblxuICAgICAgICBnZXRQcm9taXNlKGtleSlcbiAgICAgICAgICAudGhlbih2YWx1ZSA9PiBzZXQoa2V5LCB2YWx1ZSkpXG4gICAgICAgICAgLnRoZW4ocmVzb2x2ZSlcbiAgICAgICAgICAuY2F0Y2gocmVqZWN0KTtcblxuICAgICAgfSkudGhlbihjYWxsYmFjayk7XG4gICAgfSxcbiAgfVxufVxuIiwiaW1wb3J0ICcuL2xpYi9lczYtcHJvbWlzZS5taW4uanMnXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRKU09OKHVybCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICQuYWpheCh7XG4gICAgICBtZXRob2Q6IFwiZ2V0XCIsXG4gICAgICBkYXRhVHlwZTogXCJqc29uXCIsXG4gICAgICBkYXRhOiB7fSxcbiAgICAgIHVybDogdXJsLFxuICAgICAgZXJyb3I6IHJlamVjdFxuICAgIH0pLnRoZW4ocmVzb2x2ZSk7XG4gIH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcm91bmQobiwgZGlnaXRzKSB7XG4gIGNvbnN0IG4gPSBwYXJzZUZsb2F0KG4pO1xuICBjb25zdCBkaWdpdHMgPSBwYXJzZUludChkaWdpdHMpO1xuICBjb25zdCBwYXJ0cyA9IChNYXRoLnJvdW5kKG4gKiBNYXRoLnBvdygxMCwgZGlnaXRzKSkvTWF0aC5wb3coMTAsIGRpZ2l0cykpLnRvU3RyaW5nKCkuc3BsaXQoXCIuXCIpO1xuICBpZiAocGFydHMubGVuZ3RoID09IDEpIHtcbiAgICBwYXJ0cy5wdXNoKFwiXCIpO1xuICB9XG4gIHJldHVybiBwYXJ0c1swXSArIChkaWdpdHMgPyBcIi5cIiA6IFwiXCIpICsgcGFydHNbMV0gKyBBcnJheShNYXRoLm1heCgwLCBkaWdpdHMgLSBwYXJ0c1sxXS5sZW5ndGggKyAxKSkuam9pbihcIjBcIik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkb2N1bWVudFJlYWR5KCkge1xuICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24ocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgaWYgKCQuaXNSZWFkeSkge1xuICAgICAgcmVzb2x2ZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkKHJlc29sdmUpO1xuICAgIH1cbiAgfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleHRlbmQoKSB7XG4gIGNvbnN0IHJlc3VsdCA9IGFyZ3VtZW50c1swXTtcbiAgZm9yKGxldCBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgIGZvcihsZXQga2V5IGluIGFyZ3VtZW50c1tpXSkge1xuICAgICAgcmVzdWx0W2tleV0gPSBhcmd1bWVudHNbaV1ba2V5XTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn1cbiIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwpe1xuLyohXG4gKiBAb3ZlcnZpZXcgZXM2LXByb21pc2UgLSBhIHRpbnkgaW1wbGVtZW50YXRpb24gb2YgUHJvbWlzZXMvQSsuXG4gKiBAY29weXJpZ2h0IENvcHlyaWdodCAoYykgMjAxNCBZZWh1ZGEgS2F0eiwgVG9tIERhbGUsIFN0ZWZhbiBQZW5uZXIgYW5kIGNvbnRyaWJ1dG9ycyAoQ29udmVyc2lvbiB0byBFUzYgQVBJIGJ5IEpha2UgQXJjaGliYWxkKVxuICogQGxpY2Vuc2UgICBMaWNlbnNlZCB1bmRlciBNSVQgbGljZW5zZVxuICogICAgICAgICAgICBTZWUgaHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL2pha2VhcmNoaWJhbGQvZXM2LXByb21pc2UvbWFzdGVyL0xJQ0VOU0VcbiAqIEB2ZXJzaW9uICAgMy4yLjFcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuKGZ1bmN0aW9uICgpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gdCh0KSB7XG4gICAgcmV0dXJuIFwiZnVuY3Rpb25cIiA9PSB0eXBlb2YgdCB8fCBcIm9iamVjdFwiID09IHR5cGVvZiB0ICYmIG51bGwgIT09IHQ7XG4gIH1mdW5jdGlvbiBlKHQpIHtcbiAgICByZXR1cm4gXCJmdW5jdGlvblwiID09IHR5cGVvZiB0O1xuICB9ZnVuY3Rpb24gbih0KSB7XG4gICAgRyA9IHQ7XG4gIH1mdW5jdGlvbiByKHQpIHtcbiAgICBRID0gdDtcbiAgfWZ1bmN0aW9uIG8oKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHByb2Nlc3MubmV4dFRpY2soYSk7XG4gICAgfTtcbiAgfWZ1bmN0aW9uIGkoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIEIoYSk7XG4gICAgfTtcbiAgfWZ1bmN0aW9uIHMoKSB7XG4gICAgdmFyIHQgPSAwLFxuICAgICAgICBlID0gbmV3IFgoYSksXG4gICAgICAgIG4gPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIlwiKTtyZXR1cm4gKGUub2JzZXJ2ZShuLCB7IGNoYXJhY3RlckRhdGE6ICEwIH0pLCBmdW5jdGlvbiAoKSB7XG4gICAgICBuLmRhdGEgPSB0ID0gKyt0ICUgMjtcbiAgICB9KTtcbiAgfWZ1bmN0aW9uIHUoKSB7XG4gICAgdmFyIHQgPSBuZXcgTWVzc2FnZUNoYW5uZWwoKTtyZXR1cm4gKHQucG9ydDEub25tZXNzYWdlID0gYSwgZnVuY3Rpb24gKCkge1xuICAgICAgdC5wb3J0Mi5wb3N0TWVzc2FnZSgwKTtcbiAgICB9KTtcbiAgfWZ1bmN0aW9uIGMoKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgIHNldFRpbWVvdXQoYSwgMSk7XG4gICAgfTtcbiAgfWZ1bmN0aW9uIGEoKSB7XG4gICAgZm9yICh2YXIgdCA9IDA7IEogPiB0OyB0ICs9IDIpIHtcbiAgICAgIHZhciBlID0gdHRbdF0sXG4gICAgICAgICAgbiA9IHR0W3QgKyAxXTtlKG4pLCB0dFt0XSA9IHZvaWQgMCwgdHRbdCArIDFdID0gdm9pZCAwO1xuICAgIH1KID0gMDtcbiAgfWZ1bmN0aW9uIGYoKSB7XG4gICAgdHJ5IHtcbiAgICAgIHZhciB0ID0gcmVxdWlyZSxcbiAgICAgICAgICBlID0gdChcInZlcnR4XCIpO3JldHVybiAoQiA9IGUucnVuT25Mb29wIHx8IGUucnVuT25Db250ZXh0LCBpKCkpO1xuICAgIH0gY2F0Y2ggKG4pIHtcbiAgICAgIHJldHVybiBjKCk7XG4gICAgfVxuICB9ZnVuY3Rpb24gbCh0LCBlKSB7XG4gICAgdmFyIG4gPSB0aGlzLFxuICAgICAgICByID0gbmV3IHRoaXMuY29uc3RydWN0b3IocCk7dm9pZCAwID09PSByW3J0XSAmJiBrKHIpO3ZhciBvID0gbi5fc3RhdGU7aWYgKG8pIHtcbiAgICAgIHZhciBpID0gYXJndW1lbnRzW28gLSAxXTtRKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgeChvLCByLCBpLCBuLl9yZXN1bHQpO1xuICAgICAgfSk7XG4gICAgfSBlbHNlIEUobiwgciwgdCwgZSk7cmV0dXJuIHI7XG4gIH1mdW5jdGlvbiBoKHQpIHtcbiAgICB2YXIgZSA9IHRoaXM7aWYgKHQgJiYgXCJvYmplY3RcIiA9PSB0eXBlb2YgdCAmJiB0LmNvbnN0cnVjdG9yID09PSBlKSB7XG4gICAgICByZXR1cm4gdDtcbiAgICB9dmFyIG4gPSBuZXcgZShwKTtyZXR1cm4gKGcobiwgdCksIG4pO1xuICB9ZnVuY3Rpb24gcCgpIHt9ZnVuY3Rpb24gXygpIHtcbiAgICByZXR1cm4gbmV3IFR5cGVFcnJvcihcIllvdSBjYW5ub3QgcmVzb2x2ZSBhIHByb21pc2Ugd2l0aCBpdHNlbGZcIik7XG4gIH1mdW5jdGlvbiBkKCkge1xuICAgIHJldHVybiBuZXcgVHlwZUVycm9yKFwiQSBwcm9taXNlcyBjYWxsYmFjayBjYW5ub3QgcmV0dXJuIHRoYXQgc2FtZSBwcm9taXNlLlwiKTtcbiAgfWZ1bmN0aW9uIHYodCkge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gdC50aGVuO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHJldHVybiAodXQuZXJyb3IgPSBlLCB1dCk7XG4gICAgfVxuICB9ZnVuY3Rpb24geSh0LCBlLCBuLCByKSB7XG4gICAgdHJ5IHtcbiAgICAgIHQuY2FsbChlLCBuLCByKTtcbiAgICB9IGNhdGNoIChvKSB7XG4gICAgICByZXR1cm4gbztcbiAgICB9XG4gIH1mdW5jdGlvbiBtKHQsIGUsIG4pIHtcbiAgICBRKGZ1bmN0aW9uICh0KSB7XG4gICAgICB2YXIgciA9ICExLFxuICAgICAgICAgIG8gPSB5KG4sIGUsIGZ1bmN0aW9uIChuKSB7XG4gICAgICAgIHIgfHwgKHIgPSAhMCwgZSAhPT0gbiA/IGcodCwgbikgOiBTKHQsIG4pKTtcbiAgICAgIH0sIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHIgfHwgKHIgPSAhMCwgaih0LCBlKSk7XG4gICAgICB9LCBcIlNldHRsZTogXCIgKyAodC5fbGFiZWwgfHwgXCIgdW5rbm93biBwcm9taXNlXCIpKTshciAmJiBvICYmIChyID0gITAsIGoodCwgbykpO1xuICAgIH0sIHQpO1xuICB9ZnVuY3Rpb24gYih0LCBlKSB7XG4gICAgZS5fc3RhdGUgPT09IGl0ID8gUyh0LCBlLl9yZXN1bHQpIDogZS5fc3RhdGUgPT09IHN0ID8gaih0LCBlLl9yZXN1bHQpIDogRShlLCB2b2lkIDAsIGZ1bmN0aW9uIChlKSB7XG4gICAgICBnKHQsIGUpO1xuICAgIH0sIGZ1bmN0aW9uIChlKSB7XG4gICAgICBqKHQsIGUpO1xuICAgIH0pO1xuICB9ZnVuY3Rpb24gdyh0LCBuLCByKSB7XG4gICAgbi5jb25zdHJ1Y3RvciA9PT0gdC5jb25zdHJ1Y3RvciAmJiByID09PSBldCAmJiBjb25zdHJ1Y3Rvci5yZXNvbHZlID09PSBudCA/IGIodCwgbikgOiByID09PSB1dCA/IGoodCwgdXQuZXJyb3IpIDogdm9pZCAwID09PSByID8gUyh0LCBuKSA6IGUocikgPyBtKHQsIG4sIHIpIDogUyh0LCBuKTtcbiAgfWZ1bmN0aW9uIGcoZSwgbikge1xuICAgIGUgPT09IG4gPyBqKGUsIF8oKSkgOiB0KG4pID8gdyhlLCBuLCB2KG4pKSA6IFMoZSwgbik7XG4gIH1mdW5jdGlvbiBBKHQpIHtcbiAgICB0Ll9vbmVycm9yICYmIHQuX29uZXJyb3IodC5fcmVzdWx0KSwgVCh0KTtcbiAgfWZ1bmN0aW9uIFModCwgZSkge1xuICAgIHQuX3N0YXRlID09PSBvdCAmJiAodC5fcmVzdWx0ID0gZSwgdC5fc3RhdGUgPSBpdCwgMCAhPT0gdC5fc3Vic2NyaWJlcnMubGVuZ3RoICYmIFEoVCwgdCkpO1xuICB9ZnVuY3Rpb24gaih0LCBlKSB7XG4gICAgdC5fc3RhdGUgPT09IG90ICYmICh0Ll9zdGF0ZSA9IHN0LCB0Ll9yZXN1bHQgPSBlLCBRKEEsIHQpKTtcbiAgfWZ1bmN0aW9uIEUodCwgZSwgbiwgcikge1xuICAgIHZhciBvID0gdC5fc3Vic2NyaWJlcnMsXG4gICAgICAgIGkgPSBvLmxlbmd0aDt0Ll9vbmVycm9yID0gbnVsbCwgb1tpXSA9IGUsIG9baSArIGl0XSA9IG4sIG9baSArIHN0XSA9IHIsIDAgPT09IGkgJiYgdC5fc3RhdGUgJiYgUShULCB0KTtcbiAgfWZ1bmN0aW9uIFQodCkge1xuICAgIHZhciBlID0gdC5fc3Vic2NyaWJlcnMsXG4gICAgICAgIG4gPSB0Ll9zdGF0ZTtpZiAoMCAhPT0gZS5sZW5ndGgpIHtcbiAgICAgIGZvciAodmFyIHIsIG8sIGkgPSB0Ll9yZXN1bHQsIHMgPSAwOyBzIDwgZS5sZW5ndGg7IHMgKz0gMykgciA9IGVbc10sIG8gPSBlW3MgKyBuXSwgciA/IHgobiwgciwgbywgaSkgOiBvKGkpO3QuX3N1YnNjcmliZXJzLmxlbmd0aCA9IDA7XG4gICAgfVxuICB9ZnVuY3Rpb24gTSgpIHtcbiAgICB0aGlzLmVycm9yID0gbnVsbDtcbiAgfWZ1bmN0aW9uIFAodCwgZSkge1xuICAgIHRyeSB7XG4gICAgICByZXR1cm4gdChlKTtcbiAgICB9IGNhdGNoIChuKSB7XG4gICAgICByZXR1cm4gKGN0LmVycm9yID0gbiwgY3QpO1xuICAgIH1cbiAgfWZ1bmN0aW9uIHgodCwgbiwgciwgbykge1xuICAgIHZhciBpLFxuICAgICAgICBzLFxuICAgICAgICB1LFxuICAgICAgICBjLFxuICAgICAgICBhID0gZShyKTtpZiAoYSkge1xuICAgICAgaWYgKChpID0gUChyLCBvKSwgaSA9PT0gY3QgPyAoYyA9ICEwLCBzID0gaS5lcnJvciwgaSA9IG51bGwpIDogdSA9ICEwLCBuID09PSBpKSkge1xuICAgICAgICByZXR1cm4gdm9pZCBqKG4sIGQoKSk7XG4gICAgICB9XG4gICAgfSBlbHNlIGkgPSBvLCB1ID0gITA7bi5fc3RhdGUgIT09IG90IHx8IChhICYmIHUgPyBnKG4sIGkpIDogYyA/IGoobiwgcykgOiB0ID09PSBpdCA/IFMobiwgaSkgOiB0ID09PSBzdCAmJiBqKG4sIGkpKTtcbiAgfWZ1bmN0aW9uIEModCwgZSkge1xuICAgIHRyeSB7XG4gICAgICBlKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGcodCwgZSk7XG4gICAgICB9LCBmdW5jdGlvbiAoZSkge1xuICAgICAgICBqKHQsIGUpO1xuICAgICAgfSk7XG4gICAgfSBjYXRjaCAobikge1xuICAgICAgaih0LCBuKTtcbiAgICB9XG4gIH1mdW5jdGlvbiBPKCkge1xuICAgIHJldHVybiBhdCsrO1xuICB9ZnVuY3Rpb24gayh0KSB7XG4gICAgdFtydF0gPSBhdCsrLCB0Ll9zdGF0ZSA9IHZvaWQgMCwgdC5fcmVzdWx0ID0gdm9pZCAwLCB0Ll9zdWJzY3JpYmVycyA9IFtdO1xuICB9ZnVuY3Rpb24gWSh0KSB7XG4gICAgcmV0dXJuIG5ldyBfdCh0aGlzLCB0KS5wcm9taXNlO1xuICB9ZnVuY3Rpb24gcSh0KSB7XG4gICAgdmFyIGUgPSB0aGlzO3JldHVybiBuZXcgZShJKHQpID8gZnVuY3Rpb24gKG4sIHIpIHtcbiAgICAgIGZvciAodmFyIG8gPSB0Lmxlbmd0aCwgaSA9IDA7IG8gPiBpOyBpKyspIGUucmVzb2x2ZSh0W2ldKS50aGVuKG4sIHIpO1xuICAgIH0gOiBmdW5jdGlvbiAodCwgZSkge1xuICAgICAgZShuZXcgVHlwZUVycm9yKFwiWW91IG11c3QgcGFzcyBhbiBhcnJheSB0byByYWNlLlwiKSk7XG4gICAgfSk7XG4gIH1mdW5jdGlvbiBGKHQpIHtcbiAgICB2YXIgZSA9IHRoaXMsXG4gICAgICAgIG4gPSBuZXcgZShwKTtyZXR1cm4gKGoobiwgdCksIG4pO1xuICB9ZnVuY3Rpb24gRCgpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiWW91IG11c3QgcGFzcyBhIHJlc29sdmVyIGZ1bmN0aW9uIGFzIHRoZSBmaXJzdCBhcmd1bWVudCB0byB0aGUgcHJvbWlzZSBjb25zdHJ1Y3RvclwiKTtcbiAgfWZ1bmN0aW9uIEsoKSB7XG4gICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkZhaWxlZCB0byBjb25zdHJ1Y3QgJ1Byb21pc2UnOiBQbGVhc2UgdXNlIHRoZSAnbmV3JyBvcGVyYXRvciwgdGhpcyBvYmplY3QgY29uc3RydWN0b3IgY2Fubm90IGJlIGNhbGxlZCBhcyBhIGZ1bmN0aW9uLlwiKTtcbiAgfWZ1bmN0aW9uIEwodCkge1xuICAgIHRoaXNbcnRdID0gTygpLCB0aGlzLl9yZXN1bHQgPSB0aGlzLl9zdGF0ZSA9IHZvaWQgMCwgdGhpcy5fc3Vic2NyaWJlcnMgPSBbXSwgcCAhPT0gdCAmJiAoXCJmdW5jdGlvblwiICE9IHR5cGVvZiB0ICYmIEQoKSwgdGhpcyBpbnN0YW5jZW9mIEwgPyBDKHRoaXMsIHQpIDogSygpKTtcbiAgfWZ1bmN0aW9uIE4odCwgZSkge1xuICAgIHRoaXMuX2luc3RhbmNlQ29uc3RydWN0b3IgPSB0LCB0aGlzLnByb21pc2UgPSBuZXcgdChwKSwgdGhpcy5wcm9taXNlW3J0XSB8fCBrKHRoaXMucHJvbWlzZSksIEFycmF5LmlzQXJyYXkoZSkgPyAodGhpcy5faW5wdXQgPSBlLCB0aGlzLmxlbmd0aCA9IGUubGVuZ3RoLCB0aGlzLl9yZW1haW5pbmcgPSBlLmxlbmd0aCwgdGhpcy5fcmVzdWx0ID0gbmV3IEFycmF5KHRoaXMubGVuZ3RoKSwgMCA9PT0gdGhpcy5sZW5ndGggPyBTKHRoaXMucHJvbWlzZSwgdGhpcy5fcmVzdWx0KSA6ICh0aGlzLmxlbmd0aCA9IHRoaXMubGVuZ3RoIHx8IDAsIHRoaXMuX2VudW1lcmF0ZSgpLCAwID09PSB0aGlzLl9yZW1haW5pbmcgJiYgUyh0aGlzLnByb21pc2UsIHRoaXMuX3Jlc3VsdCkpKSA6IGoodGhpcy5wcm9taXNlLCBVKCkpO1xuICB9ZnVuY3Rpb24gVSgpIHtcbiAgICByZXR1cm4gbmV3IEVycm9yKFwiQXJyYXkgTWV0aG9kcyBtdXN0IGJlIHByb3ZpZGVkIGFuIEFycmF5XCIpO1xuICB9ZnVuY3Rpb24gVygpIHtcbiAgICB2YXIgdDtpZiAoXCJ1bmRlZmluZWRcIiAhPSB0eXBlb2YgZ2xvYmFsKSB0ID0gZ2xvYmFsO2Vsc2UgaWYgKFwidW5kZWZpbmVkXCIgIT0gdHlwZW9mIHNlbGYpIHQgPSBzZWxmO2Vsc2UgdHJ5IHtcbiAgICAgIHQgPSBGdW5jdGlvbihcInJldHVybiB0aGlzXCIpKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwicG9seWZpbGwgZmFpbGVkIGJlY2F1c2UgZ2xvYmFsIG9iamVjdCBpcyB1bmF2YWlsYWJsZSBpbiB0aGlzIGVudmlyb25tZW50XCIpO1xuICAgIH12YXIgbiA9IHQuUHJvbWlzZTsoIW4gfHwgXCJbb2JqZWN0IFByb21pc2VdXCIgIT09IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChuLnJlc29sdmUoKSkgfHwgbi5jYXN0KSAmJiAodC5Qcm9taXNlID0gcHQpO1xuICB9dmFyIHo7eiA9IEFycmF5LmlzQXJyYXkgPyBBcnJheS5pc0FycmF5IDogZnVuY3Rpb24gKHQpIHtcbiAgICByZXR1cm4gXCJbb2JqZWN0IEFycmF5XVwiID09PSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwodCk7XG4gIH07dmFyIEIsXG4gICAgICBHLFxuICAgICAgSCxcbiAgICAgIEkgPSB6LFxuICAgICAgSiA9IDAsXG4gICAgICBRID0gZnVuY3Rpb24gUSh0LCBlKSB7XG4gICAgdHRbSl0gPSB0LCB0dFtKICsgMV0gPSBlLCBKICs9IDIsIDIgPT09IEogJiYgKEcgPyBHKGEpIDogSCgpKTtcbiAgfSxcbiAgICAgIFIgPSBcInVuZGVmaW5lZFwiICE9IHR5cGVvZiB3aW5kb3cgPyB3aW5kb3cgOiB2b2lkIDAsXG4gICAgICBWID0gUiB8fCB7fSxcbiAgICAgIFggPSBWLk11dGF0aW9uT2JzZXJ2ZXIgfHwgVi5XZWJLaXRNdXRhdGlvbk9ic2VydmVyLFxuICAgICAgWiA9IFwidW5kZWZpbmVkXCIgPT0gdHlwZW9mIHNlbGYgJiYgXCJ1bmRlZmluZWRcIiAhPSB0eXBlb2YgcHJvY2VzcyAmJiBcIltvYmplY3QgcHJvY2Vzc11cIiA9PT0gKHt9KS50b1N0cmluZy5jYWxsKHByb2Nlc3MpLFxuICAgICAgJCA9IFwidW5kZWZpbmVkXCIgIT0gdHlwZW9mIFVpbnQ4Q2xhbXBlZEFycmF5ICYmIFwidW5kZWZpbmVkXCIgIT0gdHlwZW9mIGltcG9ydFNjcmlwdHMgJiYgXCJ1bmRlZmluZWRcIiAhPSB0eXBlb2YgTWVzc2FnZUNoYW5uZWwsXG4gICAgICB0dCA9IG5ldyBBcnJheSgxMDAwKTtIID0gWiA/IG8oKSA6IFggPyBzKCkgOiAkID8gdSgpIDogdm9pZCAwID09PSBSICYmIFwiZnVuY3Rpb25cIiA9PSB0eXBlb2YgcmVxdWlyZSA/IGYoKSA6IGMoKTt2YXIgZXQgPSBsLFxuICAgICAgbnQgPSBoLFxuICAgICAgcnQgPSBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoMTYpLFxuICAgICAgb3QgPSB2b2lkIDAsXG4gICAgICBpdCA9IDEsXG4gICAgICBzdCA9IDIsXG4gICAgICB1dCA9IG5ldyBNKCksXG4gICAgICBjdCA9IG5ldyBNKCksXG4gICAgICBhdCA9IDAsXG4gICAgICBmdCA9IFksXG4gICAgICBsdCA9IHEsXG4gICAgICBodCA9IEYsXG4gICAgICBwdCA9IEw7TC5hbGwgPSBmdCwgTC5yYWNlID0gbHQsIEwucmVzb2x2ZSA9IG50LCBMLnJlamVjdCA9IGh0LCBMLl9zZXRTY2hlZHVsZXIgPSBuLCBMLl9zZXRBc2FwID0gciwgTC5fYXNhcCA9IFEsIEwucHJvdG90eXBlID0geyBjb25zdHJ1Y3RvcjogTCwgdGhlbjogZXQsIFwiY2F0Y2hcIjogZnVuY3Rpb24gX2NhdGNoKHQpIHtcbiAgICAgIHJldHVybiB0aGlzLnRoZW4obnVsbCwgdCk7XG4gICAgfSB9O3ZhciBfdCA9IE47Ti5wcm90b3R5cGUuX2VudW1lcmF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBmb3IgKHZhciB0ID0gdGhpcy5sZW5ndGgsIGUgPSB0aGlzLl9pbnB1dCwgbiA9IDA7IHRoaXMuX3N0YXRlID09PSBvdCAmJiB0ID4gbjsgbisrKSB0aGlzLl9lYWNoRW50cnkoZVtuXSwgbik7XG4gIH0sIE4ucHJvdG90eXBlLl9lYWNoRW50cnkgPSBmdW5jdGlvbiAodCwgZSkge1xuICAgIHZhciBuID0gdGhpcy5faW5zdGFuY2VDb25zdHJ1Y3RvcixcbiAgICAgICAgciA9IG4ucmVzb2x2ZTtpZiAociA9PT0gbnQpIHtcbiAgICAgIHZhciBvID0gdih0KTtpZiAobyA9PT0gZXQgJiYgdC5fc3RhdGUgIT09IG90KSB0aGlzLl9zZXR0bGVkQXQodC5fc3RhdGUsIGUsIHQuX3Jlc3VsdCk7ZWxzZSBpZiAoXCJmdW5jdGlvblwiICE9IHR5cGVvZiBvKSB0aGlzLl9yZW1haW5pbmctLSwgdGhpcy5fcmVzdWx0W2VdID0gdDtlbHNlIGlmIChuID09PSBwdCkge1xuICAgICAgICB2YXIgaSA9IG5ldyBuKHApO3coaSwgdCwgbyksIHRoaXMuX3dpbGxTZXR0bGVBdChpLCBlKTtcbiAgICAgIH0gZWxzZSB0aGlzLl93aWxsU2V0dGxlQXQobmV3IG4oZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZSh0KTtcbiAgICAgIH0pLCBlKTtcbiAgICB9IGVsc2UgdGhpcy5fd2lsbFNldHRsZUF0KHIodCksIGUpO1xuICB9LCBOLnByb3RvdHlwZS5fc2V0dGxlZEF0ID0gZnVuY3Rpb24gKHQsIGUsIG4pIHtcbiAgICB2YXIgciA9IHRoaXMucHJvbWlzZTtyLl9zdGF0ZSA9PT0gb3QgJiYgKHRoaXMuX3JlbWFpbmluZy0tLCB0ID09PSBzdCA/IGoociwgbikgOiB0aGlzLl9yZXN1bHRbZV0gPSBuKSwgMCA9PT0gdGhpcy5fcmVtYWluaW5nICYmIFMociwgdGhpcy5fcmVzdWx0KTtcbiAgfSwgTi5wcm90b3R5cGUuX3dpbGxTZXR0bGVBdCA9IGZ1bmN0aW9uICh0LCBlKSB7XG4gICAgdmFyIG4gPSB0aGlzO0UodCwgdm9pZCAwLCBmdW5jdGlvbiAodCkge1xuICAgICAgbi5fc2V0dGxlZEF0KGl0LCBlLCB0KTtcbiAgICB9LCBmdW5jdGlvbiAodCkge1xuICAgICAgbi5fc2V0dGxlZEF0KHN0LCBlLCB0KTtcbiAgICB9KTtcbiAgfTt2YXIgZHQgPSBXLFxuICAgICAgdnQgPSB7IFByb21pc2U6IHB0LCBwb2x5ZmlsbDogZHQgfTtcImZ1bmN0aW9uXCIgPT0gdHlwZW9mIGRlZmluZSAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gdnQ7XG4gIH0pIDogXCJ1bmRlZmluZWRcIiAhPSB0eXBlb2YgbW9kdWxlICYmIG1vZHVsZS5leHBvcnRzID8gbW9kdWxlLmV4cG9ydHMgPSB2dCA6IFwidW5kZWZpbmVkXCIgIT0gdHlwZW9mIHRoaXMgJiYgKHRoaXMuRVM2UHJvbWlzZSA9IHZ0KSwgZHQoKTtcbn0pLmNhbGwodW5kZWZpbmVkKTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoJ19wcm9jZXNzJyksdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSlcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0OnV0Zi04O2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYklpOW9iMjFsTDJSaGJtbGxiQzlFYjJOMWJXVnVkSE12Y0hKdmFtVmpkSE12YjNKaUxXTnNhV1Z1ZEM5emNtTXZiR2xpTDJWek5pMXdjbTl0YVhObExtMXBiaTVxY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pT3pzN096czdPenM3T3p0QlFWRkJMRU5CUVVNc1dVRkJWVHRCUVVGRExHTkJRVmtzUTBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNN1FVRkJReXhYUVVGTkxGVkJRVlVzU1VGQlJTeFBRVUZQTEVOQlFVTXNTVUZCUlN4UlFVRlJMRWxCUVVVc1QwRkJUeXhEUVVGRExFbEJRVVVzU1VGQlNTeExRVUZITEVOQlFVTXNRMEZCUVR0SFFVRkRMRk5CUVZNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF6dEJRVUZETEZkQlFVMHNWVUZCVlN4SlFVRkZMRTlCUVU4c1EwRkJReXhEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRPMEZCUVVNc1MwRkJReXhIUVVGRExFTkJRVU1zUTBGQlFUdEhRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJRenRCUVVGRExFdEJRVU1zUjBGQlF5eERRVUZETEVOQlFVRTdSMEZCUXl4VFFVRlRMRU5CUVVNc1IwRkJSVHRCUVVGRExGZEJRVThzV1VGQlZUdEJRVUZETEdGQlFVOHNRMEZCUXl4UlFVRlJMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVUU3UzBGQlF5eERRVUZCTzBkQlFVTXNVMEZCVXl4RFFVRkRMRWRCUVVVN1FVRkJReXhYUVVGUExGbEJRVlU3UVVGQlF5eFBRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVFN1MwRkJReXhEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVkQlFVVTdRVUZCUXl4UlFVRkpMRU5CUVVNc1IwRkJReXhEUVVGRE8xRkJRVU1zUTBGQlF5eEhRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRSUVVGRExFTkJRVU1zUjBGQlF5eFJRVUZSTEVOQlFVTXNZMEZCWXl4RFFVRkRMRVZCUVVVc1EwRkJReXhEUVVGRExGRkJRVThzUTBGQlF5eERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRVZCUVVNc1JVRkJReXhoUVVGaExFVkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkRMRmxCUVZVN1FVRkJReXhQUVVGRExFTkJRVU1zU1VGQlNTeEhRVUZETEVOQlFVTXNSMEZCUXl4RlFVRkZMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVUU3UzBGQlF5eERRVUZCTEVOQlFVRTdSMEZCUXl4VFFVRlRMRU5CUVVNc1IwRkJSVHRCUVVGRExGRkJRVWtzUTBGQlF5eEhRVUZETEVsQlFVa3NZMEZCWXl4RlFVRkJMRU5CUVVNc1VVRkJUeXhEUVVGRExFTkJRVU1zUzBGQlN5eERRVUZETEZOQlFWTXNSMEZCUXl4RFFVRkRMRVZCUVVNc1dVRkJWVHRCUVVGRExFOUJRVU1zUTBGQlF5eExRVUZMTEVOQlFVTXNWMEZCVnl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGQk8wdEJRVU1zUTBGQlFTeERRVUZCTzBkQlFVTXNVMEZCVXl4RFFVRkRMRWRCUVVVN1FVRkJReXhYUVVGUExGbEJRVlU3UVVGQlF5eG5Ra0ZCVlN4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlFUdExRVUZETEVOQlFVRTdSMEZCUXl4VFFVRlRMRU5CUVVNc1IwRkJSVHRCUVVGRExGTkJRVWtzU1VGQlNTeERRVUZETEVkQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eEpRVUZGTEVOQlFVTXNSVUZCUXp0QlFVRkRMRlZCUVVrc1EwRkJReXhIUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTTdWVUZCUXl4RFFVRkRMRWRCUVVNc1JVRkJSU3hEUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkRMRXRCUVVzc1EwRkJReXhGUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVNc1MwRkJTeXhEUVVGRExFTkJRVUU3UzBGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFZEJRVVU3UVVGQlF5eFJRVUZITzBGQlFVTXNWVUZCU1N4RFFVRkRMRWRCUVVNc1QwRkJUenRWUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1VVRkJUeXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEZOQlFWTXNTVUZCUlN4RFFVRkRMRU5CUVVNc1dVRkJXU3hGUVVGRExFTkJRVU1zUlVGQlJTeERRVUZCTEVOQlFVRTdTMEZCUXl4RFFVRkJMRTlCUVUwc1EwRkJReXhGUVVGRE8wRkJRVU1zWVVGQlR5eERRVUZETEVWQlFVVXNRMEZCUVR0TFFVRkRPMGRCUVVNc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXp0QlFVRkRMRkZCUVVrc1EwRkJReXhIUVVGRExFbEJRVWs3VVVGQlF5eERRVUZETEVkQlFVTXNTVUZCU1N4SlFVRkpMRU5CUVVNc1YwRkJWeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEV0QlFVc3NRMEZCUXl4TFFVRkhMRU5CUVVNc1EwRkJReXhGUVVGRkxFTkJRVU1zU1VGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEUxQlFVMHNRMEZCUXl4SlFVRkhMRU5CUVVNc1JVRkJRenRCUVVGRExGVkJRVWtzUTBGQlF5eEhRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEZsQlFWVTdRVUZCUXl4VFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGQk8wOUJRVU1zUTBGQlF5eERRVUZCTzB0QlFVTXNUVUZCU3l4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVUU3UjBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNN1FVRkJReXhSUVVGSkxFTkJRVU1zUjBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCUnl4RFFVRkRMRWxCUVVVc1VVRkJVU3hKUVVGRkxFOUJRVThzUTBGQlF5eEpRVUZGTEVOQlFVTXNRMEZCUXl4WFFVRlhMRXRCUVVjc1EwRkJRenRCUVVGRExHRkJRVThzUTBGQlF5eERRVUZETzB0QlFVRXNTVUZCU1N4RFFVRkRMRWRCUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNVVUZCVHl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUVN4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFZEJRVVVzUlVGQlJTeFRRVUZUTEVOQlFVTXNSMEZCUlR0QlFVRkRMRmRCUVU4c1NVRkJTU3hUUVVGVExFTkJRVU1zTUVOQlFUQkRMRU5CUVVNc1EwRkJRVHRIUVVGRExGTkJRVk1zUTBGQlF5eEhRVUZGTzBGQlFVTXNWMEZCVHl4SlFVRkpMRk5CUVZNc1EwRkJReXh6UkVGQmMwUXNRMEZCUXl4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETzBGQlFVTXNVVUZCUnp0QlFVRkRMR0ZCUVU4c1EwRkJReXhEUVVGRExFbEJRVWtzUTBGQlFUdExRVUZETEVOQlFVRXNUMEZCVFN4RFFVRkRMRVZCUVVNN1FVRkJReXhqUVVGUExFVkJRVVVzUTBGQlF5eExRVUZMTEVkQlFVTXNRMEZCUXl4RlFVRkRMRVZCUVVVc1EwRkJRU3hEUVVGQk8wdEJRVU03UjBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVTTdRVUZCUXl4UlFVRkhPMEZCUVVNc1QwRkJReXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1EwRkJReXhEUVVGQk8wdEJRVU1zUTBGQlFTeFBRVUZOTEVOQlFVTXNSVUZCUXp0QlFVRkRMR0ZCUVU4c1EwRkJReXhEUVVGQk8wdEJRVU03UjBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF6dEJRVUZETEV0QlFVTXNRMEZCUXl4VlFVRlRMRU5CUVVNc1JVRkJRenRCUVVGRExGVkJRVWtzUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXp0VlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXl4VlFVRlRMRU5CUVVNc1JVRkJRenRCUVVGRExGTkJRVU1zUzBGQlJ5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhMUVVGSExFTkJRVU1zUjBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVFc1FVRkJReXhEUVVGQk8wOUJRVU1zUlVGQlF5eFZRVUZUTEVOQlFVTXNSVUZCUXp0QlFVRkRMRk5CUVVNc1MwRkJSeXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlFTeEJRVUZETEVOQlFVRTdUMEZCUXl4RlFVRkRMRlZCUVZVc1NVRkJSU3hEUVVGRExFTkJRVU1zVFVGQlRTeEpRVUZGTEd0Q1FVRnJRaXhEUVVGQkxFRkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SlFVRkZMRU5CUVVNc1MwRkJSeXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlFTeEJRVUZETEVOQlFVRTdTMEZCUXl4RlFVRkRMRU5CUVVNc1EwRkJReXhEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1JVRkJRenRCUVVGRExFdEJRVU1zUTBGQlF5eE5RVUZOTEV0QlFVY3NSVUZCUlN4SFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEU5QlFVOHNRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhOUVVGTkxFdEJRVWNzUlVGQlJTeEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFOUJRVThzUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1MwRkJTeXhEUVVGRExFVkJRVU1zVlVGQlV5eERRVUZETEVWQlFVTTdRVUZCUXl4UFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUTBGQlF5eERRVUZCTzB0QlFVTXNSVUZCUXl4VlFVRlRMRU5CUVVNc1JVRkJRenRCUVVGRExFOUJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVFN1MwRkJReXhEUVVGRExFTkJRVUU3UjBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF6dEJRVUZETEV0QlFVTXNRMEZCUXl4WFFVRlhMRXRCUVVjc1EwRkJReXhEUVVGRExGZEJRVmNzU1VGQlJTeERRVUZETEV0QlFVY3NSVUZCUlN4SlFVRkZMRmRCUVZjc1EwRkJReXhQUVVGUExFdEJRVWNzUlVGQlJTeEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eExRVUZITEVWQlFVVXNSMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFVkJRVVVzUTBGQlF5eExRVUZMTEVOQlFVTXNSMEZCUXl4TFFVRkxMRU5CUVVNc1MwRkJSeXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlFUdEhRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFVkJRVU03UVVGQlF5eExRVUZETEV0QlFVY3NRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eEZRVUZGTEVOQlFVTXNSMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlFUdEhRVUZETEZOQlFWTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJRenRCUVVGRExFdEJRVU1zUTBGQlF5eFJRVUZSTEVsQlFVVXNRMEZCUXl4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRExFTkJRVU1zVDBGQlR5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1JVRkJRenRCUVVGRExFdEJRVU1zUTBGQlF5eE5RVUZOTEV0QlFVY3NSVUZCUlN4TFFVRkhMRU5CUVVNc1EwRkJReXhQUVVGUExFZEJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRWRCUVVNc1JVRkJSU3hGUVVGRExFTkJRVU1zUzBGQlJ5eERRVUZETEVOQlFVTXNXVUZCV1N4RFFVRkRMRTFCUVUwc1NVRkJSU3hEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkJMRUZCUVVNc1EwRkJRVHRIUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNN1FVRkJReXhMUVVGRExFTkJRVU1zVFVGQlRTeExRVUZITEVWQlFVVXNTMEZCUnl4RFFVRkRMRU5CUVVNc1RVRkJUU3hIUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4SFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkJMRUZCUVVNc1EwRkJRVHRIUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUlVGQlF6dEJRVUZETEZGQlFVa3NRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhaUVVGWk8xRkJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhEUVVGRExGRkJRVkVzUjBGQlF5eEpRVUZKTEVWQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkRMRVZCUVVVc1EwRkJReXhIUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkRMRVZCUVVVc1EwRkJReXhIUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEV0QlFVY3NRMEZCUXl4SlFVRkZMRU5CUVVNc1EwRkJReXhOUVVGTkxFbEJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRVHRIUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXp0QlFVRkRMRkZCUVVrc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eFpRVUZaTzFGQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhOUVVGTkxFTkJRVU1zU1VGQlJ5eERRVUZETEV0QlFVY3NRMEZCUXl4RFFVRkRMRTFCUVUwc1JVRkJRenRCUVVGRExGZEJRVWtzU1VGQlNTeERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zVDBGQlR5eEZRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eE5RVUZOTEVWQlFVTXNRMEZCUXl4SlFVRkZMRU5CUVVNc1JVRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhaUVVGWkxFTkJRVU1zVFVGQlRTeEhRVUZETEVOQlFVTXNRMEZCUVR0TFFVRkRPMGRCUVVNc1UwRkJVeXhEUVVGRExFZEJRVVU3UVVGQlF5eFJRVUZKTEVOQlFVTXNTMEZCU3l4SFFVRkRMRWxCUVVrc1EwRkJRVHRIUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNN1FVRkJReXhSUVVGSE8wRkJRVU1zWVVGQlR5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVFN1MwRkJReXhEUVVGQkxFOUJRVTBzUTBGQlF5eEZRVUZETzBGQlFVTXNZMEZCVHl4RlFVRkZMRU5CUVVNc1MwRkJTeXhIUVVGRExFTkJRVU1zUlVGQlF5eEZRVUZGTEVOQlFVRXNRMEZCUVR0TFFVRkRPMGRCUVVNc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRE8wRkJRVU1zVVVGQlNTeERRVUZETzFGQlFVTXNRMEZCUXp0UlFVRkRMRU5CUVVNN1VVRkJReXhEUVVGRE8xRkJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhKUVVGSExFTkJRVU1zUlVGQlF6dEJRVUZETEZkQlFVY3NRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4TFFVRkhMRVZCUVVVc1NVRkJSU3hEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhMUVVGTExFVkJRVU1zUTBGQlF5eEhRVUZETEVsQlFVa3NRMEZCUVN4SFFVRkZMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEV0QlFVY3NRMEZCUXl4RFFVRkJPMEZCUVVNc1pVRkJUeXhMUVVGTExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1EwRkJRVHRQUVVGQk8wdEJRVU1zVFVGQlN5eERRVUZETEVkQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNUVUZCVFN4TFFVRkhMRVZCUVVVc1MwRkJSeXhEUVVGRExFbEJRVVVzUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eExRVUZITEVWQlFVVXNSMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNTMEZCUnl4RlFVRkZMRWxCUVVVc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUVN4QlFVRkRMRU5CUVVFN1IwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkRPMEZCUVVNc1VVRkJSenRCUVVGRExFOUJRVU1zUTBGQlF5eFZRVUZUTEVOQlFVTXNSVUZCUXp0QlFVRkRMRk5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVOQlFVRTdUMEZCUXl4RlFVRkRMRlZCUVZNc1EwRkJReXhGUVVGRE8wRkJRVU1zVTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRVHRQUVVGRExFTkJRVU1zUTBGQlFUdExRVUZETEVOQlFVRXNUMEZCVFN4RFFVRkRMRVZCUVVNN1FVRkJReXhQUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkJPMHRCUVVNN1IwRkJReXhUUVVGVExFTkJRVU1zUjBGQlJUdEJRVUZETEZkQlFVOHNSVUZCUlN4RlFVRkZMRU5CUVVFN1IwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTTdRVUZCUXl4TFFVRkRMRU5CUVVNc1JVRkJSU3hEUVVGRExFZEJRVU1zUlVGQlJTeEZRVUZGTEVWQlFVTXNRMEZCUXl4RFFVRkRMRTFCUVUwc1IwRkJReXhMUVVGTExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4SFFVRkRMRXRCUVVzc1EwRkJReXhGUVVGRExFTkJRVU1zUTBGQlF5eFpRVUZaTEVkQlFVTXNSVUZCUlN4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETzBGQlFVTXNWMEZCVHl4SlFVRkpMRVZCUVVVc1EwRkJReXhKUVVGSkxFVkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4RFFVRkJPMGRCUVVNc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETzBGQlFVTXNVVUZCU1N4RFFVRkRMRWRCUVVNc1NVRkJTU3hEUVVGRExFOUJRVThzU1VGQlNTeERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGRExGVkJRVk1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXp0QlFVRkRMRmRCUVVrc1NVRkJTU3hEUVVGRExFZEJRVU1zUTBGQlF5eERRVUZETEUxQlFVMHNSVUZCUXl4RFFVRkRMRWRCUVVNc1EwRkJReXhGUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVNc1EwRkJReXhEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkJPMHRCUVVNc1IwRkJReXhWUVVGVExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVTTdRVUZCUXl4UFFVRkRMRU5CUVVNc1NVRkJTU3hUUVVGVExFTkJRVU1zYVVOQlFXbERMRU5CUVVNc1EwRkJReXhEUVVGQk8wdEJRVU1zUTBGQlF5eERRVUZCTzBkQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRE8wRkJRVU1zVVVGQlNTeERRVUZETEVkQlFVTXNTVUZCU1R0UlFVRkRMRU5CUVVNc1IwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4UlFVRlBMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkJMRU5CUVVFN1IwRkJReXhUUVVGVExFTkJRVU1zUjBGQlJUdEJRVUZETEZWQlFVMHNTVUZCU1N4VFFVRlRMRU5CUVVNc2IwWkJRVzlHTEVOQlFVTXNRMEZCUVR0SFFVRkRMRk5CUVZNc1EwRkJReXhIUVVGRk8wRkJRVU1zVlVGQlRTeEpRVUZKTEZOQlFWTXNRMEZCUXl4MVNFRkJkVWdzUTBGQlF5eERRVUZCTzBkQlFVTXNVMEZCVXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRE8wRkJRVU1zVVVGQlNTeERRVUZETEVWQlFVVXNRMEZCUXl4SFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVkQlFVTXNTVUZCU1N4RFFVRkRMRTFCUVUwc1IwRkJReXhMUVVGTExFTkJRVU1zUlVGQlF5eEpRVUZKTEVOQlFVTXNXVUZCV1N4SFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFdEJRVWNzUTBGQlF5eExRVUZITEZWQlFWVXNTVUZCUlN4UFFVRlBMRU5CUVVNc1NVRkJSU3hEUVVGRExFVkJRVVVzUlVGQlF5eEpRVUZKTEZsQlFWa3NRMEZCUXl4SFFVRkRMRU5CUVVNc1EwRkJReXhKUVVGSkxFVkJRVU1zUTBGQlF5eERRVUZETEVkQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVFc1FVRkJReXhEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkRMRU5CUVVNc1JVRkJRenRCUVVGRExGRkJRVWtzUTBGQlF5eHZRa0ZCYjBJc1IwRkJReXhEUVVGRExFVkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNSMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRVZCUVVVc1EwRkJReXhKUVVGRkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRVZCUVVNc1MwRkJTeXhEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETEVOQlFVTXNTVUZCUlN4SlFVRkpMRU5CUVVNc1RVRkJUU3hIUVVGRExFTkJRVU1zUlVGQlF5eEpRVUZKTEVOQlFVTXNUVUZCVFN4SFFVRkRMRU5CUVVNc1EwRkJReXhOUVVGTkxFVkJRVU1zU1VGQlNTeERRVUZETEZWQlFWVXNSMEZCUXl4RFFVRkRMRU5CUVVNc1RVRkJUU3hGUVVGRExFbEJRVWtzUTBGQlF5eFBRVUZQTEVkQlFVTXNTVUZCU1N4TFFVRkxMRU5CUVVNc1NVRkJTU3hEUVVGRExFMUJRVTBzUTBGQlF5eEZRVUZETEVOQlFVTXNTMEZCUnl4SlFVRkpMRU5CUVVNc1RVRkJUU3hIUVVGRExFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RlFVRkRMRWxCUVVrc1EwRkJReXhQUVVGUExFTkJRVU1zU1VGQlJTeEpRVUZKTEVOQlFVTXNUVUZCVFN4SFFVRkRMRWxCUVVrc1EwRkJReXhOUVVGTkxFbEJRVVVzUTBGQlF5eEZRVUZETEVsQlFVa3NRMEZCUXl4VlFVRlZMRVZCUVVVc1JVRkJReXhEUVVGRExFdEJRVWNzU1VGQlNTeERRVUZETEZWQlFWVXNTVUZCUlN4RFFVRkRMRU5CUVVNc1NVRkJTU3hEUVVGRExFOUJRVThzUlVGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVFc1FVRkJReXhEUVVGQkxFZEJRVVVzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4UFFVRlBMRVZCUVVNc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlFUdEhRVUZETEZOQlFWTXNRMEZCUXl4SFFVRkZPMEZCUVVNc1YwRkJUeXhKUVVGSkxFdEJRVXNzUTBGQlF5eDVRMEZCZVVNc1EwRkJReXhEUVVGQk8wZEJRVU1zVTBGQlV5eERRVUZETEVkQlFVVTdRVUZCUXl4UlFVRkpMRU5CUVVNc1EwRkJReXhKUVVGSExGZEJRVmNzU1VGQlJTeFBRVUZQTEUxQlFVMHNSVUZCUXl4RFFVRkRMRWRCUVVNc1RVRkJUU3hEUVVGRExFdEJRVXNzU1VGQlJ5eFhRVUZYTEVsQlFVVXNUMEZCVHl4SlFVRkpMRVZCUVVNc1EwRkJReXhIUVVGRExFbEJRVWtzUTBGQlF5eExRVUZMTEVsQlFVYzdRVUZCUXl4UFFVRkRMRWRCUVVNc1VVRkJVU3hEUVVGRExHRkJRV0VzUTBGQlF5eEZRVUZGTEVOQlFVRTdTMEZCUXl4RFFVRkJMRTlCUVUwc1EwRkJReXhGUVVGRE8wRkJRVU1zV1VGQlRTeEpRVUZKTEV0QlFVc3NRMEZCUXl3d1JVRkJNRVVzUTBGQlF5eERRVUZCTzB0QlFVTXNTVUZCU1N4RFFVRkRMRWRCUVVNc1EwRkJReXhEUVVGRExFOUJRVThzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4SlFVRkZMR3RDUVVGclFpeExRVUZITEUxQlFVMHNRMEZCUXl4VFFVRlRMRU5CUVVNc1VVRkJVU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4RlFVRkZMRU5CUVVNc1NVRkJSU3hEUVVGRExFTkJRVU1zU1VGQlNTeERRVUZCTEV0QlFVa3NRMEZCUXl4RFFVRkRMRTlCUVU4c1IwRkJReXhGUVVGRkxFTkJRVUVzUVVGQlF5eERRVUZCTzBkQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGRExFdEJRVXNzUTBGQlF5eFBRVUZQTEVkQlFVTXNTMEZCU3l4RFFVRkRMRTlCUVU4c1IwRkJReXhWUVVGVExFTkJRVU1zUlVGQlF6dEJRVUZETEZkQlFVMHNaMEpCUVdkQ0xFdEJRVWNzVFVGQlRTeERRVUZETEZOQlFWTXNRMEZCUXl4UlFVRlJMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZCTzBkQlFVTXNRMEZCUXl4SlFVRkpMRU5CUVVNN1RVRkJReXhEUVVGRE8wMUJRVU1zUTBGQlF6dE5RVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRPMDFCUVVNc1EwRkJReXhIUVVGRExFTkJRVU03VFVGQlF5eERRVUZETEVkQlFVTXNWMEZCVXl4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRE8wRkJRVU1zVFVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNc1JVRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFbEJRVVVzUTBGQlF5eEZRVUZETEVOQlFVTXNTMEZCUnl4RFFVRkRMRXRCUVVjc1EwRkJReXhIUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRVZCUVVVc1EwRkJRU3hCUVVGRExFTkJRVUU3UjBGQlF6dE5RVUZETEVOQlFVTXNSMEZCUXl4WFFVRlhMRWxCUVVVc1QwRkJUeXhOUVVGTkxFZEJRVU1zVFVGQlRTeEhRVUZETEV0QlFVc3NRMEZCUXp0TlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFbEJRVVVzUlVGQlJUdE5RVUZETEVOQlFVTXNSMEZCUXl4RFFVRkRMRU5CUVVNc1owSkJRV2RDTEVsQlFVVXNRMEZCUXl4RFFVRkRMSE5DUVVGelFqdE5RVUZETEVOQlFVTXNSMEZCUXl4WFFVRlhMRWxCUVVVc1QwRkJUeXhKUVVGSkxFbEJRVVVzVjBGQlZ5eEpRVUZGTEU5QlFVOHNUMEZCVHl4SlFVRkZMR3RDUVVGclFpeExRVUZITEVOQlFVRXNSMEZCUlN4RFFVRkRMRkZCUVZFc1EwRkJReXhKUVVGSkxFTkJRVU1zVDBGQlR5eERRVUZETzAxQlFVTXNRMEZCUXl4SFFVRkRMRmRCUVZjc1NVRkJSU3hQUVVGUExHbENRVUZwUWl4SlFVRkZMRmRCUVZjc1NVRkJSU3hQUVVGUExHRkJRV0VzU1VGQlJTeFhRVUZYTEVsQlFVVXNUMEZCVHl4alFVRmpPMDFCUVVNc1JVRkJSU3hIUVVGRExFbEJRVWtzUzBGQlN5eERRVUZETEVsQlFVY3NRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFZEJRVU1zUTBGQlF5eEZRVUZGTEVkQlFVTXNRMEZCUXl4SFFVRkRMRU5CUVVNc1JVRkJSU3hIUVVGRExFTkJRVU1zUjBGQlF5eERRVUZETEVWQlFVVXNSMEZCUXl4TFFVRkxMRU5CUVVNc1MwRkJSeXhEUVVGRExFbEJRVVVzVlVGQlZTeEpRVUZGTEU5QlFVOHNUMEZCVHl4SFFVRkRMRU5CUVVNc1JVRkJSU3hIUVVGRExFTkJRVU1zUlVGQlJTeERRVUZETEVsQlFVa3NSVUZCUlN4SFFVRkRMRU5CUVVNN1RVRkJReXhGUVVGRkxFZEJRVU1zUTBGQlF6dE5RVUZETEVWQlFVVXNSMEZCUXl4SlFVRkpMRU5CUVVNc1RVRkJUU3hGUVVGRkxFTkJRVU1zVVVGQlVTeERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRMRk5CUVZNc1EwRkJReXhGUVVGRkxFTkJRVU03VFVGQlF5eEZRVUZGTEVkQlFVTXNTMEZCU3l4RFFVRkRPMDFCUVVNc1JVRkJSU3hIUVVGRExFTkJRVU03VFVGQlF5eEZRVUZGTEVkQlFVTXNRMEZCUXp0TlFVRkRMRVZCUVVVc1IwRkJReXhKUVVGSkxFTkJRVU1zUlVGQlFUdE5RVUZETEVWQlFVVXNSMEZCUXl4SlFVRkpMRU5CUVVNc1JVRkJRVHROUVVGRExFVkJRVVVzUjBGQlF5eERRVUZETzAxQlFVTXNSVUZCUlN4SFFVRkRMRU5CUVVNN1RVRkJReXhGUVVGRkxFZEJRVU1zUTBGQlF6dE5RVUZETEVWQlFVVXNSMEZCUXl4RFFVRkRPMDFCUVVNc1JVRkJSU3hIUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUnl4SFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFTkJRVU1zU1VGQlNTeEhRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRU5CUVVNc1QwRkJUeXhIUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEVOQlFVTXNUVUZCVFN4SFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFTkJRVU1zWVVGQllTeEhRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1VVRkJVU3hIUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNTMEZCU3l4SFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zVTBGQlV5eEhRVUZETEVWQlFVTXNWMEZCVnl4RlFVRkRMRU5CUVVNc1JVRkJReXhKUVVGSkxFVkJRVU1zUlVGQlJTeEZRVUZETEU5QlFVOHNSVUZCUXl4blFrRkJVeXhEUVVGRExFVkJRVU03UVVGQlF5eGhRVUZQTEVsQlFVa3NRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hGUVVGRExFTkJRVU1zUTBGQlF5eERRVUZCTzB0QlFVTXNSVUZCUXl4RFFVRkRMRWxCUVVrc1JVRkJSU3hIUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNVMEZCVXl4RFFVRkRMRlZCUVZVc1IwRkJReXhaUVVGVk8wRkJRVU1zVTBGQlNTeEpRVUZKTEVOQlFVTXNSMEZCUXl4SlFVRkpMRU5CUVVNc1RVRkJUU3hGUVVGRExFTkJRVU1zUjBGQlF5eEpRVUZKTEVOQlFVTXNUVUZCVFN4RlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFVkJRVU1zU1VGQlNTeERRVUZETEUxQlFVMHNTMEZCUnl4RlFVRkZMRWxCUVVVc1EwRkJReXhIUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVVXNSVUZCUXl4SlFVRkpMRU5CUVVNc1ZVRkJWU3hEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRVHRIUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEZOQlFWTXNRMEZCUXl4VlFVRlZMRWRCUVVNc1ZVRkJVeXhEUVVGRExFVkJRVU1zUTBGQlF5eEZRVUZETzBGQlFVTXNVVUZCU1N4RFFVRkRMRWRCUVVNc1NVRkJTU3hEUVVGRExHOUNRVUZ2UWp0UlFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zVDBGQlR5eERRVUZETEVsQlFVY3NRMEZCUXl4TFFVRkhMRVZCUVVVc1JVRkJRenRCUVVGRExGVkJRVWtzUTBGQlF5eEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhKUVVGSExFTkJRVU1zUzBGQlJ5eEZRVUZGTEVsQlFVVXNRMEZCUXl4RFFVRkRMRTFCUVUwc1MwRkJSeXhGUVVGRkxFVkJRVU1zU1VGQlNTeERRVUZETEZWQlFWVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1RVRkJUU3hGUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1MwRkJTeXhKUVVGSExGVkJRVlVzU1VGQlJTeFBRVUZQTEVOQlFVTXNSVUZCUXl4SlFVRkpMRU5CUVVNc1ZVRkJWU3hGUVVGRkxFVkJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVU1zUzBGQlN5eEpRVUZITEVOQlFVTXNTMEZCUnl4RlFVRkZMRVZCUVVNN1FVRkJReXhaUVVGSkxFTkJRVU1zUjBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1JVRkJReXhKUVVGSkxFTkJRVU1zWVVGQllTeERRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRVHRQUVVGRExFMUJRVXNzU1VGQlNTeERRVUZETEdGQlFXRXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhWUVVGVExFTkJRVU1zUlVGQlF6dEJRVUZETEZOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRVHRQUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUVR0TFFVRkRMRTFCUVVzc1NVRkJTU3hEUVVGRExHRkJRV0VzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFTkJRVUU3UjBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUXl4VFFVRlRMRU5CUVVNc1ZVRkJWU3hIUVVGRExGVkJRVk1zUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUXl4RFFVRkRMRVZCUVVNN1FVRkJReXhSUVVGSkxFTkJRVU1zUjBGQlF5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJReXhOUVVGTkxFdEJRVWNzUlVGQlJTeExRVUZITEVsQlFVa3NRMEZCUXl4VlFVRlZMRVZCUVVVc1JVRkJReXhEUVVGRExFdEJRVWNzUlVGQlJTeEhRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVNc1EwRkJReXhEUVVGRExFZEJRVU1zU1VGQlNTeERRVUZETEU5QlFVOHNRMEZCUXl4RFFVRkRMRU5CUVVNc1IwRkJReXhEUVVGRExFTkJRVUVzUVVGQlF5eEZRVUZETEVOQlFVTXNTMEZCUnl4SlFVRkpMRU5CUVVNc1ZVRkJWU3hKUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVTXNTVUZCU1N4RFFVRkRMRTlCUVU4c1EwRkJReXhEUVVGQk8wZEJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNVMEZCVXl4RFFVRkRMR0ZCUVdFc1IwRkJReXhWUVVGVExFTkJRVU1zUlVGQlF5eERRVUZETEVWQlFVTTdRVUZCUXl4UlFVRkpMRU5CUVVNc1IwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUXl4TFFVRkxMRU5CUVVNc1JVRkJReXhWUVVGVExFTkJRVU1zUlVGQlF6dEJRVUZETEU5QlFVTXNRMEZCUXl4VlFVRlZMRU5CUVVNc1JVRkJSU3hGUVVGRExFTkJRVU1zUlVGQlF5eERRVUZETEVOQlFVTXNRMEZCUVR0TFFVRkRMRVZCUVVNc1ZVRkJVeXhEUVVGRExFVkJRVU03UVVGQlF5eFBRVUZETEVOQlFVTXNWVUZCVlN4RFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVOQlFVRTdTMEZCUXl4RFFVRkRMRU5CUVVFN1IwRkJReXhEUVVGRExFbEJRVWtzUlVGQlJTeEhRVUZETEVOQlFVTTdUVUZCUXl4RlFVRkZMRWRCUVVNc1JVRkJReXhQUVVGUExFVkJRVU1zUlVGQlJTeEZRVUZETEZGQlFWRXNSVUZCUXl4RlFVRkZMRVZCUVVNc1EwRkJReXhWUVVGVkxFbEJRVVVzVDBGQlR5eE5RVUZOTEVsQlFVVXNUVUZCVFN4RFFVRkRMRWRCUVVjc1IwRkJReXhOUVVGTkxFTkJRVU1zV1VGQlZUdEJRVUZETEZkQlFVOHNSVUZCUlN4RFFVRkJPMGRCUVVNc1EwRkJReXhIUVVGRExGZEJRVmNzU1VGQlJTeFBRVUZQTEUxQlFVMHNTVUZCUlN4TlFVRk5MRU5CUVVNc1QwRkJUeXhIUVVGRExFMUJRVTBzUTBGQlF5eFBRVUZQTEVkQlFVTXNSVUZCUlN4SFFVRkRMRmRCUVZjc1NVRkJSU3hQUVVGUExFbEJRVWtzUzBGQlJ5eEpRVUZKTEVOQlFVTXNWVUZCVlN4SFFVRkRMRVZCUVVVc1EwRkJRU3hCUVVGRExFVkJRVU1zUlVGQlJTeEZRVUZGTEVOQlFVRTdRMEZCUXl4RFFVRkJMRU5CUVVVc1NVRkJTU3hYUVVGTkxFTkJRVU1pTENKbWFXeGxJam9pWjJWdVpYSmhkR1ZrTG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhORGIyNTBaVzUwSWpwYklpOHFJVnh1SUNvZ1FHOTJaWEoyYVdWM0lHVnpOaTF3Y205dGFYTmxJQzBnWVNCMGFXNTVJR2x0Y0d4bGJXVnVkR0YwYVc5dUlHOW1JRkJ5YjIxcGMyVnpMMEVyTGx4dUlDb2dRR052Y0hseWFXZG9kQ0JEYjNCNWNtbG5hSFFnS0dNcElESXdNVFFnV1dWb2RXUmhJRXRoZEhvc0lGUnZiU0JFWVd4bExDQlRkR1ZtWVc0Z1VHVnVibVZ5SUdGdVpDQmpiMjUwY21saWRYUnZjbk1nS0VOdmJuWmxjbk5wYjI0Z2RHOGdSVk0ySUVGUVNTQmllU0JLWVd0bElFRnlZMmhwWW1Gc1pDbGNiaUFxSUVCc2FXTmxibk5sSUNBZ1RHbGpaVzV6WldRZ2RXNWtaWElnVFVsVUlHeHBZMlZ1YzJWY2JpQXFJQ0FnSUNBZ0lDQWdJQ0FnVTJWbElHaDBkSEJ6T2k4dmNtRjNMbWRwZEdoMVluVnpaWEpqYjI1MFpXNTBMbU52YlM5cVlXdGxZWEpqYUdsaVlXeGtMMlZ6Tmkxd2NtOXRhWE5sTDIxaGMzUmxjaTlNU1VORlRsTkZYRzRnS2lCQWRtVnljMmx2YmlBZ0lETXVNaTR4WEc0Z0tpOWNibHh1S0daMWJtTjBhVzl1S0NsN1hDSjFjMlVnYzNSeWFXTjBYQ0k3Wm5WdVkzUnBiMjRnZENoMEtYdHlaWFIxY201Y0ltWjFibU4wYVc5dVhDSTlQWFI1Y0dWdlppQjBmSHhjSW05aWFtVmpkRndpUFQxMGVYQmxiMllnZENZbWJuVnNiQ0U5UFhSOVpuVnVZM1JwYjI0Z1pTaDBLWHR5WlhSMWNtNWNJbVoxYm1OMGFXOXVYQ0k5UFhSNWNHVnZaaUIwZldaMWJtTjBhVzl1SUc0b2RDbDdSejEwZldaMWJtTjBhVzl1SUhJb2RDbDdVVDEwZldaMWJtTjBhVzl1SUc4b0tYdHlaWFIxY200Z1puVnVZM1JwYjI0b0tYdHdjbTlqWlhOekxtNWxlSFJVYVdOcktHRXBmWDFtZFc1amRHbHZiaUJwS0NsN2NtVjBkWEp1SUdaMWJtTjBhVzl1S0NsN1FpaGhLWDE5Wm5WdVkzUnBiMjRnY3lncGUzWmhjaUIwUFRBc1pUMXVaWGNnV0NoaEtTeHVQV1J2WTNWdFpXNTBMbU55WldGMFpWUmxlSFJPYjJSbEtGd2lYQ0lwTzNKbGRIVnliaUJsTG05aWMyVnlkbVVvYml4N1kyaGhjbUZqZEdWeVJHRjBZVG9oTUgwcExHWjFibU4wYVc5dUtDbDdiaTVrWVhSaFBYUTlLeXQwSlRKOWZXWjFibU4wYVc5dUlIVW9LWHQyWVhJZ2REMXVaWGNnVFdWemMyRm5aVU5vWVc1dVpXdzdjbVYwZFhKdUlIUXVjRzl5ZERFdWIyNXRaWE56WVdkbFBXRXNablZ1WTNScGIyNG9LWHQwTG5CdmNuUXlMbkJ2YzNSTlpYTnpZV2RsS0RBcGZYMW1kVzVqZEdsdmJpQmpLQ2w3Y21WMGRYSnVJR1oxYm1OMGFXOXVLQ2w3YzJWMFZHbHRaVzkxZENoaExERXBmWDFtZFc1amRHbHZiaUJoS0NsN1ptOXlLSFpoY2lCMFBUQTdTajUwTzNRclBUSXBlM1poY2lCbFBYUjBXM1JkTEc0OWRIUmJkQ3N4WFR0bEtHNHBMSFIwVzNSZFBYWnZhV1FnTUN4MGRGdDBLekZkUFhadmFXUWdNSDFLUFRCOVpuVnVZM1JwYjI0Z1ppZ3BlM1J5ZVh0MllYSWdkRDF5WlhGMWFYSmxMR1U5ZENoY0luWmxjblI0WENJcE8zSmxkSFZ5YmlCQ1BXVXVjblZ1VDI1TWIyOXdmSHhsTG5KMWJrOXVRMjl1ZEdWNGRDeHBLQ2w5WTJGMFkyZ29iaWw3Y21WMGRYSnVJR01vS1gxOVpuVnVZM1JwYjI0Z2JDaDBMR1VwZTNaaGNpQnVQWFJvYVhNc2NqMXVaWGNnZEdocGN5NWpiMjV6ZEhKMVkzUnZjaWh3S1R0MmIybGtJREE5UFQxeVczSjBYU1ltYXloeUtUdDJZWElnYnoxdUxsOXpkR0YwWlR0cFppaHZLWHQyWVhJZ2FUMWhjbWQxYldWdWRITmJieTB4WFR0UktHWjFibU4wYVc5dUtDbDdlQ2h2TEhJc2FTeHVMbDl5WlhOMWJIUXBmU2w5Wld4elpTQkZLRzRzY2l4MExHVXBPM0psZEhWeWJpQnlmV1oxYm1OMGFXOXVJR2dvZENsN2RtRnlJR1U5ZEdocGN6dHBaaWgwSmlaY0ltOWlhbVZqZEZ3aVBUMTBlWEJsYjJZZ2RDWW1kQzVqYjI1emRISjFZM1J2Y2owOVBXVXBjbVYwZFhKdUlIUTdkbUZ5SUc0OWJtVjNJR1VvY0NrN2NtVjBkWEp1SUdjb2JpeDBLU3h1ZldaMWJtTjBhVzl1SUhBb0tYdDlablZ1WTNScGIyNGdYeWdwZTNKbGRIVnliaUJ1WlhjZ1ZIbHdaVVZ5Y205eUtGd2lXVzkxSUdOaGJtNXZkQ0J5WlhOdmJIWmxJR0VnY0hKdmJXbHpaU0IzYVhSb0lHbDBjMlZzWmx3aUtYMW1kVzVqZEdsdmJpQmtLQ2w3Y21WMGRYSnVJRzVsZHlCVWVYQmxSWEp5YjNJb1hDSkJJSEJ5YjIxcGMyVnpJR05oYkd4aVlXTnJJR05oYm01dmRDQnlaWFIxY200Z2RHaGhkQ0J6WVcxbElIQnliMjFwYzJVdVhDSXBmV1oxYm1OMGFXOXVJSFlvZENsN2RISjVlM0psZEhWeWJpQjBMblJvWlc1OVkyRjBZMmdvWlNsN2NtVjBkWEp1SUhWMExtVnljbTl5UFdVc2RYUjlmV1oxYm1OMGFXOXVJSGtvZEN4bExHNHNjaWw3ZEhKNWUzUXVZMkZzYkNobExHNHNjaWw5WTJGMFkyZ29ieWw3Y21WMGRYSnVJRzk5ZldaMWJtTjBhVzl1SUcwb2RDeGxMRzRwZTFFb1puVnVZM1JwYjI0b2RDbDdkbUZ5SUhJOUlURXNiejE1S0c0c1pTeG1kVzVqZEdsdmJpaHVLWHR5Zkh3b2NqMGhNQ3hsSVQwOWJqOW5LSFFzYmlrNlV5aDBMRzRwS1gwc1puVnVZM1JwYjI0b1pTbDdjbng4S0hJOUlUQXNhaWgwTEdVcEtYMHNYQ0pUWlhSMGJHVTZJRndpS3loMExsOXNZV0psYkh4OFhDSWdkVzVyYm05M2JpQndjbTl0YVhObFhDSXBLVHNoY2lZbWJ5WW1LSEk5SVRBc2FpaDBMRzhwS1gwc2RDbDlablZ1WTNScGIyNGdZaWgwTEdVcGUyVXVYM04wWVhSbFBUMDlhWFEvVXloMExHVXVYM0psYzNWc2RDazZaUzVmYzNSaGRHVTlQVDF6ZEQ5cUtIUXNaUzVmY21WemRXeDBLVHBGS0dVc2RtOXBaQ0F3TEdaMWJtTjBhVzl1S0dVcGUyY29kQ3hsS1gwc1puVnVZM1JwYjI0b1pTbDdhaWgwTEdVcGZTbDlablZ1WTNScGIyNGdkeWgwTEc0c2NpbDdiaTVqYjI1emRISjFZM1J2Y2owOVBYUXVZMjl1YzNSeWRXTjBiM0ltSm5JOVBUMWxkQ1ltWTI5dWMzUnlkV04wYjNJdWNtVnpiMngyWlQwOVBXNTBQMklvZEN4dUtUcHlQVDA5ZFhRL2FpaDBMSFYwTG1WeWNtOXlLVHAyYjJsa0lEQTlQVDF5UDFNb2RDeHVLVHBsS0hJcFAyMG9kQ3h1TEhJcE9sTW9kQ3h1S1gxbWRXNWpkR2x2YmlCbktHVXNiaWw3WlQwOVBXNC9haWhsTEY4b0tTazZkQ2h1S1Q5M0tHVXNiaXgyS0c0cEtUcFRLR1VzYmlsOVpuVnVZM1JwYjI0Z1FTaDBLWHQwTGw5dmJtVnljbTl5SmlaMExsOXZibVZ5Y205eUtIUXVYM0psYzNWc2RDa3NWQ2gwS1gxbWRXNWpkR2x2YmlCVEtIUXNaU2w3ZEM1ZmMzUmhkR1U5UFQxdmRDWW1LSFF1WDNKbGMzVnNkRDFsTEhRdVgzTjBZWFJsUFdsMExEQWhQVDEwTGw5emRXSnpZM0pwWW1WeWN5NXNaVzVuZEdnbUpsRW9WQ3gwS1NsOVpuVnVZM1JwYjI0Z2FpaDBMR1VwZTNRdVgzTjBZWFJsUFQwOWIzUW1KaWgwTGw5emRHRjBaVDF6ZEN4MExsOXlaWE4xYkhROVpTeFJLRUVzZENrcGZXWjFibU4wYVc5dUlFVW9kQ3hsTEc0c2NpbDdkbUZ5SUc4OWRDNWZjM1ZpYzJOeWFXSmxjbk1zYVQxdkxteGxibWQwYUR0MExsOXZibVZ5Y205eVBXNTFiR3dzYjF0cFhUMWxMRzliYVN0cGRGMDliaXh2VzJrcmMzUmRQWElzTUQwOVBXa21KblF1WDNOMFlYUmxKaVpSS0ZRc2RDbDlablZ1WTNScGIyNGdWQ2gwS1h0MllYSWdaVDEwTGw5emRXSnpZM0pwWW1WeWN5eHVQWFF1WDNOMFlYUmxPMmxtS0RBaFBUMWxMbXhsYm1kMGFDbDdabTl5S0haaGNpQnlMRzhzYVQxMExsOXlaWE4xYkhRc2N6MHdPM004WlM1c1pXNW5kR2c3Y3lzOU15bHlQV1ZiYzEwc2J6MWxXM01yYmwwc2NqOTRLRzRzY2l4dkxHa3BPbThvYVNrN2RDNWZjM1ZpYzJOeWFXSmxjbk11YkdWdVozUm9QVEI5ZldaMWJtTjBhVzl1SUUwb0tYdDBhR2x6TG1WeWNtOXlQVzUxYkd4OVpuVnVZM1JwYjI0Z1VDaDBMR1VwZTNSeWVYdHlaWFIxY200Z2RDaGxLWDFqWVhSamFDaHVLWHR5WlhSMWNtNGdZM1F1WlhKeWIzSTliaXhqZEgxOVpuVnVZM1JwYjI0Z2VDaDBMRzRzY2l4dktYdDJZWElnYVN4ekxIVXNZeXhoUFdVb2NpazdhV1lvWVNsN2FXWW9hVDFRS0hJc2J5a3NhVDA5UFdOMFB5aGpQU0V3TEhNOWFTNWxjbkp2Y2l4cFBXNTFiR3dwT25VOUlUQXNiajA5UFdrcGNtVjBkWEp1SUhadmFXUWdhaWh1TEdRb0tTbDlaV3h6WlNCcFBXOHNkVDBoTUR0dUxsOXpkR0YwWlNFOVBXOTBmSHdvWVNZbWRUOW5LRzRzYVNrNll6OXFLRzRzY3lrNmREMDlQV2wwUDFNb2JpeHBLVHAwUFQwOWMzUW1KbW9vYml4cEtTbDlablZ1WTNScGIyNGdReWgwTEdVcGUzUnllWHRsS0daMWJtTjBhVzl1S0dVcGUyY29kQ3hsS1gwc1puVnVZM1JwYjI0b1pTbDdhaWgwTEdVcGZTbDlZMkYwWTJnb2JpbDdhaWgwTEc0cGZYMW1kVzVqZEdsdmJpQlBLQ2w3Y21WMGRYSnVJR0YwS3l0OVpuVnVZM1JwYjI0Z2F5aDBLWHQwVzNKMFhUMWhkQ3NyTEhRdVgzTjBZWFJsUFhadmFXUWdNQ3gwTGw5eVpYTjFiSFE5ZG05cFpDQXdMSFF1WDNOMVluTmpjbWxpWlhKelBWdGRmV1oxYm1OMGFXOXVJRmtvZENsN2NtVjBkWEp1SUc1bGR5QmZkQ2gwYUdsekxIUXBMbkJ5YjIxcGMyVjlablZ1WTNScGIyNGdjU2gwS1h0MllYSWdaVDEwYUdsek8zSmxkSFZ5YmlCdVpYY2daU2hKS0hRcFAyWjFibU4wYVc5dUtHNHNjaWw3Wm05eUtIWmhjaUJ2UFhRdWJHVnVaM1JvTEdrOU1EdHZQbWs3YVNzcktXVXVjbVZ6YjJ4MlpTaDBXMmxkS1M1MGFHVnVLRzRzY2lsOU9tWjFibU4wYVc5dUtIUXNaU2w3WlNodVpYY2dWSGx3WlVWeWNtOXlLRndpV1c5MUlHMTFjM1FnY0dGemN5QmhiaUJoY25KaGVTQjBieUJ5WVdObExsd2lLU2w5S1gxbWRXNWpkR2x2YmlCR0tIUXBlM1poY2lCbFBYUm9hWE1zYmoxdVpYY2daU2h3S1R0eVpYUjFjbTRnYWlodUxIUXBMRzU5Wm5WdVkzUnBiMjRnUkNncGUzUm9jbTkzSUc1bGR5QlVlWEJsUlhKeWIzSW9YQ0paYjNVZ2JYVnpkQ0J3WVhOeklHRWdjbVZ6YjJ4MlpYSWdablZ1WTNScGIyNGdZWE1nZEdobElHWnBjbk4wSUdGeVozVnRaVzUwSUhSdklIUm9aU0J3Y205dGFYTmxJR052Ym5OMGNuVmpkRzl5WENJcGZXWjFibU4wYVc5dUlFc29LWHQwYUhKdmR5QnVaWGNnVkhsd1pVVnljbTl5S0Z3aVJtRnBiR1ZrSUhSdklHTnZibk4wY25WamRDQW5VSEp2YldselpTYzZJRkJzWldGelpTQjFjMlVnZEdobElDZHVaWGNuSUc5d1pYSmhkRzl5TENCMGFHbHpJRzlpYW1WamRDQmpiMjV6ZEhKMVkzUnZjaUJqWVc1dWIzUWdZbVVnWTJGc2JHVmtJR0Z6SUdFZ1puVnVZM1JwYjI0dVhDSXBmV1oxYm1OMGFXOXVJRXdvZENsN2RHaHBjMXR5ZEYwOVR5Z3BMSFJvYVhNdVgzSmxjM1ZzZEQxMGFHbHpMbDl6ZEdGMFpUMTJiMmxrSURBc2RHaHBjeTVmYzNWaWMyTnlhV0psY25NOVcxMHNjQ0U5UFhRbUppaGNJbVoxYm1OMGFXOXVYQ0loUFhSNWNHVnZaaUIwSmlaRUtDa3NkR2hwY3lCcGJuTjBZVzVqWlc5bUlFdy9ReWgwYUdsekxIUXBPa3NvS1NsOVpuVnVZM1JwYjI0Z1RpaDBMR1VwZTNSb2FYTXVYMmx1YzNSaGJtTmxRMjl1YzNSeWRXTjBiM0k5ZEN4MGFHbHpMbkJ5YjIxcGMyVTlibVYzSUhRb2NDa3NkR2hwY3k1d2NtOXRhWE5sVzNKMFhYeDhheWgwYUdsekxuQnliMjFwYzJVcExFRnljbUY1TG1selFYSnlZWGtvWlNrL0tIUm9hWE11WDJsdWNIVjBQV1VzZEdocGN5NXNaVzVuZEdnOVpTNXNaVzVuZEdnc2RHaHBjeTVmY21WdFlXbHVhVzVuUFdVdWJHVnVaM1JvTEhSb2FYTXVYM0psYzNWc2REMXVaWGNnUVhKeVlYa29kR2hwY3k1c1pXNW5kR2dwTERBOVBUMTBhR2x6TG14bGJtZDBhRDlUS0hSb2FYTXVjSEp2YldselpTeDBhR2x6TGw5eVpYTjFiSFFwT2loMGFHbHpMbXhsYm1kMGFEMTBhR2x6TG14bGJtZDBhSHg4TUN4MGFHbHpMbDlsYm5WdFpYSmhkR1VvS1N3d1BUMDlkR2hwY3k1ZmNtVnRZV2x1YVc1bkppWlRLSFJvYVhNdWNISnZiV2x6WlN4MGFHbHpMbDl5WlhOMWJIUXBLU2s2YWloMGFHbHpMbkJ5YjIxcGMyVXNWU2dwS1gxbWRXNWpkR2x2YmlCVktDbDdjbVYwZFhKdUlHNWxkeUJGY25KdmNpaGNJa0Z5Y21GNUlFMWxkR2h2WkhNZ2JYVnpkQ0JpWlNCd2NtOTJhV1JsWkNCaGJpQkJjbkpoZVZ3aUtYMW1kVzVqZEdsdmJpQlhLQ2w3ZG1GeUlIUTdhV1lvWENKMWJtUmxabWx1WldSY0lpRTlkSGx3Wlc5bUlHZHNiMkpoYkNsMFBXZHNiMkpoYkR0bGJITmxJR2xtS0Z3aWRXNWtaV1pwYm1Wa1hDSWhQWFI1Y0dWdlppQnpaV3htS1hROWMyVnNaanRsYkhObElIUnllWHQwUFVaMWJtTjBhVzl1S0Z3aWNtVjBkWEp1SUhSb2FYTmNJaWtvS1gxallYUmphQ2hsS1h0MGFISnZkeUJ1WlhjZ1JYSnliM0lvWENKd2IyeDVabWxzYkNCbVlXbHNaV1FnWW1WallYVnpaU0JuYkc5aVlXd2diMkpxWldOMElHbHpJSFZ1WVhaaGFXeGhZbXhsSUdsdUlIUm9hWE1nWlc1MmFYSnZibTFsYm5SY0lpbDlkbUZ5SUc0OWRDNVFjbTl0YVhObE95Z2hibng4WENKYmIySnFaV04wSUZCeWIyMXBjMlZkWENJaFBUMVBZbXBsWTNRdWNISnZkRzkwZVhCbExuUnZVM1J5YVc1bkxtTmhiR3dvYmk1eVpYTnZiSFpsS0NrcGZIeHVMbU5oYzNRcEppWW9kQzVRY205dGFYTmxQWEIwS1gxMllYSWdlanQ2UFVGeWNtRjVMbWx6UVhKeVlYay9RWEp5WVhrdWFYTkJjbkpoZVRwbWRXNWpkR2x2YmloMEtYdHlaWFIxY201Y0lsdHZZbXBsWTNRZ1FYSnlZWGxkWENJOVBUMVBZbXBsWTNRdWNISnZkRzkwZVhCbExuUnZVM1J5YVc1bkxtTmhiR3dvZENsOU8zWmhjaUJDTEVjc1NDeEpQWG9zU2owd0xGRTlablZ1WTNScGIyNG9kQ3hsS1h0MGRGdEtYVDEwTEhSMFcwb3JNVjA5WlN4S0t6MHlMREk5UFQxS0ppWW9SejlIS0dFcE9rZ29LU2w5TEZJOVhDSjFibVJsWm1sdVpXUmNJaUU5ZEhsd1pXOW1JSGRwYm1SdmR6OTNhVzVrYjNjNmRtOXBaQ0F3TEZZOVVueDhlMzBzV0QxV0xrMTFkR0YwYVc5dVQySnpaWEoyWlhKOGZGWXVWMlZpUzJsMFRYVjBZWFJwYjI1UFluTmxjblpsY2l4YVBWd2lkVzVrWldacGJtVmtYQ0k5UFhSNWNHVnZaaUJ6Wld4bUppWmNJblZ1WkdWbWFXNWxaRndpSVQxMGVYQmxiMllnY0hKdlkyVnpjeVltWENKYmIySnFaV04wSUhCeWIyTmxjM05kWENJOVBUMTdmUzUwYjFOMGNtbHVaeTVqWVd4c0tIQnliMk5sYzNNcExDUTlYQ0oxYm1SbFptbHVaV1JjSWlFOWRIbHdaVzltSUZWcGJuUTRRMnhoYlhCbFpFRnljbUY1SmlaY0luVnVaR1ZtYVc1bFpGd2lJVDEwZVhCbGIyWWdhVzF3YjNKMFUyTnlhWEIwY3lZbVhDSjFibVJsWm1sdVpXUmNJaUU5ZEhsd1pXOW1JRTFsYzNOaFoyVkRhR0Z1Ym1Wc0xIUjBQVzVsZHlCQmNuSmhlU2d4WlRNcE8wZzlXajl2S0NrNldEOXpLQ2s2SkQ5MUtDazZkbTlwWkNBd1BUMDlVaVltWENKbWRXNWpkR2x2Ymx3aVBUMTBlWEJsYjJZZ2NtVnhkV2x5WlQ5bUtDazZZeWdwTzNaaGNpQmxkRDFzTEc1MFBXZ3NjblE5VFdGMGFDNXlZVzVrYjIwb0tTNTBiMU4wY21sdVp5Z3pOaWt1YzNWaWMzUnlhVzVuS0RFMktTeHZkRDEyYjJsa0lEQXNhWFE5TVN4emREMHlMSFYwUFc1bGR5Qk5MR04wUFc1bGR5Qk5MR0YwUFRBc1puUTlXU3hzZEQxeExHaDBQVVlzY0hROVREdE1MbUZzYkQxbWRDeE1MbkpoWTJVOWJIUXNUQzV5WlhOdmJIWmxQVzUwTEV3dWNtVnFaV04wUFdoMExFd3VYM05sZEZOamFHVmtkV3hsY2oxdUxFd3VYM05sZEVGellYQTljaXhNTGw5aGMyRndQVkVzVEM1d2NtOTBiM1I1Y0dVOWUyTnZibk4wY25WamRHOXlPa3dzZEdobGJqcGxkQ3hjSW1OaGRHTm9YQ0k2Wm5WdVkzUnBiMjRvZENsN2NtVjBkWEp1SUhSb2FYTXVkR2hsYmlodWRXeHNMSFFwZlgwN2RtRnlJRjkwUFU0N1RpNXdjbTkwYjNSNWNHVXVYMlZ1ZFcxbGNtRjBaVDFtZFc1amRHbHZiaWdwZTJadmNpaDJZWElnZEQxMGFHbHpMbXhsYm1kMGFDeGxQWFJvYVhNdVgybHVjSFYwTEc0OU1EdDBhR2x6TGw5emRHRjBaVDA5UFc5MEppWjBQbTQ3YmlzcktYUm9hWE11WDJWaFkyaEZiblJ5ZVNobFcyNWRMRzRwZlN4T0xuQnliM1J2ZEhsd1pTNWZaV0ZqYUVWdWRISjVQV1oxYm1OMGFXOXVLSFFzWlNsN2RtRnlJRzQ5ZEdocGN5NWZhVzV6ZEdGdVkyVkRiMjV6ZEhKMVkzUnZjaXh5UFc0dWNtVnpiMngyWlR0cFppaHlQVDA5Ym5RcGUzWmhjaUJ2UFhZb2RDazdhV1lvYnowOVBXVjBKaVowTGw5emRHRjBaU0U5UFc5MEtYUm9hWE11WDNObGRIUnNaV1JCZENoMExsOXpkR0YwWlN4bExIUXVYM0psYzNWc2RDazdaV3h6WlNCcFppaGNJbVoxYm1OMGFXOXVYQ0loUFhSNWNHVnZaaUJ2S1hSb2FYTXVYM0psYldGcGJtbHVaeTB0TEhSb2FYTXVYM0psYzNWc2RGdGxYVDEwTzJWc2MyVWdhV1lvYmowOVBYQjBLWHQyWVhJZ2FUMXVaWGNnYmlod0tUdDNLR2tzZEN4dktTeDBhR2x6TGw5M2FXeHNVMlYwZEd4bFFYUW9hU3hsS1gxbGJITmxJSFJvYVhNdVgzZHBiR3hUWlhSMGJHVkJkQ2h1WlhjZ2JpaG1kVzVqZEdsdmJpaGxLWHRsS0hRcGZTa3NaU2w5Wld4elpTQjBhR2x6TGw5M2FXeHNVMlYwZEd4bFFYUW9jaWgwS1N4bEtYMHNUaTV3Y205MGIzUjVjR1V1WDNObGRIUnNaV1JCZEQxbWRXNWpkR2x2YmloMExHVXNiaWw3ZG1GeUlISTlkR2hwY3k1d2NtOXRhWE5sTzNJdVgzTjBZWFJsUFQwOWIzUW1KaWgwYUdsekxsOXlaVzFoYVc1cGJtY3RMU3gwUFQwOWMzUS9haWh5TEc0cE9uUm9hWE11WDNKbGMzVnNkRnRsWFQxdUtTd3dQVDA5ZEdocGN5NWZjbVZ0WVdsdWFXNW5KaVpUS0hJc2RHaHBjeTVmY21WemRXeDBLWDBzVGk1d2NtOTBiM1I1Y0dVdVgzZHBiR3hUWlhSMGJHVkJkRDFtZFc1amRHbHZiaWgwTEdVcGUzWmhjaUJ1UFhSb2FYTTdSU2gwTEhadmFXUWdNQ3htZFc1amRHbHZiaWgwS1h0dUxsOXpaWFIwYkdWa1FYUW9hWFFzWlN4MEtYMHNablZ1WTNScGIyNG9kQ2w3Ymk1ZmMyVjBkR3hsWkVGMEtITjBMR1VzZENsOUtYMDdkbUZ5SUdSMFBWY3NkblE5ZTFCeWIyMXBjMlU2Y0hRc2NHOXNlV1pwYkd3NlpIUjlPMXdpWm5WdVkzUnBiMjVjSWowOWRIbHdaVzltSUdSbFptbHVaU1ltWkdWbWFXNWxMbUZ0WkQ5a1pXWnBibVVvWm5WdVkzUnBiMjRvS1h0eVpYUjFjbTRnZG5SOUtUcGNJblZ1WkdWbWFXNWxaRndpSVQxMGVYQmxiMllnYlc5a2RXeGxKaVp0YjJSMWJHVXVaWGh3YjNKMGN6OXRiMlIxYkdVdVpYaHdiM0owY3oxMmREcGNJblZ1WkdWbWFXNWxaRndpSVQxMGVYQmxiMllnZEdocGN5WW1LSFJvYVhNdVJWTTJVSEp2YldselpUMTJkQ2tzWkhRb0tYMHBMbU5oYkd3b2RHaHBjeWs3SWwxOSIsImltcG9ydCAnLi4vbGliL2VzNi1wcm9taXNlLm1pbi5qcydcbmltcG9ydCBUZW1wbGF0ZXMgZnJvbSBcIi4uL1RlbXBsYXRlc1wiXG5pbXBvcnQgTG9naW5DaGVjayBmcm9tIFwiLi4vTG9naW5DaGVja1wiXG5pbXBvcnQgeyBnZXRKU09OLCByb3VuZCB9IGZyb20gXCIuLi9oZWxwZXJzXCJcbmltcG9ydCBBUEksIHsgVEJBLCBnZXRUZWFtcywgZ2V0VGVhbVN0YXRzIH0gZnJvbSBcIi4uL0FQSVwiXG5cbmV4cG9ydCBmdW5jdGlvbiBldmVudChrZXkpIHtcbiAgUHJvbWlzZS5hbGwoW1xuICAgIExvZ2luQ2hlY2suZ2V0KCksXG4gICAgVGVtcGxhdGVzLmdldChcImV2ZW50XCIpLFxuICAgIGdldEpTT04oXCJzdGF0cy1jb25maWcuanNvblwiKSxcbiAgICBUQkEuZ2V0KFwiZXZlbnQvXCIra2V5KSxcbiAgXSkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICBjb25zdCBbLCB0ZW1wbGF0ZSwgc3RhdHMsIGV2ZW50XSA9IHJlcztcbiAgICBjb25zdCAkY29udGFpbmVyID0gJChcIiNtYWluXCIpLmNsb3Nlc3QoXCIuY29udGFpbmVyXCIpO1xuICAgIGNvbnN0IGNvbnRhaW5lckNsYXNzID0gJGNvbnRhaW5lci5hdHRyKFwiY2xhc3NcIik7XG4gICAgY29uc3QgcmFjdGl2ZSA9IG5ldyBSYWN0aXZlKHtcbiAgICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZSxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAga2V5OiBrZXksXG4gICAgICAgIHN0YXRDb25maWc6IHN0YXRzLFxuICAgICAgICBsb2FkaW5nOiB0cnVlLFxuICAgICAgICB0ZWFtczogW10sXG4gICAgICAgIHJvdW5kOiByb3VuZCxcbiAgICAgICAgZXZlbnQ6IGV2ZW50LFxuICAgICAgICBzdGF0Q29sb3IodmFsdWUsIHN0YXQpIHtcbiAgICAgICAgICBjb25zdCB2YWx1ZSA9IHBhcnNlRmxvYXQodmFsdWUpO1xuICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBzdGF0LnByb2dyZXNzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoKCFzdGF0LnByb2dyZXNzW2ldLm1pbiB8fCB2YWx1ZSA+PSBzdGF0LnByb2dyZXNzW2ldLm1pbikgJiYgKCFzdGF0LnByb2dyZXNzW2ldLm1heCB8fCB2YWx1ZSA8PSBzdGF0LnByb2dyZXNzW2ldLm1heCkpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHN0YXQucHJvZ3Jlc3NbaV0uY2xhc3M7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBtb2JpbGU6ICQod2luZG93KS53aWR0aCgpIDwgOTAwLFxuICAgICAgICB0b2tlbjogbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3Rva2VuJyksXG4gICAgICAgIHVzZXI6IHtcbiAgICAgICAgICBuYW1lOiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlci5uYW1lJykgfHwgJycsXG4gICAgICAgICAgdGVhbTogbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VzZXIudGVhbScpIHx8ICcnXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBjb21wdXRlZDoge1xuICAgICAgICBtb2JpbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHJldHVybiAkKHdpbmRvdykud2lkdGgoKSA8IDkwMDtcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9ucmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICAgICAgJGNvbnRhaW5lci5hZGRDbGFzcyhcIndpZGVcIik7XG4gICAgICB9LFxuICAgICAgb251bnJlbmRlcjogZnVuY3Rpb24oKSB7XG4gICAgICAgICRjb250YWluZXIuYXR0cihcImNsYXNzXCIsIGNvbnRhaW5lckNsYXNzKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGdldFRlYW1zKEFQSSwga2V5KS50aGVuKGZ1bmN0aW9uKHRlYW1zKSB7XG4gICAgICBjb25zb2xlLmxvZyh0ZWFtcylcbiAgICAgIHJhY3RpdmUuc2V0KHtcbiAgICAgICAgdGVhbXM6IHRlYW1zLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICAgIHJldHVybiBhLnRlYW1fbnVtYmVyIC0gYi50ZWFtX251bWJlclxuICAgICAgICB9KSxcbiAgICAgICAgbG9hZGluZzogZmFsc2VcbiAgICAgIH0pO1xuICAgICAgU29ydGFibGUuaW5pdCgpO1xuICAgIH0pO1xuICB9KTtcbn1cbiIsImltcG9ydCAnLi4vbGliL2VzNi1wcm9taXNlLm1pbi5qcydcbmltcG9ydCBUZW1wbGF0ZXMgZnJvbSBcIi4uL1RlbXBsYXRlc1wiXG5pbXBvcnQgQVBJLCB7IFRCQSB9IGZyb20gXCIuLi9BUElcIlxuaW1wb3J0IHsgcm91bmQgfSBmcm9tIFwiLi4vaGVscGVyc1wiXG5cbmV4cG9ydCBmdW5jdGlvbiBldmVudE1hdGNoZXMoZXZlbnRLZXkpIHtcbiAgUHJvbWlzZS5hbGwoW1xuICAgIFRlbXBsYXRlcy5nZXQoXCJldmVudC1tYXRjaGVzXCIpLFxuICAgIFRCQS5nZXQoXCJldmVudC9cIitldmVudEtleSksXG4gICAgVEJBLmdldChcImV2ZW50L1wiK2V2ZW50S2V5K1wiL3N0YXRzXCIpLFxuICBdKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgIGNvbnN0IFt0ZW1wbGF0ZSwgZXZlbnQsIGV2ZW50U3RhdHNdID0gcmVzO1xuICAgIGNvbnN0IHByZWRpY3Rpb25zQ291bnRzID0ge1xuICAgICAgXCJvcHJzXCI6IFtdLFxuICAgICAgXCJkcHJzXCI6IFtdLFxuICAgICAgXCJjY3dtc1wiOiBbXSxcbiAgICB9O1xuICAgIGNvbnN0IHJhY3RpdmUgPSBuZXcgUmFjdGl2ZSh7XG4gICAgICB0ZW1wbGF0ZTogdGVtcGxhdGUsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGV2ZW50OiBldmVudCxcbiAgICAgICAgZXZlbnRTdGF0czogZXZlbnRTdGF0cyxcbiAgICAgICAgbWF0Y2hlczogW10sXG4gICAgICAgIGxvYWRpbmc6IDEsXG4gICAgICAgIG1vbWVudDogZnVuY3Rpb24oZGF0ZSkge1xuICAgICAgICAgIHJldHVybiBtb21lbnQoZGF0ZSkuZnJvbU5vdygpO1xuICAgICAgICB9LFxuICAgICAgICBnZXRBbGxpYW5jZVN1bSh0ZWFtcywga2V5KSB7XG4gICAgICAgICAgcmV0dXJuIHRlYW1zLm1hcCh0ZWFtID0+IGV2ZW50U3RhdHNba2V5XVt0ZWFtLnJlcGxhY2UoL1teXFxkXS9nLCAnJyldKS5yZWR1Y2UoKGEsIGIpID0+IGEgKyBiKTtcbiAgICAgICAgfSxcbiAgICAgICAgZ2V0V2lubmVyKHJlZFRlYW1zLCBibHVlVGVhbXMsIGtleSkge1xuICAgICAgICAgIHJldHVybiB0aGlzLmdldChcImdldEFsbGlhbmNlU3VtXCIpKHJlZFRlYW1zLCBrZXkpID4gdGhpcy5nZXQoXCJnZXRBbGxpYW5jZVN1bVwiKShibHVlVGVhbXMsIGtleSk7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBjb21wdXRlZDoge1xuICAgICAgICBtb2JpbGUoKSB7XG4gICAgICAgICAgcmV0dXJuICQod2luZG93KS53aWR0aCgpIDwgOTAwO1xuICAgICAgICB9XG4gICAgICB9LFxuICAgIH0pO1xuICAgIFRCQS5nZXQoXCJldmVudC9cIitldmVudEtleStcIi9tYXRjaGVzXCIpLnRoZW4oZnVuY3Rpb24obWF0Y2hlcykge1xuICAgICAgcmV0dXJuIG1hdGNoZXM7XG4gICAgfSkudGhlbihmdW5jdGlvbihtYXRjaGVzKSB7XG4gICAgICBjb25zdCBzdW0gPSByYWN0aXZlLmdldChcImdldEFsbGlhbmNlU3VtXCIpLmJpbmQocmFjdGl2ZSk7XG4gICAgICBjb25zdCBwcmVkaWN0ZWRXaW5uZXIgPSByYWN0aXZlLmdldChcImdldFdpbm5lclwiKS5iaW5kKHJhY3RpdmUpO1xuICAgICAgbWF0Y2hlcy5mb3JFYWNoKGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgICAgIGNvbnN0IHJlZCA9IG1hdGNoLmFsbGlhbmNlcy5yZWQsXG4gICAgICAgICAgICAgIGJsdWUgPSBtYXRjaC5hbGxpYW5jZXMuYmx1ZTtcbiAgICAgICAgY29uc3Qgd2lubmVyID0gcmVkLnNjb3JlID4gYmx1ZS5zY29yZTtcbiAgICAgICAgY29uc3QgcmVkVGVhbXMgPSByZWQudGVhbXMubWFwKHRlYW0gPT4gdGVhbS5yZXBsYWNlKC9bXlxcZF0vZywgJycpKVxuICAgICAgICBjb25zdCBibHVlVGVhbXMgPSBibHVlLnRlYW1zLm1hcCh0ZWFtID0+IHRlYW0ucmVwbGFjZSgvW15cXGRdL2csICcnKSlcbiAgICAgICAgY29uc3Qgb3ByUHJlZCA9IHByZWRpY3RlZFdpbm5lcihyZWRUZWFtcywgYmx1ZVRlYW1zLCAnb3BycycpXG4gICAgICAgIGNvbnN0IGRwclByZWQgPSBwcmVkaWN0ZWRXaW5uZXIocmVkVGVhbXMsIGJsdWVUZWFtcywgJ2RwcnMnKVxuICAgICAgICBjb25zdCBjY3dtUHJlZCA9IHByZWRpY3RlZFdpbm5lcihyZWRUZWFtcywgYmx1ZVRlYW1zLCAnY2N3bXMnKVxuICAgICAgICBwcmVkaWN0aW9uc0NvdW50cy5vcHJzLnB1c2gob3ByUHJlZCA9PSB3aW5uZXIpXG4gICAgICAgIHByZWRpY3Rpb25zQ291bnRzLmRwcnMucHVzaChkcHJQcmVkID09IHdpbm5lcilcbiAgICAgICAgcHJlZGljdGlvbnNDb3VudHMuY2N3bXMucHVzaChjY3dtUHJlZCA9PSB3aW5uZXIpXG4gICAgICB9KTtcbiAgICAgIHJhY3RpdmUuc2V0KHtcbiAgICAgICAgbWF0Y2hlczogbWF0Y2hlcyxcbiAgICAgICAgbG9hZGluZzogMixcbiAgICAgICAgcHJlZGljdGlvbnM6IDFcbiAgICAgIH0pO1xuICAgICAgUHJvbWlzZS5hbGwobWF0Y2hlcy5tYXAobWF0Y2ggPT4gQVBJLmdldChgd29yay9tYXRjaC8ke2V2ZW50S2V5fS8ke21hdGNoLmtleX1gKSkpLnRoZW4oZnVuY3Rpb24obWF0Y2hlcykge1xuICAgICAgICByYWN0aXZlLnNldChcImxvYWRpbmdcIiwgMCk7XG4gICAgICAgIHJhY3RpdmUuc2V0KHtcbiAgICAgICAgICBtYXRjaGVzOiByYWN0aXZlLmdldChcIm1hdGNoZXNcIikubWFwKChtYXRjaCwgaSkgPT4ge1xuICAgICAgICAgICAgbWF0Y2gucHJlZGljdGlvbnMgPSBtYXRjaGVzW2ldLm1hcChzY29yZSA9PiByb3VuZChzY29yZSwgMikpO1xuICAgICAgICAgICAgcmV0dXJuIG1hdGNoO1xuICAgICAgICAgIH0pLFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9KTtcbn1cbiIsImltcG9ydCAnLi4vbGliL2VzNi1wcm9taXNlLm1pbi5qcydcbmltcG9ydCBUZW1wbGF0ZXMgZnJvbSBcIi4uL1RlbXBsYXRlc1wiXG5pbXBvcnQgTG9naW5DaGVjayBmcm9tIFwiLi4vTG9naW5DaGVja1wiXG5cbmV4cG9ydCBmdW5jdGlvbiBldmVudHMoa2V5KSB7XG4gIFByb21pc2UuYWxsKFtcbiAgICBMb2dpbkNoZWNrLmdldCgpLFxuICAgIFRlbXBsYXRlcy5nZXQoXCJldmVudHNcIiksXG4gIF0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgY29uc3QgWywgdGVtcGxhdGVdID0gcmVzO1xuICAgIGNvbnN0IHJhY3RpdmUgPSBuZXcgUmFjdGl2ZSh7XG4gICAgICB0ZW1wbGF0ZTogdGVtcGxhdGUsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGV2ZW50czoge1xuICAgICAgICAgIFwiMjAxNmFyY1wiOiBcIkFyY2hpbWVkZXNcIixcbiAgICAgICAgICBcIjIwMTZjYXJzXCI6IFwiQ2Fyc29uXCIsXG4gICAgICAgICAgXCIyMDE2Y2FydlwiOiBcIkNhcnZlclwiLFxuICAgICAgICAgIFwiMjAxNmN1clwiOiBcIkN1cmllXCIsXG4gICAgICAgICAgXCIyMDE2Z2FsXCI6IFwiR2FsaWxlb1wiLFxuICAgICAgICAgIFwiMjAxNmhvcFwiOiBcIkhvcHBlclwiLFxuICAgICAgICAgIFwiMjAxNm5ld1wiOiBcIk5ld3RvblwiLFxuICAgICAgICAgIFwiMjAxNnRlc1wiOiBcIlRlc2xhXCIsXG4gICAgICAgICAgXCIyMDE2Y21wXCI6IFwiRWluc3RlaW5cIixcbiAgICAgICAgfSxcbiAgICAgICAgbW9iaWxlOiAkKHdpbmRvdykud2lkdGgoKSA8IDkwMCxcbiAgICAgICAgdG9rZW46IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpLFxuICAgICAgICB1c2VyOiB7XG4gICAgICAgICAgbmFtZTogbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VzZXIubmFtZScpIHx8ICcnLFxuICAgICAgICAgIHRlYW06IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1c2VyLnRlYW0nKSB8fCAnJ1xuICAgICAgICB9XG4gICAgICB9LFxuICAgICAgY29tcHV0ZWQ6IHtcbiAgICAgICAgbW9iaWxlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICByZXR1cm4gJCh3aW5kb3cpLndpZHRoKCkgPCA5MDA7XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgfSk7XG4gIH0pO1xufVxuIiwiaW1wb3J0ICcuLi9saWIvZXM2LXByb21pc2UubWluLmpzJ1xuaW1wb3J0IFRlbXBsYXRlcyBmcm9tIFwiLi4vVGVtcGxhdGVzXCJcbmltcG9ydCBMb2dpbkNoZWNrIGZyb20gXCIuLi9Mb2dpbkNoZWNrXCJcbmltcG9ydCB7XG4gIGdldEpTT04sXG4gIHJvdW5kXG59IGZyb20gXCIuLi9oZWxwZXJzXCJcbmltcG9ydCBBUEksIHtcbiAgZ2V0VGVhbVN0YXRzLFxuICBnZW5lcmF0ZVRva2VuXG59IGZyb20gXCIuLi9BUElcIlxuXG5leHBvcnQgZnVuY3Rpb24gbG9naW4oKSB7XG4gIFByb21pc2UuYWxsKFtcbiAgICBUZW1wbGF0ZXMuZ2V0KFwibG9naW5cIilcbiAgXSkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICBjb25zdCBbdGVtcGxhdGVdID0gcmVzO1xuICAgIGlmIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndG9rZW4nKSkge1xuICAgICAgbG9jYXRpb24uaGFzaCA9IFwiIy9hL2V2ZW50c1wiXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHJhY3RpdmUgPSBuZXcgUmFjdGl2ZSh7XG4gICAgICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZSxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIG1vYmlsZTogJCh3aW5kb3cpLndpZHRoKCkgPCA5MDAsXG4gICAgICAgICAgdG9rZW46IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpLFxuICAgICAgICAgIHVzZXI6IHtcbiAgICAgICAgICAgIG5hbWU6IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1c2VyLm5hbWUnKSB8fCAnJyxcbiAgICAgICAgICAgIHRlYW06IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1c2VyLnRlYW0nKSB8fCAnJ1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgICAgcmFjdGl2ZS5vbignbG9naW4nLCBmdW5jdGlvbihub2RlKSB7XG4gICAgICAgIHZhciBuYW1lID0gdGhpcy5nZXQoXCJ1c2VyLm5hbWVcIik7XG4gICAgICAgIHZhciB0ZWFtID0gdGhpcy5nZXQoXCJ1c2VyLnRlYW1cIik7XG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwidXNlci5uYW1lXCIsIG5hbWUpO1xuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInVzZXIudGVhbVwiLCB0ZWFtKTtcbiAgICAgICAgdmFyIHRva2VuID0gZ2VuZXJhdGVUb2tlbih0ZWFtLCBuYW1lKTtcbiAgICAgICAgbG9jYXRpb24uaGFzaCA9IFwiIy9hL2V2ZW50c1wiO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9KTtcbiAgICB9XG4gIH0pLmNhdGNoKGNvbnNvbGUuZXJyb3IuYmluZChjb25zb2xlKSk7XG59XG4iLCJpbXBvcnQgJy4uL2xpYi9lczYtcHJvbWlzZS5taW4uanMnXG5pbXBvcnQgVGVtcGxhdGVzIGZyb20gXCIuLi9UZW1wbGF0ZXNcIlxuaW1wb3J0IExvZ2luQ2hlY2sgZnJvbSBcIi4uL0xvZ2luQ2hlY2tcIlxuaW1wb3J0IHsgZ2V0SlNPTiwgcm91bmQgfSBmcm9tIFwiLi4vaGVscGVyc1wiXG5pbXBvcnQgQVBJLCB7IGdldFRlYW1TdGF0cyB9IGZyb20gXCIuLi9BUElcIlxuXG5leHBvcnQgZnVuY3Rpb24gdGVhbShrZXkpIHtcbiAgUHJvbWlzZS5hbGwoW1xuICAgIExvZ2luQ2hlY2suZ2V0KCksXG4gICAgVGVtcGxhdGVzLmdldChcInRlYW1cIiksXG4gICAgZ2V0SlNPTihcInN0YXRzLWNvbmZpZy5qc29uXCIpLFxuICAgIGdldFRlYW1TdGF0cyhBUEksIGtleSksXG4gIF0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgY29uc3QgWywgdGVtcGxhdGUsIHN0YXRzLCB0ZWFtRGF0YV0gPSByZXM7XG4gICAgY29uc3QgcmFjdGl2ZSA9IG5ldyBSYWN0aXZlKHtcbiAgICAgIHRlbXBsYXRlOiB0ZW1wbGF0ZSxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgc3RhdHM6IHN0YXRzLFxuICAgICAgICBzdGF0S2V5czogWydjYWxjcycsICdnb2FscycsICdkZWZlbnNlcycsICd0b3dlciddLFxuICAgICAgICBrZXk6IGtleSxcbiAgICAgICAgdGVhbTogdGVhbURhdGEsXG4gICAgICAgIHJvdW5kOiByb3VuZCxcbiAgICAgICAgbW9iaWxlOiAkKHdpbmRvdykud2lkdGgoKSA8IDkwMCxcbiAgICAgICAgdG9rZW46IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0b2tlbicpLFxuICAgICAgICB1c2VyOiB7XG4gICAgICAgICAgbmFtZTogbG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VzZXIubmFtZScpIHx8ICcnLFxuICAgICAgICAgIHRlYW06IGxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1c2VyLnRlYW0nKSB8fCAnJyxcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH0pLmNhdGNoKGNvbnNvbGUuZXJyb3IuYmluZChjb25zb2xlKSk7XG59XG4iXX0=
