// backend/src/server.ts
import express from "express";
import session from "express-session";
import passport from "passport";
import "./strategies";
import dotenv from "dotenv";
import fetch from "node-fetch";
import cors from "cors";
import { connectToDatabase } from "./config/db";
import { User } from "./models/User";
import { Project } from "./models/Projects";
dotenv.config();

const app = express();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:4200";
const BACKEND_URL = process.env.BACKEND_URL;
const PORT = process.env.PORT || 3000;

// connect once on cold start
connectToDatabase( process.env.MONGODB_URI || "" );

app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));
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
app.use(express.json());
// Passport setup
app.use(passport.initialize());
app.use(passport.session());

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

app.get("/api/auth/me", async (req, res) => {
  if (!req.user) return res.json(null);

  try {
    const user = await User.findById(req.user._id).exec();
    return res.json(user);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// Google auth
app.get(
  "/api/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/api/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect(`${FRONTEND_URL}/dashboard`);
  }
);

app.get(
  "/api/auth/github",
  passport.authenticate("github", {
    scope: ["read:user", "user:email", "repo"],
  })
);

app.get(
  "/api/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  async (req, res) => {
    res.redirect(`${FRONTEND_URL}/dashboard`);
  }
);

app.get("/api/github/repos", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not logged in" });

  try {
    const at: string = req.user.accessToken ?? "";
    const repos = await getUserRepos(at);
    res.json(repos);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});
app.get("/api/logout", (req, res) => {
  req.logout(() => {
    res.clearCookie("connect.sid");
    res.send({ ok: true });
  });
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

// const startServer = async () => {
//   await connectToDatabase(process.env.MONGODB_URI || "");
//   app.listen(PORT, () =>
//     console.log(`Server running on http://localhost:${PORT}`)
//   );
// };
export default app;

// if (process.env.NODE_ENV !== "production") {
//   startServer();
// }