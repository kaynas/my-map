import React, {Component} from 'react';
import ReactDOM from 'react-dom';

import {Map} from '../map.js';
import {ListWrap, AddressLine, InputLine} from '../interface.js';

let main_Map, suggestView, list_wrap;
let assert = require('chai').assert;

describe("Тестирование модуля Яндекс карты", function() {
    before(async function () {
        let ymap_api = ymaps.ready(function(){
            main_Map = new Map();
            main_Map.init(function(){ReactDOM.render(<ListWrap mainMap={main_Map}/>, document.getElementById('list_wrap'));});
            list_wrap = ReactDOM.render(<ListWrap mainMap={main_Map}/>, document.getElementById('list_wrap'));
        });
        let result = await ymap_api;
    });

    it("Добавление координат", function() {
        let one_test_coord = [{address: '', coord: [54.3272841649301, 48.40147580269607]}];
        main_Map.address_array = one_test_coord;
        assert.equal((() => main_Map.address_array.length)(), 1);
    });

    it("Проверка вычисленного по координатам адреса", function(done) {
        setTimeout(function(){
            assert.equal((() => main_Map.address_array[0].address)(), 'Россия, Ульяновск, улица Радищева, 39');
            done();
        }, 500);
    });
});

describe("Тестирование модуля ввода адреса", function() {
    it("Тестирование удаления адреса", function() {
        list_wrap.deleteAddress(0);    
        assert.equal((() => main_Map.address_array.length)(), 0);
    });

    it("Проверка вычисленных координат по введённому адресу", function(done) {
        list_wrap.setAddress('Россия, Ульяновск, улица Радищева, 39');
        setTimeout(function(){
            assert.equal((() => main_Map.address_array[0].coord[0])(), 54.327199);
            assert.equal((() => main_Map.address_array[0].coord[1])(), 48.401362);
            done();
        }, 700);
    });

    it("Изменяем адрес и проверяем координаты нового адреса", function(done) {
        list_wrap.changeAddress(0, 'Россия, Ульяновск, проспект Туполева, 10');
        list_wrap.setAddress('Россия, Ульяновск, проспект Туполева, 10');
        setTimeout(function(){
            assert.equal((() => main_Map.address_array[0].coord[0])(), 54.36838);
            assert.equal((() => main_Map.address_array[0].coord[1])(), 48.578546);
            done();
        }, 1000);
    });
});