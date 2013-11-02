Angular-ymaps
=============

Yandex Maps API as an Angular JS direcitive

###[Документация и пример использования](http://catatron.com/angular-ymaps/)

###Подключение

* Скачать [библиотеку](http://catatron.com/angular-ymaps/angular-ymaps.js) или ее [упакованную версию](http://catatron.com/angular-ymaps/angular-ymaps.min.js)
* Подключить скрипт на страницу <br> 
  `<script src="angular-ymaps.js"></script>`
* Добавить модуль `ymaps` в зависимости своего angular-приложения <br>
  `angular.module('MyApp', [ymaps])`
* Теперь можно использовать в HTML новые теги 
  - `<yandex-map>` - Яндекс-карта
  - `<ymap-marker>` - маркер на карте, вставляется только внутрь тега `<yandex-map>`

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
