'use strict';

const fs = require( 'fs' );
const bcrypt = require( 'bcrypt' );
const convertError = require( '../lib/convert-error' );

const adam = {
//	uid: 0,
	name: '관리자',	
//	admin: true,
//	deleted: false,
//	enabled: false

	// for local
	id: 'admin',
	password: '$2b$10$j4gB9lgzNoKvyEN5ZpV6SOkaGUKSrf8s0CvSQA4bq4ZLwBCrIUC8e', //qwer
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
}
authTable = {
	'1': {
		local: 'ithing',
		facebook: '10987654321',
		google: '111122223333',
		kakao: -1,
		twitter: undefined
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
	allUsers: {},
	allLocals: {},
	allFacebooks: {},
	/*
	allGoogles: {},
	allKakaos: {},
	allTwitters: {},
	*/

	authTable: {}, // NOT Serialize

	_initSuperAdmin() {
		this.allUsers[0] = this.allUsers[0] || {};
		const user = this.allUsers[0];
		user.uid		= 0;
		user.name		= adam.name;
		user.admin		= true;
//		user.deleted	= false;
//		user.enabled	= false;
		delete user.deleted;
		delete user.enabled;

		this.allLocals[adam.id] = this.allLocals[adam.id] || {};
		const local = this.allLocals[adam.id];
		local.uid		= 0;
		local.password	= adam.password;

		this.authTable[0] = this.authTable[0] || {};
		this.authTable[0].local = adam.id;
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

			files.forEach( localID => {
				const filePath = `data/users/local/${localID}`;
				fs.readFile( filePath, ( err, data ) => {
					--len;
					if( err ) {
						if( err.code === 'EISDIR' ) {
							return;
						}
						throw err;
					}

					const value = JSON.parse( data );
					this.allLocals[ localID ] = value;
					this.authTable[ value.uid ] = this.authTable[ value.uid ] || {};
					this.authTable[ value.uid ].local = localID;

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

			files.forEach( facebookID => {
				const filePath = `data/users/facebook/${facebookID}`;
				fs.readFile( filePath, ( err, data ) => {
					--len;
					if( err ) {
						if( err.code === 'EISDIR' ) {
							return;
						}
						throw err;
					}

					const value = JSON.parse( data );
					this.allFacebooks[facebookID] = value;
					this.authTable[ value.uid ] = this.authTable[ value.uid ] || {};
					this.authTable[ value.uid ].facebook = facebookID;

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

		if( Object.values( this.isLoaded ).includes( false ) ) {
			callback( {
				code: 'ELOAD',
				err: 'User Not Loaded',
				isLoaded: this.isLoaded
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
	_writeUser( uid, callback ) {
		const user = this.allUsers[ uid ];
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
				callback( {
					code: 'OK',
					uid: uid
				} );
			}
		} );
	},
	_writeLocal( localID, callback ) {
		const local = this.allLocals[ localID ];
		const localString = JSON.stringify( local );
		const filePath = `data/users/local/${localID}`;
		fs.writeFile( filePath, localString, err => {
			if( err ) {
				callback( {
					code: 'EWRITE',
					err: convertError( err ),
					msg: `localID=${localID}, localString=${localString}`
				} );
			} else {
				callback( {
					code: 'OK',
					uid: local.uid,
					id: local.id
				} );
			}
		} );
	},
	_writeFacebook( facebookID, callback ) {
		const facebook = this.allFacebook[ facebookID ];
		const facebookString = JSON.stringify( facebook );
		const filePath = `data/users/facebook/${facebookID}`;
		fs.writeFile( filePath, facebookString, err => {
			if( err ) {
				callback( {
					code: 'EWRITE',
					err: convertError( err ),
					msg: `facebookID=${facebookID}, facebookString=${facebookString}`
				} );
				return;
			}
			callback( sendMsg );
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
		this._addUser( body, callback );
	},
	_addUser( body, callback ) {

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
		this.allUsers[ uid ] = {
			uid,
			name: body.name,
		}
		this.authTable[ uid ] = {};

		let local = { uid };
		const localID = body.id;		
		if( localID ) {
			// id - password 는 둘다 있든지 둘다 없든지
			if( !body.password ) {
				callback( {
					code: 'EPASSWORD',
					err: 'Password NOT Exists.'
				} );
				return;
			}

			local.id = localID;
			this.allLocals[ localID ] = local;
			this.authTable[ uid ].local = localID;
		}

		if( !localID ) {
			this._writeUser( uid, callback );
		} else {
			// TODO - writeFile 실패해도 강제로 다음꺼 실행 후 에러를 통합해서 보여주기?
			this._writeUser( uid, msg => {

				bcrypt.hash( body.password, 10, ( err, hash ) => {
					local.password = hash;
					this._writeLocal( localID, sendMsg => {

						if( sendMsg.code === 'OK' ) {
							sendMsg.code = msg.code;
							sendMsg.err = msg.err;
						} else {
							sendMsg.code2 = msg.code;
							sendMsg.err2 = msg.err;
						}
						callback( sendMsg );
					} );
				} );
			} );
		}
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


		//const oldID = user.id;

		//let changePassword = false;
		let tempPassword = '';
		for( let key in body ) {
			const value = body[ key ];

			if( key === 'mode' || key === 'uid' ) {
				continue;
			} else if( key === 'id' ) {
				// localID 변경처리 추후에
				continue;
			} else if( key === 'password' ) {
				if( value === '' ) {
					continue;
				}
				//changePassword = true;
				tempPassword = value;
				continue;
			} else if( key !== 'name' ) {
				if( uid == 0 ) {
					continue;
				}
			}
			user[ key ] = body[ key ];
		}
		/* localID 가 바뀌는 경우에 대한 처리는 추후에 다시...
		if( user.id != oldID ) {
			delete loginIDList[oldID];
			loginIDList[user.id] = uid;
		}
		*/

		if( !tempPassword ) {
			this._writeUser( uid, callback );
		} else {
			this._writeUser( uid, msg => {
				if( msg.code !== 'OK' ) {
					callback( msg );
					return;
				}

				// user가 고아가 되서 없는 경우가 생길 수 있음
				// 이때 admin 기능으로 password 를 추가해 줄 수 있음
				this.authTable[ uid ] = this.authTable[ uid ] || {};
				const localID = this.authTable[ uid ].local || body.id;
				this.authTable[ uid ].local = localID;

				this.allLocals[ localID ] = this.allLocals[ localID ] || { uid };
				const local = this.allLocals[ localID ];

				bcrypt.hash( tempPassword, 10, ( err, hash ) => {
					local.password = hash;
					this._writeLocal( localID, callback );
				}  );
			} );
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
	},

	enableUser( body, callback ) {

		const user = this._getUser( body.uid, callback );
		if( !user ) {
			return;
		}

		user.enabled = false;

		this._writeUser( body.uid, callback );
	},

	disableUser( body, callback ) {

		const user = this._getUser( body.uid, callback );
		if( !user ) {
			return;
		}

		if( user.enabled ) {
			user.enabled = false;
		}

		this._writeUser( body.uid, callback );
	},

	getUserList() {
		let temp = {};
		for( const uid in this.allUsers ) {

			//if( uid == 0 ) {
			//	continue;
			//}

			temp[ uid ] = {};
			const user = this.allUsers[ uid ];
			const auth = this.authTable[ uid ];
			temp[ uid ].user = user;
			temp[ uid ].auth = auth;
		}

		return temp;
	},

	setFavorite( body, callback ) {

	},


//	setFacebook( accessToken, refreshToken, profile, done ) {
//	},

	associateFacebook( currentUser, info, callback ) {

		sendMsg = {
			code: 'OK',
			uid: currentUser.uid,
			facebookID: info.facebookID
		};

		let oldFacebookID;
		if( this.authTable[ currentUser.uid] ) {
			oldFacebookID = this.authTable[ currentUser.uid ].facebook;
		} else {
			this.authTable[ currentUser.uid ] = {};
		}
		this.authTable[ currentUser.uid ].facebook = info.facebookID;
		if( oldFacebookID != info.faceboookID ) {
			sendMsg.authChanged = true;
			sendMsg.oldFacebookID = oldFacebookID;
			//sendMsg.newFacebookID = info.facebookID;
		}

		let olduid;
		if( this.allFacebooks[ info.facebookID ] ) {
			olduid = this.allFacebooks[ info.facebookID ].uid;
		} else {
			this.allFacebooks[ info.facebookID ] = {};
		}
		this.allFacebooks[ info.facebookID ].uid = currentUser.uid;
		if( olduid != currentUser.uid ) {
			sendMsg.uidChanged = true;
			sendMsg.olduid = olduid;
			//sendMsg.newuid = currentUser.uid;
		}

		/*
		// 삭제하지 말고 냅둬보자
		// 여러 페북 ID 로 한 uid 에 로그인 가능, vice versa
		if( sendMsg.authChanged && oldFacebookID != undefined ) {
			delete this.allFacebooks[ oldFacebookID ];
		}
		if( sendMsg.uidChanged && olduid != undefined ) {
			delete this.authTable[ olduid ].facebook;
		}
		*/
		const facebook = this.allFacebooks[ info.facebookID ];
		facebook.accessToken	= info.accessToken;
		facebook.refreshToken	= info.refreshToken;
		facebook.profile		= info.profile;

		_writeFacebook( info.facebookID, callback );
	},


	addFacebookUser( info, callback ) {
		const body = { name: info.profile.displayName };
		this._addUser( body, msg => {
			if( msg.code !== 'OK' ) {
				callback( msg );
				return;
			}
			const facebook = this.allFacebooks[ info.facebookID ] = {};
			facebook.accessToken	= info.accessToken;
			facebook.refreshToken	= info.refreshToken;
			facebook.profile		= info.profile;

			_writeFacebook( info.facebookID, callback );
		} );
	},
}
