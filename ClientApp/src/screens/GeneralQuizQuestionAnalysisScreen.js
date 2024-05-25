import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView } from "react-native";
import { WebView } from "react-native-webview";
import { useSelector } from "react-redux";
import ipadd from "../../ipadd";
const GeneralQuizQuestionAnalysisScreen = ({ route }) => {
    const history = useSelector((state) => state.history);
    const auth = useSelector((state) => state.auth);
    const [loading, setLoading] = useState(false);
    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <Text style={styles.quizName}>
                    {history.currentQuiz.name} Analysis
                </Text>
                <WebView javaScriptEnabled={true} scalesPageToFit={true} showsHorizontalScrollIndicator={false} style={{ width: Dimensions.get("screen").width - 10 }} source={{ uri: `http://${ipadd.ip}:3000/worker/generalAnalysis?token=${auth.token}&sessionId=${history.sessionId}` }} />
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
    },
    container: {
        flex: 1,
        backgroundColor: "white",
        padding: 20,
        alignItems: "center",
    },
    quizName: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
        backgroundColor: "white",
        width: "100%",
        padding: 10,
        textAlign: "center",
        borderRadius: 10,
        elevation: 5,
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

export default GeneralQuizQuestionAnalysisScreen;