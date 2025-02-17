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
var _a, _b;
var _this = this;
var leafletScript = document.createElement("script");
leafletScript.src = "https://unpkg.com/leaflet/dist/leaflet.js";
leafletScript.onload = function () { return initializeMap(); };
var userMarker = null;
document.head.appendChild(leafletScript);
var map;
var selectedGeocacheId = null;
var greenIcon = new L.Icon({
    iconUrl: "./img/valide.svg",
    iconSize: [32, 32],
});
var defaultIcon = new L.Icon({
    iconUrl: "./img/unvalide.svg",
    iconSize: [32, 32],
});
var distanceLimit = 10;
var initializeMap = function () { return __awaiter(_this, void 0, void 0, function () {
    var userLocation, error_1, distanceFilter;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                map = L.map("map").setView([48.8566, 2.3522], 6);
                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    attribution: "© OpenStreetMap",
                }).addTo(map);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, getUserLocation()];
            case 2:
                userLocation = _a.sent();
                userMarker = L.marker(userLocation, {
                    icon: L.icon({
                        iconUrl: "./img/perso.svg",
                        iconSize: [32, 32],
                    }),
                })
                    .addTo(map)
                    .bindPopup("Vous êtes ici !")
                    .openPopup();
                map.setView(userLocation, 13);
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                console.error("Impossible de récupérer la localisation :", error_1);
                return [3 /*break*/, 4];
            case 4:
                getUserData();
                distanceFilter = document.getElementById("distance-filter");
                distanceFilter.addEventListener("change", function (event) {
                    distanceLimit = parseInt(event.target.value, 10);
                    loadGeocaches();
                });
                return [2 /*return*/];
        }
    });
}); };
var getUserLocation = function () {
    return new Promise(function (resolve, reject) {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function (position) {
                var lat = position.coords.latitude;
                var lon = position.coords.longitude;
                resolve(L.latLng(lat, lon));
            }, function (error) { return reject(error); });
        }
        else {
            reject("La géolocalisation n'est pas supportée");
        }
    });
};
var userData = null;
var getUserData = function () { return __awaiter(_this, void 0, void 0, function () {
    var token, response, data, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                token = localStorage.getItem("token");
                if (!token) {
                    console.error("Aucun token trouvé.");
                    return [2 /*return*/];
                }
                return [4 /*yield*/, fetch("https://galio-a9c7f612fd32.herokuapp.com/profile", {
                        headers: {
                            Authorization: "Bearer ".concat(token),
                        },
                    })];
            case 1:
                response = _a.sent();
                if (!response.ok) {
                    throw new Error("Erreur lors de la récupération des données utilisateur.");
                }
                return [4 /*yield*/, response.json()];
            case 2:
                data = _a.sent();
                userData = data.user;
                document.getElementById("username").textContent = userData.username;
                if (userData.profileImage) {
                    document.getElementById("profile-image").src = "https://galio-a9c7f612fd32.herokuapp.com/".concat(userData.profileImage);
                }
                loadGeocaches();
                return [3 /*break*/, 4];
            case 3:
                error_2 = _a.sent();
                console.error("Erreur lors de la récupération des données utilisateur:", error_2);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
var loadGeocaches = function () { return __awaiter(_this, void 0, void 0, function () {
    var response, geocaches, token, validatedGeocaches_1, validationResponse, userId, localValidatedGeocaches_1, userLocation_1, error_3;
    var _this = this;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 7, , 8]);
                return [4 /*yield*/, fetch("https://galio-a9c7f612fd32.herokuapp.com/geocache")];
            case 1:
                response = _a.sent();
                if (!response.ok) {
                    throw new Error("Erreur lors du chargement des géocaches.");
                }
                return [4 /*yield*/, response.json()];
            case 2:
                geocaches = _a.sent();
                token = localStorage.getItem("token");
                validatedGeocaches_1 = [];
                if (!token) return [3 /*break*/, 5];
                return [4 /*yield*/, fetch("https://galio-a9c7f612fd32.herokuapp.com/validated-geocaches", {
                        headers: {
                            Authorization: "Bearer ".concat(token),
                        },
                    })];
            case 3:
                validationResponse = _a.sent();
                return [4 /*yield*/, validationResponse.json()];
            case 4:
                validatedGeocaches_1 = _a.sent();
                _a.label = 5;
            case 5:
                userId = userData === null || userData === void 0 ? void 0 : userData.username;
                if (!userId) {
                    console.error("Utilisateur non trouvé");
                    return [2 /*return*/];
                }
                localValidatedGeocaches_1 = JSON.parse(localStorage.getItem("validatedGeocaches_".concat(userId)) || "[]");
                return [4 /*yield*/, getUserLocation()];
            case 6:
                userLocation_1 = _a.sent();
                map.eachLayer(function (layer) {
                    if (layer instanceof L.Marker) {
                        map.removeLayer(layer);
                    }
                });
                if (userMarker) {
                    userMarker.addTo(map);
                }
                geocaches.forEach(function (geo) {
                    var geoLocation = L.latLng(geo.latitude, geo.longitude);
                    var distanceToGeo = userLocation_1.distanceTo(geoLocation) / 1000;
                    if (distanceLimit > 0 && distanceToGeo > distanceLimit) {
                        return;
                    }
                    var isValidatedLocally = localValidatedGeocaches_1.includes(geo._id) ||
                        validatedGeocaches_1.includes(geo._id);
                    var popupContent = "<b>".concat(geo.name, "</b><br>\n        Difficult\u00E9: ").concat(geo.difficulty, "<br>\n        Cr\u00E9\u00E9e par: ").concat(geo.creator, "<br>\n        Description: ").concat(geo.description, "<br>");
                    if (userData && (userData.username === geo.creator || userData.isAdmin)) {
                        popupContent += " \n          <button class=\"editBtn\" data-id=\"".concat(geo._id, "\" style=\"margin-top: 10px;\">Modifier</button>\n          <button class=\"deleteBtn\" data-id=\"").concat(geo._id, "\" style=\"margin-top: 10px;\">Supprimer</button>\n        ");
                    }
                    if (!isValidatedLocally) {
                        popupContent += "<button class=\"validateBtn\" data-id=\"".concat(geo._id, "\" style=\"margin-top: 10px;\">Valider</button>");
                    }
                    popupContent += "<button class=\"show-comments-btn\" data-id=\"".concat(geo._id, "\" style=\"margin-top: 10px;\">Voir Commentaires</button>");
                    var markerIcon = isValidatedLocally || geo.isValidated ? greenIcon : defaultIcon;
                    var marker = L.marker([geo.latitude, geo.longitude], {
                        icon: markerIcon,
                    })
                        .addTo(map)
                        .bindPopup(popupContent);
                    marker.on("popupopen", function () {
                        var editBtn = document.querySelector(".editBtn[data-id=\"".concat(geo._id, "\"]"));
                        var deleteBtn = document.querySelector(".deleteBtn[data-id=\"".concat(geo._id, "\"]"));
                        var showCommentsBtn = document.querySelector(".show-comments-btn[data-id=\"".concat(geo._id, "\"]"));
                        var validateBtn = document.querySelector(".validateBtn[data-id=\"".concat(geo._id, "\"]"));
                        if (editBtn) {
                            editBtn.addEventListener("click", function () {
                                window.location.href = "edit_geocache.html?id=".concat(geo._id);
                            });
                        }
                        if (validateBtn) {
                            validateBtn.addEventListener("click", function () {
                                var code = prompt("Entrez le code secret de la géocache :");
                                if (code) {
                                    validateGeocache(geo._id, code, marker);
                                }
                            });
                        }
                        if (deleteBtn) {
                            deleteBtn.addEventListener("click", function () { return __awaiter(_this, void 0, void 0, function () {
                                var confirmed, token_1;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            confirmed = confirm("Êtes-vous sûr de vouloir supprimer cette géocache ?");
                                            if (!confirmed) return [3 /*break*/, 2];
                                            token_1 = localStorage.getItem("token");
                                            return [4 /*yield*/, fetch("https://galio-a9c7f612fd32.herokuapp.com/geocache/".concat(geo._id), {
                                                    method: "DELETE",
                                                    headers: { Authorization: "Bearer ".concat(token_1) },
                                                })];
                                        case 1:
                                            _a.sent();
                                            alert("Géocache supprimée avec succès.");
                                            location.reload();
                                            _a.label = 2;
                                        case 2: return [2 /*return*/];
                                    }
                                });
                            }); });
                        }
                        if (showCommentsBtn) {
                            showCommentsBtn.addEventListener("click", function () {
                                window.location.href = "commentaires.html?id=".concat(geo._id);
                            });
                        }
                    });
                });
                return [3 /*break*/, 8];
            case 7:
                error_3 = _a.sent();
                console.error("Erreur de chargement des géocaches:", error_3);
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); };
var validateGeocache = function (geocacheId, code, marker) { return __awaiter(_this, void 0, void 0, function () {
    var token, response, data, userId, validatedGeocaches, validateBtn, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                token = localStorage.getItem("token");
                return [4 /*yield*/, fetch("https://galio-a9c7f612fd32.herokuapp.com/validate-geocache/".concat(geocacheId), {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: "Bearer ".concat(token),
                        },
                        body: JSON.stringify({ password: code }),
                    })];
            case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
            case 2:
                data = _a.sent();
                if (response.ok) {
                    alert(data.message);
                    marker.setIcon(greenIcon);
                    userId = userData === null || userData === void 0 ? void 0 : userData.username;
                    if (!userId) {
                        console.error("Utilisateur non trouvé");
                        return [2 /*return*/];
                    }
                    validatedGeocaches = JSON.parse(localStorage.getItem("validatedGeocaches_".concat(userId)) || "[]");
                    if (!validatedGeocaches.includes(geocacheId)) {
                        validatedGeocaches.push(geocacheId);
                        localStorage.setItem("validatedGeocaches_".concat(userId), JSON.stringify(validatedGeocaches));
                    }
                    validateBtn = document.querySelector(".validateBtn[data-id=\"".concat(geocacheId, "\"]"));
                    if (validateBtn) {
                        validateBtn.remove();
                    }
                }
                else {
                    alert(data.error);
                }
                return [3 /*break*/, 4];
            case 3:
                error_4 = _a.sent();
                console.error("Erreur lors de la validation :", error_4);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
var loadComments = function (geocacheId) { return __awaiter(_this, void 0, void 0, function () {
    var commentsList, response, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                commentsList = document.getElementById("comments-list");
                if (!commentsList)
                    return [2 /*return*/];
                return [4 /*yield*/, fetch("https://galio-a9c7f612fd32.herokuapp.com/comment/".concat(geocacheId))];
            case 1:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
            case 2:
                data = _a.sent();
                commentsList.innerHTML = data.comments
                    .map(function (comment) {
                    return "<div class=\"comment\">\n          <p><strong>".concat(comment.username, "</strong>: ").concat(comment.text, "</p>\n        </div>");
                })
                    .join("");
                return [2 /*return*/];
        }
    });
}); };
(_a = document
    .getElementById("submit-comment")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", function () { return __awaiter(_this, void 0, void 0, function () {
    var commentText, token, response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (selectedGeocacheId === null)
                    return [2 /*return*/];
                commentText = document.getElementById("comment-text").value;
                token = localStorage.getItem("token");
                return [4 /*yield*/, fetch("https://galio-a9c7f612fd32.herokuapp.com/comment", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: "Bearer ".concat(token),
                        },
                        body: JSON.stringify({
                            geocacheId: selectedGeocacheId,
                            text: commentText,
                        }),
                    })];
            case 1:
                response = _a.sent();
                if (response.ok) {
                    loadComments(selectedGeocacheId);
                    alert("Commentaire ajouté !");
                }
                else {
                    alert("Erreur lors de l'ajout du commentaire.");
                }
                return [2 /*return*/];
        }
    });
}); });
(_b = document.getElementById("addGeocacheBtn")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", function () {
    window.location.href = "create_geocache.html";
});
