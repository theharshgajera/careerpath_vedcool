"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAdmin = exports.verifyToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyToken = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        console.log('Token received:', token);
        if (!token) {
            console.log('No token provided');
            res.status(401).json({ message: 'Authentication required' });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        console.log('Token decoded successfully:', decoded);
        req.user = { userId: decoded.userId };
        next();
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Token verification failed:', errorMessage);
        res.status(403).json({ message: 'Invalid token', error: errorMessage });
    }
};
exports.verifyToken = verifyToken;
// Keep isAdmin for potential future use, but make it a no-op for now
const isAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ message: 'Authentication required' });
        return;
    }
    // Since any logged-in user can access the admin panel, just proceed
    next();
};
exports.isAdmin = isAdmin;
