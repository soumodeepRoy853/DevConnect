import mongoose from "mongoose";

const communitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: "" },
    visibility: { type: String, enum: ["public", "private"], default: "public" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isAboutBased: { type: Boolean, default: false },
    aboutOwner: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

communitySchema.index({ slug: 1 });

const Community = mongoose.models.Community || mongoose.model("Community", communitySchema);

export default Community;
