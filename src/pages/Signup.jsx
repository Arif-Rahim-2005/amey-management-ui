import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowLeft, UserPlus } from "lucide-react";
import cargoHero from "../assets/cargo-hero.jpg";

export default function Signup() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(event) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://127.0.0.1:5000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to create your account.");
        return;
      }

      navigate("/pending-approval");
    } catch (err) {
      setError("Unable to connect to the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2">
      {/* Left branding panel */}
      <section className="relative hidden min-h-screen flex-col justify-between overflow-hidden bg-navy p-12 text-white lg:flex">
        <img
          src={cargoHero}
          alt="Cargo logistics and transportation"
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />

        <div className="absolute inset-0 bg-gradient-to-br from-navy/95 via-navy/80 to-navy/60" />

        <div className="relative z-10">
          <Link to="/login" className="inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
              <span className="text-xl font-bold">A</span>
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-wide">AMEY TRADING</h1>
              <p className="text-xs tracking-[0.2em] text-blue-200">
                LOGISTICS & FORWARDING
              </p>
            </div>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">
            Join Our Network
          </p>

          <h2 className="text-4xl font-bold leading-tight xl:text-5xl">
            Your logistics operations, connected in one place.
          </h2>

          <p className="mt-6 max-w-md text-base leading-7 text-slate-200">
            Request access to the Amey Trading management platform and keep your
            consignments, containers, and documents organized.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {[
              "Consignment Tracking",
              "Document Management",
              "Team Collaboration",
            ].map((feature) => (
              <span
                key={feature}
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-slate-100 backdrop-blur-sm"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-sm text-slate-300">
          © {new Date().getFullYear()} Amey Trading Company. All rights
          reserved.
        </p>
      </section>

      {/* Right signup panel */}
      <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10 lg:px-12">
        <div className="w-full max-w-md">
          {/* Mobile branding */}
          <Link to="/login" className="mb-10 flex items-center gap-3 lg:hidden">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy text-white">
              <span className="text-xl font-bold">A</span>
            </div>

            <div>
              <h1 className="font-bold tracking-wide text-navy">
                AMEY TRADING
              </h1>
              <p className="text-xs tracking-wider text-slate-500">
                LOGISTICS & FORWARDING
              </p>
            </div>
          </Link>

          <Link
            to="/login"
            className="mb-8 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-navy"
          >
            <ArrowLeft size={16} />
            Back to sign in
          </Link>

          <div className="mb-8">
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
              <UserPlus size={24} />
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-navy">
              Request an account
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Create your account to request access to the Amey Trading
              management system.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Username
              </label>

              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="Choose a username"
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Work email address
              </label>

              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
              />
            </div>

            {/* Password */}
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
                  autoComplete="new-password"
                  placeholder="Create a password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Use at least 8 characters.
              </p>
            </div>

            {/* Confirm password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Confirm password
              </label>

              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="Enter your password again"
                  required
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((visible) => !visible)}
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 hover:text-slate-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-lg bg-navy px-4 py-3.5 text-sm font-semibold text-navy
              transition hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-4 focus:ring-navy/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-blue-700 transition hover:text-blue-800"
            >
              Sign in
            </Link>
          </p>

          <div className="mt-8 rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-xs leading-5 text-slate-500">
              <span className="font-semibold text-slate-700">
                Account approval required.
              </span>{" "}
              New accounts must be reviewed and activated by an Amey Trading
              administrator before operational information becomes accessible.
            </p>
          </div>

          <p className="mt-8 text-center text-xs text-slate-400">
            Authorized personnel only
          </p>
        </div>
      </section>
    </main>
  );
}
