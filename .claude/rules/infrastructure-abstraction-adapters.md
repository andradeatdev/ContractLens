### Infrastructure Abstraction

The application dynamically switches between cloud and local infrastructure based on environment variables (e.g., `VERCEL`, `BLOB_READ_WRITE_TOKEN`).

#### Examples:
- **Storage**: Automatically chooses `VercelBlobAdapter` in production and `LocalStorageAdapter` in development.
- **Database**: Supports both PostgreSQL (production) and SQLite (testing) via GORM's driver abstraction.