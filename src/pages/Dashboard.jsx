import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, Package, RefreshCw, Plus } from "lucide-react";

import DestinationSection from "../components/dashboard/DestinationSection";
import FilterToolbar from "../components/dashboard/FilterToolbar";
import FolderCard from "../components/dashboard/FolderCard";

// Destination configuration
const DESTINATIONS = [
  {
    key: "uganda",
    label: "Uganda",
    code: "UG",
    color: "#2563EB",
  },
  {
    key: "drc",
    label: "DRC",
    code: "DRC",
    color: "#16A34A",
  },
  {
    key: "south-sudan",
    label: "South Sudan",
    code: "SS",
    color: "#EAB308",
  },
  {
    key: "local",
    label: "Local / Kenya",
    code: "KE",
    color: "#DC2626",
  },
];

const API_URL = import.meta.env.VITE_API_URL;
// Temporary sample data.
// We will replace this with data from your Flask backend.

const INITIAL_FILTERS = {
  // General
  bl: "",
  consignee: "",
  cargo: "",
  destination: "",
  shippingLine: "",
  vesselName: "",
  fileStatus: "",
  dateFrom: "",
  dateTo: "",
  readyToClose: "",
  closureReason: "",

  // Container identification
  container: "",
  containerSize: "",
  containerType: "",
  truckNumber: "",

  // Storage and depot
  storageLocationType: "",
  storageLocationName: "",
  depotName: "",

  // Container movement
  offloaded: "",
  offloadedFrom: "",
  offloadedTo: "",
  exited: "",
  exitedFrom: "",
  exitedTo: "",
  reachedDepot: "",
  reachedDepotFrom: "",
  reachedDepotTo: "",

  // ETA and deadlines
  initialEtaFrom: "",
  initialEtaTo: "",
  currentEtaFrom: "",
  currentEtaTo: "",
  guaranteeExpiryFrom: "",
  guaranteeExpiryTo: "",
  freeDays: "",

  // Shipping charges and delivery order
  shippingChargesRequested: "",
  shippingChargesPaid: "",
  doRequested: "",
  doObtained: "",

  // KWATOS
  kwatosStatus: "",

  // Sorting
  sort: "newest",
};

function normalize(value) {
  return String(value ?? "")
    .toLowerCase()
    .trim();
}

function getDestinationKey(category) {
  const value = normalize(category);

  if (value.includes("uganda") || value === "ug") {
    return "uganda";
  }

  if (
    value.includes("drc") ||
    value.includes("congo") ||
    value.includes("democratic republic")
  ) {
    return "drc";
  }

  if (value.includes("south sudan") || value === "ss") {
    return "south-sudan";
  }

  if (value.includes("local") || value.includes("kenya") || value === "ke") {
    return "local";
  }

  return "other";
}

function getConsignmentDate(record) {
  const value = record.date_opened ?? "";

  if (!value) {
    return "";
  }

  // The backend provides a date in YYYY-MM-DD format.
  // Keep that format to avoid timezone-related date changes.
  const match = /^(\d{4}-\d{2}-\d{2})/.exec(value);

  return match ? match[1] : "";
}

function getDateOnly(value) {
  if (!value) return "";

  const match = /^(\d{4}-\d{2}-\d{2})/.exec(String(value));

  return match ? match[1] : "";
}

function matchesDateRange(value, from, to) {
  const date = getDateOnly(value);

  if (!from && !to) return true;
  if (!date) return false;

  return (!from || date >= from) && (!to || date <= to);
}

function matchesBooleanFilter(value, filter) {
  if (!filter) return true;

  const actual =
    value === true ||
    value === 1 ||
    ["true", "yes", "1"].includes(normalize(value));

  const expectedTrue = ["true", "yes", "1"].includes(normalize(filter));

  return actual === expectedTrue;
}

function hasDate(value) {
  return Boolean(value);
}

function Dashboard() {
  const navigate = useNavigate();

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [consignments, setConsignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = useMemo(() => {
    try {
      return JSON.parse(sessionStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchConsignments() {
      setLoading(true);
      setError("");

      const token = sessionStorage.getItem("access_token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        const response = await fetch(`${API_URL}/files`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
          signal: controller.signal,
        });

        if (response.status === 401 || response.status === 403) {
          sessionStorage.removeItem("access_token");
          sessionStorage.removeItem("user");
          navigate("/login", { replace: true });
          return;
        }

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            data?.message || `Unable to load files (${response.status}).`,
          );
        }

        if (!Array.isArray(data)) {
          throw new Error("The server returned an unexpected files response.");
        }

        setConsignments(data);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Could not connect to the server.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchConsignments();

    return () => controller.abort();
  }, [navigate]);

  const role = normalize(user?.role);
  const canCreate = role === "admin" || role === "employee";
  const isAdmin = role === "admin";

  const options = useMemo(() => {
    const uniqueValues = (values) =>
      [...new Set(values.filter(Boolean))].sort((a, b) =>
        String(a).localeCompare(String(b)),
      );

    return {
      hasBl: true,
      hasConsignee: true,
      hasContainers: true,
      hasCargo: true,
      hasDate: true,
      shippingLines: uniqueValues(
        consignments.map(
          (record) => record.shipping_line ?? record.shippingLine,
        ),
      ),
      containerSizes: uniqueValues(
        consignments.flatMap((record) =>
          (record.containers ?? []).map(
            (container) => container.container_size,
          ),
        ),
      ),
    };
  }, [consignments]);

  const filteredConsignments = useMemo(() => {
    const result = consignments.filter((record) => {
      const containers = record.containers ?? [];

      // Consignment fields
      const bl = normalize(record.bl_number ?? record.blNumber);
      const consignee = normalize(record.consignee);
      const cargo = normalize(
        record.cargo_description ?? record.cargoDescription,
      );
      const shippingLine = normalize(
        record.shipping_line ?? record.shippingLine,
      );
      const vesselName = normalize(record.vessel_name);
      const destination = getDestinationKey(record.category);
      const status = normalize(record.status);
      const closureReason = normalize(record.closure_reason);
      const kwatosStatus = normalize(record.kwatos_status);

      const matchesBl = bl.includes(normalize(filters.bl));

      const matchesConsignee = consignee.includes(normalize(filters.consignee));

      const matchesCargo = cargo.includes(normalize(filters.cargo));

      const matchesDestination =
        !filters.destination || destination === filters.destination;

      const matchesShippingLine =
        !filters.shippingLine ||
        shippingLine === normalize(filters.shippingLine);

      const matchesVessel = vesselName.includes(normalize(filters.vesselName));

      const matchesFileStatus =
        !filters.fileStatus || status === normalize(filters.fileStatus);

      const matchesReadyToClose = matchesBooleanFilter(
        record.ready_to_close,
        filters.readyToClose,
      );

      const matchesClosureReason = closureReason.includes(
        normalize(filters.closureReason),
      );

      // File opened date
      const fileDate = getConsignmentDate(record);

      const matchesFileDate = matchesDateRange(
        fileDate,
        filters.dateFrom,
        filters.dateTo,
      );

      // ETA and deadline dates
      const matchesInitialEta = matchesDateRange(
        record.initial_eta,
        filters.initialEtaFrom,
        filters.initialEtaTo,
      );

      const matchesCurrentEta = matchesDateRange(
        record.current_eta,
        filters.currentEtaFrom,
        filters.currentEtaTo,
      );

      const matchesGuaranteeExpiry = matchesDateRange(
        record.guarantee_expiry_date,
        filters.guaranteeExpiryFrom,
        filters.guaranteeExpiryTo,
      );

      const matchesFreeDays =
        !filters.freeDays ||
        String(record.free_days ?? "") === filters.freeDays.trim();

      // Container filters: at least one container must match
      // every selected container-related filter.
      const matchesContainer = !filters.container
        ? true
        : containers.some((container) =>
            normalize(container.container_number ?? container.number).includes(
              normalize(filters.container),
            ),
          );

      const matchesContainerFilters = containers.some((container) => {
        const number = normalize(
          container.container_number ?? container.number,
        );

        const size = normalize(container.container_size ?? container.size);

        const type = normalize(container.container_type);
        const truck = normalize(container.truck_number);

        const locationType = normalize(container.storage_location_type);

        const locationName = normalize(container.storage_location_name);

        const containerMatchesNumber =
          !filters.container || number.includes(normalize(filters.container));

        const containerMatchesSize =
          !filters.containerSize || size === normalize(filters.containerSize);

        const containerMatchesType =
          !filters.containerType || type === normalize(filters.containerType);

        const containerMatchesTruck = truck.includes(
          normalize(filters.truckNumber),
        );

        const containerMatchesLocationType =
          !filters.storageLocationType ||
          locationType === normalize(filters.storageLocationType);

        const containerMatchesLocationName = locationName.includes(
          normalize(filters.storageLocationName),
        );

        const containerMatchesOffloaded =
          !filters.offloaded ||
          (filters.offloaded === "yes"
            ? hasDate(container.offloaded_at)
            : !hasDate(container.offloaded_at));

        const containerMatchesOffloadedDate = matchesDateRange(
          container.offloaded_at,
          filters.offloadedFrom,
          filters.offloadedTo,
        );

        const containerMatchesExited =
          !filters.exited ||
          (filters.exited === "yes"
            ? hasDate(container.exited_at)
            : !hasDate(container.exited_at));

        const containerMatchesExitedDate = matchesDateRange(
          container.exited_at,
          filters.exitedFrom,
          filters.exitedTo,
        );

        const containerMatchesDepot =
          !filters.reachedDepot ||
          (filters.reachedDepot === "yes"
            ? hasDate(container.reached_depot_at)
            : !hasDate(container.reached_depot_at));

        const containerMatchesDepotDate = matchesDateRange(
          container.reached_depot_at,
          filters.reachedDepotFrom,
          filters.reachedDepotTo,
        );

        const containerMatchesDepotName =
          !filters.depotName ||
          normalize(record.depot_name).includes(normalize(filters.depotName));

        return (
          containerMatchesNumber &&
          containerMatchesSize &&
          containerMatchesType &&
          containerMatchesTruck &&
          containerMatchesLocationType &&
          containerMatchesLocationName &&
          containerMatchesOffloaded &&
          containerMatchesOffloadedDate &&
          containerMatchesExited &&
          containerMatchesExitedDate &&
          containerMatchesDepot &&
          containerMatchesDepotDate &&
          containerMatchesDepotName
        );
      });

      // When no container-specific filter is selected, don't require
      // the consignment to have any containers.
      const containerFiltersActive = [
        filters.container,
        filters.containerSize,
        filters.containerType,
        filters.truckNumber,
        filters.storageLocationType,
        filters.storageLocationName,
        filters.offloaded,
        filters.offloadedFrom,
        filters.offloadedTo,
        filters.exited,
        filters.exitedFrom,
        filters.exitedTo,
        filters.reachedDepot,
        filters.reachedDepotFrom,
        filters.reachedDepotTo,
        filters.depotName,
      ].some(Boolean);

      const matchesContainers = containerFiltersActive
        ? matchesContainerFilters
        : true;

      // Charges and delivery orders
      const matchesShippingChargesRequested = matchesBooleanFilter(
        record.shipping_charges_requested,
        filters.shippingChargesRequested,
      );

      const matchesShippingChargesPaid = matchesBooleanFilter(
        record.shipping_charges_paid,
        filters.shippingChargesPaid,
      );

      const matchesDoRequested = matchesBooleanFilter(
        record.do_requested,
        filters.doRequested,
      );

      const matchesDoObtained = matchesBooleanFilter(
        record.do_obtained,
        filters.doObtained,
      );

      const matchesKwatos =
        !filters.kwatosStatus ||
        kwatosStatus === normalize(filters.kwatosStatus);

      return (
        matchesBl &&
        matchesConsignee &&
        matchesCargo &&
        matchesDestination &&
        matchesShippingLine &&
        matchesVessel &&
        matchesFileStatus &&
        matchesReadyToClose &&
        matchesClosureReason &&
        matchesFileDate &&
        matchesInitialEta &&
        matchesCurrentEta &&
        matchesGuaranteeExpiry &&
        matchesFreeDays &&
        matchesContainer &&
        matchesContainers &&
        matchesShippingChargesRequested &&
        matchesShippingChargesPaid &&
        matchesDoRequested &&
        matchesDoObtained &&
        matchesKwatos
      );
    });

    if (filters.sort === "alpha") {
      result.sort((a, b) =>
        String(a.bl_number ?? a.blNumber ?? "").localeCompare(
          String(b.bl_number ?? b.blNumber ?? ""),
        ),
      );
    } else if (filters.sort === "newest") {
      result.sort((a, b) =>
        getConsignmentDate(b).localeCompare(getConsignmentDate(a)),
      );
    } else if (filters.sort === "oldest") {
      result.sort((a, b) =>
        getConsignmentDate(a).localeCompare(getConsignmentDate(b)),
      );
    }

    return result;
  }, [consignments, filters]);

  const handleReset = () => {
    setFilters(INITIAL_FILTERS);
  };

  const handleCreate = () => {
    navigate("/files/new");
  };

  const handleUserManagement = () => {
    if (isAdmin) {
      navigate("/admin/users");
    } else {
      alert("User management is available to administrators only.");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("access_token");
    sessionStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  const resetKey = (key) => {
    setFilters((previous) => ({
      ...previous,
      [key]: INITIAL_FILTERS[key],
    }));
  };

  const clearAllFilters = () => {
    handleReset();
  };

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Dashboard header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#101d35] text-white">
              <Package size={23} />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Amey Trading
              </h1>
              <p className="text-xs text-slate-500">
                Clearing &amp; Forwarding Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                {user?.username ?? "Team Member"}
              </p>
              <p className="text-xs capitalize text-slate-500">
                {user?.role ?? "user"}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-8">
          <p className="text-sm font-medium text-blue-700">
            OPERATIONS OVERVIEW
          </p>

          <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Consignment Files
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Manage and track consignments by destination.
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <p className="text-xs text-slate-500">Total files</p>
              <p className="text-2xl font-bold text-slate-900">
                {filteredConsignments.length}
              </p>
            </div>
          </div>
        </section>

        {/* Search and filtering */}
        <FilterToolbar
          filters={filters}
          onChange={setFilters}
          onReset={clearAllFilters}
          options={options}
          onLockClick={handleUserManagement}
        />
        {loading && (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white px-6 py-10 text-center">
            <p className="font-medium text-slate-800">
              Loading consignment files...
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Connecting to the Amey management system.
            </p>
          </div>
        )}

        {!loading && error && (
          <div
            role="alert"
            className="mt-6 rounded-xl border border-red-200 bg-red-50 px-6 py-5"
          >
            <p className="font-semibold text-red-800">
              Could not load consignment files
            </p>

            <p className="mt-2 text-sm text-red-700">{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-[#101d35] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              Try again
            </button>
          </div>
        )}

        {/* Destination sections */}
        <div className={`mt-2 ${loading || error ? "hidden" : ""}`}>
          {DESTINATIONS.map((destination) => {
            const destinationItems = filteredConsignments.filter(
              (record) =>
                getDestinationKey(record.category) === destination.key,
            );

            const total = consignments.filter(
              (record) =>
                getDestinationKey(record.category) === destination.key,
            ).length;

            return (
              <DestinationSection
                key={destination.key}
                destination={destination}
                items={destinationItems}
                total={total}
                canCreate={canCreate}
                onCreate={handleCreate}
                renderFolder={(record, dest) => (
                  <FolderCard record={record} destination={dest} />
                )}
              />
            );
          })}

          {consignments.some(
            (record) => getDestinationKey(record.category) === "other",
          ) && (
            <DestinationSection
              destination={{
                key: "other",
                label: "Other destinations",
                code: "OTH",
                color: "#64748B",
              }}
              items={filteredConsignments.filter(
                (record) => getDestinationKey(record.category) === "other",
              )}
              total={
                consignments.filter(
                  (record) => getDestinationKey(record.category) === "other",
                ).length
              }
              canCreate={false}
              renderFolder={(record, dest) => (
                <FolderCard record={record} destination={dest} />
              )}
            />
          )}
        </div>

        {/* Empty search results */}
        {consignments.length > 0 && filteredConsignments.length === 0 && (
          <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <p className="font-semibold text-slate-800">
              No matching consignments
            </p>

            <p className="mt-2 text-sm text-slate-500">
              Try changing your search or filter settings.
            </p>

            <button
              type="button"
              onClick={handleReset}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#101d35] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
            >
              <RefreshCw size={15} />
              Clear filters
            </button>
          </div>
        )}
      </div>
    </main>
  );
}

export default Dashboard;
