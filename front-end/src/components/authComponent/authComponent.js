import SignInView from "../../views/SignInView";
import SignUpView from "../../views/SignUpView";
import gsap from "gsap";

export default class AuthComponent {
	constructor(page, state) {
		this.state = state;
		this.page = page;
		this.authContainer = null;
		this.rootDiv = document.getElementById("app");
		this.cssLink = "src/components/authComponent/authComponent.css";
		this.signInView = new SignInView(this);
		this.signUpView = new SignUpView(this);
	}

	loadCss() {
		if (!document.querySelector(`link[href="src/styles/auth.css"]`)) {
			const cssLink = document.createElement("link");
			cssLink.href = this.cssLink;
			cssLink.rel = "stylesheet";
			cssLink.type = "text/css";
			document.head.appendChild(cssLink);
		}
	}

	async render() {
		this.loadCss();

		this.rootDiv.innerHTML = "";

		this.authContainer = document.createElement("div");
		this.authContainer.className = "auth-container";
		this.authContainer.id = "authContainer";

		switch (this.page) {
			case "/sign-in":
				this.createContainer("signin");
				break;
			case "/sign-up":
				this.createContainer("signup");
				break;
			default:
				this.createContainer("signin");
		}

		return this.authContainer;
	}

	async createContainer(type) {
		const authContent = document.createElement("div");
		authContent.className = `auth ${type}`;
		this.authContainer.appendChild(authContent);

		let content;

		switch (type) {
			case "signin":
				content = await this.signInView.render();
				break;
			case "signup":
				content = await this.signUpView.render();
				break;
			default:
				content = await this.signInView.render();
		}

		gsap.set(content, { opacity: 0 });

		authContent.appendChild(content);

		await gsap.to(content, { duration: 1, opacity: 1, ease: "power4.out" });
	}

	async signInToSignUp() {
		const signInViewContent = document.querySelector(".signin-container");
		await gsap.to(signInViewContent, {
			duration: 0.5,
			opacity: 0,
			ease: "power4.out",
		});

		const authContainer = document.querySelector(".auth");
		await gsap.to(authContainer, {
			duration: 0.5,
			width: "50vw",
			ease: "power4.out",
		});

		this.state.setStateNotify({ currentView: "/sign-up" });
	}

	async signUpToSignIn() {
		const signUpViewContent = document.querySelector(".signup-container");
		await gsap.to(signUpViewContent, {
			duration: 0.5,
			opacity: 0,
			ease: "power4.out",
		});

		const authContainer = document.querySelector(".auth");
		await gsap.to(authContainer, {
			duration: 0.7,
			width: "25vw",
			ease: "power4.out",
		});

		this.state.setStateNotify({ currentView: "/sign-in" });
	}

	closeAuth() {
		const authContainer = document.getElementById("authContainer");
		gsap.to(authContainer, { duration: 0.5, opacity: 0, ease: "power4.out" });

		this.rootDiv.removeChild(authContainer);

		this.state.setStateNotify({ currentView: "/" });
	}

	async navigateToHome(type) {
		let content;
		
		if (type === 'signin') {
			content = document.querySelector('.signin-container');
		} else {
			content = document.querySelector('.signup-container');
		}
		
		await gsap.to(content, { duration: 0.5, opacity: 0, ease: 'power4.out' });
		
		const authContent = document.querySelector('.auth');
		const tl = gsap.timeline();
		tl.to(authContent, { duration: 0.5, width: "100vw", ease: 'power4.out' }, 0)
			.to(authContent, { duration: 0.5, height: "100vh", ease: 'power4.out' }, 0)
			.to(authContent, { duration: 0.5, opacity: 0, ease: 'power4.out' }, 0.1);

		await tl.play();

		this.state.setStateNotify({currentView: "/home"});
	}
}
