# MusicTap provider setup

MusicTap continues to accept shared provider links with no credentials. Account-connected search requires the GitHub Actions repository secrets below. The production workflow forwards configured secrets to Vercel automatically.

## Spotify

1. Create a Spotify developer app.
2. Add `https://www.ideamuses.com/musictap` as an exact redirect URI.
3. Add `SPOTIFY_CLIENT_ID` as a GitHub Actions repository secret.

MusicTap uses Spotify's Authorization Code with PKCE flow. It does not require a client secret.

## YouTube Music

1. Create a Google OAuth web client.
2. Enable YouTube Data API v3 for the project.
3. Add `https://www.ideamuses.com` as an authorized JavaScript origin.
4. Add `GOOGLE_OAUTH_CLIENT_ID` as a GitHub Actions repository secret.

MusicTap uses the YouTube Data API for music-video search and the YouTube IFrame Player API for playback.

## Apple Music

1. Create a MusicKit identifier and private key in Apple Developer.
2. Generate a MusicKit developer token.
3. Add `APPLE_MUSIC_DEVELOPER_TOKEN` and optionally `APPLE_MUSIC_STOREFRONT` as GitHub Actions repository secrets.

MusicKit developer tokens expire and must be rotated before expiration.

## References

- [Spotify PKCE flow](https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow)
- [Spotify search](https://developer.spotify.com/documentation/web-api/reference/search)
- [Google OAuth token model](https://developers.google.com/identity/oauth2/web/guides/use-token-model)
- [YouTube search](https://developers.google.com/youtube/v3/docs/search/list)
- [MusicKit on the Web](https://developer.apple.com/documentation/musickitjs)
