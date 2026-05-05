---
TODO: test passkey on mobile
TODO: test verification of login via email/password: does a banner appear before I verificated?
---

---

Better-Auth, possible extensions:

- Last Login Method: https://better-auth.com/docs/plugins/last-login-method
- payment: https://better-auth.com/docs/plugins/stripe

---

---

roles are now defined as: CREATE TYPE user_roles_enum AS ENUM ('reader', 'writer', 'designer', 'owner').
Triggers fetch the parent's roles on insert and spread them to all lower levels on insert/update. See 'User roles: cascade and inheritance triggers' in /home/alex/Documents/GitHub/ps/backend/db/init/07_triggers.sql.

This is efficient to set higher roles at lower levels. But not to give NO roles at lower levels i.e. to prevent a user to read/sync something at lower level.

We need to enable giving a user a role for only part of a project/subproject/place level 1. Take as example a subproject. To work on it this user needs to sync the project itself, so this user needs reader role on that. BUT: we need to be able to prevent this user from reading other subprojects in this project.

The idea is to have '-specific' and '-all' versions of reader and writer roles (it makes no sense to have owners and designers that can only own/design parts of projects).

When a owner/designer gives a -specific role, he needs to manually set the next lower level's roles.
The fetching/spreading triggers should only run if the parent's role is '-all', edit or own.

Example usage: The person giving roles can exclude certain users from reading/syncing other subprojects by giving the user 'read-specific' at the project level and 'writer-all' at the subproject level.

Not syncing lower levels works by user roles not existing below a -specific role. That is already implemented.

So the new roles would be:

CREATE TYPE user_roles_enum AS ENUM ('read-specific', 'read-all', 'write-specific', 'write-all', 'design', 'own')

Implementation:

1. Update role creation
2. Update triggers to only run if parent is -all (or design or own)
3. Update /home/alex/Documents/GitHub/ps/backend/db/init/12_writePermissionTriggers.sql
4. Check all usages of roles and rename them (where used in code), add and rename/re-translate where used in the ui
5. Create triggers that REMOVE lower level roles if this level's role is set to -specific
6. Inform user in the ui that this happened
7. Check other roles usage in code?
8. Update the docs (/docs/user-roles)

Lets start by implementing 1 to 4. We will go on with 5 later.

---

On to step 5: Create triggers that REMOVE lower level roles if this level's role is set to -specific.
Example: If project_users role is set to 'read-specific', this user's datasets in subproject_users and place_users are removed.
Example 2: If place_users (level 1) role is set to 'write-specific', this user's datasets in place_users (level 2) is removed.

---

On to step 6: Inform user in the ui that this happened
When user chooses in a ...\_users form a ...-specific role, inform him that all lower roles (if existing) have been removed and have to be set manually. Ensure this is translated.

---

On to step 7: are there not yet refactored usages of roles in the code? Or code using the old role names? (writer, reader)?

---

On to step 8: I refactor \_de, then translate, then build

---

---

---

---
