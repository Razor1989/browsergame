angular.module('app.game', [])
    .controller('gameCtrl', function ($rootScope, $location, user, socket) {
        if (user.getName() === '' || user.getName() === undefined) $location.path('/login');
        if ($location.path() == '/game') {
            console.log('GAME CONTROLLER LOADED');
            var self = this;
            var players = [];
            var char = {};
            var cursor;
            var Game = {};

            Game.preload = function () {
                Game.scene = this;
                this.load.image('tileset1', '/assets/terrain_atlas.png');
                this.load.image('player', '/assets/player.png');
                this.load.tilemapTiledJSON('map1', '/maps/map1.json');

            }

            Game.create = function () {

                this.input.on('pointerup',handleClick);

                Game.camera = this.cameras.main;
                Game.map = Game.scene.make.tilemap({key: 'map1'});
                var tiles = Game.map.addTilesetImage('tileset1', 'tileset1');
                Game.map.createStaticLayer(0, tiles, 0, 0);

                Game.marker = this.add.graphics();
                Game.marker.lineStyle(3, 0xffffff, 1);
                Game.marker.strokeRect(0, 0, Game.map.tileWidth, Game.map.tileHeight);



                cursor = this.input.keyboard.createCursorKeys();
                var player = {
                    name: user.getName(),
                    id: user.getId()
                };

                Game.finder = new EasyStar.js();

                // We create the 2D array representing all the tiles of our map
                var grid = [];
                for(var y = 0; y < Game.map.height; y++){
                    var col = [];
                    for(var x = 0; x < Game.map.width; x++){
                        // In each cell we store the ID of the tile, which corresponds
                        // to its index in the tileset of the map ("ID" field in Tiled)
                        col.push(getTileID(x,y));
                    }
                    grid.push(col);
                }
                Game.finder.setGrid(grid);

                var tileset = Game.map.tilesets[0];
                var properties = tileset.tileProperties;
                var acceptableTiles = [];

                // We need to list all the tile IDs that can be walked on. Let's iterate over all of them
                // and see what properties have been entered in Tiled.
                for(var i = tileset.firstgid-1; i < tiles.total; i++){ // firstgid and total are fields from Tiled that indicate the range of IDs that the tiles can take in that tileset
                    if(!properties.hasOwnProperty(i)) {
                        // If there is no property indicated at all, it means it's a walkable tile
                        acceptableTiles.push(i+1);
                        continue;
                    }
                    if(!properties[i].collide) acceptableTiles.push(i+1);
                    if(properties[i].cost) Game.finder.setTileCost(i+1, properties[i].cost); // If there is a cost attached to the tile, let's register it
                }
                Game.finder.setAcceptableTiles(acceptableTiles);


                socket.emit('socketId', player);
                socket.on('allPlayers', function (data) {
                    angular.forEach(data, function (player) {
                        addPlayer(player);
                    })
                })

                socket.on('newPlayer', function (player) {
                    addPlayer(player);
                })

                socket.on('deletePlayer', function (id) {
                    angular.forEach(players, function (player, index) {
                        if (player.socket === id) players.splice(index, 1);
                    })
                })

                socket.on('move', function (data) {
                    console.log('--- MOVE ---');
                    angular.forEach(players, function (player, index) {
                        console.log('--------------------------------');
                        console.log('Player: ' + player.socket + ' | Data Socket: ' + data.socket);
                        if (player.socket == data.socket){
                            players[index].x = data.x;
                            players[index].y = data.y;
                            moveCharacter(data.path, player.sprite);
                        }
                    })
                })
            }

            Game.update = function () {
                var worldPoint = this.input.activePointer.positionToCamera(this.cameras.main);

                var pointerTileX = Game.map.worldToTileX(worldPoint.x);
                var pointerTileY = Game.map.worldToTileY(worldPoint.y);
                Game.marker.x = Game.map.tileToWorldX(pointerTileX);
                Game.marker.y = Game.map.tileToWorldY(pointerTileY);
                checkCollision(pointerTileX, pointerTileY);
                if (cursor.left.isDown) {
                    var newX = Game.blabla.x--;
                }

            }

            var config = {
                type: Phaser.AUTO,
                width: 600,
                height: 600,
                parent: 'game',
                scene: [Game]
            }

            var game = new Phaser.Game(config);

            self.test = function () {
                console.log(user.getY() + ' | ' + user.getX());
            }

            self.name = user.getName();
            self.id = user.getId();
            self.socket = user.getSocketId();
            self.x = user.getX();
            self.y = user.getY();

            function addPlayer(player) {
                var sprite = Game.scene.add.sprite(player.x * 16, player.y * 16, 'player');
                sprite.setDepth(1);
                sprite.setOrigin(0, 0.5);
                player.sprite = sprite;
                players.push(player);
                if (player.id === user.getId()) {
                    console.log('OWN PLAYER');
                    user.setX(player.x);
                    user.setY(player.y);
                    user.setSprite(sprite);
                }
            }

            function checkCollision(x, y) {
                var tile = Game.map.getTileAt(x, y);
                if (tile.properties.collide) {
                    self.collide = 'DSA'
                } else {
                    self.collide = '';
                }
                return tile.properties.collide == true;
            }

            function getTileID(x,y){
                var tile = Game.map.getTileAt(x, y);
                return tile.index;
            };

            function handleClick(pointer){
                var x = Game.camera.scrollX + pointer.x;
                var y = Game.camera.scrollY + pointer.y;
                var toX = Math.floor(x/32);
                var toY = Math.floor(y/32);
                var fromX = Math.floor(user.getSprite().x/32);
                var fromY = Math.floor(user.getSprite().y/32);
                console.log('going from ('+fromX+','+fromY+') to ('+toX+','+toY+')');
                user.setX(toX);
                user.setY(toY);

                Game.finder.findPath(fromX, fromY, toX, toY, function( path ) {
                    if (path === null) {
                        console.warn("Path was not found.");
                    } else {
                        console.log(path);
                        var data = {
                            path: path,
                            x: toX,
                            y: toY
                        }
                        socket.emit('move', data);
                        // moveCharacter(path);
                    }
                });
                Game.finder.calculate(); // don't forget, otherwise nothing happens
            };

            function moveCharacter(path, sprite){
                console.log('PATH MOVE');
                // Sets up a list of tweens, one for each tile to walk, that will be chained by the timeline
                var tweens = [];
                for(var i = 0; i < path.length-1; i++){
                    var ex = path[i+1].x;
                    var ey = path[i+1].y;
                    tweens.push({
                        targets: sprite,
                        x: {value: ex*Game.map.tileWidth, duration: 300},
                        y: {value: ey*Game.map.tileHeight, duration: 300}
                    });
                }

                Game.scene.tweens.timeline({
                    tweens: tweens
                });
            };
        }
    })