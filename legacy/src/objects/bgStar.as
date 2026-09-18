package objects 
{
	import screens.InGame;
	import starling.core.Starling;
	import starling.display.Image;
	import starling.display.MovieClip;
	import starling.display.Sprite;
	import starling.events.Event;
	import flash.display.Graphics;
	
	public class bgStar extends Sprite
	{
		private var starArt:MovieClip;
		
		public function bgStar()
		{
			super();
			this.addEventListener(starling.events.Event.ADDED_TO_STAGE, onAddedToStage);
		}
		
		private function onAddedToStage(event:Event):void
		{
			this.removeEventListener(Event.ADDED_TO_STAGE, onAddedToStage);
			this.addEventListener(Event.ENTER_FRAME, onGameTick);
			animate();
		}
		
		private function animate():void
		{
			var starScale:Number;
			
			starScale = 0.25 + Math.random() * 0.75;
			
			starArt = new MovieClip(Assets.getAtlas().getTextures("backgroundStar"), 3);
			
			starArt.x = Math.ceil(-starArt.width / 2);
			starArt.y = Math.ceil( -starArt.height / 2);
			starArt.scaleX = starScale;
			starArt.scaleY = starScale;
			starling.core.Starling.juggler.add(starArt);
			this.addChild(starArt);
		}
		
		private function onGameTick():void
		{
			this.x -= Math.round(this.width * InGame.velocity * 0.01);	// we don't need layers if we can move them gradually depending of its size!
		}
		
	}

}