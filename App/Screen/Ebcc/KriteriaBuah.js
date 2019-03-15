import React, { Component } from 'react';
import { TouchableOpacity, View, Text, TextInput, ScrollView, Image, BackAndroid, StatusBar } from 'react-native';
import Colors from '../../Constant/Colors'
import {RNSlidingButton, SlideDirection} from 'rn-sliding-button';
import Fonts from '../../Constant/Fonts'
import Icon from 'react-native-vector-icons/MaterialIcons';
import Icon2 from 'react-native-vector-icons/FontAwesome';
import Entypo from 'react-native-vector-icons/Entypo';
import R from 'ramda';
import TaskServices from '../../Database/TaskServices'
import { getTodayDate } from '../../Lib/Utils'
import { NavigationActions, StackActions  } from 'react-navigation';

import ModalAlertConfirmation from '../../Component/ModalAlert';

class KriteriaBuah extends Component {

    static navigationOptions = {
        headerStyle: {
          backgroundColor: Colors.tintColorPrimary
        },
        title: 'Kriteria Buah',
        headerTintColor: '#fff',
        headerTitleStyle: {
          flex: 1,
          fontSize: 18,
          fontWeight: '400'
        },
    };

    constructor(props) {
        super(props);

        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);

        let params = props.navigation.state.params;
        let fotoJanjang = R.clone(params.fotoJanjang);
        let tphAfdWerksBlockCode = R.clone(params.tphAfdWerksBlockCode);
        let ebccValCode = R.clone(params.ebccValCode);
        let dataHeader = R.clone(params.dataHeader);

        this.state = {
            arrHasilPanen: [],
            valueHasilPanen:[],
            arrKondisiBuah:[],
            valueKondisiBuah:[],
            arrPenaltyTph:[],
            valuePenaltyTph:[],
            arrJjg:[],
            valueJjg:[],
            totalJanjang: '0',  
            
            btnAda: styles.bubbleLeftOff,
            btnTdkAda: styles.bubbleRightOff,
            txtAda: styles.buttonTextSideOff,
            txtTdkAda: styles.buttonTextSideOff,       
            tphAfdWerksBlockCode,
            fotoJanjang,
            ebccValCode,
            dataHeader,
            TPH: '',
            blockCode: '',
            blockName: '',
            werks: '',
            werk_afd_blok_code: '',


            title: 'Title',
            message: 'Message',
            showModal: false,
            icon: ''
        }
    }

    componentWillMount(){
        this.loadData()
    }

    componentDidMount() {        
        BackAndroid.addEventListener('hardwareBackPress', this.handleBackButtonClick)
    }

    componentWillUnmount() {
        BackAndroid.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    handleBackButtonClick() {
        this.props.navigation.goBack(null)
        return true;
    }

    loadData(){        
        var arrTph = this.state.tphAfdWerksBlockCode.split('-') //tph-afd-werks-blockcode
        var dataBlock = TaskServices.findBy2('TM_BLOCK', 'WERKS_AFD_BLOCK_CODE', `${arrTph[2]}${arrTph[1]}${arrTph[3]}`)
        if(dataBlock !== undefined){
            var blockName = dataBlock !== undefined ? dataBlock.BLOCK_NAME:''
            var werk_afd_blok_code = `${arrTph[2]}${arrTph[1]}${arrTph[3]}`
            var werks = arrTph[2]
            this.setState({TPH: arrTph[0], blockCode: arrTph[3], blockName, werk_afd_blok_code, werks})

            //kondisi panen
            let hasilPanen = TaskServices.findByWithList('TM_KUALITAS', ['GROUP_KUALITAS', 'UOM'], ['HASIL PANEN', 'JJG'])
            if(hasilPanen !== undefined){
                hasilPanen.map((item, index) =>{
                    this.state.arrHasilPanen.push(item)
                    let model = {
                        EBCC_VALIDATION_CODE_D: `${this.state.ebccValCode}${item.ID_KUALITAS}`,
                        EBCC_VALIDATION_CODE: this.state.ebccValCode,
                        GROUP_KUALITAS: 'HASIL PANEN',
                        UOM: 'JJG',
                        ID_KUALITAS: item.ID_KUALITAS,
                        NAMA_KUALITAS: item.NAMA_KUALITAS,
                        JUMLAH: '0',
                        INSERT_TIME: getTodayDate('YYYY-MM-DD kk:mm:ss'),
                        STATUS_SYNC: 'N',
                        SYNC_TIME: ''
                    }
                    this.state.valueHasilPanen.push(model)
                })
            }
            
            //kondisi panen janjang
            let hasilPanen2 = TaskServices.findByWithList('TM_KUALITAS', ['GROUP_KUALITAS', 'UOM'], ['HASIL PANEN', 'KG'])
            if(hasilPanen2 !== undefined){
                hasilPanen2.map((item, index) =>{
                    this.state.arrJjg.push(item)
                    let model = {
                        EBCC_VALIDATION_CODE_D: `${this.state.ebccValCode}${item.ID_KUALITAS}`,
                        EBCC_VALIDATION_CODE: this.state.ebccValCode,
                        GROUP_KUALITAS: 'HASIL PANEN',
                        UOM: 'KG',
                        ID_KUALITAS: item.ID_KUALITAS,
                        NAMA_KUALITAS: item.NAMA_KUALITAS,
                        JUMLAH: '0',
                        INSERT_TIME: getTodayDate('YYYY-MM-DD kk:mm:ss'),
                        STATUS_SYNC: 'N',
                        SYNC_TIME: ''
                    }
                    this.state.valueJjg.push(model)
                })
            }

            //kondisi buah
            let kondisiBuah = TaskServices.findByWithList('TM_KUALITAS', ['GROUP_KUALITAS', 'UOM'], ['KONDISI BUAH', 'JJG'])
            if(kondisiBuah !== undefined){
                kondisiBuah.map((item, index) =>{
                    this.state.arrKondisiBuah.push(item)
                    let model = {
                        EBCC_VALIDATION_CODE_D: `${this.state.ebccValCode}${item.ID_KUALITAS}`,
                        EBCC_VALIDATION_CODE: this.state.ebccValCode,
                        GROUP_KUALITAS: 'KONDISI BUAH',
                        UOM: 'JJG',
                        ID_KUALITAS: item.ID_KUALITAS,
                        NAMA_KUALITAS: item.NAMA_KUALITAS,
                        JUMLAH: '0',
                        INSERT_TIME: getTodayDate('YYYY-MM-DD kk:mm:ss'),
                        STATUS_SYNC: 'N',
                        SYNC_TIME: ''
                    }
                    this.state.valueKondisiBuah.push(model)
                })
            }

            //penalty tph
            let penaltyTph = TaskServices.findByWithList('TM_KUALITAS', ['GROUP_KUALITAS', 'UOM'], ['PENALTY DI TPH', 'TPH'])
            if(penaltyTph !== undefined){
                penaltyTph.map((item, index) =>{
                    this.state.arrPenaltyTph.push(item)
                    let model = {
                        EBCC_VALIDATION_CODE_D: `${this.state.ebccValCode}${item.ID_KUALITAS}`,
                        EBCC_VALIDATION_CODE: this.state.ebccValCode,
                        GROUP_KUALITAS: 'PENALTY DI TPH',
                        UOM: 'TPH',
                        ID_KUALITAS: item.ID_KUALITAS,
                        NAMA_KUALITAS: item.NAMA_KUALITAS,
                        JUMLAH: '',
                        INSERT_TIME: getTodayDate('YYYY-MM-DD kk:mm:ss'),
                        STATUS_SYNC: 'N',
                        SYNC_TIME: ''
                    }
                    this.state.valuePenaltyTph.push(model)
                })
            }
        }else{
            this.setState({ showModal2: true, title: 'Salah Blok', message: 'Kamu ga bisa buat inspeksi di blok ini', icon: require('../../Images/ic-blm-input-lokasi.png') });
        }

    }

    validation(){
        let kriteriaBuah = this.state.valueHasilPanen.concat(this.state.valueJjg).concat(this.state.valueKondisiBuah).concat(this.state.valuePenaltyTph)
        if(this.state.totalJanjang == '0'){
            this.setState({
                showModal: true, title: 'Validasi',
                message: 'Total janjang tidak boleh kosong !',
                icon: require('../../Images/ic-not-save.png')
            });
        }else{
            this.props.navigation.navigate('FotoSelfieEbcc', { 
                fotoJanjang: this.state.fotoJanjang, 
                tphAfdWerksBlockCode: this.state.tphAfdWerksBlockCode,
                ebccValCode: this.state.ebccValCode,
                totalJanjang: this.state.totalJanjang,
                kriteriaBuah: kriteriaBuah,                
                dataHeader: this.state.dataHeader
            }); 
        }
        
    }

    renderDynamicComp(data, index, arr){
        return(
            <View style={styles.containerLabel} key={index}>
                <Text style={styles.txtLabel}>{data.NAMA_KUALITAS}</Text>
                <View style={[styles.containerInput, { flex: 1 }]}>
                    <TextInput
                        underlineColorAndroid={'transparent'}
                        style={[styles.searchInput]}
                        maxLength={2}
                        keyboardType={'numeric'}
                        value={arr[index].JUMLAH}
                        onChangeText={(text) => { text = text.replace(/[^0-9 ]/g, ''); this.updateArr(index, text, arr, 'panen') }} />
                </View>
            </View>
        )
    }

    renderDynamicCompNotUpdate(param, data, index, arr){
        return(
            <View style={styles.containerLabel} key={index}>
                <Text style={styles.txtLabel}>{data.NAMA_KUALITAS}</Text>
                <View style={[styles.containerInput, { flex: 1 }]}>
                    <TextInput
                        underlineColorAndroid={'transparent'}
                        style={[styles.searchInput]}
                        maxLength={2}
                        keyboardType={'numeric'}
                        value={arr[index].JUMLAH}
                        onChangeText={(text) => { text = text.replace(/[^0-9 ]/g, ''); param == 'total'? this.updateArr(index, text, arr, 'jjg'):this.updateArr(index, text, arr, 'buah') }} />
                </View>
            </View>
        )
    }

    renderDynamicCompBtn(data, index, arr){
        return(
            <View style={styles.containerLabel} key={index}>
                <Text style={[styles.txtLabel, {flex:1}]}>{data.NAMA_KUALITAS}</Text>
                <View style={{ flex: 1, flexDirection:'row', alignItems: 'center', justifyContent: 'center', }}>
                    <View style={{marginRight:1}}>
                        <TouchableOpacity style={[this.state.btnAda, styles.buttonSide] } onPress={()=>{this.getValueAndChangeColor('ADA', index, arr)}}>
                            <Text style={this.state.txtAda}>Ada</Text>
                        </TouchableOpacity>  
                    </View>
                    <View>
                        <TouchableOpacity style={[this.state.btnTdkAda, styles.buttonSide]} onPress={()=>{this.getValueAndChangeColor('TIDAK ADA', index, arr)}}>
                            <Text style={this.state.txtTdkAda}>Tidak Ada</Text>
                        </TouchableOpacity>  
                    </View> 
                </View> 
            </View>
        )
    }

    updateArr(index, strUpdate, arr, param){
        let newArray = [...arr];
        let data = newArray[index]
        let model = {
            EBCC_VALIDATION_CODE: data.EBCC_VALIDATION_CODE,
            GROUP_KUALITAS: data.GROUP_KUALITAS,
            UOM: data.UOM,
            ID_KUALITAS: data.ID_KUALITAS,
            NAMA_KUALITAS: data.NAMA_KUALITAS,
            JUMLAH: strUpdate,
            INSERT_TIME: data.INSERT_TIME,
            STATUS_SYNC: data.STATUS_SYNC,
            SYNC_TIME: data.SYNC_TIME
        }      
        newArray[index] = model;
        if(param == 'tph'){
            this.setState({valuePenaltyTph: newArray});
        }else if(param == 'buah'){            
            this.setState({valueKondisiBuah: newArray});   
        }else if(param == 'jjg'){      
            this.setState({valueJjg: newArray});     
        }else if(param == 'panen'){      
            this.setState({valueHasilPanen: newArray});
            if(strUpdate !== ''){
                let total = 0;
                newArray.map(item => {
                    total = total+parseInt(item.JUMLAH)
                });
                this.setState({totalJanjang: total.toString()})
            }    
        }
       
    }

    getValueAndChangeColor(value, index, arr){
        switch(value){
            case 'ADA':
                this.updateArr(index, '1', arr, 'tph')
                this.setState({btnAda: styles.bubbleLeftOn, btnTdkAda: styles.bubbleRightOff, txtAda: styles.buttonTextSideOn, txtTdkAda: styles.buttonTextSideOff});
                break;
            case 'TIDAK ADA':
                this.updateArr(index, '0', arr, 'tph')
                this.setState({btnTdkAda: styles.bubbleRightOn, btnAda: styles.bubbleLeftOff, txtAda: styles.buttonTextSideOff, txtTdkAda: styles.buttonTextSideOn});
                break;
            default:
                break;
        }
    }

    onSlideRight = () => {
        this.validation()
    };

    getEstateName(werks){
        try {
            let data = TaskServices.findBy2('TM_EST', 'WERKS', werks);
            return data.EST_NAME;
        } catch (error) {
            return '';
        }    
    }
    getStatusBlok(werk_afd_blok_code){
        try {
            let data = TaskServices.findBy2('TM_LAND_USE', 'WERKS_AFD_BLOCK_CODE', werk_afd_blok_code);
            return data.MATURITY_STATUS;            
        } catch (error) {
            return ''
        }
    }

    getDataBlock(blockCode){
        try {
            let data = TaskServices.findBy2('TM_BLOCK', 'BLOCK_CODE', blockCode);
            return data;            
        } catch (error) {
            return ''
        }
    }

    render() {
        return (
            <ScrollView style={styles.mainContainer}>
                <StatusBar
                    hidden={false}
                    barStyle="light-content"
                    backgroundColor={Colors.tintColorPrimary}
                />
                <ModalAlertConfirmation
                    icon={this.state.icon}
                    visible={this.state.showModal}
                    onPressCancel={() => this.setState({ showModal: false })}
                    title={this.state.title}
                    message={this.state.message}
                />

                <ModalAlertConfirmation
                    icon={this.state.icon}
                    visible={this.state.showModal2}
                    onPressCancel={() => {this.setState({ showModal2: false }); this.props.navigation.goBack(null)}}
                    title={this.state.title}
                    message={this.state.message} />
                

                {/*LABEL*/}
                <View style={styles.containerHeader}>
                    <Text style={{ fontSize: 17, fontWeight: '500' }}>{`${this.state.blockName}/${this.getStatusBlok(this.state.werk_afd_blok_code)}/${this.getEstateName(this.state.werks)}`}</Text>
                    <Text style={{ fontSize: 14, color: 'grey', fontWeight: '500', marginTop: 10 }}>TPH {this.state.TPH}</Text>
                </View>

                <View style={{ height: 10, backgroundColor: '#F5F5F5', marginTop: 10 }} />

                {/*INPUT*/}
                <View style={{ backgroundColor: 'white' }}>

                    <Text style={{ fontSize: 20, fontWeight: '500', paddingLeft: 20, marginTop: 10 }}>Hasil Panen</Text>
                    {this.state.arrHasilPanen.map((data, idx) => this.renderDynamicComp(data, idx, this.state.valueHasilPanen))}
                    {/* total janjang */}
                    <View style={styles.containerLabel}>
                        <Text style={{ fontSize: 16, color: 'grey', fontWeight: '500', flex: 2 }}>Total Janjang</Text>
                        <View style={[styles.containerInput, { flex: 1 }]}>
                            <TextInput
                                editable={false}
                                underlineColorAndroid={'transparent'}
                                style={[styles.searchInput, {backgroundColor: Colors.abuabu}]}
                                maxLength={2}
                                keyboardType={'numeric'}
                                value={this.state.totalJanjang} />
                        </View>
                    </View>
                    {this.state.arrJjg.map((data, idx) => this.renderDynamicCompNotUpdate('total', data, idx, this.state.valueJjg))}

                    <View style={{ height: 10, backgroundColor: '#F5F5F5', marginTop: 10 }} />
                    {/* kondisi buah */}
                    <Text style={{ fontSize: 20, fontWeight: '500', paddingLeft: 20, marginTop: 10 }}>Kondisi Buah</Text>
                    {this.state.arrKondisiBuah.map((data, idx) => this.renderDynamicCompNotUpdate('kondisi', data, idx, this.state.valueKondisiBuah))}

                    <View style={{ height: 10, backgroundColor: '#F5F5F5', marginTop: 10 }} />
                    {/* Penalty TPH */}
                    <Text style={{ fontSize: 20, fontWeight: '500', paddingLeft: 20, marginTop: 10 }}>Penalti di TPH</Text>
                    {this.state.arrPenaltyTph.map((data, idx) => this.renderDynamicCompBtn(data, idx, this.state.valuePenaltyTph))}

                    {/*SLIDER*/}
                    <View style={{padding:10, alignItems:'center', marginTop:30, marginBottom: 10}}>
                        <RNSlidingButton
                            style={styles.buttonSlide}
                            height={45}
                            onSlidingSuccess={this.onSlideRight}
                            slideDirection={SlideDirection.RIGHT}>
                            <View style={{flexDirection:'row'}}>
                                <TouchableOpacity style={[styles.bubble, styles.tumbButtonSlide] } onPress={()=>{}}>
                                    <Icon name={"chevron-right"}  size={20} color="white" />
                                </TouchableOpacity>
                                <Text numberOfLines={1} style={[styles.titleText,{alignItems:'center'}]}>
                                    Selesai
                                </Text>
                            </View>
                            </RNSlidingButton>
                    </View>
                </View>

            </ScrollView>
        )
    }
}

export default KriteriaBuah;

const styles = {

    mainContainer: {
        flex: 1,
        backgroundColor: 'white'
        // padding:20
    },
    containerHeader: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
        marginTop: 10
    },
    containerLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingLeft: 20,
        paddingRight: 20,
        marginTop: 10
    },
    txtLabel: {
        flex: 2,
        color: 'grey',
        fontSize: 15,
    },
    containerInput: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',

    },
    btnMinus: {
        borderWidth: 3,
        borderColor: '#cca300',
        alignItems: 'center',
        justifyContent: 'center',
        width: 35,
        height: 35,
        backgroundColor: '#e6b800',
        borderRadius: 100,

    },
    btnAdd: {
        borderWidth: 3,
        borderColor: '#00e639',
        alignItems: 'center',
        justifyContent: 'center',
        width: 35,
        height: 35,
        backgroundColor: Colors.brand,
        borderRadius: 100,
    },
    cicle: {
        borderWidth: 3,
        borderColor: '#A0A0A0',
        alignItems: 'center',
        justifyContent: 'center',
        width: 30,
        height: 30,
        backgroundColor: '#A9A9A9',
        borderRadius: 100,
    },
    cicle2: {
        borderWidth: 3,
        borderColor: '#DCDCDC',
        alignItems: 'center',
        justifyContent: 'center',
        width: 30,
        height: 30,
        backgroundColor: '#E8E8E8',
        borderRadius: 100,
    },
    searchInput: {
        height: 38,
        padding: 10,
        marginRight: 5,
        marginLeft: 5,
        flex: 1,
        fontSize: 15,
        borderWidth: 1,
        borderRadius: 15,
        borderColor: '#989898',
        color: '#808080',
        textAlign: 'center'
    },
    bubbleLeftOff: {     
        backgroundColor: Colors.abuabu,   
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
    },
    bubbleRightOff: {    
        backgroundColor: Colors.abuabu, 
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
    },
    bubbleLeftOn: {     
        backgroundColor: Colors.brand,   
        borderTopLeftRadius: 20,
        borderBottomLeftRadius: 20,
    },
    bubbleRightOn: {    
        backgroundColor: Colors.brand, 
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
    },
    buttonTextSideOn: {
        fontSize: 11,
        color: '#ffffff',
        textAlign: 'center'
    },  
    buttonTextSideOff: {
        fontSize: 11,
        color: '#808080',
        textAlign: 'center'
    },  
    buttonSide: {
        width: 75,
        alignItems: 'center',
        padding: 10,
    },
    bubble: {
        // backgroundColor: '#ff8080',        
        backgroundColor: Colors.brand,
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 20,
    },
    buttonText: {
        fontSize: 17,
        color: '#ffffff',
        textAlign: 'center'
    },
    button: {
        width: 200,
        paddingHorizontal: 12,
        alignItems: 'center',
        marginHorizontal: 10,
        padding: 10,
    },
    buttonContainer: {
        flexDirection: 'row',
        marginVertical: 20,
        backgroundColor: 'transparent',
    },
    buttonSlide: {
        width: 200,
        borderRadius: 20,
        backgroundColor: '#DCDCDC',
    },
    tumbButtonSlide:{
        width: 55,
        height:45,
        borderRadius: 20,
        borderWidth:1,
        borderColor:'#C8C8C8',
        backgroundColor: Colors.tintColor,
    },
    titleText: {
        fontSize: 15,
        textAlign: 'center',
        color: '#A9A9A9',
        paddingHorizontal: 18,
        paddingVertical: 12,        
    }
}