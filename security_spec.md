# Security Specification - Cocrear Lead Gen

## Data Invariants
1. A lead must always have an `ownerId` matching the authenticated user's UID.
2. A campaign must always have an `ownerId` matching the authenticated user's UID.
3. Timestamps (`createdAt`, `updatedAt`) must be server-side timestamps.
4. Document IDs must be valid strings.

## The Dirty Dozen Payloads

1. **Identity Spoofing**: Create a lead with `ownerId` of another user.
2. **Identity Poisoning**: Use a document ID that is 2MB long.
3. **Malicious Field**: Add `isVerified: true` to a lead document.
4. **Timestamp Fraud**: Set `createdAt` to a date in the past from the client.
5. **Campaign Hijack**: Read another user's campaign.
6. **Lead Scraping**: List all leads in the collection without a user filter.
7. **Type Bomb**: Set `intervalMinutes` to a huge string instead of a number.
8. **Status Bypass**: Directly update a campaign status to 'completed' without any checks.
9. **Orphaned Lead**: Create a lead with a missing category.
10. **Write Gap**: Update `address` but omit `updatedAt` server timestamp.
11. **Social Engineering**: Inject script tags into the `name` field.
12. **Anonymous Write**: Attempt to create a lead without being signed in.

## Test Runner (Simplified Logic)
- All the above must return `PERMISSION_DENIED`.
- `isOwner()` helper must match `request.auth.uid`.
- `isValidLead()` must enforce schema keys.
