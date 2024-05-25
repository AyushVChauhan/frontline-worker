import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { setUpcomingQuiz } from "../../store/slices/QuizSlice";
import ipadd from "../../ipadd";
const UpcomingQuizzes = () => {
    const [loading, setLoading] = useState(true);
    const auth = useSelector((state) => state.auth);
    const subject = useSelector((state) => state.subjects);
    const quizzes = useSelector((state) => state.quizzes);
    const dispatch = useDispatch();
    async function fetchData() {
        let response = await fetch(
            `http://${ipadd.ip}:3000/worker/upcomingQuiz?token=${auth.token}&subjectId=${subject.mySubjectId}`
        );
        let data = await response.json();
        dispatch(setUpcomingQuiz(data.quizzes));
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
            <TouchableOpacity style={styles.quizCard} key={item._id}>
                <Text style={styles.quizName}>{item.name}</Text>
                <Text style={styles.quizInfo}>
                    Start Date: {formatDate(item.valid_from)}
                </Text>
                <Text style={styles.quizInfo}>
                    End Date: {formatDate(item.valid_to)}
                </Text>
                <Text style={styles.quizInfo}>Duration: {item.duration}</Text>
                <Text style={styles.quizInfo}>Marks: {marks}</Text>
                {/* <TouchableOpacity style={styles.startButton}>
                    <Text style={styles.startButtonText}>Take Quiz</Text>
                </TouchableOpacity> */}
            </TouchableOpacity>
        );
    };

    return (
        <View style={loading ? styles.con2 : styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#4CAF50" />
            ) : (
                <FlatList
                    data={quizzes.upcomingQuiz}
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
        </View>
    );
};

const styles = StyleSheet.create({
    con2:{
        flex: 1,
        backgroundColor: "#F5F5F5",
        padding: 10,
        justifyContent:"center",
        alignItems:"center"
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
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
        alignItems: "center",
    },
    startButtonText: {
        color: "white",
        fontWeight: "bold",
    },
});

export default UpcomingQuizzes;
