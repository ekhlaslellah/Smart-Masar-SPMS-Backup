# Smart Masar SPMS — Organizational foundation (Phase 1)

Status: **proposed schema on a feature branch**. **Not applied to the running database; not tested or deployed**.

## Why this change

Keep the organization chart independent of employee names: an organizational unit has positions; a position may be vacant; an employee occupies a position through a dated assignment. Changes to an assignment must not overwrite evaluation history. Administrative reporting lines and lateral collaborations are different relationships.

## New additive Prisma models

| Model | Meaning | Main links |
|---|---|---|
| `OrganizationUnit` | Company/division/department/team, with optional parent unit | Company; self-referencing hierarchy |
| `OrganizationPosition` | Role and responsibilities independent from occupant | Company; unit; parent/supervisor position |
| `PositionAssignment` | Employee-to-position link with start and optional end | Company; User; Position |
| `UnitCollaboration` | Lateral coordination between two units | Company; source and target unit |
| `OrgDelegation` | Time-bound delegation of a named permission and optional scope | Company; grantor; grantee; optional unit |

The existing `User.department`, `User.position`, `User.managerId`, and evaluation data are left untouched for backward compatibility. Do **not** infer that these legacy fields are already synchronized with the new models.

## Required server-side invariants before exposing write APIs

1. Verify `companyId` matches the authenticated company for every referenced Unit, Position, User and Delegation. A foreign key alone does not enforce tenant isolation.
2. Prevent cycles in the unit hierarchy and position reporting tree, and reject self-links.
3. When assigning a position, enforce exactly the adopted policy for concurrent active assignments (e.g., one primary occupant); respect effective dates and acting assignments. Database partial unique indexes may be required for PostgreSQL.
4. Closing an assignment must not delete people, positions, performance agreements or historical reviews. A vacant position is allowed.
5. A lateral collaboration **must never** grant manager-level visibility to employees' reviews.
6. Validate grantor authority, grantee scope, `effectiveFrom <= effectiveTo`, revocation, and explicit permission allowlists. Do not trust roles sent by the browser.
7. Protect write operations with RBAC + scope/ownership checks, log edits in audit trails, and never silently overwrite approved records.

## Safe next steps

1. Back up the current demo database `prisma/dev.db` outside the ephemeral Preview runtime.
2. Decide whether to move to managed PostgreSQL (the reference architecture recommends Supabase) before migrating the schema. Switching providers from SQLite requires deliberate migration, not merely changing `DATABASE_URL`.
3. Verify Prisma schema (`npx prisma validate`) in a local/CI environment with a valid `DATABASE_URL`, then generate and review a migration **against a disposable test database only**.
4. Create idempotent synthetic seed data for executive management and nine proposed departments; use no real employee names and mark all unoccupied roles as vacant.
5. Implement server-side CRUD, authority checks, and tests before creating the interactive React Flow chart editor.
6. Use one demo workflow: strategic goal -> department goal -> employee agreement -> review, preserving audit history.

## Acceptance tests

- Create/update/deactivate a unit and see it in the chart.
- Add a position with no occupant; the vacancy stays visible.
- Reassign a demo user to a new role, preserving the prior assignment.
- Prevent circular managers and cross-company references.
- Distinguish a dotted-line lateral relationship from a reporting line.
- Reject unauthorized API writes and access to other departments' evaluations.
- Confirm persistence after restarting the environment; a browser refresh alone is not sufficient.

## Boundaries

This work belongs **only** to the Smart Masar SPMS demo repository. It does **not** modify `Smart-Masar-Com`, its Google Sheets or SheetDB data, production identities, or the deployed website.

Source specification: https://docs.google.com/document/d/1gZfZ-ah0GIKuGbZg3wpZge6ZDsrUUbY87Xhq_Jhn4JA/edit
