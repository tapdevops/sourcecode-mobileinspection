import React, { Component } from 'react';
import { StyleSheet, View } from 'react-native';
import InspectionTabNavigator from './InspectionTabNavigator'

import { isNotUserMill, syncDays, notifInbox } from '../../Lib/Utils';
import Header from '../../Component/Header'

class InspectionScreen extends Component {

  constructor(props) {
    super(props);
    this.state = {
      model: null,
      divDays: 0,
      notifCount: 0
    }
  }

  static router = InspectionTabNavigator.router;
  static navigationOptions = () => {
    return {
      header: null
    };
  }

  willFocus = this.props.navigation.addListener(
    'willFocus',
    () => {
      this.setState({
        /* SET JUMLAH HARI BELUM SYNC */
        divDays: syncDays(),

        /* SET JUMLAH NOTIF  */
        notifCount: notifInbox()
      })
    }
  )

  componentWillUnmount() {
    this.willFocus.remove()
  }

  render() {
    return (
      <View style={styles.container}>

        {/* HEADER */}
        <Header
          notif={this.state.notifCount}
          divDays={this.state.divDays}
          onPressLeft={() => this.props.navigation.navigate('Sync')}
          onPressRight={() => this.props.navigation.navigate('Inbox')}
          title={'Inspeksi'}
          isNotUserMill={isNotUserMill()} />

        <InspectionTabNavigator navigation={this.props.navigation} />
      </View >
    )
  }
}

const mapStateToProps = state => {
  return {
    inspeksi: state.inspeksi
  };
};


export default InspectionScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1
  }
});
