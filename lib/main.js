"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
function generateJWT(json) {
    const issuedAt = Math.floor(Date.now() / 1000);
    const payload = {
        iss: json.client_email,
        scope: 'https://www.googleapis.com/auth/chromewebstore',
        aud: 'https://www.googleapis.com/oauth2/v4/token',
        iat: issuedAt,
        exp: issuedAt + 60
    };
    return jsonwebtoken_1.default.sign(payload, json.private_key, {
        algorithm: 'RS256'
    });
}
function requestToken(jwt) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield axios_1.default.post('https://www.googleapis.com/oauth2/v4/token', {
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: jwt
        });
        return response.data.access_token;
    });
}
function createAddon(zip, token) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `https://www.googleapis.com/upload/chromewebstore/v1.1/items`;
        const body = fs_1.default.readFileSync(path_1.default.resolve(zip));
        yield axios_1.default.post(endpoint, body, {
            headers: {
                Authorization: `Bearer ${token}`,
                'x-goog-api-version': '2'
            }
        });
    });
}
function updateAddon(id, zip, token) {
    return __awaiter(this, void 0, void 0, function* () {
        const endpoint = `https://www.googleapis.com/upload/chromewebstore/v1.1/items/${id}`;
        const body = fs_1.default.readFileSync(path_1.default.resolve(zip));
        yield axios_1.default.put(endpoint, body, {
            headers: {
                Authorization: `Bearer ${token}`,
                'x-goog-api-version': '2'
            }
        });
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const service = core.getInput('service', { required: true });
            const extension = core.getInput('extension');
            const zip = core.getInput('zip', { required: true });
            const json = JSON.parse(service);
            const jwt = generateJWT(json);
            const token = yield requestToken(jwt);
            if (extension && extension.length > 0) {
                yield updateAddon(extension, zip, token);
            }
            else {
                yield createAddon(zip, token);
            }
        }
        catch (error) {
            core.setFailed(error.message);
        }
    });
}
run();
