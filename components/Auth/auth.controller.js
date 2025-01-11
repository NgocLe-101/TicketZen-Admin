import passport from "passport";

const getLogin = (req, res) => {
  res.render("auth/login", { errorMessage: null });
};

const postLogin = (req, res, next) => {
  passport.authenticate("local-login", (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return res.render("auth/login", { errorMessage: info.message });
    }
    if (user.role !== "admin") {
      return res.render("auth/login", {
        errorMessage: "You do not have permission to access this page",
      });
    }
    req.logIn(user, (err) => {
      if (err) return next(err);
      console.log(req);
      return res.redirect("/?login=success");
    });
  })(req, res, next);
};

export default {
  getLogin,
  postLogin,
};
