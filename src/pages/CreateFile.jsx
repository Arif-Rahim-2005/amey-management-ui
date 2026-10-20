import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  FilePlus2,
  FileText,
  Ship,
  ClipboardCheck,
  LoaderCircle,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const API_URL = "http://127.0.0.1:5000";

const INITIAL_FORM = {
  category: "",
  bl_number: "",
  consignee: "",
  cargo_description: "",
  date_opened: new Date().toLocaleDateString("en-CA"),
  initial_eta: "",
  current_eta: "",
  shipping_line: "",
  vessel_name: "",
  depot_name: "",
  free_days: "",
  guarantee_expiry_date: "",
  kwatos_status: false,
  mother_entry_number: "",
  mother_entry_date: "",
  shipping_charges_requested: false,
  charges_requested_at: "",
  shipping_charges_paid: false,
  shipping_charges_paid_date: "",
  do_requested: false,
  do_requested_at: "",
  do_obtained: false,
  do_obtained_date: "",
  ready_to_close: false,
};

function getLocalDateTime() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate(),
  )}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

function getLocalDate() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
    now.getDate(),
  )}`;
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
  min,
  step,
  placeholder,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-medium text-slate-700"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        min={min}
        step={step}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function TextAreaField({ label, name, value, onChange, required = false }) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1.5 block text-sm font-medium text-slate-700"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        rows={3}
        className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      />
    </div>
  );
}

function CheckboxField({ label, name, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 transition hover:bg-slate-50">
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-blue-600"
      />

      <span className="text-sm font-medium text-slate-700">{label}</span>
    </label>
  );
}

function Section({ icon: Icon, title, description, children }) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
            <Icon size={19} />
          </div>

          <div>
            <h2 className="font-semibold text-slate-900">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
        {children}
      </div>
    </section>
  );
}

export default function CreateFile() {
  const navigate = useNavigate();

  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value, type, checked } = event.target;

    setForm((previous) => {
      const updated = {
        ...previous,
        [name]: type === "checkbox" ? checked : value,
      };

      const timestampFields = {
        shipping_charges_requested: "charges_requested_at",
        shipping_charges_paid: "shipping_charges_paid_date",
        do_requested: "do_requested_at",
        do_obtained: "do_obtained_date",
      };

      const dateFields = new Set([
        "shipping_charges_paid_date",
        "do_obtained_date",
      ]);

      if (type === "checkbox" && timestampFields[name]) {
        const dateField = timestampFields[name];

        if (checked) {
          updated[dateField] = dateFields.has(dateField)
            ? getLocalDate()
            : getLocalDateTime();
        } else {
          updated[dateField] = "";
        }
      }

      return updated;
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const token = sessionStorage.getItem("access_token");

    if (!token) {
      setError("Your session has expired. Please log in again.");
      return;
    }

    const payload = {
      category: form.category.trim(),
      bl_number: form.bl_number.trim(),
      consignee: form.consignee.trim(),
      cargo_description: form.cargo_description.trim(),
      date_opened: form.date_opened || null,
      initial_eta: form.initial_eta || null,
      current_eta: form.current_eta || null,
      shipping_line: form.shipping_line.trim() || null,
      vessel_name: form.vessel_name.trim() || null,
      depot_name: form.depot_name.trim() || null,
      free_days: form.free_days === "" ? null : Number(form.free_days),
      guarantee_expiry_date: form.guarantee_expiry_date || null,
      kwatos_status: form.kwatos_status,
      mother_entry_number: form.mother_entry_number.trim() || null,
      mother_entry_date: form.mother_entry_date
        ? new Date(form.mother_entry_date).toISOString()
        : null,
      shipping_charges_requested: form.shipping_charges_requested,
      charges_requested_at: form.charges_requested_at
        ? new Date(form.charges_requested_at).toISOString()
        : null,
      shipping_charges_paid: form.shipping_charges_paid,
      shipping_charges_paid_date: form.shipping_charges_paid_date || null,
      do_requested: form.do_requested,
      do_requested_at: form.do_requested_at
        ? new Date(form.do_requested_at).toISOString()
        : null,
      do_obtained: form.do_obtained,
      do_obtained_date: form.do_obtained_date || null,
      ready_to_close: form.ready_to_close,
    };

    setSaving(true);

    try {
      const response = await fetch(`${API_URL}/files`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Your session has expired. Please log in again.");
        }

        if (response.status === 409) {
          throw new Error(
            "A file with this BL number already exists. Check the number and try again.",
          );
        }

        throw new Error(
          data.message || "Could not create the consignment file.",
        );
      }

      if (data.id == null) {
        throw new Error(
          "The server created a response without a file ID. Check the files list before retrying to avoid creating a duplicate.",
        );
      }

      navigate(`/files/${data.id}`);
    } catch (err) {
      setError(err.message || "Something went wrong while creating the file.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page heading */}
        <div className="mb-7">
          <Link
            to="/"
            className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>

          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-blue-600 p-3 text-white shadow-sm">
              <FilePlus2 size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Create Consignment File
              </h1>

              <p className="mt-2 text-sm text-slate-500 sm:text-base">
                Enter the consignment details to open a new file. You can add
                containers after creating the file.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Section
            icon={FileText}
            title="Basic Information"
            description="Identify the consignment and its cargo."
          >
            <Field
              label="Destination / Category"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
              placeholder="e.g. Uganda, DRC"
            />

            <Field
              label="Bill of Lading (BL Number)"
              name="bl_number"
              value={form.bl_number}
              onChange={handleChange}
              required
              placeholder="Enter unique BL number"
            />

            <Field
              label="Consignee"
              name="consignee"
              value={form.consignee}
              onChange={handleChange}
              required
            />

            <Field
              label="Shipping Line"
              name="shipping_line"
              value={form.shipping_line}
              onChange={handleChange}
            />

            <Field
              label="Vessel Name"
              name="vessel_name"
              value={form.vessel_name}
              onChange={handleChange}
            />

            <div className="sm:col-span-2">
              <TextAreaField
                label="Cargo Description"
                name="cargo_description"
                value={form.cargo_description}
                onChange={handleChange}
                required
              />
            </div>
          </Section>

          <Section
            icon={Ship}
            title="Shipping Information"
            description="Record the dates and depot information."
          >
            <Field
              label="Date Opened"
              name="date_opened"
              type="date"
              value={form.date_opened}
              onChange={handleChange}
              required
            />

            <Field
              label="Initial ETA"
              name="initial_eta"
              type="date"
              value={form.initial_eta}
              onChange={handleChange}
            />

            <Field
              label="Current ETA"
              name="current_eta"
              type="date"
              value={form.current_eta}
              onChange={handleChange}
            />

            <Field
              label="Free Days"
              name="free_days"
              type="number"
              min="0"
              value={form.free_days}
              onChange={handleChange}
              placeholder="Number of free days"
            />

            <Field
              label="Depot Name"
              name="depot_name"
              value={form.depot_name}
              onChange={handleChange}
            />

            <Field
              label="Guarantee Expiry Date"
              name="guarantee_expiry_date"
              type="date"
              value={form.guarantee_expiry_date}
              onChange={handleChange}
            />
          </Section>

          <Section
            icon={ClipboardCheck}
            title="Customs & Tracking"
            description="Record customs information and current workflow statuses."
          >
            <Field
              label="Mother Entry Number"
              name="mother_entry_number"
              value={form.mother_entry_number}
              onChange={handleChange}
            />

            {/* <Field
              label="Mother Entry Date"
              name="mother_entry_date"
              type="datetime-local"
              value={form.mother_entry_date}
              onChange={handleChange}
            /> */}

            <div className="sm:col-span-2">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <CheckboxField
                  label="Reads in Kwatos"
                  name="kwatos_status"
                  checked={form.kwatos_status}
                  onChange={handleChange}
                />

                <CheckboxField
                  label="Shipping Charges Requested"
                  name="shipping_charges_requested"
                  checked={form.shipping_charges_requested}
                  onChange={handleChange}
                />

                <CheckboxField
                  label="Shipping Charges Paid"
                  name="shipping_charges_paid"
                  checked={form.shipping_charges_paid}
                  onChange={handleChange}
                />

                <CheckboxField
                  label="Delivery Order Requested"
                  name="do_requested"
                  checked={form.do_requested}
                  onChange={handleChange}
                />

                <CheckboxField
                  label="Delivery Order received"
                  name="do_obtained"
                  checked={form.do_obtained}
                  onChange={handleChange}
                />

                <CheckboxField
                  label="Ready to Close"
                  name="ready_to_close"
                  checked={form.ready_to_close}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="sm:col-span-2 rounded-lg bg-blue-50 p-3 text-sm text-blue-800">
              <div className="flex items-start gap-2">
                <CheckCircle2 size={18} className="mt-0.5 shrink-0" />

                <p>
                  Selecting a tracking status automatically fills its
                  corresponding date or timestamp. You can adjust those values
                  before creating the file.
                </p>
              </div>
            </div>

            <Field
              label="Shipping Charges Requested At"
              name="charges_requested_at"
              type="datetime-local"
              value={form.charges_requested_at}
              onChange={handleChange}
            />

            <Field
              label="Shipping Charges Paid Date"
              name="shipping_charges_paid_date"
              type="date"
              value={form.shipping_charges_paid_date}
              onChange={handleChange}
            />

            <Field
              label="Delivery Order Requested At"
              name="do_requested_at"
              type="datetime-local"
              value={form.do_requested_at}
              onChange={handleChange}
            />

            <Field
              label="Delivery Order Obtained Date"
              name="do_obtained_date"
              type="date"
              value={form.do_obtained_date}
              onChange={handleChange}
            />
          </Section>

          {/* Form actions */}
          <div className="flex flex-col-reverse gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <LoaderCircle size={17} className="animate-spin" />
                  Creating File...
                </>
              ) : (
                <>
                  <FilePlus2 size={17} />
                  Create File
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
