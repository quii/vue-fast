import {
  S3Client,
  CreateBucketCommand,
  PutObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand, HeadBucketCommand
} from '@aws-sdk/client-s3'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

export class S3Service {
  private s3Client: S3Client
  private bucketName: string

  constructor(options?: {
    endpoint?: string;
    region?: string;
    accessKey?: string;
    secretKey?: string;
    bucketName?: string;
  }) {
    // Log configuration for debugging
    console.log('S3 Configuration:')
    console.log('Endpoint:', options?.endpoint || process.env.S3_ENDPOINT)
    console.log('Region:', options?.region || process.env.S3_REGION)
    console.log('Access Key:', options?.accessKey || process.env.S3_ACCESS_KEY ? '[REDACTED]' : 'undefined')
    console.log('Secret Key:', options?.secretKey || process.env.S3_SECRET_KEY ? '[REDACTED]' : 'undefined')
    console.log('Bucket Name:', options?.bucketName || process.env.S3_BUCKET_NAME)

    this.s3Client = new S3Client({
      region: options?.region || process.env.S3_REGION || 'us-east-1',
      endpoint: options?.endpoint || process.env.S3_ENDPOINT,
      forcePathStyle: true, // Needed for MinIO and localstack
      credentials: {
        accessKeyId: options?.accessKey || process.env.S3_ACCESS_KEY || '',
        secretAccessKey: options?.secretKey || process.env.S3_SECRET_KEY || ''
      }
    })
    this.bucketName = options?.bucketName || process.env.S3_BUCKET_NAME || 'archery-backups'
  }

  async initializeBucket(): Promise<void> {
    try {
      console.log(`Initializing bucket: ${this.bucketName}`)

      // Check if bucket exists
      try {
        const command = new HeadBucketCommand({ Bucket: this.bucketName })
        await this.s3Client.send(command)
        console.log(`Bucket ${this.bucketName} already exists`)
        return
      } catch (error: any) {
        // If the bucket doesn't exist, create it
        if (error.name === 'NotFound' || error.name === 'NoSuchBucket') {
          console.log(`Bucket ${this.bucketName} not found, creating...`)
        } else {
          // For other errors, log and rethrow
          console.error(`Error checking bucket ${this.bucketName}:`, error)
          throw error
        }
      }

      // Create the bucket
      try {
        const command = new CreateBucketCommand({
          Bucket: this.bucketName
        })
        await this.s3Client.send(command)
        console.log(`Bucket ${this.bucketName} created successfully`)
      } catch (error) {
        console.error(`Error creating bucket ${this.bucketName}:`, error)
        throw error
      }
    } catch (error) {
      console.error('Error initializing bucket:', error)
      throw error
    }
  }

  async storeBackup(userName: string, deviceId: string, data: any): Promise<{ key: string; timestamp: string }> {
    const timestamp = new Date().toISOString()
    const key = `backups/${encodeURIComponent(userName)}/${deviceId}/${timestamp}.json`

    await this.s3Client.send(new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: JSON.stringify(data),
      ContentType: 'application/json',
      Metadata: {
        'user-name': userName,
        'device-id': deviceId,
        'timestamp': timestamp
      }
    }))

    return { key, timestamp }
  }

  /**
   * Get a backup by key
   */
  async getBackup(key: string): Promise<any> {
    try {
      console.log(`Getting backup with key: ${key}`)

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key
      })

      const response = await this.s3Client.send(command)

      // Check if response.Body exists
      if (!response.Body) {
        throw new Error('Response body is undefined')
      }

      // Read the stream
      const bodyContents = await this.streamToString(response.Body)

      // Parse the JSON data
      return JSON.parse(bodyContents)
    } catch (error: unknown) {
      console.error(`Error getting backup with key ${key}:`, error)
      throw error
    }
  }

  /**
   * Convert a readable stream to a string
   */
  private async streamToString(stream: any): Promise<string> {
    // For AWS SDK v3, we can use the transformToString utility
    if (typeof stream.transformToString === 'function') {
      return stream.transformToString()
    }

    // Fallback to manual stream reading
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = []

      // Handle different types of streams
      if (typeof stream.on === 'function') {
        stream.on('data', (chunk: Buffer | string) => {
          // Ensure chunk is a Buffer
          chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
        })
        stream.on('error', reject)
        stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
      } else if (stream instanceof Uint8Array) {
        // Handle Uint8Array directly
        resolve(Buffer.from(stream).toString('utf8'))
      } else {
        reject(new Error('Unsupported stream type'))
      }
    })
  }

  async listBackupsByDevice(deviceId: string): Promise<Array<{
    key: string;
    userName: string;
    deviceId: string;
    timestamp: string;
    size?: number;
    lastModified?: Date;
  }>> {
    const result = await this.s3Client.send(new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: `backups/`,
      MaxKeys: 100
    }))

    return (result.Contents || [])
      .filter(item => item.Key?.includes(`/${deviceId}/`))
      .map(item => {
        const key = item.Key as string
        const parts = key.split('/')
        return {
          key,
          userName: decodeURIComponent(parts[1]),
          deviceId: parts[2],
          timestamp: parts[3].replace('.json', ''),
          size: item.Size,
          lastModified: item.LastModified
        }
      })
      .sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
  }

  async findBackupsByName(userName: string): Promise<Array<{
    key: string;
    userName: string;
    deviceId: string;
    timestamp: string;
    size?: number;
    lastModified?: Date;
  }>> {
    const encodedName = encodeURIComponent(userName)
    const result = await this.s3Client.send(new ListObjectsV2Command({
      Bucket: this.bucketName,
      Prefix: `backups/${encodedName}/`,
      MaxKeys: 100
    }))

    return (result.Contents || [])
      .map(item => {
        const key = item.Key as string
        const parts = key.split('/')
        return {
          key,
          userName: decodeURIComponent(parts[1]),
          deviceId: parts[2],
          timestamp: parts[3].replace('.json', ''),
          size: item.Size,
          lastModified: item.LastModified
        }
      })
      .sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )
  }

  async deleteBackup(key: string): Promise<void> {
    await this.s3Client.send(new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key
    }))
  }

  async rotateBackups(deviceId: string, maxBackups = 5): Promise<void> {
    const backups = await this.listBackupsByDevice(deviceId)

    if (backups.length > maxBackups) {
      const toDelete = backups.slice(maxBackups)
      for (const backup of toDelete) {
        await this.deleteBackup(backup.key)
        console.log(`Deleted old backup: ${backup.key}`)
      }
    }
  }
}