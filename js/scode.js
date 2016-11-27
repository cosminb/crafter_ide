

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
		
		//item.cm.setValue( " "  );
		
	},
	
	after : function ( item, change ) {
		app.editor.afterTextChange( change );
		
	},
	before : function ( item, change ) {
		
		app.editor.beforeTextChange( change );
		
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
		
		cm.replaceRange( toInsert, { line : startLine, ch : 0 }, { line : startLine, ch : 0 }, { internal : true }  );
	},
	update : function ( startLine, count, lines ) {
		this.item.cm.replaceRange( lines.concat([""]), { line : startLine, ch : 0 }, { line : startLine + count, ch : 0 }, { internal : true }  );
	},
	
	remove : function( startLine, count ) {
		this.item.cm.replaceRange( [""], { line : startLine, ch : 0 }, { line : startLine + count, ch : 0 }, { internal : true }  );
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
