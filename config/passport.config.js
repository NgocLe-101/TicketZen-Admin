import { Strategy as LocalStrategy } from "passport-local";
import userModel from "../components/Account/user.model.js";
import accountService from "../components/Account/account.service.js";

export default function (passport) {
  passport.use(
    "local-login",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await userModel.findOne({ email });
          if (!user) {
            return done(null, false, { message: "Incorrect email." });
          }
          const passwordMatch = await accountService.verifyPassword(
            password,
            user
          );
          if (!passwordMatch) {
            return done(null, false, { message: "Incorrect password." });
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await userModel.findUserById(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}
