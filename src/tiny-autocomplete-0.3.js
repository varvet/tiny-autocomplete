/**
 * Tiny Autocomplete
 * Small and fast autocomplete plugin for Zepto and jQuery.
 * Written by Johan Halse, https://twitter.com/hejsna, johan@varvet.se
 * License: http://johanhalse.mit-license.org
 * @version 0.3
 * @return {object}         Self
 */
(function(window, $) {
  var TinyAutocomplete = function(el, options){
    this.field = $(el);

    var that = this; // This is just to minify better
    that.el = null;
    that.json = null;
    that.items = [];
    that.selectedItem = null;
    that.list = $('<ul class="autocomplete-list" />');
    that.lastSearch = null;
    that.searchTimeout = null;
    that.searchTimeLimit = null;
    that.options = options;
  };

  TinyAutocomplete.prototype = {
    defaults: {
      minChars: 2,
      markAsBold: true,
      grouped: false,
      queryProperty: 'q',
      method: 'get',
      scrollOnFocus: 'auto',
      maxItems: 100,
      timeLimit: null,
      keyboardDelay: 200,
      lastItemTemplate: null,
      groupContentName: '.autocomplete-items',
      groupTemplate: '<li class="autocomplete-group"><span class="autocomplete-group-header">{{title}}</span><ul class="autocomplete-items" /></li>',
      itemTemplate: '<li class="autocomplete-item">{{title}}</li>'
    },

    /**
     * Constructor
     * @return {null}
     */
    init: function() {
      this.settings = $.extend({}, this.defaults, this.options);
      this.setupSettings();
      this.setupMarkup();
      this.setupEvents();

      return this;
    },

    /**
     * Micro-templating utility
     * @param  {string} template Template string with mustache-style curly braces
     * @param  {object} vars     Contains values to interpolate with
     * @return {string}          Interpolated string
     */
    template: function(template, vars) {
      return template.replace(/{{\s*[\w]+\s*}}/g, function(v) {
        return vars[v.substr(2,v.length-4)];
      });
    },

    /**
     * Tweak settings a bit, since we don't have any private functions
     * defined at constructor time.
     * @return {null}
     */
    setupSettings: function() {
      if(this.settings.scrollOnFocus == 'auto') {
        this.settings.scrollOnFocus = this.autoScrollOnFocus();
      }
    },

    /**
     * Register initial mousedown callback
     * @return {null}
     */
    setupEvents: function() {
      this.el.on('keyup', '.autocomplete-field', $.proxy(this.onKeyUp, this));
      this.el.on('keydown', '.autocomplete-field', $.proxy(this.onKeyDown, this));
      this.el.on('click', '.autocomplete-item', $.proxy(this.onClickItem, this));

      // Scroll to field if we're on a small device, we need that
      // screen real estate!
      if(this.settings.scrollOnFocus) {
        this.field.on('focus', function() {
          var h = $(this).offset().top;
          setTimeout(function(){
            window.scrollTo(0, h);
          }, 0);
        });
      }
    },

    /**
     * Wrap field in required markup and set up this.el
     * @return {null}
     */
    setupMarkup: function() {
      this.field.addClass('autocomplete-field');
      this.field.wrap('<div class="autocomplete" />');
      this.el = this.field.parent();
    },

    /**
     * Final gateway before the search fires: are we allowed to send,
     * or was the last search too recent? If it was, we delay this
     * search until we're allowed to do it again.
     * @param  {string} val Value to search for
     * @return {null}
     */
    limitedRequest: function(val) {
      if(new Date().getTime() > this.searchTimeLimit) {
        this.request(val);
      }
      else {
        var that = this;
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(function() {
          that.request(val);
        }, this.searchTimeLimit - new Date().getTime());
      }
    },

    /**
     * Fire request to specified url
     * @param  {string} val Value to search for
     * @return {null}
     */
    request: function(val) {
      var data = {};
      data[this.settings.queryProperty] = val;
      $.ajax({
        method: this.settings.method,
        url: this.settings.url,
        dataType: 'json',
        data: data,
        success: $.proxy(this.onReceiveData, this)
      });

      if(this.settings.timeLimit) {
        this.searchTimeLimit = new Date().getTime() + this.settings.timeLimit;
      }
    },

    /**
     * Find DOM object at specified index
     * @param  {number} i Index
     * @return {object}   jQuery object
     */
    itemAt: function(i) {
      if(i == null) {
        return $();
      }
      return $('.autocomplete-item').eq(i);
    },

    /**
     * Find item number for clicked item
     * @param  {object} o The clicked object
     * @return {number}   Item's id in array
     */
    clickedItemAt: function(o) {
      for(var i=0;i<this.items.length;i++) {
        if(o == this.el.find('.autocomplete-item').eq(i).get(0)) {
          return i;
        }
      }
      return null;
    },

    /**
     * Select previous item
     * @return {null}
     */
    prevItem: function() {
      this.selectedItem--;
      if(this.selectedItem < 0) {
        this.selectedItem = null;
      }

      this.markSelected( this.selectedItem );
    },

    /**
     * Select next item
     * @return {null}
     */
    nextItem: function() {
      if(this.selectedItem == null) {
        this.selectedItem = -1;
      }
      this.selectedItem++;

      var l = (this.settings.lastItemTemplate) ? this.items.length : this.items.length-1;
      if(this.selectedItem >= l) {
        this.selectedItem = l;
      }

      this.markSelected( this.selectedItem );
    },

    /**
     * Mark an item as selected
     * @param  {number} i Item's id in items array
     * @return {null}
     */
    markSelected: function(i) {
      this.el.find('.active').removeClass('active');
      this.itemAt( i ).addClass('active');
    },

    /**
     * Iterate through data, adding <strong> tags for every hit
     * @param  {object} v   Data to operate on
     * @param  {string} str String to search for
     * @return {object}     Processed data object
     */
    markHitText: function(v, str) {
      for(var i in v) {
        if(typeof(v[i]) == 'string' && i != 'template') {
          v[i] = v[i].replace( new RegExp("(" + str + ")" , 'gi'), "<strong>$1</strong>" );          
        }
      }
      return v;
    },

    /**
     * Render groups. This must be done before calling
     * renderItemsInGroups, since it resets the list markup and
     * attaches a new this.list object.
     * @return {null}
     */
    renderGroups: function() {
      this.list.remove();
      this.list = $('<ul class="autocomplete-list" />');
      for(var i in this.json) {
        this.list.append( this.template( this.settings.groupTemplate, this.json[i] ) );
      }

      this.el.append( this.list );
    },

    /**
     * Iterates through items and attaches them to their respective
     * groups.
     * @return {null}
     */
    renderItemsInGroups: function() {
      var v = this.field.val();
      for(var i=0;i<this.json.length;i++) {
        var group = this.el.find( this.settings.groupContentName ).eq(i);
        for(var j=0;j<this.json[i].data.length && j<this.settings.maxItems;j++) {
          var jsonData = $.extend({}, this.json[i].data[j]);
          // Strongify hits
          if(this.settings.markAsBold) {
            jsonData = this.markHitText( jsonData, v )
          }
          group.append( this.template( this.json[i].template || this.settings.itemTemplate, jsonData ) );
        }
      }
    },

    /**
     * If we're not dealing with groups, just attach items to the list.
     * @return {null}
     */
    renderItemsFlat: function() {
      this.list.remove();
      this.list = $('<ul class="autocomplete-list" />');
      var v = this.field.val();
      for(var i=0;i<this.json.length && i<this.settings.maxItems;i++) {
        var jsonData = $.extend({}, this.json[i]);
        // Strongify hits
        if(this.settings.markAsBold) {
          jsonData = this.markHitText( jsonData, v )
        }
        this.list.append( this.template( this.json[i].template || this.settings.itemTemplate, jsonData ) );
      }      
      this.el.append( this.list );
    },

    /**
     * If there's a last "find all results for..." item, this function
     * gets called.
     * @return {null}
     */
    renderLastItem: function() {
      this.list.append( this.template( this.settings.lastItemTemplate, {title: this.field.val()} ) );
    },

    /**
     * Removes list from DOM and resets state.
     * @return {null}
     */
    closeList: function() {
      $('.main').off('click');
      this.list.remove();
      this.selectedItem = null;
    },

    /**
     * Since groups aren't selectable, we need to fetch the actual
     * selectable items and keep them around in our this.items list.
     * @return {array} List of selectable items
     */
    getItemsFromGroups: function() {
      var r = [];
      for(var i in this.json) {
        for(var j in this.json[i].data) {
          r.push(this.json[i].data[j]);
        }
      }

      return r;
    },

    /**
     * Check whether a value has changed. Used to determine whether or
     * not we fire a new request, since all keypresses generate an
     * event.
     * @return {boolean} True if value has changed since last request
     */
    valueHasChanged: function() {
      if(this.field.val() != this.lastSearch) {
        this.lastSearch = this.field.val();
        return true;
      }
      return false;
    },

    /**
     * Check whether this device should scroll to set focus. This is
     * a very stupid function right now, going for touch (which is
     * obviously bad for many reasons) and it should be improved later
     * on. For now, you can override the scrollOnFocus setting instead
     * if you want more intelligence to it.
     * @return {boolean} Whether or not to scroll to field on focus
     */
    autoScrollOnFocus: function() {
      return !!('ontouchstart' in window);
    },

    /**
     * Data received from server, determine what to do with it and
     * render everything.
     * @param  {object} data JSON from server
     * @param  {object} xhr  jQuery XHR object
     * @return {null}
     */
    onReceiveData: function(data, xhr) {
      this.selectedItem = null;
      this.json = data;
      if(this.settings.grouped) {
        // First, render groups
        this.renderGroups();

        // Then, render the selectable items
        this.items = this.getItemsFromGroups();
        this.renderItemsInGroups();
      }
      else {
        this.items = this.json;
        this.renderItemsFlat();
      }

      // Render last item, if applicable
      if(this.settings.lastItemTemplate) {
        this.renderLastItem();
      }

      // Click outside should close the list
      $('.main').one('click', $.proxy(this.closeList, this));
    },

    /**
     * Keyup handler that sets up a delayed check if the field value is
     * new. If the keyboardDelay option isn't set, it does the check
     * immediately.
     * @param  {object} e Normalized jQuery event object
     * @return {null}
     */
    onKeyUp: function(e) {
      if(this.settings.keyboardDelay) {
        var that = this;
        clearTimeout(this.keyboardTimeout);
        this.keyboardTimeout = setTimeout(function() {
          that.checkFieldValue();
        }, this.settings.keyboardDelay);
      }
      else {
        checkFieldValue();
      }
    },

    /**
     * Check whether the field value is the same as last time and
     * satisfies minimum character limit. If yes, the final check is
     * whether the timeLimit option is set.
     * @return {null}
     */
    checkFieldValue: function() {
      if(this.field.val().length >= this.settings.minChars && this.valueHasChanged()) {
        this.limitedRequest( this.field.val() );
      }
      if(this.field.val() == '') {
        this.closeList();
      }
    },

    /**
     * Keydown handler to take care of keyboard navigation.
     * @param  {object} e Normalized jQuery event object
     * @return {null}
     */
    onKeyDown: function(e) {
      if(e.keyCode == 38) {  // Up
        e.preventDefault();
        this.prevItem();
      }
      if(e.keyCode == 40) {  // Down
        e.preventDefault();
        this.nextItem();
      }
      if(e.keyCode == 13) {  // Enter
        e.preventDefault();
        this.onPressEnter();
      }
      if(e.keyCode == 27) {  // Esc
        e.preventDefault();
        this.closeList();
      }
    },

    /**
     * Click handler, handle mouse/touch selection of items.
     * @param  {object} e Normalized jQuery event object
     * @return {null}
     */
    onClickItem: function(e) {
      var i = this.clickedItemAt(e.currentTarget);
      this.onSelect(e.currentTarget, this.items[i]);
    },

    /**
     * User has pressed enter, select object or perform search.
     * @return {null}
     */
    onPressEnter: function() {
      this.onSelect( this.itemAt( this.selectedItem ), this.items[this.selectedItem] );
    },

    /**
     * User has selected an object with mouse or keyboard - act on it
     * and fire any user-supplied callback.
     * @param  {object} item jQuery object for the field
     * @param  {object} val  Item value from server
     * @return {null}
     */
    onSelect: function(item, val) {
      if(this.settings.onSelect) {
        this.settings.onSelect.apply(this.field, [item, val]);
      }
      this.lastSearch = this.field.val();
      this.closeList();
    }
  };

  TinyAutocomplete.defaults = TinyAutocomplete.prototype.defaults;

  $.fn.tinyAutocomplete = function(settings) {
    return this.each(function() {
      var d = new TinyAutocomplete(this, settings).init();
      this.tinyAutocomplete = {settings: d.settings};
    });
  };

  $.tinyAutocomplete = TinyAutocomplete;
})(window, $);