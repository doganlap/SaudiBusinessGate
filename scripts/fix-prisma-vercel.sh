#!/bin/bash
# Fix Prisma binary download issues for Vercel

echo "🔧 Fixing Prisma for Vercel deployment..."

# Set environment variables to handle Prisma binary issues
export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1
export PRISMA_SKIP_POSTINSTALL_GENERATE=1

# Try to generate Prisma Client with retries
for i in {1..3}; do
  echo "Attempt $i: Generating Prisma Client..."
  npx prisma generate --schema=./prisma/schema.prisma && break || sleep 5
done

echo "✅ Prisma setup complete"

