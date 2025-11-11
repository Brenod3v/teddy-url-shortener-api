## [v0.0.2] - 2025-11-10

## [v1.0.0] - 2025-11-11

### Added
feat!: implement auto documentation of major features

### BREAKING CHANGES
- implement auto documentation of major features


## [v0.1.0] - 2025-11-11

### Added
-  Merge pull request #14 from Brenod3v/develop
-  add observability to the controllers with structured logging using winston
-  add observability to the services with structured logging using winston
-  return 302 status code in redirect
-  add withDeleted: false logic to redirect feature
-  add timestamps to user entity
-  implement  updateUrl method

### Fixed
-  update Actions node version
-  configure jest-e2e to use commonjs and resolve crypto error
-  atualiza configuração do jest-e2e para ts-jest v29+


## [v0.0.4] - 2025-11-10

### Added
-  implement soft delete for URLs and update related service and controller methods

### Fixed
-  update docker Node.js version to 20 and add crypto polyfill for compatibility
-  update environment variable checks and error handling in authentication and database configuration


## [v0.0.3] - 2025-11-10

### Fixed
-  ajusta workflow para funcionar com Git Flow via PR merge


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