#!/bin/bash

# Script to sync environment variables from .env.production to Vercel
# Usage: ./scripts/sync-env-to-vercel.sh

set -e

echo "🚀 Syncing environment variables to Vercel..."
echo ""

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ Error: .env.production file not found"
    exit 1
fi

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI globally..."
    npm install -g vercel
fi

echo "📝 Reading environment variables from .env.production..."
echo ""

# Read each line from .env.production and add to Vercel
while IFS= read -r line || [ -n "$line" ]; do
    # Skip empty lines and comments
    if [[ -z "$line" ]] || [[ "$line" =~ ^[[:space:]]*# ]]; then
        continue
    fi

    # Extract key and value
    if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
        key="${BASH_REMATCH[1]}"
        value="${BASH_REMATCH[2]}"

        # Remove quotes from value
        value=$(echo "$value" | sed 's/^"\(.*\)"$/\1/')

        echo "⚙️  Setting: $key"

        # Add to Vercel (production environment)
        echo "$value" | vercel env add "$key" production --force
    fi
done < .env.production

echo ""
echo "✅ All environment variables synced to Vercel!"
echo ""
echo "🔄 Triggering a new deployment..."
vercel --prod

echo ""
echo "🎉 Done! Your app should redeploy with the new environment variables."
