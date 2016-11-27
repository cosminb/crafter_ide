 
var SCODE = {
	
	
	parseScode : function ( text ) {
		
		
		
		var result = {};
		var error;
		
		var stack = new Map();
		
		stack.set( result, "" );
		
		
		var list = [];
		var values = {};
		
		var stop = false;
		
		var items = [];
		
		
		var handler = {
			get : function ( target, name ) {
				if ( stop ) return target[ name ];
				
				else if ( !target[ name ] ) {
					if ( name == Symbol.unscopables ) {
						target[ name ] = {}
					}
					else {
						var obj = {};
						stack.set( obj, stack.get( target ) + "." + name );
						
						
						
						target[ name ] = new Proxy( obj, handler );
					}
				}
				
				return target[ name ]
			},
			
			set : function ( target, name, value ) {
				var fullPath =  (stack.get( target ) + "." + name ).substring( 1 );
				
				list.push( fullPath );
				values[ fullPath ] = value;
				
				target[ name ] = value;
				
				items.push( { slot : fullPath, obj : value } );
				
				return value;
			},
			has : function ( target, name ) {
				if ( stop ) return target[ name ] !== undefined;
				return true;
			},
			
			getOwnPropertyDescriptor : function ( target, name ) {
				return Object.getOwnPropertyDescriptor( target, name ) ;//[name ] );
			},
			defineProperty : function ( target, name, desc ) {
				return Object.defineProperty( target, name, desc );
			},
			isExtensible: function(target) {
			
				return true;
			},
			getPrototypeOf(target) {
				return Object.getPrototypeOf( target );
			},
			ownKeys: function(target) {
				return Object.keys ( target );
			},
			setPrototypeOf: function(target, prototype) {
			
				return Object.setPrototypeOf( target, prototype );
			},

			
		}
		
		var pobj = new Proxy( result, handler );
		
		try { 
			eval ( "with ( pobj ) { "+ text +" \n } " );
		
			
			
			stop = true;
			
			var result =  _.cloneDeep(result);
			
			for ( var i in values ) {
					values[ i ] = _.cloneDeep( values[ i ] );
			}
		
			delete result[ Symbol.unscopables ];
			
			
			items = _.cloneDeep( items );
			
		} catch ( e ) {		
			//console.error( e );
			error = e;
			result = undefined;
		}
		
		return { result :result, obj : result,  error, list , values,  elements : items};
	},
	
	buildScodeObj : function ( obj ) {
		
		var text = "";
		
		for ( var i in obj ) {
			
			for ( var j in obj[ i ] ) {
				
				var slot = "." + j;
				var item = i + slot + " = " + this.text( obj[ i ][ j ] ) + "\n" ;
				
				text += item;
			}
		}
		
		return text;
	},
	
	
	
	
	buildScode : function ( obj ) {
		
		
		var str =  this.obj2String( obj ) + "";
		
		pretty = js_beautify(str, this.beautifyOptions)
		
		return pretty;
		
	},
	
	beautifyOptions: {
		"indent_with_tabs": true,
		"preserve_newlines": true,
		"max_preserve_newlines": 10,
		"jslint_happy": false,
		"brace_style": "collapse",
		"keep_array_indentation": false,
		"keep_function_indentation": false,
		"space_before_conditional": true,
		"eval_code": false,
		"unescape_strings": false,
	},
	
	obj2String : function (  obj ) {
		var type = Object.prototype.toString.apply( obj );
		
		var value;
		
		switch ( type ) {
			case "[object Function]" : 
				value =  obj.toString(); 
				value = value.replace( /\\(.)/g, function ( all, path ) {
					return "\\" + path; //console.log( "cosmin", path  );
				});
				break;;
			case "[object Array]"    : 
				var values = [];
				for ( var i in obj ) 
					values.push( this.obj2String(  obj[i] ) );
				value = "[" + values.join(",") + "]";
				break;
			case "[object Object]"   :
				values = []; 
				for ( var i in obj ) {
					
					var slot = i;
					if ( !slot ) slot = '""'
						else if ( slot.indexOf(" ") != -1 || slot.indexOf(".")!==-1 || slot.indexOf(":")!= -1 ) slot = '"' + slot + '"'
							
							
							values.push(  slot + ":" + this.obj2String( obj[i] ) );
				}
				value = "{" + values.join(",") + "}";
				break;
			case "[object String]" : 
				if ( obj.indexOf("\n") !== -1) value = '`' + obj.replace(/\`/g, "\\`").replace(/\n/g, "\\n") + '`'
					
					else value = '"' + obj.replace(/"/g,'\\"') + '"';
					break;
			default :
				value = obj;
				break;
		}
		
		return value;
	}
}
