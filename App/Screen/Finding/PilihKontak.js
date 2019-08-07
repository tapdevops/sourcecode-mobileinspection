
'use strict';

import React, { Component } from 'react';
import {
    View,
    TextInput,
    Text,
    StyleSheet,
    ListView,
    TouchableOpacity,
    BackAndroid,
    FlatList,
    Image
} from 'react-native';
import TaskServices from '../../Database/TaskServices';

// var ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

class PilihKontak extends Component {
  constructor(props) {
    super(props);
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this.state = {
      dataList: [],
      user: null
    };
  };

  static navigationOptions = {
    header: null
  };

  onSelect(user) {
    this.props.navigation.state.params.changeContact(user);
    this.props.navigation.goBack();
  };

  componentWillUnmount(){
    BackAndroid.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
  }

  handleBackButtonClick() {
    this.props.navigation.goBack();
    return true;
  }

  componentDidMount() {
    BackAndroid.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    const { navigation } = this.props;
    const afdCode = navigation.getParam('afdCode');
    const werks = navigation.getParam('werks');
    const withAfd = werks + afdCode;

    const login = TaskServices.getAllData('TR_LOGIN')
    //diri dia sndiri
    let dataUser = TaskServices.query('TR_CONTACT', `USER_AUTH_CODE = "${login[0].USER_AUTH_CODE}"`);
    let data = TaskServices.query('TR_CONTACT', `REF_ROLE = "AFD_CODE" OR REF_ROLE = "BA_CODE" AND LOCATION_CODE CONTAINS[c] "${withAfd}" OR LOCATION_CODE CONTAINS[c] "${werks}" AND USER_ROLE CONTAINS[c] "ASISTEN" AND USER_AUTH_CODE != "${login[0].USER_AUTH_CODE}"`).sorted('FULLNAME', false);
    // let data = TaskServices.query('TR_CONTACT', `REF_ROLE = "AFD_CODE" AND LOCATION_CODE = "${withAfd}" AND USER_ROLE CONTAINS[c] "ASISTEN" AND USER_AUTH_CODE != "${login[0].USER_AUTH_CODE}"`);
    // let data1 = TaskServices.query('TR_CONTACT', `REF_ROLE = "BA_CODE" AND LOCATION_CODE = "${werks}" AND USER_ROLE CONTAINS[c] "ASISTEN" AND USER_AUTH_CODE != "${login[0].USER_AUTH_CODE}"`);

    let arr = [];
    for (var i = 0; i < dataUser.length; i++) {
        if(dataUser[i].USER_AUTH_CODE !== undefined && dataUser[i].FULLNAME !== undefined && dataUser[i].USER_ROLE !== undefined){
            arr.push({
                userAuth: dataUser[i].USER_AUTH_CODE,
                fullName: dataUser[i].FULLNAME,
                userRole: dataUser[i].USER_ROLE,
            });
        }
    }

    for (var j = 0; j < data.length; j++) {
        if(data[j].USER_AUTH_CODE !== undefined && data[j].FULLNAME !== undefined && data[j].USER_ROLE !== undefined){
            arr.push({
                userAuth: data[j].USER_AUTH_CODE,
                fullName: data[j].FULLNAME,
                userRole: data[j].USER_ROLE,
            });
        }
    }

    // for (var k = 0; k < data1.length; k++) {
    //     if(data1[k].USER_AUTH_CODE !== undefined && data1[k].FULLNAME !== undefined && data1[k].USER_ROLE !== undefined){
    //         arr.push({
    //             userAuth: data1[k].USER_AUTH_CODE,
    //             fullName: data1[k].FULLNAME,
    //             userRole: data1[k].USER_ROLE
    //         })
    //     }
    // }

    // let tempId = [];
    // let tempValue = [];
    // arr.map((data)=>{
    //     if(!tempId.includes(data.userAuth)){
    //         tempValue.push(data);
    //         tempId.push(data.userAuth);
    //     }
    // });

    this.setState({ adresses: arr, dataList: arr })
  }

  searchedAdresses = (searchedText) => {
    var result = this.state.adresses.filter(function (adress) {
      return adress.fullName.toLowerCase().indexOf(searchedText.toLowerCase()) > -1;
    });
    this.setState({ dataList: result });
  };

  // renderAdress = (user) => {
  //   return (
  //     <View style={{ flex: 1, padding: 5 }}>
  //       <TouchableOpacity onPress={() => { this.onSelect(user) }}>
  //         <Text style={{ fontSize: 15, color: 'black' }}>{user.fullName}</Text>
  //         <Text style={{ fontSize: 13, color: 'grey', marginTop: 3 }}>{user.userRole}</Text>
  //       </TouchableOpacity>
  //     </View>
  //   );
  // };

  render() {
    return (
      <View style={{
          flex: 1,
          backgroundColor: '#FFFFFF',
      }}>
        <View style={{
            flexDirection: 'row',
            backgroundColor: '#DDDDDD',
            padding: 10
        }}>
          <TextInput
            style={styles.textinput}
            onChangeText={this.searchedAdresses}
            placeholder="Cari nama" />
        </View>
        <View style={{
            flex: 1
        }}>
            <FlatList
                style={{ flex: 1 }}
                data={this.state.dataList}
                extraData={this.state}
                removeClippedSubviews={true}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item }) => {
                    return (
                        <TouchableOpacity
                            onPress={() => {
                                this.onSelect(item)
                            }}
                            style={{
                                borderBottomWidth: 1,
                                borderColor: '#8E8E8E'
                            }}
                        >
                            <View
                                style={{paddingVertical: 5, paddingHorizontal: 10}}
                            >
                                <Text style={{ fontSize: 15, color: 'black' }}>{item.fullName}</Text>
                                <Text style={{ fontSize: 13, color: 'grey', marginTop: 3 }}>{item.userRole.replace("_"," ")}</Text>
                            </View>
                        </TouchableOpacity>
                    )
                }}
            />
          {/*<ListView*/}
          {/*  dataSource={ds.cloneWithRows(this.state.dataList)}*/}
          {/*  renderRow={this.renderAdress}*/}
          {/*  renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}*/}
          {/*/>*/}
        </View>
      </View>
    );
  };
}

export default PilihKontak;

var styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  separator: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#8E8E8E',
  },
  textinput: {
    flex: 1,
    paddingLeft: 5,
    marginLeft: 5,
    marginRight: 5,
    height: 45,
    backgroundColor: '#f2f2f2',
    ...border
  }
});
const border = {
  borderColor: '#b9b9b9',
  borderRadius: 1,
  borderWidth: 3
};
