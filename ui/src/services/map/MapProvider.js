export class MapProvider {
  constructor(containerId) {
    if (new.target === MapProvider) {
      throw new TypeError('Cannot construct MapProvider instances directly');
    }
    this.containerId = containerId;
  }

  initialize() {
    throw new Error('Method initialize() must be implemented');
  }

  addEntity(id, lat, lon, options = {}) {
    throw new Error('Method addEntity() must be implemented');
  }

  updateEntity(id, lat, lon) {
    throw new Error('Method updateEntity() must be implemented');
  }

  removeEntity(id) {
    throw new Error('Method removeEntity() must be implemented');
  }

  clearEntities() {
    throw new Error('Method clearEntities() must be implemented');
  }

  destroy() {
    throw new Error('Method destroy() must be implemented');
  }

  flyTo(lat, lon, altitude) {
    throw new Error('Method flyTo() must be implemented');
  }

  setOptimization(enabled) {
    throw new Error('Method setOptimization() must be implemented');
  }
}
