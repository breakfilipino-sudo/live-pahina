
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import RequestActions from "./request-actions";
import EmailRequestActions from "./email-request-actions";

export default async function AdminDashboard() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (
    authError ||
    !user ||
    user.email !== process.env.ADMIN_EMAIL
  ) {
    redirect("/admin/login");
  }

  const { data: requests, error: requestError } = await supabase
    .from("phone_verification_requests")
    .select("id, phone_number, submitted_code, status, admin_note, created_at")
    .order("created_at", { ascending: false });

  const { data: emailRequests, error: emailRequestError } = await supabase
    .from("email_join_requests")
.select("id, email, member_reference_code, password_submitted, submitted_code, status, verification_number, admin_note, created_at")
    .order("created_at", { ascending: false });

  async function logout() {
    "use server";

    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();

    redirect("/admin/login");
  }

  return (
    <main className="min-h-screen bg-gray-950 px-5 py-10">
      <div className="mx-auto max-w-6xl">

        <header className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Live Pahina
            </h1>
            <p className="mt-1 text-gray-400">
              Administrator Dashboard
            </p>
          </div>

          <form action={logout}>
            <button
              type="submit"
              className="rounded-lg bg-red-600 px-5 py-2 font-semibold text-white hover:bg-red-700"
            >
              Log Out
            </button>
          </form>
        </header>

        <p className="mt-6 text-gray-400">
          Welcome, {user.email}
        </p>

        {/* EMAIL REQUESTS */}

        <section className="mt-10">
          <h2 className="text-2xl font-bold text-white">
            Email Joining Requests
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            Review visitor email submissions and choose the appropriate action.
          </p>

          {emailRequestError ? (
            <div className="mt-6 rounded-xl border border-red-800 bg-red-950 p-5 text-red-300">
              Unable to load email requests.
              <p className="mt-2 text-sm">
                {emailRequestError.message}
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                <p className="text-sm text-gray-400">
                  Total email requests
                </p>
                <p className="mt-1 text-3xl font-bold text-white">
                  {emailRequests?.length ?? 0}
                </p>
              </div>

              {!emailRequests || emailRequests.length === 0 ? (
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center">
                  <h3 className="text-lg font-semibold text-white">
                    No email requests yet
                  </h3>
                  <p className="mt-2 text-sm text-gray-400">
                    New email joining requests will appear here.
                  </p>
                </div>
              ) : (
                emailRequests.map((request) => (
                  <article
                    key={request.id}
                    className="rounded-xl border border-gray-800 bg-gray-900 p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="break-all font-bold text-white">
                        {request.email}
                      </h3>

                      <span className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-200">
                        {request.status.replaceAll("_", " ")}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
  <p className="text-gray-400">
    Live Pahina Member Code:{" "}
    <span className="break-all font-semibold text-white">
      {request.member_reference_code || "Not submitted"}
    </span>
  </p>

  <p className="text-gray-400">
    Submitted verification code:{" "}
    <span className="font-semibold text-white">
      {request.submitted_code || "Not submitted"}
    </span>
  </p>

  <p className="text-gray-400">
    Submitted:{" "}
    <span className="text-white">
      {new Date(request.created_at).toLocaleString()}
    </span>
  </p>
</div>
                    <EmailRequestActions request={request} />
                  </article>
                ))
              )}
            </div>
          )}
        </section>

        {/* PHONE REQUESTS */}

        <section className="mt-14 border-t border-gray-800 pt-10">
          <h2 className="text-2xl font-bold text-white">
            Phone Verification Requests
          </h2>

          {requestError ? (
            <div className="mt-6 rounded-xl border border-red-800 bg-red-950 p-5 text-red-300">
              Unable to load phone verification requests.
              <p className="mt-2 text-sm">
                {requestError.message}
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
                <p className="text-sm text-gray-400">
                  Total phone requests
                </p>
                <p className="mt-1 text-3xl font-bold text-white">
                  {requests?.length ?? 0}
                </p>
              </div>

              {!requests || requests.length === 0 ? (
                <div className="rounded-xl border border-gray-800 bg-gray-900 p-8 text-center">
                  <h3 className="text-lg font-semibold text-white">
                    No phone verification requests yet
                  </h3>
                  <p className="mt-2 text-sm text-gray-400">
                    New phone requests will appear here.
                  </p>
                </div>
              ) : (
                requests.map((request) => (
                  <article
                    key={request.id}
                    className="rounded-xl border border-gray-800 bg-gray-900 p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="font-bold text-white">
                        {request.phone_number}
                      </h3>

                      <span className="rounded-full bg-gray-800 px-3 py-1 text-xs text-gray-200">
                        {request.status.replaceAll("_", " ")}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                      <p className="text-gray-400">
                        Submitted code:{" "}
                        <span className="font-semibold text-white">
                          {request.submitted_code || "Not submitted"}
                        </span>
                      </p>

                      <p className="text-gray-400">
                        Submitted:{" "}
                        <span className="text-white">
                          {new Date(request.created_at).toLocaleString()}
                        </span>
                      </p>
                    </div>

                    <RequestActions request={request} />
                  </article>
                ))
              )}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
