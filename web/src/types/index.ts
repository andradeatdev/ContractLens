export type RiskSeverity = "high" | "medium" | "low";

export interface ContractRisk {
  id: number;
  contract_id: number;
  severity: RiskSeverity;
  category: string;
  description: string;
  mitigation: string;
  impact: string;
}

export interface Message {
  role: 'user' | 'assistant';
  message: string;
}

export interface Note {
  id: number;
  contract_id: number;
  content: string;
  selected_text: string;
  color: string;
  created_at: string;
}

export interface Contract {
  id: number;
  filename: string;
  slug: string;
  content: string;
  created_at: string;
  risks: ContractRisk[];
}

export interface FullContract extends Contract {
  messages?: Message[];
  notes?: Note[];
  summary: string;
}

export interface Activity {
  action: string;
  target: string;
  time: string;
}

export interface Stats {
  total_contracts: number;
  total_risks: number;
  high_risks: number;
}

export interface AnalysisResult {
  id: number;
  slug: string;
  filename: string;
  content: string;
  risks: ContractRisk[];
  summary: string;
  messages?: Message[];
  notes?: Note[];
}
