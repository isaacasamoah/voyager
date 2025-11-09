# Experiment 004: Magic Link Authentication

**Status:** IN PROGRESS
**Branch:** `lab/magic-links`
**Started:** Nov 9, 2025

---

## Hypothesis

Magic link authentication will provide:
1. Simpler codebase (remove OAuth complexity)
2. Better privacy (no data sharing with Google/LinkedIn)
3. Easier testing (works on all deployments instantly)
4. Better UX (one field, no provider choice)
5. Lower costs at scale

## What We're Building

### Replace OAuth with Email-Based Magic Links

**Current (OAuth):**
- Google OAuth (complex setup, redirect URLs, data sharing)
- LinkedIn OAuth (even more complex, custom JWKS)
- Multiple environment variables
- Deployment-specific configuration

**New (Magic Links):**
- Email-only authentication
- One-time tokens sent via email
- Works everywhere without config changes
- Zero data sharing with third parties

### Technical Approach

**Email Provider:** Resend
- Free tier: 3,000 emails/month
- Excellent deliverability
- Simple API
- Great developer experience

**Flow:**
1. User enters email
2. Server generates secure token (15 min expiry)
3. Email sent with magic link
4. User clicks link → validated → session created

**Security:**
- Tokens expire in 15 minutes
- One-time use only
- Rate limiting: 3 attempts per email per hour
- HTTPS only (no token interception)

## Success Criteria

- ✅ User can log in with just email
- ✅ Email arrives within 30 seconds
- ✅ Token validation works correctly
- ✅ Session created successfully
- ✅ Works on preview deployments without config
- ✅ No OAuth dependencies remain
- ✅ Eli + alpha testers validate UX

## Implementation Plan

### Phase 1: Setup
- [x] Create lab experiment folder
- [ ] Create feature branch `lab/magic-links`
- [ ] Set up Resend account + API key
- [ ] Add EmailProvider to NextAuth config (alongside OAuth)

### Phase 2: Implementation
- [ ] Update `lib/auth.ts` with EmailProvider
- [ ] Update login page UI (`app/(auth)/login/page.tsx`)
- [ ] Add email verification page
- [ ] Test locally with Resend test mode

### Phase 3: Testing
- [ ] Test magic link flow end-to-end
- [ ] Verify email deliverability (inbox, not spam)
- [ ] Test rate limiting
- [ ] Test token expiry
- [ ] Test on preview deployment

### Phase 4: Migration
- [ ] Deploy to staging
- [ ] Test with Eli's community (alpha)
- [ ] Remove OAuth providers if successful
- [ ] Clean up unused OAuth env vars
- [ ] Update documentation

### Phase 5: Cleanup
- [ ] Remove Google/LinkedIn OAuth code
- [ ] Update README with new auth setup
- [ ] Document magic link flow
- [ ] Merge to develop

## Metrics to Track

- Email delivery time (target: <30s)
- Email deliverability rate (target: >99%)
- Failed login attempts (spam/abuse detection)
- User feedback on UX

## Rollback Plan

If magic links don't work:
- Keep OAuth providers in code
- Switch back by removing EmailProvider
- No data migration needed (email stays same)

## Resources

- [Resend Docs](https://resend.com/docs)
- [NextAuth Email Provider](https://next-auth.js.org/providers/email)
- [Magic Link Best Practices](https://postmarkapp.com/guides/transactional-email-best-practices)

## Notes

### Why Now?
- Low user count (easy to migrate)
- OAuth complexity slowing down testing
- Privacy concerns with third-party data sharing
- Preview deployments require OAuth URL updates

### Cost Analysis
- 0-1K users: ~300 logins/month (FREE)
- 1K-10K users: ~3,000 logins/month (FREE)
- 10K-50K users: ~30,000 logins/month ($20/month)
- 50K+ users: Custom pricing (still cheaper than OAuth app fees)

### User Experience
- Familiar pattern (GitHub, Linear, Notion use this)
- No password to remember
- No "which account?" confusion
- Works on any device (click link on phone)

---

## Experiment Log

### Nov 9, 2025 - Experiment Started
- Created lab folder structure
- Documented hypothesis and approach
- Ready to implement
