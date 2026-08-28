import { DatePlanStatus, PrismaClient } from '@prisma/client';

const DEMO_PLACES = [
  {
    key: 'place-cafe-linh',
    name: 'The Coffee House - Nguyễn Huệ',
    address: '42 Nguyễn Huệ, Quận 1, TP.HCM',
    latitude: 10.7731,
    longitude: 106.7042,
    rating: 4.5,
    category: 'cafe',
    priceLevel: 2,
    phone: '+842812345678',
  },
  {
    key: 'place-rest-hk',
    name: 'Pizza 4P\'s Bến Thành',
    address: '151 Đồng Khởi, Quận 1, TP.HCM',
    latitude: 10.7798,
    longitude: 106.6992,
    rating: 4.7,
    category: 'restaurant',
    priceLevel: 3,
  },
  {
    key: 'place-travel-lt',
    name: 'Suối Tiên Theme Park',
    address: 'Xã Tân Phú, Quận 9, TP.HCM',
    latitude: 10.8651,
    longitude: 106.8037,
    rating: 4.2,
    category: 'travel',
    priceLevel: 3,
  },
  {
    key: 'place-activity-phuong',
    name: 'Snow Town Saigon',
    address: '125 Đồng Văn Cống, Quận 2, TP.HCM',
    latitude: 10.7874,
    longitude: 106.7498,
    rating: 4.0,
    category: 'activity',
    priceLevel: 3,
  },
];

export async function seedDemoBusiness(prisma: PrismaClient) {
  const placeIds = new Map<string, string>();

  for (const p of DEMO_PLACES) {
    const place = await prisma.place.upsert({
      where: { googlePlaceId: p.key },
      update: {
        name: p.name,
        address: p.address,
        latitude: p.latitude,
        longitude: p.longitude,
        rating: p.rating,
        category: p.category,
        priceLevel: p.priceLevel,
        phone: p.phone,
      },
      create: {
        googlePlaceId: p.key,
        name: p.name,
        address: p.address,
        latitude: p.latitude,
        longitude: p.longitude,
        rating: p.rating,
        category: p.category,
        priceLevel: p.priceLevel,
        phone: p.phone,
      },
    });
    placeIds.set(p.key, place.id);
  }

  const linh = await prisma.user.findUnique({ where: { phone: '+84901234501' } });
  const minh = await prisma.user.findUnique({ where: { phone: '+84901234502' } });
  const coupleLm = await prisma.couple.findUnique({ where: { inviteCode: 'DII001LM' } });

  if (linh && coupleLm && placeIds.has('place-cafe-linh')) {
    const existingPlan = await prisma.datePlan.findFirst({
      where: { coupleId: coupleLm.id, title: 'Buổi hẹn cafe cuối tuần' },
    });
    if (!existingPlan) {
      await prisma.datePlan.create({
        data: {
          coupleId: coupleLm.id,
          createdById: linh.id,
          title: 'Buổi hẹn cafe cuối tuần',
          description: 'Thử quán cafe mới ở Quận 1',
          scheduledAt: new Date('2025-06-15T10:00:00'),
          durationMinutes: 120,
          placeId: placeIds.get('place-cafe-linh'),
          status: DatePlanStatus.PLANNED,
          checklistItems: {
            create: [
              { title: 'Đặt bàn trước', assignedToId: minh?.id },
              { title: 'Chọn quà nhỏ', isCompleted: true, assignedToId: linh.id },
            ],
          },
        },
      });
    }

    const existingMemory = await prisma.memory.findFirst({
      where: { coupleId: coupleLm.id, title: 'Lần đầu đi cafe cùng nhau' },
    });
    if (!existingMemory) {
      await prisma.memory.create({
        data: {
          coupleId: coupleLm.id,
          authorId: linh.id,
          placeId: placeIds.get('place-cafe-linh'),
          title: 'Lần đầu đi cafe cùng nhau',
          content: 'Không gian ấm cúng, nhạc nhẹ, rất hợp couple date.',
          memoryAt: new Date('2024-04-20'),
        },
      });
    }

    await prisma.favorite.upsert({
      where: {
        coupleId_placeId: {
          coupleId: coupleLm.id,
          placeId: placeIds.get('place-cafe-linh')!,
        },
      },
      update: {},
      create: {
        coupleId: coupleLm.id,
        placeId: placeIds.get('place-cafe-linh')!,
      },
    });

    if (minh) {
      const existingReview = await prisma.review.findFirst({
        where: { placeId: placeIds.get('place-cafe-linh'), userId: minh.id },
      });
      if (!existingReview) {
        await prisma.review.create({
          data: {
            placeId: placeIds.get('place-cafe-linh')!,
            userId: minh.id,
            coupleId: coupleLm.id,
            rating: 5,
            text: 'Không gian đẹp, đồ uống ngon, phù hợp hẹn hò.',
          },
        });
      }
    }
  }

  const coupleHk = await prisma.couple.findUnique({ where: { inviteCode: 'DII002HK' } });
  const hoa = await prisma.user.findUnique({ where: { phone: '+84901234503' } });

  if (hoa && coupleHk && placeIds.has('place-rest-hk')) {
    const album = await prisma.album.findFirst({
      where: { coupleId: coupleHk.id, title: 'Food trip Q1' },
    });
    if (!album) {
      await prisma.album.create({
        data: {
          coupleId: coupleHk.id,
          title: 'Food trip Q1',
          coverUrl: 'https://picsum.photos/seed/dii-album/400/300',
          photos: {
            create: {
              uploadedById: hoa.id,
              s3Url: 'https://picsum.photos/seed/dii-photo1/800/600',
              caption: 'Pizza ngon tuyệt',
            },
          },
        },
      });
    }
  }

  console.log(`Seeded ${DEMO_PLACES.length} demo places and related business data`);
}
