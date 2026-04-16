import mongoose from "mongoose";

const communityPostSchema = new mongoose.Schema(
  {
    community: { type: mongoose.Schema.Types.ObjectId, ref: "Community", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["chat", "job", "snippet", "photo", "link"],
      default: "chat",
    },
    text: { type: String, default: "" },
    link: { type: String, default: "" },
    code: { type: String, default: "" },
    image: { type: String, default: "" },
    job: {
      title: { type: String, default: "" },
      company: { type: String, default: "" },
      location: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

communityPostSchema.index({ community: 1, createdAt: -1 });

const CommunityPost = mongoose.models.CommunityPost || mongoose.model("CommunityPost", communityPostSchema);

export default CommunityPost;
