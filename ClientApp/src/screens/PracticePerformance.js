import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Dimensions,
} from "react-native";
import { useSelector, useDispatch } from "react-redux";
import ipadd from "../../ipadd";
import { WebView } from "react-native-webview";

const PracticePerformance = () => {
    const auth = useSelector((state) => state.auth);
    const subjects = useSelector((state) => state.subjects);
    // console.log(`http://${ipadd.ip}:3000/worker/performance?token=${auth.token}&subjectId=${subjects.mySubjectId}&type=0`);
    return (
        <View style={styles.container}>
            <WebView
                javaScriptEnabled={true}
                scalesPageToFit={true}
                showsHorizontalScrollIndicator={false}
                style={{
                    width: Dimensions.get("screen").width - 10,
                    height: 1000,
                }}
                source={{
                    uri: `http://${ipadd.ip}:3000/worker/performance?token=${auth.token}&subjectId=${subjects.mySubjectId}&type=0`,
                }}
            />
        </View>
    );
};

export default PracticePerformance;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F5F5F5",
        padding: 10,
    },
    topSection: {
        backgroundColor: "#0C356A",
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 10,
        marginBottom: 10,
        justifyContent: "center",
        alignItems: "center",
    },
    userPercentageText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
    header: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        backgroundColor: "white",
        padding: 10,
        textAlign: "center",
        borderRadius: 10,
        elevation: 5,
    },
    leaderboard: {
        minHeight: 250,
        backgroundColor: "rgba(0, 0, 0, 0.01)",
        marginBottom: 20,
    },
    leaderboardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#0174BE",
        padding: 10,
        borderRadius: 10,
        marginBottom: 5,
    },
    headerText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 15,
    },
    leaderboardRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#CCCCCC",
        backgroundColor: "#FFF0CE",
    },
    leaderboardText: {
        fontSize: 16,
    },
    currentLeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#CCCCCC",
        backgroundColor: "#FFC436",
        elevation: 5,
    },
    scrollContainer: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        backgroundColor: "white",
        padding: 20,
        alignItems: "center",
    },
    chartContainer: {
        marginVertical: 20,
        backgroundColor: "#fff",
        borderRadius: 10,
        elevation: 5,
        padding: 10,
    },
    chartTitle: {
        textAlign: "center",
        marginTop: 10,
        fontWeight: "bold",
    },
});
