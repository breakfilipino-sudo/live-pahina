
"use client";

import { useState } from "react";
import { updateVerificationRequest } from "./actions";

export default function RequestActions({ request }) {
  const [note, setNote] = useState(request.admin_note || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleAction(status) {
    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.set("request_id", request.id);
    formData.set("status", status);
    formData.set("admin_note", note);

    try {
      await updateVerificationRequest(formData);
      setMessage("Request updated successfully.");
    } catch (error) {
      setMessage(error.message || "Unable to update request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-5 border-t border-gray-700 pt-5">
      <label className="mb-2 block text-sm font-semibold text-gray-300">
        Message to visitor (optional)
      </label>

      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Enter a message for this visitor..."
        rows={3}
        className="w-full rounded-lg border border-gray-700 bg-gray-950 p-3 text-sm text-white outline-none focus:border-red-500"
      />

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          disabled={loading}
          onClick={() => handleAction("approved")}
          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50"
        >
          Approve
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => handleAction("incorrect_code")}
          className="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-700 disabled:opacity-50"
        >
          Incorrect Code
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => handleAction("code_expired")}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50"
        >
          Code Expired
        </button>

        <button
          type="button"
          disabled={loading}
          onClick={() => handleAction("not_qualified")}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
        >
          Not Qualified
        </button>
      </div>

      {loading && (
        <p className="mt-3 text-sm text-gray-400">
          Updating request...
        </p>
      )}

      {message && (
        <p className="mt-3 text-sm text-gray-300">
          {message}
        </p>
      )}
    </div>
  );
}
