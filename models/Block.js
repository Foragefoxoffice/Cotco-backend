const mongoose = require("mongoose");

// 🔹 Block schema with advanced block types
const blockSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "text",       // plain text
        "richtext",   // HTML or WYSIWYG
        "image",      // single image
        "gallery",    // multiple images
        "list",       // bullet or numbered list
        "table",      // tabular data
        "quote",      // blockquote
        "video",      // video embed
        "embed",      // iframe / social embed
        "code",       // code snippet
        "cta"         // call-to-action button
      ],
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    position: { type: Number, default: 0 },
  },
  { _id: false }
);

module.exports = blockSchema;

/**
 Example content formats:
 - text: { en: "Simple text", vn: "Văn bản" }
 - richtext: { en: "<p>Rich HTML</p>", vn: "<p>HTML phong phú</p>" }
 - image: { url: "/uploads/img.jpg", alt: "Alt text" }
 - gallery: [{ url: "...", alt: "..." }]
 - list: { items: ["Item 1", "Item 2"] }
 - table: { headers: ["Col1","Col2"], rows: [["A","B"],["C","D"]] }
 - quote: { text: "Quote", author: "Author" }
 - video: { url: "https://youtube.com/embed/xyz", title: "Video Title" }
 - embed: { provider: "twitter", embedCode: "<blockquote>...</blockquote>" }
 - code: { language: "javascript", code: "console.log('hi');" }
 - cta: { text: "Buy Now", url: "/shop" }
*/
