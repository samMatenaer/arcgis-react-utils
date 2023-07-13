import MapView from '@arcgis/core/views/MapView';
import {
  CalciteBlock,
  CalciteLabel,
  CalcitePanel,
  CalciteShellPanel,
} from '@esri/calcite-components-react';
import {
  ArcLayerList,
  ArcMapView,
  ArcUI,
  useWatchEffect,
  useWatchState,
} from 'arcgis-react';
import { useState } from 'react';

export default function ReactiveUtils() {
  const [mapView, setMapView] = useState<MapView>();
  const [scale, setScale] = useState<string>();
  const [previousExtent, setPreviousExtent] = useState<__esri.Extent>();
  const [currentExtent, setCurrentExtent] = useState<__esri.Extent>();

  // Match the state of Popup visbility
  const popupVisible = useWatchState(() => mapView?.popup.visible, [mapView]);

  // Check if all layers are visible
  const allLayersVisible = useWatchState(
    () => mapView?.layerViews.every((layer) => layer.visible) ?? false,
    [mapView?.layerViews]
  );

  // Get the titles of all visible layers
  const visibleLayers = useWatchState(
    () => mapView?.allLayerViews.filter((layer) => layer.visible),
    [mapView?.allLayerViews]
  );

  // When the map is stationary, update the scale and extent
  useWatchEffect(
    () => [mapView?.stationary, mapView?.extent, mapView?.scale] as const,
    ([stationary, extent, scale], [prevStationary]) => {
      if (stationary) {
        if (scale) setScale((Math.round(scale * 100) / 100).toFixed(0));
        if (extent !== currentExtent) {
          setCurrentExtent(extent);
          setPreviousExtent(currentExtent);
        }
      } else if (prevStationary) {
        setCurrentExtent(extent);
      }
    }
  );

  return (
    <div style={{ height: '100%', display: 'flex' }}>
      {/* Map View Container */}
      <ArcMapView
        map={{ portalItem: { id: '2361e8f3f8114c0fa544090d2ff1cbe6' } }}
        center={[-118.805, 34.027]}
        zoom={7}
        onViewCreated={setMapView}
        style={{ height: '100%', flex: 1 }}
      >
        {/* Render the LayerList widget */}
        <ArcUI position="top-right">
          <ArcLayerList />
        </ArcUI>
      </ArcMapView>

      {/* Side Panel UI */}
      <CalciteShellPanel slot="panel-end" position="end" style={titleStyle}>
        <CalcitePanel>
          <CalciteBlock
            heading="Extent Property"
            description="Displays the current and previous extent value when the extent has changed."
            collapsible
            open
          >
            {currentExtent && <Extent isNew extent={currentExtent} />}
            {previousExtent && <Extent extent={previousExtent} />}
          </CalciteBlock>
          <CalciteBlock
            heading="Scale Property"
            description="Displays the current scale value when the scale has changed."
            collapsible
            open
          >
            <CalciteLabel layout="inline-space-between">
              <span style={titleStyle}>Current scale: </span>
              {scale}
            </CalciteLabel>
          </CalciteBlock>
          <CalciteBlock
            heading="Popup Visible Property"
            description="Displays the value of the popup's visible property on the view."
            collapsible
            open
          >
            <CalciteLabel layout="inline-space-between">
              <span style={titleStyle}>Popup visible: </span>
              <b>{popupVisible ? 'true' : 'false'}</b>
            </CalciteLabel>
          </CalciteBlock>
          <CalciteBlock
            heading="Visible Layers Properties"
            description="Checks if all the layers are visible or not and shows the current visible layers in the map."
            collapsible
            open
          >
            <CalciteLabel>
              <span style={titleStyle}>
                {allLayersVisible ? 'All' : 'Not all'} layers are visible
              </span>
              {visibleLayers?.map(({ layer }) => (
                <div key={layer.title}>- {layer.title}</div>
              ))}
            </CalciteLabel>
          </CalciteBlock>
        </CalcitePanel>
      </CalciteShellPanel>
    </div>
  );
}

const Coord = ({ num = 0, label = '' }) => (
  <div>
    {label}: {(Math.round(num * 100) / 100).toFixed(0)}
  </div>
);

const Extent = ({
  isNew = false,
  extent,
}: {
  isNew?: boolean;
  extent: __esri.Extent;
}) => (
  <CalciteLabel>
    <span style={titleStyle}>
      {isNew ? 'Current extent' : 'Previous extent'}
    </span>
    <Coord label="xmax" num={extent.xmax} />{' '}
    <Coord label="xmin" num={extent.xmin} />{' '}
    <Coord label="ymax" num={extent.ymax} />{' '}
    <Coord label="ymin" num={extent.ymin} />{' '}
  </CalciteLabel>
);

const titleStyle = { color: '#e6772e' };
