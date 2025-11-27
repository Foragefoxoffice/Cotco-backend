const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

const dataDir = path.resolve(__dirname, "..", "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log("📁 Created /data directory:", dataDir);
}

const filePaths = {
  en: path.join(dataDir, "knowledge_en.txt"),
  vi: path.join(dataDir, "knowledge_vi.txt"),
};

let knowledgeCache = { en: "", vi: "" };

// ===== GET =====
router.get("/", (req, res) => {
  const lang = req.query.lang || "en";
  const filePath = filePaths[lang];
  console.log(`📖 GET /knowledge?lang=${lang} → ${filePath}`);

  try {
    if (!fs.existsSync(filePath)) {
      console.log("⚠️ File missing → returning empty content");
      return res.json({ success: true, content: "" });
    }
    const content = fs.readFileSync(filePath, "utf8");
    knowledgeCache[lang] = content;
    res.json({ success: true, content });
  } catch (err) {
    console.error("❌ Read error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===== POST =====
router.post("/", (req, res) => {
  console.log("📩 POST /api/v1/knowledge hit!");
  console.log("Body received:", req.body);

  const { lang, content } = req.body;
  if (!lang || !content) {
    return res.status(400).json({ success: false, error: "Missing lang or content" });
  }

  const filePath = filePaths[lang];
  try {
    fs.writeFileSync(filePath, content, "utf8");
    knowledgeCache[lang] = content;
    console.log(`💾 Saved knowledge (${lang}) → ${filePath}`);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ Write error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
