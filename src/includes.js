L.gmx = L.gmx || {};

// import './commonjs.js';
import './Parsers.js';
import './Deferred.js';
import './ImageLoader.js';
import './Utils.js';
import './DrawCanvas.js';
import './SessionManager.js';
import {gmxMapManager} from './MapManager.js';	L.gmx.gmxMapManager = gmxMapManager;
import './GeomixerMap.js';
import './EventsManager.js';
import './Locale.js';
import './lang_ru.js';
import './lang_en.js';

import './DataManager/VectorTileLoader.js';
import './DataManager/VectorTile.js';
import {Observer} from './DataManager/Observer.js';	L.gmx.observer = function(options) { return new Observer(options); };
import './DataManager/TilesTree.js';
import {DataManager} from './DataManager/DataManager.js';	L.gmx.DataManager = DataManager;

import './Layer/VectorLayer.js';
import './Layer/ScreenVectorTile.js';
import './Layer/ObjectsReorder.js';
import './Layer/StyleManager.js';
import './Layer/VectorLayer.Popup.js';
import './Layer/VectorLayer.Hover.js';
import './Layer/LayersVersion.js';
import './Layer/RasterLayer.js';
import './Layer/LabelsLayer.js';
import './Layer/ClipPolygon.js';
import './Layer/ImageTransform.js';
import './Layer/ProjectiveImageWebGL.js';
import './Layer/ProjectiveImage.js';

import './Layer/external/RotatedMarker.js';
import './Layer/external/ExternalLayer.js';
import './Layer/external/BindWMS.js';
import './Layer/external/HeatMap.js';
import './Layer/external/MarkerCluster.js';

import './LayerFactory.js';
