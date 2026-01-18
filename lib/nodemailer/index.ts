import nodemailer from 'nodemailer';
import { WELCOME_EMAIL_TEMPLATE } from './templates';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.NODEMAILER_EMAIL,
    pass: process.env.NODEMAILER_PASSWORD,
  },
});

export const sendWelcomeEmail = async ({ email, name, intro }: { email: string; name: string; intro: string }) => {
  const html = WELCOME_EMAIL_TEMPLATE.replace('{{name}}', name).replace('{{intro}}', intro);

  await transporter.sendMail({
    from: process.env.NODEMAILER_EMAIL,
    to: email,
    subject: 'Welcome to Signalist - your stock market toolkit is ready!',
    text: 'Thanks for joining Signalist',
    html,
  });
};
