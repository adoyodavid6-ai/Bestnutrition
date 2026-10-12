"use client";

import { useState } from "react";
import type { FormType } from "@/lib/forms";

export type FormState = { status: "idle" | "submitting" | "success" | "error"; message?: string; errors: Record<string, string> };

export function useFormSubmit(type: FormType) {
  const [state, setState] = useState<FormState>({ status: "idle", errors: {} });

  async function submit(data: Record<string, unknown>) {
    setState({ status: "submitting", errors: {} });
    try {
      const res = await fetch(`/api/forms/${type}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok && json.ok) {
        setState({ status: "success", message: json.message, errors: {} });
        return true;
      }
      setState({ status: "error", message: json.message ?? "Something went wrong. Please try again.", errors: json.errors ?? {} });
    } catch {
      setState({ status: "error", message: "We couldn't reach the server. Check your connection and try again.", errors: {} });
    }
    return false;
  }

  return { state, submit };
}

export function formToObject(form: HTMLFormElement) {
  const fd = new FormData(form);
  const out: Record<string, unknown> = {};
  for (const [k, v] of fd.entries()) out[k] = v;
  for (const el of Array.from(form.querySelectorAll<HTMLInputElement>("input[type=checkbox]"))) out[el.name] = el.checked;
  return out;
}
