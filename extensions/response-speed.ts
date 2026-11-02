import { performance } from "node:perf_hooks";
import { FooterComponent, type ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { truncateToWidth, visibleWidth } from "@earendil-works/pi-tui";

/** Output tokens / elapsed time from the first generated content delta. */
export default function (pi: ExtensionAPI) {
  let started: number | undefined;
  let requested: number | undefined;
  let lastResult: string | undefined;
  const key = "response-speed";
  let restoreFooter: (() => void) | undefined;

  pi.on("session_start", (_event, ctx) => {
    restoreFooter?.();
    if (ctx.mode === "tui") {
      // Reuse the stock footer, filtering only our status out of its extra line.
      // Pi 1.0 exposes FooterComponent but not a first-line status placement API.
      const original = FooterComponent.prototype.render;
      const render = function (this: FooterComponent, width: number): string[] {
        const footer = this as any;
        const statuses = footer.footerData.getExtensionStatuses();
        const speed = statuses.get(key);
        const filtered = new Map(statuses);
        filtered.delete(key);
        const view = Object.create(footer);
        view.footerData = new Proxy(footer.footerData, {
          get(target, prop) {
            if (prop === "getExtensionStatuses") return () => filtered;
            const value = Reflect.get(target, prop);
            return typeof value === "function" ? value.bind(target) : value;
          },
        });
        const lines = original.call(view, width);
        footer.sessionStats = view.sessionStats;
        if (speed && lines.length) {
          const right = truncateToWidth(speed, width);
          const available = width - visibleWidth(right) - 2;
          if (available > 0) {
            const left = truncateToWidth(lines[0], available);
            lines[0] = left + " ".repeat(Math.max(2, width - visibleWidth(left) - visibleWidth(right))) + right;
          } else {
            // On very narrow terminals preserve the project path.
            lines.push(right);
          }
        }
        return lines;
      };
      FooterComponent.prototype.render = render;
      restoreFooter = () => {
        if (FooterComponent.prototype.render === render) FooterComponent.prototype.render = original;
        restoreFooter = undefined;
      };
    }
    started = undefined;
    requested = undefined;
    if (ctx.mode === "tui") ctx.ui.setStatus(key, ctx.ui.theme.fg("dim", "TTFT — · TPS —"));
  });

  pi.on("message_start", (event, ctx) => {
    if (event.message.role !== "assistant") return;
    started = undefined;
    requested = performance.now();
    if (ctx.mode === "tui") ctx.ui.setStatus(key, ctx.ui.theme.fg("dim", lastResult ?? "TTFT … · TPS …"));
  });

  pi.on("message_update", (event, ctx) => {
    const type = event.assistantMessageEvent.type;
    if (requested !== undefined && started === undefined &&
      (type === "text_delta" || type === "thinking_delta" || type === "toolcall_delta")) {
      started = performance.now();
      if (ctx.mode === "tui" && !lastResult) ctx.ui.setStatus(key,
        ctx.ui.theme.fg("dim", `TTFT ${((started - requested) / 1000).toFixed(2)}s · TPS …`));
    }
  });

  pi.on("message_end", (event, ctx) => {
    if (event.message.role !== "assistant") return;
    if (started === undefined) {
      requested = undefined;
      if (ctx.mode === "tui") ctx.ui.setStatus(key, ctx.ui.theme.fg("dim", lastResult ?? "TTFT — · TPS —"));
      return;
    }
    const seconds = (performance.now() - started) / 1000;
    const ttft = requested === undefined ? "—" : `${((started - requested) / 1000).toFixed(2)}s`;
    started = undefined;
    requested = undefined;
    if (ctx.mode !== "tui") return;
    const tokens = event.message.usage.output;
    const valid = Number.isFinite(tokens) && tokens > 0 && seconds > 0;
    if (valid) {
      lastResult = `TTFT ${ttft} · ${(tokens / seconds).toFixed(1)} tok/s · stream ${seconds.toFixed(1)}s · ${tokens.toLocaleString()} out`;
    }
    ctx.ui.setStatus(key, ctx.ui.theme.fg("dim", lastResult ?? `TTFT ${ttft} · TPS — · stream ${seconds.toFixed(1)}s`));
  });

  pi.on("session_shutdown", (_event, ctx) => {
    restoreFooter?.();
    started = undefined;
    requested = undefined;
    if (ctx.mode === "tui") ctx.ui.setStatus(key, undefined);
  });
}
