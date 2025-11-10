# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.2] - 2025-11-10

### Added
- GET /my-urls endpoint for authenticated users
- Unit tests for shorten service and controller
- JWT authentication guard for my-urls endpoint
- MyUrlsResponseDto for proper response typing

### Fixed
- Release workflow to work with Git Flow via PR merge
- CHANGELOG generation logic

## [0.0.1] - 2025-11-08

### Added
- URL shortener API with NestJS
- PostgreSQL database integration
- Docker and Docker Compose setup
- Authentication system with JWT
- Basic CRUD operations for URL management
- Redirect functionality for shortened URLs
- Custom alias support for authenticated users
- Reserved routes validation
- CI/CD pipeline with GitHub Actions