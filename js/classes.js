/**
 * Created by mbury on 9/26/2014.
 */

"use strict";

function Factory() {
    this.lastObjectIndex = 0;
    this.scope = [];
}

Factory.prototype.init = function() {
    this.lastObjectIndex =  0;
};

Factory.prototype.createObject = function(objectType, option) {
    var object = {};
    switch (objectType) {
        case 'human':
            object = new Human(option);
        break;
        case 'zombie':
            if (!option) {
                throw '[FACTORY] Missing options in factory';
            }
            object = new Zombie(option);
        break;
        case 'wall':
            if (!option) {
                throw '[FACTORY] Missing option in factory';
            }
            object = new Wall(option);
        break;
    }
    object.id = this.lastObjectIndex;
    this.lastObjectIndex += 1;
    this.scope.push(object);
    return object;
}


function Human(option) {
    this.isInfected = false;
    this.health = 50;
    this.maxHealth = this.health;
    this.immunity = 0.1;
    this.maxImmunity = this.immunity;
    this.isDie = false;
    this.hasAction = true;
    this.weapon = {
        damage: {
            min: 10,
            max: 15
        },
        radius: 5
    };
    this.viewRange = 400;


    if (!option) {
        throw '[HUMAN] Cant create human without option';
    }

    if (!option.position) {
        throw '[HUMAN] Cant create human without start coordinate. Please send in option';
    }
    this.position = {
        x: option.position.x,
        y: option.position.y
    };
    this.speed = Math.floor(Math.random() * 1000) + 1000;
    this.maxSpeed = this.speed;
}


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

Human.prototype.askData = function() {
    return {
        question: {
            class: 'map',
            method: 'canIPut',
            data: {
                x: this.position.x - 1,
                y: this.position.y - 1
            }
        },
        success: {
            callback: null,
            class: 'map',
            method: 'moveObject',
            data: {
                x: this.position.x - 1,
                y: this.position.y - 1
            }
        }
    };
};

Human.prototype.action = function(option) {
    if (option) {
        this.move(option.newX, option.newY);
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
}


function Zombie(human) {
    this.speed  = Math.floor(human.maxSpeed * 0.7);
    this.position = human.position;
    this.weapon.damage.min = Math.floor(this.weapon.damage.min * 4);
    this.weapon.damage.max = Math.floor(this.weapon.damage.max * 8);
    this.isDie = false;
    this.health = human.maxHealth * 2;
    this.viewRange = Math.floor(human.viewRange * Math.random() * 0.5);
}

Zombie.prototype = Object.create(Human.prototype);
Zombie.prototype.move = function() {
    if (!this.isDie) {
        var nearstHuman = null;  //findNearsHuman(this);
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
    var nearstHuman = null;// findNearsHuman(this);
    if (nearstHuman) {
        if (nearstHuman.distance <= this.weapon.radius) {
            return {human: nearstHuman.human, damage: this.getDamage()}
        }
    }
    return {human: null, damage: 0};
};


function Map() {
    this.size = {
        width: 300,
        height: 100
    }
    this.field = [];
    this.init();
}

Map.prototype.init = function() {
    this.field = new Array(this.size.width);
    for (var i = 0; i < this.size.width; i+= 1) {
        this.field[i] = new Array(this.size.height);
        for (var j = 0; j < this.size.height; j += 1) {
            this.field[i][j] = [];
        }
    }
};

Map.prototype.addElement = function(object, position) {
    if (!position) {
        throw '[Map.addElement] Position in null';
    }
    if (!this.field[position.x]) {
        this.field[position.x] = [];
    }
    if (!this.field[position.x][position.y]) {
        this.field[position.x][position.y] = [];
    }
    this.field[position.x][position.y].push(object);
};

Map.prototype.removeElement = function (objectId, position) {
    var index = this.field[position.x][position.y].indexOf(objectId);
    if (index > -1) {
        this.field[position.x][position.y].splice(index, 1);
    }
};

Map.prototype.canIPut = function(position, object) {
    if (this.field[position.x][position.y].length == 0) {
       return true;
    }

    return false;
    /*for (var i = 0; i < this.field[position.x][position.y].length; i +=1 ) {

    }*/
};

Map.prototype.getEmptyPosition = function() {
    var x = Math.floor(Math.random() * this.size.width),
        y = Math.floor(Math.random() * this.size.height),
        count = 0;

    while (!this.canIPut({x: x, y: y})) {
        x = Math.floor(Math.random() * this.size.width);
        y = Math.floor(Math.random() * this.size.height);
        count += 1;
        if (count > 1000) {
            return null;
        }
    }

    return {x: x, y: y};
};

Map.prototype.createFromData = function(data) {
    for (var x = 0; x < data.length; x += 1) {
        for (var y = 0; y < data[x].length; y += 1) {
            switch (data[x][y].toUpperCase()) {
                case 'W':
                    this.field[y][x].push(factory.createObject('wall', {position: {x: x, y: y}}));
                    break;
            }
        }
    }

    Utills.debug('[CreateFromData]', 'Data loaded');

    this.size = {
        height: data.length,
        width: data[0].length
    };

    return this.size;
};


Map.prototype.moveObject = function(object, position) {
    var cell = this.field[object.position.x][object.position.y];

    for (var i = 0; i < cell.length; i += 1) {
        if (cell[i].id = object.id) {
            cell.splice(i, 1);
            break;
        }
    }
    this.field[position.x][position.y].push(object);
};

function Wall(option) {
    if (!option) {
        throw '[WALL] Cant create object without options'
    }
    this.position = option.position;
    this.hasAction = false;
    this.visibility = false;
    this.health = 3000;
}