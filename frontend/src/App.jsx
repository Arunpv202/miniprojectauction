import { Routes, Route, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Signup from "./components/Signup.jsx";
import Rolechoose from "./components/Rolechoose.jsx";
import Login from "./components/Login.jsx";
import Admin from "./components/Admin.jsx";
import AuctionDetails from "./components/Adminpage2.jsx";
import StartAuction from "./components/Admin3.jsx";
import "./styles.css";
import LoadingSpinner from "./components/common/LoadingSpinner";
import { useAuthStore } from "./store/global-store.jsx"; // Assuming this is the correct import path

function App() {
  const { data: authUser, isLoading, refetch } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) return null;
        throw new Error(data.error || "Something went wrong");
      }
      return data;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnMount: true,
    retry: false,
  });

  // Store the refetch function in Zustand
  const setRefetch = useAuthStore((state) => state.setRefetch);
  setRefetch(refetch);

  if (isLoading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <LoadingSpinner size="lg" />
      </div>
    );
  }
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/Login" />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/Rolechoose"
        element={authUser ? <Rolechoose /> : <Navigate to="/Login" />}
      />
      <Route
        path="/Admin"
        element={authUser ? <Admin />: <Navigate to="/Login" />}
        />
      <Route
        path="/Adminpage2"
        element={authUser ? <AuctionDetails/>: <Navigate to="/Login" />}
        />
      <Route path="/admin3" element={authUser ? <StartAuction/>: <Navigate to="/Login" />} />
      <Route path="/Login" element={<Login />} />
    </Routes>
  );
}

export default App;
