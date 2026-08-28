import {
  AuthProvider,
  CoupleStatus,
  Gender,
  PrismaClient,
  RelationshipStatus,
  UserStatus,
} from '@prisma/client';

type DemoAuthAccount = {
  provider: AuthProvider;
  providerAccountId: string;
};

type DemoUser = {
  email: string;
  phone: string;
  name: string;
  status: UserStatus;
  gender: Gender;
  bio?: string;
  avatar?: string;
  createdAt?: Date;
  authAccounts: DemoAuthAccount[];
  preferences?: {
    cuisines: string[];
    activities: string[];
    budgetRange: string;
    distanceRadius: number;
  };
};

const DEMO_USERS: DemoUser[] = [
  /** Tài khoản dev cố định — đăng nhập OTP 123456 với SĐT 0966351634 */
  {
    email: 'dev.0966351634@dii.app',
    phone: '+84966351634',
    name: 'Dev User',
    status: UserStatus.ACTIVE,
    gender: Gender.PREFER_NOT_TO_SAY,
    bio: 'Tài khoản dev cố định',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dev0966351634',
    authAccounts: [{ provider: AuthProvider.PHONE, providerAccountId: '+84966351634' }],
    preferences: {
      cuisines: ['vietnamese', 'cafe'],
      activities: ['travel', 'dining'],
      budgetRange: 'medium',
      distanceRadius: 15,
    },
  },
  {
    email: 'linh.nguyen@gmail.com',
    phone: '+84901234501',
    name: 'Nguyễn Thị Linh',
    status: UserStatus.ACTIVE,
    gender: Gender.FEMALE,
    bio: 'Yêu cafe và du lịch cuối tuần ☕',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Linh',
    createdAt: new Date('2024-03-15'),
    authAccounts: [
      { provider: AuthProvider.PHONE, providerAccountId: '+84901234501' },
      { provider: AuthProvider.GOOGLE, providerAccountId: 'google-linh-001' },
    ],
    preferences: {
      cuisines: ['cafe', 'japanese', 'vietnamese'],
      activities: ['travel', 'photography'],
      budgetRange: 'medium',
      distanceRadius: 15,
    },
  },
  {
    email: 'minh.tran@gmail.com',
    phone: '+84901234502',
    name: 'Trần Văn Minh',
    status: UserStatus.ACTIVE,
    gender: Gender.MALE,
    bio: 'Thích khám phá quán ăn mới',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Minh',
    createdAt: new Date('2024-03-16'),
    authAccounts: [{ provider: AuthProvider.PHONE, providerAccountId: '+84901234502' }],
  },
  {
    email: 'hoa.le@gmail.com',
    phone: '+84901234503',
    name: 'Lê Thu Hoa',
    status: UserStatus.ACTIVE,
    gender: Gender.FEMALE,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hoa',
    createdAt: new Date('2024-04-02'),
    authAccounts: [{ provider: AuthProvider.FACEBOOK, providerAccountId: 'fb-hoa-102938' }],
    preferences: {
      cuisines: ['italian', 'dessert'],
      activities: ['movies', 'cooking'],
      budgetRange: 'high',
      distanceRadius: 20,
    },
  },
  {
    email: 'tuan.pham@gmail.com',
    phone: '+84901234504',
    name: 'Phạm Quốc Tuấn',
    status: UserStatus.SUSPENDED,
    gender: Gender.MALE,
    createdAt: new Date('2024-05-10'),
    authAccounts: [{ provider: AuthProvider.PHONE, providerAccountId: '+84901234504' }],
  },
  {
    email: 'lan.hoang@gmail.com',
    phone: '+84901234505',
    name: 'Hoàng Thị Lan',
    status: UserStatus.ACTIVE,
    gender: Gender.FEMALE,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lan',
    createdAt: new Date('2024-06-01'),
    authAccounts: [{ provider: AuthProvider.GOOGLE, providerAccountId: 'google-lan-002' }],
  },
  {
    email: 'mai.vo@gmail.com',
    phone: '+84901234506',
    name: 'Võ Minh Mai',
    status: UserStatus.INACTIVE,
    gender: Gender.FEMALE,
    createdAt: new Date('2024-06-18'),
    authAccounts: [{ provider: AuthProvider.PHONE, providerAccountId: '+84901234506' }],
  },
  {
    email: 'khoa.dang@gmail.com',
    phone: '+84901234507',
    name: 'Đặng Văn Khoa',
    status: UserStatus.ACTIVE,
    gender: Gender.MALE,
    bio: 'Foodie | Sài Gòn',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Khoa',
    createdAt: new Date('2024-07-05'),
    authAccounts: [
      { provider: AuthProvider.PHONE, providerAccountId: '+84901234507' },
      { provider: AuthProvider.FACEBOOK, providerAccountId: 'fb-khoa-556677' },
    ],
  },
  {
    email: 'trang.bui@gmail.com',
    phone: '+84901234508',
    name: 'Bùi Thị Trang',
    status: UserStatus.ACTIVE,
    gender: Gender.FEMALE,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Trang',
    createdAt: new Date('2024-08-12'),
    authAccounts: [{ provider: AuthProvider.GOOGLE, providerAccountId: 'google-trang-003' }],
  },
  {
    email: 'nam.ngo@gmail.com',
    phone: '+84901234509',
    name: 'Ngô Văn Nam',
    status: UserStatus.SUSPENDED,
    gender: Gender.MALE,
    createdAt: new Date('2024-09-20'),
    authAccounts: [{ provider: AuthProvider.PHONE, providerAccountId: '+84901234509' }],
  },
  {
    email: 'phuong.duong@gmail.com',
    phone: '+84901234510',
    name: 'Dương Thu Phương',
    status: UserStatus.ACTIVE,
    gender: Gender.FEMALE,
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Phuong',
    createdAt: new Date('2024-10-08'),
    authAccounts: [{ provider: AuthProvider.PHONE, providerAccountId: '+84901234510' }],
    preferences: {
      cuisines: ['korean', 'bbq'],
      activities: ['hiking', 'music'],
      budgetRange: 'low',
      distanceRadius: 10,
    },
  },
  {
    email: 'duc.ly@gmail.com',
    phone: '+84901234511',
    name: 'Lý Văn Đức',
    status: UserStatus.INACTIVE,
    gender: Gender.MALE,
    createdAt: new Date('2024-11-15'),
    authAccounts: [{ provider: AuthProvider.GOOGLE, providerAccountId: 'google-duc-004' }],
  },
  {
    email: 'thao.trinh@gmail.com',
    phone: '+84901234512',
    name: 'Trịnh Thị Thảo',
    status: UserStatus.SUSPENDED,
    gender: Gender.FEMALE,
    createdAt: new Date('2024-12-01'),
    authAccounts: [{ provider: AuthProvider.FACEBOOK, providerAccountId: 'fb-thao-889900' }],
  },
];

/** Cặp đôi seed — phone của 2 thành viên */
const DEMO_COUPLES: Array<{
  inviteCode: string;
  phones: [string, string];
  status: CoupleStatus;
  anniversaryDate?: Date;
}> = [
  {
    inviteCode: 'DII001LM',
    phones: ['+84901234501', '+84901234502'],
    status: CoupleStatus.ACTIVE,
    anniversaryDate: new Date('2023-02-14'),
  },
  {
    inviteCode: 'DII002HK',
    phones: ['+84901234503', '+84901234507'],
    status: CoupleStatus.ACTIVE,
    anniversaryDate: new Date('2024-01-20'),
  },
  {
    inviteCode: 'DII003LT',
    phones: ['+84901234505', '+84901234508'],
    status: CoupleStatus.ACTIVE,
    anniversaryDate: new Date('2022-08-08'),
  },
];

export async function seedDemoUsers(prisma: PrismaClient) {
  const userIdsByPhone = new Map<string, string>();

  for (const demo of DEMO_USERS) {
    const user = await prisma.user.upsert({
      where: { phone: demo.phone },
      update: {
        email: demo.email,
        name: demo.name,
        status: demo.status,
        gender: demo.gender,
        bio: demo.bio,
        avatar: demo.avatar,
        ...(demo.createdAt ? { createdAt: demo.createdAt } : {}),
      },
      create: {
        email: demo.email,
        phone: demo.phone,
        name: demo.name,
        status: demo.status,
        gender: demo.gender,
        bio: demo.bio,
        avatar: demo.avatar,
        createdAt: demo.createdAt ?? new Date(),
      },
    });

    userIdsByPhone.set(demo.phone, user.id);

    for (const acc of demo.authAccounts) {
      await prisma.authAccount.upsert({
        where: {
          provider_providerAccountId: {
            provider: acc.provider,
            providerAccountId: acc.providerAccountId,
          },
        },
        update: {
          userId: user.id,
          isVerified: true,
          lastUsedAt: new Date(),
        },
        create: {
          userId: user.id,
          provider: acc.provider,
          providerAccountId: acc.providerAccountId,
          isVerified: true,
          lastUsedAt: new Date(),
        },
      });
    }

    if (demo.preferences) {
      await prisma.userPreference.upsert({
        where: { userId: user.id },
        update: {
          cuisines: demo.preferences.cuisines,
          activities: demo.preferences.activities,
          budgetRange: demo.preferences.budgetRange,
          distanceRadius: demo.preferences.distanceRadius,
        },
        create: {
          userId: user.id,
          cuisines: demo.preferences.cuisines,
          activities: demo.preferences.activities,
          budgetRange: demo.preferences.budgetRange,
          distanceRadius: demo.preferences.distanceRadius,
        },
      });
    }
  }

  for (const coupleDef of DEMO_COUPLES) {
    const [phoneA, phoneB] = coupleDef.phones;
    const userAId = userIdsByPhone.get(phoneA);
    const userBId = userIdsByPhone.get(phoneB);
    if (!userAId || !userBId) continue;

    const couple = await prisma.couple.upsert({
      where: { inviteCode: coupleDef.inviteCode },
      update: {
        status: coupleDef.status,
        anniversaryDate: coupleDef.anniversaryDate,
        relationshipStatus: RelationshipStatus.DATING,
      },
      create: {
        inviteCode: coupleDef.inviteCode,
        status: coupleDef.status,
        anniversaryDate: coupleDef.anniversaryDate,
        relationshipStatus: RelationshipStatus.DATING,
      },
    });

    for (const userId of [userAId, userBId]) {
      await prisma.coupleMember.upsert({
        where: { coupleId_userId: { coupleId: couple.id, userId } },
        update: {},
        create: { coupleId: couple.id, userId },
      });
    }
  }

  console.log(
    `Seeded ${DEMO_USERS.length} demo users (${DEMO_USERS.filter((u) => u.status === UserStatus.ACTIVE).length} active, ${DEMO_USERS.filter((u) => u.status === UserStatus.SUSPENDED).length} suspended, ${DEMO_USERS.filter((u) => u.status === UserStatus.INACTIVE).length} inactive) and ${DEMO_COUPLES.length} couples`,
  );
}
