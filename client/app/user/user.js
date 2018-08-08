angular.module('app.user', [])
    .factory('user', function () {
        name: '';
        id: 0;
        socketId: '';
        sprite: '';
        x: 0;
        y: 0;
        return {

            setName: function (name) {
                this.name = name;
            },

            getName: function () {
                return this.name;
            },

            setId: function (id) {
                this.id = id;
            },

            getId: function () {
                return this.id;
            },

            setSocketId: function (id) {
                this.socketId = id;
            },

            getSocketId : function () {
                return this.socketId;
            },

            setSprite: function (sprite) {
                this.sprite = sprite;
            },

            getSprite: function () {
                return this.sprite;
            },

            setX: function (x) {
                this.x = x;
            },

            getX: function () {
                return this.x;
            },

            setY: function (y) {
                this.y = y;
            },

            getY: function () {
                return this.y;
            }

        }
    })