import { Routes, Route } from "react-router-dom";
import Signup from "./components/Signup.jsx";
import Admin from "./components/Admin.jsx";
import "./styles.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Signup />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}

export default App;

