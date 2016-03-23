import { install } from 'source-map-support';
install();

import 'babel-polyfill';

import expandTilde from 'expand-tilde';
import { existsPath, readJSONFile, createFolderRecursive, saveToFile } from './fileSystem';

const BASE_PATH = expandTilde('~/.rss-player/');
const PATHTOCONFIG_PATH = `${BASE_PATH}path_to_config.json`;
const DEFAULT_CONFIG_PATH = expandTilde('~/Dropbox/rss-player/config.json');
const DEFAULT_PATHTOCONFIG = {
    path: DEFAULT_CONFIG_PATH
};
const DEFAULT_CONFIG = {
    playlist: {
        tracks: {
            // 'http://xxx': {
            //     id: 'http://xxx',
            //     url: 'http://xxx',
            //     path: '~/Dropbox/rss-player/downloads/xxx.mp3',
            //     title: 'Saltamontes especial jazz',
            //     feedName: 'Saltamontes',
            //     feedEntryDescription: 'bla bla bla'
            // }
        },
        trackList: [
            // 'http://xxx'
        ],
        currentTrack: {
            // id: 'http://xxx',
            // timeElapsed: 0
        },
        playing: true
    }
};

const loadConfigFile = (path, defaultConfigContent) => existsPath(path)
    .then(exists => {
        if (exists) {
            return readJSONFile(path);
        } else {
            const folderPath = path.replace(/(.+\/)[^\/]+/, '$1');
            return createFolderRecursive(folderPath)
                .then(() => saveToFile(path, JSON.stringify(defaultConfigContent)))
                .then(() => defaultConfigContent);
        }
    });

const getPathToConfig = () => loadConfigFile(PATHTOCONFIG_PATH, DEFAULT_PATHTOCONFIG)
    .then(fileContent => fileContent.path);

const loadConfig = () => getPathToConfig()
    .then(path => loadConfigFile(path, DEFAULT_CONFIG));

export { loadConfig };
