// --- src/Pages/Settings/Settings.jsx ---------------------------------------
import React, { useEffect, useState } from "react";
import axios   from "axios";
import Swal    from "sweetalert2";
import { Settings as SettingsIcon } from "lucide-react";

/* ---------- helper -------------- */
const empty = {
  name: "", phone: "", specialization: "", clinicName: "",
  clinicAddress: "", daysText: "MON, TUE, WED",
  timingText: "Please follow the schedule as directed."
};

function Settings() {
  const [form, setForm]     = useState(empty);
  const [pass, setPass]     = useState({ current:"", next:"", confirm:"" });
  const [loading, setLoad]  = useState(true);

  /* fetch once */
  useEffect(() => {
    axios.get("http://localhost:5000/api/settings")
      .then(({data}) => setForm(f=>({ ...f, ...data })))
      .catch(() => {/* first run – no doc yet */})
      .finally(() => setLoad(false));
  }, []);

  const h = e => setForm({ ...form, [e.target.name]: e.target.value });
  const hp = e => setPass({ ...pass, [e.target.name]: e.target.value });

  /* ---------------- SAVE profile ---------------- */
  const saveProfile = async () => {
    try {
      await axios.put("http://localhost:5000/api/settings", form);
      Swal.fire("Saved!", "Settings updated.", "success");
    } catch (err) {
      console.error(err);
      Swal.fire("Error", err.response?.data?.message || "Save failed", "error");
    }
  };

  /* ---------------- CHANGE password ------------- */
  const changePassword = async () => {
    if (pass.next !== pass.confirm) {
      return Swal.fire("Mismatch", "New passwords do not match", "warning");
    }
    try {
      await axios.put("http://localhost:5000/api/settings/password", {
        current: pass.current, next: pass.next
      });
      Swal.fire("Done", "Password changed", "success");
      setPass({ current:"", next:"", confirm:"" });
    } catch (err) {
      Swal.fire("Error", err.response?.data?.message || "Could not change password","error");
    }
  };

  /* ---------------- UI ---------------- */
  if (loading) return <p className="p-8 text-center">Loading…</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon size={26} className="text-teal-600"/>
        <h2 className="text-2xl font-semibold text-teal-800">Doctor Settings</h2>
      </div>

      {/* Profile form */}
      <div className="space-y-4">
        {[
          ["Doctor Name","name"],
          ["Phone","phone"],
          ["Specialization","specialization"],
          ["Clinic Name","clinicName"],
        ].map(([label,field])=>(
          <div key={field}>
            <label className="block font-medium mb-1">{label}</label>
            <input
              name={field} className="input input-bordered w-full"
              value={form[field]} onChange={h} autoComplete="off"
            />
          </div>
        ))}

        <div>
          <label className="block font-medium mb-1">Clinic Address</label>
          <textarea
            name="clinicAddress" rows={2}
            className="textarea textarea-bordered w-full"
            value={form.clinicAddress} onChange={h}
          />
        </div>

        {/* dynamic footer lines */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Days line</label>
            <input name="daysText" className="input input-bordered w-full"
                   value={form.daysText} onChange={h}/>
          </div>
          <div>
            <label className="block font-medium mb-1">Timing line</label>
            <input name="timingText" className="input input-bordered w-full"
                   value={form.timingText} onChange={h}/>
          </div>
        </div>
      </div>

      <button onClick={saveProfile}
              className="w-full btn btn-primary mt-4">Save Profile</button>

      {/* PASSWORD block */}
      <div className="divider">Change Password</div>
      <div className="space-y-3">
        {[
          ["Current Password","current","password"],
          ["New Password","next","password"],
          ["Confirm New Password","confirm","password"],
        ].map(([label,field,type])=>(
          <div key={field}>
            <label className="block font-medium mb-1">{label}</label>
            <input
              name={field} type={type} className="input input-bordered w-full"
              value={pass[field]} onChange={hp} autoComplete="new-password"
            />
          </div>
        ))}
        <button onClick={changePassword}
                className="w-full btn btn-outline btn-success">Update Password</button>
      </div>
    </div>
  );
}

export { Settings };          // <-- named
export default Settings;      // <-- default
