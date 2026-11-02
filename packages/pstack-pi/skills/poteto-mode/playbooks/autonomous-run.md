### Autonomous run

**You own the exit condition. Define done, then drive to it without stopping.**

1. State the exit condition as a checkable predicate before the first iteration (tests green, repro fixed, all N PRs merged, pixel-diff zero).
2. Pick a Codex-native wake mechanism. Use an event-aware watcher for CI, merges, or ref changes, with a bounded heartbeat as fallback. Use a recurring automation only when the user asks for recurring monitoring. Size fixed polling to when a changed result would be worth checking.
3. Each iteration makes the smallest change the evidence justifies, verifies it against the predicate, commits if it advanced, discards changes that didn't help. Belt-and-suspenders that "might help" gets reverted, not left to ride.
   Sequence the work via the **sequence-verifiable-units** principle skill, verifying each unit before the next instead of batching checks at the end.
4. Mid-run discoveries are yours when they remain within the user's scope. Address broken local tooling, related bugs, flaky verifiers, review noise, and fixable drift through `/skill:poteto-mode`. Keep unrelated fixes separate and do not broaden external permissions. Surface irreversible actions, genuine product decisions, or a real dead end. Return to the predicate after each side fix.
5. Checkpoint every iteration via the **show-me-your-work** skill, a row for what changed and whether the predicate moved.
6. Stop when the predicate is met. A plateau is not a stop, so keep going and pivot your approach to push past it. Surface a genuine dead end rather than spinning, and never relax the predicate to declare victory.

**Reply:** the exit condition, iterations run, what landed, what was discarded, final predicate state.
