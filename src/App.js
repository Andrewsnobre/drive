import React, { Component } from "react";
import SolidityDriveContract from "./contracts/SolidityDrive.json";
import getWeb3 from "./utils/getWeb3";
import { StyledDropZone } from "react-drop-zone";
import FileIcon, { defaultStyles } from "react-file-icon";
import "react-drop-zone/dist/styles.css";
import "bootstrap/dist/css/bootstrap.css";
import { Table } from "reactstrap";
import fileReaderPullStream from 'pull-file-reader';
import ipfs from './utils/ipfs';
import Moment from "react-moment";
import "./App.css";
import Web3 from "web3";


class App extends Component {
  state = { solidityDrive: [], web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const provider = new Web3.providers.HttpProvider("https://rinkeby-light.eth.linkpool.io");
      
      //const web3 = new Web3(provider);


      window.ethereum.request({ method: "eth_requestAccounts" });
 
      const web3 = new Web3(window.ethereum);

      
      
     // var accountsOnEnable = await window.ethereum.request({method: 'eth_requestAccounts'})
    
      //const accounts = await window.ethereum.enable();
     const accounts2= await window.ethereum.request({method: 'eth_requestAccounts'});
      const account = accounts2;
     
      
    
     
      //const accounts = await window.ethereum.enable();
     // const account = accounts[0];
      console.log(accounts2);


         // web3.eth.defaultAccount = account;

      // Use web3 to get the user's accounts.
      //const accounts = await web3.eth.getAccounts();
     

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
     // const deployedNetwork = SolidityDriveContract.networks[networkId];
      const instance = new web3.eth.Contract([{"constant":false,"inputs":[{"name":"_hash","type":"string"},{"name":"_fileName","type":"string"},{"name":"_fileType","type":"string"},{"name":"_date","type":"uint256"}],"name":"add","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"_index","type":"uint256"}],"name":"getFile","outputs":[{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"string"},{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getLength","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"}],'0xF77953CB9e0d701d077cCDCDdC09d16baF2f1446'
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3:web3, accounts:accounts2, contract: instance},this.getFiles);


      
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        'Failed to load web3, accounts, or contract. Check console for details.'
      );
      console.error(error);
    }
  };

  getFiles = async () => {
    try {
     const { accounts, contract } = this.state;
      let filesLength = await contract.methods
        .getLength()
        .call({ from: accounts[0] });
      let files = [];
      for (let i = 0; i < filesLength; i++) {
        let file = await contract.methods.getFile(i).call({ from: accounts[0] });
        files.push(file);
      }
      this.setState({ solidityDrive: files });
    } catch (error) {
     console.log(error);
    }
  };

  onDrop = async (file) => {
    try {
      const {contract, accounts} = this.state;
      const stream = fileReaderPullStream(file);
      const result = await ipfs.add(stream);
      const timestamp = Math.round(+new Date() / 1000);
      const type = file.name.substr(file.name.lastIndexOf(".")+1);
      let uploaded = await contract.methods.add(result[0].hash, file.name, type, timestamp).send({from: accounts[0], gas: 300000})
      console.log(uploaded);
      this.getFiles();
    } catch (error) {
      console.log(error);
    }
  };

  render() {
    const {solidityDrive} = this.state;
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <div className="container pt-3">
          <StyledDropZone onDrop={this.onDrop} />
          <Table>
            <thead>
              <tr>
                <th width="7%" scope="row">
                  Type
                </th>
                <th className="text-left">File Name</th>
                <th className="text-right">Date</th>
              </tr>
            </thead>
            <tbody>
              {solidityDrive !== [] ? solidityDrive.map((item, key)=>(
                <tr>
                <th>
                  <FileIcon
                    size={30}
                    extension={item[2]}
                    {...defaultStyles[item[2]]}
                  />
                </th>
                <th className="text-left"><a href={"https://ipfs.io/ipfs/"+item[0]}>{item[1]}</a></th>
                <th className="text-right">
                  <Moment format="YYYY/MM/DD" unix>{item[3]}</Moment>
                </th>
              </tr>
              )) : null}
            </tbody>
          </Table>
        </div>
      </div>
    );
  }
}

export default App;