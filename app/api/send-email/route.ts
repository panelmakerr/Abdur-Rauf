import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { to, name, type, status } = await req.json()

    let subject = ''
    let html = ''

    if (type === 'confirmation') {
      subject = 'Application Received - Hospital Recruitment'
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Application Received</h2>
          <p>Dear ${name},</p>
          <p>Thank you for submitting your application to our hospital. We have successfully received your resume and application materials.</p>
          <p>Our HR team will review your application and contact you if your qualifications match our current openings.</p>
          <p><strong>Next Steps:</strong></p>
          <ul>
            <li>Your application is currently under review</li>
            <li>You will receive updates via email</li>
            <li>The review process typically takes 5-7 business days</li>
          </ul>
          <p>Best regards,<br/>Hospital Recruitment Team</p>
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="color: #6b7280; font-size: 12px;">This is an automated email. Please do not reply directly to this message.</p>
        </div>
      `
    } else if (type === 'status_update') {
      const statusMessages: Record<string, { subject: string; message: string }> = {
        reviewing: {
          subject: 'Application Under Review',
          message: 'Your application is currently being reviewed by our HR team. We will update you soon on the next steps.',
        },
        shortlisted: {
          subject: 'Congratulations! You\'ve Been Shortlisted',
          message: 'Great news! Your application has been shortlisted. Our team will contact you shortly to schedule an interview.',
        },
        rejected: {
          subject: 'Application Status Update',
          message: 'Thank you for your interest in joining our team. After careful consideration, we have decided to move forward with other candidates. We encourage you to apply for future openings.',
        },
      }

      const statusInfo = statusMessages[status] || statusMessages.reviewing
      subject = statusInfo.subject
      html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Application Status Update</h2>
          <p>Dear ${name},</p>
          <p>${statusInfo.message}</p>
          <p>Current Status: <strong style="text-transform: uppercase;">${status}</strong></p>
          <p>If you have any questions, please feel free to contact our HR department.</p>
          <p>Best regards,<br/>Hospital Recruitment Team</p>
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #e5e7eb;" />
          <p style="color: #6b7280; font-size: 12px;">This is an automated email. Please do not reply directly to this message.</p>
        </div>
      `
    }

    const data = await resend.emails.send({
      from: 'Hospital Recruitment <no-reply@yourdomain.com>',
      to: [to],
      subject,
      html,
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Email sending error:', error)
    return NextResponse.json({ success: false, error }, { status: 500 })
  }
}
