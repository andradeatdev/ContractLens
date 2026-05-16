import { z } from "zod";

/**
 * Normaliza uma string removendo espaços extras e garantindo UTF-8 básico.
 */
export const normalizeText = (text: string): string => {
  return text
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, "") // Remove caracteres de controle primeiro
    .replace(/\s+/g, ' ') // Então colapsa múltiplos espaços/quebras em um único espaço
    .trim(); // E remove das extremidades
};

/**
 * Schema para validação de campos de texto com normalização automática.
 */
export const NormalizedString = z
  .string()
  .transform((val) => normalizeText(val));

/**
 * Tenta extrair um valor numérico de uma string de moeda.
 */
export const normalizeCurrency = (val: string): string => {
  const matches = val.match(/[0-9.,]+/g);
  if (!matches) return val;
  
  let raw = matches[matches.length - 1];
  
  if (raw.includes(",") && raw.includes(".")) {
    const lastComma = raw.lastIndexOf(",");
    const lastDot = raw.lastIndexOf(".");
    
    if (lastComma > lastDot) {
      // Brasileiro: 1.234,56 -> 1234.56
      raw = raw.replace(/\./g, "").replace(",", ".");
    } else {
      // Americano: 1,234.56 -> 1234.56
      raw = raw.replace(/,/g, "");
    }
  } else if (raw.includes(",")) {
    // Apenas vírgula: 1234,56 -> 1234.56 ou milhar 1,234 -> 1234
    if (raw.length - raw.lastIndexOf(",") === 4) {
      raw = raw.replace(/,/g, "");
    } else {
      raw = raw.replace(",", ".");
    }
  } else if (raw.includes(".")) {
    // Apenas ponto: 5.000 -> 5000 (Milhar)
    if (raw.length - raw.lastIndexOf(".") === 4) {
      raw = raw.replace(/\./g, "");
    }
  }
  
  return raw;
};
