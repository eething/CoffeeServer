
const fs = require( 'fs' );
const bcrypt = require( 'bcrypt' );
const convertError = require( '../lib/convert-error' );

const adam = {
	// uid: 0,
	name: '관리자',
	// admin: true,
	// deleted: false,
	// enabled: false

	// for local
	id: 'admin',
	password: '$2b$10$j4gB9lgzNoKvyEN5ZpV6SOkaGUKSrf8s0CvSQA4bq4ZLwBCrIUC8e', //qwer
};
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
		Local: 'ithing',
		Facebook: '10987654321',
		Google: '111122223333',
		Kakao: -1,
		Twitter: undefined
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
		User:		false,
		Local:		false,
		Facebook:	false,
		Google:		false,
	},
	_maxUID: 0,
	allUsers: {},
	allLocals: {},
	allFacebooks: {},
	allGoogles: {},
	allKakaos: {},
	allTwitters: {},

	authTable: {}, // NOT Serialize

	_initSuperAdmin() {
		this.allUsers[0] = this.allUsers[0] || {};
		const user = this.allUsers[0];
		user.uid		= 0;
		user.name		= adam.name;
		user.admin		= true;
		// user.deleted	= false;
		// user.enabled	= false;
		delete user.deleted;
		delete user.enabled;

		this.allLocals[adam.id] = this.allLocals[adam.id] || {};
		const local = this.allLocals[adam.id];
		local.uid		= 0;
		local.password	= adam.password;

		this.authTable[0] = this.authTable[0] || {};
		this.authTable[0].Local = adam.id;
	},

	loadUsers() {
		fs.mkdir( 'data/users', () => {
			this._initSuperAdmin();
			this._loadUsers();
			fs.mkdir( 'data/users/Local', () => {
				this._loadProviders( 'Local' );
			} );
			fs.mkdir( 'data/users/Facebook', () => {
				this._loadProviders( 'Facebook' );
			} );

			fs.mkdir( 'data/users/Google', () => {
				this._loadProviders( 'Google' );
			} );
			fs.mkdir( 'data/users/Kakao', () => {
				this._loadProviders( 'Kakao' );
			} );
			fs.mkdir( 'data/users/Twitter', () => {
				this._loadProviders( 'Twitter' );
			} );
		} );
	},
	_loadUsers() {
		let len;
		const checkLen = () => {
			if ( len === 0 ) {
				this.isLoaded.User = true;
			}
		};
		fs.readdir( 'data/users', ( error, files ) => {
			len = files.length;
			checkLen();

			files.forEach( ( file ) => {
				const filePath = `data/users/${file}`;
				fs.readFile( filePath, ( err, data ) => {
					--len;
					if ( err ) {
						checkLen();
						if ( err.code === 'EISDIR' ) {
							return;
						}
						throw err;
					}

					const uid = file;
					const value = JSON.parse( data );
					this.allUsers[uid] = value;

					if ( uid > this._maxUID ) {
						this._maxUID = uid;
					}

					checkLen();
				} );
			} );
		} );
	},
	_loadProviders( Provider ) {
		let len;
		const checkLen = () => {
			if ( len === 0 ) {
				this.isLoaded.Facebook = true;
			}
		};
		fs.readdir( `data/users/${Provider}`, ( error, files ) => {
			len = files.length;
			checkLen();

			files.forEach( ( providerID ) => {
				const filePath = `data/users/${Provider}/${providerID}`;
				fs.readFile( filePath, ( err, data ) => {
					--len;
					if ( err ) {
						checkLen();
						if ( err.code === 'EISDIR' ) {
							return;
						}
						throw err;
					}

					const value = JSON.parse( data );
					const allProviders = this._getProvider( Provider );
					allProviders[providerID] = value;
					this.authTable[value.uid] = this.authTable[value.uid] || {};
					this.authTable[value.uid][Provider] = providerID;

					checkLen();
				} );
			} );
		} );
	},

	setAuthID( Provider, u, newID ) {
		if ( typeof u === 'object' ) {
			u = u.uid;
		}
		this.authTable[u] = this.authTable[u] || {};
		this.authTable[u][Provider] = newID;
	},
	getAuthID( Provider, u ) {
		if ( typeof u === 'object' ) {
			u = u.uid;
		}
		const auth = this.authTable[u];
		return auth ? auth[Provider] : undefined;
	},

	_getUser( uid, callback ) {
		if ( Object.values( this.isLoaded ).includes( false ) ) {
			callback( {
				code: 'ELOAD',
				err: 'User Not Loaded',
				isLoaded: this.isLoaded,
			} );
			return false;
		}

		if( !(uid >= 0) ) {
			callback( {
				code: 'EUID',
				err: `Invalid uid=${uid}. It must be >= 0.`,
			} );
			return false;
		}

		const user = this.allUsers[uid];
		if( !user ) {
			callback( {
				code: 'ENOUSER',
				err: `User Not Found, uid=${uid}.`,
			} );
			return false;
		}

		return user;
	},

	// Local...
	_writeUser( uid, callback ) {
		const user = this.allUsers[uid];
		const userString = JSON.stringify( user );
		const filePath = `data/users/${uid}`;
		fs.writeFile( filePath, userString, ( err ) => {
			if ( err ) {
				callback( {
					code: 'EWRITE',
					err: convertError( err ),
					msg: `uid=${uid}, userString=${userString}`
				} );
			} else {
				callback( { code: 'OK' } );
			}
		} );
	},
	_writeLocal( localID, callback ) {
		const local = this.allLocals[ localID ];
		const localString = JSON.stringify( local );
		const filePath = `data/users/local/${localID}`;
		fs.writeFile( filePath, localString, ( err ) => {
			if( err ) {
				callback( {
					code: 'EWRITE',
					err: convertError( err ),
					msg: `localID=${localID}, localString=${localString}`
				} );
			} else {
				callback( { code: 'OK' } );
			}
		} );
	},
	_getProvider( Provider ) { // 첫 글자 대문자 !!!
		// `all${provider.replace( /^\w/, c => c.toUpperCase() )}s`;
		const providerKey = `all${Provider}s`;
		return this[providerKey];
	},
	_writeProvider( Provider, providerID, callback ) {
		const allProviders = this._getProvider( Provider );
		const prov = allProviders[providerID];
		const provString = JSON.stringify( prov );
		const filePath = `data/users/${Provider}/${providerID}`;
		fs.writeFile( filePath, provString, ( err ) => {
			if ( err ) {
				callback( {
					code: 'EWRITE',
					err: convertError( err ),
					msg: `${Provider}ID=${providerID}, Str=${provString}`,
				} );
				return;
			}
			callback( {
				code: 'OK',
				uid: prov.uid,
				providerID,
			} );
		} );
	},

	haveDuplicatedID( id ) {
		const sendMsg = {};
		if ( this.allLocals[id] === undefined ) {
			sendMsg.code = 'OK';
		} else {
			sendMsg.code = 'EUSERID';
			sendMsg.err = 'UserID Already Exists.';
		}
		return sendMsg;
	},

	addUser( body, callback ) {
		const msg = this.haveDuplicatedID( body.id );
		if ( msg.code !== 'OK' ) {
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
		this.allUsers[uid] = {
			uid,
			name: body.name,
		};
		this.authTable[ uid ] = {};

		let local = { uid };
		const localID = body.id;
		if ( localID ) {
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

		if ( !localID ) {
			this._writeUser( uid, ( msg ) => {
				msg.uid = uid;
				callback( msg );
			} );
		} else {
			this._writeUser( uid, ( msg ) => {
				bcrypt.hash( body.password, 10, ( err, hash ) => {
					local.password = hash;
					this._writeLocal( localID, ( sendMsg ) => {

						if ( sendMsg.code === 'OK' ) {
							sendMsg.code = msg.code;
							sendMsg.err = msg.err;
						} else {
							sendMsg.code2 = msg.code;
							sendMsg.err2 = msg.err;
						}
						sendMsg.uid = uid;
						sendMsg.id = localID;
						sendMsg.name = this.allUsers[ uid ].name;
						callback( sendMsg );
					} );
				} );
			} );
		}
	},

	editUser( uid, body, callback ) {

		const user = this._getUser( uid, callback );
		if ( !user ) {
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


		// const oldID = user.id;

		// let changePassword = false;
		let tempPassword = '';
		for ( let key in body ) {
			const value = body[key];

			if ( key === 'mode' || key === 'uid' ) {
				continue;
			} else if ( key === 'id' ) {
				// localID 변경처리 추후에
				continue;
			} else if( key === 'password' ) {
				if ( value === '' ) {
					continue;
				}
				//changePassword = true;
				tempPassword = value;
				continue;
			} else if( key !== 'name' ) {
				if ( uid == 0 ) {
					continue;
				}
			}
			user[ key ] = body[ key ];
		}
		/* localID 가 바뀌는 경우에 대한 처리는 추후에 다시...
		if( newLocalID !== oldLocalID ) {
			this.authTable[ uid ].local = newLocalID;

			delete this.allLocals[ oldLocalD ];
			unlink( `data/users/local/${oldLocalID}`, ()= > { ... } );

			local = this.allLocals[ newLocalID ] = { uid: newUID }
			this._writeLocal( newLocalID, () => { ... } );
		}
		*/

		if ( !tempPassword ) {
			this._writeUser( uid, callback );
		} else {
			// user가 고아가 되서 authTable에 없는 경우,
			// admin 기능으로 password 를 추가해 줄 수 있음
			this.authTable[uid] = this.authTable[uid] || {};
			const auth = this.authTable[uid];
			const localID = auth.local || body.id;
			auth.local = localID;
			this.allLocals[localID] = this.allLocals[localID] || { uid };
			const local = this.allLocals[localID];
			this._writeUser( uid, ( msg ) => {
				bcrypt.hash( tempPassword, 10, ( err, hash ) => {
					local.password = hash;
					this._writeLocal( localID, ( sendMsg ) => {
						if ( sendMsg.code === 'OK' ) {
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

	// TODO - body 지울 것
	deleteUser( uid, body, callback ) {

		const user = this._getUser( uid, callback );
		if ( !user ) {
			return;
		}

		if ( uid == 0 ) {
			this._initSuperAdmin();
		} else {
			user.deleted = true;
		}

		this._writeUser( uid, callback );
	},

	// TODO - body 대신 uid
	enableUser( body, callback ) {

		const user = this._getUser( body.uid, callback );
		if ( !user ) {
			return;
		}

		user.enabled = false;

		this._writeUser( body.uid, callback );
	},
	// TODO - body 대신 uid
	disableUser( body, callback ) {

		const user = this._getUser( body.uid, callback );
		if ( !user ) {
			return;
		}

		if ( user.enabled ) {
			user.enabled = false;
		}

		this._writeUser( body.uid, callback );
	},

	getUserList() {
		const temp = {};
		/*
		for ( const uid in this.allUsers ) {
			if ( this.allUsers.hasOwnProperty( uid ) ) {
			//	if( uid == 0 ) {
			//		continue;
			//	}
				temp[uid] = {};
				const user = this.allUsers[uid];
				const auth = this.authTable[uid];
				temp[uid].user = user;
				temp[uid].auth = auth;
			}
		}
		*/
		Object.keys( this.allUsers ).forEach( ( uid ) => {
		//	if( uid == 0 ) {
		//		continue;
		//	}
			temp[uid] = {};
			const user = this.allUsers[uid];
			const auth = this.authTable[uid];
			temp[uid].user = user;
			temp[uid].auth = auth;
		} );
		return temp;
	},

	setFavorite( body, callback ) {

	},



	/*
	req.user.uid = 3, newFacebookID = 44444 를 연동하면
		authTable
			4: 44444 ~~> 다른인증수단이 있는지 체크
						 있으면 undefined
						 없으면 ASK 후 delete 처리
			3: 33333 ~~> 44444

		allFacebooks
			33333: 3 ~~> unlink
			44444: 4 ~~> 3
	*/
	getDisplayName( u ) {
		let user;
		let uid;
		if ( typeof u === 'object' ) {
			user = u;
			uid = user.uid;
		} else {
			uid = u;
			user = this.allUsers[uid];
		}

		if ( user.name ) {
			return user.name;
		}
		const auth = this.authTable[uid];
		if ( auth && auth.Local ) {
			return auth.Local;
		}
		return `* ${user.uid}`;
	},

	checkProvider( Provider, currentUser, newProviderID, callback ) {
		const allProviders = this._getProvider( Provider );
		const newProv = allProviders[newProviderID]; // 44444
		const oldProviderID = this.getAuthID( Provider, currentUser ); // 3.33333

		// New User
		if ( newProv.uid === undefined ) {
			this.setAuthID( Provider, currentUser, newProviderID ); // 3.33333 ~~> 44444
			newProv.uid = currentUser.uid; // 44444.4 ~~> 3

			this._writeProvider( Provider, newProviderID, ( sendMsg ) => {
				if ( sendMsg.code !== 'OK' ) {
					callback( sendMsg );
					return;
				}

				if ( allProviders[oldProviderID] ) {
					// sendMsg.facebookDeleted = true;
					delete allProviders[oldProviderID]; // 33333.3 ~~> unlink
					fs.unlink( `data/users/${Provider}/${oldProviderID}`, () => { } ); // 에러처리안함
				}
				callback( { code: 'OK', msg: 'New User' } );
			} );
			return;
		}
		if ( currentUser.uid === newProv.uid && oldProviderID === newProviderID ) {
			callback( { code: 'OK', msg: 'Same User' } );
			return;
		}

		const sendMsg = { code: 'ASK' };

		const deleteUID = newProv.uid; // 44444.4
		const deleteAuth = this.authTable[deleteUID]; // 4

		const askKey = `ask${Provider}`;
		deleteAuth[askKey] = Math.random();
		sendMsg.askValue = deleteAuth[askKey];
		sendMsg.providerID = newProviderID;

		const deleteUser = this.allUsers[deleteUID];
		sendMsg.providerName = newProv.profile.displayName;
		sendMsg.currentName = this.getDisplayName( currentUser );
		sendMsg.deleteName = this.getDisplayName( deleteUser );

		if ( this.authNoMoreExist( deleteAuth, Provider ) ) {
			sendMsg.askDelete = true;
		}
		callback( sendMsg );
	},

	authNoMoreExist( deleteAuth, except ) {
		const checkKeys = ['Local', 'Facebook', 'Google', 'Kakao', 'Twitter'];
		return checkKeys.every( ( key ) => {
			if ( key === except ) {
				return true;
			}
			if ( !deleteAuth[key] ) {
				return true;
			}
			return false;
		} );
	},

	associateProvider( currentUser, body, callback ) {
		const { Provider, newProviderID } = body;
		const allProviders = this._getProvider( Provider );
		const newProv = allProviders[newProviderID];

		const deleteUID = newProv.uid;
		const deleteAuth = this.authTable[deleteUID]; // 4
		const askKey = `ask${Provider}`;
		const askValue = deleteAuth[askKey];
		delete deleteAuth[askKey];

		if ( !body.bYes ) {
			callback( {
				code: 'NO',
				msg: 'You select No...',
			} );
			return;
		}

		if ( !body.askValue || body.askValue !== askValue ) {
			callback( {
				code: 'EASKKEY',
				err: `${askKey} is not valid`,
			} );
			return;
		}

		if ( this.authNoMoreExist( deleteAuth, Provider ) ) {
			this.allUsers[deleteUID].deleted = true;
			this._writeUser( deleteUID, () => { } ); // TODO - 귀찮아서 처리콜백 등록안함-_-;
		}
		delete deleteAuth[Provider]; // 4.44444 ~~> delete
		// sendMsg.authDeleted = true;

		const oldProviderID = this.getAuthID( Provider, currentUser ); // 3.33333
		// sendMsg.oldFacebookID = oldFacebookID;

		this.setAuthID( Provider, currentUser, newProviderID ); // 3.33333 ~~> 44444
		newProv.uid = currentUser.uid; // 44444.4 ~~> 3

		this._writeProvider( Provider, newProviderID, ( sendMsg ) => {
			if ( sendMsg.code !== 'OK' ) {
				callback( sendMsg );
				return;
			}

			if ( allProviders[oldProviderID] ) {
				// sendMsg.facebookDeleted = true;
				delete allProviders[oldProviderID]; // 33333.3 ~~> unlink
				fs.unlink( `data/users/${Provider}/${oldProviderID}`, () => { } ); // 에러처리안함
			}
			callback( { code: 'YES' } );
		} );
	},

	saveProvider( Provider, providerID, done ) {
		this._writeProvider( Provider, providerID, ( sendMsg ) => {
			if ( sendMsg.code !== 'OK' ) {
				done( sendMsg.err, false );
				return;
			}
			const allProviders = this._getProvider( Provider );
			const { uid } = allProviders[providerID];
			const user = this.allUsers[uid];

			done( null, user, { providerID } );
		} );
	},


	addProviderUser( Provider, providerID, callback ) {
		const allProviders = this._getProvider( Provider );
		const prov = allProviders[providerID];
		if ( !prov ) {
			callback( {
				code: `E${Provider.toUpperCase()}`,
				err: `${Provider} ${providerID} not Exist`,
			} );
		}

		const body = { name: prov.profile.displayName };
		this._addUser( body, ( msg ) => {
			if ( msg.code !== 'OK' ) {
				callback( msg );
				return;
			}
			prov.uid = msg.uid;
			this._writeProvider( Provider, providerID, callback );
		} );
	},
};
