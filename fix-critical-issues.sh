#!/bin/bash

# SAAS Critical Issues Fix Script
echo "🚨 Fixing critical SAAS application issues..."

# Step 1: Remove duplicate components
echo "📁 Removing duplicate components..."
rm -f frontend/components/NewLayout.tsx
rm -f frontend/components/NewSidebar.tsx
rm -f frontend/components/Sidebar.tsx
rm -f frontend/components/Topbar.tsx
rm -f frontend/components/UserManagement.tsx

# Step 2: Clean up package.json
echo "📦 Cleaning up dependencies..."
cd frontend
npm uninstall @heroicons/react react-hot-toast react-query

# Step 3: Update import references
echo "🔄 Updating import references..."
find pages/ -name "*.tsx" -exec sed -i 's/NewLayout/Layout/g' {} \;
find pages/ -name "*.tsx" -exec sed -i 's/import.*@heroicons\/react.*;//g' {} \;

# Step 4: Install missing dependencies if needed
echo "📥 Installing required dependencies..."
npm install --save lucide-react sonner swr

# Step 5: Build test
echo "🔨 Testing build..."
npm run build

echo "✅ Critical fixes completed!"
echo "⚠️  Manual fixes still needed:"
echo "   - Update icon imports in pages to use lucide-react"
echo "   - Implement missing API endpoints in backend"
echo "   - Test all pages for functionality"