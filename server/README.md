# Server Setup

## Local Development with S3

This project uses MinIO as a local S3-compatible storage solution for development.

### Automatic Setup

The `dev:all` script automatically ensures MinIO is running in a Docker container.
If Docker is not available, the script will continue without MinIO, and the backup
functionality will gracefully degrade.

### MinIO Configuration

- API endpoint: http://localhost:9000
- Web console: http://localhost:9001
- Username: minioadmin
- Password: minioadmin

### MinIO Web Console

You can access the MinIO web console at http://localhost:9001 using:

- Username: minioadmin
- Password: minioadmin

This allows you to browse and manage buckets and objects directly.

### Manual Control

If you need to manually control the MinIO container:

```bash
# Start MinIO
docker start archery-minio

# Stop MinIO
docker stop archery-minio

docker rm archery-minio
```This allows you to browse and manage buckets and objects directly.