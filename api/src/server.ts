// backend/src/server.ts
import express from "express";
import session from "express-session";
import passport from "passport";
import "./strategies";
import dotenv from "dotenv";
import cors from "cors";
import { connectToDatabase } from "./config/db";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true,
  })
);
// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    },
  })
);

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get("/", (req, res) => {
  res.send("Server running. Go to /auth/google or /auth/github to login.");
});

app.get("/auth/me", (req, res) => {
  res.json(req.user || null);
});

// Google auth
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("http://localhost:4200/dashboard");
  }
);

app.get(
  "/auth/github",
  passport.authenticate("github", { scope: ["read:user", "user:email"] })
);

app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("http://localhost:4200/dashboard");
  }
);

app.get("/logout", (req, res) => {
  req.logout(() => {
    res.clearCookie("connect.sid");
    res.send({ ok: true });
  });
});

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectToDatabase(process.env.MONGODB_URI || "");
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
};

startServer();
