import UserModel from "../Account/user.model.js";
import accountService from "../Account/account.service.js";
import cloudinary from "../../config/cloudinary.config.js";
import fs from "fs";
import bcrypt from "bcrypt";
import path from "path";
import sharp from "sharp";

async function getProfile(req, res) {
  try {
    const adminId = req.user.id;
    const adminProfile = await UserModel.findUserById(adminId);

    if (!adminProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }
    res.render("dashboard", {
      admin: adminProfile,
      activePage: "profile",
      message: null,
    });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ success: false, message: "Error fetching profile" });
  }
}

async function updateProfile(req, res) {
  const { username, email, currentPassword, newPassword } = req.body;
  const file = req.file;
  const adminId = req.user.id; // Get the logged-in admin's ID
  try {
    if (!currentPassword && newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Current password is required" });
    }

    if (currentPassword && !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "New password is required" });
    }
    // verify the current password
    const admin = await UserModel.findUserByIdWithPassword(adminId);
    console.log(await accountService.hashPassword("123456789"));
    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }
    if (currentPassword && newPassword) {
      const passwordMatch = await accountService.verifyPassword(
        currentPassword,
        admin
      );
      if (!passwordMatch) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid current password" });
      }
    }

    // Prepare the new data
    let avatar;
    if (file) {
      // compress and upload the image to cloudinary

      const image = await cloudinary.uploader.upload(file.path);
      avatar = image.secure_url;
    }

    const newData = {
      username: username || admin.username,
      email: email || admin.email,
      password:
        (await accountService.hashPassword(newPassword)) || admin.password,
      avatar: avatar || admin.avatar || "",
    };

    // Save the updated admin profile
    const response = await UserModel.updateUser(adminId, newData);
    console.log(response);
    // Remove the uploaded image
    if (file) {
      fs.unlinkSync(file.path);
    }

    // Return success response

    res.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ success: false, message: "Error updating profile" });
  }
}

export default {
  getProfile,
  updateProfile,
};
