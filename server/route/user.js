//  ------------------------------------- First Setting -------------------------------------
const express = require("express");
const router = express.Router();
const models = require("../models");
const moment = require('moment');
const axios = require('axios');

// DB Setting --------------------
const User = models.user;
const Op = models.Sequelize.Op;

const stateQuery = "select max(id), state from users group by state";
// ------------------------------------- DB CRUD -------------------------------------

let configs = {};
process.env.NODE_ENV === 'development' ? configs = require('../devServer_config') : configs = require('../server_config');

// DB SelectAll --------------------
router.get("/all", async(req, res) => {
    try {
        const result = await User.findAll();
        res.send(result);
    } catch(err) {
        console.log("select users all err : " + err);
        res.end();
    }
});

// DB 유저 찾기 --------------------
router.get("/searchuser", async(req, res) => {
    try {
        const result = await User.findAll({
            where : {
                username : {
                    [Op.like] : "%" + req.query.username + "%"
                }
            }
        });
        res.send(result);
    } catch(err) {
        console.log("select users all err : " + err);
        res.end();
    }
});

// DB SelectAll 지각자 체크 --------------------
router.get("/stateall", async(req, res) => {
    let state = req.query.state;
    try {
        const result = await User.findAll({
            where : {
                state : state,
            }
        });
        res.send(result);
    } catch(err) {
        console.log("select users all err : " + err);
        res.end();
    }
});

// DB SelectOne --------------------
router.get("/one", async(req, res) => {
    try {
        const result = await User.findOne({
            where : {
                id : req.query.userid
            }
        });
        res.send(result);
    } catch(err) {
        console.log("select user one err : " + err);
        res.end();
    }
});

// DB Select State --------------------
router.get("/state", async(req, res) => {
    try {
        let result = await models.sequelize.query(stateQuery, { type : models.sequelize.QueryTypes.SELECT ,raw : true})
        res.send(result);
    } catch (err){
        console.log("select user one err : " + err);
        res.end();
    }
});

// DB FineOrCreate --------------------
router.post("/create", async(req, res) => {
    let result = false;
    try{
        await User.findOrCreate({
            where : {
                id : req.body.userid,
            },
            defaults : {
                id : req.body.userid,
                username: req.body.username, 
            }
        }).spread((none, created)=>{
            if(created){
                result = true;
            }
        });
    }catch(err) {
        console.error("created user err : " + err);
        res.end();
    }
    res.send(result);
});

// DB Update --------------------
router.put("/update", async(req, res) => {
    let result = null;
    try {
        await User.update({ 
            id : req.body.userid,
            username: req.body.username,
            useremail: req.body.useremail, 
            userphone : req.body.userphone,
            usertag : req.body.usertag,
            p_token : req.body.p_token,
            state : req.body.state,
            userchannel : req.body.userchannel,
            holidaycount : req.body.holidaycount,
            }, {
            where: {
                id : req.body.userid
            }
        });
        result = true;
    } catch(err) {
        console.error("user update err : " + err);
        result = false;
    }
    console.log("update : " + result);
    res.send(result);
});

// DB Update --------------------
router.put("/updatesh", async(req, res) => {
    let result = null;
    try {
        await User.update({ 
            state : req.body.state,
            holidaycount : req.body.holidaycount,
            }, {
            where: {
                id : req.body.userid
            }
        });
        result = true;
    } catch(err) {
        console.error("user update err : " + err);
        result = false;
    }
    console.log("update : " + result);
    res.send(result);
});

// DB Delete --------------------
router.delete("/delete", async(req, res) => {
    try {
        let result = await User.destroy({
            where: {
                id: req.query.userid
            }
        });
        res.send(result);
    } catch(err) {
        console.log("delete user err : " + err);
        res.end();
    }
});

// Module Exports --------------------
module.exports = router;