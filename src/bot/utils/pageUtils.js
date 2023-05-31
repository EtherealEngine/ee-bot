"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PageUtils = void 0;
var PageUtils = /** @class */ (function () {
    function PageUtils(bot) {
        this.bot = bot;
        this.uiCanvas = 'body > div > div.MuiBackdrop-root.MuiModal-backdrop';
    }
    PageUtils.prototype.clickButton = function (buttonName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.bot.page.evaluate(function (selector) {
                            var v = document.querySelector(selector);
                            if (v != undefined && v != null)
                                v.click();
                        }, buttonName)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PageUtils.prototype.clickSelectorClassRegex = function (selector, classRegex) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.bot.verbose)
                            console.log("Clicking for a ".concat(selector, " matching ").concat(classRegex));
                        return [4 /*yield*/, this.bot.page.evaluate(function (selector, classRegex) {
                                classRegex = new RegExp(classRegex);
                                var buttons = Array.from(document.querySelectorAll(selector));
                                var enterButton = buttons.find(function (button) { return Array.from(button.classList).some(function (c) { return classRegex.test(c); }); });
                                if (enterButton)
                                    enterButton.click();
                            }, selector, classRegex.toString().slice(1, -1))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PageUtils.prototype.clickSelectorId = function (selector, id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.bot.verbose)
                            console.log("Clicking for a ".concat(selector, " matching ").concat(id));
                        return [4 /*yield*/, this.bot.page.waitForFunction("document.getElementById('".concat(id, "')"))];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.bot.page.evaluate(function (selector, id) {
                                var matches = Array.from(document.querySelectorAll(selector));
                                var singleMatch = matches.find(function (button) { return button.id === id; });
                                var result;
                                if (singleMatch && singleMatch.click) {
                                    console.log('normal click');
                                    result = singleMatch.click();
                                }
                                if (singleMatch && !singleMatch.click) {
                                    console.log('on click');
                                    result = singleMatch.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                                }
                                if (!singleMatch) {
                                    console.log('event click', matches.length);
                                    var m = matches[0];
                                    result = m.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                                }
                            }, selector, id)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PageUtils.prototype.clickSelectorFirstMatch = function (selector) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.bot.verbose)
                            console.log("Clicking for first ".concat(selector));
                        return [4 /*yield*/, this.bot.page.evaluate(function (selector) {
                                var matches = Array.from(document.querySelectorAll(selector));
                                var singleMatch = matches[0];
                                if (singleMatch)
                                    singleMatch.click();
                            }, selector)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PageUtils.prototype.clickSelectorByAlt = function (selector, title) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.bot.verbose)
                            console.log("Clicking for a ".concat(selector, " matching ").concat(title));
                        return [4 /*yield*/, this.bot.page.evaluate(function (selector, title) {
                                var matches = Array.from(document.querySelectorAll(selector));
                                var singleMatch = matches.find(function (btn) { return btn.alt === title; });
                                var result;
                                if (singleMatch && singleMatch.click) {
                                    console.log('normal click');
                                    result = singleMatch.click();
                                }
                                if (singleMatch && !singleMatch.click) {
                                    console.log('on click');
                                    result = singleMatch.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                                }
                                if (!singleMatch) {
                                    console.log('event click', matches.length);
                                    if (matches.length > 0) {
                                        var m = matches[0];
                                        result = m.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                                    }
                                }
                            }, selector, title)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    PageUtils.prototype.getParentElement = function (elementHandle) {
        return __awaiter(this, void 0, void 0, function () {
            var parentElementHandle;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.bot.page.evaluateHandle(function (element) {
                            return element.parentElement;
                        }, elementHandle)];
                    case 1:
                        parentElementHandle = _a.sent();
                        return [2 /*return*/, parentElementHandle.asElement()];
                }
            });
        });
    };
    return PageUtils;
}());
exports.PageUtils = PageUtils;
