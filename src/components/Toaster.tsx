"use client";

import { useEffect, useState } from "react";

export function toast(message: string) {
  window.dispatchEvent(new CustomEvent("nw-toast", { detail: message }));
}

export function Toaster() {
  const [msg, setMsg] = useState<string | null>(null);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const on = (e: Event) => {
      setMsg((e as CustomEvent<string>).detail);
      clearTimeout(t);
      t = setTimeout(() => setMsg(null), 2800);
    };
    window.addEventListener("nw-toast", on);
    return () => {
      window.removeEventListener("nw-toast", on);
      clearTimeout(t);
    };
  }, []);
  return (
    <div aria-live="polite" role="status">
      {msg && <div className="toast">{msg}</div>}
    </div>
  );
}
