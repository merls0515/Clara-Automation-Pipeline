export interface AccountMemo {
  account_id: string;
  company_name: string;
  business_hours: {
    days: string;
    start: string;
    end: string;
    timezone: string;
  };
  office_address?: string;
  services_supported: string[];
  emergency_definition: string[];
  emergency_routing_rules: string;
  non_emergency_routing_rules: string;
  call_transfer_rules: string;
  integration_constraints: string;
  after_hours_flow_summary: string;
  office_hours_flow_summary: string;
  questions_or_unknowns: string[];
  notes: string;
}

export interface AgentSpec {
  agent_name: string;
  voice_style: string;
  system_prompt: string;
  key_variables: {
    timezone: string;
    business_hours: string;
    address: string;
    emergency_routing: string;
  };
  tool_invocation_placeholders: string;
  call_transfer_protocol: string;
  fallback_protocol: string;
  version: "v1" | "v2";
}

export interface Version {
  id: number;
  account_id: string;
  version_number: number;
  transcript: string;
  memo_json: string; // JSON string
  agent_spec_json: string; // JSON string
  changelog?: string;
  created_at: string;
}

export interface Account {
  id: string;
  company_name: string;
  created_at: string;
  updated_at: string;
  versions?: Version[];
}
