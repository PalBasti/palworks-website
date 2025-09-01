// Zentraler Export aller Services
export { supabase, supabaseAdmin } from './supabase'

// Addon Services
export {
  getAddonsForContract,
  getAddon,
  calculateAddonPrices
} from './addonService'

// Contract Services
export {
  createContract,
  updateContract,
  getContract,
  getContractsByEmail
} from './contractService'

// Newsletter Services
export {
  subscribeToNewsletter,
  getNewsletterStatus
} from './newsletterService'

// Payment Services
export {
  logPayment,
  updatePaymentLog,
  getPaymentLogs
} from './paymentService'

// Company / B2B Services
export { 
  createCompany,
  getCompanyById,
  listCompanies,
  updateCompany,
  addCompanyUser,
  listCompanyUsers
} from './companyService'

export {
  createBusinessContract,
  listBusinessContracts,
  updateBusinessContract
} from './businessContractService'

export {
  createTemplate,
  listTemplates,
  deactivateTemplate
} from './templateService'

export {
  createBulkOrder,
  updateBulkProgress,
  listBulkOrders
} from './bulkService'
