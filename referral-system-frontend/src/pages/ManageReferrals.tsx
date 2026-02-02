import { useState, useEffect } from 'react';
import { Inbox, CheckCircle, XCircle, Clock } from 'lucide-react';
import { get, patch } from '../services/api';
import type { Organization, Referral, ApiResponse, ReferralStatus } from '../types';
import { Toast } from '../components/Toast';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Loading } from '../components/Loading';

export const ManageReferrals = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReferralStatus | 'ALL'>('ALL');
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    referralId: string;
    action: 'ACCEPTED' | 'REJECTED';
    patientName: string;
  }>({ show: false, referralId: '', action: 'ACCEPTED', patientName: '' });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  useEffect(() => {
    if (selectedOrgId) {
      fetchReferrals();
    }
  }, [selectedOrgId]);

  const fetchOrganizations = async () => {
    try {
      const response = await get<ApiResponse<Organization[]>>('/organizations');
      const receiverOrgs = response.data.filter(
        (org) => org.role === 'RECEIVER' || org.role === 'BOTH'
      );
      setOrganizations(receiverOrgs);
      if (receiverOrgs.length > 0) {
        setSelectedOrgId(receiverOrgs[0].id);
      }
    } catch (error: any) {
      setToast({ type: 'error', message: 'Failed to fetch organizations' });
    }
  };

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const response = await get<ApiResponse<Referral[]>>('/referrals', {
        receiverOrgId: selectedOrgId,
      });
      setReferrals(response.data);
    } catch (error: any) {
      setToast({ type: 'error', message: 'Failed to fetch referrals' });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    try {
      setLoading(true);
      await patch(`/referrals/${confirmDialog.referralId}/status`, {
        status: confirmDialog.action,
      });
      setToast({
        type: 'success',
        message: `Referral ${confirmDialog.action.toLowerCase()} successfully!`,
      });
      fetchReferrals();
      setConfirmDialog({ show: false, referralId: '', action: 'ACCEPTED', patientName: '' });
    } catch (error: any) {
      setToast({ type: 'error', message: error.error || 'Failed to update referral' });
    } finally {
      setLoading(false);
    }
  };

  const filteredReferrals =
    statusFilter === 'ALL'
      ? referrals
      : referrals.filter((ref) => ref.status === statusFilter);

  const getStatusBadge = (status: ReferralStatus) => {
    const badges = {
      PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      ACCEPTED: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle },
      COMPLETED: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    };
    const { color, icon: Icon } = badges[status];
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${color}`}>
        <Icon size={14} />
        {status}
      </span>
    );
  };

  const statusCounts = {
    ALL: referrals.length,
    PENDING: referrals.filter((r) => r.status === 'PENDING').length,
    ACCEPTED: referrals.filter((r) => r.status === 'ACCEPTED').length,
    REJECTED: referrals.filter((r) => r.status === 'REJECTED').length,
  };

  return (
    <div>
      {loading && <Loading />}
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      {confirmDialog.show && (
        <ConfirmDialog
          title={`${confirmDialog.action === 'ACCEPTED' ? 'Accept' : 'Reject'} Referral`}
          message={`Are you sure you want to ${confirmDialog.action.toLowerCase()} the referral for ${
            confirmDialog.patientName
          }?`}
          confirmText={confirmDialog.action === 'ACCEPTED' ? 'Accept' : 'Reject'}
          type={confirmDialog.action === 'REJECTED' ? 'danger' : 'primary'}
          onConfirm={handleStatusUpdate}
          onCancel={() =>
            setConfirmDialog({ show: false, referralId: '', action: 'ACCEPTED', patientName: '' })
          }
        />
      )}

      <div className="mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Inbox className="text-primary" />
          Manage Referrals
        </h2>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Viewing referrals for:
        </label>
        <select
          value={selectedOrgId}
          onChange={(e) => setSelectedOrgId(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary"
        >
          {organizations.map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex gap-2 overflow-x-auto">
          {(['ALL', 'PENDING', 'ACCEPTED', 'REJECTED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                statusFilter === status
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {status} ({statusCounts[status]})
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredReferrals.map((referral) => (
          <div
            key={referral.id}
            className={`bg-white rounded-lg shadow p-6 ${
              referral.status === 'ACCEPTED' ? 'opacity-75' : ''
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3
                  className={`text-lg font-bold ${
                    referral.status === 'REJECTED' ? 'line-through text-gray-500' : ''
                  }`}
                >
                  {referral.patientName}
                </h3>
                <p className="text-sm text-gray-600">Insurance: {referral.insuranceNumber}</p>
              </div>
              {getStatusBadge(referral.status)}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-sm text-gray-600">Sent From:</p>
                <p className="font-medium">{referral.senderOrg?.name}</p>
                <p className="text-xs text-gray-500">
                  {referral.senderOrg?.type.replace('_', ' ')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Sent On:</p>
                <p className="font-medium">
                  {new Date(referral.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {referral.notes && (
              <div className="mb-4 p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600 font-medium mb-1">Notes:</p>
                <p className="text-sm text-gray-800">{referral.notes}</p>
              </div>
            )}

            {referral.status === 'PENDING' && (
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    setConfirmDialog({
                      show: true,
                      referralId: referral.id,
                      action: 'ACCEPTED',
                      patientName: referral.patientName,
                    })
                  }
                  className="flex-1 bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition flex items-center justify-center gap-2"
                >
                  <CheckCircle size={18} />
                  Accept
                </button>
                <button
                  onClick={() =>
                    setConfirmDialog({
                      show: true,
                      referralId: referral.id,
                      action: 'REJECTED',
                      patientName: referral.patientName,
                    })
                  }
                  className="flex-1 bg-red-500 text-white py-2 rounded-md hover:bg-red-600 transition flex items-center justify-center gap-2"
                >
                  <XCircle size={18} />
                  Reject
                </button>
              </div>
            )}
          </div>
        ))}

        {filteredReferrals.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Inbox className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600">
              {statusFilter === 'ALL'
                ? 'No referrals found'
                : `No ${statusFilter.toLowerCase()} referrals`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};