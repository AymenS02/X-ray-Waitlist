import { useEffect, useState } from "react";
import Queue from "../components/Queue.tsx";

export default function Display() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const date = now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#15171B]">
      <div className="mx-auto max-w-[1800px] px-12 py-10">
        <header className="flex items-start justify-between border-b border-[#E4E4E0] pb-8">
          <div>
            <p className="text-lg font-semibold uppercase tracking-[0.28em] text-[#8A8D93]">
              Limeworth · X-Ray
            </p>
            <h1 className="mt-2 text-4xl font-semibold tracking-tight">
              Waiting Room
            </h1>
          </div>

          <div className="text-right">
            <p className="font-mono text-6xl font-semibold tabular-nums tracking-tight">
              {time}
            </p>
            <div className="mt-2 flex items-center justify-end gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#3E5C76]/50 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#3E5C76]" />
              </span>
              <p className="text-lg font-medium uppercase tracking-widest text-[#8A8D93]">
                {date}
              </p>
            </div>
          </div>
        </header>

        <main className="pt-10">
          <Queue />
        </main>
      </div>
    </div>
  );
}