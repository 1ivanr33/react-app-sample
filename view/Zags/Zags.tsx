import React, { Component } from "react";
import styled from "styled-components";
import GetStatus from './GetStatus';

interface IModule{
	description: string;
	moduleId: number;
	param: string;
	value: string;
}

interface IZagsState {
	modules: IModule[],
	singleModule: IModule[],
	moduleIdValue: number,
	modulePutConfigs: string
}

export default class Zags extends Component<{}, IZagsState>{
	state: IZagsState = {
		modules: [],
		singleModule: [],
		moduleIdValue: 0,
		modulePutConfigs: 'mqmdm'
	};

	 getModulesConfigs = async() => {
		 try {
			 const urlGet = 'http://10.159.209.112:8080/configs';
			 let postData = {
				 method: 'GET'
			 };
			 const response = await fetch(urlGet, postData);
			 const data = await response.json();

			 //let modulesList = (data.filter(x => x.moduleId === 2).forEach(x => console.log(x.param + ': ' + x.value)));
			 //let modulesList = data.filter(x => x.moduleId === 0));
			 this.setState({
				 modules: data,
				 singleModule: data.filter(x => x.moduleId === 0),
				 moduleIdValue: 0
			 });
			 console.log('1st step: ' + JSON.stringify(data))

		 }
		 catch (e) {
			 this.setState({
				 modules: 'проверьте соединение'
			 });
		 }
		 //console.log('получен массив: ' + JSON.stringify(this.state.modules));
		 console.log('singleModule: ' + JSON.stringify(this.state.singleModule));
		 console.log('modulePutConfigs: ' + this.state.modulePutConfigs)
	 };

	async componentDidMount(){
		return this.getModulesConfigs();
	}

	handleModuleChange = async (event) => {
		let idValue = (+event.target.value);
		if(idValue === 0){
			this.setState({
				modulePutConfigs: 'mqmdm',
				moduleIdValue: 0,
				singleModule: this.state.modules.filter(x => x.moduleId === 0)})
		}
		else if(idValue === 1){
			this.setState({
				modulePutConfigs: 'parse',
				moduleIdValue: 1,
				singleModule: this.state.modules.filter(x => x.moduleId === 1)})
		}
		else if(idValue === 2){
			this.setState({
				modulePutConfigs: 'integration',
				moduleIdValue: 2,
				singleModule: this.state.modules.filter(x => x.moduleId === 2)})
		}
	};

	handleValueChange = (e) => {
		e.persist();
		this.setState(prevState => {
			return {...prevState,
				singleModule: prevState.singleModule.map(item => {
				if ((e.target.name === item.param)) return {...item, value: e.target.value};
				return item;
			})}
		});
		setTimeout(() => console.log(this.state.singleModule), 2000)
	};

	putNewConfigs = async () => {
	    /*let s = this.state.modules;
			let i = s.length;
			while (i--) {
			    let x = s[i].param === 'work_mode';
			    if((x && (s[i].value !== ('AUTO' || 'CUSTOM')))) {
                    console.log('state will clear');
                    this.setState({modules: []})
                }
			}*/
	    let {singleModule} = this.state;

        let urlPut = 'http://10.79.154.55:8080/'+this.state.modulePutConfigs+'/api/putConfigs';

        let putData = {
            method: 'PUT',
            body: JSON.stringify(this.state.singleModule),
            headers: {
                'Content-Type': 'application/json'
            }
        };
        let changedResponse = await fetch(urlPut, putData);
        let changedData = await changedResponse.json();
        let compareOutput = JSON.stringify(singleModule.map(singleConfig => [{param: singleConfig.param, value: singleConfig.value}]));
        let compareChangedData = JSON.stringify(changedData.map(singleConfig => [{param: singleConfig.param, value: singleConfig.value}]));
        if(compareChangedData === compareOutput){
        	alert('Изменения сохранены.')
		}
        else {
        	alert('Ошибка при сохранении изменений')
		}
		console.log('configs was changed, state will clear, response: ' + JSON.stringify(changedData));
		this.getModulesConfigs();
	};

	render() {
		const {singleModule, moduleIdValue} = this.state;
		const mqMdmHint = (moduleIdValue === 0 ? 'Назначение модуля состоит в получении XML документов с ' +
			'информацией об умерших из очереди сообщений от сервиса МДМ и сохранении полученных сообщений в таблицу ' +
			'EXT_WS_MESSAGE. Работа модуля инициируется сразу при получении сообщения из очереди, после обработки ' +
			'полученного сообщения, данный модуль может инициировать работу модуля parse, что определяется ' +
			'конфигурационным параметром work_mode для данного модуля.' : '');
		const parseHint = (moduleIdValue === 1 ? 'Модуль parse. Назначение модуля состоит в загрузке сохраненных ' +
			'модулем mq-mdm сообщений, их парсинге и сохранении информации в базу данных staging area,	' +
			'структура которой повторяет структуру обрабатываемых XML документов. Работа модуля инициируется ' +
			'либо автоматически, путём вызова со стороны модуля mq-mdm, либо явным вызовом из интерфейса пользователя, ' +
			'модуль будет вызываться автоматически, если параметр work_mode для модуля mq-mdm установлен в AUTO. ' +
			'Данный модуль может инициировать работу модуля eirc-integration, что определяется конфигурационным ' +
			'параметром work_mode для данного модуля.' : '');
		const eircIntegrationHint = (moduleIdValue === 2 ? 'Модуль eirc-integration. Назначение модуля состоит в ' +
			'выборке валидных данных об умерших из staging area, сохраненных туда после обработки модулем parse,  ' +
			'для последующей отправки в окружные очереди сообщений. В процессе работы данный модуль обращается к ' +
			'сервису ws_storage для получения идентификационных параметров умершего в БД АСУ ЕИРЦ, после чего ' +
			'формирует XML документы для отправки в ту окружную очередь, которая соответствует полученному ' +
			'идентификатору их сервиса ws_storage. Модуль занимается прослушиванием очереди сообщений о статусе ' +
			'загрузки в БД АСУ ЕИРЦ. Работа модуля инициируется либо автоматически, путём вызова со стороны модуля ' +
			'parse, либо явным вызовом из интерфейса пользователя, модуль будет вызываться автоматически, ' +
			'если параметр work_mode для модуля parse установлен в AUTO.' : '');
		return (
			<ZagsWrapper>
				<GetStatus/>
				<ModuleParamHintIcon> i
					<ModuleHint>{mqMdmHint || parseHint || eircIntegrationHint}</ModuleHint>
				</ModuleParamHintIcon>
				<SelectModuleId value={moduleIdValue} onChange={(event) => {
					event.persist();
					this.handleModuleChange(event)
				}}>

					<Option hidden="hidden">Выберите модуль</Option>
					<Option value="0">mq-mdm</Option>
					<Option value="1">parse</Option>
					<Option value="2">eirc-integration</Option>
				</SelectModuleId>
				{/*<ModuleHint>{mqMdmHint || parseHint || eircIntegrationHint}</ModuleHint>*/}
				<ModuleStatus>Конфигурация: {singleModule.map(module =>
					<Module key={module.param.toString()}>
						<ModuleParam>
							<ModuleParamHintIcon> i
							<ModuleParamHint>{module.description}</ModuleParamHint>
							</ModuleParamHintIcon>
							{module.param}
						</ModuleParam>

						{module.param === 'work_mode' ?
							<Select name={module.param} value={module.value === 'AUTO' ? 'AUTO' : 'CUSTOM'} onChange={this.handleValueChange}>
								<Option value="AUTO" >AUTO</Option>
								<Option value="CUSTOM">CUSTOM</Option>
							</Select>
							:
							<ModuleValue name={module.param} value={module.value} onChange={this.handleValueChange}>
							</ModuleValue>
						}
					</Module>)}
					<PutNewConfigs type='submit' value='Сохранить изменения' onClick={this.putNewConfigs}/>
				</ModuleStatus>
			</ZagsWrapper>
		);
	}
}

const Module = styled.div`
margin-top: 20px;
width: 700px;
height: 60px;
border: 1px solid #d7d7d7;
display: flex;
align-items: center;
`;

const ModuleParam = styled.div`
  display: inline-block;
  width: 300px;
  //background: #a9a9a9;
  position: relative;
`;

const ModuleParamHintIcon = styled.div`
  position: relative;
  display: inline-block;
  margin: 0 5px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #efefef;
  color: #208cff;
  text-align: center;
  cursor: help;
:hover :first-child{
    display: block;
}
`;

const ModuleHint = styled.div`
position: absolute;
right: 40px;
width: 250px;
padding: 20px 10px;
text-align:justify;
background: #efefef;
color: #000;
cursor: default;
display: none;
`;

const ModuleParamHint = styled.div`
position: absolute;
left: -220px;
top: 8px;
width: 200px;
background: #ff9325;
padding: 10px;
text-align: justify;
z-index: 10;
display: none;
color: #000;
cursor: default;
`;

const ModuleValue = styled.input`
width: 370px;
height: 60px;
border: none;
outline: none;
background: transparent;
box-sizing: border-box;
padding-left: 5px;
flex-grow: 1;
:focus{
background: #fff;
}
`;

const Select = styled.select`
height: 60px;
width: 380px;
border: none;
outline: none;
background: transparent;
flex-grow: 1;
:focus{
background: #fff;
}
option{
padding: 10px 0;
}
`;

const Option = styled.option`
`;

const ZagsWrapper = styled.div`
  font-family: Arial serif;
  width: 1060px;
  margin: 0 auto;
  padding: 60px 20px;
  min-height: 100vh;
  box-sizing: border-box;
  background:#FAFBFB;
  position:relative;
`;

const SelectModuleId = styled.select`
margin-top: 40px;
option{
}
`;

const PutNewConfigs = styled.input`
display: block;
margin-top: 40px;
`;

const ModuleStatus = styled.div`
margin-top: 40px;
`;
