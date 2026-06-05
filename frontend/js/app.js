// Atlas — frontend logic. YOUR job to implement (GUIDE.md, Phases 1-2).
//
// This script connects your HTML to the backend. You'll want to:
//
// 1. Load the model list to fill the picker:
//      GET /api/models  ->  { installed: [...] }
//
// 2. Send a message and stream the reply:
//      POST /api/chat  with body { messages: [...], model }
//      The response is a Server-Sent Events stream (text/event-stream). Read it
//      incrementally with response.body.getReader(), decode the bytes, split on
//      "\n\n", and append each "data: ..." piece to the assistant's message as
//      it arrives — that's what makes the reply "type out" live.
//
// 3. Keep a `history` array of { role, content } so the model has context on
//    each turn (push the user message, then the assistant's full reply).
//
// Hints:
//   - fetch(url, { method, headers: { "Content-Type": "application/json" }, body })
//   - new TextDecoder() turns streamed bytes into text.
//   - Submit on Enter, newline on Shift+Enter is a nice touch.

// TODO: build it.
