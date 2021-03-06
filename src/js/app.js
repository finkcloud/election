App = {
	web3Provider: null,
	contracts: {},
	account: '0x0',

	init: async function() {
		return await App.initWeb3();
	},

	initWeb3: async function() {
		if (typeof web3 !== 'undefined') {
			// if a web3 instance is already provided by metamask
			App.web3Provider = web3.currentProvider;
			web3 = new Web3(web3.currentProvider);
		} else {
			// specify default instance if no web3 instance is provided
			App.web3Provider = new Web3.providers.HttpProvider(
				'http://localhost:7545'
			);
			web3 = new Web3(App.web3Provider);
		}

		return App.initContract();
	},

	initContract: function() {
		$.getJSON('Election.json', function(election) {
			// instantiate a new truffle contract from the artifacts
			App.contracts.Election = TruffleContract(election);

			// connect provider to interact with contract
			App.contracts.Election.setProvider(App.web3Provider);
			return App.render();
		});
	},

	render: function() {
		var electionInstance;
		var loader = $('#loader');
		var content = $('#content');

		loader.show();
		content.hide();

		//load accounts data

		web3.eth.getCoinbase(function(error, account) {
			if (error === null) {
				App.account = account;
				$('#accountAddress').html('Your accounts: ' + account);
			}
		});

		// load contract data
		App.contracts.Election.deployed()
			.then(function(instance) {
				electionInstance = instance;
				return electionInstance.candidatesCount();
			})
			.then(function(candidatesCount) {
				var candidateResult = $('#candidatesResults');
				candidateResult.empty();

				for (var i = 1; i <= candidatesCount; i++) {
					electionInstance.candidates(i).then(function(candidate) {
						var id = candidate[0];
						var name = candidate[1];
						var voteCount = candidate[2];
						console.log(name);

						//render candidate result
						var candidateTemplate =
							'<tr><th>' +
							id +
							'</th><td>' +
							name +
							'</td><td>' +
							voteCount +
							'</td></tr>';
						candidateResult.append(candidateTemplate);
					});
				}
				loader.hide();
				content.show();
			})
			.catch(function(error) {
				console.warn(error);
			});
	}
};

$(function() {
	$(window).load(function() {
		App.init();
	});
});
