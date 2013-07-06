//Dialog Box

/* Dialog box */
game.dialog = function dialog(script, callback) {
    var background =  me.loader.getImage("dialog");
    var font = new me.Font("Verdana", 16, "#eee");
	
   // game.modal = true;
    var dialog_box = new DialogObject(
        // x, y
        30,
        me.video.getHeight() - background.height - 15,

        // Background image.
        background,

        // Text to display.
        script,

        // width, height.
        555,
        71,

        // Text offset x, y.
        12,
        12,

        // Font to display it in.
        font,

        // Which key to watch for.
        'attack',

        // What to do when dialog has closed.
        callback
    );
	me.game.HUD.addItem("dialog_box", dialog_box);
};

/*--------------
Dialog HUD
--------------------- */
var DialogObject = me.HUD_Item.extend({
    init: function (x, y, background, dialog, widthText, heightText, offsetTextX, offsetTextY, font, tagKey, callback) {
        
		// call the parent constructor
        this.parent(x, y);
        // create a font
        this.font = new me.Font("Arial", 20, "white"); //new me.BitmapFont("32x32_font", 32);
		this.background = background;

		this.pos = new me.Vector2d(x, y);

        this.font = font;
        this.tagKey = tagKey;
        this.widthText = widthText;
        this.heightText = heightText;
        this.rowCount = Math.floor(this.heightText / (this.font.height * 1.1));
        this.offsetTextX = offsetTextX;
        this.offsetTextY = offsetTextY;
        this.dialog = dialog;
		
        this.counter = 0;
        this.currentRow = 0;
        this.callback = callback;
        this.visible = true;
		
		this.value = 0;
		
		this.wholeLength = (this.dialog.length - 1);
    },
    /* -----

    draw our score

    ------ */
    draw: function(context, x, y)
	{
		context.drawImage(this.background,this.pos.x,this.pos.y);
		
		if(this.value<=this.wholeLength)
		{	
			var length = this.dialog[this.value].length;
			for(var i = 0; i<length; i++)
				this.font.draw(context, this.dialog[this.value][i], this.pos.x + x +75, this.pos.y + y + (20*i)+ 25);
		}else
		{
			me.game.remove(this);
			this.callback.call();
		}
	}

});

game.Font = me.Font.extend({
	/** @private */
		init : function(font, size, color, textAlign,lineWidth) {

			// font name and type
			this.set(font, size, color, textAlign);
			this.lineWidth = lineWidth
		},
		
		/**
		 * draw a text at the specified coord
		 * @param {Context} context 2D Context
		 * @param {String} text
		 * @param {int} x
		 * @param {int} y
		 */
		draw : function(context, text, x, y) {
			// draw the text
			context.font = this.font;
			context.fillStyle = this.color;
			
			context.lineWidth = this.lineWidth;
			
			context.textAlign = this.textAlign;
			context.fillText(text, ~~x, ~~y);
			
			if(this.lineWidth >0)
			{
				context.strokeStyle = 'black';			
				context.strokeText(text,  ~~x, ~~y);
				context.stroke();
			}

			context.fill();
			
		}
});
