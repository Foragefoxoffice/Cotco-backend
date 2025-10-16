const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true, // SSL required for port 465
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    const message = {
      from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
      to: options.email, // ✅ Only user
      subject: options.subject,
      html: options.message,
      attachments: options.attachments || [],
      replyTo: process.env.FROM_EMAIL, // optional, for user reply
      bcc: undefined, // ✅ no admin copy
      cc: undefined,
    };

    const info = await transporter.sendMail(message);
    console.log("📨 Email sent successfully:", info.messageId);
  } catch (error) {
    console.error("❌ Email send failed:", error.message);
    throw new Error("Email could not be sent");
  }
};

module.exports = sendEmail;
