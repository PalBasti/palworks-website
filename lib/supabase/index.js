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
