import { BrowserRouter, Routes, Route } from "react-router-dom";

import Receptionist from "./pages/Receptionist";
import Display from "./pages/Display";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Receptionist />} />
        <Route path="/display" element={<Display />} />
      </Routes>
    </BrowserRouter>
  );
}