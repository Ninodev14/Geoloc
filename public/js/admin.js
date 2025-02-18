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
var getToken = function () { return localStorage.getItem("token"); };
var checkAuthentication = function () { return __awaiter(_this, void 0, void 0, function () {
    var token, response, data, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                token = getToken();
                if (!token) {
                    window.location.href = "/index.html";
                    return [2 /*return*/];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 4, , 5]);
                return [4 /*yield*/, fetch("https://galio-a9c7f612fd32.herokuapp.com/profile", {
                        method: "GET",
                        headers: {
                            Authorization: "Bearer ".concat(token),
                        },
                    })];
            case 2:
                response = _a.sent();
                return [4 /*yield*/, response.json()];
            case 3:
                data = _a.sent();
                if (response.ok && data.user && data.user.isAdmin) {
                    fetchUsers(token);
                }
                else {
                    console.error("Accès interdit ou utilisateur non administrateur.");
                    window.location.href = "/geoloc.html";
                }
                return [3 /*break*/, 5];
            case 4:
                error_1 = _a.sent();
                console.error("Erreur d'authentification :", error_1);
                window.location.href = "/index.html";
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
var fetchUsers = function (token) {
    fetch("https://galio-a9c7f612fd32.herokuapp.com/admin/user", {
        headers: { Authorization: "Bearer ".concat(token) },
    })
        .then(function (res) { return res.json(); })
        .then(function (data) {
        var tbody = document.getElementById("userTableBody");
        tbody.innerHTML = "";
        data.users.forEach(function (user) {
            var row = document.createElement("tr");
            row.innerHTML = "\n                <td>".concat(user.username, "</td>\n                <td>").concat(user.email, "</td>\n                <td>").concat(user.isAdmin ? "Admin" : "Utilisateur", "</td>\n                <td>\n                  <button class=\"btn btn-warning btn-sm\" onclick=\"editUser('").concat(user.email, "')\">\n  <i class=\"bi bi-pencil\"></i> Modifier\n</button>\n\n").concat(!user.isAdmin
                ? "<button class=\"btn btn-success btn-sm\" onclick=\"makeAdmin('".concat(user.email, "')\">\n         <i class=\"bi bi-arrow-up-circle\"></i> Promouvoir\n       </button>")
                : "", "\n\n<button class=\"btn btn-danger btn-sm\" onclick=\"deleteUser('").concat(user.email, "')\">\n  <i class=\"bi bi-trash\"></i> Supprimer\n</button>\n\n                </td>\n              ");
            tbody.appendChild(row);
        });
    })
        .catch(function (error) {
        return console.error("Erreur lors de la récupération des utilisateurs:", error);
    });
};
var makeAdmin = function (email) {
    var token = getToken();
    if (!token)
        return;
    fetch("https://galio-a9c7f612fd32.herokuapp.com/make-admin", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer ".concat(token),
        },
        body: JSON.stringify({ email: email }),
    }).then(function () { return fetchUsers(token); });
};
var editUser = function (email) {
    var newUsername = prompt("Entrez le nouveau nom d'utilisateur:");
    var newIsAdmin = confirm("L'utilisateur doit-il être administrateur?");
    if (!newUsername)
        return;
    var token = getToken();
    fetch("https://galio-a9c7f612fd32.herokuapp.com/edit-user", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer ".concat(token),
        },
        body: JSON.stringify({ email: email, newUsername: newUsername, newIsAdmin: newIsAdmin }),
    })
        .then(function () { return fetchUsers(token); })
        .catch(function (error) { return console.error("Erreur de modification:", error); });
};
var deleteUser = function (email) {
    var token = getToken();
    if (!token)
        return;
    fetch("https://galio-a9c7f612fd32.herokuapp.com/delete-user", {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer ".concat(token),
        },
        body: JSON.stringify({ email: email }),
    })
        .then(function (res) { return res.json(); })
        .then(function (data) {
        if (data.error) {
            console.error("Erreur lors de la suppression:", data.error);
        }
        else {
            fetchUsers(token);
        }
    })
        .catch(function (error) {
        console.error("Erreur de requête:", error);
    });
};
window.onload = checkAuthentication;
