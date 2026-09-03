# Gemini Reflection Journal

A secure, private reflective journaling and AI mentorship web application powered by **Gemini 3.8 Flash**, **Cloud Firestore**, and **Firebase Authentication**, built for zero-secret client exposure and owner-bound database isolation.

---

## 1. Architecture & Security Invariants

| Layer / Component | Technology | Security Invariant & Responsibility |
| :--- | :--- | :--- |
| **Frontend Client** | React 18, Vite, Tailwind CSS, Lucide Icons | Single-page interface with Obsidian Emerald aesthetic. Never touches API keys or raw service credentials. |
| **User Identity** | Firebase Authentication (Google Sign-In) | Passwordless, federated identity. User identity tokens verify ownership across client operations. |
| **Persistence Database** | Cloud Firestore | Isolated document hierarchies rooted at `/users/{userId}/...`. Enforced by database-level security rules. |
| **Server-Side Proxy** | Node.js, Express, TypeScript | Top-level payload deserialization, null-safe request guarding, and adaptive runtime port resolution. |
| **AI Intelligence** | Gemini 3.8 Flash via `@google/genai` | Empathetic reflections, summaries, brainstorming, and multi-turn chat executed strictly on the backend. |
| **Model Resilience** | Automated Fallback Ladder | Sequential recovery: `gemini-3.8-flash` &rarr; `gemini-flash-latest` &rarr; `gemini-3.1-flash-lite` &rarr; `gemini-3.6-flash` &rarr; `gemini-3.7-flash`. |
| **Secret Management** | Google Cloud Secret Manager | Dynamic injection of `GEMINI_API_KEY` into Cloud Run without exposing secrets to code or Git repositories. |
| **Production Runtime** | Google Cloud Run (Containerized) | Auto-scaling container deployment honoring dynamic `$PORT` assignment and health checks. |

---

## 2. Threat Model Summary (The 5 Threat Zones)

| Threat Zone | Identified Risk Scenario | Countermeasure & Implemented Control |
| :--- | :--- | :--- |
| **Input Surfaces** | Malformed requests, empty payloads, or injection strings in prompts or reflections. | Strict schema validation, null-safe payload destructuring, length limits, and plain text encapsulation. |
| **Planning & Reasoning** | Prompt injection attempting to hijack system persona or exfiltrate private user context. | Structured system instructions isolating untrusted user reflections with explicit framing tags. |
| **Tool Execution & AI Engine** | Upstream quota limits (`429`), downtime (`503`), or transient API errors. | Multi-tier resilient fallback ladder across five Gemini model variants with exponential retry pauses. |
| **Memory & State** | Cross-tenant document access or unauthorized modification of another user's journal. | Owner-bound Firestore security rules (`request.auth.uid == userId`) with root deny-all. Strict undefined-stripping before persistence. |
| **Inter-System Communication** | Exfiltration of Gemini API keys or service account tokens via browser inspection or reverse engineering. | Gemini SDK initialized exclusively server-side; calls proxied through `/api/gemini/reflect`. Zero client-side API key exposure. |

---

## 3. Environment & Prerequisites

### Prerequisites
1. **Google Cloud Project**: An active GCP project with billing enabled.
2. **Google Cloud SDK (`gcloud` CLI)**: Installed and authenticated.
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```
3. **Firebase CLI** (optional for manual rule deployment):
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

### Enable Required Google Cloud APIs
Run the following command to enable all necessary services for Cloud Run, Secret Manager, Firestore, and Identity Toolkit:

```bash
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  identitytoolkit.googleapis.com
```

---

## 4. Secret Management Setup

Do not hardcode or commit secrets to version control. Store `GEMINI_API_KEY` in Google Cloud Secret Manager and grant access to the Cloud Run compute service account:

```bash
# 1. Create and populate the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 2. Grant Cloud Run service account access to read the secret
PROJECT_NUMBER=$(gcloud projects describe YOUR_PROJECT_ID --format="value(projectNumber)")
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 5. Database Security Configuration (Cloud Firestore)

All user reflections and conversational interactions are stored under `/users/{userId}/`. Security rules strictly enforce that authenticated callers can only access records matching their own Firebase Auth UID.

### Firestore Security Rules (`firestore.rules`)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/interactions/{interactionId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId}/entries/{entryId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      match /{allSubcollections=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

### Deploy Rules
Deploy the rules to your Firestore instance:
```bash
firebase deploy --only firestore:rules
```

---

## 6. Local Development & Testing

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure `.env` contains:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Run Dev Server
```bash
npm run dev
```
The dev server boots Express and Vite middleware, listening on `http://localhost:3000`.

### 4. Build & Production Emulation
```bash
npm run build
npm start
```

---

## 7. Cloud Run Deployment Flow

The application server dynamically checks `process.env.PORT` in production (defaulting to Cloud Run's port `8080`), while providing dual-port fallback for port `3000`.

### Deploy Container to Cloud Run
Execute the container-friendly deployment binding the Secret Manager secret:

```bash
gcloud run deploy gemini-reflection-journal \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets GEMINI_API_KEY=GEMINI_API_KEY:latest \
  --port 8080
```

### Apply Mandatory Campaign Labeling
To register the service for automated challenge verification, apply the campaign label:

```bash
gcloud run services update gemini-reflection-journal \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```

---

## 8. End-to-End Functional Stability & Walkthrough Test Matrix

Every process and interaction a user can trigger has a corresponding verification test case:

### Test Case 1: Service Health & Readiness Probe
- **Target Route**: `GET /api/health`
- **Steps**: Make an HTTP GET request to `/api/health`.
- **Expected Outcome**:
  - HTTP Status: `200 OK`.
  - JSON Response: `{"status": "ok", "timestamp": "...", "geminiConfigured": true}`.

### Test Case 2: Landing Page & Privacy Assurance
- **Target Route**: `GET /`
- **Steps**: Load the application in a browser as an unauthenticated visitor.
- **Expected Outcome**:
  - Obsidian Emerald hero section displays with navigation header.
  - "Gemini 3.8 Flash" model badge and "Zero-Secret Architecture" callout render clearly.
  - "Access Vault" and "Try Interactive Demo Mode" buttons are accessible.
  - Dashboard is inaccessible until authentication or guest session initializes.

### Test Case 3: Federated Authentication & Session Initialization
- **Steps**: Click **Access Vault** (Google Sign-In) or **Try Interactive Demo Mode**.
- **Expected Outcome**:
  - Session initializes with a valid user identifier.
  - Top bar displays authenticated email/identifier and an active "Owner-Isolated Vault" badge.
  - Journal workspace loads smoothly with the entries sidebar and reflection editor.

### Test Case 4: Entry Creation & Real-Time Auto-Save
- **Steps**:
  1. Click the **+ New** button in the sidebar.
  2. Type an entry title: `"Navigating Uncertainty in Project Milestones"`.
  3. Select a mood pill: `Focused` or `Calm`.
  4. Enter journal body: `"Today I tackled complex deployment configurations. Breaking down steps helped alleviate anxiety."`
- **Expected Outcome**:
  - Save status indicator shifts from `Unsaved` to `Saving to Firestore...` and settles on `Vault Secured`.
  - The entry is persisted to Firestore path `/users/{userId}/entries/{entryId}`.
  - The sidebar entry card displays the title, mood badge, and updated timestamp.

### Test Case 5: Deep Reflection Analysis (Gemini 3.8 Flash)
- **Steps**:
  1. With an active journal entry in the editor, click the **Deep Reflection** button (marked with the `Wand2` icon).
- **Expected Outcome**:
  - Button enters loading state: `"Reflecting..."`.
  - Contemplative indicator pulses with message `"Gemini 3.8 Flash is contemplating..."`.
  - Server proxies request to Gemini API with fallback resilience.
  - Generated reflection appears in the conversation stream formatted in clean Markdown.
  - Model badge displays `gemini-3.8-flash`.
  - User prompt and model reflection are persisted to `/users/{userId}/interactions/`.

### Test Case 6: Key Summary Generation
- **Steps**: Click the **Key Summary** button (marked with the `FileText` icon).
- **Expected Outcome**:
  - Button indicates `"Summarizing..."`.
  - Gemini generates structured bullet points highlighting core thoughts, recurring feelings, and main takeaways.
  - Interaction card appends to the conversation stream and persists to Firestore.

### Test Case 7: Perspective Brainstorming
- **Steps**: Click the **Brainstorm Angles** button (marked with the `Lightbulb` icon).
- **Expected Outcome**:
  - Gemini provides actionable micro-experiments, cognitive reframing angles, and introspective questions.
  - The response renders with copyable code/quote blocks if applicable.

### Test Case 8: Multi-Turn Conversational Dialogue
- **Steps**:
  1. In the follow-up chat input, type: `"How can I establish a daily habit to maintain this clarity?"` (or click a quick prompt suggestion pill).
  2. Click **Send** or press Enter.
- **Expected Outcome**:
  - User turn renders aligned right with timestamp.
  - Server transmits ongoing multi-turn context to Gemini.
  - Gemini responds contextually in the stream, maintaining continuity with the current reflection.

### Test Case 9: Response Clipboard Copy
- **Steps**: Hover over any Gemini response card and click the **Copy** button.
- **Expected Outcome**:
  - Markdown text is written to the system clipboard.
  - Button displays a green checkmark and changes label to `"Copied"` for 2 seconds.

### Test Case 10: Persistence Guarantee & Offline Error Recovery
- **Steps**:
  1. Simulate network disconnect or invalid database permissions while typing.
- **Expected Outcome**:
  - User's text in the editor buffer is never cleared or lost.
  - An error banner indicates save failure with an actionable **"Retry Save"** button.
  - Clicking "Retry Save" after connection recovery successfully commits the document to Firestore.

### Test Case 11: Entry Deletion & Vault Purge
- **Steps**:
  1. Hover over an entry in the sidebar and click the **Trash** icon.
  2. Confirm deletion in the prompt.
- **Expected Outcome**:
  - Entry document and linked interaction documents are removed from Firestore.
  - Sidebar immediately removes the entry card.
  - Editor transitions to the next available reflection or clears to a new blank template.

### Test Case 12: Session Termination & State Clearing
- **Steps**: Click the **Sign Out** button in the top navigation bar.
- **Expected Outcome**:
  - Authentication session terminates.
  - In-memory state (entries, active conversation) clears cleanly.
  - Application returns to the landing page.

---

## 9. Troubleshooting & Common Issues

| Symptom | Probable Cause | Corrective Action |
| :--- | :--- | :--- |
| **HTTP 503 "Service Unavailable" in Cloud Run** | Container failing health checks or port mismatch. | Confirm server listens on `0.0.0.0` and respects `process.env.PORT` (Cloud Run maps port `8080` by default). Check `/api/health` logs. |
| **Gemini API 403 / Missing Key** | `GEMINI_API_KEY` not bound in Cloud Run. | Verify secret exists in Secret Manager and run service account has `roles/secretmanager.secretAccessor`. |
| **Firestore Permission Denied** | Unauthenticated request or mismatched UID. | Ensure user is signed in via Firebase Auth so `request.auth.uid` matches the document path `/users/{userId}/...`. |
| **Model 429 Quota Exhausted** | High rate of requests on primary model. | Built-in fallback ladder automatically routes to `gemini-flash-latest` and `gemini-3.1-flash-lite`. Check GCP Console quotas. |
