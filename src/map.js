function Map(){
    "use strict";

    let _self = this;
    this._address_array = [];/*Массив с координатами и адресами*/
    this._myMap = null;
    this._outerFunction = null;
    this._balloonLayout = ymaps.templateLayoutFactory.createClass(/*Настраиваем шаблон балуна*/
        "<div class='my-balloon'>" +
        "<a class='close' href='#'>&times;</a>" +
        "<div class='address'><b>{{properties.balloonContent}}</b></div>" +
        "<div class='delete_button_wrap'><button class='delete_button'>УДАЛИТЬ</button></div>" +
        "</div>", {
            build: function () {
                this.constructor.superclass.build.call(this);
                this._$element = $('.my-balloon', this.getParentElement());
                this._$element.find('.close').on('click', this.onCloseClick.bind(this));
                this._$element.find('.delete_button').on('click', this.deletePoint.bind(this));
            },

            onCloseClick: function (e) {/*Событие кнопки закрыть балун*/
                e.preventDefault();
                this.events.fire('userclose');
            },

            deletePoint: function (e) {/*Событие кнопки удалить метку*/
                e.preventDefault();
                this.events.fire('userclose');
                _self._address_array.splice(this.getData().properties.get('index'), 1);/*Удаляем адрес*/
                _self._drawPath();/*Перерисовываем карту*/
            }
        }
    );

    //Инициализируем карту
    this.init = function(outerFunction = ()=>{}){
        /*Добавляем к объекту карты внешнюю функцию. В нашем случае это рендер React компонентов. 
        При любом изменении на карте будет перерисовываться React*/
        this._outerFunction = outerFunction;
        this._myMap = new ymaps.Map('map', {
            center: [54.31542690151185,48.395479134147024],
            zoom: 10,
            controls: ['routeEditor', 'zoomControl', 'routeButtonControl']
        }, {
            searchControlProvider: 'yandex#search',
            balloonLayout: this._balloonLayout,
            balloonPanelMaxMapArea: 0
        });

        this._myMap.events.add('click', function (e) {/*Событие "Клик по карте"*/
            this._address_array.push({address: '', coord: e.get('coords')});/*Добавляем координаты клика в массив адресов*/
            this._drawPath();
        }, this);
    };

    //Метод отрисовки карты и путей
    this._drawPath = function(){
        _self._myMap.geoObjects.removeAll();/*Отчищаем карту*/
        let num_of_addresses = this._address_array.length;

        if(num_of_addresses > 1){/*Если больше одного адреса, рисуем путь*/
            ymaps.route(this._getQueryArray(), {reverseGeocoding: true}).then(function(route){
                for(let i = 0; i < _self._address_array.length; i++) {
                    route.getWayPoints().get(i).options.set('draggable', true);
                    route.getWayPoints().get(i).events.add('dragend', _self._movePoint, _self);/*Добавляем событие "Перемещение метки"*/
                    _self._updateAddressArray(i, route.getWayPoints().get(i).properties.get('balloonContent'), route.getWayPoints().get(i).geometry.getCoordinates());
                    _self._outerFunction();/*Рендерим React компоненты*/
                }
                _self._myMap.geoObjects.add(route);/*Добавляем маршрут и метки на карту*/
            }, function(error){
                alert(error.message);
            });
        }else if(num_of_addresses == 1){/*Если адрес один, не рисуем пути. Просто добавляем метку*/
            ymaps.geocode(this._getQueryArray()[0]).then(function(res){
                _self._updateAddressArray(0, res.geoObjects.get(0).getAddressLine(), res.geoObjects.get(0).geometry.getCoordinates());
                let firstPlacemark = new ymaps.Placemark(_self._address_array[0].coord, {}, {draggable: true});
                firstPlacemark.properties.set('balloonContent', _self._address_array[0].address);
                firstPlacemark.properties.set('iconContent', '1');
                firstPlacemark.events.add('dragend', _self._movePoint, _self);
                _self._myMap.geoObjects.add(firstPlacemark);/*Добавляем метку на карту*/
                _self._outerFunction();
            });
        }else{
            _self._outerFunction();
        }
    };

    //Метод вызавается при перемещении метки на карте
    this._movePoint = function(e){
        let mark = e.get('target');
        this._address_array[mark.properties.get('iconContent') - 1].coord = mark.geometry.getCoordinates();/*Изменяем координаты метки в массиве адресов*/
        this._drawPath();
    };

    //Метод формирует массив адресов и координат для передачи в метод ymaps.route
    this._getQueryArray = function(){
        let queryArray = [];
        for(let i = 0; i < this._address_array.length; i++){
            if(this._address_array[i].coord){
                queryArray.push(this._address_array[i].coord);
            }else{
                queryArray.push(this._address_array[i].address);
            }
        }
        return queryArray;
    }

    /*Обновляем массив адресов. Заполняем поля Адрес или Координаты если чего-то не хватает. 
    Необходимые данные получаем из результатов геокодинга*/
    this._updateAddressArray = function(index, address, coords){
        if(!this._address_array[index].coord){
            this._address_array[index].coord = coords;
        }else{
            this._address_array[index].address = address;
        }
    }

    Object.defineProperty(this, 'address_array', {
        get() {/*Геттер. Отдаёт массив с адресами*/
            return this._address_array;
        },
        set(value) {/*Сеттер. Принимает новый массив с адресами и перерисовывает карту*/
            this._address_array = value;
            this._drawPath();
        }
    });
}

export {Map};