let DEBUG = false;

function setDebug(value) {
    DEBUG = value;
}

function debugLog(...args) {
    if (DEBUG) {
        console.log("[DEBUG]", ...args);
    }
}

module.exports = { debugLog, setDebug };