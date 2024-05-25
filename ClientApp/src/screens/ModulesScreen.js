import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
    Modal,
} from "react-native";
import { Foundation, MaterialIcons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { setModules } from "../../store/slices/ModuleSlice";
import ipadd from "../../ipadd";
import { setQuiz, setQuizId } from "../../store/slices/QuizAuthSlice";
import { Camera } from "expo-camera";
import * as FileSystem from "expo-file-system";
const ModulesScreen = ({ navigation }) => {
    const module = useSelector((state) => state.modules);
    const [showInstructionModal, setShowInstructionModal] = useState(false);
    const [quizId, setQuizIdState] = useState(null);
    const [loading, setLoading] = useState(true);
    const auth = useSelector((state) => state.auth);
    const subject = useSelector((state) => state.subjects);
    const dispatch = useDispatch();
    async function fetchData() {
        let response = await fetch(
            `http://${ipadd.ip}:3000/worker/getModules?&token=${auth.token}&subjectId=${subject.mySubjectId}`
        );
        let data = await response.json();
        setLoading(false);
        dispatch(setModules(data.modules));
    }
    function refresh() {
        setLoading(true);
        fetchData();
    }
    useEffect(() => {
        fetchData();
    }, []);
    function toModule(moduleId) {
        navigation.navigate("OneModule", { moduleId });
    }
    const cameraRef = useRef(null);
    let component = (
        <Camera
            style={{ width: 200, height: 200 }}
            type={Camera.Constants.Type.front}
            ref={cameraRef}
        ></Camera>
    );
    async function clickPhoto() {
        // await requestPermission();
        if (cameraRef.current) {
            const photo = await cameraRef.current.takePictureAsync({
                skipProcessing: true,
            });
            let response = await FileSystem.uploadAsync(
                `http://${ipadd.ip}:3000/worker/verifyPhoto?token=${auth.token}`,
                photo.uri,
                {
                    fieldName: "photo",
                    httpMethod: "POST",
                    uploadType: FileSystem.FileSystemUploadType.MULTIPART,
                }
            );
            let data = JSON.parse(response.body);
            if (data.success == 1) {
                setQuizIdState((prev) => {
                    return { ...prev, enable: true };
                });
                Alert.alert(
                    "Authorised Quiz",
                    "User is verified to access this quiz"
                );
            } else {
                Alert.alert(
                    "Unauthorised access",
                    "User is not verified to access this quiz"
                );
            }
        }
    }
    async function takePracticeQuizAlert(moduleId, moduleName) {
        setQuizIdState(null);
        Alert.alert(
            `${moduleName} Practice Test`,
            `Take practice quiz of ${moduleName}?`,
            [
                { text: "No", onPress: () => null },
                {
                    text: "Yes!",
                    onPress: () => {
                        setQuizIdState({ moduleId, enable: false, type: 0 });
                        setShowInstructionModal(true);
                    },
                },
            ]
        );
    }
    async function takePracticeQuiz(moduleId) {
        let res = await fetch(
            `http://${ipadd.ip}:3000/worker/practiceQuizId?token=${auth.token}&moduleId=${moduleId}`
        );
        let data = await res.json();
        let quizId = data.quizId;
        let res2 = await fetch(
            `http://${ipadd.ip}:3000/worker/takeQuiz?token=${auth.token}&quizId=${quizId}`
        );
        let data2 = await res2.json();
        if (data2.success == 1) {
            let res3 = await fetch(
                `http://${ipadd.ip}:3000/worker/getSession?token=${auth.token}&quizId=${quizId}`
            );
            let data3 = await res3.json();
            dispatch(setQuiz(data3.quiz));
            dispatch(setQuizId(quizId));
        } else {
            Alert.alert("Invalid", "invalid");
        }
    }

    const takeSubjectQuizAlert = () => {
        setQuizIdState(null);
        Alert.alert(
            `${subject.mySubjectName} Subject Test`,
            `Take practice quiz of ${subject.mySubjectName}?`,
            [
                { text: "No", onPress: () => null },
                {
                    text: "Yes!",
                    onPress: () => {
                        setQuizIdState({
                            moduleId: subject.mySubjectId,
                            enable: false,
                            type: 1,
                        });
                        setShowInstructionModal(true);
                    },
                },
            ]
        );
    };

    const takeSubjectQuiz = async (subjectId) => {
        let res = await fetch(
            `http://${ipadd.ip}:3000/worker/trainingQuizId?token=${auth.token}&subjectId=${subjectId}`
        );
        let data = await res.json();

        let quizId = data.quizId;
        let res2 = await fetch(
            `http://${ipadd.ip}:3000/worker/takeQuiz?token=${auth.token}&quizId=${quizId}`
        );
        let data2 = await res2.json();

        if (data2.success == 1) {
            let res3 = await fetch(
                `http://${ipadd.ip}:3000/worker/getSession?token=${auth.token}&quizId=${quizId}`
            );
            let data3 = await res3.json();
            dispatch(setQuiz(data3.quiz));
            dispatch(setQuizId(quizId));
        } else {
            Alert.alert("Invalid", "invalid");
        }
    };

    const renderModuleCard = ({ item }) => (
        <View style={styles.moduleCard} key={item._id}>
            <View style={styles.leftContent}>
                <Text style={styles.moduleName}>{item.moduleName}</Text>
                <Text style={styles.moduleDetails}>
                    <Text style={styles.topicsText}>
                        {item.completedTopics}/{item.topics.length} Topics
                    </Text>
                    {" | "}
                    <Text style={styles.ratingText}>
                        Rating: {item.rating.toFixed(1)}/5
                    </Text>
                </Text>
            </View>
            <TouchableOpacity
                style={styles.topicButton}
                onPress={() => {
                    toModule(item._id);
                }}
            >
                <MaterialIcons name="menu-book" size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.startButton}
                onPress={() => {
                    takePracticeQuizAlert(item._id, item.moduleName);
                }}
            >
                <Foundation name="clipboard-notes" size={24} color="white" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#4CAF50" />
            ) : (
                <View>
                    <View style={styles.subjectRow}>
                        <Text style={styles.subjectName}>
                            {subject.mySubjectName}
                        </Text>
                        <View style={styles.testView}>
                            <Text style={styles.traningText}>Traning Test</Text>
                            <Foundation
                                name="clipboard-pencil"
                                size={20}
                                color="white"
                                style={styles.subjectTestBtn}
                                onPress={() => {
                                    takeSubjectQuizAlert();
                                }}
                            />
                        </View>
                    </View>

                    <FlatList
                        data={module.modules}
                        keyExtractor={(item) => item._id.toString()}
                        showsVerticalScrollIndicator={false}
                        renderItem={renderModuleCard}
                        refreshControl={
                            <RefreshControl
                                refreshing={loading}
                                onRefresh={refresh}
                            />
                        }
                    />
                </View>
            )}
            <Modal
                animationType="slide"
                transparent={true}
                visible={showInstructionModal}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.instructTitle}>
                            Quiz Instructions
                        </Text>
                        {!quizId?.enable && component}
                        {!quizId?.enable && (
                            <Text
                                style={{
                                    fontSize: 15,
                                    color: "red",
                                    marginTop: 5,
                                }}
                            >
                                Please click a photo to start quiz
                            </Text>
                        )}
                        {!quizId?.enable && (
                            <TouchableOpacity
                                onPress={clickPhoto}
                                style={styles.clickPhotoBtn}
                            >
                                <Text style={styles.clickPhotoText}>
                                    Click Photo
                                </Text>
                            </TouchableOpacity>
                        )}
                        <Text style={styles.instructText}>
                            • Note the time allocated for the quiz. Once
                            started, the timer can't be paused.
                        </Text>
                        <Text style={styles.instructText}>
                            • Ensure stable internet connection to avoid
                            dissruption.
                        </Text>
                        <Text style={styles.instructText}>
                            • Review your answers before final submission. Once
                            submitted, you cannot make changes
                        </Text>
                        <Text style={styles.instructText}>
                            • Make sure your face is clearly visible to the
                            camera all the time.
                        </Text>
                        <Text style={styles.instructText}>
                            • Do not cover your face with any items (masks,
                            hats, hands, etc.) that could obstruct the view
                        </Text>
                        <Text style={styles.instructText}>
                            • Do not switch or minimize the app during the face
                            recognition process.
                        </Text>
                        <Text style={styles.instructText}>
                            • Multiple faces detected at any time during the
                            quiz will lead to immediate disqualification.
                        </Text>
                        <Text style={styles.instructText}>
                            • Refrain from altering device settings or accessing
                            dropdown menus once the quiz starts.
                        </Text>

                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={[
                                    styles.startButton2,
                                    { backgroundColor: "gray" },
                                ]}
                                onPress={() => {
                                    setShowInstructionModal(false);
                                }}
                            >
                                <Text style={styles.startButtonText}>
                                    Close
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.startButton2}
                                disabled={!quizId?.enable}
                                onPress={() => {
                                    if (quizId.enable) {
                                        setShowInstructionModal(false);
                                        // console.log(quizId);
                                        if (quizId.type == 0) {
                                            takePracticeQuiz(quizId.moduleId);
                                        } else {
                                            takeSubjectQuiz(quizId.moduleId);
                                        }
                                    } else {
                                        Alert.alert(
                                            "User not verified",
                                            "Please Click Your Photo First"
                                        );
                                    }
                                }}
                            >
                                <Text style={styles.startButtonText}>
                                    Start Quiz
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
        padding: 10,
    },
    modules: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        backgroundColor: "white",
        padding: 10,
        marginTop: 30,
        marginBottom: 10,
        borderRadius: 10,
        elevation: 5,
    },
    moduleCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#D6E0F0",
        borderWidth: 1,
        borderColor: "#8D93AB",
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        shadowColor: "rgba(0, 0, 0, 0.2)",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 3,
        elevation: 5,
    },
    leftContent: {
        flex: 1,
    },
    moduleName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    moduleDetails: {
        fontSize: 15,
        color: "#666",
    },
    topicsText: {
        color: "#E74C3C",
    },
    ratingText: {
        color: "#27AE60",
    },
    topicButton: {
        backgroundColor: "#3498db",
        padding: 1,
        marginLeft: 5,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        width: 50,
        height: 50,
    },
    startButton: {
        backgroundColor: "#4CAF50",
        padding: 1,
        marginLeft: 5,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        width: 50,
        height: 50,
    },
    startButtonText: {
        color: "white",
        fontSize: 14,
    },
    subjectRow: {
        flexDirection: "row",
        alignItems: "center",
        fontSize: 24,
        fontWeight: "bold",
        backgroundColor: "#8D93AB",
        borderWidth: 1,
        borderColor: "#393B44",
        padding: 10,
        marginTop: 30,
        marginBottom: 10,
        borderRadius: 10,
        elevation: 5,
    },
    subjectName: {
        flex: 1,
        fontSize: 24,
        fontWeight: "bold",
        color: "#fff",
    },
    testView: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#29ADB2",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 50,
        borderWidth: 0.5,
    },
    traningText: {
        alignItems: "center",
        color: "#fff",
        fontWeight: "bold",
        fontSize: 16,
        marginRight: 10,
    },
    subjectTestBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#e67e22",
        verticalAlign: "middle",
        paddingLeft: 14,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        width: "90%",
        backgroundColor: "white",
        borderRadius: 10,
        padding: 20,
        alignItems: "center",
    },
    clickPhotoBtn: {
        marginTop: 10,
        backgroundColor: "#2196F3",
        paddingHorizontal: 30,
        paddingVertical: 8,
        marginBottom: 10,
        borderRadius: 3,
        elevation: 5,
    },
    clickPhotoText: {
        fontSize: 15,
        fontWeight: "bold",
        color: "white",
    },
    instructTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        marginBottom: 10,
    },
    instructText: {
        fontSize: 15,
        color: "#555",
        alignSelf: "flex-start",
        marginLeft: 10,
    },
    actions: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-evenly",
    },
    startButton2: {
        backgroundColor: "green",
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 5,
        marginTop: 10,
        alignItems: "center",
        elevation: 5,
    },
});

export default ModulesScreen;
