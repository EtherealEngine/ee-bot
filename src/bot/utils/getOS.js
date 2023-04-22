"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOS = void 0;
function getOS() {
    var platform = process.platform;
    if (platform.includes('darwin')) {
        return 'macOS';
    }
    else if (platform.includes('win32')) {
        return 'Windows';
    }
    else if (platform.includes('linux')) {
        return 'Linux';
    }
    return 'other';
}
exports.getOS = getOS;
