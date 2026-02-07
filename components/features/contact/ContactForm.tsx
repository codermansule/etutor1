"use client";

import { useState } from "react";
import { Loader2, CheckCircle } from "lucide-react";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("contact-name") as HTMLInputElement).value,
      email: (form.elements.namedItem("contact-email") as HTMLInputElement).value,
      subject: (form.elements.namedItem("contact-subject") as HTMLInputElement).value,
      message: (form.elements.namedItem("contact-message") as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const json = await res.json();
        throw new Error(json.error || "Something went wrong");
      }

      setStatus("success");
      form.reset();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to send message");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CheckCircle className="h-12 w-12 text-emerald-400" />
        <h3 className="mt-4 text-xl font-semibold text-white">Message sent!</h3>
        <p className="mt-2 text-sm text-slate-400">
          We&apos;ll get back to you within 24 hours.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 text-sm text-sky-400 hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 grid gap-5 md:grid-cols-2">
      <div className="space-y-1.5">
        <label htmlFor="contact-name" className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Name</label>
        <input
          id="contact-name"
          name="contact-name"
          type="text"
          required
          placeholder="Your name"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
        />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="contact-email" className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Email</label>
        <input
          id="contact-email"
          name="contact-email"
          type="email"
          required
          placeholder="you@example.com"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
        />
      </div>
      <div className="space-y-1.5 md:col-span-2">
        <label htmlFor="contact-subject" className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Subject</label>
        <input
          id="contact-subject"
          name="contact-subject"
          type="text"
          required
          placeholder="How can we help?"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
        />
      </div>
      <div className="space-y-1.5 md:col-span-2">
        <label htmlFor="contact-message" className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Message</label>
        <textarea
          id="contact-message"
          name="contact-message"
          rows={5}
          required
          minLength={10}
          placeholder="Tell us more..."
          className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-sky-500 focus:outline-none"
        />
      </div>

      {status === "error" && (
        <div className="md:col-span-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
          {errorMsg}
        </div>
      )}

      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 px-8 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-950 transition hover:brightness-110 disabled:opacity-60 inline-flex items-center gap-2"
        >
          {status === "sending" && <Loader2 className="h-4 w-4 animate-spin" />}
          {status === "sending" ? "Sending..." : "Send message"}
        </button>
      </div>
    </form>
  );
}
