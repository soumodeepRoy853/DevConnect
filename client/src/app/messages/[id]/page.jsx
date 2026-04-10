"use client";

import React from "react";
import { useParams } from "next/navigation";

import Chat from "../../../components/Chat";
import RequireAuth from "../../../components/RequireAuth";

const ConversationPage = () => {
  const { id } = useParams();

  if (!id) return <div className="p-4">No conversation selected.</div>;

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-xl font-semibold mb-4">Conversation</h2>
        <Chat otherUserId={id} full />
      </div>
    </div>
  );
};

const Page = () => (
  <RequireAuth>
    <ConversationPage />
  </RequireAuth>
);

export default Page;
