import React, { Component } from "react";
const io = require("socket.io-client");

class AdminView extends Component {
  constructor(props) {
    super(props);
    this.socket =  io('https://kmcblockchain.herokuapp.com/')
    this.quiz = this.props.dataFromParent.quiz.data;
    //console.log("the quizzzz:"+this.quiz)
    this.state = {
      viewTimerEnded: false,
      waitingLobby: false,
      admin: false,
      currQuestion: -1,
      quizEnded: false,
    };
  }
  render() {
    console.log("quiz" + this.quiz);
    return (
      <>
     
        <div>
          <h3>Username:</h3>
          <h4 id="username">{this.props.dataFromParent.userName}</h4>
          <h3>Quiz ID:</h3>
          <h4 id="room">{this.props.dataFromParent.room}</h4>
          <h3>Users in quiz:</h3>
          <ul id="users"></ul>
          <h1 id="timer"></h1>
          {this.state.waitingLobby ? (
            <div>
              <form onSubmit={this.launchQuiz}>
                 <button  class="button-55"  type="submit" value="launch quiz" id="submit">Launch quiz</button> 
              </form>
            </div>
          ) : (
            <div>
              <div>
                {Number(this.state.currQuestion) > -1 ? (
                  <div>
                    {this.state.viewTimerEnded
                      ? (
                        this.state.quizEnded ? <div> <h1> Quiz Ended </h1></div>
                       :
                      this.renderNewQuestion())
                      : null}
                  </div>
                ) : (
                  <div>{this.startQuiz()}</div>
                )}
              </div>

              {this.state.viewTimerEnded ? <div>
                <h1>BEST SCORES:</h1>
                <ul id="bestUsers"></ul>
                </div> : null}
            </div>
          )}
          <div>
            <h3 id="titlaDiv"></h3>
            <br></br>
            <div id="questionDiv" class="questionDiv" hidden="true">
            <h2 id="q"></h2>
            <h2 id="a1"></h2>
            <h2 id="a2"></h2>
            <h2 id="a3"></h2>
            <h2 id="a4"></h2>

            </div>
            <br></br>
          </div>
        </div>
        
      </>
    );
  }

  askToPayAndStartSockets = (event) => {
    // If you are not an admin - First here need to pay coins to participate
    event.preventDefault();
    this.username = document.getElementById("username").innerText;
    this.room = document.getElementById("room").innerText;
    this.roomName = document.getElementById("room-name");
    this.userList = document.getElementById("users");

    let username = this.username;
    let room = this.room;
    let address = "garbageAddress";
    this.socket.emit("joinRoom", { username, room, address });
    this.socket.emit("startQuizInRoom", { username, room });

    this.socket.on("roomUsers", ({ room, users }) => {
      this.outputUsers(users);
    });
    this.socket.on("BestUsersList", ({ room, bestUsers }) => {
      for (var i = 0; i < bestUsers.length; i++) {
        let bestUsersList = document.getElementById("bestUsers");
        const li = document.createElement("li");
        li.innerText = bestUsers[i].username + " Score: " +bestUsers[i].score;
        bestUsersList.appendChild(li);
    }
    });
    this.socket.on("renderNextQuestionForRoom", ({ room, currQ }) => {
      this.setState({ 
        viewTimerEnded: false,
      })
      let timeForQue = 4;
      let seconds = timeForQue;
      document.getElementById("timer").innerHTML = seconds;
      this.timerIntervalFunc = setInterval(this.timeInterval, 1000);
     

      let q = this.quiz.questions[currQ].q;
      let a1 = this.quiz.questions[currQ].a1;
      let a2 = this.quiz.questions[currQ].a2;
      let a3 = this.quiz.questions[currQ].a3;
      let a4 = this.quiz.questions[currQ].a4;
      document.getElementById("titlaDiv").innerHTML = "Question " + (currQ + 1);
      document.getElementById("q").innerHTML = q;
      document.getElementById("a1").innerHTML = a1;
      document.getElementById("a2").innerHTML = a2;
      document.getElementById("a3").innerHTML = a3;
      document.getElementById("a4").innerHTML = a4;
    });

    this.setState({ waitingLobby: true });
  };

  timeInterval = () => {
    let seconds = parseInt(document.getElementById("timer").innerHTML);
    this.username = document.getElementById("username").innerText;
    this.room = document.getElementById("room").innerText;

    let username = this.username;
    let room = this.room;
    console.log(seconds);
    seconds = seconds - 1;
    document.getElementById("timer").innerHTML = seconds;
    if (seconds < 1) {
      clearInterval(this.timerIntervalFunc);
      this.setState({
        viewTimerEnded: true,
      });
      if(this.state.currQuestion==9){
        this.setState({
          quizEnded: true,
        });
        let prize = this.quiz.amount
        this.socket.emit("quizEnded", {room, prize})

      }
      this.socket.emit("bestThreeScores", { username, room });

    }
    
  };

  launchQuiz = (event) => {
    event.preventDefault();
    document.getElementById("questionDiv").hidden =false
    this.setState({ waitingLobby: false });
    this.nextQuestion(event);
  };

  renderNewQuestion() {
    return (
      
      <div>
        <form onSubmit={this.nextQuestion}>
           <button  class="button-55" >Next question</button>
        </form>
      </div>
      
    );
  }

  outputRoomName(room) {
    this.roomName.innerText = room;
  }

  outputUsers(users) {
    this.userList.innerHTML = "";
    users.forEach((user) => {
      const li = document.createElement("li");
      li.innerText = user.username;
      this.userList.appendChild(li);
    });
  }

  startQuiz() {
    return (
      <div>
        <h2 id="room-name"></h2>
        <ul id="users"></ul>
        <div>
          <form onSubmit={this.askToPayAndStartSockets}>
             <button  class="button-55"  type="submit" value="Start Quiz" id="startQuiz" >Start Quiz</button>
          </form>
        </div>
      </div>
    );
  }

  nextQuestion = (event) => {
    event.preventDefault();
    this.username = document.getElementById("username").innerText;
    this.room = document.getElementById("room").innerText;
    let username = this.username;
    let room = this.room;
    this.socket.emit("quizInProgress", { username, room });
    let currQ = this.state.currQuestion + 1;
    this.socket.emit("nextQuestion", { currQ, room });
    let correct = this.quiz.questions[currQ].c[1]

    
    document.getElementById("a1").style.backgroundColor = "white";
    document.getElementById("a2").style.backgroundColor = "white";
    document.getElementById("a3").style.backgroundColor = "white";
    document.getElementById("a4").style.backgroundColor = "white";
    document.getElementById("a"+correct).style.backgroundColor = "green"
    let next = parseInt(this.state.currQuestion) + 1;
    this.setState({ currQuestion: next });
  };
}

export default AdminView;
