
var bp  = {};
var app = {};

$( function() { app.main.run () } );

app.main = {
	
	run : function ( ) {
			
		this.initAll( );
		
		app.scode.render();
		
	},
	
	initAll : function ( ) {
		for ( var i in app ) 
			if ( app[i].init ) app[i].init();
			
	}
}
