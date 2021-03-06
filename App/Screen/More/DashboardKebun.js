import React from 'react';
import {View, Text, BackHandler, AsyncStorage} from "react-native";
import Colors from '../../Constant/Colors'
import Icon2 from 'react-native-vector-icons/AntDesign'
import colors from '../../Themes/Colors';
import ItemMenuDashboardKebun from '../../Component/ItemMenuDashboardKebun';
import { Images } from '../../Themes';
import TaskServices from "../../Database/TaskServices";
import {notifInbox, syncDays} from "../../Lib/Utils";

export default class DashboardKebun extends React.Component {

    static navigationOptions = ({ navigation }) => {
        const { params = {} } = navigation.state;
        return {
            headerStyle: {
                backgroundColor: Colors.tintColorPrimary
            },
            title: 'Dashboard Kebun',
            headerTintColor: '#fff',
            headerTitleStyle: {
                flex: 1,
                fontSize: 18,
                fontWeight: '400'
            },
            headerLeft: (
                <Icon2 style={{ paddingLeft: 16 }} name={'arrowleft'} size={25} color={'white'} onPress={() => params.handleBack()} />
            )
        }
    };

    constructor(props) {
        super(props);

        let currentUser = TaskServices.getAllData('TR_LOGIN');
        this.state = {
            currentUser: currentUser[0],
            location: 'GAWI INTI-2',
            tanggal: '',
        }

        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }

    componentDidMount() {
        // this.initData();
        this.props.navigation.setParams({ handleBack: this.handleBackButtonClick });
    }

    componentWillMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }

    willFocus = this.props.navigation.addListener(
        'willFocus',
        () => {
            this.getRestanSyncTime();
        }
    );

    componentWillUnmount() {
        this.willFocus.remove()
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    };

    getRestanSyncTime(){
        AsyncStorage.getItem('SYNCTIME-titikRestan')
            .then((restanSyncTime)=>{
                let data = JSON.parse(restanSyncTime);
                this.setState({
                    tanggal: data.latestSyncTime !== null ? data.latestSyncTime.toString() : "Belum Sync"
                })
            })
    };

    //Func Handle Back Press (Aminju)
    handleBackButtonClick() {
        this.props.navigation.goBack(null);
        return true;
    }

    render() {
        return (
            <View style={{
                flex: 1,
                backgroundColor: 'white',
            }}>

                {/* Title */}
                <View style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: 20
                }}>
                    <Text style={{ fontSize: 18, fontWeight: '500', color: 'black' }}> {this.state.location}</Text>
                    <Text style={{ marginTop: 5, color: 'black' }}>Last Update : {this.state.tanggal}</Text>
                    <View style={{ height: 5, backgroundColor: colors.colorPrimary, width: 80, marginTop: 12 }} />
                </View>

                {/* List Menu Dashboard */}
                <View style={{
                    flexDirection: 'row', justifyContent: 'space-evenly', marginHorizontal: 16
                }}>
                    <ItemMenuDashboardKebun
                        icon={Images.ic_titik_restan}
                        isDisabled={this.state.currentUser.USER_ROLE !== "ASISTEN_LAPANGAN"}
                        onPress={() => {this.props.navigation.navigate('Restan')}}
                        title={'Titik Restan'} />
                    <View style={{ width: 12 }} />

                    <ItemMenuDashboardKebun
                        isDisabled={true}
                        onPress={() => console.log('Titik Panas')}
                        icon={Images.ic_titik_api}
                        title={'Titik Panas'} />
                    <View style={{ width: 12 }} />

                    <ItemMenuDashboardKebun
                        isDisabled={true}
                        onPress={() => console.log('Titik Inspeksi')}
                        icon={Images.ic_titik_inspeksi}
                        title={'Titik Inspeksi'} />
                </View>

            </View>
        )
    }
}
