import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
    try {
        const data = await request.json();

        // Sanitize inputs
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const rawTo = data.to;
        const to = emailRegex.test(rawTo)
            ? rawTo
            : process.env.DEFAULT_RECIPIENT;

        const subject = data.subject?.trim() || 'Message from Should I Should I Not';
        const text =
            data.text?.trim() ||
            "Someone wanted to send you a message but didn't specify any content.";
        const from = data.from?.trim() || 'Anonymous User';

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT),
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${subject}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .message-content {
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          border-left: 4px solid #6366f1;
        }
        .footer {
          font-size: 12px;
          text-align: center;
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid #eee;
          color: #888;
        }
        .logo {
          text-align: center;
          margin-bottom: 15px;
          font-size: 18px;
          font-weight: bold;
          color: #6366f1;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(90deg, #6366f1, #8b5cf6);
          color: white;
          text-decoration: none;
          padding: 10px 20px;
          border-radius: 5px;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="logo">Should I Should I Not</div>
      <div class="message-content">
        ${text.replace(/\n/g, '<br>')}
      </div>
      <p>This message was sent by <strong>${from}</strong> using <strong>Should I Should I Not</strong> — a platform where fate decides what gets sent.</p>
      <div style="text-align: center; margin: 25px 0;">
        <a href="https://shouldishouldinot.vercel.app/" class="cta-button">Try it yourself</a>
      </div>
      <div class="footer">
        <p>Have an important message but can't decide whether to send it?<br>
        Let fate decide at <a href="https://shouldishouldinot.vercel.app/">shouldishouldinot.vercel.app</a></p>
        <p>© ${new Date().getFullYear()} Should I Should I Not. All rights reserved.</p>
      </div>
    </body>
    </html>
    `;

        const fromEmail = process.env.EMAIL_FROM;
        const formattedFrom = `"${from}" <${fromEmail}>`;

        const mailData = {
            from: formattedFrom,
            to,
            subject,
            text,
            html: htmlContent,
            headers: {
                'X-Priority': '3',
                'X-Mailer': 'ShouldIShouldINot Mailer',
            },
        };

        await transporter.sendMail(mailData);

        return NextResponse.json({
            success: true,
            message: 'Email sent successfully',
        });
    } catch (error) {
        console.error('Email sending failed:', error);
        return NextResponse.json(
            {
                message: 'Failed to send email',
                error: (error as Error).message,
            },
            { status: 500 }
        );
    }
}