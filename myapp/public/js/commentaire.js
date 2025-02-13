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
var _a, _b, _c, _d;
var _this = this;
var getCurrentUserId = function (token) {
    if (!token)
        return null;
    try {
        var payload = JSON.parse(atob(token.split(".")[1]));
        return payload.userId;
    }
    catch (error) {
        console.error("Erreur lors du décodage du token", error);
        return null;
    }
};
var map;
var geocacheId = new URLSearchParams(window.location.search).get("id");
var initializeMap = function () { return __awaiter(_this, void 0, void 0, function () {
    var token, response, geocache, likeButton, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!geocacheId) {
                    alert("Aucune géocache sélectionnée !");
                    return [2 /*return*/];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                token = localStorage.getItem("token");
                if (!token) {
                    alert("Vous devez être connecté pour voir cette géocache.");
                    window.location.href = "index.html";
                    return [2 /*return*/];
                }
                return [4 /*yield*/, fetch("http://localhost:5000/geocache/".concat(geocacheId), {
                        headers: {
                            Authorization: "Bearer ".concat(token),
                        },
                    })];
            case 2:
                response = _a.sent();
                if (!response.ok) {
                    if (response.status === 401)
                        throw new Error("Accès non autorisé. Veuillez vous connecter.");
                    if (response.status === 404)
                        throw new Error("Géocache introuvable.");
                    throw new Error("Erreur lors de la récupération des données.");
                }
                return [4 /*yield*/, response.json()];
            case 3:
                geocache = _a.sent();
                map = L.map("map").setView([geocache.geocache.latitude, geocache.geocache.longitude], 13);
                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    attribution: "© OpenStreetMap",
                }).addTo(map);
                L.marker([geocache.geocache.latitude, geocache.geocache.longitude]).addTo(map).bindPopup("\n        <b>".concat(geocache.geocache.name, "</b><br>\n        ").concat(geocache.geocache.description, "<br>\n        Difficult\u00E9: ").concat(geocache.geocache.difficulty, "<br>\n        Cr\u00E9\u00E9e par: ").concat(geocache.geocache.creator, "\n    "));
                likeButton = document.getElementById("like-geocache-btn");
                if (likeButton && geocache.geocache.likes) {
                    likeButton.innerHTML = "\u2764\uFE0F Aimer la G\u00E9ocache (".concat(geocache.geocache.likes.length, ")");
                }
                loadComments();
                return [3 /*break*/, 5];
            case 4:
                error_1 = _a.sent();
                console.error(error_1);
                alert(error_1.message);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
(_a = document
    .getElementById("submit-comment")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", function () { return __awaiter(_this, void 0, void 0, function () {
    var commentText, commentImage, token, formData, response, error_2;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                commentText = (_a = document.getElementById("comment-text")) === null || _a === void 0 ? void 0 : _a.value.trim();
                commentImage = (_c = (_b = document.getElementById("comment-image")) === null || _b === void 0 ? void 0 : _b.files) === null || _c === void 0 ? void 0 : _c[0];
                if (!commentText) {
                    alert("Veuillez entrer un commentaire.");
                    return [2 /*return*/];
                }
                _d.label = 1;
            case 1:
                _d.trys.push([1, 3, , 4]);
                token = localStorage.getItem("token");
                if (!token)
                    throw new Error("Vous devez être connecté pour commenter.");
                formData = new FormData();
                formData.append("text", commentText);
                if (commentImage)
                    formData.append("image", commentImage);
                return [4 /*yield*/, fetch("http://localhost:5000/comment/".concat(geocacheId), {
                        method: "POST",
                        headers: { Authorization: "Bearer ".concat(token) },
                        body: formData,
                    })];
            case 2:
                response = _d.sent();
                if (!response.ok)
                    throw new Error("Erreur lors de l'ajout du commentaire.");
                document.getElementById("comment-text").value = "";
                document.getElementById("comment-image").value = "";
                loadComments();
                return [3 /*break*/, 4];
            case 3:
                error_2 = _d.sent();
                console.error(error_2);
                alert(error_2.message);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
var loadComments = function () { return __awaiter(_this, void 0, void 0, function () {
    var commentsList, token, response, data, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                commentsList = document.getElementById("comments-list");
                if (!commentsList)
                    return [2 /*return*/];
                commentsList.innerHTML = "Chargement des commentaires...";
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                token = localStorage.getItem("token");
                if (!token)
                    throw new Error("Vous devez être connecté.");
                return [4 /*yield*/, fetch("http://localhost:5000/comment/".concat(geocacheId), {
                        headers: { Authorization: "Bearer ".concat(token) },
                    })];
            case 2:
                response = _a.sent();
                if (!response.ok)
                    throw new Error("Erreur de chargement des commentaires.");
                return [4 /*yield*/, response.json()];
            case 3:
                data = _a.sent();
                commentsList.innerHTML = data.comments.length
                    ? data.comments
                        .map(function (comment) { return " \n            <div class=\"comment\" data-id=\"".concat(comment._id, "\">\n              <p><strong>").concat(comment.creator.username || "Anonyme", "</strong>: ").concat(comment.text, "</p>\n              ").concat(comment.image
                        ? "<img src=\"http://localhost:5000".concat(comment.image, "\" style=\"max-width: 200px;\"/>")
                        : "", "\n            </div>"); })
                        .join("")
                    : "<p>Aucun commentaire.</p>";
                return [3 /*break*/, 5];
            case 4:
                error_3 = _a.sent();
                console.error(error_3);
                commentsList.innerHTML = "<p>Impossible de charger les commentaires.</p>";
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
(_b = document
    .getElementById("like-geocache-btn")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", function () { return __awaiter(_this, void 0, void 0, function () {
    var token, currentUserId, response, errorResponse, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                token = localStorage.getItem("token");
                if (!token)
                    throw new Error("Vous devez être connecté pour aimer cette géocache.");
                currentUserId = getCurrentUserId(token);
                if (!currentUserId)
                    throw new Error("Impossible de récupérer l'ID de l'utilisateur.");
                return [4 /*yield*/, fetch("http://localhost:5000/geocache/".concat(geocacheId, "/like"), {
                        method: "POST",
                        headers: {
                            Authorization: "Bearer ".concat(token),
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ userId: currentUserId }),
                    })];
            case 1:
                response = _a.sent();
                if (!!response.ok) return [3 /*break*/, 3];
                return [4 /*yield*/, response.json()];
            case 2:
                errorResponse = _a.sent();
                console.error("Error details:", errorResponse);
                throw new Error(errorResponse.message || "Erreur lors de l'ajout du like.");
            case 3:
                alert("Vous avez aimé cette géocache !");
                updateLikeCount();
                return [3 /*break*/, 5];
            case 4:
                error_4 = _a.sent();
                console.error(error_4);
                alert(error_4.message);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
var updateLikeCount = function () { return __awaiter(_this, void 0, void 0, function () {
    var token, response, geocache, likeButton, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                token = localStorage.getItem("token");
                if (!token)
                    throw new Error("Vous devez être connecté.");
                return [4 /*yield*/, fetch("http://localhost:5000/geocache/".concat(geocacheId), {
                        headers: { Authorization: "Bearer ".concat(token) },
                    })];
            case 1:
                response = _a.sent();
                if (!response.ok)
                    throw new Error("Erreur de récupération des données.");
                return [4 /*yield*/, response.json()];
            case 2:
                geocache = _a.sent();
                likeButton = document.getElementById("like-geocache-btn");
                if (likeButton && geocache.geocache.likes) {
                    likeButton.innerHTML = "\u2764\uFE0F Aimer la G\u00E9ocache (".concat(geocache.geocache.likes.length, ")");
                }
                return [3 /*break*/, 4];
            case 3:
                error_5 = _a.sent();
                console.error(error_5);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
var likeComment = function (commentId, btn) { return __awaiter(_this, void 0, void 0, function () {
    var token, response, currentLikes, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                token = localStorage.getItem("token");
                if (!token)
                    throw new Error("Vous devez être connecté.");
                return [4 /*yield*/, fetch("http://localhost:5000/comment/".concat(commentId, "/like"), {
                        method: "POST",
                        headers: { Authorization: "Bearer ".concat(token) },
                    })];
            case 1:
                response = _a.sent();
                if (!response.ok)
                    throw new Error("Erreur lors du like.");
                currentLikes = btn.querySelector("span");
                currentLikes.textContent = parseInt(currentLikes.textContent) + 1;
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                console.error(error_6);
                alert("Erreur lors du like.");
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
loadComments();
(_c = document.getElementById("logoutBtn")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", function () {
    localStorage.removeItem("token");
    alert("Vous avez été déconnecté.");
    window.location.href = "login.html";
});
(_d = document.getElementById("backToMapBtn")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", function () {
    window.location.href = "geoloc.html";
});
initializeMap();
