"use strict";
import accountService from "./account.service.js";
import UserModel from "./user.model.js";

class AccountController {
  // Get paginated account list with filters
  async getAllAccount(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        search = "",
        type = "all", // 'admin', 'customer', 'all'
        sortBy = "created_at",
        order = "desc",
      } = req.query;
      const accounts = await UserModel.getAllUser({
        page: parseInt(page),
        limit: parseInt(limit),
        search,
        type,
        sortBy,
        order,
      });
      if (req.xhr) {
        // AJAX request
        return res.json({
          success: true,
          data: accounts.users,
          pagination: {
            current: page,
            total: Math.ceil(accounts.total / limit),
          },
        });
      }

      // Server-side rendering
      res.render("dashboard", {
        activePage: "accounts",
        admin: req.user,
        message: null,
        accounts: accounts.users,
        pagination: {
          current: page,
          total: Math.ceil(accounts.total / limit),
        },
        filters: { search, type, sortBy, order },
      });
    } catch (error) {
      console.error("Error fetching accounts:", error);
      res
        .status(500)
        .json({ success: false, message: "Error fetching accounts" });
    }
  }

  // View account details
  async getAccountDetails(req, res) {
    try {
      const { id } = req.params;
      const account = await UserModel.findUserById(id);

      if (!account) {
        return res.render("404");
      }
      res.render("accounts/details", { account });
    } catch (error) {
      console.error("Error fetching account details:", error);
      res
        .status(500)
        .json({ success: false, message: "Error fetching account details" });
    }
  }

  // Update account status (ban/unban)
  async updateAccountStatus(req, res) {
    try {
      const { id } = req.params;
      const { status } = req.body; // 'active' or 'banned'
      console.log(req.get("X-Requested-With"));
      // Prevent self-ban
      if (id === req.user.id) {
        return res.status(403).json({
          success: false,
          message: "Cannot modify your own account status",
        });
      }

      const updatedAccount = await UserModel.manageUser(id, status);
      if (req.xhr) {
        return res.json({
          success: true,
          message: `Account ${
            status === "banned" ? "banned" : "activated"
          } successfully`,
          account: updatedAccount,
        });
      }

      res.redirect("/accounts");
    } catch (error) {
      console.error("Error updating account status:", error);
      res
        .status(500)
        .json({ success: false, message: "Error updating account status" });
    }
  }

  // Search/filter accounts
  async filterAccounts(req, res) {
    try {
      const { username, email, type } = req.query;

      const filters = {
        username: username || "",
        email: email || "",
        type: type || "all",
      };

      const accounts = await UserModel.filterUser(filters);

      if (req.xhr) {
        return res.json({ success: true, data: accounts });
      }

      res.render("accounts/list", { accounts, filters });
    } catch (error) {
      console.error("Error filtering accounts:", error);
      res
        .status(500)
        .json({ success: false, message: "Error filtering accounts" });
    }
  }

  // Sort accounts
  async sortAccounts(req, res) {
    try {
      const { sortBy, order } = req.query;

      const accounts = await UserModel.sortAccounts(sortBy, order);

      if (req.xhr) {
        return res.json({ success: true, data: accounts });
      }

      res.render("accounts/list", {
        accounts,
        sortSettings: { sortBy, order },
      });
    } catch (error) {
      console.error("Error sorting accounts:", error);
      res
        .status(500)
        .json({ success: false, message: "Error sorting accounts" });
    }
  }

  async banAccount(req, res) {
    try {
      const { id } = req.params;
      const { _status } = req.body;
      console.log(req.body);
      if (_status === "active") {
        // Unban account
        const account = await accountService.unbanUser(id);
        if (req.xhr) {
          return res.json({
            success: true,
            message: "Account unbanned successfully",
            account,
          });
        }
        return res.redirect("/accounts");
      } else {
        if (id == req.user.id) {
          return res.status(403).json({
            success: false,
            message: "Cannot ban your own account",
          });
        }
        const account = await accountService.banUser(id);

        if (req.xhr) {
          return res.json({
            success: true,
            message: "Account banned successfully",
            account,
          });
        }

        res.redirect("/accounts");
      }
    } catch (error) {
      console.error("Error banning account:", error);
      res
        .status(500)
        .json({ success: false, message: "Error banning account" });
    }
  }
}

export default new AccountController();
