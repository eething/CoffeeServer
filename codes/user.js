'use strict';

const fs = require( 'fs' );
const bcrypt = require( 'bcrypt' );

const adam = {
	name: '관리자',
	id: 'admin',
	password: '$2b$10$j4gB9lgzNoKvyEN5ZpV6SOkaGUKSrf8s0CvSQA4bq4ZLwBCrIUC8e', //qwer
	// admin: true,
	// enabled: false
}
Object.freeze( adam );

/*
allUsers = {
	'1': { // uid
		name: '홍길동',
		admin: false,
		deleted: false,
		enabled: false,
		favorite: { '아메리카노', ice, syrup },

		localID: 'ithing',
		facebookID: '10987654321',
		googleID: '111122223333',
		kakaoID: -1,
		twitterID: undefined
	}
}
allLocals = {
	'ithing': {
		uid: 1,
		password: '$2b$10$abcde'
	}
}
allFacebooks = {
	'10987654321': {
		uid: 1,
		accessToken: 'asdf',
		refreshToken: 'zxcv',
		profile...?
	}
}
*/


module.exports = {

	isLoaded: {
		user:		false,
		local:		false,
		facebook:	false
//		google:		false
	},
	_maxUID: 0,

	// user -> id -> uid -> user ...
	allUsers: {}, // key: uid, value: user
	allLocals: {},
	allFacebooks: {},
	/*
	allGoogles: {},
	allKakaos: {},
	allTwitters: {},
	*/

	_initSuperAdmin() {
		this.allUsers[0]				= this.allUsers[0] || {};
		this.allLocals[adam.id]			= this.allLocals[adam.id] || {};
		this.allLocals[adam.id].uid		= 0;
		this.allLocals[adam.id].password= adam.password;
		this.allUsers[0].name			= adam.name;
		this.allUsers[0].admin			= true;
//		this.allUsers[0].deleted		= false;
		this.allUsers[0].enabled		= false;
	},

	loadUsers() {
		fs.mkdir( 'data/users', () => {
			this._initSuperAdmin();
			this._loadUsers();
			fs.mkdir( 'data/users/local', () => {
				this._loadLocals();
			} );
			fs.mkdir( 'data/users/facebook', () => {
				this._loadFacebooks();
			} );
			/*
			fs.mkdir( 'data/users/google', () => {
				this._loadGoogle();
			} );
			fs.mkdir( 'data/users/kakao', () => {
				this._loadKakao();
			} );
			fs.mkdir( 'data/users/twitter', () => {
				this._loadTwitter();
			} );
			*/
		} );
	},
	_loadUsers() {

		fs.readdir( 'data/users', ( err, files ) => {
			let len = files.length;
			if( len === 0 ) {
				this.isLoaded.user = true;
				return;
			}

			files.forEach( file => {
				const filePath = `data/users/${file}`;
				fs.readFile( filePath, ( err, data ) => {
					--len;
					if( err ) {
						if( err.code === 'EISDIR' ) {
							return;
						}
						throw err;
					}

					const uid = file;
					const value = JSON.parse( data );
					this.allUsers[ uid ] = value;

					if( uid > this._maxUID ) {
						this._maxUID = uid;
					}

					if( len === 0 ) {
						this.isLoaded.user = true;
					}
				} );
			} );
		} );
	},
	_loadLocals() {

		fs.readdir( 'data/users/local', ( err, files ) => {
			let len = files.length;
			if( len === 0 ) {
				this.isLoaded.local = true;
				return;
			}

			files.forEach( file => {
				const filePath = `data/users/local/${file}`;
				fs.readFile( filePath, ( err, data ) => {
					--len;
					if( err ) {
						if( err.code === 'EISDIR' ) {
							return;
						}
						throw err;
					}

					const id = file;
					const value = JSON.parse( data );
					this.allLocals[ id ] = value;

					if( len === 0 ) {
						this.isLoaded.local = true;
					}
				} );
			} );
		} );
	},
	_loadFacebooks() {

		fs.readdir( 'data/users/facebook', ( err, files ) => {
			let len = files.length;
			if( len === 0 ) {
				this.isLoaded.facebook = true;
				return;
			}

			files.forEach( file => {
				const filePath = `data/users/facebook/${file}`;
				fs.readFile( filePath, ( err, data ) => {
					--len;
					if( err ) {
						if( err.code === 'EISDIR' ) {
							return;
						}
						throw err;
					}

					const facebookID = file;
					const value = JSON.parse( data );
					this.allFacebooks[ facebookID ] = value;

					if( len === 0 ) {
						this.isLoaded.facebook = true;
					}
				} );
			} );
		} );
	},
	/*
	_loadGoogle() {

	},
	_loadKakao() {

	},
	_loadTwitter() {

	},
	*/

	_getUser( uid, callback ) {

		//if( !this.isLoaded ) {
		if( Object.values( this.isLoaded ).includes( false ) ) {
			callback( {
				code: 'ELOAD',
				err: 'User Not Loaded'
			} );
			return false;
		}

		if( !(uid >= 0) ) {
			callback( {
				code: 'EUID',
				err: `Invalid uid=${uid}. It must be >= 0.`
			} );
			return false;
		}

		const user = this.allUsers[ uid ];
		if( !user ) {
			callback( {
				code: 'ENOUSER',
				err: `User Not Found, uid=${uid}.`
			} );
			return false;
		}

		return user;
	},

	// Local...
	_writeUser( uid, user, callback, success ) {

		if( typeof user === 'function' ) {
			success = callback;
			callback = user;
			user = this.allUsers[ uid ];
		}

		const userString = JSON.stringify( user );
		const filePath = `data/users/${uid}`;

		fs.writeFile( filePath, userString, err => {
			if( err ) {
				callback( {
					code: 'EWRITE',
					err: convertError( err ),
					msg: `uid=${uid}, userString=${userString}`
				} );
			} else {
				if( typeof success === 'function' ) {
					success();
				}
				callback( {
					code: 'OK',
					uid: uid
				} );
			}
		} );
	},

	haveDuplicatedID( id ) {
		let sendMsg = {};
		if( this.allLocals[ id ] === undefined ) {
			sendMsg.code = 'OK';
		} else {
			sendMsg.code = 'EUSERID';
			sendMsg.err = 'UserID Already Exists.';
		}
		return sendMsg;
	},

	addUser( body, callback ) {

		const msg = this.haveDuplicatedID( body.id );
		if( msg.code !== 'OK' ) {
			callback( msg );
			return;
		}

		/*
		let user = {};
		let changePassword = false;
		for( let key in body ) {
			let value = body[ key ];

			if( key === 'mode' || key === 'uid' ) {
				continue;
			} else if( key == 'password' ) {
				if( value === '' ) {
					callback( {
						code: 'EPASSWORD',
						err: 'Empty Password.'
					} );
					return;
				}
				changePassword = true;
			}

			user[ key ] = value;
		}
		*/
		const uid = ++this._maxUID;
		allUsers[uid] = {
			uid,
			name: body.name,
			localID: body.id
		}

		let local = {
			uid,
			id: body.id
		};
		allLocals[ body.id ] = local;

		bcrypt.hash( user.password, 10, ( err, hash ) => {
			local.password = hash;
			this._writeUser( uid, msg => {
				if( msg.code !== 'OK' ) {
					callback( msg );
					return;
				}
				const localString = JSON.stringify( local );
				const filePath = `data/users/local/${local.id}`;
				fs.writeFile( filePath, localString, err => {
					if( err ) {
						callback( {
							code: 'EWRITE',
							err: convertError( err ),
							msg: `id=${id}, localString=${localString}`
						} );
					} else {
						callback( { code: 'OK' } );
					}
				} );
			} );
		} );
	},

	editUser( uid, body, callback ) {

		const user = this._getUser( uid, callback );
		if( !user ) {
			return;
		}

		// old password check
		// 막 만들다보니 기존암호 입력 안하게 해버렸음-_-
		// 나중에 시간되면...
		/*
		bcrypt.compare( body.oldPassword, user.password, ( err, result ) => {
			if( !result ) {
				callback( {
					code: "EPASSWORD",
					err: `Password Wrong - ${body.oldPassword}`
				} );
			} else {
				// 아래 코드들을 여기서 실행
			}
		} );
		*/

		const oldID = user.id;

		let changePassword = false;
		for( let key in body ) {
			let value = body[key];

			if( key === 'mode' || key === 'uid' ) {
				continue;
			} else if( key === 'id' ) {
				continue;
			} else if( key === 'password' ) {
				if( value === '' ) {
					continue;
				}
				changePassword = true;
			} else if( key !== 'name' ) {
				if( uid == 0 ) {
					continue;
				}
			}

			user[key] = value;
		}

		if( user.id != oldID ) {
			delete loginIDList[oldID];
			loginIDList[user.id] = uid;
		}

		/*
		const _finalize = () => {
			let userString = JSON.stringify( user );
			const filePath = `data/users/${uid}`;
			fs.writeFile( filePath, userString, err => {
				if( err ) {
					callback( {
						code: 'EWRITE',
						err: err,
						msg: `uid=${uid}, userString=${userString}`
					} );
				} else {
					callback( {
						code: 'OK'
					} );
				}
			} );
		}
		*/

		if( changePassword ) {
			bcrypt.hash( user.password, 10, ( err, hash ) => {
				user.password = hash;
				//_finalize();
				this._writeUser( uid, callback );
			} );
		} else {
			//_finalize();
			this._writeUser( uid, callback );
		}
	},

	deleteUser( uid, body, callback ) {

		const user = this._getUser( uid, callback );
		if( !user ) {
			return;
		}

		if( uid == 0 ) {
			_initSuperAdmin();
		} else {
			user.deleted = true;
		}

		this._writeUser( uid, callback );

		/*
		const filePath = `data/users/${uid}`;
		fs.unlink( filePath, err => {
			if( err ) {
				callback( {
					code: 'EUNLINK',
					err: err,
					msg: `uid=${uid}`
				} );
			} else {
				if( uid == 0 ) {
					this._initSuperAdmin();
				} else {
					delete allUsers[ uid ];
				}
				callback( { code: 'OK' } );
			}
		} );
		*/
	},

	enableUser( body, callback ) {

		const user = this._getUser( body.uid, callback );
		if( !user ) {
			return;
		}

		if( user.disabled ) {
			user.disabled = false;
		}

		this._writeUser( body.uid, callback );
	},

	disableUser( body, callback ) {

		const user = this._getUser( body.uid, callback );
		if( !user ) {
			return;
		}

		user.disabled = true;

		this._writeUser( body.uid, callback );
	},


	/*
	_activateUser( active, body, callback ) {
		const command = active ? 'enableUser' : 'disableUser';

		let len = Object.keys( body ).length;
		if( len === 0 ) {
			callback( {
				err: "InputNotExist",
				msg: [ `${command} Failed - Input is NOT Exist` ]
			} );
			return;
		}

		let msg = [ command ]
		for( let key in body ) {
			let user = this._getUser( key );
			if( !user ) {
				--len;
				msg.push( `* User ${key} is not exist, or allUser is not LOADED` );
				if( len === 0 ) {
					callback( { msg: msg } );
				}
			} else {
				user.isActivate = active;

				fs.writeFile( `data/users/${user.id}`, userString, ( err ) => {
					--len;
					if( err ) {
						msg.push( `* ${err}` );
					} else {
						msg.push( `* Success - ${user.id}, ${user.name}` );
					}

					if( len === 0 ) {
						callback( { msg: msg } );
					}
				} );
			}
		}
	},
	enableUser( body, callback ) {
		this._activateUser( true, body, callback );
	},
	disableUser( body, callback ) {
		this._activateUser( false, body, callback );
	},
	*/

	getUserList() {
		let temp = {};
		for( const uid in this.allUsers ) {

			//if( uid == 0 ) {
			//	continue;
			//}

			temp[uid] = {};
			const user = this.allUsers[uid];
			for( const key in user ) {
				if( key !== 'password' ) {
					temp[uid][key] = user[key];
				}
			}
		}

		return temp;
	},

	setFavorite( body, callback ) {

	},


	setFacebook( accessToken, refreshToken, profile, done ) {
		const uid = this.facebookIDList[ profile.id ];
		const user = this.allUsers[ uid ];

		const facebookString = JSON.stringify( {
			accessToken,
			refreshToken,
			id: profile.id,
			name: profile.displayName,
			//photo? picture?
			uid
		} );
		const filePath = `data/users/facebook/${profile.id}`;
		fs.writeFile( filePath, facebookString, err => {
			if( err ) {
				done( err, false );
			} else {
				done( null, user, { code: 'FACEBOOK', facebookID: profile.id } );
			}
		} );
	},

	associateFacebook( currentUser, facebookID, callback ) {
		const olduid = this.facebookIDList[ profile.id ];
		const newuid = this.loginIDList[ currentUser.id ];

		sendMsg = { uid: newuid, facebookID: profile.id };

		if( olduid === undefined ) {
			sendMsg.msg = 'New User';
		} else if( olduid != newuid) {
			var oldUser = this.allUsers[olduid];
			delete oldUser.facebookID;
			sendMsg.olduid = olduid;
			sendMsg.msg = 'Change User';
		} else {
			sendMsg.msg = 'Same User'
		}
		currentUser.facebookID = facebookID;
		this.facebookIDList[ profile.id ] = newuid;

		function _writeNewUser( uid, callback ) {
			this._writeUser( uid, msg => {
				if( msg.code !== 'OK' ) {
					callback( msg );
					return;
				}
				const facebookString = JSON.stringify( user );
				const filePath = `data/users/facebook/${profile.id}`;
				fs.writeFile( filePath, facebookString, err => {
					if( err ) {
						callback( {
							code: 'EWRITE',
							err: convertError( err ),
							msg: `facebookID=${profile.id}, facebookString=${facebookString}`
						} );
						return;
					}
					sendMsg.code = 'OK';
					callback( sendMsg );
				} );
			} );
		} );

		if( olduid ) {
			_writeUser( olduid, msg => {
				if( msg.code !== 'OK' ) {
					callback( msg );
					return;
				}
				_writeNewUser( newuid, callback );
			} );
		} else {
			_writeNewUser( newuid, callback );
		}
	}
}
