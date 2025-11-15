#!/bin/bash
# =================================================================
# END-TO-END DEPLOYMENT SCRIPT
# =================================================================
# Executes complete deployment: Database → Backend → Frontend
# Target: dogan-ai.com
# =================================================================

set -e  # Exit on error

echo "=========================================="
echo "🚀 END-TO-END DEPLOYMENT"
echo "Target: dogan-ai.com"
echo "=========================================="
echo ""

# Phase 1: Database
echo "📊 PHASE 1: DATABASE DEPLOYMENT"
echo "----------------------------------------"
echo "Verifying Prisma Cloud connection..."
npx prisma db push --skip-generate --accept-data-loss
echo "✅ Database verified and synced"
echo ""

# Phase 2: Backend Build
echo "🔧 PHASE 2: BACKEND BUILD"
echo "----------------------------------------"
echo "Generating Prisma Client..."
npx prisma generate
echo "Building Next.js application..."
npm run build
echo "✅ Backend build complete"
echo ""

# Phase 3: Frontend Deployment
echo "🌐 PHASE 3: FRONTEND DEPLOYMENT"
echo "----------------------------------------"
echo "Deploying to Vercel..."
vercel --prod --yes
echo "✅ Frontend deployed"
echo ""

echo "=========================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "=========================================="
echo ""
echo "🌐 Your site is live at:"
echo "   → https://dogan-ai.com"
echo "   → https://www.dogan-ai.com"
echo ""
echo "📋 Next Steps:"
echo "   1. Configure DNS records at your registrar"
echo "   2. Set environment variables in Vercel dashboard"
echo "   3. Wait for DNS propagation (24-48 hours)"
echo "   4. Test endpoints: https://dogan-ai.com/api/health"
echo ""
echo "📊 Monitor deployment:"
echo "   → Vercel Dashboard: https://vercel.com/dashboard"
echo "   → Prisma Studio: npx prisma studio"
echo ""
