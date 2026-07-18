# Web-Based Profiling and Assistance System for MSWD Caba, La Union — System Requirements Specification (SRS)

**Researcher/Developer:** Justine Grace P. Pajarillo
**Institution:** Universidad de Dagupan, School of Professional Studies, Master in Information Technology
**Deployment Site:** Municipal Social Welfare and Development Office (MSWD), Caba, La Union
**Development Methodology:** Agile — Feature-Driven Development (FDD): Develop an Overall Model → Build a Features List → Plan by Feature → Design by Feature → Build by Feature
**Quality Framework:** ISO/IEC 25010:2011 (functional suitability, performance efficiency, usability, reliability, maintainability, portability)
**Legal/Regulatory Anchors:** RA 11032 (Ease of Doing Business and Efficient Government Service Delivery Act of 2018), RA 10173 (Data Privacy Act of 2012), RA 9994 (Expanded Senior Citizens Act), RA 7277 (Magna Carta for Disabled Persons), RA 8972 (Solo Parents' Welfare Act)

---

## 1. System Overview

The Web-Based Profiling and Assistance System is a centralized, role-based web platform designed for the MSWD of Caba, La Union, consolidating beneficiary profiling, QR code-based identity verification, welfare assistance request tracking, document management, reporting/analytics, and user administration into a single application. It replaces the office's manual, paper-based registration and ledger system, addressing record duplication, slow beneficiary verification, fragmented assistance records, and the inability to generate timely statistical reports. The system serves MSWD Caba's welfare programs, including the Social Pension Program for senior citizens, 4Ps compliance monitoring, solo parent ID processing, PWD assessment/ID issuance, and assistance for indigent families and calamity-affected households.

---

## 2. User Roles (Actors)

| Role | Description | Primary System Interactions |
|---|---|---|
| **Admin** | System-wide configuration and oversight | Manages user accounts, system configuration, category management, performance monitoring |
| **MSWD Staff / Social Welfare Worker** | Front-line beneficiary registration and assistance processing | Registers beneficiaries, captures signatures, scans QR codes, encodes assistance requests, uploads documents |
| **Head Coordinator** | Supervisory oversight of records and staff activity | Reviews audit trail, configures role-based data access, oversees assistance approvals and reports |

---

## 3. Core System Features (Modules)

| # | Feature / Module | Description |
|---|---|---|
| 1 | **User Management Module** | Secure, role-based access for Admin, MSWD Staff, and Head Coordinator; user registration, login authentication, account management, and a comprehensive audit trail of all system activities. |
| 2 | **Client Profiling Module** | Central repository for beneficiary data: digital client registration forms (demographic/socio-economic data), signature capture for ID issuance, household profiling, document upload/storage, QR code generation per beneficiary, and search/filter/retrieval. |
| 3 | **Verification and Validation Module** | Automated duplicate detection algorithms, status tagging indicators, QR code scanning for rapid beneficiary verification, IoT-enhanced verification via real-time logging of QR scan events, and complete per-client assistance history. |
| 4 | **Assistance Management Module** | Encoding, categorization, and tracking of service requests (financial, medical, burial assistance, etc.) with complete status monitoring from submission through release. |
| 5 | **Reporting and Analytics Module** | Daily, monthly, and annual statistical reports in PDF and Excel formats, with data visualizations for beneficiary demographics and assistance distribution trends. |
| 6 | **Document Management System** | Secure, centralized repository for beneficiary requirement documents, organized by client profile. |
| 7 | **Notification and Communication Module** | Status update alerts, internal messaging, and real-time confirmations via QR code verification. |
| 8 | **System Administration Module** | System configuration, category management, and performance monitoring. |

---

## 4. Functional Requirements (FR)

### 4.1 User Management Module

| ID | Requirement |
|---|---|
| FR-1.1 | The system shall allow registered users to log in using a unique username/credential and password. |
| FR-1.2 | The system shall authenticate each user and assign exactly one role: Admin, MSWD Staff, or Head Coordinator. |
| FR-1.3 | The system shall enforce role-based access control (RBAC), restricting access to modules, views, and actions according to the authenticated user's role. |
| FR-1.4 | The system shall allow the Admin to create, update, deactivate, and delete user accounts. |
| FR-1.5 | The system shall allow the Head Coordinator to configure data access permissions aligned to each staff member's designated responsibilities. |
| FR-1.6 | The system shall provide a password reset/recovery mechanism for registered users. |
| FR-1.7 | The system shall automatically generate a timestamped audit trail log of every data entry, modification, and access event performed by Admin, MSWD Staff, and Head Coordinator users. |
| FR-1.8 | The system shall prevent unauthorized users from viewing or editing the audit trail. |
| FR-1.9 | The system shall automatically terminate a user session after a defined period of inactivity. |

### 4.2 Client Profiling Module

| ID | Requirement |
|---|---|
| FR-2.1 | The system shall provide a structured digital registration form for capturing a beneficiary's demographic and socio-economic information. |
| FR-2.2 | The system shall support household-level profiling, associating individual beneficiaries with their household composition. |
| FR-2.3 | The system shall capture a beneficiary's signature digitally as part of the registration process for ID issuance. |
| FR-2.4 | The system shall allow MSWD Staff to upload and store supporting documents associated with a beneficiary's profile. |
| FR-2.5 | The system shall automatically generate a unique QR code for each registered beneficiary upon profile creation. |
| FR-2.6 | The system shall allow MSWD Staff to search, filter, and retrieve beneficiary profiles using defined criteria (e.g., name, program type, barangay). |
| FR-2.7 | The system shall allow authorized users to edit an existing beneficiary profile, with changes recorded in the audit trail. |
| FR-2.8 | The system shall associate each beneficiary profile with the welfare program(s) for which they are registered (e.g., Social Pension, 4Ps, PWD, Solo Parent, Indigent/Calamity Assistance). |

### 4.3 Verification and Validation Module

| ID | Requirement |
|---|---|
| FR-3.1 | The system shall automatically compare newly submitted beneficiary registration data against existing records to flag potential duplicates based on matching identifying fields (e.g., name, date of birth, address). |
| FR-3.2 | The system shall display a status tag/indicator for each beneficiary record (e.g., Active, Flagged for Duplicate Review, Verified). |
| FR-3.3 | The system shall allow MSWD Staff to scan a beneficiary's QR code to retrieve their profile and verify their identity in real time. |
| FR-3.4 | The system shall log every QR code scan event with timestamp, scanning user, and beneficiary reference. |
| FR-3.5 | The system shall display a beneficiary's complete assistance history upon successful QR code verification. |
| FR-3.6 | The system shall allow authorized users to manually resolve a flagged duplicate record by confirming or merging/rejecting the match. |

### 4.4 Assistance Management Module

| ID | Requirement |
|---|---|
| FR-4.1 | The system shall allow MSWD Staff to encode a new welfare assistance request, specifying the beneficiary, assistance type (e.g., financial, medical, burial), and relevant details. |
| FR-4.2 | The system shall categorize assistance requests by type and associated welfare program. |
| FR-4.3 | The system shall track the status of each assistance request through defined stages (e.g., Submitted, Under Review, Approved, Released, Denied). |
| FR-4.4 | The system shall record the date and responsible staff member for each status change of an assistance request. |
| FR-4.5 | The system shall allow the Head Coordinator to approve or deny submitted assistance requests. |
| FR-4.6 | The system shall update a beneficiary's assistance history automatically upon release of an approved request. |
| FR-4.7 | The system shall allow MSWD Staff to view the full assistance request lifecycle (intake through release) for a given beneficiary. |

### 4.5 Reporting and Analytics Module

| ID | Requirement |
|---|---|
| FR-5.1 | The system shall generate daily statistical reports of beneficiary registrations and assistance transactions. |
| FR-5.2 | The system shall generate monthly statistical reports of beneficiary registrations and assistance transactions. |
| FR-5.3 | The system shall generate annual statistical reports of beneficiary registrations and assistance transactions. |
| FR-5.4 | The system shall allow generated reports to be exported in PDF format. |
| FR-5.5 | The system shall allow generated reports to be exported in Excel format. |
| FR-5.6 | The system shall present data visualizations (e.g., charts, graphs) summarizing beneficiary demographics. |
| FR-5.7 | The system shall present data visualizations summarizing assistance distribution trends. |
| FR-5.8 | The system shall allow reports to be filtered by welfare program, date range, and/or barangay. |

### 4.6 Document Management System

| ID | Requirement |
|---|---|
| FR-6.1 | The system shall provide a centralized, searchable repository for beneficiary requirement documents. |
| FR-6.2 | The system shall organize stored documents by individual client profile. |
| FR-6.3 | The system shall allow authorized users to retrieve and view a beneficiary's stored documents. |
| FR-6.4 | The system shall validate uploaded files (e.g., file type and size) before accepting a document submission. |
| FR-6.5 | The system shall restrict document access according to the authenticated user's role. |

### 4.7 Notification and Communication Module

| ID | Requirement |
|---|---|
| FR-7.1 | The system shall generate status update alerts when an assistance request changes status. |
| FR-7.2 | The system shall provide an internal messaging capability between MSWD Staff and the Head Coordinator. |
| FR-7.3 | The system shall generate a real-time confirmation upon successful QR code-based beneficiary verification. |
| FR-7.4 | The system shall display an unread-notification indicator for relevant users. |

### 4.8 System Administration Module

| ID | Requirement |
|---|---|
| FR-8.1 | The system shall allow the Admin to manage system-wide configuration settings. |
| FR-8.2 | The system shall allow the Admin to create, edit, and remove assistance/welfare program categories. |
| FR-8.3 | The system shall allow the Admin to monitor overall system performance indicators. |
| FR-8.4 | The system shall allow the Admin to view system-wide usage and activity summaries. |

---

## 5. Non-Functional Requirements (NFR)

NFRs are organized according to the **ISO/IEC 25010:2011** quality dimensions adopted as the study's usability evaluation framework: functional suitability, performance efficiency, usability, reliability, maintainability, and portability. A dedicated **Security/Compliance** subsection is included given the system's handling of personally identifiable beneficiary data under RA 10173.

### 5.1 Functional Suitability

| ID | Requirement |
|---|---|
| NFR-1.1 | **Completeness:** The system shall implement all functional requirements specified in Section 4 without omission. |
| NFR-1.2 | **Correctness:** Duplicate detection results and assistance status computations shall accurately reflect the underlying beneficiary and transaction data. |
| NFR-1.3 | **Appropriateness:** All system functions shall map directly to a documented operational need identified through stakeholder interviews and workflow observation at MSWD Caba. |

### 5.2 Performance Efficiency

| ID | Requirement |
|---|---|
| NFR-2.1 | **Time Behavior:** Standard page views (dashboards, beneficiary lists) shall load within an acceptable response time (e.g., ≤ 3 seconds) under normal load. |
| NFR-2.2 | **QR Verification Speed:** QR code scanning and beneficiary lookup shall complete within a few seconds to support rapid verification during high-volume distribution events. |
| NFR-2.3 | **Resource Utilization:** Database queries, including duplicate-detection comparisons and report aggregations, shall be optimized (e.g., indexed columns, efficient queries) to minimize server resource consumption. |
| NFR-2.4 | **Capacity:** The system shall support the office's transactional volume, including peak-day loads of approximately 80–120 beneficiary transactions during quarterly social pension releases and year-end welfare program allocations. |

### 5.3 Usability

| ID | Requirement |
|---|---|
| NFR-3.1 | **Learnability:** A first-time MSWD Staff user shall be able to complete beneficiary registration within a defined number of steps without extensive prior training. |
| NFR-3.2 | **Operability:** Each role (Admin, MSWD Staff, Head Coordinator) shall be presented only with navigation options and dashboard widgets relevant to that role. |
| NFR-3.3 | **User Interface Consistency:** The system shall apply a consistent visual design (color scheme, typography, component styling) across all views. |
| NFR-3.4 | **Accessibility for Non-Technical Users:** The interface shall be designed for ease of use by government office staff with varying levels of digital literacy. |

### 5.4 Reliability

| ID | Requirement |
|---|---|
| NFR-4.1 | **Availability:** The system shall be available during MSWD Caba's operating hours (e.g., 99% uptime), including peak distribution days. |
| NFR-4.2 | **Fault Tolerance / Data Integrity:** Database transactions (e.g., assistance status updates, profile edits) shall be atomic and consistent to prevent partial writes. |
| NFR-4.3 | **Recoverability:** The system database shall be backed up on a scheduled basis (e.g., daily) and recoverable within a defined Recovery Time Objective (RTO). |
| NFR-4.4 | **Referential Integrity:** All relational tables shall enforce primary key/foreign key constraints to prevent orphaned or inconsistent records (e.g., an assistance request cannot exist without a valid beneficiary reference). |
| NFR-4.5 | **Audit Trail Reliability:** The audit trail shall capture every relevant data event without gaps, ensuring a complete and tamper-evident activity record. |

### 5.5 Maintainability

| ID | Requirement |
|---|---|
| NFR-5.1 | **Modularity:** The system shall be implemented with clear separation across its eight functional modules (user management, client profiling, verification, assistance management, reporting, document management, notification, system administration). |
| NFR-5.2 | **Reusability:** Common UI elements (e.g., status badges, notification components, QR scan widgets) shall be implemented as reusable components. |
| NFR-5.3 | **Modifiability:** Database schema changes (e.g., new welfare program categories or assistance types) shall be implementable through traceable, incremental migrations. |
| NFR-5.4 | **Testability:** Module logic, including duplicate detection and report generation, shall be structured to support unit testing independent of the UI layer. |
| NFR-5.5 | **Feature-Level Traceability:** Given the FDD methodology, each delivered feature shall be traceable to a specific entry in the features list/product backlog for ongoing maintenance reference. |

### 5.6 Portability

| ID | Requirement |
|---|---|
| NFR-6.1 | **Adaptability:** The system shall function correctly on current versions of major web browsers (e.g., Chrome, Edge, Firefox). |
| NFR-6.2 | **Installability:** The system shall be deployable to a standard web hosting environment with documented setup steps suitable for a municipal LGU's IT infrastructure. |
| NFR-6.3 | **Device Compatibility:** The system shall remain functional across desktop and mobile devices to support both office-based and field-level use by social welfare workers. |

### 5.7 Security and Regulatory Compliance

| ID | Requirement |
|---|---|
| NFR-7.1 | **Authentication Security:** User passwords shall be stored using a secure, salted hashing algorithm — never in plaintext. |
| NFR-7.2 | **Authorization Enforcement:** Role-based access restrictions shall be enforced at the application logic level, not only hidden in the UI, to prevent unauthorized access via direct URL navigation. |
| NFR-7.3 | **Data Transmission:** All client-server communication shall be encrypted via HTTPS/TLS. |
| NFR-7.4 | **Data Privacy Compliance:** Handling of beneficiary personal data shall comply with the Data Privacy Act of 2012 (RA 10173), including reasonable security measures against unauthorized access, loss, or disclosure. |
| NFR-7.5 | **Service Delivery Compliance:** The system's automation of verification and reporting functions shall support the office's compliance with RA 11032 (Ease of Doing Business and Efficient Government Service Delivery Act). |
| NFR-7.6 | **QR Code Data Scope:** QR code-based verification shall operate within the system's internal database only and shall not interface with third-party identity verification services. |

---

## 6. Explicit Scope Boundaries (Out of Scope)

As defined in the study's Scope and Delimitation, the following are explicitly **excluded** from the system:

- Integration with national DSWD electronic case management systems or inter-municipal welfare data-sharing networks
- Interfacing with external government databases (e.g., Philippine Statistics Authority civil registry, PhilSys National ID system)
- Financial processing, disbursement computation, or direct payment gateway integration for welfare fund transfers
- Machine learning-based predictive welfare needs assessment or AI-driven beneficiary eligibility scoring
- QR code interfacing with third-party identity verification services (verification is limited to the system's internal database)
- Generalization or deployment to municipal welfare offices other than MSWD Caba, La Union without further contextual adaptation

---

## 7. Traceability Note

Each functional module in Section 4 corresponds to one of the **eight Core System Features** in Section 3, as explicitly enumerated in the study's Scope and Delimitation. Each NFR category in Section 5 corresponds to one of the six **ISO/IEC 25010:2011** quality dimensions assessed through the study's survey questionnaire, administered to MSWD Caba personnel (Head Coordinator, administrative staff, and field-level social welfare workers) using a five-point Likert scale (5 = Excellent, 1 = Poor) and interpreted via weighted mean analysis.
