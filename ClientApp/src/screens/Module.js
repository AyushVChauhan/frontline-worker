import {
    View,
    Text,
    ActivityIndicator,
    StyleSheet,
    FlatList,
    RefreshControl,
    TouchableOpacity,
    Modal,
    TextInput,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    setBookmark,
    setCompleted,
    setTopics,
} from "../../store/slices/TopicSlice";
import ipadd from "../../ipadd";
import {
    MaterialIcons,
    Ionicons,
    Foundation,
    FontAwesome,
} from "@expo/vector-icons";
import { setSubjects } from "../../store/slices/SubjectSlice";
import { setRatingTrue } from "../../store/slices/ModuleSlice";
import { Rating, AirbnbRating } from "react-native-ratings";

let myModule = null;
const Module = ({ navigation, route }) => {
    const topic = useSelector((state) => state.topics);
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(false);
    const [rating, setRating] = useState({ rating: null, feedback: null });
    const [errorMessage, setErrorMessage] = useState(null);

    const handleInput = (field, value) => {
        setRating({
            ...rating,
            [field]: value,
        });
    };

    const auth = useSelector((state) => state.auth);
    const modules = useSelector((state) => state.modules);
    const dispatch = useDispatch();

    async function fetchData() {
        let response = await fetch(
            `http://${ipadd.ip}:3000/worker/getTopics?token=${auth.token}&moduleId=${route.params.moduleId}`
        );
        let data = await response.json();
        // console.log(data.topics);
        dispatch(setTopics(data.topics));
        setLoading(false);
    }
    function refresh() {
        setLoading(true);
        fetchData();
    }
    useEffect(() => {
        modules.modules.forEach((module) => {
            if (module._id == route.params.moduleId) {
                myModule = module.moduleName;
                return;
            }
        });
        fetchData();
    }, []);

    async function setSubjectCompletion() {
        let res2 = await fetch(
            `http://${ipadd.ip}:3000/worker/getSubjects?token=${auth.token}`
        );
        let data2 = await res2.json();
        dispatch(setSubjects(data2.subjects));
    }

    function bookmarkTopic(topicId) {
        dispatch(setBookmark(topicId));
        fetch(
            `http://${ipadd.ip}:3000/worker/bookmarkTopic?token=${auth.token}&topicId=${topicId}`
        );
    }

    function toTopic(topicId) {
        fetch(
            `http://${ipadd.ip}:3000/worker/completeTopic?token=${auth.token}&topicId=${topicId}`
        ).then(() => {
            setSubjectCompletion();
        });
        navigation.navigate("Topic", { topicId });
        dispatch(setCompleted(topicId));
    }

    function giveRating() {
        if (rating.rating == null || rating.feedback == null) {
            setErrorMessage("Please enter a rating and feedback !");
            return;
        }
        fetch(
            `http://${ipadd.ip}:3000/worker/moduleRating?token=${auth.token}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...rating,
                    moduleId: route.params.moduleId,
                }),
            }
        );
        setModal(false);
    }

    const renderTopicCard = ({ item }) => (
        <View style={styles.topicCard} key={item._id}>
            <View style={styles.leftContent}>
                <Text style={styles.topicName}>{item.topic}</Text>
            </View>
            <TouchableOpacity
                style={styles.topicButton}
                onPress={() => {
                    bookmarkTopic(item._id);
                }}
            >
                <MaterialIcons
                    name={item.bookmarked == 1 ? "bookmark" : "bookmark-border"}
                    size={24}
                    color="white"
                />
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.startButton}
                onPress={() => {
                    toTopic(item._id);
                }}
            >
                {item.completed == 1 ? (
                    <Ionicons name="checkmark-done" size={24} color="white" />
                ) : (
                    <Ionicons name="arrow-forward" size={24} color="white" />
                )}
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={loading ? styles.con2 : styles.container}>
            {loading ? (
                <ActivityIndicator size="large" color="#4CAF50" />
            ) : (
                <View>
                    <View style={styles.topics}>
                        <Text style={styles.moduleName}>{myModule}</Text>
                        <TouchableOpacity
                            onPress={() => {
                                setModal(true);
                            }}
                        >
                            <View style={styles.ratingView}>
                                <Text style={styles.ratingText}>
                                    Give Rating
                                </Text>
                                <FontAwesome
                                    style={styles.starButton}
                                    name="star"
                                    size={24}
                                    color={"#FFDF00"}
                                />
                            </View>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        data={topic.topics}
                        keyExtractor={(item) => item._id}
                        renderItem={renderTopicCard}
                        refreshControl={
                            <RefreshControl
                                refreshing={loading}
                                onRefresh={refresh}
                            />
                        }
                    />
                </View>
            )}

            <Modal visible={modal} animationType="slide" transparent={true}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalCard}>
                        <Text style={styles.modalText}>Give Rating</Text>

                        <Rating
                            showRating
                            onFinishRating={(rating) => {
                                handleInput("rating", rating);
                            }}
                            style={{
                                width: "80%",
                                paddingVertical: 10,
                                borderWidth: 1,
                                borderColor: "#ccc",
                                marginBottom: 15,
                                padding: 10,
                                borderRadius: 5,
                            }}
                            ratingTextColor="green"
                            imageSize={40}
                        />

                        <TextInput
                            placeholder="Feedback"
                            onChangeText={(text) =>
                                handleInput("feedback", text)
                            }
                            value={rating.feedback}
                            style={styles.input}
                            onPressIn={() => setErrorMessage(null)}
                        />

                        {errorMessage && (
                            <Text style={styles.errorText}>{errorMessage}</Text>
                        )}

                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => {
                                setModal(false);
                                dispatch(setRatingTrue(route.params.moduleId));
                            }}
                        >
                            <Text style={styles.buttonText}>Close</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={() => {
                                if (errorMessage) {
                                    return;
                                } else {
                                    giveRating();
                                    dispatch(
                                        setRatingTrue(route.params.moduleId)
                                    );
                                    setModal(false);
                                }
                            }}
                        >
                            <Text style={styles.buttonText}>Submit</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
        backgroundColor: "#F5F5F5",
        padding: 10,
    },
    topics: {
        fontSize: 24,
        fontWeight: "bold",
        textAlign: "left",
        backgroundColor: "#9EB8D9",
        borderWidth: 1,
        borderColor: "#A25772",
        padding: 10,
        marginTop: 30,
        marginBottom: 10,
        borderRadius: 10,
        elevation: 5,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    moduleName: {
        fontSize: 24,
        fontWeight: "bold",
        alignSelf: "center",
        width: "50%",
    },
    ratingView: {
        backgroundColor: "#FF952A",
        paddingHorizontal: 10,
        borderRadius: 50,
        borderWidth: 1,
        flexDirection: "row",
        alignItems: "center",

    },
    ratingText: {
        color: "#fff",
        verticalAlign: "middle",
    },
    topicCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#EEF5FF",
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        borderColor: "#7C93C3",
        borderWidth: 1,
        shadowColor: "rgba(0, 0, 0, 0.2)",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 3,
        elevation: 5,
        alignItems: "center",
    },
    leftContent: {
        flex: 1,
    },
    topicName: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333",
    },
    topicButton: {
        backgroundColor: "#3498db",
        padding: 1,
        marginLeft: 5,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        width: 50,
        height: 50,
    },
    startButton: {
        backgroundColor: "#4CAF50",
        padding: 1,
        marginLeft: 5,
        borderRadius: 30,
        alignItems: "center",
        justifyContent: "center",
        width: 50,
        height: 50,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalCard: {
        backgroundColor: "#fff",
        width: "80%",
        alignItems: "center",
        paddingTop: 20,
        paddingBottom: 20,
    },
    modalText: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
    },
    starButton: {
        borderRadius: 50,
        width: 40,
        height: 40,
        paddingTop: 8,
        paddingLeft: 8,
    },
    input: {
        height: 40,
        width: "80%",
        borderWidth: 1,
        borderColor: "#ccc",
        marginBottom: 15,
        padding: 10,
        borderRadius: 5,
    },
    closeButton: {
        marginTop: 10,
        width: "40%",
        backgroundColor: "#3498db",
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
    },
    submitButton: {
        marginTop: 10,
        width: "40%",
        backgroundColor: "#4CAF50",
        padding: 10,
        borderRadius: 5,
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontWeight: "bold",
    },
    errorText: {
        color: "red",
        fontSize: 16,
        marginTop: 10,
        textAlign: "center",
    },
});

export default Module;
