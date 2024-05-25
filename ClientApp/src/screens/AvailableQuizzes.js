import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Modal,
    Button,
    Alert,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
    setQuiz,
    setQuizAuth,
    setQuizId,
} from "../../store/slices/QuizAuthSlice";

import { setAvailableQuiz } from "../../store/slices/QuizSlice";
import ipadd from "../../ipadd";
import { Camera } from "expo-camera";
import * as FileSystem from "expo-file-system";
const AvailableQuizzes = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [showInstructionModal, setShowInstructionModal] = useState(false);
    const [quizId, setQuizIdState] = useState(null);

    const [permission, setPermission] = useState(false);
    const cameraRef = useRef(null);
    async function requestPermission() {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setPermission(status === "granted");
    }
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
    let component = null;
    if (permission) {
        component = (
            <Camera
                style={{ width: 200, height: 200 }}
                type={Camera.Constants.Type.front}
                ref={cameraRef}
            ></Camera>
        );
    } else {
        component = <Text>Please Grant Permission</Text>;
    }

    const auth = useSelector((state) => state.auth);
    const subject = useSelector((state) => state.subjects);
    const quizzes = useSelector((state) => state.quizzes);
    const dispatch = useDispatch();

    async function fetchData() {
        let response = await fetch(
            `http://${ipadd.ip}:3000/worker/availableQuiz?&token=${auth.token}&subjectId=${subject.mySubjectId}`
        );
        let data = await response.json();
        dispatch(setAvailableQuiz(data.quizzes));
        setLoading(false);
    }
    function refresh() {
        setLoading(true);
        fetchData();
    }
    useEffect(() => {
        requestPermission();
        fetchData();
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
    const renderQuizCard = ({ item }) => {
        let marks = 0;
        item.marks_questions.forEach((ele) => {
            marks += ele.marks * ele.count;
        });
        return (
            <View style={styles.quizCard} key={item._id}>
                <Text style={styles.quizName}>{item.name}</Text>
                <Text style={styles.quizInfo}>
                    Start Date: {formatDate(item.valid_from)}
                </Text>
                <Text style={styles.quizInfo}>
                    End Date: {formatDate(item.valid_to)}
                </Text>
                <Text style={styles.quizInfo}>Duration: {item.duration}</Text>
                <Text style={styles.quizInfo}>Marks: {marks}</Text>
                <TouchableOpacity
                    style={styles.startButton}
                    onPress={() => {
                        setShowInstructionModal(true);
                        setQuizIdState({ id: item._id, enable: false });
                    }}
                >
                    <Text style={styles.startButtonText}>Take Quiz</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const startQuiz = async () => {
        let response = await fetch(
            `http://${ipadd.ip}:3000/worker/takeQuiz?&token=${auth.token}&quizId=${quizId.id}`
        );
        let data = await response.json();
        if (data.success == 1) {
            let response = await fetch(
                `http://${ipadd.ip}:3000/worker/getSession?&token=${auth.token}&quizId=${quizId.id}`
            );
            let data = await response.json();
            dispatch(setQuiz(data.quiz));
            dispatch(setQuizId(quizId.id));
        } else {
            Alert.alert("Error", "You are ineligible to take this quiz", [
                {
                    text: "Ok",
                    onPress: () => {
                        refresh();
                    },
                },
            ]);
        }
    };

    return (
        <View style={loading ? styles.con2 : styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#4CAF50" />
            ) : (
                <FlatList
                    data={quizzes.availableQuiz}
                    keyExtractor={(item) => item._id}
                    renderItem={renderQuizCard}
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={refresh}
                        />
                    }
                />
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
                            <Text style={{ fontSize: 15, color: "red", marginTop: 5 }}>
                                Please click a photo to start quiz
                            </Text>
                        )}
                        {!quizId?.enable && (
                            <TouchableOpacity
                                onPress={clickPhoto}
                                style={styles.clickPhotoBtn}
                            >
                                <Text style={styles.clickPhotoText}>Click Photo</Text>
                            </TouchableOpacity>
                        )}
                        <Text style={styles.instructText}>
                            • Note the time allocated for the quiz. Once started, the timer can't be paused.
                        </Text>
                        <Text style={styles.instructText}>
                            • Ensure stable internet connection to avoid dissruption.
                        </Text>
                        <Text style={styles.instructText}>
                            • Review your answers before final submission. Once submitted, you cannot make changes
                        </Text>
                        <Text style={styles.instructText}>
                            • Make sure your face is clearly visible to the camera all the time.
                        </Text>
                        <Text style={styles.instructText}>
                            • Do not cover your face with any items (masks, hats, hands, etc.) that could obstruct the view
                        </Text>
                        <Text style={styles.instructText}>
                            • Do not switch or minimize the app during the face recognition process.
                        </Text>
                        <Text style={styles.instructText}>
                            • Multiple faces detected at any time during the quiz will lead to immediate disqualification.
                        </Text>
                        <Text style={styles.instructText}>
                            • Refrain from altering device settings or accessing dropdown menus once the quiz starts.
                        </Text>

                        <View style={styles.actions}>
                            <TouchableOpacity
                                style={[
                                    styles.startButton,
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
                                style={styles.startButton}
                                disabled={!quizId?.enable}
                                onPress={() => {
                                    if (quizId.enable) {
                                        setShowInstructionModal(false);
                                        startQuiz();
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
    con2: {
        flex: 1,
        backgroundColor: "#F5F5F5",
        padding: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        flex: 1,
        padding: 5,
        marginTop: 10,
    },
    quizCard: {
        width: "98%",
        backgroundColor: "white",
        borderRadius: 10,
        padding: 10,
        marginBottom: 15,
        shadowColor: "black",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 5,
        alignSelf: "center",
    },
    quizName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    quizInfo: {
        fontSize: 16,
        color: "#555",
        marginVertical: 0.5,
    },
    startButton: {
        backgroundColor: "green",
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 5,
        marginTop: 10,
        alignItems: "center",
        elevation: 5,
    },
    startButtonText: {
        color: "white",
        fontWeight: "bold",
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
});

export default AvailableQuizzes;
