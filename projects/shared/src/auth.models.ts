export interface AgentLoginResponse {
  agent_id: string;
  otp_required: boolean;
  dev_otp: string | null;
}

export interface CustomerOtpRequestResponse {
  customer_id: string;
  dev_otp: string | null;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  role: 'admin' | 'agent' | 'light_agent' | 'customer';
}

export interface GuestTicketOtpRequestResponse {
  dev_otp: string | null;
}
