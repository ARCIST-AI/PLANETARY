# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PLANETARY is a professional-grade 3D solar system visualization with accurate astronomical data and N-body physics simulation. Built with Three.js, it provides an interactive educational experience for exploring the solar system with real-time physics calculations, orbital mechanics, and high-quality 3D rendering.

## Development Commands

### Essential Commands
- `npm run dev` - Start development server with Vite
- `npm run build` - Build production bundle
- `npm test` - Run all tests with Vitest
- `npm run test:ui` - Run tests with visual interface
- `npm run check` - Run all checks (tests with coverage, linting, formatting)

### Testing Commands
- `npm run test:runner -- MathUtils` - Run specific test file
- `npm run test:runner -- --ui` - Run tests with UI
- `npm run test:runner -- --watch` - Run tests in watch mode
- `npm run test:runner -- --coverage` - Run tests with coverage report
- `npm run test:runner -- --all` - Run all checks (equivalent to `npm run check`)

### Code Quality
- `npm run lint` - Run ESLint on source files
- `npm run lint:fix` - Auto-fix linting issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Single Test Execution
To run a single test file, use: `npm run test:runner -- [TestFileName]` (without .test.js extension)

## Architecture Overview

The project follows a modular architecture with clear separation of concerns:

### Core Engine Architecture
- **Engine.js** - Main orchestrator that manages all subsystems (RenderEngine, SimulationEngine, DataManager, UIEngine)
- **Event-driven communication** - Subsystems communicate via event system rather than direct coupling
- **Performance monitoring** - Built-in performance tracking and optimization

### Key Subsystems
1. **Rendering** (`src/rendering/`) - Three.js-based 3D rendering with LOD, materials, lighting
2. **Physics** (`src/physics/`) - N-body integration, Keplerian orbits, coordinate transformations
3. **Celestial Bodies** (`src/celestial/`) - Object-oriented hierarchy for stars, planets, moons, asteroids
4. **UI System** (`src/ui/`) - Interactive controls, tooltips, information panels
5. **Data Management** (`src/core/DataManager.js`) - NASA JPL Horizons API integration, caching

### Solar System Management
- **SolarSystem.js** - Central class managing collections of celestial bodies
- **Body categorization** - Automatic sorting into stars, planets, moons, asteroids, comets, spacecraft
- **Physics integration** - Seamless switching between N-body simulation and Keplerian orbits
- **Coordinate systems** - Support for different reference frames (inertial, body-centered)

## Key Dependencies

### Core Libraries
- **Three.js** - 3D rendering and WebGL abstraction
- **mathjs** - Advanced mathematical operations
- **ml-matrix** - Linear algebra for coordinate transformations
- **lil-gui** - Debug and control interface

### Development Tools
- **Vite** - Build tool and development server
- **Vitest** - Testing framework with Jest-compatible API
- **ESLint** - Code linting
- **Prettier** - Code formatting

## Testing Strategy

- **Unit tests** for mathematical utilities, physics calculations, celestial body operations
- **Integration tests** for subsystem interactions
- **Mock setup** includes Three.js, Web Workers, performance APIs in `test/setup.js`
- **Coverage reporting** with HTML output in `coverage/` directory
- **Custom test runner** (`test-runner.js`) provides enhanced CLI functionality

## File Structure Patterns

- Tests are co-located with source files (e.g., `MathUtils.js` → `MathUtils.test.js`)
- Each module exports through `index.js` files for clean imports
- Configuration files at root level (`vite.config.js`, `vitest.config.js`)

## Physics and Simulation

- **N-body integration** with Runge-Kutta 4th order
- **Keplerian orbits** for efficient computation
- **Perturbations** including J2, atmospheric drag, solar radiation pressure
- **Time scaling** for educational time-lapse effects
- **Reference frame transformations** for different viewing perspectives

## Rendering Optimization

- **Level of Detail (LOD)** system for performance
- **Instanced rendering** for similar objects
- **Texture streaming** for high-resolution planetary surfaces
- **Custom shaders** for atmospheric effects and planetary rings
- **Adaptive quality** based on performance metrics

## Data Integration

- **NASA JPL Horizons** API for accurate ephemeris data
- **Caching system** using IndexedDB for offline capability
- **Progressive loading** of celestial body data
- **Real-time vs historical** simulation modes

## Development Notes

- The project uses ES6 modules throughout
- Event-driven architecture reduces coupling between subsystems
- Performance is critical - monitor frame rates and memory usage
- All physics calculations maintain double precision
- UI components are designed for both desktop and touch interfaces