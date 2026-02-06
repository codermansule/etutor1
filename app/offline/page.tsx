import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        <div className="mx-auto h-20 w-20 rounded-full bg-slate-800 flex items-center justify-center">
          <WifiOff className="h-10 w-10 text-slate-500" />
        </div>
        <h1 className="text-3xl font-black text-white uppercase tracking-wider">You&apos;re Offline</h1>
        <p className="text-slate-400">
          It looks like you&apos;ve lost your internet connection. Please check your connection and try again.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-500 text-slate-950 font-bold hover:bg-sky-400 transition"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </a>
      </div>
    </div>
  );
}
