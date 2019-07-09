import React, { Component } from 'react';
import {
    Text, BackAndroid, ScrollView, TouchableOpacity, View, Image, Alert, Platform
} from 'react-native';
import {
    Container,
    Content,
    Card,
} from 'native-base';
import { connect } from 'react-redux'
import Colors from '../../Constant/Colors'
import Fonts from '../../Constant/Fonts'
import Icon2 from 'react-native-vector-icons/Ionicons';
import R from 'ramda'
import {getTodayDate} from '../../Lib/Utils'
import TaskServices from '../../Database/TaskServices'
import RNFS from 'react-native-fs';
const FILE_PREFIX = Platform.OS === "ios" ? "" : "file://";

import ModalAlert from '../../Component/ModalAlert';

class FormStep1 extends Component {

    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        return {
          headerStyle: {
            backgroundColor: Colors.tintColorPrimary
          },
          title: 'Bukti Kerja',
          headerTintColor: '#fff',
          headerTitleStyle: {
            flex: 1,
            fontSize: 18,
            fontWeight: '400'
          },
          headerLeft: (
              <TouchableOpacity onPress={() => {params.clearFoto()}}>
                  <Icon2 style={{marginLeft: 12}} name={'ios-arrow-round-back'} size={45} color={'white'} />
              </TouchableOpacity>
          )
        };
    }

    constructor(props) {
        super(props);
        
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
        this.clearFoto = this.clearFoto.bind(this);
        
        var ID = this.props.navigation.state.params.findingCode

        var user = TaskServices.getAllData('TR_LOGIN')[0];
        this.state = {
            user,
            photos: [],
            selectedPhotos: [],
            stepper: [
                { step: '1', title: 'Ambil Photo' },
                { step: '2', title: 'Tulis Keterangan' }
            ],
            fetchLocation: false,
            TRANS_CODE: ID,
            
            //Add by Aminju
            title: 'Title',
            message: 'Message',
            showModal: false,
            icon: ''
        }
    }

    clearFoto(){
        if(this.state.photos.length > 0){
            this.state.photos.map(item =>{                
                RNFS.unlink(item.uri)
            })
        }
        this.props.navigation.goBack(); 
    }

    componentDidMount() {
       BackAndroid.addEventListener('hardwareBackPress', this.handleBackButtonClick);
       this.props.navigation.setParams({ clearFoto: this.clearFoto })
    }

    componentWillUnmount(){
        BackAndroid.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    handleBackButtonClick() { 
        this.clearFoto();
        return true;
    }

    onBtnClick() {
        if (this.state.photos.length == 0) {
            // Alert.alert(
            //     'Peringatan',
            //     'Anda belum mengambil foto'
            // );
            
            this.setState({ showModal: true, title: "Ambil Foto", message: 'Opps kamu belum ambil Foto Temuan yaaa', icon: require('../../Images/ic-no-pic.png') });
        
        } else if (this.state.selectedPhotos.length == 0) {
            // Alert.alert(
            //     'Peringatan',
            //     "Minimal harus ada 1 Foto dipilih"
            // );
            this.setState({ showModal: true, title: 'Foto Temuan', message: 'Kamu harus ambil min. 1 foto yoo.', icon: require('../../Images/ic-no-pic.png') });
        } else {
            let images = [];
            this.state.selectedPhotos.map((item) => {
                let da = item.split('/')
                let imgName = da[da.length-1];
                item = item.substring(7);
                var img = {
                    TR_CODE: this.state.TRANS_CODE,
                    IMAGE_CODE: imgName.replace(".jpg", ""),
                    IMAGE_NAME: imgName,
                    IMAGE_PATH_LOCAL: item,
                    IMAGE_URL: '',
                    STATUS_IMAGE: 'SESUDAH',
                    STATUS_SYNC: 'N',
                    INSERT_USER: this.state.user.USER_AUTH_CODE,
                    INSERT_TIME: getTodayDate('YYYY-MM-DD HH:mm:ss')
                }               
                images.push(img);
            });
            this.props.navigation.state.params.onLoadImage(images);
            this.props.navigation.goBack(); 
        }
    }

    addImage = image =>{
        const photos = R.clone(this.state.photos)
        photos.push({ uri: FILE_PREFIX+image, index: photos.length })
        this.setState({
            photos,
        });
    }

    takePicture() {
        this.props.navigation.navigate('TakeFotoBukti', {addImage: this.addImage, authCode: this.state.user.USER_AUTH_CODE, from: 'BuktiKerja'})
    }

    _onSelectedPhoto = foto => {
        const selectedPhotos = R.clone(this.state.selectedPhotos)
        if (selectedPhotos.includes(foto)) {
            var index = selectedPhotos.indexOf(foto);
            selectedPhotos.splice(index, 1);
        } else {
            if (selectedPhotos.length > 2) {
                // alert("Hanya 3 foto yang bisa dipilih")
                this.setState({ showModal: true, title: 'Pilih Foto', message: 'Kamu cuma bisa pilih 3 foto aja yaa..', icon: require('../../Images/ic-no-pic.png') });    
            } else {
                selectedPhotos.push(foto);
            }
        }

        this.setState({
            selectedPhotos,
        });
    }

    _renderFoto = (foto) => {
        let border = { borderWidth: 0 }
        {
            if (this.state.selectedPhotos.includes(foto.uri)) {
                border = { borderWidth: 5, borderColor: 'red' }
            }
        }

        return (
            <TouchableOpacity
                onPress={() => { this._onSelectedPhoto(foto.uri) }}
                style={{ height: 100, width: 100, marginLeft: 10 }}
                key={foto.index}>
                <Image style={[{
                    alignItems: 'stretch', width: 100, height: 100,
                    borderRadius: 10
                }, border]} source={foto} />
            </TouchableOpacity>
        )
    }

    render() {
        const initialPage = '1';
        return (
            <Container style={{ flex: 1, backgroundColor: 'white' }}>
                <Content style={{ flex: 1, marginTop: 30 }}>
                    <ModalAlert
                        visible={this.state.showModal}
                        icon={this.state.icon}
                        onPressCancel={() => this.setState({ showModal: false })}
                        title={this.state.title}
                        message={this.state.message} />

                    <Card style={[style.cardContainer]}>
                        <TouchableOpacity style={{ padding: 70 }}
                            onPress={() => { this.takePicture() }}
                        >
                            <Image style={{
                                alignSelf: 'center', alignItems: 'stretch',
                                width: 55, height: 55
                            }}
                                source={require('../../Images/icon/ic_camera_big.png')}></Image>
                        </TouchableOpacity>
                    </Card>

                    <View style={{ marginTop: 16, height: 120 }}>
                        <ScrollView contentContainerStyle={{ paddingRight: 16, paddingLeft: 6 }} horizontal={true} showsHorizontalScrollIndicator={false}>
                            {this.state.photos.map(this._renderFoto)}
                        </ScrollView >
                    </View>

                    <TouchableOpacity style={[style.button, { marginTop: 16 }]}
                        onPress={() => this.onBtnClick()}>
                        <Text style={style.buttonText}>Pilih</Text>
                    </TouchableOpacity>
                </Content>
            </Container>
        )
    }
}

const mapStateToProps = state => {
    return {};
};

const mapDispatchToProps = dispatch => {
    return {
        
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(FormStep1);

const style = {
    stepperContainer: {
        flexDirection: 'row',
        height: 48,
    },
    stepperListContainer: { flexDirection: 'row', flex: 1, alignItems: 'center' },
    stepperNumber: {
        height: 24,
        width: 24,
        backgroundColor: Colors.buttonDisabled,
        borderRadius: 12,
        justifyContent: 'center'
    },
    stepperNumberText: [Fonts.style.caption, { textAlign: 'center', color: Colors.textDark }],
    stepperNext: { alignSelf: 'flex-end', paddingRight: 4 },
    sectionHeader: [
        Fonts.style.caption,
        { color: Colors.textSecondary, paddingLeft: 16, paddingTop: 16, paddingBottom: 8 }
    ],
    listContainer: {
        height: 80,
        backgroundColor: Colors.background,
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: Colors.border
    },
    lContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchInput: {
        height: 40,
        paddingLeft: 5,
        paddingRight: 5,
        marginRight: 5,
        flex: 1,
        fontSize: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#808080',
        color: '#808080',
    },
    txtLabel: {
        color: Colors.brand,
        fontSize: 17,
        padding: 10, textAlign: 'center', fontWeight: '400'
    },
    button: {
        width: 200,
        backgroundColor: Colors.brand,
        borderRadius: 25,
        padding: 15,
        alignSelf: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ffffff',
        textAlign: 'center'
    },
    cardContainer: {
        flex: 1,
        marginRight: 16,
        marginLeft: 16,
        borderRadius: 10,
        borderWidth: 1,
        backgroundColor: '#eee',
        borderColor: '#ddd'
    }
};