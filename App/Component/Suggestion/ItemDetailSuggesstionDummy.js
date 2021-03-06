import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { Card } from 'native-base';
import { Colors, Images, Fonts } from '../../Themes';
import { dateDisplayMobileWithoutHours } from '../../Lib/Utils';

const styles = StyleSheet.create({
    textLabel: {
        color: Colors.darkgrey,
        fontSize: 12,
        fontFamily: Fonts.medium
    },
    textLabelBold: {
        color: Colors.black,
        fontSize: 12,
        fontFamily: Fonts.demi
    },
    textLine: {
        height: 1,
        flexDirection: 'row',
        width: '100%',
        backgroundColor: Colors.lightGrey,
        marginTop: 5
    }
})

const ItemDetailSuggestion = (props) => {

    let img;
    let desc;
    let date;
    if (props.TYPE == 'inspeksi') {
        img = Images.ic_suggestion_inspeksi;
        desc = 'Inspeksi oleh ' + props.DESC;
    } else if (props.TYPE == 'panen') {
        img = Images.ic_suggestion_panen;
        desc = props.DESC;
    } else {
        img = Images.ic_suggestion_rawat;
        desc = props.DESC;
    }

    if (props.DATE.charAt(0) == '9' || props.DATE.charAt(0) == '1') {
        date = '-'
    } else {
        date = dateDisplayMobileWithoutHours(props.DATE);
    }

    return (
        <View key={props.index}>
            <View style={{ flexDirection: 'row', marginTop: 6 }}>
                <View style={{ alignItems: 'center', marginRight: 8 }}>
                    <Image
                        source={img}
                        style={{
                            width: 35,
                            height: 35,
                            borderRadius: 36,
                            borderWidth: 1,
                            borderColor: Colors.colorPrimary
                        }} />
                    <View style={{
                        flex: 1,
                        width: 3,
                        backgroundColor: Colors.lightGrey,
                        marginTop: 8,
                        shadowColor: Colors.black
                    }} />
                </View>

                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <View>
                            <Text style={{ color: Colors.colorPrimary, fontFamily: Fonts.demi, fontSize: 12 }}> {date}</Text>
                            <Text style={{ color: Colors.black, fontFamily: Fonts.demi, fontSize: 12 }}> {desc}</Text>
                        </View>

                        {props.TYPE == 'inspeksi' && <Text style={{ color: Colors.darkgrey, marginTop: 15, fontWeight: '500', marginRight: 6, fontSize: 12 }}>{props.BARIS == null || props.BARIS == '' ? '-' : "(" + "baris" + " " + props.BARIS + ")"}</Text>}
                    </View>

                    <Card style={{ padding: 14, borderRadius: 10, backgroundColor: Colors.white, marginTop: 10, marginBottom: 20 }}>
                        {props.TYPE == 'inspeksi' && props.DATA.map(item => {
                            return <View>
                                <Text style={styles.textLabelBold}>{item.ROLE}</Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={styles.textLabel}>{item.DATE_ROLE.charAt(0) == '9' ? '----' : dateDisplayMobileWithoutHours(item.DATE_ROLE)}</Text>
                                    <Text style={styles.textLabel}>{item.baris == null ? '' : "(" + "baris" + " " + item.BARIS + ")"}</Text>
                                </View>
                                <View style={styles.textLine} />
                            </View>
                        })}

                        {props.TYPE == 'panen' && <View style={{ marginTop: 5 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={styles.textLabelBold}>Total Janjang Panen</Text>
                                <Text style={styles.textLabel}>{props.DATA[0].TOTAL_JANJANG_PANEN} Janjang</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                                <Text style={styles.textLabelBold}>BJR bulan lalu</Text>
                                <Text style={styles.textLabel}>{props.DATA[0].BJR_BULAN_LALU.toFixed(2)} kg</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                                <Text style={styles.textLabelBold}>Total Restan TPH</Text>
                                <Text style={styles.textLabel}>{props.DATA[0].TOTAL_RESTAN_TPH} Janjang</Text>
                            </View>
                        </View>}

                        {props.TYPE == 'rawat' && <View style={{ marginTop: 5 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                <Text style={styles.textLabelBold}>CPT SPRAYING</Text>
                                <Text style={styles.textLabel}>{props.DATA.CPT_SPRAYING.charAt(0) == '-' ? '-' : props.DATA.CPT_SPRAYING}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                                <Text style={styles.textLabelBold}>SPOT SPRAYING</Text>
                                <Text style={styles.textLabel}>{props.DATA.SPOT_SPRAYING.charAt(0) == '-' ? '-' : props.DATA.SPOT_SPRAYING}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
                                <Text style={styles.textLabelBold}>LALANG CTRL</Text>
                                <Text style={styles.textLabel}>{props.DATA.LALANG_CTRL.charAt(0) == '-' ? '-' : props.DATA.LALANG_CTRL}</Text>
                            </View>
                        </View>}

                    </Card>
                </View>
            </View>
        </View>
    )
}

export default ItemDetailSuggestion;