import nodemailer from "nodemailer";
// import 'dotenv/config';    // if using node --env-file, skip this line

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

try {
  const info = await transporter.sendMail({
    from: `"Debug" <${process.env.EMAIL_USER}>`,
    to: process.env.EMAIL_USER,
    subject: "Debug Test",
    text: "If you see this, Gmail is working.",
  });
  console.log("Mail sent:", info);
} catch (err) {
  console.error("Mail error:", err);
}
