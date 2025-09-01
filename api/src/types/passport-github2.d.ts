declare module "passport-github2" {
  import { Strategy as PassportStrategy } from "passport";
  import { Request } from "express";

  interface Profile extends passport.Profile {
    profileUrl?: string;
    username?: string;
  }

  interface StrategyOptions {
    clientID: string;
    clientSecret: string;
    callbackURL: string;
    scope?: string[];
    passReqToCallback?: boolean;
  }

  type VerifyCallback = (
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (error: any, user?: any) => void
  ) => void;

  export class Strategy extends PassportStrategy {
    constructor(options: StrategyOptions, verify: VerifyCallback);
  }
}
