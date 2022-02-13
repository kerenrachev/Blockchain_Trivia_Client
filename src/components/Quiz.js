import React, { Component } from "react";
import axios from "axios";
import AdminView from "./AdminView";
import ClientView from "./ClientView";
import { set } from "mongoose";

class Quiz extends Component {
  constructor(props) {
    super(props);

    this.state = {
      quizID: undefined,
      quiz: undefined,
      showComponent: false,
      admin: false,
      client: false,
      data: {
        userName: undefined,
        room: undefined,
        quiz: undefined
      },
    };
  }
  render() {
    return (
      
      <div>{this.state.admin ? <div> <AdminView dataFromParent={this.state.data} /> </div>: <div> {this.state.client ? <div><ClientView dataFromParent={this.state.data} /></div> : this.logToQuiz()} </div> } </div>
      
    );
  }

  logToQuiz() {
    return (
      <form onSubmit={this.enterQuiz}>
        <div class="form-control">
          <br></br>
          <br></br>
          <h3>Please enter your user name and the id of the quiz you want to enter.</h3>
          <h3>If you want to enter as admin, check the option box and fill in the password.</h3>
          <label for="username">Username: &ensp;</label>
          <input
            type="text"
            name="username"
            id="username"
            placeholder="Enter username..."
            required
          />
        </div>
        <br></br>
        <div class="form-control">
          <label for="room">Quiz ID: &ensp;</label>
          <input name="room" id="room" placeholder="Enter id..."></input>
        </div>
        <br></br>
        <div class="form-control">
        <input type="checkbox" id="admin" name="admin" onChange={this.checkboxClicked}></input>
        {this.state.showComponent ? null : <label for="admin">enter as Admin</label>}
        {this.state.showComponent ? <input type="text" name="password" id="password" placeholder="Enter password..."required/> : null}
        </div>
        <br></br>
        <button  class="button-55"  type="submit">
          Start quiz
        </button>
        <h4 id="incorrectPass"> </h4>
      </form>
    );
  }

  checkboxClicked = (event) => {
    this.setState({
			showComponent: !this.state.showComponent
    })

  }

  enterQuiz = async (event) => {
    event.preventDefault();
    let quizId = event.target.elements.room.value;
    let userName = event.target.elements.username.value;
    let res = await axios.get("/quiz", {
      params: {
        ID: quizId,
      },
    });
    if(document.getElementById("admin").checked) {
      let password = document.getElementById("password").value
      if(password === res.data.pass){
        this.setState({
          quiz: res,
          admin: true,
          data: {
            userName: userName,
            room: quizId,
            quiz: res
          },
        });
      } else {
        document.getElementById("incorrectPass").innerHTML = "You entered a wrong password!"
      }
    }
    else {
      this.setState({
        quiz: res,
        client: true,
        data: {
          userName: userName,
          room: quizId,
          quiz: res
        },
      });
    }
  };
}

export default Quiz;
