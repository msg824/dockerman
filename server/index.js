// -------------------- require list --------------------
const express = require('express');
const app = express();
const models = require("./models");
const user_router = require("./route/user");
const chat_router = require("./route/slackchat");
const slack_router = require("./route/slackapi");
const holiday_router = require("./route/holiday");
const axios = require("axios");
// const crypto = require("crypto");
let jwt = require("jsonwebtoken");
let configs = require('./server_config');
const moment = require('moment');
const cron = require('node-cron');

// -------------------- 초기 서버 ( app ) 설정 --------------------
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "https://slack.com");
    res.header("Access-Control-Allow-Origin", "http://localhost:3000");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token");
    next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// DB
app.use("/user", user_router);
app.use("/slack", chat_router);
app.use("/holiday", holiday_router);
// API
app.use("/slackapi", slack_router);
// Default
app.get('/', (req, res) => {
    // [준명] 3월 1일 or 1,2,3일 or 11월27일~12월 3일 휴가/병가/오전/오후반차/예비군/병원/동원/개인사유
    // 출근/ㅊㄱ/퇴근/ㅌㄱ/야근/외근/ooㅇㄱ/10시20분출근/7시퇴근/
    let holiday = //;
    console.log(text);
    
    let times = //;
    console.log(text);

    res.send("Hello SlackApi World!");
});

// -------------------- 초기 포트 및 서버 실행 --------------------
const PORT = process.env.PORT || 5000;
models.sequelize.query("SET FOREIGN_KEY_CHECKS = 1", {raw: true})
.then(() => {
    models.sequelize.sync({ force:false }).then(()=>{
        app.listen(PORT, async() => {
            console.log(`app running on port ${PORT}`);
            try {
                await axios.get("http://localhost:5000/slackapi/teamUsers");

                // < 데이터 없을 때 초기 설정 (일회성) >
                // await axios.post("http://localhost:5000/slackapi/channelHistoryInit", {
                //     channel : "CS7RWKTT5",
                // });

                // < 현재 시간의 date string >
                let nowtimeString = new Date();
                nowtimeString = moment().format('HH:mm')
                console.log('현재 시간 : ', nowtimeString);

                // < 서버 스케줄러 >
                if (nowtimeString > '09:00' && nowtimeString < '19:00') {
                    cron.schedule('*/10 * * * *', async() => {
                        console.log('10분 마다 실행', moment(new Date()).format('MM-DD HH:mm'));
                        await axios.post("http://localhost:5000/slackapi/channelHistory", {
                            channel : "CS7RWKTT5",
                        });
                      });
                } else {
                    cron.schedule('*/2 * * *', async() => {
                        console.log('2시간 마다 실행', moment(new Date()).format('MM-DD HH:mm'));
                        await axios.post("http://localhost:5000/slackapi/channelHistory", {
                            channel : "CS7RWKTT5",
                        });
                      });
                }
                
            } catch(err){
                console.log("app running err ( sql db created ) : " + err);
            }
        });
    });
})

// -------------------- slack 연동 login & access p_token created --------------------
app.get('/login', async(req, res) => {
    try {
        const result = await axios.get("https://slack.com/oauth/authorize",{
            params : {
                scope : 'chat:write:user,users:read',
                client_id : configs.c_id,
                redirect_uri : "http://localhost:3000",
            }
        });
        res.send(result.data);
    } catch(err) {
        console.log("login trying err : " + err);
    }
});

app.get('/login-access', async(req,res) => {
    try {
        const result = await axios({
            method : "get",
            url : "https://slack.com/api/oauth.access",
            params : {
                client_id : configs.c_id,
                client_secret : configs.c_s_id,
                code : req.query.code,
                redirect_uri : "http://localhost:3000",
            }
        });
        await axios.put("http://localhost:5000/user/update",{
            userid : result.data.user_id,
            p_token : result.data.access_token,
        });
        const usertoken = getToken(result.data);

        res.send(usertoken);
    } catch(err) {
        console.log("login access err : " + err);
    }
});
// -------------------- ********** --------------------

// -------------------- token sign & token verify--------------------
function getToken(data){
    try {
        const getToken = jwt.sign({
            userid : data.user_id
        },
            configs.secretKey,
        {
            expiresIn : '600m'
        });
        return getToken;
    } catch(err) {
        console.log("token sign err : " + err);
    }
}

app.get('/verify', (req,res)=>{
    try {
        const token = req.headers['x-access-token'] || req.query.token;
        const getToken = jwt.verify(token, configs.secretKey);
        console.log("token verify");
        res.send(getToken);
    } catch(err) {
        console.log("token verify Api err " + err);
        res.send("err");
    }
});
// -------------------- ********** --------------------