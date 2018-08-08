angular.module('app', [
    'ngRoute',
    'app.user',
    'app.login',
    'ngMaterial',
    'ngMessages',
    'app.game'
])
    .config(function ($locationProvider, $routeProvider) {
        $locationProvider.hashPrefix('!');
        $routeProvider
            .when('/login', {
                templateUrl: 'app/login/login.html',
                controller: 'loginCtrl',
                controllerAs: 'ctrl'
        })
            .when('/game', {
                templateUrl: 'app/game/game.html',
                controller: 'gameCtrl',
                controllerAs: 'ctrl'
            })
        .otherwise('/login');
    })
    





