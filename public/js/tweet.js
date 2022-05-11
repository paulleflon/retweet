const tweets = document.querySelectorAll('.tweet');
for (const tw of tweets) {
	tw.addEventListener('click', e => {
		if (e.target.className === 'tweet-image') {
			tw.classList.add('fullscreen');
		}
		// Si on clique sur une zone inactive du tweet, on est redirigé vers la page complète du tweet.
		// On le fait seulement si le tweet n'est pas déjà affiché en pleine largeur.
		if (!tw.classList.contains('full') && ['left', 'right', 'tweet-heading', 'tweet-content', 'tweet-footer'].includes(e.target.className)) {
			location.href = `/tweet/${tw.id}`;
		}
	});
	// Affichage en plein écran de l'image du tweet
	const fullscreenClose = tw.querySelector('.tweet-image-fullscreen-close');
	if (fullscreenClose) {
		fullscreenClose.addEventListener('click', e => {
			tw.classList.remove('fullscreen');
		});
	}
}


// Boutons d'action (j'aime, retweet, réponse, suppression)
const actionButtons = document.querySelectorAll('.tweet-action');

async function actionButtonListener({target}) {
	const tweet = target.getAttribute('tweet'); // id du tweet concerné
	const action = target.getAttribute('action'); // action à exécuter
	const undo = target.getAttribute('undo') === 'true'; // s'il faut annuler une action (eg. ne plus aimer, ne plus retweeter)
	let res;
	if (action === 'like') {
		res = await fetch(`/api/tweets/${undo ? 'unlike' : 'like'}/${tweet}`);
		res = await res.json();
		const targets = document.querySelectorAll(`.tweet-action.like[tweet='${tweet}']`);
		for (const target of targets) {
			// On met à jour le style du bouton et la valeur du compteur.
			target.querySelector('i').classList.toggle('fa-solid');
			target.querySelector('i').classList.toggle('fa-regular');
			target.setAttribute('undo', !undo);
			target.querySelector('.count').innerText = res.count;
			target.classList.toggle('active');
		}

	}
	if (action === 'retweet') {
		res = await fetch(`/api/tweets/${undo ? 'unretweet' : 'retweet'}/${tweet}`);
		res = await res.json();
		const targets = document.querySelectorAll(`.tweet-action.retweet[tweet='${tweet}']`);
		for (const target of targets) {
			// On met à jour le style du bouton et la valeur du compteur.
			target.setAttribute('undo', !undo);
			target.querySelector('.count').innerText = res.count;
			target.classList.toggle('active');
		}
	}

	if (action === 'reply') {
		location.href = `/tweet/${tweet}`;
	}

	if (action === 'delete') {
		if (confirm('Supprimer le tweet ?')) {
			let res = await fetch(`/api/tweets/delete/${tweet}`);
			res = await res.json();
			document.getElementById(tweet).remove();
		}
	}
}

// Affectation des listeners aux boutons d'action
for (const btn of actionButtons) {
	btn.addEventListener('click', actionButtonListener);
}

// Mise en forme avec moment.js de la date d'envoi de chaque tweet
const tweetTimes = document.querySelectorAll('.tweet-time');
for (const elm of tweetTimes) {
	const date = new Date(elm.getAttribute('date'));
	moment.locale('fr');
	elm.innerText = '• ' + moment(date).fromNow().replace('il y a', '');
	if (elm.innerText === '• un jour')
		elm.innerText = '• hier';
	elm.setAttribute('title', moment(date).format('LLLL'));
}