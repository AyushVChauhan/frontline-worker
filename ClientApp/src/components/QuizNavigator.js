import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import AvailableQuizzes from '../screens/AvailableQuizzes';
import QuizScreen from '../screens/QuizScreen';

const Stack = createStackNavigator();

const QuizNavigator = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Group>
                <Stack.Screen name="Available" component={AvailableQuizzes} />
                <Stack.Screen name="QuizScreen" component={QuizScreen}/>
            </Stack.Group>
        </Stack.Navigator>

    )
}

export default QuizNavigator

const styles = StyleSheet.create({})