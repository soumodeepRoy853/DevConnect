import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext.jsx";

const CreateProfile = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();

  const [formData, setFormData] = useState({
    bio: "",
    skills: "",
    github: "",
    linkedin: "",
    website: "",
    location: "",
    education: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

     try {
    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/profile/create`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
      }
    );

    // Success
    alert("Profile created successfully!");
    navigate("/"); // Redirect to dashboard
  } catch (err) {

    //Error Handling
    setError(err.response?.data?.message || "Failed to create profile. Try again.");
    // console.error("Profile creation error:", msg);
  }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-md shadow w-full max-w-xl"
      >
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Create Your Profile
        </h2>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <div className="grid gap-4">
          <textarea
            name="bio"
            rows="3"
            placeholder="A short bio about yourself"
            value={formData.bio}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
          <input
            type="text"
            name="skills"
            placeholder="Skills (comma-separated)"
            value={formData.skills}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={formData.location}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
          <input
            type="text"
            name="education"
            placeholder="Education"
            value={formData.education}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
          <input
            type="text"
            name="github"
            placeholder="GitHub URL"
            value={formData.github}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
          <input
            type="text"
            name="linkedin"
            placeholder="LinkedIn URL"
            value={formData.linkedin}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />
          <input
            type="text"
            name="website"
            placeholder="Personal Website"
            value={formData.website}
            onChange={handleChange}
            className="w-full border rounded p-2"
          />

          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateProfile;
