import { useNavigation } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    RefreshControl,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import {
    setCurrentQuiz,
    setHistoryFinal,
    setHistoryPractice,
} from "../../store/slices/HistorySlice";
import ipadd from "../../ipadd";

const PracticeQuizHistory = ({ navigation }) => {
    const [loading, setLoading] = useState(true);
    const auth = useSelector((state) => state.auth);
    const history = useSelector((state) => state.history);
    const dispatch = useDispatch();

    async function fetchData() {
        let response = await fetch(
            `http://${ipadd.ip}:3000/worker/history?token=${auth.token}&type=0`
        );
        let data = await response.json();
        // console.log(data.topics);
        dispatch(setHistoryPractice(data.myHistory));
        setLoading(false);
    }
    function refresh() {
        setLoading(true);
        fetchData();
    }
    useEffect(() => {
        fetchData();
    }, []);

    const renderQuizHistoryCard = ({ item }) => {
        async function fetchData(sessionId) {
            let response = await fetch(
                `http://${ipadd.ip}:3000/worker/getQuizHistory?token=${auth.token}&sessionId=${sessionId}`
            );
            let data = await response.json();
            // console.log(data.topics);

            dispatch(
                setCurrentQuiz({
                    currentQuiz: data.quiz,
                    sessionId: data.quiz._id,
                })
            );

            navigation.navigate("Quiz Analysis");
        }
        return (
            <View style={styles.card}>
                <Text style={styles.quizName}>{item.name}</Text>
                <Text style={styles.marks}>
                    Obtained Marks: {item.marksObtained} / {item.totalMarks}
                </Text>
                <Text style={styles.time}>
                    Completed At: {new Date(item.completedAt).toLocaleString()}
                </Text>
                <Text style={styles.status}>
                    Status: {item.status == 1 ? "Submitted" : "Not Submitted"}
                </Text>
                {
                    item.status == 0 ? (
                        <TouchableOpacity
                            style={styles.viewAnalysisDisable}
                            disabled
                        >
                            <Text style={styles.buttonText}>View Analysis</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={styles.viewAnalysisButton}
                            onPress={()=>{fetchData(item._id)}}
                        >
                            <Text style={styles.buttonText}>View Analysis</Text>
                        </TouchableOpacity>
                    )
                }
            </View>
        );
    };

    return (
        <View style={loading ? styles.con2 : styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#4CAF50" />
            ) : (
                <FlatList
                    data={history.practice}
                    keyExtractor={(item) => item._id}
                    renderItem={renderQuizHistoryCard}
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={refresh}
                        />
                    }
                />
            )}
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

export default PracticeQuizHistory;
