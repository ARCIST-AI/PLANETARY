import { CelestialBody } from './CelestialBody.js';
import { BODY_CATEGORIES, SPACECRAFT_TYPES } from '../utils/Constants.js';
import { MathUtils } from '../utils/MathUtils.js';
import { KeplerianOrbit } from '../physics/KeplerianOrbit.js';

/**
 * Spacecraft class for artificial satellites and probes
 */
export class Spacecraft extends CelestialBody {
    /**
     * Create a new spacecraft
     * @param {Object} config - Configuration object
     */
    constructor(config = {}) {
        // Set default category to spacecraft
        config.category = config.category || BODY_CATEGORIES.SPACECRAFT;
        
        super(config);
        
        // Spacecraft-specific properties
        this.spacecraftType = config.spacecraftType || SPACECRAFT_TYPES.SATELLITE;
        this.mission = config.mission || '';
        this.operator = config.operator || '';
        this.status = config.status || 'active';
        this.launchDate = config.launchDate ? new Date(config.launchDate) : null;
        this.decommissionDate = config.decommissionDate ? new Date(config.decommissionDate) : null;
        
        // Physical properties
        this.dryMass = config.dryMass || this.mass;
        this.fuelMass = config.fuelMass || 0;
        this.totalMass = this.dryMass + this.fuelMass;
        this.thrust = config.thrust || 0;
        this.specificImpulse = config.specificImpulse || 0;
        this.fuelConsumption = config.fuelConsumption || 0;
        this.crossSection = config.crossSection || 0;
        this.solarPanelArea = config.solarPanelArea || 0;
        this.batteryCapacity = config.batteryCapacity || 0;
        this.powerConsumption = config.powerConsumption || 0;
        
        // Propulsion system
        this.hasPropulsion = config.hasPropulsion !== undefined ? config.hasPropulsion : false;
        this.propulsionType = config.propulsionType || 'chemical';
        this.isThrusting = config.isThrusting !== undefined ? config.isThrusting : false;
        this.thrustDirection = config.thrustDirection || { x: 0, y: 0, z: 0 };
        this.thrustVector = config.thrustVector || { x: 0, y: 0, z: 0 };
        
        // Attitude control
        this.hasAttitudeControl = config.hasAttitudeControl !== undefined ? config.hasAttitudeControl : true;
        this.attitude = config.attitude || { roll: 0, pitch: 0, yaw: 0 };
        this.attitudeRate = config.attitudeRate || { roll: 0, pitch: 0, yaw: 0 };
        this.targetAttitude = config.targetAttitude || { roll: 0, pitch: 0, yaw: 0 };
        this.attitudeControlMode = config.attitudeControlMode || 'inertial';
        
        // Communication
        this.hasCommunication = config.hasCommunication !== undefined ? config.hasCommunication : true;
        this.communicationRange = config.communicationRange || 0;
        this.dataRate = config.dataRate || 0;
        this.antennaGain = config.antennaGain || 0;
        this.frequency = config.frequency || 0;
        this.isCommunicating = config.isCommunicating !== undefined ? config.isCommunicating : false;
        this.communicationTarget = config.communicationTarget || null;
        
        // Navigation
        this.hasNavigation = config.hasNavigation !== undefined ? config.hasNavigation : true;
        this.navigationMode = config.navigationMode || 'inertial';
        this.navigationAccuracy = config.navigationAccuracy || 0;
        this.positionError = config.positionError || { x: 0, y: 0, z: 0 };
        this.velocityError = config.velocityError || { x: 0, y: 0, z: 0 };
        
        // Scientific instruments
        this.hasInstruments = config.hasInstruments !== undefined ? config.hasInstruments : false;
        this.instruments = config.instruments || [];
        this.isRecording = config.isRecording !== undefined ? config.isRecording : false;
        this.dataStorage = config.dataStorage || 0;
        this.dataStorageUsed = config.dataStorageUsed || 0;
        
        // Thermal control
        this.hasThermalControl = config.hasThermalControl !== undefined ? config.hasThermalControl : true;
        this.temperature = config.temperature || 0;
        this.targetTemperature = config.targetTemperature || 0;
        this.heaterPower = config.heaterPower || 0;
        this.radiatorArea = config.radiatorArea || 0;
        
        // Trajectory
        this.trajectory = config.trajectory || [];
        this.maxTrajectoryLength = config.maxTrajectoryLength || 1000;
        this.trajectoryType = config.trajectoryType || 'keplerian';
        this.maneuverNodes = config.maneuverNodes || [];
        
        // Mission parameters
        this.missionPhase = config.missionPhase || 'launch';
        this.missionDuration = config.missionDuration || 0;
        this.missionElapsedTime = config.missionElapsedTime || 0;
        this.missionObjectives = config.missionObjectives || [];
        this.completedObjectives = config.completedObjectives || [];
        
        // Ground stations
        this.groundStations = config.groundStations || [];
        this.visibleGroundStations = config.visibleGroundStations || [];
        this.nextGroundStationContact = config.nextGroundStationContact || null;
        
        // Update derived properties
        this.updateDerivedProperties();
    }

    /**
     * Update derived properties based on primary properties
     */
    updateDerivedProperties() {
        // Update total mass
        this.totalMass = this.dryMass + this.fuelMass;
        this.mass = this.totalMass;
        
        // Update fuel consumption from thrust and specific impulse
        if (this.thrust > 0 && this.specificImpulse > 0) {
            const g0 = 9.80665; // Standard gravity
            this.fuelConsumption = this.thrust / (this.specificImpulse * g0);
        }
        
        // Update thrust vector
        if (this.isThrusting && this.thrust > 0) {
            const directionMagnitude = MathUtils.vectorMagnitude(this.thrustDirection);
            if (directionMagnitude > 0) {
                this.thrustVector = MathUtils.multiplyVector(
                    MathUtils.normalizeVector(this.thrustDirection),
                    this.thrust
                );
            }
        } else {
            this.thrustVector = { x: 0, y: 0, z: 0 };
        }
    }

    /**
     * Set thrust direction
     * @param {Object} direction - Thrust direction vector
     */
    setThrustDirection(direction) {
        const magnitude = MathUtils.vectorMagnitude(direction);
        if (magnitude > 0) {
            this.thrustDirection = MathUtils.normalizeVector(direction);
        }
    }

    /**
     * Start thrusting
     */
    startThrust() {
        if (this.hasPropulsion && this.fuelMass > 0) {
            this.isThrusting = true;
        }
    }

    /**
     * Stop thrusting
     */
    stopThrust() {
        this.isThrusting = false;
        this.thrustVector = { x: 0, y: 0, z: 0 };
    }

    /**
     * Toggle thrusting
     */
    toggleThrust() {
        if (this.isThrusting) {
            this.stopThrust();
        } else {
            this.startThrust();
        }
    }

    /**
     * Set target attitude
     * @param {Object} attitude - Target attitude {roll, pitch, yaw}
     */
    setTargetAttitude(attitude) {
        this.targetAttitude = { ...attitude };
    }

    /**
     * Set attitude control mode
     * @param {string} mode - Attitude control mode
     */
    setAttitudeControlMode(mode) {
        this.attitudeControlMode = mode;
    }

    /**
     * Calculate delta-v available
     * @returns {number} Delta-v in m/s
     */
    calculateDeltaV() {
        if (this.dryMass <= 0 || this.fuelMass <= 0 || this.specificImpulse <= 0) {
            return 0;
        }
        
        const g0 = 9.80665; // Standard gravity
        const massRatio = this.totalMass / this.dryMass;
        
        return this.specificImpulse * g0 * Math.log(massRatio);
    }

    /**
     * Calculate burn time for a given delta-v
     * @param {number} deltaV - Delta-v in m/s
     * @returns {number} Burn time in seconds
     */
    calculateBurnTime(deltaV) {
        if (this.thrust <= 0 || this.fuelMass <= 0) return 0;
        
        const g0 = 9.80665; // Standard gravity
        const massRatio = Math.exp(deltaV / (this.specificImpulse * g0));
        const fuelNeeded = this.dryMass * (massRatio - 1);
        
        if (fuelNeeded > this.fuelMass) return 0;
        
        return fuelNeeded / this.fuelConsumption;
    }

    /**
     * Execute a maneuver
     * @param {Object} maneuver - Maneuver parameters
     */
    executeManeuver(maneuver) {
        if (!this.hasPropulsion || this.fuelMass <= 0) return;
        
        const deltaV = maneuver.deltaV || 0;
        const direction = maneuver.direction || { x: 0, y: 0, z: 0 };
        const duration = maneuver.duration || 0;
        
        // Set thrust direction
        this.setThrustDirection(direction);
        
        // Start thrusting
        this.startThrust();
        
        // Schedule stop thrusting
        if (duration > 0) {
            setTimeout(() => {
                this.stopThrust();
            }, duration * 1000);
        }
    }

    /**
     * Add a maneuver node
     * @param {Object} node - Maneuver node parameters
     */
    addManeuverNode(node) {
        this.maneuverNodes.push({
            id: MathUtils.generateUUID(),
            time: node.time || new Date(),
            deltaV: node.deltaV || 0,
            direction: node.direction || { x: 0, y: 0, z: 0 },
            executed: false
        });
    }

    /**
     * Remove a maneuver node
     * @param {string} nodeId - Node ID
     */
    removeManeuverNode(nodeId) {
        this.maneuverNodes = this.maneuverNodes.filter(node => node.id !== nodeId);
    }

    /**
     * Execute the next maneuver node
     */
    executeNextManeuverNode() {
        const nextNode = this.maneuverNodes.find(node => !node.executed);
        if (nextNode) {
            this.executeManeuver(nextNode);
            nextNode.executed = true;
        }
    }

    /**
     * Calculate orbital elements from current state
     * @param {number} centralBodyMass - Mass of central body
     * @returns {Object} Orbital elements
     */
    calculateOrbitalElements(centralBodyMass) {
        return KeplerianOrbit.calculateOrbitalElements(
            this.position,
            this.velocity,
            centralBodyMass
        );
    }

    /**
     * Calculate orbital period
     * @param {number} centralBodyMass - Mass of central body
     * @returns {number} Orbital period in seconds
     */
    calculateOrbitalPeriod(centralBodyMass) {
        const elements = this.calculateOrbitalElements(centralBodyMass);
        return elements.orbitalPeriod;
    }

    /**
     * Calculate orbital velocity
     * @param {number} centralBodyMass - Mass of central body
     * @returns {number} Orbital velocity in m/s
     */
    calculateOrbitalVelocity(centralBodyMass) {
        const distance = MathUtils.vectorMagnitude(this.position);
        if (distance <= 0) return 0;
        
        const mu = 6.67430e-11 * centralBodyMass;
        return Math.sqrt(mu / distance);
    }

    /**
     * Calculate escape velocity
     * @param {number} centralBodyMass - Mass of central body
     * @returns {number} Escape velocity in m/s
     */
    calculateEscapeVelocity(centralBodyMass) {
        const distance = MathUtils.vectorMagnitude(this.position);
        if (distance <= 0) return 0;
        
        const mu = 6.67430e-11 * centralBodyMass;
        return Math.sqrt(2 * mu / distance);
    }

    /**
     * Calculate communication signal strength
     * @param {Object} targetPosition - Position of communication target
     * @returns {number} Signal strength in dB
     */
    calculateSignalStrength(targetPosition) {
        if (!this.hasCommunication) return -Infinity;
        
        const distance = MathUtils.vectorMagnitude(
            MathUtils.subtractVectors(this.position, targetPosition)
        );
        
        if (distance <= 0) return Infinity;
        
        // Simplified signal strength calculation
        const frequency = this.frequency;
        const c = 299792458; // Speed of light
        const wavelength = c / frequency;
        
        // Friis transmission equation
        const txPower = 10; // Assume 10W transmitter
        const txGain = this.antennaGain;
        const rxGain = 10; // Assume 10dBi receiver gain
        
        const pathLoss = 20 * Math.log10(4 * Math.PI * distance / wavelength);
        const signalStrength = txPower + txGain + rxGain - pathLoss;
        
        return signalStrength;
    }

    /**
     * Check if spacecraft is in communication range of target
     * @param {Object} targetPosition - Position of communication target
     * @returns {boolean} True if in range
     */
    isInCommunicationRange(targetPosition) {
        const distance = MathUtils.vectorMagnitude(
            MathUtils.subtractVectors(this.position, targetPosition)
        );
        
        return distance <= this.communicationRange;
    }

    /**
     * Start communication with target
     * @param {Object} target - Communication target
     */
    startCommunication(target) {
        if (this.hasCommunication && this.isInCommunicationRange(target.position)) {
            this.isCommunicating = true;
            this.communicationTarget = target;
        }
    }

    /**
     * Stop communication
     */
    stopCommunication() {
        this.isCommunicating = false;
        this.communicationTarget = null;
    }

    /**
     * Start recording data
     */
    startRecording() {
        if (this.hasInstruments && this.dataStorageUsed < this.dataStorage) {
            this.isRecording = true;
        }
    }

    /**
     * Stop recording data
     */
    stopRecording() {
        this.isRecording = false;
    }

    /**
     * Toggle recording
     */
    toggleRecording() {
        if (this.isRecording) {
            this.stopRecording();
        } else {
            this.startRecording();
        }
    }

    /**
     * Add recorded data
     * @param {number} dataSize - Size of data in bytes
     */
    addRecordedData(dataSize) {
        if (this.isRecording) {
            this.dataStorageUsed = Math.min(
                this.dataStorageUsed + dataSize,
                this.dataStorage
            );
        }
    }

    /**
     * Clear recorded data
     */
    clearRecordedData() {
        this.dataStorageUsed = 0;
    }

    /**
     * Calculate power generation
     * @param {Object} sunPosition - Position of the sun
     * @returns {number} Power generation in watts
     */
    calculatePowerGeneration(sunPosition) {
        if (this.solarPanelArea <= 0) return 0;
        
        // Calculate angle to sun
        const sunDirection = MathUtils.normalizeVector(
            MathUtils.subtractVectors(sunPosition, this.position)
        );
        
        // Assume solar panels are oriented optimally
        const solarPanelEfficiency = 0.3; // 30% efficiency
        const solarFlux = 1361; // W/m² at 1 AU
        
        // Calculate distance to sun
        const distanceToSun = MathUtils.vectorMagnitude(
            MathUtils.subtractVectors(sunPosition, this.position)
        );
        
        // Adjust solar flux for distance
        const AU = 1.495978707e11; // meters
        const adjustedFlux = solarFlux * Math.pow(AU / distanceToSun, 2);
        
        // Calculate power generation
        return this.solarPanelArea * solarPanelEfficiency * adjustedFlux;
    }

    /**
     * Calculate power balance
     * @param {Object} sunPosition - Position of the sun
     * @returns {Object} Power balance {generation, consumption, net}
     */
    calculatePowerBalance(sunPosition) {
        const generation = this.calculatePowerGeneration(sunPosition);
        const consumption = this.powerConsumption;
        const net = generation - consumption;
        
        return { generation, consumption, net };
    }

    /**
     * Update spacecraft state
     * @param {Date} time - Current time
     * @param {number} deltaTime - Time elapsed in seconds
     */
    update(time, deltaTime) {
        super.update(time, deltaTime);
        
        // Update derived properties
        this.updateDerivedProperties();
        
        // Update mission elapsed time
        if (this.launchDate && time > this.launchDate) {
            this.missionElapsedTime = (time - this.launchDate) / 1000; // Convert to seconds
        }
        
        // Update fuel mass if thrusting
        if (this.isThrusting && this.fuelMass > 0) {
            const fuelUsed = this.fuelConsumption * deltaTime;
            this.fuelMass = Math.max(0, this.fuelMass - fuelUsed);
            
            // Stop thrusting if out of fuel
            if (this.fuelMass <= 0) {
                this.stopThrust();
            }
        }
        
        // Update attitude
        if (this.hasAttitudeControl) {
            this.updateAttitude(deltaTime);
        }
        
        // Update trajectory
        this.updateTrajectory();
        
        // Update temperature
        if (this.hasThermalControl) {
            this.updateTemperature(deltaTime);
        }
        
        // Update data storage if recording
        if (this.isRecording) {
            this.addRecordedData(this.dataRate * deltaTime);
        }
        
        // Update mission phase
        this.updateMissionPhase();
    }

    /**
     * Update attitude
     * @param {number} deltaTime - Time elapsed in seconds
     */
    updateAttitude(deltaTime) {
        // Simple proportional control
        const kp = 0.1; // Proportional gain
        
        // Calculate error
        const rollError = this.targetAttitude.roll - this.attitude.roll;
        const pitchError = this.targetAttitude.pitch - this.attitude.pitch;
        const yawError = this.targetAttitude.yaw - this.attitude.yaw;
        
        // Update attitude rate
        this.attitudeRate.roll = kp * rollError;
        this.attitudeRate.pitch = kp * pitchError;
        this.attitudeRate.yaw = kp * yawError;
        
        // Update attitude
        this.attitude.roll += this.attitudeRate.roll * deltaTime;
        this.attitude.pitch += this.attitudeRate.pitch * deltaTime;
        this.attitude.yaw += this.attitudeRate.yaw * deltaTime;
        
        // Normalize angles
        this.attitude.roll = MathUtils.normalizeAngle(this.attitude.roll);
        this.attitude.pitch = MathUtils.normalizeAngle(this.attitude.pitch);
        this.attitude.yaw = MathUtils.normalizeAngle(this.attitude.yaw);
    }

    /**
     * Update trajectory
     */
    updateTrajectory() {
        // Add current position to trajectory
        this.trajectory.push({ ...this.position });
        
        // Limit trajectory length
        if (this.trajectory.length > this.maxTrajectoryLength) {
            this.trajectory.shift();
        }
    }

    /**
     * Update temperature
     * @param {number} deltaTime - Time elapsed in seconds
     */
    updateTemperature(deltaTime) {
        // Simple thermal model
        const thermalMass = 1000; // J/K
        const heatCapacity = 1000; // J/(kg·K)
        
        // Calculate heat input from heater
        const heatInput = this.heaterPower * deltaTime;
        
        // Calculate heat loss through radiation
        const stefanBoltzmann = 5.670374419e-8; // W/(m²·K⁴)
        const emissivity = 0.8;
        const surfaceArea = 10; // m²
        const heatLoss = emissivity * stefanBoltzmann * surfaceArea * 
                        Math.pow(this.temperature, 4) * deltaTime;
        
        // Update temperature
        const netHeat = heatInput - heatLoss;
        this.temperature += netHeat / (thermalMass * heatCapacity);
    }

    /**
     * Update mission phase
     */
    updateMissionPhase() {
        if (this.missionElapsedTime < 60) {
            this.missionPhase = 'launch';
        } else if (this.missionElapsedTime < 3600) {
            this.missionPhase = 'early_orbit';
        } else if (this.missionElapsedTime < this.missionDuration * 0.8) {
            this.missionPhase = 'primary_mission';
        } else if (this.missionElapsedTime < this.missionDuration) {
            this.missionPhase = 'extended_mission';
        } else {
            this.missionPhase = 'end_of_mission';
        }
    }

    /**
     * Get spacecraft data for serialization
     * @returns {Object} Serialized spacecraft data
     */
    toJSON() {
        const data = super.toJSON();
        
        // Add spacecraft-specific properties
        data.spacecraftType = this.spacecraftType;
        data.mission = this.mission;
        data.operator = this.operator;
        data.status = this.status;
        data.launchDate = this.launchDate ? this.launchDate.toISOString() : null;
        data.decommissionDate = this.decommissionDate ? this.decommissionDate.toISOString() : null;
        data.dryMass = this.dryMass;
        data.fuelMass = this.fuelMass;
        data.totalMass = this.totalMass;
        data.thrust = this.thrust;
        data.specificImpulse = this.specificImpulse;
        data.fuelConsumption = this.fuelConsumption;
        data.crossSection = this.crossSection;
        data.solarPanelArea = this.solarPanelArea;
        data.batteryCapacity = this.batteryCapacity;
        data.powerConsumption = this.powerConsumption;
        data.hasPropulsion = this.hasPropulsion;
        data.propulsionType = this.propulsionType;
        data.isThrusting = this.isThrusting;
        data.thrustDirection = this.thrustDirection;
        data.thrustVector = this.thrustVector;
        data.hasAttitudeControl = this.hasAttitudeControl;
        data.attitude = this.attitude;
        data.attitudeRate = this.attitudeRate;
        data.targetAttitude = this.targetAttitude;
        data.attitudeControlMode = this.attitudeControlMode;
        data.hasCommunication = this.hasCommunication;
        data.communicationRange = this.communicationRange;
        data.dataRate = this.dataRate;
        data.antennaGain = this.antennaGain;
        data.frequency = this.frequency;
        data.isCommunicating = this.isCommunicating;
        data.communicationTargetId = this.communicationTarget ? this.communicationTarget.id : null;
        data.hasNavigation = this.hasNavigation;
        data.navigationMode = this.navigationMode;
        data.navigationAccuracy = this.navigationAccuracy;
        data.positionError = this.positionError;
        data.velocityError = this.velocityError;
        data.hasInstruments = this.hasInstruments;
        data.instruments = this.instruments;
        data.isRecording = this.isRecording;
        data.dataStorage = this.dataStorage;
        data.dataStorageUsed = this.dataStorageUsed;
        data.hasThermalControl = this.hasThermalControl;
        data.temperature = this.temperature;
        data.targetTemperature = this.targetTemperature;
        data.heaterPower = this.heaterPower;
        data.radiatorArea = this.radiatorArea;
        data.trajectoryType = this.trajectoryType;
        data.maneuverNodes = this.maneuverNodes;
        data.missionPhase = this.missionPhase;
        data.missionDuration = this.missionDuration;
        data.missionElapsedTime = this.missionElapsedTime;
        data.missionObjectives = this.missionObjectives;
        data.completedObjectives = this.completedObjectives;
        data.groundStationIds = this.groundStations.map(station => station.id);
        
        return data;
    }

    /**
     * Create spacecraft from JSON data
     * @param {Object} data - Serialized spacecraft data
     * @returns {Spacecraft} New spacecraft
     */
    static fromJSON(data) {
        return new Spacecraft(data);
    }
}