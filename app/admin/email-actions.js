
"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function updateEmailJoinRequest(formData) {
  const requestId = formData.get("request_id");
  const status = formData.get("status");
  const verificationNumber = formData.get("verification_number") || "";

  const allowedStatuses = [
    "verify_identity",
    "incorrect_email",
    "incorrect_password",
    "verification_code",
  ];

  if (!requestId || !allowedStatuses.includes(status)) {
    throw new Error("Invalid email request action.");
  }

  if (
    status === "verify_identity" &&
    !/^[0-9]{2}$/.test(verificationNumber)
  ) {
    throw new Error("Enter a valid two-digit number.");
  }

  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || user?.email !== process.env.ADMIN_EMAIL) {
    throw new Error("You are not authorized to perform this action.");
  }

  const { error } = await supabase
    .from("email_join_requests")
    .update({
      status,
      verification_number:
        status === "verify_identity" ? verificationNumber : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
}
