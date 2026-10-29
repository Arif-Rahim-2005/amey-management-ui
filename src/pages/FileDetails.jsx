import { useCallback, useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Boxes,
  Ship,
  User,
  Calendar,
  Anchor,
  RefreshCw,
  AlertCircle,
  Pencil,
  Trash2,
  Plus,
  X,
  Save,
  MessageSquare,
  Truck,
  ClipboardCheck,
  Package,
  CheckCircle2,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const FILE_FIELDS = [
  { name: "category", label: "Destination / Category", required: true },
  { name: "bl_number", label: "BL Number", required: true },
  { name: "consignee", label: "Consignee", required: true },
  { name: "cargo_description", label: "Cargo Description", required: true },
  { name: "shipping_line", label: "Shipping Line" },
  { name: "vessel_name", label: "Vessel Name" },
  { name: "date_opened", label: "Date Opened", type: "date" },
  { name: "initial_eta", label: "Initial ETA", type: "date" },
  { name: "current_eta", label: "Current ETA", type: "date" },
  { name: "depot_name", label: "Depot Name" },
  { name: "free_days", label: "Free Days", type: "number", min: 0 },
  {
    name: "guarantee_expiry_date",
    label: "Guarantee Expiry Date",
    type: "date",
  },
  { name: "mother_entry_number", label: "Mother Entry Number" },
  { name: "mother_entry_date", label: "Mother Entry Date", type: "datetime-local" },
  { name: "charges_requested_at", label: "Charges Requested At", type: "datetime-local" },
  {
    name: "shipping_charges_paid_date",
    label: "Shipping Charges Paid Date",
    type: "date",
  },
  { name: "do_requested_at", label: "DO Requested At", type: "datetime-local" },
  { name: "do_obtained_date", label: "DO Obtained Date", type: "date" },
];

const BOOLEAN_FIELDS = [
  { name: "kwatos_status", label: "KWATOS Completed" },
  {
    name: "shipping_charges_requested",
    label: "Shipping Charges Requested",
    dateField: "charges_requested_at",
    dateType: "datetime",
  },
  {
    name: "shipping_charges_paid",
    label: "Shipping Charges Paid",
    dateField: "shipping_charges_paid_date",
    dateType: "date",
  },
  {
    name: "do_requested",
    label: "Delivery Order Requested",
    dateField: "do_requested_at",
    dateType: "datetime",
  },
  {
    name: "do_obtained",
    label: "Delivery Order Obtained",
    dateField: "do_obtained_date",
    dateType: "date",
  },
  { name: "ready_to_close", label: "Ready to Close" },
];

const CONTAINER_FIELDS = [
  { name: "container_number", label: "Container Number", required: true },
  {
    name: "container_size",
    label: "Container Size",
    type: "select",
    options: ["20ft", "40ft", "45ft"],
  },
  {
    name: "container_type",
    label: "Container Type",
    type: "select",
    options: ["DRY", "REEFER", "OPEN_TOP", "FLAT_RACK", "TANK"],
  },
  { name: "truck_number", label: "Truck Number" },
  {
    name: "storage_location_type",
    label: "Storage Type",
    type: "select",
    options: ["PORT", "CFS"],
  },
  { name: "storage_location_name", label: "Storage Location" },
  { name: "offloaded_at", label: "Offloaded At", type: "datetime-local" },
  { name: "exited_at", label: "Exited At", type: "datetime-local" },
  {
    name: "reached_depot_at",
    label: "Reached Depot At",
    type: "datetime-local",
  },
];

const TABS = [
  { id: "overview", label: "Overview", icon: FileText },
  { id: "containers", label: "Containers", icon: Boxes },
  { id: "charges", label: "Charges & DO", icon: ClipboardCheck },
  { id: "customs", label: "Entry data", icon: Anchor },
  { id: "comments", label: "Comments", icon: MessageSquare },
];

function dateOnly(value) {
  return value ? String(value).slice(0, 10) : "";
}

function dateTimeLocal(value) {
  if (!value) return "";
  return String(value).slice(0, 16);
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleString();
}

function displayValue(value) {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return value;
}

function inputValue(field, value) {
  if (field.type === "date") return dateOnly(value);
  if (field.type === "datetime-local") return dateTimeLocal(value);
  if (value === null || value === undefined) return "";
  return value;
}

function normalizePayload(form, fields) {
  const payload = {};

  fields.forEach((field) => {
    const value = form[field.name];

    if (field.type === "number") {
      payload[field.name] =
        value === "" || value === null ? null : Number(value);
    } else if (
      field.type === "date" ||
      field.type === "datetime-local"
    ) {
      payload[field.name] = value || null;
    } else {
      payload[field.name] = value === "" ? null : value;
    }
  });

  return payload;
}

async function apiRequest(path, options = {}) {
  const token = sessionStorage.getItem("access_token");

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const detail = Array.isArray(data.fields)
      ? ` ${data.fields.join(", ")}`
      : "";

    throw new Error(
      `${data.message || data.error || `Request failed (${response.status})`}${detail}`
    );
  }

  return data;
}

function Detail({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 break-words text-sm font-semibold text-slate-800">
        {displayValue(value)}
      </p>
    </div>
  );
}

function Section({ title, icon: Icon, action, children }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
            <Icon size={20} />
          </div>
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        </div>
        {action}
      </div>

      {children}
    </section>
  );
}

function Field({ field, value, onChange }) {
  const commonClass =
    "mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <label className="block text-sm font-medium text-slate-700">
      {field.label}
      {field.required && <span className="ml-1 text-red-500">*</span>}

      {field.type === "select" ? (
        <select
          className={commonClass}
          value={value ?? ""}
          onChange={(event) => onChange(field.name, event.target.value)}
          required={field.required}
        >
          <option value="">Select...</option>
          {field.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          className={commonClass}
          type={field.type || "text"}
          min={field.min}
          value={value ?? ""}
          onChange={(event) => onChange(field.name, event.target.value)}
          required={field.required}
        />
      )}
    </label>
  );
}

function Modal({ title, onClose, children, wide = false }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">
      <div
        className={`my-auto w-full rounded-2xl bg-white p-5 shadow-2xl sm:p-6 ${
          wide ? "max-w-4xl" : "max-w-lg"
        }`}
      >
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalActions({ onCancel, saving, label = "Save changes" }) {
  return (
    <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
      <button
        type="button"
        onClick={onCancel}
        disabled={saving}
        className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        disabled={saving}
        className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
      >
        <Save size={16} />
        {saving ? "Saving..." : label}
      </button>
    </div>
  );
}

export default function FileDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [record, setRecord] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [notice, setNotice] = useState("");
  const [activeTab, setActiveTab] = useState("overview");

  const [showFileEditor, setShowFileEditor] = useState(false);
  const [fileForm, setFileForm] = useState({});
  const [savingFile, setSavingFile] = useState(false);

  const [containerEditor, setContainerEditor] = useState(null);
  const [containerForm, setContainerForm] = useState({});
  const [savingContainer, setSavingContainer] = useState(false);
  const [deletingContainerId, setDeletingContainerId] = useState(null);
  const [confirmContainer, setConfirmContainer] = useState(null);

  const [commentText, setCommentText] = useState("");
  const [editingComment, setEditingComment] = useState(null);
  const [savingComment, setSavingComment] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState(null);
  const [confirmComment, setConfirmComment] = useState(null);

  const [showDeleteFile, setShowDeleteFile] = useState(false);
  const [deletingFile, setDeletingFile] = useState(false);

  const loadFile = useCallback(async () => {
    setLoading(true);
    setPageError("");

    try {
      const data = await apiRequest(`/files/${id}`);
      const file = data.file || data.data || data;

      if (!file || !file.id) {
        throw new Error("The API did not return a valid consignment file.");
      }

      setRecord(file);
    } catch (error) {
      setPageError(error.message || "Unable to load this file.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadComments = useCallback(async () => {
    try {
      const data = await apiRequest(`/comments?file_id=${id}`);

      if (Array.isArray(data)) {
        setComments(data);
      } else if (Array.isArray(data.comments)) {
        setComments(data.comments);
      } else {
        setComments([]);
      }
    } catch (error) {
      setNotice(`Comments could not be loaded: ${error.message}`);
    }
  }, [id]);

  useEffect(() => {
    loadFile();
    loadComments();
  }, [loadFile, loadComments]);

  function openFileEditor() {
    if (!record) return;

    const form = {};

    FILE_FIELDS.forEach((field) => {
      form[field.name] = inputValue(field, record[field.name]);
    });

    BOOLEAN_FIELDS.forEach((field) => {
      form[field.name] = Boolean(record[field.name]);
    });

    form.status = record.status || "OPEN";
    form.closure_reason = record.closure_reason || "";

    setFileForm(form);
    setNotice("");
    setShowFileEditor(true);
  }

  function handleFileCheckboxChange(field, checked) {
    setFileForm((previous) => {
      const updated = {
        ...previous,
        [field.name]: checked,
      };

      if (field.dateField) {
        if (checked) {
          // Capture the current date/time when the checkbox is ticked.
          const now = new Date();

          updated[field.dateField] =
            field.dateType === "date"
              ? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
              : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
        } else {
          // Clear the corresponding date when the checkbox is unticked.
          updated[field.dateField] = "";
        }
      }

      return updated;
    });
  }

  async function saveFile(event) {
    event.preventDefault();
    setSavingFile(true);
    setNotice("");

    try {
      const payload = normalizePayload(fileForm, FILE_FIELDS);

      BOOLEAN_FIELDS.forEach((field) => {
        payload[field.name] = Boolean(fileForm[field.name]);
      });

      payload.status = fileForm.status || "OPEN";
      payload.closure_reason = fileForm.closure_reason || null;

      const data = await apiRequest(`/files/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });

      const updatedFile = data.file || data.data || data;

      setRecord((previous) => ({
        ...previous,
        ...updatedFile,
      }));

      setShowFileEditor(false);
      setNotice("Consignment file updated successfully.");
    } catch (error) {
      setNotice(`Could not save file: ${error.message}`);
    } finally {
      setSavingFile(false);
    }
  }

  async function deleteFile() {
    setDeletingFile(true);
    setNotice("");

    try {
      await apiRequest(`/files/${id}`, { method: "DELETE" });
      navigate("/", { replace: true });
    } catch (error) {
      setNotice(`Could not delete file: ${error.message}`);
      setShowDeleteFile(false);
    } finally {
      setDeletingFile(false);
    }
  }

  function openContainerEditor(container = null) {
    const form = {};

    CONTAINER_FIELDS.forEach((field) => {
      form[field.name] = inputValue(field, container?.[field.name]);
    });

    setContainerForm(form);
    setContainerEditor(container || "new");
    setNotice("");
  }

  async function saveContainer(event) {
    event.preventDefault();
    setSavingContainer(true);
    setNotice("");

    try {
      const payload = normalizePayload(containerForm, CONTAINER_FIELDS);

      if (containerEditor === "new") {
        payload.file_id = Number(id);

        await apiRequest("/containers", {
          method: "POST",
          body: JSON.stringify(payload),
        });

        setNotice("Container added successfully.");
      } else {
        await apiRequest(`/containers/${containerEditor.id}`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        });

        setNotice("Container updated successfully.");
      }

      setContainerEditor(null);
      await loadFile();
    } catch (error) {
      setNotice(`Could not save container: ${error.message}`);
    } finally {
      setSavingContainer(false);
    }
  }

  async function deleteContainer() {
    if (!confirmContainer) return;

    const containerId = confirmContainer.id;
    setDeletingContainerId(containerId);
    setNotice("");

    try {
      await apiRequest(`/containers/${containerId}`, {
        method: "DELETE",
      });

      setNotice("Container deleted successfully.");
      setConfirmContainer(null);
      await loadFile();
    } catch (error) {
      setNotice(`Could not delete container: ${error.message}`);
    } finally {
      setDeletingContainerId(null);
    }
  }

  async function saveComment(event) {
    event.preventDefault();

    const text = commentText.trim();

    if (!text) return;

    setSavingComment(true);
    setNotice("");

    try {
      if (editingComment) {
        await apiRequest(`/comments/${editingComment.id}`, {
          method: "PATCH",
          body: JSON.stringify({ comment: text }),
        });

        setNotice("Comment updated successfully.");
      } else {
        await apiRequest("/comments", {
          method: "POST",
          body: JSON.stringify({
            file_id: Number(id),
            comment: text,
          }),
        });

        setNotice("Comment added successfully.");
      }

      setCommentText("");
      setEditingComment(null);
      await loadComments();
    } catch (error) {
      setNotice(`Could not save comment: ${error.message}`);
    } finally {
      setSavingComment(false);
    }
  }

  async function deleteComment() {
    if (!confirmComment) return;

    setDeletingCommentId(confirmComment.id);
    setNotice("");

    try {
      await apiRequest(`/comments/${confirmComment.id}`, {
        method: "DELETE",
      });

      setNotice("Comment deleted successfully.");
      setConfirmComment(null);
      await loadComments();
    } catch (error) {
      setNotice(`Could not delete comment: ${error.message}`);
    } finally {
      setDeletingCommentId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 text-slate-600">
          <RefreshCw className="animate-spin" size={22} />
          Loading consignment file...
        </div>
      </div>
    );
  }

  if (pageError || !record) {
    return (
      <main className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-red-200 bg-white p-6">
          <AlertCircle className="text-red-600" size={26} />
          <h1 className="mt-3 text-xl font-bold text-slate-900">
            Unable to load file
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {pageError || "This consignment file could not be found."}
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={loadFile}
              className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Try again
            </button>
            <Link
              to="/dashboard"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const containers = Array.isArray(record.containers)
    ? record.containers
    : [];

  const isClosed = String(record.status || "").toUpperCase() === "CLOSED";

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-blue-700"
        >
          <ArrowLeft size={17} />
          Back to dashboard
        </Link>

        {notice && (
          <div
            role="status"
            className="flex items-start gap-2 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900"
          >
            <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
            <p>{notice}</p>
            <button
              onClick={() => setNotice("")}
              className="ml-auto rounded p-1 hover:bg-blue-100"
              aria-label="Dismiss message"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Header */}
        <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-blue-700 p-3 text-white">
                <FileText size={28} />
              </div>

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Consignment file #{record.id}
                </p>
                <h1 className="mt-1 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {record.bl_number || "Untitled consignment"}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
                    {record.category || "Unclassified"}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      isClosed
                        ? "bg-slate-100 text-slate-700"
                        : "bg-emerald-50 text-emerald-700"
                    }`}
                  >
                    {record.status || "OPEN"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-medium uppercase text-slate-500">
                  Containers
                </p>
                <p className="mt-1 text-2xl font-bold text-slate-900">
                  {containers.length}
                </p>
              </div>

              <button
                onClick={openFileEditor}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                <Pencil size={16} />
                Edit
              </button>

              <button
                onClick={() => setShowDeleteFile(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </header>

        {/* Tabs */}
        <nav className="flex gap-1 overflow-x-auto border-b border-slate-200">
          {TABS.map(({ id: tabId, label, icon: Icon }) => (
            <button
              key={tabId}
              onClick={() => setActiveTab(tabId)}
              className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition ${
                activeTab === tabId
                  ? "border-blue-700 text-blue-700"
                  : "border-transparent text-slate-500 hover:text-slate-900"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </nav>

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <Section title="Shipment Information" icon={Ship}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Detail label="BL Number" value={record.bl_number} />
                <Detail label="Consignee" value={record.consignee} />
                <Detail
                  label="Cargo Description"
                  value={record.cargo_description}
                />
                <Detail label="Shipping Line" value={record.shipping_line} />
                <Detail label="Vessel Name" value={record.vessel_name} />
                <Detail
                  label="Date Opened"
                  value={formatDate(record.date_opened)}
                />
                <Detail
                  label="Initial ETA"
                  value={formatDate(record.initial_eta)}
                />
                <Detail
                  label="Current ETA"
                  value={formatDate(record.current_eta)}
                />
                <Detail label="KWATOS Status" value={record.kwatos_status} />
              </div>
            </Section>

            <Section title="File Status & Closure" icon={Calendar}>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <Detail label="Status" value={record.status} />
                <Detail label="Ready to Close" value={record.ready_to_close} />
                <Detail
                  label="Closed At"
                  value={formatDateTime(record.closed_at)}
                />
              </div>

              {record.closure_reason && (
                <div className="mt-4 rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium uppercase text-slate-500">
                    Closure Reason
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                    {record.closure_reason}
                  </p>
                </div>
              )}
            </Section>
          </div>
        )}

        {/* Containers */}
        {activeTab === "containers" && (
          <Section
            title="Containers"
            icon={Boxes}
            action={
              <button
                onClick={() => openContainerEditor()}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-800"
              >
                <Plus size={16} />
                Add Container
              </button>
            }
          >
            {containers.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
                <Package className="mx-auto text-slate-400" size={32} />
                <p className="mt-3 font-semibold text-slate-700">
                  No containers recorded
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Add the first container to this consignment.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {containers.map((container, index) => (
                  <div
                    key={container.id}
                    className="rounded-xl border border-slate-200 p-4 sm:p-5"
                  >
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                      <div>
                        <p className="text-xs font-medium uppercase text-slate-500">
                          Container {index + 1}
                        </p>
                        <h3 className="mt-1 font-mono text-lg font-bold text-slate-900">
                          {container.container_number}
                        </h3>
                        <p className="mt-1 text-sm text-slate-500">
                          {container.container_size || "—"} ·{" "}
                          {container.container_type || "—"}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => openContainerEditor(container)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                        <button
                          onClick={() => setConfirmContainer(container)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <Detail
                        label="Truck Number"
                        value={container.truck_number}
                      />
                      <Detail
                        label="Storage Type"
                        value={container.storage_location_type}
                      />
                      <Detail
                        label="Storage Location"
                        value={container.storage_location_name}
                      />
                      <Detail
                        label="Offloaded At"
                        value={formatDateTime(container.offloaded_at)}
                      />
                      <Detail
                        label="Exited At"
                        value={formatDateTime(container.exited_at)}
                      />
                      <Detail
                        label="Reached Depot"
                        value={formatDateTime(container.reached_depot_at)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}

        {/* Charges and DO */}
        {activeTab === "charges" && (
          <Section
            title="Shipping Charges & Delivery Order"
            icon={ClipboardCheck}
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Detail
                label="Charges Requested"
                value={record.shipping_charges_requested}
              />
              <Detail
                label="Charges Requested At"
                value={formatDateTime(record.charges_requested_at)}
              />
              <Detail
                label="Charges Paid"
                value={record.shipping_charges_paid}
              />
              <Detail
                label="Charges Paid Date"
                value={formatDate(record.shipping_charges_paid_date)}
              />
              <Detail label="DO Requested" value={record.do_requested} />
              <Detail
                label="DO Requested At"
                value={formatDateTime(record.do_requested_at)}
              />
              <Detail label="DO Obtained" value={record.do_obtained} />
              <Detail
                label="DO Obtained Date"
                value={formatDate(record.do_obtained_date)}
              />
              <Detail label="Depot Name" value={record.depot_name} />
              <Detail label="Free Days" value={record.free_days} />
              <Detail
                label="Guarantee Expiry"
                value={formatDate(record.guarantee_expiry_date)}
              />
            </div>
          </Section>
        )}

        {/* Customs */}
        {activeTab === "customs" && (
          <Section title="Entry data" icon={Anchor}>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Detail
                label="Mother Entry Number"
                value={record.mother_entry_number}
              />
              {/* <Detail
                label="Mother Entry Date"
                value={formatDateTime(record.mother_entry_date)}
              /> */}
            </div>
          </Section>
        )}

        {/* Comments */}
        {activeTab === "comments" && (
          <Section title="File Comments" icon={MessageSquare}>
            <form onSubmit={saveComment} className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700">
                {editingComment ? "Edit comment" : "Add a comment"}
                <textarea
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  rows={3}
                  maxLength={5000}
                  required
                  placeholder="Write a file update or comment..."
                  className="mt-2 w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <div className="flex flex-wrap gap-2">
                <button
                  type="submit"
                  disabled={savingComment || !commentText.trim()}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-50"
                >
                  <Save size={16} />
                  {savingComment
                    ? "Saving..."
                    : editingComment
                      ? "Update Comment"
                      : "Add Comment"}
                </button>

                {editingComment && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingComment(null);
                      setCommentText("");
                    }}
                    className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>

            <div className="mt-6 space-y-3">
              {comments.length === 0 ? (
                <p className="rounded-xl bg-slate-50 p-5 text-center text-sm text-slate-500">
                  No comments yet.
                </p>
              ) : (
                comments.map((comment) => (
                  <article
                    key={comment.id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row">
                      <div className="min-w-0 flex-1">
                        <p className="whitespace-pre-wrap break-words text-sm text-slate-800">
                          {comment.comment}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                          {formatDateTime(comment.created_at)}
                        </p>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <button
                          onClick={() => {
                            setEditingComment(comment);
                            setCommentText(comment.comment);
                          }}
                          className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50"
                          aria-label="Edit comment"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setConfirmComment(comment)}
                          className="rounded-lg border border-red-200 p-2 text-red-600 hover:bg-red-50"
                          aria-label="Delete comment"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          </Section>
        )}

        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <User size={14} />
          <span>Consignment #{record.id}</span>
          <span>·</span>
          <Truck size={14} />
          <span>{containers.length} container(s)</span>
        </div>
      </div>

      {/* Edit file modal */}
      {showFileEditor && (
        <Modal
          title="Edit Consignment File"
          onClose={() => setShowFileEditor(false)}
          wide
        >
          <form onSubmit={saveFile} className="space-y-6">
            <div>
              <h3 className="mb-3 font-semibold text-slate-800">
                Shipment Information
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {FILE_FIELDS.slice(0, 9).map((field) => (
                  <Field
                    key={field.name}
                    field={field}
                    value={fileForm[field.name]}
                    onChange={(name, value) =>
                      setFileForm((prev) => ({ ...prev, [name]: value }))
                    }
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-semibold text-slate-800">
                Charges and DO details
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {FILE_FIELDS.slice(9).map((field) => (
                  <Field
                    key={field.name}
                    field={field}
                    value={fileForm[field.name]}
                    onChange={(name, value) =>
                      setFileForm((prev) => ({ ...prev, [name]: value }))
                    }
                  />
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-semibold text-slate-800">
                Status & Closure
              </h3>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  File Status
                  <select
                    value={fileForm.status}
                    onChange={(event) =>
                      setFileForm((prev) => ({
                        ...prev,
                        status: event.target.value,
                      }))
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  Closure Reason
                  <input
                    value={fileForm.closure_reason}
                    onChange={(event) =>
                      setFileForm((prev) => ({
                        ...prev,
                        closure_reason: event.target.value,
                      }))
                    }
                    className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm"
                  />
                </label>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {BOOLEAN_FIELDS.map((field) => (
                  <label
                    key={field.name}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(fileForm[field.name])}
                      onChange={(event) =>
                        handleFileCheckboxChange(field, event.target.checked)
                      }
                      className="h-4 w-4 rounded border-slate-300 text-blue-700"
                    />
                    {field.label}
                  </label>
                ))}
              </div>
            </div>

            <ModalActions
              onCancel={() => setShowFileEditor(false)}
              saving={savingFile}
            />
          </form>
        </Modal>
      )}

      {/* Add/edit container modal */}
      {containerEditor && (
        <Modal
          title={containerEditor === "new" ? "Add Container" : "Edit Container"}
          onClose={() => setContainerEditor(null)}
          wide
        >
          <form onSubmit={saveContainer} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              {CONTAINER_FIELDS.map((field) => (
                <Field
                  key={field.name}
                  field={field}
                  value={containerForm[field.name]}
                  onChange={(name, value) =>
                    setContainerForm((prev) => ({ ...prev, [name]: value }))
                  }
                />
              ))}
            </div>

            <p className="text-xs text-slate-500">
              Container changes will be saved to this consignment file.
            </p>

            <ModalActions
              onCancel={() => setContainerEditor(null)}
              saving={savingContainer}
              label={
                containerEditor === "new" ? "Add Container" : "Save Container"
              }
            />
          </form>
        </Modal>
      )}

      {/* Delete file confirmation */}
      {showDeleteFile && (
        <Modal
          title="Delete this consignment?"
          onClose={() => setShowDeleteFile(false)}
        >
          <p className="text-sm leading-6 text-slate-600">
            Are you sure you want to delete <strong>{record.bl_number}</strong>?
            This operation cannot be undone.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setShowDeleteFile(false)}
              disabled={deletingFile}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={deleteFile}
              disabled={deletingFile}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              <Trash2 size={16} />
              {deletingFile ? "Deleting..." : "Delete File"}
            </button>
          </div>
        </Modal>
      )}

      {/* Delete container confirmation */}
      {confirmContainer && (
        <Modal
          title="Delete container?"
          onClose={() => setConfirmContainer(null)}
        >
          <p className="text-sm text-slate-600">
            Delete container{" "}
            <strong>{confirmContainer.container_number}</strong>?
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setConfirmContainer(null)}
              disabled={deletingContainerId !== null}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={deleteContainer}
              disabled={deletingContainerId !== null}
              className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {deletingContainerId !== null
                ? "Deleting..."
                : "Delete Container"}
            </button>
          </div>
        </Modal>
      )}

      {/* Delete comment confirmation */}
      {confirmComment && (
        <Modal title="Delete comment?" onClose={() => setConfirmComment(null)}>
          <p className="text-sm text-slate-600">
            This comment will be permanently deleted.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setConfirmComment(null)}
              disabled={deletingCommentId !== null}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={deleteComment}
              disabled={deletingCommentId !== null}
              className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {deletingCommentId !== null ? "Deleting..." : "Delete Comment"}
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}
