export default function PatientRow() {
  return (
    <div className="flex items-center justify-between rounded border p-4">
      <span className="text-lg">
        John S.
      </span>

      <div className="flex gap-2">
        <button className="rounded bg-yellow-500 px-3 py-1 text-white">
          ↑
        </button>

        <button className="rounded bg-yellow-500 px-3 py-1 text-white">
          ↓
        </button>

        <button className="rounded bg-red-600 px-3 py-1 text-white">
          Remove
        </button>
      </div>
    </div>
  );
}