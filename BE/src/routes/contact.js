const express = require("express");
const router = express.Router();
const Contact = require("../models/ContactMessage");
const { authenticateToken, requirePermission } = require("../middlewares/auth");
const { sendResponse, sendError } = require("../utils/response");

// ✅ Public: Submit contact form
router.post("/", async (req, res) => {
  try {
    const { name, email, number, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return sendError(res, 400, "All required fields must be filled.");
    }

    const contact = new Contact({
      name,
      email,
      number,
      subject,
      message,
    });

    await contact.save();
    sendResponse(res, contact, "Message submitted successfully", 201);
  } catch (err) {
    sendError(res, 500, "Error submitting message", err.message);
  }
});

// ✅ Admin: List all messages
router.get(
  "/list",
  authenticateToken,
  requirePermission("manage-messages"),
  async (req, res) => {
    try {
      const messages = await Contact.find().sort({ createdAt: -1 });
      sendResponse(res, messages, "Messages retrieved successfully");
    } catch (err) {
      sendError(res, 500, "Error fetching messages", err.message);
    }
  }
);

// ✅ Admin: Mark as read/replied
router.put(
  "/:id/status",
  authenticateToken,
  requirePermission("manage-messages"),
  async (req, res) => {
    try {
      const { status } = req.body;
      const validStatuses = ["new", "read", "replied"];
      if (!validStatuses.includes(status)) {
        return sendError(res, 400, "Invalid status value");
      }

      const contact = await Contact.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true }
      );

      if (!contact) return sendError(res, 404, "Message not found");
      sendResponse(res, contact, "Message status updated");
    } catch (err) {
      sendError(res, 500, "Error updating message", err.message);
    }
  }
);

// ✅ Admin: Delete message
router.delete(
  "/:id",
  authenticateToken,
  requirePermission("manage-messages"),
  async (req, res) => {
    try {
      const contact = await Contact.findByIdAndDelete(req.params.id);
      if (!contact) return sendError(res, 404, "Message not found");
      sendResponse(res, null, "Message deleted successfully");
    } catch (err) {
      sendError(res, 500, "Error deleting message", err.message);
    }
  }
);

module.exports = router;
