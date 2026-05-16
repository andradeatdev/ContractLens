# Security Policy

## Overview
Contract Lens is committed to the security and privacy of our users' legal data. We treat every contract as highly sensitive and employ industry-standard practices to ensure data integrity and confidentiality.

## Supported Versions
We currently support and provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability
If you discover a security vulnerability, please do NOT open a public issue. Instead, report it through one of the following channels:

1. **Email:** security@contractlens.com (Placeholder)
2. **Encrypted Communication:** (Add PGP key details if available)

We aim to acknowledge all reports within 24-48 hours and provide a resolution or mitigation plan within 5-7 business days.

## Security Practices
- **Data Minimization:** We only process the text required for analysis. Original PDF files are stored using Vercel Blob with strict access tokens.
- **AI Processing:** We use Google Gemini Flash 2.5 Lite. Data sent to the AI API is subject to Google's Enterprise Privacy commitments (data is not used to train models).
- **Encryption:** All data is encrypted at rest (AES-256) and in transit (TLS 1.2+).
- **Authentication:** Multi-factor authentication (TOTP) and JWT-based session management are standard for all accounts.

## Compliance
We are working towards full alignment with:
- **SOC 2 Type I/II**
- **GDPR**
- **PCI-DSS** (for payment processing)

Thank you for helping us keep Contract Lens secure.
