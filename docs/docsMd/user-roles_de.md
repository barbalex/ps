# Benutzer-Rollen

TODO:

1.  User owns own user row, related accounts, projects and other data
2.  Roles are (from high to low): owner, designer, writer, reader
3.  Projects, subprojects and places have `..._users` tables to set a user's role
4.  A users role always includes all the lower roles. They are not separately set, only a single role is set
5.  (Only) Owners can set designer roles
6.  (Only) Owners and designers can set writer and reader roles
7.  Only triggers set owner roles, users can't
8.  When a role is set, it's effect extends down all relations (n-sides) - even if (which should not happen) it has not been set in a `..._users` table in between.
9.  Setting lower rights at a lower level is not expected. Example: When a user has reader role on project, all its data can be synced without checking lower levels
10. Higher rights can be given at lower levels, their effect extending down as well. Example: A reader who shall be writer on a subproject needs the reader role on its project to sync in parent data
11. Setting lower roles at higher levels after having set higher ones lower down will nuke higher roles at lower levels. That's a problem we will have to live with? Will have to inform users if this happens in projects/subprojects
12. Owners are recognized by the 'owner' role given (the trigger that sets the owner roles uses above definition of what a user owns)