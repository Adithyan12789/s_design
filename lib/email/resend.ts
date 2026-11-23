import { Resend } from 'resend'

export interface SendEnquiryEmailParams {
  name: string
  email: string
  phone?: string
  location?: string
  projectType?: string
  budget?: string
  message: string
  recipientEmail?: string
}

export async function sendEnquiryNotificationEmail({
  name,
  email,
  phone,
  location,
  projectType,
  budget,
  message,
  recipientEmail,
}: SendEnquiryEmailParams) {
  const apiKey = process.env.RESEND_API_KEY
  const toEmail = recipientEmail || process.env.STUDIO_NOTIFICATION_EMAIL || 'adithiruthiparambil12@gmail.com'

  if (!apiKey) {
    console.warn(
      `[Enquiry Email Note] RESEND_API_KEY is not set in environment variables. ` +
      `Enquiry from "${name}" (${email}) was saved to the database, but email delivery was skipped. ` +
      `Add RESEND_API_KEY to your .env file to enable instant email delivery.`
    )
    return {
      success: false,
      skipped: true,
      reason: 'missing_resend_api_key',
    }
  }

  try {
    const resend = new Resend(apiKey)
    const sender = process.env.RESEND_FROM_EMAIL || 'S_Designs <onboarding@resend.dev>'

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>New Project Enquiry — S_Designs</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #121110; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #f4efe6;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background-color: #181614; border: 1px solid rgba(244, 239, 230, 0.12); border-radius: 8px; overflow: hidden;">
    <!-- Header -->
    <tr>
      <td style="padding: 32px 32px 24px; border-bottom: 1px solid rgba(244, 239, 230, 0.08); background-color: #141311;">
        <span style="font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: #d9b686; font-weight: 600;">S_DE_SIGN · STUDIO INQUIRY</span>
        <h1 style="margin: 8px 0 0; font-family: Georgia, serif; font-size: 24px; font-weight: 400; color: #fbf9f4; letter-spacing: -0.01em;">
          New Project Inquiry Received
        </h1>
      </td>
    </tr>

    <!-- Body Info -->
    <tr>
      <td style="padding: 28px 32px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px; line-height: 1.6;">
          <tr>
            <td style="padding: 8px 0; color: #a19a8e; width: 140px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em;">Client Name</td>
            <td style="padding: 8px 0; color: #fbf9f4; font-weight: 600; font-size: 15px;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #a19a8e; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em;">Email</td>
            <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #d9b686; text-decoration: none;">${email}</a></td>
          </tr>
          ${phone ? `
          <tr>
            <td style="padding: 8px 0; color: #a19a8e; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em;">Phone</td>
            <td style="padding: 8px 0;"><a href="tel:${phone}" style="color: #fbf9f4; text-decoration: none;">${phone}</a></td>
          </tr>` : ''}
          ${location ? `
          <tr>
            <td style="padding: 8px 0; color: #a19a8e; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em;">Location</td>
            <td style="padding: 8px 0; color: #fbf9f4;">${location}</td>
          </tr>` : ''}
          ${projectType ? `
          <tr>
            <td style="padding: 8px 0; color: #a19a8e; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em;">Project Type</td>
            <td style="padding: 8px 0; color: #d9b686; font-weight: 500;">${projectType}</td>
          </tr>` : ''}
          ${budget ? `
          <tr>
            <td style="padding: 8px 0; color: #a19a8e; font-size: 12px; text-transform: uppercase; letter-spacing: 0.06em;">Est. Budget</td>
            <td style="padding: 8px 0; color: #fbf9f4;">${budget}</td>
          </tr>` : ''}
        </table>

        <!-- Message Box -->
        <div style="margin-top: 24px; padding: 20px; background-color: #121110; border-left: 2px solid #d9b686; border-radius: 4px;">
          <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #a19a8e; display: block; margin-bottom: 8px;">Project Brief / Message</span>
          <div style="color: #e6dfd3; font-size: 14.5px; line-height: 1.7; white-space: pre-wrap; font-family: Georgia, serif;">${message}</div>
        </div>

        <!-- Action Button -->
        <div style="margin-top: 28px; text-align: left;">
          <a href="mailto:${email}?subject=Regarding%20your%20project%20inquiry%20%E2%80%94%20S_Designs" style="display: inline-block; padding: 12px 24px; background-color: #d9b686; color: #121110; text-decoration: none; font-size: 12px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; border-radius: 3px;">
            Reply to ${name}
          </a>
        </div>
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="padding: 20px 32px; background-color: #141311; border-top: 1px solid rgba(244, 239, 230, 0.08); text-align: center; font-size: 11px; color: #7c7367;">
        This project inquiry was submitted via the S_Designs Studio website contact form.
      </td>
    </tr>
  </table>
</body>
</html>
    `

    const { data, error } = await resend.emails.send({
      from: sender,
      to: [toEmail],
      replyTo: email,
      subject: `New Project Inquiry: ${name} — S_Designs`,
      html: htmlContent,
    })

    if (error) {
      console.error('[Resend Error]', error)
      return { success: false, error: error.message }
    }

    return { success: true, id: data?.id }
  } catch (err) {
    console.error('[Resend Exception]', err)
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}
