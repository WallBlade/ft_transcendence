function	predict_wall_collision(pos, obj, dir) {
	while (1) {
		if (pos.z + obj.ball.geometry.parameters.radius >= obj.field.geometry.parameters.depth / 2)	{
			dir.z *= -1;
			pos.z = obj.field.geometry.parameters.depth / 2 - obj.ball.geometry.parameters.radius;
		}
		else if (pos.z - obj.ball.geometry.parameters.radius <= -obj.field.geometry.parameters.depth / 2) {
			dir.z *= -1;
			pos.z = -obj.field.geometry.parameters.depth / 2 + obj.ball.geometry.parameters.radius;
		}
		else if (pos.x + obj.ball.geometry.parameters.radius >= obj.field.geometry.parameters.width / 2
			|| pos.x - obj.ball.geometry.parameters.radius <= -obj.field.geometry.parameters.width / 2) {
			break;
		}
		pos.x += dir.x;
		pos.z += dir.z;
	}
	return (pos);
}

function	predict_goalLine_collision(pos, obj, dir) {
	while (1) {
		if (pos.x + obj.ball.geometry.parameters.radius >= obj.field.geometry.parameters.width / 2) {
			pos.x = obj.field.geometry.parameters.width / 2 - obj.ball.geometry.parameters.radius;
			break;
		}
		else if (pos.x - obj.ball.geometry.parameters.radius <= -obj.field.geometry.parameters.width / 2) {
			pos.x = -obj.field.geometry.parameters.width / 2 + obj.ball.geometry.parameters.radius;
			break;
		}
		pos.x += dir.x;
		pos.z += dir.z;
	}
	return (pos);
}

export function	predict_ball_hit(objects, ballDir, error) {
	let dir = {...ballDir};
	let pos = {...objects.ball.position};
	pos = predict_wall_collision(pos, objects, dir);
	pos = predict_goalLine_collision(pos, objects, dir);
	pos.z *= 1 + error;
	pos.x *= 1 + error;
	return (pos);
}