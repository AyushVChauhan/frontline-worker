import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import {createMaterialTopTabNavigator} from "@react-navigation/material-top-tabs"
import UpcomingQuizzes from './UpcomingQuizzes';
import QuizNavigator from '../components/QuizNavigator';
import AvailableQuizzes from './AvailableQuizzes';

const Tab = createMaterialTopTabNavigator();
const QuizzesScreen = () => {
    return (
        <Tab.Navigator screenOptions={{tabBarStyle:{marginTop:40}, }}>
            <Tab.Screen name='Available Quizzes' component={AvailableQuizzes}/>
            <Tab.Screen name='Upcoming Quizzes' component={UpcomingQuizzes}/>
        </Tab.Navigator>
    )
};

export default QuizzesScreen;
