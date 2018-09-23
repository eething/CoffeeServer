
module.exports = ( count, callback, debug ) => {
	let bLoaded = 0;
	let bError = false;

	return ( err, ...params ) => {
		bLoaded += 1;

		if ( debug ) {
			debug();
		}
		if ( err ) {
			bError = true;
			console.log( 'ERROR in cheker' );
			callback( err, ...params );
		}
		if ( bError ) {
			return;
		}

		if ( bLoaded === count ) {
			callback( ...params );
		} else if ( bLoaded > count ) {
			throw new Error( `Over Loaded ${bLoaded} > ${count}` );
		}
	};
};
