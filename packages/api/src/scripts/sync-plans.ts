/**
 * Creates a Stripe Product + monthly recurring Price for every Service that
 * has priceFrom set but no stripePriceId yet, then stores the price id.
 * Idempotent. Run after seeding:  pnpm --filter @mazidi/api stripe:sync
 */
import Stripe from "stripe";
import { prisma } from "@mazidi/db";

async function main() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set (run pnpm env:link / fill .env)");
  const stripe = new Stripe(key);

  const services = await prisma.service.findMany({
    where: { priceFrom: { not: null }, stripePriceId: null },
    include: { company: { select: { name: true, slug: true } } },
  });
  if (services.length === 0) {
    console.log("Nothing to sync — all priced services already have Stripe prices.");
    return;
  }

  for (const s of services) {
    const product = await stripe.products.create({
      name: `${s.company.name} — ${s.name}`,
      metadata: { serviceId: s.id, companySlug: s.company.slug },
    });
    const price = await stripe.prices.create({
      product: product.id,
      currency: "gbp",
      unit_amount: Math.round(Number(s.priceFrom) * 100),
      recurring: { interval: "month" },
      metadata: { serviceId: s.id },
    });
    await prisma.service.update({ where: { id: s.id }, data: { stripePriceId: price.id } });
    console.log(`✓ ${s.company.slug}/${s.slug} → ${price.id} (£${s.priceFrom}/mo)`);
  }
  console.log(`Done — ${services.length} plan(s) created.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
