package
{
	import events.NavigationEvent;
	
	import screens.InGame;
	import screens.Welcome;
	import screens.GameOver;
	
	import starling.display.Sprite;
	import starling.events.Event;
	
	public class Game extends starling.display.Sprite 
	{
		private var screenWelcome:Welcome;
		private var screenIngame:InGame;
		private var screenGameOver:GameOver;
		
		public function Game()
		{
			super();
			this.addEventListener(Event.ADDED_TO_STAGE, onAddedToStage);
		}
		
		private function onAddedToStage(event:Event):void
		{
				
			this.addEventListener(events.NavigationEvent.CHANGE_SCREEN, onChangeScreen);
			
			screenIngame = new InGame();
			this.addChild(screenIngame);
			screenIngame.disposeTemporarily();
			
			screenWelcome = new Welcome();
			this.addChild(screenWelcome);
			screenWelcome.initialize();
			
			screenGameOver = new GameOver();
			this.addChild(screenGameOver);
			screenGameOver.disposeTemporarily();
		}
		
		private function onChangeScreen(event:events.NavigationEvent):void
		{
			switch(event.params.id)
			{
				case "play":
					
					screenWelcome.disposeTemporarily();
					screenIngame.initialize();
					
					break;
					
				case "over":
					
					screenIngame.disposeTemporarily();
					screenGameOver.initialize();
				    
					break;
					
				case "welcome":
					
					screenGameOver.disposeTemporarily();
					screenWelcome.initialize();
					
					break;
			}
		}
	}
}