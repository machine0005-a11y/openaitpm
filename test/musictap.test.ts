import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { JSDOM } from "jsdom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GET as getMusicTapConfig } from "@/app/api/musictap/config/route";

const html = readFileSync(resolve("public/musictap/index.html"), "utf8");
const openProvider = vi.fn();

function createMusicTapDom() {
  openProvider.mockClear();
  return new JSDOM(html, {
    runScripts: "dangerously",
    url: "https://www.ideamuses.com/musictap",
    beforeParse(window) {
      const win = window as unknown as Record<string, unknown>;
      win.fetch = vi.fn(async () => ({
        ok: true,
        json: async () => ({
          spotifyClientId: "",
          googleClientId: "",
          appleMusicDeveloperToken: "",
          appleMusicStorefront: "us"
        })
      }));
      win.open = openProvider;
      win.requestAnimationFrame = vi.fn(() => 1);
      win.cancelAnimationFrame = vi.fn();
      Object.defineProperty(window.HTMLMediaElement.prototype, "play", {
        configurable: true,
        value: vi.fn(async () => undefined)
      });
      Object.defineProperty(window.HTMLMediaElement.prototype, "pause", {
        configurable: true,
        value: vi.fn()
      });

      class FakeYouTubePlayer {
        private readonly options: {
          videoId: string;
          events: {
            onReady: (event: { target: FakeYouTubePlayer }) => void;
            onStateChange: (event: { data: number; target: FakeYouTubePlayer }) => void;
          };
        };

        constructor(targetId: string, options: FakeYouTubePlayer["options"]) {
          this.options = options;
          window.setTimeout(() => {
            const target = window.document.getElementById(targetId);
            const iframe = window.document.createElement("iframe");
            iframe.src = `https://www.youtube.com/embed/${options.videoId}`;
            target?.replaceWith(iframe);
            options.events.onReady({ target: this });
          }, 0);
        }

        getDuration() {
          return 120;
        }

        getCurrentTime() {
          return 0;
        }

        playVideo() {
          this.options.events.onStateChange({ data: 1, target: this });
        }

        pauseVideo() {
          this.options.events.onStateChange({ data: 2, target: this });
        }

        seekTo() {}

        destroy() {}
      }

      win.YT = {
        Player: FakeYouTubePlayer,
        PlayerState: { PLAYING: 1, PAUSED: 2, ENDED: 0 }
      };
    }
  });
}

async function flushDom() {
  await new Promise((resolvePromise) => setTimeout(resolvePromise, 10));
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("MusicTap connected picker", () => {
  it(
    "imports the exact YouTube mix, mounts a player, starts, and saves it",
    async () => {
      const dom = createMusicTapDom();
      await flushDom();
      const document = dom.window.document;

      document.getElementById("addButton")?.click();
      expect(document.getElementById("drawer")?.classList.contains("open")).toBe(true);
      expect(
        dom.window.getComputedStyle(document.getElementById("drawer") as HTMLElement).display
      ).toBe("block");

      const input = document.getElementById("linkInput") as HTMLInputElement;
      input.value =
        "https://www.youtube.com/watch?v=qJ1GBL1TPLg&list=RDqJ1GBL1TPLg&start_radio=1";
      document.getElementById("linkForm")?.dispatchEvent(
        new dom.window.Event("submit", { bubbles: true, cancelable: true })
      );
      await flushDom();

      expect(document.getElementById("trackTitle")?.textContent).toBe("YouTube mix");
      expect(document.querySelector("#providerPlayer iframe")?.getAttribute("src")).toContain(
        "qJ1GBL1TPLg"
      );
      expect(document.getElementById("playButton")?.getAttribute("aria-label")).toBe("Pause");
      expect((document.getElementById("recentSection") as HTMLElement).hidden).toBe(false);
      dom.window.close();
    },
    15_000
  );

  it("keeps search honest when provider credentials are not configured", async () => {
    const dom = createMusicTapDom();
    await flushDom();
    const document = dom.window.document;

    document.getElementById("addButton")?.click();
    (document.querySelector('[data-select-provider="youtube"]') as HTMLButtonElement).click();
    const input = document.getElementById("linkInput") as HTMLInputElement;
    input.value = "fred again";
    document.getElementById("linkForm")?.dispatchEvent(
      new dom.window.Event("submit", { bubbles: true, cancelable: true })
    );
    await flushDom();

    expect(document.getElementById("linkHint")?.textContent).toContain(
      "Connect YouTube Music to search"
    );
    dom.window.close();
  });

  it("opens provider-owned sign-in when app credentials are unavailable", async () => {
    const dom = createMusicTapDom();
    await flushDom();
    const document = dom.window.document;

    document.getElementById("addButton")?.click();
    (document.querySelector('[data-connect-provider="spotify"]') as HTMLButtonElement).click();

    expect(openProvider).toHaveBeenCalledWith(
      "https://accounts.spotify.com/login",
      "_blank",
      "noopener"
    );
    dom.window.close();
  });

  it("returns public provider configuration with no-store caching", async () => {
    const previousClientId = process.env.SPOTIFY_CLIENT_ID;
    process.env.SPOTIFY_CLIENT_ID = "spotify-client";

    const response = getMusicTapConfig();
    const body = await response.json();

    expect(body.spotifyClientId).toBe("spotify-client");
    expect(response.headers.get("Cache-Control")).toBe("no-store, max-age=0");

    process.env.SPOTIFY_CLIENT_ID = previousClientId;
  });
});
