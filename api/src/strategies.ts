import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import dotenv from "dotenv";
import { User, IUser } from "./models/User";
import mongoose from "mongoose";

dotenv.config();

// Serialize user
passport.serializeUser((user: Express.User, done) => {
  done(null, (user as IUser)._id.toString());
});

// Deserialize user
passport.deserializeUser(async (id: string, done) => {
  try {
    const userId = new mongoose.Types.ObjectId(id);
    const user = await User.findOne({_id: userId}).exec();
    done(null, user);
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
        await User.findOne({
          provider: "google",
          providerId: profile.id,
        })
          .then((existingUser: any) => {
            return done(null, existingUser);
          })
          .catch((err) => {
            return done(err, null);
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
        return done(err, null);
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
        const existingUser = await User.findOne({
          provider: "github",
          providerId: profile.id,
        });

        if (existingUser) return done(null, existingUser);

        const newUser = await User.create({
          provider: "github",
          providerId: profile.id,
          name: profile.displayName || profile.username,
          email: profile.emails?.[0]?.value,
          avatar: profile.photos?.[0]?.value,
        });

        return done(null, newUser);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);
