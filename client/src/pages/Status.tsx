import { useEffect, useState } from "react";
import { socket } from "../services/socket.ts";

import { getStatus } from "../services/api.ts";

type Patient = {
  _id: string;
  name: string;
  order: number;
  phone: string;
  waitingTime: number;
  createdAt: string;
  updatedAt: string;
};

const Status = () => {

  const [status, setStatus] = useState<Patient | null>(null);
  const [error, setError] = useState("");

  const [phone, setPhone] = useState(""); // Replace with the actual phone number you want to query

  const fetchStatus = async () => {
    try {
      setError("");
      const cleanPhone = phone.replace(/\D/g, ""); // Remove non-digit characters
      if (!cleanPhone) {
        setError("Please enter a valid phone number.");
        return;
      }
      const res = await getStatus(cleanPhone);
      setStatus(res.data);
    } catch {
      setStatus(null);
      setError("No patient found with that phone number.");
    }
  };

  useEffect(() => {

    socket.on("queueUpdated", () => {
      fetchStatus();
    });

    return () => {
      socket.off("queueUpdated");
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F9FA] flex flex-col">
      {/* Brand header */}
      <header className="bg-[#0B5F67] text-white px-5 pt-6 pb-5 mb-7 rounded-b-3xl shadow-sm">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#9FD3D6] font-medium">
          Queue Status
        </p>
        <h1 className="text-xl font-semibold tracking-tight mt-0.5">
          Limeworth X-ray &amp; Ultrasound
        </h1>
        <a
          href="tel:9055747755"
          className="inline-flex items-center gap-1.5 mt-2 text-sm text-[#D7F0F1] underline underline-offset-2"
        >
          📞 905-574-7755
        </a>
      </header>

      <main className="flex-1 px-5 -mt-3">
        {/* Lookup card */}
        <section className="bg-white rounded-2xl shadow-md border border-[#E1EBEC] p-5">
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-[#16262B] mb-2"
          >
            Enter your phone number
          </label>
          <input
            id="phone"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="905 555 1234"
            className="w-full text-base border border-[#D8E4E6] rounded-xl px-4 py-3 text-[#16262B] placeholder-[#8FA4A9] focus:outline-none focus:ring-2 focus:ring-[#0E7C86] focus:border-transparent"
          />
          <button
            onClick={fetchStatus}
            className="w-full mt-3 bg-[#0E7C86] active:bg-[#0B5F67] text-white font-semibold text-base rounded-xl py-3 transition-colors"
          >
            Check My Status
          </button>

          {error && (
            <p className="mt-3 text-sm text-[#B3452F] bg-[#FBEAE6] rounded-lg px-3 py-2">
              {error}
            </p>
          )}
        </section>

        {/* Ticket-style result */}
        {status && (
          <section className="mt-5 bg-white rounded-2xl shadow-md border border-[#E1EBEC] overflow-hidden">
            <div className="px-5 pt-5 pb-4 text-center">
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#5B7178] font-medium">
                Your Number
              </p>
              <p className="text-6xl font-bold tabular-nums text-[#0B5F67] mt-1">
                {status.order}
              </p>
            </div>

            <div className="border-t border-dashed border-[#C9D8DA] mx-5" />

            <div className="px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.15em] text-[#5B7178] font-medium">
                  Patient
                </p>
                <p className="text-base font-medium text-[#16262B] mt-0.5">
                  {status.name}
                </p>
              </div>

              <div className="text-right">
                <p className="text-[11px] uppercase tracking-[0.15em] text-[#5B7178] font-medium">
                  Est. Wait
                </p>
                <span className="inline-block mt-0.5 bg-[#FCEFDD] text-[#B3752B] font-semibold text-sm rounded-full px-3 py-1">
                  {status.waitingTime} min
                </span>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="px-5 py-6 text-center">
        <p className="text-xs text-[#8FA4A9]">
          Limeworth X-ray &amp; Ultrasound &middot; 905-574-7755
        </p>
      </footer>
    </div>

  );
};

export default Status