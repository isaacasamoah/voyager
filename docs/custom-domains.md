# Custom Domain Setup for Communities

Voyager supports custom domains for communities, allowing organizations to white-label their community experience.

## How It Works

Custom domains are configured via the community JSON configuration file and routed through Next.js middleware.

### Architecture
```
community.acme.com → Voyager Middleware → /acme-corp
careersy.voyager.ai → Voyager Middleware → /careersy
voyager.ai/careersy → Standard path routing → /careersy
```

## Configuration

### 1. Add Domains to Community Config

Edit `/communities/{community-id}.json`:

```json
{
  "id": "acme-corp",
  "name": "ACME Corp Community",
  "branding": {
    "domains": [
      "community.acme.com",
      "acme.voyager.ai"
    ],
    "hideVoyagerBranding": true
  }
}
```

### 2. DNS Configuration

Point the custom domain to your Vercel deployment:

**For Vercel:**
```
Type: CNAME
Name: community (or @)
Value: cname.vercel-dns.com
```

**For subdomain on Voyager:**
```
Type: CNAME
Name: acme
Value: voyager.ai
```

### 3. Add Domain in Vercel Dashboard

1. Go to Project Settings → Domains
2. Add the custom domain
3. Verify ownership via DNS
4. Wait for SSL certificate provisioning (~5 min)

## Testing Locally

To test custom domains locally:

### 1. Update `/etc/hosts`
```bash
sudo nano /etc/hosts
```

Add:
```
127.0.0.1 test.localhost
127.0.0.1 community.test.localhost
```

### 2. Update Community Config
```json
{
  "branding": {
    "domains": ["community.test.localhost"]
  }
}
```

### 3. Test
```bash
npm run dev
# Visit: http://community.test.localhost:3000
```

## Features

### White-Label Mode
Hide Voyager branding entirely:

```json
{
  "branding": {
    "hideVoyagerBranding": true
  }
}
```

This hides:
- Voyager logo/wordmark
- "Powered by Voyager" footer
- Platform references

### Multiple Domains
Support multiple domains per community:

```json
{
  "branding": {
    "domains": [
      "community.acme.com",      // Production custom domain
      "acme.voyager.ai",          // Voyager subdomain
      "staging-acme.voyager.ai"   // Staging environment
    ]
  }
}
```

## Middleware Logic

The middleware (`/middleware.ts`) handles routing:

1. **Checks hostname** against all community domain configs
2. **Rewrites URL** to community-specific path
3. **Preserves paths** - `/about` becomes `/{community-id}/about`
4. **Skips for** API routes, static files, Next.js internals

## Pricing Strategy

Recommended pricing for custom domains:

| Feature | Community | Professional | Enterprise |
|---------|-----------|--------------|------------|
| Voyager subdomain (*.voyager.ai) | Included | Included | Included |
| Custom domain | +$50/month | +$25/month | Included |
| White-label | Not available | Available | Included |
| Multiple domains | 1 | 3 | Unlimited |

## Example Configurations

### Public Community (Careersy)
```json
{
  "id": "careersy",
  "public": true,
  "branding": {
    "domains": ["careersy.voyager.ai"],
    "hideVoyagerBranding": false
  }
}
```

### Private White-Label Community
```json
{
  "id": "acme-corp",
  "public": false,
  "inviteOnly": true,
  "branding": {
    "domains": [
      "community.acme.com",
      "acme-internal.voyager.ai"
    ],
    "hideVoyagerBranding": true,
    "colors": {
      "primary": "#FF6600",
      "background": "#FFFFFF",
      "text": "#000000"
    },
    "logo": "/logos/acme.svg"
  }
}
```

### Multi-Environment Setup
```json
{
  "id": "startup-inc",
  "branding": {
    "domains": [
      "community.startup.io",           // Production
      "staging.startup.io",             // Staging
      "preview.startup.io",             // Preview
      "startup.voyager.ai"              // Fallback
    ]
  }
}
```

## Troubleshooting

### Domain not routing correctly
- Check middleware.ts is reading domains from config
- Verify domain is added in Vercel dashboard
- Clear browser cache / try incognito

### SSL certificate issues
- Wait 5-10 minutes after adding domain
- Verify DNS propagation: `dig community.acme.com`
- Check Vercel dashboard for certificate status

### Localhost testing not working
- Verify /etc/hosts entry
- Use `.localhost` domain (browsers auto-resolve)
- Restart browser after hosts file change

## Security Considerations

1. **Domain verification** - Only deploy to Vercel-verified domains
2. **SSL enforcement** - All custom domains require valid SSL
3. **DNS hijacking protection** - Monitor domain ownership
4. **Rate limiting** - Apply per-domain, not per-platform

## Future Enhancements

- [ ] Auto-provision SSL certificates
- [ ] Domain analytics per community
- [ ] Automatic subdomain creation
- [ ] Domain transfer between communities
- [ ] Multi-region routing
