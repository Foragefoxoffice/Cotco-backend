const mongoose = require("mongoose");

/* ---------- Sub Schemas ---------- */

// List items
const listItemSchema = new mongoose.Schema(
  {
    en: { type: String },
    vn: { type: String },
    icon: { type: String },
  },
  { _id: false }
);

// Blocks (cards)
const blockSchema = new mongoose.Schema(
  {
    title: { en: { type: String }, vn: { type: String } },
    description: { en: { type: String }, vn: { type: String } },
    image: { type: String },
    link: { type: String },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

// Table
const tableSchema = new mongoose.Schema(
  {
    header: { type: String },
    rows: [[String]],
  },
  { _id: false }
);

/* ---------- Section Schema ---------- */
const sectionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "text",
        "richtext",
        "imageLeft",
        "imageRight",
        "image",
        "table",
        "list",
        "blocks",
        "tabs",
        "banner",
        "features",
        "gallery",
        "specs",
        "faq",
        "custom",
      ],
    },
    title: { en: { type: String }, vn: { type: String } },
    description: { en: { type: String }, vn: { type: String } },
    image: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    richtext: { en: { type: String }, vn: { type: String } },

    // optional sub-structures
    table: { type: tableSchema, default: undefined },
    listItems: { type: [listItemSchema], default: undefined },
    blocks: { type: [blockSchema], default: undefined },
    tabs: {
      type: [
        new mongoose.Schema(
          {
            tabTitle: { en: { type: String }, vn: { type: String } },
            sections: { type: [Object], default: undefined }, // cleaned recursively
          },
          { _id: false }
        ),
      ],
      default: undefined,
    },
  },
  { _id: false }
);

module.exports = sectionSchema;
