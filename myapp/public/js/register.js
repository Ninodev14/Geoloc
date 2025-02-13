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
var _a;
var _this = this;
(_a = document
    .getElementById("registerForm")) === null || _a === void 0 ? void 0 : _a.addEventListener("submit", function (e) { return __awaiter(_this, void 0, void 0, function () {
    var usernameInput, emailInput, passwordInput, imageInput, messageElement, username, email, password, imageFile, formData, response, data, error_1;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                e.preventDefault();
                usernameInput = document.getElementById("username");
                emailInput = document.getElementById("email");
                passwordInput = document.getElementById("password");
                imageInput = document.getElementById("profileImage");
                messageElement = document.getElementById("message");
                if (!usernameInput ||
                    !emailInput ||
                    !passwordInput ||
                    !imageInput ||
                    !messageElement) {
                    console.error("Un ou plusieurs éléments du DOM sont introuvables.");
                    return [2 /*return*/];
                }
                username = usernameInput.value;
                email = emailInput.value;
                password = passwordInput.value;
                imageFile = (_a = imageInput.files) === null || _a === void 0 ? void 0 : _a[0];
                if (!imageFile) {
                    messageElement.textContent = "Veuillez sélectionner une image.";
                    return [2 /*return*/];
                }
                formData = new FormData();
                formData.append("username", username);
                formData.append("email", email);
                formData.append("password", password);
                formData.append("profileImage", imageFile);
                _b.label = 1;
            case 1:
                _b.trys.push([1, 4, , 5]);
                return [4 /*yield*/, fetch("http://localhost:5000/register", {
                        method: "POST",
                        body: formData,
                    })];
            case 2:
                response = _b.sent();
                return [4 /*yield*/, response.json()];
            case 3:
                data = _b.sent();
                messageElement.textContent =
                    data.message || data.error || "Une erreur est survenue.";
                if (data.message) {
                    window.location.href = "/login.html";
                }
                return [3 /*break*/, 5];
            case 4:
                error_1 = _b.sent();
                console.error("Erreur lors de l'inscription :", error_1);
                messageElement.textContent = "Erreur de connexion. Veuillez réessayer.";
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
