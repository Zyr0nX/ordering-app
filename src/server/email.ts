import nodemailer from "nodemailer";
import { env } from "~/env.mjs";

export const transporter = nodemailer.createTransport(env.EMAIL_SERVER);