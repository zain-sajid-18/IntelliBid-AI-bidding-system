// this hook is used to check the user is logged in or not and get the user data

import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
    const { user, setUser, clearUser } = useAuthStore();
    return { user, setUser, clearUser, isLoggedIn: !!user };
};