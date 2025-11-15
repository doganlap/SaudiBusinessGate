// Saudi Business Gate - Complete React App (Tailwind + Dark Mode + Backend Ready)
// Pages: Landing, Demo Tracker, PoC Tracker, Login

import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useState } from "react";
import "./App.css";
import "./tailwind.output.css";

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-10">
      <header className="space-y-3">
        <h1 className="text-4xl font-bold text-cyan-400">Saudi Business Gate</h1>
        <p className="text-lg">The World’s First Autonomous Business Gate — Born in Saudi Arabia</p>
        <nav className="flex space-x-6 text-cyan-300">
          <Link to="/login">Login</Link>
          <Link to="/demo">Book Demo</Link>
          <Link to="/poc">Request PoC</Link>
        </nav>
      </header>

      <main className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold text-white">Empowering Enterprise Autonomy</h2>
        <p className="text-slate-300 max-w-xl">
          Built to run Sales, Finance, HR, Projects, and Compliance — with agents, AI, and full audit trace.
        </p>
        <p className="text-sm text-slate-400">
          ⚙️ Track PoCs. 🧠 Request AI Demos. 🔐 Secure Entry for Saudi Enterprise Teams.
        </p>
      </main>

      <footer className="mt-20 border-t border-slate-700 pt-4 text-sm text-slate-500">
        Powered by DoganConsult · Orchestrated by Shahin AI · www.shahin-ai.com
      </footer>
    </div>
  );
}

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-xl w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold text-cyan-300 mb-4">Login to Saudi Business Gate</h2>
        <form>
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 mb-3 rounded bg-gray-700 text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 py-2 rounded font-semibold"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

function DemoPage() {
  const [form, setForm] = useState({ name: "", org: "", email: "" });

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-xl w-full max-w-md shadow-xl">
        <h2 className="text-xl font-semibold text-cyan-300 mb-2">Book an Executive Demo</h2>
        <p className="text-sm text-slate-400 mb-4">See how autonomy powers Sales, PMO, and Finance workflows end-to-end.</p>
        <form method="POST" action="https://formspree.io/f/your-form-id">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-2 mb-3 rounded bg-gray-700 text-white"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Organization"
            className="w-full p-2 mb-3 rounded bg-gray-700 text-white"
            value={form.org}
            onChange={(e) => setForm({ ...form, org: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 py-2 rounded font-semibold"
          >
            Request Demo
          </button>
        </form>
      </div>
    </div>
  );
}

function PocPage() {
  const [form, setForm] = useState({ team: "", useCase: "", email: "" });

  return (
    <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-xl w-full max-w-md shadow-xl">
        <h2 className="text-xl font-semibold text-cyan-300 mb-2">Request a PoC (Proof of Concept)</h2>
        <p className="text-sm text-slate-400 mb-4">Submit your department and use case. Our team will contact you to scope and demo a live PoC.</p>
        <form method="POST" action="https://formspree.io/f/your-form-id">
          <input
            type="text"
            placeholder="Team / Department"
            className="w-full p-2 mb-3 rounded bg-gray-700 text-white"
            value={form.team}
            onChange={(e) => setForm({ ...form, team: e.target.value })}
          />
          <input
            type="text"
            placeholder="Use Case / Goal"
            className="w-full p-2 mb-3 rounded bg-gray-700 text-white"
            value={form.useCase}
            onChange={(e) => setForm({ ...form, useCase: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <button
            type="submit"
            className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 py-2 rounded font-semibold"
          >
            Submit Request
          </button>
        </form>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/poc" element={<PocPage />} />
      </Routes>
    </Router>
  );
}