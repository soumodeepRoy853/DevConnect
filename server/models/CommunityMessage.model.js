import mongoose from "mongoose";

const communityMessageSchema = new mongoose.Schema(
  {
    community: { type: mongoose.Schema.Types.ObjectId, ref: "Community", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
  },
  { timestamps: true }
);

communityMessageSchema.index({ community: 1, createdAt: -1 });

const CommunityMessage = mongoose.models.CommunityMessage || mongoose.model("CommunityMessage", communityMessageSchema);

export default CommunityMessage;
