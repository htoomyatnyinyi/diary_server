import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../config/database.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// console.log(process.env.NODE_ENV === "production", " checck at backend");

const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;
    // console.log(token, "check at backend google auth");
    if (!token) {
      return res.status(400).json({ message: "Google token required" });
    }

    // Verify Google ID token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, sub: googleId, name } = payload;

    // Check if email ends with @mail.com (consistent with your registration logic)
    if (!email.endsWith("@gmail.com")) {
      return res.status(400).json({ message: "Email must end with @mail.com" });
    }

    // Check if user exists
    const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    let user = users[0];

    if (!user) {
      // Create new user
      const username = name || email.split("@")[0];
      const hashedPassword = await bcrypt.hash(googleId, 10); // Use googleId as a dummy password
      const userRole = "user"; // Default role, adjust as needed

      const [result] = await pool.query(
        "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
        [username, email, hashedPassword, userRole]
      );

      user = {
        id: result.insertId,
        email,
        role: userRole,
      };
    }

    // Generate tokens
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

    // // Set cookies
    // res.cookie("accessToken", accessToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    //   path: "/",
    //   maxAge: 15 * 60 * 1000,
    // });

    // res.cookie("refreshToken", refreshToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    //   path: "/",
    //   maxAge: 24 * 60 * 60 * 1000,
    // });

    // // version 2
    // // Set cookies correctly for third-party context
    // res.cookie("accessToken", accessToken, {
    //   httpOnly: true,
    //   secure: true, // Required for SameSite=None and HTTPS
    //   sameSite: "none", // Required for cross-origin requests
    //   path: "/",
    //   maxAge: 15 * 60 * 1000, // 15 minutes
    // });

    // res.cookie("refreshToken", refreshToken, {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: "none",
    //   path: "/",
    //   maxAge: 24 * 60 * 60 * 1000, // 1 day
    // });

    // version 3
    // Set cookies correctly for third-party context
    res.cookie("accessToken", accessToken, {
      // domain: "jobdiary.vercel.app",
      httpOnly: true,
      secure: true, // Required for SameSite=None and HTTPS
      sameSite: "lax", // Required for cross-origin requests
      path: "/",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      // domain: "jobdiary.vercel.app",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.json({
      user: { id: user.id, email: user.email, role: user.role },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({
      message: "Error during Google login",
      error: error.message,
    });
  }
};

const registerEmployer = async (req, res) => {
  try {
    const { username, email, password, confirmPassword, role } = req.body;

    // const { username, email, password, confirmPassword, role } = req.body;
    // Check if password and confirmPassword match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if email ends with @diary.com
    if (!email.endsWith("@mail.com")) {
      return res.status(400).json({ message: "Email must end with @mail.com" });
    }

    const userRole = role || "user";

    const [existingUsers] = await pool.query(
      "SELECT email FROM users WHERE email = ?",
      [email]
    );
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
      [username, email, hashedPassword, userRole]
    );
    console.log("This path is workding");

    res.status(201).json({
      message: "checked",
      userId: result.insertId,
    });

    // end here
    // const accessToken = jwt.sign(
    //   { id: result.insertId, email, role },
    //   process.env.JWT_SECRET,
    //   { expiresIn: "15m" }
    // );

    // const refreshToken = jwt.sign(
    //   { id: result.insertId, email, role },
    //   process.env.REFRESH_TOKEN_SECRET,
    //   { expiresIn: "1d" }
    // );

    // // Set cookies correctly for third-party context
    // res.cookie("accessToken", accessToken, {
    //   httpOnly: true,
    //   secure: true, // Required for SameSite=None and HTTPS
    //   sameSite: "none", // Required for cross-origin requests
    //   path: "/",
    //   maxAge: 15 * 60 * 1000, // 15 minutes
    // });

    // res.cookie("refreshToken", refreshToken, {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: "none",
    //   path: "/",
    //   maxAge: 24 * 60 * 60 * 1000, // 1 day
    // });

    // res.json({
    //   user: { id: result.insertId, email, role },
    //   userId: result.insertId,
    //   message: "User Created",
    //   accessToken,
    //   refreshToken,
    // });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Error registering user",
      error: error.message,
    });
  }
};

const register = async (req, res) => {
  try {
    const { username, email, password, confirmPassword, role } = req.body;
    // console.log(req.body, "req.body");

    // const { username, email, password, confirmPassword, role } = req.body;
    // Check if password and confirmPassword match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check if email ends with @diary.com
    if (!email.endsWith("@mail.com")) {
      return res.status(400).json({ message: "Email must end with @mail.com" });
    }

    const userRole = role || "user";

    const [existingUsers] = await pool.query(
      "SELECT email FROM users WHERE email = ?",
      [email]
    );
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
      [username, email, hashedPassword, userRole]
    );

    res.status(201).json({
      message: "User created",
      userId: result.insertId,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      message: "Error registering user",
      error: error.message,
    });
  }
};

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

    // res.cookie("accessToken", accessToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production", // Use secure in production (HTTPS)
    //   sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Use "none" for cross-origin in production
    //   path: "/",
    //   maxAge: 15 * 60 * 1000, // 15 minutes
    // });

    // res.cookie("refreshToken", refreshToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    //   path: "/",
    //   maxAge: 24 * 60 * 60 * 1000, // 1 day
    // });

    // // version 2
    // // Set cookies correctly for third-party context
    // res.cookie("accessToken", accessToken, {
    //   httpOnly: true,
    //   secure: true, // Required for SameSite=None and HTTPS
    //   sameSite: "none", // Required for cross-origin requests
    //   path: "/",
    //   maxAge: 15 * 60 * 1000, // 15 minutes
    // });

    // res.cookie("refreshToken", refreshToken, {
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: "none",
    //   path: "/",
    //   maxAge: 24 * 60 * 60 * 1000, // 1 day
    // });

    //version 3
    // Set cookies correctly for third-party context
    res.cookie("accessToken", accessToken, {
      // domain: "jobdiary.vercel.app",
      httpOnly: true,
      secure: true, // Required for SameSite=None and HTTPS
      sameSite: "lax", // Required for cross-origin requests
      path: "/",
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie("refreshToken", refreshToken, {
      // domain: "jobdiary.vercel.app",
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.json({
      user: { id: user.id, email: user.email, role: user.role },
      accessToken,
      refreshToken,
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

    res.cookie("accessToken", newAccessToken, {
      // domain: "jobdiary.vercel.app", // if have domain
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60 * 1000,
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
  res.clearCookie("accessToken", {
    // domain: "jobdiary.vercel.app",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
  });

  res.clearCookie("refreshToken", {
    // domain: "jobdiary.vercel.app",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
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

// haven't test yet
// // New Google Login Endpoint
// const googleLogin = async (req, res) => {
//   try {
//     const { token } = req.body;
//     if (!token) {
//       return res.status(400).json({ message: "Google token required" });
//     }

//     // Verify Google ID token
//     const ticket = await client.verifyIdToken({
//       idToken: token,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });

//     const payload = ticket.getPayload();
//     const { email, sub: googleId, name } = payload;

//     // Check if email ends with @mail.com (consistent with your registration logic)
//     if (!email.endsWith("@mail.com")) {
//       return res.status(400).json({ message: "Email must end with @mail.com" });
//     }

//     // Check if user exists
//     const [users] = await pool.query("SELECT * FROM users WHERE email = ?", [
//       email,
//     ]);
//     let user = users[0];

//     if (!user) {
//       // Create new user
//       const username = name || email.split("@")[0];
//       const hashedPassword = await bcrypt.hash(googleId, 10); // Use googleId as a dummy password
//       const userRole = "job_seeker"; // Default role, adjust as needed

//       const [result] = await pool.query(
//         "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)",
//         [username, email, hashedPassword, userRole]
//       );

//       user = {
//         id: result.insertId,
//         email,
//         role: userRole,
//       };
//     }

//     // Generate tokens (consistent with your login function)
//     const accessToken = jwt.sign(
//       { id: user.id, email: user.email, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "15m" }
//     );

//     const refreshToken = jwt.sign(
//       { id: user.id, email: user.email, role: user.role },
//       process.env.REFRESH_TOKEN_SECRET,
//       { expiresIn: "1d" }
//     );

//     // Set cookies (consistent with your login function)
//     res.cookie("accessToken", accessToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//       path: "/",
//       maxAge: 15 * 60 * 1000,
//     });

//     res.cookie("refreshToken", refreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
//       path: "/",
//       maxAge: 24 * 60 * 60 * 1000,
//     });

//     res.json({
//       user: { id: user.id, email: user.email, role: user.role },
//       accessToken,
//       refreshToken,
//     });
//   } catch (error) {
//     console.error("Google login error:", error);
//     res.status(500).json({
//       message: "Error during Google login",
//       error: error.message,
//     });
//   }
// };

export {
  registerEmployer,
  register,
  login,
  refreshToken,
  logout,
  getMe,
  googleLogin,
};
