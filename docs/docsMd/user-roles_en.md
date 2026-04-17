# User Roles

## Ownership

A user owns their own user row, related accounts, projects and all the data created in these projects.

## Roles

Role types are (from high to low):

1. owner: can set designer roles
2. designer: can edit project- and subproject configuration, can set writer and reader roles
3. writer: can edit data
4. reader: can sync and read data

A role type always includes all lower role types. They are not separately set, only a single role needs to be set per level.
A role is the combination of user and role.

## Where roles are given

Roles are given at four levels:

1. projects
2. subprojects (species or biotopes)
3. places (levels 1 and 2, for instance: populations and subpopulations)

## How roles work

When a role is set, it's effect extends down all levels. The app automatically sets all lower level roles.

Example: When user test@test.ch is given the writer role on the project, the app automatically gives this user writer roles in all subprojects and places.

Setting lower rights at a lower level is not supported. Example: When a user has reader role on project, all it's data can be synced without checking lower levels.

Higher rights can be given at lower levels, their effect extending down as well. Example: A reader who shall be writer on a subproject needs the reader role on its project to sync in parent data without which he couldn't work.

## How to set roles

Owner roles are set automatically by the app and can't be changed.

It is important to know that when you set roles, the app automatically copies this role to all lower levels. Setting lower roles at higher levels after having set higher ones lower down will lead to the roles at lower levels getting nuked. Thus **roles should be set from top (projects) to bottom (subprojects, places level 1, places level 2)**.

On the other hand you only have to set roles on (potentially numerous) lower levels if you explicitely want to differentiate there. If not, you can simply forget about them.

When creating new subprojects and places, the app automatically copies down the roles from the next higher level. So you only have to set them if they explicitely should differ.
