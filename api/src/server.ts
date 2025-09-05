// backend/src/server.ts
import express from "express";
import session from "express-session";
// import passport from "passport";
// import "./strategies";
import dotenv from "dotenv";
import fetch from "node-fetch";
import jwt, { JwtPayload as DefaultJwtPayload } from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { JwtPayload } from "./types/auth";
import cors from "cors";
import { connectToDatabase } from "./config/db";
import { User } from "./models/User";
import { Project } from "./models/Projects";
dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:4200";
const BACKEND_URL = process.env.BACKEND_URL;
const PORT = process.env.PORT || 3000;

// connect once on cold start

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
// Session setup
// app.use(
//   session({
//     secret: process.env.SESSION_SECRET || "supersecret",
//     resave: false,
//     saveUninitialized: false,
//     cookie: {
//       secure: true, //changes required
//       sameSite: "none", //changes required
//     },
//   })
// );

function generateToken(userId: string) {
  return jwt.sign({ userId }, process.env.SESSION_SECRET!, { expiresIn: "7d" });
}

function authMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ error: "Not authenticated" });

  try {
    const decoded = jwt.verify(
      token,
      process.env.SESSION_SECRET!
    ) as JwtPayload;
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

app.get("/api/auth/google", (req, res) => {
  const redirectUri = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${
    process.env.GOOGLE_CLIENT_ID
  }&redirect_uri=${encodeURIComponent(
    process.env.GOOGLE_CALLBACK_URL!
  )}&response_type=code&scope=openid%20email%20profile`;

  res.redirect(redirectUri);
});

app.get("/api/auth/google/callback", async (req, res) => {
  const { code } = req.query;

  // 1. Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: code as string,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: process.env.GOOGLE_CALLBACK_URL!,
      grant_type: "authorization_code",
    }),
  });
  const tokens = await tokenRes.json();

  // 2. Get user profile
  const profileRes = await fetch(
    "https://www.googleapis.com/oauth2/v2/userinfo",
    { headers: { Authorization: `Bearer ${tokens.access_token}` } }
  );
  const profile = await profileRes.json();

  // 3. Upsert user
  let user = await User.findOne({ email: profile.email });
  if (!user) {
    user = await User.create({
      email: profile.email,
      name: profile.name,
      avatar: profile.picture,
      providers: ["google"],
    });
  } else {
    if (!user.providers.includes("google")) {
      user.providers.push("google");
    }
    user.name = profile.name;
    user.avatar = profile.picture;
    await user.save();
  }

  // 4. Generate JWT + set cookie
  const token = generateToken(user._id.toString());
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
});

app.get("/api/auth/github", (req, res) => {
  const redirectUri = `https://github.com/login/oauth/authorize?client_id=${
    process.env.GITHUB_CLIENT_ID
  }&redirect_uri=${encodeURIComponent(
    process.env.GITHUB_CALLBACK_URL!
  )}&scope=read:user%20user:email%20repo`;

  res.redirect(redirectUri);
});

app.get("/api/auth/github/callback", async (req, res) => {
  const { code } = req.query;

  // 1. Exchange code for token
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json" },
    body: new URLSearchParams({
      code: code as string,
      client_id: process.env.GITHUB_CLIENT_ID!,
      client_secret: process.env.GITHUB_CLIENT_SECRET!,
      redirect_uri: process.env.GITHUB_CALLBACK_URL!,
    }),
  });
  const tokens = await tokenRes.json();

  // 2. Get profile
  const profileRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });
  const profile = await profileRes.json();

  // Get email (sometimes not in profile)
  let email = profile.email;
  if (!email) {
    const emailsRes = await fetch("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    const emails = await emailsRes.json();
    email = emails.find((e: any) => e.primary).email;
  }

  // 3. Upsert user
  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({
      email,
      username: profile.login,
      avatar: profile.avatar_url,
      providers: ["github"],
      accessToken: tokens.access_token,
    });
  } else {
    if (!user.providers.includes("github")) {
      user.providers.push("github");
    }
    user.username = profile.login;
    user.avatar = profile.avatar_url;
    user.accessToken = tokens.access_token; // refresh token if needed
    await user.save();
  }

  // 4. JWT + cookie
  const token = generateToken(user._id.toString());
  res.cookie("token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
});

app.get("/api/auth/me", authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId);
  res.json(user);
});

// Passport setup
// app.use(passport.initialize());
// app.use(passport.session());

app.post("/api/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,     // must match how you set the cookie
    sameSite: "none", // must match how you set the cookie
  });

  res.status(200).json({ message: "Logged out successfully" });
});
async function getUserRepos(accessToken: string) {
  const res = await fetch("https://api.github.com/user/repos", {
    headers: {
      Authorization: `token ${accessToken}`,
      Accept: "application/vnd.github+json",
    },
  });

  const repos = await res.json();
  return repos;
}
// Routes
app.get("/", (req, res) => {
  res.send("Server running. Go to /auth/google or /auth/github to login.");
});

app.get("/api/github/repos", async (req, res) => {
  if (!req.userId) return res.status(401).json({ error: "Not logged in" });

  try {
    const at: string = req.userId.accessToken ?? "";
    const repos = await getUserRepos(at);
    res.json(repos);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});


app.post("/api/create-project", async (req, res) => {
  console.log("create project hit", req.body);
  let repoUrl: string = req.body.repoUrl;
  const deploy_id: string = req.body.deploy_id;
  repoUrl = repoUrl.trim().slice(19);
  if (repoUrl.endsWith(".git")) repoUrl = repoUrl.slice(0, -4);
  const username = repoUrl.split("/")[0];
  const repo: any = await fetch(`https://api.github.com/repos/${repoUrl}`).then(
    (res) => res.json()
  );
  const project_name = repo.name;
  const repo_link = repo.html_url;
  const branch_name = repo.default_branch;
  const commit_desc: any = await fetch(
    `https://api.github.com/repos/${repoUrl}/branches/${branch_name}`
  ).then((res) => res.json());
  const last_commit_message = commit_desc.commit.commit.message;
  const last_commit_datetime = commit_desc.commit.commit.author.date;
  const user: any = await User.findOne({ username: username }).exec();
  const project = new Project({
    project_name,
    repo_link,
    branch_name,
    user_id: user?._id,
    username: username,
    last_commit_message,
    last_commit_datetime,
    status: "uploaded",
    deploy_id,
  });
  await project.save();
  return res.status(200).json({ message: "Project created successfully" });
});

app.patch("/api/update-status", async (req, res) => {
  const deploy_id = req.body.deploy_id;
  const response = await fetch(`${BACKEND_URL}/status?id=${deploy_id}`).then(
    (res) => res.json() as any
  );
  console.log(response);
  const status: string = response.status;
  const deployed_url: string = response.url;
  await Project.findOneAndUpdate(
    { deploy_id: deploy_id },
    { $set: { status: status, deployed_url: deployed_url } }
  ).exec();
  return res.status(200).json({ status: status, deployed_url: deployed_url });
});

app.get("/api/projects", async (req, res) => {
  const projects = await Project.find().exec();
  return res.status(200).json(projects);
});

connectToDatabase(process.env.MONGODB_URI || "");

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
// app.get("/api/auth/me", async (req, res) => {
  //   console.log("auth me hit");
  //   if (!req.user) return res.json(null);
  //   console.log(req.user);
  //   try {
    //     console.log(req.user);
    //     const user = await User.findById(req.user._id).exec();
    //     return res.json(user);
    //   } catch (err: any) {
      //     return res.status(500).json({ error: err.message });
      //   }
      // });
      
      // // Google auth
      // app.get(
        //   "/api/auth/google",
        //   passport.authenticate("google", { scope: ["profile", "email"] })
        // );
        
        // app.get(
//   "/api/auth/github",
//   passport.authenticate("github", {
//     scope: ["read:user", "user:email", "repo"],
//   })
// );
// app.get(
  //   "/auth/github/callback",
  //   passport.authenticate("github", { failureRedirect: "/" }),
  //   (req, res) => {
    //     // ⚡️ THIS persists user into session
    //     if (req.user) {
      //       req.login(req.user, (err) => {
        //         if (err) return res.redirect("/?error=login");
        //         res.redirect(`${FRONTEND_URL}/dashboard`);
        //       });
        //     } else {
          //       console.log("no user");
          //     }
          //   }
          // );
          // app.get(
//   "/auth/google/callback",
//   passport.authenticate("google", { failureRedirect: "/" }),
//   (req, res) => {
  //     // ⚡️ THIS persists user into session
  //     if (req.user) {
    //       req.login(req.user, (err) => {
      //         if (err) return res.redirect("/?error=login");
      //         res.redirect(`${FRONTEND_URL}/dashboard`);
      //       });
      //     } else {
        //       console.log("no user");
        //     }
        //   }
        // );
        
        // app.get(
          //   "/api/auth/google/callback",
          //   passport.authenticate("google", { failureRedirect: "/" }),
          //   (req, res) => {
            //     // console.log("Successfully authenticated");
            //     // res.redirect(`${FRONTEND_URL}/dashboard`);
            //   }
            // );
            
            // app.get(
              //   "/api/auth/github/callback",
              //   passport.authenticate("github", { failureRedirect: "/" }),
              //   async (req, res) => {
                //     console.log("Successfully authenticated");
                //     res.redirect(`${FRONTEND_URL}/dashboard`);
                //   }
                // );
                
                // app.get("/api/logout", (req, res) => {
                //   req.logout(() => {
                //     res.clearCookie("connect.sid");
                //     res.send({ ok: true });
                //   });
                // });