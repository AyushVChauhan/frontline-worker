async function sendPushNotification(userToken, title, message) {
	const apiKey = process.env.FIREBASE_KEY;
	const fcmEndpoint = "https://fcm.googleapis.com/fcm/send";

	const notificationMessage = {
		registration_ids: userToken,
		notification: {
			title,
			body: message,
		},
	};

	let response = await fetch(fcmEndpoint, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: "key=" + apiKey,
		},
		body: JSON.stringify(notificationMessage),
	});
	let data = await response.json();
	// console.log(data);
}
module.exports = sendPushNotification;
