import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    Image,
    StyleSheet,
    Button,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { removeMySubject, setSubjects } from "../../store/slices/SubjectSlice";
import { setProfile } from "../../store/slices/ProfileSlice";
import ipadd from "../../ipadd";
import {
    FontAwesome5,
    MaterialIcons,
    MaterialCommunityIcons,
    Ionicons,
    AntDesign
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { destroyToken } from "../../store/slices/AuthSlice";
// import Animated, {
//     SharedTransition,
//     withSpring,
// } from "react-native-reanimated";
import * as Progress from "react-native-progress";

const ProfileScreen = () => {
    const [loading, setLoading] = useState(true);
    const auth = useSelector((state) => state.auth);
    const subjects = useSelector((state) => state.subjects);
    const profile = useSelector((state) => state.profile);
    const dispatch = useDispatch();
    const navigation = useNavigation();
    let subjectCompletion = 0;

    async function fetchSubjectCompletion() {
        let res2 = await fetch(
            `http://${ipadd.ip}:3000/worker/getSubjects?token=${auth.token}`
        );
        let data2 = await res2.json();
        dispatch(setSubjects(data2.subjects));
    }

    let mySubjectId = subjects.mySubjectId;
    subjects.subjects.forEach((subject) => {
        if (subject._id == mySubjectId) {
            if (subject.completion) {
                subjectCompletion = subject.completion;
            }
        }
    });

    async function fetchData() {
        let response = await fetch(
            `http://${ipadd.ip}:3000/worker/profile?&token=${auth.token}`
        );
        let data = await response.json();
        dispatch(setProfile(data.worker));
        setLoading(false);
    }

    function refresh() {
        setLoading(true);
        fetchData();
    }

    useEffect(() => {
        fetchData();
        fetchSubjectCompletion();
    }, []);

    function formatDate(date) {
        function padzero(string) {
            string = string.toString();
            return string.padStart(2, "0");
        }
        let newDate = new Date(date);
        return (
            padzero(newDate.getDate()) +
            "/" +
            padzero(newDate.getMonth() + 1) +
            "/" +
            newDate.getFullYear() +
            " - " +
            padzero(newDate.getHours()) +
            ":" +
            padzero(newDate.getMinutes())
        );
    }

    const navigateToScreen = (screenName) => {
        navigation.navigate(screenName);
    };
    // const customTransition = SharedTransition.custom((values) => {
    //     "worklet";
    //     return {
    //         height: withSpring(values.targetHeight),
    //         width: withSpring(values.targetWidth),
    //         originX: withSpring(values.targetOriginX),
    //         originY: withSpring(values.targetOriginY),
    //     };
    // });
    const ProfileCard = ({ data }) => (
        <View style={styles.container}>
            <View style={styles.profileInfo}>
                <View style={styles.upperRow}>
                    <Image
                        source={{
                            uri: `http://${ipadd.ip}:3000/files/workers/${data.photo}`,
                        }}
                        style={styles.profileImage}
                    />
                    {/* <Animated.Image
                        source={{
                            uri: `http://${ipadd.ip}:3000/files/workers/${data.photo}`,
                        }}
                        style={styles.profileImage}
                        sharedTransitionTag="tag"
                    // sharedTransitionStyle={customTransition}
                    /> */}
                </View>

                <View style={styles.rowContainer}>
                    <View style={styles.lowerRow}>
                        <Text style={styles.username}>{data.username}</Text>
                        <Text style={styles.name}>{data.name}</Text>
                    </View>

                    <Progress.Circle
                        size={60}
                        progress={subjectCompletion}
                        showsText={true}
                        textStyle={{ fontSize: 15, fontWeight: "bold", color: "white" }}
                        color="#9DB2BF"
                        borderColor="white"
                        borderWidth={1.5}
                        thickness={10}
                        formatText={() => {
                            let num = Math.floor(subjectCompletion * 100);
                            return num + "%";
                        }}
                    />
                </View>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigateToScreen("View Profile")}
                >
                    <View style={styles.row}>
                        <FontAwesome5 name="user" size={24} />
                        <Text style={styles.actionText}>View Profile</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigateToScreen("Quiz History")}
                >
                    <View style={styles.row}>
                        <MaterialCommunityIcons name="history" size={24} />
                        <Text style={styles.actionText}>Quiz History</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigateToScreen("Performance")}
                >
                    <View style={styles.row}>
                        <AntDesign
                            name="Trophy"
                            size={24}
                        />
                        <Text style={styles.actionText}>Performance</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                        Alert.alert(
                            "Change Subject?",
                            "Do you want to change your subject?",
                            [
                                { text: "No", onPress: () => null },
                                {
                                    text: "Yes",
                                    onPress: () => {
                                        AsyncStorage.removeItem("subject").then(
                                            () => {
                                                dispatch(removeMySubject());
                                            }
                                        );
                                    },
                                },
                            ]
                        );
                    }}
                >
                    <View style={styles.row}>
                        <Ionicons name="repeat-outline" size={24} />
                        <Text style={styles.actionText}>Change Subject</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigateToScreen("Certificates")}
                >
                    <View style={styles.row}>
                        <MaterialCommunityIcons
                            name="certificate-outline"
                            size={24}
                        />
                        <Text style={styles.actionText}>Certificates</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigateToScreen("Bookmarks")}
                >
                    <View style={styles.row}>
                        <Ionicons name="bookmarks-outline" size={24} />
                        <Text style={styles.actionText}>Bookmarks</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                        Alert.alert("Logout?", "Do you want to logout?", [
                            { text: "No", onPress: () => null },
                            {
                                text: "Yes",
                                onPress: () => {
                                    fetch(
                                        `http://${ipadd.ip}:3000/worker/workerLogout?username=${auth.username}&password=${auth.password}`
                                    );
                                    AsyncStorage.clear().then(() => {
                                        dispatch(destroyToken());
                                    });
                                    // AsyncStorage.removeItem("subject").then(
                                    //     () => {
                                    //         AsyncStorage.removeItem(
                                    //             "data"
                                    //         ).then(() => {
                                    //         });
                                    //     }
                                    // );
                                },
                            },
                        ]);
                    }}
                >
                    <View style={styles.row}>
                        <MaterialCommunityIcons name="logout" size={24} />
                        <Text style={styles.actionText}>Logout</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={loading ? styles.con2 : styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#4CAF50" />
            ) : (
                <ProfileCard data={profile.profile} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    con2: {
        flex: 1,
        backgroundColor: "#F5F5F5",
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        marginTop: 35,
    },
    profileInfo: {
        width: "95%",
        alignSelf: "center",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#526D82",
        borderWidth: 2,
        borderColor: "#14274E",
        elevation: 20,
    },
    upperRow: {
        marginBottom: 10,
    },
    lowerRow: {
        flex: 1,
    },
    rowContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 60,
        marginBottom: 10,
    },
    profileImage: {
        width: 110,
        height: 110,
        borderWidth: 6,
        borderColor: "#14274E",
        borderRadius: 80,
        marginTop: "-9.5%"
    },
    username: {
        fontSize: 24,
        fontWeight: "bold",
    },
    name: {
        fontSize: 16,
        color: "#fff",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
    },
    actions: {
        marginTop: 20,
        width: "95%",
        alignSelf: "center",
        backgroundColor: "#DDE6ED",
        borderWidth: 1,
        borderColor: "#27374D",
    },
    actionButton: {
        padding: 15,
        paddingLeft: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    actionText: {
        fontSize: 18,
        marginLeft: 20,
    },
});

export default ProfileScreen;
