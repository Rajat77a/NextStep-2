# Authentication And Roles

The app uses role-aware routing for parent, teacher, and admin experiences.

Current roles:

- `parent`
- `teacher`
- `admin`

Protected routes redirect unauthenticated users to login. Users with the wrong role are redirected away from portals they should not access.

The current implementation is browser-local and should be treated as a prototype-level auth model until a real backend is introduced.

