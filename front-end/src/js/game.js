import * as THREE from "three";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import {FontLoader} from "three/examples/jsm/loaders/FontLoader.js";
import {TextGeometry} from "three/examples/jsm/geometries/TextGeometry.js";
import {predict_ball_hit} from "./game_IA";

const ip_address = import.meta.env.VITE_IP_ADDRESS;

function init(canvas, GameLayer) {
	let score1 = 0;
	let score2 = 0;
	let scoreText;

	let objects = {
		field: null,
		paddle1: null,
		paddle2: null,
		ball: null,
	};

	let keys = {
		ArrowDown: false,
		ArrowUp: false,
		s: false,
		w: false,
	}
	const sizes = {
		width: window.innerWidth,
		height: window.innerHeight,
	};

	let animationFrameId;
	let gameStartTime;
	let gameTimerId;
	let intervalId;

	function startNewGame(scene, renderer) {
		// console.log("New game started. Timer is set for 3 minutes.");
		gameStartTime = Date.now(); 
		startGameTimer(scene, renderer); 
	}

	function startGameTimer(scene, renderer) {
		const duration = 180000; // 3 minutes
		if (gameTimerId) {
			clearTimeout(gameTimerId); 
		}

		gameTimerId = setTimeout(() => {
			// console.log("Timer finished. Game over or next phase.");
			endGameActions();
		}, duration);
	}

	function endGameActions(scene, renderer, GameLayer) {
		objects = {
			field: null,
			paddle1: null,
			paddle2: null,
			ball: null,
		};
		keys = {
			ArrowDown: false,
			ArrowUp: false,
			s: false,
			w: false,
		}
		clearInterval(gameTimerId);
		clearInterval(intervalId);
		window.cancelAnimationFrame(animationFrameId);
		scene.traverse(function (object) {
			if (object.isMesh) {
				if (object.geometry) {
					object.geometry.dispose();
				}
			}
		});

		while (scene.children.length > 0) {
			scene.remove(scene.children[0]);
		}

		renderer.dispose();

		if (GameLayer.type === 'online') {
			if (ws.readyState == ws.OPEN) {
				ws.close();
			}
		}
		GameLayer.gameOver(score1, score2);
		score1 = 0;
		score2 = 0;
	}
	const renderer = new THREE.WebGLRenderer({
		canvas: canvas,
	});

	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.setClearColor("#232324");

	const camera = new THREE.PerspectiveCamera(
		75,
		sizes.width / sizes.height,
		0.1,
		100
	);
	camera.position.z = 2.4;
	camera.translateY(2.5);

	const scene = new THREE.Scene();
	scene.add(camera);

	objects = createObjects(scene, objects);

	const speedIncreaseFactor = 1.075; // Increase speed by 7.5% each hit
	let ballDir = new THREE.Vector3(0.02, 0, 0);

	const controls = new OrbitControls(camera, canvas);


	resizeScreen(camera, renderer);
	startNewGame(scene, renderer);
	let AI_pred = null;
	let AI_params = {refresh: 1000, error: 0};
	if (GameLayer.type === 'ia') {
		if (GameLayer.difficulty === 'easy') {
			AI_params = {refresh: 2000, error: 0.5};
		}
		else if (GameLayer.difficulty === 'hard') {
			AI_params = {refresh: 1, error: 0.0};
		}
		else {
			AI_params = {refresh: 1000, error: 0.0};
		}
		AI_pred = {x: objects.paddle2.x, y: objects.paddle2.y , z: objects.paddle2.z};
		intervalId = setInterval(() => {
			AI_pred = predict_ball_hit(objects, ballDir, AI_params.error);
		}, AI_params.refresh);
	}

	renderer.render(scene, camera);

	let sendGameData;
	let sendPaddle;
	let player;
	let ws;
	if (GameLayer.type === 'online') {

		ws = new WebSocket(`wss://${ip_address}:8000/wss/game-online?host=${GameLayer.state.getState().gameData.host}&opponent=${GameLayer.state.getState().gameData.opponent}`);
		GameLayer.state.setState({gameSocket: ws});
		ws.onopen = function() {/* console.log('Websocket game opened.'); */};
		ws.onmessage = function(event) {
			const gameState = JSON.parse(event.data);
			if (gameState.type === 'game_stop' && gameState.gamed_id !== null) {
				// console.log('Game stopped.');
				const gameId = gameState.game_id;
				GameLayer.state.setState({gameStopped: true});
				GameLayer.state.setState({gameId: gameId});	
				endGameActions(scene, renderer, GameLayer);
			}
			if (gameState.player_role === 'player1') {
				player = 'player1';
			} else if (gameState.player_role === 'player2') {
				player = 'player2';
			}
			console.log(gameState, " from ");
			updateGameUI(gameState);
		};
		ws.onerror = function(event) {/* console.log('Error', event); */};
		ws.onclose = function() {/* console.log('Websocket game closed.'); */};

		function updateGameUI(gameState) {
			if (gameState.ballX && gameState.ballZ && gameState.player_role !== player && objects?.ball?.position) {
				objects.ball.position.x = gameState.ballX;
				objects.ball.position.z = gameState.ballZ;
			}
			if (gameState.paddle1Z && gameState.player_role !== player && objects?.paddle1?.position) {
				objects.paddle1.position.z = gameState.paddle1Z;
			}
			if (gameState.paddle2Z && gameState.player_role !== player && objects?.paddle2?.position) {
				objects.paddle2.position.z = gameState.paddle2Z;
			}
			if ((gameState.score1 && gameState.score2 && gameState.player_role !== player)) {
				score1 = gameState.score1;
				score2 = gameState.score2;
			}
		}

		sendGameData = function (){
			if (objects?.ball?.position === undefined) return;
			const data = {
				player_role: player,
				ballX: objects.ball.position.x,
				ballZ: objects.ball.position.z,
				paddle1Z: objects.paddle1.position.z,
				score1: score1,
				score2: score2,
			};
			ws.send(JSON.stringify(data));
		}

		sendPaddle = function(){
			if (objects?.paddle2?.position === undefined) return;
			const data = {
				player_role: player,
				paddle2Z: objects.paddle2.position.z,
			};
			ws.send(JSON.stringify(data));
			}
	}

	const clock = new THREE.Clock();
	let delta = 0;
	const tick = () => {
		animationFrameId = 	window.requestAnimationFrame(tick);
		delta = clock.getDelta() * 60;
		if ((score1 === 3 || score2 === 3)) {
			endGameActions(scene, renderer, GameLayer);
		}
		paddleUpdate(AI_pred, GameLayer.type, player, delta);
		controls.update();
		renderer.render(scene, camera);

		const maxVelocity = 0.08;
		if (ballDir.length() > maxVelocity) {
			ballDir.normalize().multiplyScalar(maxVelocity);
		}
		if (objects?.ball?.position)
			objects.ball.position.add(ballDir.clone().multiplyScalar(delta));

		collisionPaddle1(ballDir, speedIncreaseFactor * delta);
		collisionPaddle2(ballDir, speedIncreaseFactor * delta);
		wallCollision(ballDir);
		goal(scene, ballDir);
		if (GameLayer.type === 'online'){
			if (player === 'player1' && ws.readyState === ws.OPEN) {
				sendGameData();
			}
			if (player === 'player2' && ws.readyState === ws.OPEN) {
				sendPaddle();
			}
		}
		window.addEventListener("popstate", () => {
			clearInterval(gameTimerId);
			clearInterval(intervalId);
			window.cancelAnimationFrame(animationFrameId);
		});
	}
	clock.start();
	let gamestarted = false;

	window.addEventListener("game-started", () => {
		if (gamestarted) return;
		delta = clock.getDelta() * 60;
		tick();
		gamestarted = true;
	});
	
	function createObjects(scene, objects) {
		objects.field = addField(scene);
		objects.paddle1 = addPaddle(scene, 1.95);
		objects.paddle2 = addPaddle(scene, -1.95);
		objects.ball = addBall(scene);
		objects.paddle1.position.z = objects.paddle1.position.z;
		objects.paddle2.position.z = objects.paddle2.position.z;
		addScore(scene)
		.then((text) => {
			scene.add(text);
		})
		.catch((e) => {
			// console.log(e);
		});
		return objects;
	}

	function addField(scene) {
		const fieldGeometry = new THREE.BoxGeometry(4, 0.1, 2),
		fieldMaterial = new THREE.MeshMatcapMaterial({ color: 0xF1E1CA });
		const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
		field.position.set(0, -0.15, 0);
		scene.add(field);
		return field;
	}

	function addPaddle(scene, positionX) {
		const paddleGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.5),
		paddleMaterial = new THREE.MeshMatcapMaterial({color: 0xFE6F2D});
		const paddle = new THREE.Mesh(paddleGeometry, paddleMaterial);
		paddle.position.set(positionX, 0, 0);
		scene.add(paddle);
		return paddle;
	}

	function addBall(scene) {
		const ballGeometry = new THREE.SphereGeometry(0.08),
		ballMaterial = new THREE.MeshMatcapMaterial({color: 0xFE6F2D});
		const ball = new THREE.Mesh(ballGeometry, ballMaterial);
		scene.add(ball);
		return ball;
	}

	function addScore(scene) {
		return new Promise((resolve, reject) => {
			const fontLoader = new FontLoader();
			
			fontLoader.load(
				"../../static/fonts/Pixer/Pixer_Regular.json",
				(font) => {
					const textGeometry = new TextGeometry(score1 + " : " + score2, {
						font: font,
						size: 0.4,
						height: 0.2,
						curveSegments: 12,
						bevelEnabled: true,
						bevelThickness: 0.03,
						bevelSize: 0.02,
						bevelOffset: 0,
						bevelSegments: 5,
					});
					textGeometry.center();

					const textMaterial = new THREE.MeshMatcapMaterial({color: 0xFE6F2D});
					scoreText = new THREE.Mesh(textGeometry, textMaterial);
					scoreText.position.z = -2;
					scoreText.position.y = 1;
					scoreText.rotation.x = -0.2;
					scene.add(scoreText);
					
					resolve(scoreText);
				},
				undefined, // onProgress callback
				(error) => {
					reject(error);
				}
				);
			});
	}

	function resizeScreen(camera, renderer) {
		window.addEventListener("resize", () => {
			// Update sizes
			sizes.width = window.innerWidth;
			sizes.height = window.innerHeight;
			
			// Update camera
			camera.aspect = sizes.width / sizes.height;
			camera.updateProjectionMatrix();
			
			// Update renderer
			renderer.setSize(sizes.width, sizes.height);
			renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
		});
	}

	document.addEventListener("keydown", (event) => {
		if (keys.hasOwnProperty(event.key)) 
		keys[event.key] = true;
	});

	document.addEventListener("keyup", (event) => {
		if (keys.hasOwnProperty(event.key)) {
			keys[event.key] = false;
		}
	});

	function paddleUpdate(predict_hit, type, player, delta) {
		const speed = 0.02 * delta;
		if (type === 'online') {
			if (player === 'player1') {
				if (keys.ArrowDown && objects.paddle1.position.z + objects.paddle1.geometry.parameters.depth / 2 < objects.field.geometry.parameters.depth / 2) {
					objects.paddle1.position.z += speed;
				}
				if (keys.ArrowUp && objects.paddle1.position.z - objects.paddle1.geometry.parameters.depth / 2 > -objects.field.geometry.parameters.depth / 2) {
					objects.paddle1.position.z -= speed;
				}
			} else if (player === 'player2') {
				if (keys.s && objects.paddle2.position.z + objects.paddle2.geometry.parameters.depth / 2 < objects.field.geometry.parameters.depth / 2) {
					objects.paddle2.position.z += speed;
				}
				if (keys.w && objects.paddle2.position.z - objects.paddle2.geometry.parameters.depth / 2 > -objects.field.geometry.parameters.depth / 2) {
					objects.paddle2.position.z -= speed;
				}
			}
		}
		else if (type === 'local' || type == 'tournament') {
				if (keys.ArrowDown && objects.paddle1.position.z + objects.paddle1.geometry.parameters.depth / 2 < objects.field.geometry.parameters.depth / 2) {
					objects.paddle1.position.z += speed;
				}
				if (keys.ArrowUp && objects.paddle1.position.z - objects.paddle1.geometry.parameters.depth / 2 > -objects.field.geometry.parameters.depth / 2) {
					objects.paddle1.position.z -= speed;
				}
				if (keys.s && objects.paddle2.position.z + objects.paddle2.geometry.parameters.depth / 2 < objects.field.geometry.parameters.depth / 2) {
					objects.paddle2.position.z += speed;
				}
				if (keys.w && objects.paddle2.position.z - objects.paddle2.geometry.parameters.depth / 2 > -objects.field.geometry.parameters.depth / 2) {
					objects.paddle2.position.z -= speed;
				}
		} else if (predict_hit && type === 'ia') {
				if (keys.ArrowDown && objects.paddle1.position.z + objects.paddle1.geometry.parameters.depth / 2 < objects.field.geometry.parameters.depth / 2) {
					objects.paddle1.position.z += speed;
				}
				if (keys.ArrowUp && objects.paddle1.position.z - objects.paddle1.geometry.parameters.depth / 2 > -objects.field.geometry.parameters.depth / 2) {
					objects.paddle1.position.z -= speed;
				}
				let moveDirPaddle = 0;
				if (objects?.paddle2?.position)
					moveDirPaddle = predict_hit.z - objects.paddle2.position.z + speed * 2;
				if (moveDirPaddle > 0 && moveDirPaddle > speed * 2 && objects.paddle2.position.z + objects.paddle2.geometry.parameters.depth / 2 < objects.field.geometry.parameters.depth / 2) {
					objects.paddle2.position.z += speed;
				}
				else if (moveDirPaddle < 0 && moveDirPaddle < - speed * 2 && objects.paddle2.position.z - objects.paddle2.geometry.parameters.depth / 2 > -objects.field.geometry.parameters.depth / 2) {
					objects.paddle2.position.z -= speed;
				}
		}
	}

	function collisionPaddle1(ballDir, speedIncreaseFactor) {
		if (objects?.ball?.position &&
			objects.ball.position.x + objects.ball.geometry.parameters.radius >
			objects.paddle1.position.x -
			objects.paddle1.geometry.parameters.width / 2 &&
			objects.ball.position.x - objects.ball.geometry.parameters.radius <
			objects.paddle1.position.x +
			objects.paddle1.geometry.parameters.width / 2 &&
			objects.ball.position.z + objects.ball.geometry.parameters.radius >
			objects.paddle1.position.z -
			objects.paddle1.geometry.parameters.depth / 2 &&
			objects.ball.position.z - objects.ball.geometry.parameters.radius <
			objects.paddle1.position.z + objects.paddle1.geometry.parameters.depth / 2
			) {
			ballDir.x *= -1;
			ballDir.multiplyScalar(speedIncreaseFactor);
			let hitPos =
			(objects.ball.position.z - objects.paddle1.position.z) /
			(objects.paddle1.geometry.parameters.depth / 2);
			ballDir.z = hitPos * 0.02;
		}
	}

	function collisionPaddle2(ballDir, speedIncreaseFactor) {
	if (objects?.ball?.position &&
		objects.ball.position.x + objects.ball.geometry.parameters.radius >
			objects.paddle2.position.x -
				objects.paddle2.geometry.parameters.width / 2 &&
		objects.ball.position.x - objects.ball.geometry.parameters.radius <
		objects.paddle2.position.x +
				objects.paddle2.geometry.parameters.width / 2 &&
				objects.ball.position.z + objects.ball.geometry.parameters.radius >
			objects.paddle2.position.z -
			objects.paddle2.geometry.parameters.depth / 2 &&
			objects.ball.position.z - objects.ball.geometry.parameters.radius <
			objects.paddle2.position.z + objects.paddle2.geometry.parameters.depth / 2
			) {
		ballDir.x *= -1;
		ballDir.multiplyScalar(speedIncreaseFactor);
		let hitPos =
		(objects.ball.position.z - objects.paddle2.position.z) /
		(objects.paddle2.geometry.parameters.depth / 2);
		ballDir.z = hitPos * 0.02;
	}
	}

	function wallCollision(ballDir) {
	if (objects?.ball?.position &&
		objects.ball.position.z + objects.ball.geometry.parameters.radius >=
		objects.field.geometry.parameters.depth / 2 || objects?.ball?.position &&
		objects.ball.position.z - objects.ball.geometry.parameters.radius <=
		-objects.field.geometry.parameters.depth / 2
		) {
			ballDir.z *= -1;
		}
	}

	function goal(scene, ballDir) {
		if (objects?.ball?.position &&
			objects.ball.position.x + objects.ball.geometry.parameters.radius >
			objects.field.geometry.parameters.width / 2 || objects?.ball?.position &&
			objects.ball.position.x + objects.ball.geometry.parameters.radius <
			(objects.field.geometry.parameters.width / 2) * -1
			) {
				if (
					objects.ball.position.x + objects.ball.geometry.parameters.radius >
					objects.field.geometry.parameters.width / 2
					)
					score1++;
					else score2++;
					if (scoreText) scene.remove(scoreText);
					addScore(scene)
					.then((text) => {
						scoreText = text;
					})
					.catch((e) => {
						// console.log(e);
					});
					objects.ball.position.set(0, 0, 0);
					ballDir.z = 0;
					objects.paddle1.position.z = 0;
					objects.paddle2.position.z = 0;
					ballDir.set(0.025, 0, 0);
			}
	}
}


export default init;