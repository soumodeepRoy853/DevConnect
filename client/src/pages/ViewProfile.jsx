import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const ProfileView = () => {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");

  const fetchProfile = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/profile/user/${id}`
      );
      setProfile(res.data.profile);
    } catch (err) {
      setError("Profile not found.");
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]);

  if (error) return <div className="text-center mt-20 text-red-600">{error}</div>;
  if (!profile) return <div className="text-center mt-20">Loading profile...</div>;

  return (
    <div className="min-h-screen bg-gray-100 px-4 py-10 text-center">
      <img
        src={profile.avatar || "/default-avatar.png"}
        alt="avatar"
        className="w-28 h-28 rounded-full mx-auto mb-4 border"
      />
      <h2 className="text-xl font-bold">{profile.user.name}</h2>
      <p className="text-gray-600">{profile.user.email}</p>
      <p className="mt-4 italic text-gray-800">{profile.bio}</p>
      <div className="mt-4 flex justify-center flex-wrap gap-2">
        {profile.skills.map((skill, idx) => (
          <span key={idx} className="bg-indigo-100 text-indigo-700 px-2 py-1 text-sm rounded">
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
};

export default ProfileView;
