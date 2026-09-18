package objects
{
	import screens.InGame;
	import starling.core.Starling;
	import starling.display.Image;
	import starling.display.MovieClip;
	import starling.display.Sprite;
	import starling.events.Event;
	import flash.display.Graphics;
	
	public class Obstacle extends starling.display.Sprite
	{
		private var obstacleArt:MovieClip;
		private var obstacleType:int;
		
		public var obstacleHeight:int;
		public var obstacleWidth:int;
		
		public function Obstacle(type:int)
		{
			super();
			this.addEventListener(starling.events.Event.ADDED_TO_STAGE, onAddedToStage);
			obstacleType = type;
		}
		
		public function setDimensions(dimType:int):void
		{
			switch(dimType)
			{
				case 1:
				case 2:
					
					obstacleHeight = 200;
					obstacleWidth = 200;
					break;
					
				case 3:
					
					obstacleHeight = 150;
					obstacleWidth = 150;
					break;
			}
		}
		
		private function onAddedToStage(event:Event):void
		{
			this.removeEventListener(Event.ADDED_TO_STAGE, onAddedToStage);
			this.addEventListener(Event.ENTER_FRAME, onGameTick);
			createObstacleArt(this.obstacleType);
		}
		
		private function createObstacleArt(spriteType:int):void
		{
			switch(spriteType)
			{
				
				case 1:
					
					obstacleArt = new MovieClip(Assets.getAtlas().getTextures("invader00"), 20);
					break;
					
				case 2:
					
					obstacleArt = new MovieClip(Assets.getAtlas().getTextures("destructor00"), 20);
					break;
					
				case 3:
					
					obstacleArt = new MovieClip(Assets.getAtlas().getTextures("star00"), 20);
					break;
			}
			
			obstacleArt.x = Math.ceil(-obstacleArt.width / 2);
			obstacleArt.y = Math.ceil(-obstacleArt.height / 2);
			starling.core.Starling.juggler.add(obstacleArt);
			this.addChild(obstacleArt);
		}
		
		private function onGameTick():void
		{
			this.x -= Math.round(InGame.velocity);
			
			if (this.obstacleType == 2)
			{
				this.y += Math.cos(this.x * 0.005) * 10;
			}
			
			if (this.obstacleType == 3 && InGame.turboMode)
			{
				this.x -= Math.round(InGame.velocity / (1 + Math.abs(this.x - InGame.cat.x) * 0.005));
				
				if (this.y < InGame.cat.y)
				{
					this.y += Math.round(5 / (1 + (InGame.cat.y - this.y) * 0.005));
				}
				
				if (this.y > InGame.cat.y)
				{					
					this.y -= Math.round(5 / (1 + (this.y - InGame.cat.y) * 0.005));
				}
			}
			
		}
		
		public function get type():int
		{
			return obstacleType;
		}
		
	}
}