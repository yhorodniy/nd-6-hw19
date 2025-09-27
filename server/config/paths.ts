import path from 'path';

export const PROJECT_ROOT = path.resolve(__dirname, '../..');

export const CLIENT_DIST = path.resolve(PROJECT_ROOT, 'client/dist');
export const CLIENT_INDEX = path.resolve(CLIENT_DIST, 'index.html');
export const SERVER_LOGS = path.resolve(PROJECT_ROOT, 'server/logs');
