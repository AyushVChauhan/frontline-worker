import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import ipadd from '../../ipadd';
import { setCurrentQuiz, setHistoryGeneral } from '../../store/slices/HistorySlice';

const GeneralQuizHistory = ({navigation}) => {
    const [loading, setLoading] = useState(true);
    const auth = useSelector((state) => state.auth);
    const history = useSelector((state) => state.history);
    const dispatch = useDispatch();

    async function fetchData() {
        let response = await fetch(
            `http://${ipadd.ip}:3000/worker/history?token=${auth.token}&type=3`
        );
        let data = await response.json();
        dispatch(setHistoryGeneral(data.myHistory));
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
                <TouchableOpacity
                    style={styles.viewAnalysisButton}
                    onPress={() => {
                        fetchData(item._id);
                    }}
                >
                    <Text style={styles.buttonText}>View Analysis</Text>
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={loading ? styles.con2 : styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#4CAF50" />
            ) : (
                <FlatList
                    data={history.general}
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
    )
}

export default GeneralQuizHistory

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
    viewAnalysisButton: {
        backgroundColor: "green",
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
})