/**
 * Creates a Stripe Product + monthly recurring Price for every Service with a
 * canonical billingPriceGbp and no stripePriceId yet, then stores the price id.
 * Idempotent. Run:  pnpm --filter @mazidi/api stripe:sync
 *
 * Reads billingPriceGbp, NEVER priceFrom. priceFrom is marketing display copy —
 * the site renders "from £950" — and billing it directly would sell a quoted
 * retainer at its advertised floor. A service with no billingPriceGbp is not
 * self-serve sellable and is skipped; that is the correct default.
 *
 * Also skips EXTERNALLY_BILLED_COMPANY_SLUGS entirely, as defence in depth:
 * gymapp is billed through the App Store via RevenueCat, and a Stripe price
 * there would be a second competing subscription for the same product.
 *
 * Always run --dry-run first. Stripe prices are immutable once created — the
 * only correction is to archive and replace, and customers may have subscribed
 * in between.
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
      billingPriceGbp: { not: null },
      stripePriceId: null,
      company: { slug: { notIn: [...EXTERNALLY_BILLED_COMPANY_SLUGS] } },
    },
    include: { company: { select: { name: true, slug: true } } },
  });
  if (services.length === 0) {
    console.log(
      "Nothing to sync — no Service has a billingPriceGbp without a stripePriceId.\n" +
        "Note: priceFrom is deliberately ignored. Set billingPriceGbp on a service\n" +
        "to make it self-serve sellable.",
    );
    return;
  }

  console.log(`Mode: ${live ? "LIVE" : "test"}${dryRun ? " (dry run)" : ""}`);
  console.log(`${services.length} service(s) to create:\n`);
  for (const s of services) {
    console.log(
      `  ${s.company.slug}/${s.slug}  £${Number(s.billingPriceGbp).toFixed(2)}/mo  ${s.name}` +
        (s.priceFrom !== null && Number(s.priceFrom) !== Number(s.billingPriceGbp)
          ? `   (display "from £${Number(s.priceFrom).toFixed(2)}")`
          : ""),
    );
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
      unit_amount: Math.round(Number(s.billingPriceGbp) * 100),
      recurring: { interval: "month" },
      metadata: { serviceId: s.id },
    });
    await prisma.service.update({ where: { id: s.id }, data: { stripePriceId: price.id } });
    console.log(`✓ ${s.company.slug}/${s.slug} → ${price.id} (£${s.billingPriceGbp}/mo)`);
  }
  console.log(`Done — ${services.length} plan(s) created.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
