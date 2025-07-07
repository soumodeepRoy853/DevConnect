import React, { useState } from "react";
import { useAuth } from "../context/authContext.jsx";

const Settings = () => {
  const { auth } = useAuth();
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [msg, setMsg] = useState("");

  const handleChangePass = (e) => {
    e.preventDefault();
    // You need to build API route for password change in backend
    setMsg("This feature is under development.");
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-4">
      <h2 className="text-xl font-bold mb-4">Change Password</h2>
      <form onSubmit={handleChangePass} className="space-y-4">
        <input
          type="password"
          placeholder="Old Password"
          value={oldPass}
          onChange={(e) => setOldPass(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="password"
          placeholder="New Password"
          value={newPass}
          onChange={(e) => setNewPass(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Change Password
        </button>
        {msg && <p className="text-sm text-gray-600">{msg}</p>}
      </form>
    </div>
  );
};

export default Settings;
