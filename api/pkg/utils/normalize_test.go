package utils

import (
	"testing"
)

func TestNormalizeText(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "Valid UTF-8",
			input:    "Texto padrão",
			expected: "Texto padrão",
		},
		{
			name:     "Invalid UTF-8",
			input:    "Texto \xff inválido",
			expected: "Texto  inválido",
		},
		{
			name:     "Null characters",
			input:    "Texto\x00 com nulo",
			expected: "Texto com nulo",
		},
		{
			name:     "Trailing spaces",
			input:    "Linha com espaços    \nPróxima linha",
			expected: "Linha com espaços\nPróxima linha",
		},
		{
			name:     "Multiple empty lines",
			input:    "Linha 1\n\n\nLinha 2",
			expected: "Linha 1\n\nLinha 2",
		},
		{
			name:     "Complex normalization",
			input:    "  Espaços no início e fim  \t\n\x00Novos dados\xff  ",
			expected: "Espaços no início e fim\nNovos dados",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := NormalizeText(tt.input)
			if got != tt.expected {
				t.Errorf("NormalizeText(%q) = %q, want %q", tt.input, got, tt.expected)
			}
		})
	}
}

func TestExtractCurrency(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "BRL format",
			input:    "R$ 1.250,50",
			expected: "1250.50",
		},
		{
			name:     "USD format",
			input:    "$ 1,250.50",
			expected: "1250.50",
		},
		{
			name:     "Simple comma",
			input:    "1250,50",
			expected: "1250.50",
		},
		{
			name:     "No decimals",
			input:    "R$ 5.000",
			expected: "5000",
		},
		{
			name:     "Mixed text",
			input:    "O valor total é de R$ 9.999,99 mensais",
			expected: "9999.99",
		},
		{
			name:     "Empty or no numbers",
			input:    "nada aqui",
			expected: "nada aqui",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := ExtractCurrency(tt.input)
			if got != tt.expected {
				t.Errorf("ExtractCurrency(%q) = %q, want %q", tt.input, got, tt.expected)
			}
		})
	}
}

func TestSlugify(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "Simple text",
			input:    "Contrato de Aluguel",
			expected: "contrato-de-aluguel",
		},
		{
			name:     "With special characters",
			input:    "Contrato #123 (Vendas)!",
			expected: "contrato-123-vendas",
		},
		{
			name:     "Accents",
			input:    "Atenção à Cláusula",
			expected: "aten-o-cl-usula", // O slugify simples não faz de-accent, apenas remove não alfanuméricos
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := Slugify(tt.input)
			if got != tt.expected {
				t.Errorf("Slugify(%q) = %q, want %q", tt.input, got, tt.expected)
			}
		})
	}
}
