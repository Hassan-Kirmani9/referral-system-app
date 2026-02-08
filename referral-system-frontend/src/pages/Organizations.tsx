import { useState, useEffect } from "react";
import { Plus, Trash2, Building, Edit } from "lucide-react";
import { get, post, _delete, put, patch } from "../services/api";
import type {
  Organization,
  ApiResponse,
  OrganizationType,
  OrganizationRole,
} from "../types";
import { Toast } from "../components/Toast";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Loading } from "../components/Loading";

export const Organizations = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    show: boolean;
    id: string;
    name: string;
  }>({
    show: false,
    id: "",
    name: "",
  });
  const [editMode, setEditMode] = useState<{ active: boolean; id: string }>({
    active: false,
    id: "",
  });
  const [formData, setFormData] = useState({
    name: "",
    type: "" as OrganizationType | "",
    role: "" as OrganizationRole | "",
    email: "",
    phone: "",
  });

  const [coverageAreas, setCoverageAreas] = useState([
    { state: "", county: "", city: "", zipCode: "" },
  ]);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await get<ApiResponse<Organization[]>>("/organizations");
      setOrganizations(response.data);
    } catch (error: any) {
      setToast({
        type: "error",
        message: error.error || "Failed to fetch organizations",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.type ||
      !formData.role ||
      !formData.email ||
      !formData.phone
    ) {
      setToast({ type: "error", message: "Please fill all required fields" });
      return;
    }

    try {
      setLoading(true);

      if (editMode.active) {

        await patch(`/organizations/${editMode.id}`, {
          name: formData.name,
          type: formData.type,
          role: formData.role,
          contact: {
            email: formData.email,
            phone: formData.phone,
          },
        });

        const filledCoverage = coverageAreas.filter((area) => area.state);
        if (filledCoverage.length > 0) {
          await put(`/organizations/${editMode.id}/coverage`, {
            coverageAreas: filledCoverage,
          });
        }

        setToast({
          type: "success",
          message: "Organization updated successfully!",
        });
        setEditMode({ active: false, id: "" });
      } else {
        // CREATE new organization
        const orgResponse = await post<ApiResponse<Organization>>(
          "/organizations",
          {
            name: formData.name,
            type: formData.type,
            role: formData.role,
            contact: {
              email: formData.email,
              phone: formData.phone,
            },
          },
        );

        const filledCoverage = coverageAreas.filter((area) => area.state);
        if (filledCoverage.length > 0) {
          await put(`/organizations/${orgResponse.data.id}/coverage`, {
            coverageAreas: filledCoverage,
          });
        }

        setToast({
          type: "success",
          message: "Organization created successfully!",
        });
      }

      fetchOrganizations();
      setFormData({ name: "", type: "", role: "", email: "", phone: "" });
      setCoverageAreas([{ state: "", county: "", city: "", zipCode: "" }]);
    } catch (error: any) {
      setToast({
        type: "error",
        message:
          error.error ||
          `Failed to ${editMode.active ? "update" : "create"} organization`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await _delete(`/organizations/${deleteDialog.id}`);
      setToast({
        type: "success",
        message: "Organization deleted successfully!",
      });
      fetchOrganizations();
      setDeleteDialog({ show: false, id: "", name: "" });
    } catch (error: any) {
      setToast({
        type: "error",
        message: error.error || "Failed to delete organization",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (org: Organization) => {
    setEditMode({ active: true, id: org.id });
    setFormData({
      name: org.name,
      type: org.type,
      role: org.role,
      email: org.contact.email,
      phone: org.contact.phone,
    });
    setCoverageAreas(
      org.coverageAreas && org.coverageAreas.length > 0
        ? org.coverageAreas.map((area) => ({
            state: area.state,
            county: area.county || "",
            city: area.city || "",
            zipCode: area.zipCode || "",
          }))
        : [{ state: "", county: "", city: "", zipCode: "" }],
    );
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditMode({ active: false, id: "" });
    setFormData({ name: "", type: "", role: "", email: "", phone: "" });
    setCoverageAreas([{ state: "", county: "", city: "", zipCode: "" }]);
  };

  const addCoverageArea = () => {
    setCoverageAreas([
      ...coverageAreas,
      { state: "", county: "", city: "", zipCode: "" },
    ]);
  };

  const removeCoverageArea = (index: number) => {
    if (coverageAreas.length > 1) {
      setCoverageAreas(coverageAreas.filter((_, i) => i !== index));
    }
  };

  const updateCoverageArea = (index: number, field: string, value: string) => {
    const updated = [...coverageAreas];
    updated[index] = { ...updated[index], [field]: value };
    setCoverageAreas(updated);
  };

  const getRoleBadgeColor = (role: OrganizationRole) => {
    switch (role) {
      case "SENDER":
        return "bg-green-100 text-green-800";
      case "RECEIVER":
        return "bg-blue-100 text-blue-800";
      case "BOTH":
        return "bg-purple-100 text-purple-800";
    }
  };

  const getTypeBadgeColor = (type: OrganizationType) => {
    const colors: Record<OrganizationType, string> = {
      CLINIC: "bg-blue-50 text-blue-700",
      PHARMACY: "bg-green-50 text-green-700",
      HOME_HEALTH: "bg-purple-50 text-purple-700",
      NURSING_HOME: "bg-orange-50 text-orange-700",
      TRANSPORTATION: "bg-red-50 text-red-700",
      DME: "bg-yellow-50 text-yellow-700",
    };
    return colors[type];
  };

  return (
    <div className="space-y-8">
      {loading && <Loading />}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
      {deleteDialog.show && (
        <ConfirmDialog
          title="Delete Organization"
          message={`Are you sure you want to delete "${deleteDialog.name}"?`}
          confirmText="Delete"
          type="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteDialog({ show: false, id: "", name: "" })}
        />
      )}

      {/* Create Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Building className="text-primary" />
          {editMode.active ? "Edit Organization" : "Create Organization"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary"
                placeholder="City Medical Clinic"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as OrganizationType,
                  })
                }
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary"
              >
                <option value="">Select type</option>
                <option value="CLINIC">Clinic</option>
                <option value="PHARMACY">Pharmacy</option>
                <option value="HOME_HEALTH">Home Health</option>
                <option value="NURSING_HOME">Nursing Home</option>
                <option value="TRANSPORTATION">Transportation</option>
                <option value="DME">DME</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-4">
              {["SENDER", "RECEIVER", "BOTH"].map((role) => (
                <label key={role} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="role"
                    value={role}
                    checked={formData.role === role}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        role: e.target.value as OrganizationRole,
                      })
                    }
                    className="text-primary"
                  />
                  <span className="text-sm">
                    {role === "BOTH"
                      ? "Can Send & Receive"
                      : `Can ${role.toLowerCase()} Only`}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary"
                placeholder="contact@clinic.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary"
                placeholder="555-0123"
              />
            </div>
          </div>

          {/* Coverage Areas */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Coverage Areas
              </label>
              <button
                type="button"
                onClick={addCoverageArea}
                className="text-primary text-sm flex items-center gap-1 hover:underline"
              >
                <Plus size={16} /> Add Area
              </button>
            </div>

            {coverageAreas.map((area, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-3 p-3 border rounded-md"
              >
                <input
                  type="text"
                  value={area.state}
                  onChange={(e) =>
                    updateCoverageArea(index, "state", e.target.value)
                  }
                  placeholder="State"
                  className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
                />
                <input
                  type="text"
                  value={area.county}
                  onChange={(e) =>
                    updateCoverageArea(index, "county", e.target.value)
                  }
                  placeholder="County (optional)"
                  className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
                />
                <input
                  type="text"
                  value={area.city}
                  onChange={(e) =>
                    updateCoverageArea(index, "city", e.target.value)
                  }
                  placeholder="City (optional)"
                  className="px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={area.zipCode}
                    onChange={(e) =>
                      updateCoverageArea(index, "zipCode", e.target.value)
                    }
                    placeholder="Zip Code"
                    className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary"
                  />
                  {coverageAreas.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeCoverageArea(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-primary text-white px-6 py-2 rounded-md hover:bg-blue-700 transition font-medium"
            >
              {editMode.active ? "Update Organization" : "Create Organization"}
            </button>
            {editMode.active && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600 transition font-medium"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Organizations List */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">
          All Organizations ({organizations.length})
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Coverage
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {organizations.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{org.name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getTypeBadgeColor(org.type)}`}
                    >
                      {org.type.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getRoleBadgeColor(org.role)}`}
                    >
                      {org.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div>{org.contact.email}</div>
                    <div className="text-gray-500">{org.contact.phone}</div>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {org.coverageAreas?.length || 0} area(s)
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(org)}
                        className="text-blue-500 hover:text-blue-700"
                        title="Edit"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() =>
                          setDeleteDialog({
                            show: true,
                            id: org.id,
                            name: org.name,
                          })
                        }
                        className="text-red-500 hover:text-red-700"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {organizations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No organizations found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
