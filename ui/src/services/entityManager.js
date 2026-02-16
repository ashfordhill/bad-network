export class EntityManager {
  constructor(mapProvider) {
    this.mapProvider = mapProvider;
    this.entities = new Map();
    this.useDelta = false;
  }

  setUseDelta(useDelta) {
    this.useDelta = useDelta;
  }

  handleTrafficEvent(event) {
    if (this.useDelta) {
      this.handleDeltaEvent(event);
    } else {
      this.handleAbsoluteEvent(event);
    }
  }

  handleAbsoluteEvent(event) {
    const { id, lat, lon, timestamp } = event;
    
    if (!id || lat === undefined || lon === undefined) {
      console.warn('Invalid traffic event:', event);
      return;
    }

    const existing = this.entities.get(id);
    
    if (existing) {
      this.mapProvider.updateEntity(id, lat, lon);
      existing.lat = lat;
      existing.lon = lon;
      existing.timestamp = timestamp;
    } else {
      this.mapProvider.addEntity(id, lat, lon, {
        size: 10,
        showLabel: false,
      });
      this.entities.set(id, { lat, lon, timestamp });
    }
  }

  handleDeltaEvent(event) {
    const { id, deltaLat, deltaLong, timestamp, newEntity, lat, lon } = event;
    
    if (!id) {
      console.warn('Invalid delta event: missing id', event);
      return;
    }

    const existing = this.entities.get(id);
    
    if (newEntity || !existing) {
      if (lat !== undefined && lon !== undefined) {
        this.mapProvider.addEntity(id, lat, lon, {
          size: 10,
          showLabel: false,
        });
        this.entities.set(id, { lat, lon, timestamp });
      } else {
        console.warn('New entity without initial coordinates:', event);
      }
    } else {
      const newLat = existing.lat + (deltaLat || 0);
      const newLon = existing.lon + (deltaLong || 0);
      
      this.mapProvider.updateEntity(id, newLat, newLon);
      existing.lat = newLat;
      existing.lon = newLon;
      existing.timestamp = timestamp;
    }
  }

  removeEntity(id) {
    if (this.entities.has(id)) {
      this.mapProvider.removeEntity(id);
      this.entities.delete(id);
    }
  }

  clearAll() {
    this.mapProvider.clearEntities();
    this.entities.clear();
  }

  getEntityCount() {
    return this.entities.size;
  }

  getEntity(id) {
    return this.entities.get(id);
  }

  getAllEntities() {
    return Array.from(this.entities.entries()).map(([id, data]) => ({
      id,
      ...data,
    }));
  }

  removeStaleEntities(maxAgeMs = 60000) {
    const now = Date.now();
    const toRemove = [];
    
    this.entities.forEach((data, id) => {
      if (data.timestamp && now - data.timestamp > maxAgeMs) {
        toRemove.push(id);
      }
    });
    
    toRemove.forEach(id => this.removeEntity(id));
    
    return toRemove.length;
  }
}
