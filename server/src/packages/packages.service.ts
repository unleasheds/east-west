import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Package } from './entities/package.entity';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { ReviewsService } from '../reviews/reviews.service';

@Injectable()
export class PackagesService {
  constructor(
    @InjectRepository(Package)
    private readonly repo: Repository<Package>,
    private readonly reviews: ReviewsService,
  ) {}

  async findAll(filters?: { type?: string; destination?: string }) {
    const qb = this.repo
      .createQueryBuilder('p')
      .where('p.is_active = :active', { active: true });

    if (filters?.type) {
      qb.andWhere('p.type = :type', { type: filters.type });
    }
    if (filters?.destination) {
      qb.andWhere('LOWER(p.destination) LIKE :dest', {
        dest: `%${filters.destination.toLowerCase()}%`,
      });
    }

    const packages = await qb.orderBy('p.created_at', 'ASC').getMany();
    return Promise.all(packages.map((pkg) => this.withVerifiedRating(pkg)));
  }

  findAllAdmin() {
    return this.repo.find({ order: { createdAt: 'ASC' } });
  }

  async findOne(id: string) {
    const pkg = await this.repo.findOne({ where: { id, isActive: true } });
    if (!pkg) throw new NotFoundException(`Package ${id} not found`);
    return this.withVerifiedRating(pkg);
  }

  async findBySlug(slug: string) {
    const pkg = await this.repo.findOne({ where: { slug, isActive: true } });
    if (!pkg) throw new NotFoundException(`Package '${slug}' not found`);
    return this.withVerifiedRating(pkg);
  }

  private async withVerifiedRating(pkg: Package) {
    const summary = await this.reviews.findForPackage(pkg.id);
    return { ...pkg, rating: summary.rating, reviewCount: summary.reviewCount };
  }

  create(dto: CreatePackageDto) {
    const pkg = this.repo.create(dto);
    return this.repo.save(pkg);
  }

  async update(id: string, dto: UpdatePackageDto) {
    const pkg = await this.repo.findOne({ where: { id } });
    if (!pkg) throw new NotFoundException(`Package ${id} not found`);
    Object.assign(pkg, dto);
    return this.repo.save(pkg);
  }

  async remove(id: string) {
    const pkg = await this.repo.findOne({ where: { id } });
    if (!pkg) throw new NotFoundException(`Package ${id} not found`);
    pkg.isActive = false;
    return this.repo.save(pkg);
  }
}
