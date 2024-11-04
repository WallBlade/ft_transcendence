import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { gsap } from 'gsap';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

const cursor = {
	x: 0,
	y: 0,
};

window.addEventListener("mousemove", (event) => {
	cursor.x = event.clientX / sizes.width - 0.5;
	cursor.y = event.clientY / sizes.height - 0.5;
});

let camera, scene, renderer, animationFrameId, atari, header;
let atariLoaded = false;

// Raycasting for 3D objects to detect clicks
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener('click', onClick, false);
function onClick(event) {
	if (window.location.pathname !== '/') return;
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);

    if (intersects.length > 0) {
		const event = new CustomEvent('enterAtari');
		window.dispatchEvent(event);
    }
}

function createHeader() {
	const span = document.createElement('span');
	
	span.textContent = 'PONG  REVOLUTION';
	span.style.color = 'var(--primary)';
	span.style.fontSize = '15vh';
	span.style.position = 'absolute';
	span.style.whiteSpace = 'pre';
	span.style.fontFamily = 'pixer';
	span.style.zIndex = 100;

	const label = new CSS2DObject(span);
	label.position.set(0, 5.5, -2);
	return label;
}

function initThree(canvas) {
    // const container = document.getElementById('threeContainer');
    scene = new THREE.Scene();
	renderer = new THREE.WebGLRenderer({
		canvas: canvas,
		powerPreference: "high-performance",
		antialias: true,
	});

	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.setClearColor(new THREE.Color('#232324'), 1);
	camera = new THREE.PerspectiveCamera(
		90,
		sizes.width / sizes.height,
		0.1,
		50
	);
	camera.position.z = 8;
	scene.add(camera);
	let rotationData = { y: 0, x: 0.5, isdisabled: false };


	const tl = gsap.timeline({ paused: true });
	document.addEventListener('enterAtari', () => {
        if (atari) {
			tl
			.to(rotationData, {
				isdisabled: true,
				duration: 0,
			}, 0)
			.to(camera.position, {
				duration: 0.5,
				y: camera.position.y + 1,
				ease: "power4.in",
			}, 0)
			.to(atari.rotation, {
				duration: 1,
				y: Math.PI * 4,
				ease: "Power4.in",
			}, 0.5)
			.to(camera.position, {
				duration: 1.5,
				z: camera.position.z - 8.1,
				ease: "Power4.in",
			}, 0.5);
			tl.play().then(() => {
				scene.remove(atari);
				tl.clear();
			});
		}
	});

	document.addEventListener('leaveAtari', () => {
        if (atari) {
			scene.add(atari);
			tl.reverse()
			.then(() => {
				rotationData.isdisabled = false;
			});
			tl.eventCallback("onReverseComplete", function() {
				tl.clear();
			});
		}
	});

	const rgbeLoader = new RGBELoader();
    rgbeLoader.load('./static/environmentMap/2k.hdr', (environmentMap) => {
	    environmentMap.mapping = THREE.EquirectangularReflectionMapping;
	    scene.environment = environmentMap;
	})

	const loader = new GLTFLoader();
	loader.load('./static/3DModels/pocket-arcade.glb', (gltf) => {
		gltf.scene.scale.set(1, 1, 1);
		gltf.scene.position.set(0, -2, 0);
		scene.add(gltf.scene);
		atari = gltf.scene;

		atariLoaded = true;

		const event = new CustomEvent('atariLoaded');
		window.dispatchEvent(event);
	});

	header = createHeader();
	scene.add(header);
	
	window.addEventListener('resize', () => {
		sizes.width = window.innerWidth;
		sizes.height = window.innerHeight;
		
		camera.aspect = sizes.width / sizes.height;
		camera.updateProjectionMatrix();
		
		renderer.setSize(sizes.width, sizes.height);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
	})
	
	const css2DRenderer = new CSS2DRenderer();
	css2DRenderer.setSize(window.innerWidth, window.innerHeight);
	canvas.appendChild(css2DRenderer.domElement);
	
	const clock = new THREE.Clock();
	
	function animate() {
		animationFrameId = requestAnimationFrame(animate);

		const elapsedTime = clock.getElapsedTime() * 0.01;

		if (atari && !rotationData.isdisabled) {
			atari.rotation.x = cursor.y * 0.25 + rotationData.x;
			atari.rotation.y = cursor.x * 0.25 + rotationData.y;
		}
		css2DRenderer.render(scene, camera); 
        renderer.render(scene, camera);
    }
    animate();
}

export { initThree };

