import React, { Component } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import ActionButton from 'react-native-action-button'
import Icon2 from 'react-native-vector-icons/MaterialIcons'
import Colors from '../../Constant/Colors'
import { NavigationActions } from 'react-navigation';
import TaskServices from '../../Database/TaskServices'

export default class FindingScreen extends Component {

  actionButtonClick() {
    const checkBlock = TaskServices.getAllData('TM_BLOCK');
    // Add by Aminju 0608 10:10AM
    if (checkBlock.length > 0) {
      this.props.navigation.dispatch(NavigationActions.navigate({ routeName: 'EbccQrCode' }));
    } else {
      this.props.navigation.navigate('Sync')
    }
  }

  render() {
    return (
      <View style={styles.container}>
        {/*<View style={{ height: 48, backgroundColor: 'grey' }} />*/}
        <Image style={{ width: 300, height: 220 }} source={require('../../Images/img-no-data.png')} />

        <ActionButton style={{ marginEnd: -10, marginBottom: -10 }}
          buttonColor={Colors.tintColor}
          onPress={() => { this.actionButtonClick() }}
          icon={<Icon2 color='white' name='add' size={25} />}>
        </ActionButton>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 16,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }
});