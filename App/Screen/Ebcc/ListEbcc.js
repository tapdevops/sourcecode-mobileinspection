import React, { Component } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import ActionButton from 'react-native-action-button'
import Icon2 from 'react-native-vector-icons/MaterialIcons'
import Colors from '../../Constant/Colors'
import { NavigationActions } from 'react-navigation';

export default class FindingScreen extends Component {

  actionButtonClick() {
    this.props.navigation.dispatch(NavigationActions.navigate({ routeName: 'EbccQrCode'}));
    // this.props.navigation.navigate('EbccNavigator')
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={{ height: 48, backgroundColor: 'grey' }} />
        <Image style={{ width: 400, height: 300 }} source={require('../../Images/img-cooming-soon-1.png')} />

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