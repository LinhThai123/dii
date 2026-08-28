import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { seedDemoUsers } from './seed-demo-users';
import { seedDemoBusiness } from './seed-demo-business';
import { seedVnAdminDivisions } from './seed-vn-admin';

const prisma = new PrismaClient();

const PERMISSIONS = [
  { code: '*', module: 'system', description: 'All permissions' },
  { code: 'users.read', module: 'users', description: 'View users' },
  { code: 'users.suspend', module: 'users', description: 'Suspend users' },
  { code: 'couples.read', module: 'couples', description: 'View couples' },
  { code: 'couples.write', module: 'couples', description: 'Update couple status' },
  { code: 'couples.delete', module: 'couples', description: 'Delete couples' },
  { code: 'places.read', module: 'places', description: 'View places' },
  { code: 'places.write', module: 'places', description: 'Manage places' },
  { code: 'places.delete', module: 'places', description: 'Delete places' },
  { code: 'dates.read', module: 'dates', description: 'View date plans' },
  { code: 'dates.delete', module: 'dates', description: 'Delete date plans' },
  { code: 'memories.read', module: 'memories', description: 'View memories' },
  { code: 'memories.delete', module: 'memories', description: 'Delete memories' },
  { code: 'media.read', module: 'media', description: 'View albums and photos' },
  { code: 'media.delete', module: 'media', description: 'Delete albums and photos' },
  { code: 'reviews.read', module: 'reviews', description: 'View reviews' },
  { code: 'reviews.delete', module: 'reviews', description: 'Delete reviews' },
  { code: 'analytics.read', module: 'analytics', description: 'View analytics' },
  { code: 'audit.read', module: 'audit', description: 'View audit logs' },
  { code: 'reports.read', module: 'reports', description: 'View reports' },
  { code: 'admins.read', module: 'admins', description: 'View admins' },
  { code: 'admins.write', module: 'admins', description: 'Manage admins' },
  { code: 'roles.read', module: 'roles', description: 'View roles' },
  { code: 'roles.write', module: 'roles', description: 'Manage roles' },
  { code: 'settings.read', module: 'settings', description: 'View system settings' },
  { code: 'settings.write', module: 'settings', description: 'Manage system settings' },
];

const ROLES = [
  {
    code: 'SUPER_ADMIN',
    name: 'Super Admin',
    description: 'Full system access',
    isSystem: true,
    permissions: ['*'],
  },
  {
    code: 'MODERATOR',
    name: 'Moderator',
    description: 'Content moderation',
    isSystem: true,
    permissions: [
      'users.read',
      'users.suspend',
      'couples.read',
      'couples.write',
      'couples.delete',
      'places.read',
      'places.write',
      'places.delete',
      'dates.read',
      'dates.delete',
      'memories.read',
      'memories.delete',
      'media.read',
      'media.delete',
      'reviews.read',
      'reviews.delete',
      'reports.read',
      'analytics.read',
      'audit.read',
      'settings.read',
    ],
  },
  {
    code: 'SUPPORT',
    name: 'Support',
    description: 'Read-only support',
    isSystem: true,
    permissions: ['users.read', 'couples.read', 'places.read'],
  },
];

async function main() {
  for (const p of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: p.code },
      update: {},
      create: p,
    });
  }

  for (const roleDef of ROLES) {
    const role = await prisma.adminRole.upsert({
      where: { code: roleDef.code },
      update: {},
      create: {
        code: roleDef.code,
        name: roleDef.name,
        description: roleDef.description,
        isSystem: roleDef.isSystem,
      },
    });

    for (const permCode of roleDef.permissions) {
      const permission = await prisma.permission.findUnique({
        where: { code: permCode },
      });
      if (!permission) continue;

      await prisma.adminRolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: role.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }

  const superAdminRole = await prisma.adminRole.findUnique({
    where: { code: 'SUPER_ADMIN' },
  });

  const passwordHash = await bcrypt.hash('Admin@123456', 10);
  const admin = await prisma.adminUser.upsert({
    where: { email: 'admin@dii.app' },
    update: {},
    create: {
      email: 'admin@dii.app',
      passwordHash,
      name: 'Super Admin',
    },
  });

  if (superAdminRole) {
    await prisma.adminUserRole.upsert({
      where: {
        adminId_roleId: { adminId: admin.id, roleId: superAdminRole.id },
      },
      update: {},
      create: { adminId: admin.id, roleId: superAdminRole.id },
    });
  }

  console.log('Seeded permissions, roles, and admin@dii.app / Admin@123456');

  const DEFAULT_SETTINGS = [
    {
      key: 'otp.expiry_minutes',
      value: '5',
      valueType: 'NUMBER' as const,
      category: 'auth',
      label: 'OTP expiry (minutes)',
      description: 'Thời gian hết hạn mã OTP',
      isPublic: false,
      isSystem: true,
    },
    {
      key: 'otp.max_attempts',
      value: '3',
      valueType: 'NUMBER' as const,
      category: 'auth',
      label: 'OTP max attempts',
      description: 'Số lần nhập sai OTP tối đa',
      isPublic: false,
      isSystem: true,
    },
    {
      key: 'otp.resend_cooldown_seconds',
      value: '60',
      valueType: 'NUMBER' as const,
      category: 'auth',
      label: 'OTP resend cooldown (seconds)',
      description: 'Thời gian chờ trước khi gửi lại OTP',
      isPublic: false,
      isSystem: true,
    },
    {
      key: 'app.maintenance_mode',
      value: 'false',
      valueType: 'BOOLEAN' as const,
      category: 'app',
      label: 'Maintenance mode',
      description: 'Bật chế độ bảo trì — chặn truy cập mobile app',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'app.min_app_version',
      value: '1.0.0',
      valueType: 'STRING' as const,
      category: 'app',
      label: 'Minimum app version',
      description: 'Phiên bản app tối thiểu được phép sử dụng',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'feature.google_login_enabled',
      value: 'true',
      valueType: 'BOOLEAN' as const,
      category: 'feature_flags',
      label: 'Google login enabled',
      description: 'Bật/tắt đăng nhập Google',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'feature.facebook_login_enabled',
      value: 'true',
      valueType: 'BOOLEAN' as const,
      category: 'feature_flags',
      label: 'Facebook login enabled',
      description: 'Bật/tắt đăng nhập Facebook',
      isPublic: true,
      isSystem: true,
    },
    {
      key: 'notification.push_enabled',
      value: 'true',
      valueType: 'BOOLEAN' as const,
      category: 'notification',
      label: 'Push notifications enabled',
      description: 'Bật/tắt gửi push notification',
      isPublic: false,
      isSystem: true,
    },
  ];

  for (const setting of DEFAULT_SETTINGS) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: {
        key: setting.key,
        value: setting.value,
        valueType: setting.valueType,
        category: setting.category,
        label: setting.label,
        description: setting.description,
        isPublic: setting.isPublic,
        isEditable: true,
        isSystem: setting.isSystem,
      },
    });
  }

  console.log(`Seeded ${DEFAULT_SETTINGS.length} system settings`);

  await seedDemoUsers(prisma);
  await seedDemoBusiness(prisma);
  await seedVnAdminDivisions(prisma);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
