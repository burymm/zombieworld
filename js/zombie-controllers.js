/**
 * Created by nikolay.bury on 27.03.14.
 */

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
        width: 30,
        height: 30,
        cellSize: 10
    }
    // end settings

    // twitter settings
    $scope.twitter = {
        message: 'Zombie won. I get 300 score. Can you get more?'
    }
    // end twitter settings

    var time = 0,
        gameTimer,
        timeLeft;

    function Virus() {
        return {
            damage: 5
        };
    };

    function Human() {
        this.position = {
                x: Math.floor(Math.random() * $scope.field.width) * $scope.field.cellSize,
                y: Math.floor(Math.random() * $scope.field.height) * $scope.field.cellSize
            };

        this.isInfected = false;
        this.health = 50;
        this.maxHealth = this.health;
        this.immunity = 0.1;
        this.maxImmunity = this.immunity;
        this.isDie = false;
        this.speed = Math.floor(Math.random() * 1000) + 1000;
        this.maxSpeed = this.speed;
        this.weapon = {
                damage: {
                    min: 10,
                    max: 15
                },
                radius: 5
            };
        this.viewRange = 400;
    };


    Human.prototype.move = function(newX, newY) {
        if (this.health <= 0) {
            this.isDie = true;
        } else {
            if (newX) {
                this.position.x = newX;
            } else {
                this.position.x += (Math.floor(Math.random() * 3) - 1);
            }

            if (newY) {
                this.position.y = newY;
            } else {
                this.position.y += (Math.floor(Math.random() * 3) - 1);
            }
        }
    };


    function resurectZombie(human) {
        $scope.zombies.push(new Zombie(human));
        var index = $scope.humans.indexOf(human);
        $scope.humans.splice(index,1);
    }

    $scope.humanClick = function(human) {
        if (!$scope.game.current.virusInWay) {
            //human.speed *= 5;
            console.log(human);
            resurectZombie(human);
            $scope.game.current.virusInWay = true;
        }
    };

    function findNearsHuman(zombie) {
        if ($scope.humans.length > 0) {
            var length = _.map($scope.humans, function (human) {
                return {human: human, distance: Math.sqrt(Math.pow(human.position.x - zombie.position.x, 2) + Math.pow(human.position.y - zombie.position.y, 2))};
            });
            var sorted = _.sortBy(length, function (item) {
                return item.distance;
            });
            if (sorted[0].distance <= zombie.viewRange) {
                return sorted[0];
            }
        }

        return null;
    };

    function Zombie(human) {
        this.speed  = Math.floor(human.maxSpeed * 0.7);
        this.position = human.position;
        this.weapon.damage.min = Math.floor(this.weapon.damage.min * 4);
        this.weapon.damage.max = Math.floor(this.weapon.damage.max * 8);
        this.isDie = false;
        this.health = human.maxHealth * 2;
        this.viewRange = Math.floor(human.viewRange * Math.random() * 0.5);
    }

    Zombie.prototype = new Human();
    Zombie.prototype.move = function() {
        if (!this.isDie) {
            var nearstHuman = findNearsHuman(this);
            if (nearstHuman) {
                var nearsHumanPosition = nearstHuman.human.position;

                if (nearsHumanPosition.x < this.position.x) {
                    this.position.x -= 1;
                } else {
                    this.position.x += 1;
                }

                if (nearsHumanPosition.y < this.position.y) {
                    this.position.y -= 1;
                } else {
                    this.position.y += 1;
                }

            }   else {
                Human.prototype.move.call(this, null);
            }
        }
    };

    Zombie.prototype.timeLeft = function() {
        this.health -= (9 - this.immunity * 5);
        if (this.health <= 0) {
            this.isDie = true;
            this.justDied = true;
        }
    };

    Zombie.prototype.getDamage = function() {
        var damage = this.weapon.damage;
        return Math.floor(Math.random() * (damage.max - damage.min) + damage.min);
    };

    Zombie.prototype.canAttack = function() {
        var nearstHuman = findNearsHuman(this);
        if (nearstHuman) {
            if (nearstHuman.distance <= this.weapon.radius) {
                return {human: nearstHuman.human, damage: this.getDamage()}
            }
        }
        return {human: null, damage: 0};
    };










    $scope.renderMap = function() {
        var $map = $('#field');
        /*$map.html('');
        _.each($scope.humans, function(human) {
            var $human = $('<div class="human" ng-click="humanClick()">H</div>');
            $human.css({top: human.position.y, left: human.position.x});
            $map.append($human);
        });
        */

        if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
            $scope.$apply();
        }
    };


    function getScores() {
        return ($scope.zombies.length - $scope.zombies.died) + //living zombie
            ($scope.humans.died); // killed peoples
    };

    function gameOver(message) {
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
        clearInterval(gameTimer);
    };


    function gameCycle() {
        if ($scope.humans.length <= 0) {
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
                        resurectZombie(human);
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
        }

    }

    function timeLeftCycle() {
        // if pass 1 second
            _.each($scope.zombies, function(zombie) {
                zombie.timeLeft();
            });
    }

    $scope.newGame = function() {
        var humans = [];
        for (var i = 0; i < $scope.game.humans; i += 1) {
            humans.push(new Human());
        }
        $scope.humans = humans;
        $scope.humans.died = 0;

        $scope.zombies = [];
        $scope.zombies.died = 0;
        $scope.game.current.virusInWay = false;

        // render map
        $scope.renderMap();


        time = 0;
        gameTimer = setInterval(gameCycle, 1);
        timeLeft = setInterval(timeLeftCycle, $scope.game.speed);
        console.log($scope.humans);

        $scope.game.isOver = false;
    }
});


// first commit