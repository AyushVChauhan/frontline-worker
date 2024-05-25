import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Button, Image, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { Picker } from "@react-native-picker/picker";
import * as ImagePicker from "expo-image-picker";
import ipadd from "../../ipadd";
import { useDispatch, useSelector } from "react-redux";
import { setDistricts } from "../../store/slices/DistrictSlice";
import * as FileSystem from "expo-file-system";
import mime from "mime";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAuth } from "../../store/slices/AuthSlice";
import CameraModal from "./CameraModal";
import * as Application from "expo-application";

const SignUpScreen = ({ navigation }) => {
	const dispatch = useDispatch();
	const districts = useSelector((state) => state.districts);
	const auth = useSelector((state) => state.auth);
	async function fetchData() {
		let res = await fetch(`http://${ipadd.ip}:3000/worker/getdistrict`);
		let data = await res.json();
		dispatch(setDistricts(data));
	}

	useEffect(() => {
		fetchData();
	}, []);

	const [fdata, setFdata] = useState({
		username: "",
		password: "",
		name: "",
		email: "",
		districtId: "",
		phone: "",
		dateOfBirth: new Date(),
		aadharCard: "",
		photo: "",
		myPhoto: [],
		phototype: "",
		androidId: null,
	});
	const [date, setDate] = useState({
		day: fdata.dateOfBirth.getDate(),
		month: fdata.dateOfBirth.getMonth() + 1,
		year: fdata.dateOfBirth.getFullYear(),
	});
	const [sdate, setSdate] = useState(false);
	const [errormsg, setErrormsg] = useState(null);
	const [visible, setVisible] = useState(false);

	const handleInput = (field, value) => {
		setFdata({
			...fdata,
			[field]: value,
		});
	};
	const addPhoto = (arr) => {
		arr.forEach((ele) => {
			fdata.myPhoto.push(ele.picture);
		});
		setFdata({ ...fdata });
	};

	const checkValidation = () => {
		const fullNameRegex = /^[a-zA-Z]+ [a-zA-Z]+$/;
		if (!fullNameRegex.test(fdata.name)) {
			setErrormsg("Please enter a valid name !");
			return true;
		}

		const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
		if (!emailRegex.test(fdata.email)) {
			setErrormsg("Please enter a valid email address !");
			return true;
		}

		const mobileRegex = /^(\+\d{1,3}[- ]?)?\d{10}$/;
		if (!mobileRegex.test(fdata.phone)) {
			setErrormsg("Please enter a valid mobile !");
			return true;
		}

		// const aadharCardRegex = /^[2-9][0-9]{3} [0-9]{4} [0-9]{4}$/;
		// if (!aadharCardRegex.test(fdata.aadharCard)) {
		//     setErrormsg("Please enter a valid aadhar card !");
		//     return true;
		// }

		// const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,10}$/;
		// if (!passwordRegex.test(fdata.password)) {
		//     setErrormsg("Minimum 8 and maximum 10 char, at least 1 uppercase and lowercase letter, one number and one special character Required !");
		//     return true;
		// }

		return false;
	};

	const handleSignUp = async () => {
		if (
			fdata.username == "" ||
			fdata.password == "" ||
			fdata.name == "" ||
			fdata.email == "" ||
			fdata.aadharCard == "" ||
			fdata.districtId == "" ||
			fdata.phone == "" ||
			fdata.dateOfBirth == "" ||
			fdata.photo == "" ||
			fdata.myPhoto == []
		) {
			setErrormsg("All fields are required !");
			return;
		}

		let checkError = checkValidation();
		if (checkError) {
			return;
		}
		fdata.androidId = Application.androidId;
		console.log(fdata.androidId);

		let response = await FileSystem.uploadAsync(`http://${ipadd.ip}:3000/worker/workerSignup`, fdata.photo, {
			fieldName: "photo",
			httpMethod: "POST",
			uploadType: FileSystem.FileSystemUploadType.MULTIPART,
			parameters: { data: JSON.stringify({ ...fdata, pushToken: auth.FCM }) },
		});
		let data = JSON.parse(response.body);
		console.log(data);
		if (data.success == 1) {
			let workerId = data.user;
			let success = 0;
			for (let index = 0; index < fdata.myPhoto.length; index++) {
				const element = fdata.myPhoto[index];
				let response = await FileSystem.uploadAsync(
					`http://${ipadd.ip}:3000/worker/workerPhoto?workerId=${workerId}`,
					element,
					{
						fieldName: "photo",
						httpMethod: "POST",
						uploadType: FileSystem.FileSystemUploadType.MULTIPART,
					}
				);
				let data = JSON.parse(response.body);
				console.log(data.success);
				if (data.success == 1) {
					success++;
				}
			}
			if (success >= fdata.myPhoto.length) {
				AsyncStorage.setItem(
					"data",
					JSON.stringify({
						token: data.token,
						username: fdata.username,
						password: fdata.password,
					})
				);
				dispatch(
					setAuth({
						token: data.token,
						username: fdata.username,
						password: fdata.password,
					})
				);
			} else {
				handleInput("myPhoto", []);
				setErrormsg("Invalid Photos");
			}
		} else {
			setErrormsg(data.message);
		}
		// }
	};

	const pickImage = async () => {
		const result = await ImagePicker.launchImageLibraryAsync({
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			allowsEditing: true,
			aspect: [1, 1],
			quality: 1,
			allowsMultipleSelection: false,
		});

		if (!result.canceled) {
			setFdata({
				...fdata,
				photo: result.assets[0].uri,
				phototype: result.assets[0].type,
			});
		}
		console.log(result);
	};

	const navigateToLogin = () => {
		navigation.navigate("Login");
	};

	return (
		<ScrollView contentContainerStyle={styles.scrollContainer}>
			<View style={styles.container}>
				<View style={styles.formContainer}>
					<Text style={styles.heading}>Sign Up</Text>
					<TextInput
						placeholder="Username"
						onChangeText={(text) => handleInput("username", text)}
						onFocus={() => setErrormsg(null)}
						value={fdata.username}
						style={styles.input}
					/>
					<TextInput
						placeholder="Full Name"
						onChangeText={(text) => handleInput("name", text)}
						onFocus={() => setErrormsg(null)}
						value={fdata.fullName}
						style={styles.input}
					/>
					<View style={styles.pickerContainer}>
						<Picker
							selectedValue={fdata.districtId}
							onValueChange={(itemValue, itemIndex) => {
								handleInput("districtId", itemValue);
							}}
							style={styles.picker}
							placeholder="Select a District"
						>
							{districts.districts.map((district, index) => (
								<Picker.Item label={district.name} value={district._id} key={index} />
							))}
						</Picker>
					</View>
					<TextInput
						placeholder="Email"
						onChangeText={(text) => handleInput("email", text)}
						onFocus={() => setErrormsg(null)}
						value={fdata.email}
						style={styles.input}
					/>
					<Text>DOB:</Text>
					<View style={{ display: "flex", flexDirection: "row" }}>
						<TextInput
							placeholder="DD"
							onFocus={() => setErrormsg(null)}
							value={date.day.toString()}
							onChangeText={(text) => {
								setDate((prev) => ({ ...prev, day: text }));
								handleInput("dateOfBirth", new Date(date.year, date.month, text));
							}}
							style={{ ...styles.input, width: "25%" }}
						/>
						<TextInput
							style={{ ...styles.input, width: "25%" }}
							placeholder="MM"
							onFocus={() => setErrormsg(null)}
							value={date.month.toString()}
							onChangeText={(text) => {
								setDate((prev) => ({ ...prev, month: text }));
								handleInput("dateOfBirth", new Date(date.year, text, date.day));
							}}
						/>
						<TextInput
							style={{ ...styles.input, width: "50%" }}
							placeholder="YYYY"
							onFocus={() => setErrormsg(null)}
							value={date.year.toString()}
							onChangeText={(text) => {
								setDate((prev) => ({ ...prev, year: text }));
								handleInput("dateOfBirth", new Date(text, date.month, date.day));
							}}
						/>
					</View>

					<TextInput
						placeholder="Mobile No."
						onChangeText={(text) => handleInput("phone", text)}
						onFocus={() => setErrormsg(null)}
						value={fdata.phone}
						style={styles.input}
					/>
					<TextInput
						placeholder="Aadhar Card No."
						onChangeText={(text) => handleInput("aadharCard", text)}
						onFocus={() => setErrormsg(null)}
						value={fdata.aadharCard}
						style={styles.input}
					/>
					<TextInput
						placeholder="Password"
						onChangeText={(text) => handleInput("password", text)}
						onFocus={() => setErrormsg(null)}
						value={fdata.password}
						secureTextEntry
						style={styles.input}
					/>

					{fdata.photo && <Image source={{ uri: fdata.photo }} style={styles.photo} />}

					<View style={styles.uploadPhoto}>
						<Text style={{ alignSelf: "center" }}>Upload Your Passport Size Photo Only</Text>
						<TouchableOpacity style={styles.uploadButton} onPress={pickImage}>
							<Text style={styles.buttonText}>Upload Photo</Text>
						</TouchableOpacity>
					</View>

					<CameraModal
						visible={visible}
						setVisible={() => {
							setVisible(false);
						}}
						setFileURI={(arr) => {
							addPhoto(arr);
						}}
					/>

					{errormsg && <Text style={styles.errorText}>{errormsg}</Text>}
					<TouchableOpacity
						style={styles.signupButton}
						onPress={() => {
							let checkError = checkValidation();
							if (checkError) {
								setVisible(false);
								return;
							} else if (fdata.myPhoto.length >= 3) {
								handleSignUp();
							} else {
								setVisible(true);
							}
						}}
					>
						<Text style={styles.buttonText}>Sign Up</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.loginContainer}>
					<Text style={styles.loginText}>Already have an account?</Text>
					<TouchableOpacity onPress={navigateToLogin}>
						<Text style={styles.loginLink}>Log In</Text>
					</TouchableOpacity>
				</View>
			</View>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	scrollContainer: {
		flexGrow: 1,
		backgroundColor: "#f0f0f0",
	},
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#f0f0f0",
	},
	formContainer: {
		backgroundColor: "white",
		padding: 20,
		borderRadius: 10,
		shadowColor: "black",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.2,
		shadowRadius: 4,
		elevation: 5,
		width: "80%",
	},
	heading: {
		fontSize: 24,
		fontWeight: "bold",
		marginBottom: 20,
		textAlign: "center",
	},
	input: {
		width: "100%",
		height: 40,
		borderWidth: 1,
		borderColor: "#ccc",
		marginBottom: 15,
		padding: 10,
		borderRadius: 5,
	},
	dobContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		width: "100%",
		height: 46,
		borderWidth: 1,
		borderColor: "#ccc",
		marginBottom: 15,
		padding: 10,
		borderRadius: 5,
	},
	dobinput: {
		flex: 1,
		color: "#000",
	},
	calendaricon: {
		width: 40,
		height: "100%",
	},
	picker: {
		width: "100%",
		height: 40,
		borderWidth: 1,
		borderColor: "#ccc",
		marginBottom: 15,
		padding: 5,
		borderRadius: 5,
	},
	pickerContainer: {
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 5,
		marginBottom: 15,
	},
	uploadPhoto: {
		width: "100%",
		borderWidth: 1,
		borderColor: "#ccc",
		padding: 10,
		borderRadius: 5,
	},
	photo: {
		width: 100,
		height: 100,
		marginBottom: 15,
	},
	signupButton: {
		backgroundColor: "green",
		padding: 15,
		borderRadius: 5,
		alignItems: "center",
		marginTop: 15,
	},
	buttonText: {
		color: "white",
		fontSize: 18,
	},
	loginContainer: {
		marginTop: 20,
		flexDirection: "row",
		justifyContent: "center",
	},
	loginText: {
		fontSize: 16,
		marginRight: 5,
	},
	loginLink: {
		fontSize: 16,
		fontWeight: "bold",
		color: "blue",
	},
	errorText: {
		color: "red",
		fontSize: 16,
		marginTop: 10,
		textAlign: "center",
	},
	uploadButton: {
		backgroundColor: "#3498db",
		padding: 5,
		borderRadius: 5,
		alignItems: "center",
		marginTop: 10,
	},
});

export default SignUpScreen;
