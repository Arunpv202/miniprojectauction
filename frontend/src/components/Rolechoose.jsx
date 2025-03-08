import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/global-store.jsx";
import "../styles/rolechoose.css";
function RoleSelection() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const { mutate } = useMutation({
    mutationFn: async () => {
      try {
        const res = await fetch("/api/auth/logout", {
          method: "POST", // Changed to POST
          credentials: "include", // Ensures cookies are sent
        });
  
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to log out");
        return data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    onSuccess: () => {
      logout();
      navigate("/login");
    },
  });
  
  return (
    <div className="container">
      <h1>Select Role</h1>
      <button onClick={() => navigate("/Admin")}>Admin</button>
      <button onClick={()=>navigate("/users")}>User</button>
      <button className="logout" onClick={mutate}>Logout</button>
    </div>
  );
}
export default RoleSelection;
