import { Link } from "react-router-dom";
import { useState, useCallback } from "react";

import {
  Ship,
  ArrowRight,
  Anchor,
  Boxes,
  FileText,
  ShieldCheck,
  Waves,
  MapPin,
  TrendingUp,
  Truck,
  Lock,
} from "lucide-react";

import { IntroAnimation } from "../components/IntroAnimation";

import { getAllDestinations } from "../config/destinations";

const HERO_IMAGE =
  "https://images.pexels.com/photos/31244440/pexels-photo-31244440.jpeg?auto=compress&cs=tinysrgb&h=900&w=1600";

const SECONDARY_IMAGE =
  "https://images.pexels.com/photos/20581299/pexels-photo-20581299.jpeg?auto=compress&cs=tinysrgb&h=800&w=1200";

export default function LandingPage() {
  const destinations = getAllDestinations();

  const features = [
    {
      icon: MapPin,
      title: "Destination-organized",
      body: "Organize consignment files by Uganda, DRC, South Sudan, and Kenya, with color-coded destinations for easy identification.",
    },
    {
      icon: FileText,
      title: "Consignment management",
      body: "Keep bill of lading numbers, consignee details, cargo descriptions, and shipping information together in one place.",
    },
    {
      icon: Boxes,
      title: "Container information",
      body: "Keep container details and related shipping records organized alongside your consignment files.",
    },
    {
      icon: ShieldCheck,
      title: "Controlled access",
      body: "Support different user roles and administrator approval for accounts accessing the management system.",
    },
    {
      icon: TrendingUp,
      title: "Search and organization",
      body: "Find and manage consignment records efficiently, helping your team keep track of its daily operations.",
    },
    {
      icon: Lock,
      title: "Administration",
      body: "Provide administrators with dedicated tools for managing user accounts and access permissions.",
    },
  ];


const [showIntro, setShowIntro] = useState(() => {
  return !sessionStorage.getItem("amey_intro_shown");
});
  
const handleIntroDone = useCallback(() => {
  sessionStorage.setItem("amey_intro_shown", "true");
  setShowIntro(false);
}, []);

  return (
    <>
      {showIntro && <IntroAnimation onDone={handleIntroDone} />}{" "}
      <div className="min-h-screen bg-white">
        {/* Hero */}
        <header className="relative isolate overflow-hidden">
          <img
            src={HERO_IMAGE}
            alt="Cargo ships and containers at a commercial port"
            className="absolute inset-0 h-full w-full object-cover"
            fetchPriority="high"
          />

          {/* Dark overlay for readable text */}
          <div className="absolute inset-0 bg-slate-950/60" />

          {/* Gradient adds depth and darkens the bottom */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/60 via-slate-950/65 to-slate-950/30" />

          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/10 via-transparent to-slate-950/80" />

          <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
            <Link to="/" className="flex items-center gap-3 text-white">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
                <Ship size={24} />
              </div>

              <div className="leading-tight">
                <p className="font-display text-sm font-bold sm:text-base">
                  Amey Trading Company
                </p>
                <p className="mt-1 text-xs text-white/70">
                  Clearing &amp; Forwarding
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-xl px-3 py-2 text-sm font-medium text-white transition hover:bg-white/10 sm:px-4"
              >
                Sign in
              </Link>

              <Link
                to="/signup"
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-brand-800 transition hover:bg-brand-50"
              >
                Get access
              </Link>
            </div>
          </nav>

          <div className="relative z-10 mx-auto max-w-7xl px-4 pb-24 pt-16 sm:px-6 sm:pb-28 sm:pt-24 lg:px-8 lg:pb-32 lg:pt-28">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                <Anchor size={14} />
                Clearing &amp; Forwarding · East Africa
              </div>

              <h1 className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Moving cargo across borders with precision.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-white/80 sm:text-lg sm:leading-8">
                A centralized platform for managing consignment files, shipping
                information, cargo records, and operational documents across
                Uganda, the Democratic Republic of Congo, South Sudan, and
                Kenya.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link
                  to="/signup"
                  className="group inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-semibold text-brand-800 shadow-lg transition hover:-translate-y-0.5 hover:bg-brand-50"
                >
                  Request access
                  <ArrowRight
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                  Sign in to your account
                </Link>
              </div>

              <div className="mt-10 flex flex-wrap gap-2">
                {destinations.map((destination) => (
                  <span
                    key={destination.id}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-2 text-xs font-medium text-white backdrop-blur-sm"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: destination.color }}
                    />
                    {destination.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="relative z-10 -mb-px text-white" aria-hidden="true">
            <svg
              viewBox="0 0 1440 80"
              preserveAspectRatio="none"
              className="h-10 w-full sm:h-16"
            >
              <path
                d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </header>

        {/* Platform highlights */}
        <section className="bg-white px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: MapPin, value: "4", label: "Destination areas" },
              {
                icon: FileText,
                value: "Centralized",
                label: "Consignment records",
              },
              { icon: Boxes, value: "Organized", label: "Cargo information" },
              {
                icon: ShieldCheck,
                value: "Role-based",
                label: "Access management",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-ink-200 bg-white p-4 sm:p-5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <item.icon size={19} />
                </div>

                <p className="mt-4 text-lg font-bold text-ink-900 sm:text-xl">
                  {item.value}
                </p>

                <p className="mt-1 text-xs text-ink-500 sm:text-sm">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
              Our platform
            </p>

            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              Your logistics operations, organized in one place.
            </h2>

            <p className="mt-4 leading-7 text-ink-600">
              Designed to help your team manage important shipping records,
              organize consignments by destination, and maintain better
              visibility across daily operations.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.title}
                className="group rounded-2xl border border-ink-200 bg-white p-6 transition duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-600 group-hover:text-white">
                  <feature.icon size={21} />
                </div>

                <h3 className="mt-5 font-display text-lg font-semibold text-ink-900">
                  {feature.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-ink-600">
                  {feature.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Destinations */}
        <section className="bg-ink-50 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-brand-700">
                Our destinations
              </p>

              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
                Four corridors. One connected platform.
              </h2>

              <p className="mt-4 leading-7 text-ink-600">
                Keep destination-specific records easy to identify and organize
                through a consistent, centralized workflow.
              </p>
            </div>

            <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {destinations.map((destination) => (
                <article
                  key={destination.id}
                  className="relative overflow-hidden rounded-2xl border border-ink-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div
                    className="absolute -right-5 -top-5 h-24 w-24 rounded-full opacity-10"
                    style={{ backgroundColor: destination.color }}
                  />

                  <div
                    className="relative flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: `${destination.color}14`,
                      color: destination.color,
                    }}
                  >
                    <Ship size={22} />
                  </div>

                  <h3 className="relative mt-5 font-display text-lg font-semibold text-ink-900">
                    {destination.label}
                  </h3>

                  <p className="relative mt-2 text-sm leading-6 text-ink-600">
                    {destination.blurb}
                  </p>

                  <div
                    className="mt-5 h-1 w-full rounded-full"
                    style={{ backgroundColor: destination.color }}
                  />
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Logistics banner */}
        <section className="relative isolate overflow-hidden bg-ink-900">
          <img
            src={SECONDARY_IMAGE}
            alt="Cargo ship at a commercial shipping terminal"
            className="absolute inset-0 h-full w-full object-cover opacity-30"
            loading="lazy"
          />

          {/* Stronger overlay keeps the white text readable */}
          <div className="absolute inset-0 bg-slate-950/65" />

          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/55 via-slate-950/50 to-slate-950/45" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center lg:px-8">
            <div className="max-w-xl text-white">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium">
                <Waves size={14} />
                Cargo · Customs · Forwarding
              </div>

              <h2 className="mt-5 font-display text-3xl font-bold leading-tight sm:text-4xl">
                A clearer view of your logistics operations.
              </h2>

              <p className="mt-4 leading-7 text-white/75">
                Bring consignment records and shipping information together in
                one organized workspace, helping your team find the information
                it needs.
              </p>

              <Link
                to="/signup"
                className="mt-7 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-white backdrop-blur-sm hover:-translate-y-0.25 hover:shadow-white"
              >
                Request access
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: FileText, label: "Consignment records" },
                { icon: Boxes, label: "Cargo information" },
                { icon: Truck, label: "Shipping details" },
                { icon: ShieldCheck, label: "Managed user access" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-4 text-white backdrop-blur-sm"
                >
                  <item.icon size={20} className="shrink-0 text-brand-300" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to action */}
        <section className="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white">
              <Ship size={28} />
            </div>

            <h2 className="mt-6 font-display text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
              Let's move your operations forward.
            </h2>

            <p className="mx-auto mt-4 max-w-2xl leading-7 text-ink-600">
              Request access to the Amey Trading Company management platform.
              Your account will be reviewed by an administrator before access is
              granted.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-xl border bg-blue-800 border-white px-4 py-4 text-white backdrop-blur-sm hover:-translate-y-0.25 hover:shadow-lg"
              >
                Request access
                <ArrowRight size={17} />
              </Link>

              <Link
                to="/login"
                className="btn btn-secondary px-5 py-3 text-sm bg-green-800 text-white gap-2 rounded-xl items-center inline-flex hover:-translate-y-0.25 hover:shadow-lg"
              >
                Sign in to your account
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-ink-200 bg-ink-50">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-7 sm:flex-row sm:px-6 lg:px-8">
            <Link to="/" className="flex items-center gap-3 text-ink-800">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
                <Ship size={19} />
              </div>

              <div>
                <p className="text-sm font-semibold">Amey Trading Company</p>
                <p className="mt-0.5 text-xs text-ink-500">
                  Clearing &amp; Forwarding
                </p>
              </div>
            </Link>

            <p className="text-center text-xs text-ink-500">
              Cargo · Customs · Forwarding across East Africa
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}

