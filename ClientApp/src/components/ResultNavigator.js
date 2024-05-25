import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs"
import GeneralQuizzes from '../screens/GeneralQuizzes';
import GeneralQuizHistory from '../screens/GeneralQuizHistory';
import Leaderboard from '../screens/Leaderboard'

const Tab = createMaterialTopTabNavigator();

const SubjectNavigator = () => {
    return (
        <Tab.Navigator style={{ marginTop: 40 }}>
            <Tab.Screen name='Mock Quiz' component={GeneralQuizzes} />
            <Tab.Screen name='Mock History' component={GeneralQuizHistory} />
        </Tab.Navigator>
    )
}

export default SubjectNavigator

const styles = StyleSheet.create({})