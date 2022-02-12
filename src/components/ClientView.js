import React, { Component } from "react";
import { ethers } from "ethers";
import simple_token_abi from "./Contracts/simple_token_abi.json";
import timerIcon from '../images/timer.png'
const io = require("socket.io-client");


class ClientView extends Component {
  constructor(props) {
    super(props);
    this.socket =  io('https://kmcblockchain.herokuapp.com/')
    this.id = "";
    this.quiz = this.props.dataFromParent.quiz.data;
    this.contractAddress = "0x3010cEd1Ea7D28880A40c9c3e79eA85A2dD28515";
    this.state = {
      questionsDisabled: true,
      quizInProg: false,
      waitingLobby: false,
      admin: false,
      viewTimerEnded: false,
      currQuestion: -1,
      quizEnded: false,
    };
  }
  componentDidMount() {
    this.username = document.getElementById("username").innerText;
    this.room = document.getElementById("room").innerText;
    let username = this.username;
    let room = this.room;
    console.log("before check");
    this.socket.emit("joinLobby", { username, room });
    this.socket.emit("CheckIfRoomOpened", { username, room });
    console.log("after check");
    console.log("componentDidMount");
    this.socket.on("QuizStarted", ({ room, users }) => {
      console.log("You can enter");
      //alert("Quiz not started by admin, please try again later")
      document.getElementById("payCoinsButton").disabled = false;
    });
    this.socket.on("BestUsersList", ({ room, bestUsers }) => {
      for (var i = 0; i < bestUsers.length; i++) {
          let bestUsersList = document.getElementById("bestUsers");
          const li = document.createElement("li");
          li.innerText = bestUsers[i].username + " Score: " +bestUsers[i].score;
          bestUsersList.appendChild(li);
          
      }
    });
  }
  render() {
    console.log(
      "timer ended: " +
        this.state.viewTimerEnded +
        " QUIZ ENDED " +
        this.state.quizEnded
    );
    return (
      <>
        <div>
          <h3>Username:</h3>
          <h4 id="username">{this.props.dataFromParent.userName}</h4>
          <h3>Quiz ID:</h3>
          <h4 id="room">{this.props.dataFromParent.room}</h4>
          <h3>Users in quiz:</h3>
          <section id="boxes">
            <div id="userList" class="container"></div>
          </section>
          <div id="mainTimerDiv">
          <h1 id="timer"></h1>
          <img id="timerIcon" src={timerIcon} style={{display: "none"}}/>
          
          </div>
          {this.state.viewTimerEnded ? (
            <div>
              {this.state.quizEnded ? (
                <div>
                  {" "}
                  <h1> Quiz Ended </h1>
                  <h1 id="imWinner"></h1>
                </div>
              ) : null}
              {this.showScores()}
            </div>
          ) : (
            <div>
              {this.state.questionsDisabled ? null : (
                <div>
                 <h3 id="titlaDiv"></h3>
                 <br></br>
                <div class= "questionDiv">
                  {/* <h5> seconds left: </h5> */}

                 
                  <h2 id="q"></h2>
                  <input
                    type="radio"
                    id="qa1"
                    class="radioClasss"
                    name="reason1"
                    value="meirav"
                    //defaultChecked
                  />
                  <label id="a1"></label>
                  <br></br>
                  <input
                    type="radio"
                    id="qa2"
                    class="radioClasss"
                    name="reason1"
                    value=""
                  />
                  <label id="a2"></label>
                  <br></br>
                  <input
                    type="radio"
                    id="qa3"
                    class="radioClasss"
                    name="reason1"
                    value=""
                  />
                  <label id="a3"></label>
                  <br></br>
                  <input
                    type="radio"
                    id="qa4"
                    class="radioClasss"
                    name="reason1"
                    value=""
                  />
                  <label id="a4"></label>
                  <br></br>
                  <br></br>
                  <form onSubmit={this.submitQuestion}>
                     <button id="submitAnswer" class="button-55"
                      type="submit"
                      value="Submit Question"
                    >
                      Submit Question
                    </button>
                  </form>
                </div></div>
              )}
            </div>
          )}

          {Number(this.state.currQuestion) > -1 ? null : (
            <div>{this.startQuiz()}</div>
          )}
        </div>
      </>
    );
  }

  submitQuestion = (event) => {
    event.preventDefault();
    let answer;
    let score = 0;
    for (let i = 0; i < 4; i++) {
      if (document.getElementById("qa" + (i + 1)).checked) {
        answer = "a" + (i + 1);
        break;
      }
    }
    document.getElementById("submitAnswer").style.display = "none";
    if (answer === this.quiz.questions[this.state.currQuestion].c) {
      let timeLeft = document.getElementById("timer").innerHTML;
      score = 10 * timeLeft;
      this.wasIRight = true;
      this.lastScore = score;
      let username = this.username;
      let room = this.room;
      this.socket.emit("ansIsCorrect", { username, room, score });
    } else {
      this.wasIRight = false;
    }
  };

  showScores() {
    let str = "";
    let score = 0;
    if (this.wasIRight) {
      str = "You are right!!";
      score = this.lastScore;
    } else {
      str = "Oops.. Wrong answer :(";
    }
    return (
      <div>
        <h1>{str}</h1>
        <h2>
          {" "}
          You have gained {score} points for this question.{" "}
        </h2>
        <br></br>
        <h1>BEST SCORES:</h1>
        <ul id="bestUsers">
              </ul>
      </div>
    );
  }

  startQuiz() {
    return (
      <div>
        <h2 id="room-name"></h2>
        <div>
          {this.state.waitingLobby ? (
            <div>
              <h4>
                Please wait until admin will launch the quiz
              </h4>
            </div>
          ) : (
            <div>
              {this.state.quizInProg ? null : (
                <div>
                  <form onSubmit={this.askToPayAndStartSockets}>
                    <h3>
                      You will be able to pay only after the admin will open the
                      option to join the lobby
                    </h3>
                     <button  class="button-55"
                      style={{
                        fontFamily: "Century Gothic",
                        fontSize: "14px",
                        color: "black",
                        backgroundColor: "linen",
                        borderRadius: "14px",
                        borderColor: "tan",
                        padding: "8px",
                      }}
                      type="submit"
                      value="Pay"
                      id="payCoinsButton"
                      disabled="disabled"
                    >Pay {this.quiz.amount} KMC</button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
  askToPayAndStartSockets = async (event) => {
    event.preventDefault();
    this.username = document.getElementById("username").innerText;
    this.room = document.getElementById("room").innerText;
    this.roomName = document.getElementById("room-name");
    this.userList = document.getElementById("users");
    let username = this.username;
    let room = this.room;
    //window.ethereum.send("eth_requestAccounts");
    if (window.ethereum) {
      console.log(window.ethereum);
      window.ethereum
        .request({ method: "eth_requestAccounts" })
        .then((addressResult) => {
          console.log("wallet address " + addressResult);
          let recieverAddress = "0x8Ae808DC92E4BE8Cc67B77bF8506170aa0D13e02";
          let transferAmount = ethers.utils.parseEther(
            this.quiz.amount.toString()
          );
          let tempProvider = new ethers.providers.Web3Provider(window.ethereum);
          let tempSigner = tempProvider.getSigner();
          let contract = new ethers.Contract(
            this.contractAddress,
            simple_token_abi,
            tempSigner
          );
          let txt = contract
            .transfer(recieverAddress, transferAmount)
            .then((result) => {
              this.socket.on("roomUsers", ({ room, users }) => {
                //this.outputRoomName(room);
                console.log("client - inside socket on room users");
                this.outputUsers(users);
              });
              let address = addressResult;
              this.socket.emit("joinRoom", { username, room, address });
              this.socket.on("renderNextQuestionForRoom", ({ room, currQ }) => {
                document.getElementById("timerIcon").style.display = "block"
                this.wasIRight = false;
                this.lastScore = 0;

                if (!this.state.quizInProg) {
                  this.setState({
                    quizInProg: true,
                    questionsDisabled: false,
                    waitingLobby: false,
                  });
                }
                this.setState({
                  viewTimerEnded: false,
                  currQuestion: currQ,
                });
                let timeForQue = 40;
                let seconds = timeForQue;
                document.getElementById("timer").innerHTML = seconds;
                this.timerIntervalFunc = setInterval(this.timeInterval, 1000);

                let q = this.quiz.questions[currQ].q;
                let a1 = this.quiz.questions[currQ].a1;
                let a2 = this.quiz.questions[currQ].a2;
                let a3 = this.quiz.questions[currQ].a3;
                let a4 = this.quiz.questions[currQ].a4;
                document.getElementById("titlaDiv").innerHTML =
                  "Question " + (currQ + 1);
                document.getElementById("q").innerHTML = q;
                document.getElementById("a1").innerHTML = a1;
                document.getElementById("a2").innerHTML = a2;
                document.getElementById("a3").innerHTML = a3;
                document.getElementById("a4").innerHTML = a4;
              });

              this.socket.on("roomWinner", ({ winner }) => {
                //console.log("room winner triggerd "+ winner.id+" "+this.id)
                document.getElementById("imWinner").innerHTML = "You Won!";
                alert(
                  "You won the quiz! Please refresh page to see the reward!\nYou can withdraw them whenever you want! :)"
                );
              });
              this.socket.on("updateUserId", ({ id }) => {
                if (this.id == "") {
                  this.id = id;
                }
                console.log("USer id updated! : " + this.id);
              });

              console.log("after waiting lobby");
              this.setState({ waitingLobby: true });
            });
        });
    }
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
      console.log("currwnt q: " + this.state.currQuestion);
      if (this.state.currQuestion == 9) {
        this.setState({
          quizEnded: true,
        });
      }
    }
  };

  outputRoomName(room) {
    this.roomName.innerText = room;
  }

  outputUsers(users) {
    let usersList = document.getElementById("userList");
    usersList.innerHTML = "";
    users.forEach((user) => {
      
      const box = document.createElement("button");
      box.className= "box"
      box.innerHTML = user.username;
      usersList.appendChild(box);
    });
  }
}

export default ClientView;
