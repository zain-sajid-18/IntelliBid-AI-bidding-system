import { 
  getProfileService, 
  updateProfileService, 
  changePasswordService, 
  deleteAccountService,
  getPublicProfileService
} from './profile.service.js';
import { asyncHandler } from '../../utils/asyncHandler.js';

export const getMyProfile = asyncHandler(async (req, res) => {
  const data = await getProfileService(req.user.id);
  res.status(200).json({ success: true, ...data });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await updateProfileService(req.user.id, req.body);
  res.status(200).json({ success: true, user });
});

export const uploadAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  // Use req.file.path or req.file.secure_url, depending on multer-storage-cloudinary version
  const avatarUrl = req.file.secure_url || req.file.path;
  const user = await updateProfileService(req.user.id, { avatar: avatarUrl });
  res.status(200).json({ success: true, avatarUrl, user });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Both old and new passwords are required' });
  }
  await changePasswordService(req.user.id, oldPassword, newPassword);
  res.status(200).json({ success: true, message: 'Password updated successfully' });
});

export const deleteAccount = asyncHandler(async (req, res) => {
  await deleteAccountService(req.user.id);
  res.clearCookie('token');
  res.status(200).json({ success: true, message: 'Account deleted' });
});

// FIX: service returns { user, stats, activeListings } — must be spread, not nested
export const getPublicProfile = asyncHandler(async (req, res) => {
  const data = await getPublicProfileService(req.params.id);
  res.status(200).json({ success: true, ...data });
});
