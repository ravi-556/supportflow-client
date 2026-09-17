// Mirrors backend/app/schemas — keep these two in sync by hand for now
// (no generated client yet; see PRD note on FastAPI's OpenAPI spec).

export type TicketStatus = 'open' | 'pending' | 'resolved' | 'closed';
export type PriorityLevel = 'urgent' | 'high' | 'medium' | 'low';
export type TicketSource = 'email' | 'portal' | 'chat' | 'agent';
export type TicketTypeEnum = 'question' | 'incident' | 'bug' | 'feature_request';
export type ReplyByRole = 'customer' | 'agent' | 'system';
export type AgentRole = 'admin' | 'agent' | 'light_agent';
export type CustomerSegment = 'standard' | 'vip';
export type ActivityActionType =
  | 'ticket_created'
  | 'status_change'
  | 'priority_change'
  | 'assignment_change'
  | 'tag_change'
  | 'sla_paused'
  | 'sla_resumed'
  | 'ticket_split';

// Matches DRF's PageNumberPagination envelope (`?page=`) — every list
// endpoint under /api/v1 wraps its array in this shape now.
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface TicketListItem {
  id: string;
  ticket_no: number;
  subject: string;
  status: TicketStatus;
  priority: PriorityLevel;
  customer_id: string;
  customer_name: string | null;
  customer_email: string | null;
  agent_id: string | null;
  agent_name: string | null;
  group_id: string | null;
  group_name: string | null;
  resolution_sla_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface TicketCsat {
  review_id: string;
  submitted: boolean;
  score: number | null;
  comment: string | null;
}

export interface TicketDetail extends TicketListItem {
  ticket_type: TicketTypeEnum | null;
  source: TicketSource;
  parent_ticket_id: string | null;
  first_responded_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
  first_response_sla_time: string | null;
  csat: TicketCsat | null;
}

export interface TicketUpdate {
  status?: TicketStatus;
  priority?: PriorityLevel;
  agent_id?: string | null;
  group_id?: string | null;
  changed_by_agent_id?: string;
}

export interface Message {
  id: string;
  ticket_id: string;
  description: string;
  reply_by: ReplyByRole;
  customer_id: string | null;
  agent_id: string | null;
  is_private: boolean;
  created_at: string;
}

export interface MessageCreate {
  description: string;
  reply_by: ReplyByRole;
  customer_id?: string | null;
  agent_id?: string | null;
  is_private: boolean;
  mentioned_agent_ids?: string[];
}

export interface TicketActivity {
  id: string;
  ticket_id: string;
  action_type: ActivityActionType;
  agent_id: string | null;
  status_change: string | null;
  priority_change: string | null;
  sla_change: string | null;
  created_at: string;
}

export interface Agent {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: AgentRole;
}

export interface Group {
  id: string;
  name: string;
  category: string | null;
}

export interface Customer {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  company: string | null;
  segment: CustomerSegment;
}

export interface FaqListItem {
  id: string;
  question: string;
  category: string | null;
  view_count: number;
}

export interface FaqDetail extends FaqListItem {
  description: string | null;
  published_at: string | null;
}

export type CustomerStatusGroup = 'open' | 'resolved';

export interface CustomerTicketListItem {
  id: string;
  ticket_no: number;
  subject: string;
  status: TicketStatus;
  updated_at: string;
}

export interface CustomerTicketCreate {
  subject: string;
  description: string;
  ticket_type?: TicketTypeEnum | null;
}

export interface CustomerMessage {
  id: string;
  description: string;
  reply_by: ReplyByRole;
  agent_name: string | null;
  created_at: string;
}

export interface CustomerMessageCreate {
  description: string;
}

export interface GuestTicketSubmit {
  email: string;
  code: string;
  subject: string;
  description: string;
  ticket_type?: TicketTypeEnum | null;
}

export interface CsatReview {
  id: string;
  ticket_no: number;
  ticket_subject: string;
  score: number | null;
  comment: string | null;
  submitted: boolean;
}

export interface GuestTicketSubmitResponse {
  ticket: CustomerTicketListItem;
  access_token: string;
  token_type: string;
  role: 'customer';
}
