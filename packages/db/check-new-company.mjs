import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const company = await prisma.company.findUnique({ where: { slug: 'muscle-app' } })
console.log(JSON.stringify(company, null, 2))
await prisma.$disconnect()
