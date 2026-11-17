
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export async function POST(request) {
  try {
    const body = await request.json();

    const { event, phone, requestId, visitorToken } = body;

    if (
      !["phone_submitted", "code_submitted"].includes(event) ||
      !phone ||
      !requestId ||
      !visitorToken
    ) {
      return NextResponse.json(
        { error: "Invalid notification request." },
        { status: 400 }
      );
    }

    // Verify that this visitor owns the request.
    const { data, error } = await supabase.rpc(
      "check_verification_status",
      {
        p_request_id: requestId,
        p_visitor_token: visitorToken,
      }
    );

    if (error || !data?.length) {
      return NextResponse.json(
        { error: "Request could not be verified." },
        { status: 403 }
      );
    }

    const currentStatus = data[0].current_status;

    if (
      (event === "phone_submitted" && currentStatus !== "awaiting_code") ||
      (event === "code_submitted" && currentStatus !== "code_submitted")
    ) {
      return NextResponse.json(
        { error: "Notification does not match the request status." },
        { status: 400 }
      );
    }

    const subject =
      event === "phone_submitted"
        ? "New Live Pahina Phone Request"
        : "Live Pahina Verification Submitted";

    const description =
      event === "phone_submitted"
        ? "A visitor has submitted a phone number and is waiting for verification."
        : "A visitor has submitted their six-digit verification code. Please review the request in your admin dashboard.";

    const { error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;color:#222">
          <h2 style="color:#dc2626">Live Pahina Notification</h2>
          <p>${description}</p>
          <p><strong>Visitor phone number:</strong> ${phone}</p>
          <p><strong>Event:</strong> ${event === "phone_submitted" ? "Phone number submitted" : "Verification code submitted"}</p>
          <p>Please sign in to your private administrator dashboard to review this request.</p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/admin"
             style="display:inline-block;background:#dc2626;color:white;padding:12px 20px;text-decoration:none;border-radius:6px">
            Open Admin Dashboard
          </a>
          <p style="margin-top:24px;color:#777;font-size:12px">Live Pahina automated notification</p>
        </div>
      `,
    });

    if (emailError) {
      console.error("Resend email error:", emailError);

      return NextResponse.json(
        { error: "Unable to send notification email." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Notification error:", error);

    return NextResponse.json(
      { error: "Notification could not be sent." },
      { status: 500 }
    );
  }
}
