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
import net from 'net';

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

const COMMANDS = ['play', 'pause', 'next'];
// run player command
const playerCommand = (cmd) => {
    player[cmd]();
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
    return Promise.resolve();
};

// create a server (socket) and listen in port 3000 for messages
const startServer = () => {
    net.createServer(function(socket){
        socket.on('data', function(data){
            playerCommand(data.toString());
        });
        return Promise.resolve();
    }).listen(3000);
};

// send cmd via socket to port 3000
const sendCmd = (cmd) => {
    const client = new net.Socket();
    client.connect(3000, () => {
        client.write(cmd);
        client.destroy();
    });
};

const init = () => {
    createFolderRecursive(BASE_PATH)
        .then(createFolderRecursive(FILES_PATH))
        .then(loadConfig)
        .then(config => {
            player.init(config);
            player.play();
        })
        .then(startRssReader)
        .then(startServer);
};

if (process.argv.length && COMMANDS.includes(process.argv[2])) {
    sendCmd(process.argv[2]);
} else {
    init();
}
