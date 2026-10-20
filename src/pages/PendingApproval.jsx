import { Link } from "react-router-dom";
import { Clock, Ship, ArrowLeft } from "lucide-react";
import cargoHero from "../assets/cargo-hero.jpg";

export default function PendingApproval() {
  return (
    <main className="grid min-h-screen bg-slate-50 lg:grid-cols-[1.05fr_1fr]">
      {/* Left branding panel */}
      <aside className="relative hidden overflow-hidden bg-navy lg:block">
        <img
          src={cargoHero}
          alt="Container ship transporting cargo"
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />

        <div className="relative flex min-h-screen flex-col justify-between p-12">
          {/* Brand */}
          <Link to="/login" className="inline-flex items-center gap-3">
            <span className="relative grid size-11 place-items-center rounded-lg bg-white/10 text-white ring-1 ring-white/20">
              <Ship size={23} />

              <span className="absolute -bottom-1 -right-1 size-3 rounded-sm bg-yellow-400 ring-2 ring-navy" />
            </span>

            <span className="leading-tight">
              <span className="block text-base font-bold text-white">
                Amey Trading
              </span>

              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
                Clearing &amp; Forwarding
              </span>
            </span>
          </Link>

          {/* Main branding content */}
          <div className="max-w-md">
            <h2 className="text-4xl font-semibold leading-tight text-white">
              Every consignment, from port or CFS to destination.
            </h2>

            <div className="mt-6 flex flex-wrap gap-2">
              {[
                { name: "Uganda", color: "#2563EB" },
                { name: "DRC", color: "#16A34A" },
                { name: "South Sudan", color: "#EAB308" },
                { name: "Local / Kenya", color: "#DC2626" },
              ].map((destination) => (
                <span
                  key={destination.name}
                  className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-navy/50 px-3 py-2 text-xs text-white/90 backdrop-blur"
                >
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: destination.color }}
                  />

                  {destination.name}
                </span>
              ))}
            </div>
          </div>

          <p className="text-sm text-white/50">
            © {new Date().getFullYear()} Amey Trading Company. All rights
            reserved.
          </p>
        </div>
      </aside>

      {/* Right content panel */}
      <section className="flex min-h-screen items-center justify-center px-5 py-12 sm:px-10">
        <div className="w-full max-w-sm">
          {/* Mobile branding */}
          <Link
            to="/login"
            className="mb-10 inline-flex items-center gap-3 lg:hidden"
          >
            <span className="grid size-10 place-items-center rounded-lg bg-navy text-white">
              <Ship size={21} />
            </span>

            <span className="leading-tight">
              <span className="block font-bold text-navy">Amey Trading</span>

              <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Clearing &amp; Forwarding
              </span>
            </span>
          </Link>

          <h1 className="text-3xl font-semibold tracking-tight text-navy">
            Account pending approval
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            One more step before you can get started.
          </p>

          {/* Approval status card */}
          <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid size-12 place-items-center rounded-full bg-blue-50 text-blue-700">
              <Clock size={23} />
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-600">
              Your account has been created but is not active yet. An Amey
              Trading administrator must review and activate it before you can
              view consignment information. You’ll be able to sign in once it
              has been approved.
            </p>

            <div className="mt-5 flex items-start gap-3 rounded-lg bg-amber-50 p-3">
              <Clock size={17} className="mt-0.5 shrink-0 text-amber-600" />

              <p className="text-xs leading-5 text-amber-800">
                <span className="font-semibold">Status: Awaiting review.</span>{" "}
                Your operational access will remain restricted until an
                administrator approves your account.
              </p>
            </div>
          </div>

          {/* Back to login */}
          <Link
            to="/login"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-800"
          >
            <ArrowLeft size={16} />
            Back to sign in
          </Link>

          <p className="mt-10 text-xs text-slate-400">
            Authorized personnel only
          </p>
        </div>
      </section>
    </main>
  );
}
