import bcrypt from "bcrypt";
import UserModel from "./user.model.js";

const verifyPassword = async (password, user) => {
  return await bcrypt.compare(password, user.password);
};

const unbanUser = async (id) => {
  return await UserModel.updateAccountStatus(id, "active");
};

const banUser = async (id) => {
  return await UserModel.updateAccountStatus(id, "banned");
};

export default {
  verifyPassword,
  banUser,
  unbanUser,
};
