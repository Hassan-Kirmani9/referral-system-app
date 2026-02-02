import { Request, Response, NextFunction } from 'express';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token || token !== 'demo-token') {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized - Valid token required'
    });
  }

  next();
};