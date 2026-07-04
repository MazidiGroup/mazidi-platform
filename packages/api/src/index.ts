/**
 * @mazidi/api — SERVER barrel (services import Prisma).
 * Client components must import validation schemas from "@mazidi/api/schemas",
 * never from this barrel, or @prisma/client leaks into the browser bundle.
 */
export {
  leadInputSchema, type LeadInput,
  invoiceCheckoutSchema, type InvoiceCheckoutInput,
  subscribeSchema, type SubscribeInput,
} from "./schemas";
export { listLiveCompanies, getCompanyBySlug, listPosts, listFeaturedTestimonials } from "./services/companies";
export { captureLead } from "./services/leads";
export {
  ensureCustomer, getDashboard, listInvoices, listProjects, listDocuments,
} from "./services/portal";
export {
  BillingError, getStripe, ensureStripeCustomer,
  createInvoiceCheckout, createSubscriptionCheckout, createBillingPortalSession,
  getBillingOverview, handleStripeEvent, reconcileCheckoutSession,
} from "./services/billing";
