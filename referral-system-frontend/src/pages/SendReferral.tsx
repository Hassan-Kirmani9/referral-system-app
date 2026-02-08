import { useState, useEffect } from 'react';
import { Send, User, FileText, CheckCircle } from 'lucide-react';
import { get, post, patch } from '../services/api';
import type { Organization, ApiResponse, Referral } from '../types';
import { Toast } from '../components/Toast';
import { Loading } from '../components/Loading';

export const SendReferral = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [sentReferrals, setSentReferrals] = useState<Referral[]>([]);
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

  useEffect(() => {
    if (formData.senderOrgId) {
      fetchSentReferrals();
    } else {
      setSentReferrals([]);
    }
  }, [formData.senderOrgId]);

  const fetchOrganizations = async () => {
    try {
      const response = await get<ApiResponse<Organization[]>>('/organizations');
      setOrganizations(response.data);
    } catch (error: any) {
      setToast({ type: 'error', message: 'Failed to fetch organizations' });
    }
  };

  const fetchSentReferrals = async () => {
    if (!formData.senderOrgId) return;
    
    try {
      const response = await get<ApiResponse<Referral[]>>('/referrals', {
        senderOrgId: formData.senderOrgId,
      });
      setSentReferrals(response.data);
    } catch (error: any) {
      setToast({ type: 'error', message: 'Failed to fetch sent referrals' });
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
      const currentSenderId = formData.senderOrgId;
      setFormData({
        senderOrgId: currentSenderId,
        receiverOrgId: '',
        patientName: '',
        insuranceNumber: '',
        notes: '',
      });
      setSelectedReceiver(null);
      fetchSentReferrals();
    } catch (error: any) {
      setToast({ type: 'error', message: error.error || 'Failed to send referral' });
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async (referralId: string) => {
    try {
      setLoading(true);
      await patch(`/referrals/${referralId}/status`, {
        status: 'COMPLETED',
      });
      setToast({ type: 'success', message: 'Referral marked as completed!' });
      fetchSentReferrals();
    } catch (error: any) {
      setToast({ type: 'error', message: error.error || 'Failed to update status' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; label: string }> = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      ACCEPTED: { color: 'bg-green-100 text-green-800', label: 'Accepted' },
      REJECTED: { color: 'bg-red-100 text-red-800', label: 'Rejected' },
      COMPLETED: { color: 'bg-blue-100 text-blue-800', label: 'Completed' },
    };
    const badge = badges[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div>
      {loading && <Loading />}
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      <div className="max-w-7xl mx-auto">
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

        {formData.senderOrgId && (
          <div className="bg-white rounded-lg shadow p-6 mt-8">
            <h2 className="text-xl font-bold mb-4">
              Sent Referrals ({sentReferrals.length})
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Patient</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Insurance</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Sent To</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {sentReferrals.map((referral) => (
                    <tr key={referral.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{referral.patientName}</td>
                      <td className="px-4 py-3 text-sm">{referral.insuranceNumber}</td>
                      <td className="px-4 py-3 text-sm">
                        {referral.receiverOrg?.name || 'N/A'}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(referral.status)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(referral.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {referral.status === 'ACCEPTED' && (
                          <button
                            onClick={() => handleMarkComplete(referral.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-500 text-white text-sm rounded-md hover:bg-blue-600 transition"
                            title="Mark as Completed"
                          >
                            <CheckCircle size={16} />
                            Complete
                          </button>
                        )}
                        {referral.status === 'COMPLETED' && (
                          <span className="text-sm text-gray-500 italic">Completed</span>
                        )}
                        {referral.status === 'PENDING' && (
                          <span className="text-sm text-gray-500 italic">Awaiting response</span>
                        )}
                        {referral.status === 'REJECTED' && (
                          <span className="text-sm text-red-500 italic">Rejected</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {sentReferrals.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No referrals sent yet. Send your first referral using the form above.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};