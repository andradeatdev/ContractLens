package utils

import (
	"regexp"
	"strings"
	"unicode/utf8"
)

// NormalizeText limpa o texto para garantir UTF-8 válido, remove caracteres de controle
// e normaliza espaços em branco.
func NormalizeText(text string) string {
	if !utf8.ValidString(text) {
		text = strings.ToValidUTF8(text, "")
	}

	// Remover caracteres nulos e outros de controle (exceto tab e newline)
	re := regexp.MustCompile(`[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]`)
	text = re.ReplaceAllString(text, "")

	// Normalizar espaços em branco
	lines := strings.Split(text, "\n")
	var normalizedLines []string
	for _, line := range lines {
		trimmed := strings.TrimSpace(line)
		if trimmed != "" || (len(normalizedLines) > 0 && normalizedLines[len(normalizedLines)-1] != "") {
			normalizedLines = append(normalizedLines, trimmed)
		}
	}

	result := strings.Join(normalizedLines, "\n")
	return strings.TrimSpace(result)
}

// ExtractCurrency tenta extrair um valor numérico de uma string de moeda (ex: "R$ 1.200,50")
func ExtractCurrency(val string) string {
	// Remove tudo que não é dígito, vírgula ou ponto
	re := regexp.MustCompile(`[0-9.,]+`)
	matches := re.FindAllString(val, -1)
	if len(matches) == 0 {
		return val
	}

	// Pega o último match (geralmente onde está o valor numérico real)
	raw := matches[len(matches)-1]

	// Se tiver vírgula e ponto, assume formato brasileiro (1.000,00) ou americano (1,000.00)
	if strings.Contains(raw, ",") && strings.Contains(raw, ".") {
		lastComma := strings.LastIndex(raw, ",")
		lastDot := strings.LastIndex(raw, ".")

		if lastComma > lastDot {
			// Brasileiro: 1.234,56 -> 1234.56
			raw = strings.ReplaceAll(raw, ".", "")
			raw = strings.ReplaceAll(raw, ",", ".")
		} else {
			// Americano: 1,234.56 -> 1234.56
			raw = strings.ReplaceAll(raw, ",", "")
		}
	} else if strings.Contains(raw, ",") {
		// Apenas vírgula: 1234,56 -> 1234.56
		// Ou milhar: 1,234 -> 1234 (Se tiver 3 dígitos depois, pode ser ambíguo, mas vamos assumir decimal se for o único separador no fim)
		if len(raw)-strings.LastIndex(raw, ",") == 4 {
			raw = strings.ReplaceAll(raw, ",", "")
		} else {
			raw = strings.ReplaceAll(raw, ",", ".")
		}
	} else if strings.Contains(raw, ".") {
		// Apenas ponto: 5.000 -> 5000 (Milhar) ou 5.00 (Decimal)
		// Heurística: se tiver 3 dígitos após o ponto, assume milhar.
		if len(raw)-strings.LastIndex(raw, ".") == 4 {
			raw = strings.ReplaceAll(raw, ".", "")
		}
	}

	return raw
}
// Slugify transforma uma string em um slug amigável para URL
func Slugify(text string) string {
	text = strings.ToLower(text)
	re := regexp.MustCompile(`[^a-z0-9]+`)
	slug := re.ReplaceAllString(text, "-")
	return strings.Trim(slug, "-")
}
