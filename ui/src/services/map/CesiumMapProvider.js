import * as Cesium from 'cesium';
import { MapProvider } from './MapProvider';

export class CesiumMapProvider extends MapProvider {
  constructor(containerId) {
    super(containerId);
    this.viewer = null;
    this.entities = new Map();
    this.optimizationEnabled = false;
  }

  initialize() {
    const token = import.meta.env.VITE_CESIUM_TOKEN;
    if (token) {
      Cesium.Ion.defaultAccessToken = token;
    }

    this.viewer = new Cesium.Viewer(this.containerId, {
      terrainProvider: token ? Cesium.createWorldTerrain() : undefined,
      timeline: false,
      animation: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      fullscreenButton: false,
    });

    this.viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(-95.0, 40.0, 5000000.0),
    });

    return this.viewer;
  }

  addEntity(id, lat, lon, options = {}) {
    const entity = this.viewer.entities.add({
      id: id,
      position: Cesium.Cartesian3.fromDegrees(lon, lat, 0),
      point: {
        pixelSize: options.size || 10,
        color: options.color || Cesium.Color.RED,
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
      },
      label: options.showLabel ? {
        text: id,
        font: '12px sans-serif',
        pixelOffset: new Cesium.Cartesian2(0, -20),
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      } : undefined,
    });

    this.entities.set(id, { entity, lat, lon });
    return entity;
  }

  updateEntity(id, lat, lon) {
    const entityData = this.entities.get(id);
    if (entityData) {
      entityData.entity.position = Cesium.Cartesian3.fromDegrees(lon, lat, 0);
      entityData.lat = lat;
      entityData.lon = lon;
    }
  }

  removeEntity(id) {
    const entityData = this.entities.get(id);
    if (entityData) {
      this.viewer.entities.remove(entityData.entity);
      this.entities.delete(id);
    }
  }

  clearEntities() {
    this.viewer.entities.removeAll();
    this.entities.clear();
  }

  destroy() {
    if (this.viewer) {
      this.viewer.destroy();
      this.viewer = null;
    }
    this.entities.clear();
  }

  flyTo(lat, lon, altitude = 1000000) {
    if (this.viewer) {
      this.viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lon, lat, altitude),
        duration: 2.0,
      });
    }
  }

  setOptimization(enabled) {
    this.optimizationEnabled = enabled;
    if (this.viewer) {
      this.viewer.scene.requestRenderMode = enabled;
      this.viewer.scene.maximumRenderTimeChange = enabled ? Infinity : 0;
    }
  }

  getEntityPosition(id) {
    const entityData = this.entities.get(id);
    return entityData ? { lat: entityData.lat, lon: entityData.lon } : null;
  }
}
