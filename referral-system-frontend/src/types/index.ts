export type OrganizationType = 'CLINIC' | 'PHARMACY' | 'HOME_HEALTH' | 'NURSING_HOME' | 'TRANSPORTATION' | 'DME';
export type OrganizationRole = 'SENDER' | 'RECEIVER' | 'BOTH';
export type ReferralStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  role: OrganizationRole;
  contact: {
    email: string;
    phone: string;
  };
  createdAt: string;
  updatedAt: string;
  coverageAreas?: CoverageArea[];
}

export interface CoverageArea {
  id: string;
  organizationId: string;
  state: string;
  county?: string;
  city?: string;
  zipCode?: string;
  createdAt: string;
}

export interface Referral {
  id: string;
  senderOrgId: string;
  receiverOrgId: string;
  patientName: string;
  insuranceNumber: string;
  status: ReferralStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  senderOrg?: Organization;
  receiverOrg?: Organization;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  count?: number;
}