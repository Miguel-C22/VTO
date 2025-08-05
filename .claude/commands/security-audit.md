# Security Audit Command

Using context7, perform a comprehensive security audit of this Next.js + Supabase application:

**Authentication & Authorization:**

1. Review Supabase Auth implementation for vulnerabilities
2. Check middleware.ts for proper route protection
3. Validate JWT token handling and storage
4. Audit session management and logout flows
5. Check for authentication bypass vulnerabilities

**API Security:**

1. Review all API routes in /api/ directory
2. Check for proper input validation and sanitization
3. Validate CORS configuration
4. Check rate limiting implementation
5. Review error handling to prevent information disclosure

**Environment & Configuration:**

1. Scan for exposed Supabase service role keys
2. Check for hardcoded Resend API keys
3. Validate environment variable usage
4. Review .env files for sensitive data
5. Check for secrets in client-side code

**Next.js Specific:**

1. Review next.config.js security headers
2. Check middleware implementation
3. Validate CSP (Content Security Policy) settings
4. Review server-side rendering security

**Dependencies:**

1. Check package.json for vulnerable dependencies
2. Review Supabase client configuration
3. Check Shadcn component security
4. Audit Resend integration security

**Focus Areas:** $ARGUMENTS

Provide specific remediation steps for each vulnerability found.
