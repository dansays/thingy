/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var config = _interopRequireWildcard(__webpack_require__(1));

var _draftsTemplateParser = __webpack_require__(2);

var _AutoTagger = __webpack_require__(3);

var _TasksParser = __webpack_require__(6);

var _Project = __webpack_require__(10);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

var configNote = getConfig();
var autotagger = new _AutoTagger.Autotagger(configNote);
var parser = new _TasksParser.TasksParser(autotagger);
var document = getDocument();
var templateParser = new _draftsTemplateParser.TemplateTagParser(document);
templateParser.ask();
document = templateParser.parse(document).text;
var data = parser.parse(document);
var firstLine = document.split('\n')[0];

if (firstLine.startsWith('#')) {
  var title = firstLine.substring(1).trim();
  var project = new _Project.Project(title, data);
  data = project.toThingsObject();
}

var sent = sendToThings(data);

if (draft.title == config.autotaggerRulesDraftTitle) {
  alert("Oops! You probably don't want to add your Autotagger rules as Things tasks.");
  context.cancel();
} else if (sent === false) {
  context.fail();
} else if (sent === undefined) {
  context.cancel('No tasks found');
} else {
  cleanup();
} ////////////////////////////////////////////////////////////////////////////////


function getConfig() {
  var configNote = Draft.query("# ".concat(config.autotaggerRulesDraftTitle), 'all').filter(function (d) {
    return d.content.startsWith("# ".concat(config.autotaggerRulesDraftTitle));
  }).filter(function (d) {
    return !d.isTrashed;
  });

  if (configNote.length == 0) {
    configNote.push(addDefaultConfig());
  }

  return configNote.map(function (draft) {
    return draft.content;
  }).join('\n');
}

function addDefaultConfig() {
  var configNote = Draft.create();
  configNote.content = config.defaultAutotaggerRules;
  configNote.update();
  alert(config.newAutotaggerRulesMessage);
  return configNote;
}

function getDocument() {
  if (typeof editor === 'undefined') return '';
  if (draft.title == config.autotaggerRulesDraftTitle) return '';
  return editor.getSelectedText() || editor.getText();
}

function sendToThings(data) {
  if (typeof CallbackURL === 'undefined') return false;
  if (typeof context === 'undefined') return false;

  if (data.length == 0) {
    context.cancel('No tasks found');
    return;
  }

  var callback = CallbackURL.create();
  callback.baseURL = 'things:///json';
  callback.addParameter('data', JSON.stringify(data));
  return callback.open();
}

function cleanup() {
  if (draft.isFlagged) return;
  if (draft.isArchived) return;
  if (draft.title == config.autotaggerRulesDraftTitle) return;
  if (editor.getSelectedText()) return;
  draft.isTrashed = true;
  draft.update();
  Draft.create();
  editor.activate();
}

function getTemplateTags(doc) {
  var pattern = /\[\[([\w ]+)\]\]/g;
  var tags = [];
  var match;

  while (match = pattern.exec(doc)) {
    var name = match[1];
    if (tags.indexOf(name) >= 0) continue;
    if (config.reservedTemplateTags.indexOf(name) >= 0) continue;
    tags.push(match[1]);
  }

  return tags;
}

function askTemplateQuestions(tags) {
  var prompt = Prompt.create();
  prompt.title = 'Template Questions';
  tags.forEach(function (tag) {
    return prompt.addTextField(tag, tag, '');
  });
  prompt.addButton('Okay');
  return prompt.show() && prompt.fieldValues;
}

function setTemplateTags(doc, tags) {
  Object.keys(tags).forEach(function (tag) {
    return draft.setTemplateTag(tag, tags[tag]);
  });
  return draft.processTemplate(doc);
}

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.reservedTemplateTags = exports.defaultAutotaggerRules = exports.newAutotaggerRulesMessage = exports.autotaggerRulesDraftTitle = exports.eveningStartsAtHour = exports.earliestAmbiguousMorningHour = void 0;
// When times omit an AM/PM suffix and are before this hour,
// we'll assume PM to avoid early morning alarms.
var earliestAmbiguousMorningHour = 6; // When a task date is today, and a reminder is set to a time
// at this hour or later, we'll file it in the "evening" section.

exports.earliestAmbiguousMorningHour = earliestAmbiguousMorningHour;
var eveningStartsAtHour = 18;
exports.eveningStartsAtHour = eveningStartsAtHour;
var autotaggerRulesDraftTitle = 'Thingy Autotagger Rules';
exports.autotaggerRulesDraftTitle = autotaggerRulesDraftTitle;
var newAutotaggerRulesMessage = "Welcome to Thingy! A draft with a few default Autotagger rules has been added to your inbox. Feel free to customize these as you see fit, and you can archive the draft if you don't want it cluttering up your inbox.";
exports.newAutotaggerRulesMessage = newAutotaggerRulesMessage;
var defaultAutotaggerRules = "# ".concat(autotaggerRulesDraftTitle, "\n\nStarts with \"Call\"   \uD83C\uDFF7 Calls\nStarts with \"Email\"  \uD83C\uDFF7 Email\nContains \"Mom\"       \uD83C\uDFF7 Mom\nContains \"Dad\"       \uD83C\uDFF7 Dad\n\nStarts with \"Waiting For|WF\"\n  \uD83C\uDFF7 Waiting For\n  \uD83D\uDCC6 Tomorrow\n  \u26A0\uFE0F 1 week\n\nStarts with \"Drop off|Pick up|Deliver\"\n  \uD83C\uDFF7 Errands\n");
exports.defaultAutotaggerRules = defaultAutotaggerRules;
var reservedTemplateTags = ['body', 'clipboard', 'created_latitude', 'created_longitude', 'created', 'date', 'draft_open_url', 'draft', 'latitude', 'longitude', 'modified_latitude', 'modified_longitude', 'modified', 'selection_length', 'selection_start', 'selection', 'time', 'title', 'uuid'];
exports.reservedTemplateTags = reservedTemplateTags;

/***/ }),
/* 2 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TemplateTagParser", function() { return TemplateTagParser; });
class TemplateTagParser {
	
	constructor(template = draft.content) {
		this.template = template;
	}

	get tags() {
		const reservedTags = [
			'body',
			'clipboard',
			'created_latitude',
			'created_longitude',
			'created',
			'date',
			'draft_open_url',
			'draft',
			'latitude',
			'longitude',
			'modified_latitude',
			'modified_longitude',
			'modified',
			'selection_length',
			'selection_start',
			'selection',
			'time',
			'title',
			'uuid',
		];		

		const pattern = /\[\[([\w ]+)\]\]/g;
		let tags = new Set();
		let match;

		while (match = pattern.exec(this.template)) {
			tags.add(match[1]);
		}
		
		return Array.from(tags)
			.filter(tag => !reservedTags.includes(tag));
	}
	
	ask() {
		let tags = this.tags;
		if (tags.length == 0) return true;
		
		let prompt = Prompt.create();
		prompt.title = 'Template Questions';
		tags.forEach(tag => prompt.addTextField(tag, tag, ''));
		prompt.addButton('Okay');

		if (!prompt.show()) return false;
		tags.forEach(tag => {
			draft.setTemplateTag(tag, prompt.fieldValues[tag]);
			console.log(`Setting ${tag} to ${prompt.fieldValues[tag]}`);
		});
		
		return true;
	}
	
	parse(str) {
		let text = draft.processTemplate(str);
		let html = MultiMarkdown.create().render(text);
		return { text, html };
	}
}


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Autotagger = void 0;

var _StreamParser = __webpack_require__(4);

var _Symbols = __webpack_require__(5);

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/** A class representing a Things autotagger */
var Autotagger =
/*#__PURE__*/
function () {
  /**
   * Create a Things autotagger, including a small default dictionary
   * @param {Object} config - An array of objects to add to the dictionary
   */
  function Autotagger(config) {
    var _this = this;

    _classCallCheck(this, Autotagger);

    var symbols = new _Symbols.Symbols();
    var parser = new _StreamParser.StreamParser(symbols);
    var stream = parser.parse(config);
    this._dictionary = stream.map(function (item) {
      var rule = _objectSpread({
        pattern: _this._parsePattern(item.title)
      }, item);

      delete rule.title;
      return rule;
    }).filter(function (item) {
      return !!item.pattern;
    });
  }
  /**
   * Parse a string for matching autotagging entries
   * @param {Object} obj - An object containing task attributes
   * @return {Object} An object containing updated task attributes
   */


  _createClass(Autotagger, [{
    key: "parse",
    value: function parse(title) {
      var _this2 = this;

      var entries = _toConsumableArray(this._dictionary).filter(function (item) {
        return item.pattern.test(title);
      });

      var attributes = {};
      entries.forEach(function (entry) {
        Object.keys(entry).forEach(function (key) {
          if (key == 'pattern') return;

          _this2._setProp(attributes, key, entry[key]);
        });
      });
      return attributes;
    }
  }, {
    key: "_parsePattern",
    value: function _parsePattern(title) {
      if (title.trim().toLowerCase() == 'all tasks') return /.+/;
      var pattern = /^(Starts with|Ends with|Contains|Matches) +"(.*)"$/i;
      var matches = pattern.exec(title);
      if (!matches || matches.length < 3) return;
      var regex = matches[2];

      var escaped = this._escapeRegex(matches[2]);

      switch (matches[1].toLowerCase()) {
        case 'starts with':
          return new RegExp("^(".concat(escaped, ")\\b"), 'i');

        case 'ends with':
          return new RegExp("\\b(".concat(escaped, ")$"), 'i');

        case 'contains':
          return new RegExp("\\b(".concat(escaped, ")\\b"), 'i');

        case 'matches':
          return new RegExp(regex, 'i');
      }
    }
  }, {
    key: "_escapeRegex",
    value: function _escapeRegex(value) {
      // Ommitting | since it'll be our delimiter
      var pattern = /[\\{}()[\]^$+*?.]/g;
      return value.replace(pattern, '\\$&');
    }
    /**
     * Update an object property. If the value is an array, push it real good.
     * @param {Object} obj - A reference to the source object
     * @param {String} prop - The name of the property to set
     * @param {Array|String} val - The value of the property to set
     * @private
     */

  }, {
    key: "_setProp",
    value: function _setProp(obj, prop, val) {
      if (Array.isArray(val)) {
        var _obj$prop;

        obj[prop] = obj[prop] || [];

        (_obj$prop = obj[prop]).push.apply(_obj$prop, _toConsumableArray(val));
      } else {
        obj[prop] = val;
      }
    }
  }]);

  return Autotagger;
}();

exports.Autotagger = Autotagger;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.StreamParser = void 0;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/** A class representing a stream parser */
var StreamParser =
/*#__PURE__*/
function () {
  /**
   * Create a new stream parser
   * @param symbols {Symbols} - A symbol dictionary object
   */
  function StreamParser(symbols) {
    _classCallCheck(this, StreamParser);

    this._symbols = symbols;
  }
  /**
   * Parse a stream containing items and associated attributes
   * decorated by Emoji symbols
   * @param doc {String} - The document to parse
   * @return {Object} An object suitable to pass to the things:/// service
   */


  _createClass(StreamParser, [{
    key: "parse",
    value: function parse(stream) {
      var _this = this;

      stream = this._normalizeSymbols(stream);
      stream = this._trimWhitespace(stream);
      var all = []; // An array of task objects

      var current; // The current task object

      stream.split('\n').forEach(function (line) {
        var item = _this._parseLine(line);

        if (!item) return;

        if (item.type == 'title') {
          current = {};
          all.push(current);
        }

        switch (item.format) {
          case 'array':
            current[item.type] = current[item.type] || [];
            current[item.type].push(item.value.trim());
            break;

          case 'csv':
            current[item.type] = _toConsumableArray((current[item.value] || '').split(',')).concat(_toConsumableArray(item.value.split(','))).map(function (item) {
              return item.trim();
            }).filter(function (item) {
              return item.length > 0;
            }).join(',');
            break;

          default:
            current[item.type] = item.value.trim();
        }
      });
      return all;
    }
    /**
     * Normalize symbol-decorated attributes so they're each on their own line
     * @param {String} value - The document to parse
     * @return {String} A document with symbol-decorated
     *   attributes on their own line
     * @private
     */

  }, {
    key: "_normalizeSymbols",
    value: function _normalizeSymbols() {
      var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var pattern = new RegExp("(".concat(this._symbols.all.join('|'), ")"), 'mg');
      return value.replace(pattern, '\n$1');
    }
    /**
     * Parse a line, mapping its symbol to a property
     * @param {String} line - The line to parse
     * @return {Object} An object with the parsed property type and value
     * @private
     */

  }, {
    key: "_parseLine",
    value: function _parseLine(line) {
      if (!line) return; // Lines with no symbol prefix are tasks.

      if (/^[a-z0-9]/i.test(line)) {
        return {
          type: 'title',
          value: line
        };
      }

      var allSymbols = this._symbols.all;
      var propPattern = new RegExp("^(".concat(allSymbols.join('|'), ")s*(.*)$"), 'g');
      var propMatch = propPattern.exec(line);
      if (!propMatch || propMatch.length < 3) return;
      return {
        type: this._symbols.getType(propMatch[1]),
        format: this._symbols.getFormat(propMatch[1]),
        value: propMatch[2]
      };
    }
    /**
     * Trim leading/trailing whitespace from each line of a document
     * @param {String} value - The value to trim
     * @return {String} A document with no leading or trailing whitespace
     * @private
     */

  }, {
    key: "_trimWhitespace",
    value: function _trimWhitespace() {
      var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      return value.replace(/^\s+(.+)/mg, '$1').replace(/(.+)\s+$/mg, '$1');
    }
  }]);

  return StreamParser;
}();

exports.StreamParser = StreamParser;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Symbols = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/** A class representing a symbols dictionary */
var Symbols =
/*#__PURE__*/
function () {
  /**
   * Create a symbols dictionary
   * @param {Object} config - An optional object overriding one or
   * 		more symbol definitions
   */
  function Symbols() {
    _classCallCheck(this, Symbols);

    this._symbols = [{
      symbol: '🏷',
      type: 'tags',
      format: 'csv'
    }, {
      symbol: '📁',
      type: 'list',
      format: 'string'
    }, {
      symbol: '📆',
      type: 'when',
      format: 'string'
    }, {
      symbol: '⏰',
      type: 'reminder',
      format: 'string'
    }, {
      symbol: '⚠️',
      type: 'deadline',
      format: 'string'
    }, {
      symbol: '📌',
      type: 'heading',
      format: 'string'
    }, {
      symbol: '🗒',
      type: 'notes',
      format: 'array'
    }, {
      symbol: '🔘',
      type: 'checklistItem',
      format: 'array'
    }];
  }
  /**
   * An array of all defined symbols.
   * @type {String[]}
   */


  _createClass(Symbols, [{
    key: "getSymbol",

    /**
     * Look up a symbol based on an attribute name
     * @param {String} type - A valid Things to-do attribute name
     * @return {String}
     */
    value: function getSymbol(type) {
      var item = this._lookup(type);

      return item && item.symbol;
    }
    /**
     * Look up an attribute name based on a symbol
     * @param {String} symbol - A symbol (emoji)
     * @return {String}
     */

  }, {
    key: "getType",
    value: function getType(symbol) {
      var item = this._lookup(symbol);

      return item && item.type;
    }
    /**
     * Look up a datatype based on a symbol
     * @param {String} symbol - A symbol (emoji)
     */

  }, {
    key: "getFormat",
    value: function getFormat(val) {
      var item = this._lookup(val);

      return item && item.format;
    }
  }, {
    key: "_lookup",
    value: function _lookup(val) {
      return this._symbols.find(function (item) {
        return item.symbol == val || item.type == val;
      });
    }
  }, {
    key: "all",
    get: function get() {
      return this._symbols.map(function (item) {
        return item.symbol;
      });
    }
  }]);

  return Symbols;
}();

exports.Symbols = Symbols;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.TasksParser = void 0;

var _Symbols = __webpack_require__(5);

var _StreamParser = __webpack_require__(4);

var _Task = __webpack_require__(7);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/** A class representing a Things task parser */
var TasksParser =
/*#__PURE__*/
function () {
  /**
   * Create a new Things task parser
   * @param {Autotagger} autotagger - An autotagger reference
   */
  function TasksParser(autotagger) {
    _classCallCheck(this, TasksParser);

    this._symbols = new _Symbols.Symbols();
    this._streamParser = new _StreamParser.StreamParser(this._symbols);
    this._autotagger = autotagger;
  }
  /**
   * Parse a document containing Things tasks, and associated
   * attributes decorated by the appropriate Emoji symbols
   * @param stream {String} - The document to parse
   * @return {Object} An object suitable to pass to the things:/// service
   */


  _createClass(TasksParser, [{
    key: "parse",
    value: function parse(stream) {
      var _this = this;

      var items = this._streamParser.parse(stream);

      var tasks = items.map(function (item) {
        var task = new _Task.Task(_this._autotagger);
        Object.keys(item).forEach(function (attr) {
          switch (attr) {
            case 'tags':
              task.addTags(item[attr]);
              break;

            case 'checklistItem':
              task.addChecklistItem(item[attr]);
              break;

            case 'notes':
              task.appendNotes(item[attr]);
              break;

            default:
              task[attr] = item[attr];
          }
        });
        return task;
      }); // Return an array of Things objects

      return tasks.map(function (task) {
        return task.toThingsObject();
      });
    }
  }]);

  return TasksParser;
}();

exports.TasksParser = TasksParser;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Task = void 0;

var _ThingsDate = __webpack_require__(8);

var _ThingsDateTime = __webpack_require__(9);

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/** Class representing a single Things to-do item. */
var Task =
/*#__PURE__*/
function () {
  /**
   * Create a Things to-do item.
   * @param {Autotagger} autotagger - A reference to an autotagger
   */
  function Task(autotagger) {
    _classCallCheck(this, Task);

    this._autotagger = autotagger;
    this._when = new _ThingsDateTime.ThingsDateTime();
    this._deadline = new _ThingsDate.ThingsDate();
    this.attributes = {
      tags: [],
      'checklist-items': []
    };
  }
  /**
   * The deadline to apply to the to-do. Relative dates are
   * parsed with the DateJS library.
   * @type {String}
   */


  _createClass(Task, [{
    key: "addChecklistItem",

    /**
     * Add a checklist item to the to-do.
     * @param {String} item - The checklist item to add
     */
    value: function addChecklistItem(item) {
      if (item.trim) item = item.trim();
      if (!Array.isArray(item)) item = [item];
      this.addChecklistItems(item);
    }
    /**
     * Add an array of checklist items to the to-do
     * @param {String[]} items - An array of checklist items to add
     */

  }, {
    key: "addChecklistItems",
    value: function addChecklistItems() {
      var _this$attributes$chec;

      var items = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
      items = items.filter(function (item) {
        return item.length > 0;
      }).map(function (item) {
        return {
          type: 'checklist-item',
          attributes: {
            title: item.trim()
          }
        };
      });

      (_this$attributes$chec = this.attributes['checklist-items']).push.apply(_this$attributes$chec, _toConsumableArray(items));
    }
    /**
     * Add one or more tags to the to-do, separated by commas.
     * Tags that do not already exist will be ignored.
     * @param {String|String[]} tags - An array or comma-separated list of one or more tags
     */

  }, {
    key: "addTags",
    value: function addTags(tags) {
      var _this$attributes$tags;

      if (typeof tags == 'string') tags = tags.split(',');

      (_this$attributes$tags = this.attributes.tags).push.apply(_this$attributes$tags, _toConsumableArray(tags.map(function (tag) {
        return tag.trim();
      })));
    }
    /**
     * Appends a new line to the notes.
     * @param {String|String[]} notes - An array or single string of notes
     */

  }, {
    key: "appendNotes",
    value: function appendNotes(notes) {
      if (typeof notes == 'string') notes = [notes];

      if (this.attributes.notes) {
        this.attributes.notes += '\n' + notes.join('\n');
      } else {
        this.attributes.notes = notes.join('\n');
      }
    }
    /**
     * Export the current to-do, with all defined attributes,
     * as an object to be passed to the things:/// URL scheme.
     * @see {@link https://support.culturedcode.com/customer/en/portal/articles/2803573#json|Things API documentation}
     * @return {Object} An object suitable to pass to the things:/// service
     */

  }, {
    key: "toThingsObject",
    value: function toThingsObject() {
      return {
        type: 'to-do',
        attributes: this.attributes
      };
    }
    /**
     * Test whether a string is a things item ID
     * @param {String} value - The item name or id to test
     * @private
     */

  }, {
    key: "_isItemId",
    value: function _isItemId(value) {
      var pattern = /^[0-9A-F]{8}-([0-9A-F]{4}-){3}[0-9A-F]{12}$/img;
      return pattern.test(value);
    }
  }, {
    key: "deadline",
    set: function set(date) {
      this._deadline.date = date;
      this.attributes.deadline = this._deadline.toString();
    }
  }, {
    key: "heading",
    set: function set(heading) {
      this.attributes.heading = heading.trim();
    }
    /**
     * The title or ID of the project or area to add to.
     * @type {String}
     */

  }, {
    key: "list",
    set: function set(nameOrId) {
      var prop = this._isItemId(nameOrId) ? 'list-id' : 'list';
      this.attributes[prop] = nameOrId.trim();
    }
    /**
     * The text to use for the notes field of the to-do.
     * @type {String}
     */

  }, {
    key: "notes",
    set: function set(notes) {
      this.attributes.notes = notes.trim();
    }
    /**
     * The time to set for the task reminder. Overrides any time
     * specified in "when". Fuzzy times are parsed with the
     * DateJS library.
     * @type {String}
     */

  }, {
    key: "reminder",
    set: function set(time) {
      this._when.timeOverride = time.trim();
      this.attributes.when = this._when.toString();
    }
    /**
     * The title of the to-do. Value will be parsed by the
     * autotagger, matching the string against a dictionary
     * of regular expressions and auto-applying attributes
     * for all matches.
     * @type {String}
     */

  }, {
    key: "title",
    set: function set(value) {
      var _this = this;

      this.attributes.title = value.trim();

      var autotagged = this._autotagger.parse(value);

      if (!autotagged) return;
      var properties = 'list when reminder deadline heading checklistItem';
      properties.split(' ').forEach(function (property) {
        if (!autotagged[property]) return;
        _this[property] = autotagged[property];
      });
      this.addTags(autotagged.tags || '');
      this.addChecklistItem(autotagged.checklistItem || []);
      this.appendNotes(autotagged.notes || '');
    }
    /**
     * The start date of the to-do. Values can be "today",
     * "tomorrow", "evening", "tonight", "anytime", "someday",
     * or a fuzzy date string with an optional time value,
     * which will add a reminder.
     * @type {String}
     */

  }, {
    key: "when",
    set: function set(value) {
      this._when.datetime = value.trim();
      this.attributes.when = this._when.toString();
    }
  }]);

  return Task;
}();

exports.Task = Task;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ThingsDate = void 0;

var config = _interopRequireWildcard(__webpack_require__(1));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/** A class representing a date in Things */
var ThingsDate =
/*#__PURE__*/
function () {
  /** Create a new ThingsDate object */
  function ThingsDate() {
    _classCallCheck(this, ThingsDate);
  }
  /**
   * The date value. In addition to fuzzy values parseable by DateJS,
   * valid values include "someday", "anytime", "evening", and "tonight".
   * @type {String}
   */


  _createClass(ThingsDate, [{
    key: "toString",

    /**
     * Convert to a Things-formatted string: YYYY-MM-DD@HH:MM, or
     * relative keyword: evening, someday, anytime.
     * @return {String} A Things-formatted date string
     */
    value: function toString() {
      // This is still way too big. Some of this stuff
      // should be parsed as values are set, and
      // private functions should reference object
      // properties, not passed parameters.
      // If a time override is present, but no date is specified,
      // assume this is a task for today.
      var timeOverride = this._timeOverride;
      var datetime = this._datetime || timeOverride && 'today'; // Shorthand values like "someday" and "anytime" cannot have
      // an associated time, and are unparseable by DateJS.

      var isDateOnly = this._isDateOnlyShorthand(datetime);

      if (isDateOnly) return datetime; // Shorthand values like "tonight" need to be normalized to
      // "evening" for Things to understand. However, if there's
      // a time override specified, we'll change the value
      // to "today" so DateJS can do its thing. Assuming the
      // reminder is in the evening, it'll get changed back later.

      var isEvening = this._isEveningShorthand(datetime);

      if (isEvening && !timeOverride) return 'evening';
      if (isEvening && timeOverride) datetime = 'today'; // DateJS will take relative dates like "1 week" without
      // complaint, but it interprets them as "1 week from the
      // first day of the year". Prepend a "+" to anchor to
      // today's date.

      datetime = datetime.replace(/^(\d+)\s*(h|d|w|m|y|minute|hour|day|week|month|year)(s?)/i, '+$1 $2$3'); // DateJS won't understand dates like "in 2 weeks".
      // Reformat as "+2 weeks".

      datetime = datetime.replace(/^in\s+(\d)/i, '+$1'); // Offset shorthand

      var offset = this._parseOffset(datetime);

      var dateOffset = 0;

      if (offset) {
        datetime = offset.datetime;
        dateOffset = offset.offset;
      } // Parse the date with DateJS. If it's invalid, just pass
      // the raw value and let Things take a crack at it.


      var dt = Date.parse(datetime);
      if (!dt) return datetime; // Override time if we explicitly set a reminder

      if (timeOverride) {
        var time = Date.parse(timeOverride);

        if (time) {
          var hour = time.getHours();
          var minute = time.getMinutes();
          dt.set({
            hour: hour,
            minute: minute
          });
        }
      } // Sometimes relative dates, like "Monday", are
      // interpreted as "last Monday". If the date is in the
      // past, add a week.


      var isDatePast = this._isDatePast(dt);

      if (isDatePast) dt.add(1).week(); // If the time is expressed without an AM/PM suffix,
      // and it's super early, we probably meant PM.

      var isTooEarly = this._isTimeEarlyAndAmbiguous(datetime, dt);

      if (isTooEarly) dt.add(12).hours(); // Process date offset

      if (dateOffset != 0) dt.add(dateOffset).days(); // Return a date- or datetime-formatted string that
      // Things will understand.

      return this._formatThingsDate(dt, isEvening);
    }
    /**
     * Test whether a string is shorthand for "tonight"
     * @param {String} value - The string to test
     * @return {boolean} True if string equals evening shorthand keywords
     * @private
     */

  }, {
    key: "_isEveningShorthand",
    value: function _isEveningShorthand(value) {
      var pattern = /^((this )?evening|tonight)$/i;
      return pattern.test(value);
    }
    /**
     * Test whether a string is a dateless shorthand value
     * @param {String} value - The string to test
     * @return {boolean} True if string starts with "someday" or "anytime"
     * @private
     */

  }, {
    key: "_isDateOnlyShorthand",
    value: function _isDateOnlyShorthand(value) {
      var pattern = /^(someday|anytime)/i;
      return pattern.test(value);
    }
    /**
     * Test whether a date is in the past
     * @param {Date} parsed - The datetime, parsed by DateJS
     * @return {boolean} True if the date is in the past
     * @private
     */

  }, {
    key: "_isDatePast",
    value: function _isDatePast(parsed) {
      var date = parsed.clone().clearTime();
      var today = Date.today().clearTime();
      return date.compareTo(today) == -1;
    }
    /**
     * Test whether a time is ambiguously specified (lacking an am/pm
     * suffix) and possibly early in the morning.
     * @param {String} str - The raw, unparsed date
     * @param {DateJS} parsed - The datetime, parsed by DateJS
     * @return {boolean} True if AM/PM suffix is missing and hour is before 7
     * @private
     */

  }, {
    key: "_isTimeEarlyAndAmbiguous",
    value: function _isTimeEarlyAndAmbiguous(str, parsed) {
      var hasAmPmSuffix = /\d *[ap]m?\b/i.test(str);
      var earliest = config.earliestAmbiguousMorningHour;
      var isEarly = parsed.getHours() > 0 && parsed.getHours() < earliest;
      return !hasAmPmSuffix && isEarly;
    }
  }, {
    key: "_parseOffset",
    value: function _parseOffset(str) {
      var pattern = /^(.+)\s([+-]\d+)$/;
      var match = pattern.exec(str);
      if (!match) return;
      return {
        datetime: match[1],
        offset: parseInt(match[2])
      };
    }
    /**
     * Test whether a datetime is set to midnight
     * @param {DateJS} parsed - The datetime, parsed by DateJS
     * @return {boolean} True if time is midnight
     * @private
     */

  }, {
    key: "_isTimeMidnight",
    value: function _isTimeMidnight(parsed) {
      var hours = parsed.getHours();
      var minutes = parsed.getMinutes();
      return hours + minutes == 0;
    }
    /**
     * Format a DateJS datetime as a valid Things datetime string.
     * @param {DateJS} datetime - The datetime, parsed by DateJS
     * @param {boolean} forceEvening - Force to evening, overriding time value
     * @return {string} A Things-formatted date
     * @private
     */

  }, {
    key: "_formatThingsDate",
    value: function _formatThingsDate(datetime, forceEvening) {
      var date = datetime.toString('yyyy-MM-dd');
      var time = datetime.toString('@HH:mm');
      if (this._isTimeMidnight(datetime)) time = '';
      if (!this._allowTime) time = '';
      var isToday = datetime.between(Date.today(), Date.today().addDays(1));
      var isEvening = forceEvening || datetime.getHours() > config.eveningStartsAtHour;
      if (isToday && isEvening) date = 'evening';
      return date + time;
    }
  }, {
    key: "date",
    set: function set() {
      var value = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      this._datetime = value.trim().toLowerCase();
    }
  }]);

  return ThingsDate;
}();

exports.ThingsDate = ThingsDate;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ThingsDateTime = void 0;

var _ThingsDate2 = __webpack_require__(8);

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } _setPrototypeOf(subClass.prototype, superClass && superClass.prototype); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.getPrototypeOf || function _getPrototypeOf(o) { return o.__proto__; }; return _getPrototypeOf(o); }

/**
 * A class representing a datetime in Things
 * @extends ThingsDate
 * */
var ThingsDateTime =
/*#__PURE__*/
function (_ThingsDate) {
  /** Create a new ThingsDate object */
  function ThingsDateTime() {
    var _this;

    _classCallCheck(this, ThingsDateTime);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(ThingsDateTime).call(this));
    _this._allowTime = true;
    return _this;
  }
  /**
   * The date, with optional time. In addition to fuzzy values parseable by
   * DateJS, valid values include "someday", "anytime", "evening", and "tonight".
   * @type {String}
   */


  _createClass(ThingsDateTime, [{
    key: "datetime",
    set: function set(value) {
      this._datetime = value.trim().toLowerCase();
    }
    /**
     * The time override. The datetime value's hour and minute
     * will be repolaced with the time override if specified.
     * @type {String}
     */

  }, {
    key: "timeOverride",
    set: function set(value) {
      this._timeOverride = value.trim().toLowerCase();
    }
  }]);

  _inherits(ThingsDateTime, _ThingsDate);

  return ThingsDateTime;
}(_ThingsDate2.ThingsDate);

exports.ThingsDateTime = ThingsDateTime;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Project = void 0;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Project =
/*#__PURE__*/
function () {
  function Project(name, tasks) {
    _classCallCheck(this, Project);

    this._name = name;
    this._tasks = tasks;
  }

  _createClass(Project, [{
    key: "toThingsObject",
    value: function toThingsObject() {
      var _this = this;

      // Get an array of unique (case-insensitive) headings
      var headings = this._tasks.filter(function (item) {
        return item.attributes.heading;
      }).map(function (item) {
        return item.attributes.heading;
      }).map(function (item) {
        return {
          value: item,
          lower: item.toLowerCase()
        };
      }).filter(function (elem, pos, arr) {
        return arr.findIndex(function (item) {
          return item.lower == elem.lower;
        }) == pos;
      }).map(function (item) {
        return {
          type: "heading",
          attributes: {
            title: item.value
          }
        };
      });

      var tasks = this._tasks.map(function (task) {
        task.attributes.list = _this._name;
        return task;
      });

      return [{
        type: "project",
        attributes: {
          title: this._name,
          items: headings
        }
      }].concat(_toConsumableArray(tasks));
    }
  }]);

  return Project;
}();

exports.Project = Project;

/***/ })
/******/ ]);