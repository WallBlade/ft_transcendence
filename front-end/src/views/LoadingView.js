import gsap from 'gsap';

export default class LoadingView {
    name = 'LoadingView';
    constructor() {
        this.cssPath = 'src/styles/loading.css';
        this.container = null;
    }

    loadCss() {
		return new Promise((resolve, reject) => {
			if (!document.querySelector(`link[href="${this.cssPath}"]`)) {
				const cssLink = document.createElement('link');
				cssLink.href = this.cssPath;
				cssLink.rel = 'stylesheet';
				cssLink.type = 'text/css';
				cssLink.onload = resolve;
				cssLink.onerror = reject;
				document.head.appendChild(cssLink);
			} else {
				resolve();
			}
		});
	}

    async render() {
        await this.loadCss();
        this.container = document.createElement('div');
        this.container.className = 'loading-container';
        
        const loader = document.createElement('div');
        loader.className = 'loader';

        const text = document.createElement('p');
        text.textContent = 'Loading...';

        loader.appendChild(text);

        const loaderBar = document.createElement('div');
        loaderBar.className = 'loader-bar';

        this.createBox(loaderBar, 'box1');
        this.createBox(loaderBar, 'box2');
        this.createBox(loaderBar, 'box3');
        this.createBox(loaderBar, 'box4');

        loader.appendChild(loaderBar);
        this.container.appendChild(loader);

        this.box1 = loaderBar.querySelector('.box1');
        this.box2 = loaderBar.querySelector('.box2');
        this.box3 = loaderBar.querySelector('.box3');
        this.box4 = loaderBar.querySelector('.box4');

        this.animateBoxes();

        return this.container;
    }

    createBox (loaderBar, name) {
        const box = document.createElement('div');
        box.className = name;

        loaderBar.appendChild(box);
    }

    animateBoxes() {
        const tl = gsap.timeline({});
        tl.to(this.box1, { duration: 0.5, opacity: 1})
        .to(this.box2, { duration: 0.5, opacity: 1})
        .to(this.box3, { duration: 0.5, opacity: 1})
        .to(this.box4, { duration: 0.5, opacity: 1})
    }

    // Unload CSS when the view is not active
    unloadCss() {
        const cssLink = document.querySelector(`link[href="${this.cssPath}"]`);
        if (cssLink) {
            document.head.removeChild(cssLink);
        }
    }

    // Cleanup method to reset view state when leaving the page
    cleanup() {
        this.unloadCss();
    }

    remove() {
        if (this.container) {
            this.container.remove();
        }
    }
}
