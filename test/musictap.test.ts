import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { JSDOM } from "jsdom";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GET as getMusicTapConfig } from "@/app/api/musictap/config/route";

const html = readFileSync(resolve("public/musictap/index.html"), "utf8");
const openProvider = vi.fn();
type MusicTapConfig = {
  spotifyClientId: string;
  googleClientId: string;
  appleMusicDeveloperToken: string;
  appleMusicStorefront: string;
};

function createMusicTapDom(config: MusicTapConfig = {
  spotifyClientId: "",
  googleClientId: "",
  appleMusicDeveloperToken: "",
  appleMusicStorefront: "us"
}, options: {
  fetch?: typeof fetch;
  setupWindow?: (window: Window & typeof globalThis) => void;
} = {}) {
  openProvider.mockClear();
  return new JSDOM(html, {
    runScripts: "dangerously",
    url: "https://www.ideamuses.com/musictap",
    beforeParse(window) {
      const win = window as unknown as Record<string, unknown>;
      win.fetch = options.fetch || vi.fn(async () => ({
        ok: true,
        json: async () => config
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
          playerVars?: Record<string, unknown>;
          events: {
            onReady: (event: { target: FakeYouTubePlayer }) => void;
            onStateChange: (event: { data: number; target: FakeYouTubePlayer }) => void;
          };
        };

        constructor(targetId: string, options: FakeYouTubePlayer["options"]) {
          this.options = options;
          win.lastYouTubePlayerOptions = options;
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
      options.setupWindow?.(window as unknown as Window & typeof globalThis);
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
        "https://www.youtube.com/watch?v=qJ1GBL1TPLg&list=RDqJ1GBL1TPLg&start_radio=1&pp=ygUqZnJlZCBhZ2FpbiBzb21ldGltZXMgaSB3YW5uYSBmZWVsIHRoZSBwYWluoAcB";
      input.dispatchEvent(
        new dom.window.KeyboardEvent("keydown", { key: "Enter", bubbles: true, cancelable: true })
      );
      await flushDom();

      expect(document.getElementById("trackTitle")?.textContent).toBe("YouTube mix");
      expect(document.querySelector("#providerPlayer iframe")?.getAttribute("src")).toContain(
        "qJ1GBL1TPLg"
      );
      const playerOptions = (
        dom.window as unknown as {
          lastYouTubePlayerOptions?: { playerVars?: Record<string, unknown> };
        }
      ).lastYouTubePlayerOptions;
      expect(playerOptions?.playerVars?.list).toBeUndefined();
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

  it("opens the provider when app credentials are unavailable", async () => {
    const dom = createMusicTapDom();
    await flushDom();
    const document = dom.window.document;

    document.getElementById("addButton")?.click();
    expect(document.getElementById("providerSummary")?.textContent).toBe(
      "Link mode active - paste a song link to play"
    );
    const providerButton = document.querySelector(
      '[data-connect-provider="spotify"]'
    ) as HTMLButtonElement;
    expect(providerButton.textContent).toBe("Open");
    providerButton.click();

    expect(openProvider).toHaveBeenCalledWith(
      "https://accounts.spotify.com/login",
      "_blank",
      "noopener"
    );
    dom.window.close();
  });

  it("labels the primary picker action as search for text and play for links", async () => {
    const dom = createMusicTapDom();
    await flushDom();
    const document = dom.window.document;

    document.getElementById("addButton")?.click();
    const input = document.getElementById("linkInput") as HTMLInputElement;
    const submitButton = document.getElementById("submitMusicButton") as HTMLButtonElement;

    expect(submitButton.textContent).toBe("Search");

    input.value = "fred again";
    input.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    expect(submitButton.textContent).toBe("Search");

    input.value = "https://www.youtube.com/watch?v=qJ1GBL1TPLg";
    input.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    expect(submitButton.textContent).toBe("Play");

    input.value = "morning playlist";
    (document.querySelector('[data-content-kind="playlist"]') as HTMLButtonElement).click();
    input.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    expect(submitButton.textContent).toBe("Search");
    expect(document.getElementById("pickerPrompt")?.textContent).toBe(
      "Search Spotify playlists or paste a playlist link"
    );
    dom.window.close();
  });

  it("switches providers into connect mode when credentials are configured", async () => {
    const dom = createMusicTapDom({
      spotifyClientId: "spotify-client",
      googleClientId: "",
      appleMusicDeveloperToken: "",
      appleMusicStorefront: "us"
    });
    await flushDom();
    const document = dom.window.document;

    document.getElementById("addButton")?.click();

    expect(document.getElementById("providerSummary")?.textContent).toBe(
      "1 ready to connect - search available after sign-in"
    );
    expect(
      (document.querySelector('[data-connect-provider="spotify"]') as HTMLButtonElement)
        .textContent
    ).toBe("Connect");
    expect(document.getElementById("spotifyState")?.textContent).toBe("Connect to search");
    dom.window.close();
  });

  it("connects YouTube Music from a typed search, shows results, and plays the selection", async () => {
    const config = {
      spotifyClientId: "",
      googleClientId: "google-client",
      appleMusicDeveloperToken: "",
      appleMusicStorefront: "us"
    };
    const requestAccessToken = vi.fn();
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/musictap/config")) {
        return {
          ok: true,
          json: async () => config
        };
      }
      if (url.includes("youtube/v3/search")) {
        return {
          ok: true,
          json: async () => ({
            items: [
              {
                id: { videoId: "abc123xyz00" },
                snippet: {
                  title: "Fred again.. - Delilah",
                  channelTitle: "Fred again..",
                  thumbnails: { default: { url: "https://img.youtube.com/example.jpg" } }
                }
              }
            ]
          })
        };
      }
      return {
        ok: false,
        json: async () => ({})
      };
    }) as unknown as typeof fetch;
    const dom = createMusicTapDom(config, {
      fetch: fetchMock,
      setupWindow(window) {
        const win = window as unknown as Record<string, unknown>;
        win.google = {
          accounts: {
            oauth2: {
              initTokenClient: vi.fn((tokenOptions: {
                callback: (response: { access_token?: string; error?: string }) => void;
              }) => {
                requestAccessToken.mockImplementation(() => {
                  tokenOptions.callback({ access_token: "youtube-token" });
                });
                return { requestAccessToken };
              })
            }
          }
        };
      }
    });
    await flushDom();
    const document = dom.window.document;

    document.getElementById("addButton")?.click();
    (document.querySelector('[data-select-provider="youtube"]') as HTMLButtonElement).click();
    const input = document.getElementById("linkInput") as HTMLInputElement;
    input.value = "fred again delilah";
    document.getElementById("linkForm")?.dispatchEvent(
      new dom.window.Event("submit", { bubbles: true, cancelable: true })
    );
    await flushDom();
    await flushDom();

    expect(requestAccessToken).toHaveBeenCalledWith({ prompt: "consent" });
    const youtubeCall = vi.mocked(fetchMock).mock.calls.find(([request]) =>
      String(request).includes("youtube/v3/search")
    );
    expect(youtubeCall?.[1]?.headers).toEqual({ Authorization: "Bearer youtube-token" });
    expect(document.getElementById("linkHint")?.textContent).toBe("1 song found");
    expect(document.querySelector(".music-result")?.textContent).toContain("Fred again.. - Delilah");

    (document.querySelector(".music-result") as HTMLButtonElement).click();
    await flushDom();

    expect(document.getElementById("trackTitle")?.textContent).toBe("Fred again.. - Delilah");
    expect(document.querySelector("#providerPlayer iframe")?.getAttribute("src")).toContain(
      "abc123xyz00"
    );
    expect(document.getElementById("playButton")?.getAttribute("aria-label")).toBe("Pause");
    dom.window.close();
  });

  it("searches YouTube Music playlists and embeds the selected playlist", async () => {
    const config = {
      spotifyClientId: "",
      googleClientId: "google-client",
      appleMusicDeveloperToken: "",
      appleMusicStorefront: "us"
    };
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/musictap/config")) {
        return {
          ok: true,
          json: async () => config
        };
      }
      if (url.includes("youtube/v3/search")) {
        return {
          ok: true,
          json: async () => ({
            items: [
              {
                id: { playlistId: "PL1234567890" },
                snippet: {
                  title: "Late night focus",
                  channelTitle: "MusicTap",
                  thumbnails: { default: { url: "https://img.youtube.com/playlist.jpg" } }
                }
              }
            ]
          })
        };
      }
      return {
        ok: false,
        json: async () => ({})
      };
    }) as unknown as typeof fetch;
    const dom = createMusicTapDom(config, {
      fetch: fetchMock,
      setupWindow(window) {
        window.sessionStorage.setItem("musictap_google_token", "youtube-token");
      }
    });
    await flushDom();
    const document = dom.window.document;

    document.getElementById("addButton")?.click();
    (document.querySelector('[data-select-provider="youtube"]') as HTMLButtonElement).click();
    (document.querySelector('[data-content-kind="playlist"]') as HTMLButtonElement).click();
    const input = document.getElementById("linkInput") as HTMLInputElement;
    input.value = "late night focus";
    document.getElementById("linkForm")?.dispatchEvent(
      new dom.window.Event("submit", { bubbles: true, cancelable: true })
    );
    await flushDom();

    const youtubeCall = vi.mocked(fetchMock).mock.calls.find(([request]) =>
      String(request).includes("youtube/v3/search")
    );
    expect(String(youtubeCall?.[0])).toContain("type=playlist");
    expect(String(youtubeCall?.[0])).not.toContain("videoCategoryId=10");
    expect(document.getElementById("linkHint")?.textContent).toBe("1 playlist found");
    expect(document.querySelector(".music-result")?.textContent).toContain("Late night focus");

    (document.querySelector(".music-result") as HTMLButtonElement).click();
    await flushDom();

    const playerOptions = (
      dom.window as unknown as {
        lastYouTubePlayerOptions?: { playerVars?: Record<string, unknown> };
      }
    ).lastYouTubePlayerOptions;
    expect(document.getElementById("trackTitle")?.textContent).toBe("Late night focus");
    expect(playerOptions?.playerVars?.list).toBe("PL1234567890");
    expect(document.getElementById("playButton")?.getAttribute("aria-label")).toBe("Pause");
    dom.window.close();
  });

  it("searches Spotify playlists when Spotify is already connected", async () => {
    const config = {
      spotifyClientId: "spotify-client",
      googleClientId: "",
      appleMusicDeveloperToken: "",
      appleMusicStorefront: "us"
    };
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/musictap/config")) {
        return {
          ok: true,
          json: async () => config
        };
      }
      if (url.includes("api.spotify.com/v1/search")) {
        return {
          ok: true,
          json: async () => ({
            playlists: {
              items: [
                {
                  id: "spotify-playlist",
                  name: "Morning lift",
                  owner: { display_name: "Ari" },
                  images: [{ url: "https://i.scdn.co/image.jpg" }],
                  external_urls: { spotify: "https://open.spotify.com/playlist/spotify-playlist" },
                  uri: "spotify:playlist:spotify-playlist"
                }
              ]
            }
          })
        };
      }
      return {
        ok: false,
        json: async () => ({})
      };
    }) as unknown as typeof fetch;
    const dom = createMusicTapDom(config, {
      fetch: fetchMock,
      setupWindow(window) {
        window.sessionStorage.setItem("musictap_spotify_token", "spotify-token");
      }
    });
    await flushDom();
    const document = dom.window.document;

    document.getElementById("addButton")?.click();
    (document.querySelector('[data-content-kind="playlist"]') as HTMLButtonElement).click();
    const input = document.getElementById("linkInput") as HTMLInputElement;
    input.value = "morning";
    document.getElementById("linkForm")?.dispatchEvent(
      new dom.window.Event("submit", { bubbles: true, cancelable: true })
    );
    await flushDom();

    const spotifyCall = vi.mocked(fetchMock).mock.calls.find(([request]) =>
      String(request).includes("api.spotify.com/v1/search")
    );
    expect(String(spotifyCall?.[0])).toContain("type=playlist");
    expect(spotifyCall?.[1]?.headers).toEqual({ Authorization: "Bearer spotify-token" });
    expect(document.getElementById("linkHint")?.textContent).toBe("1 playlist found");
    expect(document.querySelector(".music-result")?.textContent).toContain("Morning lift");

    (document.querySelector(".music-result") as HTMLButtonElement).click();
    await flushDom();

    expect(document.getElementById("trackTitle")?.textContent).toBe("Morning lift");
    expect(document.getElementById("providerLabel")?.textContent).toBe("Spotify playlist");
    dom.window.close();
  });

  it("connects Apple Music and resumes a playlist search", async () => {
    const config = {
      spotifyClientId: "",
      googleClientId: "",
      appleMusicDeveloperToken: "apple-token",
      appleMusicStorefront: "us"
    };
    const authorize = vi.fn(async () => undefined);
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/musictap/config")) {
        return {
          ok: true,
          json: async () => config
        };
      }
      if (url.includes("api.music.apple.com")) {
        return {
          ok: true,
          json: async () => ({
            results: {
              playlists: {
                data: [
                  {
                    id: "pl.apple",
                    attributes: {
                      name: "Sunset run",
                      curatorName: "Apple Music Fitness",
                      url: "https://music.apple.com/us/playlist/pl.apple",
                      artwork: { url: "https://is1-ssl.mzstatic.com/image/{w}x{h}.jpg" }
                    }
                  }
                ]
              }
            }
          })
        };
      }
      return {
        ok: false,
        json: async () => ({})
      };
    }) as unknown as typeof fetch;
    const dom = createMusicTapDom(config, {
      fetch: fetchMock,
      setupWindow(window) {
        const win = window as unknown as Record<string, unknown>;
        win.MusicKit = {
          configure: vi.fn(async () => undefined),
          getInstance: vi.fn(() => ({ authorize }))
        };
      }
    });
    await flushDom();
    const document = dom.window.document;

    document.getElementById("addButton")?.click();
    (document.querySelector('[data-select-provider="apple"]') as HTMLButtonElement).click();
    (document.querySelector('[data-content-kind="playlist"]') as HTMLButtonElement).click();
    const input = document.getElementById("linkInput") as HTMLInputElement;
    input.value = "run";
    document.getElementById("linkForm")?.dispatchEvent(
      new dom.window.Event("submit", { bubbles: true, cancelable: true })
    );
    await flushDom();
    await flushDom();

    const appleCall = vi.mocked(fetchMock).mock.calls.find(([request]) =>
      String(request).includes("api.music.apple.com")
    );
    expect(authorize).toHaveBeenCalledOnce();
    expect(String(appleCall?.[0])).toContain("types=playlists");
    expect(appleCall?.[1]?.headers).toEqual({ Authorization: "Bearer apple-token" });
    expect(document.getElementById("linkHint")?.textContent).toBe("1 playlist found");

    (document.querySelector(".music-result") as HTMLButtonElement).click();
    await flushDom();

    expect(document.getElementById("trackTitle")?.textContent).toBe("Sunset run");
    expect(
      document.querySelector("#providerPlayer iframe")?.getAttribute("src")
    ).toBe("https://embed.music.apple.com/us/playlist/pl.apple");
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
