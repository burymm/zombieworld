/**
 * Created by nikolay.bury on 27.03.14.
 */

"use strict";


var factory = new Factory();


var zombieWorldApp = angular.module('zombieWorld', []);

zombieWorldApp.controller('ZombieGameController', function ($scope) {
    // settings
    $scope.game = {
        version: '0.0.1',
        humans: 10,
        current: {
            virusInWay: false
        },
        speed: 1000,
        isOver: false
    };
    $scope.field = {
        size: {
            width: 50,
            height: 30
        },
        cellSize: 10,
        battleFiledId: '#battle-field'
    };
    // end settings

    // twitter settings
    $scope.twitter = {
        message: 'Zombie won. I get 300 score. Can you get more?'
    };
    // end twitter settings

    var time = 0,
        gameTimer = null,
        timeLeft = null;

    function Virus() {
        return {
            damage: 5
        };
    }




    function resurectZombie(human, zombie) {

        $scope.zombies.push(zombie);
        var index = $scope.humans.indexOf(human);
        $scope.humans.splice(index,1);
    }

    $scope.humanClick = function(human) {
        if (!$scope.game.current.virusInWay) {
            //human.speed *= 5;
            console.log(human);
            resurectZombie(human, factory.createObject('zombie', human));
            $scope.game.current.virusInWay = true;
        }
    };














    $scope.renderMap = function(option) {
        var CELL_SIZE = $scope.field.cellSize;
        var $map = $('#field');
        /*$map.html('');
        _.each($scope.humans, function(human) {
            var $human = $('<div class="human" ng-click="humanClick()">H</div>');
            $human.css({top: human.position.y, left: human.position.x});
            $map.append($human);
        });
        */




        if (option && option.redraw) {

            $scope.fieldWidth = $scope.field.size.width *  $scope.field.cellSize;
            $scope.fieldHeight = $scope.field.size.height *  $scope.field.cellSize;

            var map = document.getElementById('battle-field'),
                ctx = map.getContext('2d');

            ctx.clearRect(0, 0, map.width, map.height);
            console.log('cleared');

            for (var x = 0; x < $scope.field.size.width; x += 1) {
                for (var y =0; y < $scope.field.size.height; y += 1) {
                    if ($scope.map.field[x][y].length > 0) {
                        for (var i = 0; i < $scope.map.field[x][y].length; i <= 1) {
                            if ($scope.map.field[x][y][i] instanceof Wall)                            {
                                ctx.fillStyle = "#FF0000";
                                ctx.fillRect(x * CELL_SIZE,y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                                break;
                            }

                            if ($scope.map.field[x][y][i] instanceof Human)                            {
                                ctx.fillStyle = "#00FF00";
                                ctx.fillRect(x * CELL_SIZE,y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                                break;
                            }
                        }
                    }

                }
            }
        }


        // redraw map by angular
        if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
            $scope.$apply();
        }

    };


    function getScores() {
        return ($scope.zombies.length - $scope.zombies.died) + //living zombie
            ($scope.humans.died); // killed peoples
    };

    function gameOver(message) {
        clearInterval(gameTimer);

        var displayMessage = message + '\n' +
            'You received ' + getScores() + ' score.';
        alert(displayMessage);
        $scope.game.isOver = true;
        $scope.twitter.message = displayMessage;


        var $twitterWrapper = $('#twitter-wrapper'),
            $twitterLink = $('<a href="https://twitter.com/share" class="twitter-share-button" data-lang="en" data-text="' + displayMessage + '">Tweet</a>');


        $twitterWrapper.html('');
        $twitterWrapper.append($twitterLink);

        twttr.widgets.load();
        //!function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="https://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");
        $scope.renderMap();

    };


    function gameCycle() {
 /*       if ($scope.humans.length <= 0) {
            gameOver('Zombie wins');
        } else {


            var isMapUpdate = false;
            _.each($scope.humans, function (human) {
                var timeMove = Math.floor(($scope.field.cellSize / human.speed).toFixed(4) * 1000);
                if (human.isDie) {
                    $scope.humans.died += 1;
                }
                if (time % timeMove == 0) {
                    // human can move on one cell in each direction
                    human.move();
                    if (human.isDie) {
                        resurectZombie(human, factory.createObject('zombie', human));
                        $scope.humans.died += 1;
                    }
                    isMapUpdate = true;
                }
            });

            if ($scope.zombies.died < $scope.zombies.length) {
                $scope.zombies.died = 0;
                _.each($scope.zombies, function (zombie) {
                    var timeMove = Math.floor(($scope.field.cellSize / zombie.speed).toFixed(4) * 1000);
                    if (zombie.isDie) {
                        $scope.zombies.died += 1;
                    }
                    if (time % timeMove == 0) {
                        // human can move on one cell in each direction
                        zombie.move();
                    }

                    if (time % Math.floor(1 / zombie.speed * 1000000) == 0) {
                        if (!zombie.isDie) {
                            var canAttack = zombie.canAttack();
                            if (canAttack.human) {
                                canAttack.human.health -= canAttack.damage;
                                console.log(canAttack.human.isDie);
                            }
                            isMapUpdate = true;
                        }
                    }
                });
            } else {
                if ($scope.game.current.virusInWay) {
                    gameOver('Human wins');
                }
            }

            time += 1;
            if (isMapUpdate) {
                $scope.renderMap();
                //console.log($scope.humans);
            }
        }*/

        for (var x = 0; x < $scope.map.size.width; x += 1) {
            for (var y = 0; y < $scope.map.size.height; y += 1) {
                if ($scope.map.field[x][y].length > 0) {
                    var cell = $scope.map.field[x][y]
                    for (var i = 0; i < cell.length; i += 1) {
                        if (cell[i].hasAction) {
                            var askData = cell[i].askData();
                            if ($scope[askData.question.class][askData.question.method](askData.question.data)) {
                                if (askData.success.callback) {
                                    askData.success.callback.apply(cell[i], askData.success.data);
                                } else {
                                    $scope[askData.success.class][askData.success.method](this, askData.success.data)
                                }
                                console.log(cell[i].position);
                            }

                        }
                    }
                }
            }
        }

        $scope.renderMap({redraw: true});

    }



    function timeLeftCycle() {
        // if pass 1 second
            _.each($scope.zombies, function(zombie) {
                zombie.timeLeft();
            });
    }

    $scope.newGame = function() {
        if (gameTimer) {
            clearInterval(gameTimer);
        }
        if (timeLeft) {
            clearInterval(timeLeft);
        }

        factory = new Factory();
        $scope.map = new Map();
        $scope.field.size = $scope.map.createFromData(Levels[0].map);


        var humans = [];
        for (var i = 0; i < $scope.game.humans; i += 1) {
            var position = $scope.map.getEmptyPosition();
            if (!position) {
                throw '[NEW GAME] Cant find empty position to put human.'
            }
            var human = factory.createObject('human', {position: position});
            $scope.map.addElement(human, human.position);
            humans.push(human);
        }
        console.log(humans);
        $scope.humans = humans;
        $scope.humans.died = 0;

        $scope.zombies = [];
        $scope.zombies.died = 0;
        $scope.game.current.virusInWay = false;




        time = 0;
        gameTimer = setInterval(gameCycle, 100);
        timeLeft = setInterval(timeLeftCycle, $scope.game.speed);
        console.log($scope.humans);

        $scope.game.isOver = false;


        // render map
        $scope.renderMap({redraw: true});
    }
});


// first commit