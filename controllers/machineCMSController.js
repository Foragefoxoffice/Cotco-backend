const MachineCMS = require("../models/MachineCMS");

// ✅ Get Machine CMS Page
exports.getMachineCMSPage = async (req, res) => {
  try {
    let page = await MachineCMS.findOne();

    if (!page) {
      page = await MachineCMS.create({
        heroSection: { heroVideo: "", heroTitle: { en: "", vi: "" } },
        introSection: { introDescription: { en: "", vi: "" } },
        benefitsSection: {
          benefitTitle: { en: "", vi: "" },
          benefitImage: "",
          benefitBullets: { en: [""], vi: [""] },
        },
      });
    }

    res.status(200).json({ success: true, machinePage: page });
  } catch (err) {
    console.error("❌ Error fetching Machine CMS Page:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ✅ Update or Create Machine CMS Page
exports.updateMachineCMSPage = async (req, res) => {
  try {
    const updateData = req.body.machinePage
      ? JSON.parse(req.body.machinePage)
      : req.body;

    let page = await MachineCMS.findOne();

    if (page) {
      page = await MachineCMS.findByIdAndUpdate(page._id, updateData, {
        new: true,
        runValidators: true,
      });
    } else {
      page = await MachineCMS.create(updateData);
    }

    res.status(200).json({ success: true, machinePage: page });
  } catch (err) {
    console.error("❌ Error updating Machine CMS Page:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
