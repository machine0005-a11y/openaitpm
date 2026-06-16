import nodemailer from 'nodemailer';

let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return null;
  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
  });
  return transporter;
}

/**
 * Fire-and-forget email notification. Never throws — logs and swallows errors
 * so a Gmail outage can't take down the SMS pipeline.
 */
export async function notifyNewIdea({ idea, slug, url, from }) {
  const t = getTransporter();
  if (!t) return { skipped: true, reason: 'GMAIL_* not configured' };

  const to = process.env.GMAIL_NOTIFY_TO || process.env.GMAIL_USER;
  try {
    const info = await t.sendMail({
      from: `"openaitpm" <${process.env.GMAIL_USER}>`,
      to,
      subject: `New idea via SMS: ${idea.slice(0, 80)}`,
      text: [
        `From: ${from || 'unknown'}`,
        `Idea: ${idea}`,
        ``,
        `Live prototype: ${url}`,
        `Slug: ${slug}`,
      ].join('\n'),
    });
    return { sent: true, id: info.messageId };
  } catch (err) {
    console.error('[notify] gmail send failed:', err.message);
    return { sent: false, error: err.message };
  }
}
