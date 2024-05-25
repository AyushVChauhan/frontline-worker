import React, { useEffect, useState } from "react";
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
import { setQuiz, setQuizAuth, setQuizId } from "../../store/slices/QuizAuthSlice";
import { setAvailableQuiz, setGeneralQuiz } from "../../store/slices/QuizSlice";
import ipadd from "../../ipadd";

const GeneralQuizzes = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const [showInstructionModal, setShowInstructionModal] = useState(false);
    const [quizId, setQuizIdState] = useState(null);
    const auth = useSelector((state) => state.auth);
    const subject = useSelector((state) => state.subjects);
    const quizzes = useSelector((state) => state.quizzes);
    const dispatch = useDispatch();

    async function fetchData() {
        let response = await fetch(
            `http://${ipadd.ip}:3000/worker/generalQuiz?&token=${auth.token}`
        );
        let data = await response.json();
        dispatch(setGeneralQuiz(data.quizzes));
        setLoading(false);
    }
    function refresh() {
        setLoading(true);
        fetchData();
    }
    useEffect(() => {
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
                <Text style={styles.quizInfo}>Duration: {item.duration} minutes</Text>
                <Text style={styles.quizInfo}>Marks: {marks}</Text>
                <TouchableOpacity
                    style={styles.startButton}
                    onPress={() => {
                        setShowInstructionModal(true);
                        setQuizIdState(item._id);
                    }}
                >
                    <Text style={styles.startButtonText}>Take Quiz</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const startQuiz = async () => {
        let response = await fetch(
            `http://${ipadd.ip}:3000/worker/takeQuiz?&token=${auth.token}&quizId=${quizId}`
        );
        let data = await response.json();
        // console.log(data);
        if (data.success == 1) {
            let response = await fetch(
                `http://${ipadd.ip}:3000/worker/getSession?&token=${auth.token}&quizId=${quizId}`
            );
            let data = await response.json();
            dispatch(setQuiz(data.quiz));
            dispatch(setQuizId(quizId));
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
        <View style={styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#4CAF50" />
            ) : (
                <FlatList
                    data={quizzes.generalQuiz}
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
                        <Text style={styles.instructText}>
                            • Start Quiz instruction 1
                        </Text>
                        <Text style={styles.instructText}>
                            • Start Quiz instruction 2
                        </Text>
                        <Text style={styles.instructText}>
                            • Start Quiz instruction 3
                        </Text>
                        <Text style={styles.instructText}>
                            • Start Quiz instruction 4
                        </Text>
                        <Text style={styles.instructText}>
                            • Start Quiz instruction 5
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
                                onPress={() => {
                                    setShowInstructionModal(false);
                                    startQuiz();
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
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        alignItems: "center",
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

export default GeneralQuizzes;