import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs"
import TraningPerformance from '../screens/TraningPerformance';
import PracticePerformance from '../screens/PracticePerformance';

const Tab = createMaterialTopTabNavigator();

const PerformanceNavigator = () => {
    return (
        <Tab.Navigator screenOptions={{ swipeEnabled: false, tabBarStyle: { marginTop: 0 }, }}>
            <Tab.Screen name='Traning' component={TraningPerformance} />
            <Tab.Screen name='Practice' component={PracticePerformance} />
        </Tab.Navigator>
    )
}

export default PerformanceNavigator

const styles = StyleSheet.create({})