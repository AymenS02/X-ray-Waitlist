import AddPatient from "../components/AddPatient.tsx";
import { useState, useEffect, useRef, useLayoutEffect } from "react";

export interface Patient {
  _id: string;
  name: string;
  order: number;
}

import {
  getQueue,
  addPatient,
  deletePatient,
  movePatientUp as movePatientUpAPI,
  movePatientDown as movePatientDownAPI,
} from "../services/api";
import { socket } from "../services/socket.ts";

export default function Receptionist() {
  const [queue, setQueue] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [enteringIds, setEnteringIds] = useState<Set<string>>(new Set());

  const rowRefs = useRef<Map<string, HTMLLIElement>>(new Map());
  const prevRects = useRef<Map<string, DOMRect>>(new Map());
  const knownIds = useRef<Set<string>>(new Set());

  const fetchQueue = async () => {
    try {
      const res = await getQueue();

      // Make sure they are sorted
      const sorted = [...res.data].sort(
        (a: Patient, b: Patient) => a.order - b.order
      );

      // Figure out which ids are brand new so we can animate them in
      const newIds = sorted
        .map((p) => p._id)
        .filter((id) => !knownIds.current.has(id));

      if (newIds.length > 0) {
        setEnteringIds(new Set(newIds));
        // Drop the "entering" state shortly after mount so the
        // enter transition only plays once
        setTimeout(() => {
          setEnteringIds((prev) => {
            const next = new Set(prev);
            newIds.forEach((id) => next.delete(id));
            return next;
          });
        }, 20);
      }

      sorted.forEach((p) => knownIds.current.add(p._id));
      setQueue(sorted);
    } catch (error) {
      console.error("Failed to fetch queue", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPatient = async (name: string) => {
    try {
      await addPatient(name);
    } catch (error) {
      console.error("Error adding patient:", error);
    }
  };

  const handleDeletePatient = async (id: string) => {
    try {
      await deletePatient(id);
    } catch (error) {
      console.error("Error deleting patient:", error);
    }
  };

  const movePatientUp = async (id: string) => {
    try {
      await movePatientUpAPI(id);
    } catch (error) {
      console.error("Error moving patient up:", error);
    }
  };

  const movePatientDown = async (id: string) => {
    try {
      await movePatientDownAPI(id);
    } catch (error) {
      console.error("Error moving patient down:", error);
    }
  };

  useEffect(() => {
    fetchQueue();

    const handleQueueUpdate = () => {
      fetchQueue();
    };

    socket.on("queueUpdated", handleQueueUpdate);

    return () => {
      socket.off("queueUpdated", handleQueueUpdate);
    };
  }, []);

  // FLIP: reposition rows smoothly whenever the queue's order changes.
  // Newly-entering rows are skipped here since they get their own
  // fade/slide-in transition instead of a position tween.
  useLayoutEffect(() => {
    const newRects = new Map<string, DOMRect>();
    rowRefs.current.forEach((el, id) => {
      newRects.set(id, el.getBoundingClientRect());
    });

    newRects.forEach((newRect, id) => {
      if (enteringIds.has(id)) return;

      const oldRect = prevRects.current.get(id);
      if (!oldRect) return;

      const deltaY = oldRect.top - newRect.top;
      if (!deltaY) return;

      const el = rowRefs.current.get(id);
      if (!el) return;

      el.style.transition = "none";
      el.style.transform = `translateY(${deltaY}px)`;

      requestAnimationFrame(() => {
        el.style.transition = "transform 250ms ease-out";
        el.style.transform = "";
      });
    });

    prevRects.current = newRects;
  }, [queue, enteringIds]);

  return (
    <div className="min-h-screen bg-slate-50">

      <main className="mx-auto max-w-2xl px-6 py-10">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <AddPatient onAdd={handleAddPatient} />
        </div>

        <div className="mt-10">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-xs font-medium uppercase tracking-widest text-slate-500">
              Queue
            </h2>
            <span className="font-mono text-xs text-slate-400">
              {queue.length} waiting
            </span>
          </div>

          {isLoading ? (
            <p className="py-8 text-center text-sm text-slate-400">
              Loading queue…
            </p>
          ) : queue.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 py-10 text-center">
              <p className="text-sm text-slate-500">No patients in the queue.</p>
              <p className="mt-1 text-xs text-slate-400">
                Add a patient above to get started.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
              {queue.map((patient, i) => {
                const isEntering = enteringIds.has(patient._id);

                return (
                  <li
                    key={patient._id}
                    ref={(el) => {
                      if (el) rowRefs.current.set(patient._id, el);
                      else rowRefs.current.delete(patient._id);
                    }}
                    className={`flex items-center gap-4 px-4 py-3 transition-[opacity,transform] duration-300 ease-out ${
                      isEntering ? "opacity-0 -translate-y-1" : "opacity-100 translate-y-0"
                    }`}
                  >
                    <span className="w-6 font-mono text-sm text-slate-400">
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <span className="flex-1 text-sm font-medium text-slate-800">
                      {patient.name}
                    </span>

                    <div className="flex items-center gap-1 rounded-md border border-slate-200 p-0.5">
                      <button
                        onClick={() => movePatientUp(patient._id)}
                        disabled={i === 0}
                        aria-label={`Move ${patient.name} up`}
                        className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 15l-6-6-6 6" />
                        </svg>
                      </button>
                      <button
                        onClick={() => movePatientDown(patient._id)}
                        disabled={i === queue.length - 1}
                        aria-label={`Move ${patient.name} down`}
                        className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M6 9l6 6 6-6" />
                        </svg>
                      </button>
                    </div>

                    <button
                      onClick={() => handleDeletePatient(patient._id)}
                      aria-label={`Remove ${patient.name}`}
                      className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6h16z" />
                      </svg>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}