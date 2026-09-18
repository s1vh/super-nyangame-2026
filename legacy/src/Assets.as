package
{
	import flash.display.Bitmap;
	import flash.utils.Dictionary;
	import starling.text.BitmapFont;
	import starling.text.TextField;
	import starling.textures.Texture;
	import starling.textures.TextureAtlas;
	
	public class Assets
	{
		
		private static var gameTextures:Dictionary = new Dictionary();
		private static var gameTextureAtlas:TextureAtlas;
		private static var welcomeTextureAtlas:TextureAtlas;
		
		[Embed(source = "../media/graphics/welcomeScreen_sheet.png")]
		public static const AtlasTextureWelcome:Class;
		
		[Embed(source = "../media/graphics/star0000.png")]
		public static const star:Class;
		
		[Embed(source = "../media/graphics/particle.png")]
		public static const particle:Class;
		
		[Embed(source = "../media/graphics/welcomeScreen_sheet.xml", mimeType="application/octet-stream")]
		public static const AtlasXmlWelcome:Class;
		
		[Embed(source = "../media/graphics/gameSprites_sheet.png")]
		public static const AtlasTextureGame:Class;
		
		[Embed(source = "../media/graphics/gameSprites_sheet.xml", mimeType="application/octet-stream")]
		public static const AtlasXmlGame:Class;
		
		[Embed(source="../media/Fonts/NyanImpact24/NyanImpact24.png")]
		public static const Font24Texture:Class;
		
		[Embed(source="../media/fonts/NyanImpact24/NyanImpact24.fnt", mimeType="application/octet-stream")]
		public static const Font24XML:Class;
		
		[Embed(source="../media/Fonts/NyanImpact48/NyanImpact48.png")]
		public static const Font48Texture:Class;
		
		[Embed(source="../media/fonts/NyanImpact48/NyanImpact48.fnt", mimeType="application/octet-stream")]
		public static const Font48XML:Class;
		
		public static var myFont:BitmapFont;
		
		public static function get24Font():BitmapFont
		{
			var fontTexture:Texture = Texture.fromBitmap(new Font24Texture());
			var fontXML:XML = XML(new Font24XML());
			
			var font:BitmapFont = new BitmapFont(fontTexture, fontXML);
			TextField.registerBitmapFont(font);
			
			return font;
		}
		
		public static function get48Font():BitmapFont
		{
			var fontTexture:Texture = Texture.fromBitmap(new Font48Texture());
			var fontXML:XML = XML(new Font48XML());
			
			var font:BitmapFont = new BitmapFont(fontTexture, fontXML);
			TextField.registerBitmapFont(font);
			
			return font;
		}
		
		public static function getTexture(name:String):Texture
		{
			if (gameTextures[name] == undefined) 
			{
				var bitmap:Bitmap = new Assets[name]();
				gameTextures[name] = Texture.fromBitmap(bitmap);
			}
			
			return gameTextures[name];
		}
		
		public static function getAtlas():TextureAtlas
		{
			if (gameTextureAtlas == null)
			{
				var texture:Texture = getTexture("AtlasTextureGame");
				var xml:XML = XML(new AtlasXmlGame());
				gameTextureAtlas = new TextureAtlas(texture, xml);
			}
			
			return gameTextureAtlas;
		}
		
		public static function getWelcomeAtlas():TextureAtlas
		{
			if (welcomeTextureAtlas == null)
			{
				var texture:Texture = getTexture("AtlasTextureWelcome");
				var xml:XML = XML(new AtlasXmlWelcome());
				welcomeTextureAtlas = new TextureAtlas(texture, xml);
			}
			
			return welcomeTextureAtlas;
		}
	}
}