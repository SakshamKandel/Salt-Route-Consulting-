import { PrismaClient, Role, PropertyStatus } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { hash } from 'bcryptjs'
import { addDays } from 'date-fns'
import dotenv from 'dotenv'
import path from 'node:path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // ─── 1. ADMIN USER ────────────────────────────────────
  const adminPassword = await hash('Admin@1234', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@saltroutegroup.com' },
    update: {},
    create: {
      name: 'Salt Route Admin',
      email: 'admin@saltroutegroup.com',
      hashedPassword: adminPassword,
      emailVerified: new Date(),
      role: Role.ADMIN,
    },
  })
  console.log(`  ✅ Admin user: ${admin.email}`)

  // ─── 2. DEMO OWNER ───────────────────────────────────
  const ownerPassword = await hash('Owner@1234', 12)
  const owner = await prisma.user.upsert({
    where: { email: 'owner@saltroutegroup.com' },
    update: {},
    create: {
      name: 'Demo Owner',
      email: 'owner@saltroutegroup.com',
      hashedPassword: ownerPassword,
      emailVerified: new Date(),
      role: Role.OWNER,
      phone: '+977-9800000001',
    },
  })
  console.log(`  ✅ Owner user: ${owner.email}`)

  // ─── 3. DEMO GUEST ───────────────────────────────────
  const guestPassword = await hash('Guest@1234', 12)
  const guest = await prisma.user.upsert({
    where: { email: 'guest@example.com' },
    update: {},
    create: {
      name: 'Demo Guest',
      email: 'guest@example.com',
      hashedPassword: guestPassword,
      emailVerified: new Date(),
      role: Role.GUEST,
    },
  })
  console.log(`  ✅ Guest user: ${guest.email}`)

  // ─── 4. DEMO PROPERTIES ──────────────────────────────
  const properties = [
    {
      title: 'Himalayan Heritage Villa',
      slug: 'himalayan-heritage-villa',
      description:
        'A stunning heritage villa nestled in the foothills of the Himalayas. This beautifully restored property features traditional Nepali architecture blended with modern luxury. Wake up to breathtaking mountain views, enjoy organic meals prepared with locally sourced ingredients, and experience the warmth of Nepali hospitality at its finest.',
      highlights: ['Mountain views', 'Heritage architecture', 'Organic meals', 'Private garden'],
      location: 'Nagarkot, Nepal',
      address: 'Nagarkot Hill, Bhaktapur District, Nepal',
      latitude: 27.7172,
      longitude: 85.5196,
      pricePerNight: 250.0,
      maxGuests: 6,
      bedrooms: 3,
      bathrooms: 2,
      amenities: ['WiFi', 'Fireplace', 'Kitchen', 'Mountain View', 'Parking', 'Garden', 'BBQ'],
      rules: ['No smoking indoors', 'Check-in after 2 PM', 'Quiet hours 10 PM - 7 AM'],
      status: PropertyStatus.ACTIVE,
      featured: true,
    },
    {
      title: 'Lakeside Boutique Retreat',
      slug: 'lakeside-boutique-retreat',
      description:
        'An intimate boutique retreat overlooking the serene Phewa Lake in Pokhara. Designed for travelers seeking tranquility and luxury, this property offers private balconies with lake and mountain views, a rooftop yoga deck, and curated experiences including boat rides and guided treks to nearby trails.',
      highlights: ['Lake view', 'Rooftop yoga', 'Boat access', 'Trek arrangements'],
      location: 'Pokhara, Nepal',
      address: 'Lakeside Road, Pokhara, Kaski District, Nepal',
      latitude: 28.2096,
      longitude: 83.9856,
      pricePerNight: 180.0,
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 2,
      amenities: ['WiFi', 'Lake View', 'Yoga Deck', 'Room Service', 'Airport Transfer', 'Laundry'],
      rules: ['No pets', 'No parties', 'Check-in 1 PM - 9 PM'],
      status: PropertyStatus.ACTIVE,
      featured: true,
    },
    {
      title: 'Jungle Edge Safari Lodge',
      slug: 'jungle-edge-safari-lodge',
      description:
        'Experience the wild beauty of Chitwan from the comfort of a luxury safari lodge. Located at the edge of Chitwan National Park, this eco-friendly property offers guided jungle safaris, canoe rides, Tharu cultural experiences, and world-class birdwatching — all while maintaining a commitment to sustainable tourism.',
      highlights: ['Safari included', 'Eco-friendly', 'Cultural tours', 'Bird watching'],
      location: 'Chitwan, Nepal',
      address: 'Sauraha, Chitwan National Park, Nepal',
      latitude: 27.5833,
      longitude: 84.5000,
      pricePerNight: 320.0,
      maxGuests: 8,
      bedrooms: 4,
      bathrooms: 3,
      amenities: ['WiFi', 'Pool', 'Safari', 'Restaurant', 'Bar', 'Spa', 'Airport Transfer'],
      rules: ['Follow park guidelines', 'No flash photography of wildlife', 'Eco-friendly practices required'],
      status: PropertyStatus.ACTIVE,
      featured: false,
    },
  ]

  for (const prop of properties) {
    const property = await prisma.property.upsert({
      where: { slug: prop.slug },
      update: {},
      create: {
        ...prop,
        ownerId: owner.id,
        images: {
          create: [
            {
              url: `https://placehold.co/1200x800/1B3A5C/C9A96E?text=${encodeURIComponent(prop.title)}`,
              publicId: `salt-route/${prop.slug}/hero`,
              alt: `${prop.title} - Hero Image`,
              order: 0,
              isPrimary: true,
            },
            {
              url: `https://placehold.co/1200x800/14293F/D9BE8A?text=${encodeURIComponent(prop.location)}`,
              publicId: `salt-route/${prop.slug}/interior`,
              alt: `${prop.title} - Interior`,
              order: 1,
              isPrimary: false,
            },
            {
              url: `https://placehold.co/1200x800/0A1620/E8DCC4?text=View`,
              publicId: `salt-route/${prop.slug}/view`,
              alt: `${prop.title} - View`,
              order: 2,
              isPrimary: false,
            },
          ],
        },
      },
    })

    // Add blocked dates (next 3 days for each property)
    const today = new Date()
    for (let i = 1; i <= 3; i++) {
      const blockedDate = addDays(today, i + Math.floor(Math.random() * 10))
      await prisma.blockedDate.upsert({
        where: {
          propertyId_date: {
            propertyId: property.id,
            date: blockedDate,
          },
        },
        update: {},
        create: {
          propertyId: property.id,
          date: blockedDate,
          reason: 'Maintenance',
        },
      })
    }

    console.log(`  ✅ Property: ${property.title}`)
  }

  console.log('\n🎉 Seeding complete!')
  console.log('\n📋 Demo accounts:')
  console.log('  Admin:  admin@saltroutegroup.com / Admin@1234')
  console.log('  Owner:  owner@saltroutegroup.com / Owner@1234')
  console.log('  Guest:  guest@example.com / Guest@1234')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
