const jwt = require('jsonwebtoken');

exports.authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: "Token missing or not authorized",
    });
  }

  const token = authHeader.split(' ')[1]; // Extract token after 'Bearer '

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

    req.body.userId = decoded.userId;
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token is invalid or expired",
    });
  }
};
