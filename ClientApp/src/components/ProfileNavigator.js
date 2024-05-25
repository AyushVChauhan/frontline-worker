import { View, Text } from 'react-native'
import React from 'react'
// import { createStackNavigator } from '@react-navigation/stack'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from "../screens/ProfileScreen";
import ViewProfile from '../screens/ViewProfile';
import QuizHistoryNavigator from './QuizHistoryNavigator';
import QuizAnalysisNavigator from './QuizAnalysisNavigator';
import CertificateNavigator from './CertificateNavigator';
import BookmarkScreen from '../screens/BookmarkScreen';
import PerformanceNavigator from './PerformanceNavigator';

const Stack = createNativeStackNavigator();

const ProfileNavigator = () => {

	return (
		<Stack.Navigator screenOptions={{ animation: "slide_from_right", animationDuration: 100 }}>
			<Stack.Group>
				<Stack.Screen name='MainScreen' component={ProfileScreen} options={{ headerShown: false }} />
				<Stack.Screen name='View Profile' component={ViewProfile} />
				<Stack.Screen name='Quiz History' component={QuizHistoryNavigator} />
				<Stack.Screen name='Quiz Analysis' component={QuizAnalysisNavigator} />
				<Stack.Screen name='Performance' component={PerformanceNavigator} />
				<Stack.Screen name='Certificates' component={CertificateNavigator} />
				<Stack.Screen name='Bookmarks' component={BookmarkScreen} />
			</Stack.Group>
		</Stack.Navigator>
	)
}

export default ProfileNavigator