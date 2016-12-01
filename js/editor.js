app.editor = {
	
	init : function ( ) {
		
		this.wallet = {
			map : {},
			items : [],
			
			uid : 1,
		}
		
		app.buffer.wallet = this.wallet;
		app.textBuffer.wallet = this.wallet;
		
	},
	
	
	addItem : function ( ) {		
	},
	removeItem : function ( ){
	},
	changeItem  :function ( ) {
	},
	
	
	beforeTextChange : function ( change ) {
		
		if ( change.origin && change.origin.internal ) 
			return;
		
		app.textBuffer.addChange( change );		
	},
	
	afterTextChange : function ( change ) {
		if ( change.origin && change.origin.command == "requestUpdate" ) {
			console.log( "requesting update" );
			app.textBuffer.applyCommands();
		}
		
		if ( !change.origin.internal ) 
			app.textBuffer.updateMarks(0);
	},
	
	requestChange : function ( uid, obj ) {
		var data = this.wallet.map[ uid ].data;
		
		app.buffer.changeElement( uid, { slot : data.slot, obj: obj } );
		
		app.textBuffer.applyCommands();
	},
	
	
	cursorChange : function ( change ) {
		//if ( change.origin && change.origin.internal ) return;
		
		//console.log ("TOTOT",  app.scode._viewport() );
	}
	
}
