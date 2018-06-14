const clientID = '5bfef060ea12467299ca721da9e9e8b5';
const redirectURI = 'http://jammmballs.surge.sh';
//const redirectURI = 'http://localhost:3000/';
let userAccessToken = '';

const Spotify = {
  getAccessToken() {
    if (userAccessToken) {
      return userAccessToken;
    }
    const urlToken = window.location.href.match(/access_token=([^&]*)/);
    const urlExpiresIn = window.location.href.match(/expires_in=([^&]*)/);
    console.log(urlToken);
    console.log(urlExpiresIn);
    if (urlToken && urlExpiresIn) {
      userAccessToken = urlToken[1];
      const expiresIn = urlExpiresIn[1];
      window.setTimeout(() => userAccessToken = '', expiresIn * 1000);
      window.history.pushState('Access Token', null, '/');
      return userAccessToken;
    } else {
      window.location = `https://accounts.spotify.com/authorize?client_id=${clientID}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`;
    }
  },
  search(term) {
    userAccessToken = this.getAccessToken();
    return fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {
      headers: {
        Authorization: `Bearer ${userAccessToken}`
      }
    }).then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Request failed!');
    }, networkError => console.log(networkError.message)).then(jsonResponse => {
      if (jsonResponse.tracks.items) {
        return jsonResponse.tracks.items.map(track => {
          return {
            id: track.id,
            name: track.name,
            artist: track.artists[0].name,
            album: track.album.name,
            uri: track.uri
          }
        });
      } else {
        return [];
      }
    });
  },
  savePlaylist(playlistName, trackURIs) {
    if (playlistName && trackURIs) {
      userAccessToken = this.getAccessToken();
      const headers = {
        Authorization: `Bearer ${userAccessToken}`
      };
      const createPlaylistHeaders = {
        headers: headers,
        method: 'POST',
        body: JSON.stringify({name: playlistName})
      };
      const addTracksHeaders = {
        headers: headers,
        method: 'POST',
        body: JSON.stringify({uris: trackURIs})
      }
      let userID = '';
      let playlistID = '';
      return fetch('https://api.spotify.com/v1/me', {headers: headers}).then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error('Request failed!');
      }, networkError => console.log(networkError.message)).then(jsonResponse => {
        userID = jsonResponse.id;
        return fetch(`https://api.spotify.com/v1/users/${userID}/playlists`, createPlaylistHeaders).then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('Request failed!');
        }, networkError => console.log(networkError.message)).then(jsonResponse => {
          playlistID = jsonResponse.id;
          return fetch(`https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks`, addTracksHeaders)
        });
      });
    } else {
      return;
    }
  }
}

export default Spotify;
