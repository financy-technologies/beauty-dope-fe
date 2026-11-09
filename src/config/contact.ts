/** The one contact address used across the site (also hard-coded in index.html's JSON-LD). */
export const SUPPORT_EMAIL = "support@skinevora.com";

/** mailto: link for the contact form: addressed to support, with the visitor's details in the body. */
export function contactMailto(form: { name: string; email: string; subject: string; message: string }) {
  const body = `${form.message.trim()}\n\n— ${form.name.trim()} (${form.email.trim()})`;
  return `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(form.subject.trim())}&body=${encodeURIComponent(body)}`;
}
