require("dotenv").config();
const express = require("express");
const http = require("http");
const fileUpload = require("express-fileupload");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const colors = require("colors");
const { Server } = require("socket.io");
const fs = require("fs");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

// Custom modules
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");
const sanitizeInput = require("./middleware/sanitizeInput");

// ===== Route files =====
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const categoryRoutes = require("./routes/categoryRoutes");
const sectionRoutes = require("./routes/sectionRoutes");
const pageRoutes = require("./routes/pageRoutes");
const blogRoutes = require("./routes/blogRoutes");
const machineRoutes = require("./routes/machineRoutes");
const homepageRoutes = require("./routes/homepageRoutes");
const aboutRoutes = require("./routes/aboutRoutes");
const cottonPageRoutes = require("./routes/cottonRoutes");
const fiberRoutes = require("./routes/fiberRoutes");
const contactRoutes = require("./routes/contactRoutes");
const privacyRoutes = require("./routes/privacyRoutes");
const termsRoutes = require("./routes/termsRoutes");
const headerRoutes = require("./routes/headerRoutes");
const footerRoutes = require("./routes/footerRoutes");
const mainCategoryRoutes = require("./routes/mainCategoryRoutes");
const contactEntriesRoutes = require("./routes/contactEntriesRoutes");
const roleRoutes = require("./routes/roleRoutes");
const machineCMSRoutes = require("./routes/machineCMSRoutes");
const knowledgeRoutes = require("./routes/knowledgeRoutes");


// ===== Connect to MongoDB =====
connectDB();

// ===== Initialize app =====
const app = express();
const httpServer = http.createServer(app);

app.set("trust proxy", 1);

// ===== Socket.IO =====
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:9002",
      "http://localhost:5174",
      "http://localhost:5173",
      "https://cotco-vn.com"
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log(`🟢 Socket connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`🔴 Socket disconnected: ${socket.id}`);
  });
});

// ===== Parse JSON before file upload =====
app.use(express.json({ limit: "2gb" }));
app.use(express.urlencoded({ extended: true, limit: "2gb" }));

// ===== File Upload =====
app.use(
  fileUpload({
    createParentPath: true,
    useTempFiles: false,
    tempFileDir: "/tmp/",
    limits: { fileSize: 50 * 1024 * 1024, files: 100, fields: 2000 },
    abortOnLimit: false,
    preserveExtension: true,
    safeFileNames: true,
  })
);

// ===== CORS =====
const allowedOrigins = [
  "http://localhost:9002",
  "http://localhost:5174",
  "http://localhost:5173",
  "https://cotco-vn.com"
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ===== Middlewares =====
app.use(express.json({ limit: "2gb" }));
app.use(express.urlencoded({ extended: true, limit: "2gb" }));
app.use(cookieParser());
app.use(sanitizeInput);

if (process.env.NODE_ENV === "development") app.use(morgan("dev"));

app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
  })
);

app.use(hpp());

// ===== Rate Limiter =====
app.use(
  rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 500,
    message: {
      success: false,
      error: "Too many requests, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ===== Static Files =====
app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "uploads"))
);

// ===== Helper: Safe Route Loader =====
function safeUse(routePath, router) {
  if (typeof router !== "function") {
    console.error(`❌ Invalid route handler at: ${routePath}`);
    return;
  }
  app.use(routePath, router);
}

// ===== Register Routes Safely =====
safeUse("/api/v1/auth", authRoutes);
safeUse("/api/v1/users", userRoutes);
safeUse("/api/v1/categories", categoryRoutes);
safeUse("/api/v1/sections", sectionRoutes);
safeUse("/api/v1/pages", pageRoutes);
safeUse("/api/v1/blogs", blogRoutes);
safeUse("/api/v1/machines", machineRoutes);
safeUse("/api/v1/homepage", homepageRoutes);
safeUse("/api/v1/aboutpage", aboutRoutes);
safeUse("/api/v1/cottonpage", cottonPageRoutes);
safeUse("/api/v1/fiberpage", fiberRoutes);
safeUse("/api/v1/contactpage", contactRoutes);
safeUse("/api/v1/privacypage", privacyRoutes);
safeUse("/api/v1/termspage", termsRoutes);
safeUse("/api/v1/headerpage", headerRoutes);
safeUse("/api/v1/footerpage", footerRoutes);
safeUse("/api/v1/maincategories", mainCategoryRoutes);
safeUse("/api/v1/contactentries", contactEntriesRoutes);
safeUse("/api/v1/roles", roleRoutes);
safeUse("/api/v1/machinescms", machineCMSRoutes);
safeUse("/api/v1/knowledge", knowledgeRoutes);

// ===== Chatbot Endpoint =====
// ===== Chatbot Endpoint (Multi-language + Cached) =====

// Cache for both EN and VI
let knowledgeCache = { en: "", vi: "" };

// Initialize cache on startup
(() => {
  const dataDir = path.join(__dirname, "data"); // ✅ Fixed path (inside same root)
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const filePaths = {
    en: path.join(dataDir, "knowledge_en.txt"),
    vi: path.join(dataDir, "knowledge_vi.txt"),
  };

  for (const lang of ["en", "vi"]) {
    try {
      if (fs.existsSync(filePaths[lang])) {
        knowledgeCache[lang] = fs.readFileSync(filePaths[lang], "utf8");
        console.log(`✅ Loaded chatbot knowledge (${lang.toUpperCase()})`);
      } else {
        console.log(`⚠️ No knowledge file found for ${lang}, starting empty`);
        knowledgeCache[lang] = "";
      }
    } catch (err) {
      console.error(`❌ Error reading ${lang} file:`, err.message);
      knowledgeCache[lang] = "";
    }
  }
})();

// ===== Chatbot Route =====
app.post("/api/v1/chatbot", async (req, res) => {
  try {
    const { question } = req.body;
    const lang = req.query.lang || "en";

    if (!question || typeof question !== "string") {
      return res.status(400).json({
        success: false,
        error: "Missing or invalid question.",
      });
    }

    // 🧾 Load knowledge from cache or disk
    const dataDir = path.join(__dirname, "data");
    const filePath = path.join(dataDir, `knowledge_${lang}.txt`);

    let knowledge =
      knowledgeCache[lang] ||
      (fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "");

    // Refresh cache if missing
    knowledgeCache[lang] = knowledge;

    // 🧠 Prompt
    const prompt = `
You are a professional, friendly AI assistant for COTCO — a company that sells cotton and fiber machines.

Your ONLY source of truth is the knowledge provided below.
Always answer questions using the information from the knowledge.
When relevant, include helpful page links provided in the knowledge.

If you cannot find an answer, respond politely with:
"I’m not sure about that, but please check our website for more details: https://cotco-vn.com"

Knowledge:
${knowledge}

User Question: ${question}

Now think carefully and provide a helpful, natural answer based on the knowledge.
Include page links if relevant.
If no answer can be found, use the fallback message above.
Answer:
`;

    // 🔄 Request to local Ollama model
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gemma:2b", // or llama3
        prompt,
        stream: false,
        temperature: 0.3,
      }),
    });

    const data = await response.json();

    // 🧹 Clean AI response
    const cleanAnswer = (data.response || "")
      .replace(/^(Answer:|Response:)\s*/i, "")
      .trim();

    res.json({
      success: true,
      answer:
        cleanAnswer ||
        "I’m not sure about that, but please check our website for more details: https://cotco-vn.com",
    });
  } catch (err) {
    console.error("❌ Chatbot error:", err);
    res.status(500).json({
      success: false,
      error: "Chatbot service failed. Please try again later.",
    });
  }
});

// ===== Global Error Handler =====
app.use(errorHandler);

// ===== Start Server =====
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow
      .bold
  );
});

// ===== Handle Unhandled Promise Rejections =====
process.on("unhandledRejection", (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`.red);
  httpServer.close(() => process.exit(1));
});
