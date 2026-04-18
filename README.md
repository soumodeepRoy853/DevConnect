# DevConnect

A full-stack social network for developers with profiles, posts, communities, and real-time messaging.

## Overview
DevConnect is a monorepo with a Next.js client and an Express + MongoDB API. It supports user auth, developer profiles, social feed, comments, reposts, saved posts, follows, communities, and private messaging with presence.

## Features
- Email/password and OAuth-style login
- JWT auth with protected API routes
- Developer profiles with skills and social links
- Social feed with visibility controls (public, followers, private)
- Post interactions: likes, comments, reposts, saved posts
- Follow/unfollow and follower insights
- Search users with pagination
- Community hubs with posts and chat
- Real-time private messaging and online presence
- Media uploads (avatars, post images)

## Tech Stack
- Client: Next.js 15, React 19, Tailwind CSS, Socket.IO client
- Server: Express 5, MongoDB (Mongoose), JWT, Socket.IO

## Monorepo Structure
- client/ - Next.js app
- server/ - Express API

## Getting Started

### Prerequisites
- Node.js 18+ (recommended)
- MongoDB connection string

### Install

Client:
```
cd client
npm install
```

Server:
```
cd server
npm install
```

### Environment Variables

Client (client/.env.local):
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Server (server/.env):
```
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/devconnect?retryWrites=true&w=majority
JWT_SECRET=replace_with_a_long_random_string
CLIENT_URL=http://localhost:3000
PORT=5000

# Optional: base URL for upload links when behind a proxy
PUBLIC_BASE_URL=http://localhost:5000
```

### Run Locally

Server:
```
cd server
npm run dev
```

Client:
```
cd client
npm run dev
```

The client runs on http://localhost:3000 and calls the API at http://localhost:5000/api.

## Frontend

### App Router and Layout
- App Router pages live in [client/src/app](client/src/app)
- Root layout is defined in [client/src/app/layout.jsx](client/src/app/layout.jsx) and wraps pages with providers from [client/src/app/providers.jsx](client/src/app/providers.jsx) and the top navigation in [client/src/components/Navbar.jsx](client/src/components/Navbar.jsx)
- Global styles are in [client/src/app/globals.css](client/src/app/globals.css)

### Route Map
- / - dashboard feed in [client/src/app/page.jsx](client/src/app/page.jsx)
- /feed - feed page in [client/src/app/feed](client/src/app/feed)
- /explore - discovery page in [client/src/app/explore](client/src/app/explore)
- /community - community hub in [client/src/app/community](client/src/app/community)
- /messages - inbox in [client/src/app/messages](client/src/app/messages)
- /messages/[id] - conversation view in [client/src/app/messages/[id]](client/src/app/messages/[id])
- /post/[postId] - single post in [client/src/app/post/[postId]](client/src/app/post/[postId])
- /profile - current user profile in [client/src/app/profile](client/src/app/profile)
- /profile/[id] - public profile view in [client/src/app/profile/[id]](client/src/app/profile/[id])
- /project/[id] - project details in [client/src/app/project/[id]](client/src/app/project/[id])
- /user/[id] - user view in [client/src/app/user/[id]](client/src/app/user/[id])
- /create-profile - profile creation in [client/src/app/create-profile](client/src/app/create-profile)
- /edit-profile - profile editing in [client/src/app/edit-profile](client/src/app/edit-profile)
- /upload-avatar - avatar upload in [client/src/app/upload-avatar](client/src/app/upload-avatar)
- /showcase - showcase page in [client/src/app/showcase](client/src/app/showcase)
- /settings - settings page in [client/src/app/settings](client/src/app/settings)
- /search - user search in [client/src/app/search](client/src/app/search)
- /login - login page in [client/src/app/login](client/src/app/login)
- /register - registration page in [client/src/app/register](client/src/app/register)
- Not found page in [client/src/app/not-found.jsx](client/src/app/not-found.jsx)

### State, Auth, and API
- Client API wrapper is in [client/src/services/api.js](client/src/services/api.js) and uses `NEXT_PUBLIC_API_URL` with an `Authorization: Bearer <token>` header
- Auth state lives in [client/src/context/authContext.jsx](client/src/context/authContext.jsx), stored in localStorage under `devconnect-auth`, and synced with NextAuth sessions
- Protected routes use `RequireAuth` in [client/src/components/RequireAuth.jsx](client/src/components/RequireAuth.jsx)

### Realtime and UI
- Socket.IO is initialized inside the auth context to handle `online_users`, `user_online`, `user_offline`, and `new_message` events
- Shared UI components are in [client/src/components](client/src/components), including feed cards, comments, chat widgets, follow controls, and navigation

## API Reference

Base URL: `/api`

### Authentication
All protected endpoints require:
```
Authorization: Bearer <JWT>
```

### Error Responses
Most errors return:
```
{ "message": "Human readable error" }
```

### Pagination
Endpoints supporting pagination accept query params:
- `page` (>= 1)
- `limit` (1..50)

Paginated responses include:
```
"pagination": {
  "page": 1,
  "limit": 10,
  "total": 42,
  "totalPages": 5,
  "hasNext": true,
  "hasPrev": false
}
```

---

## User and Auth

### POST /api/user/add-user
Register a new user.

Request body:
```
{ "name": "Ada Lovelace", "email": "ada@example.com", "password": "secret123" }
```

Response:
```
{
  "message": "User registered successfully",
  "user": { "id": "...", "name": "Ada Lovelace", "email": "ada@example.com", "avatar": "..." }
}
```

### POST /api/user/login-user
Login with email/password.

Request body:
```
{ "email": "ada@example.com", "password": "secret123" }
```

Response:
```
{
  "message": "Login successfully",
  "token": "<jwt>",
  "user": { "id": "...", "name": "Ada Lovelace", "email": "ada@example.com", "avatar": "..." }
}
```

### POST /api/user/oauth
OAuth-style login (email required).

Request body:
```
{ "name": "Ada Lovelace", "email": "ada@example.com", "avatar": "https://..." }
```

Response:
```
{ "message": "OAuth success", "token": "<jwt>", "user": { "id": "...", "name": "Ada Lovelace", "email": "ada@example.com", "avatar": "..." } }
```

### GET /api/user/all-users (auth)
Get the authenticated user.

Response:
```
{
  "message": "User fetched successfully",
  "user": {
    "_id": "...",
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "avatar": "...",
    "lastSeen": null,
    "followers": ["..."],
    "following": [{ "_id": "...", "name": "Grace", "email": "g@example.com", "avatar": "..." }],
    "savedPosts": ["..."],
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

### PUT /api/user/follow/:id (auth)
Follow a user (alternate follow endpoint).

Response:
```
{ "message": "Followed successfully." }
```

### PUT /api/user/change-password (auth)
Change password.

Request body:
```
{ "oldPassword": "secret123", "newPassword": "secret456" }
```

Response:
```
{ "message": "Password updated successfully" }
```

---

## Profiles

### POST /api/profile/create (auth)
Create or update profile.

Request body:
```
{
  "bio": "Full-stack dev",
  "skills": ["Node.js", "React"],
  "github": "ada",
  "linkedin": "ada",
  "website": "https://ada.dev",
  "location": "London",
  "education": "BSc Computer Science",
  "avatar": "https://..."
}
```

Response:
```
{ "message": "Profile saved successfully", "profile": { "_id": "...", "user": "...", "bio": "...", "skills": ["..."], "github": "...", "linkedin": "...", "website": "...", "location": "...", "education": "...", "avatar": "..." } }
```

### GET /api/profile/my (auth)
Get your profile.

Response:
```
{ "profile": { "_id": "...", "user": { "_id": "...", "name": "Ada", "email": "ada@example.com", "avatar": "...", "lastSeen": null }, "bio": "...", "skills": ["..."], "github": "...", "linkedin": "...", "website": "...", "location": "...", "education": "...", "avatar": "..." } }
```

### GET /api/profile/all-profiles
Get all profiles.

Response:
```
{ "profiles": [ { "_id": "...", "user": { "_id": "...", "name": "Ada", "email": "ada@example.com", "avatar": "...", "lastSeen": null, "followers": [ { "_id": "...", "name": "Grace", "avatar": "..." } ] }, "bio": "...", "skills": ["..."], "github": "...", "linkedin": "...", "website": "...", "location": "...", "education": "...", "avatar": "..." } ] }
```

### GET /api/profile/user/:id
Get profile by user id.

Response:
```
{ "profile": { "_id": "...", "user": { "_id": "...", "name": "Ada", "email": "ada@example.com", "avatar": "...", "lastSeen": null }, "bio": "...", "skills": ["..."], "github": "...", "linkedin": "...", "website": "...", "location": "...", "education": "...", "avatar": "..." } }
```

### DELETE /api/profile/delete-profiles (auth)
Delete user and profile.

Response:
```
{ "message": "User and profile deleted" }
```

---

## Posts

### POST /api/post (auth)
Create a post.

Request body:
```
{ "text": "Hello world", "image": "https://...", "visibility": "public" }
```

Response:
```
{ "post": { "_id": "...", "user": { "_id": "...", "name": "Ada", "avatar": "..." }, "text": "Hello world", "image": "https://...", "visibility": "public", "likes": [], "comments": [], "repostOf": null, "createdAt": "...", "updatedAt": "..." } }
```

Notes:
- `text` or `image` is required.
- Use the upload endpoints to get `image` URLs.

### GET /api/post/feed (auth)
Get feed posts (supports pagination).

Response:
```
{
  "posts": [
    {
      "_id": "...",
      "user": { "_id": "...", "name": "Ada", "avatar": "..." },
      "text": "Hello world",
      "image": "...",
      "visibility": "public",
      "likes": ["..."],
      "comments": [ { "text": "Nice", "user": { "_id": "...", "name": "Grace", "avatar": "..." }, "createdAt": "..." } ],
      "repostOf": null,
      "repostCount": 2,
      "isRepostedByViewer": false,
      "isSavedByViewer": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 42, "totalPages": 5, "hasNext": true, "hasPrev": false }
}
```

### GET /api/post/saved (auth)
Get saved posts.

Response:
```
{ "posts": [ { "_id": "...", "text": "...", "isSavedByViewer": true } ] }
```

### GET /api/post/user/:userId (auth)
Get posts for a user (supports pagination).

Response: same shape as feed.

### PUT /api/post/save/:postId (auth)
Toggle save on a post.

Response:
```
{ "saved": true }
```

### PUT /api/post/like/:postId (auth)
Toggle like on a post.

Response:
```
{ "message": "Liked", "post": { "_id": "...", "likes": ["..."] } }
```

### PUT /api/post/:postId (auth)
Update a post.

Request body:
```
{ "text": "Updated", "visibility": "followers", "removeImage": false }
```

Response:
```
{ "post": { "_id": "...", "text": "Updated", "visibility": "followers" } }
```

### POST /api/post/repost/:postId (auth)
Repost a public post.

Response:
```
{ "post": { "_id": "...", "repostOf": "..." } }
```

### POST /api/post/unrepost/:postId (auth)
Remove a repost.

Response:
```
{ "repostId": "..." }
```

### POST /api/post/comment/:postId (auth)
Add a comment.

Request body:
```
{ "text": "Nice post" }
```

Response:
```
{ "message": "Comment added successfully", "comments": [ { "text": "Nice post", "user": "...", "createdAt": "..." } ] }
```

### DELETE /api/post/:postId (auth)
Delete a post.

Response:
```
{ "message": "Post deleted" }
```

---

## Follow

### PUT /api/follow/follow-user/:id (auth)
Follow a user.

Response:
```
{ "message": "Followed successfully." }
```

### PUT /api/follow/unfollow/:id (auth)
Unfollow a user.

Response:
```
{ "message": "Unfollowed successfully." }
```

### GET /api/follow/:id/follow-data (auth)
Get follow data for a user.

Response:
```
{ "followers": [ { "_id": "...", "name": "Grace", "email": "g@example.com", "avatar": "...", "lastSeen": "..." } ], "following": [ { "_id": "...", "name": "Ada", "email": "a@example.com", "avatar": "...", "lastSeen": null } ] }
```

---

## Messaging

### POST /api/message (auth)
Send a direct message (must be following or follower).

Request body:
```
{ "recipient": "<userId>", "text": "Hey" }
```

Response:
```
{ "_id": "...", "sender": "...", "recipient": "...", "text": "Hey", "read": false, "deliveredAt": null, "readAt": null, "createdAt": "...", "updatedAt": "..." }
```

### GET /api/message/conversations (auth)
List conversations with unread counts.

Response:
```
[
  {
    "user": { "_id": "...", "name": "Grace", "email": "g@example.com", "avatar": "..." },
    "lastMessage": { "text": "Hey", "sender": "...", "recipient": "...", "createdAt": "..." },
    "unreadCount": 2
  }
]
```

### GET /api/message/:id (auth)
Get full conversation with a user and mark unread as read.

Response:
```
[ { "_id": "...", "sender": "...", "recipient": "...", "text": "Hey", "read": true, "createdAt": "..." } ]
```

### DELETE /api/message/conversation/:id (auth)
Delete a conversation.

Response:
```
{ "message": "Conversation deleted" }
```

---

## Communities

### GET /api/community (auth)
List communities (auto-seeds defaults and about-based community).

Response:
```
{ "communities": [ { "_id": "...", "name": "Backend Development", "slug": "backend-development", "description": "...", "visibility": "public", "memberCount": 120, "isMember": false } ] }
```

### POST /api/community (auth)
Create a community (same as /create).

Request body:
```
{ "name": "Cloud Builders", "description": "AWS and GCP", "visibility": "public" }
```

Response:
```
{ "community": { "_id": "...", "name": "Cloud Builders", "slug": "cloud-builders", "description": "...", "visibility": "public", "memberCount": 1, "isMember": true } }
```

### POST /api/community/create (auth)
Create a community (alias).

### GET /api/community/slug/:slug (auth)
Fetch a community by slug.

Response:
```
{ "community": { "_id": "...", "name": "Backend Development", "slug": "backend-development", "description": "...", "visibility": "public", "memberCount": 120, "isMember": true } }
```

### POST /api/community/:id/join (auth)
Join a community.

Response:
```
{ "joined": true }
```

### POST /api/community/:id/leave (auth)
Leave a community.

Response:
```
{ "joined": false }
```

### GET /api/community/:id/posts (auth)
List community posts.

Response:
```
{ "posts": [ { "_id": "...", "community": "...", "user": { "_id": "...", "name": "Ada", "avatar": "..." }, "type": "chat", "text": "Hello", "link": "", "code": "", "image": "", "job": { "title": "", "company": "", "location": "" }, "createdAt": "..." } ] }
```

### POST /api/community/:id/posts (auth)
Create a community post.

Request body:
```
{ "type": "job", "text": "Hiring", "job": { "title": "Backend Engineer", "company": "Acme", "location": "Remote" } }
```

Response:
```
{ "post": { "_id": "...", "community": "...", "user": { "_id": "...", "name": "Ada", "avatar": "..." }, "type": "job", "text": "Hiring", "job": { "title": "Backend Engineer", "company": "Acme", "location": "Remote" } } }
```

### GET /api/community/:id/messages (auth)
List community chat messages.

Response:
```
{ "messages": [ { "_id": "...", "community": "...", "user": { "_id": "...", "name": "Ada", "avatar": "..." }, "text": "Hello", "createdAt": "..." } ] }
```

### POST /api/community/:id/messages (auth)
Create a community chat message.

Request body:
```
{ "text": "Hello" }
```

Response:
```
{ "message": { "_id": "...", "community": "...", "user": { "_id": "...", "name": "Ada", "avatar": "..." }, "text": "Hello" } }
```

---

## Search

### GET /api/search?query=<text>
Search users by name (supports pagination).

Response:
```
{ "users": [ { "_id": "...", "name": "Ada", "email": "ada@example.com", "avatar": "..." } ], "pagination": { "page": 1, "limit": 10, "total": 1, "totalPages": 1, "hasNext": false, "hasPrev": false } }
```

---

## Uploads

### POST /api/upload/post
Upload a post image (multipart form-data).

Form field:
- `image` (file)

Response:
```
{ "url": "https://your-host/uploads/posts/123.png" }
```

### POST /api/upload/avatar
Upload an avatar image (multipart form-data).

Form field:
- `avatar` (file)

Response:
```
{ "url": "https://your-host/uploads/avatar/123.png" }
```

Uploaded files are served from `/uploads`.

---

## Realtime (Socket.IO)

Socket connection requires JWT in auth:
```
const socket = io("http://localhost:5000", { auth: { token: "<jwt>" } });
```

Events:
- `online_users` (server -> client): `["<userId>"]`
- `user_online` (server -> client): `"<userId>"`
- `user_offline` (server -> client): `{ id: "<userId>", lastSeen: "..." }`
- `private_message` (client -> server): `{ to: "<userId>", text: "Hi" }`
- `new_message` (server -> client): message object
- `error_message` (server -> client): `{ message: "Not allowed to message this user" }`

---

## Deployment
See DEPLOY.md for Vercel and server hosting notes.
