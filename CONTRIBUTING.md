# 🤝 Contributing to PLANETARY

Thank you for your interest in contributing to PLANETARY! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Process](#development-process)
- [Pull Request Guidelines](#pull-request-guidelines)
- [Issue Guidelines](#issue-guidelines)
- [Community](#community)

## Code of Conduct

This project follows the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior to [contact@planetary-project.org](mailto:contact@planetary-project.org).

## Getting Started

### Prerequisites

- **Node.js** 18.0.0 or higher
- **npm** or **yarn** package manager
- **Git** for version control
- Basic knowledge of JavaScript, Three.js, and physics concepts
- Familiarity with astronomical concepts is helpful but not required

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork locally:**
   ```bash
   git clone https://github.com/your-username/planetary.git
   cd planetary
   ```
3. **Install dependencies:**
   ```bash
   npm install
   ```
4. **Create a development branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
5. **Start the development server:**
   ```bash
   npm run dev
   ```

## How to Contribute

### Types of Contributions

We welcome various types of contributions:

- **🐛 Bug fixes** - Help us squash bugs and improve stability
- **✨ New features** - Add new functionality or enhance existing features
- **📚 Documentation** - Improve docs, add examples, or write tutorials
- **🧪 Tests** - Add or improve test coverage
- **🎨 UI/UX improvements** - Enhance user interface and experience
- **⚡ Performance optimizations** - Make the simulation faster and more efficient
- **🔬 Scientific accuracy** - Improve astronomical data and physics calculations

### Areas Where We Need Help

- **Physics simulation accuracy** - Improving N-body integration and orbital mechanics
- **Astronomical data integration** - Better NASA JPL Horizons API integration
- **Performance optimization** - Rendering and computational performance
- **Mobile support** - Touch controls and responsive design
- **Accessibility** - Making the app usable for everyone
- **Documentation** - API docs, tutorials, and guides
- **Testing** - Unit tests, integration tests, and performance tests

## Development Process

### Branch Strategy

- **`main`** - Stable production branch
- **`develop`** - Integration branch for features
- **`feature/description`** - New features
- **`fix/description`** - Bug fixes
- **`docs/description`** - Documentation updates
- **`perf/description`** - Performance improvements

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat` - New features
- `fix` - Bug fixes
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

**Examples:**
```bash
feat(physics): add relativistic effects to N-body calculation
fix(rendering): resolve memory leak in texture management
docs(api): update CelestialBody class documentation
test(celestial): add comprehensive Planet class tests
```

### Code Quality Standards

Before submitting code, ensure it meets our quality standards:

```bash
# Run all quality checks
npm run check

# Individual checks
npm run lint          # ESLint
npm run format:check  # Prettier
npm test             # Tests with coverage
```

### Testing Requirements

- **All new features** must include comprehensive tests
- **Bug fixes** should include regression tests
- **Maintain test coverage** above 90%
- **Performance-critical code** should include benchmarks

## Pull Request Guidelines

### Before Submitting

1. **Ensure your code follows our standards**
2. **Write or update tests** for your changes
3. **Update documentation** if needed
4. **Test your changes** thoroughly
5. **Rebase on the latest main branch**

### PR Submission Process

1. **Create a descriptive title:**
   ```
   feat(physics): Add support for binary star systems
   ```

2. **Fill out the PR template** with:
   - Clear description of changes
   - Motivation and context
   - Testing done
   - Screenshots (if UI changes)
   - Breaking changes (if any)

3. **Link related issues:**
   ```
   Closes #123
   Relates to #456
   ```

4. **Request reviews** from relevant maintainers

### PR Review Process

- **Automated checks** must pass (linting, tests, build)
- **At least one maintainer** must approve
- **All conversations** must be resolved
- **No merge conflicts** with the target branch

### After Approval

- **Squash commits** if requested
- **Update the changelog** (maintainers will handle this)
- **Celebrate!** 🎉 Your contribution is now part of PLANETARY

## Issue Guidelines

### Reporting Bugs

Use the bug report template and include:

- **Clear description** of the bug
- **Steps to reproduce** the issue
- **Expected vs actual behavior**
- **System information** (OS, browser, Node.js version)
- **Screenshots or videos** if applicable
- **Console errors** or logs

### Suggesting Features

Use the feature request template and include:

- **Clear description** of the feature
- **Use case and motivation** 
- **Proposed implementation** (if you have ideas)
- **Alternative solutions** considered
- **Additional context** or mockups

### Asking Questions

- **Check existing issues** and documentation first
- **Use GitHub Discussions** for general questions
- **Be specific** about what you're trying to achieve
- **Provide context** about your use case

## Community

### Communication Channels

- **GitHub Issues** - Bug reports and feature requests
- **GitHub Discussions** - General questions and ideas
- **Discord** (coming soon) - Real-time chat with the community
- **Email** - [contact@planetary-project.org](mailto:contact@planetary-project.org)

### Recognition

Contributors are recognized in:

- **README.md** - Main contributors section
- **CHANGELOG.md** - Release notes
- **GitHub contributors** page
- **Annual contributor highlights**

### Mentorship

New contributors can:

- **Start with "good first issue" labels**
- **Ask for mentorship** in issues or discussions
- **Join pair programming sessions** (organized periodically)
- **Participate in community calls** (monthly)

## Development Guidelines

### Code Style

- **Follow ESLint and Prettier** configurations
- **Use meaningful variable names**
- **Write clear comments** for complex algorithms
- **Document public APIs** with JSDoc
- **Keep functions focused** and testable

### Physics and Mathematics

- **Use proper units** (SI units preferred)
- **Document assumptions** and limitations
- **Include references** to scientific papers or sources
- **Test against known values** where possible
- **Consider numerical stability** in calculations

### Performance Considerations

- **Profile performance-critical code**
- **Use appropriate data structures**
- **Minimize memory allocations** in hot paths
- **Consider WebGL best practices**
- **Test on various hardware configurations**

### Documentation Standards

- **Keep README up to date**
- **Document breaking changes**
- **Include code examples** in API docs
- **Write clear commit messages**
- **Update CHANGELOG for releases**

## Release Process

Releases follow semantic versioning (SemVer):

- **Patch** (1.0.1) - Bug fixes
- **Minor** (1.1.0) - New features (backward compatible)
- **Major** (2.0.0) - Breaking changes

### Release Schedule

- **Patch releases** - As needed for critical bugs
- **Minor releases** - Monthly (if features are ready)
- **Major releases** - Quarterly or when significant changes accumulate

## Getting Help

### Resources

- **[Development Guide](docs/DEVELOPMENT.md)** - Detailed development information
- **[API Documentation](docs/API.md)** - Complete API reference
- **[Testing Guide](TESTING.md)** - Testing framework and guidelines
- **[Architecture Design](architecture-design.md)** - System architecture overview

### Support Channels

1. **Documentation** - Check existing docs first
2. **GitHub Issues** - For bugs and feature requests
3. **GitHub Discussions** - For questions and ideas
4. **Email** - For private inquiries

## Thank You!

Every contribution, no matter how small, helps make PLANETARY better for everyone. We appreciate your time and effort in improving this project.

**Happy coding!** 🚀✨

---

*This contributing guide is inspired by open source best practices and is continuously improved based on community feedback.*