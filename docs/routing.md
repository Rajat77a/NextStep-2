# Routing Notes

The app uses React Router for client-side navigation.

Important route groups:

- Public routes: landing, login, signup
- Parent routes: dashboard and report-card guidance tools
- Teacher routes: dashboard, classes, patterns, settings
- Admin routes: dashboard, classes, students, teachers, subscription, settings

Because this is a single-page app, production hosting needs a fallback rewrite to `index.html`.

