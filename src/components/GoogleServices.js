import React from 'react';
import _ from 'lodash';
import GoogleMapReact from 'google-map-react';
import LocationMarker from './Markers/LocationMarker';
import PlacesMarker from './Markers/PlacesMarker';
import './style.css'
import { Layout, Menu, Breadcrumb, Icon, Input, List, Slider, message, Popover } from 'antd';
import Bounce from 'react-reveal/Bounce';
import gitHub from '../assets/github.png';
import linkedin from '../assets/linkedin.png';

import {
    FaEuroSign, 
    FaGlassMartiniAlt, 
    FaCoffee, 
    FaShoppingCart, 
    FaStethoscope, 
    FaUtensilSpoon, 
    FaTrain, 
    FaBus
} from "react-icons/fa";

const { Header, Content, Footer, Sider } = Layout;

class GoogleServices extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            collapsed: false,
            mapsLoaded: false,
            markerLoaded: false,
            map: {},
            mapsApi: {},
            center: {},
            markerCenter: {},
            zoom: null,
            autoCompleteService: {},
            geoCoderService: {},  
            placesService: {},
            userInput: '',
            dataSource: [],
            showSuggestions: false,
            placesInfo: [],
            showPlaces: false,
            searchRange: 5000,
            placeType: ''
        }
        this.getAutoCompleteData = _.debounce(this.getAutoCompleteData, 500);
    }

    static defaultProps = {
        defaultCenter: {
          lat: 37.980696,
          lng: 23.732035
        },
        defaultZoom: 9
    };    

    onCollapse = collapsed => {
        console.log(collapsed);
        this.setState({ collapsed });
    };

    getMapOptions = (maps) => {
        return {
            streetViewControl: true,
            scaleControl: true,
            fullscreenControl: true,
            styles: [{
                featureType: "poi.business",
                elementType: "labels",
                stylers: [{
                    visibility: "off"
                }]
            }],
            gestureHandling: "greedy",
            disableDoubleClickZoom: true,
            minZoom: 8,
            maxZoom: 18,
            mapTypeControl: true,
            mapTypeId: maps.MapTypeId.ROADMAP,
            mapTypeControlOptions: {
                style: maps.MapTypeControlStyle.HORIZONTAL_BAR,
                position: maps.ControlPosition.TOP_LEFT,
                mapTypeIds: [
                    maps.MapTypeId.ROADMAP,
                    maps.MapTypeId.SATELLITE,
                    maps.MapTypeId.HYBRID
                ]
            },
            zoomControl: true,
            clickableIcons: false
        }
    }

    componentDidMount() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(position => {
                this.setState({
                    center: {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    },
                    markerCenter: {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    }
                })
                console.log(position)
            })
        } else {
            console.log("error");
        }
    }

    apiHasLoaded = ((map, mapsApi) => {
        this.setState({
          mapsLoaded: true,
          map,
          mapsApi,
          center: new mapsApi.LatLng(this.state.center.lat, this.state.center.lng),
          autoCompleteService: new mapsApi.places.AutocompleteService(),
          geoCoderService: new mapsApi.Geocoder(),
          placesService: new mapsApi.places.PlacesService(map),
          zoom: 12
        },
        () => setTimeout(
            function() {
                this.setState({
                    markerLoaded: true
                });
            }
            .bind(this),
            1500)        
        )      
    });      

    getAutoCompleteData = (searchQuery) => {
        this.state.autoCompleteService.getQueryPredictions(searchQuery, ((response) => {
            // The name of each GoogleMaps suggestion object is in the "description" field
            if (response) {
                console.log(response)
                const dataSource = response.map((resp) => resp.description);
                this.setState({ 
                    dataSource: dataSource,
                    showSuggestions: true
                }, ()=>console.log(dataSource));
            }
        }));
    }

    handleChange = ((e) => {
        this.setState({
            userInput: e.target.value
        })
        // Search only if there is a string
        if (e.target.value.length > 2) {
            const searchQuery = {
                input: e.target.value,
                location: this.state.center,
                radius: 50000
            };
            this.getAutoCompleteData(searchQuery);
        } else {
            this.setState({
                showSuggestions: false
            })
        }
    });

    handleSelect = ((e) => {
        this.setState({
            userInput: e.currentTarget.innerText,
            zoom: 9,
            markerLoaded: false
        })
        this.state.geoCoderService.geocode({ address: e.currentTarget.innerText }, ((response) => {
            const { location } = response[0].geometry;
            const newLat = location.lat();
            const newLng = location.lng();
            console.log(response);
            this.setState({
                showPlaces: false,
                markerCenter: {
                    lat: newLat,
                    lng: newLng     
                },
                showSuggestions: false
            },
            () => setTimeout(
                function() {
                    this.setState({
                        zoom: 12,
                        markerLoaded: true
                    });
                }
                .bind(this),
                750)        
            )     
        }))
        console.log(e.currentTarget.innerText)
    });

    placesSearch = (placeType, searchRange) => {

        this.setState({
            showPlaces: false
        });


        let placesResults = [];

        const placesRequest = {
            location: this.state.markerCenter,
            type: [placeType], // List of types: https://developers.google.com/places/supported_types
            radius: searchRange
        };

        setTimeout(
            this.state.placesService.nearbySearch(placesRequest, ((response) => {
                if (response.length > 0) {
                    console.log(response)
                    for (let i = 0; i < response.length; i++) {
                        const name = response[i].name;
                        const types = response[i].types;
                        const address = response[i].vicinity;
                        const lat = response[i].geometry.location.lat();
                        const lng = response[i].geometry.location.lng();
                        placesResults.push({
                            name,
                            types,
                            address,
                            lat,
                            lng
                        })
                        setTimeout(
                            this.setState({
                                placesInfo: placesResults,
                                showPlaces: true
                            }, () => setTimeout(
                                function() {
                                    this.setState({
                                        zoom: 12
                                    });
                                }
                                .bind(this),
                                4000)      
                            ), 3000
                        )
                    }
                } else {
                    this.setState({
                        placesInfo: []
                    },
                    () => setTimeout(
                        function() {
                            message.warning('Please search using a different Radius', 5)
                        }
                        .bind(this),
                        3000)      
                    )
                }
            })), 2000
        )
    }

    searchRange = (value) => {
        console.log(value)
        this.setState({
            searchRange: value,
            zoom: 9
        },
        () => this.placesSearch(this.state.placeType, this.state.searchRange)
        )
    }

    render() {
        return (
            <Layout style={{ minHeight: '100vh' }}>
                <Sider 
                    style={{background: '#D2D2D2'}}
                    id='sider'
                >
                    <div className="logo" />
                    <Menu theme="dark" defaultSelectedKeys={['0']} mode="inline" style={{background: '#468AF5'}}>
                        <Menu.ItemGroup key="0" title="Nearby Places">
                            <Menu.Item key="1">
                                <FaEuroSign style={{marginBottom: '-1.5'}}/>
                                <span 
                                onClick={() => this.setState({placeType: 'bank'},()=> this.placesSearch(this.state.placeType, this.state.searchRange))}
                                > Banks</span>
                            </Menu.Item>
                            <Menu.Item key="2">
                                <FaGlassMartiniAlt style={{marginBottom: '-1.5'}}/>
                                <span 
                                onClick={() => this.setState({placeType: 'bar'},()=> this.placesSearch(this.state.placeType, this.state.searchRange))}
                                > Bars</span>
                            </Menu.Item>
                            <Menu.Item key="3">
                                <FaBus style={{marginBottom: '-1.5'}}/>
                                <span 
                                onClick={() => this.setState({placeType: 'transit_station'},()=> this.placesSearch(this.state.placeType, this.state.searchRange))}
                                > Bus Stops</span>
                            </Menu.Item>
                            <Menu.Item key="4">
                                <FaCoffee style={{marginBottom: '-1.5'}}/>
                                <span 
                                onClick={() => this.setState({placeType: 'cafe'},()=> this.placesSearch(this.state.placeType, this.state.searchRange))}
                                > Café</span>
                            </Menu.Item>
                            <Menu.Item key="5">
                                <FaStethoscope style={{marginBottom: '-1.5'}}/>
                                <span 
                                onClick={() => this.setState({placeType: 'hospital'},()=> this.placesSearch(this.state.placeType, this.state.searchRange))}
                                > Health Centers</span>
                            </Menu.Item>
                            <Menu.Item key="6">
                                <FaTrain style={{marginBottom: '-1.5'}}/>
                                <span 
                                onClick={() => this.setState({placeType: 'subway_station'},()=> this.placesSearch(this.state.placeType, this.state.searchRange))}
                                > Subway Stops</span>
                            </Menu.Item>
                            <Menu.Item key="7">
                                <FaUtensilSpoon style={{marginBottom: '-1.5'}}/>
                                <span 
                                onClick={() => this.setState({placeType: 'restaurant'},()=> this.placesSearch(this.state.placeType, this.state.searchRange))}
                                > Restaurants</span>
                            </Menu.Item>
                            <Menu.Item key="8">
                                <FaShoppingCart style={{marginBottom: '-1.5'}}/>
                                <span 
                                onClick={() => this.setState({placeType: 'supermarket'},()=> this.placesSearch(this.state.placeType, this.state.searchRange))}
                                > Supermarkets</span>
                            </Menu.Item>
                        </Menu.ItemGroup>
                    </Menu>
                        <br></br>
                        <h4 
                            className='ant-slider-mark-text-active'
                            style={{textAlign: 'center'}}
                            >Nearby Places Search Radius
                        </h4>
                        <Slider 
                            onChange={this.searchRange}
                            step={5000} min={5000} max={20000} 
                            marks={{5000:'5km', 10000:'10km', 15000:'15km', 20000:'20km'}}>
                        </Slider>
                    </Sider>
                <Layout>
                    <Header id='header' style={{ background: '#F0F2F5', padding: 0 }} />
                    <Content style={{ margin: '0 16px' }}>
                        <Breadcrumb style={{ margin: '16px 0'}}>
                            <Breadcrumb.Item>
                            <Input
                                style={{ width: "100%" }}
                                onChange={this.handleChange}
                                placeholder="Search for..."
                                allowClear={true}
                                value={this.state.userInput}
                                prefix={<Icon type="search"/>}
                                suffix={<Icon type="audio"/>}
                            />
                            {this.state.showSuggestions &&
                            <List
                                size="small"
                                bordered
                                dataSource={this.state.dataSource}
                                renderItem={item => 
                                <List.Item>
                                    <a style={{width:'100%'}} onClick={this.handleSelect}>{item}</a>
                                </List.Item>}
                            />
                            }
                            </Breadcrumb.Item>
                        </Breadcrumb>
                        <div style={{padding: 24, background: '#D2D2D2', height: '80%', borderRadius: 5}}>
                            <GoogleMapReact
                                options={this.getMapOptions}
                                bootstrapURLKeys={{ 
                                    key: process.env.REACT_APP_GOOGLE_API,
                                    libraries: ['places', 'directions', 'geometry', 'drawing'],
                                    language: "en"
                                }}
                                defaultCenter={this.props.defaultCenter}
                                center={{lat: this.state.markerCenter.lat, lng: this.state.markerCenter.lng}}
                                defaultZoom={this.props.defaultZoom}
                                zoom={this.state.zoom}
                                yesIWantToUseGoogleMapApiInternals={true}
                                onGoogleApiLoaded={({ map, maps }) => this.apiHasLoaded(map, maps)}
                            >
                            {this.state.markerLoaded &&
                            <LocationMarker 
                                lat = {this.state.markerCenter.lat}
                                lng = {this.state.markerCenter.lng}
                                zoom = {this.state.zoom}
                            />}
                            {this.state.showPlaces && this.state.placesInfo.map((placeInfo, index) =>
                            <PlacesMarker 
                                key={index} 
                                lat={placeInfo.lat} 
                                lng={placeInfo.lng} 
                                title={placeInfo.name} 
                                content={placeInfo.address}
                            />)}
                            </GoogleMapReact>
                        </div>
                    </Content>
                    <Footer style={{ textAlign: 'center' }}>
                        <Bounce left cascade delay={3000}>
                            <p>Created by Giannis Alexiou</p>
                        </Bounce>
                        <Bounce right cascade delay={6000}>
                            <p>Track me down on</p>
                            <a href='https://github.com/y1ann1s85' target='blank'><img src={gitHub} style={{height: '35px'}}/> </a>
                            <a href='https://www.linkedin.com/in/yiannisalexiou/' target='blank'><img src={linkedin} style={{height: '37px'}}/></a>
                        </Bounce>
                    </Footer>
                    <Footer id='footMenu' style={{ background: '#D2D2D2', padding: 0 }}>
                        <p 
                            style={{background: '#468AF5', textAlign: 'center', color: '#BCD5FB', paddingBottom: '0px', marginBottom: '0px'}}
                            className='ant-menu-item-group-title'
                        >Nearby Places</p>
                    <Menu
                        theme="dark"
                        mode="horizontal"
                        defaultSelectedKeys={['0']}
                        style={{ background: '#468AF5', lineHeight: '64px' }}
                    >
                        <Menu.Item key="1">
                        <Popover placement="top" title='Banks'>
                            <FaEuroSign 
                            onClick={() => this.setState({placeType: 'bank'},()=> this.placesSearch(this.state.placeType, this.state.searchRange))}
                            style={{marginBottom: '-1.5'}}/>
                        </Popover>
                        </Menu.Item>
                        <Menu.Item key="2">
                        <Popover placement="top" title='Bars'>
                            <FaGlassMartiniAlt 
                            onClick={() => this.setState({placeType: 'bar'},()=> this.placesSearch(this.state.placeType, this.state.searchRange))}
                            style={{marginBottom: '-1.5'}}/>
                        </Popover>
                        </Menu.Item>
                        <Menu.Item key="3">
                        <Popover placement="top" title='Bus Stops'>
                            <FaBus 
                            onClick={() => this.setState({placeType: 'transit_station'},()=> this.placesSearch(this.state.placeType, this.state.searchRange))}
                            style={{marginBottom: '-1.5'}}/>
                        </Popover>
                        </Menu.Item>
                        <Menu.Item key="4">
                        <Popover placement="top" title='Café'>
                            <FaCoffee 
                            onClick={() => this.setState({placeType: 'cafe'},()=> this.placesSearch(this.state.placeType, this.state.searchRange))}
                            style={{marginBottom: '-1.5'}}/>
                        </Popover>
                        </Menu.Item>
                        <Menu.Item key="5">
                        <Popover placement="top" title='Health Centers'>
                            <FaStethoscope 
                            onClick={() => this.setState({placeType: 'hospital'},()=> this.placesSearch(this.state.placeType, this.state.searchRange))}
                            style={{marginBottom: '-1.5'}}/>
                        </Popover>
                        </Menu.Item>
                        <Menu.Item key="6">
                        <Popover placement="top" title='Subway Stops'>
                            <FaTrain 
                            onClick={() => this.setState({placeType: 'subway_station'},()=> this.placesSearch(this.state.placeType, this.state.searchRange))}
                            style={{marginBottom: '-1.5'}}/>
                        </Popover>
                        </Menu.Item>
                        <Menu.Item key="7">
                        <Popover placement="top" title='Restaurants'>
                            <FaUtensilSpoon 
                            onClick={() => this.setState({placeType: 'restaurant'},()=> this.placesSearch(this.state.placeType, this.state.searchRange))}
                            style={{marginBottom: '-1.5'}}/>
                        </Popover>
                        </Menu.Item>
                        <Menu.Item key="8">
                        <Popover placement="top" title='Supermarkets'>
                            <FaShoppingCart 
                            onClick={() => this.setState({placeType: 'supermarket'},()=> this.placesSearch(this.state.placeType, this.state.searchRange))}
                            style={{marginBottom: '-1.5'}}/>
                        </Popover>
                        </Menu.Item>
                    </Menu>
                    <div style={{background: '#D2D2D2'}}>
                    <br></br>
                        <h4 
                            className='ant-slider-mark-text-active'
                            style={{textAlign: 'center'}}
                            >Nearby Places Search Radius
                        </h4>
                        <Slider 
                            onChange={this.searchRange}
                            step={5000} min={5000} max={20000} 
                            marks={{5000:'5km', 10000:'10km', 15000:'15km', 20000:'20km'}}>
                        </Slider>
                    <br></br>
                    </div>
                    </Footer>
                </Layout>
            </Layout>
        );
    }
}

export default GoogleServices;
