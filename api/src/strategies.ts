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
        let existingUser = await User.findOne({
          email: profile.emails?.[0]?.value,
        });

        if (existingUser) {
          if (!existingUser.providers.includes("google")) {
            existingUser.providers.push("google");
          }
          if (!existingUser.providerIds.includes(profile.id)) {
            existingUser.providerIds.push(profile.id);
          }
          if (profile.displayName) existingUser.name = profile.displayName;
          if (profile.photos?.[0]?.value)
            existingUser.avatar = profile.photos[0].value;
          await existingUser.save();
          return done(null, existingUser);
        }

        const newUser = await User.create({
          providers: ["google"],
          providerIds: [profile.id],
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
      scope: ["read:user", "user:email", "repo"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const githubProfile = profile as any;
        let existing = await User.findOne({
          email: githubProfile.emails?.[0]?.value,
        });

        if (existing) {
          existing.providers.push("github");
          existing.providerIds.push(githubProfile.id);
          existing.avatar = githubProfile.photos?.[0]?.value || existing.avatar;
          existing.accessToken = accessToken;
          await existing.save();

          return done(null, existing);
        }

        // Otherwise create new
        const newUser = await User.create({
          providers: ["github"],
          providerIds: [githubProfile.id],
          username: githubProfile.username,
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
