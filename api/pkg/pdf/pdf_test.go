package pdf

import (
	"testing"
)

func TestExtractText(t *testing.T) {
	// PDF extraction is hard to unit test without a real PDF,
	// but we can test that it fails with invalid data.
	_, err := ExtractText([]byte("not a pdf"))
	if err == nil {
		t.Error("Expected error for invalid PDF data, got nil")
	}
}
