import React, { useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    BackHandler,
} from "react-native";
import RenderHtml from "react-native-render-html";
import { useSelector } from "react-redux";
import * as Linking from "expo-linking";
import ipadd from "../../ipadd";
import * as Speech from "expo-speech";
import { FontAwesome, MaterialIcons } from "@expo/vector-icons";

function Topics({ navigation, route }) {
    const topic = useSelector((state) => state.topics);
    let myTopic = null;
    topic.topics.forEach((element) => {
        if (element._id == route.params.topicId) {
            myTopic = element;
            return;
        }
    });
    useEffect(() => {
        const backAction = () => {
            Speech.stop();
        };
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );
        return () => {
            backHandler.remove();
        };
    }, []);
    // function strip(html) {
    //     let doc = new DOMParser().parseFromString(html, "text/html");
    //     return doc.body.textContent || "";
    // }
    // function strip(html) {
    //     var tmp = document.createElement("DIV");
    //     tmp.innerHTML = html;
    //     return tmp.textContent || tmp.innerText;
    // }
    let content = myTopic.content.replace(/(<([^>]+)>)/gi, "");
    content = content.replace(/&nbsp;/g, "");
    // console.log(strip(myTopic.content));
    async function speak() {
        let speech = await Speech.isSpeakingAsync();
        if (speech) {
            await Speech.stop();
        } else {
            Speech.speak(content, { voice: "en-IN-language", rate: 0.75 });
        }
    }
    async function discussion() {
        navigation.navigate("Discussion", { topicId: route.params.topicId });
    }
    return (
        <View style={styles.container}>
            <Text style={styles.topicName}>{myTopic.topic}</Text>

            <View
                style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "flex-end",
                }}
            >
                <TouchableOpacity
                    onPress={discussion}
                    style={styles.listenButton}
                >
                    <MaterialIcons name="message" style={styles.listenIcon} />
                </TouchableOpacity>
                <TouchableOpacity onPress={speak} style={styles.listenButton}>
                    <FontAwesome
                        name="file-audio-o"
                        style={styles.listenIcon}
                    />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <RenderHtml
                    contentWidth={400}
                    source={{ html: myTopic.content }}
                />
                <View style={styles.resourcesContainer}>
                    <Text style={styles.resourcesTitle}>Links:</Text>
                    {myTopic.links.map((link, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => {
                                Linking.openURL(link);
                            }}
                        >
                            <Text style={styles.resourceText}>{link}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
                <View style={styles.resourcesContainer}>
                    <Text style={styles.resourcesTitle}>Resources:</Text>
                    {myTopic.resources.map((resource, index) => (
                        <TouchableOpacity
                            key={index}
                            onPress={() => {
                                resource.path.slice(0, 1);

                                let url = resource.path.slice(1);

                                Linking.openURL(
                                    `http://${ipadd.ip}:3000` + url
                                );
                            }}
                        >
                            <Text style={styles.resourceText}>
                                {resource.name}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f0f0f0",
        padding: 10,
    },
    topicName: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "center",
        backgroundColor: "#EEF5FF",
        borderColor: "#7C93C3",
        borderWidth: 1,
        padding: 10,
        marginTop: 30,
        margin: 10,
        borderRadius: 10,
        elevation: 5,
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 10,
    },
    resourcesContainer: {
        marginTop: 10,
    },
    resourcesTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
        marginVertical: 5,
    },
    resourceText: {
        fontSize: 15,
        marginVertical: 5,
        color: "#0645AD",
        textDecorationLine: "underline",
    },
    listenButton: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-end",
    },
    listenIcon: {
        fontSize: 24,
        marginRight: 5,
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 60,
        elevation: 5,
        color: "#3366cc",
    },
});

export default Topics;
