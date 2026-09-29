package screens
{
	import com.greensock.TweenLite;
	
	import events.NavigationEvent;
	
	import starling.display.Button;
	import starling.display.Image;
	import starling.display.Sprite;
	import starling.events.Event;
	import flash.media.SoundChannel;
	
	public class Welcome extends starling.display.Sprite
	{
		private var title:Image;
		private var cat:Image;
		private var cat2:Image;
		private var rainbow:Image;
		private var subtitle:Image;
		private var musicChannel:SoundChannel;
		private var fxChannel:SoundChannel;
		
		private var playBtn:Button;
		
		public function Welcome()
		{
			super();
			this.addEventListener(starling.events.Event.ADDED_TO_STAGE, onAddedToStage);
		}
		
		private function onAddedToStage(event:starling.events.Event):void
		{
			drawScreen();
		}
		
		private function drawScreen():void
		{
			rainbow = new Image(Assets.getWelcomeAtlas().getTexture("welcome_rainbow"));
			rainbow.x = 0;
			rainbow.y = 0;
			this.addChild(rainbow);
			
			title = new Image(Assets.getWelcomeAtlas().getTexture("welcome_title"));
			title.x = 430;
			title.y = 20;
			this.addChild(title);
			
			subtitle = new Image(Assets.getWelcomeAtlas().getTexture("welcome_super"));
			subtitle.x = 390;
			subtitle.y = 10;
			this.addChild(subtitle);
			
			playBtn = new Button(Assets.getWelcomeAtlas().getTexture("welcome_start"));
			playBtn.x = 430;
			playBtn.y = 500;
			this.addChild(playBtn);
			
			cat = new Image(Assets.getWelcomeAtlas().getTexture("welcome_cat"));
			cat.x = 0;
			cat.y = 200;
			this.addChild(cat);
			
			cat2 = new Image(Assets.getWelcomeAtlas().getTexture("welcome_cat"));
			cat2.x = stage.stageWidth;
			cat2.scaleX = -1;
			cat2.y = 200;
			this.addChild(cat2);
			
			this.addEventListener(Event.TRIGGERED, onMainMenuClick);
		}
		
		private function onMainMenuClick(event:starling.events.Event):void
		{
			var buttonClicked:Button = event.target as Button;
			if ((buttonClicked as Button) == playBtn)
			{
				fxChannel = Sounds.sndFxStart.play();
				musicChannel.stop();
				this.dispatchEvent(new NavigationEvent(NavigationEvent.CHANGE_SCREEN, { id: "play" }, true));
			}
		}
		
		public function disposeTemporarily():void
		{
			this.visible = false;
		}
		
		public function initialize():void
		{
			this.visible = true;
			this.addEventListener(Event.ENTER_FRAME, catAnimation);
			musicChannel = Sounds.sndBgWelcome.play(2000,999);
		}
		
		private function catAnimation():void
		{
			var currentDate:Date = new Date();
			playBtn.y = 500 + (Math.sin(currentDate.getTime() * 0.01) * 10);
			subtitle.scaleX = 1 + (Math.sin(currentDate.getTime() * 0.01) * 0.05);
			subtitle.scaleY = 1 + (Math.sin(currentDate.getTime() * 0.01) * 0.05);
			title.y = 20 + (Math.cos(currentDate.getTime() * 0.002) * 20);
			cat.x = Math.cos(currentDate.getTime() * 0.005) * 10 - 10;
			cat2.x = stage.stageWidth - Math.cos(currentDate.getTime() * 0.005) * 10 + 10;
			rainbow.scaleY = 1.10 + Math.cos(currentDate.getTime() * 0.002) * 0.05;
		}
		
	}
	
}