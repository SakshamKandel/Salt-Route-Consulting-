/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.property.findUnique({where: {slug: 'himalayan-heritage-villa'}, include: {images: true}}).then(p => console.log(JSON.stringify(p.images, null, 2))).catch(console.error).finally(() => prisma.$disconnect());
