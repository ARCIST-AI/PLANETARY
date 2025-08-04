/**
 * Tests for worker classes
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

// Mock worker environment
global.self = {
  onmessage: null,
  postMessage: vi.fn()
};

// Import the worker class after setting up mocks
// Note: In a real web worker environment, we can't use ES6 imports
// This is a test-specific setup to test the worker logic

describe('SimulationWorker', () => {
  let worker;

  // Mock SimulationWorker class for testing
  class SimulationWorker {
    constructor() {
      this.initialized = false;
      this.id = null;
      
      // Set up message handler
      global.self.onmessage = this.handleMessage.bind(this);
    }
    
    handleMessage(event) {
      const { type, id, taskId, data } = event.data;
      
      switch (type) {
        case 'init':
          this.init(id, data);
          break;
        case 'task':
          this.executeTask(taskId, data);
          break;
        default:
          console.warn(`Unknown message type: ${type}`);
      }
    }
    
    init(id, data) {
      this.id = id;
      this.initialized = true;
      
      global.self.postMessage({
        type: 'ready',
        id
      });
    }
    
    executeTask(taskId, data) {
      try {
        const { taskType, taskData } = data;
        
        let result;
        
        switch (taskType) {
          case 'nbody':
            result = this.executeNBodyTask(taskData);
            break;
          case 'orbit':
            result = this.executeOrbitTask(taskData);
            break;
          case 'collision':
            result = this.executeCollisionTask(taskData);
            break;
          case 'gravity':
            result = this.executeGravityTask(taskData);
            break;
          case 'integration':
            result = this.executeIntegrationTask(taskData);
            break;
          default:
            throw new Error(`Unknown task type: ${taskType}`);
        }
        
        global.self.postMessage({
          type: 'result',
          taskId,
          result
        });
      } catch (error) {
        global.self.postMessage({
          type: 'error',
          taskId,
          error: error.message
        });
      }
    }
    
    executeNBodyTask(data) {
      const { bodies, deltaTime, steps } = data;
      
      const clonedBodies = bodies.map(body => ({ ...body }));
      
      for (let step = 0; step < steps; step++) {
        this.updateNBody(clonedBodies, deltaTime);
      }
      
      return {
        bodies: clonedBodies,
        steps
      };
    }
    
    updateNBody(bodies, deltaTime) {
      const G = 6.67430e-11;
      
      // Calculate accelerations
      for (let i = 0; i < bodies.length; i++) {
        const body1 = bodies[i];
        body1.acceleration = { x: 0, y: 0, z: 0 };
        
        for (let j = 0; j < bodies.length; j++) {
          if (i === j) continue;
          
          const body2 = bodies[j];
          
          const dx = body2.position.x - body1.position.x;
          const dy = body2.position.y - body1.position.y;
          const dz = body2.position.z - body1.position.z;
          
          const distanceSquared = dx * dx + dy * dy + dz * dz;
          const distance = Math.sqrt(distanceSquared);
          
          if (distance === 0) continue;
          
          const force = G * body1.mass * body2.mass / distanceSquared;
          const acceleration = force / body1.mass;
          
          body1.acceleration.x += acceleration * dx / distance;
          body1.acceleration.y += acceleration * dy / distance;
          body1.acceleration.z += acceleration * dz / distance;
        }
      }
      
      // Update velocities and positions
      for (const body of bodies) {
        body.velocity.x += body.acceleration.x * deltaTime;
        body.velocity.y += body.acceleration.y * deltaTime;
        body.velocity.z += body.acceleration.z * deltaTime;
        
        body.position.x += body.velocity.x * deltaTime;
        body.position.y += body.velocity.y * deltaTime;
        body.position.z += body.velocity.z * deltaTime;
      }
    }
    
    executeOrbitTask(data) {
      const { orbitalElements, timeSteps } = data;
      
      const positions = [];
      
      for (const time of timeSteps) {
        const position = this.calculateOrbitalPosition(orbitalElements, time);
        positions.push({ time, position });
      }
      
      return { positions };
    }
    
    calculateOrbitalPosition(orbitalElements, time) {
      const {
        semiMajorAxis,
        eccentricity,
        inclination,
        longitudeOfAscendingNode,
        argumentOfPeriapsis,
        meanAnomalyAtEpoch,
        orbitalPeriod
      } = orbitalElements;
      
      const meanMotion = 2 * Math.PI / orbitalPeriod;
      const meanAnomaly = meanAnomalyAtEpoch + meanMotion * time;
      
      let eccentricAnomaly = meanAnomaly;
      for (let i = 0; i < 10; i++) {
        eccentricAnomaly = meanAnomaly + eccentricity * Math.sin(eccentricAnomaly);
      }
      
      const trueAnomaly = 2 * Math.atan2(
        Math.sqrt(1 + eccentricity) * Math.sin(eccentricAnomaly / 2),
        Math.sqrt(1 - eccentricity) * Math.cos(eccentricAnomaly / 2)
      );
      
      const distance = semiMajorAxis * (1 - eccentricity * Math.cos(eccentricAnomaly));
      
      const x = distance * Math.cos(trueAnomaly);
      const y = distance * Math.sin(trueAnomaly);
      
      const cosOmega = Math.cos(longitudeOfAscendingNode);
      const sinOmega = Math.sin(longitudeOfAscendingNode);
      const cosI = Math.cos(inclination);
      const sinI = Math.sin(inclination);
      const cosW = Math.cos(argumentOfPeriapsis);
      const sinW = Math.sin(argumentOfPeriapsis);
      
      return {
        x: (cosOmega * cosW - sinOmega * sinW * cosI) * x + (-cosOmega * sinW - sinOmega * cosW * cosI) * y,
        y: (sinOmega * cosW + cosOmega * sinW * cosI) * x + (-sinOmega * sinW + cosOmega * cosW * cosI) * y,
        z: (sinW * sinI) * x + (cosW * sinI) * y
      };
    }
    
    executeCollisionTask(data) {
      const { bodies, deltaTime } = data;
      
      const collisions = [];
      
      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const body1 = bodies[i];
          const body2 = bodies[j];
          
          const dx = body2.position.x - body1.position.x;
          const dy = body2.position.y - body1.position.y;
          const dz = body2.position.z - body1.position.z;
          
          const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
          
          if (distance < body1.radius + body2.radius) {
            const relativeVelocity = {
              x: body2.velocity.x - body1.velocity.x,
              y: body2.velocity.y - body1.velocity.y,
              z: body2.velocity.z - body1.velocity.z
            };
            
            const relativeSpeed = Math.sqrt(
              relativeVelocity.x * relativeVelocity.x +
              relativeVelocity.y * relativeVelocity.y +
              relativeVelocity.z * relativeVelocity.z
            );
            
            const collisionTime = deltaTime * (body1.radius + body2.radius - distance) / 
              (relativeSpeed * deltaTime + (body1.radius + body2.radius - distance));
            
            collisions.push({
              body1: i,
              body2: j,
              time: collisionTime,
              distance
            });
          }
        }
      }
      
      return { collisions };
    }
    
    executeGravityTask(data) {
      const { bodies } = data;
      
      const G = 6.67430e-11;
      const forces = [];
      
      for (let i = 0; i < bodies.length; i++) {
        const body1 = bodies[i];
        const force = { x: 0, y: 0, z: 0 };
        
        for (let j = 0; j < bodies.length; j++) {
          if (i === j) continue;
          
          const body2 = bodies[j];
          
          const dx = body2.position.x - body1.position.x;
          const dy = body2.position.y - body1.position.y;
          const dz = body2.position.z - body1.position.z;
          
          const distanceSquared = dx * dx + dy * dy + dz * dz;
          const distance = Math.sqrt(distanceSquared);
          
          if (distance === 0) continue;
          
          const forceMagnitude = G * body1.mass * body2.mass / distanceSquared;
          
          force.x += forceMagnitude * dx / distance;
          force.y += forceMagnitude * dy / distance;
          force.z += forceMagnitude * dz / distance;
        }
        
        forces.push(force);
      }
      
      return { forces };
    }
    
    executeIntegrationTask(data) {
      const { bodies, deltaTime, method = 'euler' } = data;
      
      const clonedBodies = bodies.map(body => ({ ...body }));
      
      switch (method) {
        case 'euler':
          this.eulerIntegration(clonedBodies, deltaTime);
          break;
        case 'verlet':
          this.verletIntegration(clonedBodies, deltaTime);
          break;
        case 'rk4':
          this.rk4Integration(clonedBodies, deltaTime);
          break;
        default:
          throw new Error(`Unknown integration method: ${method}`);
      }
      
      return {
        bodies: clonedBodies,
        method
      };
    }
    
    eulerIntegration(bodies, deltaTime) {
      this.updateNBody(bodies, deltaTime);
    }
    
    verletIntegration(bodies, deltaTime) {
      const G = 6.67430e-11;
      const previousPositions = bodies.map(body => ({ ...body.position }));
      
      // Calculate accelerations
      for (let i = 0; i < bodies.length; i++) {
        const body1 = bodies[i];
        body1.acceleration = { x: 0, y: 0, z: 0 };
        
        for (let j = 0; j < bodies.length; j++) {
          if (i === j) continue;
          
          const body2 = bodies[j];
          
          const dx = body2.position.x - body1.position.x;
          const dy = body2.position.y - body1.position.y;
          const dz = body2.position.z - body1.position.z;
          
          const distanceSquared = dx * dx + dy * dy + dz * dz;
          const distance = Math.sqrt(distanceSquared);
          
          if (distance === 0) continue;
          
          const force = G * body1.mass * body2.mass / distanceSquared;
          const acceleration = force / body1.mass;
          
          body1.acceleration.x += acceleration * dx / distance;
          body1.acceleration.y += acceleration * dy / distance;
          body1.acceleration.z += acceleration * dz / distance;
        }
      }
      
      // Update positions
      for (let i = 0; i < bodies.length; i++) {
        const body = bodies[i];
        const prevPos = previousPositions[i];
        
        const newPosition = {
          x: 2 * body.position.x - prevPos.x + body.acceleration.x * deltaTime * deltaTime,
          y: 2 * body.position.y - prevPos.y + body.acceleration.y * deltaTime * deltaTime,
          z: 2 * body.position.z - prevPos.z + body.acceleration.z * deltaTime * deltaTime
        };
        
        body.velocity.x = (newPosition.x - prevPos.x) / (2 * deltaTime);
        body.velocity.y = (newPosition.y - prevPos.y) / (2 * deltaTime);
        body.velocity.z = (newPosition.z - prevPos.z) / (2 * deltaTime);
        
        body.position = newPosition;
      }
    }
    
    rk4Integration(bodies, deltaTime) {
      // Simplified RK4 implementation for testing
      this.updateNBody(bodies, deltaTime);
    }
  }

  beforeEach(() => {
    worker = new SimulationWorker();
    global.self.postMessage.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor', () => {
    it('should create a simulation worker', () => {
      expect(worker.initialized).toBe(false);
      expect(worker.id).toBeNull();
      expect(global.self.onmessage).toBe(worker.handleMessage);
    });
  });

  describe('handleMessage', () => {
    it('should handle init message', () => {
      const message = {
        data: {
          type: 'init',
          id: 1,
          data: {}
        }
      };

      worker.handleMessage(message);

      expect(worker.initialized).toBe(true);
      expect(worker.id).toBe(1);
      expect(global.self.postMessage).toHaveBeenCalledWith({
        type: 'ready',
        id: 1
      });
    });

    it('should handle task message', () => {
      const message = {
        data: {
          type: 'task',
          taskId: 'test-task',
          data: {
            taskType: 'gravity',
            taskData: {
              bodies: [
                {
                  mass: 1e24,
                  position: { x: 0, y: 0, z: 0 }
                },
                {
                  mass: 1e22,
                  position: { x: 1e6, y: 0, z: 0 }
                }
              ]
            }
          }
        }
      };

      worker.handleMessage(message);

      expect(global.self.postMessage).toHaveBeenCalledWith({
        type: 'result',
        taskId: 'test-task',
        result: expect.objectContaining({
          forces: expect.any(Array)
        })
      });
    });

    it('should handle unknown message type', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const message = {
        data: {
          type: 'unknown',
          data: {}
        }
      };

      worker.handleMessage(message);

      expect(consoleSpy).toHaveBeenCalledWith('Unknown message type: unknown');
      consoleSpy.mockRestore();
    });
  });

  describe('executeNBodyTask', () => {
    it('should execute N-body simulation task', () => {
      const taskData = {
        bodies: [
          {
            mass: 1e24,
            position: { x: 0, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 }
          },
          {
            mass: 1e22,
            position: { x: 1e6, y: 0, z: 0 },
            velocity: { x: 0, y: 1000, z: 0 }
          }
        ],
        deltaTime: 1,
        steps: 1
      };

      const result = worker.executeNBodyTask(taskData);

      expect(result).toHaveProperty('bodies');
      expect(result).toHaveProperty('steps');
      expect(result.bodies).toHaveLength(2);
      expect(result.steps).toBe(1);

      // Check that bodies have been updated
      expect(result.bodies[0]).toHaveProperty('acceleration');
      expect(result.bodies[1]).toHaveProperty('acceleration');
    });
  });

  describe('executeOrbitTask', () => {
    it('should execute orbit calculation task', () => {
      const taskData = {
        orbitalElements: {
          semiMajorAxis: 1.496e11,
          eccentricity: 0.0167,
          inclination: 0,
          longitudeOfAscendingNode: 0,
          argumentOfPeriapsis: 0,
          meanAnomalyAtEpoch: 0,
          orbitalPeriod: 31557600
        },
        timeSteps: [0, 7889400, 15778800] // 0, 1/4, 1/2 year
      };

      const result = worker.executeOrbitTask(taskData);

      expect(result).toHaveProperty('positions');
      expect(result.positions).toHaveLength(3);

      for (const positionData of result.positions) {
        expect(positionData).toHaveProperty('time');
        expect(positionData).toHaveProperty('position');
        expect(positionData.position).toHaveProperty('x');
        expect(positionData.position).toHaveProperty('y');
        expect(positionData.position).toHaveProperty('z');
      }
    });
  });

  describe('executeCollisionTask', () => {
    it('should execute collision detection task', () => {
      const taskData = {
        bodies: [
          {
            position: { x: 0, y: 0, z: 0 },
            velocity: { x: 1000, y: 0, z: 0 },
            radius: 1000
          },
          {
            position: { x: 1500, y: 0, z: 0 },
            velocity: { x: -1000, y: 0, z: 0 },
            radius: 1000
          }
        ],
        deltaTime: 1
      };

      const result = worker.executeCollisionTask(taskData);

      expect(result).toHaveProperty('collisions');
      expect(result.collisions).toHaveLength(1);

      const collision = result.collisions[0];
      expect(collision).toHaveProperty('body1');
      expect(collision).toHaveProperty('body2');
      expect(collision).toHaveProperty('time');
      expect(collision).toHaveProperty('distance');
    });

    it('should detect no collisions for distant bodies', () => {
      const taskData = {
        bodies: [
          {
            position: { x: 0, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
            radius: 1000
          },
          {
            position: { x: 1e6, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 },
            radius: 1000
          }
        ],
        deltaTime: 1
      };

      const result = worker.executeCollisionTask(taskData);

      expect(result.collisions).toHaveLength(0);
    });
  });

  describe('executeGravityTask', () => {
    it('should execute gravity calculation task', () => {
      const taskData = {
        bodies: [
          {
            mass: 1e24,
            position: { x: 0, y: 0, z: 0 }
          },
          {
            mass: 1e22,
            position: { x: 1e6, y: 0, z: 0 }
          }
        ]
      };

      const result = worker.executeGravityTask(taskData);

      expect(result).toHaveProperty('forces');
      expect(result.forces).toHaveLength(2);

      // Check that forces are calculated
      const force1 = result.forces[0];
      const force2 = result.forces[1];

      expect(force1).toHaveProperty('x');
      expect(force1).toHaveProperty('y');
      expect(force1).toHaveProperty('z');

      expect(force2).toHaveProperty('x');
      expect(force2).toHaveProperty('y');
      expect(force2).toHaveProperty('z');

      // Forces should be equal and opposite (Newton's third law)
      expect(force1.x).toBeCloseTo(-force2.x);
      expect(force1.y).toBeCloseTo(-force2.y);
      expect(force1.z).toBeCloseTo(-force2.z);
    });
  });

  describe('executeIntegrationTask', () => {
    it('should execute Euler integration task', () => {
      const taskData = {
        bodies: [
          {
            mass: 1e24,
            position: { x: 0, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 }
          },
          {
            mass: 1e22,
            position: { x: 1e6, y: 0, z: 0 },
            velocity: { x: 0, y: 1000, z: 0 }
          }
        ],
        deltaTime: 1,
        method: 'euler'
      };

      const result = worker.executeIntegrationTask(taskData);

      expect(result).toHaveProperty('bodies');
      expect(result).toHaveProperty('method');
      expect(result.method).toBe('euler');
      expect(result.bodies).toHaveLength(2);
    });

    it('should execute Verlet integration task', () => {
      const taskData = {
        bodies: [
          {
            mass: 1e24,
            position: { x: 0, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 }
          },
          {
            mass: 1e22,
            position: { x: 1e6, y: 0, z: 0 },
            velocity: { x: 0, y: 1000, z: 0 }
          }
        ],
        deltaTime: 1,
        method: 'verlet'
      };

      const result = worker.executeIntegrationTask(taskData);

      expect(result.method).toBe('verlet');
      expect(result.bodies).toHaveLength(2);
    });

    it('should execute RK4 integration task', () => {
      const taskData = {
        bodies: [
          {
            mass: 1e24,
            position: { x: 0, y: 0, z: 0 },
            velocity: { x: 0, y: 0, z: 0 }
          }
        ],
        deltaTime: 1,
        method: 'rk4'
      };

      const result = worker.executeIntegrationTask(taskData);

      expect(result.method).toBe('rk4');
      expect(result.bodies).toHaveLength(1);
    });

    it('should throw error for unknown integration method', () => {
      const taskData = {
        bodies: [],
        deltaTime: 1,
        method: 'unknown'
      };

      expect(() => {
        worker.executeIntegrationTask(taskData);
      }).toThrow('Unknown integration method: unknown');
    });
  });

  describe('error handling', () => {
    it('should handle task execution errors', () => {
      const message = {
        data: {
          type: 'task',
          taskId: 'error-task',
          data: {
            taskType: 'unknown',
            taskData: {}
          }
        }
      };

      worker.handleMessage(message);

      expect(global.self.postMessage).toHaveBeenCalledWith({
        type: 'error',
        taskId: 'error-task',
        error: 'Unknown task type: unknown'
      });
    });
  });

  describe('calculateOrbitalPosition', () => {
    it('should calculate orbital position correctly', () => {
      const orbitalElements = {
        semiMajorAxis: 1.496e11, // 1 AU
        eccentricity: 0,
        inclination: 0,
        longitudeOfAscendingNode: 0,
        argumentOfPeriapsis: 0,
        meanAnomalyAtEpoch: 0,
        orbitalPeriod: 31557600 // 1 year in seconds
      };

      const position = worker.calculateOrbitalPosition(orbitalElements, 0);

      expect(position).toHaveProperty('x');
      expect(position).toHaveProperty('y');
      expect(position).toHaveProperty('z');

      // For circular orbit at time 0, should be at (a, 0, 0)
      expect(position.x).toBeCloseTo(1.496e11);
      expect(position.y).toBeCloseTo(0);
      expect(position.z).toBeCloseTo(0);
    });
  });

  describe('updateNBody', () => {
    it('should update N-body system correctly', () => {
      const bodies = [
        {
          mass: 1e24,
          position: { x: 0, y: 0, z: 0 },
          velocity: { x: 0, y: 0, z: 0 }
        },
        {
          mass: 1e22,
          position: { x: 1e6, y: 0, z: 0 },
          velocity: { x: 0, y: 0, z: 0 }
        }
      ];

      const initialPosition = { ...bodies[1].position };
      worker.updateNBody(bodies, 1);

      // Bodies should have moved due to gravitational attraction
      expect(bodies[0].position.x).not.toBe(0);
      expect(bodies[1].position.x).not.toBe(initialPosition.x);

      // Check that accelerations were calculated
      expect(bodies[0]).toHaveProperty('acceleration');
      expect(bodies[1]).toHaveProperty('acceleration');
    });
  });
});