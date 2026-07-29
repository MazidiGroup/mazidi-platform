# Privacy Centre — wording diff

Compares the **rendered visible text** of the three new App Router pages against the canonical
legal source HTML, clause by clause.

| Page | Source of record | Implemented at |
| --- | --- | --- |
| Privacy Notice | `compliance/website/privacy/index.html` | `apps/web/app/(group)/privacy/page.tsx` |
| Privacy Requests | `compliance/website/privacy/request/index.html` | `apps/web/app/(group)/privacy/request/page.tsx` |
| Data Protection Complaints | `compliance/website/privacy/complaints/index.html` | `apps/web/app/(group)/privacy/complaints/page.tsx` |

## Method

Visible text was extracted mechanically from both sides — HTML tags stripped from the source,
JSX tags/expressions stripped from the `.tsx` (with `<Mail address="…" />` and the
`REGISTERED_OFFICE` constant expanded to the literal text they render) — then normalised for
whitespace and HTML entities and compared block-by-block with `difflib.SequenceMatcher`.

Block counts: Privacy Notice 127 source → 116 page; Privacy Requests 11 → 11;
Complaints 25 → 24. **Every** differing block is listed below. All blocks not listed are
character-for-character identical to source, including British spellings, en dashes (`–`),
curly quotation marks (`“ ” ’`), semicolon-terminated list items and mid-sentence punctuation.

---

## 1. Privacy Notice — `/privacy`

### 1.1 Deletions

**D1 — draft label (owner-directed, must not appear publicly)**

```
REMOVED: Status: 0.9 – legal and technical review draft
```

**D2 — pre-publication editorial metadata**

```
REMOVED: Proposed URL: https://mazidiperformance.mazidigroup.com/privacy
```

**D3 — internal editorial note block (instructions to the publisher, not notice text)**

```
REMOVED: Before publishing: replace all square-bracket placeholders and complete the
vendor/data-flow review. This draft assumes an adult-only service, no sale of personal data,
no behavioural advertising, and no production-user data sent to AI tools unless the user is
clearly informed and the processing is documented.
```

**D4 — Apple Health sentence in the §3 health-data bullet** (the app has no HealthKit
integration). Only the trailing sentence was removed; the rest of the bullet is verbatim.

```
REMOVED: If Apple Health or another wearable integration is enabled, the app will request
access only to the specific categories displayed in the permission screen.
```

**D5 — section 6 "Apple Health and connected services", removed in its entirety**

```
REMOVED: 6. Apple Health and connected services
REMOVED: Where the user chooses to connect Apple Health or another service:
REMOVED: the app will ask for permission for each relevant data category;
REMOVED: the user may change permissions in device settings;
REMOVED: imported information will be used only for the disclosed health and fitness functionality;
REMOVED: health and fitness information will not be used for advertising, marketing or sale to data brokers;
REMOVED: the connected provider may process information under its own privacy notice.
REMOVED: Remove this section if the released app does not use Apple Health or another health-data integration.
```

### 1.2 Substitutions

**S1 — legal entity (opening sentence of §1)**

```
OLD: MazidiPerformance is a coaching and performance service operated by
     [MAZIDIGROUP LEGAL ENTITY NAME], trading as or forming part of MazidiGroup
     (“MazidiGroup”, “MazidiPerformance”, “we”, “us” or “our”).

NEW: MazidiPerformance is a service operated by Mazidi Homes Limited under the
     MazidiGroup brand.
```

> **Flagged for legal review.** The replaced source sentence also carried the defined-terms
> parenthetical `(“MazidiGroup”, “MazidiPerformance”, “we”, “us” or “our”)`, which the notice
> relies on when it later says "we"/"us"/"our". The owner-directed replacement sentence was
> applied exactly as specified, so those definitions no longer appear anywhere on the page.
> This was **not** re-added, because doing so would have meant inventing wording. Counsel
> should decide whether to restore a definitions clause.

**S2 — registered address (§1 contact list)**

```
OLD: Registered address: [REGISTERED BUSINESS ADDRESS]
NEW: Registered address: Flat 55 Banstead Court, 60 Westway, London, England, W12 0QJ
```

**S3 — company registration number (§1 contact list)**

```
OLD: Company registration number: [COMPANY REGISTRATION NUMBER, IF APPLICABLE]
NEW: Company registration number: 15350516
```

**S4 — privacy contact (§1 contact list) — address unchanged, deliverability marker appended once**

```
OLD: Privacy contact: privacy@mazidigroup.com
NEW: Privacy contact: privacy@mazidigroup.com [PRIVACY CONTACT EMAIL — DELIVERABILITY TO BE CONFIRMED]
```

**S5 — controller identification (§1). First sentence replaced; the remainder is verbatim.**

```
OLD: For UK and European data protection law, MazidiGroup is normally the controller of
     personal information collected through MazidiPerformance because it decides why and how
     that information is used. Some coaches or corporate customers may have a different role.
     Any such arrangement must be explained at the point of collection and documented
     contractually.

NEW: Mazidi Homes Limited is the controller of the personal information described in this
     Privacy Notice. Some coaches or corporate customers may have a different role. Any such
     arrangement must be explained at the point of collection and documented contractually.
```

**S6 — account deletion (§10, was §11). The app has no in-app deletion path.**

```
OLD: Users should be able to initiate account deletion in the iOS app through
     Settings → Account → Delete account. Deletion must cover the authentication account,
     application database, files, coach workspace, identifiable analytics profiles,
     notification tokens and downstream vendors, except for information that must legally be
     retained.

NEW: Users may request deletion of their account and associated personal information through
     the privacy-request process or by emailing privacy@mazidigroup.com.
```

The second paragraph of that section (data export) is unchanged and verbatim.

**S7 — postal address in §14 Contact (was §15)**

```
OLD: Address: [REGISTERED BUSINESS ADDRESS]
NEW: Address: Flat 55 Banstead Court, 60 Westway, London, England, W12 0QJ
```

### 1.3 Renumbering (consequence of D5 only — heading text unchanged)

| Source | Page |
| --- | --- |
| 7. Sharing and service providers | 6. Sharing and service providers |
| 8. International transfers and residency | 7. International transfers and residency |
| 9. Retention | 8. Retention |
| 10. Your choices and rights | 9. Your choices and rights |
| 11. Account deletion and data export | 10. Account deletion and data export |
| 12. Security | 11. Security |
| 13. Automated recommendations and AI | 12. Automated recommendations and AI |
| 14. Changes to this notice | 13. Changes to this notice |
| 15. Contact | 14. Contact |

Sections 1–5 keep their source numbers. The source contains **no** cross-references of the
form "section N" / "clause N" (verified by grep across all three files), so no in-text
references needed correcting.

### 1.4 Unchanged

`Last updated: 29 July 2026` is retained exactly as in source.

**All other clauses on this page are byte-identical to the source**, including §2 scope and
age, the whole of §3 (other than D4), §4 and its five-row lawful-basis table, §5, §6–§9,
the eight-row retention table, the UK/US/Canada sub-sections, and §11–§14.

---

## 2. Privacy Requests — `/privacy/request`

**No deletions. No substitutions. No placeholders.**

All 11 visible-text blocks are byte-identical to source, including the six-item list, the
"Do not email passwords…" paragraph and the suggested subject line
`MazidiPerformance privacy request – [type of request]` (the square brackets there are part of
the approved user-facing instruction, not an unresolved placeholder).

---

## 3. Data Protection Complaints — `/privacy/complaints`

### 3.1 Deletions

**D6 — draft label (owner-directed, must not appear publicly)**

```
REMOVED: Version: 0.9 – legal and technical review draft
```

### 3.2 Substitutions

**S8 — effective date**

```
OLD: Effective date: [APPROVAL DATE]
NEW: Effective date: [EFFECTIVE DATE — SET ON PUBLICATION]
```

**S9 — postal address in "How to complain". Rest of the paragraph verbatim.**

```
OLD: …by post to [REGISTERED BUSINESS ADDRESS], or through any future secure online form…
NEW: …by post to Flat 55 Banstead Court, 60 Westway, London, England, W12 0QJ, or through
     any future secure online form…
```

### 3.3 Unchanged

`Owner: MazidiGroup Privacy Lead` is retained. **All other clauses are byte-identical to
source**: Purpose, the second "How to complain" paragraph, all eight Procedure steps, the four
Target service levels, and Independence and escalation.

---

## 4. Markup-only changes (no text altered)

These change presentation, never wording:

- Source page chrome (`<header>`, in-page `<nav>`, `<footer>`) is replaced by the site's own
  `Header`/`Footer` from `app/(group)/layout.tsx`. The three-way privacy nav and the Support
  mailto are reproduced as a `LegalNav` component with identical link text.
- The source footer line `© 2026 [MAZIDIGROUP LEGAL ENTITY NAME] · privacy@mazidigroup.com`
  is not carried over; the site footer supplies its own copyright line.
- The complaints **Procedure** steps are `<p>1. …</p>` … `<p>8. …</p>` in source and an
  `<ol>` of eight `<li>` on the page. The ordinal is produced by the list marker instead of
  literal text; the rendered reading order and text are identical.
- The two tables (lawful bases, retention) keep their exact cell text and are wrapped in a
  horizontally scrollable, keyboard-focusable region so they never overflow a 375px viewport.
- Email addresses are rendered as real `mailto:` links.
- Page `<title>` and `<meta name="description">` are carried over from the source `<head>`
  verbatim via the exported Next.js `metadata` objects.

---

## 5. Remaining placeholders

Only two markers remain across all three pages. Both must be resolved before or at publication:

| Marker | Page | Location |
| --- | --- | --- |
| `[EFFECTIVE DATE — SET ON PUBLICATION]` | `/privacy/complaints` | Effective date line |
| `[PRIVACY CONTACT EMAIL — DELIVERABILITY TO BE CONFIRMED]` | `/privacy` | §1 contact list, appended once to `privacy@mazidigroup.com` |

The company registration number (`15350516`) and registered office address
(`Flat 55 Banstead Court, 60 Westway, London, England, W12 0QJ`) are confirmed real values,
not placeholders.

---

## 6. Assertion (as at the initial implementation)

Other than the deletions D1–D6, the substitutions S1–S9, the D5-driven renumbering and the
markup-only changes in §4, **every clause on all three pages is byte-identical to the canonical
source HTML**. No clause was paraphrased, shortened, expanded, re-ordered, re-punctuated or
re-spelled. This was verified by an automated block-level text diff, not by reading.

---

## 7. Owner-approved amendments — 29 July 2026

Four owner decisions applied to the branch after the review above. **Nothing else was
changed**: no other clause on any of the three pages was paraphrased, shortened, expanded,
re-ordered, re-punctuated or re-spelled.

### 7.1 Decision 1 — defined terms restored (Privacy Notice §1)

This closes the point flagged against **S1** above: the source's defined-terms parenthetical
had been lost, while the notice continues to rely on "we"/"us"/"our" throughout. The owner
supplied replacement wording, applied verbatim. §1 now opens with a single three-sentence
paragraph; the first two sentences are the existing approved sentences unchanged (the second
was previously the opening sentence of the controller paragraph below the contact list), and
the third is the new owner-supplied definition.

```
OLD (§1 opening paragraph):
  MazidiPerformance is a service operated by Mazidi Homes Limited under the MazidiGroup brand.

OLD (§1 controller paragraph, below the contact list):
  Mazidi Homes Limited is the controller of the personal information described in this Privacy
  Notice. Some coaches or corporate customers may have a different role. Any such arrangement
  must be explained at the point of collection and documented contractually.

NEW (§1 opening paragraph):
  MazidiPerformance is a service operated by Mazidi Homes Limited under the MazidiGroup brand.
  Mazidi Homes Limited is the controller of the personal information described in this Privacy
  Notice. In this Privacy Notice, references to ‘MazidiGroup’, ‘MazidiPerformance’, ‘we’, ‘us’
  and ‘our’ mean Mazidi Homes Limited, unless the context states otherwise.

NEW (§1 paragraph below the contact list — remainder of the controller paragraph, verbatim):
  Some coaches or corporate customers may have a different role. Any such arrangement must be
  explained at the point of collection and documented contractually.
```

No other use of "we"/"us"/"our" anywhere in the notice was altered; the new sentence defines
them all.

### 7.2 Decision 2 — legal entity in the site footer

A repo-wide search found exactly one true legal-entity reference —
`apps/web/components/Footer.tsx`. Every other "Mazidi Group" occurrence is brand/marketing
usage and was left untouched, including `apps/web/app/sites/[site]/layout.tsx`
(`© {year} {company.name} · A Mazidi Group company`), which is tenant-site brand usage and
explicitly out of scope.

```
OLD: © {new Date().getFullYear()} Mazidi Group Ltd. All rights reserved.
NEW: © {new Date().getFullYear()} Mazidi Homes Limited. MazidiGroup is a brand of Mazidi Homes Limited.
```

Added below it, as separate small text in the same footer legal area (`text-[.8rem] text-t3`):

```
ADDED: Mazidi Homes Limited is registered in England and Wales under company number 15350516.
       Registered office: Flat 55 Banstead Court, 60 Westway, London, England, W12 0QJ.
```

The year stays dynamic (`new Date().getFullYear()`) rather than hardcoded. The three privacy
links in the footer are unchanged.

### 7.3 Decision 4 — privacy mailbox wording

The public privacy address is `privacy@mazidigroup.com` on all three pages.
`hello@mazidigroup.com` appears nowhere.

**Marker removed** (supersedes the second row of §5 "Remaining placeholders" above). The
address is now defined, so the page no longer carries a deliverability caveat; deliverability
testing remains a launch blocker tracked in the PR, not on the public page.

```
OLD (§1 contact list): Privacy contact: privacy@mazidigroup.com [PRIVACY CONTACT EMAIL — DELIVERABILITY TO BE CONFIRMED]
NEW (§1 contact list): Privacy contact: privacy@mazidigroup.com
```

**Contact invitation.** The approved sentence is:

```
For privacy questions, data-protection requests or complaints, contact us at privacy@mazidigroup.com.
```

| Page | Placement |
| --- | --- |
| `/privacy` | §14 Contact — **replaced** the invitation line `Privacy questions, requests or complaints:`. The `Privacy Team – MazidiGroup` block, email, postal address, security and support lines below it are unchanged. |
| `/privacy/complaints` | **Added** as the opening paragraph of "How to complain", immediately above the existing `Complaints may be made by email to …, by post to …, or through any future secure online form.` paragraph, which is retained verbatim. It was **not** replaced: doing so would have deleted the postal and future-online-form complaint routes, which no decision authorises. |
| `/privacy/request` | **Not changed.** The page's only contact invitation is `Email privacy@mazidigroup.com from the email address associated with your account and include:` — a lead-in that governs the six-item list beneath it. Replacing it would orphan that list and delete the account-address verification instruction; adding the approved sentence directly above it would repeat the same address in consecutive sentences. The page already publishes the correct address and carries no marker. Flagged for the owner rather than guessed. |

**DPO scan.** `DPO`, `Data Protection Officer` and `dpo@` were searched across all three
pages: **zero hits**. Nothing asserts that a Data Protection Officer has been appointed, and
nothing was removed on this ground.

### 7.4 Decision 3 — effective date left as-is, guarded

`[EFFECTIVE DATE — SET ON PUBLICATION]` on `/privacy/complaints` is **unchanged**. See the
pre-deployment checklist below for the release guard that now enforces it.

---

## 8. Pre-deployment checklist

**The privacy centre must not be deployed while `[EFFECTIVE DATE — SET ON PUBLICATION]`
remains on `/privacy/complaints`.** Before release, replace that marker with the real
production publication date, formatted like `29 July 2026`.

A release guard enforces this:

```bash
pnpm check:privacy          # scripts/check-privacy-placeholders.sh
```

It greps `apps/web/app/(group)/privacy/` for `EFFECTIVE DATE — SET ON PUBLICATION`,
`[APPROVAL DATE]`, `TO BE CONFIRMED`, `0.9`, `Apple Health` and `HealthKit`, prints every hit
with file and line, and **exits non-zero** if any is found. It exits non-zero today, by
design, because the effective-date marker is still present — the release fails while it
remains.

There is currently no `.github/workflows/` directory in this repo (deployment is Vercel-from-
GitHub, per `DEPLOYMENT.md`), so there was no CI workflow to add a step to. Run
`pnpm check:privacy` as part of the release sequence, and add it as a CI step when a workflow
is introduced.

- [ ] `[EFFECTIVE DATE — SET ON PUBLICATION]` replaced with the production publication date
      (`29 July 2026` format)
- [ ] `pnpm check:privacy` exits 0
- [ ] `privacy@mazidigroup.com` deliverability confirmed (mailbox monitored, tested end to end)
