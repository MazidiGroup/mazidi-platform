-- Separates the marketing "from" price from the canonical billable price.
--
-- Service.priceFrom is display copy: the website renders "from £950". sync-plans
-- previously turned it into an exact monthly recurring Stripe price, so a
-- "from £950" SEO retainer would have been sold at exactly £950 and a "from
-- £149" bookkeeping plan at exactly £149. Those are floors for a quote, not
-- prices — and Stripe prices are immutable once created, so the mistake is not
-- editable after the fact.
--
-- billingPriceGbp is set deliberately, per service, and is the ONLY field
-- sync-plans reads. Null means "not self-serve sellable — quote it", which is
-- the correct state for every existing service until someone decides otherwise.

ALTER TABLE "Service" ADD COLUMN "billingPriceGbp" DECIMAL(12,2);
