import React, {Component} from 'react';
import ReactDOM from 'react-dom';

import {Map} from './map.js';
import {ListWrap, AddressLine, InputLine} from './interface.js';

let main_Map, suggestView;
/*Генерируем карту. React компоненты формируются только после полной инициализации карты*/
ymaps.ready(function(){
    main_Map = new Map();
    main_Map.init(function(){ReactDOM.render(<ListWrap mainMap={main_Map}/>, document.getElementById('list_wrap'));});
    ReactDOM.render(<ListWrap mainMap={main_Map}/>, document.getElementById('list_wrap'));/*В родительский компонент передаём ссылку на объект карты*/
    suggestView = new ymaps.SuggestView('suggest');
});