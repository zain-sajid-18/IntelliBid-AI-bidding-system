import '@testing-library/jest-dom'

Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
})

// Mock scrollIntoView as it's not implemented in JSDOM
Element.prototype.scrollIntoView = jest.fn();

jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>,
        span: ({ children, ...props }) => <span {...props}>{children}</span>,
        h1: ({ children, ...props }) => <h1 {...props}>{children}</h1>,
        p: ({ children, ...props }) => <p {...props}>{children}</p>,
        section: ({ children, ...props }) => <section {...props}>{children}</section>,
        nav: ({ children, ...props }) => <nav {...props}>{children}</nav>,
        header: ({ children, ...props }) => <header {...props}>{children}</header>,
        footer: ({ children, ...props }) => <footer {...props}>{footer}</footer>,
        button: ({ children, ...props }) => <button {...props}>{children}</button>,
    },
    AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
    }),
    usePathname: () => '/',
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({}),
}));

// Mock storage
const localStorageMock = (function() {
    let store = {};
    return {
        getItem(key) { return store[key] || null; },
        setItem(key, value) { store[key] = value.toString(); },
        removeItem(key) { delete store[key]; },
        clear() { store = {}; }
    };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });
Object.defineProperty(window, 'sessionStorage', { value: localStorageMock });