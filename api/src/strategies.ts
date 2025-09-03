import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import dotenv from "dotenv";
import { User, IUser } from "./models/User";

dotenv.config();

// Serialize user
passport.serializeUser((user: IUser, done) => {
  done(null, user._id.toString());
});

// Deserialize user
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id).exec();
    done(null, user || null);
  } catch (err) {
    done(err, null);
  }
});

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const existingUser = await User.findOne({
          provider: "google",
          providerId: profile.id,
        });

        if (existingUser) return done(null, existingUser);

        const newUser = await User.create({
          provider: "google",
          providerId: profile.id,
          name: profile.displayName,
          email: profile.emails?.[0]?.value,
          avatar: profile.photos?.[0]?.value,
        });

        return done(null, newUser);
      } catch (err) {
        return done(err, undefined);
      }
    }
  )
);

// GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
      callbackURL: process.env.GITHUB_CALLBACK_URL!,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const githubProfile = profile as any;
        const user = await User.findOne({
          provider: "github",
          providerId: githubProfile.id,
        });

        if (user) {
          // Update user info
          user.name = githubProfile.username;
          user.email = githubProfile.emails?.[0]?.value || user.email;
          user.avatar = githubProfile.photos?.[0]?.value || user.avatar;
          user.accessToken = accessToken; // always update token
          await user.save();

          return done(null, user);
        }

        const newUser = await User.create({
          provider: "github",
          providerId: githubProfile.id,
          name: githubProfile.username,
          email: githubProfile.emails?.[0]?.value,
          avatar: githubProfile.photos?.[0]?.value,
          accessToken,
        });

        return done(null, newUser);
      } catch (err) {
        return done(err, undefined);
      }
    }
  )
);
