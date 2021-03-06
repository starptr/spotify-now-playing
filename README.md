# spotify-now-playing
API to access your currently playing spotify song. Rewritten version of now-playing-api.

## Deploy

1. `touch .env` at the project root and define the following values:

```
SPOTIFY_CLIENTID=
SPOTIFY_CLIENTSECRET=
SPOTIFY_REDIRECTURI=
EMAIL_EXPECTED=
```

  - `SPOTIFY_CLIENTID` and `SPOTIFY_CLIENTSECRET` are obtained from an app in [the Spotify developer dashboard](https://developer.spotify.com/dashboard/applications).
  - `SPOTIFY_REDIRECTURI` is the same value as set in the same app as above (i.e. URL to the callback endpoint).
  - `EMAIL_EXPECTED` is a passive check to ensure that the intended user is authenticating.
  
2. Run these:

```
$ npm build
$ npm start
```
