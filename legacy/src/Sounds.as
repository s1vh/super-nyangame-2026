package 
{
	import flash.media.Sound;
	
	public class Sounds 
	{
		
		[Embed(source = "../media/Music_Sounds/NyanLoop.mp3")]
		public static const SND_BG_GAME:Class;
		
		[Embed(source = "../media/Music_Sounds/NyanWelcome.mp3")]
		public static const SND_BG_WELCOME:Class;
		
		[Embed(source = "../media/Effect_Sounds/collect.mp3")]
		public static const SND_FX_COLLECT:Class;
		
		[Embed(source = "../media/Effect_Sounds/damage.mp3")]
		public static const SND_FX_DAMAGE:Class;
		
		[Embed(source = "../media/Effect_Sounds/death.mp3")]
		public static const SND_FX_DEATH:Class;
		
		[Embed(source = "../media/Effect_Sounds/meow.mp3")]
		public static const SND_FX_MEOW:Class;
		
		[Embed(source = "../media/Effect_Sounds/start.mp3")]
		public static const SND_FX_START:Class;
		
		[Embed(source = "../media/Effect_Sounds/takeOff.mp3")]
		public static const SND_FX_TAKEOFF:Class;
		
		public static var sndBgMain:Sound = new Sounds.SND_BG_GAME() as Sound;
		public static var sndBgWelcome:Sound = new Sounds.SND_BG_WELCOME() as Sound;
		public static var sndFxCollect:Sound = new Sounds.SND_FX_COLLECT() as Sound;
		public static var sndFxDamage:Sound = new Sounds.SND_FX_DAMAGE() as Sound;
		public static var sndFxDeath:Sound = new Sounds.SND_FX_DEATH() as Sound;
		public static var sndFxMeow:Sound = new Sounds.SND_FX_MEOW() as Sound;
		public static var sndFxStart:Sound = new Sounds.SND_FX_START() as Sound;
		public static var sndFxTakeOff:Sound = new Sounds.SND_FX_TAKEOFF() as Sound;
		
		public static var muted:Boolean = false;
		
	}

}