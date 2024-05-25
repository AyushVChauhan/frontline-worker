import React from 'react';
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs"
import QuestionAnalysisScreen from './QuestionAnalysisScreen';
import QuizAnalysisScreen from './QuizAnalysisScreen';
import GeneralQuizQuestionAnalysisScreen from './GeneralQuizQuestionAnalysisScreen';
import Leaderboard from './Leaderboard';


const Tab = createMaterialTopTabNavigator();

const GeneralQuizAnalysis = () => {

    return (
        <Tab.Navigator screenOptions={{ swipeEnabled:false,tabBarStyle: { marginTop: 0 }, }}>
            <Tab.Screen name='Questions' component={QuestionAnalysisScreen} />
            <Tab.Screen name='Analysis' component={GeneralQuizQuestionAnalysisScreen} />
            <Tab.Screen name='Leaderboard' component={Leaderboard} />
        </Tab.Navigator>
    )
};

export default GeneralQuizAnalysis;
