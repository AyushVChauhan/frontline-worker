
# FrontLine Worker

This project was developed during a hackathon and aimed to create an interactive quiz application tailored for both teachers and students. Leveraging the power of Node.js, Express.js, EJS, and React Native, we crafted a comprehensive solution that fosters engagement and enhances security through face detection.

### 📱 Mobile Experience for Students

Students can access the quiz platform seamlessly on their mobile devices using the React Native framework. The intuitive interface allows them to participate in quizzes, view their scores, and receive detailed analysis of their performance right at their fingertips.

### 🖥️ Web Dashboard for Teachers

Teachers are equipped with a robust web dashboard built with Node.js and Express.js. Here, they can create and manage quizzes, track student progress, and delve into detailed analytics to gain insights into student performance and areas for improvement.

### 🔒 Enhanced Security with Face Detection

To ensure the integrity of the assessment process, we integrated face detection technology into our application. This feature adds an extra layer of security, ensuring that only authorized individuals can access quizzes and preventing any instances of cheating or unauthorized access.

### 👨‍💻 Contributors

[Ayush Chauhan](https://github.com/AyushVChauhan)\
[Harekrushn Tejani](https://github.com/harekrushn13)\
[Khushi Patel](https://github.com/Khushipatel31)\
[Harsh Nirmal](https://github.com/HarshN187)\
[Aheen Solanki](https://github.com/AheenSolanki)

## Run Locally

Node v18.16.1 is required.

```bash
  git clone https://github.com/AyushVChauhan/FrontlineWorker
```

Go to the project directory

```bash
  cd FrontlineWorker
```

Create .env file
```bash
PORT=
JWT_SECRET=
MONGO_URI=
FIREBASE_KEY=(CLOUD MESSAGING KEY)
MAIL_USERNAME=
MAIL_PASSWORD=
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm start
```

Start the application

```bash
  cd ClientApp
  npx expo start
```

