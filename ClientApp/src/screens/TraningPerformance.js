import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Dimensions,
    Image,
    TouchableOpacity,
    Modal,
    Button,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import ipadd from "../../ipadd";
import { WebView } from "react-native-webview";
import { DataTable } from 'react-native-paper';

const TraningPerformance = () => {

    const [loading, setLoading] = useState(null);
    const [rank, setRank] = useState(null);
    const [historyModalVisible, setHistoryModalVisible] = useState(false);
    const auth = useSelector((state) => state.auth);
    const profile = useSelector((state) => state.profile);
    const history = useSelector((state) => state.history);
    const subjects = useSelector((state) => state.subjects);
    const dispatch = useDispatch();
    // console.log(`http://${ipadd.ip}:3000/worker/performance?token=${auth.token}&subjectId=${subjects.mySubjectId}&type=1`);
    async function fetchData() {
        let res = await fetch(`http://${ipadd.ip}:3000/worker/trainingQuizId?subjectId=${subjects.mySubjectId}`);
        let data1 = await res.json();

        let response = await fetch(
            `http://${ipadd.ip}:3000/worker/leaderboard?token=${auth.token}&quizId=${data1.quizId}`
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

    const toggleHistoryModal = () => {
        setHistoryModalVisible(!historyModalVisible);
    };
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
                                <Text style={styles.profileText}>PR : {(100 * (1 - (rank / loading.length))).toFixed(2)}%</Text>
                                <Text style={styles.profileText}>Rank : {rank + 1}</Text>
                            </View>
                            <View style={styles.rightColumn}>
                                <Text style={styles.profileText}>Mark : {loading[rank][1].marksObtained}</Text>
                                <Text style={styles.profileText}>Time: {loading[rank][1].timeSpent}s</Text>
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

                        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                            {loading.map((entry, index) => (
                                <DataTable.Row key={index} style={styles.tableRow}>
                                    <DataTable.Cell>
                                        <Text style={styles.cellText}>{index + 1}</Text>
                                    </DataTable.Cell>
                                    <DataTable.Cell>
                                        <Text style={styles.cellText}>{entry[1].username}</Text>
                                    </DataTable.Cell>
                                    <DataTable.Cell numeric>
                                        <Text style={styles.cellText}>{entry[1].marksObtained}</Text>
                                    </DataTable.Cell>
                                    <DataTable.Cell numeric>
                                        <Text style={styles.cellText}>{entry[1].timeSpent}s</Text>
                                    </DataTable.Cell>
                                </DataTable.Row>
                            ))}
                        </ScrollView>
                    </DataTable>


                    <Button
                        title="View History Analysis"
                        style={styles.AnalysisText}
                        onPress={toggleHistoryModal}
                    />

                    <Modal
                        animationType="slide"
                        transparent={true}
                        visible={historyModalVisible}
                    >
                        <View style={styles.modalContainer}>
                            <View style={{
                                width: '100%',
                                paddingHorizontal: 5,
                                marginVertical: 5,

                            }}>
                                <Button
                                    title="Back to Leaderboard"
                                    style={styles.modalCloseButton}
                                    onPress={toggleHistoryModal}
                                />
                            </View>
                            <View>
                                <WebView
                                    javaScriptEnabled={true}
                                    scalesPageToFit={true}
                                    showsHorizontalScrollIndicator={false}
                                    style={{
                                        width: Dimensions.get("screen").width,
                                        height: 50,
                                    }}
                                    source={{
                                        uri: `http://${ipadd.ip}:3000/worker/performance?token=${auth.token}&subjectId=${subjects.mySubjectId}&type=1`,
                                    }}
                                />
                            </View>
                        </View>

                    </Modal>
                </View>
            )
            }
        </View >
    )
}

export default TraningPerformance

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
        height: 420,
        backgroundColor: "#d0e2ff",
    },
    tableHeader: {
        backgroundColor: '#008ac5',
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
        color: "#000"
    },
    AnalysisButton: {
        backgroundColor: "#4CAF50",
        padding: 10,
        borderRadius: 10,
        alignSelf: "center",
        position: "absolute",
        bottom: 0,
        width: "100%",
    },
    modalContainer: {
        flex: 1,
        alignItems: "center",
        backgroundColor: 'white',
        width: "100%",
    },
})