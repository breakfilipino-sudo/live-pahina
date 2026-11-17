
"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function updateVerificationRequest(formData) {
  const supabase = await createSupabaseServerClient();

  // Confirm that the person making this change is the administrator.
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (
    authError ||
    !user ||
    user.email !== process.env.ADMIN_EMAIL
  ) {
    throw new Error("Unauthorized access.");
  }

  const requestId = formData.get("request_id");
  const status = formData.get("status");
  const adminNote = formData.get("admin_note");

  const allowedStatuses = [
    "approved",
    "incorrect_code",
    "not_qualified",
  ];

  if (!requestId || !allowedStatuses.includes(status)) {
    throw new Error("Invalid verification update.");
  }

  const { error } = await supabase
    .from("phone_verification_requests")
    .update({
      status,
      admin_note: adminNote?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin");
}
