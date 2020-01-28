import React, {Component} from 'react';

//Компонент содержащий введённые адреса
class AddressLine extends React.Component {
    constructor(props){
        super(props);
        this.active_elem_id = '';/*Перетаскиваемый, в данный момент, элемент*/
    }

    //Цепочка событий для перемещения элемента с адресом
    _dragStart(self, e) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.innerHTML);
        self.active_elem_id = e.target.getAttribute('id');/*Сохраняем индекс перетаскиваемого элемента*/
        e.target.style.opacity = '0.4';/*Меняем прозрачность активного блока*/
    }

    _dragOver(self, e) {
        e.preventDefault();
        //Рисуем красные линии в зависимости от положения курсора
        if(e.target.getAttribute('id') < self.active_elem_id){
            e.target.classList.add('drop_place_higher');
        }else if(e.target.getAttribute('id') > self.active_elem_id){
            e.target.classList.add('drop_place_lower');
        }
        e.dataTransfer.dropEffect = 'move';
    }

    _dragEnter(self, e) {
        e.preventDefault();
    }

    _dragLeave(self, e) {
        if(e.target.getAttribute('id') < self.active_elem_id){
            e.target.classList.remove('drop_place_higher');
        }else if(e.target.getAttribute('id') > self.active_elem_id){
            e.target.classList.remove('drop_place_lower');
        }
    }

    _drop(self, e){
        e.preventDefault();

        self.props.addresses.splice(self.active_elem_id, 1);/*Меняем расположение адреса в массиве адресов*/
        self.props.addresses.splice(e.target.getAttribute('id'), 0, self.props.addresses[self.active_elem_id]);
        self.props.onChangeAddressOrder(self.props.addresses);/*Отправляем на перерисовку карты*/

        e.target.classList.remove('drop_place_higher');
        e.target.classList.remove('drop_place_lower');
    }

    _dragEnd(self, e){
        e.preventDefault();

        self.active_elem_id = '';
        e.target.style.opacity = '1';
    }

    _addressLine(deleteAddress, changeAddress){
        let _self = this;
        if(this.props.addresses) {
            let list_index = -1;
            return (this.props.addresses.map(function (item) {
                    list_index++;
                    return(
                        <li
                            key={list_index}
                            id={list_index}
                            class="list_element"
                            draggable
                            onDragStart={_self._dragStart.bind(null, _self)}
                            onDragOver={_self._dragOver.bind(null, _self)}
                            onDragEnter={_self._dragEnter.bind(null, _self)}
                            onDragLeave={_self._dragLeave.bind(null, _self)}
                            onDragEnd={_self._dragEnd.bind(null, _self)}
                            onDrop={_self._drop.bind(null, _self)}
                        >
                            <div class="element_content">{item.address}</div>
                            <div class="button_wrap">
                                <button class="close_button" type="button" title="Изменить" onClick={changeAddress.bind(null, list_index, item.address)}><i class="fa fa-pen"></i></button>
                                <button class="close_button" type="button" title="Закрыть" onClick={deleteAddress.bind(null, list_index)}><i class="fa fa-times"></i></button>
                            </div>
                        </li>
                    )
                })
            );
        }else{
            return '';
        }
    }
    render() {
        return (
            <ul>
                {this._addressLine(this.props.onAddressDelete, this.props.onChangeAddress)}
            </ul>
        );
    }
}

//Компонент поля ввода
class InputLine extends React.Component {
    constructor(props){
        super(props);
    }

    _setAddress(e){
        if(e.keyCode == 13) {
            this.props.onAddressSet(document.getElementById("suggest").value);
            document.getElementById('suggest').value = '';
        }
    }

    render() {
        //Если есть адрес на изменение, помещаем в поле ввода старый адрес
        if(this.props.changedAddress) {
            document.getElementById('suggest').value = this.props.changedAddress;
        }
        return (
            <input class="input_field" type="text" placeholder="Введите адрес маршрута" id="suggest" onKeyDown={(e) => this._setAddress(e)}/>
        );
    }
}

//Родительский компонент.
class ListWrap extends React.Component {
    constructor(props){
        super(props);
        this.state = {change_line_id: null, change_address_string: ''};/*Информация об изменяемом адресе. Индекс элемента и старый адрес*/
    }

    //Метод добавления нового адреса или изменения существующего
    setAddress(address_line){
        let address_array = this.props.mainMap.address_array;/*Вызываем геттер объекта карты. Получаем текущий массив адресов*/
        if(this.state.change_line_id != null){/*Если есть адрес на изменение*/
            address_array[this.state.change_line_id].address = address_line;/*Меняем адрес на новый*/
            address_array[this.state.change_line_id].coord = '';/*Убираем старые координаты*/
            this._finishChangeAddress();/*Отчищаем state компонента*/
        }else {/*Если новый адрес*/
            address_array.push({address: address_line, coord: ''});/*Добавляем новый адрес в массив*/
        }
        this.props.mainMap.address_array = address_array;/*Вызываем сеттер. Отправляем массив адресов на прорисовку*/
    }

    //Метод удаления адреса
    deleteAddress(index){
        let address_array = this.props.mainMap.address_array;
        address_array.splice(index, 1);
        this.props.mainMap.address_array = address_array;
    }

    //Метод добавляет в state адрес на изменение
    changeAddress(index, addressString){
        this.setState((state, props) => ({change_line_id: index, change_address_string: addressString}));
    }

    //Метод отчищает state
    _finishChangeAddress(){
        this.setState((state, props) => ({change_line_id: null, change_address_string: ''}));
    }

    //Метод отдает объекту карты массив с изменённым порядком адресов
    changeAddressOrder(newAddressArray){
        this.props.mainMap.address_array = newAddressArray;
    }
    render() {
        return (
            <div class="list_wrap">
                <InputLine
                    onAddressSet={(address_line) => this.setAddress(address_line)}
                    changedAddress={this.state.change_address_string}
                />
                <AddressLine
                    onAddressDelete={(index) => this.deleteAddress(index)}
                    onChangeAddress={(index, addressString) => this.changeAddress(index, addressString)}
                    onChangeAddressOrder={(newAddressArray) => this.changeAddressOrder(newAddressArray)}
                    addresses={this.props.mainMap.address_array}
                />
            </div>
        );
    }
}

export {ListWrap, AddressLine, InputLine};