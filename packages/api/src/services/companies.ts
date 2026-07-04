import { prisma } from "@mazidi/db";
import type { Pillar } from "@mazidi/db";

/** Public: live tenants for grids, mega-menu, sitemaps. Cached by Next ISR. */
export async function listLiveCompanies(pillar?: Pillar) {
  return prisma.company.findMany({
    where: { status: "LIVE", ...(pillar ? { pillar } : {}) },
    orderBy: [{ pillar: "asc" }, { name: "asc" }],
    select: {
      id: true, slug: true, name: true, pillar: true, description: true, brand: true,
      services: { orderBy: { sortOrder: "asc" }, select: { slug: true, name: true, summary: true } },
    },
  });
}

export async function getCompanyBySlug(slug: string) {
  return prisma.company.findFirst({
    where: { slug, status: "LIVE" },
    include: {
      services: { orderBy: { sortOrder: "asc" } },
      testimonials: { take: 3 },
    },
  });
}

export async function listPosts(limit = 12) {
  return prisma.post.findMany({
    where: { publishedAt: { not: null } },
    orderBy: { publishedAt: "desc" },
    take: limit,
  });
}

export async function listFeaturedTestimonials() {
  return prisma.testimonial.findMany({ where: { featured: true }, take: 6 });
}
