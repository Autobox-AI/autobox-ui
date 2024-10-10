// app/login/page.tsx
import { useRouter } from "next/navigation"; // The new useRouter for App Router
import { useState } from "react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "admin") {
      router.push("/projects/1/simulations");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded">
        <div className="mb-4">
          <label>Username:</label>
          <input
            type="text"
            className="bg-gray-700 p-2 w-full rounded"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label>Password:</label>
          <input
            type="password"
            className="bg-gray-700 p-2 w-full rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="bg-blue-500 p-2 w-full rounded">
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
