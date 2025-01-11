const isAuthenticated = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.redirect("auth/login");
  }

  next();
};

const isAdmin = (req, res, next) => {
  if (!req.isAuthenticated() || req.user.role !== "admin") {
    console.log("Unauthorized access");
    return res.redirect("auth/login");
  }

  next();
};

export { isAuthenticated, isAdmin };
