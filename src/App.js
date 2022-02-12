import React, { Component } from "react";
import "./App.css";
import { ethers } from "ethers";
import PostForm from "./components/PostForm";
import Quiz from "./components/Quiz";
import axios from "axios";
import simple_token_abi from './components/Contracts/simple_token_abi.json'
import cashingSound from './sounds/cashing.mp3'
const {
  Bank_Address,
  Private_Key_Bank,
  Contract_Address
} = require("./components/Contracts/Contract_Data");
class App extends Component {
  constructor(props) {
    super(props);
    this.cashingSound = new Audio(cashingSound)
    this.state = {
      createQuiz: undefined,
      enterQuiz: undefined,
      account: '0x0',
      coins: "-"
    };
  }

  showNumOfCoins = async (event) => {

    let res = await axios.get("/getNumOfCoins", {
      params: {
        address: this.state.account,
      },
    });
    if (res.data == null) {
      this.setState({ coins: 0 })
      let newAccount = await axios.get("/initiateAccountInDB", {
        params: {
          address: this.state.account,
        },
      });
    } else {
      this.setState({ coins: res.data.coins })
    }

  }

  loadBlockchainData = (event) => {
    event.preventDefault()
    if (window.ethereum) {
      console.log(window.ethereum)
      window.ethereum.request({ method: 'eth_requestAccounts' }).then(addressResult => {
        this.setState({ account: addressResult[0] })
        this.showNumOfCoins(event)
      })

    }
  }

  send_token(
    contract_address,
    send_token_amount,
    to_address,
    send_account,
    private_key,
    gas_limit,
  ) {
    let wallet = new ethers.Wallet(private_key)
    let walletSigner = wallet.connect(window.ethersProvider)

    window.ethersProvider.getGasPrice().then((currentGasPrice) => {
      let gas_price = ethers.utils.hexlify(parseInt(currentGasPrice))

      if (contract_address) {
        // general token send
        let contract = new ethers.Contract(
          contract_address,
          simple_token_abi,
          walletSigner
        )

        // How many tokens?
        let numberOfTokens = ethers.utils.parseUnits(send_token_amount, 18)
        // Send tokens
        contract.transfer(to_address, numberOfTokens).then((transferResult) => {
          console.dir(transferResult)
          alert(send_token_amount + " KMC coins sent to address : " + this.state.account)
        })
      }
    })
  }

  withdrawRewards = async (event) => {
    event.preventDefault()
    if (this.state.account == '0x0') {
      alert("Please connect your MetaMask wallet.")
    }
    else if (this.state.coins == 0 || this.state.coins == "-") {
      alert("Sorry, you have nothing to withdraw. Maybe try to earn some by playing a quiz? :)")
    } else {
      this.cashingSound.play()
      this.setState({ coins: 0 })
      document.getElementById("withdraw").disabled = true
      let send_token_amount = this.state.coins.toString()
      let to_address = this.state.account
      let gas_limit = "0x100000"
      let wallet = new ethers.Wallet(Private_Key_Bank)
      let walletSigner = wallet.connect(window.ethersProvider)
      window.ethersProvider = new ethers.providers.InfuraProvider("ropsten")

      this.send_token(
        Contract_Address,
        send_token_amount,
        to_address,
        Bank_Address,
        Private_Key_Bank,
        gas_limit,
      )
      // Update in db
      let res = await axios.get("/withdraw", {
        params: {
          address: this.state.account,
          coins: this.state.coins
        },
      });


    }
  }

  render() {
    return (
      <div className="App">
        <nav className="topnav">
          <a>
            &nbsp; BlockChain Trivia
          </a>
          <b className="nav-item text-nowrap d-none d-sm-none d-sm-block">
            <small className="text-muted"><span id="account">{this.state.account}</span></small>
          </b>
          <b>Rewards : {this.state.coins} KMC</b>
          <a>
            <form onSubmit={this.loadBlockchainData}>
              <input type="submit" value="Connect Wallet" />
            </form>
          </a>
          <a>
            <form onSubmit={this.withdrawRewards}>
              <input type="submit" id="withdraw" value="Withdraw Rewards" />
            </form>
          </a>
        </nav>
        <div id="floattingBox">

          {this.state.createQuiz || this.state.enterQuiz ? (
            this.state.createQuiz ? (
              <div>
                <PostForm />
              </div>
            ) : (
              <Quiz />
            )
          ) : (
            <div>

              <div class="perspective-text">
                <div class="perspective-line">
                  <p></p>
                  <p>Welcome</p>
                </div>
                <div class="perspective-line">
                  <p>Welcome</p>
                  <p>To The KMC</p>
                </div>
                <div class="perspective-line">
                  <p>To The KMC</p>
                  <p>Blockchain</p>
                </div>
                <div class="perspective-line">
                  <p>Blockchain</p>
                  <p>Trivia Game</p>
                </div>
                <div class="perspective-line">
                  <p>Trivia Game</p>
                  <p></p>
                </div>
              </div>
              <div>
                <ul class="tilesWrap">
                  <li>
                    <h2>01</h2>
                    <h3>Build your custom quiz.</h3>
                    <p>By pressing on the "create quiz" button bellow, you can build your own cutsom quiz.</p>
                  </li>
                  <li>
                    <h2>02</h2>
                    <h3>Play a quiz.</h3>
                    <p>Press on the "start quiz" button and start playing with your friends!</p>
                  </li>
                  <li>
                    <h2>03</h2>
                    <h3>Earn KMC</h3>
                    <p>Blockchain Trivia KMC is fun way of studying and EARNING KMC!</p>
                  </li>
                </ul>
              </div>
              <div class="main">
                <h2 > Please select one of the options below </h2>
                <button class="button-55" onClick={() => this.enterExistingQuiz()} >Enter Quiz</button>
                <button class="button-55" onClick={() => this.createNewQuiz()} >Create Quiz</button>

              </div>
            </div>
          )}

          {/* <PostList /> */}
          <h3>By Karen Rachev & Meirav Goihman</h3>
        </div>
      </div>
    );
  }
  enterExistingQuiz() {
    if (this.state.account == "0x0") {
      alert("Please connect your MetaMask wallet!")
    }
    else {
      this.setState({ enterQuiz: true });
    }

  }

  createNewQuiz() {
    this.setState({ createQuiz: true });
  }
}
export default App;
