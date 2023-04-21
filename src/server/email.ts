import { createTransport } from "nodemailer";
import { env } from "~/env.mjs";

export const nodemailer = createTransport(env.EMAIL_SERVER);
