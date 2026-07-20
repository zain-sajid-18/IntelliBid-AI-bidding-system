import jwt from "jsonwebtoken"
import User from "../models/user.model.js";

export const auth = async (req, res, next) => {
    try {   
        let token = req.cookies.token;
        
        // Fallback: check Authorization header
        if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if(!token){
            return res.status(401).json({ success: false, message: 'Not authenticated' });
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Check if user is still active in DB
        const user = await User.findById(decoded.id).select('status');
        if (!user || user.status === 'suspended' || user.status === 'banned') {
            return res.status(403).json({ 
                success: false, 
                message: `Account is ${user?.status || 'inactive'}. Access denied.` 
                
            });
        }

        req.user = decoded;
        next();
    }
    catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
}