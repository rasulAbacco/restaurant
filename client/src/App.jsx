import { Routes, Route } from "react-router-dom";
import MenuRoutes from "./menu/MenuRoutes";

function App() {
  return (
    <Routes>
      <Route path="/menu/*" element={<MenuRoutes />} />
    </Routes>
  );
}

export default App;