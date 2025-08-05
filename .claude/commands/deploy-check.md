# Deployment Check Command

Pre-deployment security and quality checklist for Next.js + Supabase application:

**Security Verification:**

1. Confirm no Supabase service role keys in client code
2. Verify Resend API keys are server-side only
3. Check all environment variables are properly configured
4. Validate Row Level Security (RLS) policies in Supabase
5. Confirm authentication flows work correctly

**Performance & Build:**

1. Run `npm run build` to check for build errors
2. Check bundle size and optimize if needed
3. Verify all images are optimized
4. Check for unused dependencies

**Configuration Check:**

1. Verify next.config.js production settings
2. Check security headers configuration
3. Validate middleware.ts for production
4. Confirm CORS settings for production domains

**Environment Setup:**

1. Verify production environment variables
2. Check Supabase project configuration
3. Confirm Resend domain authentication
4. Validate any third-party integrations

**Final Tests:**

1. Test authentication flows
2. Test email sending via Resend
3. Test database connections
4. Verify all API routes respond correctly

**Deployment Target:** $ARGUMENTS (default: production)

Provide go/no-go recommendation with specific issues to address.
