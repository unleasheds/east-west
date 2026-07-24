import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

export interface UploadedImage {
  buffer: Buffer;
  mimetype: string;
  size: number;
}

const IMAGE_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

@Injectable()
export class PackageImagesService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private readonly config: ConfigService) {
    const accountId = config.get<string>('R2_ACCOUNT_ID', '');
    const accessKeyId = config.get<string>('R2_ACCESS_KEY', '');
    const secretAccessKey = config.get<string>('R2_SECRET_KEY', '');

    this.bucket = config.get<string>('R2_BUCKET', '');
    this.publicUrl = config.get<string>('R2_PUBLIC_URL', '').replace(/\/$/, '');
    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });
  }

  async upload(file?: UploadedImage) {
    if (!file) throw new BadRequestException('Choose an image to upload');

    const extension = IMAGE_EXTENSIONS[file.mimetype];
    if (!extension) {
      throw new BadRequestException('Only JPG, PNG, WebP, and GIF images are supported');
    }
    if (file.size > 8 * 1024 * 1024) {
      throw new BadRequestException('Images must be 8 MB or smaller');
    }
    if (!this.bucket || !this.publicUrl) {
      throw new InternalServerErrorException('Image storage is not configured');
    }

    const key = `packages/${new Date().getUTCFullYear()}/${randomUUID()}.${extension}`;

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimetype,
          CacheControl: 'public, max-age=31536000, immutable',
        }),
      );
    } catch {
      throw new InternalServerErrorException('Could not upload image');
    }

    return { url: `${this.publicUrl}/${key}`, key };
  }
}
