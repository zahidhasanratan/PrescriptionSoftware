import React from "react";
import { Plus } from "lucide-react";

export const Patient = () => {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-teal-800">Patients</h2>
        <button className="btn btn-sm btn-primary gap-2 shadow">
          <Plus size={16} />
          Add Patient
        </button>
      </div>

      {/* Table Placeholder */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-gray-200">
        <table className="table table-zebra w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Phone</th>
              <th>Tags</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {/* Sample Placeholder Rows */}
            <tr>
              <td>Mr. Jahidul</td>
              <td>45</td>
              <td>Male</td>
              <td>+880123456789</td>
              <td>
                <span className="badge badge-error badge-sm">Chronic</span>
              </td>
              <td>
                <button className="btn btn-xs btn-outline btn-info mr-2">View</button>
                <button className="btn btn-xs btn-outline btn-warning">Edit</button>
              </td>
            </tr>
            <tr>
              <td>Mrs. Rahima</td>
              <td>60</td>
              <td>Female</td>
              <td>+880198765432</td>
              <td>
                <span className="badge badge-success badge-sm">Returning</span>
              </td>
              <td>
                <button className="btn btn-xs btn-outline btn-info mr-2">View</button>
                <button className="btn btn-xs btn-outline btn-warning">Edit</button>
              </td>
            </tr>
            {/* More rows can be mapped here */}
          </tbody>
        </table>
      </div>
    </div>
  );
};
