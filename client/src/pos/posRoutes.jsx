import { Routes, Route } from "react-router-dom";
import PosOrderScreen from "./PosOrderScreen";
import KitchenDisplayScreen from "./Kitchen/KitchenDisplayScreen";

function PosRoutes() {
  return (
    <Routes>
      <Route index element={<PosOrderScreen />} />
      <Route path="/kitchen/*" element={<KitchenDisplayScreen />} />
    </Routes>
  );
}

export default PosRoutes;