const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Helper to safely call toast even before hydration
const fireToast = (type, message, extra = {}) => {
    if (typeof window === 'undefined') return;
    if (window.toast && window.toast[type]) {
        window.toast[type](message, extra);
    } else {
        // Fallback: try importing store
        import('@/store/toastStore').then(m => {
            const store = m.useToastStore.getState();
            if (store && store[type]) store[type](message, extra);
        }).catch(() => {});
    }
};

export const api = async (endpoint, options = {}) => {
    const isFormData = options.body instanceof FormData;
    const isGetRequest = !options.method || options.method.toUpperCase() === 'GET';
    const method = (options.method || 'GET').toUpperCase();
    const shouldShowSuccess = options.showSuccess === true || (!isGetRequest && options.showSuccess !== false && method !== 'DELETE');
    const shouldShowError = options.showError !== false;
    
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
                    fireToast('warning', 'Please log in to continue');
                    setTimeout(() => { window.location.href = '/login'; }, 800);
                }
            }
            throw new Error('Please log in to continue');
        }
        if (shouldShowError) fireToast('error', 'Invalid server response');
        throw new Error('Invalid server response');
    }

    if (!res.ok) {
        // If 401 unauthorized, clear token and redirect to login
        if (res.status === 401) {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('token');
                const currentPath = window.location.pathname;
                if (!currentPath.startsWith('/login') && !currentPath.startsWith('/register') && !currentPath.startsWith('/forgot-password') && !currentPath.startsWith('/reset-password')) {
                    fireToast('warning', data.message || 'Please log in to continue');
                    setTimeout(() => { window.location.href = '/login'; }, 800);
                }
            }
            throw new Error(data.message || 'Please log in to continue');
        }
        if (shouldShowError) {
            fireToast('error', data.message || 'Request failed');
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
        fireToast('info', 'Signed out successfully');
    }

    // Auto-success toast for mutations (POST/PUT/PATCH)
    if (shouldShowSuccess && data && data.success && !isGetRequest) {
        // Don't duplicate if data has a custom success message already; use it
        const msg = data.message || 'Done!';
        if (method === 'DELETE') fireToast('info', msg);
        else fireToast('success', msg);
    }

    return data;
}