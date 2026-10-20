import { FolderPlus } from "lucide-react";

function DestinationBadge({ destination }) {
  return (
    <div
      className="grid h-11 w-11 place-items-center rounded-xl text-sm font-bold"
      style={{
        backgroundColor: `${destination.color}1A`,
        color: destination.color,
        boxShadow: `inset 0 0 0 1.5px ${destination.color}40`,
      }}
    >
      {destination.code}
    </div>
  );
}

export default function DestinationSection({
  destination,
  items = [],
  total = 0,
  canCreate = false,
  onCreate,
  renderFolder,
}) {
  return (
    <section
      aria-labelledby={`dest-${destination.key}`}
      className="border-t border-slate-200 py-6"
    >
      {/* Destination heading */}
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <DestinationBadge destination={destination} />

          <div>
            <h2
              id={`dest-${destination.key}`}
              className="text-xl font-semibold text-slate-900"
            >
              {destination.label}
            </h2>

            <p className="text-xs text-slate-500">
              {items.length === total
                ? `${total} ${total === 1 ? "folder" : "folders"}`
                : `${items.length} of ${total} folders`}
            </p>
          </div>
        </div>

        {/* Create folder button */}
        {canCreate && destination.key !== "other" && (
          <button
            type="button"
            onClick={() => onCreate?.(destination)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            <FolderPlus size={16} />
            New File
          </button>
        )}
      </header>

      {/* Folder grid */}
      {items.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((item, index) => (
            <div key={item.id ?? index}>
              {renderFolder ? (
                renderFolder(item, destination)
              ) : (
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="font-medium text-slate-900">
                    {item.bl_number ?? item.blNumber ?? "Consignment"}
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    {item.consignee ?? "No consignee specified"}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 px-4 py-8 text-center">
          <p className="text-sm text-slate-500">
            {total > 0
              ? "No folders match your filters."
              : "No folders in this destination yet."}
          </p>
        </div>
      )}
    </section>
  );
}
