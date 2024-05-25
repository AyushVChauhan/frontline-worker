import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs"
import CertificateScreen from '../screens/CertificateScreen';
import FinalCertificateScreen from '../screens/FinalCertificateScreen';

const Tab = createMaterialTopTabNavigator();

const CertificateNavigator = () => {
    return (
        <Tab.Navigator screenOptions={{ tabBarStyle: { marginTop: 0 }, }}>
            <Tab.Screen name='Traning' component={CertificateScreen} />
            <Tab.Screen name='Final' component={FinalCertificateScreen} />
        </Tab.Navigator>
    )
}

export default CertificateNavigator

const styles = StyleSheet.create({})
