import { Config } from "@/config/config";

export const createCaptchaUrl = (gCaptchaToken: string) =>
  `https://www.google.com/recaptcha/api/siteverify?secret=${Config.googleCaptcha.secretKey}&response=${gCaptchaToken}`
