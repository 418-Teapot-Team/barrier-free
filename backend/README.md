# Barrier-free Backend

## Description

The goal was to create simple, yet featureful backend application using UI-first approach. First, we defined the user needs. Second, we shaped the data schemas and the relations between them. Third, we transferred all of these into the code and created the RESTful API using [FastAPI](https://fastapi.tiangolo.com) as a web framework, [uvicorn](https://www.uvicorn.org) as the webserver and [uv](https://docs.astral.sh/uv/) as an ultra-fast package and project manager.

## Features

- User registration
- Stateless authentication using JWT tokens
- Authorization using DB-level permission controls
- Ability for the users to leave comments
- Ability for the users to leave propositions for changing accessibility, that can be reviewed by admins afterwards
- Automatic accessibility level recalculation based on location context using smartest AI models after a new comment was created
- Ability for the admins to change accessibility levels for a specific location

## Local setup

- Before running you should create a .env file with all the credentials. The sample could be found at [here](.env.example).
- OPTIONAL: Make sure [GNU make](https://www.gnu.org/software/make/) is installed
- Use `make run` to run the application or `uv run uvicorn "src.api.main:app"` if GNU make is not installed. The dependencies will be auto-installed when running either of those commands.

## Deployment

The project is containarized using Docker, specifically the following [Dockerfile](./Dockerfile), so it could be deployed via any container orchestrator tool like Kubernetes, AWS ECS, Docker Compose, etc.
