import { useEffect } from "react";
import {
  X,
  ArrowUpRight,
  FileText,
  User,
  Boxes,
  Ship,
  Calendar,
  Package,
  FolderOpen,
} from "lucide-react";

function getValue(record, ...keys) {
  for (const key of keys) {
    const value = record?.[key];

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return null;
}

function getContainerNumber(container) {
  return getValue(container, "container_number", "number");
}

function getContainerSize(container) {
  return getValue(container, "container_size", "size");
}

function formatDate(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function InfoCard({ icon: Icon, label, value }) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  return (
    <div className="min-w-0 rounded-xl bg-slate-50 p-3.5">
      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        <Icon size={14} className="shrink-0" />
        <span>{label}</span>
      </div>

      <p className="mt-2 break-words text-sm font-semibold text-slate-800">
        {String(value)}
      </p>
    </div>
  );
}

export default function FolderPreview({
  open,
  onClose,
  record,
  containers = [],
  destination,
  onOpenDetails,
}) {
  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || !record) return null;

  const blNumber = getValue(record, "bl_number", "blNumber");
  const consignee = getValue(record, "consignee");
  const cargo = getValue(record, "cargo_description", "cargoDescription");
  const shippingLine = getValue(record, "shipping_line", "shippingLine");
  const category = getValue(record, "category", "destination");
  const depot = getValue(record, "depot_name", "depotName");
  const openedDate = getValue(record, "date_opened", "dateOpened", "date");

  const validContainers = Array.isArray(containers) ? containers : [];

  const containerNumbers = validContainers
    .map(getContainerNumber)
    .filter(Boolean);

  const containerSizes = [
    ...new Set(validContainers.map(getContainerSize).filter(Boolean)),
  ];

  const color = destination?.color || "#475569";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="folder-preview-title"
        className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        {/* Header */}
        <header className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: `${color}15`,
                  color,
                }}
              >
                <FolderOpen size={23} />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Consignment Preview
                </p>

                <h2
                  id="folder-preview-title"
                  className="mt-1 break-words text-lg font-bold text-slate-900 sm:text-xl"
                >
                  {blNumber || "Consignment"}
                </h2>

                <div className="mt-2 flex items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />

                  <span className="text-xs font-medium text-slate-500">
                    {destination?.label || category || "Uncategorized"}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close preview"
              className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-blue-500"
            >
              <X size={19} />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="max-h-[65vh] space-y-5 overflow-y-auto p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoCard
              icon={FileText}
              label="Bill of Lading"
              value={blNumber}
            />

            <InfoCard
              icon={User}
              label="Consignee"
              value={consignee}
            />

            <InfoCard
              icon={Ship}
              label="Shipping Line"
              value={shippingLine}
            />

            <InfoCard
              icon={Calendar}
              label="Date Opened"
              value={formatDate(openedDate)}
            />

            <InfoCard
              icon={Boxes}
              label="Containers"
              value={`${validContainers.length} total`}
            />

            <InfoCard
              icon={Package}
              label="Depot"
              value={depot}
            />
          </div>

          {cargo && (
            <section>
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Cargo Description
              </h3>

              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">
                {cargo}
              </p>
            </section>
          )}

          {containerNumbers.length > 0 && (
            <section>
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Container Numbers
                </h3>

                <span className="text-xs text-slate-400">
                  {containerNumbers.length} containers
                </span>
              </div>

              <div className="mt-2 flex flex-wrap gap-2">
                {containerNumbers.map((number, index) => (
                  <span
                    key={`${number}-${index}`}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs font-medium text-slate-700"
                  >
                    {number}
                  </span>
                ))}
              </div>
            </section>
          )}

          {containerSizes.length > 0 && (
            <section>
              <h3 className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Container Sizes
              </h3>

              <div className="mt-2 flex flex-wrap gap-2">
                {containerSizes.map((size) => (
                  <span
                    key={size}
                    className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700"
                  >
                    {size}
                  </span>
                ))}
              </div>
            </section>
          )}

          {validContainers.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 px-4 py-5 text-center">
              <Boxes size={22} className="mx-auto text-slate-300" />

              <p className="mt-2 text-sm font-medium text-slate-600">
                No containers added yet
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Container details will appear here when available.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-blue-500"
          >
            Close
          </button>

          <button
            type="button"
            onClick={onOpenDetails}
            className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            style={{ backgroundColor: color }}
          >
            Open Full Details
            <ArrowUpRight size={16} />
          </button>
        </footer>
      </section>
    </div>
  );
}

