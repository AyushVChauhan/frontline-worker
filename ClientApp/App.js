import { StatusBar } from "expo-status-bar";
import {
    ActivityIndicator,
    Button,
    StyleSheet,
    Text,
    View,
} from "react-native";
import "react-native-gesture-handler";
import MainScreen from "./src/components/MainScreen";
import store from "./store/store";
import { Provider } from "react-redux";
import { usePreventScreenCapture } from "expo-screen-capture";
import { LogBox } from "react-native";
import { PermissionsAndroid } from "react-native";
import messaging from "@react-native-firebase/messaging";
import { useEffect, useState } from "react";
import { Camera } from "expo-camera";

LogBox.ignoreLogs([
    "`new NativeEventEmitter()` was called with a non-null argument without the required `removeListeners` method",
    "`new NativeEventEmitter()` was called with a non-null argument without the required `addListener` method.",
    'Key "cancelled" in the image picker result is deprecated and will be removed in SDK 48, use "canceled" instead',
    "ViewPropTypes will be removed from React Native, along with all other PropTypes. We recommend that you migrate away from PropTypes and switch to a type system like TypeScript. If you need to continue using ViewPropTypes, migrate to the 'deprecated-react-native-prop-types' package.",
]);
export default function App() {
    // usePreventScreenCapture();

    const [permissions, setPermissions] = useState({
        camera: null,
        notification: null,
    });
    const [loading, setLoading] = useState(true);
    async function request() {
        let pushRequest = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
        setPermissions((prev) => ({ ...prev, notification: pushRequest }));
        let camRequest = await Camera.requestCameraPermissionsAsync();
        setPermissions((prev) => ({ ...prev, camera: camRequest.status }));
    }
    useEffect(() => {
        request().then(() => {
            setLoading(false);
        });
    }, []);
    let screen = null;
    if (loading == true) {
        screen = (
            <View style={styles.container}>
                <ActivityIndicator size={"large"} color={"#000"} />
            </View>
        );
    } else if (
        permissions.camera == "granted" &&
        permissions.notification == "granted"
    ) {
        screen = <MainScreen />;
    } else {
        screen = (
            <View style={styles.container}>
                <Text>Please Grant All Permissions</Text>
                <Button title="Grant" onPress={request} />
            </View>
        );
    }
    return <Provider store={store}>{screen}</Provider>;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
});
