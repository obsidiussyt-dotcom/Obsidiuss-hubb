# OBSIDIUSS HUB - Security Specifications

## 1. Data Invariants

1. **Resources**: Only authorized admins can create, update or delete resources. All users can read resources. Download counter increment action is strictly restricted to incrementing `downloadsCount` without altering title/URLs.
2. **Projects & Announcements**: Only authorized admins can create, update, or delete. Public can read.
3. **Discussions**: Only authenticated users with verified email can create a discussion. An author can edit their own discussion title/content if not locked. Pinned and locked flags can only be updated by admins. Users can like discussions (incrementing `likesCount`).
4. **Comments**: Comments belong to a discussion (`/discussions/{discussionId}/comments/{commentId}`). Must reference an existing discussion. Can only be created by authenticated users with verified email. Author can update content. Comments can only be deleted by author or admin.
5. **Users**: Users can only update their own profile (`displayName`, `photoURL`, `bio`, `discordHandle`, `youtubeHandle`). No user can escalate their own `role` field; `role` changes require `isAdmin()`.
6. **Reports & Feedback**: Any user can submit feedback or flag/report content. Only admins can read, update status, or delete reports and feedback.
7. **Admin Registry (`/admins`)**: Only existing admins can read or write to `/admins`. Bootstrapped admin is `obsidiussyt@gmail.com`.
8. **Catch-All Default Deny**: All unspecified paths are denied.

## 2. The Dirty Dozen Attack Payloads

1. **Privilege Escalation in Profile**: Non-admin user attempts `setDoc` with `role: "admin"` on `/users/{uid}`. Rejection expected.
2. **Resource Hijacking**: Non-admin attempts to `create` or `update` a resource download URL to a malicious link. Rejection expected.
3. **Ghost / Shadow Fields Attack**: Attacker injects `{ evilPayload: "0day" }` into discussion creation. Rejection expected via strict schema validation.
4. **Unauthenticated Discussion Creation**: Guest user attempts `create` on `/discussions/{id}`. Rejection expected.
5. **Author Impersonation**: User A sets `authorId: "user-B-uid"` on a new comment. Rejection expected.
6. **Orphaned Comment Write**: Attacker writes to a non-existent discussion ID `/discussions/fake123/comments/{id}`. Rejection expected.
7. **Denial of Wallet Long String Attack**: Attacker attempts to post discussion with 5MB title string. Rejection expected via `title.size() <= 150`.
8. **Feedback/Report Inspection**: Non-admin user attempts to read other users' sensitive feedback or abuse reports. Rejection expected.
9. **Tampering with Locked Discussion**: User attempts to comment or update discussion after `locked: true`. Rejection expected.
10. **Admin List Scraping**: Non-admin attempts `get` or `list` on `/admins`. Rejection expected.
11. **Id Poisoning**: Attacker passes document ID with malicious characters `../../path`. Rejection expected via `isValidId()`.
12. **Tampering with Download Count**: Attacker tries to alter resource price or downloadUrl while simulating a download. Rejection expected via `affectedKeys().hasOnly(['downloadsCount'])`.
