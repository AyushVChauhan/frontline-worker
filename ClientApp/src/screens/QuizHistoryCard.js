import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,

} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
    setCurrentQuiz,
    setHistoryFinal,
} from "../../store/slices/HistorySlice";
import ipadd from "../../globals";

const QuizHistoryCard = ({ item }) => {
    // console.log(item);
    const [loader, setLoader] = useState(false);
    const dispatch = useDispatch();
    async function fetchData(sessionId) {
        setLoader(true);
        let response = await fetch(
            `http://${ipadd.ip}:3000/worker/getQuizHistory?token=${auth.token}&sessionId=${sessionId}`
        );
        let data = await response.json();
        // console.log(data.topics);

        dispatch(setCurrentQuiz({ currentQuiz: data.quiz, sessionId: data.quiz._id }));
        setLoader(false);
        item.navigation.navigate("Quiz Analysis");
    }
    return (
        <View style={styles.card}>
            <Text style={styles.quizName}>{item.history.name}</Text>
            <Text style={styles.quizName}>{item.history.subject}</Text>
            <Text style={styles.marks}>
                Obtained Marks: {item.history.marksObtained} / {item.history.totalMarks}
            </Text>
            <Text style={styles.time}>
                Completed At: {item.history.completedAt}
            </Text>
            <Text style={styles.status}>
                Status: {item.history.status == 1 ? "Submitted" : "Not Submitted"}
            </Text>
            <Text style={styles.certificateStatus}>
                Certificate:{" "}
                {item.history.certificateStatus == 1
                    ? "Approved"
                    : item.history.certificateStatus == 0
                        ? "Pending"
                        : "Rejected"}
            </Text>
            {
                item.history.status == 0 ? (
                    <TouchableOpacity
                        style={styles.viewAnalysisDisable}
                        disabled
                    >
                        <Text style={styles.buttonText}>
                            {loader ? (
                                <ActivityIndicator size={"small"} color="#fff" />
                            ) : (
                                "View Analysis"
                            )}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.viewAnalysisButton}
                        onPress={() => {
                            fetchData();
                        }}
                    >
                        <Text style={styles.buttonText}>
                            {loader ? (
                                <ActivityIndicator size={"small"} color="#fff" />
                            ) : (
                                "View Analysis"
                            )}
                        </Text>
                    </TouchableOpacity>
                )
            }
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
    },
    card: {
        backgroundColor: "white",
        padding: 10,
        margin: 10,
        borderRadius: 5,
        elevation: 3,
    },
    quizName: {
        fontSize: 18,
        fontWeight: "bold",
    },
    marks: {
        fontSize: 16,
    },
    time: {
        fontSize: 16,
    },
    status: {
        fontSize: 16,
    },
    certificateStatus: {
        fontSize: 16,
    },
    viewAnalysisDisable: {
        backgroundColor: "#4CAF50",
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        opacity: 0.6
    },
    viewAnalysisButton: {
        backgroundColor: "#4CAF50",
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    buttonText: {
        color: "white",
        textAlign: "center",
        fontSize: 16,
        fontWeight: "bold",
    },
});
export default QuizHistoryCard