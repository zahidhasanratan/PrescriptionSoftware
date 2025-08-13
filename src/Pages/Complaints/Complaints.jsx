// --- src/Pages/Complaints/Complaints.jsx ------------------------------------
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FolderCog,
  Plus,
  Trash2,
  Save,
  PenSquare,
  X,
  ListChecks,
} from "lucide-react";

/* ---------------------------------- API BASE ---------------------------------
 * Priority:
 * 1) VITE_API_BASE (e.g., http://localhost:5000/api)
 * 2) If running on localhost -> http://localhost:5000/api
 * 3) Fallback to prod -> https://prescription-ebon.vercel.app/api
 * --------------------------------------------------------------------------- */
const API_BASE = "https://prescription-ebon.vercel.app/api";


// axios instance
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false,
  headers: { "Content-Type": "application/json" },
});

const emptyNew = { name: "" };

export const Complaints = () => {
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState([]); // [{_id,name,details:[]}]
  const [newCat, setNewCat] = useState(emptyNew);

  // per-category UI state
  const [detailDraft, setDetailDraft] = useState({}); // { [id]: "text..." }
  const [editing, setEditing] = useState({}); // { [id]: true/false }
  const [editValue, setEditValue] = useState({}); // { [id]: "new name" }

  const isEmpty = useMemo(() => !list || list.length === 0, [list]);

  /* ---------------- helpers ---------------- */
  const toastErr = (title, err, fallback) => {
    const msg =
      err?.response?.data?.message ||
      err?.message ||
      err?.toString() ||
      fallback;
    Swal.fire("Error", `${title}: ${msg}`, "error");
  };

  /* ---------------- Fetch once ---------------- */
  const fetchAll = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/complaints`);
      setList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("GET /complaints failed:", err);
      Swal.fire("Error", "Failed to load complaints", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  /* ---------------- Create Category ---------------- */
  const createCategory = async () => {
    const name = (newCat.name || "").trim();
    if (!name) {
      return Swal.fire("Required", "Please enter a category name.", "info");
    }
    try {
      const { data } = await api.post(`/complaints`, { name });
      Swal.fire("Added", "Category created.", "success");
      setNewCat(emptyNew);

      // optimistic or refetch
      if (data && (data._id || data.id)) {
        setList((prev) => [
          ...prev,
          { _id: data._id || data.id, name, details: [] },
        ]);
      } else {
        fetchAll();
      }
    } catch (err) {
      console.error("POST /complaints failed:", err);
      toastErr("Create failed", err, "Create failed");
    }
  };

  /* ---------------- Edit Category Name ---------------- */
  const startEdit = (id, current) => {
    setEditing((s) => ({ ...s, [id]: true }));
    setEditValue((s) => ({ ...s, [id]: current || "" }));
  };

  const cancelEdit = (id) => {
    setEditing((s) => ({ ...s, [id]: false }));
    setEditValue((s) => {
      const n = { ...s };
      delete n[id];
      return n;
    });
  };

  const saveEdit = async (id) => {
    const name = (editValue[id] || "").trim();
    if (!name) return Swal.fire("Required", "Name cannot be empty.", "info");
    try {
      await api.put(`/complaints/${id}`, { name });
      setList((prev) => prev.map((c) => (c._id === id ? { ...c, name } : c)));
      cancelEdit(id);
      Swal.fire("Saved", "Category updated.", "success");
    } catch (err) {
      console.error("PUT /complaints/:id failed:", err);
      toastErr("Update failed", err, "Update failed");
    }
  };

  /* ---------------- Delete Category ---------------- */
  const deleteCategory = async (id) => {
    const ok = await Swal.fire({
      title: "Delete Category?",
      text: "This will remove the category and all its details.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });
    if (!ok.isConfirmed) return;
    try {
      await api.delete(`/complaints/${id}`);
      setList((prev) => prev.filter((c) => c._id !== id));
      Swal.fire("Deleted", "Category removed.", "success");
    } catch (err) {
      console.error("DELETE /complaints/:id failed:", err);
      toastErr("Delete failed", err, "Delete failed");
    }
  };

  /* ---------------- Add Detail Line ---------------- */
  const addDetail = async (id) => {
    const text = (detailDraft[id] || "").trim();
    if (!text) return;
    try {
      await api.post(`/complaints/${id}/details`, { text });

      // optimistic update
      setList((prev) =>
        prev.map((c) =>
          c._id === id ? { ...c, details: [...(c.details || []), text] } : c
        )
      );
      setDetailDraft((s) => ({ ...s, [id]: "" }));
    } catch (err) {
      console.error("POST /complaints/:id/details failed:", err);
      toastErr("Add detail failed", err, "Add detail failed");
    }
  };

  /* ---------------- Delete Single Detail ---------------- */
  const deleteDetail = async (id, index) => {
    try {
      await api.delete(`/complaints/${id}/details/${index}`);
      setList((prev) =>
        prev.map((c) =>
          c._id === id
            ? { ...c, details: (c.details || []).filter((_, i) => i !== index) }
            : c
        )
      );
    } catch (err) {
      console.error("DELETE /complaints/:id/details/:index failed:", err);
      toastErr("Remove detail failed", err, "Remove detail failed");
    }
  };

  /* ---------------- UI ---------------- */
  if (loading)
    return (
      <p className="p-8 text-center text-gray-600">
        Loading complaints…
      </p>
    );

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <FolderCog size={26} className="text-teal-600" />
        <h2 className="text-2xl font-semibold text-teal-800">Complaints</h2>
        <span className="ml-auto text-xs text-gray-400">
          API: {API_BASE}
        </span>
      </div>

      {/* Create Category */}
      <div className="rounded-lg border p-4 space-y-3">
        <div className="font-medium">Add Category</div>
        <div className="flex gap-3">
          <input
            className="input input-bordered w-full"
            placeholder="e.g., Fever, Hair Fall"
            value={newCat.name}
            onChange={(e) => setNewCat({ name: e.target.value })}
            onKeyDown={(e) => e.key === "Enter" && createCategory()}
          />
          <button className="btn btn-primary" onClick={createCategory}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </button>
        </div>
      </div>

      {/* Empty state */}
      {isEmpty && (
        <div className="p-8 text-center text-gray-500">
          No categories yet. Create your first complaint category above.
        </div>
      )}

      {/* Category List */}
      <div className="space-y-4">
        {list.map((cat) => (
          <div
            key={cat._id}
            className="border rounded-lg overflow-hidden bg-base-50"
          >
            {/* Category header */}
            <div className="flex items-center justify-between gap-3 p-4 bg-base-100">
              <div className="flex items-center gap-3">
                <ListChecks className="text-teal-600" />
                {!editing[cat._id] ? (
                  <div className="text-lg font-semibold">{cat.name}</div>
                ) : (
                  <input
                    className="input input-bordered input-sm w-60"
                    value={editValue[cat._id] || ""}
                    onChange={(e) =>
                      setEditValue((s) => ({ ...s, [cat._id]: e.target.value }))
                    }
                    onKeyDown={(e) => e.key === "Enter" && saveEdit(cat._id)}
                    autoFocus
                  />
                )}
              </div>

              <div className="flex items-center gap-2">
                {!editing[cat._id] ? (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => startEdit(cat._id, cat.name)}
                    title="Rename"
                  >
                    <PenSquare className="w-4 h-4" />
                  </button>
                ) : (
                  <>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => saveEdit(cat._id)}
                      title="Save"
                    >
                      <Save className="w-4 h-4" />
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => cancelEdit(cat._id)}
                      title="Cancel"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </>
                )}

                <button
                  className="btn btn-ghost btn-sm text-red-600"
                  onClick={() => deleteCategory(cat._id)}
                  title="Delete Category"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Details list */}
            <div className="p-4 space-y-3">
              <div className="text-sm text-gray-600">
                Add multiple details (one per line) for <b>{cat.name}</b>.
              </div>

              {(cat.details || []).length > 0 ? (
                <ul className="space-y-2">
                  {cat.details.map((d, idx) => (
                    <li
                      key={`${cat._id}-${idx}`}
                      className="flex items-center justify-between gap-3 bg-white border rounded-md px-3 py-2"
                    >
                      <span className="text-sm">{d}</span>
                      <button
                        className="btn btn-ghost btn-xs text-red-600"
                        onClick={() => deleteDetail(cat._id, idx)}
                        title="Remove"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-gray-500 italic">No details yet.</div>
              )}

              {/* Add new detail */}
              <div className="flex gap-3 pt-2">
                <input
                  className="input input-bordered w-full"
                  placeholder='e.g., "Dengue fever from 7 days"'
                  value={detailDraft[cat._id] || ""}
                  onChange={(e) =>
                    setDetailDraft((s) => ({ ...s, [cat._id]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addDetail(cat._id);
                  }}
                />
                <button className="btn btn-outline" onClick={() => addDetail(cat._id)}>
                  <Plus className="w-4 h-4 mr-1" /> Add Detail
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Complaints;
