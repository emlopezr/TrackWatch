# Contributing to TrackWatch

First off, thanks for taking the time to contribute! :tada:

The following is a set of guidelines for contributing to TrackWatch. These are mostly guidelines, not rules. Use your best judgment, and feel free to propose changes to this document in a pull request.

## Code of Conduct

This project and everyone participating in it is governed by the [TrackWatch Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report for TrackWatch. Following these guidelines helps maintainers and the community understand your report, reproduce the behavior, and find related reports.

- **Use a clear and descriptive title** for the issue to identify the problem.
- **Describe the exact steps which reproduce the problem** in as many details as possible.
- **Provide specific examples** to demonstrate the steps. Include links to files or GitHub projects, or copy/pasteable snippets, which you use in those examples.
- **Describe the behavior you observed after following the steps** and point out what exactly is the problem with that behavior.
- **Explain which behavior you expected to see instead and why.**
- **Include screenshots and animated GIFs** which show you following the described steps and clearly demonstrate the problem.

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion for TrackWatch, including completely new features and minor improvements to existing functionality.

- **Use a clear and descriptive title** for the issue to identify the suggestion.
- **Provide a step-by-step description of the suggested enhancement** in as many details as possible.
- **Explain why this enhancement would be useful** to most TrackWatch users.

### Pull Requests

The process described here has several goals:

- Maintain TrackWatch's quality
- Fix problems that are important to users
- Engage the community in working toward the best possible TrackWatch
- Enable a sustainable system for TrackWatch's maintainers to review contributions

Please follow these steps to have your contribution considered by the maintainers:

1.  Follow all instructions in [the template](.github/pull_request_template.md)
2.  Follow the [styleguides](#styleguides)
3.  After you submit your pull request, verify that all status checks are passing

## Styleguides

### Python (Backend)

- We follow **PEP 8**.
- Use `flake8` or `black` to format your code before committing.
- Ensure all new functions and classes have docstrings.

### TypeScript/React (Frontend)

- We follow standard React + TypeScript best practices.
- Use `ESLint` and `Prettier` to format your code.
- Functional components with Hooks are preferred over class components.

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

## Development Setup

See [docs/MANUAL_SETUP.md](docs/MANUAL_SETUP.md) for instructions on how to set up your development environment.
