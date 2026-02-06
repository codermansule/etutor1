"use client";

import { useSyncExternalStore } from "react";
import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";

// SSR-safe mount check without useEffect + setState
const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function Whiteboard() {
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!mounted) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-900">
        <p className="text-slate-400 text-sm">Loading whiteboard...</p>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative" style={{ background: "#f8f9fa" }}>
      <Tldraw inferDarkMode />
    </div>
  );
}
