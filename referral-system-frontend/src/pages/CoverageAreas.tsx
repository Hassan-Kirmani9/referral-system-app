import { useState, useEffect } from 'react';
import { MapPin, Search } from 'lucide-react';
import { get } from '../services/api';
import type { Organization, ApiResponse } from '../types';
import { Toast } from '../components/Toast';

export const CoverageAreas = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [filters, setFilters] = useState({
    state: '',
    city: '',
    zipCode: '',
  });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await get<ApiResponse<Organization[]>>('/organizations');
      setOrganizations(response.data);
    } catch (error: any) {
      setToast({ type: 'error', message: 'Failed to fetch organizations' });
    }
  };

  const filteredOrgs = organizations.filter((org) => {
    if (!org.coverageAreas || org.coverageAreas.length === 0) return false;

    return org.coverageAreas.some((area) => {
      const matchState = !filters.state || area.state.toLowerCase().includes(filters.state.toLowerCase());
      const matchCity = !filters.city || area.city?.toLowerCase().includes(filters.city.toLowerCase());
      const matchZip = !filters.zipCode || area.zipCode?.includes(filters.zipCode);
      return matchState && matchCity && matchZip;
    });
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'SENDER':
        return 'bg-green-100 text-green-800';
      case 'RECEIVER':
        return 'bg-blue-100 text-blue-800';
      case 'BOTH':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      CLINIC: 'bg-blue-50 text-blue-700',
      PHARMACY: 'bg-green-50 text-green-700',
      HOME_HEALTH: 'bg-purple-50 text-purple-700',
      NURSING_HOME: 'bg-orange-50 text-orange-700',
      TRANSPORTATION: 'bg-red-50 text-red-700',
      DME: 'bg-yellow-50 text-yellow-700',
    };
    return colors[type] || 'bg-gray-50 text-gray-700';
  };

  return (
    <div>
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MapPin className="text-primary" />
          Coverage Areas
        </h2>
        <p className="text-gray-600 mt-1">View service areas for all healthcare providers</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Search className="text-gray-400" size={20} />
          <h3 className="font-medium">Filter by Location</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            value={filters.state}
            onChange={(e) => setFilters({ ...filters, state: e.target.value })}
            placeholder="State"
            className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary"
          />
          <input
            type="text"
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            placeholder="City"
            className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary"
          />
          <input
            type="text"
            value={filters.zipCode}
            onChange={(e) => setFilters({ ...filters, zipCode: e.target.value })}
            placeholder="Zip Code"
            className="px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary"
          />
        </div>

        {(filters.state || filters.city || filters.zipCode) && (
          <button
            onClick={() => setFilters({ state: '', city: '', zipCode: '' })}
            className="mt-4 text-primary text-sm hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrgs.map((org) => (
          <div key={org.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <div className="mb-4">
              <h3 className="text-lg font-bold mb-2">{org.name}</h3>
              <div className="flex gap-2">
                <span className={`px-2 py-1 rounded-full text-xs ${getTypeBadgeColor(org.type)}`}>
                  {org.type.replace('_', ' ')}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${getRoleBadgeColor(org.role)}`}>
                  {org.role}
                </span>
              </div>
            </div>

            <div className="mb-4 text-sm text-gray-600">
              <p className="flex items-center gap-2">
                <span>📧</span> {org.contact.email}
              </p>
              <p className="flex items-center gap-2">
                <span>📞</span> {org.contact.phone}
              </p>
            </div>

            <div>
              <p className="font-medium text-gray-900 mb-2 flex items-center gap-1">
                <MapPin size={16} className="text-primary" />
                Service Areas
              </p>
              <div className="space-y-1">
                {org.coverageAreas && org.coverageAreas.length > 0 ? (
                  org.coverageAreas.map((area, index) => (
                    <p key={index} className="text-sm text-gray-600 pl-5">
                      {[area.city, area.county, area.state, area.zipCode]
                        .filter(Boolean)
                        .join(', ')}
                    </p>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 pl-5">No coverage areas specified</p>
                )}
              </div>
              {org.coverageAreas && org.coverageAreas.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  Serves {org.coverageAreas.length} location(s)
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredOrgs.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <MapPin className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600">No organizations found matching your filters</p>
        </div>
      )}
    </div>
  );
};