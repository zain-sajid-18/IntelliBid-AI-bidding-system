const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const api = async (endpoint, options = {}) => {
    const isFormData = options.body instanceof FormData;
    const isGetRequest = !options.method || options.method.toUpperCase() === 'GET';
    
    // Retrieve token from localStorage (if running in client browser context)
    let token = null;
    if (typeof window !== 'undefined') {
        token = localStorage.getItem('token');
    }

    const headers = {
        ...(!isFormData && { 'Content-Type': 'application/json' }),
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
    };

    const fetchOptions = {
        credentials: 'include',
        ...options,
        headers: {
            ...headers,
            // Only add no-cache headers if explicitly requested or not a GET request
            ...((!isGetRequest || options.cache === 'no-store') && {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
            })
        }
    };

    // For GET requests, use default cache unless specified
    if (isGetRequest && !options.cache) {
        delete fetchOptions.cache;
    }

    const res = await fetch(`${BASE_URL}${endpoint}`, fetchOptions);

    let data;
    const text = await res.text();
    try {
        data = JSON.parse(text);
    } catch (err) {
        console.error(`[API Error] Failed to parse JSON from ${endpoint}. Body:`, text);
        throw new Error('Invalid server response');
    }

    if (!res.ok) throw new Error(data.message || 'Request failed');

    // Automatically store token on login / signup / social auth / upgrade
    if (data && data.token && typeof window !== 'undefined') {
        localStorage.setItem('token', data.token);
    }

    // Automatically clear token on logout
    if (endpoint === '/api/auth/logout' && typeof window !== 'undefined') {
        localStorage.removeItem('token');
    }

    return data;
}