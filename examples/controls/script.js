//кофигурация модуля, использующего карты
angular.module('MyApp', ['ymaps']).config(function(ymapsConfig) {
    //используем только элементы управления панель поиска и ползунок масштаба
    ymapsConfig.mapControls = ['searchControl', 'zoomControl'];
});