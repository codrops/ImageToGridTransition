import { preloadImages, map } from './utils';
import { gsap } from 'gsap';
import { Flip } from 'gsap/Flip';
gsap.registerPlugin(Flip);

let winsize = {width: window.innerWidth, height: window.innerHeight};
window.addEventListener('resize', () => winsize = {width: window.innerWidth, height: window.innerHeight});

const DOM = {
    // the grid
    grid: document.querySelector('.grid'),
    // enter button
    enterCtrl: document.querySelector('.content__enter'),
    // back button
    backCtrl: document.querySelector('.button-back'),
    
    // initial image element that we want to move into the final grid
    contentItem: document.querySelector('.content__item-img'),
    // where to insert the initial image element when the grid is open
    gridItemTarget: document.querySelector('.grid__item--target'),
    // and when it's closed 
    gridItemOriginalTarget: document.querySelector('.content__item'),
    
    // initial title element spans
    contentTitleTexts: document.querySelectorAll('.content__item-title > span'),
    // grid title element spans
    gridTitleTexts: document.querySelectorAll('.grid__item--title > span'),
    
    // all grid items (except the .grid__item--target, .grid__item--back and grid__item--title)
    gridItems: document.querySelectorAll('.grid > .grid__item:not(.grid__item--target):not(.grid__item--title):not(.grid__item--back)'),
};

const animationSettings = {
    duration: 1,
    ease: 'expo.inOut'
};

const body = document.body;
// original bg color
const bgcolor = getComputedStyle(body).getPropertyValue('--color-bg');

let isAnimating = false;

// Calculates the position of an element when the element is [distanceDifference]px more far from the center of the page than it was previously
const getInitialPosition = (element, distanceDifference = 400) => {
    const elCenter = {x: element.offsetLeft + element.offsetWidth/2, y: element.offsetTop + element.offsetHeight/2};
    const angle = Math.atan2(Math.abs(winsize.height/2 - elCenter.y), Math.abs(winsize.width/2 - elCenter.x));
    
    let x = Math.abs(Math.cos(angle) * distanceDifference);
    let y = Math.abs(Math.sin(angle) * distanceDifference);
    
    return {
        x: elCenter.x < winsize.width/2 ? x*-1 : x,
        y: elCenter.y < winsize.height/2 ? y*-1 : y
    };
};

// Distance from the element's center point to the center of the page
const getDistance = element => {
    const elCenter = {x: element.offsetLeft + element.offsetWidth/2, y: element.offsetTop + element.offsetHeight/2};
    return Math.hypot(elCenter.x - winsize.width/2, elCenter.y - winsize.height/2);
}

// opens up the grid
const showGrid = () => {

    if ( isAnimating ) return;
    isAnimating = true;

    const tl = gsap.timeline({
        onComplete: () => {
            isAnimating = false;
        }
    })
    .addLabel('start', 0)
    // hide enter button
    .to(DOM.enterCtrl, {
        duration: animationSettings.duration,
        ease: animationSettings.ease,
        opacity: 0,
        onComplete: () => gsap.set(DOM.enterCtrl, {pointerEvents: 'none'})
    }, 'start')
    // use the gsap Flip plugin to animate the main image to the grid
    .add(() => {

        DOM.grid.classList.add('grid--open');
    
        const imageState = Flip.getState(DOM.contentItem);
        DOM.gridItemTarget.appendChild(DOM.contentItem);
        Flip.from(imageState, {
            duration: animationSettings.duration,
            ease: animationSettings.ease,
        });
        
    }, 'start');

    for (let item of DOM.gridItems) {
        const {x,y} = getInitialPosition(item);
        const delay = map(getDistance(item), 0, 1000, 0, 0.4);
        
        tl
        // animate in the grid item's labels
        .to(item.querySelector('.oh__inner'), {
            duration: animationSettings.duration*1.7,
            ease: animationSettings.ease,
            startAt: {yPercent: 101},
            yPercent: 0,
            delay: delay,
        }, 'start')
        // Set the original positions of the grid items and animate them in
        // The position will be relative to the center of the page and outwards
        .set(item, {
            x: x,
            y: y,
            opacity: 0
        }, 'start')
        .to(item, {
            duration: animationSettings.duration,
            ease: 'expo',
            x: 0,
            y: 0,
            delay: delay,
            opacity: 1
        }, 'start+=0.4')
    }
    
    tl
    // Animate in the main image label
    .to(DOM.gridItemTarget.querySelector('.oh__inner'), {
        duration: animationSettings.duration*1.7,
        ease: animationSettings.ease,
        startAt: {yPercent: 101},
        yPercent: 0
    }, 'start')
    // Animate out the big title spans and animate in the small title spans
    .to(DOM.contentTitleTexts, {
        duration: animationSettings.duration,
        ease: animationSettings.ease,
        yPercent: pos => pos%2 ? 100 : -100,
        opacity: 0
    }, 'start')
    .to(DOM.gridTitleTexts, {
        duration: animationSettings.duration,
        ease: animationSettings.ease,
        startAt: {
            xPercent: pos => pos%2 ? 50 : -50,
            opacity: 0
        },
        xPercent: 0,
        opacity: 1
    }, 'start')
    // Animate the back button
    .to(DOM.backCtrl, {
        duration: animationSettings.duration,
        ease: animationSettings.ease,
        startAt: {
            xPercent: 40,
            opacity: 0
        },
        xPercent: 0,
        opacity: 1
    }, 'start')
    // Animate the color of the page
    .to(body, {
        duration: animationSettings.duration,
        ease: animationSettings.ease,
        backgroundColor: '#CDD1CD'
    }, 'start');

};

const hideGrid = () => {

    if ( isAnimating ) return;
    isAnimating = true;

    const tl = gsap.timeline({
        onComplete: () => {
            DOM.grid.classList.remove('grid--open');
            isAnimating = false;
        }
    })
    .addLabel('start', 0)
    .to(body, {
        duration: animationSettings.duration,
        ease: animationSettings.ease,
        backgroundColor: bgcolor
    }, 'start')
    .to(DOM.gridItemTarget.querySelector('.oh__inner'), {
        duration: animationSettings.duration,
        ease: animationSettings.ease,
        yPercent: 101
    }, 'start');

    for (let item of DOM.gridItems) {
        const {x,y} = getInitialPosition(item);
        const delay = map(getDistance(item), 0, 1000, 0.4, 0);

        tl
        .to(item, {
            duration: animationSettings.duration,
            ease: animationSettings.ease,
            x: x,
            y: y,
            opacity: 0,
            delay: delay
        }, 'start')
        .to(item.querySelector('.oh__inner'), {
            duration: animationSettings.duration*.5,
            ease: animationSettings.ease,
            yPercent: 101,
            delay: delay,
        }, 'start')
    }

    tl
    .to(DOM.gridTitleTexts, {
        duration: animationSettings.duration,
        ease: animationSettings.ease,
        xPercent: pos => pos%2 ? 50 : -50,
        opacity: 0
    }, 'start')
    .to(DOM.backCtrl, {
        duration: animationSettings.duration,
        ease: animationSettings.ease,
        xPercent: 20,
        opacity: 0
    }, 'start')
    .to(DOM.contentTitleTexts, {
        duration: animationSettings.duration,
        ease: animationSettings.ease,
        yPercent: 0,
        opacity: 1
    }, 'start+=0.4')
    .to(DOM.enterCtrl, {
        duration: animationSettings.duration,
        ease: animationSettings.ease,
        opacity: 1,
        onComplete: () => gsap.set(DOM.enterCtrl, {pointerEvents: 'auto'})
    }, 'start+=0.4')
    .add(() => {

        const imageState = Flip.getState(DOM.contentItem);
        DOM.gridItemOriginalTarget.appendChild(DOM.contentItem);
        Flip.from(imageState, {
            duration: animationSettings.duration,
            ease: animationSettings.ease,
        });
        
    }, 'start+=0.4');

};

DOM.enterCtrl.addEventListener('click', () => showGrid());
DOM.backCtrl.addEventListener('click', () => hideGrid());

// Preload images
preloadImages('.grid__item-img').then( _ => document.body.classList.remove('loading'));



