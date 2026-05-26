import { Injectable } from '@nestjs/common';
import { PackagesService } from '../packages/packages.service';
import { PackageType } from '../packages/entities/package.entity';

const SEED_PACKAGES = [
  {
    title: 'Maldives Family Escape',
    type: PackageType.FAMILY,
    destination: 'Maldives',
    location: 'Ukulhas · Fulidhoo',
    duration: '3 nights',
    price: 'From $499',
    priceValue: 499,
    description:
      'Hotel stay, speedboat transfer, halal food guidance and a family-friendly island tour — all arranged for you.',
    imageGradient:
      'radial-gradient(circle at 15% 100%, #f3d29d 0 26%, transparent 27%), linear-gradient(135deg, #8fcfce, #65b7bd)',
    highlights: ['Hotel stay', 'Speedboat transfer', 'Halal food guide', 'Family island tour'],
    rating: 4.9,
    reviewCount: 48,
    isHalalCertified: true,
  },
  {
    title: 'Private Sandbank Tour',
    type: PackageType.PRIVATE,
    destination: 'Maldives',
    location: 'Maldives day tour',
    duration: 'Half day',
    price: 'From $180',
    priceValue: 180,
    description:
      'Private boat, BBQ option, family-friendly timing and professional photography included.',
    imageGradient:
      'radial-gradient(circle at 15% 100%, #e9c994 0 26%, transparent 27%), linear-gradient(135deg, #b8d3ee, #89b7d7)',
    highlights: ['Private boat', 'BBQ option', 'Photography', 'Flexible timing'],
    rating: 4.8,
    reviewCount: 31,
    isHalalCertified: true,
  },
  {
    title: 'Halal Honeymoon Stay',
    type: PackageType.HONEYMOON,
    destination: 'Maldives',
    location: 'Private island resort',
    duration: '4 nights',
    price: 'From $1,250',
    priceValue: 1250,
    description:
      'Privacy-focused resort with transfers, halal meal planning and a romantic décor setup.',
    imageGradient:
      'radial-gradient(circle at 20% 100%, #ebd89c 0 26%, transparent 27%), linear-gradient(135deg, #f1aa99, #cc7f75)',
    highlights: ['Private resort', 'Airport transfer', 'Halal meals', 'Romantic setup'],
    rating: 5.0,
    reviewCount: 22,
    isHalalCertified: true,
  },
  {
    title: 'Ramadan Family Trip',
    type: PackageType.RAMADAN,
    destination: 'Dubai',
    location: 'Dubai · UAE',
    duration: 'Custom',
    price: 'Custom quote',
    priceValue: 0,
    description:
      'Iftar guidance, family-friendly hotels, private city tours and prayer-friendly scheduling.',
    imageGradient:
      'radial-gradient(circle at 15% 100%, #f6daa5 0 26%, transparent 27%), linear-gradient(135deg, #9bd5be, #66bfa2)',
    highlights: ['Iftar guide', 'Family hotels', 'Private city tour', 'Prayer planner'],
    rating: 4.7,
    reviewCount: 19,
    isHalalCertified: true,
  },
  {
    title: 'Malaysia Halal City Break',
    type: PackageType.FAMILY,
    destination: 'Malaysia',
    location: 'Kuala Lumpur',
    duration: '5 days',
    price: 'From $690',
    priceValue: 690,
    description:
      'Halal food areas, family attractions, airport transfer and curated hotel recommendations.',
    imageGradient:
      'radial-gradient(circle at 18% 100%, #f4d5a4 0 26%, transparent 27%), linear-gradient(135deg, #a7d8c4, #79c5a7)',
    highlights: ['Halal food map', 'Family attractions', 'Airport transfer', 'Hotel guide'],
    rating: 4.8,
    reviewCount: 37,
    isHalalCertified: true,
  },
  {
    title: 'Indonesia Island Escape',
    type: PackageType.ISLAND,
    destination: 'Indonesia',
    location: 'Lombok · Bali',
    duration: '6 days',
    price: 'From $840',
    priceValue: 840,
    description:
      'Muslim-friendly island route with private driver, halal dining discovery and scenic tours.',
    imageGradient:
      'radial-gradient(circle at 12% 100%, #f1cf9c 0 26%, transparent 27%), linear-gradient(135deg, #9bc9e7, #5b9fc2)',
    highlights: ['Private driver', 'Halal dining', 'Scenic tours', 'Island hopping'],
    rating: 4.9,
    reviewCount: 44,
    isHalalCertified: true,
  },
  {
    title: 'China Muslim Heritage Tour',
    type: PackageType.CITY,
    destination: 'China',
    location: "Xi'an · Beijing",
    duration: '7 days',
    price: 'From $1,100',
    priceValue: 1100,
    description:
      'Islamic heritage sites, halal restaurants, private guide and family-friendly pacing.',
    imageGradient:
      'radial-gradient(circle at 18% 100%, #f5d4a6 0 26%, transparent 27%), linear-gradient(135deg, #c9a8e0, #a07ec9)',
    highlights: ['Islamic heritage sites', 'Halal restaurants', 'Private guide', 'Mosque visits'],
    rating: 4.7,
    reviewCount: 15,
    isHalalCertified: true,
  },
  {
    title: 'Vietnam Halal Discovery',
    type: PackageType.ISLAND,
    destination: 'Vietnam',
    location: 'Hanoi · Ha Long Bay',
    duration: '5 days',
    price: 'From $760',
    priceValue: 760,
    description:
      'Halal-verified accommodation, private boat on Ha Long Bay and Muslim-friendly city walks.',
    imageGradient:
      'radial-gradient(circle at 14% 100%, #f0d198 0 26%, transparent 27%), linear-gradient(135deg, #91c9b5, #5baf94)',
    highlights: ['Halal hotels', 'Ha Long Bay cruise', 'City tour', 'Prayer-friendly schedule'],
    rating: 4.6,
    reviewCount: 26,
    isHalalCertified: true,
  },
];

@Injectable()
export class SeedService {
  constructor(private readonly packagesService: PackagesService) {}

  async seed() {
    for (const pkg of SEED_PACKAGES) {
      await this.packagesService.create(pkg as any);
    }
    return { seeded: SEED_PACKAGES.length };
  }
}
