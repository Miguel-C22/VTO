# Component Security Audit

Audit React components and Shadcn UI usage for security issues:

**Component Security:**

1. Check for XSS vulnerabilities in form inputs
2. Review data sanitization in components
3. Check for unsafe props usage (dangerouslySetInnerHTML)
4. Validate user input handling

**Shadcn Components:**

1. Review custom Shadcn component modifications
2. Check for proper prop validation
3. Validate accessibility implementations
4. Review styling and Tailwind usage

**Form Security:**

1. Check form validation (client and server-side)
2. Review CSRF protection
3. Validate file upload security
4. Check for proper error handling

**State Management:**

1. Review sensitive data in component state
2. Check for data exposure in props
3. Validate local storage usage
4. Review session data handling

**Target Components:** $ARGUMENTS (if no arguments, scan all components)

Provide specific security improvements for each component.
