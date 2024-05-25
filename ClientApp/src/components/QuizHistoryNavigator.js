import React from 'react';
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs"
import FinalQuizHistory from '../screens/FinalQuizHistory';
import TrainingQuizHistory from '../screens/TrainingQuizHistory';
import PracticeQuizHistory from '../screens/PracticeQuizHistory';

const Tab = createMaterialTopTabNavigator();

const QuizHistoryNavigator = () => {


    return (
        <Tab.Navigator screenOptions={{ tabBarStyle: { marginTop: 0 }, }}>
            <Tab.Screen name='Final' component={FinalQuizHistory} />
            <Tab.Screen name='Training' component={TrainingQuizHistory} />
            <Tab.Screen name='Practice' component={PracticeQuizHistory} />
        </Tab.Navigator>
    )
};

export default QuizHistoryNavigator;
