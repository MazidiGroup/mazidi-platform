import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const companies = await prisma.company.findMany({ orderBy: { createdAt: 'desc' }, take: 5 })
console.log(JSON.stringify(companies, null, 2))
await prisma.$disconnect()
