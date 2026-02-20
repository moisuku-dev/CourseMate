const express = require('express');
const app = express();
const cors = require('cors');

const placeRouter = require('./routes/placeRouter');
const reviewRouter = require('./routes/reviewRouter');
const userRouter = require('./routes/user_router');
const adminRouter = require('./routes/adminRouter');
const communityRouter = require('./routes/communityRouter');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우터 등록
app.use('/api/places', placeRouter);
app.use('/api/reviews', reviewRouter);
app.use('/api/users', userRouter);
app.use('/api/admin', adminRouter);
app.use('/api/community', communityRouter);

app.get('/', (req, res) => {
    res.send('CourseMate Server is running...');
});

// 5. 서버 실행
const port = 3000;
app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`   - Places:    http://localhost:${port}/api/places`);
    console.log(`   - Reviews:   http://localhost:${port}/api/reviews`);
    console.log(`   - Users:     http://localhost:${port}/api/users`);
    console.log(`   - Admin:     http://localhost:${port}/api/admin`);
    console.log(`   - Community: http://localhost:${port}/api/community`);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});