# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability within Contract Lens, please send an e-mail to security@contractlens.com. All security vulnerabilities will be promptly addressed.

## Security Policies

- **Data Encryption**: All data is encrypted at rest using industry-standard AES-256 and in transit via TLS 1.2+.
- **Authentication**: JWT-based authentication with mandatory email verification and TOTP support for sensitive accounts.
- **AI Safety**: Prompts are sanitized, and AI responses are validated to prevent injection or unexpected behavior.
- **Audit Logging**: All critical actions (logins, file uploads, deletions) are logged for security auditing.

## Security Audits

We perform regular automated security audits:
- **SAST (Static Application Security Testing)**: Scanning source code for common patterns (SQLi, XSS, etc.).
- **Dependency Auditing**: Checking for known CVEs in our Go and npm dependency trees.
- **Compliance**: Monitoring compliance against SOC 2 and GDPR best practices.
