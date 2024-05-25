import React from 'react';
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs"
import QuestionAnalysisScreen from '../screens/QuestionAnalysisScreen';
import QuizAnalysisScreen from '../screens/QuizAnalysisScreen';
import Leaderboard from '../screens/Leaderboard'

const Tab = createMaterialTopTabNavigator();

const QuizAnalysisNavigator = () => {

    return (
        <Tab.Navigator screenOptions={{ swipeEnabled:false,tabBarStyle: { marginTop: 0 }, }}>
            <Tab.Screen name='Questions' component={QuestionAnalysisScreen} />
            <Tab.Screen name='Analysis' component={QuizAnalysisScreen} />
            <Tab.Screen name='Leaderboard' component={Leaderboard} />
        </Tab.Navigator>
    )
};

export default QuizAnalysisNavigator;
