"""Email assistant (Phase 8).

Planned modules:
  - client.py    : IMAP fetch + SMTP send (use imaplib/smtplib or aioimaplib).
  - summarize.py : LLM summaries of threads.
  - draft.py     : style-matched reply drafts (learn the user's voice).
  - triage.py    : auto-tagging + spam/priority classification.

Security note: only ever use an app-specific password, stored in `.env`.
"""
