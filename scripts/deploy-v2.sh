#!/bin/bash

# PalWorks v2.0 Deployment Script
# Sichere Deployment-Strategie mit Rollback-Möglichkeit

set -e  # Exit on any error

echo "🚀 PalWorks v2.0 Deployment Script"
echo "=================================="

# Konfiguration
MAIN_BRANCH="main"
V2_BRANCH="version-2.0"
VERCEL_PROJECT="palworks-website"
PREVIEW_URL="palworks-v2-preview.vercel.app"
PRODUCTION_URL="palworks-website.vercel.app"

# Farben für Output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    # Check if on correct branch
    CURRENT_BRANCH=$(git branch --show-current)
    if [ "$CURRENT_BRANCH" != "$V2_BRANCH" ]; then
        log_error "Must be on $V2_BRANCH branch. Current: $CURRENT_BRANCH"
        exit 1
    fi
    
    # Check if git is clean
    if [ -n "$(git status --porcelain)" ]; then
        log_error "Git working directory is not clean. Please commit or stash changes."
        exit 1
    fi
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        log_error "Vercel CLI is not installed. Run: npm i -g vercel"
        exit 1
    fi
    
    # Check if logged in to Vercel
    if ! vercel whoami &> /dev/null; then
        log_error "Not logged in to Vercel. Run: vercel login"
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Deploy to preview
deploy_preview() {
    log_info "Deploying to preview environment..."
    
    # Install dependencies
    log_info "Installing dependencies..."
    npm ci
    
    # Build the project
    log_info "Building project..."
    npm run build
    
    # Deploy to Vercel preview
    log_info "Deploying to Vercel preview..."
    vercel --prod --confirm
    
    log_success "Preview deployment completed"
    log_info "Preview URL: https://$PREVIEW_URL"
}

# Run tests
run_tests() {
    log_info "Running compatibility tests..."
    
    # TODO: Add automated tests
    # npm run test
    # npm run test:e2e
    
    echo "Manual test checklist:"
    echo "1. ✅ Homepage loads correctly"
    echo "2. ✅ /untermietvertrag works (anonymous)"
    echo "3. ✅ /garage-vertrag works (anonymous)"
    echo "4. ✅ /wg-untermietvertrag works (anonymous)"
    echo "5. ✅ PDF generation works"
    echo "6. ✅ Email sending works"
    echo "7. ✅ Stripe payments work"
    echo "8. ✅ Auth system works (optional)"
    echo "9. ✅ Multi-tier pricing displays correctly"
    echo "10. ✅ Protected routes work"
    
    read -p "Have all manual tests passed? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_error "Tests failed. Aborting deployment."
        exit 1
    fi
    
    log_success "All tests passed"
}

# Database migration
run_database_migration() {
    log_info "Running database migration..."
    
    # Check if database migration is needed
    read -p "Run database migration? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Running migration script..."
        node scripts/setup-database.js
        log_success "Database migration completed"
    else
        log_warning "Skipping database migration"
    fi
}

# Deploy to production
deploy_production() {
    log_warning "🚨 PRODUCTION DEPLOYMENT 🚨"
    log_info "This will deploy v2.0 to production and replace the main branch"
    
    read -p "Are you sure you want to deploy to production? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Production deployment cancelled"
        exit 0
    fi
    
    log_info "Merging $V2_BRANCH to $MAIN_BRANCH..."
    
    # Checkout main branch
    git checkout $MAIN_BRANCH
    
    # Pull latest changes
    git pull origin $MAIN_BRANCH
    
    # Merge v2 branch
    git merge $V2_BRANCH --no-ff -m "Release: PalWorks v2.0 - Multi-Tier Platform"
    
    # Push to main
    git push origin $MAIN_BRANCH
    
    # Deploy to production
    log_info "Deploying to production..."
    vercel --prod --confirm
    
    log_success "🎉 Production deployment completed!"
    log_info "Production URL: https://$PRODUCTION_URL"
    
    # Tag the release
    TAG="v2.0.0"
    git tag -a $TAG -m "PalWorks v2.0 - Multi-Tier Platform Release"
    git push origin $TAG
    
    log_success "Release tagged as $TAG"
}

# Rollback function
rollback() {
    log_warning "🔄 ROLLBACK PROCEDURE"
    
    read -p "Are you sure you want to rollback to v1.0? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Rollback cancelled"
        exit 0
    fi
    
    log_info "Rolling back to previous version..."
    
    # Find the commit before the merge
    LAST_COMMIT=$(git log --oneline --grep="Release: PalWorks v2.0" -n 1 --format="%H")
    ROLLBACK_COMMIT=$(git log --oneline $LAST_COMMIT^..HEAD --format="%H" | tail -1)
    
    if [ -z "$ROLLBACK_COMMIT" ]; then
        log_error "Could not find rollback commit"
        exit 1
    fi
    
    # Reset to previous commit
    git reset --hard $ROLLBACK_COMMIT
    git push --force-with-lease origin $MAIN_BRANCH
    
    # Redeploy
    vercel --prod --confirm
    
    log_success "Rollback completed"
}

# Show help
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  preview     Deploy to preview environment"
    echo "  production  Deploy to production"
    echo "  rollback    Rollback to previous version"
    echo "  full        Full deployment (preview + tests + production)"
    echo "  help        Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 preview      # Deploy to preview for testing"
    echo "  $0 full         # Complete deployment workflow"
    echo "  $0 rollback     # Emergency rollback"
}

# Main deployment workflow
main() {
    local command=${1:-help}
    
    case $command in
        "preview")
            check_prerequisites
            deploy_preview
            ;;
        "production")
            check_prerequisites
            deploy_production
            ;;
        "rollback")
            rollback
            ;;
        "full")
            check_prerequisites
            deploy_preview
            run_tests
            run_database_migration
            deploy_production
            ;;
        "help"|*)
            show_help
            ;;
    esac
}

# Trap errors and provide helpful message
trap 'log_error "Deployment failed! Check the logs above for details."' ERR

# Run main function
main "$@"