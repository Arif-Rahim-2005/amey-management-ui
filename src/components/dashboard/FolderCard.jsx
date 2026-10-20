import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, FolderOpen, ArrowUpRight } from "lucide-react";
import FolderPreview from "./FolderPreview";

function getValue(record, ...keys) {
  for (const key of keys) {
    const value = record?.[key];

    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }

  return null;
}

function getContainers(record) {
  return Array.isArray(record?.containers) ? record.containers : [];
}

function getContainerNumber(container) {
  return getValue(container, "container_number", "number");
}

function getContainerSize(container) {
  return getValue(container, "container_size", "size");
}

function containerSummary(containers) {
  const counts = {};

  containers.forEach((container) => {
    const size = getContainerSize(container);

    if (size) {
      counts[size] = (counts[size] || 0) + 1;
    }
  });

  return Object.entries(counts)
    .map(([size, count]) => `${count}×${size}`)
    .join(", ");
}

export default function FolderCard({ record, destination }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const navigate = useNavigate();

  const containers = getContainers(record);

  const id = getValue(record, "id");
  const billOfLading = getValue(record, "bl_number", "blNumber");
  const consignee = getValue(record, "consignee");
  const cargo = getValue(record, "cargo_description", "cargoDescription");

  const numberedContainers = containers.filter(getContainerNumber);
  const visibleContainers = numberedContainers.slice(0, 2);
  const extraContainers = numberedContainers.length - visibleContainers.length;
  const summary = containerSummary(containers);

  function openDetails() {
    setPreviewOpen(false);

    if (id != null) {
      navigate(`/files/${id}`);
    }
  }

  return (
    <>
      <div className="relative min-w-0">
        <Link
          to={id != null ? `/files/${id}` : "#"}
          onClick={(event) => {
            if (id == null) {
              event.preventDefault();
            }
          }}
          aria-label={`Open consignment ${billOfLading || ""}`}
          className="relative block overflow-hidden rounded-xl border border-slate-200 bg-white p-4 pt-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        >
          {/* Destination color strip */}
          <span
            className="absolute inset-x-0 top-0 h-1"
            style={{
              backgroundColor: destination?.color || "#64748b",
            }}
          />

          <div className="flex items-start gap-3">
            <FolderOpen
              size={21}
              className="mt-0.5 shrink-0"
              style={{
                color: destination?.color || "#64748b",
              }}
            />

            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Bill of Lading
              </p>

              <p className="break-words pr-5 font-semibold text-slate-900">
                {billOfLading || "—"}
              </p>
            </div>
          </div>

          {consignee && (
            <p className="mt-3 truncate text-sm font-medium text-slate-800">
              {consignee}
            </p>
          )}

          {cargo && (
            <p className="mt-1 line-clamp-2 text-xs text-slate-500">
              {cargo}
            </p>
          )}

          {containers.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {summary && (
                <span className="rounded-md bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700">
                  {summary}
                </span>
              )}

              {visibleContainers.map((container, index) => {
                const number = getContainerNumber(container);

                return (
                  <span
                    key={number || index}
                    className="rounded-md border border-slate-200 px-2 py-1 font-mono text-[11px] text-slate-600"
                  >
                    {number}
                  </span>
                );
              })}

              {extraContainers > 0 && (
                <span className="text-[11px] font-medium text-slate-500">
                  +{extraContainers} more
                </span>
              )}
            </div>
          )}

          <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-slate-400">
            View consignment
            <ArrowUpRight size={13} />
          </span>
        </Link>

        {/* Preview button */}
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          aria-label="Preview consignment"
          aria-expanded={previewOpen}
          title="Preview consignment"
          className="absolute right-2 top-2 z-10 rounded-md p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-blue-500"
        >
          <Eye size={16} />
        </button>
      </div>

      {/* Separate preview component */}
      <FolderPreview
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        record={record}
        containers={containers}
        destination={destination}
        onOpenDetails={openDetails}
      />
    </>
  );
}
