import { useEffect, useMemo, useState } from "react";

import {
  Search,
  UsersRound,
  Eye,
  Pencil,
  Mail,
  Phone,
  BriefcaseBusiness,
  X,
} from "lucide-react";

import {
  getCustomers,
  getCustomer,
  updateCustomer,
} from "../../services/crmService";

import toast from "react-hot-toast";
import Modal from "../common/Modal";

export default function Customers() {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);

      const r = await getCustomers();
      setRows(r.customers || []);
    } catch (e) {
      toast.error(
        e.response?.data?.message || "Failed to load customers"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const visible = useMemo(
    () =>
      rows.filter(
        (c) =>
          !search ||
          `${c.lead?.name || ""} ${c.lead?.email || ""} ${c.lead?.domainType?.name || ""
            } ${c.owner?.name || ""} ${c.requirement || ""}`
            .toLowerCase()
            .includes(search.toLowerCase())
      ),
    [rows, search]
  );

  const open = async (id) => {
    try {
      const r = await getCustomer(id);

      setSelected(r.customer);

      setForm({
        requirement: r.customer.requirement || "",
        service: r.customer.service || "",
        notes: r.customer.notes || "",
        contactPerson: r.customer.contactPerson || "",
        alternatePhone: r.customer.alternatePhone || "",
      });

      setEditing(false);
    } catch (e) {
      toast.error(
        e.response?.data?.message || "Failed to load customer"
      );
    }
  };
  const openForEdit = async (id) => {
    await open(id);
    setEditing(true);
  };

  const save = async () => {
    try {
      await updateCustomer(selected.id, form);

      toast.success("Customer updated");

      await open(selected.id);
      await load();
    } catch (e) {
      toast.error(e.response?.data?.message || "Update failed");
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <div>
          <div className="eyebrow">Relationships</div>

          <h1 className="page-title">Customers</h1>

          <p className="page-description">
            Won leads that have completed customer conversion. Open a
            record to manage requirements and relationship notes.
          </p>
        </div>
      </div>

      <div className="toolbar">
        <div className="crm-search relative w-full  sm:max-w-md">

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers, owner, domain or requirement…"
            className="field w-full !pl-9"
          />
          <Search className="field-icon " size={17} />
        </div>

        <div className="ml-auto text-xs font-medium text-slate-500">
          {visible.length} customer{visible.length === 1 ? "" : "s"}
        </div>
      </div>

      <div className="data-card">
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Domain</th>
                <th>Owner</th>
                <th>Converted</th>
                <th>Requirement</th>
                {/* <th className="text-right pr-6">Action</th> */}
                <th className="text-right whitespace-nowrap pr-4 sm:pr-6">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {!loading &&
                visible.map((c) => (
                  <tr
                    key={c.id}
                    className="cursor-pointer"
                    onClick={() => open(c.id)}
                  >
                    <td>
                      <div className="font-semibold">
                        {c.lead?.name || "Unnamed customer"}
                      </div>

                      <div className="mt-1 flex gap-3 text-xs text-slate-500">
                        {c.lead?.email && (
                          <span className="inline-flex items-center gap-1">
                            <Mail size={12} />
                            {c.lead.email}
                          </span>
                        )}

                        {c.lead?.phone && (
                          <span className="inline-flex items-center gap-1">
                            <Phone size={12} />
                            {c.lead.phone}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-neutral">
                        {c.lead?.domainType?.name || "—"}
                      </span>
                    </td>

                    <td>{c.owner?.name || "—"}</td>

                    <td className="whitespace-nowrap text-slate-500">
                      {new Date(c.convertedAt).toLocaleDateString()}
                    </td>

                    <td>
                      <div className="max-w-sm truncate text-slate-600 dark:text-slate-300">
                        {c.requirement || "No requirement recorded"}
                      </div>
                    </td>

{/* 
                    <td>
                      <div className="flex justify-end gap-2">
                        
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            open(c.id);
                          }}
                        >
                          <Eye size={15} />
                          View
                        </button>

                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={(e) => {
                            e.stopPropagation();
                            openForEdit(c.id);
                          }}
                        >
                          <Pencil size={15} />
                          Edit
                        </button>
                      </div>
                    </td> */}
                    <td className="px-4 py-4 sm:px-6">
  <div className="flex items-center justify-end gap-2">
    {/* View Button */}
    <button
      className="btn-secondary inline-flex items-center gap-1.5 whitespace-nowrap"
      onClick={(e) => {
        e.stopPropagation();
        open(c.id);
      }}
    >
      <Eye size={15} />
      <span>View</span>
    </button>

    {/* Edit Button */}
    <button
      className="btn-secondary inline-flex items-center gap-1.5 whitespace-nowrap"
      onClick={(e) => {
        e.stopPropagation();
        openForEdit(c.id);
      }}
    >
      <Pencil size={15} />
      <span>Edit</span>
    </button>
  </div>
</td>

                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {loading && (
          <div className="empty-state">Loading customers…</div>
        )}

        {!loading && !visible.length && (
          <div className="empty-state">
            <UsersRound size={30} />

            <b>No customers found</b>

            <span>Converted leads will appear here.</span>
          </div>
        )}
      </div>

      <Modal
        isOpen={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.lead?.name || "Customer details"}
        size="lg"
      >
        {selected && (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Email", selected.lead?.email],
                ["Phone", selected.lead?.phone],
                ["Domain", selected.lead?.domainType?.name],
                ["Owner", selected.owner?.name],
                ["Converted by", selected.convertedBy?.name],
                [
                  "Converted",
                  new Date(selected.convertedAt).toLocaleString(),
                ],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="rounded-lg border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-900"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {k}
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {v || "—"}
                  </p>
                </div>
              ))}
            </div>

            {!editing ? (
              <>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Info
                    title="Service / project"
                    value={selected.service}
                  />

                  <Info
                    title="Contact person"
                    value={selected.contactPerson}
                  />

                  <Info
                    title="Alternate phone"
                    value={selected.alternatePhone}
                  />

                  <Info
                    title="Requirement"
                    value={selected.requirement}
                  />
                </div>

                <Info
                  title="Relationship notes"
                  value={selected.notes}
                />

                <div className="flex justify-end">
                  <button
                    onClick={() => setEditing(true)}
                    className="btn-secondary"
                  >
                    <Pencil size={15} />
                    Edit customer
                  </button>
                </div>
              </>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Contact person"
                  value={form.contactPerson}
                  set={(v) =>
                    setForm({
                      ...form,
                      contactPerson: v,
                    })
                  }
                />

                <Field
                  label="Alternate phone"
                  value={form.alternatePhone}
                  set={(v) =>
                    setForm({
                      ...form,
                      alternatePhone: v,
                    })
                  }
                />

                <Field
                  label="Service / project"
                  value={form.service}
                  set={(v) =>
                    setForm({
                      ...form,
                      service: v,
                    })
                  }
                  wide
                />

                <Area
                  label="Requirement"
                  value={form.requirement}
                  set={(v) =>
                    setForm({
                      ...form,
                      requirement: v,
                    })
                  }
                />

                <Area
                  label="Customer communication / notes"
                  value={form.notes}
                  set={(v) =>
                    setForm({
                      ...form,
                      notes: v,
                    })
                  }
                />

                <div className="flex justify-end gap-2 sm:col-span-2">
                  <button
                    onClick={() => setEditing(false)}
                    className="btn-secondary"
                  >
                    <X size={15} />
                    Cancel
                  </button>

                  <button
                    onClick={save}
                    className="btn-primary"
                  >
                    <BriefcaseBusiness size={15} />
                    Save changes
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

const Info = ({ title, value }) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-900">
    <p className="text-xs font-semibold text-slate-500">
      {title}
    </p>

    <p className="mt-1 whitespace-pre-wrap text-sm">
      {value || "—"}
    </p>
  </div>
);

const Field = ({ label, value, set, wide }) => (
  <label
    className={`text-sm font-medium ${wide ? "sm:col-span-2" : ""
      }`}
  >
    {label}

    <input
      value={value || ""}
      onChange={(e) => set(e.target.value)}
      className="field mt-1.5 w-full"
    />
  </label>
);

const Area = ({ label, value, set }) => (
  <label className="text-sm font-medium sm:col-span-2">
    {label}

    <textarea
      rows={3}
      value={value || ""}
      onChange={(e) => set(e.target.value)}
      className="field mt-1.5 w-full"
    />
  </label>
);

