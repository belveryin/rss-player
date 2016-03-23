import { install } from 'source-map-support';
install();

import 'babel-polyfill';

import { loadConfig } from './config';
import { existsPath, createFolderRecursive } from './fileSystem';
import fs from 'fs';
import expandTilde from 'expand-tilde';
import player from './player';
import http from 'http';
import url from 'url';
import RssFeedEmitter from 'rss-feed-emitter';

const BASE_PATH = expandTilde('~/.rss-player/');
const FILES_PATH = `${BASE_PATH}downloads/`;
const feeder = new RssFeedEmitter();

const saveTrackToFile = track => {
    return existsPath(track.path)
        .then(exists => new Promise((resolve) => {
            if (exists) {
                resolve(track);
            } else {
                // fetch and save the file
                const file = fs.createWriteStream(track.path);
                http.get(track.url, res => {
                    res.on('end', () => resolve(track));
                    res.pipe(file);
                });
            }
        }));
};


// preserve the original filename from the fileUrl
const getPath = fileUrl => `${FILES_PATH}${url.parse(fileUrl).pathname.split('/').pop()}`;
const onNewFeedItem = item => {
    const url = item['rss:enclosure']['@'].url;
    const track = {
        url: url,
        path: getPath(url),
        title: item.title,
        feedName: item.meta.title
    };
    saveTrackToFile(track)
        .then(player.addTrack);
};
const startRssReader = () => {
    feeder.add({
        url: 'http://api.rtve.es/api/programas/22070/audios.rss',
        refresh: 2000
    });
    feeder.on('new-item', onNewFeedItem);
};

const init = () => {
    createFolderRecursive(BASE_PATH)
        .then(createFolderRecursive(FILES_PATH))
        .then(loadConfig)
        .then(config => {
            player.init(config);
            player.play();
        })
        .then(startRssReader);
};

init();
