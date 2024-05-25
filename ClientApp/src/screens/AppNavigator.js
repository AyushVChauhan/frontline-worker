import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import QuizzesScreen from './QuizzesScreen';
import ModulesScreen from './ModulesScreen';
import ProfileScreen from './ProfileScreen'
import Icon from 'react-native-vector-icons/FontAwesome';
import ModulesNavigator from '../components/ModulesNavigator';
import { FontAwesome, MaterialCommunityIcons } from "@expo/vector-icons";
import ProfileNavigator from '../components/ProfileNavigator';

const Tab = createBottomTabNavigator();

const AppNavigator = () => {
    return (
        <Tab.Navigator initialRouteName="Modules"
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Quizzes') {
                        iconName = 'book-education-outline';
                        return <MaterialCommunityIcons name={iconName} size={size} color={color} />    
                    } else if (route.name === 'Modules') {
                        iconName = 'book';
                    } else if (route.name === 'Account') {
                        iconName = 'user';
                    }

                    return <FontAwesome name={iconName} size={size} color={color} />;
                },
            })}>
            <Tab.Screen name="Quizzes" component={QuizzesScreen} options={{ headerShown: false }} />
            <Tab.Screen name="Modules" component={ModulesNavigator} options={{ headerShown: false }} />
            <Tab.Screen name="Account" component={ProfileNavigator} options={{ headerShown: false }} />
        </Tab.Navigator>
    );
};

export default AppNavigator;
