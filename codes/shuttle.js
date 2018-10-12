
const fs = require( 'fs' );
const users = require( './user' );



module.exports = {

	todayString: '',
	todayShuttle: [],

	minPoint: -1,
	shuttlePoint: [],
	/*
	todayShuttle: [ { uid: 7, status: -1 } ] 0 ~~> -1: deleted, 1: confirmed
	shuttlePoint: [
		{ point: 0, users: [1, 7, 4], rands: [1, 4] },
		{ point: 1, users: [8, 6, 2], rands: [8, 6, 2] },
	]
	*/

	checkToday() {
		const newTodayString = new Date().toISOString().substr( 0, 10 );
		if ( this.todayString !== newTodayString ) {
			this.todayShuttle = [];
			this.shuttlePoint.forEach( ( group ) => {
				group.rands = group.users.slice();
			} );
			this.todayString = newTodayString;
		}
	},

	addShuttles() {
		this.sortShuttlePoint();

		const addShuttle = ( uidKey ) => {
			const uid = Number( uidKey );
			const zeroGroup = this.shuttlePoint.find( g => g.point === 0 );
			if ( zeroGroup ) {
				zeroGroup.users.push( uid );
				zeroGroup.rands.push( uid );
			} else {
				this.shuttlePoint.splice( 0, 0, {
					point: 0,
					users: [uid],
					rands: [uid],
				} );
			}
		};

		Object.keys( users.allUsers ).forEach( ( uid ) => {
			const user = users.allUsers[uid];
			if ( !user.deleted && user.enabled && user.shuttle ) {
				if ( !this.shuttlePoint.some( group => group.users.includes( uid ) ) ) {
					addShuttle( uid );
				}
			} else {
				let bDelete = false;
				this.shuttlePoint.forEach( ( group, groupIndex ) => {
					if ( !bDelete ) {
						const randIndex = group.rands.findIndex( u => u === uid );
						if ( randIndex >= 0 ) {
							group.rands.splice( randIndex, 1 );
						}
						const userIndex = group.users.findIndex( u => u === uid );
						if ( userIndex >= 0 ) {
							bDelete = true;
							group.users.splice( userIndex, 1 );
							if ( group.users.length === 0 ) {
								this.shuttlePoint.splice( groupIndex, 1 );
							}
						}
					}
				} );
			}
		} );
	},

	getShuttleNum() {
		let tsLen = 0;
		this.todayShuttle.forEach( ( ts ) => {
			if ( ts.status >= 0 ) {
				tsLen += 1;
			}
		} );
		return tsLen;
	},

	makeShuttle( callback ) {
		if ( this.getShuttleNum() > 2 ) {
			callback();
			return;
		}

		if ( this.shuttlePoint.length === 0 ) {
			return;
			// return "No More Shuttle Available";
		}

		this.shuttlePoint.some( ( group ) => {
			if ( group.rands.length > 0 ) {
				const randIndex = Math.floor( Math.random() * group.rands.length );
				this.todayShuttle.push( {
					uid: group.rands[randIndex],
					status: 0,
				} );
				group.rands.splice( randIndex, 1 );
				return true;
			}
			return false;
		} );

		this.writeShuttlePoint( ( err ) => {
			callback( err );
		} );
	},

	confirmShuttles( confirmList, deletedList, callback ) {
		const promoteShuttle = ( uid, group, groupIndex ) => {
			const shuttle = this.todayShuttle.find( ts => ts.uid === uid );
			const userIndex = group.users.findIndex( u => u === uid );
			if ( shuttle.status < 1 && userIndex >= 0 ) {
				shuttle.status = 1;
				group.users.splice( userIndex, 1 );
				const nextGroup = this.shuttlePoint.find( g => g.point === group.point + 1 );
				if ( nextGroup ) {
					nextGroup.users.push( uid );
				} else {
					this.shuttlePoint.splice( groupIndex, 0, {
						point: group.point + 1,
						users: [uid],
						rands: [],
					} );
				}
			}
		};

		this.shuttlePoint.forEach( ( group, index ) => {
			confirmList.forEach( ( uid ) => {
				promoteShuttle( uid, group, index );
			} );
		} );

		this.shuttlePoint.reduceRight( ( acc, group, index, self ) => {
			if ( group.users.length === 0 ) {
				self.splice( index, 1 );
			}
			return 0;
		}, 0 );

		this.shrinkShuttlePoint();

		this.todayShuttle.forEach( ( ts ) => {
			if ( confirmList.includes( ts.uid ) ) {
				ts.status = 1;
			} else if ( deletedList.includes( ts.uid ) ) {
				ts.status = -1;
			}
		} );

		this.writeShuttlePoint( ( err ) => {
			if ( err ) {
				callback( err );
				return;
			}
			this.getTodayShuttle( false, callback );
		} );
	},

	getTodayShuttle( shuttleNum, callback ) {
		const getShuttleList = () => {
			const shuttleList = [];
			this.todayShuttle.forEach( ( ts ) => {
				shuttleList.push( {
					uid: ts.uid,
					name: users.getDisplayName( ts.uid ),
					status: ts.status,
				} );
			} );
			return shuttleList;
		};

		this.checkToday();
		if ( this.getShuttleNum() < shuttleNum ) {
			this.addShuttles();
			this.makeShuttle( ( err ) => {
				if ( err ) {
					callback( err );
					return;
				}
				callback( null, getShuttleList() );
			} );
		} else {
			callback( null, getShuttleList() );
		}
	},

	initShuttle( callback ) {
		this.loadShuttlePoint( () => {
			this.shrinkShuttlePoint();
			this.writeShuttle( callback );
		} );
	},

	sortShuttlePoint() {
		this.shuttlePoint.sort( ( a, b ) => a.point - b.point );
	},

	shrinkShuttlePoint() {
		if ( this.shuttlePoint.length === 0 ) {
			return;
		}
		this.sortShuttlePoint();
		const min = this.shuttlePoint[0].point;
		this.shuttlePoint.forEach( ( group ) => {
			group.point -= min;
		} );
	},

	loadShuttlePoint( callback ) {
		const filePath = 'data/shuttles/point';
		fs.readFile( filePath, ( err, data ) => {
			if ( err ) {
				if ( err.code !== 'ENOENT' ) {
					callback( err );
					return;
				}
			}
			if ( data ) {
				const parsed = JSON.parse( data );
				this.todayString = parsed.todayString;
				this.todayShuttle = parsed.todayShuttle;
				this.shuttlePoint = parsed.shuttlePoint;
				console.log( 'Shuttle Loaded...' );
			} else {
				console.log( 'No Shuttle Point...' );
			}
			callback();
		} );
	},

	writeShuttlePoint( callback ) {
		const shuttleString = JSON.stringify( {
			todayString: this.todayString,
			todayShuttle: this.todayShuttle,
			shuttlePoint: this.shuttlePoint,
		} );
		const filePath = 'data/shuttles/point';
		fs.writeFile( filePath, shuttleString, ( err ) => {
			callback( err );
		} );
	},

	loadShuttleLog( callback ) {
		const filePath = 'data/shuttles/log';
		fs.readFile( filePath, ( err, data ) => {
			if ( err ) {
				callback( err );
				return;
			}
			this.shuttleLog = JSON.parse( data );
			callback();
		} );
	},

	writeShuttleLog( callback ) {
		const shuttleLog = JSON.stringify( this.shuttleLog );
		const filePath = 'data/shuttles/log';
		fs.writeFile( filePath, shuttleLog, ( err ) => {
			callback( err );
		} );
	},
};
