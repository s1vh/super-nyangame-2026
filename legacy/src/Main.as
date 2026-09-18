package
{
	import flash.display.Sprite;
	import screens.InGame;
	
	import net.hires.debug.Stats;
	
	import starling.core.Starling;
	
	[SWF(framerate = "60", width = "1280", height = "800", backgroundColor = "0x110e20")]
	public class Main extends Sprite
	{
		
		private var stats:Stats;
		private var myStarling:Starling;
		
		public var showStats:Boolean = false;	// set it as TRUE to show stats
		
		public function Main()
		{
			stats = new Stats();
			if (showStats)
			{
				this.addChild(stats);
			}
			
			myStarling = new Starling(Game, stage);
			myStarling.antiAliasing = 4;
			myStarling.start();
		}
	}
}