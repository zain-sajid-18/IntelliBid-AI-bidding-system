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
        if (res.status === 401) {
            // If unauthorized, clear stored token and redirect to login
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                // Avoid infinite redirect if we're already on login/register
                const currentPath = window.location.pathname;
                if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register') && !currentPath.startsWith('/forgot-password') && !currentPath.startsWith('/reset-password')) {
                    window.location.href = '/login';
                }
            }
            throw new Error('Please log in to continue');
        }
        throw new Error('Invalid server response');
    }

    if (!res.ok) {
        // If 401 unauthorized, clear token and redirect to login
        if (res.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                const currentPath = window.location.pathname;
                if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register') && !currentPath.startsWith('/forgot-password') && !currentPath.startsWith('/reset-password')) {
                    window.location.href = '/login';
                }
            }
            throw new Error(data.message || 'Please log in to continue');
        }
        throw new Error(data.message || 'Request failed');
    }

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