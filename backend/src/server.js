"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const questionnaireRoutes_1 = __importDefault(require("./routes/questionnaireRoutes"));
const marksRoutes_1 = __importDefault(require("./routes/marksRoutes"));
const fileRoute_1 = __importDefault(require("./routes/fileRoute"));
dotenv_1.default.config();
const app = (0, express_1.default)();
mongoose_1.default
    .connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Log all incoming requests
app.use((req, res, next) => {
    console.log(`Received ${req.method} request to ${req.path}`);
    next();
});
app.use('/api/auth', authRoutes_1.default);
app.use('/api/questionnaire', questionnaireRoutes_1.default);
app.use('/api/marks', marksRoutes_1.default);
app.use('/api/files', fileRoute_1.default);
app.get('/', (req, res) => {
    res.send('Server is running');
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
