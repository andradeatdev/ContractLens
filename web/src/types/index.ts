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

export interface Contract {
  id: number;
  filename: string;
  slug: string;
  content: string;
  created_at: string;
  risks?: ContractRisk[];
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
  filename: string;
  content: string;
  risks: Omit<ContractRisk, "id" | "contract_id">[];
  summary: string;
}
