import { useState, useEffect } from 'react';
import { Send, User, FileText } from 'lucide-react';
import { get, post } from '../services/api';
import type { Organization, ApiResponse } from '../types';
import { Toast } from '../components/Toast';
import { Loading } from '../components/Loading';

export const SendReferral = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const [formData, setFormData] = useState({
    senderOrgId: '',
    receiverOrgId: '',
    patientName: '',
    insuranceNumber: '',
    notes: '',
  });

  const [selectedReceiver, setSelectedReceiver] = useState<Organization | null>(null);

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

  const senderOrgs = organizations.filter(
    (org) => org.role === 'SENDER' || org.role === 'BOTH'
  );
  const receiverOrgs = organizations.filter(
    (org) => org.role === 'RECEIVER' || org.role === 'BOTH'
  );

  const handleReceiverChange = (id: string) => {
    setFormData({ ...formData, receiverOrgId: id });
    const receiver = organizations.find((org) => org.id === id);
    setSelectedReceiver(receiver || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.senderOrgId || !formData.receiverOrgId || !formData.patientName || !formData.insuranceNumber) {
      setToast({ type: 'error', message: 'Please fill all required fields' });
      return;
    }

    try {
      setLoading(true);
      await post('/referrals', formData);
      setToast({ type: 'success', message: 'Referral sent successfully!' });
      setFormData({
        senderOrgId: '',
        receiverOrgId: '',
        patientName: '',
        insuranceNumber: '',
        notes: '',
      });
      setSelectedReceiver(null);
    } catch (error: any) {
      setToast({ type: 'error', message: error.error || 'Failed to send referral' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading && <Loading />}
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Send className="text-primary" />
              Send New Referral
            </h2>
            <p className="text-gray-600 mt-1">Transfer patient care to another provider</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sending From <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.senderOrgId}
                onChange={(e) => setFormData({ ...formData, senderOrgId: e.target.value })}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary"
              >
                <option value="">Select sender organization</option>
                {senderOrgs.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} ({org.type.replace('_', ' ')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sending To <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.receiverOrgId}
                onChange={(e) => handleReceiverChange(e.target.value)}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary"
              >
                <option value="">Select receiver organization</option>
                {receiverOrgs.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name} ({org.type.replace('_', ' ')})
                  </option>
                ))}
              </select>
              {selectedReceiver && selectedReceiver.coverageAreas && selectedReceiver.coverageAreas.length > 0 && (
                <div className="mt-2 p-3 bg-blue-50 rounded-md text-sm">
                  <p className="font-medium text-blue-900">Coverage Areas:</p>
                  <p className="text-blue-700">
                    {selectedReceiver.coverageAreas
                      .map((area) => `${area.city || area.state} ${area.zipCode || ''}`.trim())
                      .join(', ')}
                  </p>
                </div>
              )}
            </div>

            <div className="border-t pt-6">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                <User size={18} />
                Patient Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Patient Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.patientName}
                    onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary"
                    placeholder="John Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Insurance Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.insuranceNumber}
                    onChange={(e) => setFormData({ ...formData, insuranceNumber: e.target.value })}
                    className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary"
                    placeholder="INS-12345"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <FileText size={18} />
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary"
                placeholder="Add any relevant medical information, urgency level, or special instructions..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-3 rounded-md hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2"
            >
              <Send size={18} />
              Send Referral
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};