import bcrypt from "bcrypt";
import UserModel from "./user.model.js";

const verifyPassword = async (password, user) => {
  console.log("Password:", password, "User:", user);
  return await bcrypt.compare(password, user.password);
};

const unbanUser = async (id) => {
  return await UserModel.updateAccountStatus(id, "active");
};

const banUser = async (id) => {
  return await UserModel.updateAccountStatus(id, "banned");
};

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export default {
  verifyPassword,
  banUser,
  unbanUser,
  hashPassword,
};
