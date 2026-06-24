"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateShortCode = generateShortCode;
exports.normalizeUrl = normalizeUrl;
exports.isValidUrl = isValidUrl;
const crypto_1 = __importDefault(require("crypto"));
/**
 * Generates a random alphanumeric shortcode.
 */
function generateShortCode(length = 6) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    const bytes = crypto_1.default.randomBytes(length);
    for (let i = 0; i < length; i++) {
        code += chars[bytes[i] % chars.length];
    }
    return code;
}
/**
 * Normalizes a URL by prepending 'https://' if it's missing.
 */
function normalizeUrl(urlStr) {
    let normalized = urlStr.trim();
    if (!/^https?:\/\//i.test(normalized)) {
        normalized = 'https://' + normalized;
    }
    return normalized;
}
/**
 * Validates whether a string is a valid HTTP/HTTPS URL.
 */
function isValidUrl(urlStr) {
    try {
        const url = new URL(urlStr);
        return url.protocol === 'http:' || url.protocol === 'https:';
    }
    catch (_) {
        return false;
    }
}
