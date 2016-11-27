

app.buffer = {
	
	init : function ( ) {
	},
	print : function ( ) {
		
		for ( var i in this.wallet.map ) {
			var el = this.wallet.map[ i ];
			
			if ( el.visible === false ) continue;
		}
	},
	getUID     : function ( ) {
		return "el_" + this.wallet.uid++;
	},
	
	addElement : function ( el, internal ) {
		if ( el.uid ) {
			this.changeElement( el );
			return;
		}
		
		el.uid = this.getUID();
		
		this.wallet.map[ el.uid ] = el;
		
		
		el.changed  = false;
		
		if ( !internal )
			app.textBuffer.addItem( el );
		
		this.print();
		return el;
	},
	
	
	removeElement : function ( el, internal ) {
		
		var id = el.uid || el ; //this.wallet.items[ pos ].source; 
		
		var el = this.wallet.map[ id ];
		
		el.visible = false;
		el.bufferCommand = "remove"
		
		if ( !internal)
			app.textBuffer.removeItem( el.pos );
		
		this.print();
	},
	
	changeElement : function ( el, data, internal ) {
		
		
		var id = el.uid || el;
		
		var el = this.wallet.map[ id ];
		
		
		var diff = DeepDiff.diff( el.data, data );
		
		if ( !diff ) return;
		
		var oldData = el.data;
		
		el.data = data;
		
		if (! internal )
			app.textBuffer.updateItem( el.pos );
		else {
			
			this.dataChanged( el.uid, data, oldData ) ;
			
			console.log( "changed", { from : oldData, to : data } );
		}
		
		this.print();
	},
	
		
	dataChanged : function ( ) {
		
	},
	
	
}
