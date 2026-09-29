package objects
{
	import starling.core.Starling;
	import starling.display.Image;
	import starling.display.MovieClip;
	import starling.display.Sprite;
	import starling.events.Event;
	
	public class Cat extends starling.display.Sprite
	{
		private var catArt:MovieClip;
		private var crashArt:MovieClip;
		
		public function Cat()
		{
			super();
			this.addEventListener(starling.events.Event.ADDED_TO_STAGE, onAddedToStage);
		}
		
		private function onAddedToStage(event:Event):void
		{
			this.removeEventListener(Event.ADDED_TO_STAGE, onAddedToStage);
			createCatArt();
		}
		
		private function createCatArt():void
		{
			crashArt = new MovieClip(Assets.getAtlas().getTextures("cat_hit00"), 21);
			crashArt.x = Math.ceil(-crashArt.width / 2);
			crashArt.y = Math.ceil( -crashArt.height / 2);
			starling.core.Starling.juggler.add(crashArt);
			crashArt.visible = false;
			this.addChild(crashArt);
			
			catArt = new MovieClip(Assets.getAtlas().getTextures("cat00"), 20);
			catArt.x = Math.ceil(-catArt.width / 2);
			catArt.y = Math.ceil( -catArt.height / 2);
			starling.core.Starling.juggler.add(catArt);
			this.addChild(catArt);
		}
		
		public function disposeCatArt():void
		{
			catArt.visible = false;
			crashArt.visible = true;
		}
		
		public function disposeCrashArt():void
		{
			crashArt.visible = false;
			catArt.visible = true;
		}
		
		public function getArt():Image
		{
			return catArt;
		}
		
	}
}