# User Roles

TODO:

## Ownership

A user owns their own user row, related accounts, projects and all the data created in these projects.

## Roles

Roles are (from high to low):

1. owner: can set designer roles
2. designer: can edit project- and subproject configuration, set writer and reader roles
3. writer: can edit data
4. reader: can sync and read data

A role always includes all lower roles. They are not separately set, only a single role is set.

The owner role is set by the app itself and can not be changed.

## Where roles are given

Roles are given at four levels:

1. projects,
2. subprojects (species or bitotopes)
3. places (levels 1 and 2, for instance: populations and subpopulations)

## How roles work

When a role is set, it's effect extends down all relations (n-sides) - even if (which should not happen) it has not been set in a `..._users` table in between. The app ensures this with the help of triggers.

Example: When user test@test.ch is given the writer role on the project, the app automatically gives this user writer roles in all subprojects and places.

5.  Setting lower rights at a lower level is not expected. Example: When a user has reader role on project, all its data can be synced without checking lower levels
6.  Higher rights can be given at lower levels, their effect extending down as well. Example: A reader who shall be writer on a subproject needs the reader role on its project to sync in parent data
7.  Setting lower roles at higher levels after having set higher ones lower down will nuke higher roles at lower levels. That's a problem we will have to live with? Will have to inform users if this happens in projects/subprojects
8.  Owners are recognized by the 'owner' role given (the trigger that sets the owner roles uses above definition of what a user owns)
