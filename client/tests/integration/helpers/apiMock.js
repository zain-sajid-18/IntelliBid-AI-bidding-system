/**
 * Shared fetch mock that simulates the api() client contract end-to-end.
 */
export function createApiMock(handlers = {}) {
    return jest.fn(async (endpoint, options = {}) => {
        const method = (options.method || 'GET').toUpperCase();
        const key = `${method} ${endpoint.split('?')[0]}`;
        const handler = handlers[key] || handlers[`ANY ${endpoint.split('?')[0]}`] || handlers['*'];

        if (!handler) {
            throw new Error(`Unhandled API call: ${key}`);
        }

        const body = options.body ? JSON.parse(options.body) : undefined;
        const result = await handler({ endpoint, method, body, options });

        if (result?.error) {
            throw new Error(result.error);
        }

        return result?.data ?? result;
    });
}
