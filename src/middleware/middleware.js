import jwt from "jsonwebtoken";

const verifyToken = async (req, res, next) => {
  const accessToken = req.cookies.accessToken;
  // console.log("VerifyToken - Cookies received:", req.cookies);

  if (!accessToken) {
    return await handleRefreshToken(req, res, next);
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);

    // console.log("Token decoded successfully:", decoded);
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return await handleRefreshToken(req, res, next);
    }
    return res.status(401).json({
      message: "Authentication failed",
      error: "Invalid token",
    });
  }
};

const handleRefreshToken = async (req, res, next) => {
  const refreshToken = req.cookies.refreshToken;
  // console.log(" when token expier this console will run");

  if (!refreshToken) {
    return res.status(401).json({
      message: "Authentication required",
      error: "No refresh token provided",
    });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const newAccessToken = jwt.sign(
      { id: decoded.id, email: decoded.email, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" } // 15m
    );

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    req.user = decoded;
    // console.log(decoded, " check doecode new access token");
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Authentication failed",
      error: "Invalid refresh token",
    });
  }
};

const checkRole = (roles) => {
  return (req, res, next) => {
    // console.log("Check Role :", req.user);

    if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Insufficient permissions",
        error: "Role not authorized",
      });
    }
    next();
  };
};

export { verifyToken, checkRole };

// import jwt from "jsonwebtoken";

// const verifyToken = async (req, res, next) => {
//   const token = req.cookies.token;
//   console.log("VerifyToken - Cookies received:", req.cookies); // Debug

//   if (!token) {
//     return res.status(401).json({
//       message: "Authentication required",
//       error: "No token provided",
//     });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     console.log("Token decoded successfully:", decoded); // Debug
//     req.user = decoded;
//     next();
//   } catch (error) {
//     console.error("Token verification failed:", error);
//     if (error.name === "TokenExpiredError") {
//       return res.status(401).json({
//         message: "Session expired",
//         error: "Token expired",
//       });
//     }
//     return res.status(401).json({
//       message: "Authentication failed",
//       error: "Invalid token",
//     });
//   }
// };

// const checkRole = (roles) => {
//   return (req, res, next) => {
//     if (!req.user || !req.user.role || !roles.includes(req.user.role)) {
//       return res.status(403).json({
//         message: "Insufficient permissions",
//         error: "Role not authorized",
//       });
//     }
//     next();
//   };
// };

// export { verifyToken, checkRole };
