/**
 * Creates a Stripe Product + monthly recurring Price for every Service that has
 * priceFrom set but no stripePriceId yet, then stores the price id.
 * Idempotent. Run after seeding:  pnpm --filter @mazidi/api stripe:sync
 *
 * Two things this does NOT do, both deliberate:
 *
 * 1. It skips companies in EXTERNALLY_BILLED_COMPANY_SLUGS. gymapp is billed
 *    through the App Store via RevenueCat, so a Stripe price would be a second
 *    competing subscription for the same product.
 *
 * 2. It treats Service.priceFrom as the exact monthly charge. For services
 *    marketed as "from £X" that is a floor, not a price — a £950/mo SEO
 *    retainer sold at exactly £950 may not be what was intended. Pass --dry-run
 *    first and read the plan before creating anything in live mode.
 */
import Stripe from "stripe";
import { prisma } from "@mazidi/db";
import { EXTERNALLY_BILLED_COMPANY_SLUGS } from "@mazidi/config";

async function main() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not set (run pnpm env:link / fill .env)");
  const stripe = new Stripe(key);

  const dryRun = process.argv.includes("--dry-run");
  const live = key.startsWith("sk_live_");

  const services = await prisma.service.findMany({
    where: {
      priceFrom: { not: null },
      stripePriceId: null,
      company: { slug: { notIn: [...EXTERNALLY_BILLED_COMPANY_SLUGS] } },
    },
    include: { company: { select: { name: true, slug: true } } },
  });
  if (services.length === 0) {
    console.log("Nothing to sync — all priced services already have Stripe prices.");
    return;
  }

  console.log(`Mode: ${live ? "LIVE" : "test"}${dryRun ? " (dry run)" : ""}`);
  console.log(`${services.length} service(s) to create:\n`);
  for (const s of services) {
    console.log(`  ${s.company.slug}/${s.slug}  £${Number(s.priceFrom).toFixed(2)}/mo  ${s.name}`);
  }
  console.log();

  if (dryRun) {
    console.log("Dry run — nothing created. Re-run without --dry-run to apply.");
    return;
  }
  if (live) {
    // Live prices are visible to customers the moment they exist and cannot be
    // edited afterwards (Stripe prices are immutable — you archive and replace).
    console.log("LIVE mode: creating real, customer-visible prices in 5s. Ctrl-C to abort.");
    await new Promise((r) => setTimeout(r, 5000));
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
