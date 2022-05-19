const imagesLoaded = require('imagesloaded');

/**
 * Map number x from range [a, b] to [c, d] 
 * @param {Number} x - changing value
 * @param {Number} a 
 * @param {Number} b
 * @param {Number} c
 * @param {Number} d
 */
const map = (x, a, b, c, d) => (x - a) * (d - c) / (b - a) + c;

/**
 * Preload images
 * @param {String} selector - Selector/scope from where images need to be preloaded. Default is 'img'
 */
const preloadImages = (selector = 'img') => {
    return new Promise((resolve) => {
        imagesLoaded(document.querySelectorAll(selector), {background: true}, resolve);
    });
};

export {
    map,
    preloadImages
};