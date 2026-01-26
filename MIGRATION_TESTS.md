# MIGRATION_TESTS: Supabase Authentication

Please perform the following tests to verify the authentication migration:

## 1. Local Fallback (Existing Users)
- [ ] Attempt login with existing credentials from `localStorage` (e.g., `juan` / `pass123`).
- [ ] Verify access to the designated dashboard based on role.
- [ ] Verify that `localStorage.getItem('currentUser')` is correctly set.

## 2. Supabase Authentication (Real Users)
- [ ] Create a user in Supabase Auth (Dashboard -> Authentication -> Add User).
- [ ] Create a corresponding entry in the `profiles` table with the same UUID.
- [ ] Attempt login with the new Supabase credentials.
- [ ] Verify access and profile loading.

## 3. Session Persistence
- [ ] After a successful Supabase login, reload the page.
- [ ] Verify that the session is maintained and the user remains logged in.
- [ ] Repeat the test with a localStorage login.

## 4. Logout Flow
- [ ] Click the logout button.
- [ ] Verify that you are redirected back to the `Landing` screen.
- [ ] Verify that `localStorage.btn('currentUser')` is cleared.
- [ ] If logged in via Supabase, verify the session is closed in the Supabase Dashboard.

## 5. Security & Errors
- [ ] Attempt login with incorrect credentials.
- [ ] Verify the "Usuario o contraseña incorrectos" message.
- [ ] Verify that multiple roles (Admin, Coordinator, Participant) redirect correctly.
