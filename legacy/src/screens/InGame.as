package screens
{
	import flash.geom.Rectangle;
	import flash.utils.getTimer;
	import flash.media.SoundMixer;
	import flash.media.SoundChannel;
	import objects.bgStar;
	import objects.Obstacle;
	import objects.Particle;
	import starling.core.Starling;
	import starling.display.Image;
	import starling.display.MovieClip;
	import starling.text.TextField;
	import starling.utils.HAlign;
	import starling.utils.VAlign;
		
	import objects.Cat;
		
	import starling.display.Button;
	import starling.display.Sprite;
	import starling.events.Event;
	import starling.events.Touch;
	import starling.events.TouchEvent;
	import events.NavigationEvent;
	
	import starling.utils.deg2rad;
	
	public class InGame extends starling.display.Sprite
	{
		public static var cat:Cat;
		private var obstacle:Obstacle;
		private var enemigoCreado:int = 0;
		private var obstaclesToAnimate:Vector.<Obstacle> = new Vector.<Obstacle>();
		private var rainbowVector:Vector.<Image> = new Vector.<Image>();
		private var particleVector:Vector.<Particle>;
		private var rainbowCheck:Image;
		private var prevMinY:int = 800;
		private var prevMaxY:int = 0;
		private var redAvailable:Boolean = true;
		private var crashDuration:int = 0;
		private var crashed:Boolean = false;
		private var star:MovieClip;
		private var musicChannel:SoundChannel;
		private var fxChannel:SoundChannel;
		
		private var spawnDelay:Number;
		private var elapsed:Number;
		
		private var bgDelay:Number = 20 + Math.round(Math.random() * 30);
		private var bgVector:Vector.<bgStar> = new Vector.<bgStar>();
		private var newStar:bgStar;
		
		private var gameState:String;
		
		private var hit:Boolean = false;
		private var collect:Boolean = false;
		private var started:Boolean = false;		// this boolean controls a convenient untouchable time when the game has started
		private var readyToSpawn:Boolean = false;
		
		private var touch:Touch;
		private var touchX:Number;
		private var touchY:Number;
		
		private var scoreText:TextField;
		private var hitpoints:int;
		
		public static var score:int;
		public static var velocity:Number = 10;
		public static var turboMode:Boolean = false;
		
		public dynamic function getScore():int
		{
			return score;
		}
		
		public function InGame()
		{
			super();
			this.addEventListener(starling.events.Event.ADDED_TO_STAGE, onAddedToStage);
		}
		
		private function onAddedToStage(event:Event):void
		{
			this.removeEventListener(Event.ADDED_TO_STAGE, onAddedToStage);
			drawGame();
		}
		
		private function drawGame():void
		{			
			cat = new Cat();
			cat.x = stage.stageWidth / 2;
			cat.y = stage.stageHeight / 2;
			this.addChild(cat);
			
			scoreText = new TextField(100, 100, score.toString(), Assets.get24Font().name, 24, 0xffffff);
			scoreText.hAlign = HAlign.LEFT;
			scoreText.vAlign = VAlign.TOP;
			star = new MovieClip(Assets.getAtlas().getTextures("token00"), 26);
			star.y = 10;
			star.x = 150 - star.width;
			Starling.juggler.add(star);
			this.addChild(star);
			scoreText.x = 150;
			scoreText.y = 20;
			scoreText.border = false;
			scoreText.height = scoreText.textBounds.height + 10;
			this.addChild(scoreText);
		}
		
		private function createUpdateRainbow():void
		{
			rainbowCheck = new Image(Assets.getAtlas().getTexture("RbSegment"));
			rainbowVector.push(rainbowCheck);
			rainbowCheck.y = cat.y - cat.height / 9.5;
			rainbowCheck.x = Math.floor(cat.x - cat.x / 9.5);			// it delivers always the same aproximation value, preventing tearing on the rainbow
			this.addChild(rainbowCheck);
			this.setChildIndex(rainbowCheck, 0);
			
			if (rainbowVector.length > 1)
			{
				for (var i:uint = rainbowVector.length - 1; i > 0; i--)
				{
					rainbowCheck = rainbowVector[i];							// we can override this reference now
					rainbowCheck.alpha = 0.1 * -Math.floor(hitpoints * -0.1);	// it delivers the 0.1 multiple that is equal or higher (so we show always a little rainbow at least)
					rainbowCheck.x -= rainbowCheck.width;						// we put the alpha update on this loop because we want to update the whole rainbow!
				}
				
				if (rainbowCheck.x < 0)
				{
					rainbowVector.splice(i, 1);
					this.removeChild(rainbowCheck);						// we know this is the last segment!
				}
			}
			
			else
			{
				rainbowVector[0].visible = false;	// not the most elegant method, but I think this is the most efficient (and we have many segments and we can't reverse the array twice per frame)
			}
		}
		
		public function disposeTemporarily():void
		{
			this.visible = false;
		}
		
		public function initialize():void
		{
			this.visible = true;
			
			// RESET VARIABLES
			hitpoints = 100;
			score = 0;
			scoreText.text = score.toString();
			spawnDelay = 100;
			elapsed = 0;
			cat.x = -stage.stageWidth;
			cat.y = (stage.stageHeight / 2) + 2;
			cat.rotation = 0;
			gameState = "idle";
			touchY = stage.stageHeight / 2;
			velocity = 10;
			readyToSpawn = false;
			turboMode = false;
			if (!Sounds.muted) musicChannel = Sounds.sndBgMain.play(0, 9999);
			particleVector  = new Vector.<Particle>();
			
			//trace(rainbowVector.length);
			//trace(obstaclesToAnimate.length);
			
			// START
			launchCat();
		}
		
		private function launchCat():void
		{
			stage.addEventListener(TouchEvent.TOUCH, onTouch);
			stage.addEventListener(Event.ENTER_FRAME, onGameTick);
		}
		
		private function onTouch(event:TouchEvent):void
		{
			touch = event.getTouch(stage);
			
			if (touch != null && 50 < touch.globalY && touch.globalY < 750 )	
			{																	
				touchY = touch.globalY;											
			}																	
		}
		
		private function onGameTick(event:Event):void
		{
			switch(gameState)
			{
				case "idle":	// TAKE OFF
					
					if (cat.x < stage.stageWidth / 5)
					{
						cat.x += ((stage.stageWidth / 4 + 10) - cat.x) / 15;
						cat.y = stage.stageHeight / 2;
					}
					
					else
					{
						gameState = "flying"
						readyToSpawn = true;
						fxChannel = Sounds.sndFxTakeOff.play();
					}
					
					break;
					
				case "flying":	// GAME LOOP (game is running)
					
					catMoving();
					createUpdateRainbow();
					obstacleCheck();
					obstacleCreate();
					animateStarParticles();
					bgCreate();
					
					if (velocity < 20)	// we upgrade the velocity progresively until 24 to get the feeling of acceleration
					{
						velocity += Math.log(1.02) * 0.25;
						//velocity += Math.log(1.01) * 0.25;	// original acceleration
					}
					
					if (velocity >= 20 && turboMode == false)
					{
						velocity = 20;
						turboMode = true;
						fxChannel = Sounds.sndFxTakeOff.play();
						trace("TURBO!!");
					}
					
					if (crashed)
					{
						crashDuration++;
						
						if (crashDuration == 63)	// we have 21 frames of cat crash animation so we use multiples... (x3)
						{
							crashDuration = 0;
							crashed = false;
							cat.disposeCrashArt();
						}
					}
					
					break;
					
				case "gameOver":
					
					// we show a Game Over screen here, along with the last score
					
					break;
			}
		}
		
		private function catMoving():void
		{
			cat.y -= (cat.y - touchY) / 20;
			
			if (touchY - cat.y < cat.height / 2 && touchY - cat.y > - cat.height / 2)
			{
				cat.rotation = deg2rad((touchY - cat.y) / 3);
			}
		}
		
		private function obstacleCheck():void
		{
			var obstacleToTrack:Obstacle;
			
			if (hit)
			{
				velocity = 10;		// we reset velocity on hit!
				hit = false;
				
				if (turboMode)
				{
					if (hitpoints - 10 > 0)
					{
						hitpoints = hitpoints - 10;
					}
					
					else
					{
						hitpoints = 1;
					}
					
					turboMode = false;
					crashed = true;
					cat.disposeCatArt();
					trace(hitpoints + " HP");
				}
				
				else
				{	
					if (hitpoints - 20 > 0)
					{
						hitpoints = hitpoints - 20;
						crashed = true;
						cat.disposeCatArt();
						trace(hitpoints + " HP");
					}
					
					else
					{
						musicChannel.stop();
						fxChannel = Sounds.sndFxDeath.play();
						
						// reset vectors
						for (var rb:uint = 0; rb < rainbowVector.length; rb++)
						{
							rainbowVector.splice(rb, 0);
							this.removeChild(rainbowVector[rb]);
						}
						
						for (var obs:uint = 0; obs < obstaclesToAnimate.length; obs++)
						{
							obstacleToTrack = obstaclesToAnimate[obs];
							obstaclesToAnimate.splice(obs, 1);
							this.removeChild(obstacleToTrack);
						}
						
						gameState = "gameOver";
						trace("GAME OVER");
						this.dispatchEvent(new NavigationEvent(NavigationEvent.CHANGE_SCREEN, { id: "over" }, true));
					}
				}
				
			}
			
			if (collect)
			{
				collect = false;
				
				if (hitpoints < 100)
				{
					hitpoints++;
				}
				
				score++;
				scoreText.text = score.toString();
				trace(hitpoints + " HP");
			}
			
			if (obstaclesToAnimate.length > 0)   
			{
				readyToSpawn = true;
				
				for (var i:uint = 0; i < obstaclesToAnimate.length; i++)
				{
					obstacleToTrack = obstaclesToAnimate[i]
					
					if (obstacleToTrack.x + obstacleToTrack.obstacleWidth * velocity * 0.1 > stage.stageWidth)	// the distance between objects depends of the velocity to make it playable
					{
						readyToSpawn = false;
					}
					
					if (obstacleToTrack.bounds.intersects(cat.bounds) && hit == false && started)
					{
						switch(obstacleToTrack.type)
						{
							// ENEMY COLLISION
							case 1:
							case 2:
								
								if (crashed == false)
								{
									hit = true;
									fxChannel = Sounds.sndFxDamage.play();
									obstaclesToAnimate.splice(i, 1);
									this.removeChild(obstacleToTrack);
								}
								
								break;
							
							// STAR COLLISION
							case 3:
								createStarParticle(obstacleToTrack);
								collect = true;
								fxChannel = Sounds.sndFxCollect.play();
								obstaclesToAnimate.splice(i, 1);
								this.removeChild(obstacleToTrack);
								
								if (spawnDelay > 60)
								{
									spawnDelay--;									
								}
								
								else if (spawnDelay > 40)
								{
									spawnDelay -= 0.5;
								}
								
								else if (spawnDelay > 20)
								{
									spawnDelay -= 0.25;
								}
								
								break;
						}
					}
					
					if (obstacleToTrack.x < 0)
					{	
						obstaclesToAnimate.splice(i, 1);
						this.removeChild(obstacleToTrack);
					}
					
				}
			}
		}
		
		private function createStarParticle(obstacleToTrack:Obstacle):void
		{
			var count:int = 5;
			while (count > 0) {
				count--;
				
				var starParticle:Particle = new Particle();
				this.addChild(starParticle);
				
				starParticle.x = obstacleToTrack.x + Math.random() * 40 - 20;
				starParticle.y = obstacleToTrack.y - Math.random() * 40;
				
				starParticle.speedX = Math.random() * 2 + 1;
				starParticle.speedY = Math.random() * 5;
				starParticle.spin = Math.random() * 15;
				
				starParticle.scaleX = starParticle.scaleY = Math.random() * 0.3 + 0.3;
				particleVector.push(starParticle);
			}
		}
		
		private function animateStarParticles():void
		{
			for (var i:uint = 0; i < particleVector.length; i++)
			{
				var starParticletoTrack:Particle = particleVector[i];
				if (starParticletoTrack)
				{
					starParticletoTrack.scaleX -= 0.03;
					starParticletoTrack.scaleY = starParticletoTrack.scaleX;
					
					starParticletoTrack.y -= starParticletoTrack.speedY;
					starParticletoTrack.speedY -= starParticletoTrack.speedY * 0.2;
					
					starParticletoTrack.x += starParticletoTrack.speedX;
					starParticletoTrack.speedX--;
					
					starParticletoTrack.rotation += deg2rad(starParticletoTrack.spin);
					starParticletoTrack.spin *= 1.1;
					
					if (starParticletoTrack.scaleY <= 0.02) {
						particleVector.splice(i, 1);
						this.removeChild(starParticletoTrack);
						starParticletoTrack = null;
					}
				}
			}
		}
		
		private function obstacleCreate():void
		{
			var obstacleCreated:Obstacle;
			var type:int;
			
			elapsed += Math.floor(velocity * 0.1);		// elapsed time depends of current velocity to prevent big blank areas and balance difficulty
			
			if (elapsed >= spawnDelay && readyToSpawn)		// we use greater or equal because depending on the current velocity we can easily bypass it
			{
				started = true;				
				type = 1 + Math.round(Math.random() * 9);	// randomized object spawner
				
				switch(type)
				{
					
					case 1:
					case 2:
					case 3:
					case 4:
						// this is the GREEN ENEMY
						trace("GREEN incoming");
						
						obstacleCreated = new Obstacle(1);
						obstacleCreated.setDimensions(1);
						
						obstacleCreated.y = obstacleCreated.obstacleHeight / 2 + Math.round(Math.random() * (stage.stageHeight - obstacleCreated.obstacleHeight));
						
						while (prevMinY - obstacleCreated.obstacleHeight / 2 < obstacleCreated.y && obstacleCreated.y < prevMaxY + obstacleCreated.obstacleHeight / 2)
						{
							obstacleCreated.y = obstacleCreated.obstacleHeight / 2 + Math.round(Math.random() * (stage.stageHeight - obstacleCreated.obstacleHeight));
						}
						
						obstacleCreated.x = stage.stageWidth + obstacleCreated.obstacleWidth;
						
						this.addChild(obstacleCreated);
						obstaclesToAnimate.push(obstacleCreated);
						
						prevMinY = obstacleCreated.y - obstacleCreated.obstacleHeight / 2;
						prevMaxY = obstacleCreated.y + obstacleCreated.obstacleHeight / 2;
						
						redAvailable = true;
						
						break;
						
					case 5:	
					case 6:
					case 7:
						// this is the STAR
						trace("STAR row incoming");
						
						var starNum:int;
						
						starNum = 1 + Math.round(Math.random() * 4);	// size of the star row (1-5)
						
						obstacleCreated = new Obstacle(3);
						obstacleCreated.setDimensions(3);
						
						obstacleCreated.y = obstacleCreated.obstacleHeight / 2 + Math.round(Math.random() * (stage.stageHeight - obstacleCreated.obstacleHeight));
						
						while (prevMinY - obstacleCreated.obstacleHeight / 2 < obstacleCreated.y && obstacleCreated.y < prevMaxY + obstacleCreated.obstacleHeight / 2)
						{
							obstacleCreated.y = obstacleCreated.obstacleHeight / 2 + Math.round(Math.random() * (stage.stageHeight - obstacleCreated.obstacleHeight));
							break;
						}
						
						obstacleCreated.x = stage.stageWidth + obstacleCreated.obstacleWidth;
						
						var starY:int;
						var starX:int;
						
						starY = obstacleCreated.y;
						starX = obstacleCreated.x;						
						
						while (starNum > 0)
						{
							if (turboMode)
							{
								obstacleCreated = new Obstacle(3);
								obstacleCreated.setDimensions(3);
								
								obstacleCreated.y = starY + obstacleCreated.obstacleHeight / 2;
								obstacleCreated.x = starX + obstacleCreated.obstacleWidth / 2;
								
								this.addChild(obstacleCreated);
								obstaclesToAnimate.push(obstacleCreated);
								
								obstacleCreated = new Obstacle(3);
								obstacleCreated.setDimensions(3);
								
								obstacleCreated.y = starY - obstacleCreated.obstacleHeight / 2;
								obstacleCreated.x = starX + obstacleCreated.obstacleWidth / 2;
								
								this.addChild(obstacleCreated);
								obstaclesToAnimate.push(obstacleCreated);
								
								starX = obstacleCreated.x;
								starNum--;
							}
							
							else
							{
								obstacleCreated = new Obstacle(3);
								obstacleCreated.setDimensions(3);
								
								obstacleCreated.y = starY;
								obstacleCreated.x = starX + obstacleCreated.obstacleWidth / 2;
								
								this.addChild(obstacleCreated);
								obstaclesToAnimate.push(obstacleCreated);
								
								starX = obstacleCreated.x;
								starNum--;
							}
						}
						
						prevMinY = obstacleCreated.y - obstacleCreated.obstacleHeight / 2;
						prevMaxY = obstacleCreated.y + obstacleCreated.obstacleHeight / 2;
						
						redAvailable = true;
						
						break;
						
					case 8:
					case 9:	
					case 10:
						// this is the RED ENEMY
						
						if (redAvailable)	// we do not want two REDs to spawn in a streak!
						{
							trace("RED incoming");
							
							obstacleCreated = new Obstacle(2);
							obstacleCreated.setDimensions(2);
							obstacleCreated.y = obstacleCreated.obstacleHeight / 2 + Math.round(Math.random() * (stage.stageHeight - obstacleCreated.obstacleHeight));
							
							while (prevMinY - obstacleCreated.obstacleHeight / 2 < obstacleCreated.y && obstacleCreated.y < prevMaxY + obstacleCreated.obstacleHeight / 2)
							{
								obstacleCreated.y = obstacleCreated.obstacleHeight / 2 + Math.round(Math.random() * (stage.stageHeight - obstacleCreated.obstacleHeight));
							}
							
							prevMinY = obstacleCreated.y - obstacleCreated.obstacleHeight / 2;
							prevMaxY = obstacleCreated.y + obstacleCreated.obstacleHeight / 2;
							
							redAvailable = false;
						}
						
						else	// if previous enemy was RED it spawns a GREEN one!
						{
							trace("2nd RED not allowed; GREEN incoming");
							
							obstacleCreated = new Obstacle(1);
							obstacleCreated.setDimensions(1);
							obstacleCreated.y = obstacleCreated.obstacleHeight / 2 + Math.round(Math.random() * (stage.stageHeight - obstacleCreated.obstacleHeight));
							
							while (prevMinY - obstacleCreated.obstacleHeight / 2 < obstacleCreated.y && obstacleCreated.y < prevMaxY + obstacleCreated.obstacleHeight / 2)
							{
								obstacleCreated.y = obstacleCreated.obstacleHeight / 2 + Math.round(Math.random() * (stage.stageHeight - obstacleCreated.obstacleHeight));
							}
							
							prevMinY = obstacleCreated.y - obstacleCreated.obstacleHeight;		// we need to compare and leave a larger blocked area because the movement pattern
							prevMaxY = obstacleCreated.y + obstacleCreated.obstacleHeight;		// so we are blocking twice the area than for other objects !
							
							redAvailable = true;
						}
						
						obstacleCreated.x = stage.stageWidth + obstacleCreated.width;
						
						this.addChild(obstacleCreated);
						obstaclesToAnimate.push(obstacleCreated);
						
						break;
				}
					
				elapsed = 0;
			}
		}
		
		private function bgCreate():void
		{
			var trackedStar:bgStar;
			
			if (bgVector.length > 0)
			{
				for (var st:uint = 0; st < bgVector.length; st++)
				{
					trackedStar = bgVector[st];
					
					if (trackedStar.x < 0)
					{	
						bgVector.splice(st, 1);
						this.removeChild(trackedStar);
						//trace("bg star erased!");
					}
				}
			}
			
			bgDelay--;
			
			if (bgDelay <= 0)
			{
				newStar = new bgStar;
				bgVector.push(newStar);
				
				newStar.y = Math.round(Math.random() * stage.stageHeight);
				newStar.x = stage.stageWidth;
				
				this.addChild(newStar);
				this.setChildIndex(newStar, 1);
				//trace("bg star created!");
				
				bgDelay = 20 + Math.round(Math.random() * 30);
			}
		}
		
	}
	
}