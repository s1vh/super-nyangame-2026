package screens 
{
	import starling.core.Starling;
	import starling.display.Button;
	import starling.display.MovieClip;
	import starling.events.Event;
	import events.NavigationEvent;
	import starling.text.TextField;
	import starling.utils.HAlign;
	import starling.utils.VAlign;
	import flash.media.SoundChannel;
	
	public class GameOver extends starling.display.Sprite
	{
		private var tokenArt:MovieClip;
		private var scoreText:TextField;		
		private var starBtn:Button;
		private var channel:SoundChannel;
		
		public function GameOver() 
		{
			super();
			//this.addEventListener(starling.events.Event.ADDED_TO_STAGE, onAddedToStage);
		}
		
		//private function onAddedToStage(event:Event):void
		//{
			//this.removeEventListener(Event.ADDED_TO_STAGE, onAddedToStage);
			//animate();
		//}
		
		//private function animate():void
		//{	
			//tokenArt = new MovieClip(Assets.getAtlas().getTextures("star00"), 20);
			//this.addChild(tokenArt);
		//}
		
		public function initialize():void
		{
			this.visible = true;
			
			if (starBtn == null)
			{
				starBtn = new Button(Assets.getTexture("star"));
			}
			
			starBtn.x = (stage.stageWidth / 2) - 200;
			starBtn.y = (stage.stageHeight / 2) - 100;
			
			if (scoreText == null)
			{
				scoreText = new TextField(100, 100, InGame.score.toString(), Assets.get48Font().name, 48, 0xffffff);
			}
			else
			{
				scoreText.text = InGame.score.toString();
			}
			
			scoreText.hAlign = HAlign.LEFT;
			scoreText.vAlign = VAlign.TOP;
			scoreText.y = starBtn.y + 55;
			scoreText.x = starBtn.x + starBtn.width / 2 + 40;
			this.addChild(scoreText);
			this.addChild(starBtn);
			this.addEventListener(Event.TRIGGERED, onMainMenuClick);
		}
		
		private function onMainMenuClick(event:Event):void
		{
			var buttonClicked:Button = event.target as Button;
			if ((buttonClicked as Button) == starBtn)
			{
				channel = Sounds.sndFxMeow.play();
				this.dispatchEvent(new NavigationEvent(NavigationEvent.CHANGE_SCREEN, { id: "welcome" }, true));
			}
		}
		
		public function disposeTemporarily():void
		{
			this.visible = false;
		}
	}

}