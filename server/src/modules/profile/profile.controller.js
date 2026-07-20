import { 
    getProfileService, 
    updateProfileService, 
    changePasswordService, 
    deleteAccountService,
    getPublicProfileService
} from './profile.service.js';

export const getMyProfile = async (req, res) => {
    try {
        const data = await getProfileService(req.user.id);
        res.status(200).json({ success: true, ...data });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const user = await updateProfileService(req.user.id, req.body);
        res.status(200).json({ success: true, user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const uploadAvatar = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        const user = await updateProfileService(req.user.id, { avatar: req.file.path });
        res.status(200).json({ success: true, avatarUrl: req.file.path, user });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) {
            return res.status(400).json({ success: false, message: 'Both old and new passwords are required' });
        }
        await changePasswordService(req.user.id, oldPassword, newPassword);
        res.status(200).json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        await deleteAccountService(req.user.id);
        res.clearCookie('token');
        res.status(200).json({ success: true, message: 'Account deleted' });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// FIX: service returns { user, stats, activeListings } — must be spread, not nested
export const getPublicProfile = async (req, res) => {
    try {
        const data = await getPublicProfileService(req.params.id);
        res.status(200).json({ success: true, ...data });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};
