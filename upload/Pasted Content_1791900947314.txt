PERMANENT SYSTEM IMPLEMENTATION: GIT-CENTRIC AGENT WITH STORAGE.TO ASSET PERSISTENCE

Mission

Modify the existing agent system so it survives complete runtime/server resets without losing its system instructions, source code, project history, progress, or access to previously generated assets.

Use:

- GitHub/Git: canonical source of truth for system code, instructions, project state, checkpoints, manifests, and recovery logic.
- storage.to: external file hosting for generated videos, audio, subtitles, images, and other large binary assets.
- Disposable runtime: execution environment only. Never treat its local filesystem as the only copy of important work.

This must become a permanent repository-level feature, not a temporary prompt or session-specific behavior.

Inspect the actual repository and runtime before making changes. Preserve existing functionality, dependencies, workflows, and integrations. Implement the changes in the repository that actually controls the agent's startup and execution.

---

1. Mandatory repository inspection

Before modifying anything:

1. Inspect the complete relevant Git repository.
2. Identify the permanent system prompt, agent entry point, task scheduler, project lifecycle, generation pipelines, storage adapters, Git integration, and startup/recovery code.
3. Identify where videos, audio, SRT files, intermediate outputs, and task checkpoints are currently created.
4. Determine how storage.to's current anonymous upload, retrieval, expiration, and deletion APIs actually work.
5. Read the current API documentation before implementing requests. Do not invent endpoints, request parameters, response fields, or API guarantees.
6. Identify existing persistent files and extend them rather than creating competing sources of truth.
7. Write a concise implementation plan and then execute it.

Do not stop after writing documentation.

2. Git is the permanent system of record

All system logic and recoverable project state must be represented in Git.

Maintain the following, adapting names to the existing repository:

- "AGENTS.md" or the existing permanent agent instruction file.
- "memory/CURRENT_STATE.md"
- "memory/PROJECT_REGISTRY.md"
- "memory/SESSION_HANDOFF.md"
- "storage/ASSET_MANIFEST.json"
- "storage/STORAGE_POLICY.md"
- "storage/RECOVERY.md"
- "storage/DELETION_LOG.md"
- "docs/PERSISTENCE_ARCHITECTURE.md"

These files must contain the authoritative state required to recover from a completely empty runtime.

Git must preserve:

- System instructions, source code, configuration templates, and dependency definitions.
- Project IDs, descriptions, status, decisions, task progress, and next actions.
- Asset metadata, filenames, hosting URLs, remote identifiers, verification results, and expiration information when known.
- Recovery checkpoints, outstanding work, failures, and retry information.
- Cleanup status and the history of user-authorized project deletion.

Commit and push meaningful changes to the correct repository branch. Ensure asset manifest updates are committed and pushed immediately after each asset has been successfully uploaded and verified.

Never put access credentials, passwords, tokens, or other secrets in Git, prompts, logs, or manifests.

Do not store large media files in normal Git history.

3. storage.to integration

Use storage.to as the initial anonymous external file-hosting backend.

Official website:
https://storage.to/

API documentation:
https://storage.to/api

Before implementation, inspect the current documentation and confirm:

- Supported upload methods.
- Authentication requirements, if any.
- Supported file sizes and formats.
- Upload response structure and file identifiers.
- How to retrieve uploaded files.
- Whether listing, metadata retrieval, and deletion are supported.
- Retention and expiration rules.
- Rate limits and anonymous upload restrictions.
- Whether uploaded files can be retrieved reliably by direct URL.

Build a small, reusable storage adapter that isolates all storage.to-specific logic from the rest of the agent.

Provide an interface equivalent to:

- "upload_asset(file, metadata)"
- "get_asset_location(asset_id)"
- "download_asset(asset_id, destination)"
- "verify_asset(asset_id, expected_checksum)"
- "check_asset_availability(asset_id)"
- "get_asset_metadata(asset_id)"
- "delete_asset(asset_id)" — only if officially supported.
- "retry_pending_upload(asset_id)"

Implement only operations supported by the actual service API. If an operation is unavailable, document the limitation and implement a safe alternative.

Do not assume storage.to offers permanent storage, private objects, server-side checksums, API deletion, unlimited capacity, or guaranteed availability.

Do not attempt to bypass service limits or use undocumented endpoints.

4. Immediate upload after every completed asset

This is a mandatory part of the real asset-generation pipeline.

Never wait for the session to end or the entire project to complete.

Whenever any individual asset is ready:

1. Detect that generation or processing has finished.
2. Verify that the file exists, is readable, and has the expected format.
3. Compute a SHA-256 checksum and file size locally.
4. Generate a deterministic, descriptive filename.
5. Upload the asset to storage.to immediately.
6. Capture the actual upload response and returned identifier or URL.
7. Verify that the resulting remote asset is retrievable. Download and compare checksums when practical and supported.
8. Update the Git-tracked asset manifest with the actual location, metadata, and verification status.
9. Commit and push the manifest update.
10. Update the project's current state and checkpoint so a new runtime knows the asset is complete and can continue with the next stage.

Do this separately for every completed asset.

Examples:

- Narration audio generated → upload immediately → record location in Git.
- SRT subtitle generated → upload immediately → record location in Git.
- Thumbnail generated → upload immediately → record location in Git.
- Final video rendered → upload immediately → record location in Git.
- Any required scene image or intermediate output completed → persist immediately if it must survive a reset.

Do not regenerate an asset simply because a session was lost.

Failure handling

Maintain explicit states:

- "generated"
- "upload_pending"
- "upload_failed"
- "uploaded_unverified"
- "verified"
- "manifest_pending"
- "persisted"
- "expired"
- "unavailable"
- "restore_pending"
- "restored"

If an upload succeeds but the Git update fails, retry the Git update without uploading the asset again unless necessary.

If the Git update succeeds but the upload fails, mark the asset as pending and retry the upload. Never claim it is persisted.

If verification fails, retry within configured limits and retain any recoverable local copy until the failure is resolved or explicitly reported.

Use bounded exponential backoff, timeouts, and idempotent operations. Avoid creating unnecessary duplicate uploads.

If the host does not support reliable idempotency or searching for prior uploads, document this limitation and record each upload attempt.

5. Naming convention and asset organization

Use stable project IDs and descriptive filenames.

Recommended logical organization:

"projects/{project_id}/video/{filename}"

"projects/{project_id}/audio/{filename}"

"projects/{project_id}/subtitles/{filename}"

"projects/{project_id}/images/{filename}"

"projects/{project_id}/documents/{filename}"

These are logical paths. If storage.to does not support directories or object keys, use the paths as manifest metadata and use the actual returned URL or identifier for retrieval.

Use filenames such as:

- "episode-001-narration-en-v1.wav"
- "episode-001-scene-003-en.srt"
- "episode-001-thumbnail-v2.png"
- "episode-001-final-1080p-v1.mp4"

Use safe characters and avoid ambiguous names. Preserve multiple versions when they are distinct.

Each asset record must include:

- "asset_id"
- "project_id"
- "asset_type"
- "filename"
- "mime_type"
- "size_bytes"
- "sha256"
- "provider"
- "remote_id", when provided
- "remote_url"
- "created_at"
- "uploaded_at"
- "last_verified_at"
- "verification_status"
- "availability_status"
- "retention_policy", when known
- "expiration_at", when officially documented or returned
- "generation_stage"
- "version"
- "dependencies"
- "retry_status"
- "notes"

Never invent a URL, remote ID, checksum, or expiration date.

Treat anonymous-host URLs as potentially public. Do not upload passwords, secrets, private personal documents, or sensitive data.

6. The Git-tracked asset manifest

Maintain one canonical manifest or a clearly defined indexed set of per-project manifests.

Example schema:

{
"schema_version": 1,
"project_id": "example-project-001",
"status": "active",
"assets": [
{
"asset_id": "narration-en-v1",
"asset_type": "audio",
"filename": "episode-001-narration-en-v1.wav",
"provider": "storage.to",
"remote_id": "ACTUAL_ID_FROM_UPLOAD_RESPONSE",
"remote_url": "ACTUAL_URL_FROM_UPLOAD_RESPONSE",
"size_bytes": 0,
"sha256": "ACTUAL_COMPUTED_SHA256",
"verification_status": "verified",
"availability_status": "available",
"created_at": "ACTUAL_TIMESTAMP",
"uploaded_at": "ACTUAL_TIMESTAMP",
"last_verified_at": "ACTUAL_TIMESTAMP"
}
]
}

This is an illustrative schema, not an actual upload record. All runtime values must be computed or returned by the real API.

Store the manifest in Git, not only in memory or on the temporary server.

Avoid concurrent writes that overwrite newer state. Fetch the latest branch, reconcile updates, and handle Git conflicts explicitly.

7. Mandatory startup and recovery procedure

Every new session or runtime must perform these steps before substantive work:

1. Read the permanent system instructions from the canonical Git repository.
2. Fetch the latest committed state and synchronize the appropriate branch safely.
3. Read "memory/CURRENT_STATE.md".
4. Read "memory/PROJECT_REGISTRY.md".
5. Read "memory/SESSION_HANDOFF.md".
6. Load the relevant project checkpoint and asset manifest.
7. Determine the active project, current task, completed stages, pending stages, and next action.
8. Check availability of assets needed for the next stage.
9. Download required assets to the runtime.
10. Verify restored files against their recorded checksums.
11. Resume from the latest valid checkpoint.
12. Update and push Git whenever recovery discovers a material state change.

Do not assume that an empty local filesystem means there is no previous work.

Do not regenerate assets that are already available and verified.

If an asset has expired or is unavailable, mark it accordingly in Git, report the loss accurately, and regenerate only the missing asset if the source inputs and project state permit it.

Do not blindly download every project asset on startup. Retrieve only what is needed for the next task, while preserving a complete manifest of all known assets.

8. Retention and anonymous-host limitations

storage.to is being used without an account. Therefore, design the system to tolerate expiration or deletion.

1. Record any documented or API-returned expiration information.
2. Recheck important asset availability before relying on it.
3. Use short verification intervals for assets required by active projects, within reasonable service limits.
4. Never infer permanence merely because an asset uploaded successfully.
5. Avoid repeated polling that wastes resources or violates rate limits.
6. Record availability failures and recovery actions in Git.
7. When a critical asset is at risk of expiring, prioritize restoring it or creating an additional permitted copy.
8. If a file cannot be recovered, report it instead of fabricating a successful restoration.

Use storage.to as the initial backend, but design the adapter so a different provider can be added later without changing the generation pipeline or manifest schema.

Do not introduce a paid service or require a payment card as part of this implementation.

9. Continuous checkpointing

Maintain recoverable state throughout execution.

Checkpoint after:

- Every asset is uploaded and verified.
- Every asset manifest update is committed and pushed.
- Every significant research or implementation milestone.
- Every completed task stage.
- Every major decision affecting project architecture.
- Any change in the next action or recovery requirements.
- Before risky or destructive operations.

"memory/SESSION_HANDOFF.md" must contain a concise handoff including:

- Active project ID.
- Current task.
- Completed work.
- Verified asset IDs.
- Pending uploads or Git updates.
- Known missing or expired assets.
- Current blockers.
- Exact next action.
- Relevant commit SHA.

Persist meaningful state transitions, not every internal thought.

10. User-confirmed project cleanup

A project is not eligible for deletion merely because the agent believes the work is finished.

When the project appears complete:

1. Verify the requested deliverables.
2. Verify the availability of their remote assets.
3. Update the project status to "awaiting_user_confirmation".
4. Report the deliverables and their locations.
5. Wait for explicit user confirmation and authorization to delete the project's cloud assets.

After the user explicitly authorizes cleanup:

1. Identify the exact project ID and its associated assets.
2. Confirm the deletion scope contains only assets belonging to that project.
3. Delete those assets only through officially supported operations.
4. If storage.to does not support deletion, explicitly report that remote deletion cannot be guaranteed. Do not claim that removing a Git manifest entry deletes the hosted files.
5. Verify deletion where supported.
6. Update the Git-tracked manifest and project registry to indicate the actual cleanup result.
7. Record the project ID, date, scope, and result in "storage/DELETION_LOG.md".
8. Commit and push the final Git state.

Retain a minimal project history and cleanup record in Git. Do not retain stale asset links as if deleted or expired assets remain accessible.

Never delete shared assets, system instructions, the canonical Git repository, or another project's assets as part of project cleanup.

11. Testing requirements

Implement and run tests for:

- Successful anonymous upload.
- Actual response parsing and URL/ID recording.
- Retrieval and checksum verification.
- Immediate persistence of audio, SRT, images, and video outputs.
- Git manifest update and push after each asset.
- Restart recovery from an empty runtime.
- Restoration of a previously uploaded asset.
- Interrupted uploads and interrupted Git updates.
- Retry behavior without unnecessary duplication.
- Missing or expired assets.
- Rate limits, network errors, malformed responses, and oversized files.
- Concurrent manifest updates.
- User-confirmed cleanup and deletion limitations.

Use small disposable test assets. Do not test cleanup by deleting production project files.

Do not report a test as passed unless it was actually executed and its result was checked.

12. Completion criteria

The implementation is complete only when:

- Permanent system instructions are committed to Git.
- The actual generation pipeline uploads each completed asset immediately.
- The manifest is committed and pushed after each successful asset upload.
- A fresh runtime can discover and download a prior asset from the manifest.
- The agent resumes from the correct task checkpoint without regenerating completed assets.
- Missing or expired assets are detected and handled accurately.
- Project cleanup requires explicit user authorization.
- All service limitations are documented.
- Actual test results and the final commit SHA are reported.

Begin by inspecting the actual repository, then implement, test, commit, and push. Do not merely provide another plan or prompt. Report any manual setup that remains necessary, and never claim the system is complete until the acceptance criteria have been verified.

PERMANENT SYSTEM AMENDMENT: UNIVERSAL ASSET PERSISTENCE AND INDEPENDENT PROJECT RELEASES

Implement these requirements in the actual repository code, permanent system instructions, asset-handling pipeline, and project lifecycle. These are system-wide rules, not temporary session instructions.

1. Universal asset persistence — downloaded AND generated

Every asset the agent downloads or creates that is retained, used, or produced as part of a project must be saved to storage.to immediately.

This includes, but is not limited to:

- Downloaded source videos and audio.
- Downloaded reference images, documents, and other project inputs.
- Generated images, scene assets, and thumbnails.
- Generated narration, audio tracks, sound effects, and music.
- Generated SRT subtitles and other subtitle files.
- Intermediate outputs needed to resume a project.
- Rendered videos, final audio, and other deliverables.
- Transformed, edited, extracted, or converted versions of existing assets.

Mandatory workflow

For every downloaded or generated asset:

1. Detect the successful download or completion of generation.
2. Validate the file and compute its size and SHA-256 checksum.
3. Assign a stable asset ID and a descriptive filename.
4. Upload the file to storage.to immediately.
5. Verify that the uploaded asset is retrievable and matches the expected checksum where practical.
6. Record its actual URL or remote identifier, checksum, project ID, asset type, and status in the canonical Git-tracked asset manifest.
7. Commit and push the manifest update.
8. Continue processing once the asset is safely persisted, or explicitly mark the asset as pending if a failure requires retrying.

Do not wait for session closure, the next project milestone, final rendering, or project completion.

Integrate these steps into the actual download and generation functions. Do not rely on the agent remembering to upload files manually.

Failure handling

- If upload fails, retry safely and preserve any recoverable local copy.
- If upload succeeds but the Git update fails, retry the Git update without unnecessarily uploading the same asset again.
- If the asset becomes unavailable, update its status in Git and recover or regenerate it when possible.
- Never report an asset as persisted until the required upload and manifest operations are verified.
- Do not silently skip an asset because it was downloaded rather than generated.

Respect service limits and applicable copyright, licensing, privacy, and access restrictions. Do not upload secrets or files the agent is not authorized to retain.

2. Per-project asset isolation

Every project must have its own stable project ID and independent asset manifest.

The manifest must distinguish:

- Downloaded source assets.
- Generated intermediate assets.
- Final deliverables.
- Assets required for recovery.
- Assets that are pending, verified, unavailable, or expired.

Use storage.to's actual returned URLs and identifiers. Do not assume the service supports folders, permanent retention, or deletion unless its documented API confirms it.

A project must be recoverable without relying on files left on the temporary runtime filesystem.

3. Release every completed project independently

A project must be published as soon as that individual project is completed and verified. It must not wait for another project to finish.

When a project reaches final completion:

1. Verify that all requested deliverables exist.
2. Verify that every required asset has a valid manifest entry and an accessible remote location.
3. Confirm that the project is independently complete and ready for release.
4. Create a dedicated GitHub Release for that project in the appropriate repository.
5. Use a stable, unique release tag, such as "project-<project-id>-v1.0.0", or follow the repository's existing tagging convention.
6. Include a release description with the project summary, deliverables, asset inventory, checksums, and relevant storage.to URLs.
7. Attach appropriate small deliverables directly to the GitHub Release when suitable and within GitHub's current documented limits. Do not put oversized media into ordinary Git history.
8. Ensure the release points to the correct committed project state and manifest.
9. Verify that the release and its referenced deliverables are accessible.
10. Update the project registry to "released" and record the release URL, tag, commit SHA, and timestamp in Git.

Use the official GitHub Releases API or the repository's existing release mechanism. If the available integration cannot create releases, implement the capability through the project's configured GitHub credentials or workflow, without exposing tokens.

Do not create a release for an incomplete project. If required assets are unavailable, release verification fails, or the GitHub API fails, record the actual state and retry safely.

4. Project completion must not block other projects

Maintain independent project states, manifests, checkpoints, and release operations.

For example:

- Project A is complete → verify and release Project A immediately.
- Project B is still generating narration → continue Project B independently.
- Project C is downloading reference assets → persist those assets immediately and continue Project C.
- Project D encounters a storage failure → mark its affected assets pending without blocking unrelated projects unnecessarily.

Never use a single global "all projects complete" condition to trigger releases.

A release for one project must not depend on the completion of another project or the end of a session.

Use project-specific locks or concurrency-safe updates to prevent releases and manifest changes from interfering with each other.

5. Release and deletion are separate operations

Publishing a project is not permission to delete its assets.

After release:

- Preserve its asset manifest and release metadata.
- Keep its hosted assets available while the project remains retained.
- Continue detecting missing or expired assets.
- Wait for explicit user confirmation and authorization before performing the existing project-cleanup procedure.

If the user authorizes cleanup, update the asset manifest and Git records to reflect the actual deletion outcome. Do not claim that deleting manifest entries removes files from storage.to.

A GitHub Release may preserve project metadata and attached release assets, but it does not guarantee the continued availability of external storage.to URLs.

6. Mandatory repository-level implementation

Inspect the real repository and integrate these requirements into:

- Permanent system instructions.
- Download and import functions.
- Asset generation and processing functions.
- The cloud storage adapter.
- The Git-tracked asset manifest.
- Project checkpoints and recovery logic.
- The project completion state machine.
- The GitHub Release creation workflow.
- Automated tests and operational documentation.

Add or update tests for:

1. Immediate persistence of downloaded assets.
2. Immediate persistence of generated assets.
3. Checksum and URL recording in Git.
4. Recovery of assets after a simulated runtime reset.
5. Independent releases for separate completed projects.
6. Release creation without waiting for other projects.
7. Safe retries after upload, Git, or release failures.
8. Preservation of assets after release until explicitly authorized cleanup.

Inspect the existing architecture first. Preserve current functionality, avoid duplicate sources of truth, implement the smallest reliable solution, and commit and push the changes.

Report the actual files changed, commit SHA, release verification results, failed tests, and any remaining manual setup. Never claim an upload, release, or test succeeded without verifying it.

storage.to
Docs
Search endpoints

Overview
Web
Desktop app
CLI
ShareX
REST API
Accepted file types
Reference
REST API
Upload files, create collections, and manage shares over HTTP. All responses are JSON; no API key is required for anonymous uploads.

Base URL
https://storage.to/api
Copy
33 endpoints · JSON
How uploads work
The storage.to API powers our CLI, desktop app, web uploader, and any third-party client you want to build. The upload flow is three steps:

01 · POST /upload/init
Init
tell us you want to upload a file. We return one or more presigned URLs pointing at our storage edge.
02 · PUT {upload_url}
Upload
PUT your bytes directly to the presigned URL(s). Bytes don't pass through our servers.
03 · POST /upload/confirm
Confirm
tell us the upload finished. We create a File record and hand you a shareable URL.
All endpoints below are relative to this base. Example: POST /upload/init means POST https://storage.to/api/upload/init.

Authentication
Anonymous uploads work without authentication, but with tight limits. Keyless callers are capped at 50 files per rolling 24 hours per device or IP, plus the bandwidth quotas below, and files expire after 3 days.

Authenticating with a free account unlocks:

✓
No daily file cap
✓
No upload bandwidth quota
✓
Uploads attached to your account (visible at /dashboard)
✓
Premium features (permanent files, larger storage)
✓
Ownership-based mutations (delete, set password, change expiry) without needing the visitor-token match
Limits at a glance
No token (anonymous)
Free account token
Paid account token
Files per day
50 / 24 hours
Unlimited
Unlimited
Upload bandwidth
100 GB / 24 hours (500 GB per IP)
Unlimited
Unlimited
Max file size
25 GB
25 GB
100 GB
File expiry
3 days by default, up to 7 via expiry_days
3 days by default, up to 7 via expiry_days
Never (files are permanent)
Storage pool
None (files expire)
None (files expire)
100 GB - 1 TB permanent, by plan
See plans →
There are no monthly quotas - all limits are rolling 24-hour windows or per-minute rate limits. The free plan has no fixed storage pool: every file expires on its own, so nothing accumulates against a quota.

To authenticate, generate a personal API token from your account and send it as a bearer token on every request: You need to be signed in. The full token is shown only once at creation, so copy it somewhere safe. You can revoke a token at any time from the same page. Generate API token →
Authorization: Bearer <token>
Proving ownership
Owner token
Recommended
Every resource-creating endpoint (/upload/init multipart, /upload/confirm, /file/reserve, /collection) returns an owner_token in its response. The token is a signed proof of ownership tied to that specific resource, independent of your IP or visitor token. Tokens live as long as the resource does, are safe to persist, and do not expire independently. A lost token means losing control of that resource (file/collection/upload) - treat them like local passwords.
Authorization: Owner <token>
# or, alongside a Bearer session
X-Owner-Token: <token>
Visitor token
Anonymous clients need a way to prove ownership of their own uploads without an account. We use a visitor token - a random string the client generates once and reuses. Send it with every request: On the web, the token is stored in the visitor_token cookie automatically. The CLI stores it at ~/.config/storageto/token (see CLI docs).
X-Visitor-Token: <random-string>
For mutation endpoints (delete, set password, change expiry), ownership is confirmed if either the visitor token matches or the request comes from the same IP that created the file. Both can be lost (cleared cookies, network changes). The owner token is the preferred proof going forward.

Errors
Errors follow a consistent shape: { "success": false, "error": "…" }

200
OK.
201
Created.
400
Bad request (e.g. collection size limit exceeded).
401
Password required or incorrect.
403
Not authorized (not the owner of the resource).
404
Resource not found or expired.
422
Validation failed, or plan/quota restriction.
429
Rate limit or upload quota hit.
500
Server error. Check status.
Rate limits
All rate limits are per-IP. A 429 response includes standard Retry-After, X-RateLimit-Limit, and X-RateLimit-Remaining headers.

Upload init / confirm / abort
60 / minute
Multipart completion
500 / minute
Multipart part URLs
120 / minute
Batch init / confirm
500 / minute
Status polls (file & collection)
120 / minute
Settings (password, expiry, max-downloads)
30 / minute
Password verification
10 / minute
Collection create
30 / minute
Manage (ready, delete)
60 / minute
Thumbnail upload
120 / minute
ShareX upload
20 / day
App analytics / errors
120 and 60 / minute
Upload quota: anonymous clients have two ceilings running in parallel - 100 GB / 24 h per visitor token and 500 GB / 24 h per IP (the IP ceiling catches tokenless traffic and shared networks). When either is exceeded you'll get a 429 with details. This is an upload quota only - downloads are unlimited and unthrottled.

Upload
8 endpoints
The three-step upload flow for any file, including files over 5 GB (automatically multipart). If you only need a quick screenshot-style upload, see ShareX instead.

POST
/upload/init
60/min
Initiate an upload. For files >50 MB the response is a multipart upload (type: "multipart" field); otherwise a single presigned PUT.

Request body
filename
string · required
Original filename. Max 255 chars.
content_type
string · required
MIME type.
size
integer · required
File size in bytes. Min 1.
Request
Copy
curl -X POST https://storage.to/api/upload/init \
  -H "Content-Type: application/json" \
  -H "X-Visitor-Token: abc123" \
  -d '{
    "filename": "report.pdf",
    "content_type": "application/pdf",
    "size": 2202009
  }'
Response · single upload
Copy
{
  "success": true,
  "type": "single",
  "upload_url": "https://r2.cloudflarestorage.com/...signed...",
  "headers": { "Host": ["..."] },
  "r2_key": "uuid-abc123"
}
Response · multipart
Copy
{
  "success": true,
  "type": "multipart",
  "upload_id": "01HXYZ...",
  "r2_key": "uuid-abc123",
  "part_size": 33554432,
  "total_parts": 4,
  "initial_urls": {
    "1": "https://...",
    "2": "https://..."
  },
  "owner_token": "owner_v1_..."
}
POST
/upload/parts
Owner only
120/min
Request additional part URLs for an in-progress multipart upload. Used when /init returned fewer URLs than you have parts (or they expired).

Request body
upload_id
string · required
The upload_id from /init.
part_numbers
array<int> · required
Part numbers to get URLs for.
Request
Copy
curl -X POST https://storage.to/api/upload/parts \
  -H "Content-Type: application/json" \
  -d '{
    "upload_id": "01HXYZ...",
    "part_numbers": [3, 4]
  }'
Response
Copy
{
  "success": true,
  "part_urls": [
    { "partNumber": 3, "url": "https://..." },
    { "partNumber": 4, "url": "https://..." }
  ]
}
POST
/upload/complete-multipart
Owner only
500/min
Finalize a multipart upload once all parts are uploaded.

Request body
upload_id
string · required
The upload_id from /init.
parts
array · required
Each entry: { partNumber, etag } from the part upload response.
Request
Copy
curl -X POST https://storage.to/api/upload/complete-multipart \
  -H "Content-Type: application/json" \
  -d '{
    "upload_id": "01HXYZ...",
    "parts": [
      { "partNumber": 1, "etag": "\"abc...\"" },
      { "partNumber": 2, "etag": "\"def...\"" }
    ]
  }'
Response
Copy
{ "success": true }
POST
/upload/abort
Owner only
60/min
Cancel a multipart upload and clean up any partial data.

Request body
upload_id
string · required
The upload to abort.
Request
Copy
curl -X POST https://storage.to/api/upload/abort \
  -H "Content-Type: application/json" \
  -d '{ "upload_id": "01HXYZ..." }'
POST
/upload/confirm
60/min
Confirm the upload is complete. This is when we create the File record and return the shareable URL.

Request body
filename
string · required
Original filename.
size
integer · required
File size in bytes.
content_type
string · required
MIME type.
r2_key
string · required
The r2_key from /init.
collection_id
string · optional
Attach to a collection.
crc32
integer · optional
CRC32 checksum for integrity verification.
file_id
string(9) · optional
Fulfil a previously reserved file ID.
Request
Copy
curl -X POST https://storage.to/api/upload/confirm \
  -H "Content-Type: application/json" \
  -H "X-Visitor-Token: abc123" \
  -d '{
    "filename": "report.pdf",
    "size": 2202009,
    "content_type": "application/pdf",
    "r2_key": "uuid-abc123"
  }'
Response
Copy
{
  "success": true,
  "file": {
    "id": "FQxyz1234",
    "url": "https://storage.to/FQxyz1234",
    "filename": "report.pdf",
    "size": 2202009,
    "human_size": "2.1 MB",
    "expires_at": "2026-04-15T12:00:00Z"
  },
  "owner_token": "owner_v1_..."
}
POST
/file/reserve
60/min
Reserve a file ID and shareable URL before the bytes are ready. Useful when you need to hand out a link first and fulfil the upload afterwards. Ownership is bound to your visitor token + IP. Finish the upload later with /upload/init + /upload/confirm, passing file_id to confirm.

Request body
filename
string · optional
Placeholder filename. Defaults to "Pending".
content_type
string · optional
Placeholder MIME type.
Request
Copy
curl -X POST https://storage.to/api/file/reserve \
  -H "X-Visitor-Token: abc123"
Response
Copy
{
  "success": true,
  "file": {
    "id": "FQxyz1234",
    "url": "https://storage.to/FQxyz1234",
    "expires_at": "2026-04-12T18:00:00Z"
  },
  "owner_token": "owner_v1_..."
}
POST
/upload/init-batch
500/min
Batch equivalent of /upload/init, optimised for the web uploader. Initiates up to 250 files in one round-trip.

Used internally by the web uploader. Most clients should prefer single-file /upload/init.

POST
/upload/confirm-batch
500/min
Batch equivalent of /upload/confirm. Confirms many files in one round-trip.

Collections
9 endpoints
A collection groups multiple files under a single share URL (/c/{id}). Up to 10,000 files and 25 GB total.

POST
/collection
30/min
Create a new collection. Attach files afterwards by passing collection_id on /upload/confirm.

Request body
expected_file_count
integer · optional
Hint for auto-marking the collection ready once all expected files have confirmed.
Request
Copy
curl -X POST https://storage.to/api/collection \
  -H "Content-Type: application/json" \
  -H "X-Visitor-Token: abc123" \
  -d '{ "expected_file_count": 3 }'
Response
Copy
{
  "success": true,
  "collection": {
    "id": "ABC123xyz",
    "url": "https://storage.to/c/ABC123xyz",
    "expires_at": "2026-04-15T12:00:00Z"
  },
  "owner_token": "owner_v1_..."
}
GET
/collection/{id}/status
120/min
Poll the state of a collection. Also auto-marks the collection ready if all expected files have confirmed.

Request
Copy
curl https://storage.to/api/collection/ABC123xyz/status
Response
Copy
{
  "success": true,
  "files": [
    /* file objects: id, url, filename, size, ... */
  ],
  "is_uploading": false,
  "file_count": 3,
  "expected_file_count": 3,
  "total_size": 6291456,
  "human_total_size": "6 MB"
}
POST
/collection/{id}/ready
Owner only
60/min
Mark the collection as ready for download. Not usually needed - collections auto-ready once expected_file_count is reached.

DELETE
/collection/{id}
Owner only
60/min
Delete a collection and all its files.

POST
/collection/{id}/password
Owner only
30/min
Set a password on the collection. Requires 4–100 chars.

Request body
password
string · required
4–100 chars.
Request
Copy
curl -X POST https://storage.to/api/collection/ABC123xyz/password \
  -H "X-Visitor-Token: abc123" \
  -d '{ "password": "hunter22" }'
DELETE
/collection/{id}/password
Owner only
30/min
Remove the password from a collection.

POST
/collection/{id}/verify-password
10/min
Check a password. Returns 200 on success, 401 on incorrect password.

Request body
password
string · required
POST
/collection/{id}/expiry
Owner only
Permanent: paid
30/min
Change a collection's expiration.

Request body
days
integer · optional
1–7 days from now, but never later than 7 days after upload (or the current expiry, if later). Omit or null for permanent (premium only).
POST
/collection/{id}/max-downloads
Owner only
30/min
Set a download cap (burn-after-N-downloads). Collection auto-deletes when reached.

Request body
max_downloads
integer · optional
1–1000. Must exceed current download count. null to remove the cap.
Files
8 endpoints
All file-level settings (password, expiry, max-downloads) mirror the collection endpoints. Owner-only.

GET
/file/{id}/status
120/min
Check whether a file is still pending its upload.

Response
Copy
{ "pending": false }
DELETE
/file/{id}
Owner only
60/min
Delete a file immediately.

POST
/file/{id}/thumbnail
Owner only
120/min
Upload a thumbnail image for a video or image file (used on the download page). Max 2 MB.

Request body
thumbnail
image · required
Multipart upload. Max 2 MB.
Response
Copy
{
  "success": true,
  "thumbnail_url": "https://..."
}
POST
/file/{id}/password
Owner only
30/min
Set a password on a file. Requires 4–100 chars.

DELETE
/file/{id}/password
Owner only
30/min
Remove a file's password.

POST
/file/{id}/verify-password
10/min
Verify a file's password.

POST
/file/{id}/expiry
Owner only
Permanent: paid
30/min
Change a file's expiration.

Request body
days
integer · optional
1–7 days from now, but never later than 7 days after upload (or the current expiry, if later). Omit or null for permanent (premium only).
POST
/file/{id}/max-downloads
Owner only
30/min
Cap a file's total downloads. Auto-deletes when reached.

ShareX upload
1 endpoint
One-shot upload endpoint - send a multipart file, get a shareable URL back. No init/confirm dance. Ideal for screenshot tools. Full setup guide at /docs/sharex.

POST
/sharex/upload
20/day
Upload an image or file directly (multipart form, file field). Max 25 MB.

Request
Copy
curl -X POST https://storage.to/api/sharex/upload \
  -F "file=@screenshot.png"
Response
Copy
{
  "success": true,
  "url": "https://storage.to/FQxyz1234",
  "filename": "screenshot.png",
  "expires_at": "2026-04-15T12:00:00Z"
}
Desktop auth
2 endpoints
For signed-in clients, such as the desktop app, that hold a bearer token.

GET
/user
Bearer token
Return the authenticated user.

Request
Copy
curl https://storage.to/api/user \
  -H "Authorization: Bearer <token>"
Response
Copy
{
  "id": 42,
  "name": "Ada",
  "email": "ada@example.com",
  "is_premium": true
}
POST
/auth/logout
Bearer token
Revoke the current access token.

Misc
5 endpoints
Health, quotas and client telemetry.

GET
/health
Liveness check. Returns 200 with { "status": "ok" } when the API worker is serving.

Response
Copy
{ "status": "ok" }
GET
/activity
Live activity stream for the homepage globe. Cached at the edge.

GET
/bandwidth/status
60/min
Current upload quota usage for the caller - used by the CLI and desktop app to show remaining capacity. Response shape differs for authenticated users. Despite the URL name, this tracks upload bytes only; downloads aren't counted.

Response · anonymous
Copy
{
  "success": true,
  "authenticated": false,
  "has_token": true,
  "limit_bytes": 107374182400,
  "limit_gb": 100,
  "used_bytes": 12345678,
  "used_gb": 0.01,
  "remaining_bytes": 107361836722,
  "remaining_gb": 99.99,
  "window_hours": 24
}
Response · authenticated
Copy
{
  "success": true,
  "authenticated": true,
  "plan": "premium"
}
POST
/app-analytics
120/min
Submit a usage event from the CLI or desktop app.

Request body
app
string · required
desktop, cli, or web.
version
string · optional
Client version.
event
string · required
Event name, e.g. upload_complete.
context
object · optional
Extra metadata.
POST
/app-errors
60/min
Submit an error report from the CLI or desktop app. Deduplicated server-side - max 10 of the same error per hour.

Request body
app
string · required
desktop, cli, or web.
type
string · required
Error class/type.
message
string · required
Error message.
stack
string · optional
Stack trace.
version, os, os_version, arch, context
various · optional
Diagnostic metadata.
← Previous
ShareX
Next →
Accepted file types
© 2026 storage.to · Operated by Click Here Digital Ltd
Home
Docs
Help
Privacy
Terms
DMCA
Sitemap


Also give me the final video asap ,it's been three days in one video