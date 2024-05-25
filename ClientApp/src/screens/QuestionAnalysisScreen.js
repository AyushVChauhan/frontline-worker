import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Modal,
    ScrollView,
    Image,
} from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import RenderHTML from "react-native-render-html";
import ipadd from "../../ipadd";

const QuestionAnalysisScreen = () => {
    const [modalVisible, setModalVisible] = React.useState(false);
    const [selectedQuestion, setSelectedQuestion] = React.useState({
        question: "",
        index: 0,
    });
    const history = useSelector((state) => state.history);
    const openQuestionModal = (question, index) => {
        setSelectedQuestion({ question, index });
        setModalVisible(true);
    };

    // const renderQuestionCard = ({ item, index }) => (
    //     <View style={styles.questionCard}>
    //         <View style={styles.questionSection}>
    //             <Text style={styles.questionNo}>Question {index}</Text>
    //             <TouchableOpacity
    //                 onPress={() => openQuestionModal(item.question)}
    //             >
    //                 <FontAwesome5 name="eye" size={24} color="#54b435" />
    //             </TouchableOpacity>
    //         </View>
    //         <View style={styles.analysisSection}>
    //             <Text style={styles.topicName}>Topic: {item.topicName}</Text>
    //             <Text style={styles.moduleName}>Module: {item.moduleName}</Text>
    //             <Text style={styles.marks}>
    //                 Marks: {item.obtainedMarks}/{item.totalMarks}
    //             </Text>
    //             <Text style={styles.requiredTime}>
    //                 Required Time: {item.requiredTime}
    //             </Text>
    //             <Text style={styles.spentTime}>
    //                 Spent Time: {item.spentTime}
    //             </Text>
    //         </View>
    //     </View>
    // );
    const renderQuestionCard2 = ({ item, index }) => (
        <View style={styles.questionCard} key={index}>
            <View style={styles.questionSection}>
                <Text style={styles.questionNo}>Question {index + 1}</Text>
                <TouchableOpacity
                    onPress={() =>
                        openQuestionModal(item.question.question, index)
                    }
                >
                    <FontAwesome5 name="eye" size={24} color="#54b435" />
                </TouchableOpacity>
            </View>
            <View style={styles.analysisSection}>
                <Text style={styles.topicName}>
                    Topic: {item.question.topicId[0].topic}
                </Text>
                <Text style={styles.moduleName}>
                    Module: {item.question.topicId[0].moduleId.moduleName}
                </Text>
                <Text style={styles.marks}>
                    Marks:{" "}
                    {item.question.caseSensitive == 1
                        ? item.question.answer == item.answer
                            ? item.question.marks
                            : item.marks
                        : item.question.answer.toUpperCase() ==
                          item.answer.toUpperCase()
                        ? item.question.marks
                        : item.marks}
                    /{item.question.marks}
                </Text>
                <Text style={styles.marks}>Your Answer: {item.answer}</Text>
                <Text style={styles.marks}>
                    Correct Answer: {item.question.answer}
                </Text>
                <Text style={styles.requiredTime}>
                    Required Time: {item.question.time_required}
                </Text>
                <Text style={styles.spentTime}>
                    Spent Time: {item.time_spent}
                </Text>
            </View>
        </View>
    );
    return (
        <View style={styles.container}>
            <Text
                style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    marginBottom: 20,
                    backgroundColor: "white",
                    width: "100%",
                    textAlign: "center",
                    padding: 10,
                    borderRadius: 10,
                    elevation: 5,
                }}
            >
                {history.currentQuiz.name}
            </Text>
            <FlatList
                data={history.currentQuiz.questions_answers}
                renderItem={renderQuestionCard2}
                keyExtractor={(item) => item._id}
                style={styles.flatList}
            />

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(false);
                }}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text
                            style={{
                                fontSize: 18,
                                fontWeight: "bold",
                                marginBottom: 10,
                            }}
                        >
                            Question : {selectedQuestion.index + 1}
                        </Text>
                        <View>
                            <ScrollView>
                                <RenderHTML
                                    contentWidth={400}
                                    source={{ html: selectedQuestion.question }}
                                />
                                {history.currentQuiz.questions_answers[
                                    selectedQuestion.index
                                ].question.files.map((ele) => {
                                    return (
                                        <View
                                            key={ele._id}
                                            style={{ marginVertical: 20 }}
                                        >
                                            <Image
                                                source={{
                                                    uri: `http://${ipadd.ip}:3000${ele.file}`,
                                                }}
                                                style={{
                                                    height: 150,
                                                    resizeMode: "contain",
                                                }}
                                            />
                                            <Text
                                                style={{ alignSelf: "center" }}
                                            >
                                                {ele.description}
                                            </Text>
                                        </View>
                                    );
                                })}

                                <Text
                                    style={{
                                        fontSize: 18,
                                        fontWeight: "bold",
                                        marginBottom: 10,
                                    }}
                                >
                                    Options :
                                </Text>

                                {history.currentQuiz.questions_answers[
                                    selectedQuestion.index
                                ].question.options.map((option, index) => (
                                    <TouchableOpacity key={index}>
                                        <Text>
                                            {String.fromCharCode(index + 65)}.{" "}
                                            {option.option}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>
                        {/* <Text style={styles.modalQuestion}>{selectedQuestion.question}</Text> */}
                        <TouchableOpacity
                            onPress={() => setModalVisible(false)}
                            style={styles.closeButton}
                        >
                            <Text style={styles.closeButtonText}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        padding: 20,
    },
    questionCard: {
        backgroundColor: "#f0f0f0",
        padding: 15,
        marginVertical: 10,
    },
    questionSection: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    questionNo: {
        fontSize: 18,
        fontWeight: "bold",
    },
    viewIcon: {
        fontSize: 16,
        color: "blue",
    },
    analysisSection: {},
    topicName: {
        fontSize: 16,
    },
    moduleName: {
        fontSize: 16,
    },
    marks: {
        fontSize: 16,
    },
    requiredTime: {
        fontSize: 16,
    },
    spentTime: {
        fontSize: 16,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        paddingHorizontal: 10,
    },
    modalContent: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
        width: "95%",
    },
    modalQuestion: {
        fontSize: 16,
        minHeight: "10%",
        alignSelf: "center",
    },
    closeButton: {
        backgroundColor: "#000",
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    closeButtonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
        textAlign: "center",
    },
    flatList: {
        flex: 1,
    },
});

export default QuestionAnalysisScreen;
