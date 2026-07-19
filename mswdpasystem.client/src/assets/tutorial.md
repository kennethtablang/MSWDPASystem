# MSWD-PA System — User Tutorial & Workflow Guide

**Municipal Social Welfare and Development Office — Caba, La Union**
Beneficiary Profiling and Assistance Management System

This guide explains *who* uses the system, *what* each role is allowed to do, and *how* a real case moves from a walk-in citizen to a released assistance claim. Follow the workflows in order — most modules depend on a step that came before them.

---

## 1. The Four Actors

The system recognises exactly four roles. Your role is assigned at account creation and decides which menu items appear in your sidebar and which API calls the server will accept.

| Role | Who this is in the office | Primary job in the system |
|---|---|---|
| **Admin** | System administrator / MSWDO head of IT | Creates accounts, configures programs and settings, reads the audit trail. Can do everything the other roles can. |
| **MSWDStaff** | Front-desk social workers, encoders, field staff | Registers beneficiaries, builds households, files assistance requests, scans QR codes at release. **Cannot approve anything.** |
| **HeadCoordinator** | Social Welfare Officer / approving authority | Reviews and decides assistance requests, resolves duplicate flags, verifies beneficiary status, pulls reports. **Cannot encode new records.** |
| **Citizen** | The public — self-registered through the website | Views their own linked profile and the status of their own assistance requests. Read-only. |

> **Separation of duties is deliberate.** The staff member who *files* a request can never be the one who *approves* it, and the coordinator who *approves* cannot quietly encode a new beneficiary. This is enforced on the server, not just in the UI.

### 1.1 Role → Module Matrix

| Module | Admin | MSWDStaff | HeadCoordinator | Citizen |
|---|:--:|:--:|:--:|:--:|
| Dashboard | ✅ | ✅ | ✅ | — |
| Beneficiaries — view | ✅ | ✅ | ✅ | — |
| Beneficiaries — register / edit / upload | ✅ | ✅ | ❌ | — |
| Beneficiary status change (Verify / Deactivate) | ✅ | ❌ | ✅ | — |
| Households — view | ✅ | ✅ | ✅ | — |
| Households — create / add members | ✅ | ✅ | ❌ | — |
| Family Links — view & check degree | ✅ | ✅ | ✅ | — |
| Family Links — create / remove | ✅ | ✅ | ❌ | — |
| Assisted Service — walk-in service on a client's behalf | ✅ | ✅ | ❌ | — |
| Assistance — view | ✅ | ✅ | ✅ | — |
| Assistance — file new request | ✅ | ✅ | ❌ | — |
| Assistance — change status (approve/deny/release) | ✅ | ❌ | ✅ | — |
| QR Verification | ✅ | ✅ | ❌ | — |
| Duplicate Flags — review, confirm, reject, **merge** | ✅ | ❌ | ✅ | — |
| Reports | ✅ | ❌ | ✅ | — |
| Messages / Notifications | ✅ | ✅ | ✅ | — |
| User Management (incl. delete) | ✅ | ❌ | ❌ | — |
| Staff Permissions | ✅ | ❌ | ✅ | — |
| Audit Logs | ✅ | ❌ | ❌ | — |
| System Admin — programs & assistance types | ✅ | ❌ | ❌ | — |
| System Parameters — office identity & limits | ✅ | ❌ | ❌ | — |
| My Account — profile & password | ✅ | ✅ | ✅ | ✅ |
| Settings — notification & display preferences | ✅ | ✅ | ✅ | ✅ |
| Help & Guide | ✅ | ✅ | ✅ | ✅ |
| Citizen Portal (`/portal`) | — | — | — | ✅ |

### 1.2 Per-Staff Module Access (fine-grained)

Beyond the role, the **Admin or Head Coordinator** can narrow an individual MSWD Staff member down to a subset of five modules: *Beneficiaries, Households, Assistance Requests, QR Verification, Messages*.

- A staff account with no custom setting has **default access** to all five.
- Once a custom list is saved, the server blocks the removed modules at the API level — hiding the menu item is only cosmetic; the real gate is server-side.
- Go to **Staff Permissions**, tick the modules that staff member needs, and Save. Use *Reset to default* to restore full access.

This is how you give, for example, a purely encoding-focused clerk access to Beneficiaries and Households but not to QR Verification at the release table.

### 1.3 Finding Your Way Around the Sidebar

The sidebar groups menu items into sections. You only ever see sections that contain something you can open, so two people with different roles see different menus.

| Section | Contains |
|---|---|
| **Quick Actions** | Register Beneficiary, New Request, Scan QR, Assisted Service |
| **Overview** | Dashboard |
| **Case Management** | Beneficiaries, Households, Family Links, Assisted Service, Assistance Requests, Duplicate Flags, QR Verification |
| **Communication** | Messages, Notifications |
| **Administration** | User Management, Staff Permissions, System Admin, System Parameters, Reports, Audit Trail |
| **My Portal** | *(Citizens only)* My Dashboard, My Requests, My Profile |
| **Support** | My Account, Settings, Help & Guide — available to everyone |

**Quick Actions** are shortcuts to the three or four things front-desk staff do dozens of times a day, pinned above the menu so they are always one click away.

**Badge counts** appear beside items with work waiting — pending assistance requests, unresolved duplicate flags, unread messages and notifications. When the sidebar is collapsed these become a small gold dot.

The sidebar collapses to icons with the toggle at its foot; the choice is remembered. On phones and small tablets it becomes a drawer opened from the menu button in the header.

---

## 2. Getting Into the System

### 2.1 Staff and coordinators (accounts are created *for* you)

1. The Admin creates your account in **Users → Add User** with your role. Staff accounts are pre-confirmed — no email verification needed.
2. Go to `/login` and sign in with your username (or email) and password.
3. You land on the **Dashboard**.

**Security behaviour you should know:**
- Failed sign-ins are counted. Too many wrong passwords locks the account temporarily; the message tells you how many minutes to wait.
- A deactivated account (`IsActive = false`) cannot sign in at all, even with the correct password. Deactivating in **Users** is the normal way to off-board someone.
- Sessions expire. When your token lapses, the app refreshes silently; if the refresh token is gone you are returned to the login page.
- **Inactivity signs you out.** After a period with no keyboard or mouse activity a dialog appears with a countdown, offering *Stay signed in* or *Sign out now*. If you do nothing, you are signed out and told why on the login screen. The Admin sets the length of this window under **System Parameters → Session timeout**. Activity in any open tab keeps every tab alive.
- Every login is written to the audit trail.

**First seeded administrator:** username `admin`, password `Admin@123456`. Change this password immediately on a live deployment.

### 2.2 Citizens (self-service registration)

1. From the public landing page, choose **Register**.
2. Fill in full name, username, email, contact number, password.
3. The system emails a verification link. **You cannot sign in until you click it** — an unverified account is rejected at login with a message telling you to check your inbox.
4. Click the link → `/verify-email` confirms the account → sign in at `/login` → you land on `/portal`.

**Automatic profile linking:** if MSWD already has a beneficiary record whose email address exactly matches the one you registered with, the system links your account to that record on the spot. Otherwise your portal will show "no linked profile" until staff link it manually (see §4.8). This is intentional — linking a citizen to a welfare record is an identity decision that a human must make.

Forgot your password? Use **Forgot Password** → check email → **Reset Password**.

---

## 3. Admin: Preparing the System (do this first)

A brand-new deployment must be configured before front-desk work begins.

### 3.1 Configure office identity and operational limits

**Sidebar → System Parameters.** Two categories:

*Office Identity* — office name, municipality, address, contact number, email, report header and footer text. These are printed on every generated PDF report, so get them right before anyone pulls a report.

*Operational Limits* —
- **Barangays served** — the comma-separated list that populates the barangay dropdown on registration forms and report filters. Ships pre-loaded with the 17 barangays of Caba.
- **Maximum upload size (MB)** and **allowed file types** — governs what supporting documents staff may attach.
- **Duplicate sensitivity** — how aggressively the system flags possible duplicate registrations.
- **Session timeout** — how long a session may sit idle before the user is warned and signed out (§2.1).
- **Maximum assistance amount** — the ceiling a single request may carry.

Changes take effect across the system as soon as they are saved.

### 3.2 Set up welfare programs and assistance types

**Sidebar → System Admin.** The system seeds six of each:

*Welfare Programs* — Social Pension (SOCPEN), 4Ps, PWD, Solo Parent, Indigent Family Assistance, Calamity Assistance.

*Assistance Types* — Financial, Medical, Burial/Funeral, Educational, Livelihood, Relief.

Add or edit these to match your office's actual offerings. A beneficiary is *enrolled in programs*; an assistance request is *of a type* and optionally *charged to a program*.

### 3.3 Create the staff accounts

**Users → Add User.** Create one account per person with the correct role. Then visit **Staff Permissions** to narrow module access where appropriate (§1.2).

**Removing an account.** Each row has *Deactivate* and a delete (trash) button.

- **Deactivate** is the normal off-boarding action. The person can no longer sign in, but every record and audit entry they produced stays attributable to them.
- **Delete** permanently removes the account, and the system will refuse it whenever that account carries system activity — registered beneficiaries, decided requests, sent messages, QR scans or audit entries. It also refuses deleting yourself or the last active administrator. The error message names exactly what is blocking it.

In practice deletion only succeeds on an account created in error that never did anything. **This is intentional:** deleting a user who has worked in the system would leave the audit trail pointing at nobody.

---

## 4. MSWD Staff: The Front-Desk Workflow

### 4.1 Register a beneficiary

A citizen walks in. **Beneficiaries → Register Beneficiary.**

Capture: name (first, middle, last, suffix), date of birth, sex, civil status, barangay, full address, contact number, email, occupation, monthly income, and the welfare programs to enrol them in.

On save the system:
- Generates a permanent **Client Number** in the format `CABA-2026-0001` — sequential per year. This is the beneficiary's identity for the rest of their life in the system.
- Sets status to **Active**.
- Enrols them in each program you ticked, dated today.
- **Runs duplicate detection** (see next).
- Writes an audit entry naming you as the encoder.

### 4.2 What happens when a duplicate is detected

If an existing beneficiary shares the **same first name, last name, and date of birth**, the system:

1. Sets the new record's status to **Flagged**.
2. Creates a pending **Duplicate Flag** pairing the original and the new record.
3. Shows you a warning on the confirmation screen.

You do **not** resolve this yourself. Continue serving the client, but understand that the record stays Flagged until a Head Coordinator or Admin adjudicates it (§5.3). Flagged records remain visible and usable — flagging is a review signal, not a block.

### 4.3 Attach supporting documents

Open the beneficiary → **Documents** tab → upload. Barangay certificate of indigency, medical abstract, death certificate, school enrolment, valid ID — whatever the assistance type requires. Uploads are constrained by the size and file-type limits set in **System Parameters**. Documents can be downloaded later by any staff role and deleted by encoding roles.

### 4.4 Capture a signature and issue the QR code

On the beneficiary detail page:
- **Signature** — capture the client's signature once; it is stored with the profile and reused on printed acknowledgements.
- **QR Code** — every beneficiary has a QR code encoding their client number. Print it onto the client's ID or claim slip. This is what gets scanned at release day (§4.10).

### 4.5 Build the household

**Households → Create Household.** Register the household with its head and address, then add existing beneficiaries as members. Members can be removed if a composition changes.

Households matter because assistance is frequently assessed per family, not per individual — and because household grouping is what makes "one family claiming twice" visible.

### 4.6 Record family links

**Family Links** records how beneficiaries are related to one another. A household says *who lives together*; family links say *who is related to whom*, which is not the same thing — a daughter who has moved out is still a first-degree relative.

**Why the office needs this.** Related claims are the hardest kind of duplication to catch. Two people with different names and addresses can still be mother and daughter claiming the same one-per-family benefit. Recording the relationship makes that visible.

**To record a link:**

1. Open **Family Links** and search for the beneficiary.
2. Their declared relatives appear on the left; **Possible relatives** appear on the right.
3. On a suggestion, press **Link**, choose the relationship (Spouse, Parent, Child, Sibling, Grandparent, Aunt/Uncle, Cousin, in-laws, Guardian…) and save.

You only enter the relationship once — **the reverse link is recorded automatically.** Recording that Ana is the *Child* of Maria simultaneously records that Maria is the *Parent* of Ana.

**Possible relatives** are suggestions, not facts. The system scores unlinked records on shared surname, middle name, address, barangay, household and contact number, and shows the score with its reasons. A high score means *worth asking about*, never *confirmed*. Always confirm with the client before linking.

**Degree of relationship.** Press the compare icon beside any relative to see how closely two records are related:

- **1st degree** — parent or child
- **2nd degree** — sibling, grandparent or grandchild
- **3rd degree** — aunt/uncle, niece/nephew
- **4th degree** — first cousin

Links through marriage — spouse, in-laws, guardianship — are reported as **"Related by marriage"** with no degree, because affinity carries no degree of consanguinity. This matters wherever eligibility rules are written in terms of degree of relationship.

### 4.7 Assisted service for clients who cannot use the system

Most MSWD clients will never open the citizen portal. Senior citizens, persons with disability, clients who cannot read, and clients with no phone all transact the same way they always have: **they come to the office, and a staff member operates the system for them.**

The system is built for this. Nothing requires the beneficiary to have an account — every function works from a staff account acting on their behalf. **Assisted Service** is where that is recorded.

**Why record it at all?** Because otherwise "staff filed this on behalf of a client" is indistinguishable from "staff filed this on their own." The record of *who was assisted, why, who actually appeared and what ID they presented* is what makes the transaction defensible in an audit and compliant with RA 10173.

**You usually will not open this page at all.** Where a task has its own form, the assisted-service capture is built into that form:

- **Filing a request** — tick *"This client cannot transact for themselves"* on the New Assistance Request page. The reason, who appeared and the acknowledgement are captured with the request, and the two are saved together and linked. The request is then marked **Assisted** and can be filtered as such.

Use the standalone **Assisted Service** page for the tasks that have no form of their own — recording a **release**, an inquiry, or a document hand-over. From a QR scan, the **Record release / representative** button brings you here with the client already selected.

**To use the standalone page:**

1. Open **Assisted Service** (sidebar, or the Quick Action).
2. Search for the client by name or client number. If they are new, register them first, then come back.
3. **What are you doing for them?** — Registration, Profile update, Filing a request, Document submission, Release, or Inquiry.
4. **Why can't they transact themselves?** — Elderly, Person with disability, Cannot read or write, No phone or internet, Medical condition, Could not travel, Language barrier, or Other.
5. **Who appeared at the office?** — the client themselves, or a representative.
6. Tick the **acknowledgement** box once you have told the client (or their representative) what was done on their behalf and they have agreed. You cannot save without this.
7. **Record assisted service.**

**When someone else collects.** A grandmother who cannot travel may send a grandchild. Choose **A representative** and record:

- their full name and relationship to the client
- the ID they presented, and its number

If the client already has **family links** recorded (§4.6), their declared relatives appear as one-tap buttons — pick the grandchild who normally collects instead of retyping the details every visit. This is the main practical payoff of recording family links.

> **Judgement still applies.** The system records what you enter; it cannot tell you whether the person in front of you is genuinely authorised. Follow the office's own rules on authorisation letters and barangay certification. If something feels wrong, refer the case to a Head Coordinator before releasing anything.

Everything recorded here appears in the client's **assisted service history** and in the audit trail, attributed to your account.

### 4.8 Link a citizen account to a beneficiary record

When a citizen registers online but auto-linking didn't fire (different email), staff must link them manually:

1. Open the beneficiary record.
2. Use **Link Candidates** — the system suggests unlinked citizen accounts that plausibly match.
3. Verify identity **in person or against documents**, then confirm the link.

Once linked, that citizen sees their client number, programs, and full request history in their portal. Use **Unlink** if a link was made in error.

> Treat linking as an identity-verification action. A wrong link exposes one person's welfare data to another.

### 4.9 File an assistance request

**Assistance → New Request**, or — faster — press **File request** on the beneficiary's own profile, which carries the client through so you are not searching again for someone you were already looking at.

Select the beneficiary, the assistance type, optionally the welfare program to charge it against, the amount, and the purpose.

If you are filing for a client who cannot transact themselves, tick **"This client cannot transact for themselves"** at the foot of the form and complete the reason, who appeared and the acknowledgement (§4.7). Save once — the request and the assisted-service record are saved together.

The system:
- Generates a **Request Number** like `REQ-2026-00001`.
- Sets status to **Submitted**.
- Opens a status-history trail with "Request submitted."
- **Notifies every Head Coordinator** that a new request is waiting.

Your part is done. You cannot approve your own request — the workflow now sits with the coordinator.

### 4.10 Verify and release at the claim table

On distribution day, open **QR Verification**. There are two ways to identify a client, and both produce the same result.

**Camera scan (the normal way)**

1. Press **Start camera**. The browser asks for camera permission the first time — allow it.
2. Hold the client's card so the QR code sits inside the frame. The scan fires by itself; there is no button to press.
3. On a tablet with two cameras the rear one is chosen automatically. Use **Switch** if it picks the wrong one, and **Stop** when you are done — this releases the camera.

**Manual entry (the fallback)**

Type the client number (e.g. `CABA-2026-0001`) in the field below the camera and press **Verify**. Use this when the office machine has no webcam, when a card is too worn to scan, or when you have a USB barcode scanner — those type into the field like a keyboard, so they work here directly.

**Reading the result**

The panel shows, in order:

1. A green **Verified Beneficiary** banner, or a red **Not Eligible for Release** banner.
2. Name, client number, barangay, contact number and **active program enrolments**.
3. **Assistance history** — every request ever filed for this person, with total amount released, the date of the last release, and how many requests are still pending.

Two warnings can appear above the details, and both mean *stop*:

- **Status is Flagged or Inactive** — do not release. Refer the client to a Head Coordinator.
- **"Already scanned today"** — this client passed a verification point earlier today. Confirm it is not a repeat claim before handing anything over.

**Acting on the result.** Below the details are:

- **Record release / representative** — opens Assisted Service with this client already selected and the service type set to *Release*. Use it whenever someone other than the client is collecting, so who actually walked away with the assistance is on record (§4.7).
- **View Full Profile** and **New Scan**.

Every scan is logged with your name and a timestamp, and written to the audit trail.

> The camera only works over **HTTPS or on localhost** — browsers block it otherwise. If the system is deployed over plain HTTP on the office network, the camera will refuse to start and staff must use manual entry. Raise this with whoever deploys the system.

---

## 5. Head Coordinator: Review, Decide, Report

### 5.1 Review the queue

You are notified whenever staff file a request. Go to **Assistance Requests** and filter by status **Submitted**. Open a request to see the beneficiary, the amount, the purpose, the assistance type and program, and the full status history with who did what and when.

Cross-check the beneficiary's profile and uploaded documents before deciding.

### 5.2 Move a request through its lifecycle

Requests follow this path:

```
Submitted → Under Review → Approved → Released
                        ↘
                          Denied
```

| Status | Meaning | Set by |
|---|---|---|
| **Submitted** | Filed by staff, awaiting a coordinator | System, on creation |
| **Under Review** | A coordinator has picked it up and is assessing | Head Coordinator / Admin |
| **Approved** | Assistance is granted, pending physical release | Head Coordinator / Admin |
| **Released** | Cash or goods handed to the beneficiary | Head Coordinator / Admin |
| **Denied** | Rejected — **a denial reason is required** | Head Coordinator / Admin |

Every transition:
- Stamps the timestamp and *your* user ID against that stage (reviewed-by, approved-by, released-by, denied-by).
- Appends to the status history with your notes.
- **Notifies the staff member who filed it.**
- Writes an audit entry.

Add notes at each step. The status history is the office's defence in any audit or complaint — an approval with no reasoning is a gap.

When denying, write a denial reason the beneficiary can actually be told. It surfaces in the citizen portal.

### 5.3 Resolve duplicate flags

**Duplicate Flags** lists every pending pair the system caught. Open one, compare the two records side by side, then decide:

- **Not a duplicate** — they are genuinely different people who happen to share a name and birthday. The flagged record returns to **Active** — *provided no other pending flag still points at it*. If other flags remain, it stays Flagged until those are cleared too.
- **Confirmed duplicate** — it really is the same person registered twice. The duplicate record is set to **Inactive**; the original remains live. Note in the resolution which record survives and why. **History stays where it is** — anything filed against the retired record remains attached to it.
- **Merge records** — the same person, *and* both records already carry activity.

**Choosing between Confirmed and Merge.** This is the decision that matters:

| Situation | Use |
|---|---|
| The duplicate was created minutes ago and has nothing attached to it | **Confirmed duplicate** |
| Both records have assistance requests, documents or program enrolments | **Merge records** |

Confirming a duplicate that already holds assistance history strands that history on a record nobody will open again — the client's totals will look wrong forever. Merge when in doubt.

**What a merge does.** You pick which of the two records survives — the dialog shows both, and the original is preselected, but *the newer record is sometimes the better one* (it may hold the current address). Everything then moves onto the record you keep:

- every assistance request, document, QR scan log and program enrolment
- the citizen portal account link, unless the surviving record already has one
- any blank field on the surviving record is filled from the retired one; existing values are never overwritten

The retired record is set to **Inactive** rather than deleted, so its client number still resolves if it turns up on an old printed claim slip. Any other pending flag between the same two records closes automatically.

> A merge cannot be undone from the interface. Confirm you have the right pair before committing.

Whichever you choose, your resolution notes and identity are recorded in the audit trail, and a merge additionally records exactly how many records were moved.

Clear this queue regularly. A backlog of Flagged records means front-desk staff are handling ambiguous identities without guidance.

### 5.4 Verify beneficiary status

You (and Admin) can change a beneficiary's status directly:

| Status | Use it when |
|---|---|
| **Active** | Normal, in good standing |
| **Verified** | Identity and eligibility have been confirmed against documents |
| **Flagged** | Under duplicate review — usually set by the system |
| **Inactive** | Deceased, relocated, or confirmed as a duplicate |

Promoting a record to **Verified** after checking documents is what makes the beneficiary list trustworthy for reporting.

### 5.5 Generate reports

**Reports** offers three outputs, each filterable by date range, barangay, program, status, and assistance type:

- **Summary** — headline counts and totals; also exportable as PDF.
- **Beneficiary report** — the profiled population, on screen or as PDF.
- **Assistance report** — requests and disbursements, on screen or as PDF.

PDFs carry the office identity, report header, and the footer notice from **System Parameters** — including the RA 10173 data-privacy notice. Use these for LGU submissions, DSWD reporting, and budget liquidation.

---

## 6. Citizen: The Public Portal

After signing in, a citizen sees three pages:

**Portal Dashboard** — an overview of their linked profile and recent activity.

**My Profile** — client number, full name, barangay, current status, and active program enrolments. If no beneficiary record is linked yet, the portal says so and directs them to visit the MSWD office.

**My Requests** — every assistance request filed on their behalf, with request number, type, program, amount, purpose, current status, the date it was released, and — if denied — the denial reason.

Citizens can also update their account details and change their password under account settings.

> **What citizens cannot do:** file requests online, edit their beneficiary record, see anyone else's data, or see internal notes. Requests are always filed by staff at the office. The portal is a transparency window, not an intake channel.

---

## 7. Cross-Cutting Features

### 7.1 Dashboard

Available to all three staff roles. Shows headline counts — total beneficiaries, requests by status, program distribution — plus charts of trends over time. Use it as your daily starting point.

### 7.2 Notifications

The bell in the header. Generated automatically for:
- A new assistance request filed → all Head Coordinators
- An assistance request status change → the staff member who filed it
- Duplicate flags, QR scan confirmations, system alerts, new messages

Open **Notifications** to see the full list and mark items read.

### 7.3 Messages

Internal staff-to-staff messaging with an inbox and a sent folder. Use it for case coordination — "the Reyes household needs a home visit before I approve REQ-2026-00042" — rather than verbal handoffs that leave no record. Citizens have no access to messaging.

### 7.4 Audit Logs (Admin only)

Every consequential action is recorded: creates, updates, deletes, logins, logouts, views, QR scans, status changes, document uploads, and duplicate resolutions. Each entry captures the user, the action, the entity type and ID, a human-readable description, and a timestamp.

Filter by user, action, entity, or date range. This is the accountability backbone — nothing that touches a beneficiary record happens anonymously.

### 7.5 My Account and Settings

These are two separate pages under **Support**, available to every role.

**My Account** — who you are:
- **Profile** — your own name, email and contact number. Your username and role are shown but cannot be changed here.
- **Password** — change it here. Do this regularly, and immediately if you suspect anyone has seen it.

**Settings** — how the application behaves for you:
- **Notifications** — whether you are alerted about assistance status changes and new messages.
- **Text size** — increases the size of all text. Saved to your account, so it follows you between devices. Useful on shared office machines and for staff who find the default too small.

Both pages change *your* account only. Changing someone else's role or access is done by an Admin in **User Management**.

### 7.6 Confirmations and on-screen messages

**Confirmation dialogs.** Anything destructive or session-ending asks first — signing out, deleting, deactivating, archiving, removing a family link, merging duplicate records. Each dialog states what will happen and what cannot be undone. Read it rather than clicking through: several of these actions have no automatic reversal.

**Toast messages** appear briefly at the top right:

| Colour | Meaning |
|---|---|
| Green | The action succeeded |
| Red | It failed — the message explains why, and stays longer so you can read it |
| Gold | A warning worth your attention |
| Blue | Information, including newly arrived notifications |

Incoming notifications also raise a toast as they arrive, so a coordinator sees a request land without watching the bell. Several at once collapse into a single summary. A notification toast carries a **View** button that opens the related record.

### 7.7 Help & Guide

Also under **Support**, available to every role. It shows:

- **Step-by-step walkthroughs for your role only** — a staff member sees registration and verification, a coordinator sees approvals and merges. You are not shown tasks you cannot perform.
- **Frequently asked questions**, including why an approval button is missing, why a record saved as Flagged, and why the camera will not start.
- **About** — system version, office details and the legal instruments the system operates under.

Point new staff here on their first day; it covers the same ground as this document without leaving the application.

---

## 8. End-to-End: A Complete Case

Aling Maria walks into the MSWD office needing help with hospital bills.

| # | Actor | Action | System result |
|---|---|---|---|
| 1 | **MSWD Staff** | Registers Maria: name, DOB, barangay, income; enrols her in Indigent Family Assistance | Client number `CABA-2026-0142` issued; status **Active**; duplicate check runs clean; audit entry written |
| 2 | **MSWD Staff** | Uploads her barangay indigency certificate and medical abstract | Documents attached to profile |
| 3 | **MSWD Staff** | Captures her signature, prints her QR code onto her client card | QR encodes her client number |
| 4 | **MSWD Staff** | Creates a household record and adds Maria and her three dependents | Household composition on file |
| 5 | **MSWD Staff** | Files an assistance request: Medical Assistance, ₱5,000, "hospital bill for daughter's confinement" | `REQ-2026-00317` created, status **Submitted**; all Head Coordinators notified |
| 6 | **Head Coordinator** | Opens the request, reviews the medical abstract, sets **Under Review** with a note | Timestamp and reviewer recorded; filing staff notified |
| 7 | **Head Coordinator** | Confirms eligibility, sets **Approved** | Approval stamped with coordinator's ID; filing staff notified |
| 8 | **Head Coordinator** | Promotes Maria's profile to **Verified** | Beneficiary record now audit-ready |
| 9 | **MSWD Staff** | On release day, scans Maria's card with the camera at the claim table | Green *Verified* banner; programs and full assistance history shown; no repeat-claim warning; scan logged |
| 10 | **Head Coordinator** | Sets the request to **Released** | Release timestamp recorded; full status history complete |
| 11 | **Maria (Citizen)** | Registers online with the same email used at intake | Auto-linked to `CABA-2026-0142`; sees `REQ-2026-00317` marked Released in her portal |
| 12 | **Head Coordinator** | Month-end: pulls the Assistance Report PDF for Medical Assistance | Submitted to the LGU for liquidation |
| 13 | **Admin** | Spot-checks the audit log for the period | Every step above traceable to a named user and timestamp |

### 8.1 The same case, for a client who cannot use the system

Lola Iska is 81, has no phone, and cannot travel to the office on distribution day. Nothing about the workflow above requires her to have an account — it all runs from a staff account.

| # | Actor | Action | System result |
|---|---|---|---|
| 1 | **MSWD Staff** | Lola Iska visits with her grandson. Staff registers her at the counter | Client number issued; she never touches a keyboard |
| 2 | **MSWD Staff** | Opens **Assisted Service** → service type *Registration*, reason *Elderly*, client present, acknowledgement obtained | Recorded: staff registered her, and why |
| 3 | **MSWD Staff** | Records a **family link**: her grandson as *Grandchild* | Reverse link (*Grandparent*) recorded automatically |
| 4 | **MSWD Staff** | Files a Medical Assistance request on her behalf | Request created; coordinators notified |
| 5 | **MSWD Staff** | Records assisted service for the filing — service type *Filing a request*, reason *Elderly* | The request is flagged **Assisted** and filterable as such |
| 6 | **Head Coordinator** | Reviews and approves as normal | No difference from any other request |
| 7 | **Grandson** | Comes alone on release day — Lola Iska cannot travel | — |
| 8 | **MSWD Staff** | Scans Lola Iska's QR from her card; opens **Assisted Service** → *Release*, **A representative** | Her declared relatives appear as one-tap buttons |
| 9 | **MSWD Staff** | Picks the grandson, records his Barangay ID number, ticks acknowledgement | Recorded: who collected, their relation, the ID presented |
| 10 | **Head Coordinator** | Sets the request to **Released** | Release recorded, with the representative named on the request |
| 11 | **Admin** | Later audit asks "who received this money?" | Audit trail answers precisely: the grandson, as Grandchild, on Lola Iska's behalf, ID recorded, assisted by a named staff member |

Step 11 is the point of the whole feature. Without it, the record would say only that a staff member released assistance — with no trace of who actually walked away with it.

---

## 9. Operating Rules

1. **Never share accounts.** The audit trail is only meaningful if each account maps to one person. A shared login makes every entry it produced worthless as evidence.
2. **Never delete a beneficiary — deactivate.** Welfare history must survive. For staff accounts, deactivation is likewise the normal action; the system will refuse to delete any account that has activity behind it (§3.3).
3. **Resolve duplicate flags promptly, and merge when both records have history.** Every day a flag sits pending is a day staff are guessing about someone's identity — and confirming a duplicate that already holds assistance records strands that history permanently (§5.3).
4. **Always record a denial reason.** The citizen sees it in their portal, and the office needs to be able to justify it.
5. **Write notes on every status change.** "Approved" with no reasoning is an audit finding waiting to happen.
6. **Verify identity before linking a citizen account.** A wrong link is a data-privacy breach under RA 10173.
7. **Scan before releasing.** The QR check is what stops assistance going to the wrong hands, to someone whose record is Flagged or Inactive, or to someone who already claimed today.
8. **Keep System Parameters current.** Report headers, barangay lists, session timeout and amount ceilings feed straight into official documents and daily operation.
9. **Handle beneficiary data as protected personal information.** Household income, disability, and solo-parent status are sensitive under the Data Privacy Act. Access only what your work requires.
10. **Record assisted service every time you act for a client.** The system cannot tell the difference between "I did this for an 81-year-old who cannot read" and "I did this on my own." Only your record can (§4.7).
11. **Never record an acknowledgement that did not happen.** Ticking that box asserts the client agreed to what you did on their behalf. It is the one part of an assisted transaction nobody else can verify afterwards, which is exactly why it must be true.
12. **Verify a representative before releasing to them.** Check the ID against the name, and follow the office's rules on authorisation letters. Recording a representative's details is not the same as confirming they are entitled to collect.

---

## 10. Troubleshooting

| Symptom | Cause | Resolution |
|---|---|---|
| "Invalid credentials or account is inactive" | Wrong password, or the account was deactivated | Check the password; ask an Admin whether the account is active |
| "This account is temporarily locked…" | Too many failed sign-ins | Wait out the stated lockout period, then retry |
| "Please verify your email address first" | Citizen account not yet confirmed | Click the verification link in the registration email; use Forgot Password if it's lost |
| A menu item is missing from the sidebar | Your role doesn't include it, or a coordinator narrowed your module access | Check §1.1; if you need it, request access from the Admin or Head Coordinator |
| "403 Access Denied" on a page | Same as above — the server rejected the call | Don't retry; request the access change |
| New beneficiary saved as **Flagged** | Same first name, last name, and birthday as an existing record | Normal. Leave it — a coordinator will adjudicate the flag |
| Citizen portal says no linked profile | The registration email doesn't match any beneficiary record | Staff must link the account manually after verifying identity (§4.8) |
| Document upload rejected | Exceeds the size limit or the file type isn't allowed | Check **System Parameters** for the current limits |
| Can't change a request's status | You're MSWD Staff — only coordinators and Admins decide | Route it to a Head Coordinator |
| Can't register a beneficiary | You're a Head Coordinator — encoding is a staff function | Route it to MSWD Staff |
| **Camera won't start on QR Verification** | Permission was blocked, or the site isn't on HTTPS/localhost | Allow camera access in the browser; if the site runs over plain HTTP, the browser blocks cameras entirely — use manual entry and raise it with IT |
| "The camera is already in use" | Another application holds the camera | Close the other application (video call, camera app) and press *Try again* |
| Camera shows the wrong view on a tablet | The front camera was selected | Press **Switch** to cycle to the rear camera |
| QR scans but says "not a beneficiary code" | The code isn't a client card — e.g. a product barcode or a random QR | Scan the QR printed on the client card, or type the client number |
| Scan shows **"Already scanned today"** | This client was verified earlier today | Not an error. Check whether they already claimed before releasing (§4.10) |
| Signed out mid-task with a warning dialog | The inactivity window elapsed | Choose *Stay signed in* next time; an Admin can lengthen it under System Parameters |
| Delete refused: "account has system activity" | The account produced records and cannot be removed without breaking the audit trail | Deactivate it instead — the dialog offers this directly (§3.3) |
| Merge button disabled | No surviving record chosen yet | Pick which of the two records to keep (§5.3) |
| Can't save an assisted transaction | The acknowledgement box is unticked, or the client is marked absent with no representative named | Tick the acknowledgement once obtained; name whoever appeared (§4.7) |
| Submit button disabled on a new request | The assisted-service box is ticked but incomplete | Finish the reason, representative and acknowledgement — or untick the box (§4.9) |
| Request saved but a warning says the assisted note was not | The request succeeded; only the assisted record failed | The request is safe. Record the assisted service separately from the Assisted Service page (§4.7) |
| No relatives offered as representatives | This client has no family links recorded yet | Record the link in **Family Links** first (§4.6), or type the representative's details manually |
| "Possible relatives" shows an obvious stranger | Two unrelated people share a surname and barangay — common in a small municipality | Ignore the suggestion. Scores are leads, not facts; only link what the client confirms |
| Degree shows "Related by marriage" with no number | The connection runs through a spouse, in-law or guardian | Correct. Affinity carries no degree of consanguinity (§4.6) |
| A client insists they never received assistance the system shows as Released | It may have been collected by a representative | Check the client's assisted service history — it names who collected and the ID they presented (§4.7) |

---

*System-generated records in this application contain personal data protected under RA 10173 (Data Privacy Act of 2012). Handle all beneficiary information accordingly.*
