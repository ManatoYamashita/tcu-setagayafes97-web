let kaiseiFontPromise: Promise<void> | undefined;

/**
 * Kaisei Opti is needed by page headings, but not by the home hero's initial viewport.
 * Keep its next/font CSS in a separate chunk and load it once on demand.
 */
export function loadKaiseiFont(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();

  kaiseiFontPromise ??= import("./KaiseiFont").then(({ kaiseiOpti }) => {
    document.body.classList.add(kaiseiOpti.variable);
  });

  return kaiseiFontPromise;
}
