import { useEffect, useRef, useState, useLayoutEffect } from "react";
import axios from "axios";
import { socket } from "../services/socket.ts";

export interface Patient {
  _id: string;
  name: string;
  order: number;
}

export default function Queue() {
  const [waiting, setWaiting] = useState<Patient[]>([]);
  const [enteringIds, setEnteringIds] = useState<Set<string>>(new Set());

  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const prevRects = useRef<Map<string, DOMRect>>(new Map());
  const knownIds = useRef<Set<string>>(new Set());

  const API_URL = import.meta.env.VITE_API_URL;

  const fetchQueue = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/queue`
      );

      // Sort without mutating the response array
      const sorted = [...res.data].sort(
        (a: Patient, b: Patient) => a.order - b.order
      );

      // Figure out which ids are brand new so we can animate them in
      const newIds = sorted
        .map((p) => p._id)
        .filter((id) => !knownIds.current.has(id));

      if (newIds.length > 0) {
        setEnteringIds(new Set(newIds));
        setTimeout(() => {
          setEnteringIds((prev) => {
            const next = new Set(prev);
            newIds.forEach((id) => next.delete(id));
            return next;
          });
        }, 300);
      }

      sorted.forEach((p) => knownIds.current.add(p._id));
      setWaiting(sorted);
    } catch (error) {
      console.error("Failed to fetch queue", error);
    }
  };

  useEffect(() => {
    fetchQueue();

    // refresh every few seconds for now
    // later Socket.IO replaces this
    socket.on("queueUpdated", () => {
      fetchQueue();
    });

    return () => {
      socket.off("queueUpdated");
    };
  }, []);

  // FLIP: reposition rows smoothly whenever reception reorders the queue.
  // Newly-added rows are skipped here since they get their own
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

      const deltaX = oldRect.left - newRect.left;
      const deltaY = oldRect.top - newRect.top;
      if (!deltaX && !deltaY) return;

      const el = rowRefs.current.get(id);
      if (!el) return;

      el.style.transition = "none";
      el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

      requestAnimationFrame(() => {
        el.style.transition = "transform 300ms ease-out";
        el.style.transform = "";
      });
    });

    prevRects.current = newRects;
  }, [waiting, enteringIds]);

  return (
    <div className="mt-4 w-full">
      <h2 className="mb-8 text-center text-2xl font-semibold uppercase tracking-[0.2em] text-[#8A8D93]">
        X-Ray Waiting List
      </h2>

      <div className="grid grid-flow-col auto-cols-fr grid-rows-5 gap-4">
        {waiting.map((patient, index) => {
          const isEntering = enteringIds.has(patient._id);

          return (
            <div
              key={patient._id}
              ref={(el) => {
                if (el) rowRefs.current.set(patient._id, el);
                else rowRefs.current.delete(patient._id);
              }}
              className={`flex items-center gap-6 rounded-lg border px-8 py-6 transition-[opacity,transform] duration-300 ease-out ${
                index === 0
                  ? "border-[#3E5C76] bg-[#3E5C76]/[0.06]"
                  : "border-[#E4E4E0] bg-white/60"
              } ${isEntering ? "opacity-0 scale-95" : "opacity-100 scale-100"}`}
            >
              <span className="font-mono text-4xl text-[#15171B]">
                {patient.order}.
              </span>
              <span className="text-3xl font-medium text-[#15171B]">
                {patient.name}
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-10 text-center text-lg text-[#8A8D93]">
        Please wait until your name is called
      </p>
    </div>
  );
}