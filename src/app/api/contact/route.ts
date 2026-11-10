import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getSql } from "@/lib/db";
import { allow, HOUR, DAY } from "@/lib/rateLimit";
import { readJson, sameOrigin, visitorHash } from "@/lib/visitor";

// Contact form: validates, saves to Neon, then emails Aditya via Resend.
// The message is stored first, so it's never lost if the email fails.

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@<>()",;:]+@[^\s@<>()",;:]+\.[^\s@<>()",;:]{2,}$/;

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: Record<string, unknown>;
  try {
    body = (await readJson(req, 8192)) as Record<string, unknown>;
    if (!body || typeof body !== "object") throw new Error();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // Honeypot: real people never see or fill this field. Pretend it worked.
  if (str(body.website)) return NextResponse.json({ ok: true });

  const name = str(body.name).replace(/[\r\n]+/g, " ");
  const email = str(body.email);
  const message = str(body.message);
  if (name.length < 1 || name.length > 80) return NextResponse.json({ error: "Please enter your name (max 80 characters)." }, { status: 400 });
  if (email.length > 254 || !EMAIL_RE.test(email)) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  if (message.length < 10 || message.length > 2000) return NextResponse.json({ error: "Message must be 10–2000 characters." }, { status: 400 });

  const sql = getSql();
  if (!sql) {
    console.warn("[contact] DATABASE_URL not set; cannot store messages.");
    return NextResponse.json({ error: "Messaging is offline right now. Please use the email link." }, { status: 503 });
  }

  const v = visitorHash(req);
  const ok = await allow(
    [
      { key: `contact:${v}:hour`, windowSec: HOUR, max: 3 },
      { key: `contact:${v}:day`, windowSec: DAY, max: 10 },
    ],
    false
  );
  if (!ok) return NextResponse.json({ error: "Too many messages. Please try again later." }, { status: 429 });

  let id: number;
  try {
    const rows = (await sql`INSERT INTO messages (name, email, message, visitor_hash)
                            VALUES (${name}, ${email}, ${message}, ${v}) RETURNING id`) as { id: number }[];
    id = rows[0].id;
  } catch (err) {
    console.error(`[contact] DB error: ${(err as Error).message}`);
    return NextResponse.json({ error: "Couldn't send right now. Please use the email link." }, { status: 500 });
  }

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  if (key && to) {
    try {
      const { error } = await new Resend(key).emails.send({
        from: process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>",
        to,
        replyTo: email,
        subject: `Portfolio message from ${name}`,
        // Plain text only: no HTML-injection risk from visitor input.
        text: `${message}\n\n— ${name} <${email}>\n(Reply to this email to answer them.)`,
      });
      if (error) throw new Error(error.message);
      await sql`UPDATE messages SET email_sent = true WHERE id = ${id}`;
    } catch (err) {
      console.warn(`[contact] Email failed (message ${id} is saved in the DB): ${(err as Error).message}`);
    }
  } else {
    console.warn("[contact] RESEND_API_KEY or CONTACT_TO_EMAIL not set; message saved but not emailed.");
  }

  return NextResponse.json({ ok: true });
}
