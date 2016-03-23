import { install } from 'source-map-support';
install();

import 'babel-polyfill';

import fs from 'fs';
import mkdirp from 'mkdirp';

export const existsPath = path => new Promise((resolve, reject) => {
    fs.stat(path, (err) => {
        if (err) {
            if (err.code == 'ENOENT') {
                // the folder doesn't exists
                resolve(false);
            } else {
                // something else went wrong
                reject(err);
            }
        } else {
            // the folder already exists
            resolve(true);
        }
    });
});

export const createFolderRecursive = path => new Promise((resolve, reject) => {
    mkdirp(path, err => {
        if (err) {
            return reject(err);
        }
        resolve();
    });
});

export const saveToFile = (path, text) => new Promise((resolve, reject) => {
    fs.writeFile(path, text, function(err) {
        if (err) {
            return reject(err);
        }
        resolve();
    });
});

export const readJSONFile = (path) => new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', function(err, data) {
        if (err) {
            return reject(err);
        }
        resolve(JSON.parse(data));
    });
});
