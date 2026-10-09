/** Shared contact-form validation, used by both client and server. */
export interface ContactInput {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export type ContactErrors = Partial<Record<keyof ContactInput, "required" | "invalid" | "tooLong">>;

const LIMITS: Record<keyof ContactInput, number> = { name: 80, email: 120, phone: 15, subject: 150, message: 2000 };

/** Strip control characters and trim; content is only ever rendered as text. */
export const clean = (v: unknown) =>
  typeof v === "string" ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim() : "";

export function validateContact(raw: Record<string, unknown>): { data: ContactInput; errors: ContactErrors } {
  const data: ContactInput = {
    name: clean(raw.name),
    email: clean(raw.email),
    phone: clean(raw.phone),
    subject: clean(raw.subject),
    message: clean(raw.message),
  };
  const errors: ContactErrors = {};
  (Object.keys(LIMITS) as (keyof ContactInput)[]).forEach((k) => {
    if (data[k].length > LIMITS[k]) errors[k] = "tooLong";
  });
  if (!data.name) errors.name = "required";
  if (!data.email) errors.email = "required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) errors.email = "invalid";
  if (data.phone && !/^(\+91[\s-]?)?[6-9]\d{9}$/.test(data.phone.replace(/\s/g, ""))) errors.phone = "invalid";
  if (!data.subject) errors.subject = "required";
  if (!data.message) errors.message = "required";
  else if (data.message.length < 10) errors.message = "invalid";
  return { data, errors };
}
