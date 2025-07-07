import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/authContext";

const CommentSection = ({ postId, comments }) => {
  const { auth } = useAuth();
  const [text, setText] = useState("");
  const [allComments, setAllComments] = useState(comments);

  const handleAddComment = async () => {
    if (!text.trim()) return;
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/post/comment/${postId}`,
        { text },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );
      setAllComments(res.data.comments);
      setText("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-4">
      <h3 className="font-semibold mb-2">Comments</h3>
      {allComments.map((c, i) => (
        <div key={i} className="mb-2 border-b pb-1">
          <span className="font-semibold">{c.user.name || "User"}:</span>{" "}
          <span>{c.text}</span>
        </div>
      ))}
      <div className="mt-3 flex gap-2">
        <input
          className="border p-2 rounded w-full"
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button onClick={handleAddComment} className="bg-blue-500 text-white px-4 rounded">
          Post
        </button>
      </div>
    </div>
  );
};

export default CommentSection;
