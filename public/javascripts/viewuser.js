// vieworder.js

function initUserElem( loginType, loginName, loginID ) {

	l2data.login.type	= loginType;
	l2data.login.name	= loginName;
	l2data.login.ID		= loginID;

	elem.spanLogin		= document.querySelector( '#menuLogin' );
	elem.spanRegister	= document.querySelector( '#menuRegister' );
	elem.spanMyInfo		= document.querySelector( '#menuMyInfo' );
	elem.spanAdmin		= document.querySelector( '#menuAdmin' );
	elem.spanLogout		= document.querySelector( '#menuLogout' );

	elem.divLogin		= document.querySelector( 'div.cLogin' );
	elem.divNewUser		= document.querySelector( 'div.cNewUser' );
	elem.divMyInfo		= document.querySelector( 'div.cMyInfo' );
	elem.divAdmin		= document.querySelector( 'div.cAdmin' );

	elem.userList = [
		elem.divLogin,
		elem.divNewUser,
		elem.divMyInfo,
		elem.divAdmin
	];

	if( !loginType ) {
		console.log( 'loginType null' );
		elem.spanMyInfo.style.display = 'none';
		elem.spanAdmin.style.display = 'none';
		elem.spanLogout.style.display = 'none';
		changeUserPage( 'Login' );
	} else {
		elem.spanLogin.style.display = 'none';
		elem.spanRegister.style.display = 'none';

		if( loginType === 'admin' ) {
			changeUserPage( 'Admin' );
		} else {
			elem.spanAdmin.style.display = 'none';
			changeUserPage( 'MyInfo' );
		}
	}
}

l2user = {
	cbUserList() {
		let select = document.querySelector( '#idSelect' );
		removeChildAll( select );

		for( const uid in l2data.allUsers ) {
			let user = l2data.allUsers[uid];
			//let text = `${uid} / ${user.name||''} / ${user.id}`;
			let username = user.name || user.id;
			let option = addElement( select, 'option', '', username );
			option.value = uid;
		}

		select.form.uid.value = select.value;
		onSelectUser( select );
	}
}

function checkAddForm( self, getMsg ) {
	const f = self.form;

	let errID = 0;
	if( f.id.value === '' ) {
		errID = 1;
	} else {
		for( const uid in l2data.allUsers ) {
			const user = l2data.allUsers[uid];
			if( f.id.value === user.id || f.id.value === 'admin' ) {
				errID = 2;
				break;
			}
		}
	}
	f.id.className =	( errID === 2 ) ? 'userYellow' :
						( errID === 1 ) ? 'userRed' : 'userWhite';


	const errP1 = f.password1_add.value ? 0 : 1;
	f.password1_add.className = ( errP1 === 1 ) ? 'userRed' : 'userWhite';

	const errP2 = ( f.password1_add.value === f.password2_add.value ) ? 0 : 1;
	f.password2_add.className = ( errP2 === 1 ) ? 'userRed' : 'userWhite';

	if( !getMsg ) {
		return;
	}

	let empty = 0;
	let msg = '';
	if( errID === 2 ) {
		msg = 'ID 중복!!!';
	} else if( errID === 1 ) {
		empty++;
		msg = 'ID'
	}
	if( errP1 || errP2 ) {
		empty++;
		msg = `${msg ? `${msg}, ` : ''}비밀번호`;
	}
	if( empty > 0 ) {
		msg = `${msg}를 정확하게 입력해주세요.`;
	}

	return msg;
}

function addUser( self ) {

	const msg = checkAddForm( self, true );
	if( msg ) {
		alert( msg );
		return;
	}

	const f = self.form;
	f.name.value = f.name_add.value;
	f.password.value = f.password1_add.value;

	self.form.mode.value = "add";
	self.form.submit();
}

function checkEditForm( self, admin, getMsg ) {

	const f = self.form;
	const fName = admin ? f.name_admin : f.name_edit;
	const fPassword1 = admin ? f.password1_admin : f.password1_edit;
	const fPassword2 = admin ? f.password2_admin : f.password2_edit;

	let hasChange = fPassword1.value ? true : false;

	const errP2 = ( fPassword1.value === fPassword2.value ) ? 0 : 1;
	fPassword2.className = ( errP2 === 1 ) ? 'userRed' : 'userWhite';

	const uid = document.querySelector( '#uid_admin' ).innerHTML;
	const orgName = admin ? l2data.allUsers[uid].name : l2data.login.name;
	let changeName = ( fName.value === orgName ) ? 0 : 1;
	fName.className = ( changeName === 1 ) ? 'userGreen' : 'userWhite';

	if( !getMsg ) {
		return;
	}

	let msg;
	if( errP2 ) {
		return '비밀번호가 다릅니다.';
	}

	if( changeName ) {
		hasChange = true;
	}

	if( !hasChange ) {
		msg = '변경사항이 없습니다.'
	}

	return msg;
}

function editUser( self, admin ) {

	const f = self.form;

	const msg = checkEditForm( self, admin, true );
	if( msg ) {
		alert( msg );
		return;
	}

	f.uid.value = admin ? f.uid.value : -1;
	f.name.value = admin ? f.name_admin.value : f.name_edit.value;
	f.password.value = admin ? f.password1_admin.value : f.password1_edit.value;
	f.mode.value = "edit";

	let v = new FormData( f )
	alert( v.get( 'mode' ) );
	fetch( '/user', {

		headers: {
//			'Accept': 'application/x-www-form-urlencoded;charset=UTF-8',
//			'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
//			'Accept': 'application/json',
//			'Content-Type': 'application/json'
			'Accept': 'text/plain;charset=UTF-8',
			'Content-Type': 'text/plain;charset=UTF-8'
		},
		method: 'POST',
//		body: JSON.stringify( { a: 3, b: 2 } )
		body: v
	} )
		.then( res => {
			if( res.ok ) {
				return res.json();
			} else {
				throw new MyError( 404, "FAILED : Post User Edit" );
			}
		} )
		.then( data => {
			alert( data.code );
		} )
		.catch( err => {
			// TODO - 에러창에 띄우기
			alert( `${err} (${err.type})` );
		} );

	//f.submit();
}

function delUser( self ) {

	const userName = 'asdf';
	const msg = `${userName} 를 삭제하시겠습니까?`;

	if( confirm( msg ) ) {
		self.form.mode.value = "del";
		self.form.submit();
	}
}

function onSelectUser( self ) {
	const uid = self.value;
	const user = l2data.allUsers[uid];

	self.form.uid.value = self.value;
	document.querySelector( '#uid_admin' ).innerHTML = uid;
	document.querySelector( '#id_admin' ).innerHTML = user.id;
	document.querySelector( '#name_admin' ).value = user.name;
}

function changeUserPage( page ) {
	elem.userList.forEach( o => {
		if( o.className.substr( 1 ) === page ) {
			o.style.display = 'block'
		} else {
			o.style.display = 'none'
		}
	} );
}