import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ResultNavigator from "../components/ResultNavigator";
import { useDispatch, useSelector } from "react-redux";
import { setMySubject, setSubjects } from "../../store/slices/SubjectSlice";
import ipadd from "../../ipadd";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Progress from "react-native-progress";
import GeneralQuizAnalysis from "./GeneralQuizAnalysis";

const SubjectSelect = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const subjects = useSelector((state) => state.subjects);
    const auth = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    async function fetchData() {
        let response = await fetch(
            `http://${ipadd.ip}:3000/worker/getSubjects?token=${auth.token}`
        );
        let data = await response.json();

        dispatch(setSubjects(data.subjects));
        setLoading(false);
    }
    function refresh() {
        setLoading(true);
        fetchData();
    }
    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = (subjectId) => {
        let mysubject = "";
        subjects.subjects.forEach((ele) => {
            if (ele._id == subjectId) {
                mysubject = ele.name;
                return;
            }
        });
        fetch(
            `http://${ipadd.ip}:3000/worker/addMySubject?token=${auth.token}&subjectId=${subjectId}`
        );
        dispatch(setMySubject({ id: subjectId, name: mysubject }));
        AsyncStorage.setItem(
            "subject",
            JSON.stringify({ id: subjectId, name: mysubject })
        );
    };
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Subjects</Text>
                <TouchableOpacity
                    style={styles.quizButton}
                    onPress={() => {
                        navigation.navigate("ResultNavigator");
                    }}
                >
                    <Text style={styles.quizText}>Mock Quiz</Text>
                    <Ionicons
                        name="arrow-forward-circle-outline"
                        size={24}
                        color="white"
                        style={{ marginLeft: 5 }}
                    />
                </TouchableOpacity>
            </View>
            {!loading && (
                <FlatList
                    data={subjects.subjects}
                    keyExtractor={(item) => item._id}
                    renderItem={({ item }) => (
                        <View style={styles.subjectCard}>
                            <Text style={styles.subjectName}>{item.name}</Text>
                            <Text style={styles.subjectDescription}>
                                {/* {item.description} */}
                                Subject Completion : {Math.floor(item.completion * 100) + "%"}
                            </Text>
                            <Progress.Bar
                                progress={item.completion}
                                width={300}
                                height={15}
                            />
                            <Text style={styles.certificates}>
                                Certificates: {item.certificates}
                            </Text>
                            <TouchableOpacity
                                style={styles.enrollButton}
                                onPress={() => {
                                    handleSubmit(item._id);
                                }}
                            >
                                <Text style={styles.enrollButtonText}>
                                    Enroll {item.name}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40,
        backgroundColor: "#f5f5f5",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
        marginBottom: 15,
        backgroundColor: "#fff",
        width: "95%",
        alignSelf: "center",
        borderRadius: 10,
        elevation: 5,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "bold",
    },
    quizButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#008080",
        padding: 10,
        borderRadius: 50,
        elevation: 5
    },
    quizText: {
        color: "white",
    },
    subjectCard: {
        width: "95%",
        alignSelf: "center",
        backgroundColor: "white",
        padding: 20,
        marginBottom: 20,
        borderRadius: 10,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 5,
    },
    subjectName: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    subjectDescription: {
        fontSize: 16,
        color: "#333",
        marginBottom: 10,
    },
    certificates: {
        fontSize: 16,
        color: "#333",
        marginBottom: 10,
    },
    enrollButton: {
        backgroundColor: "#3498db",
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
    },
    enrollButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
});

const Stack = createNativeStackNavigator();

const SubjectScreen = () => {
    return (
        <Stack.Navigator>
            <Stack.Group>
                <Stack.Screen name="Subject" component={SubjectSelect} options={{ headerShown: false }}/>
                <Stack.Screen
                    name="ResultNavigator"
                    component={ResultNavigator} options={{ headerShown: false }}
                />
                <Stack.Screen name="Quiz Analysis" component={GeneralQuizAnalysis} options={{ headerShown: true }}/>
            </Stack.Group>
        </Stack.Navigator>
    );
};

export default SubjectScreen;
