import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/authContext.jsx";
import FollowInfo from "../components/FollowInfo.jsx";

const MyProfile = () => {
  const { auth } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [posts, setPosts] = useState([]);


  const fetchProfile = async () => {
    try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/profile/my`, {
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    });

    setProfile(res.data.profile);
  } catch (err) {
    // setError(err.response?.data?.message || "Failed to fetch profile.");
  } finally {
    setLoading(false);
  }
};

const fetchUserPosts = async () => {
  if (!auth?.user?.id || !auth?.token) return;

  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/post/user/${auth.user.id}`,
      {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      }
    );
    setPosts(res.data.posts || []);
  } catch (err) {
    // console.error("Failed to fetch user's posts:", err.response?.data || err);
  }
};


  useEffect(() => {
    fetchProfile();
    fetchUserPosts();
  }, []);

  if (loading) return <div className="text-center mt-20">Loading...</div>;

  if (error)
    return (
      <div className="text-center mt-20 text-red-500 text-lg">{error}</div>
    );

  if (!profile)
    return (
      <div className="text-center mt-20 text-gray-600">
        No profile found. Please create one.
      </div>
    );

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-50 px-4 py-10">
      <div className="bg-white shadow-md rounded-lg p-6 max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-4 text-center">
          My Profile
        </h2>

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src={profile.avatar}
            alt="Avatar"
            className="w-28 h-28 rounded-full border shadow"
          />

          <div className="max-w-2xl mx-auto p-4 bg-white rounded shadow">
    <h1 className="text-xl font-bold mb-2">{profile.user.name}</h1>
    <p className="text-gray-600">{profile.bio}</p>

    {/*Follower/Following counts */}
    <FollowInfo userId={profile.user._id} />
</div>

          <div className="flex-1 space-y-2">
            <p><strong>Name:</strong> {profile.user.name}</p>
            <p><strong>Email:</strong> {profile.user.email}</p>
            {profile.bio && <p><strong>Bio:</strong> {profile.bio}</p>}
            {profile.location && <p><strong>Location:</strong> {profile.location}</p>}
            {profile.education && <p><strong>Education:</strong> {profile.education}</p>}

            {profile.skills?.length > 0 && (
              <p>
                <strong>Skills:</strong>{" "}
                {profile.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-block bg-blue-100 text-blue-700 px-2 py-1 text-sm rounded mr-2 mt-1"
                  >
                    {skill}
                  </span>
                ))}
              </p>
            )}

            <div className="mt-4 flex gap-4 flex-wrap">
              {profile.github && (
                <a
                  href={profile.github}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  GitHub
                </a>
              )}
              {profile.linkedin && (
                <a
                  href={profile.linkedin}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  LinkedIn
                </a>
              )}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  className="text-blue-600 underline"
                >
                  Website
                </a>
              )}
            </div>
          </div>
          
        </div>
        {posts.length > 0 ? (
  <div className="mt-10 bg-white p-4 rounded shadow">
    <h3 className="text-lg font-semibold mb-4">My Posts</h3>
    <div className="space-y-4">
      {posts.map((post) => (
        <div
          key={post._id}
          className="border p-4 rounded shadow-sm bg-gray-50"
        >
          <p className="mb-2">{post.text}</p>
          {post.image && (
            <img
              src={post.image}
              alt="Post"
              className="rounded max-h-60 object-cover"
            />
          )}
          <div className="text-xs text-gray-500 mt-2">
            {post.likes?.length || 0} Likes • {post.comments?.length || 0} Comments
          </div>
        </div>
      ))}
    </div>
  </div>
) : (
  <div className="mt-10 text-center text-gray-500">You haven't posted anything yet.</div>
)}

      </div>
    </div>
  );
};

export default MyProfile;
