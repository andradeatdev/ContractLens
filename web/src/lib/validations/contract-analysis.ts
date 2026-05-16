import { z } from "zod";

export const contractAnalysisSchema = z.object({
  clause: z.string().min(10, "A cláusula deve ter pelo menos 10 caracteres para uma análise útil."),
});

export type ContractAnalysisInput = z.infer<typeof contractAnalysisSchema>;
