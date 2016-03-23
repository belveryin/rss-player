import { install } from 'source-map-support';
install();

import 'babel-polyfill';

import _ from 'lodash';
import Player from 'player';

const player = new Player();
let startToPlay = false;
let playlist;

const setCurrentTrackIfEmpty = () => {
    if (!playlist.currentTrack || !playlist.currentTrack.path) {
        playlist.currentTrack = playlist.tracks[playlist.trackList[0]];
    }
};

export default {
    init: config => {
        playlist = config.playlist;
        // start to play when there is a track and the loaded status is playing
        if (playlist.playing) {
            startToPlay = true;
        }
    },

    play: () => {
        setCurrentTrackIfEmpty();

        playlist.playing = true;
        player.play();
    },

    addTrack: (track) => {
        track = _.clone(track);
        track.id = track.url;

        playlist.trackList.push(track);
        playlist.tracks[track.id] = track;

        player.add(track.path);

        setCurrentTrackIfEmpty();

        // start to play when there is a track and the loaded status was playing
        if (startToPlay) {
            startToPlay = false;
            player.play();
        }
    }
};
