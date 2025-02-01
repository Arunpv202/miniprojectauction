import { useAuthStore } from "../store/global-store.jsx";
function Admin() {
  //const authUser = JSON.parse(localStorage.getItem("authUser")) || {};  // Defaults to an empty object if null or undefined
  const authUser = useAuthStore((state) => state.authUser);
  return (
    <div className="container">
      <h1>You Passed!</h1>
      {authUser && authUser.username && (  // Ensure authUser has a username before rendering
        <div>
          <h2>Welcome, {authUser.username}!</h2>
          <p>Email: {authUser.email}</p>
        </div>
      )}
    </div>
  );
}

export default Admin;