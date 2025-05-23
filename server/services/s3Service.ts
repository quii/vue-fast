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

    this.s3Client = new S3Client({
      endpoint: options?.endpoint || process.env.AWS_ENDPOINT_URL_S3,
      forcePathStyle: true, // Needed for MinIO and localstack
    })
    this.bucketName = options?.bucketName || process.env.BUCKET_NAME || 'archery-backups'
  }

  async initializeBucket(): Promise<void> {
    try {
      // Check if bucket exists
      try {
        const command = new HeadBucketCommand({ Bucket: this.bucketName })
        await this.s3Client.send(command)
        return
      } catch (error: any) {
        if (!(error.name === 'NotFound' || error.name === 'NoSuchBucket')) {
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
      }
    }
  }

  async listAllBackups(): Promise<Array<{
    key: string;
    userName: string;
    deviceId: string;
    timestamp: string;
    size?: number;
    lastModified?: Date;
  }>> {
    try {
      const result = await this.s3Client.send(new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: 'backups/',
        MaxKeys: 1000 // Increase this if you have more backups
      }))

      return (result.Contents || [])
        .map(item => {
          const key = item.Key as string
          const parts = key.split('/')

          // Handle the case where the key format doesn't match expected pattern
          let userName = 'unknown'
          let deviceId = 'unknown'
          let timestamp = 'unknown'

          if (parts.length >= 4) {
            userName = decodeURIComponent(parts[1])
            deviceId = parts[2]
            timestamp = parts[3].replace('.json', '')
          }

          return {
            key,
            userName,
            deviceId,
            timestamp,
            size: item.Size,
            lastModified: item.LastModified
          }
        })
        .sort((a, b) => {
          // Sort by lastModified date if available, otherwise by timestamp
          if (a.lastModified && b.lastModified) {
            return b.lastModified.getTime() - a.lastModified.getTime()
          }
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        })
    } catch (error) {
      console.error('Error listing all backups:', error)
      throw error
    }
  }

  async deleteTestData(): Promise<{ deletedCount: number, errors: number }> {
    try {
      const result = await this.s3Client.send(new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: 'backups/',
        MaxKeys: 1000
      }))

      const testDataKeys: string[] = []
      let errors = 0

      // First, identify all test data objects
      for (const item of result.Contents || []) {
        const key = item.Key as string
        const parts = key.split('/')

        // Check if this is a backup with the expected format
        if (parts.length >= 4) {
          const userName = decodeURIComponent(parts[1])

          // Check if this is test data
          if (
            userName.toLowerCase() === 'anonymous' ||
            userName.toLowerCase().includes('test archer')
          ) {
            testDataKeys.push(key)
          }
        }
      }

      for (const key of testDataKeys) {
        try {
          await this.s3Client.send(new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key
          }))
        } catch (error) {
          console.error(`Error deleting test data ${key}:`, error)
          errors++
        }
      }

      return {
        deletedCount: testDataKeys.length - errors,
        errors
      }
    } catch (error) {
      console.error('Error deleting test data:', error)
      throw error
    }
  }
}