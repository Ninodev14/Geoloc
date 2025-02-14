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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
var _this = this;
var fetchRankings = function () { return __awaiter(_this, void 0, void 0, function () {
    var token, response, _a, userRankings, geocacheRankings, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                token = localStorage.getItem("token");
                if (!token) {
                    console.error("Utilisateur non connecté.");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, fetch("http://localhost:5000/rankings", {
                        headers: {
                            Authorization: "Bearer ".concat(token),
                        },
                    })];
            case 1:
                response = _b.sent();
                if (!response.ok) {
                    throw new Error("Erreur lors du chargement du classement.");
                }
                return [4 /*yield*/, response.json()];
            case 2:
                _a = _b.sent(), userRankings = _a.userRankings, geocacheRankings = _a.geocacheRankings;
                displayRankings(userRankings, geocacheRankings);
                return [3 /*break*/, 4];
            case 3:
                error_1 = _b.sent();
                console.error("Erreur lors de la récupération du classement:", error_1);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
var displayRankings = function (userRankings, geocacheRankings) {
    var userRankingList = document.getElementById("user-ranking-list");
    var geocacheRankingList = document.getElementById("geocache-ranking-list");
    if (userRankingList) {
        userRankingList.innerHTML = userRankings
            .map(function (user, index) {
            return "<li><strong>#".concat(index + 1, " ").concat(user.username, "</strong> - ").concat(user.foundCount, " g\u00E9ocaches trouv\u00E9es</li>");
        })
            .join("");
    }
    if (geocacheRankingList) {
        geocacheRankingList.innerHTML = geocacheRankings
            .map(function (geocache, index) {
            return "<li><strong>#".concat(index + 1, " ").concat(geocache.name, "</strong> - ").concat(geocache.foundCount, " fois trouv\u00E9e</li>");
        })
            .join("");
    }
};
var loadMostPopularGeocache = function () { return __awaiter(_this, void 0, void 0, function () {
    var response, geocaches, popularContainer, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, fetch("http://localhost:5000/most-popular-geocaches")];
            case 1:
                response = _a.sent();
                if (!response.ok) {
                    throw new Error("Erreur lors de la récupération des géocaches populaires.");
                }
                return [4 /*yield*/, response.json()];
            case 2:
                geocaches = _a.sent();
                console.log("Réponse API côté frontend :", geocaches);
                popularContainer = document.getElementById("popular-geocache");
                if (!popularContainer)
                    return [2 /*return*/];
                if (!geocaches || geocaches.length === 0) {
                    popularContainer.innerHTML = "<p>Aucune géocache populaire trouvée.</p>";
                }
                else {
                    popularContainer.innerHTML = "\n        <ul>\n          ".concat(geocaches
                        .map(function (geo, index) {
                        var _a;
                        return "\n                <li>\n                  <strong>#".concat(index + 1, " ").concat(geo.name || "Nom inconnu", "</strong> - \n                  ").concat(geo.description || "Pas de description disponible", " - \n                  \u2764\uFE0F ").concat((_a = geo.totalLikes) !== null && _a !== void 0 ? _a : 0, " likes\n                </li>\n              ");
                    })
                        .join(""), "\n        </ul>\n      ");
                }
                return [3 /*break*/, 4];
            case 3:
                error_2 = _a.sent();
                console.error(error_2);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
loadMostPopularGeocache();
document.addEventListener("DOMContentLoaded", fetchRankings);
