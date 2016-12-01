
app.testing = {
	
	getState : function ( ) {
		var state = {
			
			wallet : _.cloneDeep( app.editor.wallet ),
			
			scode  : { 
				text : app.scode._content(),
				viewport : _.cloneDeep( app.scode._viewport() )
			}
		}
		
		return state;
	},
	
	run1 : function ( ) {
		app.buffer.addElement( { data : { slot : "bp.list", obj : {} }, mirror : app.bok, cfg : {} } );
		
		for ( var i  = 0 ; i< 5; i++ ) {
			
			
			app.buffer.addElement( { data : { slot : "bp.element_" + i, obj : { x : 12, y : i } } } );
			
			
			//app.textBuffer.insertItem( i, "bp.element_" + i ,  { value : { x : 12 , y : i} } );
		}
		
		app.textBuffer.applyCommands();
	},
	
	
	run2 : function ( ) {
		
		app.textBuffer.wallet = app.buffer.wallet;
		
		for ( var i  = 0 ; i< 25; i++ ) {
			
			
			app.buffer.addElement( { data : { slot : "bp.element_" + i, obj : { x : 12, y : i } } } );
			
			
			//app.textBuffer.insertItem( i, "bp.element_" + i ,  { value : { x : 12 , y : i} } );
		}
		
		var tests = {};
		
		app.textBuffer.applyCommands();
		
		this.step( "basic initialization" );
		
		this.check( "value is the same in editor and items",this.compareBufferAndScode ()  );
		
		
		
		
		this.step( "item change" );
		app.textBuffer.wallet.items[2].lines.push( "test" );
		app.textBuffer.wallet.items[2].uiCommand = "update";
		
		app.textBuffer.wallet.items[3].lines.push( "aftertest" );
		app.textBuffer.wallet.items[3].lines.unshift( "beforetest" );
		app.textBuffer.wallet.items[3].uiCommand = "update";
		
		
		app.textBuffer.applyCommands();
		
		
		
		this.check( "scode updates when item changes ", this.compareBufferAndScode () );
		
		
		app.textBuffer.removeItem( 2 );
		this.check( "scode updates when item removed ", this.compareBufferAndScode () );
		
		
		app.textBuffer.insertItem( 2, "bp.newelemenet", { value : {z : "salut" } } );
		app.textBuffer.applyCommands();
		this.check( "scode updates when item inserted ", this.compareBufferAndScode () );
		
		
		
		this.step( "scode changed" );
		
		
		var state1 = this.getState();
		
		
		var that = this;
		var change  ={
			
			from : { line : 0, ch : 0 },
			to   : { line : 2, ch : 3 },
			
			text : [ "salut", "salut", "salut" ],
			
			origin : { x : "salut", callback : function( args ) {
				//console.log( args, app.textBuffer.wallet.items[ args.startItem ] );
			}}
		}
		
		app.scode.rangeChange( change );
		
		this.check( "single text", this.compareBufferAndScode () );
		
		
		this.step( "buffer actions" );
		
		
		
		app.buffer.addElement( { pos : 2, data : { slot : "bp.salut1", obj : { x : "salut" }}} );
		app.buffer.addElement( { pos : 2, data : { slot : "bp.salut2", obj : { x : "salut" }}} );
		app.textBuffer.applyCommands( );
		
		this.check( "scode updates when element added ", this.compareBufferAndScode () );
		
		
		app.buffer.removeElement( "el_2" );
		this.check( "scode updates when element removed", this.compareBufferAndScode () );
		
		this.print();
		
		this.restoreState( state1 );
		
		
		app.buffer.addElement( { data : { slot : "bp.element_j" , obj : { x : 12, y : 3434 } } } );
		
		
		
		var state2 = this.getState();
		
		console.log( DeepDiff( state1, state2 ) );
	},
	
	restoreState : function ( state ) {
		
		for ( var i in state.wallet ) 
			app.editor.wallet[ i ] = _.cloneDeep( state.wallet[ i ] )
			
			app.scode.$content( state.scode.text, true );
	},
	
	_addItem : function ( pos ) {
		
		app.textBuffer.insertItem( pos, "bp.newelemenet" + pos + Math.round(Math.random() * 100 ), { value : {z : "salut" } } );
		app.textBuffer.applyCommands();
		this.check( "scode updates when item inserted ", this.compareBufferAndScode () );
		
	},
	compareBufferAndScode : function ( ) {
		var value = app.scode.item.cm.getValue();
		var expectedValue = this.concatLines( app.textBuffer.wallet.items ).concat([""]).join("\n");
		
		return { 
			ok : value == expectedValue, 
			value, 
			expectedValue, 
			diff : JsDiff.diffChars( value, expectedValue ),
			items : _.cloneDeep( app.textBuffer.wallet )
		}
	},
	tst : [],
	currentStep : [],
	check : function ( name, value ) {
		var check = { name , value };
		this.currentStep.items.push( check );
		this.currentStep.count++;
		if ( value != false || value.ok ) {
			
			this.currentStep.passed++;
		}
		
		else {
			check.failed = true;
		}
	},
	step : function ( name ) {
		var step = { name, items : [], count : 0, passed : 0 };
		
		this.tst.push ( step );
		
		this.currentStep = step;
	},
	
	print : function ( ) {
		
		for ( var i = 0; i<this.tst.length; i++ ) {
			var step = this.tst[ i ];
			
			if ( step.passed != step.count  )
				console.group( "%c" +  step.name , "color:red" , step.passed +"/" +step.count );
			else 
				console.groupCollapsed(  step.name  , step.passed +"/" +step.count )
				
				for ( var j = 0; j < step.items.length; j++ ) {
					var item = step.items[ j ];
					if ( !item.failed )
						console.log("[ok]",  step.items[ j ].name , { v  : step.items[ j ].value } )
						else 
							console.log("%c[failed]",  "color:red;font-weight:bold;", step.items[ j ].name , step.items[ j ].value )
							
				}
				console.groupEnd( );
		}
	},
	concatLines : function ( lines ) {
		var content = [];
		for ( var i = 0; i<lines.length; i++ ) {
			content = content.concat( lines[ i ].lines );
		}
		
		return content;
	}	
	
}


