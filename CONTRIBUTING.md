# Contributing to Fuel Streams JS

Thank you for your interest in contributing to Fuel Streams JS! This document provides guidelines and instructions to help you get started with contributing to this project.

## Table of Contents

- [Contributing to Fuel Streams JS](#contributing-to-fuel-streams-js)
  - [Table of Contents](#table-of-contents)
  - [Code of Conduct](#code-of-conduct)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Project Setup](#project-setup)
  - [Development Workflow](#development-workflow)
    - [Package Scripts](#package-scripts)
    - [Code Style and Linting](#code-style-and-linting)
    - [Testing](#testing)
    - [Subject Generation](#subject-generation)
      - [How Subject Generation Works](#how-subject-generation-works)
    - [Filters List Command](#filters-list-command)
    - [Adding New Domains to Fuel Streams](#adding-new-domains-to-fuel-streams)
  - [Git Workflow](#git-workflow)
    - [Branching Strategy](#branching-strategy)
    - [Commit Guidelines](#commit-guidelines)
    - [Pull Requests](#pull-requests)
  - [Release Process](#release-process)
    - [Changesets Workflow](#changesets-workflow)
    - [Automated Releases](#automated-releases)
  - [Project Structure](#project-structure)
  - [Communication](#communication)

## Code of Conduct

Please read and follow our [Code of Conduct](https://github.com/FuelLabs/fuel-streams-js/blob/main/CODE_OF_CONDUCT.md) to foster an inclusive and respectful community.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- [Bun](https://bun.sh/) (version 1.2.2 or higher)
- [Node.js](https://nodejs.org/) (LTS version recommended)
- [Git](https://git-scm.com/)

### Project Setup

1. Fork the repository on GitHub.
2. Clone your fork locally:

   ```bash
   git clone https://github.com/YOUR_USERNAME/fuel-streams-js.git
   cd fuel-streams-js
   ```

3. Add the original repository as a remote to sync changes:

   ```bash
   git remote add upstream https://github.com/FuelLabs/fuel-streams-js.git
   ```

4. Install dependencies:

   ```bash
   bun install
   ```

## Development Workflow

### Package Scripts

The project includes several npm scripts to help with development:

- `bun run dev:app`: Run the simple app for development
- `bun run build`: Build all packages in the monorepo
- `bun run build:libs`: Build just the `@fuels/streams` library
- `bun run build:watch`: Watch for changes and rebuild
- `bun run format`: Format code using Biome
- `bun run lint:check`: Run linting checks
- `bun run test`: Run all tests
- `bun run test:e2e`: Run end-to-end tests
- `bun run test:coverage`: Run tests with coverage
- `bun run ts:check`: Run TypeScript checks
- `bun run generate:subjects`: Generate subject definitions from the data-systems schema
- `bun run changeset:next`: Helper script for changeset management
- `bun run packages:version`: Version packages based on changesets
- `bun run filters:list`: List all available filters for documentation purposes

### Code Style and Linting

This project uses Biome for formatting and linting. Run checks and fix issues with:

```bash
# Check for linting issues
bun run lint:check

# Format code
bun run format
```

Configuration is in the `biome.json` file in the project root.

### Testing

Write tests for new features and ensure existing tests pass:

```bash
# Run all tests
bun run test

# Run tests with coverage
bun run test:coverage
```

### Subject Generation

The Fuel Streams JS library relies on subject definitions that are generated from a schema defined in the [FuelLabs/data-systems](https://github.com/FuelLabs/data-systems) repository. This ensures consistency between the Rust and JavaScript implementations of Fuel Streams.

#### How Subject Generation Works

1. In the `data-systems` repository, the `subjects-schema` script generates a JSON schema from the Rust subject definitions:
   - It imports all subject types from the `fuel-streams-domains` crate
   - For each subject type, it calls the `.schema()` method provided by the `Subject` derive macro
   - It combines all subject schemas into a comprehensive JSON schema
   - It outputs the schema to a JSON file

2. In this repository, we use that generated schema to create TypeScript definitions:
   - The `generate:subjects` script reads the schema from the data-systems repository
   - It generates TypeScript interfaces and classes for each subject type
   - The generated code is written to the `packages/fuel-streams/src/modules` directory

To run the subject generation process:

```bash
bun run generate:subjects
```

After running this command, you should format the generated code:

```bash
bun run format
```

> **Important:** The source of truth for subject definitions is in the `data-systems` repository. Any changes to subject definitions should start there, and then be propagated to this repository using the `generate:subjects` script.

### Filters List Command

The `filters:list` command generates a comprehensive list of all available filters that can be used with the Fuel Streams library:

```bash
bun run filters:list
```

This command:
1. Analyzes the subject definitions
2. Extracts all available filters and their descriptions
3. Outputs the list in a format that can be used in documentation

This is particularly useful when updating the README.md file to ensure that the list of filters in the documentation is complete and up-to-date.

### Adding New Domains to Fuel Streams

When a new domain is added to the `fuellabs/data-systems/crates/domains` repository, several steps need to be taken in this repository to incorporate the new domain:

1. **Update the subject definitions**:
   - Ensure the latest schema is generated in the data-systems repository
   - Update the `subject-defs.ts` file in the fuel-streams package with the new schema

2. **Update types**:
   - Modify `packages/fuel-streams/src/types.ts` to include the new domain types

3. **Update parsers**:
   - Add parsers for the new domain in `packages/fuel-streams/src/parsers.ts`

4. **Generate the subjects**:
   ```bash
   bun run generate:subjects
   ```

5. **Update documentation**:
   ```bash
   bun run filters:list
   ```
   Then update the README.md with the generated filter list

6. **Test the new domain**:
   - Write tests for the new domain functionality
   - Ensure the new domain can be properly filtered and subscribed to

This process ensures that any new domains added to the Rust implementation are properly reflected in the JavaScript SDK with full type safety and documentation.

## Git Workflow

### Branching Strategy

- `main`: The main development branch
- Use feature branches for your work, with descriptive names

### Commit Guidelines

Follow the [Conventional Commits](https://www.conventionalcommits.org/) format for your commit messages:

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

Types include:
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Changes that don't affect code (formatting, etc.)
- `refactor`: Code changes that neither fix bugs nor add features
- `test`: Adding or fixing tests
- `chore`: Changes to build process or auxiliary tools

Example: `feat(websocket): add reconnection logic`

### Pull Requests

1. Create a new branch for your feature or bugfix:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and commit them following the commit guidelines.

3. Push to your fork:

   ```bash
   git push origin feature/your-feature-name
   ```

4. Open a pull request against the `main` branch of the main repository.
5. Fill in the PR template with all required information.
6. Request a review from maintainers.

## Release Process

### Changesets Workflow

This project uses [changesets](https://github.com/changesets/changesets) for versioning and publishing. Changesets provide a way to manage versions and changelogs in a monorepo setup.

When you make a change that requires a version bump:

1. Run the changeset command:

   ```bash
   bun run changeset
   ```

2. Follow the interactive prompts to:
   - Select the packages that have changed
   - Choose the type of version change for each package (major, minor, patch)
   - Write a summary of the changes

3. This will create a new changeset file in the `.changeset` directory with your changes.

4. Commit this file along with your changes:

   ```bash
   git add .changeset/your-changeset-id.md
   git commit -m "feat: your feature description"
   ```

### Automated Releases

The release process is fully automated through GitHub Actions:

1. **Changeset Pull Request Creation**:
   - When a PR with changesets is merged to `main`, the GitHub Actions workflow automatically creates or updates a "Version Packages" PR.
   - This PR contains all the version bumps and changelog updates based on the merged changesets.

2. **Publishing to NPM**:
   - When the "Version Packages" PR is merged to `main`, the GitHub Actions workflow automatically:
     - Builds the packages
     - Publishes them to NPM with the appropriate tags
     - Creates GitHub releases
     - Cleans up by removing the changesets

This automated process ensures consistent releases and reduces manual errors. The workflow is defined in `.github/workflows/release-npm.yaml`.

> **Note:** You don't need to manually run `packages:version` or publish packages. The CI/CD pipeline handles this automatically when changesets are merged.

## Project Structure

The project is organized as a monorepo with the following structure:

```
fuel-streams-js/
├── packages/
│   ├── fuel-streams/       # Main library package
│   │   ├── src/            # Source code
│   │   │   ├── modules/    # Modules for different data types
│   │   │   └── ws/         # WebSocket implementation
│   │   ├── examples/       # Example code
│   │   └── package.json    # Package configuration
│   └── simple-app/         # Example application
├── scripts/                # Build and utility scripts
├── .github/                # GitHub configurations and workflows
├── .changeset/             # Changeset files for version management
├── package.json            # Root package configuration
└── README.md               # Project documentation
```

## Communication

- For questions and discussions, join the [Fuel Discord](https://discord.com/invite/fuelnetwork)
- For bugs and feature requests, [open an issue](https://github.com/FuelLabs/fuel-streams-js/issues/new/choose)

Thank you for contributing to Fuel Streams JS! 