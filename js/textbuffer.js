
app.textBuffer = {

	init : function ( ) {
		this.defaultPrism = app.jsonpp;
	},
	
	clear : function ( ) {},
	
	
	itemChanged : function ( pos,  isFirst ) {
		
		var item = this.wallet.items[ pos ];
		var element = this.wallet.map[ item.source ];
		
		
		var items = this.wallet.items;
		
		if ( item.changes ) {
			var changes = item.changes.items;
			for ( var i = 0; i<changes.length; i++ ) {
				var it = changes[ i ];
				app.buffer.removeElement( it.source, true )
			}
			delete item.changes;
		}
		
		var scode     = item.lines.join( "\n" );
		var fragments = this.fragmentate( scode );
		
		if ( !fragments ) {
			item.hasError = true;
			
			return;
		}
		
		var currentLine = 0;
		var currentPos  = pos;
		
		var lastIndex   = fragments.length - 1;
		
		var allLines    = item.lines;
		var startLine   = item.startLine;
		
		
		var changed = [];
		
		for ( var j = 0; j<= lastIndex; j++ ) {
			
			var fragment = fragments[ j ];
			
			var end   = fragment.loc.end.line - 1;
			
			if ( j == lastIndex ) 
				end = allLines.length;
			
			var lines = allLines.splice(0, end + 1 );
			
			if ( ( j == 0 && isFirst ) || ( j == lastIndex && !isFirst ) ) {
				item.lines = lines;
				item.lineCount = lines.length;
				item.flags.mParse = true;
			}
			
			else {
				var el = app.buffer.addElement( { pos : currentPos ,data : {}  } , true );
				var it = { 
					lines     : lines, 
					lineCount : lines.length,
					source    : el.uid,
					prism     : this.defaultPrism,
					
					flags     : { mParse : true },
					
					startLine : startLine,
					ast       : fragment,
				}
				
				this.wallet.items.splice( currentPos, 0, it );
				
			}
			
			changed.push( { pos : currentPos, uid : items[ currentPos ].source } );
			
			currentPos++;
			
		}
		
		
		this.updateMarks( pos );
		
		this.transmitChanges ( changed );
	},
	
	
	transmitChanges : function ( changed ) {
		for ( var i in changed ) {
			this.evaluateItem( changed[ i ].pos );
		}
	},
	
	
	evaluateItem : function ( pos ) {
		var it = this.wallet.items[ pos ];
		var el = this.wallet.map [ it.source ];
		
		var result = it.prism.parse( it.lines );
		
		if ( result ) {
			el.hasError = false;//Jonathan Meker
			app.buffer.changeElement( el, result[ 0 ] , true);
		}
	},
	
	fragmentate : function ( scode ) {
		try { 
			var opt = {
				tolerant : true ,
				loc      : true , 
				range    : true ,
				comment  : true
			}
			
			var ast = esprima.parse( scode, opt );
			
			
			var res = ast.body;
			
		} catch ( e ) {
		}
		
		return res;
		
	},	
	replaceLines : function ( lines, fromLine, fromCh ,toLine, toCh, text ) {
		
		var startString = lines[ fromLine ].substring( 0, fromCh )
		var endString   = lines[ toLine   ].substring( toCh );
		
		lines.splice.apply( lines, [fromLine, toLine - fromLine +1 ].concat( text ) );
		
		lines[ fromLine ] = startString + lines[ fromLine ];
		lines[ fromLine + text.length - 1 ] = lines[ fromLine + text.length - 1 ] + endString;
		
		return;
		
	},
	
	createEmptyItem : function ( change ) {
		
		var items = this.wallet.items;
		
		var pos = items.length;
		var el  = app.buffer.addElement( { pos : pos , data : {}, lines : [""] } );
		
		var item = { lines : [""], prism : this.defaultPrism, flags : {}, startLine : change.from.line, endLine : change.from.line, lineCount : 1 , source : el.uid }
		items[ pos ] = ( item );
		
		return pos;
	},
	addChange : function ( change ) {
		var items = this.wallet.items;
		
		var startItem = this.getItemContaining ( change.from.line ) ;
		var endItem   = this.getItemContaining ( change.to.line   ) ;
		
		if ( startItem === undefined ) {
			var pos = this.createEmptyItem( change );
			
			startItem = pos;
			endItem   = pos;
			isFirst = true;
		}
		
		else if ( startItem != endItem ) {
			this.mergeItems( startItem, endItem );
			isFirst = true;
		}
		
		else {				
			var isFirst = change.from.line < items[ startItem ].lineCount / 2 ? false : true;
		}
		
		
		
		
		var item = this.wallet.items[ startItem ];
		
		var startLine = item.startLine;
		
		this.replaceLines( item.lines, change.from.line - startLine, change.from.ch, change.to.line - startLine, change.to.ch, change.text );
		
		item.lineCount = item.lines.length;
		
		if ( change.origin.callback ) {
			change.origin.callback( { startItem, endItem, startLine } ); 
		}
		
		var changed = this.itemChanged( startItem , isFirst);
		
		
		this.updateItemPos(startItem );
		this.updateMarks( startItem );
		
		if ( changed ) {
			change.origin = { internal : true,  command : "requestUpdate" }
		}
		
		
	},
	
	mergeItems : function ( startItem, endItem ) {
		
		var items = this.wallet.items;
		
		var lines = items[ startItem ].lines;
		
		for ( var i = startItem + 1; i<= endItem; i++ ) {
			lines = lines.concat( items[ i ].lines )
		}
		
		items[ startItem ].lines = lines;
		
		var merged = items.splice( startItem + 1, endItem - startItem );
		
		
		items[ startItem ].changes=  { type : "merged", items : merged } ;
	},
	
	
	
	getItemContaining : function (line ) {
		var items = this.wallet.items;
		for ( var i = 0; i< items.length; i++ ) {
			
			var item = items[i];
			
			if ( line >= item.startLine && line <= item.endLine ) {
				return i;				
			}
		}
	},
	
	
	addItem : function ( el ) {
		
		
		if ( !el.pos ) {
			el.pos = this.wallet.items.length;
		}
		
		var item = {
			
			source : el.uid, 
			uiCommand : "insert",
			
			prism   : this.defaultPrism,
			
			flags   : {}
		}
		
		if ( el.lines ) {
			item.lines = el.lines;
			delete el.lines;
		}
		
		var pos = el.pos;
		
		item.uiCommand = "insert";
		this.wallet.items.splice( pos, 0, item );
		
		
		item.lines = this.xlateItem( pos );
		
		
		this.updateItemPos( el.pos );
		
		
	},
	
	insertItem : function ( pos, name, opt ) {
		
		var item = { value : opt.value };
		
		item.content = name + " = " + SCODE.buildScode( item.value );
		item.lines = item.content.split( "\n" );
		
		item.uiCommand = "insert";
		
		this.wallet.items.splice( pos, 0, item );
		
	},
	
	updateItem : function ( pos, lines ) {
		var item = this.wallet.items[ pos ];
		
		item.lines = this.xlateItem( pos );
		
		item.uiCommand = "update";
	},
	
	
	
	removeItem : function ( index ) {
		var items = this.wallet.items;
		
		var item = items[ index ];
		
		app.scode.remove( item.startLine, item.lineCount );
		
		items.splice( index, 1 );
		
		this.updateMarks(index -1 );
		
		this.updateItemPos( index - 1 );
	},
	
		xlateItem : function ( pos ) {
			
			var item = this.wallet.items[ pos ];
			
			var id = item.source ;
			
			var element = this.wallet.map[ id ];
			
			
			if ( !item.prism ) item.prism = this.defaultPrism;
			
			
			var text = item.prism.xlate( element.data,item );
			
			var lines = text.split("\n");
			
			return lines;
			
		},
		
		updateItemPos : function ( start ) {
			var map = this.wallet.map;
			var items = this.wallet.items;
			
			for ( var i = start; i< items.length; i++ ) {
				if ( items[i].source == undefined ) continue;
				map[ items[i].source ].pos = i;
			}
		},	
		applyCommands : function ( ) {
			
			var items = this.wallet.items;
			
			var viewport = app.scode._viewport();
			
			
			
			var currentLine = 0; 
			for ( var i = 0; i< items.length; i++ ) {
				var item = items[ i ];
				if ( !item.uiCommand ) {
					
				}
				
				else 
					
					if ( item.uiCommand == "insert" ) {
						delete item.uiCommand;
						
						app.scode.insert( currentLine , item.lines );
						item.lineCount = item.lines.length;
					}
					
					else if ( item.uiCommand == "update" ) {
						delete item.uiCommand;
						app.scode.update( currentLine, item.lineCount, item.lines );
						
						item.lineCount = item.lines.length;
						
					}
					
					
					item.startLine = currentLine;
					currentLine += item.lineCount;
					item.endLine   = currentLine -1;
					
					
					
			}
		},
		
		marks : [],
		
		updateMarks : function ( start ) {
			
			var items = this.wallet.items;
			var marks = this.marks;
			
			
			var viewport = app.scode._viewport();
			
			
			var currentLine = items[ start ].startLine; 
			
			for ( var i = start; i< items.length; i++ ) {
				var item = items[ i ];
				
				item.startLine = currentLine;
				currentLine += item.lineCount;
				item.endLine   = currentLine -1;
				
				marks[i] = ( { line : item.startLine, endLine : item.endLine, css : "background : hsl("+(i*40)%360+", 100%, 50% )"} )
				
				
			}
			
			app.scode.addMarks( marks );
		},
}

