import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../../config/database.js";

console.log(process.env.NODE_ENV === "production", " checck at backend");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (!users.length) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure in production (HTTPS)
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // Use "None" for cross-origin in production
      // path: "/",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      // path: "/",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    // // version 2
    // // Set cookies correctly for third-party context
    // res.cookie("accessToken", accessToken, {
    //   httpOnly: true,
    //   secure: true, // Required for SameSite=None and HTTPS
    //   sameSite: "None", // Required for cross-origin requests
    //   path: "/",
    //   maxAge: 15 * 60 * 1000, // 15 minutes
    // });

    // res.cookie("refreshToken", refreshToken, {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: "None",
    //   path: "/",
    //   maxAge: 24 * 60 * 60 * 1000, // 1 day
    // });

    // //version
    // // Set cookies correctly for third-party context
    // res.cookie("accessToken", accessToken, {
    //   httpOnly: true,
    //   secure: true, // Required for SameSite=None and HTTPS
    //   sameSite: "None", // Required for cross-origin requests
    //   // path: "/",
    //   maxAge: 15 * 60 * 1000, // 15 minutes
    // });

    // res.cookie("refreshToken", refreshToken, {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: "None",
    //   // path: "/",
    //   maxAge: 24 * 60 * 60 * 1000, // 1 day
    // });

    res.json({
      user: { id: user.id, email: user.email, role: user.role },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Error logging in",
      error: error.message,
    });
  }
};

const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: "No refresh token provided" });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const newAccessToken = jwt.sign(
      { id: decoded.id, email: decoded.email, role: decoded.role },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    // res.cookie("accessToken", newAccessToken, {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: "None",
    //   // path: "/",
    //   maxAge: 15 * 60 * 1000,
    // });

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Use secure in production (HTTPS)
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // Use "None" for cross-origin in production
      // path: "/",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.json({
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
    });
  } catch (error) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
};

const logout = (req, res) => {
  // res.clearCookie("accessToken", {
  //   httpOnly: true,
  //   secure: true,
  //   sameSite: "None",
  //   // path: "/",
  // });

  // res.clearCookie("refreshToken", {
  //   httpOnly: true,
  //   secure: true,
  //   sameSite: "None",
  //   // path: "/",
  // });
  res.cookie("accessToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Use secure in production (HTTPS)
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax", // Use "None" for cross-origin in production
    // path: "/",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
    // path: "/",
  });

  res.json({ message: "Logged out successfully" });
};

const getMe = async (req, res) => {
  try {
    // req.user is set by verifyToken middleware
    res.json({
      success: true,
      user: { id: req.user.id, email: req.user.email, role: req.user.role },
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

export { login, refreshToken, logout, getMe };
