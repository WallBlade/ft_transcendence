import * as THREE from 'three';
import { gsap } from 'gsap';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'

const sizes = {
	width: window.innerWidth,
	height: window.innerHeight,
};

const cursor = {
	x: 0,
	y: 0,
};

let rotation = {
	x: Math.PI / 5,
	y: 0,
};

window.addEventListener("mousemove", (event) => {
	cursor.x = event.clientX / sizes.width - 0.5;
	cursor.y = event.clientY / sizes.height - 0.5;
});

const timelineSelectMap = gsap.timeline({ paused: true });
const timelineTournament = gsap.timeline({ paused: true });

let camera;
let scene;
let grpField;

let isMapSelected = false;
let isMapClickListenerAdded = false;
let isSelectMapEnter = false;

window.addEventListener('removeField', function() {
	if (grpField) {
		scene.remove(grpField);
	}
});

window.addEventListener('addField', function() {
	const isObjectInScene = scene.children.includes(grpField);

	if (!isObjectInScene) {
		scene.add(grpField);
	}
});

window.addEventListener('tournamentSelected', function() {
	if (grpField) {
		timelineTournament.to(grpField.position, {z: grpField.position.z + 2.5, y: grpField.position.y - 1, duration: 1.5, ease: "power2.in"}, 0)
		.to(grpField.rotation, {x: Math.PI / 2, y: Math.PI / 2, duration: 1.5, ease: "power2.inOut"}, 0);
		timelineTournament.play(0, true).then(() => {
			timelineTournament.clear();
		});
	}
});

function createField() {
	const fieldGeometry = new THREE.BoxGeometry(4, 0.1, 2),
		fieldMaterial = new THREE.MeshMatcapMaterial({ color: 0xF1E1CA });
	const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
	field.position.set(0, -0.15, 0);
	return field;
}

function createPaddle(positionX) {
	const paddleGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.5),
		paddleMaterial = new THREE.MeshMatcapMaterial({color: 0xFE6F2D});
	const paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
	paddle.position.set(positionX, 0, 0);
	return paddle;
}

function createBall() {
	const ballGeometry = new THREE.SphereGeometry(0.08),
		ballMaterial = new THREE.MeshMatcapMaterial({color: 0xFE6F2D});
	const ball = new THREE.Mesh(ballGeometry, ballMaterial);
	return ball;
}

function createGrpField() {
	const grpField = new THREE.Group();
	grpField.add(createField());
	grpField.add(createPaddle(1.95));
	grpField.add(createPaddle(-1.95));
	grpField.add(createBall());
	grpField.rotation.x = rotation.x;
	return grpField;
}

function selectMapEnter() {

	timelineSelectMap
		.to(grpField.position, {
			duration: 1.5,
			z: grpField.position.z + 5,
			ease: "power2.in",
		}, 0)
		.to(grpField.rotation, {
			duration: 1.5,
			x: Math.PI / 2,
			y: Math.PI / 2,
			ease: "power2.inOut",
		}, 0)
		.to(grpField.position, {
			duration: 1.5,
			x: grpField.position.x - 2,
			ease: "power2.inOut",
		}, 0.2	)

	timelineSelectMap.play(0, true).then(() => {
		timelineSelectMap.clear();
	});

	isSelectMapEnter = true;
}

async function threeHome(canvas) {
    scene = new THREE.Scene();
	const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
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

	const rgbeLoader = new RGBELoader();
    rgbeLoader.load('./static/environmentMap/2k.hdr', (environmentMap) =>
	{
	    environmentMap.mapping = THREE.EquirectangularReflectionMapping;
	    scene.environment = environmentMap;
	});

    grpField = createGrpField();
    scene.add(grpField);
    window.addEventListener('selectMap', function() {
        selectMapEnter();
    });
    window.addEventListener('leaveSelectMap', function() {
		isSelectMapEnter = false;
    });

	window.addEventListener('leaveTournament', function() {
		timelineTournament.reverse();
		timelineTournament.eventCallback("onReverseComplete", function() {
			timelineTournament.clear();
		});
	});

	scene.add(camera);

	window.addEventListener('resize', () => {
		sizes.width = window.innerWidth;
		sizes.height = window.innerHeight;

		camera.aspect = sizes.width / sizes.height;
		camera.updateProjectionMatrix();

		renderer.setSize(sizes.width, sizes.height);
		renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
	});

	const clock = new THREE.Clock();
	let targetRotationY = 0;
	let targetRotationX = 0;

	function animate() {
		requestAnimationFrame(animate);

		const elapsedTime = clock.getElapsedTime();

		// console.log(isSelectMapEnter);
		if (grpField && isSelectMapEnter) {
			targetRotationX = Math.PI / 2 + Math.sin(elapsedTime * 0.3) * 0.02 + cursor.y * 0.02;
			targetRotationY = Math.PI / 2 + Math.cos(elapsedTime * 0.3) * 0.04 + cursor.x * 0.02;

			grpField.rotation.x = THREE.MathUtils.lerp(grpField.rotation.x, targetRotationX, 0.01);
			grpField.rotation.y = THREE.MathUtils.lerp(grpField.rotation.y, targetRotationY, 0.01);
		}
        renderer.render(scene, camera);
    }
    animate();
}

export default threeHome;
