// sse.js — read a Server-Sent Events stream from a fetch() response.
//
// The backend sends frames like:
//
//     data: {"kind": "text", "text": "Hel"}\n\n
//     data: {"kind": "text", "text": "lo"}\n\n
//     data: {"kind": "done"}\n\n
//
// A blank line ("\n\n") ends a frame. Bytes arrive in arbitrary pieces, so we
// keep a buffer and only parse frames once they are complete.
//
// Later phases add more kinds on the same stream ("thinking", "tool_call",
// token counts on "done"); the parser doesn't care — it hands every event on.
// It also still understands the old plain-text frames ("data: Hello",
// "data: [ERROR] ...", "data: [DONE]") so the UI works with either backend.

export async function readSSE(response, onEvent, onBytes) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    onBytes?.(value.byteLength);
    buffer += decoder.decode(value, { stream: true }).replace(/\r\n/g, "\n");

    let end;
    while ((end = buffer.indexOf("\n\n")) !== -1) {
      const frame = buffer.slice(0, end);
      buffer = buffer.slice(end + 2);
      const event = parseFrame(frame);
      if (event) onEvent(event);
    }
  }

  // A final frame without the trailing blank line.
  const last = parseFrame(buffer);
  if (last) onEvent(last);
}

function parseFrame(frame) {
  const lines = frame.split("\n").filter((line) => line.startsWith("data:"));
  if (lines.length === 0) return null;
  // Per the SSE spec, one optional space after "data:" is not part of the value.
  const data = lines.map((line) => line.slice(5).replace(/^ /, "")).join("\n");
  return toEvent(data);
}

export function toEvent(data) {
  try {
    const parsed = JSON.parse(data);
    if (parsed && typeof parsed === "object" && parsed.kind) return parsed;
    if (typeof parsed === "string") return { kind: "text", text: parsed };
  } catch {
    /* not JSON: an old-style plain-text frame */
  }
  if (data === "[DONE]") return { kind: "done" };
  if (data.startsWith("[ERROR]")) return { kind: "error", message: data.slice(7).trim() };
  return { kind: "text", text: data };
}
