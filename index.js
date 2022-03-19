import 'dotenv/config'
import SpotifyApi from 'spotify-web-api-node'
import express from 'express'
import NodeCache from 'node-cache'
import _ from "lodash"

// TODO: prettier? linter?

const cache = new NodeCache({
  stdTTL: 0.5,
});

let app = express();
app.enable("strict routing");

// TODO: cors?

var isTokenValid = false;
var nowPlayingData;

const scopes = ["user-read-private", "user-read-currently-playing", "user-read-playback-state", "user-read-email"];
const spotifyApi = new SpotifyApi({
		clientId: process.env.SPOTIFY_CLIENTID,
		clientSecret: process.env.SPOTIFY_CLIENTSECRET,
		redirectUri: process.env.SPOTIFY_REDIRECTURI,
});
const authorizeUrl = spotifyApi.createAuthorizeURL(scopes);
console.log(`Authorization URL: ${authorizeUrl}`);

app.get("/now-playing", async (req, res) => {
  if (isTokenValid) {
    if (cache.get("isFresh")) {
      console.log("cache is still fresh!");
    } else {
      nowPlayingData = await spotifyApi.getMyCurrentPlaybackState({})
          .then(data => data.body)
          .catch(err => console.error(`Can't get current playback: ${err}`));
      if (_.isEmpty(nowPlayingData)) {
        nowPlayingData = { is_not_playing: true };
      }
      cache.set("isFresh", true);
    }
    res.json(nowPlayingData);
  } else {
    res.json({
      error: "Token is invalid!",
    });
  }
});

app.get("/auth", async (req, res) => {
  if (isTokenValid) {
    res.send("Token is already valid!");
  } else {
    if (req.query.code) {
      // code param is passed from the Spotify oauth callback
      let { code } = req.query;
      console.log(`Callback code: ${code}`);

      await spotifyApi.authorizationCodeGrant(code)
        .then(data => {
          spotifyApi.setAccessToken(data.body["access_token"]);
          spotifyApi.setRefreshToken(data.body["refresh_token"]);
          console.log(`Auth successful, data: ${data}`);
          isTokenValid = true;
        });

      await spotifyApi.getMe()
        .then(data => {
          if (data.body.email === process.env.EMAIL_EXPECTED) {
            console.log("Email matches expected!");
            res.send("OAuth code received!");
          } else {
            console.log("Email does not match expected!");
            isTokenValid = false;
            res.send("Unexpected email address!");
          }
        }).catch(err => {
          console.error(`Can't get user info: ${err}`);
          res.send("Can't get user info.");
        });
    } else {
      // a browser client visited this endpoint to perform OAuth
      res.redirect(authorizeUrl);
    }
  }
});

async function token_refresher() {
  spotifyApi.refreshAccessToken()
    .then(data => {
      console.log("Access token refreshed!");
      spotifyApi.setAccessToken(data.body["access_token"]);
      isTokenValid = true;
    }).catch(err => {
      console.error(`Token refresh failed! Did you log in? ${err}`);
      isTokenValid = false;
    })
}

const server = app.listen(process.env.PORT || 3000, () => {
  console.log(`Server listening to port ${process.env.PORT || 3000}`);
  setInterval(token_refresher, 1000 * 60 * 5);
});
