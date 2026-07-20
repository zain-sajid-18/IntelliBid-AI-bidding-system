import { generateToken } from '../../../src/services/token.service.js';

export function buildAuthCookie(user) {
    const token = generateToken(user);
    return `token=${token}`;
}

export function extractCookies(setCookieHeader) {
    if (!setCookieHeader) return {};
    const headers = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
    return headers.reduce((acc, header) => {
        const [pair] = header.split(';');
        const [key, value] = pair.split('=');
        acc[key] = value;
        return acc;
    }, {});
}
