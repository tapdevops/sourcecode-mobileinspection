import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Container, Content } from 'native-base'
import Colors from '../Constant/Colors';
import TaskServices from '../Database/TaskServices';
import moment from 'moment';
import { dateDisplayMobile } from '../Lib/Utils'
import { Images, Fonts } from '../Themes';

export default class Inbox extends React.Component {

	constructor(props) {
		super(props);
		let data = this.getNotif();
		console.log('Data Notification : ', data)
		this.state = {
			data,

			//Add Modal Alert by Aminju
			title: 'Title',
			message: 'Message',
			showModal: false,
			icon: '',
			isFilter: false
		}
	}
	static navigationOptions = ({ navigation }) => ({
		headerStyle: {
			backgroundColor: Colors.tintColorPrimary
		},
		headerTitleStyle: {
			textAlign: "left",
			flex: 1,
			fontSize: 18,
			fontWeight: '400'
		},
		title: 'Inbox',
		headerTintColor: '#fff'
	})

	getNotif = () => {
		let notifData = TaskServices.getAllData('TR_NOTIFICATION').sorted('FINDING_UPDATE_TIME', true);
		return notifData;
	}

	onClickItem(id) {
		let notifData = TaskServices.findBy2('TR_NOTIFICATION', 'NOTIFICATION_ID', id);
		notifData = {
			...notifData,
			NOTIFICATION_STATUS: 1
		};
		TaskServices.updateByPrimaryKey('TR_NOTIFICATION', notifData);
		let notifCount = TaskServices.getAllData('TR_NOTIFICATION').filtered('NOTIFICATION_STATUS=0').length;
		notifCount = (notifCount >= 100) ? "99+" : notifCount + "";
		this.setState({ data: this.getNotif() });
		this.props.navigation.setParams({ notifCount: notifCount })
		this.props.navigation.navigate('DetailFinding', { ID: notifData.FINDING_CODE })
		if (notifData.NOTIFICATION_TYPE == 6) {
			this.props.navigation.navigate("DetailFinding", { findingCode: notifData.FINDING_CODE })
		} else {
			this.props.navigation.navigate('DetailFinding', { ID: notifData.FINDING_CODE })
		}
	}

	_renderItem = (item, index) => {

		let findingData = TaskServices.findBy2('TR_FINDING', 'FINDING_CODE', item.FINDING_CODE);

		if (findingData != undefined) {

			let title;
			let sources;
			let desc;
			let notifColor;
			let notifCreateDate = item.FINDING_UPDATE_TIME;

			let contactAsign = TaskServices.findBy2('TR_CONTACT', 'USER_AUTH_CODE', findingData.ASSIGN_TO);
			let createTime = moment(findingData.INSERT_TIME, "YYYYMMDDHHmmss");
			let creator = TaskServices.findBy2('TR_CONTACT', 'USER_AUTH_CODE', findingData.INSERT_USER);
			let block = TaskServices.getAllData('TM_BLOCK')
				.filtered('BLOCK_CODE = "' + findingData.BLOCK_CODE + '" AND WERKS="' + findingData.WERKS + '"');
			if (block.length == 0) {
				return;
			}
			else {
				block = block[0]
			}
			let est = TaskServices.findBy2('TM_EST', 'EST_CODE', block.EST_CODE);
			if (item.NOTIFICATION_STATUS == 0) {
				notifColor = "#AFAFAF";
			}
			else {
				notifColor = "white";
			}
			if (item.NOTIFICATION_TYPE == 0) {
				sources = Images.ic_task_new;
				title = "TUGAS BARU";
				desc = "Kamu dapat tugas baru di " + est.EST_NAME + " Blok " + block.BLOCK_NAME + " dari " + creator.FULLNAME;
			} else if (item.NOTIFICATION_TYPE == 1) {
				sources = Images.ic_task_wip;
				title = "UPDATE PROGRESS";
				desc = contactAsign.FULLNAME + " baru melakukan update terhadap temuan yang ditugaskan tanggal " + createTime.format("DD MMM YYYY") + " di " + est.EST_NAME + " Blok " + block.BLOCK_NAME;
			} else if (item.NOTIFICATION_TYPE == 2 || item.NOTIFICATION_TYPE == 3) {
				sources = Images.ic_task_no_response;
				title = "BELUM ADA RESPON";
				if (item.NOTIFICATION_TYPE == 3) {
					desc = "Kamu menugaskan " + contactAsign.FULLNAME + " untuk mengerjakan temuan di " + est.EST_NAME + " Blok " + block.BLOCK_NAME + " tanggal " + createTime.format("DD MMM YYYY") + " tapi ybs belum memberikan respon sampai hari ini";
				}
				else if (item.NOTIFICATION_TYPE == 2) {
					desc = "Kamu ditugaskan " + creator.FULLNAME + " untuk mengerjakan temuan di " + est.EST_NAME + " Blok " + block.BLOCK_NAME + " tanggal " + createTime.format("DD MMM YYYY") + " tapi belum memberikan respon sampai hari ini";
				}
			} else if (item.NOTIFICATION_TYPE == 4) {
				sources = Images.ic_wait_rating;
				title = "TUGAS SELESAI";
				desc = contactAsign.FULLNAME + " telah menyelesaikan temuan yang ditugaskan kepadanya tanggal " +
					createTime.format("DD MMM YYYY") + " di " + est.EST_NAME + " Blok " + block.BLOCK_NAME +
					". Berikan rating atas pekerjaan " + contactAsign.FULLNAME + ",yuk!";
			} else if (item.NOTIFICATION_TYPE == 5) {
				sources = Images.ic_get_rating;
				title = "DAPAT RATING";
				desc = creator.FULLNAME + " telah memberikan rating kepada kamu. Cek rating yang kamu dapatkan..."
			} else if (item.NOTIFICATION_TYPE == 6) {
				let tempUsername = item.NOTIFICATION_ID.split("$");
				sources = Images.ic_get_comment;
				title = "KOMENTAR BARU";
				desc = tempUsername[1] + " memberikan komentar baru di temuan kamu."
			} else if (item.NOTIFICATION_TYPE == 7) {
				let tempUsername = item.NOTIFICATION_ID.split("$");
				sources = Images.ic_get_comment;
				title = "KOMENTAR BARU";
				desc = tempUsername[1] + " telah mention kamu di komentar temuan."
			}
			return (
				<TouchableOpacity
					style={{
						width: '100%', flex: 1, flexDirection: 'row', backgroundColor: notifColor,
						borderBottomColor: 'grey', borderBottomWidth: 2, paddingBottom: 10, paddingTop: 10
					}}
					onPress={() => {
						this.onClickItem(item.NOTIFICATION_ID)
					}}
					key={index}
				>
					<Image style={{ alignItems: 'stretch', alignSelf: 'center', resizeMode: 'contain', width: '15%', height: 40 }}
						source={sources}></Image>
					<View style={{ width: '85%', paddingRight: 10 }} >
						<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
							<Text style={{ fontSize: 16, color: 'black', fontFamily: Fonts.demi }}>{title}</Text>
							<Text style={{ fontSize: 10, color: Colors.textSecondary, alignSelf: 'flex-end', fontFamily: Fonts.demi, }}>
								{dateDisplayMobile(notifCreateDate)}
							</Text>
						</View>
						<View style={{ flexDirection: 'row' }}>
							<Text style={{ fontSize: 12, color: 'black', fontFamily: Fonts.book, }}>{desc}</Text>
						</View>
					</View>
				</TouchableOpacity>
			)
		} else {
			this._deleteNotif(item.NOTIFICATION_ID);
		}
	}

	_deleteNotif(notifID) {
		TaskServices.deleteRecordByPK('TR_NOTIFICATION', 'NOTIFICATION_ID', notifID);
	}

	_renderData() {
		return (
			<View>
				<ScrollView
					showsHorizontalScrollIndicator={false}
					showsVerticalScrollIndicator={false}>
					<View style={{ marginBottom: 48 }}>
						{this.state.data.map((item, index) => this._renderItem(item, index))}
					</View>
				</ScrollView>
			</View>
		)
	}
	render() {
		let show;
		if (this.state.data.length > 0) {
			show = this._renderData()
		}
		return (
			<Container>
				<Content>
					{show}
				</Content>
			</Container>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: '#fff',
		padding: 16,
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center'
	},
	sectionRow: {
		flexDirection: 'row'
	},
	imageThumnail: {
		height: 64,
		width: 64,
		borderWidth: 3,
		borderColor: 'white',
		borderRadius: 50,
		marginRight: 12,
	},
	name: {
		color: 'black',
		fontWeight: '400',
		fontSize: 18,
		marginRight: 8
	},
	dotNotif: {
		marginTop: 8,
		backgroundColor: 'red',
		height: 10,
		width: 10,
		borderRadius: 50
	},
	sectionCardView: {
		flex: 1,
		flexDirection: 'row'
	},
	sectionDesc: {
		flexDirection: 'column',
		justifyContent: 'space-between',
		height: 80,
	}
});

