import React from 'react';
import axios from 'axios';
import Dashboard from './Dashboard/Dashboard';
import moment from 'moment';

let configs = {};
process.env.NODE_ENV === 'development' ? configs = require('../../../devClient_config') : configs = require('../../../client_config');

class SlackDashboard extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            // users list - state
            usersalldb : [],
            usertoken : [],
            // caeldnar  % general db
            dashDb : [],
            // today date
            toDate : new Date(),
        }
    }
    // ---------- ---------- ---------- ---------- ---------- ---------- ----------
    // ---------- user Token verify & Mount & axios ---------- 
    async componentDidMount(){
        await this.setState({
            usertoken : await this.props.Token,
        })
        await this.userListApi();   // user List Api
    }
    // ---------- ---------- ---------- ---------- ---------- ---------- ----------
    // ---------- ---------- ---------- ---------- ---------- ---------- ----------
    // ---------- user List Api ----------
    async userListApi(){
        try {
            const result = await axios.get(`${configs.domain}/user/all`);
            this.setState({
                usersalldb : result.data,
            });
            
        } catch(err){
            console.log("user List Api err : " + err);
        }
    }
    // ---------- calendar / general Api & Render----------
    dataTextTime(time) {
        let userTime
        let dayArr = [];
        if(/~/.test(time)) {
            dayArr = time.split("~")
            if(moment(dayArr[1]).diff(dayArr[0], "days") === 0) {
                dayArr[0] = moment(moment(dayArr[0], "YYYY-MM-DD")).format("M. D(ddd)")
                userTime = dayArr[0]
            } else {
                dayArr[0] = moment(moment(dayArr[0], "YYYY-MM-DD")).format("M. D(ddd)~")
                dayArr[1] = moment(moment(dayArr[1], "YYYY-MM-DD")).format("M. D(ddd)")
                userTime = dayArr[0] + dayArr[1]
            }
        } else if(/,/.test(time)) {
            dayArr = /\d{4}-\d{2}-(\d{2}(,?\d{2}?)+)/.exec(time);
            userTime = dayArr[1];
        } else {
            userTime = moment(time).format("M. D(ddd)")
        }
        return userTime;
    }
    dataStateSwich(state) {
        let userState = "";
        switch(state) {
            case "휴가관련" : userState = configs.colors[2]; break;
            case "출장 / 미팅" : userState = configs.colors[0]; break;
            case "회의" : userState = configs.colors[1]; break;
            case "생일" : userState = configs.colors[3]; break;
            case "기타" : userState = configs.colors[4]; break;
            default : break;
        }
        return userState;
    }
    // ---------- ---------- ---------- ---------- ---------- ---------- ----------
    // ---------- ---------- ---------- ---------- ---------- ---------- ----------
    // ---------- rendering ---------- 
    render () {
        const { dashData } = this.props;
        return (
            <div className="dash-boardDiv">
                {
                    dashData.map((data,i)=>{
                        return <Dashboard key={i}
                            title={data.title ? data.title : data.cate}
                            partner={data.partner ? data.user.username + data.partner.map((data,i)=>{ return i !== 0 ? data.username : "," + data.username}) : data.user.username}
                            textTime={this.dataTextTime.bind(this,data.time)}
                            color={this.dataStateSwich.bind(this,data.state)}
                        />
                    })
                }
            </div>
        );
    }
}

export default SlackDashboard;