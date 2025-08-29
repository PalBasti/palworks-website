// lib/supabase/index.js
// Zentraler Export aller Services
export { supabase, supabaseAdmin, USER_ROLES, SUBSCRIPTION_STATUS } from './supabase.js'

// Addon Services
export {
  getAddonsForContract,
  getAddon,
  calculateAddonPrices
} from './addonService.js'

// Contract Services
export {
  createContract,
  updateContract,
  getContract,
  getContractsByEmail
} from './contractService.js'

// Newsletter Services
export {
  subscribeToNewsletter,
  getNewsletterStatus
} from './newsletterService.js'

// Payment Services
export {
  logPayment,
  updatePaymentLog,
  getPaymentLogs
} from './paymentService.js'
