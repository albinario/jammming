import React, { Component } from 'react';
import './App.css';
import SearchBar from '../SearchBar/SearchBar';
import SearchResults from '../SearchResult/SearchResult';
import Playlist from '../Playlist/Playlist';
import Spotify from '../../util/Spotify';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchResults: [],
      playlistName: 'Enter name of Playlist',
      playlistTracks: [],
      collaborative: false
    }
    this.addTrack = this.addTrack.bind(this);
    this.removeTrack = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
    this.toggleCollaborative = this.toggleCollaborative.bind(this);
    this.search = this.search.bind(this);
  }
  addTrack(track) {
    if (this.state.playlistTracks.find(savedTrack => savedTrack.id === track.id)) {
        return;
    }
    let playlist = this.state.playlistTracks;
    playlist.push(track);
    this.setState({playlistTracks: playlist});
  }
  removeTrack(track) {
    const index = this.state.playlistTracks.findIndex(checkTrack => checkTrack.id === track.id);
    const updatedPlaylist = this.state.playlistTracks;
    updatedPlaylist.splice(index, 1);
    this.setState({playlistTracks: updatedPlaylist});
  }
  updatePlaylistName(name) {
    this.setState({playlistName: name});
  }
  savePlaylist() {
    let trackURIs = [];
    this.state.playlistTracks.forEach(track => {
      trackURIs.push('spotify:track:'+track.id);
    });
    Spotify.savePlaylist(this.state.playlistName, trackURIs, this.state.collaborative);
    this.setState({
      searchResults: [],
      playlistName: 'Enter name of Playlist',
      playlistTracks: [],
      collaborative: false
    });
  }
  toggleCollaborative() {
    this.setState({collaborative: !this.state.collaborative});
  }
  search(term) {
    Spotify.search(term).then(tracks => {
      this.setState({
        searchResults: tracks
      });
    });
  }
  render() {
    return (
      <div>
        <h1>Ja<span className="highlight">mmm</span>ing</h1>
        <div className="App">
          <SearchBar
            onSearch={this.search} />
          <div className="App-playlist">
            <SearchResults
              searchResults={this.state.searchResults}
              onAdd={this.addTrack} />
            <Playlist
              playlistName={this.state.playlistName}
              playlistTracks={this.state.playlistTracks}
              onRemove={this.removeTrack}
              onNameChange={this.updatePlaylistName}
              collaborative={this.state.collaborative}
              onCollaborativeToggle={this.toggleCollaborative}
              onSave={this.savePlaylist} />
          </div>
        </div>
      </div>
    );
  }
}

export default App;
