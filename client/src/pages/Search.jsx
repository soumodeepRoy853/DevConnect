import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Search = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
   try {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/search`, {
      params: { query },
    });

    setResults(res.data.users || []);
  } catch (err) {
    console.error("Search error:", err.response?.data?.message || err.message);
  } finally {
    setLoading(false);
  }
};

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
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Search
        </button>
      </form>

      <div className="mt-6">
        {loading && <p>Searching...</p>}
        {!loading && results.length > 0 && (
          <ul>
            {results.map((user) => (
              <li key={user._id} className="py-2 border-b">
                <p>{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <Link
                  to={`/user/${user._id}`}
                  className="text-blue-600 hover:underline text-sm"
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

export default Search;
