import React, { useState } from "react";
import { useAuth } from "../context/authContext.jsx";
import axios from "axios";

const UploadAvatar = () => {
  const { auth } = useAuth();
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please choose a file first.");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/upload/avatar`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUrl(res.data.url);
      setMessage("Uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err.response?.data || err.message);
      setMessage("Upload failed.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4">
      <h2 className="text-xl font-bold mb-4">Upload Avatar</h2>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
        className="mb-4"
      />
      <button
        onClick={handleUpload}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Upload
      </button>

      {message && <p className="mt-3">{message}</p>}
      {url && (
        <img
          src={url}
          alt="Uploaded Avatar"
          className="mt-4 w-24 h-24 object-cover rounded-full border"
        />
      )}
    </div>
  );
};

export default UploadAvatar;
