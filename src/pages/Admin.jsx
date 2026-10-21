import { useCallback, useEffect, useState } from "react";
import {
  Users,
  ShieldCheck,
  ShieldOff,
  Trash2,
  Search,
  RefreshCw,
  AlertCircle,
  X,
  CheckCircle2,
  LoaderCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL;

function isActive(user) {
  return user?.is_active === true || user?.is_active === 1;
}

function getRoleLabel(role) {
  switch (role) {
    case "admin":
      return "Administrator";
    case "employee":
      return "Employee";
    case "user":
      return "User";
    default:
      return role || "Unknown";
  }
}

function getInitial(user) {
  return (user?.username || user?.email || "?").charAt(0).toUpperCase();
}

export default function Admin() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [workingId, setWorkingId] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [notice, setNotice] = useState(null);

  const token = sessionStorage.getItem("access_token");

  const apiRequest = useCallback(
    async (endpoint, options = {}) => {
      const response = await fetch(`${API_URL}/${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (response.status === 401) {
          sessionStorage.removeItem("access_token");
          sessionStorage.removeItem("user");
          navigate("/login", { replace: true });
        }

        throw new Error(
          data.message || data.error || `Request failed (${response.status}).`,
        );
      }

      return data;
    },
    [token, navigate],
  );

  const loadUsers = useCallback(async () => {
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Verify the current account is an active administrator.
      await apiRequest("/admin/users");

      // Fetch the complete user list.
      const data = await apiRequest("/users");

      if (!Array.isArray(data)) {
        throw new Error("The server returned an unexpected user list.");
      }

      setUsers(data);
    } catch (err) {
      setError(err.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }, [apiRequest, navigate, token]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const currentUser = (() => {
    try {
      return JSON.parse(sessionStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const filteredUsers = users.filter((user) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return [user.username, user.email, user.role, String(user.id)].some(
      (value) =>
        String(value || "")
          .toLowerCase()
          .includes(query),
    );
  });

  const showNotice = (type, message) => {
    setNotice({ type, message });

    window.setTimeout(() => {
      setNotice(null);
    }, 3500);
  };

  const startAction = (type, user, value = null) => {
    setNotice(null);
    setConfirmation({ type, user, value });
  };

  const confirmAction = async () => {
    if (!confirmation) return;

    const { type, user, value } = confirmation;

    setWorkingId(user.id);

    try {
      if (type === "activate" || type === "deactivate") {
        await apiRequest(`/users/${user.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            is_active: type === "activate" ? "true" : "false",
          }),
        });

        showNotice(
          "success",
          type === "activate"
            ? `${user.username} has been activated.`
            : `${user.username} has been deactivated.`,
        );
      } else if (type === "role") {
        await apiRequest(`/users/${user.id}`, {
          method: "PATCH",
          body: JSON.stringify({ role: value }),
        });

        showNotice("success", `${user.username}'s role has been updated.`);
      } else if (type === "delete") {
        await apiRequest(`/users/${user.id}`, {
          method: "DELETE",
        });

        showNotice("success", `${user.username}'s account has been deleted.`);
      }

      setConfirmation(null);
      await loadUsers();
    } catch (err) {
      showNotice("error", err.message || "The action could not be completed.");
    } finally {
      setWorkingId(null);
    }
  };

  const isSelf = (user) =>
    currentUser && Number(user.id) === Number(currentUser.id);

  const activeCount = users.filter(isActive).length;
  const inactiveCount = users.length - activeCount;
  const adminCount = users.filter((user) => user.role === "admin").length;

  const confirmationDetails = {
    activate: {
      title: "Activate account?",
      message: "This account will be allowed to sign in once activated.",
      button: "Activate account",
    },
    deactivate: {
      title: "Deactivate account?",
      message: "This account will no longer be allowed to sign in.",
      button: "Deactivate account",
    },
    role: {
      title: "Change user role?",
      message: `This will change the user's role to ${getRoleLabel(
        confirmation?.value,
      )}.`,
      button: "Update role",
    },
    delete: {
      title: "Delete account?",
      message:
        "This permanently deletes the account. This action cannot be undone.",
      button: "Delete account",
    },
  };

  const confirmationInfo = confirmation
    ? confirmationDetails[confirmation.type]
    : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
              <Users size={23} />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                User Management
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage accounts, permissions, and access.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={loadUsers}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Notifications */}
        {notice && (
          <div
            role="status"
            className={`mb-6 flex items-start gap-3 rounded-xl border p-4 ${
              notice.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {notice.type === "success" ? (
              <CheckCircle2 size={19} className="mt-0.5 shrink-0" />
            ) : (
              <AlertCircle size={19} className="mt-0.5 shrink-0" />
            )}

            <p className="flex-1 text-sm font-medium">{notice.message}</p>

            <button
              type="button"
              onClick={() => setNotice(null)}
              aria-label="Dismiss notification"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            title="Total users"
            value={users.length}
            icon={<Users size={20} />}
            description="Registered accounts"
          />

          <SummaryCard
            title="Active accounts"
            value={activeCount}
            icon={<ShieldCheck size={20} />}
            description="Can sign in"
            accent="emerald"
          />

          <SummaryCard
            title="Pending activation"
            value={inactiveCount}
            icon={<ShieldOff size={20} />}
            description="Awaiting access"
            accent="amber"
          />

          <SummaryCard
            title="Administrators"
            value={adminCount}
            icon={<ShieldCheck size={20} />}
            description="Accounts with admin roles"
            accent="blue"
          />
        </div>

        {/* Search and table */}
        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold">All users</h2>
              <p className="mt-1 text-sm text-slate-500">
                Review account status and manage permissions.
              </p>
            </div>

            <div className="relative w-full sm:max-w-sm">
              <Search
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search users..."
                aria-label="Search users"
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 p-8 text-slate-500">
              <LoaderCircle size={30} className="animate-spin" />
              <p className="text-sm">Loading users...</p>
            </div>
          ) : error ? (
            <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertCircle size={23} />
              </div>

              <h3 className="mt-4 font-semibold">Could not load users</h3>

              <p className="mt-2 max-w-lg text-sm text-slate-500">{error}</p>

              <button
                type="button"
                onClick={loadUsers}
                className="mt-5 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Try again
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
              <Users size={34} className="text-slate-300" />

              <h3 className="mt-3 font-semibold">No users found</h3>

              <p className="mt-1 text-sm text-slate-500">
                {search
                  ? "Try a different search term."
                  : "No user accounts are available."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <th className="px-5 py-4 font-semibold">User</th>
                    <th className="px-5 py-4 font-semibold">Role</th>
                    <th className="px-5 py-4 font-semibold">Status</th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map((user) => {
                    const active = isActive(user);
                    const self = isSelf(user);
                    const busy = workingId === user.id;

                    return (
                      <tr
                        key={user.id}
                        className="transition hover:bg-slate-50/80"
                      >
                        {/* User */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 font-bold text-slate-600">
                              {getInitial(user)}
                            </div>

                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900">
                                {user.username || "Unnamed user"}
                                {self && (
                                  <span className="ml-2 text-xs font-normal text-slate-400">
                                    You
                                  </span>
                                )}
                              </p>

                              <p className="mt-1 truncate text-xs text-slate-500">
                                {user.email}
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                ID: {user.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Role */}
                        <td className="px-5 py-4">
                          <select
                            value={user.role || "user"}
                            onChange={(event) =>
                              startAction("role", user, event.target.value)
                            }
                            disabled={self || busy}
                            aria-label={`Change role for ${user.username}`}
                            className="max-w-44 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                            title={
                              self
                                ? "You cannot change your own role here."
                                : "Change user role"
                            }
                          >
                            <option value="user">User</option>
                            <option value="employee">Employee</option>
                            <option value="admin">Administrator</option>
                          </select>

                          <p className="mt-1 text-xs text-slate-400">
                            {getRoleLabel(user.role)}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                              active
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                active ? "bg-emerald-500" : "bg-amber-500"
                              }`}
                            />
                            {active ? "Active" : "Pending"}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                startAction(
                                  active ? "deactivate" : "activate",
                                  user,
                                )
                              }
                              disabled={self || busy}
                              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${
                                active
                                  ? "text-amber-700 hover:bg-amber-50"
                                  : "text-emerald-700 hover:bg-emerald-50"
                              }`}
                              title={
                                self
                                  ? "You cannot change your own account status."
                                  : active
                                    ? "Deactivate account"
                                    : "Activate account"
                              }
                            >
                              {busy ? (
                                <LoaderCircle
                                  size={14}
                                  className="animate-spin"
                                />
                              ) : active ? (
                                <ShieldOff size={14} />
                              ) : (
                                <ShieldCheck size={14} />
                              )}

                              {active ? "Disable" : "Activate"}
                            </button>

                            <button
                              type="button"
                              onClick={() => startAction("delete", user)}
                              disabled={self || busy}
                              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
                              title={
                                self
                                  ? "You cannot delete your own account."
                                  : "Delete account"
                              }
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && filteredUsers.length > 0 && (
            <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 text-xs text-slate-500">
              Showing {filteredUsers.length} of {users.length} users
            </div>
          )}
        </section>
      </main>

      {/* Confirmation dialog */}
      {confirmation && confirmationInfo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && workingId === null) {
              setConfirmation(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                confirmation.type === "delete"
                  ? "bg-red-50 text-red-600"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {confirmation.type === "delete" ? (
                <Trash2 size={23} />
              ) : confirmation.type === "activate" ? (
                <ShieldCheck size={23} />
              ) : confirmation.type === "deactivate" ? (
                <ShieldOff size={23} />
              ) : (
                <Users size={23} />
              )}
            </div>

            <h2
              id="confirm-title"
              className="mt-4 text-lg font-bold text-slate-900"
            >
              {confirmationInfo.title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {confirmationInfo.message}
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmation(null)}
                disabled={workingId !== null}
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmAction}
                disabled={workingId !== null}
                className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 ${
                  confirmation.type === "delete"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-slate-900 hover:bg-slate-800"
                }`}
              >
                {workingId !== null && (
                  <LoaderCircle size={15} className="animate-spin" />
                )}
                {confirmationInfo.button}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value, icon, description, accent = "slate" }) {
  const accents = {
    slate: "bg-slate-100 text-slate-700",
    emerald: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${accents[accent]}`}
        >
          {icon}
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-500">{description}</p>
    </div>
  );
}
