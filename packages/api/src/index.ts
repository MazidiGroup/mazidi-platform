/**
 * @mazidi/api — SERVER barrel (services import Prisma).
 * Client components must import validation schemas from "@mazidi/api/schemas",
 * never from this barrel, or @prisma/client leaks into the browser bundle.
 */
export {
  leadInputSchema, type LeadInput,
  invoiceCheckoutSchema, type InvoiceCheckoutInput,
  subscribeSchema, type SubscribeInput,
  leadStatusSchema, type LeadStatusInput,
  dealStageSchema, type DealStageInput,
  taskCreateSchema, type TaskCreateInput,
  taskStatusSchema, type TaskStatusInput,
  dealCreateSchema, type DealCreateInput,
  LEAD_STATUSES, DEAL_STAGES, TASK_STATUSES, TASK_PRIORITIES,
  LEAD_TRANSITIONS, type LeadStatusValue,
  companyCreateSchema, type CompanyCreateInput,
  companyUpdateSchema, type CompanyUpdateInput,
  serviceAddSchema, type ServiceAddInput,
  membershipSchema, type MembershipInput,
  PILLAR_VALUES, COMPANY_STATUSES, GRANTABLE_ROLES,
  aiChatSchema, type AiChatInput,
  automationToggleSchema, type AutomationToggleInput,
} from "./schemas";
export { listLiveCompanies, getCompanyBySlug, listPosts, listFeaturedTestimonials } from "./services/companies";
export { captureLead, LeadCaptureError } from "./services/leads";
export {
  ensureCustomer, getDashboard, listInvoices, listProjects, listDocuments,
  listNotifications, markAllNotificationsRead,
} from "./services/portal";
export {
  BillingError, getStripe, ensureStripeCustomer,
  createInvoiceCheckout, createSubscriptionCheckout, createBillingPortalSession,
  getBillingOverview, handleStripeEvent, reconcileCheckoutSession,
} from "./services/billing";
export {
  TeamAccessError, ensureEmployee, getTeamDashboard,
  listLeads, updateLeadStatus, listDealsBoard, updateDealStage, createDeal, listLeadIdsWithDeals,
  listTasks, createTask, setTaskStatus, listScopeCompanies,
  type TeamContext, type LeadViewFilter,
} from "./services/team";
export {
  AdminError, requireAdmin, getAdminOverview,
  adminListCompanies, adminCreateCompany, adminUpdateCompany, adminAddService,
  adminListUsers, adminSetMembership,
  type AdminContext,
} from "./services/admin";
export { runAutomations, listAutomationRules, toggleAutomationRule } from "./services/automations";
export { AIError, advisorChat, teamAssistantChat, getConversation } from "./services/ai";
