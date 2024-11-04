all: 
	docker compose -f ./docker-compose.yaml build
	docker compose -f ./docker-compose.yaml up -d

nocache: 
	docker compose -f ./docker-compose.yaml build --no-cache
	docker compose -f ./docker-compose.yaml up -d

up:
	docker compose -f ./docker-compose.yaml up -d

logs:
	docker logs front
	docker logs back
	docker logs db

stop:
	docker container stop front
	docker container stop back
	docker container stop db

clean:
	docker container stop front
	docker container stop back
	docker container stop db
	docker network rm transcendence

fclean: clean
	@docker rm front
	@docker rm back
	@docker rm db
	@docker system prune -af

re: fclean all

.Phony: all logs clean fclean