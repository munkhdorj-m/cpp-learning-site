// Recording a quiz answer from the browser.
//
// Deliberately fire-and-forget: a student answering a question must never wait
// on the network, and a failed save is not worth interrupting them for. The
// server decides whether the answer was right, so nothing here can be faked by
// editing the request.

export function recordQuizAnswer(key: string, choice: number): void {
  void fetch("/api/progress/quiz", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ key, choice }),
  }).catch(() => {
    // Offline, or the database is down. The quiz still works.
  });
}
