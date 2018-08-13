'use strict';
var fs				= require( 'fs' );
var debug			= require('debug')('CoffeeServer');
var express			= require('express');
var path			= require('path');
var favicon			= require('serve-favicon');
var logger			= require('morgan');
var cookieParser	= require('cookie-parser');
var bodyParser		= require('body-parser');

// Data Manager
var user			= require( './codes/user' );
var beverage		= require( './codes/beverage' );
var order			= require( './codes/order' );

// Routers
var routeAuth		= require( './routes/route-auth' );
var routeBeverage	= require( './routes/route-beverage' );
var routeIndex		= require( './routes/route-index' );
var routeOrder		= require( './routes/route-order' );
var routeUser		= require( './routes/route-user' );

fs.mkdir( 'data', () => {

	fs.mkdir( 'data/users', () => {
		user.loadUsers();
	} );

	fs.mkdir( 'data/beverages', () => {
		beverage.loadBeverages();
	} );

	fs.mkdir( 'data/orders', () => {
		order.loadOrders();
	} );

} );

var app = express();

app.locals.pretty = true;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use( '/',			routeIndex );
app.use( '/auth',		routeAuth );
app.use( '/beverage',	routeBeverage );
app.use( '/order',		routeOrder );
app.use( '/user',		routeUser );


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

app.set( 'port', process.env.PORT || 3000 );

var server = app.listen( app.get( 'port' ), function () {
    debug( 'Express server listening on port ' + server.address().port );
} );
