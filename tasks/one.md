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
Triggers fetch the parent's roles on insert and spread them to all lower levels insert/update.

This is efficient to set higher roles at lower levels. But not to give NO roles at lower levels i.e. to prevent a user to read/sync something at lower level.

We need to enable giving a user a role for only part of a project/subproject/place level 1. Take as example a subproject. To work on it this user needs to sync the project itself, so this user needs reader role on that. BUT: we need to be able to prevent this user from reading other subprojects in this project.

The idea is to have '-specific' and '-all' versions of reader and writer roles (it makes no sense to have owners and designers that can only own/design parts of projects).

The fetching/spreading triggers should only run if the parent's role is '-all' or higher than writer. If then role is '-specific', the owner/designer needs to set the childrens roles themselves.

In this way the person giving roles, can exclude certain users from reading/syncing other subprojects by giving the user 'read-specific' at the project level and (for instance) 'writer-all' at the subproject level.

Not syncing lower levels works by user roles not existing below a -specific role. That is already implemented.

So the new roles would be:

CREATE TYPE user_roles_enum AS ENUM ('read-specific', 'read-all', 'write-specific', 'write-all', 'design', 'own')

Implementation:

1. change role definition
2. check all usages of roles and rename them (where used in code), add and rename/re-translate where used in the ui

---

We will later have to:

- Check sync where clauses to ensure a row is NOT synced, if parent role is -specific. This is not needed. It is ensured by not having a role
- Update triggers to only run if parent is -all (or design or own)
- Create triggers that REMOVE lower level roles if this level's role is set to -specific
- Inform user in the ui that this happened
- Check other roles usage in code?
- Update the docs (/docs/user-roles)

---

---

---

---

---

---

---

---
