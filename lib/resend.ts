import { Resend } from 'resend';

const apiKey = process.env.RESEND_API_KEY;

if (!apiKey) {
  throw new Error('RESEND_API_KEY environment variable is required');
}

if (!apiKey.startsWith('re_')) {
  throw new Error('Invalid Resend API key format - must start with "re_"');
}

if (apiKey.length < 20) {
  throw new Error('Invalid Resend API key - key appears to be too short');
}

export const resend = new Resend(apiKey);