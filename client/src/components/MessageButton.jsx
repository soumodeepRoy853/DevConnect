"use client";

import React from "react";
import Link from "next/link";

const MessageButton = ({ otherUserId }) => {
  const openConversation = () => {
    const path = otherUserId ? `/messages/${otherUserId}` : `/messages`;
    const url = `${window.location.origin}${path}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

    const href = otherUserId ? `/messages?u=${otherUserId}` : "/messages";

    return (
      <Link href={href} className={`px-3 py-1 ${otherUserId ? 'bg-primary-600 text-white' : 'bg-white text-primary-600'} rounded shadow hover:opacity-95`}>
        {otherUserId ? 'Message' : 'Messages'}
      </Link>
    );
};

export default MessageButton;
