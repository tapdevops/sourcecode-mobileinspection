import React from 'react';
import { ImageBackground, StatusBar, TouchableOpacity, View, ScrollView, Image, StyleSheet } from 'react-native';
import { Container, Content, Card, CardItem, Thumbnail, Text, Button, Icon, Left, Body, Right } from 'native-base';

import Icons from 'react-native-vector-icons/MaterialIcons';
import Colors from '../../Constant/Colors';
import homeData from '../../Data/home';

class HomeScreen extends React.Component {

  static navigationOptions = ({ navigation }) => ({
    headerStyle: {
      backgroundColor: Colors.tintColor
    },
    headerTitleStyle: {
      textAlign: "center",
      flex: 1,
      fontSize: 18,
      fontWeight: '400',
      marginHorizontal: 12
    },
    title: 'Beranda',
    headerTintColor: '#fff',
    headerRight: (
      <TouchableOpacity  onPress={() => navigation.navigate('Inbox')}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingRight: 12 }}>
          <Image style={{ width: 28, height: 28 }} source={require('../../Images/icon/ic_inbox.png')} />
        </View>
      </TouchableOpacity>
    ),
    headerLeft: (
      <TouchableOpacity onPress={() => navigation.navigate('Sync')}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingLeft: 12 }}>
          <Image style={{ width: 28, height: 28 }} source={require('../../Images/icon/ic_sync.png')} />
        </View>
      </TouchableOpacity>
    )
  });

  // actionClickSync() {
  //   this.props.navigation.navigate('Sync')
  // }

  // constructor(props){
  //   super(props);
  //   const params = props.navigation.state.params;
  // if(params != null){
  //   Alert.alert(params.logout);
  // }

  // Alert.alert('params');
  // }

  // componentWillReceiveProps(newProps){
  //   // const { navigation } = this.newProps;
  //   const itemId = newProps.getParam('logout', 'N');
  //   Alert.alert(itemId)
  // }

  // componentDidMount(){
  //   const { navigation } = this.props;
  //   const itemId = navigation.getParam('logout', 'N');
  //   Alert.alert(itemId)
  // }

  alertItemName = (item) => {
    alert(item.status)
  }

  render() {

    // var A = realm.objects('test'); 
    // var myJSON = JSON.stringify(A);
    return (
      <Container style={{ padding: 16 }}>
        <StatusBar hidden={false} backgroundColor={Colors.tintColor} barStyle="light-content" />
        <Content>
          <ScrollView
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}>
            <View style={styles.sectionTimeline}>
              <Text style={styles.textTimeline}>Timeline</Text>
              <View style={styles.rightSection}>
                <Text style={styles.textFilter}>Filter</Text>
                <TouchableOpacity>
                  <Icons name="filter-list" size={28} style={{ marginLeft: 6 }} />
                </TouchableOpacity>
              </View>
            </View>

            {
              homeData.data.items.map((item, index) => (
                <TouchableOpacity style={{ marginTop: 12 }} key={item.id} onPress={() => this.alertItemName(item)}>
                  <Card >
                    <CardItem>
                      <Left>
                        <Thumbnail style={{ height: 48, width: 48 }} source={item.image_thum} />
                        <Body><Text>{item.name}</Text></Body>
                      </Left>
                    </CardItem>
                    <CardItem cardBody>
                      <ImageBackground source={item.image_thum} style={{ height: 210, width: null, flex: 1, flexDirection: 'column-reverse' }} >
                        <View style={{ alignContent: 'center', paddingTop: 2, paddingLeft: 12, flexDirection: 'row', height: 42, backgroundColor: 'rgba(52, 52, 52, 0.5)' }} >
                          <Image style={{ marginTop: 2, height: 28, width: 28 }} source={require('../../Images/icon/ic_new_timeline.png')}></Image>
                          <Text style={{ marginLeft: 12, color: 'white' }}>{item.status}</Text>
                        </View>
                      </ImageBackground>
                    </CardItem>
                    <CardItem>
                      <Body>
                        <Text>{item.date}</Text>
                        <Text style={{ marginTop: 6 }}>Lokasi : {item.ba}</Text>
                        <Text style={{ marginTop: 6 }}>{item.description}</Text>
                      </Body>
                    </CardItem>
                  </Card>
                </TouchableOpacity>
              ))
            }
          </ScrollView>

        </Content>
      </Container>
    )
  }
}

const styles = StyleSheet.create({
  sectionTimeline: {
    height: 48,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  rightSection: {
    flexDirection: 'row'
  },
  containerHorizontal: {
    flexDirection: 'row',
    alignSelf: 'flex-end'
  },
  textTimeline: {
    width: 120,
    fontSize: 20,
    color: 'black'
  },
  textFilter: {
    textAlign: 'center',
    fontSize: 16,
    color: 'grey'
  }
});


export default HomeScreen;