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

  const [status, setStatus] = useState<Patient[]>([]);

  const phone = "1234567890"; // Replace with the actual phone number you want to query

  const fetchStatus = async () => {
    console.log("Fetching queue for phone:", phone);
    try {
      const res = await getStatus(phone);
      console.log("Queue fetched:", res.data);
      return res.data;
    } catch (error) {
      console.error("Error fetching queue:", error);
      return [];
    }
  };

  useEffect(() => {
    fetchStatus().then(setStatus);

    socket.on("queueUpdated", () => {
      fetchStatus().then(setStatus);
    });

    return () => {
      socket.off("queueUpdated");
    };
  }, []);

  return (
    <div>
      <h1>Queue Status</h1>
      <input value={phone} placeholder="Enter your phone number" className="border border-gray-300 rounded-md p-2"></input>
      <button onClick={() => fetchStatus().then(setStatus)} className="bg-blue-500 text-white px-4 py-2 rounded-md">Check Status</button>
      <p>Current Status:</p>
      <p>{status?.[0]?.order}</p>
      <p>{status?.[0]?.waitingTime}</p>
      <p>{status?.[0]?.name}</p>
    </div>
  );
};

export default Status