'use strict';
var fs = require( 'fs' );
var express = require( 'express' );
var router = express.Router();

var AllBeverages = {};

/* GET home page. */
router.get( '/', function ( req, res ) {
    res.render( 'index', { title: 'Express' } );
} );

router.get( '/edit', function ( req, res ) {

	res.render( 'beverage_edit' );

} );

router.post( '/add', function ( req, res ) {

  var Beverage = {}
	for( var key in req.body )
	{
    var value = req.body[key];
    if( key.substr(-4) == "able" && value == "on" )
      value = true;

    Beverage[key] = value;
	}
  AllBeverages[Beverage.name] = Beverage;

  var BeverageString = JSON.stringify( Beverage );
  var msg = 'this is add manager<br><br>' + BeverageString;
  msg = msg + '<br><br>total<br>' + JSON.stringify( AllBeverages );

  fs.writeFile( 'data/beverages/'+Beverage.name, BeverageString, (err)=> {
    res.send( msg );
  } );

} );

function deleteFiles( files, callback ) {
	var i = files.length;
	files.forEach( ( filepath ) => {
		fs.unlink( filepath, ( err ) => {
			i--;
			if( err ) {
				callback( err );
			}
			if( i <= 0 ) {
				callback( null );
			}
		} );
	} );
}

router.post( '/del', function ( req, res ) {

	var deletePath = [];
	for( var key in req.body ) {
		deletePath.push( 'data/beverages/' + key );
	}

	var errmsg = '<br><br>';
	deleteFiles( deletePath, ( err ) => {
		if( err ) {
			errmsg += err + '<br>';
		}
		else {
			var msg = 'this is del manager<br><br>' + JSON.stringify( req.body );
			msg += errmsg;
			res.send( msg );
		}
	} );

} );


module.exports = router;
