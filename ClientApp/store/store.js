import { configureStore } from "@reduxjs/toolkit";
import AuthSlice from "./slices/AuthSlice";
import DistrictSlice from "./slices/DistrictSlice";
import SubjectSlice from "./slices/SubjectSlice";
import ModuleSlice from "./slices/ModuleSlice";
import TopicSlice from "./slices/TopicSlice";
import QuizSlice from "./slices/QuizSlice";
import ProfileSlice from "./slices/ProfileSlice";
import QuizAuthSlice from "./slices/QuizAuthSlice";
import CertificateSlice from "./slices/CertificateSlice";
import HistorySlice from "./slices/HistorySlice";

const store = configureStore({
    reducer: {
        auth: AuthSlice,
        districts: DistrictSlice,
        subjects: SubjectSlice,
        modules: ModuleSlice,
        topics: TopicSlice,
        quizzes: QuizSlice,
        profile: ProfileSlice,
        quizAuth: QuizAuthSlice,
        certificates: CertificateSlice,
        history: HistorySlice,
    },
});

export default store;
