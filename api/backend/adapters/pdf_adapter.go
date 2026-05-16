package adapters

import (
	"github.com/andradeatdev/ContractLens/api/pkg/pdf"
)

type PDFAdapter struct{}

func (p *PDFAdapter) Extract(data []byte) (string, error) {
	return pdf.ExtractText(data)
}
