[Angular JS]: http://angularjs.org
[ymaps.GeoObject]: http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/GeoObject.xml
Angular-ymaps
=============

Yandex Maps API as an Angular JS direcitive.

Это модуль для [Angular JS], предназначенный для простого подключения и работы с Яндекс-картами. С его помощью можно
вставлять Яндекс карту на страницу как html-тег, так же просто как и `img` или `button`

###<a href="http://catatron.com/angular-ymaps/" class="hidden">Документация и пример использования</a>

###Подключение

* Скачать [библиотеку](http://catatron.com/angular-ymaps/angular-ymaps.js) или ее [упакованную версию](http://catatron.com/angular-ymaps/angular-ymaps.min.js)
* Подключить скрипт на страницу <br> 
  `<script src="angular-ymaps.js"></script>`
* Добавить модуль `ymaps` в зависимости своего angular-приложения <br>
  `angular.module('MyApp', [ymaps])`
* Теперь можно использовать в HTML новые теги 
  - `<yandex-map>` - Яндекс-карта
  - `<ymap-marker>` - маркер на карте, вставляется только внутрь тега `<yandex-map>`

####Тег yandex-map:

        <yandex-map center="map.center" zoom="map.zoom"></yandex-map>

Добавляет Яндекс-карту на страницу. Размеры карты определяются размерами элемента, их можно задать в css. При
создании нужно указать два обязательных атрибута:

* **center**(Array) - массив из двух чисел, широта и долгота центра карты
* **zoom**(Number) - число, от 0 до 23, масштаб карты. Во избежание ошибок нужно задавать разрешенный масштаб для
указанной области

####Тег ymap-marker:

Может использоваться только внутри тега карты, добавляет на нее точку. Имеются следующие атрибуты

* **coordinates**(Array) - массив из двух чисел, широта и долгота маркера на карте (обязательный)
* **index**(String) - текст, который пишется на маркере
* **properties**(Object) - свойства метки, передаются в [ymaps.GeoObject]. Здесь может быть текст балуна, который
    открывается при нажатии на метку, или всплывающей при наведении подсказки. Подробнее - в
    [документации Яндекс][ymaps.GeoObject], описание параметра properties.

####Глобальные настройки

Можно управлять видом и функциоальностью карты через свойства, вынесенные в константу `ymapsConfig`:

* **mapBehaviors**(Array) - возможные поведения карты, массив ключей, которые принимает [ymaps.map.behavior.Manager](http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/map.behavior.Manager.xml).
    Стандартное значение: *['default']*
* **markerOptions**(Object) - опции, передаваемые [ymaps.GeoObject], то есть настройки внешнего вида и поведения маркеров
на карте. Стандартное значение: *{preset: 'twirl#darkgreenIcon'}*
* **fitMarkers**(Boolean) - автоматически подстраивать видимую область и масштаб карты, чтобы было видно все точки на
карте. Стандартное значение: *true*

###Примеры использования

####Карта заданного масштаба с одним маркером в центре

Нужно просто задать кординаты и присвоить их атрибуту center для карты и coordinates для маркера

    <div ng-init="coords=[55.22, 35.33]">
        <yandex-map center="coords" zoom="'10'">
            <ymap-marker coordinates="coords"></ymap-marker>
        </yandex-map>
    </div>

####Маркер другого цвета

Это немножко сложнее, нужно переопределить свойство `markerOptions` в настройках модуля. HTML такой же, как и в прошлом
примере

**JS-код**

    //кофигурация модуля, использующего карты
    angular.module('MyApp', [ymaps]).config(function(ymapsConfig) {
        //выставляем синий цвет иконкам вместо зеленого
        ymapsConfig.markerOptions.preset = 'twirl#darkblueDotIcon';
    });

**HTML**

    <div ng-init="coords=[55.22, 35.33]">
        <yandex-map center="coords" zoom="'10'">
            <!-- а маркер теперь синий! -->
            <ymap-marker coordinates="coords"></ymap-marker>
        </yandex-map>
    </div>


####Маркеры на карте из массива
С помощью Angular JS эта задача решается крайне легко! Пример в действии можно увидеть прямо на этой странице

**JS-код**

    //нам нужно создать контроллер, если у вас его еще нет
    angular.module('MyApp', [ymaps]).controller('MapCtrl', function($scope) {
        //создаем массив координат. При желании его можно загружать и с сервера,
        //подробнее об этом - в документации Angular
        $scope.markers = [
            [54.46, 38.31],
            [53.57, 37.13],
            [53.14, 37.59],
        ];
        //настройки положения карты
        $scope.map = {
            center: [53.57, 37.13], zoom: 12
        }
    });

**HTML**

    <div ng-controller="MapCtrl">
        <yandex-map center="map.center" zoom="map.zoom">
            <!-- директива ng-repeat создаст все маркеры одним кодом  -->
            <ymap-marker ng-repeat="marker in markers" index="$index+1" coordinates="marker"></ymap-marker>
        </yandex-map>
    </div>


####Метки с текстом на карте
Этот пример, почти такой же, как и предыдущий, только нужно загрузить больше данных

**JS-код**

    angular.module('MyApp', [ymaps])).config(function(ymapsConfig) {
        //нужно сменить preset у карты, на специальный текстовый
        ymapsConfig.markerOptions.preset = 'twirl#darkgreenStretchyIcon';
    });
    .controller('MapCtrl', function($scope) {
        //создаем массив с данными для меток
        $scope.markers = [
            {coordinates:[54.46, 38.31], title: 'Пункт А'}
            {coordinates:[53.57, 37.13], title: 'Пункт Б'}
            {coordinates:[53.14, 37.59], title: 'Запасной пункт Б'}
        ];
        //настройки положения карты
        $scope.map = {
            center: [53.57, 37.13], zoom: 12
        }
    });

**HTML**

    <div ng-controller="MapCtrl">
        <yandex-map center="map.center" zoom="map.zoom">
            <!-- загружаем текст для метки в атрибут index -->
            <ymap-marker ng-repeat="marker in markers" index="marker.text" coordinates="marker.coordinates"></ymap-marker>
        </yandex-map>
    </div>

Но это еще не все, есть и другие варианты примения, для них - документация [Яндекс-карт](http://api.yandex.ru/maps/doc/intro/concepts/intro.xml)
и [AngularJS](docs.angularjs.org/api/) вам в помощь

###Feedback

Исходный код доступен на [GitHub](https://github.com/just-boris/angular-ymaps/). Проект открыт к изменениям,
принимаются пожелания и сообщения о багах в виде [issues](https://github.com/just-boris/angular-ymaps/issues) к этому
репозиторию

###Contributing

Проект собирается с помощью Grunt, для тестов используется Karma. Для сборки нужно сделать следующее

* Установить node.js
* Установить Grunt `npm install -g grunt-cli`
* Установить Karma `npm install -g karma`
* Склонировать этот проект `git@github.com:just-boris/angular-ymaps.git`
* В папке проекта выполнить `npm init`, установить локальные зависимости
* Сборка проекта выполняется командой `grunt`. В папке build будут собранные файлы
* Для тестирования во время разработки можно запустить karma в режиме сервера: `karma start --no-single-run`

Буду рад принять пожелания и дополнения. Удачного кодинга!
