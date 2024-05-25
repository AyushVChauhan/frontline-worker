import { View, Text, Modal, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { Camera } from "expo-camera";
import * as FaceDetector from "expo-face-detector";

const CameraModal = ({ visible, setVisible, setFileURI }) => {
    const [permission, setPermission] = useState(false);
    const cameraRef = useRef(null);
    const [faceData, setFaceData] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        requestPermission();
    }, []);

    async function requestPermission() {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setPermission(status === "granted");
    }
    async function takePhoto(faces) {
        if (cameraRef.current) {
            const photo = await cameraRef.current.takePictureAsync({});
            faceData.push({
                faceID: faces[0].faceID,
                picture: photo.uri,
            });
            setFaceData([...faceData]);
        }
    }
    function faceDetection({ faces }) {
        // console.log(faces);
        if (faces.length == 1) {
            setError("Hold your camera still");
            if (faceData.length == 0) {
                takePhoto(faces);
            } else if (faceData.length <= 2) {
                if (faceData[faceData.length - 1].faceID == faces[0].faceID) {
                    takePhoto(faces);
                } else {
                    setFaceData([]);
                }
            }
        } else {
            setError("Show your face!!");
        }
    }

    useEffect(() => {
        if (faceData.length == 3) {
            setFileURI(faceData);
            setFaceData([]);
            setVisible();
        }
    }, [faceData]);

    let component = null;
    if (permission) {
        component = (
            <Camera
                style={styles.camera}
                type={Camera.Constants.Type.front}
                onFacesDetected={faceDetection}
                faceDetectorSettings={{
                    mode: FaceDetector.FaceDetectorMode.accurate,
                    detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
                    runClassifications:
                        FaceDetector.FaceDetectorClassifications.none,
                    minDetectionInterval: 5000,
                    tracking: true,
                }}
                ref={cameraRef}
            ></Camera>
        );
    } else {
        component = <Text>Please Grant Permission</Text>;
    }
    return (
        <Modal transparent={true} animationType="slide" visible={visible}>
            <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>{component}</View>
                <View style={styles.infoContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    {error == "Hold your camera still" && <ActivityIndicator size={"large"} color={"#000"}/>}
                    <TouchableOpacity
                        onPress={() => {
                            setFaceData([]);
                            setVisible();
                        }}
                        style={styles.closeButton}
                    >
                        <Text style={styles.buttonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalBackground: {
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        height: "100%",
    },
    modalContainer: {
        overflow: "hidden",
        width: "80%",
        height: "50%",
        alignSelf: "center",
        marginTop: 50,
    },
    camera: {
        flex: 1,
    },
    infoContainer: {
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#fff",
        width: "80%",
        alignSelf: "center",
        paddingTop: 50,
        paddingBottom: 50,
    },
    errorText: {
        fontSize: 30,
        color: "red",
    },
    button: {
        marginTop: 20,
        padding: 10,
        backgroundColor: "#007AFF",
        borderRadius: 10,
    },
    closeButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: "red",
        borderRadius: 10,
    },
    buttonText: {
        color: "white",
        fontSize: 18,
    },
});

export default CameraModal;
