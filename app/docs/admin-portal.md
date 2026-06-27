# Admin Portal

The admin portal (`/admin/*`) is used by school coordinators or administrators to manage the school's account, classes, students, and teachers.

## Pages

### Dashboard (`/admin`)

Overview of the school's account:
- Total students, teachers, and classes
- Recent activity summary
- Subscription status banner

### Class Management (`/admin/classes`)

CRUD operations for school classes:
- Create a new class (name, grade level, subject)
- Assign a teacher to a class
- View all classes in a list
- Delete a class

### Student Roster (`/admin/students`)

Manage the school's student records:
- Add a new student (name, class assignment)
- View all students in a searchable list
- Remove a student

### Teacher Management (`/admin/teachers`)

Manage teacher accounts:
- Add a new teacher (name, email, assigned class)
- View all teachers
- Remove a teacher

### Subscription (`/admin/subscription`)

View and manage the school's NextStep·AI subscription:
- Current plan (Free / Pro / School)
- Seats used vs. total
- Renewal date
- Upgrade CTA (links to payment — placeholder in MVP)

### Settings (`/admin/settings`)

Account settings and school profile.

## Data Access

Admins can see:
- ✅ All students, teachers, and classes
- ✅ Aggregated flag data across the school
- ❌ Individual parent notes, conversation scripts, or 30-day plans

## Role Enforcement

`ProtectedRoute` with `allowedRoles={['admin']}` wraps every admin route. Only users with `role === 'admin'` in localStorage can access these pages.

## Related Docs

- [`auth-and-roles.md`](./auth-and-roles.md)
- [`subscriptions.md`](./subscriptions.md)
- [`student-roster.md`](./student-roster.md)
- [`class-management.md`](./class-management.md)
