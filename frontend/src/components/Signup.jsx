import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/global-store.jsx";
function Signup() {
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
  });
  
  const navigate = useNavigate();
  const setAuthUser = useAuthStore((state) => state.setAuthUser);
  const refetch = useAuthStore((state) => state.refetch);

  const { mutate, isError, isPending, error } = useMutation({
    mutationFn: async ({ email, username, fullname, password }) => {
      try {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, username, fullname, password }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create account");
        return data;
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    onSuccess: async (data) => {
      console.log('API Response Data:', data); // Check the data received
      setAuthUser(data); // Update the global state
      await refetch(); // Invalidate the authUser query
      navigate("/Rolechoose"); // Redirect to the admin page
    },    
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(formData); // Trigger the mutation
  };

  const handleLogin = () => {
    navigate("/Login");
  };

  return (
    <div className="container">
      <h1>Sign Up</h1>
      <div className="card">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="fullname"
            placeholder="Full Name"
            value={formData.fullname}
            onChange={handleInputChange}
          />
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleInputChange}
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
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
            {isPending ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
        {isError && <p className="error">{error.message}</p>}
        <div className="login-prompt">
          <p>
            Already have an account?{" "}
            <button onClick={handleLogin}>Login</button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;