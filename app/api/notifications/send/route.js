
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[character];
  });
}

export async function POST(request) {
  try {
    const body = await request.json();

    const { event, phone, email, requestId, visitorToken } = body;

    const phoneEvent = ["phone_submitted", "code_submitted"].includes(event);
    const emailEvent = [
      "email_submitted",
      "email_code_submitted",
    ].includes(event);

    if (
      (!phoneEvent && !emailEvent) ||
      !requestId ||
      !visitorToken ||
      (phoneEvent && !phone) ||
      (emailEvent && !email)
    ) {
      return NextResponse.json(
        { error: "Invalid notification request." },
        { status: 400 }
      );
    }

    // Verify the visitor's request and its current status.
    const { data, error } = await supabase.rpc(
      phoneEvent
        ? "check_verification_status"
        : "check_email_join_status",
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

    const validStatus =
      (event === "phone_submitted" && currentStatus === "awaiting_code") ||
      (event === "code_submitted" && currentStatus === "code_submitted") ||
      (event === "email_submitted" && currentStatus === "pending_review") ||
      (event === "email_code_submitted" &&
        currentStatus === "code_submitted");

    if (!validStatus) {
      return NextResponse.json(
        { error: "Notification does not match the request status." },
        { status: 400 }
      );
    }

    let subject;
    let description;
    let visitorDetails;
    let eventDescription;

    if (event === "phone_submitted") {
      subject = "New Live Pahina Phone Request";
      description =
        "A visitor has submitted a phone number and is waiting for verification.";
      visitorDetails = `<p><strong>Visitor phone number:</strong> ${escapeHtml(phone)}</p>`;
      eventDescription = "Phone number submitted";
    } else if (event === "code_submitted") {
      subject = "Live Pahina Verification Submitted";
      description =
        "A visitor has submitted their six-digit verification code. Please review the request in your admin dashboard.";
      visitorDetails = `<p><strong>Visitor phone number:</strong> ${escapeHtml(phone)}</p>`;
      eventDescription = "Phone verification code submitted";
    } else if (event === "email_submitted") {
      subject = "New Live Pahina Email Request";
      description =
        "A visitor has submitted an email address and Live Pahina member code. Please review the request in your admin dashboard.";
      visitorDetails = `<p><strong>Visitor email:</strong> ${escapeHtml(email)}</p>`;
      eventDescription = "Email request submitted";
    } else {
      subject = "Live Pahina Email Verification Submitted";
      description =
        "A visitor has submitted their six-digit email verification code. Please review the request in your admin dashboard.";
      visitorDetails = `<p><strong>Visitor email:</strong> ${escapeHtml(email)}</p>`;
      eventDescription = "Email verification code submitted";
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const { error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;padding:24px;color:#222">
          <h2 style="color:#dc2626">Live Pahina Notification</h2>
          <p>${description}</p>
          ${visitorDetails}
          <p><strong>Event:</strong> ${eventDescription}</p>
          <p>Please sign in to your private administrator dashboard to review this request.</p>
          <a href="${escapeHtml(siteUrl)}/admin"
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
