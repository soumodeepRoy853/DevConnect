"use client";

import React from "react";

const Loader = ({ label = "Loading", size = 28, className = "" }) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div
        className="rounded-full border-2 border-primary-100 border-t-primary-600 animate-spin"
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
      {label ? (
        <div className="text-[10px] font-semibold tracking-[0.3em] uppercase text-gray-400">
          {label}
        </div>
      ) : null}
    </div>
  );
};

export default Loader;
