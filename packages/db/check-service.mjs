import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const services = await prisma.service.findMany({ 
  where: { companyId: '855359e6-9170-4fff-b1ae-aa8ec2748b0e' } 
})
console.log(JSON.stringify(services, null, 2))
await prisma.$disconnect()
