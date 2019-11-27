import React from 'react';
import {StatusBar, StyleSheet, Text, Image, View, Modal, TouchableOpacity} from 'react-native';

import MapView, {Marker, Polygon, PROVIDER_GOOGLE, ProviderPropType} from 'react-native-maps';
import Colors from '../../Constant/Colors'
import {NavigationActions, StackActions} from 'react-navigation';
import ModalLoading from '../../Component/ModalLoading'
import ModalAlert from '../../Component/ModalAlert';
import TaskServices from '../../Database/TaskServices';
import {retrieveData} from '../../Database/Resources';
import {AlertContent} from '../../Themes';
import { HeaderWithButton } from "../../Component/Header/HeaderWithButton";
import Fonts from "../../Constant/Fonts";

let polyMap = null;
let LATITUDE = -2.1890660;
let LONGITUDE = 111.3609873;

export default class Restan extends React.Component {

    constructor(props) {
        super(props);

        let user = TaskServices.getAllData('TR_LOGIN')[0];

        this.state = {
            userData: user,
            latitude: 0.0,
            longitude: 0.0,
            region: {
                latitude: LATITUDE,
                longitude: LONGITUDE,
                latitudeDelta: 0.0075,
                longitudeDelta: 0.00721
            },
            poligons: [],
            coordinateRestan: [],
            inspectionType: props.navigation.getParam('inspectionType', 'normal'),
            modalRestainDetail: false,
            restanData: {
                block_name: "",
                TPH: "",
                hari: "",
                janjang: "",
                brondolan: "",
                taksasi: ""
            },
            modalAlert: {
                showModal: false,
                title: "",
                message: "",
                icon: null
            },
            modalLoading: {
                showModal: false,
                title: "Sabar Ya..",
                message: "Sedang mencari lokasi kamu nih"
            },
            modalGps: {
                showModal: false,
                title: 'Gps tidak di temukan',
                message: 'Signal gps tidak di temukan, coba lagi!',
                icon: require('../../Images/ic-no-gps.png')
            }
        };
    }

    static navigationOptions = () => ({
        header: null
    });

    componentDidMount() {
        this.loadMap();
    }

    /* DETECT FAKE GPS */
    detectFakeGPS() {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                if (position.mocked) {
                    this.validateType()
                } else {
                    this.getTitikRestan();
                    this.getLocation();
                }
            },
            (error) => {
                this.setState({ modalLoading: { ...this.state.modalLoading, showModal: false } });
            },
            { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }, //enableHighAccuracy : aktif highaccuration , timeout : max time to getCurrentLocation, maximumAge : using last cache if not get real position
        );
    }

    onMapReady(){
        this.setState({
            modalLoading:{
                ...this.state.modalLoading,
                showModal: false
            }
        })
    }

    validateType() {
        retrieveData('typeApp').then(data => {
            if (data !== null && data === 'PROD') {
                this.setState({
                    modalLoading: { ...this.state.modalLoading, showModal: false },
                    modalAlert: { ...AlertContent.mock_location }
                })
            } else {
                this.getTitikRestan();
                this.getLocation();
            }
        })
    }

    searchLocation(){
        if (this.state.longitude !== 0.0 || this.state.latitude !== 0.0) {
            this.setState({ modalLoading: { ...this.state.modalLoading, showModal: true } });
            this.map.animateToRegion(this.state.region, 1);
            this.detectFakeGPS()
        }
        else {
            this.setState({
                modalGps: {
                    ...this.state.modalGps,
                    showModal: true
                }
            })
        }
    };

    loadMap() {
        let user = TaskServices.getAllData('TR_LOGIN')[0];
        if (user.USER_ROLE === "ASISTEN_LAPANGAN") {
            // let queryString = `afd_code='O' OR afd_code='P'`;
            let queryString = ``;
            let userLocationCode = user.LOCATION_CODE.split(",");
            for(let afdCounter = 0; afdCounter < userLocationCode.length; afdCounter++){
                if(afdCounter === 0){
                    queryString = queryString + `afd_code='${userLocationCode[afdCounter].charAt(userLocationCode[afdCounter].length-1)}'`;
                }
                else {
                    queryString = queryString + `OR afd_code='${userLocationCode[afdCounter].charAt(userLocationCode[afdCounter].length-1)}'`;
                }
            }
            let polygons = TaskServices.query('TR_POLYGON', queryString);
            polygons = this.convertGeoJson(polygons);
            if (polygons && polygons.length > 0) {
                let mapData = {
                    "data": {
                        "polygons": polygons
                    }
                };
                polyMap = mapData;
            }
            else {
                //belum download map
                this.setState({
                    modalLoading: { ...this.state.modalLoading, showModal: false },
                    modalAlert: {
                        title: 'Tidak ada data',
                        message: "Kamu belum download data map",
                        icon: require('../../Images/ic-blm-input-lokasi.png')
                    }
                });
            }
        }
        else {
            //belum pilih lokasi
            this.setState({
                fetchLocation: false
            });
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
            tempItem = { ...tempItem, coords: tempArrCoords };
            arrPoli.push(tempItem);
        }
        return arrPoli;
    }

    getPolygons() {
        if (!polyMap) {
            this.setState({
                modalLoading: { ...this.state.modalLoading, showModal: false },
                modalAlert: { ...AlertContent.no_data_map }
            });
            return null;
        }
        let data = polyMap.data.polygons;
        return data;
    }

    getLocation() {
        if (this.state.latitude && this.state.longitude) {
            let poligons = this.getPolygons();
            if (poligons !== null) {
                this.setState({
                    modalLoading: { ...this.state.modalLoading, showModal: false },
                    poligons
                });
            }
            else {
                this.setState({
                    modalLoading: { ...this.state.modalLoading, showModal: false },
                    modalAlert: { ...AlertContent.no_polygon }
                })
            }
        }
    }

    getTitikRestan(){
        let titikRestan = TaskServices.getAllData('TR_TITIK_RESTAN');
        let tempCoordinateRestan = [];
        let tempHighlightBlock = [];
        for (let counter = 0; counter < titikRestan.length; counter++){
            if(!tempHighlightBlock.includes(titikRestan[counter].BLOCK_NAME)){
                tempHighlightBlock.push(titikRestan[counter].BLOCK_NAME);
            }
            let tempModelRestan = {
                ...titikRestan[counter],
                LATITUDE:parseFloat(titikRestan[counter].LATITUDE),
                LONGITUDE:parseFloat(titikRestan[counter].LONGITUDE)
            };
            tempCoordinateRestan.push(tempModelRestan);
        }

        this.setState({
            highlightBlock: tempHighlightBlock,
            coordinateRestan: tempCoordinateRestan
        })
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

    render() {
        return (
            <View
                style={{
                    flex: 1
                }}>
                <HeaderWithButton
                    title={"Titik Restan"}
                    iconLeft={require("../../Images/icon/ic_arrow_left.png")}
                    rightVectorIcon={true}
                    iconRight={"location-arrow"}
                    onPressLeft={()=>{this.props.navigation.pop()}}
                    onPressRight={()=>{this.searchLocation()}}
                />

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
                    onPressCancel={() => this.setState({ modalAlert: { ...this.state.modalAlert, showModal: false } })}
                    title={this.state.modalAlert.title}
                    message={this.state.modalAlert.message} />

                <ModalAlert
                    icon={this.state.modalGps.icon}
                    visible={this.state.modalGps.showModal}
                    onPressCancel={() => this.setState({ modalGps: { ...this.state.modalGps, showModal: false } })}
                    title={this.state.modalGps.title}
                    message={this.state.modalGps.message} />

                <MapView
                    ref={map => this.map = map}
                    style={{
                        flex: 1
                    }}
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
                            latitude: lat,
                            longitude: lon,
                            region: {
                                latitude: lat,
                                longitude: lon,
                                latitudeDelta: 0.0075,
                                longitudeDelta: 0.00721
                            }
                        });
                    }}
                    onMapReady={() => {this.onMapReady()}}
                >
                    {this.state.poligons.length > 0 && this.state.poligons.map((poly, index) => (
                        <View key={index}>
                            <Polygon
                                coordinates={poly.coords}
                                fillColor={this.state.highlightBlock.includes(poly.blokname) ? "rgba(0, 200, 0, 0.5)" : "rgba(0, 0, 0, 0)"}
                                strokeColor="rgba(255,255,255,1)"
                                strokeWidth={2}
                            />
                            <Marker
                                ref={ref => poly.marker = ref}
                                coordinate={this.centerCoordinate(poly.coords)}>
                                <Text style={{ color: 'rgba(255,255,255,1)', fontSize: 11, fontWeight: '900' }}>{poly.blokname}</Text>
                            </Marker>
                        </View>
                    ))}

                    {
                        this.state.coordinateRestan.map((coordinate)=>{
                            return(
                                <Marker
                                    onPress={()=>{
                                        // console.log(coordinate.OPH);
                                        this.setState({
                                            modalRestainDetail: true,
                                            restanData:{
                                                block_name: coordinate.BLOCK_NAME,
                                                TPH: coordinate.OPH,
                                                hari: coordinate.TPH_RESTANT_DAY,
                                                janjang: coordinate.JML_JANJANG,
                                                brondolan: coordinate.JML_BRONDOLAN,
                                                taksasi: coordinate.KG_TAKSASI
                                            }
                                        })
                                    }}
                                    coordinate={{
                                        latitude: coordinate.LATITUDE,
                                        longitude: coordinate.LONGITUDE
                                    }}>
                                    <Image
                                        style={{width: 20, height: 20}}
                                        source={require('../../Images/icon/ic_restan.png')}
                                    />
                                </Marker>
                            )
                        })
                    }
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
                            alignItems: "center"
                        }}>
                            <Text style={{ color: "white" }}>
                                Latitude : {this.state.latitude}
                            </Text>
                        </View>
                        <View>
                            <Text style={{ color: "white" }}>
                                Longitude : {this.state.longitude}
                            </Text>
                        </View>
                    </View>
                </View>
                {this.showRestanDetail()}
            </View>
        );
    }

    showRestanDetail() {
        return (
            <Modal
                visible={this.state.modalRestainDetail}
                transparent={true}
            >
                <TouchableOpacity
                    style={{
                        flex: 1,
                        alignItems:'center',
                        justifyContent: 'center',
                        backgroundColor: Colors.shade,
                        paddingLeft: 24,
                        paddingRight: 24,
                    }}
                    onPress={()=>{
                        this.setState({
                            modalRestainDetail: false,
                        })
                    }}
                >
                    <View style={{
                        width: "75%",
                        backgroundColor: Colors.background,
                        padding: 15,
                        borderRadius: 4
                    }}>
                        <View style={{
                            alignItems:"center",
                            justifyContent:"center",
                            paddingVertical: 5
                        }}>
                            <Text>{`${this.state.restanData.block_name}`}</Text>
                            <Text>{`TPH ${this.state.restanData.TPH}`}</Text>
                        </View>
                        <View style={{
                            paddingHorizontal: 10,
                            justifyContent:"space-between",
                            flexDirection: "row"
                        }}>
                            <View style={{
                                flex: 1,
                                marginRight: 10,
                                backgroundColor:'yellow',
                                borderRadius: 5,
                                alignItems:'center',
                                justifyContent:'center'
                            }}>
                                <Text>{this.state.restanData.hari}</Text>
                                <Text>Hari</Text>
                            </View>
                            <View
                                style={{
                                    flex: 2,
                                    justifyContent:'space-evenly'
                                }}
                            >
                                <Text>{`Janjang: ${this.state.restanData.janjang}`}</Text>
                                <Text>{`Brondolan(KG): ${this.state.restanData.brondolan}`}</Text>
                                <Text>{`Taksasi(KG): ${this.state.restanData.taksasi}`}</Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </Modal>
        );
    }
}

Restan.propTypes = {
    provider: ProviderPropType,
};

const styles = StyleSheet.create({
    container: {
        flex: 1
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
        padding: 5
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