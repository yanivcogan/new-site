import React from 'react';
import MapboxGL from 'mapbox-gl';
import ReactMapboxGl, { Marker, ZoomControl, Layer, 
                        Feature, Source, Popup } from 'react-mapbox-gl';
import "../style/map.scss";


const Map = ReactMapboxGl({
    accessToken: "pk.eyJ1IjoicmNzY2FzdGlsbG8iLCJhIjoiY2pseDZ2bmp0MDcwYzNwcGp1bjBqNHo4aSJ9.3bD8gQrMAIEqV6yyS-__vg"
  });

export default class MapPage extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedState: null,
            selectedCD: null,
            popupLngLat: null,
            hoveredState: null,
            hoveredStateMarker: null,
            // stateCDs: [],
            hoveredCD: null,
            hoveredCDMarker: null
        };
    }

    onStyleLoad(map) {

        map.setCenter({lng: -95.7129, lat: 37.0902});
        map.setZoom(4);

        map.on('mousemove', 'states-fill', e => {
            const stateProp =  e.features[0].properties;

            // Set data to highlight State that is not chosen...
            if(this.state.selectedState !== stateProp.STATE) {
                const relatedFeatures = stateProp.STATE ? map.querySourceFeatures('states', {
                    sourceLayer: 'gz_2010_us_040_00_5m-81sosm',
                    filter: ['==', 'STATE', stateProp.STATE]
                }) : null;

                const bounds = this.getBounds(e.features[0].geometry);
                const hoveredStateMarker = e.lngLat; //[(bounds.getEast() + bounds.getWest())/2.0, bounds.getNorth()];
                this.setState({
                    hoveredState: relatedFeatures, 
                    hoveredStateMarker: [e.lngLat.lng, e.lngLat.lat]}
                );
            } else {
                this.setState({ hoveredStateMarker: null });
            }
        });

        map.on('mousemove', 'cd-fill', e => {
            const stateProp =  e.features[0].properties;

            // Set data to highlight State
            if (this.state.selectedState 
                && this.state.selectedState == stateProp.STATEFP
                && (!this.state.selectedCD || this.state.selectedCD.CD116FP !== stateProp.CD116FP)) {

                const relatedFeatures = map.querySourceFeatures('congressional-districts', {
                    sourceLayer: 'cd-0ayx0b',
                    filter: ['all',
                                ['==', 'CD116FP', stateProp.CD116FP],
                                ['==', 'STATEFP', stateProp.STATEFP]
                            ]
                });
    
                this.setState({ hoveredCD: relatedFeatures, hoveredCDMarker: [e.lngLat.lng, e.lngLat.lat]});
            } else {
                this.setState({ hoveredCD: null, hoveredCDMarker: null });
            }
        })

        map.on('click', 'cd-fill', e => {
            const cdProps =  e.features[0].properties;

            if (this.state.selectedState && cdProps.STATEFP === this.state.selectedState) {
                this.setState({ selectedCD: cdProps, popupLngLat: [e.lngLat.lng, e.lngLat.lat], hoveredCDMarker: null });
            }
        });

        // Select a state to focus
        map.on('click', 'states-fill', e => {
            const stateProp =  e.features[0].properties;

            // Clear any popups...
            this.state.selectedState != stateProp.STATE && this.setState({ popupLngLat: null });

            this.setState({ selectedState: stateProp.STATE, hoveredStateMarker: null, hoveredState: null });
        
            // Show all districts in the state
            map.setPaintProperty('cd-line', 'line-opacity', ['case', 
                ['==', ['get', 'STATEFP'], `${stateProp.STATE}`], 1,
                0
            ]);
            map.setPaintProperty('cd-fill', 'fill-opacity', ['case', 
                ['==', ['get', 'STATEFP'], `${stateProp.STATE}`], 0.1,
                0
            ]);

           const bounds = this.getBounds(e.features[0].geometry);
            if(map.getZoom() <= 5) {
                map.fitBounds(bounds, { padding: 100, animate: false });
            }            
        });

    } 

    getBounds(geom) {
         // Zoom in to State
         let coordinates = geom.coordinates;
         if (coordinates.length > 1) {
             let newCoord = [];    
             coordinates.forEach(coordSet => {
                 newCoord = newCoord.concat(coordSet[0]);
             });
             coordinates = newCoord;
         } else {
             coordinates = coordinates[0];
         }
         
         const init = coordinates[0];
         const bounds = coordinates.reduce(function (bounds, coord) {
             return bounds.extend(coord);
         }, new MapboxGL.LngLatBounds(init, init))
         
         return bounds;
    }

    render() {
        return (
        <div className='map-container'>
            <section className='map-area'>
                <Map
                    
                    style="mapbox://styles/rcscastillo/cjo93ejwe010e2spp07lyalev"
                    containerStyle={{
                        height: "100%",
                        width: "100%",        
                    }}
                    onMouseMove={(map, evt) => { 
                        }
                    }

                    onStyleLoad={this.onStyleLoad.bind(this)}
                >
                    <ZoomControl className='zoom-control' position={'top-left'}/>

                    {/* Congressional Districts */}
                    <Source 
                        id="congressional-districts"
                        tileJsonSource={{
                            "type": "vector", 
                            "url": "mapbox://rcscastillo.5r1x01zm"
                        }}
                    />
                    <Layer
                        type='line'
                        id='cd-line'
                        sourceId={'congressional-districts'}
                        sourceLayer={'cd-0ayx0b'}
                        before={'waterway-label'}
                        paint={{
                            'line-color': 'red',
                            'line-opacity': 0
                        }}
                        layout={{
                            'visibility': 'visible'
                        }}
                    ></Layer>
                    <Layer type='fill' id='cd-fill' sourceId={'congressional-districts'}
                           sourceLayer={'cd-0ayx0b'} before={'waterway-label'}
                           paint={{ 'fill-opacity': 0 }}
                    ></Layer>

                    {/* States */}
                    <Source id="states"
                        tileJsonSource={{
                            "type": "vector", 
                            "url": "mapbox://rcscastillo.25eloeq2"
                        }} />
                    <Layer
                        type='fill' id='states-fill' sourceId={'states'}
                        before={'waterway-label'} sourceLayer={'gz_2010_us_040_00_5m-81sosm'}
                        paint={{
                            'fill-color': 'green',
                            'fill-opacity': 0.1
                        }}
                    ></Layer>

                    {/* Hover */}
                    <Layer
                        type='fill' id='states-hover-layer' before={'cd-line'}
                        paint={{
                            'fill-color': '#FAFAFA',
                            'fill-opacity': 1
                        }}
                        >
                        {this.state.hoveredState && this.state.hoveredState.map(state => <Feature coordinates={state.geometry.coordinates}/>)}
                    </Layer>

                    <Layer
                        type='fill' id='cd-hover-layer' before={'cd-line'}
                        paint={{
                            'fill-color': '#FAFAFA',
                            'fill-opacity': 1
                        }}
                        >
                        {this.state.hoveredCD && this.state.hoveredCD.map(cd => <Feature coordinates={cd.geometry.coordinates}/>)}
                    </Layer>

                    { this.state.selectedCD &&  this.state.popupLngLat && 
                        <Popup coordinates={this.state.popupLngLat} className={'mb-mkr-popup'}>
                            <h1>Selected CD</h1>
                        </Popup>
                    }
                    { this.state.hoveredStateMarker &&
                        <Marker
                            coordinates={this.state.hoveredStateMarker} anchor="bottom"
                            className={'mb-mkr-hovered-state'}>
                            <div style={{backgroundColor: 'white', padding: 10}}> hoveredStateMarker</div>
                        </Marker>
                    }

                    { this.state.hoveredCDMarker &&
                        <Marker
                            coordinates={this.state.hoveredCDMarker} anchor="bottom"
                            className={'mb-mkr-hovered-state'}>
                            <div style={{backgroundColor: 'white', padding: 10}}> hoveredCDMarker</div>
                        </Marker>
                    }

                   
                </Map>
            </section>
            <section className='activity-area'>
            </section>
        </div>);
    }
}