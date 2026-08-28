/**
 * Seed Vietnam administrative divisions (post-2025 / Quyết định 19/2025/QĐ-TTg).
 * Source: https://github.com/open-admin-data/vietnam-administrative-divisions (CC-BY-4.0)
 * 34 tỉnh/TP + 3,321 phường/xã
 */
import { PrismaClient, ProvinceType, WardType } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

interface OadName {
  local: string;
  en: string;
  slug: string;
}

interface OadRecord {
  id: string;
  name: OadName;
  code: { id: string };
  parent?: { id: string } | null;
  geo?: { lat?: string | null; lon?: string | null };
}

/** Thành phố trực thuộc trung ương (mã hành chính) */
const CITY_CODES = new Set(['01', '31', '46', '48', '79', '92']);

function parseCoord(value?: string | null): number | undefined {
  if (value == null || value === '') return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function mapProvinceType(code: string): ProvinceType {
  return CITY_CODES.has(code) ? ProvinceType.CITY : ProvinceType.PROVINCE;
}

function mapWardType(nameLocal: string, provinceCode: string): WardType {
  const lower = nameLocal.toLowerCase();
  if (lower.includes('đặc khu') || lower.includes('dac khu')) {
    return WardType.SPECIAL;
  }
  // Heuristic: đơn vị thuộc TP TW thường là phường; thuộc tỉnh thường là xã
  return CITY_CODES.has(provinceCode) ? WardType.WARD : WardType.COMMUNE;
}

function loadJson<T>(filename: string): T {
  const filePath = path.join(__dirname, 'data', filename);
  return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
}

export async function seedVnAdminDivisions(prisma: PrismaClient) {
  const provincesRaw = loadJson<OadRecord[]>('all-province.json');
  const wardsRaw = loadJson<OadRecord[]>('all-ward.json');

  if (provincesRaw.length !== 34) {
    throw new Error(`Expected 34 provinces, got ${provincesRaw.length}`);
  }
  if (wardsRaw.length !== 3321) {
    throw new Error(`Expected 3321 wards, got ${wardsRaw.length}`);
  }

  console.log(`Seeding ${provincesRaw.length} provinces…`);

  const codeToProvinceId = new Map<string, string>();

  for (let i = 0; i < provincesRaw.length; i++) {
    const p = provincesRaw[i];
    const code = p.code.id;
    const row = await prisma.province.upsert({
      where: { code },
      update: {
        name: p.name.local,
        nameEn: p.name.en,
        type: mapProvinceType(code),
        slug: p.name.slug,
        latitude: parseCoord(p.geo?.lat),
        longitude: parseCoord(p.geo?.lon),
        sortOrder: i + 1,
        isActive: true,
      },
      create: {
        code,
        name: p.name.local,
        nameEn: p.name.en,
        type: mapProvinceType(code),
        slug: p.name.slug,
        latitude: parseCoord(p.geo?.lat),
        longitude: parseCoord(p.geo?.lon),
        sortOrder: i + 1,
        isActive: true,
      },
    });
    codeToProvinceId.set(code, row.id);
  }

  console.log(`Seeding ${wardsRaw.length} wards (batched)…`);

  const BATCH = 200;
  let inserted = 0;

  for (let offset = 0; offset < wardsRaw.length; offset += BATCH) {
    const chunk = wardsRaw.slice(offset, offset + BATCH);

    await prisma.$transaction(
      chunk.map((w, idx) => {
        const code = w.code.id;
        const provinceCode = w.parent?.id;
        if (!provinceCode) {
          throw new Error(`Ward ${code} missing parent province`);
        }
        const provinceId = codeToProvinceId.get(provinceCode);
        if (!provinceId) {
          throw new Error(`Ward ${code} parent province ${provinceCode} not found`);
        }

        return prisma.ward.upsert({
          where: { code },
          update: {
            name: w.name.local,
            nameEn: w.name.en,
            type: mapWardType(w.name.local, provinceCode),
            slug: w.name.slug,
            provinceId,
            latitude: parseCoord(w.geo?.lat),
            longitude: parseCoord(w.geo?.lon),
            sortOrder: offset + idx + 1,
            isActive: true,
          },
          create: {
            code,
            name: w.name.local,
            nameEn: w.name.en,
            type: mapWardType(w.name.local, provinceCode),
            slug: w.name.slug,
            provinceId,
            latitude: parseCoord(w.geo?.lat),
            longitude: parseCoord(w.geo?.lon),
            sortOrder: offset + idx + 1,
            isActive: true,
          },
        });
      }),
    );

    inserted += chunk.length;
    if (inserted % 1000 === 0 || inserted === wardsRaw.length) {
      console.log(`  … ${inserted}/${wardsRaw.length} wards`);
    }
  }

  const [provinceCount, wardCount] = await Promise.all([
    prisma.province.count(),
    prisma.ward.count(),
  ]);

  console.log(`Done. provinces=${provinceCount}, wards=${wardCount}`);
}
