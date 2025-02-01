import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/global-store.jsx";

function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const navigate = useNavigate();
  const setAuthUser = useAuthStore((state) => state.setAuthUser);

  const { mutate, isError, isPending, error } = useMutation({
    mutationFn: async ({ username, password }) => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to log in");
        return data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    onSuccess: (data) => {
      toast.success("Logged in successfully");
      setAuthUser(data);
      navigate("/Rolechoose");
    },
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(formData);
  };

  const handleSignup = () => {
    navigate("/signup");
  };

  return (
    <div className="container">
      <h1>Login</h1>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleInputChange}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
          />
          <button type="submit" disabled={isPending}>
            {isPending ? "Logging In..." : "Login"}
          </button>
        </form>
        {isError && <p className="error">{error.message}</p>}
        <div className="signup-prompt">
          <p>
            Dont have an account? {" "}
            <button onClick={handleSignup}>Sign Up</button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
