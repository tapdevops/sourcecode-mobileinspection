import React, { Component } from 'react';
import { BackHandler, Dimensions, Image, Platform, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';
import Colors from '../../Constant/Colors';
import imgTakePhoto from '../../Images/icon/ic_take_photo.png';
import imgNextPhoto from '../../Images/icon/ic_next_photo.png';
import MapView from 'react-native-maps';
import { RNCamera as Camera } from 'react-native-camera';
import { getTodayDate } from '../../Lib/Utils'
import ImageResizer from 'react-native-image-resizer';
import { dirMaps, dirPhotoEbccJanjang, dirPhotoEbccSelfie } from '../../Lib/dirStorage'
import TaskService from '../../Database/TaskServices'
import R from 'ramda';
import Icon2 from 'react-native-vector-icons/Ionicons';
import { NavigationActions, StackActions } from 'react-navigation';

import ModalAlertConfirmation from '../../Component/ModalAlertConfirmation';
import ModalAlert from '../../Component/ModalAlert';
import HeaderDefault from '../../Component/Header/HeaderDefault';

var RNFS = require('react-native-fs');
const FILE_PREFIX = Platform.OS === "ios" ? "" : "file://";



class FotoJanjang extends Component {

  static navigationOptions = {
    header: null
  }

  constructor(props) {
    super(props);

    const params = props.navigation.getParam('params');
    
    let tphAfdWerksBlockCode = params.tphAfdWerksBlockCode
    let deliveryTicket = params.deliveryTicket
    let statusScan = params.statusScan
    let reason = params.reason

    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      hasPhoto: false,
      path: null,
      pathImg: null,
      dataModel: null,
      tphAfdWerksBlockCode,
      deliveryTicket,
      reason,
      pathCache: '',
      timestamp: getTodayDate('YYYYMMDDkkmmss'),
      ebccValCode: '',
      dataHeader: null,
      statusScan,
      latitude: 0.0,
      longitude: 0.0,
      track: true,
      title: 'Title',
      message: 'Message',
      showModal: false,
      showModal2: false,
      icon: ''
    };
  }

  componentDidMount() {
    this.setParamImage()
    this.getLocation()
    BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick)

    RNFS.copyFile(TaskService.getPath(), 'file:///storage/emulated/0/MobileInspection/data.realm');
    RNFS.mkdir(dirPhotoEbccJanjang);
    RNFS.mkdir(dirPhotoEbccSelfie);
    RNFS.mkdir(dirMaps);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  clearPhoto() {
    RNFS.unlink(`${FILE_PREFIX}${dirPhotoEbccJanjang}/${this.state.dataModel.IMAGE_NAME}`)
      .then(() => {
        console.log(`FILE ${this.state.dataModel.IMAGE_NAME} DELETED`);
      });
    this.setState({ path: '', pathView: '', hasPhoto: false });
  }

  navigateScreen(screenName) {
    const navigation = this.props.navigation;
    const resetAction = StackActions.reset({
      index: 0,
      actions: [NavigationActions.navigate({
        routeName: screenName
      })]
    });
    navigation.dispatch(resetAction);
  }

  handleBackButtonClick() {
    if (this.state.hasPhoto) {
      this.clearPhoto();
      return true
    }
    let statusScan = R.clone(this.props.navigation.state.params.statusScan)
    if (statusScan == 'AUTOMATIC') {
      this.navigateScreen('DeliveryTicketQrCode')
      return true
    } else {
      this.props.navigation.goBack();
      return true;
    }
  }

  backAndDeletePhoto() {
    let dataLogin = TaskService.getAllData('TR_LOGIN')[0]
    if (this.state.hasPhoto) {
      this.deleteFoto()
    }
    const navigation = this.props.navigation;
    let routeName = ''
    if (dataLogin.USER_ROLE == 'FFB_GRADING_MILL') {
      routeName = 'MainMenuMil'
    } else {
      routeName = 'MainMenu';
    }
    this.setState({ showModal: false })
    BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);

    Promise.all([
      navigation.dispatch(
        StackActions.reset({
          index: 0,
          actions: [NavigationActions.navigate({ routeName: routeName })]
        })
      )]).then(() => navigation.navigate('EbccValidation')).then(() => navigation.navigate('DaftarEbcc'))
  }

  getLocation() {
    this.setParameter();
    navigator.geolocation.getCurrentPosition(
      (position) => {
        var lat = parseFloat(position.coords.latitude);
        var lon = parseFloat(position.coords.longitude);
        this.setState({ latitude: lat, longitude: lon });

      },
      (error) => {
        // this.setState({ error: error.message, fetchingLocation: false })
        let message = error && error.message ? error.message : 'Terjadi kesalahan ketika mencari lokasi anda !';
        if (error && error.message == "No location provider available.") {
          message = "Mohon nyalakan GPS anda terlebih dahulu.";
        }
        this.setState({
          showModal2: true, title: 'Lokasi GPS',
          message: 'Kamu belum bisa lanjut sebelum lokasi GPS kamu belum ditemukan, lanjut cari lokasi?',
          icon: require('../../Images/ic-no-gps.png')
        });
      }, // go here if error while fetch location
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 }, //enableHighAccuracy : aktif highaccuration , timeout : max time to getCurrentLocation, maximumAge : using last cache if not get real position
    );
  }

  deleteFoto() {
    RNFS.unlink(`${FILE_PREFIX}${dirPhotoEbccJanjang}/${this.state.dataModel.IMAGE_NAME}`)
      .then(() => {
        console.log(`FILE ${this.state.dataModel.IMAGE_NAME} DELETED`);
      });
    RNFS.unlink(this.state.path)
    this.setState({ path: null, hasPhoto: false });
  }

  setParamImage() {
    let dataLogin = TaskService.getAllData('TR_LOGIN')[0];

    //USER ROLE
    let user_role = this.userRole(dataLogin.USER_ROLE)

    var imgCode = `${user_role}P${dataLogin.USER_AUTH_CODE}${this.state.timestamp}`;
    var imageName = imgCode + '.jpg';
    var arrTph = this.state.tphAfdWerksBlockCode.split('-') //tph-afd-werks-blockcode
    var ebccValCode = `${user_role}${dataLogin.USER_AUTH_CODE}${this.state.timestamp}${arrTph[0]}${arrTph[3]}`

    var image = {
      TR_CODE: ebccValCode,
      IMAGE_CODE: imgCode,
      IMAGE_NAME: imageName,
      IMAGE_PATH_LOCAL: dirPhotoEbccJanjang + '/' + imageName,
      IMAGE_URL: '',
      STATUS_IMAGE: 'JANJANG',
      STATUS_SYNC: 'N',
      INSERT_USER: dataLogin.USER_AUTH_CODE,
      INSERT_TIME: getTodayDate('YYYY-MM-DD kk:mm:ss')
    }
    this.setState({ dataModel: image });
  }

  userRole(user) {
    if (user == 'FFB_GRADING_MILL') {
      return 'M'
    } else {
      return 'V'
    }
  }

  setParameter() {
    let dataLogin = TaskService.getAllData('TR_LOGIN')[0];
    var arrTph = this.state.tphAfdWerksBlockCode.split('-') //tph-afd-werks-blockcode

    //USER ROLE
    let user_role = this.userRole(dataLogin.USER_ROLE)

    var ebccValCode = `${user_role}${dataLogin.USER_AUTH_CODE}${this.state.timestamp}${arrTph[0]}${arrTph[3]}`

    console.log('EBCC VAL CODE : ', ebccValCode);
    var alasan = '';
    if (this.state.reason !== '') {
      alasan = this.state.reason == 'RUSAK' ? '1' : '2'
    }
    var header = {
      EBCC_VALIDATION_CODE: ebccValCode,
      WERKS: arrTph[2],
      AFD_CODE: arrTph[1],
      BLOCK_CODE: arrTph[3],
      NO_TPH: arrTph[0],
      STATUS_TPH_SCAN: this.state.statusScan, //manual dan automatics
      ALASAN_MANUAL: alasan,//1 rusak, 2 hilang
      LAT_TPH: this.state.latitude.toString(),
      LON_TPH: this.state.longitude.toString(),
      DELIVERY_CODE: this.state.deliveryTicket,
      STATUS_DELIVERY_CODE: '',
      TOTAL_JANJANG: '0',
      STATUS_SYNC: 'N',
      SYNC_TIME: '',
      INSERT_USER: dataLogin.USER_AUTH_CODE,
      INSERT_TIME: getTodayDate('YYYY-MM-DD kk:mm:ss')
    }
    this.setState({ ebccValCode, dataHeader: header });

  }

  takePicture = async () => {
    try {
      if (this.state.hasPhoto) {
        this.insertDB();
      } else {
        const takeCameraOptions = {
          width: 640,
          quality: 0.5,
          base64: true,
          fixOrientation: true,
          skipProcessing: false,
        };

        const data = await this.camera.takePictureAsync(takeCameraOptions);
        var imgPath = `${dirPhotoEbccJanjang}/${this.state.dataModel.IMAGE_NAME}`;

        this.setState(
          {
            pathView: data.uri,
            path: imgPath,
            pathImg: dirPhotoEbccJanjang,
            hasPhoto: true
          }, () => {
            RNFS.copyFile(data.uri, imgPath);
          });
      }

    } catch (err) {
      console.log('err: ', err);
    }
  };

  resize(data) {
    ImageResizer.createResizedImage(data, 640, 480, 'JPEG', 80, 0, dirPhotoEbccJanjang).then((response) => {
      console.log('Response Path : ', response)
      RNFS.unlink(this.state.path).then((unlink) => {
        RNFS.moveFile(response.path, this.state.path);
      })
      RNFS.rena
    }).catch((err) => {
      console.log(err)
    });
  }

  renderCamera() {
    return (
      <Camera
        ref={(cam) => {
          this.camera = cam;
        }}
        style={styles.preview}
        flashMode={Camera.Constants.FlashMode.auto}
        permissionDialogTitle={'Permission to use camera'}
        permissionDialogMessage={'We need your permission to use your camera phone'}
      >
      </Camera>
    );
  }

  async insertDB() {
    console.log(this.state.dataHeader.LAT_TPH)
    console.log(this.state.dataHeader.LON_TPH)

    if (this.state.dataHeader !== null && this.state.dataHeader.LAT_TPH != 0 && this.state.dataHeader.LON_TPH != 0) {
      RNFS.unlink(this.state.pathCache);
      let isImageContain = await RNFS.exists(this.state.path);
      console.log('isImageContain : ', isImageContain)
      if (isImageContain) {

        this.resize(this.state.path);

        this.props.navigation.navigate('KriteriaBuah',
          {
            fotoJanjang: this.state.dataModel,
            tphAfdWerksBlockCode: this.state.tphAfdWerksBlockCode,
            ebccValCode: this.state.ebccValCode,
            dataHeader: this.state.dataHeader
          });
      } else {
        this.setState({
          showModal: true, title: 'GAGAL',
          message: 'Kamu gagal untuk menyimpan gambar, coba ulangin lagi',
          icon: require('../../Images/ic-not-save.png')
        });
      }
    } else {
      this.setState({
        showModal2: true, title: 'Lokasi GPS',
        message: 'Kamu belum bisa lanjut sebelum lokasi GPS kamu belum ditemukan, lanjut cari lokasi?',
        icon: require('../../Images/ic-no-gps.png')
      });
    }

  }

  renderImage() {
    return (
      <View style={{ flex: 1 }}>
        <Image
          source={{ uri: this.state.pathView }}
          style={styles.preview}
        />
      </View>
    );
  }

  renderIcon = () => {
    var imgSource = this.state.hasPhoto ? imgNextPhoto : imgTakePhoto;
    return (
      <Image
        style={styles.icon}
        source={imgSource}
      />
    );
  }

  render() {
    return (
      <View style={styles.container}>
        <HeaderDefault
          onPress={() => this.handleBackButtonClick()}
          title={'Ambil Foto Janjang'} />
        <StatusBar
          hidden={false}
          barStyle="light-content"
          backgroundColor={Colors.tintColorPrimary}
        />
        <MapView
          ref={ref => this.map = ref}
          style={styles.map}
          provider="google"
          mapType={"satellite"}
          initialRegion={this.state.region}
          region={this.state.region}
          liteMode={true}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsPointsOfInterest={false}
          showsCompass={false}
          showsScale={false}
          showsBuildings={false}
          showsTraffic={false}
          showsIndoors={false}
          zoomEnabled={false}
          scrollEnabled={false}
          pitchEnabled={false}
          toolbarEnabled={false}
          moveOnMarkerPress={false}
          zoomControlEnabled={false}
          minZoomLevel={10}
          onUserLocationChange={event => {
            if (this.state.track) {
              let lat = event.nativeEvent.coordinate.latitude;
              let lon = event.nativeEvent.coordinate.longitude;
              this.setState({
                track: false,
                latitude: lat,
                longitude: lon,
                region: {
                  latitude: lat,
                  longitude: lon,
                  latitudeDelta: 0.0075,
                  longitudeDelta: 0.00721
                }
              });
              this.setParameter();
              setTimeout(() => {
                this.setState({ track: true })
              }, 5000);
            }
          }}
        >
        </MapView >
        <ModalAlert
          icon={this.state.icon}
          visible={this.state.showModal2}
          onPressCancel={() => { this.getLocation(); this.setState({ showModal2: false }) }}
          title={this.state.title}
          message={this.state.message}
        />
        <ModalAlertConfirmation
          icon={this.state.icon}
          visible={this.state.showModal}
          onPressCancel={() => this.setState({ showModal: false })}
          onPressSubmit={() => { this.backAndDeletePhoto(); this.setState({ showModal: false }) }}
          title={this.state.title}
          message={this.state.message}
        />
        <View style={{ flex: 2 }}>
          {this.state.path ? this.renderImage() : this.renderCamera()}
        </View>
        <View style={{ flex: 0.5, alignItems: 'center', justifyContent: 'center' }}>
          {this.state.dataModel !== null &&
            <TouchableOpacity style={[styles.takePicture, { marginTop: 15 }]} onPress={this.takePicture.bind(this)}>
              {this.renderIcon()}
            </TouchableOpacity>}
        </View>
      </View>
    );
  }
}

export default FotoJanjang;

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
    height: 0.1,
    top: 0
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    height: Dimensions.get('window').height,
    width: Dimensions.get('window').width
  },
  capture: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 5,
    borderColor: '#FFF',
    marginBottom: 15,
  },
  cancel: {
    position: 'absolute',
    right: 20,
    top: 20,
    backgroundColor: 'transparent',
    color: '#FFF',
    fontWeight: '600',
    fontSize: 17,
  },
  icon: {
    alignContent: 'flex-end',
    height: 64,
    width: 64,
    resizeMode: 'stretch',
    alignItems: 'center',
  }
});
