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
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Custom modules
const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");
const sanitizeInput = require("./middleware/sanitizeInput");

// Route files
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
const mainCategoryRoutes=require("./routes/mainCategoryRoutes");
const contactEntriesRoutes = require("./routes/contactEntriesRoutes");
const roleRoutes = require("./routes/roleRoutes");

// Connect to MongoDB
connectDB();

// Init express app
const app = express();

// Create HTTP server for WebSocket
const httpServer = http.createServer(app);

// Initialize Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:9002",
      "http://localhost:5174",
      "http://localhost:5173",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// ✅ FIXED express-fileupload config
app.use(
  fileUpload({
    createParentPath: true,
    useTempFiles: true,
    tempFileDir: "/tmp/",
    limits: {
      fileSize: 50 * 1024 * 1024, // 50MB per file
      files: 100, // allow up to 100 files in one request
      fields: 2000, // allow many JSON fields
    },
    abortOnLimit: false,
    preserveExtension: true,
    safeFileNames: true,
  })
);

// Attach io to app
app.set("io", io);

// Handle WebSocket connections
io.on("connection", (socket) => {
  console.log(`🟢 Socket connected: ${socket.id}`);
  socket.on("disconnect", () => {
    console.log(`🔴 Socket disconnected: ${socket.id}`);
  });
});

// ========== CORS Configuration ========== //
const allowedOrigins = [
  "http://localhost:9002",
  "http://localhost:5174",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Middleware
app.use(express.json({ limit: "2gb" }));
app.use(express.urlencoded({ extended: true, limit: "2gb" }));
app.use(cookieParser());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(sanitizeInput);

// ✅ Helmet fixed
app.use(
  helmet({
    crossOriginResourcePolicy: false,
    contentSecurityPolicy: false,
  })
);

app.use(hpp());

// Rate limiter
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 500,
  message: {
    success: false,
    error: "Too many requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// ✅ Static file serving
app.use(
  "/uploads",
  (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    next();
  },
  express.static(path.join(__dirname, "uploads"))
);

// API Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/sections", sectionRoutes);
app.use("/api/v1/pages", pageRoutes);
app.use("/api/v1/blogs", blogRoutes);
app.use("/api/v1/machines", machineRoutes);
app.use("/api/v1/homepage", homepageRoutes);
app.use("/api/v1/aboutpage", aboutRoutes);
app.use("/api/v1/cottonpage", cottonPageRoutes);
app.use("/api/v1/fiberpage", fiberRoutes);
app.use("/api/v1/contactpage", contactRoutes);
app.use("/api/v1/privacypage", privacyRoutes);
app.use("/api/v1/termspage", termsRoutes);
app.use("/api/v1/headerpage", headerRoutes);
app.use("/api/v1/footerpage", footerRoutes);
app.use("/api/v1/maincategories", mainCategoryRoutes);
app.use("/api/v1/contactentries", contactEntriesRoutes);
app.use("/api/v1/roles", roleRoutes);

app.post("/api/v1/chatbot", async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ success: false, error: "Missing question" });
    }

    const knowledge = fs.readFileSync("knowledge.txt", "utf8");

    const prompt = `
You are a chatbot for a cotton and fiber company.
Your ONLY source of truth is the following knowledge. 
If the question cannot be answered from the knowledge, say exactly: 
"I don't know, please check our website."

Knowledge:
${knowledge}

Now answer the question strictly from the knowledge above.

Question: ${question}
Answer:
    `;

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gemma:2b", prompt, stream: false }),
    });

    const data = await response.json();

    res.json({ success: true, answer: data.response });
  } catch (err) {
    console.error("❌ Chatbot error:", err);
    res.status(500).json({ success: false, error: err.message || "Chatbot failed" });
  }
});

// Global error handler
app.use(errorHandler);

// Server listen
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow
      .bold
  );
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error(`❌ Unhandled Rejection: ${err.message}`.red);
  httpServer.close(() => process.exit(1));
});
