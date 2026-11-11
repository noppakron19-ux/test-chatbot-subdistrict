# Security Specification & Test Protocol

## 1. Data Invariants
- **SaoProfile**: Must contain an `orgName` of valid length (<= 200 chars). Document ID must be a safe alphanumeric string (`main`).
- **Executive**: Must include non-empty `name` (<= 200 chars) and `position` (<= 200 chars). Order must be a valid number.
- **PrPost**: Must contain non-empty `title` (<= 300 chars) and `content` (<= 5000 chars). Categories and tones must be string types within bounds.
- **KnowledgeItem**: Must contain valid `topic` (<= 200 chars) and `answer` (<= 3000 chars).
- **ChatSession & ChatMessage**: Subcollection messages must belong to an active session with valid `role` ("user" or "assistant") and `content` (<= 5000 chars).

## 2. The "Dirty Dozen" Payloads
1. **Oversized Name Injection**: Executive with 10,000 character `name` (DDoS/Wallet exhaustion attack) -> BLOCKED.
2. **Invalid Entity Schema (Ghost Field Injection)**: Adding unverified keys like `isAdmin: true` or `shadowField: "exploit"` to `SaoProfile` -> BLOCKED.
3. **Invalid Document ID Path Traversal**: Attempting write to `../../bad_root` or path containing unsafe characters -> BLOCKED.
4. **Invalid Position Type Injection**: Executive with `position` boolean or nested object instead of string -> BLOCKED.
5. **Post Without Required Title**: PrPost payload missing `title` entirely -> BLOCKED.
6. **Oversized Facebook Post Payload**: PrPost with 100,000 character payload exceeding bounds -> BLOCKED.
7. **Negative or NaN Order in Executive**: Executive with invalid non-numeric order -> BLOCKED.
8. **Invalid Chat Role**: ChatMessage with role `hacker` instead of `user` or `assistant` -> BLOCKED.
9. **Blanket Read of Hidden Documents**: Querying non-existent collections or arbitrary paths -> BLOCKED by default deny.
10. **Corrupted Knowledge Entry**: KnowledgeItem with empty answer or invalid category type -> BLOCKED.
11. **Type Mismatch in Work Hours**: SaoProfile `workHours` as integer instead of string -> BLOCKED.
12. **Malicious Script in Content**: Validated string types sanitized and length checked.

## 3. Test Runner Invariant
All reads/writes to `/sao_profiles/{id}`, `/executives/{id}`, `/pr_posts/{id}`, `/knowledge_items/{id}`, and `/chat_sessions/{id}/messages/{id}` validate document ID format, non-null values, strict types, and boundary checks.
