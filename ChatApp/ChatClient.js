import React from 'react';
    import Pusher from 'pusher-js/react-native';
    import { StyleSheet, Text, KeyboardAvoidingView } from 'react-native';
    
    import pusherConfig from './pusher.json';
import ChatView from './ChatDIsplay';
import { response } from 'express';
    
    export default class ChatClient extends React.Component {
      constructor(props) {
        super(props);
        this.state = {
          messages: []
        };
        this.pusher = new Pusher(pusherConfig.key, pusherConfig); // (1)
    
        this.chatChannel = this.pusher.subscribe('chat_channel'); // (2)
        this.chatChannel.bind('pusher:subscription_succeeded', () => { // (3)
          this.chatChannel.bind('join', (data) => { // (4)
            this.handleJoin(data.name);
          });
          this.chatChannel.bind('part', (data) => { // (5)
            this.handlePart(data.name);
          });
          this.chatChannel.bind('message', (data) => { // (6)
            this.handleMessage(data.name, data.message);
          });
        });
        
        this.handleSendMessage = this.onSendMessage.bind(this); // (9)
      }
    
      handleJoin(name) { // (4)
        const messages = this.state.messages.slice();
        messages.push({action: 'join', name: name});
        this.setState({
          messages: messages
        });
        console.log(name, " JOINED");
      }
      
      handlePart(name) { // (5)
        const messages = this.state.messages.slice();
        messages.push({action: 'part', name: name});
        this.setState({
          messages: messages
        });
      }
      
      handleMessage(name, message) { // (6)
        const messages = this.state.messages.slice();
        messages.push({action: 'message', name: name, message: message});
        this.setState({
          messages: messages
        });
        console.log("Name", name, " MEssage", message);
      }
    
      componentDidMount() { // (7)
        fetch(`${pusherConfig.restServer}/users/${this.props.name}`, {
          method: 'PUT'
        });
      }
    
      componentWillUnmount() { // (8)
        fetch(`${pusherConfig.restServer}/users/${this.props.name}`, {
          method: 'DELETE'
        });
      }
    
      onSendMessage(text) { // (9)
        console.log("called onSendMessage");
        const payload = {
            message: text
        };
        try{
          fetch(`${pusherConfig.restServer}/users/${this.props.name}/messages`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
          }) .then((response) => response.json()) 
          .then((responseJson) => {}) 
          .catch((error) => { console.error(error); });
        }
        catch(error){
          console.log(error);
        }

        console.log(text);
      }
    
      render() {
        const messages = this.state.messages;
    
        return (
            <ChatView messages={ messages } onSendMessage={ this.handleSendMessage } />
        );
      }
    }