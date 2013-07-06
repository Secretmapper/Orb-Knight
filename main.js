/*!
 * 
 *   ORB KNIGHT MAIN
 *
 **/

// game ressources
var g_ressources= [ { name: "32x32_font", type: "image", src: "data/sprite/32x32_font.png"},
					 
					{name: "dialog",      type:"image",	src: "data/gui/dialog.png"},
					
					{name: "lifeBar",      type:"image",	src: "data/gui/lifeBar.png"},
					{name: "lifeBack",      type:"image",	src: "data/gui/lifeBack.png"},
					
					{name: "title",      type:"image",	src: "data/gui/Title.png"},
					 
					{name: "jungle",               type: "tmx",	src: "data/jungle.tmx"},
					{name: "world",               type: "tmx",	src: "data/world.tmx"},
					{name: "plain",               type: "tmx",	src: "data/plain.tmx"},
					{name: "space",               type: "tmx",	src: "data/space.tmx"},
					{name: "inner",               type: "tmx",	src: "data/inner.tmx"},
					{name: "inner2",               type: "tmx",	src: "data/inner2.tmx"},
					{name: "inner3",               type: "tmx",	src: "data/inner3.tmx"},
					{name: "innerWitch",               type: "tmx",	src: "data/innerWitch.tmx"},
					{name: "orb",               type: "tmx",	src: "data/orb.tmx"},
					
					{name: "tilesets", type:"image",	src:"data/world_tileset/tilesets.png"},
					{name: "trees", type:"image",	src:"data/world_tileset/trees.png"},
					{name: "StarlitSky", type:"image",	src:"data/world_tileset/StarlitSky.png"},
					 
					{name: "slashAnim", type:"image",	src:"data/sprite/slash.png"},
					{name: "attacks", type:"image", src:"data/sprite/attacks.png"},
					{name: "iconset",      type:"image", src: "data/sprite/iconset.png"},
					  
					{name: "vx_chara01_a",      type:"image",	src: "data/sprite/vx_chara01_a.png"},
					{name: "monsters",      type:"image",	src: "data/sprite/monsters.png"},
					{name: "beast", type: "image", src: "data/sprite/beast.png"},
					
					{name: "dst-darkfuture", type:"audio",	src:"data/audio/", channel:1},	
					{name: "inthewild", type:"audio",	src:"data/audio/", channel:1},	
					{name: "slashse", type:"audio",	src:"data/audio/", channel:2},
					{name: "beastse", type: "audio", src: "data/audio/", channel:2}
                  ]; 


var game = { 
	cutScene: false,
	dialog: false,
	heroHP: 100,
	maxHeroHP: 100,
	sword: 5,
	inv: [5],
	tutScript: "",
	tutPet: 0, //0 empty, 1 running, 2 fin
	nextLevel: ["inner","inner2","inner3"],
	nextLevelIndex: 0,
	witchHP: 300,
	witchLoad: false,
	killed: 0,
	timerTeleport: -1,
	witchDead: false,
	win: false
};

var jsApp	= 
{	
	/* ---
	
		Initialize the jsApp
		
		---			*/
	onload: function()
	{
      
		// init the video
		if (!me.video.init('jsapp', 640, 480, false, 1.0))
		{
			alert("Sorry but your browser does not support html 5 canvas. Please try with another one!");
			return;
		}
		
		me.input.bindKey(me.input.KEY.J,"attack",true);
		
		// initialize the "audio"
		me.audio.init("mp3,ogg");
		
		// set all ressources to be loaded
		me.loader.onload = this.loaded.bind(this);
		
		// set all ressources to be loaded
		me.loader.preload(g_ressources);

		// load everything & display a loading screen
		me.state.change(me.state.LOADING);
		
	},
	
	
	/* ---
	
		callback when everything is loaded
		
		---										*/
	loaded: function ()
	{
		 // set the "Menu" Screen Object
		me.state.set(me.state.MENU, new TitleScreen());
		
		// set the "Play/Ingame" Screen Object
		me.state.set(me.state.PLAY, new PlayScreen());
		
		// set the "Game Over" Screen Object
		me.state.set(me.state.GAMEOVER, new OverScreen());
		
		// set the "WON" Screen Object
		me.state.set(me.state.GAME_END, new WonScreen());
		
		// set the "Credits" Screen Object
		me.state.set(me.state.CREDITS, new CreditScreen());
		
		//Story
		me.state.set(me.state.STORY, new StoryScreen());
      
		//changer
		me.entityPool.add("plainChanger", PlainChanger);
			
		// add our player entity in the entity pool
		me.entityPool.add("hero", PlayerEntity);
		me.entityPool.add("pet", PetEntity);
		
		me.entityPool.add("flower", FlowerEntity);
		me.entityPool.add("slime", SlimeEntity);
		me.entityPool.add("dragon", DragonEntity);
		me.entityPool.add("slimeGreen", SlimeGreen);
		me.entityPool.add("witch", WitchEntity);
		
		me.entityPool.add("sensor", SensorPet);
		me.entityPool.add("sensorOrb", SensorOrb);
		me.entityPool.add("sensorOrbGet", SensorOrbGet);
		me.entityPool.add("sensorWitch", SensorWitch);
		me.entityPool.add("sensorTalk", SensorTalk);
		me.entityPool.add("sensorSpace", SensorSpace);
		me.entityPool.add("chest", ChestEntity);
      
	    me.sys.gravity = 0;
		me.debug.renderHitBox = false;
		
		me.state.transition("fade", "#000000", 250);
		
		// Bring Menu
		me.state.change(me.state.MENU);
	}

}; // jsApp

/* the in game stuff*/
var PlayScreen = me.ScreenObject.extend(
{

   onResetEvent: function()
	{	
      // stuff to reset on state change
      	 // add a default HUD to the game mngr
        me.game.addHUD(0, 0, 640, 485);
		
		// load a level
		me.levelDirector.loadLevel("jungle");
		
		//var canvas = document.getElementsByTagName("canvas")[0];
		//canvas.setAttribute("style","-webkit-filter: brightness(0.5)");
		
		   // add a new HUD item
        me.game.HUD.addItem("score", new ScoreObject(620, 200));
		me.game.HUD.addItem("lifeHUD", new LifeHUD(40, 10));
		me.game.HUD.addItem("instructHUD", new InstructHUD(5, 450));
		me.game.HUD.setItemValue("instructHUD", "Move with the WASD keys.")
		
		me.audio.playTrack("inthewild");
		
        // make sure everyhting is in the right order
        me.game.sort();
	},
	
	
	/* ---
	
		 action to perform when game is finished (state change)
		
		---	*/
	onDestroyEvent: function()
	{
	 // remove the HUD
        me.game.disableHUD();
		
		me.audio.stopTrack();
   }

});

/*----------------------
 
    A title screen
 
  ----------------------*/
 
var TitleScreen = me.ScreenObject.extend({
    // constructor
    init: function() {
        this.parent(true);
 
        // title screen image
        this.title = null;
 
        this.font = null;
		
		this.drawn = 0;
		
    },
 
    // reset function
    onResetEvent: function() {
        if (this.title == null) {
            this.title = me.loader.getImage("title");
			this.font = new me.Font("Arial", 25, "white");
			this.drawn = 0;
			 
        }
 
        // enable the keyboard
        me.input.bindKey(me.input.KEY.ENTER, "enter", true);
 
    },
 
    // update function
    update: function() {
        // enter pressed ?
        if (me.input.isKeyPressed('enter')) {
			me.state.change(me.state.STORY);
        }
        return true;
    },
 
    // draw function
    draw: function(context) {
		context.drawImage(this.title, 0, 0);
		this.font.draw(context, "Press Enter To Play", 40, 450);
    },
 
    // destroy function
    onDestroyEvent: function() {
        me.input.unbindKey(me.input.KEY.ENTER);
    }
 
});


var StoryScreen = me.ScreenObject.extend({
    // constructor
    init: function() {
        this.parent(true);
 
        this.font = new me.Font("Arial", 20, "white");
		this.drawn = 0;
    },
 
    // reset function
    onResetEvent: function() {
        // enable the keyboard
        me.input.bindKey(me.input.KEY.ENTER, "enter", true);
		this.drawn = 0;
    },
 
    // update function
    update: function() {
        // enter pressed ?
        if (me.input.isKeyPressed('enter')) 
		{
			me.state.change(me.state.PLAY);
        }
        return true;
    },
 
    // draw function
    draw: function(context) {
		if(this.drawn<13)
		{
			this.font.draw(context, "You have one more chance. This is all I can do now.", 50, 240);
			this.font.draw(context, "Just promise me, that you will save the world.", 50, 270);
			this.drawn++;
		}
    },
 
    // destroy function
    onDestroyEvent: function() {
        me.input.unbindKey(me.input.KEY.ENTER);
    }
 
});

var OverScreen = me.ScreenObject.extend({
    // constructor
    init: function() {
        this.parent(true);
 
        this.font = new me.Font("Arial", 20, "white");
		this.drawn = 0;
    },
 
    // reset function
    onResetEvent: function() {
        // enable the keyboard
        me.input.bindKey(me.input.KEY.ENTER, "enter", true);
		this.drawn = 0;
    },
 
    // update function
    update: function() {
        // enter pressed ?
        if (me.input.isKeyPressed('enter')) 
		{
			//SHOULD BE RESTART :P
        }
        return true;
    },
 
    // draw function
    draw: function(context) {
		if(this.drawn<13)
		{
			this.font.draw(context, "No! It Can't Be... (F5)", 50, 240);
			this.drawn++;
		}
    },
 
    // destroy function
    onDestroyEvent: function() {
        me.input.unbindKey(me.input.KEY.ENTER);
    }
 
});

//WInScreen
var WonScreen = me.ScreenObject.extend({
    // constructor
    init: function() {
        this.parent(true);
 
        this.font = new me.Font("Arial", 20, "white");
		 this.fontSmall = new me.Font("Arial", 15, "white");
		this.drawn = 0;
    },
 
    // reset function
    onResetEvent: function() {
        // enable the keyboard
        me.input.bindKey(me.input.KEY.ENTER, "enter", true);
		this.drawn = 0;
    },
 
    // update function
    update: function() {
        // enter pressed ?
        if (me.input.isKeyPressed('enter')) 
		{
			me.state.change(me.state.CREDITS);
        }
        return true;
    },
 
    // draw function
    draw: function(context) {
		if(this.drawn<13)
		{
			this.font.draw(context, "You Did It!", 50, 240);
			this.font.draw(context, "Thanks to you the world of Orb Knight is Saved.", 50, 270);
			this.fontSmall.draw(context, "Press (Enter) to go to Credits Screen.", 50, 290);
			this.drawn++;
		}
    },
 
    // destroy function
    onDestroyEvent: function() {
        me.input.unbindKey(me.input.KEY.ENTER);
    }
 
});


//WInScreen
var CreditScreen = me.ScreenObject.extend({
    // constructor
    init: function() {
        this.parent(true);
 
        this.font = new me.Font("Arial", 10, "white");
		this.drawn = 0;
    },
 
    // reset function
    onResetEvent: function() {
        // enable the keyboard
		this.drawn = 0;
    },
 
    // update function
    update: function() {
        // enter pressed ?
		/*
        if (me.input.isKeyPressed('enter')) 
		{
			me.state.change(me.state.PLAY);
        }*/
        return true;
    },
 
    // draw function
    draw: function(context) {
		if(this.drawn<13)
		{
			this.font.draw(context, "Credits/Special Thanks to:", 50, 200);
			this.font.draw(context, "MelonJS guys for the engine and support", 50, 220);
			this.font.draw(context,"VX Resource Planet, RpgMaker assets, Hanzo, and Mack for art", 50, 240);
			this.font.draw(context,"Aaron Krogh, DeceasedSuperiorTechnician(www.nosoapradio.us) and freesound SE for Music", 50, 260);
			this.font.draw(context,"Made by Secretmapper for Udacity HTML5 Game Contest", 50, 280);
			this.font.draw(context,"Refresh Page to Play Again!", 50, 300);
			this.drawn++;
		}
    },
 
    // destroy function
    onDestroyEvent: function() {
        me.input.unbindKey(me.input.KEY.ENTER);
    }
 
});

/*-------------- 
a score HUD Item
--------------------- */
 
var ScoreObject = me.HUD_Item.extend({
    init: function(x, y) {
        // call the parent constructor
        this.parent(x, y);
        // create a font
        this.font = new game.Font("Helvetica", 35, "white","right",2); //new me.BitmapFont("32x32_font", 32);
		this.font.bold();
    },
 
    /* -----
 
    draw our score
 
    ------ */
    draw: function(context, x, y) {
		var hitString = (this.value>1)?"Hits":"Hit"
        this.font.draw(context, this.value + hitString, this.pos.x +x, this.pos.y + y);
		
    }
 
});


/*-------------- 
Life HUD item
--------------------- */
var LifeHUD = me.HUD_Item.extend({	
	init: function(x, y, back, life) {
        // call the parent constructor
        this.parent(x, y);
        // create a font
		this.font = new me.Font("Arial",20,"white");
		this.background = me.loader.getImage("lifeBack");
		this.lifeBar = me.loader.getImage("lifeBar");
		
		this.value = game.heroHP;
    },

    /* -----
 
    draw our score
 
    ------ */
    draw: function(context, x, y) 
	{	
		this.value = game.heroHP;
		var width = this.lifeBar.width*(game.heroHP/game.maxHeroHP);
		this.font.draw(context, "HP:", this.pos.x - 35, this.pos.y+23 );
		context.drawImage(this.background,this.pos.x,this.pos.y);
		context.drawImage(this.lifeBar,this.pos.x,this.pos.y,width,this.lifeBar.height);
		this.font.draw(context, game.heroHP, this.pos.x , this.pos.y+50 );
    }
});



/*-------------- 
Instruction HUD
--------------------- */
var InstructHUD = me.HUD_Item.extend({
    init: function(x, y, back, life) {
        // call the parent constructor
        this.parent(x, y);
        // create a font
        this.font = new me.Font("Tahoma", 15, "white"); //new me.BitmapFont("32x32_font", 32);
		
		this.value = game.tutScript;
    },

    /* -----
 
    draw our score
 
    ------ */
    draw: function(context, x, y) 
	{
		this.font.draw(context, this.value, this.pos.x, this.pos.y+23 );
    }
 
});


//bootstrap :)
window.onReady(function() 
{
	jsApp.onload();
});
