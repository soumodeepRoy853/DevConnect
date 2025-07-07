import React from "react";
import { Routes, Route, Router } from "react-router-dom";
import { useAuth } from "./context/authContext.jsx";
import PrivateRoute from "./routes/PrivateRoute.jsx";

// Pages
// import NotFound from "./pages/NotFound"; // Optional 404 fallback

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import CreateProfile from "./pages/CreateProfile.jsx";
import MyProfile from "./pages/MyProfile.jsx";
import AllProfiles from "./pages/AllProfiles.jsx";
import ViewProfile from "./pages/ViewProfile.jsx";
import EditProfile from "./pages/EditProfile.jsx";
import Navbar from "./components/Navbar.jsx";
import Search from "./pages/Search.jsx";
import Feed from "./pages/Feed.jsx";
import Settings from "./pages/Setting.jsx";
import UploadAvatar from "./pages/UploadAvatar.jsx";
import PostPage from "./pages/PostPage.jsx";
import ProfileView from "./pages/ViewProfile.jsx";
// import ProfilePage from "./pages/ProfilePage.jsx";

const App = () => {
  return (
   <>
      <Navbar/>
      <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/search" element={<Search />} />


      {/* Protected Routes */}
      <Route element={<PrivateRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/create-profile" element={<CreateProfile />} />
        <Route path="/profile" element={<MyProfile/>}/>
        <Route path="/explore" element={<AllProfiles />} />
        <Route path="/user/:id" element={<ViewProfile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/" element={<Feed />} />
        <Route path="/upload-avatar" element={<UploadAvatar />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/post/:postId" element={<PostPage />} />
        <Route path="/profile/:id" element={<ProfileView />} />


      </Route>

      {/* 404 Fallback */}
      {/* <Route path="*" element={<NotFound />} /> */}
    </Routes>
    </>
    
    
  );
};

export default App;
