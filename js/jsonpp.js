
app.jsonpp = {
	
	parse : function( text ) {
		
		var data = SCODE.parseScode( text.join ( "\n" ) );	
		
		return data.elements;
	},
	
	xlate : function ( data, item ) {
		if ( !data || !data.slot || !data.obj ) return item.lines.join ( "\n" );
		
		var text = data.slot + " = " + SCODE.buildScode(data.obj ) + "\n\n";
		
		return text;
	},
} 
