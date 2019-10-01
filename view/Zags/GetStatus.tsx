import React, { Component } from "react";
import styled from "styled-components";
import renewIcon from '../Icons/renew.svg'

export default class GetStatus extends Component {

	state = {
		moduleStatus: ''
	};

	onSubmit = async() => {
		this.setState({
			moduleStatus: 'ожидайте...'
		});
		try {
			const url_post = "http://10.79.154.55:8080/actuator/health";
			let postData = {
				method: 'GET'
			};
			const response = await fetch(url_post, postData);
			const data = await response.json();

			let appStatus = data.status;
			console.log('status - ' + appStatus);

			if (appStatus === "UP") {
				this.setState({
					moduleStatus: appStatus
				});
			} else {
				this.setState({
					moduleStatus: 'err'
				});
			}
		}
		catch (e) {
			this.setState({
				moduleStatus: 'нет соединения'
			});
		}
	};

	render() {
		return (
			<React.Fragment>
				<UpdateButton onClick = {this.onSubmit}>Обновить статус</UpdateButton>
				<ModuleStatus>Статус модуля: {this.state.moduleStatus}</ModuleStatus>
			</React.Fragment>
		);
	}
}

const UpdateButton = styled.button`
  font-size: 16px;
  font-weight: bold;
  display: block;
  width: 190px;
  height: 30px;
  margin: 0 auto;
  border-radius: 2px;
  border: none;
  color: #208cff;
  background: transparent;
  outline: none;
  cursor: pointer;
  &:before{
  content: '';
  display: inline-block;
  width: 25px;
  height: 18px;
  margin: 0 3px -3px 0;
  background: url(${renewIcon}) no-repeat;
  }
  &:active {
    color: #076cd9;
  }
`;

const ModuleStatus = styled.div`
margin-top: 60px;
`;
