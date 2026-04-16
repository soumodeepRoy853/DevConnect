"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import api from "../../services/api";
import Loader from "../../components/Loader";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortKey, setSortKey] = useState("name-asc");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await api.get("/search", {
        params: { query },
      });

      setResults(res.data.users || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const sortedResults = useMemo(() => {
    const list = results.slice();
    if (sortKey === "name-asc") {
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }
    if (sortKey === "name-desc") {
      list.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
    }
    return list;
  }, [results, sortKey]);

  return (
    <div className="max-w-xl mx-auto mt-10 p-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          placeholder="Search users by name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full border rounded px-3 py-2"
        />
        <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded">
          Search
        </button>
      </form>

      <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
        <span>Sort:</span>
        <button
          type="button"
          onClick={() => setSortKey((prev) => (prev === "name-asc" ? "name-desc" : "name-asc"))}
          className="px-3 py-1 rounded-full bg-gray-100 hover:bg-gray-200"
        >
          {sortKey === "name-asc" ? "Name A-Z" : "Name Z-A"}
        </button>
      </div>

      <div className="mt-6">
        {loading && (
          <div className="py-6">
            <Loader label="Searching" />
          </div>
        )}
        {!loading && sortedResults.length > 0 && (
          <ul>
            {sortedResults.map((user) => (
              <li key={user._id} className="py-2 border-b">
                <p>{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <Link
                  href={`/user/${user._id}`}
                  className="text-primary-600 hover:underline text-sm"
                >
                  View Profile
                </Link>
              </li>
            ))}
          </ul>
        )}
        {!loading && results.length === 0 && query && <p>No users found.</p>}
      </div>
    </div>
  );
};

export default SearchPage;
