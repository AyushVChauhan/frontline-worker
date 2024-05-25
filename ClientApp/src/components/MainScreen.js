import { StatusBar } from "expo-status-bar";
import { Alert, StyleSheet, Text, View } from "react-native";
import "react-native-gesture-handler";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import WorkerLogin from "../screens/WorkerLogin";
import WorkerSignUp from "../screens/WorkerSignUp";
import AppNavigator from "../screens/AppNavigator";
import { useDispatch, useSelector } from "react-redux";
import { setFCM, setToken } from "../../store/slices/AuthSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setMySubject } from "../../store/slices/SubjectSlice";
import QuizScreen from "../screens/QuizScreen";
import SubjectScreen from "../screens/SubjectScreen";
import QuizScreenFaceDetection from "../screens/QuizScreenFaceDetection";
import { useEffect } from "react";
// import messaging from "@react-native-firebase/messaging";

const Stack = createStackNavigator();

export default function MainScreen() {
	const auth = useSelector((state) => state.auth);
	const subject = useSelector((state) => state.subjects);
	const quizAuth = useSelector((state) => state.quizAuth);

	const dispatch = useDispatch();
	// useEffect(() => {
	//     messaging().setBackgroundMessageHandler(async (remoteMessage) => {
	//         Alert.alert(
	//             remoteMessage.notification.title,
	//             remoteMessage.notification.body
	//         );
	//     });
	//     messaging()
	//         .getToken()
	//         .then(async (token) => {
	//             dispatch(setFCM(token))
	//         });
	//     messaging()
	//         .getInitialNotification()
	//         .then(async (remoteMessage) => {
	//             if (remoteMessage) {
	//                 Alert.alert(
	//                     remoteMessage.notification.title,
	//                     remoteMessage.notification.body
	//                 );
	//             }
	//         });
	//     messaging().onNotificationOpenedApp(async (remoteMessage) => {
	//         Alert.alert(
	//             remoteMessage.notification.title,
	//             remoteMessage.notification.body
	//         );
	//     });
	//     const unsubscribe = messaging().onMessage(async (remoteMessage) => {
	//         Alert.alert(
	//             remoteMessage.notification.title,
	//             remoteMessage.notification.body
	//         );
	//     });

	//     return unsubscribe;
	// }, []);

	AsyncStorage.getItem("data").then((item) => {
		if (item) {
			let data = JSON.parse(item);
			dispatch(
				setToken({
					username: data.username,
					password: data.password,
					token: data.token,
				})
			);
		}
	});
	AsyncStorage.getItem("subject").then((item) => {
		if (item) {
			let data = JSON.parse(item);
			dispatch(setMySubject({ id: data.id, name: data.name }));
		}
	});
	let screen = null;
	if (auth.auth) {
		if (quizAuth.quizAuth == 1) {
			if (quizAuth.quiz.quizId.faceDetection == 0) {
				screen = <QuizScreen />;
			} else {
				screen = <QuizScreenFaceDetection />;
			}
		} else if (subject.mySubjectId == "") {
			screen = <SubjectScreen />;
		} else {
			screen = <AppNavigator />;
		}
	} else {
		screen = (
			<Stack.Navigator>
				<Stack.Group>
					<Stack.Screen name="Login" component={WorkerLogin} options={{ headerShown: false }} />
					<Stack.Screen name="SignUp" component={WorkerSignUp} options={{ headerShown: false }} />
				</Stack.Group>
			</Stack.Navigator>
		);
	}
	return <NavigationContainer>{screen}</NavigationContainer>;
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		alignItems: "center",
		justifyContent: "center",
	},
});
