import { Injectable } from '@nestjs/common';
import { Prisma, SettingValueType } from '@prisma/client';
import { PrismaService } from '../../../database/prisma/prisma.service';

const settingSelect = {
  id: true,
  key: true,
  value: true,
  valueType: true,
  category: true,
  label: true,
  description: true,
  isPublic: true,
  isEditable: true,
  isSystem: true,
  updatedById: true,
  createdAt: true,
  updatedAt: true,
  updatedBy: { select: { id: true, name: true, email: true } },
} satisfies Prisma.SystemSettingSelect;

@Injectable()
export class SettingsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(params: { category?: string; skip: number; take: number }) {
    const where: Prisma.SystemSettingWhereInput = params.category
      ? { category: params.category }
      : {};

    return this.prisma.$transaction([
      this.prisma.systemSetting.findMany({
        where,
        skip: params.skip,
        take: params.take,
        orderBy: [{ category: 'asc' }, { key: 'asc' }],
        select: settingSelect,
      }),
      this.prisma.systemSetting.count({ where }),
    ]);
  }

  findByKey(key: string) {
    return this.prisma.systemSetting.findUnique({
      where: { key },
      select: settingSelect,
    });
  }

  create(data: {
    key: string;
    value: string;
    valueType: SettingValueType;
    category: string;
    label: string;
    description?: string;
    isPublic?: boolean;
    isEditable?: boolean;
    isSystem?: boolean;
    updatedById: string;
  }) {
    return this.prisma.systemSetting.create({
      data,
      select: settingSelect,
    });
  }

  update(
    key: string,
    data: {
      value?: string;
      valueType?: SettingValueType;
      category?: string;
      label?: string;
      description?: string | null;
      isPublic?: boolean;
      isEditable?: boolean;
      updatedById: string;
    },
  ) {
    return this.prisma.systemSetting.update({
      where: { key },
      data,
      select: settingSelect,
    });
  }

  delete(key: string) {
    return this.prisma.systemSetting.delete({
      where: { key },
      select: { key: true },
    });
  }

  findByKeys(keys: string[]) {
    return this.prisma.systemSetting.findMany({
      where: { key: { in: keys } },
      select: settingSelect,
    });
  }
}
