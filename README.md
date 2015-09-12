[Angular JS]: http://angularjs.org
[ymaps.GeoObject]: http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/GeoObject.xml
Angular-ymaps [![Build Status](https://travis-ci.org/just-boris/angular-ymaps.svg?branch=master)](https://travis-ci.org/just-boris/angular-ymaps)
=============

Yandex Maps API as an Angular JS direcitive.

Это модуль для [Angular JS], предназначенный для простого подключения и работы с Яндекс-картами. С его помощью можно
вставлять Яндекс карту на страницу через html-тег, так же просто как `img` или `button`

###<a href="http://catatron.com/angular-ymaps/" class="hidden">Документация и пример использования</a>

###Подключение

* Скачать [библиотеку](http://catatron.com/angular-ymaps/angular-ymaps.js) или ее [упакованную версию](http://catatron.com/angular-ymaps/angular-ymaps.min.js)
* Подключить скрипт на страницу
  `<script src="angular-ymaps.js"></script>`
* Добавить модуль `ymaps` в зависимости своего angular-приложения
  `angular.module('MyApp', ['ymaps'])`
* Теперь можно использовать в HTML новые теги
  - `<yandex-map>` - Яндекс-карта
  - `<ymap-marker>` - маркер на карте, вставляется только внутрь тега `<yandex-map>`

#### Bower

Можно установить библиотеку из bower:

    bower install angular-ymaps --save

### API

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

* **apiUrl**(String) - ссылка для загрузки API карт. Может переопределяться для загрузки другой версии.
    По умолчанию загружается `2.0-stable`
* **mapBehaviors**(Array) - возможные поведения карты, массив ключей, которые принимает [ymaps.map.behavior.Manager](http://api.yandex.ru/maps/doc/jsapi/2.x/ref/reference/map.behavior.Manager.xml).
    Стандартное значение: *['default']*
* **markerOptions**(Object) - опции, передаваемые [ymaps.GeoObject], то есть настройки внешнего вида и поведения маркеров
на карте. Стандартное значение: *{preset: 'twirl#darkgreenIcon'}*
* **fitMarkers**(Boolean) - автоматически подстраивать видимую область и масштаб карты, чтобы было видно все точки на
карте. Стандартное значение: *true*
