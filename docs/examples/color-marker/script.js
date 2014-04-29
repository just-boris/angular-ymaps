//кофигурация модуля, использующего карты
angular.module('MyApp', ['ymaps']).config(function(ymapsConfig) {
    //выставляем синий цвет иконкам вместо зеленого
    ymapsConfig.markerOptions.preset = 'islands#darkblueDotIcon';
});
