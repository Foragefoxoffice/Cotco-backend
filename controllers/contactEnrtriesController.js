const Contact = require("../models/ContactEntries");
const fs = require("fs");
const path = require("path");

// Helper: Upload file
const handleFileUpload = async (file, folder = "contacts") => {
  return new Promise((resolve, reject) => {
    try {
      const uploadDir = path.join(__dirname, `../uploads/${folder}`);

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const fileName = Date.now() + path.extname(file.name);
      const filePath = path.join(uploadDir, fileName);

      file.mv(filePath, (err) => {
        if (err) return reject(err);
        resolve(`/uploads/${folder}/${fileName}`);
      });
    } catch (err) {
      reject(err);
    }
  });
};

// Create a contact entry
exports.createContact = async (req, res) => {
  try {
    const { name, company, email, phone, product, message } = req.body;

    // Upload file if exists
    let fileUrl = null;
    if (req.files && req.files.file) {
      fileUrl = await handleFileUpload(req.files.file, "contacts");
    }

    const contact = await Contact.create({
      name,
      company,
      email,
      phone,
      product,
      message,
      fileUrl,
    });

    res.status(201).json({ success: true, data: contact });
  } catch (err) {
    console.error("Create Contact Error:", err);
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all contacts (admin only)
exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, data: contacts });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete a contact entry
exports.deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({ success: false, error: "Contact not found" });
    }

    // Delete uploaded file if exists
    if (contact.fileUrl) {
      const filePath = path.join(__dirname, "..", contact.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Contact.findByIdAndDelete(id);

    res.json({ success: true, message: "Contact deleted successfully" });
  } catch (err) {
    console.error("Delete Contact Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};
