const mongoose = require("mongoose");

/* ---------- Sub Schemas ---------- */

// List items
const listItemSchema = new mongoose.Schema(
  {
    en: { type: String },
    vi: { type: String },
    icon: { type: String },
  },
  { _id: false }
);

// Blocks (cards)
const blockSchema = new mongoose.Schema(
  {
    title: { en: { type: String }, vi: { type: String } },
    description: { en: { type: String }, vi: { type: String } },
    image: { type: String },
    link: { type: String },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

// Table cell with translations
const tableCellSchema = new mongoose.Schema(
  {
    en: { type: String },
    vi: { type: String },
  },
  { _id: false }
);

// Table schema
const tableSchema = new mongoose.Schema(
  {
    header: {
      en: { type: String },
      vi: { type: String },
    },
    rows: [[tableCellSchema]], // array of array of translated cells
  },
  { _id: false }
);

// ✅ NEW: Button schema
const buttonSchema = new mongoose.Schema(
  {
    name: {
      en: { type: String },
      vi: { type: String },
    },
    link: { type: String },
    align: {
      type: String,
      enum: ["left", "center", "right"],
      default: "center",
    },
    variant: {
      type: String,
      enum: ["primary", "outline"],
      default: "primary",
    },
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
        "button", // ✅ added button type
      ],
    },
    title: { en: { type: String }, vi: { type: String } },
    description: { en: { type: String }, vi: { type: String } },
    image: { type: String },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    richtext: { en: { type: String }, vi: { type: String } },

    // optional sub-structures
    table: { type: tableSchema, default: undefined },
    listItems: { type: [listItemSchema], default: undefined },
    blocks: { type: [blockSchema], default: undefined },
    button: { type: buttonSchema, default: undefined }, // ✅ added button
    tabs: {
      type: [
        new mongoose.Schema(
          {
            tabTitle: { en: { type: String }, vi: { type: String } },
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
