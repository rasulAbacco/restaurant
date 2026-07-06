import { Routes, Route } from "react-router-dom";
import MenuList from "./MenuList.jsx";
import Categories from "./components/Categories.jsx";

const MenuRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MenuList />} />
      <Route path="/categories" element={<Categories />} />
    </Routes>
  );
};

export default MenuRoutes;