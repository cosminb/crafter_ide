

app.scode = {
	
	html4 : {
		root : "<div><textarea></textarea></div>",
	},
	
	render : function ( ) {
		
		this.item =  item = {};
		
		item.node = $( this.html4.root );
		
		$("body").append( item.node );
		
		this.setup( item );
	},
	
	
	codemirror_opt : {
		lineNumbers: true,
		tabSize : 2,
		lineWrapping : false,
		indentWithTabs : false,		
	},
	
	setup : function ( item ) {
		var textarea = $("textarea", item.node )[0];
		
		item.cm = CodeMirror.fromTextArea(textarea, this.codemirror_opt ); 
		var that = this;
		
		this.addEvent(item, { evt : "change", action : function ( cm, change ) { that.after(item, change) } });
		
		this.addEvent( item, { evt : "beforeChange", action : function( cm, change ) { that.before( item, change ) } } );
		
		this.addEvent( item, { evt : "cursorActivity", action : function( cm, change ) { that.cursor( item, change ) } } );
		
		//item.cm.setValue( " "  );
		
	},
	
	after : function ( item, change ) {
		app.editor.afterTextChange( change );
		
	},
	before : function ( item, change ) {
		
		app.editor.beforeTextChange( change );
		
	},
	
	cursor : function ( item, change ) {
		app.editor.cursorChange( change );
	},
	
	addEvent : function ( item, event ) {
		item.cm.on( event.evt, event.action );
	},
	
	_content : function ( ) {
		return this.item.cm.getValue();
	},
	
	$content : function ( newValue, internal ) {
		if ( !internal ) 
		this.item.cm.setValue( newValue );
		else {
			
			this.item.cm.replaceRange( newValue, { line : 0, ch : 0 } , { line : this.item.cm.lastLine()+1 , ch : 0 }, {internal : "true" } )
		}
	},
	
	insert : function ( startLine, lines ) {
		
		var cm = this.item.cm;
		var toInsert = lines;
		
		if ( startLine >cm.lastLine() ) {
			
			toInsert = [""].concat( lines );
		}
		else {
			toInsert = lines.concat([""])
		}
		
		this.item.cm.skipCursorActivity = true;
		
		cm.replaceRange( toInsert, { line : startLine, ch : 0 }, { line : startLine, ch : 0 }, { internal : true }  );
	
		this.item.cm.skipCursorActivity = false;
		
	},
	update : function ( startLine, count, lines ) {
		
		var vp = this._viewport();
		var cursor = vp.cursor;
		var keepcursor = false;
		var updateViewport = false;
		
		if ( cursor.line >= startLine && cursor.line < startLine + count ) {
			keepcursor = true;
		}
		
		if ( vp.firstLine > startLine) {
			var diffToCursor =   cursor.line - vp.firstLine;
			updateViewport = true;
		}
		
		var lineLength = this.item.cm.getLine( startLine + count - 1 ).length;
		
		this.item.cm.skipCursorActivity = true;
		this.item.cm.replaceRange( lines, { line : startLine, ch : 0 }, { line : startLine + count - 1, ch : lineLength }, { internal : true }  );
		
		if ( keepcursor ) 
			this.item.cm.setCursor( cursor )
		
		if ( updateViewport ) {
			var cursor = this.item.cm.getCursor();
			
			var newScrollTop = this.item.cm.heightAtLine( cursor.line - diffToCursor, "local");
			
			this.item.cm.scrollTo( null,  newScrollTop )
		}
		
		this.item.cm.skipCursorActivity = false;
	},
	
	
	remove : function( startLine, count ) {
		this.item.cm.skipCursorActivity = true;
		
		this.item.cm.replaceRange( [""], { line : startLine, ch : 0 }, { line : startLine + count, ch : 0 }, { internal : true }  );
		this.item.cm.skipCursorActivity = false;
		
	},
	
	
	rangeChange : function ( change ) {
		this.item.cm.replaceRange( change.text, change.from, change.to, change.origin );
	},
	
	getViewportInfo   : function ( ) {
		var info = {};
		
		info.cursor = this.item.cm.getCursor();
		info.scrollInfo = this.item.cm.getScrollInfo();
		info.firstLine  = this.item.cm.lineAtHeight( info.scrollInfo.top, "local" );
		
		
		return info;
	},
	
	_viewport : function ( ) {
		return this.getViewportInfo();
	},
	
	
	addMarks : function ( marks ) {
		
		var cm = this.item.cm;
		
		var oldMarks = cm.getAllMarks();
		for ( var i in oldMarks )
			oldMarks[ i ].clear();
		
		try { 
			for ( var i in marks ) {
				var mark = marks[ i ];
				cm.markText( { line : mark.line, ch : 0 }, { line : mark.endLine, ch : null }, { css : mark.css, className : mark.className } );
			}
		} catch ( e ) {
			
		}
	}
	
	
} 
