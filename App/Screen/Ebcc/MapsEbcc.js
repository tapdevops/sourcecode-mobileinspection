import React from 'react';
import {Dimensions, StatusBar, StyleSheet, Text, TouchableOpacity, View} from 'react-native';

import MapView, {Marker, Polygon, ProviderPropType, PROVIDER_GOOGLE} from 'react-native-maps';
import Colors from '../../Constant/Colors'
import {NavigationActions, StackActions} from 'react-navigation';
import IconLoc from 'react-native-vector-icons/FontAwesome5';
import ModalLoading from '../../Component/ModalLoading'
import ModalAlert from '../../Component/ModalAlert';
import TaskServices from '../../Database/TaskServices';
import R from 'ramda';
import {AlertContent} from '../../Themes'
import {retrieveData} from '../../Database/Resources';
import * as geolib from 'geolib';

let polyMap = false;// = require('../../Data/MegaKuningan.json');
let LATITUDE = -2.1890660;
let LONGITUDE = 111.3609873;
const { width, height } = Dimensions.get('window');
const alfabet = ['A', 'B', 'C', 'D', 'E', 'F'];

class MapsEbcc extends React.Component {

    constructor(props) {
        super(props);

        let params = props.navigation.state.params;
        let statusScan = R.clone(params.statusScan)
        let reason = R.clone(params.reason)

        this.loadMap();
        this.state = {
            latitude: 0.0,
            longitude: 0.0,
            region: {
                latitude: LATITUDE,
                longitude: LONGITUDE,
                latitudeDelta: 0.0075,
                longitudeDelta: 0.00721
            },
            poligons: [],
            statusScan,
            reason,
            modalAlert:{
                showModal: false,
                title: "",
                message: "",
                icon: null
            },
            modalLoading:{
                showModal: false,
                title: "Sabar Ya..",
                message: "Sedang mencari lokasi kamu nih"
            },
            modalGps:{
                showModal: false,
                title: 'Gps tidak di temukan',
                message: 'Signal gps tidak di temukan, coba lagi!',
                icon: require('../../Images/ic-no-gps.png')
            }
        };
    }

    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        return {
            headerStyle: {
                backgroundColor: Colors.tintColorPrimary
            },
            title: 'Pilih Blok',
            headerTintColor: '#fff',
            headerTitleStyle: {
                flex: 1,
                fontSize: 18,
                fontWeight: '400'
            },

            headerRight: (
                <TouchableOpacity style={{ marginRight: 20 }} onPress={() => { params.searchLocation() }}>
                    <IconLoc style={{ marginLeft: 12 }} name={'location-arrow'} size={24} color={'white'} />
                </TouchableOpacity>
            )
        };
    }

    componentDidMount() {
        this.props.navigation.setParams({ searchLocation: this.searchLocation })
    }

    searchLocation = () => {
        if(this.state.longitude !== 0.0 || this.state.latitude !== 0.0){
            this.setState({modalLoading:{...this.state.modalLoading, showModal: true}});
            this.map.animateToRegion(this.state.region, 1);
            this.detectFakeGPS()
        }
        else {
            this.setState({
                modalGps:{
                    ...this.state.modalGps,
                    showModal: true
                }
            })
        }
    };

    /* DETECT FAKE GPS */
    detectFakeGPS() {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                if (position.mocked) {
                    this.validateType()
                } else {
                    this.getLocation();
                }
            },
            (error) => {
                this.setState({modalLoading:{...this.state.modalLoading, showModal: false}});
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }, //enableHighAccuracy : aktif highaccuration , timeout : max time to getCurrentLocation, maximumAge : using last cache if not get real position
        );
    }

    validateType(type) {
        retrieveData('typeApp').then(data => {
            if (data != null) {
                if (data == 'PROD') {
                    this.setState(AlertContent.mock_location)
                } else {
                    this.getLocation();
                }
            } else {
                this.getLocation();
            }
        })
    }

    totalPolygons() {
        if (!polyMap) {
            this.setState(AlertContent.no_data_map);
            return 0;
        }
        return polyMap.data.polygons.length;
    }
    loadMap() {
        let user = TaskServices.getAllData('TR_LOGIN')[0];
        if (user.CURR_WERKS) {
            let est = TaskServices.findBy('TM_EST', 'WERKS', user.CURR_WERKS);
            if (est && est.length > 0 && est[0].LONGITUDE != 0 && est[0].LATITUDE != 0) {
                LATITUDE = est[0].LATITUDE;
                LONGITUDE = est[0].LONGITUDE;
            }
            let polygons = TaskServices.findBy('TR_POLYGON', 'WERKS', user.CURR_WERKS);
            polygons = this.convertGeoJson(polygons);
            if (polygons && polygons.length > 0) {
                let mapData = {
                    "data": {
                        "polygons": polygons
                    }
                }
                polyMap = mapData;
            }
            else {
                //belum download map
                this.setState(AlertContent.no_data_map);
            }
        }
        else {
            //belum pilih lokasi
            this.setState(AlertContent.no_location);
        }
    }

    convertGeoJson(raw) {
        let arrPoli = [];
        for (let x in raw) {
            let tempItem = raw[x];
            let tempArrCoords = [];
            for (let y in tempItem.coords) {
                tempArrCoords.push(tempItem.coords[y]);
            }
            tempItem = {
                ...tempItem,
                coords: tempArrCoords
            };
            arrPoli.push(tempItem);
        }
        return arrPoli;
    }

    getPolygons() {
        if (!polyMap) {
            this.setState(AlertContent.no_data_map);
            return;
        }
        let data = polyMap.data.polygons;
        let poligons = [];
        for (var i = 0; i < data.length; i++) {
            let coords = data[i];
            if(
                geolib.isPointInPolygon({ latitude: this.state.latitude, longitude: this.state.longitude+0.006 }, coords.coords) ||
                geolib.isPointInPolygon({ latitude: this.state.latitude, longitude: this.state.longitude-0.006 }, coords.coords) ||
                geolib.isPointInPolygon({ latitude: this.state.latitude+0.0025, longitude: this.state.longitude }, coords.coords) ||
                geolib.isPointInPolygon({ latitude: this.state.latitude-0.0025, longitude: this.state.longitude }, coords.coords) ||
                geolib.isPointInPolygon({ latitude: this.state.latitude-0.0025, longitude: this.state.longitude-0.006 }, coords.coords) ||
                geolib.isPointInPolygon({ latitude: this.state.latitude-0.0025, longitude: this.state.longitude+0.006 }, coords.coords) ||
                geolib.isPointInPolygon({ latitude: this.state.latitude+0.0025, longitude: this.state.longitude-0.006 }, coords.coords) ||
                geolib.isPointInPolygon({ latitude: this.state.latitude+0.0025, longitude: this.state.longitude+0.006 }, coords.coords) ||
                geolib.isPointInPolygon({ latitude: this.state.latitude, longitude: this.state.longitude }, coords.coords)
            ){
                poligons.push(coords);
            }
            // poligons.push(coords);
        }
        return poligons;
    }

    getLocation() {
        if (this.state.latitude && this.state.longitude) {
            let poligons = this.getPolygons();
            if(poligons.length > 0){
                this.setState({modalLoading: {...this.state.modalLoading, showModal: false}},()=>{
                    this.setState({
                        poligons
                    });
                });
            }
            else {
                this.setState({
                    modalLoading: {...this.state.modalLoading, showModal: false},
                    modalAlert: {...AlertContent.no_polygon}
                })
            }
        }
    }

    centerCoordinate(coordinates) {
        let x = coordinates.map(c => c.latitude)
        let y = coordinates.map(c => c.longitude)

        let minX = Math.min.apply(null, x)
        let maxX = Math.max.apply(null, x)

        let minY = Math.min.apply(null, y)
        let maxY = Math.max.apply(null, y)

        return {
            latitude: (minX + maxX) / 2,
            longitude: (minY + maxY) / 2
        }
    }

    navigateScreen(screenName, werkAfdBlockCode) {
        if (this.refRoleAuth(werkAfdBlockCode)) {
            const navigation = this.props.navigation;
            const resetAction = StackActions.reset({
                index: 0,
                actions: [NavigationActions.navigate({
                    routeName: screenName, params: {
                        werkAfdBlockCode: werkAfdBlockCode,
                        statusScan: this.state.statusScan,
                        reason: this.state.reason,
                        latitude: this.state.latitude,
                        longitude: this.state.longitude
                    }
                })]
            });
            navigation.dispatch(resetAction);
        }
    }

    refRoleAuth(BA_CODE) {
        let loginData = TaskServices.getAllData('TR_LOGIN')[0];
        let userRefCode = loginData.REFFERENCE_ROLE;
        let locationCode = loginData.LOCATION_CODE.split(',');

        let auth = false;
        switch (userRefCode) {
            case 'AFD_CODE':
                locationCode.map((data) => {
                    if (data === BA_CODE.slice(0, BA_CODE.length - 3)) {
                        auth = true;
                    }
                });
                return auth;
            case 'BA_CODE':
                console.log(BA_CODE, BA_CODE.slice(0, 4));
                locationCode.map((data) => {
                    if (data.includes(BA_CODE.slice(0, 4))) {
                        auth = true;
                    }
                });
                return auth;
            case 'COMP_CODE':
                locationCode.map((data) => {
                    if (data.slice(0, 2) === BA_CODE.slice(0, 2)) {
                        auth = true;
                    }
                });
                return auth;
            case 'REGION_CODE':
                let trEst = TaskServices.findBy2('TM_EST', 'WERKS', BA_CODE.slice(0, 4));
                if (trEst !== undefined) {
                    locationCode.map((data) => {
                        if (data === trEst.REGION_CODE) {
                            auth = true;
                        }
                    })
                }
                return auth;
            case 'NATIONAL':
                return true;
            default:
                auth = false
        }
        return auth
    }

    render() {
        return (
            <View style={styles.container}>
                <StatusBar
                    hidden={false}
                    barStyle="light-content"
                    backgroundColor={Colors.tintColorPrimary}
                />

                <ModalLoading
                    visible={this.state.modalLoading.showModal}
                    title={this.state.modalLoading.title}
                    message={this.state.modalLoading.message} />

                <ModalAlert
                    icon={this.state.modalAlert.icon}
                    visible={this.state.modalAlert.showModal}
                    onPressCancel={() => this.setState({ modalAlert:{...this.state.modalAlert, showModal: false} })}
                    title={this.state.modalAlert.title}
                    message={this.state.modalAlert.message} />

                <ModalAlert
                    icon={this.state.modalGps.icon}
                    visible={this.state.modalGps.showModal}
                    onPressCancel={() => this.setState({ modalGps:{...this.state.modalGps, showModal: false} })}
                    title={this.state.modalGps.title}
                    message={this.state.modalGps.message} />

                <MapView
                    ref={map => this.map = map}
                    style={styles.map}
                    provider={PROVIDER_GOOGLE}
                    mapType={"satellite"}
                    showsUserLocation={true}
                    initialRegion={this.state.region}
                    zoomEnabled={true}
                    scrollEnabled={true}
                    onUserLocationChange={event => {
                        let lat = event.nativeEvent.coordinate.latitude;
                        let lon = event.nativeEvent.coordinate.longitude;
                        this.setState({
                            latitude: lat, longitude: lon, region: {
                                latitude: lat,
                                longitude: lon,
                                latitudeDelta: 0.0075,
                                longitudeDelta: 0.00721
                            }
                        });
                    }}
                >
                    {this.state.poligons.length > 0 && this.state.poligons.map((poly, index) => (
                        <View key={index}>
                            <Polygon
                                coordinates={poly.coords}
                                fillColor="rgba(0, 200, 0, 0.5)"
                                strokeColor="rgba(255,255,255,1)"
                                strokeWidth={2}
                                tappable={true}
                                onPress={() => this.navigateScreen('ManualInputTPH', poly.werks_afd_block_code)}
                            />
                            <Marker
                                ref={ref => poly.marker = ref}
                                coordinate={this.centerCoordinate(poly.coords)}>
                                <View style={{ flexDirection: 'column', alignSelf: 'flex-start' }}>
                                    <View style={styles.marker}>
                                        <Text style={{ color: 'rgba(255,255,255,1)', fontSize: 25, fontWeight:'900'}}>{poly.blokname}</Text>
                                    </View>
                                </View>
                            </Marker>
                        </View>
                    ))}

                    <Marker
                        coordinate={{
                            latitude: this.state.latitude,
                            longitude: this.state.longitude,
                        }}
                        centerOffset={{ x: -42, y: -60 }}
                        anchor={{ x: 0.84, y: 1 }}
                    >
                    </Marker>

                </MapView>
                <View style={{
                    width: "100%",
                    height: "100%",
                    position: "absolute",
                    alignItems: "flex-end",
                    justifyContent: "flex-end"
                }}>
                    <View style={{
                        padding: 10,
                        margin: 5,
                        borderRadius: 5,
                        backgroundColor: "rgba(0,0,0,0.3)"
                    }}>
                        <View style={{
                            flexDirection: "row",
                            alignItems:"center"
                        }}>
                            <Text style={{color:"white"}}>
                                Latitude : {this.state.latitude}
                            </Text>
                        </View>
                        <View>
                            <Text style={{color:"white"}}>
                                Longitude : {this.state.longitude}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}

MapsEbcc.propTypes = {
    provider: ProviderPropType,
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    bubble: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.7)',
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 20,
    },
    marker: {
        flex: 0,
        flexDirection: 'row',
        alignSelf: 'flex-start',
        // backgroundColor: '#FF5A5F',
        padding: 5,
        // borderRadius: 3,
        // borderColor: '#D23F44',
        // borderWidth: 0.5
    },
    latlng: {
        width: 200,
        alignItems: 'stretch',
    },
    button: {
        width: 80,
        paddingHorizontal: 12,
        alignItems: 'center',
        marginHorizontal: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        marginVertical: 20,
        backgroundColor: 'transparent',
    },
});

export default MapsEbcc;
