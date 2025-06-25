import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export const sendVerificationEmail = async (email: string, otp: string) => {
  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "Your Blink Jewels OTP Code",
    html: `<p>Your OTP is: <strong>${otp}</strong></p>`,
  });
};
