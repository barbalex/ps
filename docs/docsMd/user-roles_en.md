# User Roles

*Last updated: 5 May 2026*

---

## Ownership

A user is owner:

- of their own user record,
- of the associated accounts,
- of projects
- and of all data created in these projects.

Owner roles are set automatically by the app and cannot be changed.

## Roles

Roles are listed from high to low:

1. **Owner**: can assign Designer roles
2. **Designer**: can edit all project and subproject configurations, assign Writer and Reader roles
3. **Writer**: can edit all data
4. **Writer (specific)**: can edit data for which they have been assigned this role
5. **Reader**: can sync and read all data
6. **Reader (specific)**: can sync and read data for which they have been assigned this role

A role always includes all lower roles. They are not set separately — only a single role needs to be set per level.

There are _specific_ roles. The others apply _generally_. More on this below.

## Where roles are assigned

Roles are assigned at four levels:

1. Projects
2. Subprojects (species or biotopes)
3. Places level 1, e.g. populations
4. Places level 2, e.g. subpopulations

## How general roles work

When a general role is set, its effect extends to all lower levels. The app automatically sets all lower-level roles.

Higher rights can be granted at lower levels, and their effect also extends downward. Setting lower rights at lower levels is only supported for specific roles.

It is important to know that when setting general roles, the app automatically copies this role to all lower levels. Therefore **general roles should be assigned from top (projects) to bottom (subprojects, places level 1, places level 2)**.

Example: If you give test@test.ch the Reader role on the project, the app automatically gives them Reader roles in all subprojects and places. You can additionally grant them write access on specific subprojects or places.

## How specific roles work

Specific roles are intended for cases where you want to grant a user rights for only part of the data. When a specific role is chosen, roles at the next lower level must therefore be assigned manually (they are not set automatically).

Example: You give test@test.ch the role `Reader (specific)` on a project. You can then grant them differentiated rights at the subproject level: Writer, Reader — or none. If you give them no rights on a subproject, they will not see that subproject.

## Users need rights all the way up

It is not enough to give a user who should work on a subproject write access on that subproject alone. They need the Reader role on the parent project in order to sync parent data, without which they could not work.
