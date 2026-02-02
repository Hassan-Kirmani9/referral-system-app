"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token || token !== 'demo-token') {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized - Valid token required'
        });
    }
    next();
};
exports.authenticate = authenticate;
