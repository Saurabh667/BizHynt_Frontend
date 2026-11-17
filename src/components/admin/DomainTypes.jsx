
import { useEffect, useMemo, useState } from "react";

import {
  Layers3,
  Plus,
  Search,
  Pencil,
  Power,
} from "lucide-react";

import toast from "react-hot-toast";
import useAuthStore from "../../store/authStore";

import {
  getDomains,
  createDomain,
  updateDomain,
  setDomainActive,
} from "../../services/crmService";

import Modal from "../common/Modal";

export default function DomainTypes() {
  const user = useAuthStore((s) => s.user);

  const canManage = ["super_admin", "admin"].includes(user?.role);

  const [domains, setDomains] = useState([]);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const r = await getDomains();
      setDomains(r.domains || []);
    } catch (e) {
      toast.error(
        e.response?.data?.message || "Failed to load domain types"
      );
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submit = async () => {
    if (!form.name.trim()) {
      return toast.error("Domain type name is required");
    }

    try {
      setSaving(true);

      if (editing) {
        await updateDomain(editing.id, form);
      } else {
        await createDomain(form);
      }

      toast.success(
        editing
          ? "Domain type updated"
          : "Domain type created"
      );

      setOpen(false);
      setEditing(null);
      setForm({
        name: "",
        description: "",
      });

      await load();
    } catch (e) {
      toast.error(
        e.response?.data?.message || "Unable to save domain type"
      );
    } finally {
      setSaving(false);
    }
  };

  const visible = useMemo(
    () =>
      domains.filter(
        (d) =>
          !search ||
          `${d.name} ${d.description || ""}`
            .toLowerCase()
            .includes(search.toLowerCase())
      ),
    [domains, search]
  );

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <div className="eyebrow">Lead classification</div>

          <h1 className="page-title">Domain Types</h1>

          <p className="page-description">
            The controlled business-sector catalogue used by manual
            leads, imports, API intake and teams.
          </p>
        </div>

        {canManage && (
          <button
            onClick={() => {
              setEditing(null);
              setForm({
                name: "",
                description: "",
              });
              setOpen(true);
            }}
            className="btn-primary"
          >
            <Plus size={16} />
            Add Domain Type
          </button>
        )}
      </div>

      <div className="toolbar">
        <div className="relative w-full sm:w-96">
          <Search
            size={16}
            className="field-icon"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name or description"
            className="field w-full !pl-9"
          />
        </div>

        <span className="ml-auto text-xs font-medium text-slate-500">
          {visible.length} domains
        </span>
      </div>

      <div className="data-card">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Domain Type</th>
                <th>Leads</th>
                <th>Team</th>
                <th>Status</th>

                {canManage && (
                  <th className="text-right">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {visible.map((d) => (
                <tr key={d.id}>
                  <td>
                    <div className="font-semibold">
                      {d.name}
                    </div>

                    <div className="mt-0.5 max-w-xl text-xs text-slate-500">
                      {d.description || "No description"}
                    </div>
                  </td>

                  <td>{d._count?.leads || 0}</td>

                  <td>{d._count?.teams || 0}</td>

                  <td>
                    <span
                      className={`badge ${
                        d.isActive
                          ? "bg-emerald-50 text-emerald-700"
                          : "badge-neutral"
                      }`}
                    >
                      {d.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {canManage && (
                    <td>
                      <div className="flex justify-end gap-1">
                        <button
                          title="Edit"
                          onClick={() => {
                            setEditing(d);

                            setForm({
                              name: d.name,
                              description: d.description || "",
                            });

                            setOpen(true);
                          }}
                          className="icon-btn"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          title={
                            d.isActive
                              ? "Deactivate"
                              : "Activate"
                          }
                          onClick={async () => {
                            try {
                              await setDomainActive(
                                d.id,
                                !d.isActive
                              );

                              toast.success(
                                d.isActive
                                  ? "Domain deactivated"
                                  : "Domain activated"
                              );

                              await load();
                            } catch (e) {
                              toast.error(
                                e.response?.data?.message ||
                                  "Update failed"
                              );
                            }
                          }}
                          className="icon-btn"
                        >
                          <Power size={15} />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!visible.length && (
          <div className="empty-state">
            <Layers3 size={28} />

            <b>No domain types found</b>

            <span>Try a different search.</span>
          </div>
        )}
      </div>
      

      <Modal
        isOpen={open}
        onClose={() => !saving && setOpen(false)}
        title={
          editing
            ? "Edit Domain Type"
            : "Create Domain Type"
        }
        description="Domain Types keep leads, teams and imports consistently classified."
      >
        <div className="space-y-4">
          <label className="block text-sm font-medium">
            Name{" "}
            <span className="text-red-500">*</span>

            <input
              autoFocus
              maxLength={100}
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              className="field mt-1.5 w-full"
              placeholder="e.g. Education"
            />
          </label>

          <label className="block text-sm font-medium">
            Description

            <textarea
              maxLength={500}
              rows={3}
              value={form.description}
              onChange={(e) =>
                setForm({
                  ...form,
                  description: e.target.value,
                })
              }
              className="field mt-1.5 w-full"
              placeholder="What kind of businesses belong here?"
            />
          </label>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
            <button
              disabled={saving}
              onClick={() => setOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>

            <button
              disabled={saving}
              onClick={submit}
              className="btn-primary"
            >
              {saving
                ? "Saving…"
                : editing
                ? "Save changes"
                : "Create domain"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

