import { useState } from "react";

interface AddPatientProps {
  onAdd: (name: string, phone: string) => void;
}

function formatPastedName(rawName: string): string {
  const trimmed = rawName.trim();
  const commaIndex = trimmed.indexOf(",");

  // No comma — leave the name as-is
  if (commaIndex === -1) return trimmed;

  const lastName = trimmed.slice(0, commaIndex).trim();
  const firstName = trimmed.slice(commaIndex + 1).trim();

  // Comma with nothing after it (e.g. "Robinson,") — just use what's there
  if (!firstName) return lastName;

  const lastInitial = lastName.charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}.`;
}

type Mode = "paste" | "manual";

export default function AddPatient({ onAdd }: AddPatientProps) {
  const [mode, setMode] = useState<Mode>("paste");
  const [pastedName, setPastedName] = useState("");
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [phone,setPhone] = useState("");

  const handlePasteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pastedName.trim()) return;
    onAdd(formatPastedName(pastedName), phone);
    setPastedName("");
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim()) return;

    const initial = lastName.trim()
      ? `${lastName.trim().charAt(0).toUpperCase()}.`
      : "";
    const formatted = initial ? `${firstName.trim()} ${initial}` : firstName.trim();

    onAdd(formatted, phone);
    setLastName("");
    setFirstName("");
  };

  return (
    <div>
      <div className="mb-4 inline-flex rounded-md border border-slate-200 p-0.5">
        <button
          type="button"
          onClick={() => setMode("paste")}
          className={`rounded px-3 py-1.5 text-xs font-medium transition ${
            mode === "paste"
              ? "bg-slate-900 text-white"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Paste
        </button>
        <button
          type="button"
          onClick={() => setMode("manual")}
          className={`rounded px-3 py-1.5 text-xs font-medium transition ${
            mode === "manual"
              ? "bg-slate-900 text-white"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Manual entry
        </button>
      </div>

      {mode === "paste" ? (
        <form onSubmit={handlePasteSubmit} className="flex gap-2">
          <input
            type="text"
            value={pastedName}
            onChange={(e) => setPastedName(e.target.value)}
            placeholder="Robinson, Sharon"
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Add
          </button>
        </form>
      ) : (
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Add
          </button>
        </form>
      )}

      <p className="mt-2 text-xs text-slate-400">
        {mode === "paste"
          ? 'Paste as "Last, First" — formatted automatically.'
          : "Enter the patient's name in two parts."}
      </p>
    </div>
  );
}