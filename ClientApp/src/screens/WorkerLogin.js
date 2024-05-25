import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import ipadd from "../../ipadd";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAuth } from "../../store/slices/AuthSlice";
import { setProfile } from "../../store/slices/ProfileSlice";
import * as Application from "expo-application";

const WorkerLogin = ({ navigation }) => {
    const [fdata, setFdata] = useState({
        username: "",
        password: "",
    });
    const [loading, setLoading] = useState(false);

    const [errormsg, setErrormsg] = useState(null);

    const dispatch = useDispatch();
    const auth = useSelector((state) => state.auth);
    useEffect(() => {
        setFdata({ username: auth.username, password: auth.password });
        if (auth.username != "") {
            handleLogin(auth.username, auth.password);
        }
    }, [auth]);

    const handleLogin = async (username, password) => {
        if (username == "" || password == "") {
            setErrormsg("All fields are required");
            return;
        }
        setLoading(true);

        const androidId = Application.androidId;

        let res = await fetch(`http://${ipadd.ip}:3000/worker/workerLogin`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: username,
                password: password,
                androidId: androidId,
                pushToken: auth.FCM,
            }),
        });
        let data = await res.json();

        if (data.success == 0) {
            setTimeout(() => {
                setErrormsg(data.message);
                setLoading(false);
            }, 1000);
            return;
        }
        let profile = await fetch(
            `http://${ipadd.ip}:3000/worker/profile?token=${data.token}`
        );
        let pdata = await profile.json();
        dispatch(setProfile(pdata.worker));
        AsyncStorage.setItem(
            "data",
            JSON.stringify({
                token: data.token,
                username,
                password,
            })
        );
        dispatch(
            setAuth({
                token: data.token,
                username,
                password,
            })
        );
    };

    const navigateToSignUp = () => {
        navigation.navigate("SignUp");
    };

    return (
        <View style={styles.container}>
            <View style={styles.formContainer}>
                <Icon
                    name="user"
                    size={60}
                    color="blue"
                    style={styles.heading}
                />
                <TextInput
                    placeholder="Username"
                    onChangeText={(text) =>
                        setFdata({ ...fdata, username: text })
                    }
                    value={fdata.username}
                    onPressIn={() => setErrormsg(null)}
                    style={styles.input}
                    editable={!loading}
                />
                <TextInput
                    placeholder="Password"
                    onChangeText={(text) =>
                        setFdata({ ...fdata, password: text })
                    }
                    value={fdata.password}
                    secureTextEntry
                    onPressIn={() => setErrormsg(null)}
                    style={styles.input}
                    editable={!loading}
                />
                {errormsg && <Text style={styles.errorText}>{errormsg}</Text>}
                <TouchableOpacity
                    style={styles.loginButton}
                    onPress={() => {
                        handleLogin(fdata.username, fdata.password);
                    }}
                >
                    {loading ? (
                        <ActivityIndicator size={20} color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Login</Text>
                    )}
                </TouchableOpacity>
            </View>
            <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account?</Text>
                <TouchableOpacity onPress={navigateToSignUp}>
                    <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f0f0f0",
    },
    formContainer: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
        shadowColor: "black",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        width: "80%",
    },
    heading: {
        fontSize: 50,
        marginBottom: 20,
        textAlign: "center",
    },
    input: {
        width: "100%",
        height: 40,
        borderWidth: 1,
        borderColor: "#ccc",
        marginBottom: 15,
        padding: 10,
        borderRadius: 5,
    },
    loginButton: {
        backgroundColor: "blue",
        padding: 15,
        borderRadius: 5,
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontSize: 18,
    },
    signupContainer: {
        marginTop: 20,
        flexDirection: "row",
        justifyContent: "center",
    },
    signupText: {
        fontSize: 16,
        marginRight: 5,
    },
    signupLink: {
        fontSize: 16,
        fontWeight: "bold",
        color: "blue",
    },
    errorText: {
        color: "red",
        fontSize: 16,
        marginTop: 10,
        textAlign: "center",
    },
});

export default WorkerLogin;
