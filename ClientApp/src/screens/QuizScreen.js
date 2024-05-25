import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Image,
    Alert,
    BackHandler,
    ActivityIndicator,
    TextInput,
    Dimensions,
} from "react-native";
import ipadd from "../../ipadd";
import { AntDesign } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { setQuiz, setQuizAuth } from "../../store/slices/QuizAuthSlice";
import RenderHTML from "react-native-render-html";
import AsyncStorage from "@react-native-async-storage/async-storage";
let timeSpent = [];
let totalMarks = 0;

const QuizScreen = () => {
    const quizAuth = useSelector((state) => state.quizAuth);
    const auth = useSelector((state) => state.auth);
    const profile = useSelector((state) => state.profile);
    const [time, setTime] = useState(0);
    const totalQuestions = quizAuth.quiz.questions_answers.length;
    const quizName = quizAuth.quiz.quizId.name;
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedOptions, setSelectedOptions] = useState(
        new Array(totalQuestions).fill(null)
    );
    const [dataTaken, setDataTaken] = useState(false);
    const dispatch = useDispatch();
    async function checkAsyncStorage(quizId, endTime) {
        let today = new Date();
        let data = await AsyncStorage.getItem(`${quizId}Date`);
        if (data) {
            data = parseInt(data);
            if (new Date(data) > today) {
                let questionData = await AsyncStorage.getItem(
                    `${quizId}Questions`
                );
                questionData = JSON.parse(questionData);
                setSelectedOptions(questionData);
                let timeData = await AsyncStorage.getItem(`${quizId}Time`);
                timeData = JSON.parse(timeData);
                timeSpent = timeData;
            } else {
                AsyncStorage.multiRemove([
                    `${quizId}Date`,
                    `${quizId}Time`,
                    `${quizId}Questions`,
                ]);
            }
        } else {
            await AsyncStorage.setItem(
                `${quizId}Date`,
                new Date(endTime).getTime().toString()
            );
            await AsyncStorage.setItem(
                `${quizId}Time`,
                JSON.stringify(timeSpent)
            );
            await AsyncStorage.setItem(
                `${quizId}Questions`,
                JSON.stringify(selectedOptions)
            );
        }
        setDataTaken(true);
    }
    useEffect(() => {
        quizAuth.quiz.questions_answers.forEach((questions, index) => {
            totalMarks = totalMarks + questions.question.marks;
            // console.log(index,questions.question.marks,questions.question);
        });
        const backAction = () => {
            Alert.alert("Hold on!", "Are you sure you want to go back??", [
                { text: "Cancel", onPress: () => null, style: "cancel" },
                {
                    text: "Yes!!",
                    onPress: () => {
                        // BackHandler.exitApp();
                        clearInterval(interval);
                        dispatch(setQuizAuth(0));
                    },
                },
            ]);
            return true;
        };
        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );
        timeSpent = new Array(totalQuestions).fill(0);

        // fetchData();
        const interval = setInterval(() => {
            let precise =
                (new Date(quizAuth.quiz.end_time) - new Date()) / 60000;
            let minutes = Math.floor(precise);
            let seconds = Math.floor((precise - minutes) * 60);
            if (minutes == 0 && seconds == 40) {
                Alert.alert("Submit the Quiz!!", "Only Few Seconds left!!");
            }
            if (minutes == 0 && seconds == 2) {
                submitQuiz(0);
            }
            minutes = minutes.toString().padStart(2, "0");
            seconds = seconds.toString().padStart(2, "0");
            setTime("Time Left : " + minutes + ":" + seconds);
        }, 1000);
        return () => {
            backHandler.remove();
            clearInterval(interval);
            timeSpent = [];
            totalMarks = 0;
        };
    }, []);
    useEffect(() => {
        checkAsyncStorage(quizAuth.quizId, quizAuth.quiz.end_time);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            timeSpent[currentQuestion]++;
        }, 1000);
        return () => {
            clearInterval(interval);
        };
    }, [currentQuestion]);
    let selectedAnswers = 0;
    selectedOptions.forEach((ques) => {
        if (ques != null) {
            selectedAnswers++;
        }
    });

    const handleOptionSelect = (questionIndex, optionValue) => {
        const newSelectedOptions = [...selectedOptions];
        if (newSelectedOptions[questionIndex] == optionValue) {
            newSelectedOptions[questionIndex] = null;
        } else {
            newSelectedOptions[questionIndex] = optionValue;
        }
        setSelectedOptions(newSelectedOptions);
    };

    const handleNextQuestion = (num) => {
        setCurrentQuestion((prev) => prev + num);
        setItems();
    };

    function submitQuizAlert() {
        Alert.alert(
            "Are you sure?",
            "Do you want to submit the quiz?",
            [
                { text: "No", onPress: () => null },
                {
                    text: "Yes!",
                    onPress: () => {
                        submitQuiz();
                    },
                },
            ],
            { cancelable: true }
        );
    }

    async function submitQuiz() {
        AsyncStorage.multiRemove([
            `${quizAuth.quizId}Date`,
            `${quizAuth.quizId}Time`,
            `${quizAuth.quizId}Questions`,
        ]);
        let myQuestionsAnswers = [];
        for (
            let index = 0;
            index < quizAuth.quiz.questions_answers.length;
            index++
        ) {
            const element = quizAuth.quiz.questions_answers[index];
            myQuestionsAnswers.push({
                question: element.question._id,
                answer: selectedOptions[index],
                time_spent: timeSpent[index],
                marks: 0,
            });
        }
        let res = await fetch(
            `http://${ipadd.ip}:3000/worker/submitQuiz?token=${auth.token}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    quizId: quizAuth.quizId,
                    questions_answers: myQuestionsAnswers,
                }),
            }
        );
        let data = await res.json();
        if (data.success == 1) {
            Alert.alert(
                "Quiz Submitted Successfully",
                "Your quiz was submitted"
            );
        } else {
            Alert.alert("Invalid Submission", "Your quiz cannot be submitted");
        }
        dispatch(setQuizAuth(0));
    }

    const questionNoBarRef = useRef(null);

    useEffect(() => {
        if (questionNoBarRef.current) {
            const buttonWidth = Dimensions.get("screen").width / 8 + 6;
            const scrollOffset = currentQuestion * buttonWidth;
            questionNoBarRef.current.scrollTo({
                x: scrollOffset,
                animated: true,
            });
        }
    }, [currentQuestion]);
    async function setItems() {
        if (dataTaken) {
            await AsyncStorage.setItem(
                `${quizAuth.quizId}Questions`,
                JSON.stringify(selectedOptions)
            );
            await AsyncStorage.setItem(
                `${quizAuth.quizId}Time`,
                JSON.stringify(timeSpent)
            );
        }
    }
    return (
        <View style={styles.container}>
            <View style={styles.topBar}>
                <View style={styles.topRow}>
                    <View style={styles.quizNameContainer}>
                        <Text style={styles.quizNameText}>{quizName}</Text>
                    </View>
                    <View style={styles.userProfileContainer}>
                        <Image
                            source={{
                                uri: `http://${ipadd.ip}:3000/files/workers/${profile.profile.photo}`,
                            }}
                            style={styles.profileImage}
                        />
                    </View>
                </View>
                <View style={styles.questionInfoContainer}>
                    <Text
                        style={[
                            styles.questionInfoText,
                            {
                                fontWeight: "bold",
                                color: "#27ae60",
                                borderWidth: 1,
                                borderColor: "#333",
                                borderRadius: 5,
                                padding: 5,
                            },
                        ]}
                    >
                        Total Marks : {totalMarks}
                    </Text>
                    {time == 0 ? (
                        <ActivityIndicator size="small" color="#000" />
                    ) : (
                        <Text
                            style={[
                                styles.questionInfoText,
                                {
                                    color: "#3498db",
                                    fontWeight: "bold",
                                    borderWidth: 1,
                                    borderColor: "#333",
                                    borderRadius: 5,
                                    padding: 5,
                                },
                            ]}
                        >
                            {time}
                        </Text>
                    )}
                </View>
            </View>

            <View>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.questionNoBar}
                    ref={questionNoBarRef}
                >
                    {selectedOptions.map((question, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.questionNoButton,
                                ,
                                currentQuestion == index
                                    ? { backgroundColor: "#3498db" }
                                    : selectedOptions[index] == null
                                    ? { backgroundColor: "#f1c40f" }
                                    : { backgroundColor: "#27ae60" },
                            ]}
                            onPress={() => {
                                setCurrentQuestion(index);
                                setItems();
                            }}
                        >
                            <Text style={styles.questionNoText}>
                                {index + 1}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView style={styles.questionContainer}>
                {/* <View style={styles.questionSection}> */}
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                    }}
                >
                    <Text
                        style={[
                            styles.questionNoText,
                            {
                                fontWeight: "bold",
                                color: "#1abc9c",
                                fontSize: 18,
                            },
                        ]}
                    >
                        Question : {currentQuestion + 1}
                    </Text>
                    <Text
                        style={[
                            styles.questionNoText,
                            {
                                fontWeight: "bold",
                                color: "#1abc9c",
                                fontSize: 18,
                            },
                        ]}
                    >
                        Marks :{" "}
                        {
                            quizAuth.quiz.questions_answers[currentQuestion]
                                .question.marks
                        }
                    </Text>
                </View>
                <RenderHTML
                    contentWidth={400}
                    source={{
                        html: quizAuth.quiz.questions_answers[currentQuestion]
                            .question.question,
                    }}
                    tagsStyles={{ p: { fontSize: 20 } }}
                />
                {quizAuth.quiz.questions_answers[
                    currentQuestion
                ].question.files.map((ele) => {
                    return (
                        <View key={ele._id} style={{ marginVertical: 20 }}>
                            <Image
                                source={{
                                    uri: `http://${ipadd.ip}:3000${ele.file}`,
                                }}
                                style={{ height: 150, resizeMode: "contain" }}
                            />
                            <Text style={{ alignSelf: "center" }}>
                                {ele.description}
                            </Text>
                        </View>
                    );
                })}
                {/* </View> */}
            </ScrollView>
            {quizAuth.quiz.questions_answers[currentQuestion].question.type ==
            1 ? (
                <ScrollView style={styles.optionsSection}>
                    {quizAuth.quiz.questions_answers[
                        currentQuestion
                    ].question.options.map((option, index) => (
                        <TouchableOpacity
                            onPress={() => {
                                handleOptionSelect(
                                    currentQuestion,
                                    option.option
                                );
                            }}
                            key={index}
                            style={[
                                styles.optionTouch,
                                selectedOptions[currentQuestion] ==
                                option.option
                                    ? { backgroundColor: "#54b435" }
                                    : null,
                            ]}
                        >
                            <Text style={styles.optionText}>
                                {String.fromCharCode(index + 65)}.{" "}
                                {option.option}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            ) : (
                <View style={styles.optionsSection}>
                    <TextInput
                        placeholder="Your Answer"
                        value={selectedOptions[currentQuestion]}
                        autoCapitalize="characters"
                        onChangeText={(value) => {
                            handleOptionSelect(currentQuestion, value);
                        }}
                        style={{
                            backgroundColor: "#fff",
                            padding: 10,
                            borderRadius: 999,
                        }}
                    />
                </View>
            )}

            <View style={styles.swapQuestion}>
                <TouchableOpacity
                    onPress={() => {
                        if (currentQuestion > 0) {
                            handleNextQuestion(-1);
                        }
                    }}
                >
                    <AntDesign name="leftcircle" size={30} color={"#888888"} />
                </TouchableOpacity>
                <Text
                    style={{
                        fontWeight: "bold",
                        color: "#1abc9c",
                        fontSize: 18,
                    }}
                >
                    Answered : {selectedAnswers} / {totalQuestions}
                </Text>
                <TouchableOpacity
                    onPress={() => {
                        if (currentQuestion < totalQuestions - 1) {
                            handleNextQuestion(1);
                        }
                    }}
                >
                    <AntDesign name="rightcircle" size={30} color={"#888888"} />
                </TouchableOpacity>
            </View>
            <TouchableOpacity
                style={styles.subBtn}
                onPress={() => {
                    submitQuizAlert();
                }}
            >
                <Text style={styles.subBtnText}>Submit Quiz</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
    },
    topBar: {
        padding: 10,
        borderBottomWidth: 1,
        borderColor: "#ccc",
        marginTop: 30,
    },
    topRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    quizNameContainer: {
        flex: 1,
    },
    quizNameText: {
        fontSize: 32,
        fontWeight: "bold",
    },
    userProfileContainer: {
        flexDirection: "row",
        alignItems: "center",
    },
    profileImage: {
        width: 40,
        height: 40,
        borderRadius: 60,
    },
    questionInfoContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    questionInfoText: {
        fontSize: 15,
        fontWeight: "bold",
    },
    questionNoBar: {
        height: -10,
        borderWidth: 1,
        borderColor: "#ccc",
        backgroundColor: "#f5f7f8",
        padding: 2,
    },
    questionNoButton: {
        width: Dimensions.get("screen").width / 8,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 18,
        marginHorizontal: 3,
        backgroundColor: "#fff",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    questionNoText: {
        fontSize: 16,
    },
    questionContainer: {
        flexGrow: 1,
        maxHeight: 370,
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 7,
    },
    questionSection: {
        flex: 2,
        padding: 10,
    },
    questionText: {
        fontSize: 18,
        marginBottom: 10,
    },
    optionsSection: {
        flex: 2,
        paddingHorizontal: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        backgroundColor: "#ecf2f8",
    },
    optionText: {
        fontSize: 20,
    },
    optionTouch: {
        marginVertical: 7,
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 8,
        borderRadius: 999,
        backgroundColor: "#fff",
        shadowColor: "#000",
    },
    swapQuestion: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        padding: 10,
        borderWidth: 1,
        borderColor: "#ccc",
    },
    subBtn: {
        backgroundColor: "green",
        padding: 15,
        alignItems: "center",
    },
    subBtnText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default QuizScreen;
