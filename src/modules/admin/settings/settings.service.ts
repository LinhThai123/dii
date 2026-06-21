import { Injectable } from '@nestjs/common';
import { SettingValueType } from '@prisma/client';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '../../../common/exceptions';
import { AdminAuditService } from '../shared/admin-audit.service';
import { CreateSettingDto, UpdateSettingDto } from './dto/settings.dto';
import { SettingsRepository } from './settings.repository';

@Injectable()
export class SettingsService {
  constructor(
    private readonly settingsRepository: SettingsRepository,
    private readonly auditService: AdminAuditService,
  ) {}

  async findAll(category: string | undefined, page: number, limit: number) {
    const take = Math.min(Math.max(limit, 1), 100);
    const skip = (Math.max(page, 1) - 1) * take;
    const [items, total] = await this.settingsRepository.findMany({
      category,
      skip,
      take,
    });

    return {
      items: items.map((item) => this.formatSetting(item)),
      meta: { page, limit: take, total },
    };
  }

  async findByKey(key: string) {
    const setting = await this.settingsRepository.findByKey(key);
    if (!setting) {
      throw new NotFoundException(`Setting "${key}" not found`);
    }
    return this.formatSetting(setting);
  }

  async create(
    dto: CreateSettingDto,
    adminId: string,
    ipAddress?: string,
  ) {
    this.validateValue(dto.value, dto.valueType);

    const existing = await this.settingsRepository.findByKey(dto.key);
    if (existing) {
      throw new ConflictException(`Setting "${dto.key}" already exists`);
    }

    const setting = await this.settingsRepository.create({
      ...dto,
      isSystem: false,
      updatedById: adminId,
    });

    await this.auditService.log({
      adminId,
      action: 'settings.create',
      targetType: 'system_setting',
      targetId: setting.key,
      metadata: { key: setting.key, value: setting.value },
      ipAddress,
    });

    return this.formatSetting(setting);
  }

  async update(
    key: string,
    dto: UpdateSettingDto,
    adminId: string,
    ipAddress?: string,
  ) {
    const existing = await this.settingsRepository.findByKey(key);
    if (!existing) {
      throw new NotFoundException(`Setting "${key}" not found`);
    }

    if (!existing.isEditable) {
      throw new ForbiddenException(`Setting "${key}" is not editable`);
    }

    const valueType = dto.valueType ?? existing.valueType;
    if (dto.value !== undefined) {
      this.validateValue(dto.value, valueType);
    }

    const setting = await this.settingsRepository.update(key, {
      ...dto,
      updatedById: adminId,
    });

    await this.auditService.log({
      adminId,
      action: 'settings.update',
      targetType: 'system_setting',
      targetId: key,
      metadata: {
        before: { value: existing.value, valueType: existing.valueType },
        after: { value: setting.value, valueType: setting.valueType },
      },
      ipAddress,
    });

    return this.formatSetting(setting);
  }

  async remove(key: string, adminId: string, ipAddress?: string) {
    const existing = await this.settingsRepository.findByKey(key);
    if (!existing) {
      throw new NotFoundException(`Setting "${key}" not found`);
    }

    if (existing.isSystem) {
      throw new ForbiddenException(`System setting "${key}" cannot be deleted`);
    }

    await this.settingsRepository.delete(key);

    await this.auditService.log({
      adminId,
      action: 'settings.delete',
      targetType: 'system_setting',
      targetId: key,
      metadata: { key, value: existing.value },
      ipAddress,
    });

    return { message: `Setting "${key}" deleted` };
  }

  private validateValue(value: string, valueType: SettingValueType) {
    switch (valueType) {
      case SettingValueType.NUMBER:
        if (Number.isNaN(Number(value))) {
          throw new BadRequestException('value must be a valid number');
        }
        break;
      case SettingValueType.BOOLEAN:
        if (value !== 'true' && value !== 'false') {
          throw new BadRequestException('value must be "true" or "false"');
        }
        break;
      case SettingValueType.JSON:
        try {
          JSON.parse(value);
        } catch {
          throw new BadRequestException('value must be valid JSON');
        }
        break;
      case SettingValueType.STRING:
        break;
    }
  }

  private formatSetting<T extends { value: string; valueType: SettingValueType }>(
    setting: T,
  ): T & { parsedValue: string | number | boolean | unknown } {
    return {
      ...setting,
      parsedValue: this.parseValue(setting.value, setting.valueType),
    };
  }

  private parseValue(
    value: string,
    valueType: SettingValueType,
  ): string | number | boolean | unknown {
    switch (valueType) {
      case SettingValueType.NUMBER:
        return Number(value);
      case SettingValueType.BOOLEAN:
        return value === 'true';
      case SettingValueType.JSON:
        return JSON.parse(value) as unknown;
      default:
        return value;
    }
  }
}
