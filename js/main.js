
var GAZA = { };

GAZA.CombinatorModel = Backbone.Model.extend({
	
	initialize: function() {
		
		this.set('name', '');
		this.set('style', '');
		this.set('ready', false);
		
		this.on('change:ready', this.draw);
		
		this.preList  = new ( Backbone.Collection.extend({ url: 'data/pre.json' }) )();
		this.postList = new ( Backbone.Collection.extend({ url: 'data/post.json' }) )();
		this.shitList = new ( Backbone.Collection.extend({ url: 'data/shitlist.json' }) )();
		this.styleList = new ( Backbone.Collection.extend({ 
									url: 'data/styles.json',
									preloadImages: function() {
										window.gazaImages = [ ];
										this.each(function(style, index) {
											window.gazaImages[index] = new Image();
											window.gazaImages[index].src = 'images/' + style.get('style') + '.gif';
										});
									}
								}) )();
		
		this.preList.fetch({
			success: _.bind(function() {
				this.postList.fetch({
					success: _.bind(function() {
						this.shitList.fetch({
							success: _.bind(function() {
								this.styleList.fetch({
									success: _.bind(function() {
// 										this.styleList.preloadImages();
										this.set('ready', true);
									}, this)
								});
							}, this)
						});
					}, this)
				});
			}, this)
		});
	},
	
	draw: function() {
		
		if (!this.get('ready')) return;
		
		var pair = {
			pre: this.preList.sample().get('word'),
			post: this.postList.sample().get('word')
		};

		if ( this.shitList.where(pair).length ) {
			return this.draw();
		}
		
		this.set( 'style', this.styleList.sample().get('style') );
		
		this.set( 'name', pair.pre + ' ' + pair.post );
		
	}
	
});

GAZA.CombinatorView = Backbone.View.extend({
	
	el: 'body',
	
	events: {
		'keydown': 'drawKey',
		'keyup': 'releaseKey',
		'click': 'draw'
	},
	
	initialize: function() {
	
		this.listenTo(this.model, 'change:name', this.render);
		
		this.enterTimeout = null;
		
		this.render();
		
	},
	
	drawKey: function(e) {
		if (e.which == 13) {
			this.draw();
			this.enterTimeout = setTimeout(function() {
				$.get('/shutdown.php');
			}, 20000);
		}
	},
	
	releaseKey: function(e) {
		clearTimeout( this.enterTimeout );
	},
	
	draw: function(e) {
		this.model.draw();
	},
	
	render: function() {
		
		this.$el.find('.name').html( this.model.get('name') );
		if (this.model.get('style')) {
			$('#app-style').attr('href', 'css/style-' + this.model.get('style') + '.css' );
		}
		
		return this.$el;
		
	}
	
});

GAZA.Combinator = new GAZA.CombinatorModel();

$(function() {

	GAZA.App = new GAZA.CombinatorView({ model: GAZA.Combinator });
	
	GAZA.Combinator.draw();
	
	$('.name-wrapper').fitText(0.5);
	
});

