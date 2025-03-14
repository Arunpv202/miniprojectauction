import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/global-store.jsx";
import "../styles.css"; // Import the CSS file

function Login() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const navigate = useNavigate();
  const setAuthUser = useAuthStore((state) => state.setAuthUser);
  const refetch = useAuthStore((state) => state.refetch);

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
    onSuccess: async (data) => {
      console.log(data);
      setAuthUser(data);
      await refetch();
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
    <div className="login-container">
      <h1 className="eauction-heading">E-AUCTION</h1>
      <p className="slogan">Bid Bold, Win Gold!</p>
      <div className="login-card">
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleInputChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
          <button type="submit" disabled={isPending}>
            {isPending ? "Logging In..." : "Login"}
          </button>
        </form>
        {isError && <p className="error">{error.message}</p>}
        <div className="signup-prompt">
          <p>
            Don't have an account?{" "}
            <button className="signup-btn" onClick={handleSignup}>Sign Up</button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
