angular.module('app.login', [])
.controller('loginCtrl', function ($http, $location, user) {
    var self = this;
    function clickLogin() {
        if (self.name !== undefined && self.pass !== undefined) {
            var userData = {
                name: self.name,
                pass: self.pass
            };
            $http.post('/login', userData).then(function (value) {
               user.setName(value.data.name);
               user.setId(value.data.id);
               $location.path('/game')

            })
        }
    }

    self.test = function () {
        user.setName('Admin');
        user.setId(1);
        console.log('DAS' + $location.path('/game'))

    };

    self.clickLogin = clickLogin;
})