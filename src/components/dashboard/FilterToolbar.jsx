import { useState } from "react";
import {
  Lock,
  RotateCcw,
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const inputClass =
  "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const buttonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50";

const sectionClass = "rounded-xl border border-slate-200 p-3 sm:p-4";

const labelClass = "mb-1.5 block text-xs font-medium text-slate-600";

function FilterField({ label, children }) {
  return (
    <label className="block min-w-0">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

function FilterSection({ title, children }) {
  return (
    <section className={sectionClass}>
      <h3 className="mb-3 text-sm font-semibold text-slate-800">{title}</h3>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </section>
  );
}

function SelectField({ label, value, onChange, options, placeholder = "All" }) {
  return (
    <FilterField label={label}>
      <select
        aria-label={label}
        className={inputClass}
        value={value ?? ""}
        onChange={onChange}
      >
        <option value="">{placeholder}</option>

        {options.map((option) => {
          const item =
            typeof option === "string"
              ? { value: option, label: option }
              : option;

          return (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          );
        })}
      </select>
    </FilterField>
  );
}

function TextField({ label, value, onChange, placeholder }) {
  return (
    <FilterField label={label}>
      <input
        aria-label={label}
        className={inputClass}
        placeholder={placeholder ?? label}
        value={value ?? ""}
        onChange={onChange}
      />
    </FilterField>
  );
}

function DateField({ label, value, onChange, min, max }) {
  return (
    <FilterField label={label}>
      <input
        type="date"
        aria-label={label}
        className={inputClass}
        value={value ?? ""}
        min={min || undefined}
        max={max || undefined}
        onChange={onChange}
      />
    </FilterField>
  );
}

function ToggleField({ label, value, onChange }) {
  return (
    <FilterField label={label}>
      <select
        aria-label={label}
        className={inputClass}
        value={value ?? ""}
        onChange={onChange}
      >
        <option value="">All</option>
        <option value="true">Yes</option>
        <option value="false">No</option>
      </select>
    </FilterField>
  );
}

export default function FilterToolbar({
  filters,
  onChange,
  onReset,
  options,
  onLockClick,
}) {
  const [more, setMore] = useState(false);

  const set = (key) => (event) => {
    onChange({
      ...filters,
      [key]: event.target.value,
    });
  };

  const hasAdvancedFilters = [
    "container",
    "cargo",
    "shippingLine",
    "containerSize",
    "containerType",
    "truckNumber",
    "storageLocationType",
    "storageLocationName",
    // "initialEtaFrom",
    // "initialEtaTo",
    "currentEtaFrom",
    "currentEtaTo",
    "guaranteeExpiryFrom",
    "guaranteeExpiryTo",
    // "freeDays",
    "offloaded",
    "offloadedFrom",
    "offloadedTo",
    "exited",
    "exitedFrom",
    "exitedTo",
    "reachedDepot",
    // "reachedDepotFrom",
    // "reachedDepotTo",
    "depotName",
    "kwatosStatus",
    "shippingChargesRequested",
    // "shippingChargesPaid",
    "doRequested",
    // "doObtained",
    "fileStatus",
    "vesselName",
    // "readyToClose",
    // "closureReason",
  ].some((key) => filters[key] !== undefined);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      {/* Main toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {options.hasBl && (
          <label className="relative min-w-0 flex-1 basis-full sm:basis-auto sm:min-w-[220px]">
            <span className="sr-only">Search bill of lading</span>

            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              className={`${inputClass} pl-9`}
              placeholder="Search bill of lading..."
              value={filters.bl ?? ""}
              onChange={set("bl")}
            />
          </label>
        )}

        {options.hasConsignee && (
          <input
            aria-label="Search consignee"
            className={`${inputClass} hidden max-w-[200px] md:block`}
            placeholder="Consignee"
            value={filters.consignee ?? ""}
            onChange={set("consignee")}
          />
        )}

        <select
          aria-label="Sort folders"
          className={`${inputClass} w-auto`}
          value={filters.sort ?? "newest"}
          onChange={set("sort")}
        >
          {options.hasDate && <option value="newest">Newest first</option>}
          {options.hasDate && <option value="oldest">Oldest first</option>}
          <option value="alpha">A–Z</option>
        </select>

        <button
          type="button"
          onClick={() => setMore((previous) => !previous)}
          aria-expanded={more}
          aria-controls="advanced-filters"
          className={buttonClass}
        >
          <SlidersHorizontal size={16} />
          More Filters
          {more ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </button>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
        >
          <RotateCcw size={16} />
          Reset
        </button>

        <button
          type="button"
          onClick={onLockClick}
          aria-label="User management"
          title="User management"
          className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#101d35] text-white transition hover:opacity-90"
        >
          <Lock size={16} />
        </button>
      </div>

      {/* Advanced filters */}
      {more && (
        <div
          id="advanced-filters"
          className="mt-4 space-y-4 border-t border-slate-200 pt-4"
        >
          {options.hasConsignee && (
            <div className="md:hidden">
              <TextField
                label="Consignee"
                value={filters.consignee}
                onChange={set("consignee")}
              />
            </div>
          )}

          {/* 1. Consignment details */}
          <FilterSection title="Consignment Details">
            {options.hasContainers && (
              <TextField
                label="Container Number"
                value={filters.container}
                onChange={set("container")}
              />
            )}

            {options.hasCargo && (
              <TextField
                label="Cargo Description"
                value={filters.cargo}
                onChange={set("cargo")}
              />
            )}

            <TextField
              label="Vessel Name"
              value={filters.vesselName}
              onChange={set("vesselName")}
            />

            <SelectField
              label="Destination"
              value={filters.destination}
              onChange={set("destination")}
              options={[
                { value: "uganda", label: "Uganda" },
                { value: "drc", label: "DRC" },
                { value: "south-sudan", label: "South Sudan" },
                { value: "local", label: "Kenya / Local" },
              ]}
            />

            {options.shippingLines.length > 0 && (
              <SelectField
                label="Shipping Line"
                value={filters.shippingLine}
                onChange={set("shippingLine")}
                options={options.shippingLines}
                placeholder="All shipping lines"
              />
            )}

            <SelectField
              label="File Status"
              value={filters.fileStatus}
              onChange={set("fileStatus")}
              options={[
                { value: "OPEN", label: "Open" },
                { value: "CLOSED", label: "Closed" },
              ]}
            />

            {/* <TextField
              label="Closure Reason"
              value={filters.closureReason}
              onChange={set("closureReason")}
            />

            <ToggleField
              label="Ready to Close"
              value={filters.readyToClose}
              onChange={set("readyToClose")}
            /> */}

            {options.hasDate && (
              <>
                <DateField
                  label="File Opened From"
                  value={filters.dateFrom}
                  onChange={set("dateFrom")}
                  max={filters.dateTo}
                />

                <DateField
                  label="File Opened To"
                  value={filters.dateTo}
                  onChange={set("dateTo")}
                  min={filters.dateFrom}
                />
              </>
            )}
          </FilterSection>

          {/* 2. ETA and deadlines */}
          <FilterSection title="ETA & Deadlines">
            {/* <DateField
              label="Initial ETA From"
              value={filters.initialEtaFrom}
              onChange={set("initialEtaFrom")}
              max={filters.initialEtaTo}
            /> */}

            {/* <DateField
              label="Initial ETA To"
              value={filters.initialEtaTo}
              onChange={set("initialEtaTo")}
              min={filters.initialEtaFrom}
            /> */}

            <DateField
              label="Current ETA From"
              value={filters.currentEtaFrom}
              onChange={set("currentEtaFrom")}
              max={filters.currentEtaTo}
            />

            <DateField
              label="Current ETA To"
              value={filters.currentEtaTo}
              onChange={set("currentEtaTo")}
              min={filters.currentEtaFrom}
            />

            <DateField
              label="Guarantee Expiry From"
              value={filters.guaranteeExpiryFrom}
              onChange={set("guaranteeExpiryFrom")}
              max={filters.guaranteeExpiryTo}
            />

            <DateField
              label="Guarantee Expiry To"
              value={filters.guaranteeExpiryTo}
              onChange={set("guaranteeExpiryTo")}
              min={filters.guaranteeExpiryFrom}
            />

            {/* <TextField
              label="Free Days"
              value={filters.freeDays}
              onChange={set("freeDays")}
              placeholder="Number of free days"
            /> */}
          </FilterSection>

          {/* 3. Container and movement */}
          <FilterSection title="Container Movement & Storage">
            {options.containerSizes.length > 0 && (
              <SelectField
                label="Container Size"
                value={filters.containerSize}
                onChange={set("containerSize")}
                options={options.containerSizes}
                placeholder="All sizes"
              />
            )}

            <SelectField
              label="Container Type"
              value={filters.containerType}
              onChange={set("containerType")}
              options={["DRY", "REEFER", "OPEN_TOP", "FLAT_RACK", "TANK"]}
            />

            <TextField
              label="Truck Number"
              value={filters.truckNumber}
              onChange={set("truckNumber")}
            />

            <SelectField
              label="Storage Location Type"
              value={filters.storageLocationType}
              onChange={set("storageLocationType")}
              options={[
                { value: "PORT", label: "Port" },
                { value: "CFS", label: "CFS" },
              ]}
            />

            <TextField
              label="Port / CFS Name"
              value={filters.storageLocationName}
              onChange={set("storageLocationName")}
              placeholder="Search port or CFS"
            />

            <SelectField
              label="Offloaded Status"
              value={filters.offloaded}
              onChange={set("offloaded")}
              options={[
                { value: "yes", label: "Offloaded" },
                { value: "no", label: "Not offloaded" },
              ]}
            />

            {/* <DateField
              label="Offloaded From"
              value={filters.offloadedFrom}
              onChange={set("offloadedFrom")}
              max={filters.offloadedTo}
            />

            <DateField
              label="Offloaded To"
              value={filters.offloadedTo}
              onChange={set("offloadedTo")}
              min={filters.offloadedFrom}
            /> */}

            <SelectField
              label="Exited Status"
              value={filters.exited}
              onChange={set("exited")}
              options={[
                { value: "yes", label: "Exited" },
                { value: "no", label: "Not exited" },
              ]}
            />

            {/* <DateField
              label="Exited From"
              value={filters.exitedFrom}
              onChange={set("exitedFrom")}
              max={filters.exitedTo}
            />

            <DateField
              label="Exited To"
              value={filters.exitedTo}
              onChange={set("exitedTo")}
              min={filters.exitedFrom}
            /> */}

            <SelectField
              label="Reached Depot"
              value={filters.reachedDepot}
              onChange={set("reachedDepot")}
              options={[
                { value: "yes", label: "Reached depot" },
                { value: "no", label: "Not at depot" },
              ]}
            />

            {/* <DateField
              label="Reached Depot From"
              value={filters.reachedDepotFrom}
              onChange={set("reachedDepotFrom")}
              max={filters.reachedDepotTo}
            />

            <DateField
              label="Reached Depot To"
              value={filters.reachedDepotTo}
              onChange={set("reachedDepotTo")}
              min={filters.reachedDepotFrom}
            /> */}

            <TextField
              label="Depot Name"
              value={filters.depotName}
              onChange={set("depotName")}
            />
          </FilterSection>

          {/* 4. Charges, delivery order and KWATOS */}
          <FilterSection title="Charges, Delivery Order & KWATOS">
            <SelectField
              label="KWATOS Status"
              value={filters.kwatosStatus}
              onChange={set("kwatosStatus")}
              options={[
                { value: "true", label: "reads" },
                { value: "false", label: "does not read" },
              ]}
            />

            <SelectField
              label="Shipping Charges Requested"
              value={filters.shippingChargesRequested}
              onChange={set("shippingChargesRequested")}
              options={[
                { value: "true", label: "requested" },
                { value: "false", label: "Not requested" },
              ]}
            />

            {/* <SelectField
              label="Shipping Charges Paid"
              value={filters.shippingChargesPaid}
              onChange={set("shippingChargesPaid")}
              options={[
                { value: "true", label: "Paid" },
                { value: "false", label: "Not paid" },
              ]}
            /> */}

            <SelectField
              label="Delivery Order Requested"
              value={filters.doRequested}
              onChange={set("doRequested")}
              options={[
                { value: "true", label: "Requested" },
                { value: "false", label: "Not requested" },
              ]}
            />
{/* 
            <SelectField
              label="Delivery Order Obtained"
              value={filters.doObtained}
              onChange={set("doObtained")}
              options={[
                { value: "true", label: "Yes" },
                { value: "false", label: "No" },
              ]}
            /> */}
          </FilterSection>

          {!hasAdvancedFilters && (
            <p className="text-xs text-slate-500">
              Choose a filter to narrow down your consignment files.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
