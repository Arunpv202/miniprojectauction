import { Routes, Route,Navigate } from "react-router-dom";
import Signup from "./components/Signup.jsx";
import Rolechoose from "./components/Rolechoose.jsx";
import Login from "./components/Login.jsx";
import "./styles.css";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/Login" />}/>
      <Route path="/signup" element={<Signup />} />
      <Route path="/Rolechoose" element={<Rolechoose />} />
      <Route path="/Login" element={<Login />} />
    </Routes>
  );
}

export default App;

