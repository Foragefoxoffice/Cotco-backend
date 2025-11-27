const path = require("path");
const fs = require("fs");
const ContactPage = require("../models/contactPage");

// Safe JSON parser
const safeParse = (val, fallback) => {
  try {
    return typeof val === "string" ? JSON.parse(val) : val || fallback;
  } catch {
    return fallback;
  }
};

// File save helper
const saveFile = (file, folder = "contact") => {
  const uploadDir = path.join(__dirname, `../uploads/${folder}`);
  fs.mkdirSync(uploadDir, { recursive: true });
  const filePath = path.join(uploadDir, file.name);
  file.mv(filePath);
  return `/uploads/${folder}/${file.name}`;
};

// ---------------- GET ---------------- //
exports.getContactPage = async (req, res) => {
  try {
    const contact = await ContactPage.findOne();

    if (!contact)
      return res.json({
        contactTeam: {
          teamIntro: {
            tag: { en: "", vi: "" },
            heading: { en: "", vi: "" },
            description: { en: "", vi: "" },
          },
          teamList: {},
        },
      });

    // ✅ Convert to plain JS object
    const contactData = contact.toObject({ getters: true, virtuals: false });

    res.json(contactData);
  } catch (err) {
    console.error("❌ getContactPage error:", err);
    res.status(500).json({ error: err.message });
  }
};


exports.updateContactPage = async (req, res) => {
  try {
    // ✅ Express-fileupload puts everything in req.files + req.body
    let data = req.body;
    const existing = (await ContactPage.findOne()) || new ContactPage({});

    // ✅ Parse all JSON sections
    const contactBanner = safeParse(data.contactBanner, existing.contactBanner || {});
    const contactForm = safeParse(data.contactForm, existing.contactForm || {});
    const contactLocation = safeParse(data.contactLocation, existing.contactLocation || {});
    const contactHours = safeParse(data.contactHours, existing.contactHours || {});
    const contactMap = safeParse(data.contactMap, existing.contactMap || {});
    // Parse contactTeam safely
let contactTeam = safeParse(data.contactTeam, existing.contactTeam || {});

// ✅ Deep-parse teamList and members
if (contactTeam.teamList && typeof contactTeam.teamList === "object") {
  for (const [teamKey, teamVal] of Object.entries(contactTeam.teamList)) {
    // Parse team object if it's stringified
    if (typeof teamVal === "string") {
      contactTeam.teamList[teamKey] = safeParse(teamVal, {});
    }

    const team = contactTeam.teamList[teamKey];

    // Parse members if they're stringified
    if (typeof team.members === "string") {
      team.members = safeParse(team.members, []);
    }

    // Ensure members is an array
    if (!Array.isArray(team.members)) {
      team.members = [];
    }

    // Normalize each member
    team.members = team.members.map((m) => ({
      teamName: m.teamName || { en: "", vi: "" },
      teamDesgn: m.teamDesgn || { en: "", vi: "" },
      teamEmail: m.teamEmail || "",
      teamPhone: m.teamPhone || "",
    }));
  }
}

// ✅ Save
existing.contactTeam = contactTeam;


    const seoMeta = safeParse(data.contactSeoMeta, existing.seoMeta || {}); // 🔥 main fix

    // ✅ Handle Banner
    if (req.files?.contactBannerBgFile) {
      contactBanner.contactBannerBg = saveFile(req.files.contactBannerBgFile, "contact/banner");
    } else {
      contactBanner.contactBannerBg =
        contactBanner.contactBannerBg || existing.contactBanner?.contactBannerBg || "";
    }

    // ✅ Handle Form image
    if (req.files?.contactFormImgFile) {
      contactForm.contactFormImg = saveFile(req.files.contactFormImgFile, "contact/form");
    } else {
      contactForm.contactFormImg =
        contactForm.contactFormImg || existing.contactForm?.contactFormImg || "";
    }

    // ✅ Handle SEO OG image
    if (req.files?.contactSeoOgImageFile) {
      seoMeta.ogImage = saveFile(req.files.contactSeoOgImageFile, "contact/seo");
    } else if (seoMeta.ogImage === "") {
      seoMeta.ogImage = "";
    } else {
      seoMeta.ogImage = existing.seoMeta?.ogImage || "";
    }

    // ✅ Assign and save
    existing.contactBanner = contactBanner;
    existing.contactForm = contactForm;
    existing.contactLocation = contactLocation;
    existing.contactHours = contactHours;
    existing.contactMap = contactMap;
    existing.contactTeam = contactTeam; 
    existing.seoMeta = seoMeta;

    await existing.save();

    res.json({ message: "Contact Page updated successfully", contact: existing });
  } catch (err) {
    console.error("❌ updateContactPage error:", err);
    res.status(500).json({ error: err.message });
  }
}; 