import React, { Component } from "react";
import { PageHeader, ListGroup } from "react-bootstrap";
import { API, Auth, Signer } from "aws-amplify";
import { w3cwebsocket as W3CWebSocket } from "websocket"
import "./Home.css";

export default class Home extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      testApiCall: [],
    };
  }

  async componentDidMount() {
    if (!this.props.isAuthenticated) {
      return;
    }

    try {
      const testApiCall = await this.testApiCall();
      this.setState({ testApiCall });
    } catch (e) {
      alert(e);
    }

    this.setState({ isLoading: false });
  }

  wsClient = null;
  testWebSocket = async () => {

    const credentials = await Auth.currentCredentials();
    const accessInfo = {
      access_key: credentials.accessKeyId,
      secret_key: credentials.secretAccessKey,
      session_token: credentials.sessionToken,
    };
    const serviceInfo = {
      region: "us-east-2",
      service: "execute-api"
    }

    const wsUrl = "wss://ws.dev.prepaytolls.com";

    const signedUrl = Signer.signUrl(wsUrl, accessInfo, serviceInfo);

    this.wsClient = new W3CWebSocket(signedUrl);


    this.wsClient.onerror = function () {
      console.log("[client]: Connection Error")
    }

    this.wsClient.onopen = function () {
      console.log("[client]: WebSocket Client Connected")
    }

    this.wsClient.onclose = function () {
      console.log("[client]: Client Closed")
    }

    this.wsClient.onmessage = function (e) {
      if (typeof e.data === "string") {
        console.log("Received: '" + e.data + "'")
      }
    }
  }

  testApiCall() {
    //return API.get("testApiCall", "/user/customers/me?parts=2&arguments=many"); //"/admin/elasticsearch/vehicles/_search"); //
    // const ws = new WebSocket(" wss://ws.dev.prepaytolls.com");
    // this.ws.onopen = () => {
    //   console.log("connected");
    // };
    this.testWebSocket();
    return API.post("testApiCall", "/admin/elasticsearch/customers/_search", {
      body: JSON.parse(
        `{"from":0,"size":10,"_source":{"excludes":["vehicles","ledger"]},"aggs":{"count":{"value_count":{"field":"accountNumber.keyword"}},"paymentMethods.methodProvider.keyword":{"terms":{"field":"paymentMethods.methodProvider.keyword"}}}}`
      ),
    });
  }

  renderTestAPI(testApiCall) {
    console.log(testApiCall);
    return testApiCall.message;
  }

  renderLander() {
    return (
      <div className="lander">
        <h1>Test web app</h1>
        <p>A simple react test app</p>
      </div>
    );
  }

  renderTest() {
    return (
      <div className="test">
        <PageHeader>Test API call</PageHeader>
        <ListGroup>
          {!this.state.isLoading && this.renderTestAPI(this.state.testApiCall)}
        </ListGroup>
      </div>
    );
  }

  render() {
    return (
      <div className="Home">
        {this.props.isAuthenticated ? this.renderTest() : this.renderLander()}
      </div>
    );
  }
}
