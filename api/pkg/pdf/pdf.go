package pdf

import (
	"bytes"
	"fmt"

	"github.com/andradeatdev/ai_contract_analyzer/api/pkg/utils"
	"github.com/ledongthuc/pdf"
)

func ExtractText(data []byte) (string, error) {
	reader := bytes.NewReader(data)
	contentLength := int64(len(data))

	res, err := pdf.NewReader(reader, contentLength)
	if err != nil {
		return "", fmt.Errorf("failed to create pdf reader: %v", err)
	}

	b, err := res.GetPlainText()
	if err != nil {
		return "", fmt.Errorf("failed to get plain text from pdf: %v", err)
	}

	var buf bytes.Buffer
	_, err = buf.ReadFrom(b)
	if err != nil {
		return "", fmt.Errorf("failed to read text buffer: %v", err)
	}

	return utils.NormalizeText(buf.String()), nil
}
