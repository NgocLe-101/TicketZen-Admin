import UserModel from "../Account/user.model.js";

async function getProfile(req, res) {
  try {
    const adminId = req.user.id;
    const adminProfile = await UserModel.findUserById(adminId);

    if (!adminProfile) {
      return res
        .status(404)
        .json({ success: false, message: "Profile not found" });
    }
    console.log(adminProfile);
    res.render("profile", { admin: adminProfile });
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ success: false, message: "Error fetching profile" });
  }
}

async function updateProfile(req, res) {
  const { username, email, password } = req.body;
  const adminId = req.user.id; // Get the logged-in admin's ID

  try {
    // Validate the inputs
    if (!username || !email) {
      return res
        .status(400)
        .json({ success: false, message: "Name and email are required" });
    }

    // Find the admin by ID
    const admin = await UserModel.findUserById(adminId);

    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }
    const newData = {
      ...admin,
    };
    // Update the admin profile
    newData.username = username;
    newData.email = email;

    // If password is provided, hash it and update
    if (password) {
      newData.password = await bcrypt.hash(password, 10);
    }

    // Save the updated admin profile
    const response = await UserModel.updateUser(adminId, newData);
    console.log(response);
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
