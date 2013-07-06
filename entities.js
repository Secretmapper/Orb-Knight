/* -----

	game entities
		
	------			*/

	// CSS EDITOR:document.getElementsByTagName("canvas")[0].setAttribute("style","-webkit-filter: brightness(0.5)");
	
/* --------------------------
Player Entity
------------------------ */
var PlayerEntity = me.ObjectEntity.extend(
{	
		init:function (x, y, settings)
		{
			settings.image        = "vx_chara01_a";
			settings.spritewidth  = 32;
			settings.spriteheight = 48;
			
			// call the constructor
			this.parent(x, y, settings);
			
			// set the default horizontal & vertical speed (accel vector)
			this.setVelocity(3, 3);
         
			// adjust the bounding box
			this.updateColRect(0, 30, 16, 30);
			
			// set the display to follow our position on both axis
			me.game.viewport.follow(this.pos, me.game.viewport.AXIS.BOTH);
			
			this.attackTimer = 0;
			
			// enable the keyboard
			me.input.bindKey(me.input.KEY.A,"left");
			me.input.bindKey(me.input.KEY.D,"right");
			me.input.bindKey(me.input.KEY.W,"up");
			me.input.bindKey(me.input.KEY.S,"down");
			
			me.input.bindKey(me.input.KEY.K,"switch",true);
				
			this.directionString = "down";
			 
			var directions = [ "down", "left", "right", "up" ];
			for ( var i = 0; i < directions.length; i++ )
			{
				var index = i * 12;
				this.addAnimation( directions[ i ] + "idle", [index + 1] );
				this.addAnimation( directions[ i ] + "walk", [index, index + 1, index + 2 ] );
			}
			
			this.type = "heroes";
			this.hp = game.heroHP;
			this.collidable = true;
			this.timer = 0;
		},
		
		//knockback method
		knockback: function( damage, amt, length )
		{
			if(this.timer<=0)
			{
				this.timer = 100;
				me.game.HUD.setItemValue("score", 0);
				
				this.hp -= damage;
				//me.audio.play( "hit" );
				
				if ( this.hp <= 0 && !this.dieing)
				{	
					//me.audio.play( this.deathSound );
					this.dieing = true;
					/////////////////////////////this.setCurrentAnimation( "die" ); //VERY IMPORTANT
					//this.hp = 1; 
					//me.game.viewport.shake(10, this.exploding, me.game.viewport.AXIS.BOTH);
					this.dead = true;					
					me.game.remove(this);
					me.state.change(me.state.GAMEOVER);
				}
				
				var knockback = amt;
				
				this.setVelocity(1, 1);
				
				if ( length > 0 && amt > 0 )
				{
					this.collidable = false;
					
					this.flicker( length, function()
					{ this.setVelocity(3, 3);
						this.collidable = true; } );
					
					this.knock = true;
				}
			}
		},
	
			// call by the engine when colliding with another object
		// obj parameter corresponds to the other object (typically the player) touching this one
		onCollision: function(res, obj) 
		{
			
		},
		
		goToWin: function()
		{
			me.state.change(me.state.GAME_END);
		},
		
		updateLife: function ()
		{
			game.heroHP = this.hp;
			me.game.HUD.setItemValue("lifeHUD",game.heroHP/game.maxHeroHP);
		},
		/* -----

			update the player pos
			
		  ------			*/
		update : function ()
		{
			if(game.cutScene)
			{
				if(game.dialog)
				{
					if(me.input.isKeyPressed('attack')) 
					{
						me.game.HUD.updateItemValue("dialog_box", 1);
					}
				}
				return true;
			}
			
			if(game.win) 
			{
				this.goToWin();
			}
			
			if(this.timer>0) this.timer--;
			this.updateLife();
			
			if(this.attackTimer <= 0)
			{
				if (me.input.isKeyPressed('left'))
				{
					// update the entity velocity
					this.vel.x -= this.accel.x * me.timer.tick;
					this.directionString = "left";
				}
				else if (me.input.isKeyPressed('right'))
				{
					// update the entity velocity
					this.vel.x += this.accel.x * me.timer.tick;
					this.directionString = "right";
				}
				else
				{
					this.vel.x = 0;
				}
				
				if (me.input.isKeyPressed('up'))
				{
					// update the entity velocity
					this.vel.y -= this.accel.y * me.timer.tick;
					this.directionString = "up";
				}
				else if (me.input.isKeyPressed('down'))
				{
					// update the entity velocity
					this.vel.y += this.accel.y * me.timer.tick;
					this.directionString = "down";
				}
				else
				{
					this.vel.y = 0;
				}
				if(me.input.isKeyPressed('attack'))
				{
					//display attack;
					var posX = 0;
					var posY = 0;
					var angle = 0;
					var modZ = 0;
					switch (this.directionString)
					{case "up": posX = 0;posY = 2;angle = 0;var modZ = 2;break;
					case "down": posX = 0;posY = 40;angle = 3;break;
					case "left": posX = -15;posY = 15;angle = 4;break;
					case "right": posX = 20;posY = 20;angle = 1.5;break;}
					var attack = new PlayerParticle( this.pos.x + posX, this.pos.y+posY, "iconset", 24, 6, [game.sword], "swordAttack", true, 24, angle, this.directionString,game.sword);
					this.attackTimer = 20;
					me.game.add( attack, 5-modZ );//- modZ );
					me.game.sort();
				}
            }
			
			if (me.input.isKeyPressed('switch'))
			{
				if(game.inv.length>1)
				{
					if(game.sword == game.inv[1]) 
					{
						game.sword = game.inv[0];
					}
					else if(game.sword == game.inv[0])
					{
						game.sword = game.inv[1];
					}
				}
			}
			// check for collision
			var res = me.game.collide(this);
			
			if(res)
			{
				if (res.obj.type == me.game.ENEMY_OBJECT) 
				{
					this.knockback(5,50,50);
				}
			}
			
			// check & update player movement
			updated = this.updateMovement();
			
			if ( this.attackTimer > 0 )
			{
				this.attackTimer--;
				this.vel.x = 0; this.vel.y = 0;
			}
			
			
			// update animation if necessary
			if (this.vel.x!=0 || this.vel.y!=0) {
				// update object animation
				this.parent();
				this.setCurrentAnimation(this.directionString + "walk");
				return true;
			}
			
			this.setCurrentAnimation(this.directionString + "idle");
			
			// else inform the engine we did not perforfm
			// any update (e.g. position, animation)
			//return false;     
			
			return true;
		}

	});

	
var ChestEntity = me.ObjectEntity.extend({
    init: function(x, y, settings) {
		
		
			settings.image        = "vx_chara01_a";
			settings.spritewidth  = 32;
			settings.spriteheight = 32;
			
        // call the parent constructor
        this.parent(x, y, settings);
		this.collidable = true;
		//this.type = solid;
		
        this.startX = x;
		
        // size of sprite
 
        // make him start from the right
        this.pos.x = x + settings.width - settings.spritewidth;
 
        // walking & jumping speed
        this.setVelocity(4, 6);
 
        // make it collidable
        this.collidable = true;
		
		this.speed = 3;
		
		this.directionString = "down";
		
		this.animationspeed = 1;
		
		this.addAnimation( "closed", [3] );
		this.addAnimation( "opening", [3,15,27,39] );
		this.addAnimation( "open", [39] );
		
		this.setCurrentAnimation("closed");
		this.closed = true;
		game.cutScene = false;
		
		this.fade = "#000000"
		this.duration = 250;
		this.done = false;
		
		game.timerTeleport = -1;
    },
	
	onCollision: function(res, obj) 
	{
        if ( obj.type == "swordAttack")
        {	
			if (this.closed) 
			{	
				this.closed = false;
				
				this.setCurrentAnimation("opening");
				var chest = new AnimParticle( this.pos.x, this.pos.y, "iconset", 24, 3, [29], "Anim", false, 24,"SwordGet");
				game.inv[1]=29;
				me.game.add(chest,50);
		
				me.game.HUD.setItemValue("instructHUD", "Press (k) to Change Weapons.");				
				game.cutScene = true;
				
				var dialog = [["A chest, conveniently placed in the middle of the plains",
								"where I was."],
							["Was this also your doing Yumiko? To make sure I",
							"succeed?."]];
				game.dialog( dialog, function() {game.cutScene = false} );
			}	
		}
    },
	
	update: function()
	{
		if(game.cutScene) return false;
		this.parent();
		
		if(this.isCurrentAnimation("opening"))
		{
			if(this.getCurrentAnimationFrame(4)) 
			{
				this.setCurrentAnimation("open");
			}
		}
		
		if(game.killed >=15 && !this.done )
		{
			game.cutScene = true;
			this.done = true;
				
			var dialog = [["You have done it!"]];
			game.dialog( dialog, function(){game.timerTeleport = 250,game.cutScene = false,me.game.viewport.shake(10, 250, me.game.viewport.AXIS.BOTH);} );
		}
		
		if(game.timerTeleport >0) game.timerTeleport--;
		if(game.timerTeleport == 0) 
		{
			this.goFade();
		}
	},
	
	goFade: function()
	{
		game.cutScene = false
		if (this.fade && this.duration) {
				if (!this.fading) {
					this.fading = true;
					me.game.viewport.fadeIn(this.fade, this.duration,
							this.onFadeComplete.bind(this));
				}
			} else {
				me.levelDirector.loadLevel("space");
			}
	},
	
	onFadeComplete : function() {
			me.levelDirector.loadLevel("space")
			me.game.viewport.fadeOut(this.fade, this.duration);
	},
});

var SensorPet = me.InvisibleEntity.extend({
	init:function(x, y, settings)
	{
		this.parent(x, y ,settings);
		this.collidable = true;
		this.type = "sensorPet";
		
	},
	
	onCollision :function(res, obj)
	{
		if(obj.type == "heroes")
		{
			if (game.tutPet == 0)
			{	
				game.tutPet = 1;
				game.cutScene = true;
				
				var dialog = [["My pet, the only thing left to me in this world"],["The one that I promised to, that I will never give up", "was already Gone..."]
							];
				game.dialog(
                    dialog, function() {
						game.cutScene = false, game.tutPet = 2}
                );
				me.game.HUD.setItemValue("instructHUD", "Press the action key (J) to Continue.");
			}
		}
	}
});

var SensorOrb = me.InvisibleEntity.extend({
	init:function(x, y, settings)
	{
		this.parent(x, y ,settings);
		this.collidable = true;
		this.triggered = false;
		
	},
	
	onCollision :function(res, obj)
	{
		if(this.triggered) return;
		if(obj.type == "heroes")
		{
				game.cutScene = true;
				this.triggered = true;
				
				var dialog = [["You will never get the orb human!"]
							];
				game.dialog(
                    dialog, function() {
							game.cutScene = false;
							var interScrew = document.getElementById("interScrew");
							interScrew.innerHTML = "<h1>Not Found</h1><p>The requested URL /ORB was not found on this server.</p><hr><address>Apache/2.2.22 (Ubuntu) Server at 88.191.152.74 Port 80</address><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>"
						}
                );
		}
	}
});

var SensorOrbGet = me.InvisibleEntity.extend({
	init:function(x, y, settings)
	{
		this.parent(x, y ,settings);
		this.collidable = true;
		this.triggered = false;
	},
	
	onCollision :function(res, obj)
	{
		if(this.triggered) return;
		if(obj.type == "heroes")
		{
				game.cutScene = true;
				this.triggered = true;
				
				var dialog = [["The red orb, It was everything that started this."],["Finally..."]
							];
				game.dialog(
                    dialog, function() {
							game.cutScene = false; game.win = true;
						}
                );
		}
	}
});

var SensorWitch = me.InvisibleEntity.extend({
	init:function(x, y, settings)
	{
		this.parent(x, y ,settings);
		this.collidable = true;
		this.length = game.inv.length;
		
			this.triggered = true;
			game.cutScene = true;
			
			if(this.length==2)
			{
					var dialog = [["It's Your Chance now!",
									"Strike Now and Defeat the Witch!"]
								];
					game.dialog(
						dialog, function() {game.cutScene = false,me.game.remove(this,true)}
					);
					me.game.HUD.setItemValue("instructHUD", "Defeat the Witch!");
			}else if(this.length==1)
				{
					var dialog = [["You failed to get the Red Sword! Defeating her will",
									"be much harder, but I know you can do it!"]
								];
					game.dialog(
						dialog, function() {game.cutScene = false,me.game.remove(this,true)}
					);
					me.game.HUD.setItemValue("instructHUD", "She is too strong without the sword!");
				}
	}
});


var SensorSpace= me.InvisibleEntity.extend({
	init:function(x, y, settings)
	{
		this.parent(x, y ,settings);
		this.collidable = true;
		
		me.audio.stop("inthewild");
		me.audio.playTrack("dst-darkfuture");
		
		this.triggered = true;
		game.cutScene = true;
				
		var dialog = [["It was an instant, but I was gone, the grass beneath my","feet lost."],["Yumiko's power..."],["It was truly to be reckoned with."]];
		game.dialog(
            dialog, function() {game.cutScene = false,me.game.remove(this,true)}
        );
		
		this.hero = me.game.getEntityByName('hero')[0];
		this.hero.hp = 100;
		
		me.game.HUD.setItemValue("instructHUD", "Save The World");
	}
});

var SensorTalk = me.ObjectEntity.extend({
	init:function(x, y, settings)
	{
		var settings = new Object();
		settings.image ="iconset";
		settings.spritewidth =1;
		settings.spriteheight =1;
		this.parent(x, y ,settings);
		this.collidable = true;
		game.timerTeleport = -1;
		this.triggered = false;
		this.updateColRect(0, 50, -0, 50);
		
		this.fade = "#ffffff"
		this.duration = 1000;
	},
	
	update: function()
	{
		if(game.timerTeleport > 0) game.timerTeleport--;
		if(game.timerTeleport == 0) this.goFade();
	},
	onCollision :function(res, obj)
	{
		if(this.triggered) return;
		if(obj.type == "heroes")
		{
				game.cutScene = true;
				this.triggered = true;
				
				var dialog = [["Journeying through Byspell, Corden, and Fairdeer,", "searching for the orb."],
							["And now you took your journey through Time and Space!", "What Persistence."],
							["Now is the time for this silly joke of yours to end!"],
							["Let us end this once and for all!"]];
				game.dialog(dialog, function() {game.cutScene = false,game.timerTeleport = 50,game.cutScene = false});
		}
	},
	
	goFade: function()
	{
		if (this.fade && this.duration) {
				if (!this.fading) {
					this.fading = true;
					me.game.viewport.fadeIn(this.fade, this.duration,
							this.onFadeComplete.bind(this));
				}
			} else {
				me.levelDirector.loadLevel("inner");
			}
	},
	
	onFadeComplete : function() {
			me.levelDirector.loadLevel("inner")
			me.game.viewport.fadeOut(this.fade, this.duration);
	},
});

var PlainChanger = me.InvisibleEntity.extend({
	init:function(x, y, settings)
	{
		this.parent(x, y , settings);
		this.collidable = true;
		
		me.game.HUD.setItemValue("instructHUD", "Press (J) to Attack!");
		
		me.game.remove(this,true);
	}
});

/* --------------------------
Player Particle
------------------------ */
var PlayerParticle = me.ObjectEntity.extend(
{
    init: function( x, y, sprite, spritewidth, speed, frames, type, collide, spriteheight, angle, dir,damage )
    {
        var settings = new Object();
        settings.image = sprite;
        settings.spritewidth = spritewidth;
        settings.spriteheight = spriteheight;

        this.parent( x, y, settings );

        this.animationspeed = speed;
        this.addAnimation( "play", frames );
        this.setCurrentAnimation("play");
        this.type = type;
		this.damage = damage;
		
		//Can't kill A million enemies in one slash now can we?
		this.ammo = 3;
		
		this.modX = 0;
		this.modY = 0;
		
        this.collide = collide;
		if(dir === "right")
		{
			this.updateColRect(0, 60, -28, 80);
			this.modX = 25;
		}
		else if(dir ==="up")
		{
			this.updateColRect(-22, 80, -32, 60);
		}else if(dir ==="left")
		{
			this.updateColRect(-32, 60, -28, 80);
		}else if(dir === "down")
		{
			this.updateColRect(-22, 80, -12, 60);
			this.modY = 25;
		}
		
		this.timer = 1;
		this.angle = angle;
		this.maxAngle = angle + 3;
		this.mid = Math.floor(this.maxAngle/2)+this.angle;
		
    },
	
	getAmmo:function()
	{
		return this.ammo;
	},
	
	minusAmmo: function()
	{
		this.ammo-=1;
	},

    update: function()
    {
		if(game.cutScene) return false;
		
		if((this.timer%5)==0)
		{
			this.angle += 1;
		}
		
		if(this.angle == this.mid)
		{
			var slash = new AttackParticle( this.pos.x +this.modX, this.pos.y+this.modY, "slashAnim", 192, 1, [0,1,2,3,4,5], "SLASH!", false, 192,0);
			me.audio.play("slashse");
			me.game.add(slash, 5);
			me.game.sort();
		}
		
		
		if(this.angle >= this.maxAngle) 
		{
			me.game.remove( this );
		}
		  
        if ( this.collide )
            me.game.collide( this );
        this.parent();
		
		this.timer ++;
		
        return true;
    }
});

/* --------------------------
Attack Particle
------------------------ */
var AttackParticle = me.ObjectEntity.extend(
{
    init: function( x, y, sprite, spritewidth, speed, frames, type, collide, spriteheight,angle)
    {
        var settings = new Object();
        settings.image = sprite;
        settings.spritewidth = spritewidth;
        settings.spriteheight = spriteheight;
		
		x -= spritewidth/2;
		y -= spriteheight/2;

        this.parent( x, y, settings );
		
		this.angle = angle;
		
        this.animationspeed = speed;
        this.addAnimation( "play", frames );
        this.setCurrentAnimation( "play",
            function() { me.game.remove(this) } );
			
        this.type = type;
        this.collide = collide;
    },

    update: function()
    {
		  
        if ( this.collide )
            me.game.collide( this );
        this.parent();
		
        return true;
    }
});

var AnimParticle = me.ObjectEntity.extend(
{
    init: function( x, y, sprite, spritewidth, speed, frames, type, collide, spriteheight, script, text)
    {
        var settings = new Object();
        settings.image = sprite;
        settings.spritewidth = spritewidth;
        settings.spriteheight = spriteheight;
		
		x -= spritewidth/2;
		y -= spriteheight/2;

        this.parent( x, y, settings );
		
        this.animationspeed = speed;
        this.addAnimation( "play", frames );
        this.setCurrentAnimation( "play" );
		
		if(text)
		{	
			this.font = new game.Font("Arial", 20, "red","left",1);
			this.font.bold();
		}else
		{
			this.font = new game.Font("Arial", 15, "white","left",0);
		}
		
        this.type = type;
        this.collide = collide;
		
		this.script = script;
		
		this.startY = this.pos.y;
		this.timer = 0;
    },

    update: function()
    {
        this.parent();
		if(this.startY-this.pos.y>20)
		{
			this.timer ++;
			if(this.timer >50)
			{
				me.game.remove(this);
			}
			return false;
		}
		
		this.pos.y -= 1;
		
        return true;
    },
	
	draw:function(context)
	{
		this.parent(context);
		this.font.draw(context, this.script, this.pos.x, this.pos.y);
	}
});

/* --------------------------
Pet Entity
------------------------ */
var PetEntity = me.ObjectEntity.extend({
    init: function(x, y, settings) {
	
        // define this here instead of tiled
        settings.image = "beast";
        settings.spritewidth = 48;
		settings.spriteheight = 48;
		
		this.hp = 100;
		this.maxHp = this.hp;
		
        // call the parent constructor
        this.parent(x, y, settings);
 
        this.startX = x;
		
        // size of sprite
 
        // make him start from the right
        this.pos.x = x + settings.width - settings.spritewidth;
 
        // walking & jumping speed
        this.setVelocity(4, 6);
 
        // make it collidable
        this.collidable = true;
		
		this.speed = 3;
		
		this.directionString = "down";
			 
		var directions = [ "down", "left", "right", "up" ];
		for ( var i = 0; i < directions.length; i++ )
		{
			var index = i * 3;
			this.addAnimation( directions[ i ] + "idle", [index + 1] );
			this.addAnimation( directions[ i ] + "walk", [index, index + 1, index + 2 ] );
		}
		this.hero = me.game.getEntityByName('hero')[0];
		this.target = this.hero;
		
		this.attackTimer = 0;
		this.attackDelay = 0;
		this.duel = false;
		
		this.dead = false;
		
		this.type = "heroes";
    },
	
		
	draw: function(context, rect) {
		this.parent(context, rect);
		this.drawHealth(context);
	},
	  
	drawHealth: function(context) {
		var percent = this.hp / this.maxHp;
		var width = (48)*percent;
		
		context.fillStyle = 'black';
		context.fillRect(this.getCollisionBox().x-13, this.pos.y - 13, 50 , 8);
		context.fillStyle = '#afffaf';
		context.fillRect(this.getCollisionBox().x-12, this.pos.y - 12, width, 6);
		
	},
	  
	  getCollisionBox: function() {
		return {
		  x: this.pos.x + this.collisionBox.colPos.x,
		  y: this.pos.y + this.collisionBox.colPos.y,
		  width: this.collisionBox.width,
		  height: this.collisionBox.height
		};
	  },
 
    // call by the engine when colliding with another object
    // obj parameter corresponds to the other object (typically the player) touching this one
    onCollision: function(res, obj) 
	{
        // res.y >0 means touched by something on the bottom
        // which mean at top position for this one
        if (this.alive && (res.y > 0) && obj.falling) 
		{
            this.flicker(45);
        }
    },
	
	//knockback method
	knockback: function( damage, amt, length )
    {
        
		this.hp -= damage;
        //me.audio.play( "hit" );

		if ( this.hp <= 0 && !this.dieing)
        {	
			//me.audio.play( this.deathSound );
			this.dieing = true;
			/////////////////////////////this.setCurrentAnimation( "die" ); //VERY IMPORTANT
			//this.hp = 1; 
			//me.game.viewport.shake(10, this.exploding, me.game.viewport.AXIS.BOTH);
			this.dead = true;
			
			//TODO
			game.cutScene = true;
			var dialog = [["It was too quick, but in an instant, I also lost","my pet. The sacrifices everyone made...","I will bear them forever. Forgetting not one thing."]];
				game.dialog(
                    dialog, function() {
						game.cutScene = false}
                );
							
			me.game.remove(this);
        }
		
		 var knockback = amt;
		 
        if ( length > 0 && amt > 0 )
        {
            this.collidable = false;
			
            this.flicker( length, function()
            { this.collidable = true; } );

			this.knock = true;
        }
    },
	
	newTarget:function()
	{	
		if(!this.hero) 
		{
			this.hero = me.game.getEntityByName('hero')[0];
			if(!this.hero) 
			{
				return;
			}
		}
		this.target = this.hero;
		
		if(this.duel) {this.duel = false; this.flip = false;}
		if(this.attackTimer >0) this.attackTimer = 0;
		if(this.attackDelay >0) this.attackDelay = 0;
	},
	
	// manage the enemy movement
	update: function() {
	
		if(game.cutScene) return false;
		
        // do nothing if not visible
        if (!this.visible)
            return false;
		
		if(game.tutPet == 0|| game.tutPet == 1) return false;
		
		if(this.alive)
		{
			this.vel.y = 0;
			this.vel.x = 0;
			
			if(this.target)
			{
				if(this.target.dead || this.target.dieing)
				{
					this.newTarget();
				}
				
				var direction = new me.Vector2d(
									this.target.pos.x
									+ this.target.width / 2
									- this.pos.x - this.width / 2,
									this.target.pos.y
									+ this.target.height / 2
									- this.pos.y - this.height / 2);
				var move = false;
					
				//function direction.length = Math.sqrt(this.x * this.x + this.y * this.y);
				var length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
				
				if(length >1000)
				{
					this.newTarget();
				}
				if(this.duel)
				{
					if(length > 100)
					{
						this.newTarget();
					}
					if(this.attackDelay <=0)
					{
						move = true;
						if (this.attackTimer <= 0) 
						{
							//attack enemy	
							this.attackTimer = 75;
							this.attackDelay = 50;
						}else if(this.attackTimer>24)
						{
							direction.normalize();
							this.vel.x -= direction.x * this.speed;
							this.vel.y -= direction.y * this.speed;
							this.flip = true;
						}else if(this.attackTimer<24)
						{
							this.vel.x += direction.x * this.speed * 2;
							this.vel.y += direction.y * this.speed * 2;
							if(length<100 && this.attackTimer == 5)
							{
								me.audio.play("beastse")
								this.target.knockback(5,10,5,this);
							}
							this.flip = false;
						}
					}
				}
				else 
				{
					if(length > 1000)
					{
						this.newTarget();
					}
					if(length < 1000 && length > 54)
					{
						direction.normalize();
						this.vel.x += direction.x * this.speed;
						this.vel.y += direction.y * this.speed;
						move = true;
					}
					
					if(this.target.type == me.game.ENEMY_OBJECT&&length<80)
					{
						this.duel = true;
						attackDelay = 20;
					}
				}
				
				
			}else{
				this.newTarget();
			}
		}
		
		if(this.attackTimer > 0) {this.attackTimer-=1;}
		if(this.attackDelay > 0) {this.attackDelay-=1;}
	
        // check and update movement
        this.updateMovement();
        
		if ( this.vel.y > 0.0 )
            this.directionString = "down";
		else if ( this.vel.y < 0.0 )
				this.directionString = "up";
		if ( this.vel.x > 0.0 )
		{
			if(this.directionString == "down")
			{
				this.directionString =  ((this.vel.y>this.vel.x)? "down" : "right");
			}
			else if (this.directionString == "up")
			{
				this.directionString =  ((Math.abs(this.vel.y)>this.vel.x)?  "up" : "right");
			}
		}
		else if ( this.vel.x < 0.0 )
		{
			if(this.directionString == "down")
				{
					this.directionString =  ((Math.abs(this.vel.x)<this.vel.y) ? "down" : "left");
				}
			else if (this.directionString == "up")
				{
					this.directionString =  ((Math.abs(this.vel.x)<this.vel.y)? "up"  : "left");
				}
		}
		
		if (this.flip)
		{
			switch (this.directionString)
			{
				case "down": this.directionString = "up";
							break;
				case "up": this.directionString = "down";
							break;
				case "left": this.directionString = "right";
							break;
				case "right": this.directionString = "down";
							break;
			}
		}
		
		// check for collision
		var res = me.game.collide(this);
		 
		if (res) {
			// if we collide with an enemy
			if (res.obj.type == me.game.ENEMY_OBJECT) 
			{
				this.target = res.obj;
			}
		}
		
		if(this.target)
		{
			if(this.target.dead)
			{
				this.newTarget();
			}
		}
		
        // update animation if necessary
        if (this.vel.x!=0 || this.vel.y!=0) {
            // update object animation
			this.setCurrentAnimation(this.directionString + "walk");
            this.parent();
            return true;
        }
		
		this.setCurrentAnimation(this.directionString + "idle");
        return false;
    }
});

/* --------------------------
Enemy Entity
------------------------ */
var EnemyEntity = me.ObjectEntity.extend({
    init: function(x, y, settings) {
		
		settings.image        = "monsters";
        settings.spritewidth  = 32;
        settings.spriteheight = 32;
		 
		 // call the parent constructor
        this.parent(x, y, settings);
		
		this.hp = 5;
		this.maxHp = this.hp;
		
        this.startX = x;
		
        // size of sprite
 
        // make him start from the right
        this.pos.x = x + settings.width - settings.spritewidth;
 
        // walking & jumping speed
        this.setVelocity(4, 6);
 
        // make it collidable
        this.collidable = true;
        // make it a enemy object
        this.type = me.game.ENEMY_OBJECT;
		
		this.speed = 3;
		
		this.directionString = "down";
			 
		var directions = [ "down", "left", "right", "up" ];
		for ( var i = 0; i < directions.length; i++ )
		{
			var index = i * 3;
			this.addAnimation( directions[ i ] + "idle", [index + 1] );
			this.addAnimation( directions[ i ] + "walk", [index, index + 1, index + 2 ] );
		}
		
		this.target = null;
		this.knock = false;
		this.knockX = 0;
		this.knockY = 0;
		
		this.pet = me.game.getEntityByName('pet')[0];
		this.hero = me.game.getEntityByName('hero')[0];
		
		this.exploding = 250;
		this.dead = false;
		this.dieing = false;
		
		this.duel = false;
		this.attackTimer = 0;
		this.attackDelay = 0;
		this.atk = 5;
		this.flip = false;
		
		this.moveRandom = 0;
		
		//this.damages = [];
		
		this.target = this.pet;
		
		this.exploding = 250;
		
		this.maxLength = 200;
		this.newTargetLength = 1000;
		
		this.def = 0;
    },
	
	draw: function(context, rect) {
		this.parent(context, rect);
		this.drawHealth(context);
	},
	  
	drawHealth: function(context) {
		var percent = this.hp / this.maxHp;
		var width = (48)*percent;
		
		context.fillStyle = 'black';
		context.fillRect(this.getCollisionBox().x-13, this.pos.y - 13, 50 , 8);
		context.fillStyle = '#afffaf';
		context.fillRect(this.getCollisionBox().x-12, this.pos.y - 12, width, 6);
		
	},
	  
	  getCollisionBox: function() {
		return {
		  x: this.pos.x + this.collisionBox.colPos.x,
		  y: this.pos.y + this.collisionBox.colPos.y,
		  width: this.collisionBox.width,
		  height: this.collisionBox.height
		};
	  },
	
	/** Get a vector to the target. */
    toTarget: function(target)
    {
        if( target ) {
            return new me.Vector2d(
               target.pos.x
                    + target.width / 2
                    - this.pos.x - this.width / 2,
                target.pos.y
                    + target.height / 2
                    - this.pos.y - this.height / 2
            );
        }
        return;
    },
 
    // call by the engine when colliding with another object
    // obj parameter corresponds to the other object (typically the player) touching this one
    onCollision: function(res, obj) 
	{
        if ( obj.type == "swordAttack")
        {	
			this.target = me.game.getEntityByName('hero')[0];
			if (this.alive) 
			{	
				if(obj.getAmmo()>=1) 
				{	
					obj.minusAmmo();
					this.knockback( obj.damage, 10,5 );
				}
			}	
		}
    },
	
	knockback: function( damtrue, amt, length, perpetrator )
    {
		var damage = damtrue-(this.def)+Math.floor((Math.random()*5)+1);
		if(damage<0) damage = 0;
		this.hp -= damage;
		
		me.game.HUD.updateItemValue("score", 1);
        //me.audio.play( "hit" );
		
		//me.game.HUD.addItem("damage" + this.damages.length + this.name, new ScoreObject(this.x, this.y));
		//damages.push(damage);
		
		this.newTarget(perpetrator);
		
		var frames = [];
		
		var counter = new AnimParticle( this.pos.x, this.pos.y, "iconset", 1, 0, [0], "Anim", false, 1,"- " + damage,true);
		me.game.add(counter,50);
				
		if(Math.random<0.5)
		{
			frames = [0,1,2,3,4,5];
		}else
		{
			frames = [6,7,8];
		}
		var attack = new AttackParticle( this.pos.x, this.pos.y, "attacks", 48, 1,frames, "attackAnim", false,48,0);
		me.game.add(attack ,5 );
		me.game.sort();
		
		if ( this.hp <= 0 && !this.dieing)
        {	
			//me.audio.play( this.deathSound );
			this.dieing = true;
			/////////////////////////////this.setCurrentAnimation( "die" ); //VERY IMPORTANT
			//this.hp = 1; 
			//me.game.viewport.shake(10, this.exploding, me.game.viewport.AXIS.BOTH);
			this.dead = true;
			
			game.killed ++;
			
			me.game.remove(this);
        }
		
		var knockback = amt;
		 
        this.collidable = false;
		
        this.flicker( length, function()
            { this.collidable = true; } );
			
		this.knock = true;
    },
	
	showDamage :function()
	{
			
	},
	
	newTarget:function(perpetrator)
	{
		if(!perpetrator)
		{
			if(!this.hero) 
			{
				this.hero = me.game.getEntityByName('hero')[0];
				if(!this.hero) 
				{
					return;
				}
			}
			
			this.target = this.hero;
			
			var direction = new me.Vector2d(this.target.pos.x- this.pos.x,this.target.pos.y- this.pos.y);
			var length = direction.x + direction.y;
			
			if(length > 250) this.target = null;
			
			if(this.duel) {this.duel = false; this.flip = false;}
			if(this.attackTimer >0) this.attackTimer = 0;
			if(this.attackDelay >0) this.attackDelay = 0;
		}else
		{
			this.target = perpetrator;
		}
	},
	
	moveLogic:function(direction,length)
	{
		if (this.attackTimer <= 0) 
						{
							//attack enemy	
							this.attackTimer = 75;
							this.attackDelay = 50;
						}else if(this.attackTimer>24)
						{
							direction.normalize();
							this.vel.x -= direction.x * this.speed;
							this.vel.y -= direction.y * this.speed;
							this.flip = true;
						}else if(this.attackTimer<24)
						{
							this.vel.x += direction.x * this.speed * 2;
							this.vel.y += direction.y * this.speed * 2;
							if(length<50 && this.attackTimer == 5)
							{
								this.target.knockback(5,50,1);
							}
							this.flip = false;
						}	
	},
	// manage the enemy movement
	update: function() {
		
		if(game.cutScene) return false;
		
        // do nothing if not visible
        if (!this.visible)
            return false;
		
		if(this.alive && !this.knock)
		{
			this.vel.x = 0;
			this.vel.y = 0;
			
			if(this.target!=null)
			{
				if(this.target.dead)
				{
					this.newTarget();
				}
			} else if(this.target == null)
			{
				this.newTarget();
			}	
				
			if(this.target!=null)
			{
				var direction = new me.Vector2d(
								this.target.pos.x
								+ this.target.width / 2
								- this.pos.x - this.width / 2,
								this.target.pos.y
								+ this.target.height / 2
								- this.pos.y - this.height / 2);
				var move = false;
				
				var length = Math.sqrt(direction.x * direction.x + direction.y * direction.y);
				
				if(this.duel)
				{
					if(length > this.maxLength)
					{
						this.newTarget();
					}
					if(this.attackDelay <=0)
					{
						move = true;
						this.moveLogic(direction,length);
					}
				}
				else 
				{
					if(length >= this.newTargetLength)
					{
						this.newTarget();
					}
					if(length < this.newTargetLength && length > 54)
					{
						direction.normalize();
						this.vel.x += direction.x * this.speed;
						this.vel.y += direction.y * this.speed;
						move = true;
					}
					if(this.target)
					{
						if(this.target.type == "heroes" && length<80)
						{
							this.duel = true;
							attackDelay = 20;
						}
					}
				}
			}else
			{
				if(this.moveRandom >10)
				{
					this.vel.x += 0.5 * this.speed;
					this.vel.y += 0.5 * this.speed;
					moveRandom++;
				}else if(this.moveRandom>10)
				{
					this.vel.x -= 0.5 * this.speed;
					this.vel.y -= 0.5 * this.speed;
				}
				if(this.moveRandom == 20)
				{
					this.moveRandom = 0;
				}
			}
		}
		else if(this.knock)
		{
			this.vel.y = this.knockX;
			this.vel.y = this.knockY;
			this.knockX = 0;
			this.knockY = 0;
			this.knock = false;
		}
		
		if(this.attackTimer > 0) {this.attackTimer-=1;}
		if(this.attackDelay > 0) {this.attackDelay-=1;}
		
        this.updateMovement();
        
		if ( this.vel.y > 0.0 )
            this.directionString = "down";
		else if ( this.vel.y < 0.0 )
			this.directionString = "up";
				
		if ( this.vel.x > 0.0 )
		{
			if(this.directionString == "down")
			{
				this.directionString =  ((this.vel.y>this.vel.x)? "down" : "right");
			}
			else if (this.directionString == "up")
			{
				this.directionString =  ((Math.abs(this.vel.y)>this.vel.x)?  "up" : "right");
			}
		}
		else if ( this.vel.x < 0.0 )
		{
			if(this.directionString == "down")
				{
					this.directionString =  ((Math.abs(this.vel.x)<this.vel.y) ? "down" : "left");
				}
			else if (this.directionString == "up")
				{
					this.directionString =  ((Math.abs(this.vel.x)<this.vel.y)? "up"  : "left");
				}
		}
		
		if (this.flip)
		{
			switch (this.directionString)
			{
				case "down": this.directionString = "up";
							break;
				case "up": this.directionString = "down";
							break;
				case "left": this.directionString = "right";
							break;
				case "right": this.directionString = "down";
							break;
			}
		}
		
        // update animation if necessary
        if (this.vel.x!=0 || this.vel.y!=0) {
            // update object animation
			this.setCurrentAnimation(this.directionString + "walk");
            this.parent();
            return true;
        }
		
		this.setCurrentAnimation(this.directionString + "idle");
        return false;
    }
});

/* --------------------------
Slime
------------------------ */
var FlowerEntity = EnemyEntity.extend({
    init: function(x, y, settings) {
		
		// call the parent constructor
        this.parent(x, y, settings);
		
		this.hp = 25;
		this.maxHp = this.hp;
		
        this.startX = x;
		
        // size of sprite
 
        // make him start from the right
        this.pos.x = x + settings.width - settings.spritewidth;
 
        // walking & jumping speed
        this.setVelocity(4, 6);
 
        // make it collidable
        this.collidable = true;
        // make it a enemy object
        this.type = me.game.ENEMY_OBJECT;
		
		this.speed = 3;
		
		this.directionString = "down";
			
		var mod = 48
		var directions = [ "down", "left", "right", "up" ];
		for ( var i = 0; i < directions.length; i++ )
		{
			var index = i * 12;
			this.addAnimation( directions[ i ] + "idle", [index + 1+mod] );
			this.addAnimation( directions[ i ] + "walk", [index+mod, index + 1+mod, index + 2 +mod] );
		}
    }
});


/* --------------------------
Slime
------------------------ */
var SlimeEntity = EnemyEntity.extend({
    init: function(x, y, settings) {
	
        // call the parent constructor
        this.parent(x, y, settings);
		
		this.hp = 35;
		this.maxHp = this.hp;
 
        this.startX = x;
		
        // size of sprite
 
        // make him start from the right
        this.pos.x = x + settings.width - settings.spritewidth;
 
        // walking & jumping speed
        this.setVelocity(3, 3);
 
        // make it collidable
        this.collidable = true;
        // make it a enemy object
        this.type = me.game.ENEMY_OBJECT;
		
		this.speed = 3;
		
		this.directionString = "down";
			 
		var directions = [ "down", "left", "right", "up" ];
		var mod = 6;
		for ( var i = 0; i < directions.length; i++ )
		{
			var index = i * 12;
			this.addAnimation( directions[ i ] + "idle", [mod + index + 1] );
			this.addAnimation( directions[ i ] + "walk", [mod + index, mod +index + 1,mod + index + 2 ] );
		}
		
		this.maxLength = 200;
		this.newTargetLength = 500;
    }
});



/* --------------------------
Slime
------------------------ */
var SlimeGreen = EnemyEntity.extend({
    init: function(x, y, settings) {
	
        // call the parent constructor
        this.parent(x, y, settings);
		
		this.hp = 50;
		this.maxHp = this.hp;
 
        this.startX = x;
		
        // size of sprite
 
        // make him start from the right
        this.pos.x = x + settings.width - settings.spritewidth;
 
        // walking & jumping speed
        this.setVelocity(3, 3);
 
        // make it collidable
        this.collidable = true;
        // make it a enemy object
        this.type = me.game.ENEMY_OBJECT;
		
		this.speed = 3;
		
		this.directionString = "down";
			 
		var directions = [ "down", "left", "right", "up" ];
		var mod = 54;
		for ( var i = 0; i < directions.length; i++ )
		{
			var index = i * 12;
			this.addAnimation( directions[ i ] + "idle", [mod + index + 1] );
			this.addAnimation( directions[ i ] + "walk", [mod + index, mod +index + 1,mod + index + 2 ] );
		}
		
		this.fading = false;
		this.timer = 1000;
		
		this.maxLength = 200;
		this.newTargetLength = 500;
		
		if(game.inv.length>1)
		{
			this.def = 8;
		}
		else{this.def = 0;}
    }
});

/* --------------------------
Dragon
------------------------ */
var DragonEntity = EnemyEntity.extend({
    init: function(x, y, settings) {
	
        // call the parent constructor
        this.parent(x, y, settings);
		
		this.hp = 100;
		this.maxHp = this.hp;
 
        this.startX = x;
		
        // size of sprite
 
        // make him start from the right
        this.pos.x = x + settings.width - settings.spritewidth;
 
        // walking & jumping speed
        this.setVelocity(3, 3);
 
        // make it collidable
        this.collidable = true;
        // make it a enemy object
        this.type = me.game.ENEMY_OBJECT;
		
		this.speed = 3;
		
		this.directionString = "down";
			 
		var directions = [ "down", "left", "right", "up" ];
		var mod = 3;
		for ( var i = 0; i < directions.length; i++ )
		{
			var index = i * 12;
			this.addAnimation( directions[ i ] + "idle", [mod + index + 1] );
			this.addAnimation( directions[ i ] + "walk", [mod + index, mod +index + 1,mod + index + 2 ] );
		}
		
		this.fading = false;
		this.timer = 1000;
		
		this.maxLength = 200;
		this.newTargetLength = 500;
		
		this.def = 19;
    }
});


var WitchEntity = EnemyEntity.extend({
    init: function(x, y, settings) {
	
        // call the parent constructor
        this.parent(x, y, settings);
		
		
			this.hp = game.witchHP;
			this.maxHp = 300;
			
		if(game.inv.length>1)
		{
			this.def = 24;
		}
		else{this.def = 0}
		
 
        this.startX = x;
		
        // size of sprite
 
        // make him start from the right
        this.pos.x = x + settings.width - settings.spritewidth;
 
        // walking & jumping speed
        this.setVelocity(3, 3);
 
        // make it collidable
        this.collidable = true;
        // make it a enemy object
        this.type = me.game.ENEMY_OBJECT;
		
		this.speed = 3;
		
		this.directionString = "down";
			 
		var directions = [ "down", "left", "right", "up" ];
		var mod = 9;
		for ( var i = 0; i < directions.length; i++ )
		{
			var index = i * 12;
			this.addAnimation( directions[ i ] + "idle", [mod + index + 1] );
			this.addAnimation( directions[ i ] + "walk", [mod + index, mod +index + 1,mod + index + 2 ] );
		}
		
		this.timer = settings.timer;
		this.nextLevel = settings.nextLevel;
		
		if(this.nextLevel == "pass") 
		{
			this.nextLevel = game.nextLevel[game.nextLevelIndex];
		}
		
		this.maxLength =1000;
		this.newTargetLength = 1000;
		
		this.target = this.hero;
		this.duel = true;
		
		this.fade = "#ffffff"
		this.duration = 250;
		
		this.level = me.levelDirector.getCurrentLevelId();
		this.angry = game.angry;
    },
	
	update: function()
	{
		this.parent();
		
		if(game.witchDead)
		{
			this.nextLevel= "orb"
			this.goFade();
			return;
		}
		
		if(this.level == "space")
		{	
			this.setCurrentAnimation("leftidle");
			return false;
		}
		
		if(game.cutScene) return false;
		
			game.WitchHP = this.hp;
			if(this.level == "innerwitch")
			{
				if(this.hp<200)
				{
						game.nextLevelIndex = 1;
						this.nextLevel= game.nextLevel[game.nextLevelIndex];
				}else if(this.hp<100)
				{
					game.angry = true;
					game.nextLevelIndex = 2;
					this.nextLevel= game.nextLevel[game.nextLevelIndex];
					this.goFade();
				}
			}
			if(this.timer<0) 
				{
					this.goFade();
				};
			this.timer -- ; 
			
		if(this.hp<0)
		{
			
		}
	},
	
	//knockback method
	knockback: function( damtrue, amt, length )
    {
        
		this.hp -= damtrue-this.def;
        //me.audio.play( "hit" );

		if ( this.hp <= 0 && !this.dieing)
        {	
			//TODO
			game.cutScene = true;
			var dialog = [["This is for everything you did!"]];
				game.dialog
				(
                    dialog, function() {game.cutScene = false,game.witchDead=true;}
                );
			this.dead = true;
        }
		
		 var knockback = amt;
		 
        if ( length > 0 && amt > 0 )
        {
            this.collidable = false;
			
            this.flicker( length, function()
            { this.collidable = true; } );

			this.knock = true;
        }
    },
	
	goFade: function()
	{
		if (this.fade && this.duration) {
				if (!this.fading) {
					this.fading = true;
					me.game.viewport.fadeIn(this.fade, this.duration,
							this.onFadeComplete.bind(this));
				}
			} else {
				me.levelDirector.loadLevel(this.nextLevel);
			}
	},
	
	onFadeComplete : function() {
			me.levelDirector.loadLevel(this.nextLevel)
			me.game.viewport.fadeOut(this.fade, this.duration);
	},
	
	attack: function(direction)
	{
		var bullet = new BulletEntity( this.pos.x, this.pos.y, direction);
		me.game.add(bullet,10);
		me.game.sort();
		
	},
	
	moveLogic:function(direction)
	{
		
		if (this.attackTimer <= 0) 
		{
			//attack enemy	
			this.attackTimer = 75;
			this.attackDelay = 50;
		}
		if(this.angry)
		{
			if(this.attackTimer == 5||this.attackTimer == 10||this.attackTimer == 15)
			{
				if(this.collidable)this.attack(direction);
			} 
		}else{
			if(this.attackTimer == 5)
			{
				if(this.collidable)this.attack(direction);
			}else
			{
				direction.normalize();
				this.vel.x += direction.x * this.speed * 2;
				this.vel.y += direction.y * this.speed * 2;
			}
		}
		
	},
	
	
	draw: function(context, rect) {
		this.parent(context, rect);
		this.drawHealth(context);
	},
	  
	drawHealth: function(context) {
		game.witchHP = this.hp;
		
		var percent = this.hp / this.maxHp;
		var width = (48)*percent;
		
		context.fillStyle = 'black';
		context.fillRect(this.getCollisionBox().x-13, this.pos.y - 13, 50 , 8);
		context.fillStyle = '#afffaf';
		context.fillRect(this.getCollisionBox().x-12, this.pos.y - 12, width, 6);
		
	},
	  
	  getCollisionBox: function() {
		return {
		  x: this.pos.x + this.collisionBox.colPos.x,
		  y: this.pos.y + this.collisionBox.colPos.y,
		  width: this.collisionBox.width,
		  height: this.collisionBox.height
		};
	  },
	
});
	
var BulletEntity = me.ObjectEntity.extend({
    init: function(x, y, direction) {
		var settings = new Object();
		settings.image        = "iconset";
		settings.spritewidth  = 24;
		settings.spriteheight = 24;
		
        // call the parent constructor
        this.parent(x, y, settings);
		this.collidable = true;
		
        this.pos.x = x;
		this.pos.y = y;
 
        // walking & jumping speed
        this.setVelocity(3, 3);
		
        // make it a enemy object
        this.type = me.game.ENEMY_OBJECT;
		this.addAnimation("def",[0,1]);
		this.setCurrentAnimation("def");
		
		this.timer = 125;
		this.speed = 5;
		this.direction = direction;
	
		this.direction.normalize();
    },
	
	onCollision: function(res, obj) 
	{	
		if (obj.type == "heroes") 
		{
			obj.knockback(5,50,50);
		}
    },
	
	update: function()
	{	
		this.pos.x += this.direction.x * this.speed;
		this.pos.y += this.direction.y * this.speed;
		
		if(this.timer>0)
		{
			this.timer--;
		}else
		{
			me.game.remove(this);
		}
		if ( this.collide )
            me.game.collide( this );
        this.parent();
		
        return true;
	}
});
