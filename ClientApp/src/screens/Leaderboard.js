import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Image,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import ipadd from "../../ipadd";
import { DataTable } from "react-native-paper";

const Leaderboard = () => {
    const [loading, setLoading] = useState([]);
    const [rank, setRank] = useState(null);
    const auth = useSelector((state) => state.auth);
    const profile = useSelector((state) => state.profile);
    const history = useSelector((state) => state.history);
    const dispatch = useDispatch();
    async function fetchData() {
        let response = await fetch(
            `http://${ipadd.ip}:3000/worker/leaderboard?token=${auth.token}&quizId=${history.currentQuiz.quizId}`
        );
        let data = await response.json();
        // console.log(data);
        setRank(data.myRank);
        setLoading(data.leaderboard);
    }
    function refresh() {
        setLoading(true);
        fetchData();
    }
    // console.log(loading);
    useEffect(() => {
        fetchData();
    }, []);

    return (
        <View style={styles.container}>
            {loading == null || loading.length == 0 ? (
                <ActivityIndicator size="large" color="#4CAF50" />
            ) : (
                <View style={styles.innerContainer}>
                    <View style={styles.profileInfo}>
                        <View style={styles.upperRow}>
                            <Image
                                source={{
                                    uri: `http://${ipadd.ip}:3000/files/workers/${profile.profile.photo}`,
                                }}
                                style={styles.userPhoto}
                            />
                        </View>

                        <View style={styles.rowContainer}>
                            <View style={styles.leftColumn}>
                                <Text style={styles.profileText}>
                                    PR : {(100 * (1 - (rank / loading.length))).toFixed(2)}%
                                </Text>
                                <Text style={styles.profileText}>
                                    Rank : {rank + 1}
                                </Text>
                            </View>
                            <View style={styles.rightColumn}>
                                <Text style={styles.profileText}>
                                    Mark : {loading[rank][1].marksObtained}
                                </Text>
                                <Text style={styles.profileText}>
                                    Time: {loading[rank][1].timeSpent}s
                                </Text>
                            </View>
                        </View>
                    </View>

                    <DataTable style={styles.tableContainer}>
                        <DataTable.Header style={styles.tableHeader}>
                            <DataTable.Title>
                                <Text style={styles.headerText}>Rank</Text>
                            </DataTable.Title>
                            <DataTable.Title>
                                <Text style={styles.headerText}>Username</Text>
                            </DataTable.Title>
                            <DataTable.Title numeric>
                                <Text style={styles.headerText}>Marks</Text>
                            </DataTable.Title>
                            <DataTable.Title numeric>
                                <Text style={styles.headerText}>Time</Text>
                            </DataTable.Title>
                        </DataTable.Header>

                        <ScrollView
                            style={styles.scrollContainer}
                            showsVerticalScrollIndicator={false}
                        >
                            {loading.map((entry, index) => (
                                <DataTable.Row
                                    key={index}
                                    style={styles.tableRow}
                                >
                                    <DataTable.Cell>
                                        <Text style={styles.cellText}>
                                            {index + 1}
                                        </Text>
                                    </DataTable.Cell>
                                    <DataTable.Cell>
                                        <Text style={styles.cellText}>
                                            {entry[1].username}
                                        </Text>
                                    </DataTable.Cell>
                                    <DataTable.Cell numeric>
                                        <Text style={styles.cellText}>
                                            {entry[1].marksObtained}
                                        </Text>
                                    </DataTable.Cell>
                                    <DataTable.Cell numeric>
                                        <Text style={styles.cellText}>
                                            {entry[1].timeSpent}s
                                        </Text>
                                    </DataTable.Cell>
                                </DataTable.Row>
                            ))}
                        </ScrollView>
                    </DataTable>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
        paddingHorizontal: 5,
    },
    profileInfo: {
        width: "100%",
        alignSelf: "center",
        backgroundColor: "#012749",
        paddingVertical: 10,
        elevation: 5,
    },
    userPhoto: {
        width: 100,
        height: 100,
        alignSelf: "center",
        borderRadius: 80,
        borderWidth: 5,
        borderColor: "white",
    },
    rowContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
    },
    profileText: {
        color: "white",
        fontSize: 16,
    },
    tableContainer: {
        marginBottom: 10,
    },
    scrollContainer: {
        height: 475,
        backgroundColor: "#d0e2ff",
    },
    tableHeader: {
        backgroundColor: "#008ac5",
    },
    headerText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "white",
    },
    tableRow: {
        borderBottomWidth: 1,
        borderBottomColor: "white",
    },
    cellText: {
        fontSize: 15,
        fontWeight: "500",
        color: "#000",
    },
    quizDetails: {
        backgroundColor: "white",
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 5,
    },
    quizName: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    quizInfo: {
        fontSize: 16,
        color: "#555",
    },
});

export default Leaderboard;
