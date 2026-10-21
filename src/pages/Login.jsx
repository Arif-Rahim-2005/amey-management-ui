import { Link, useNavigate } from "react-router-dom";
import cargoHero from "../assets/cargo-hero.jpg";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;
  async function handleLogin(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed. Please try again.");
        return;
      }

      if (!data.access_token || !data.user) {
        setError("The server returned an unexpected login response.");
        return;
      }

      sessionStorage.setItem("access_token", data.access_token);
      sessionStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (err) {
      setError(
        "Unable to connect to the server. Please check that the backend is running.",
      );
    } finally {
      setLoading(false);
    }
  }

  const destinations = [
    { name: "Uganda", color: "bg-blue-500" },
    { name: "DRC", color: "bg-green-500" },
    { name: "South Sudan", color: "bg-yellow-400" },
    { name: "Local / Kenya", color: "bg-red-500" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* Left branding panel */}
      <section className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-navy p-12 text-white lg:flex">
        {/* Cargo background image */}
        <img
          src={cargoHero}
          alt="Cargo logistics and transportation"
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />

        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy/95 via-navy/80 to-navy/60" />

        {/* Company branding */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-xl font-bold">
            A
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-wide">AMEY TRADING</h1>

            <p className="text-xs tracking-[0.2em] text-slate-300">
              COMPANY LIMITED
            </p>
          </div>
        </div>

        {/* Main heading and destinations */}
        <div className="relative z-10 max-w-xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">
            Logistics Management
          </p>

          <h2 className="text-4xl font-bold leading-tight xl:text-5xl">
            Every consignment, from port or CFS to destination.
          </h2>

          <p className="mt-6 max-w-lg text-base leading-7 text-slate-200">
            Manage consignments, track containers, organize documents, and keep
            your team informed in one place.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {destinations.map((destination) => (
              <div
                key={destination.name}
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm"
              >
                <span
                  className={`h-2.5 w-2.5 rounded-full ${destination.color}`}
                />

                {destination.name}
              </div>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <p className="relative z-10 text-sm text-slate-300">
          © {new Date().getFullYear()} Amey Trading Company
        </p>
      </section>

      {/* Login panel */}
      <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10">
        <div className="w-full max-w-md">
          {/* Mobile branding */}
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy text-xl font-bold text-white">
              A
            </div>

            <div>
              <h1 className="font-bold tracking-wide text-slate-900">
                AMEY TRADING
              </h1>
              <p className="text-xs tracking-[0.2em] text-slate-500">
                COMPANY LIMITED
              </p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Welcome back
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Sign in to access your consignment management workspace.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Password
              </label>

              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute inset-y-0 right-0 flex items-center justify-center px-4 text-slate-400 transition hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lgpx-4 py-3.5 text-sm font-semibold text-navy hover:text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            New to Amey Trading?{" "}
            <Link
              to="/signup"
              className="font-semibold text-blue-700 hover:text-blue-800"
            >
              Request an account
            </Link>
          </p>

          <p className="mt-10 text-center text-xs text-slate-400">
            Authorized personnel only
          </p>
        </div>
      </section>
    </main>
  );
}
