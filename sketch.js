let started;
let difficulty;
let sprites;
let balloons;
let player;
let points;
let highscore;
let burst;
let drone;
let droneSprites;
let begin;
let logo;

function preload() {
    burst = loadSound('assets/burst.mp3');
    logo = loadImage('assets/BurstedBalloons.png')
    loadPlayerSprites();
    loadDroneSprites();
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    noSmooth();
    frameRate(60);
    started = false;
    difficulty = 1;
    player = new Player();
    drone = new Drone(player.pos.x);
    balloons = [];
    highscore = 0;
    begin = 0;
    let data = getItem('highscore');
    if(data) points = data; else points = 0;
    // points = 0;
    balloons.push(new Balloon(drone.x, 100, 75, 2, color(random(255), random(255), random(255))));
}

function draw() {
    if(started) {
        background(0, 100, 200);
        if(begin > 50) difficulty = 2;
        if(begin >= highscore) {
            highscore = points;
        };
        storeItem('highscore', points);
        player.show();
        player.update();
        drone.update();
        drone.show();
        let i = 0;
        balloons.forEach(balloon => {
            balloon.update();
            balloon.show();
            if(balloon.removed) {
                begin -= 10
                balloons.splice(i, 1);
                if(difficulty == 1) balloons.push(new Balloon(drone.x, 100, 75, 2, color(random(255), random(255), random(255))));
                if(difficulty == 2) balloons.push(new Balloon(drone.x, 100, 50, 3, color(random(255), random(255), random(255))));
            };
            i++;
        });
        fill(255, 255, 255);
        textSize(40);
        text('All: ' + points, 20, 50);
        text('Points: ' + begin, 20, 90);
    } else {
        background(0, 100, 200);
        image(logo, 0, 0, width, height * 1.5);
        push();
        textAlign(CENTER);
        textSize(30);
        fill(255);
        text('Press on screen to start.', width/2, height/1.5);
        pop();
    }
}

function mousePressed() {
    if(!started) started = true;
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
    player.pos.y = height - 85;
}

function loadPlayerSprites() {
    sprites = {
        hands: loadImage('assets/hands.png'),
        idle: loadImage('assets/player_idle.png'),
        right: [loadImage('assets/player_walk_left_0.png'), loadImage('assets/player_walk_left_1.png'), loadImage('assets/player_walk_left_2.png')],
        left: [loadImage('assets/player_walk_right_0.png'), loadImage('assets/player_walk_right_1.png'), loadImage('assets/player_walk_right_2.png')]
    }
}

function loadDroneSprites() {
    droneSprites = [loadImage('assets/drone_0.png'), loadImage('assets/drone_1.png'), loadImage('assets/drone_2.png'), loadImage('assets/drone_3.png'), loadImage('assets/drone_4.png'), loadImage('assets/drone_5.png'), loadImage('assets/drone_6.png'),]
}

class Balloon {
    constructor(x, y, r, g, c) {
        this.pos = createVector(x, y);
        this.radius = r;
        this.gravity = g;
        this.vel = createVector(0, 0)
        this.color = c;
        this.touched = 0;
    }

    update() {
        this.touched++;
        this.vel.y += 0.1;
        this.pos.add(this.vel);
        this.removed = this.pos.y > height + this.radius * 0.75;
        let d = p5.Vector.sub(this.pos, player.hand);
        if(d.mag() < this.radius) {
            this.vel = d.copy();
            this.vel.setMag(4);
            if(this.touched > 60) {
                points++;
                begin++;
                this.touched = 0;
            }
        };
        if(d.mag() < this.radius * 0.60) {
            this.removed = true;
            burst.play();
        };
        if(this.vel.y > 0) this.vel.y = this.gravity; 
    }

    show() {
        fill(this.color);
        strokeWeight(4);
        rectMode(CENTER);
        rect(this.pos.x, this.pos.y, this.radius, this.radius / 0.75, this.radius);
        circle(this.pos.x, this.pos.y + this.radius * 0.75, this.radius/5)
    }
}

class Player {
    constructor() {
        this.walking = false;
        this.animation = 'idle';
        this.frame = 0;
        this.pos = createVector(width/2, height - 85);
        this.hand = createVector(mouseX, 150);
    }

    update() {
        this.animation = 'idle';
        let hand = createVector(mouseX, mouseY);
        hand.sub(this.pos);
        if(hand.mag() > 150 && !this.walking) this.walking = true;
        if(hand.mag() > 100 && hand.x > 80 && this.walking) {
            this.pos.x += 2;
            this.animation = 'right';
        };
        if(hand.mag() > 100 && hand.x < 80 && this.walking) {
            this.pos.x -= 2;
            this.animation = 'left';
        };
        if(hand.mag() < 100 && this.walking) {
            this.walking = false;
            this.animation = 'idle';
        };
        hand.limit(75);
        this.hand = this.pos.copy();
        this.hand.add(hand);
        this.frame += 0.1;
    }

    show() {
        fill(0, 200, 100);
        rectMode(CENTER);
        // rect(this.pos.x, this.pos.y, 100, 150, 50);
        // circle(this.hand.x, this.hand.y, 50);
        imageMode(CENTER);
        switch(this.animation) {
            case 'idle':
                image(sprites.idle, this.pos.x, this.pos.y, 150, 150);
                push();
                stroke(0);
                strokeWeight(20);
                line(this.pos.x - 30, this.pos.y - 25, this.hand.x - 15, this.hand.y);
                line(this.pos.x + 10, this.pos.y - 25, this.hand.x + 15, this.hand.y);
                stroke(225, 190, 160);
                strokeWeight(14);
                line(this.pos.x - 30, this.pos.y - 25, this.hand.x - 15, this.hand.y);
                line(this.pos.x + 10, this.pos.y - 25, this.hand.x + 15, this.hand.y);
                pop();
                break;

            case 'left':
                image(sprites.left[Math.floor(this.frame) % 3], this.pos.x, this.pos.y, 150, 150);                push();
                push();
                stroke(0);
                strokeWeight(20);
                line(this.pos.x - 10, this.pos.y - 25, this.hand.x - 15, this.hand.y);
                line(this.pos.x + 20, this.pos.y - 25, this.hand.x + 15, this.hand.y);
                stroke(225, 190, 160);
                strokeWeight(14);
                line(this.pos.x - 10, this.pos.y - 25, this.hand.x - 15, this.hand.y);
                line(this.pos.x + 20, this.pos.y - 25, this.hand.x + 15, this.hand.y);
                pop();
                break;

            case 'right':
                image(sprites.right[Math.floor(this.frame) % 3], this.pos.x, this.pos.y, 150, 150);
                push();
                stroke(0);
                strokeWeight(20);
                line(this.pos.x - 30, this.pos.y - 25, this.hand.x - 15, this.hand.y);
                line(this.pos.x + 10, this.pos.y - 25, this.hand.x + 15, this.hand.y);
                stroke(225, 190, 160);
                strokeWeight(14);
                line(this.pos.x - 30, this.pos.y - 25, this.hand.x - 15, this.hand.y);
                line(this.pos.x + 10, this.pos.y - 25, this.hand.x + 15, this.hand.y);
                pop();
                break;
        }
        image(sprites.hands, this.hand.x, this.hand.y, 75, 75);
        
    }
}

class Drone {
    constructor(x) {
        this.x = x;
        this.frame = 0;
    }

    update() {
        if(this.x > player.pos.x) this.x -= 1.5;
        if(this.x < player.pos.x) this.x += 1.5;
        this.frame++;
    }

    show() {
        imageMode(CENTER);
        image(droneSprites[this.frame % 7], this.x, 40, 80, 80);
    }
}
