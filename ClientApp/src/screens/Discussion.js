import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    TextInput,
    Button,
    Modal,
    Image,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import ipadd from "../../ipadd";
import { AntDesign, FontAwesome5 } from "@expo/vector-icons";

const Discussion = ({ navigation, route }) => {

    const [comment, setComment] = useState("");
    const [comment2, setComment2] = useState("");
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([]);
    const [modal, setModal] = useState({ commentId: null, state: false });
    const auth = useSelector((state) => state.auth);

    async function refresh() {
        setLoading(true);
        let response = await fetch(
            `http://${ipadd.ip}:3000/worker/getComments?&token=${auth.token}&topicId=${route.params.topicId}`
        );
        let data = await response.json();
        setComments(data.comments);
        setLoading(false);
    }
    useEffect(() => {
        refresh();
    }, []);

    async function newComment() {
        let topicId = route.params.topicId;
        //comment
        let res = await fetch(
            `http://${ipadd.ip}:3000/worker/addComment?token=${auth.token}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    topicId,
                    message: comment,
                }),
            }
        );
        setComment("");
        setComment2("");
        refresh();
    }

    async function replyComment() {
        let topicId = route.params.topicId;
        let replyto = modal.commentId;
        let res = await fetch(
            `http://${ipadd.ip}:3000/worker/addReply?token=${auth.token}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    commentId: replyto,
                    topicId,
                    message: comment2,
                }),
            }
        );
        setModal({ commentId: null, state: false });
        setComment("");
        setComment2("");
        refresh();
    }

    function setCommentId(id) {
        setModal({ commentId: id, state: true });
    }

    const scrollViewRef = useRef(null);
    useEffect(() => {
        refresh().then(() => {
            scrollViewRef.current.scrollToEnd({ animated: true });
        });
    }, []);

    return (
        <View style={styles.container}>
            {loading == true && (
                <ActivityIndicator size={"large"} color={"#000"} />
            )}
            {loading == false && (
                <ScrollView
                    ref={scrollViewRef}
                    style={styles.commentsSection}
                    showsVerticalScrollIndicator={false}
                >
                    {comments.map((ele, index) => (
                        <RenderCard
                            item={ele}
                            key={index}
                            reply={setCommentId}
                        />
                    ))}
                </ScrollView>
            )}

            {
                loading == false && (
                    <View>
                        <TextInput
                            placeholder="Write Comment"
                            onChangeText={(text) => setComment(text)}
                            value={comment}
                            style={styles.commentInput}
                        />
                        <Button state={styles.submitBtn} title="Submit" onPress={newComment} />
                    </View>
                )
            }

            <Modal
                animationType="slide"
                visible={modal.state}
                transparent={true}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalCard}>
                        <TextInput
                            placeholder="Reply Comment"
                            onChangeText={(text) => setComment2(text)}
                            value={comment2}
                            style={styles.replyInput}
                        />
                        <View style={styles.modalHeader}>
                            <Button title="Close" onPress={() => { setModal({ commentId: null, state: false }); }} />
                            <View style={{ flex: 1 }} />
                            <Button title="Submit" onPress={replyComment} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};


function RenderCard({ item, reply }) {
    const [loading, setLoading] = useState(false);

    return (
        <View style={styles.commentContainer}>
            <View style={styles.commentHeader}>
                <Image
                    style={styles.userPhoto}
                    source={{
                        uri: `http://${ipadd.ip}:3000/files/workers/${item.workerId.photo}`,
                    }}
                />
                <View style={styles.commentInfo}>
                    <Text style={styles.username}>@{item.workerId.username}</Text>
                    <Text style={styles.date}>
                        {new Date(item.createdAt).toLocaleString()}
                    </Text>
                </View>
            </View>

            <Text style={styles.commentText}>{item.content}</Text>

            <View style={{flexDirection: "row", justifyContent:"space-between"}}>
                {item.replies.length >= 0 && (
                    <View style={styles.repliesContainer}>
                        <TouchableOpacity
                            style={styles.viewRepliesButton}
                            onPress={() => setLoading((prev) => !prev)}
                        >
                            <AntDesign name="caretdown" />
                            <Text style={styles.viewRepliesText}>{item.replies.length} replies</Text>
                        </TouchableOpacity>

                        <View style={{display: !loading ? "none" : "flex" }}>
                            {item.replies.map((ele) => {
                                let photo = null;
                                let username = null;
                                if (ele.workerId) {
                                    photo = ele.workerId.photo;
                                    username = ele.workerId.username;
                                }
                                else {
                                    photo = "icon.png";
                                    username = ele.administrationId.username;
                                }
                                return (
                                    <View style={styles.replyContainer} key={ele._id}>
                                        <View style={styles.commentHeader}>
                                            <Image
                                                style={styles.userPhoto}
                                                source={{
                                                    uri: `http://${ipadd.ip}:3000/files/workers/${photo}`,
                                                }}
                                            />
                                            <View style={styles.commentInfo}>
                                                <Text style={styles.username}>@{username}</Text>
                                                <Text style={styles.date}>
                                                    {new Date(ele.createdAt).toLocaleString()}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text style={styles.commentText}>{ele.content}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                )}

                <TouchableOpacity style={styles.replyButton} onPress={() => reply(item._id)}>
                    <FontAwesome5 name='reply' style={styles.replyicon} />
                    <Text style={styles.replyButtonText}>Reply</Text>
                </TouchableOpacity>

            </View>

        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    commentInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 8,
        marginBottom: 16,
    },
    commentsSection: {
        marginBottom: 16,
        borderTopWidth: 1,
        borderBottomWidth: 1,
    },
    submitBtn: {
        marginBottom: 10,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.5)",
    },
    modalCard: {
        backgroundColor: "#fff",
        width: "70%",
        padding: 20,
        borderRadius: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 16,
    },
    replyInput: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 8,
        marginBottom: 16,
    },
    commentView: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
    },
    userPhoto: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 16,
    },
    commentContainer: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
    },
    commentHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
    },
    commentInfo: {
        marginLeft: 8,
        flexDirection: "row"
    },
    username: {
        fontWeight: "bold",
    },
    date: {
        color: "#777",
        marginLeft: 8,
        fontSize: 10,
        marginTop: 4,
    },
    commentText: {
        marginBottom: 8,
        marginTop: "-5%",
        marginLeft: 75,
        fontWeight: "bold",
        fontSize: 16,
    },
    replyButton: {
        backgroundColor: "#e1e1e1",
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 4,
        width: 80,
        flexDirection: "row",
        justifyContent: "space-evenly",
        zIndex: 10,
        maxHeight: 35,
        marginLeft: "-30%"
    },
    replyicon: {
        verticalAlign: "middle",
    },
    replyButtonText: {
        fontWeight: "bold",
    },
    repliesContainer: {
        marginTop: 8,
    },
    viewRepliesButton: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 8,
        marginLeft: 75,
    },
    viewRepliesText: {
        marginLeft: 8,
    },
    replyContainer: {
        marginTop: 8,
        marginLeft: 8,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 8,
        padding: 10,
    },
});
export default Discussion;
