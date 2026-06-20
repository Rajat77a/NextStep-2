# Security Notes

The current implementation is suitable for demo and prototype workflows.

Security considerations before production:

- Replace local-only auth with backend-backed sessions.
- Validate access control server-side.
- Store sensitive data in a real database with appropriate protections.
- Avoid exposing secrets in client-side code.
- Add audit-friendly handling for student-related records.

